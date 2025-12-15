import Stripe from 'stripe';

// Get Stripe keys from environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || '';

// Flag to check if Stripe is configured
export const isStripeConfigured = !!STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.warn('[Stripe] STRIPE_SECRET_KEY not configured. Stripe functionality will not work.');
}

// Initialize Stripe with secret key (use placeholder if not configured to prevent crash)
export const stripe = STRIPE_SECRET_KEY 
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover' })
  : null as unknown as Stripe; // Type assertion to allow code to compile

// Stripe publishable key for frontend
export { STRIPE_PUBLISHABLE_KEY };

// Price IDs for subscription tiers (you'll need to create these in Stripe Dashboard)
export const STRIPE_PRICES = {
  PRO_MONTHLY: 'price_pro_monthly', // Replace with actual Stripe Price ID
  PRO_YEARLY: 'price_pro_yearly',   // Replace with actual Stripe Price ID
};

/**
 * Helper to check if Stripe is available before making calls
 */
function requireStripe(): Stripe {
  if (!stripe || !isStripeConfigured) {
    throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.');
  }
  return stripe;
}

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
  const stripeClient = requireStripe();
  const session = await stripeClient.checkout.sessions.create({
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
  const stripeClient = requireStripe();
  const session = await stripeClient.checkout.sessions.create({
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
  const stripeClient = requireStripe();
  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const stripeClient = requireStripe();
  const subscription = await stripeClient.subscriptions.cancel(subscriptionId);
  return subscription;
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  const stripeClient = requireStripe();
  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
  return subscription;
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string, webhookSecret: string) {
  const stripeClient = requireStripe();
  return stripeClient.webhooks.constructEvent(payload, signature, webhookSecret);
}
