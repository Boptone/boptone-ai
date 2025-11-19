import { stripe } from "./stripe";
import { createPayment, getArtistEarnings } from "./bap";
import { getDb } from "./db";
import { artistProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * BAP Payment Processing
 * Handles revenue calculation and Stripe payouts for artists
 */

// Minimum payout threshold in cents ($10.00)
const MINIMUM_PAYOUT_THRESHOLD = 1000;

/**
 * Calculate pending earnings for an artist
 */
export async function calculatePendingEarnings(artistId: number) {
  // Get total earnings from streams
  const earnings = await getArtistEarnings(artistId);
  
  // Get total already paid out
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { bapPayments } = await import("../drizzle/schema");
  const { sum, eq } = await import("drizzle-orm");
  
  const paidOutQuery = await db
    .select({ total: sum(bapPayments.amount) })
    .from(bapPayments)
    .where(eq(bapPayments.artistId, artistId));
  
  const totalPaidOut = paidOutQuery[0]?.total || 0;
  const pendingAmount = earnings.totalEarnings - Number(totalPaidOut);
  
  return {
    totalEarnings: earnings.totalEarnings,
    totalPaidOut: Number(totalPaidOut),
    pendingAmount,
    streamCount: earnings.streamCount,
    canPayout: pendingAmount >= MINIMUM_PAYOUT_THRESHOLD,
    minimumThreshold: MINIMUM_PAYOUT_THRESHOLD,
  };
}

/**
 * Create a Stripe payout for an artist
 * This would typically be called by an admin or automated job
 */
export async function createArtistPayout(artistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Calculate pending earnings
  const pending = await calculatePendingEarnings(artistId);
  
  if (!pending.canPayout) {
    throw new Error(`Minimum payout threshold not met. Need $${(MINIMUM_PAYOUT_THRESHOLD / 100).toFixed(2)}, have $${(pending.pendingAmount / 100).toFixed(2)}`);
  }
  
  // Get artist profile with Stripe account info
  const [profile] = await db
    .select()
    .from(artistProfiles)
    .where(eq(artistProfiles.id, artistId))
    .limit(1);
  
  if (!profile) {
    throw new Error("Artist profile not found");
  }
  
  // Check if artist has connected Stripe account
  const stripeAccountId = (profile.metadata as any)?.stripeAccountId;
  
  if (!stripeAccountId) {
    throw new Error("Artist has not connected a Stripe account for payouts");
  }
  
  try {
    // Create Stripe transfer to artist's connected account
    const transfer = await stripe.transfers.create({
      amount: pending.pendingAmount,
      currency: "usd",
      destination: stripeAccountId,
      description: `Boptone BAP earnings payout - ${pending.streamCount} streams`,
      metadata: {
        artistId: artistId.toString(),
        streamCount: pending.streamCount.toString(),
        periodType: "accumulated",
      },
    });
    
    // Record payment in database
    const now = new Date();
    const payment = await createPayment({
      artistId,
      amount: pending.pendingAmount,
      streamCount: pending.streamCount,
      stripePayoutId: transfer.id,
      status: "paid",
      periodStart: new Date(0), // Beginning of time (all accumulated earnings)
      periodEnd: now,
    });
    
    return {
      success: true,
      payment,
      transfer,
      amount: pending.pendingAmount,
      amountFormatted: `$${(pending.pendingAmount / 100).toFixed(2)}`,
    };
  } catch (error: any) {
    // Log error and create failed payment record
    console.error("Stripe payout failed:", error);
    
    const now = new Date();
    await createPayment({
      artistId,
      amount: pending.pendingAmount,
      streamCount: pending.streamCount,
      status: "failed",
      periodStart: new Date(0),
      periodEnd: now,
    });
    
    throw new Error(`Payout failed: ${error.message}`);
  }
}

/**
 * Create Stripe Connect account link for artist onboarding
 * Artists need to connect their Stripe account to receive payouts
 */
export async function createStripeConnectAccountLink(artistId: number, refreshUrl: string, returnUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get artist profile
  const [profile] = await db
    .select()
    .from(artistProfiles)
    .where(eq(artistProfiles.id, artistId))
    .limit(1);
  
  if (!profile) {
    throw new Error("Artist profile not found");
  }
  
  // Check if artist already has a Stripe account
  let stripeAccountId = (profile.metadata as any)?.stripeAccountId;
  
  if (!stripeAccountId) {
    // Create new Stripe Connect account
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        artistId: artistId.toString(),
        artistName: profile.stageName,
      },
    });
    
    stripeAccountId = account.id;
    
    // Save Stripe account ID to artist profile
    await db
      .update(artistProfiles)
      .set({
        metadata: {
          ...(profile.metadata as any || {}),
          stripeAccountId,
        },
      })
      .where(eq(artistProfiles.id, artistId));
  }
  
  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
  
  return {
    url: accountLink.url,
    stripeAccountId,
  };
}

/**
 * Check if artist has completed Stripe Connect onboarding
 */
export async function checkStripeAccountStatus(artistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [profile] = await db
    .select()
    .from(artistProfiles)
    .where(eq(artistProfiles.id, artistId))
    .limit(1);
  
  if (!profile) {
    throw new Error("Artist profile not found");
  }
  
  const stripeAccountId = (profile.metadata as any)?.stripeAccountId;
  
  if (!stripeAccountId) {
    return {
      connected: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    };
  }
  
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    
    return {
      connected: true,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      stripeAccountId,
    };
  } catch (error) {
    console.error("Failed to retrieve Stripe account:", error);
    return {
      connected: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    };
  }
}
