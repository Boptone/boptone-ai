import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { products, bapTracks } from "../drizzle/schema";
import { sql, or, like, and, eq } from "drizzle-orm";

/**
 * Search Router
 * 
 * Provides full-text search functionality for products and BAP tracks
 * Uses LIKE-based search since FULLTEXT indexes are not supported
 */
export const searchRouter = router({
  /**
   * Search products by name, description, or tags
   */
  products: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const searchTerm = `%${input.query.toLowerCase()}%`;

      const results = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.status, "active"),
            or(
              sql`LOWER(${products.name}) LIKE ${searchTerm}`,
              sql`LOWER(${products.description}) LIKE ${searchTerm}`,
              sql`LOWER(${products.tags}) LIKE ${searchTerm}`,
              sql`LOWER(${products.category}) LIKE ${searchTerm}`
            )
          )
        )
        .limit(input.limit);

      return results;
    }),

  /**
   * Search BAP tracks by title, artist, or genre
   */
  tracks: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const searchTerm = `%${input.query.toLowerCase()}%`;

      const results = await db
        .select()
        .from(bapTracks)
        .where(
          and(
            eq(bapTracks.status, "live"),
            or(
              sql`LOWER(${bapTracks.title}) LIKE ${searchTerm}`,
              sql`LOWER(${bapTracks.artist}) LIKE ${searchTerm}`,
              sql`LOWER(${bapTracks.genre}) LIKE ${searchTerm}`,
              sql`LOWER(${bapTracks.mood}) LIKE ${searchTerm}`
            )
          )
        )
        .limit(input.limit);

      return results;
    }),

  /**
   * Combined search across products and tracks
   */
  all: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { products: [], tracks: [], total: 0 };

      const searchTerm = `%${input.query.toLowerCase()}%`;
      const searchLimit = Math.floor(input.limit / 2); // Split limit between products and tracks

      // Search products
      const productResults = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.status, "active"),
            or(
              sql`LOWER(${products.name}) LIKE ${searchTerm}`,
              sql`LOWER(${products.description}) LIKE ${searchTerm}`,
              sql`LOWER(${products.tags}) LIKE ${searchTerm}`,
              sql`LOWER(${products.category}) LIKE ${searchTerm}`
            )
          )
        )
        .limit(searchLimit);

      // Search tracks
      const trackResults = await db
        .select()
        .from(bapTracks)
        .where(
          and(
            eq(bapTracks.status, "live"),
            or(
              sql`LOWER(${bapTracks.title}) LIKE ${searchTerm}`,
              sql`LOWER(${bapTracks.artist}) LIKE ${searchTerm}`,
              sql`LOWER(${bapTracks.genre}) LIKE ${searchTerm}`,
              sql`LOWER(${bapTracks.mood}) LIKE ${searchTerm}`
            )
          )
        )
        .limit(searchLimit);

      return {
        products: productResults,
        tracks: trackResults,
        total: productResults.length + trackResults.length,
      };
    }),
});
