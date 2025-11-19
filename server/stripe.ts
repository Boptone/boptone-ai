import Stripe from 'stripe';

// Get Stripe keys from environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || '';

if (!STRIPE_SECRET_KEY) {
  console.warn('[Stripe] STRIPE_SECRET_KEY not configured. Stripe functionality will not work.');
}

// Initialize Stripe with secret key
export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
});

// Stripe publishable key for frontend
export { STRIPE_PUBLISHABLE_KEY };

// Price IDs for subscription tiers (you'll need to create these in Stripe Dashboard)
export const STRIPE_PRICES = {
  PRO_MONTHLY: 'price_pro_monthly', // Replace with actual Stripe Price ID
  PRO_YEARLY: 'price_pro_yearly',   // Replace with actual Stripe Price ID
};

/**
 * Create a Stripe Checkout Session for Pro subscription
 */
export async function createCheckoutSession(params: {
  userId: number;
  userEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: params.userEmail,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId.toString(),
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  });

  return session;
}

/**
 * Create a Stripe Checkout Session for one-time product purchase
 */
export async function createProductCheckoutSession(params: {
  userId: number;
  userEmail: string;
  productName: string;
  amount: number; // in cents
  quantity: number;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: params.userEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: params.productName,
          },
          unit_amount: params.amount,
        },
        quantity: params.quantity,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId.toString(),
    },
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session for managing subscriptions
 */
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string, webhookSecret: string) {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
