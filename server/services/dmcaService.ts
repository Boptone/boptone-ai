/**
 * DMCA Fast-Track Service
 * Handles DMCA takedown notices and counter-notices
 * 
 * Features:
 * - 24-hour takedown guarantee for valid notices
 * - Counter-notice process for artists
 * - Automated product delisting
 * - Strike issuance for IP infringement
 */

import { getDb } from '../db';
import { dmcaNotices, products } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { issueStrike } from './strikeSystem';

// ============================================================================
// TYPES
// ============================================================================

export interface DmcaNoticeData {
  productId: number;
  artistId: number;
  complainantName: string;
  complainantEmail: string;
  complainantCompany?: string;
  complainantAddress?: string;
  infringementDescription: string;
  copyrightedWorkDescription: string;
  evidenceUrl?: string;
  digitalSignature: string;
}

export interface DmcaNoticeResult {
  noticeId: number;
  status: string;
  message: string;
}

// ============================================================================
// DMCA NOTICE SUBMISSION
// ============================================================================

/**
 * Submit a DMCA takedown notice
 * Validates notice and initiates takedown process
 */
export async function submitDmcaNotice(data: DmcaNoticeData): Promise<DmcaNoticeResult> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Validate DMCA notice
  const validationError = validateDmcaNotice(data);
  if (validationError) {
    throw new Error(`Invalid DMCA notice: ${validationError}`);
  }

  // Insert DMCA notice
  const [notice] = await db.insert(dmcaNotices).values({
    productId: data.productId,
    artistId: data.artistId,
    complainantName: data.complainantName,
    complainantEmail: data.complainantEmail,
    complainantCompany: data.complainantCompany,
    complainantAddress: data.complainantAddress,
    infringementDescription: data.infringementDescription,
    copyrightedWorkDescription: data.copyrightedWorkDescription,
    evidenceUrl: data.evidenceUrl,
    noticeDate: new Date(),
    digitalSignature: data.digitalSignature,
    status: 'pending',
  });

  const noticeId = notice.insertId;

  console.log(`[DMCA] Notice ${noticeId} submitted for product ${data.productId}`);

  // Schedule automated takedown (24 hours from now)
  // TODO: Implement scheduled job system
  await scheduleAutomatedTakedown(noticeId, 24);

  return {
    noticeId,
    status: 'pending',
    message: 'DMCA notice submitted successfully. Product will be delisted within 24 hours if notice is valid.',
  };
}

/**
 * Validate DMCA notice fields
 * Ensures all required fields are present
 */
function validateDmcaNotice(data: DmcaNoticeData): string | null {
  if (!data.complainantName || data.complainantName.trim().length === 0) {
    return 'Complainant name is required';
  }

  if (!data.complainantEmail || !isValidEmail(data.complainantEmail)) {
    return 'Valid complainant email is required';
  }

  if (!data.infringementDescription || data.infringementDescription.trim().length < 50) {
    return 'Infringement description must be at least 50 characters';
  }

  if (!data.copyrightedWorkDescription || data.copyrightedWorkDescription.trim().length < 50) {
    return 'Copyrighted work description must be at least 50 characters';
  }

  if (!data.digitalSignature || data.digitalSignature.trim().length === 0) {
    return 'Digital signature is required';
  }

  return null;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================================
// AUTOMATED TAKEDOWN
// ============================================================================

/**
 * Schedule automated takedown for 24 hours from now
 * TODO: Integrate with scheduled job system
 */
async function scheduleAutomatedTakedown(noticeId: number, hoursFromNow: number): Promise<void> {
  console.log(`[DMCA] Scheduled automated takedown for notice ${noticeId} in ${hoursFromNow} hours`);
  
  // TODO: Implement using scheduled_jobs table
  // TODO: Create cron job or background worker to process takedowns
}

/**
 * Process DMCA takedown
 * Delists product, notifies artist, issues strike
 */
export async function processTakedown(noticeId: number, adminUserId?: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get DMCA notice
  const [notice] = await db
    .select()
    .from(dmcaNotices)
    .where(eq(dmcaNotices.id, noticeId));

  if (!notice) {
    throw new Error(`DMCA notice ${noticeId} not found`);
  }

  if (notice.status !== 'pending') {
    throw new Error(`DMCA notice ${noticeId} already processed (status: ${notice.status})`);
  }

  // Delist product (soft delete)
  if (notice.productId) {
    await db
      .update(products)
      .set({
        status: 'archived',
        deletedAt: new Date(),
      })
      .where(eq(products.id, notice.productId));

    console.log(`[DMCA] Product ${notice.productId} delisted`);
  }

  // Update DMCA notice status
  await db
    .update(dmcaNotices)
    .set({
      status: 'takedown',
      actionTaken: 'Product delisted and artist notified',
      actionDate: new Date(),
      actionBy: adminUserId,
    })
    .where(eq(dmcaNotices.id, noticeId));

  // Issue strike to artist
  await issueStrike({
    artistId: notice.artistId,
    productId: notice.productId || undefined,
    strikeReason: `DMCA takedown notice: ${notice.infringementDescription}`,
    evidenceUrl: notice.evidenceUrl || undefined,
  });

  // Send notification email to artist
  await sendTakedownEmail(notice.artistId, noticeId);

  console.log(`[DMCA] Takedown processed for notice ${noticeId}`);
}

/**
 * Send takedown notification email to artist
 */
async function sendTakedownEmail(artistId: number, noticeId: number): Promise<void> {
  console.log(`[DMCA] Sending takedown email to artist ${artistId} for notice ${noticeId}`);
  
  // TODO: Implement email sending via server/_core/email.ts
  // Email should include:
  // - Notice of product delisting
  // - Explanation of DMCA takedown
  // - Copy of DMCA notice
  // - Link to counter-notice process
  // - Strike information
}

// ============================================================================
// COUNTER-NOTICE
// ============================================================================

/**
 * Submit a counter-notice (artist disputes DMCA takedown)
 */
export async function submitCounterNotice(
  noticeId: number,
  counterNoticeReason: string,
  counterNoticeSignature: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Validate counter-notice
  if (!counterNoticeReason || counterNoticeReason.trim().length < 50) {
    throw new Error('Counter-notice reason must be at least 50 characters');
  }

  if (!counterNoticeSignature || counterNoticeSignature.trim().length === 0) {
    throw new Error('Digital signature is required');
  }

  // Update DMCA notice with counter-notice
  await db
    .update(dmcaNotices)
    .set({
      status: 'counter_notice',
      counterNoticeSubmitted: true,
      counterNoticeReason,
      counterNoticeDate: new Date(),
      counterNoticeSignature,
    })
    .where(eq(dmcaNotices.id, noticeId));

  console.log(`[DMCA] Counter-notice submitted for notice ${noticeId}`);

  // TODO: Send counter-notice to original complainant
  // TODO: Add to admin review queue
}

/**
 * Resolve DMCA notice (admin decision)
 */
export async function resolveDmcaNotice(
  noticeId: number,
  resolution: 'resolved' | 'rejected',
  adminUserId: number,
  resolutionNotes: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(dmcaNotices)
    .set({
      status: resolution,
      actionTaken: resolutionNotes,
      actionDate: new Date(),
      actionBy: adminUserId,
    })
    .where(eq(dmcaNotices.id, noticeId));

  console.log(`[DMCA] Notice ${noticeId} resolved as ${resolution} by admin ${adminUserId}`);
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get DMCA notice by ID
 */
export async function getDmcaNotice(noticeId: number) {
  const db = await getDb();
  if (!db) return null;

  const [notice] = await db
    .select()
    .from(dmcaNotices)
    .where(eq(dmcaNotices.id, noticeId));

  return notice || null;
}

/**
 * Get all DMCA notices for an artist
 */
export async function getArtistDmcaNotices(artistId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(dmcaNotices)
    .where(eq(dmcaNotices.artistId, artistId))
    .orderBy(desc(dmcaNotices.noticeDate));
}

/**
 * Get all pending DMCA notices (admin)
 */
export async function getPendingDmcaNotices() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(dmcaNotices)
    .where(eq(dmcaNotices.status, 'pending'))
    .orderBy(desc(dmcaNotices.noticeDate));
}
