import { Request, Response } from "express";
import { stripe } from "../stripe";
import { getDb } from "../db";
import { bapPayments, subscriptions, orders, orderItems, tips, transactions, bapStreamPayments, products, users, payouts } from "../../drizzle/schema";
import type { Product } from "../../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { calculateFees } from "../stripe";
import { getEarningsBalance, updateEarningsBalance } from "../db";
import { fireWorkflowEvent } from "../workflowEngine";
import { cancelAbandonedCartRecovery } from "../services/abandonedCartService";
import { distributeRevenue } from "../services/revenueSplitEngine";

/**
 * Stripe Webhook Handler
 * Processes payment events from Stripe
 */

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    console.error('[Stripe Webhook] No signature provided');
    return res.status(400).send('No signature');
  }

  if (!WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    // Handle different event types - use type assertion for event.data.object
    const eventData = event.data.object as any;
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(eventData);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(eventData);
        break;

      case 'transfer.created':
        await handleTransferCreated(eventData);
        break;

      case 'transfer.paid':
        await handleTransferPaid(eventData);
        break;

      case 'transfer.reversed':
      case 'transfer.failed':
        await handleTransferFailed(eventData);
        break;

      case 'account.updated':
        await handleAccountUpdated(eventData);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(eventData);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(eventData);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error processing event:', error);
    res.status(500).send(`Webhook processing error: ${error.message}`);
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: any) {
  console.log('[Stripe Webhook] Checkout session completed:', session.id);

  const db = await getDb();
  if (!db) return;

  const paymentType = session.metadata?.paymentType;
  const userId = parseInt(session.metadata?.userId || '0');

  // Handle different payment types
  switch (paymentType) {
    case 'bopshop':
      await handleBopShopPayment(session, db);
      // Cancel any pending abandoned cart recovery jobs for this user
      if (userId) {
        cancelAbandonedCartRecovery(userId).catch(err =>
          console.error('[Stripe Webhook] Failed to cancel abandoned cart recovery:', err)
        );
      }
      break;
    
    case 'bap_stream':
      await handleBopAudioPayment(session, db);
      break;
    
    case 'kickin':
      await handleKickinPayment(session, db);
      break;

    case 'bops_tip':
      await handleBopsTipPayment(session, db);
      break;
    
    case 'wallet_topup':
      const { handleWalletTopUp } = await import('../services/walletWebhook');
      await handleWalletTopUp(session);
      break;

    case 'pro_subscription':
      await handleProSubscriptionCheckout(session, db);
      break;
    
    default:
      // Handle subscription checkout
      if (session.mode === 'subscription' && session.subscription) {
        if (userId) {
          await db
            .update(subscriptions)
            .set({
              stripeSubscriptionId: session.subscription,
              status: 'active',
            })
            .where(eq(subscriptions.userId, userId));

          console.log(`[Stripe Webhook] Updated subscription for user ${userId}`);
        }
      }
  }
}

/**
 * Handle PRO subscription checkout completion.
 * Sets tier=pro, records Stripe IDs, and stores billing period dates.
 */
async function handleProSubscriptionCheckout(session: any, db: any) {
  const userId = parseInt(session.metadata?.boptoneUserId || '0');
  const billingCycle = (session.metadata?.billingCycle || 'monthly') as 'monthly' | 'annual';

  if (!userId) {
    console.error('[Stripe Webhook] pro_subscription: missing boptoneUserId in metadata');
    return;
  }

  // Retrieve the Stripe subscription to get period dates and price ID
  let periodStart: Date | undefined;
  let periodEnd: Date | undefined;
  let stripePriceId: string | undefined;

  if (session.subscription) {
    try {
      const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
      periodStart = new Date((stripeSub as any).current_period_start * 1000);
      periodEnd = new Date((stripeSub as any).current_period_end * 1000);
      stripePriceId = (stripeSub as any).items?.data?.[0]?.price?.id;
    } catch (err: any) {
      console.error('[Stripe Webhook] Failed to retrieve Stripe subscription:', err.message);
    }
  }

  const updateData: Record<string, any> = {
    tier: 'pro',
    plan: 'pro',
    billingCycle,
    status: 'active',
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription,
    cancelAtPeriodEnd: false,
    updatedAt: new Date(),
    ...(periodStart && { currentPeriodStart: periodStart }),
    ...(periodEnd && { currentPeriodEnd: periodEnd }),
    ...(stripePriceId && { stripePriceId }),
  };

  // Upsert: update existing row or insert new one
  const existing = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({ userId, ...updateData });
  }

  console.log(`[Stripe Webhook] PRO activated for user ${userId} (${billingCycle})`);
}

/**
 * Handle BopShop merch purchase.
 * Supports both:
 *   - Single-product checkout (legacy): metadata has artistId + productId + quantity
 *   - Multi-item cart checkout: metadata has paymentType=bopshop + cartItems JSON
 */
async function handleBopShopPayment(session: any, db: any) {
  const userId = parseInt(session.metadata?.userId || '0');
  const customerName = session.metadata?.customerName || session.customer_details?.name || 'Guest';
  const customerEmail = session.metadata?.customerEmail || session.customer_email || '';

  if (!userId) {
    console.error('[Stripe Webhook] Missing userId for BopShop payment');
    return;
  }

  // ── Determine cart items ──────────────────────────────────────────────────
  // New cart checkout embeds a compact JSON array in metadata.cartItems:
  //   [{p: productId, v: variantId|null, q: quantity, u: unitPrice, a: artistId}]
  // Legacy single-product checkout uses metadata.productId + artistId + quantity.
  let cartEntries: Array<{ p: number; v: number | null; q: number; u: number; a: number }> = [];

  if (session.metadata?.cartItems) {
    try {
      cartEntries = JSON.parse(session.metadata.cartItems);
    } catch {
      console.error('[Stripe Webhook] Failed to parse cartItems metadata');
    }
  }

  if (cartEntries.length === 0) {
    // Fall back to legacy single-product metadata
    const productId = parseInt(session.metadata?.productId || '0');
    const artistId = parseInt(session.metadata?.artistId || '0');
    const quantity = parseInt(session.metadata?.quantity || '1');
    if (!productId || !artistId) {
      console.error('[Stripe Webhook] Missing required metadata for BopShop payment (no cartItems, no productId)');
      return;
    }
    cartEntries = [{ p: productId, v: null, q: quantity, u: 0, a: artistId }];
  }

  // ── Fetch all referenced products in one query ────────────────────────────
  const productIdSet = new Set<number>(cartEntries.map(e => e.p));
  const productIds = Array.from(productIdSet);
  const productRows: Product[] = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));
  const productMap = new Map<number, Product>(productRows.map((p) => [p.id, p]));

  // ── Group cart entries by artistId (one order per artist) ─────────────────
  // BopShop products can belong to different artists; create a separate order per artist.
  type CartEntry = { p: number; v: number | null; q: number; u: number; a: number };
  const byArtist = new Map<number, CartEntry[]>();
  for (const entry of cartEntries) {
    const product = productMap.get(entry.p);
    const artistId = entry.a || product?.artistId;
    if (!artistId) {
      console.warn(`[Stripe Webhook] No artistId for product ${entry.p}, skipping`);
      continue;
    }
    if (!byArtist.has(artistId)) byArtist.set(artistId, []);
    byArtist.get(artistId)!.push({ ...entry, a: artistId });
  }

  const totalAmount = session.amount_total || 0;
  const fees = calculateFees({ amount: totalAmount, paymentType: 'bopshop' });

  // ── Create one order per artist ───────────────────────────────────────────
  const byArtistEntries = Array.from(byArtist.entries());
  for (const [artistId, entries] of byArtistEntries) {
    const orderSubtotal = entries.reduce((sum, e) => {
      const product = productMap.get(e.p);
      const unitPrice = e.u || product?.price || 0;
      return sum + unitPrice * e.q;
    }, 0);

    const orderNumber = `BOP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Build shipping address from Stripe session if available
    const shipping = session.shipping_details?.address;
    const shippingAddress = shipping ? {
      name: session.shipping_details?.name || customerName,
      line1: shipping.line1 || '',
      line2: shipping.line2 || undefined,
      city: shipping.city || '',
      state: shipping.state || '',
      zip: shipping.postal_code || '',
      country: shipping.country || 'US',
    } : undefined;

    const orderInsertResult = await db
      .insert(orders)
      .values({
        orderNumber,
        customerId: userId,
        artistId,
        subtotal: orderSubtotal,
        total: orderSubtotal,
        currency: session.currency?.toUpperCase() || 'USD',
        paymentStatus: 'paid',
        paymentMethod: 'stripe',
        paymentIntentId: session.payment_intent,
        paidAt: new Date(),
        customerName,
        customerEmail,
        ...(shippingAddress && { shippingAddress }),
      });
    const orderId = Number(orderInsertResult[0].insertId);

    // Create order items
    for (const entry of entries) {
      const product = productMap.get(entry.p);
      if (!product) {
        console.warn(`[Stripe Webhook] Product ${entry.p} not found, skipping order item`);
        continue;
      }
      const unitPrice = entry.u || product.price;
      const lineTotal = unitPrice * entry.q;

      await db.insert(orderItems).values({
        orderId,
        productId: entry.p,
        variantId: entry.v || null,
        productName: product.name,
        productType: product.type,
        quantity: entry.q,
        pricePerUnit: unitPrice,
        subtotal: lineTotal,
        total: lineTotal,
        fulfillmentStatus: product.type === 'digital' ? 'fulfilled' : 'unfulfilled',
        digitalFileUrl: product.digitalFileUrl || null,
      });

      // Update inventory
      if (product.trackInventory) {
        await db
          .update(products)
          .set({ inventoryQuantity: Math.max(0, (product.inventoryQuantity ?? 0) - entry.q) })
          .where(eq(products.id, entry.p));
      }
    }

    // Create transaction record for this artist's portion
    const artistFees = calculateFees({ amount: orderSubtotal, paymentType: 'bopshop' });
    await db.insert(transactions).values({
      type: 'payment',
      amount: orderSubtotal,
      currency: session.currency?.toUpperCase() || 'USD',
      status: 'completed',
      stripePaymentIntentId: session.payment_intent,
      fromUserId: userId,
      toUserId: null,
      orderId,
      platformFee: artistFees.platformFee,
      processingFee: artistFees.stripeFee,
      netAmount: artistFees.artistReceives,
    });

    // Update artist earnings balance
    try {
      const balance = await getEarningsBalance(artistId);
      if (balance) {
        await updateEarningsBalance(artistId, {
          totalEarnings: balance.totalEarnings + artistFees.artistReceives,
          availableBalance: balance.availableBalance + artistFees.artistReceives,
        });
      }
    } catch (err) {
      console.error(`[Stripe Webhook] Failed to update earnings balance for artist ${artistId}:`, err);
    }

    // Fire workflow event
    const firstEntry = entries[0];
    const firstProduct = productMap.get(firstEntry?.p);
    fireWorkflowEvent('bopshop_sale', artistId, {
      orderId,
      orderNumber,
      productId: firstEntry?.p,
      productName: firstProduct?.name,
      amount: orderSubtotal,
      buyerId: userId,
      itemCount: entries.length,
    }).catch((err: any) => console.error('[Workflow] bopshop_sale event error:', err));

    console.log(`[Stripe Webhook] BopShop order ${orderNumber} created for artist ${artistId} — ${entries.length} item(s), $${(orderSubtotal / 100).toFixed(2)}`);
  }

  console.log(`[Stripe Webhook] BopShop payment processed for user ${userId} — ${byArtistEntries.length} artist order(s)`);
}

/**
 * Handle BopAudio stream payment
 */
async function handleBopAudioPayment(session: any, db: any) {
  const userId = parseInt(session.metadata?.userId || '0');
  const artistId = parseInt(session.metadata?.artistId || '0');
  const trackId = parseInt(session.metadata?.trackId || '0');
  const streamCount = parseInt(session.metadata?.streamCount || '1');

  if (!userId || !artistId || !trackId) {
    console.error('[Stripe Webhook] Missing required metadata for BopAudio payment');
    return;
  }

  const totalAmount = session.amount_total || 0;
  const fees = calculateFees({ amount: totalAmount, paymentType: 'bap_stream' });

  // Create stream payment record
  await db
    .insert(bapStreamPayments)
    .values({
      trackId,
      userId,
      amount: totalAmount,
      currency: session.currency?.toUpperCase() || 'USD',
      status: 'completed',
      stripePaymentIntentId: session.payment_intent,
      streamCount,
      platformFee: fees.platformFee,
      processingFee: fees.stripeFee,
      artistEarnings: fees.artistReceives,
    });

  // Create transaction record
  await db
    .insert(transactions)
    .values({
      type: 'payment',
      amount: totalAmount,
      currency: session.currency?.toUpperCase() || 'USD',
      status: 'completed',
      stripePaymentIntentId: session.payment_intent,
      fromUserId: userId,
      toUserId: null,
      platformFee: fees.platformFee,
      processingFee: fees.stripeFee,
      netAmount: fees.artistReceives,
    });

  // ── Distribute revenue to songwriter splits ──────────────────────────────
  distributeRevenue({
    trackId,
    totalAmount,
    type: 'stream',
    fromUserId: userId,
  }).then(result => {
    if (!result.success) {
      console.error(`[Stripe Webhook] Revenue split failed for track ${trackId}:`, result.error);
    } else {
      console.log(`[Stripe Webhook] Revenue split: $${(result.artistNetAmount / 100).toFixed(2)} distributed across ${result.distributions.length} writer(s)`);
    }
  }).catch(err => console.error('[Stripe Webhook] distributeRevenue error:', err));

  console.log(`[Stripe Webhook] BopAudio payment for ${streamCount} stream(s) of track ${trackId}`);
}

/**
 * Handle Kick-in tip payment (0% platform fee)
 */
async function handleKickinPayment(session: any, db: any) {
  const userId = parseInt(session.metadata?.userId || '0');
  const artistId = parseInt(session.metadata?.artistId || '0');
  const message = session.metadata?.message || '';
  const isAnonymous = session.metadata?.isAnonymous === 'true';

  if (!userId || !artistId) {
    console.error('[Stripe Webhook] Missing required metadata for Kick-in payment');
    return;
  }

  const totalAmount = session.amount_total || 0;
  const fees = calculateFees({ amount: totalAmount, paymentType: 'kickin' });

  // Create transaction record first
  const [transaction] = await db
    .insert(transactions)
    .values({
      type: 'tip',
      amount: totalAmount,
      currency: session.currency?.toUpperCase() || 'USD',
      status: 'completed',
      stripePaymentIntentId: session.payment_intent,
      fromUserId: userId,
      toUserId: null,
      platformFee: 0, // 0% platform fee for tips
      processingFee: fees.stripeFee,
      netAmount: fees.artistReceives,
      metadata: {
        tipMessage: message,
      },
    });

  // Create tip record
  await db
    .insert(tips)
    .values({
      transactionId: transaction.id,
      fromUserId: userId,
      toArtistId: artistId,
      amount: totalAmount,
      currency: session.currency?.toUpperCase() || 'USD',
      message,
      isAnonymous,
      status: 'completed',
      platformFee: 0, // Always 0 for tips
      processingFee: fees.stripeFee,
      netAmount: fees.artistReceives,
      stripePaymentIntentId: session.payment_intent,
    });

  // ── Update artist earnings balance directly (tips are artist-level, no track split) ──
  try {
    const balance = await getEarningsBalance(artistId);
    if (balance) {
      await updateEarningsBalance(artistId, {
        totalEarnings: balance.totalEarnings + fees.artistReceives,
        availableBalance: balance.availableBalance + fees.artistReceives,
      });
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Failed to update earnings balance for artist ${artistId} (tip):`, err);
  }

  console.log(`[Stripe Webhook] Kick-in tip of $${(totalAmount / 100).toFixed(2)} from user ${userId} to artist ${artistId}`);
}

/**
 * Handle Bops Tip payment (0% platform fee — Kick In policy)
 * Triggered by createTipCheckout mutation on the artist profile page
 */
async function handleBopsTipPayment(session: any, db: any) {
  const artistId = parseInt(session.metadata?.artist_id || '0');
  const fanUserId = parseInt(session.metadata?.fan_user_id || '0');
  const videoId = session.metadata?.video_id ? parseInt(session.metadata.video_id) : null;
  const message = session.metadata?.message || '';
  const amountCents = parseInt(session.metadata?.amount_cents || '0');

  if (!artistId || !amountCents) {
    console.error('[Stripe Webhook] Missing required metadata for Bops tip payment');
    return;
  }

  const { calculateFees } = await import('../stripe');
  const fees = calculateFees({ amount: amountCents, paymentType: 'kickin' });

  // Insert into bops_tips table
  try {
    const { bopsTips } = await import('../../drizzle/schema');
    await db.insert(bopsTips).values({
      artistId,
      userId: fanUserId || null,
      videoId: videoId || null,
      amount: amountCents,
      currency: session.currency?.toUpperCase() || 'USD',
      message: message || null,
      status: 'completed',
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent || null,
      platformFee: 0,
      processingFee: fees.stripeFee,
      netAmount: fees.artistReceives,
    });
    console.log(`[Stripe Webhook] Bops tip of $${(amountCents / 100).toFixed(2)} recorded for artist ${artistId}`);

    // Update artist earnings balance
    const balance = await getEarningsBalance(artistId);
    if (balance) {
      await updateEarningsBalance(artistId, {
        totalEarnings: balance.totalEarnings + fees.artistReceives,
        availableBalance: balance.availableBalance + fees.artistReceives,
      });
    }
  } catch (err: any) {
    // Graceful fallback — log but don't fail the webhook
    console.error('[Stripe Webhook] Failed to insert bops tip:', err.message);
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('[Stripe Webhook] Payment intent succeeded:', paymentIntent.id);
  // Additional payment tracking logic can be added here
}

/**
 * Handle transfer created (payout initiated)
 * Reconciles against both bapPayments (BAP streams) and payouts (general payouts) tables.
 */
async function handleTransferCreated(transfer: any) {
  console.log('[Stripe Webhook] Transfer created:', transfer.id);
  const db = await getDb();
  if (!db) return;

  // Reconcile general payout (from payouts table) if boptone_payout_id is in metadata
  const boptonePayoutId = transfer.metadata?.boptone_payout_id;
  if (boptonePayoutId) {
    const payoutId = parseInt(boptonePayoutId);
    await db
      .update(payouts)
      .set({ status: 'processing', externalPayoutId: transfer.id, processedAt: new Date() })
      .where(eq(payouts.id, payoutId));
    console.log(`[Stripe Webhook] General payout ${payoutId} → processing (transfer ${transfer.id})`);
    return;
  }

  // Legacy: reconcile BAP stream payment
  const artistId = parseInt(transfer.metadata?.artistId || '0');
  if (artistId) {
    await db
      .update(bapPayments)
      .set({ status: 'processing' })
      .where(eq(bapPayments.stripePayoutId, transfer.id));
    console.log(`[Stripe Webhook] BAP payment processing for artist ${artistId}`);
  }
}

/**
 * Handle transfer paid (payout completed)
 * Marks the payout as completed in the payouts table.
 */
async function handleTransferPaid(transfer: any) {
  console.log('[Stripe Webhook] Transfer paid:', transfer.id);
  const db = await getDb();
  if (!db) return;

  // Reconcile general payout
  const boptonePayoutId = transfer.metadata?.boptone_payout_id;
  if (boptonePayoutId) {
    const payoutId = parseInt(boptonePayoutId);
    await db
      .update(payouts)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(payouts.id, payoutId));
    console.log(`[Stripe Webhook] General payout ${payoutId} → completed (transfer ${transfer.id})`);
    return;
  }

  // Legacy: reconcile BAP stream payment
  const artistId = parseInt(transfer.metadata?.artistId || '0');
  if (artistId) {
    await db
      .update(bapPayments)
      .set({ status: 'paid', paidAt: new Date() })
      .where(eq(bapPayments.stripePayoutId, transfer.id));
    console.log(`[Stripe Webhook] BAP payment completed for artist ${artistId}`);
  }
}

/**
 * Handle transfer reversed/failed (payout failed)
 * Marks the payout as failed and restores the artist's available balance.
 */
async function handleTransferFailed(transfer: any) {
  console.error('[Stripe Webhook] Transfer failed/reversed:', transfer.id, transfer.failure_message);
  const db = await getDb();
  if (!db) return;

  // Reconcile general payout — restore balance on failure
  const boptonePayoutId = transfer.metadata?.boptone_payout_id;
  const boptoneArtistId = transfer.metadata?.boptone_artist_id;
  if (boptonePayoutId) {
    const payoutId = parseInt(boptonePayoutId);
    const artistId = parseInt(boptoneArtistId || '0');

    // Mark payout as failed
    await db
      .update(payouts)
      .set({
        status: 'failed',
        failureReason: transfer.failure_message || 'Transfer reversed by Stripe',
        failureCode: transfer.failure_code || 'transfer_reversed',
      })
      .where(eq(payouts.id, payoutId));

    // Restore artist balance
    if (artistId) {
      const [payoutRow] = await db.select().from(payouts).where(eq(payouts.id, payoutId)).limit(1);
      if (payoutRow) {
        const balance = await getEarningsBalance(artistId);
        if (balance) {
          await updateEarningsBalance(artistId, {
            availableBalance: balance.availableBalance + payoutRow.amount,
            withdrawnBalance: Math.max(0, balance.withdrawnBalance - payoutRow.amount),
          });
          console.log(`[Stripe Webhook] Restored $${(payoutRow.amount / 100).toFixed(2)} to artist ${artistId} after transfer reversal`);
        }
      }
    }

    console.log(`[Stripe Webhook] General payout ${payoutId} → failed (transfer ${transfer.id})`);
    return;
  }

  // Legacy: reconcile BAP stream payment
  const artistId = parseInt(transfer.metadata?.artistId || '0');
  if (artistId) {
    await db
      .update(bapPayments)
      .set({ status: 'failed' })
      .where(eq(bapPayments.stripePayoutId, transfer.id));
    console.log(`[Stripe Webhook] BAP payment failed for artist ${artistId}: ${transfer.failure_message}`);
  }
}

/**
 * Handle Stripe Connect account updates
 * Syncs onboarding status back to the database so the UI reflects real-time state
 */
async function handleAccountUpdated(account: any) {
  console.log('[Stripe Webhook] Account updated:', account.id);
  const db = await getDb();
  if (!db) {
    console.warn('[Stripe Webhook] Database unavailable, skipping account update sync');
    return;
  }
  try {
    // Sync the latest Stripe Connect status to the users table
    await db
      .update(users)
      .set({
        stripeConnectOnboardingComplete: account.details_submitted ? 1 : 0,
        stripeConnectChargesEnabled: account.charges_enabled ? 1 : 0,
        stripeConnectPayoutsEnabled: account.payouts_enabled ? 1 : 0,
      })
      .where(eq(users.stripeConnectAccountId, account.id));

    if (account.charges_enabled && account.payouts_enabled) {
      console.log(`[Stripe Webhook] Account ${account.id} fully enabled — charges and payouts active`);
    } else {
      console.log(`[Stripe Webhook] Account ${account.id} updated — charges_enabled: ${account.charges_enabled}, payouts_enabled: ${account.payouts_enabled}, details_submitted: ${account.details_submitted}`);
    }
  } catch (error) {
    console.error('[Stripe Webhook] Failed to sync account status to database:', error);
  }
}

/**
 * Handle subscription created/updated
 */
async function handleSubscriptionUpdated(subscription: any) {
  console.log('[Stripe Webhook] Subscription updated:', subscription.id);

  const db = await getDb();
  if (!db) return;

  // Update subscription status in database
  await db
    .update(subscriptions)
    .set({
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Stripe Webhook] Updated subscription ${subscription.id} status to ${subscription.status}`);
}

/**
 * Handle subscription deleted/cancelled — downgrade to free tier.
 */
async function handleSubscriptionDeleted(subscription: any) {
  console.log('[Stripe Webhook] Subscription deleted:', subscription.id);

  const db = await getDb();
  if (!db) return;

  await db
    .update(subscriptions)
    .set({
      tier: 'free',
      plan: 'free',
      status: 'canceled',
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Stripe Webhook] Subscription ${subscription.id} cancelled — user downgraded to free`);
}
