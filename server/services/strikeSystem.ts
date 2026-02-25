/**
 * Three-Strike Policy System
 * Manages IP infringement strikes for artists using BopShop
 * 
 * Strike Levels:
 * - Strike 1: Warning email with educational resources
 * - Strike 2: Serious warning + 7-day design upload freeze
 * - Strike 3: BopShop access revoked permanently (with appeal option)
 */

import { getDb } from '../db';
import { ipStrikes, artistProfiles } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export interface StrikeData {
  artistId: number;
  productId?: number;
  strikeReason: string;
  designUrl?: string;
  evidenceUrl?: string;
}

export interface StrikeResult {
  strikeId: number;
  strikeNumber: number;
  bopShopAccessRevoked: boolean;
  message: string;
}

// ============================================================================
// STRIKE MANAGEMENT
// ============================================================================

/**
 * Issue a strike to an artist for IP infringement
 * Automatically escalates to next strike level
 */
export async function issueStrike(data: StrikeData): Promise<StrikeResult> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get current strike count
  const currentStrikeCount = await getStrikeCount(data.artistId);
  const nextStrikeNumber = currentStrikeCount + 1;

  // Insert strike record
  const [strike] = await db.insert(ipStrikes).values({
    artistId: data.artistId,
    productId: data.productId,
    strikeNumber: nextStrikeNumber,
    strikeReason: data.strikeReason,
    strikeDate: new Date(),
    designUrl: data.designUrl,
    evidenceUrl: data.evidenceUrl,
    resolved: false,
  });

  const strikeId = strike.insertId;

  // Determine action based on strike number
  let bopShopAccessRevoked = false;
  let message = '';

  switch (nextStrikeNumber) {
    case 1:
      message = 'Strike 1: Warning issued. Educational resources sent via email.';
      await sendStrike1Email(data.artistId, strikeId, data.strikeReason);
      break;
    case 2:
      message = 'Strike 2: Serious warning issued. Design upload frozen for 7 days.';
      await sendStrike2Email(data.artistId, strikeId, data.strikeReason);
      await freezeDesignUploads(data.artistId, 7);
      break;
    case 3:
    default:
      message = 'Strike 3: BopShop access revoked. Appeal process available.';
      bopShopAccessRevoked = true;
      await sendStrike3Email(data.artistId, strikeId, data.strikeReason);
      await revokeBopShopAccess(data.artistId);
      break;
  }

  console.log(`[Strike System] Strike ${nextStrikeNumber} issued to artist ${data.artistId}:`, message);

  return {
    strikeId,
    strikeNumber: nextStrikeNumber,
    bopShopAccessRevoked,
    message,
  };
}

/**
 * Get current strike count for an artist
 * Only counts unresolved strikes
 */
export async function getStrikeCount(artistId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const strikes = await db
    .select()
    .from(ipStrikes)
    .where(and(eq(ipStrikes.artistId, artistId), eq(ipStrikes.resolved, false)));

  return strikes.length;
}

/**
 * Get all strikes for an artist
 */
export async function getArtistStrikes(artistId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(ipStrikes)
    .where(eq(ipStrikes.artistId, artistId))
    .orderBy(desc(ipStrikes.strikeDate));
}

/**
 * Revoke a strike (admin only)
 * Used when strike was issued in error or appeal is approved
 */
export async function revokeStrike(strikeId: number, reason: string, revokedBy: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(ipStrikes)
    .set({
      resolved: true,
      resolvedBy: revokedBy,
      resolvedAt: new Date(),
      resolutionNotes: reason,
    })
    .where(eq(ipStrikes.id, strikeId));

  console.log(`[Strike System] Strike ${strikeId} revoked by user ${revokedBy}:`, reason);
}

/**
 * Check if artist has BopShop access
 * Returns false if artist has 3+ unresolved strikes
 */
export async function checkBopShopAccess(artistId: number): Promise<boolean> {
  const strikeCount = await getStrikeCount(artistId);
  return strikeCount < 3;
}

// ============================================================================
// STRIKE ACTIONS
// ============================================================================

/**
 * Freeze design uploads for X days (Strike 2)
 * TODO: Implement in product upload flow
 */
async function freezeDesignUploads(artistId: number, days: number): Promise<void> {
  console.log(`[Strike System] Design uploads frozen for artist ${artistId} for ${days} days`);
  // TODO: Add freeze_until timestamp to artist_profiles table
  // TODO: Check freeze_until in product upload tRPC procedure
}

/**
 * Revoke BopShop access permanently (Strike 3)
 * TODO: Implement in artist_profiles table
 */
async function revokeBopShopAccess(artistId: number): Promise<void> {
  console.log(`[Strike System] BopShop access revoked for artist ${artistId}`);
  // TODO: Add bopshop_access_revoked boolean to artist_profiles table
  // TODO: Check bopshop_access_revoked in all BopShop tRPC procedures
}

// ============================================================================
// EMAIL NOTIFICATIONS
// ============================================================================

/**
 * Send Strike 1 warning email
 * Includes educational resources on IP infringement
 */
async function sendStrike1Email(artistId: number, strikeId: number, reason: string): Promise<void> {
  console.log(`[Strike System] Sending Strike 1 email to artist ${artistId}`);
  
  // TODO: Implement email sending via server/_core/email.ts
  // Email should include:
  // - Warning about IP infringement
  // - Link to IP guidelines page
  // - Examples of allowed vs. not allowed designs
  // - Link to appeal process
}

/**
 * Send Strike 2 serious warning email
 * Includes 7-day upload freeze notice
 */
async function sendStrike2Email(artistId: number, strikeId: number, reason: string): Promise<void> {
  console.log(`[Strike System] Sending Strike 2 email to artist ${artistId}`);
  
  // TODO: Implement email sending via server/_core/email.ts
  // Email should include:
  // - Serious warning about repeated IP infringement
  // - Notice of 7-day design upload freeze
  // - Final warning before BopShop access revocation
  // - Link to appeal process
}

/**
 * Send Strike 3 account suspension email
 * Includes appeal process information
 */
async function sendStrike3Email(artistId: number, strikeId: number, reason: string): Promise<void> {
  console.log(`[Strike System] Sending Strike 3 email to artist ${artistId}`);
  
  // TODO: Implement email sending via server/_core/email.ts
  // Email should include:
  // - Notice of BopShop access revocation
  // - Explanation of why access was revoked
  // - Link to appeal process
  // - Contact information for support
}

// ============================================================================
// APPEAL SYSTEM
// ============================================================================

/**
 * Submit an appeal for a strike
 */
export async function submitAppeal(strikeId: number, appealReason: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(ipStrikes)
    .set({
      appealSubmitted: true,
      appealReason,
      appealDate: new Date(),
      appealDecision: 'pending',
    })
    .where(eq(ipStrikes.id, strikeId));

  console.log(`[Strike System] Appeal submitted for strike ${strikeId}`);
}

/**
 * Process an appeal (admin only)
 */
export async function processAppeal(
  strikeId: number,
  decision: 'approved' | 'rejected',
  adminUserId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(ipStrikes)
    .set({
      appealDecision: decision,
      appealDecisionDate: new Date(),
    })
    .where(eq(ipStrikes.id, strikeId));

  // If appeal approved, revoke the strike
  if (decision === 'approved') {
    await revokeStrike(strikeId, 'Appeal approved', adminUserId);
  }

  console.log(`[Strike System] Appeal ${decision} for strike ${strikeId} by admin ${adminUserId}`);
}
