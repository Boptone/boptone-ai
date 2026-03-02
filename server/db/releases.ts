/**
 * server/db/releases.ts
 * DB helpers for the DDEX ERN 4.1 releases system.
 * Covers releases, releaseTracks, and releaseTerritoryDeals tables.
 */

import { and, asc, desc, eq } from "drizzle-orm";
import {
  InsertRelease,
  InsertReleaseTerritoryDeal,
  InsertReleaseTrack,
  InsertRightsAttestation,
  releases,
  releaseTerritoryDeals,
  releaseTracks,
  rightsAttestations,
} from "../../drizzle/schema";
import { getDb } from "../db";

// ---------------------------------------------------------------------------
// Releases CRUD
// ---------------------------------------------------------------------------

export async function createRelease(data: InsertRelease) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(releases).values(data);
  return { id: (result as any).insertId as number };
}

export async function updateRelease(id: number, data: Partial<InsertRelease>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(releases).set({ ...data, updatedAt: new Date() }).where(eq(releases.id, id));
}

export async function getReleaseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(releases).where(eq(releases.id, id)).limit(1);
  return rows[0] ?? undefined;
}

export async function getReleasesByArtist(artistId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(releases)
    .where(eq(releases.artistId, artistId))
    .orderBy(desc(releases.updatedAt));
}

export async function deleteRelease(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Cascade: remove tracks and territory deals first
  await db.delete(releaseTracks).where(eq(releaseTracks.releaseId, id));
  await db.delete(releaseTerritoryDeals).where(eq(releaseTerritoryDeals.releaseId, id));
  await db.delete(releases).where(eq(releases.id, id));
}

export async function publishRelease(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(releases)
    .set({ status: "ready", updatedAt: new Date() })
    .where(eq(releases.id, id));
}

// ---------------------------------------------------------------------------
// Release Tracks (ResourceList)
// ---------------------------------------------------------------------------

export async function getTracksByRelease(releaseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(releaseTracks)
    .where(eq(releaseTracks.releaseId, releaseId))
    .orderBy(asc(releaseTracks.discNumber), asc(releaseTracks.sequenceNumber));
}

export async function addTrackToRelease(data: InsertReleaseTrack) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Upsert: if the track is already in the release, update its position
  await db
    .insert(releaseTracks)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        discNumber: data.discNumber ?? 1,
        sequenceNumber: data.sequenceNumber ?? 1,
        isBonus: data.isBonus ?? 0,
        isHidden: data.isHidden ?? 0,
      },
    });
}

export async function removeTrackFromRelease(releaseId: number, trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(releaseTracks)
    .where(and(eq(releaseTracks.releaseId, releaseId), eq(releaseTracks.trackId, trackId)));
}

export async function reorderReleaseTracks(
  releaseId: number,
  order: Array<{ trackId: number; discNumber: number; sequenceNumber: number }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const item of order) {
    await db
      .update(releaseTracks)
      .set({ discNumber: item.discNumber, sequenceNumber: item.sequenceNumber })
      .where(
        and(eq(releaseTracks.releaseId, releaseId), eq(releaseTracks.trackId, item.trackId))
      );
  }
}

// ---------------------------------------------------------------------------
// Territory Deals (DealList)
// ---------------------------------------------------------------------------

export async function getTerritoryDealsByRelease(releaseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(releaseTerritoryDeals)
    .where(eq(releaseTerritoryDeals.releaseId, releaseId))
    .orderBy(asc(releaseTerritoryDeals.territory));
}

export async function setTerritoryDeal(data: InsertReleaseTerritoryDeal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .insert(releaseTerritoryDeals)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        pricingTier: data.pricingTier ?? "standard",
        streamingRights: data.streamingRights ?? 1,
        downloadRights: data.downloadRights ?? 0,
        syncRights: data.syncRights ?? 0,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        priceOverride: data.priceOverride ?? null,
        currency: data.currency ?? "USD",
        notes: data.notes ?? null,
        masterRightsConfirmed: data.masterRightsConfirmed ?? 0,
        publishingHandledBy: data.publishingHandledBy ?? "self",
      },
    });
}

export async function confirmTerritoryRights(
  releaseId: number,
  territory: string,
  publishingHandledBy: "self" | "pro" | "publisher" | "label" = "self"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(releaseTerritoryDeals)
    .set({ masterRightsConfirmed: 1, publishingHandledBy })
    .where(
      and(
        eq(releaseTerritoryDeals.releaseId, releaseId),
        eq(releaseTerritoryDeals.territory, territory)
      )
    );
}

export async function removeTerritoryDeal(releaseId: number, territory: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(releaseTerritoryDeals)
    .where(
      and(
        eq(releaseTerritoryDeals.releaseId, releaseId),
        eq(releaseTerritoryDeals.territory, territory)
      )
    );
}

export async function replaceAllTerritoryDeals(
  releaseId: number,
  deals: InsertReleaseTerritoryDeal[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(releaseTerritoryDeals).where(eq(releaseTerritoryDeals.releaseId, releaseId));
  if (deals.length > 0) {
    await db.insert(releaseTerritoryDeals).values(deals);
  }
}

// ---------------------------------------------------------------------------
// Rights Attestations — append-only audit log
// ---------------------------------------------------------------------------

/**
 * Record an immutable rights attestation.
 * Called once per distribution submission. Never updated or deleted.
 */
export async function createRightsAttestation(data: InsertRightsAttestation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(rightsAttestations).values(data);
  return { id: (result as any).insertId as number };
}

export async function getRightsAttestationsByRelease(releaseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(rightsAttestations)
    .where(eq(rightsAttestations.releaseId, releaseId))
    .orderBy(desc(rightsAttestations.attestedAt));
}

export async function getLatestRightsAttestation(releaseId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(rightsAttestations)
    .where(eq(rightsAttestations.releaseId, releaseId))
    .orderBy(desc(rightsAttestations.attestedAt))
    .limit(1);
  return rows[0] ?? undefined;
}

// ---------------------------------------------------------------------------
// DDEX metadata helper — assembles the full release record for the encoder
// ---------------------------------------------------------------------------

export async function getReleaseWithFullMetadata(releaseId: number) {
  const release = await getReleaseById(releaseId);
  if (!release) return undefined;
  const tracks = await getTracksByRelease(releaseId);
  const deals = await getTerritoryDealsByRelease(releaseId);
  const latestAttestation = await getLatestRightsAttestation(releaseId);
  return { release, tracks, deals, latestAttestation };
}
