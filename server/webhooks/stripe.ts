import { Request, Response } from "express";
import { stripe } from "../stripe";
import { getDb } from "../db";
import { bapPayments, subscriptions, orders, orderItems, tips, transactions, bapStreamPayments, products, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { calculateFees } from "../stripe";

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

      case 'transfer.reversed':
      case 'transfer.updated':
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
      break;
    
    case 'bap_stream':
      await handleBopAudioPayment(session, db);
      break;
    
    case 'kickin':
      await handleKickinPayment(session, db);
      break;
    
    case 'wallet_topup':
      const { handleWalletTopUp } = await import('../services/walletWebhook');
      await handleWalletTopUp(session);
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
 * Handle BopShop merch purchase
 */
async function handleBopShopPayment(session: any, db: any) {
  const userId = parseInt(session.metadata?.userId || '0');
  const artistId = parseInt(session.metadata?.artistId || '0');
  const productId = parseInt(session.metadata?.productId || '0');
  const quantity = parseInt(session.metadata?.quantity || '1');

  if (!userId || !artistId || !productId) {
    console.error('[Stripe Webhook] Missing required metadata for BopShop payment');
    return;
  }

  // Get product details
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    console.error(`[Stripe Webhook] Product ${productId} not found`);
    return;
  }

  const totalAmount = product.price * quantity;
  const fees = calculateFees({ amount: totalAmount, paymentType: 'bopshop' });

  // Generate order number
  const orderNumber = `BOP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create order
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      customerId: userId,
      artistId,
      subtotal: totalAmount,
      total: totalAmount,
      currency: session.currency?.toUpperCase() || 'USD',
      paymentStatus: 'paid',
      paymentMethod: 'stripe',
      paymentIntentId: session.payment_intent,
      paidAt: new Date(),
      customerEmail: session.customer_email || '',
    });

  // Create order item
  await db
    .insert(orderItems)
    .values({
      orderId: order.id,
      productId,
      productName: product.name,
      productType: product.type,
      quantity,
      pricePerUnit: product.price,
      subtotal: totalAmount,
      total: totalAmount,
      fulfillmentStatus: product.type === 'digital' ? 'fulfilled' : 'unfulfilled',
      digitalFileUrl: product.digitalFileUrl || null,
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
      orderId: order.id,
      platformFee: fees.platformFee,
      processingFee: fees.stripeFee,
      netAmount: fees.artistReceives,
    });

  // Update product inventory
  if (product.trackInventory) {
    await db
      .update(products)
      .set({
        inventoryQuantity: product.inventoryQuantity - quantity,
      })
      .where(eq(products.id, productId));
  }

  // Track purchase in BOPixel (invisible to artist)
  try {
    // Send tracking event to BOPixel endpoint
    const trackingPayload = {
      eventId: `purchase-${order.id}-${Date.now()}`,
      pixelUserId: session.client_reference_id || `user-${userId}`,
      sessionId: session.id,
      artistId: artistId.toString(),
      eventType: 'purchase',
      eventName: 'Purchase Completed',
      pageUrl: session.success_url || '',
      pageTitle: 'Checkout Success',
      referrer: null,
      deviceType: 'unknown',
      browser: 'unknown',
      os: 'unknown',
      userAgent: '',
      customData: {
        orderId: order.id,
        orderNumber,
        productId,
        productName: product.name,
        quantity
      },
      revenue: totalAmount / 100, // Convert cents to dollars
      currency: session.currency?.toUpperCase() || 'USD',
      productId,
      timestamp: new Date().toISOString()
    };
    
    // Note: In production, this would be sent via internal API call
    // For now, we'll log it for tracking purposes
    console.log('[BOPixel] Purchase tracked:', trackingPayload);
  } catch (error) {
    console.error('[BOPixel] Failed to track purchase:', error);
  }
  
  console.log(`[Stripe Webhook] BopShop order ${orderNumber} created for user ${userId}`);
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

  console.log(`[Stripe Webhook] Kick-in tip of $${(totalAmount / 100).toFixed(2)} from user ${userId} to artist ${artistId}`);
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
 */
async function handleTransferCreated(transfer: any) {
  console.log('[Stripe Webhook] Transfer created:', transfer.id);

  const db = await getDb();
  if (!db) return;

  const artistId = parseInt(transfer.metadata?.artistId || '0');
  if (artistId) {
    // Update payment status to processing
    await db
      .update(bapPayments)
      .set({ status: 'processing' })
      .where(eq(bapPayments.stripePayoutId, transfer.id));

    console.log(`[Stripe Webhook] Updated payment status to processing for artist ${artistId}`);
  }
}

/**
 * Handle transfer paid (payout completed)
 */
async function handleTransferPaid(transfer: any) {
  console.log('[Stripe Webhook] Transfer paid:', transfer.id);

  const db = await getDb();
  if (!db) return;

  const artistId = parseInt(transfer.metadata?.artistId || '0');
  if (artistId) {
    // Update payment status to paid
    await db
      .update(bapPayments)
      .set({ 
        status: 'paid',
        paidAt: new Date(),
      })
      .where(eq(bapPayments.stripePayoutId, transfer.id));

    console.log(`[Stripe Webhook] Payment completed for artist ${artistId}`);
  }
}

/**
 * Handle transfer failed (payout failed)
 */
async function handleTransferFailed(transfer: any) {
  console.error('[Stripe Webhook] Transfer failed:', transfer.id, transfer.failure_message);

  const db = await getDb();
  if (!db) return;

  const artistId = parseInt(transfer.metadata?.artistId || '0');
  if (artistId) {
    // Update payment status to failed
    await db
      .update(bapPayments)
      .set({ 
        status: 'failed',
      })
      .where(eq(bapPayments.stripePayoutId, transfer.id));

    console.log(`[Stripe Webhook] Payment failed for artist ${artistId}: ${transfer.failure_message}`);
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
 * Handle subscription deleted/cancelled
 */
async function handleSubscriptionDeleted(subscription: any) {
  console.log('[Stripe Webhook] Subscription deleted:', subscription.id);

  const db = await getDb();
  if (!db) return;

  // Update subscription status to cancelled
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Stripe Webhook] Cancelled subscription ${subscription.id}`);
}
