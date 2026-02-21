import Stripe from 'stripe';

// Get Stripe keys from environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || '';

if (!STRIPE_SECRET_KEY) {
  console.warn('[Stripe] STRIPE_SECRET_KEY not configured. Stripe functionality will not work.');
}

// Initialize Stripe with secret key - only if key is available
let stripeInstance: Stripe | null = null;

if (STRIPE_SECRET_KEY) {
  stripeInstance = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia' as any,
  });
}

export const stripe = stripeInstance as Stripe;

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
 * Supported payment methods for global coverage
 * Includes: CashApp, Klarna, WeChat Pay, Alipay, and more
 */
export const SUPPORTED_PAYMENT_METHODS = [
  'card',           // Credit/debit cards (global)
  'cashapp',        // Cash App (US)
  'klarna',         // Klarna (EU, US, AU)
  'alipay',         // Alipay (China, global)
  'wechat_pay',     // WeChat Pay (China, global)
  'affirm',         // Affirm (US, Canada)
  'afterpay_clearpay', // Afterpay/Clearpay (US, UK, AU, NZ)
  'bancontact',     // Bancontact (Belgium)
  'eps',            // EPS (Austria)
  'giropay',        // Giropay (Germany)
  'ideal',          // iDEAL (Netherlands)
  'p24',            // Przelewy24 (Poland)
  'sepa_debit',     // SEPA Direct Debit (EU)
  'sofort',         // Sofort (EU)
  'grabpay',        // GrabPay (Singapore, Malaysia)
  'paynow',         // PayNow (Singapore)
  'promptpay',      // PromptPay (Thailand)
  'us_bank_account', // ACH Direct Debit (US)
] as const;

/**
 * Popular currencies (135+ supported by Stripe)
 * Full list: https://stripe.com/docs/currencies
 */
export const POPULAR_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
] as const;

export type SupportedCurrency = typeof POPULAR_CURRENCIES[number]['code'];

/**
 * Create a Stripe Checkout Session for one-time product purchase
 * 
 * ENTERPRISE COMPLIANCE: Uses Stripe Connect destination charges to route payments
 * directly to artists, eliminating money transmitter licensing requirements.
 */
export async function createProductCheckoutSession(params: {
  userId: number;
  userEmail: string;
  productName: string;
  amount: number; // in cents
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  artistStripeAccountId?: string; // Stripe Connect account ID for direct-to-artist payments
  platformFeePercentage?: number; // Platform fee (12% Free, 5% Pro, 2% Enterprise)
}) {
  // Calculate platform fee if using Stripe Connect
  const platformFeeAmount = params.artistStripeAccountId && params.platformFeePercentage
    ? Math.round(params.amount * params.quantity * (params.platformFeePercentage / 100))
    : 0;

  const sessionConfig: any = {
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
  };

  // Use Stripe Connect destination charges if artist has Connect account
  // This routes payment directly to artist's Stripe account with platform fee deducted
  if (params.artistStripeAccountId && platformFeeAmount > 0) {
    sessionConfig.payment_intent_data = {
      application_fee_amount: platformFeeAmount,
      transfer_data: {
        destination: params.artistStripeAccountId,
      },
    };
    sessionConfig.metadata.platform_fee_amount = platformFeeAmount.toString();
    sessionConfig.metadata.artist_stripe_account_id = params.artistStripeAccountId;
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  return session;
}

/**
 * Create a multi-currency, multi-payment-method Stripe Checkout Session
 * Supports BopShop, BopAudio, and Kick-in payments
 */
export async function createMultiCurrencyCheckout(params: {
  lineItems: Array<{
    price_data: {
      currency: string;
      product_data: {
        name: string;
        description?: string;
        images?: string[];
        metadata?: Record<string, string>;
      };
      unit_amount: number; // Amount in cents
    };
    quantity: number;
  }>;
  mode: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata: {
    userId: string;
    artistId?: string;
    paymentType: 'bopshop' | 'bap_stream' | 'kickin';
    [key: string]: string | undefined;
  };
  currency?: string;
  allowPromotionCodes?: boolean;
  paymentMethodTypes?: string[];
}) {
  const {
    lineItems,
    mode,
    successUrl,
    cancelUrl,
    customerEmail,
    metadata,
    currency = 'usd',
    allowPromotionCodes = true,
    paymentMethodTypes = SUPPORTED_PAYMENT_METHODS as unknown as string[],
  } = params;

  const session = await stripe.checkout.sessions.create({
    mode: mode as 'payment' | 'subscription',
    line_items: lineItems as any,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    client_reference_id: metadata.userId,
    metadata: metadata as any,
    payment_method_types: paymentMethodTypes as any,
    allow_promotion_codes: allowPromotionCodes,
  });

  return session;
}

/**
 * Calculate platform fee based on payment type
 * 
 * - BopShop: 10% platform fee (Shopify model)
 * - BopAudio: 10% platform fee (artist gets 90%)
 * - Kick-in: 0% platform fee (only processing fees)
 */
export function calculateFees(params: {
  amount: number; // In cents
  paymentType: 'bopshop' | 'bap_stream' | 'kickin';
}) {
  const { amount, paymentType } = params;

  // Stripe processing fee: 2.9% + $0.30
  const stripeFee = Math.round(amount * 0.029 + 30);

  let platformFee = 0;
  if (paymentType === 'bopshop' || paymentType === 'bap_stream') {
    // 10% platform fee for BopShop and BopAudio
    platformFee = Math.round(amount * 0.10);
  }
  // Kick-in has 0% platform fee

  const artistReceives = amount - stripeFee - platformFee;

  return {
    totalAmount: amount,
    stripeFee,
    platformFee,
    artistReceives,
  };
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
