import { Request, Response } from "express";
import { stripe } from "../stripe";
import { getDb } from "../db";
import { bapPayments, subscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

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
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'transfer.created':
        await handleTransferCreated(event.data.object);
        break;

      case 'transfer.paid':
        await handleTransferPaid(event.data.object);
        break;

      case 'transfer.failed':
        await handleTransferFailed(event.data.object);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
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

  // Update subscription status if this was a subscription checkout
  if (session.mode === 'subscription' && session.subscription) {
    const userId = parseInt(session.metadata?.userId || '0');
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
 */
async function handleAccountUpdated(account: any) {
  console.log('[Stripe Webhook] Account updated:', account.id);

  // Check if account is now fully onboarded
  if (account.charges_enabled && account.payouts_enabled) {
    console.log(`[Stripe Webhook] Account ${account.id} is now fully enabled for payouts`);
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
      status: 'cancelled',
      cancelledAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Stripe Webhook] Cancelled subscription ${subscription.id}`);
}
