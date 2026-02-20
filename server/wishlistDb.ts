import { and, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  wishlists,
  products,
  type Wishlist,
  type InsertWishlist,
} from "../drizzle/schema";

/**
 * WISHLIST DATABASE HELPERS
 * All functions return raw Drizzle results
 */

export async function addToWishlist(userId: number, productId: number): Promise<Wishlist> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already in wishlist
  const existing = await db.select().from(wishlists).where(
    and(
      eq(wishlists.userId, userId),
      eq(wishlists.productId, productId)
    )
  );
  
  if (existing.length > 0) {
    return existing[0]; // Already in wishlist
  }
  
  // Add to wishlist
  const [result] = await db.insert(wishlists).values({
    userId,
    productId,
  });
  
  const [newItem] = await db.select().from(wishlists).where(eq(wishlists.id, Number(result.insertId)));
  return newItem;
}

export async function removeFromWishlist(userId: number, productId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(wishlists).where(
    and(
      eq(wishlists.userId, userId),
      eq(wishlists.productId, productId)
    )
  );
}

export async function getWishlistByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Join wishlist items with products to get product details
  const items = await db
    .select({
      id: wishlists.id,
      userId: wishlists.userId,
      productId: wishlists.productId,
      createdAt: wishlists.createdAt,
      product: products,
    })
    .from(wishlists)
    .leftJoin(products, eq(wishlists.productId, products.id))
    .where(eq(wishlists.userId, userId))
    .orderBy(sql`${wishlists.createdAt} DESC`);
  
  return items;
}

export async function isInWishlist(userId: number, productId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(wishlists).where(
    and(
      eq(wishlists.userId, userId),
      eq(wishlists.productId, productId)
    )
  );
  
  return result.length > 0;
}

export async function getWishlistCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` }).from(wishlists).where(eq(wishlists.userId, userId));
  return result[0]?.count || 0;
}
