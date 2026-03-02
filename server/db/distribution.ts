/**
 * DISTRO-UX1: Distribution Wizard DB Helpers
 *
 * Query helpers for distribution_submissions and distribution_submission_tracks.
 * All functions return raw Drizzle rows — no business logic here.
 */

import { eq, and, desc, inArray } from "drizzle-orm";
import { getDb } from "../db";
import {
  distributionSubmissions,
  distributionSubmissionTracks,
  type DistributionSubmission,
  type InsertDistributionSubmission,
} from "../../drizzle/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DistributionTerritories = {
  mode: "worldwide" | "regions" | "custom";
  regions?: string[];
  countries?: string[];
  excludedCountries?: string[];
};

export type DistributionStatus =
  | "draft"
  | "submitted"
  | "processing"
  | "live"
  | "partial"
  | "failed"
  | "cancelled"
  | "takedown";

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createDistributionSubmission(data: {
  artistId: number;
  trackIds?: number[];
  selectedDsps?: string[];
  territories?: DistributionTerritories;
  pricingTier?: "free" | "standard" | "premium";
  boptoneSharePercent?: string;
  releaseDate?: Date | null;
  preSaveEnabled?: boolean;
  exclusiveWindowDays?: number;
  upc?: string | null;
  isrc?: string | null;
  artistNotes?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(distributionSubmissions).values({
    artistId: data.artistId,
    trackIds: data.trackIds ?? [],
    selectedDsps: data.selectedDsps ?? [],
    territories: data.territories ?? { mode: "worldwide" },
    pricingTier: data.pricingTier ?? "standard",
    boptoneSharePercent: data.boptoneSharePercent ?? "10.00",
    releaseDate: data.releaseDate ?? null,
    preSaveEnabled: data.preSaveEnabled ?? false,
    exclusiveWindowDays: data.exclusiveWindowDays ?? 0,
    upc: data.upc ?? null,
    isrc: data.isrc ?? null,
    artistNotes: data.artistNotes ?? null,
    status: "draft",
  });

  return result;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateDistributionSubmission(
  id: number,
  data: Partial<{
    trackIds: number[];
    selectedDsps: string[];
    territories: DistributionTerritories;
    pricingTier: "free" | "standard" | "premium";
    boptoneSharePercent: string;
    releaseDate: Date | null;
    preSaveEnabled: boolean;
    exclusiveWindowDays: number;
    upc: string | null;
    isrc: string | null;
    artistNotes: string | null;
    status: DistributionStatus;
    submittedAt: Date | null;
    processedAt: Date | null;
    liveAt: Date | null;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(distributionSubmissions)
    .set(data as any)
    .where(eq(distributionSubmissions.id, id));
}

// ─── Submit ───────────────────────────────────────────────────────────────────

export async function submitDistributionSubmission(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(distributionSubmissions)
    .set({ status: "submitted", submittedAt: new Date() })
    .where(eq(distributionSubmissions.id, id));
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getDistributionSubmissionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const rows = await db
    .select()
    .from(distributionSubmissions)
    .where(eq(distributionSubmissions.id, id))
    .limit(1);

  return rows[0] ?? undefined;
}

export async function getDistributionSubmissionsByArtist(artistId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(distributionSubmissions)
    .where(eq(distributionSubmissions.artistId, artistId))
    .orderBy(desc(distributionSubmissions.createdAt));
}

export async function getDraftSubmissionForArtist(artistId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const rows = await db
    .select()
    .from(distributionSubmissions)
    .where(
      and(
        eq(distributionSubmissions.artistId, artistId),
        eq(distributionSubmissions.status, "draft")
      )
    )
    .orderBy(desc(distributionSubmissions.updatedAt))
    .limit(1);

  return rows[0] ?? undefined;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteDistributionSubmission(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(distributionSubmissions)
    .where(eq(distributionSubmissions.id, id));
}
