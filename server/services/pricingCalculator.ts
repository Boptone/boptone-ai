/**
 * BopShop Pricing Calculator
 * Calculates platform fees, credit card processing fees, and artist payouts
 * 
 * Pricing Model:
 * - Music Artists: 0% platform fee (core mission)
 * - Visual Artists: 12% platform fee (Phase 2 expansion)
 * - General Creators: 15% platform fee (Phase 3 expansion)
 * 
 * Credit Card Processing: 2.9% + $0.30 (passed to seller)
 * 
 * Tiered Discounts:
 * - Free Tier: Standard platform fee
 * - Pro Tier ($29/mo): -3% platform fee
 * - Premium Tier ($79/mo): -5% platform fee
 */

import { ArtistProfile } from '../../drizzle/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface PricingBreakdown {
  orderTotal: number; // Total order amount
  platformFee: number; // Boptone's cut
  platformFeePercentage: number; // Actual percentage applied
  creditCardFee: number; // Stripe/payment processor fee
  creditCardFeePercentage: number; // 2.9%
  artistPayout: number; // What the artist receives
  artistPayoutPercentage: number; // Percentage of order total
}

export interface SellerPricingConfig {
  sellerType: 'music_artist' | 'visual_artist' | 'general_creator';
  subscriptionTier: 'free' | 'pro' | 'premium';
  platformFeePercentage: number; // From database
}

// ============================================================================
// PRICING CONSTANTS
// ============================================================================

const CREDIT_CARD_FEE_PERCENTAGE = 2.9; // 2.9%
const CREDIT_CARD_FEE_FIXED = 0.30; // $0.30

const BASE_PLATFORM_FEES = {
  music_artist: 0, // 0% for music artists (core mission)
  visual_artist: 12, // 12% for visual artists (Phase 2)
  general_creator: 15, // 15% for general creators (Phase 3)
};

const TIER_DISCOUNTS = {
  free: 0, // No discount
  pro: 3, // -3% discount ($29/month)
  premium: 5, // -5% discount ($79/month)
};

// ============================================================================
// PRICING CALCULATOR
// ============================================================================

/**
 * Calculate pricing breakdown for a BopShop order
 * Returns platform fee, credit card fee, and artist payout
 */
export function calculatePricing(
  orderTotal: number,
  sellerConfig: SellerPricingConfig
): PricingBreakdown {
  // Calculate platform fee
  const basePlatformFee = BASE_PLATFORM_FEES[sellerConfig.sellerType];
  const tierDiscount = TIER_DISCOUNTS[sellerConfig.subscriptionTier];
  const platformFeePercentage = Math.max(0, basePlatformFee - tierDiscount);
  const platformFee = (orderTotal * platformFeePercentage) / 100;

  // Calculate credit card processing fee
  const creditCardFee = (orderTotal * CREDIT_CARD_FEE_PERCENTAGE) / 100 + CREDIT_CARD_FEE_FIXED;

  // Calculate artist payout
  const artistPayout = orderTotal - platformFee - creditCardFee;
  const artistPayoutPercentage = (artistPayout / orderTotal) * 100;

  return {
    orderTotal,
    platformFee: roundToTwoDecimals(platformFee),
    platformFeePercentage: roundToTwoDecimals(platformFeePercentage),
    creditCardFee: roundToTwoDecimals(creditCardFee),
    creditCardFeePercentage: CREDIT_CARD_FEE_PERCENTAGE,
    artistPayout: roundToTwoDecimals(artistPayout),
    artistPayoutPercentage: roundToTwoDecimals(artistPayoutPercentage),
  };
}

/**
 * Get platform fee percentage for a seller
 * Accounts for seller type and subscription tier
 */
export function getPlatformFeePercentage(
  sellerType: 'music_artist' | 'visual_artist' | 'general_creator',
  subscriptionTier: 'free' | 'pro' | 'premium'
): number {
  const baseFee = BASE_PLATFORM_FEES[sellerType];
  const discount = TIER_DISCOUNTS[subscriptionTier];
  return Math.max(0, baseFee - discount);
}

/**
 * Calculate platform fee for a given order total
 */
export function calculatePlatformFee(
  orderTotal: number,
  platformFeePercentage: number
): number {
  return roundToTwoDecimals((orderTotal * platformFeePercentage) / 100);
}

/**
 * Calculate credit card processing fee
 */
export function calculateCreditCardFee(orderTotal: number): number {
  return roundToTwoDecimals((orderTotal * CREDIT_CARD_FEE_PERCENTAGE) / 100 + CREDIT_CARD_FEE_FIXED);
}

/**
 * Calculate artist payout after all fees
 */
export function calculateArtistPayout(
  orderTotal: number,
  platformFee: number,
  creditCardFee: number
): number {
  return roundToTwoDecimals(orderTotal - platformFee - creditCardFee);
}

// ============================================================================
// PRICING EXAMPLES (for documentation/testing)
// ============================================================================

/**
 * Generate pricing examples for all seller types and tiers
 */
export function generatePricingExamples(orderTotal: number = 50): Record<string, PricingBreakdown> {
  const examples: Record<string, PricingBreakdown> = {};

  const sellerTypes: Array<'music_artist' | 'visual_artist' | 'general_creator'> = [
    'music_artist',
    'visual_artist',
    'general_creator',
  ];
  const tiers: Array<'free' | 'pro' | 'premium'> = ['free', 'pro', 'premium'];

  for (const sellerType of sellerTypes) {
    for (const tier of tiers) {
      const key = `${sellerType}_${tier}`;
      examples[key] = calculatePricing(orderTotal, {
        sellerType,
        subscriptionTier: tier,
        platformFeePercentage: getPlatformFeePercentage(sellerType, tier),
      });
    }
  }

  return examples;
}

/**
 * Get pricing comparison table for marketing
 */
export function getPricingComparisonTable(orderTotal: number = 50): string {
  const examples = generatePricingExamples(orderTotal);

  let table = `\n## BopShop Pricing Comparison (Order Total: $${orderTotal})\n\n`;
  table += `| Seller Type | Tier | Platform Fee | CC Fee | Artist Payout | Artist % |\n`;
  table += `|-------------|------|--------------|--------|---------------|----------|\n`;

  for (const [key, breakdown] of Object.entries(examples)) {
    const [sellerType, tier] = key.split('_');
    const sellerTypeLabel = sellerType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
    
    table += `| ${sellerTypeLabel} | ${tierLabel} | $${breakdown.platformFee.toFixed(2)} (${breakdown.platformFeePercentage}%) | $${breakdown.creditCardFee.toFixed(2)} | $${breakdown.artistPayout.toFixed(2)} | ${breakdown.artistPayoutPercentage.toFixed(1)}% |\n`;
  }

  return table;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

// ============================================================================
// EXPORT CONSTANTS FOR REFERENCE
// ============================================================================

export const PRICING_CONSTANTS = {
  BASE_PLATFORM_FEES,
  TIER_DISCOUNTS,
  CREDIT_CARD_FEE_PERCENTAGE,
  CREDIT_CARD_FEE_FIXED,
};
