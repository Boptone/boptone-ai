/**
 * POD (Print-on-Demand) Database Helpers
 * 
 * Query helpers for POD providers, artist accounts, product mappings, and order fulfillments
 */

import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import {
  podProviders,
  artistPodAccounts,
  podProductMappings,
  podOrderFulfillments,
  podWebhookEvents,
  type InsertPodProvider,
  type InsertArtistPodAccount,
  type InsertPodProductMapping,
  type InsertPodOrderFulfillment,
  type InsertPodWebhookEvent,
} from "../../drizzle/schema";

// ============================================================================
// POD PROVIDERS
// ============================================================================

export async function getPodProviders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(podProviders).where(eq(podProviders.status, "active"));
}

export async function getPodProviderByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(podProviders).where(eq(podProviders.name, name)).limit(1);
  return result[0];
}

export async function getPodProviderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(podProviders).where(eq(podProviders.id, id)).limit(1);
  return result[0];
}

export async function createPodProvider(data: InsertPodProvider) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(podProviders).values(data);
  return result;
}

// ============================================================================
// ARTIST POD ACCOUNTS
// ============================================================================

export async function getArtistPodAccounts(artistId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(artistPodAccounts)
    .where(and(eq(artistPodAccounts.artistId, artistId), eq(artistPodAccounts.status, "active")));
}

export async function getArtistPodAccount(artistId: number, providerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(artistPodAccounts)
    .where(and(eq(artistPodAccounts.artistId, artistId), eq(artistPodAccounts.providerId, providerId)))
    .limit(1);
  return result[0];
}

export async function getArtistPodAccountById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(artistPodAccounts).where(eq(artistPodAccounts.id, id)).limit(1);
  return result[0];
}

export async function createArtistPodAccount(data: InsertArtistPodAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(artistPodAccounts).values(data);
  return result;
}

export async function updateArtistPodAccount(id: number, data: Partial<InsertArtistPodAccount>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(artistPodAccounts).set(data).where(eq(artistPodAccounts.id, id));
  return result;
}

export async function disconnectArtistPodAccount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .update(artistPodAccounts)
    .set({ status: "disconnected", disconnectedAt: new Date() })
    .where(eq(artistPodAccounts.id, id));
  return result;
}

// ============================================================================
// POD PRODUCT MAPPINGS
// ============================================================================

export async function getPodProductMapping(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(podProductMappings).where(eq(podProductMappings.productId, productId)).limit(1);
  return result[0];
}

export async function getPodProductMappingsByArtist(artistPodAccountId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(podProductMappings).where(eq(podProductMappings.artistPodAccountId, artistPodAccountId));
}

export async function createPodProductMapping(data: InsertPodProductMapping) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(podProductMappings).values(data);
  return result;
}

export async function updatePodProductMapping(id: number, data: Partial<InsertPodProductMapping>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(podProductMappings).set(data).where(eq(podProductMappings.id, id));
  return result;
}

export async function deletePodProductMapping(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.delete(podProductMappings).where(eq(podProductMappings.productId, productId));
  return result;
}

// ============================================================================
// POD ORDER FULFILLMENTS
// ============================================================================

export async function getPodOrderFulfillment(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(podOrderFulfillments).where(eq(podOrderFulfillments.orderId, orderId)).limit(1);
  return result[0];
}

export async function getPodOrderFulfillmentByOrderItem(orderItemId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(podOrderFulfillments)
    .where(eq(podOrderFulfillments.orderItemId, orderItemId))
    .limit(1);
  return result[0];
}

export async function getPodOrderFulfillmentByProviderOrderId(providerId: number, providerOrderId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(podOrderFulfillments)
    .where(and(eq(podOrderFulfillments.providerId, providerId), eq(podOrderFulfillments.providerOrderId, providerOrderId)))
    .limit(1);
  return result[0];
}

export async function getPodOrderFulfillmentsByArtist(artistPodAccountId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(podOrderFulfillments)
    .where(eq(podOrderFulfillments.artistPodAccountId, artistPodAccountId))
    .orderBy(desc(podOrderFulfillments.createdAt));
}

export async function createPodOrderFulfillment(data: InsertPodOrderFulfillment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(podOrderFulfillments).values(data);
  return result;
}

export async function updatePodOrderFulfillment(id: number, data: Partial<InsertPodOrderFulfillment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(podOrderFulfillments).set(data).where(eq(podOrderFulfillments.id, id));
  return result;
}

export async function updatePodOrderFulfillmentByProviderOrderId(
  providerId: number,
  providerOrderId: string,
  data: Partial<InsertPodOrderFulfillment>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .update(podOrderFulfillments)
    .set(data)
    .where(and(eq(podOrderFulfillments.providerId, providerId), eq(podOrderFulfillments.providerOrderId, providerOrderId)));
  return result;
}

// ============================================================================
// POD WEBHOOK EVENTS
// ============================================================================

export async function createPodWebhookEvent(data: InsertPodWebhookEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(podWebhookEvents).values(data);
  return result;
}

export async function getPendingPodWebhookEvents(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(podWebhookEvents)
    .where(eq(podWebhookEvents.processed, false))
    .orderBy(podWebhookEvents.createdAt)
    .limit(limit);
}

export async function markPodWebhookEventProcessed(id: number, error?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .update(podWebhookEvents)
    .set({
      processed: true,
      processedAt: new Date(),
      processingError: error || null,
    })
    .where(eq(podWebhookEvents.id, id));
  return result;
}
