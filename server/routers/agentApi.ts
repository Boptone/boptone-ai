import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { artistProfiles, products } from "../../drizzle/schema";
import { and, eq, like, or, gte, lte, sql } from "drizzle-orm";

/**
 * Agent API Router
 * 
 * Enables third-party AI agents to discover and transact with Boptone.
 * 
 * Endpoints:
 * - /search: Discover artists and products
 * - /purchase: Initiate transactions (TODO)
 * - /stream: Get streaming URLs (TODO)
 * - /analytics: Platform data (TODO)
 */

export const agentApiRouter = router({
  /**
   * Search Endpoint
   * 
   * Discover artists and products using natural language queries or structured filters.
   * 
   * Example queries:
   * - "Find me 5 jazz artists with vinyl under $30"
   * - "Show me indie rock artists from New York"
   * - "Find electronic music with digital downloads"
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        filters: z
          .object({
            genre: z.array(z.string()).optional(),
            product_type: z.enum(["vinyl", "cd", "cassette", "digital", "merch"]).optional(),
            price_min: z.number().optional(),
            price_max: z.number().optional(),
            in_stock: z.boolean().optional(),
            artist_location: z.string().optional(),
          })
          .optional(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        sort: z
          .enum(["relevance", "price_asc", "price_desc", "newest", "popular"])
          .default("relevance"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const { query, filters, limit, offset, sort } = input;

      // Parse natural language query into filters (basic implementation)
      const parsedFilters = parseNaturalLanguageQuery(query);
      const combinedFilters = { ...parsedFilters, ...filters };

      // Build WHERE clause
      const conditions = [];

      // Genre filter (genres is JSON array, so we need to use JSON_CONTAINS)
      if (combinedFilters.genre && combinedFilters.genre.length > 0) {
        const genreConditions = combinedFilters.genre.map((g) =>
          sql`JSON_CONTAINS(${artistProfiles.genres}, JSON_QUOTE(${g}))`
        );
        conditions.push(or(...genreConditions));
      }

      // Location filter
      if (combinedFilters.artist_location) {
        conditions.push(like(artistProfiles.location, `%${combinedFilters.artist_location}%`));
      }

      // Query artists
      const artists = await db
        .select({
          id: artistProfiles.id,
          userId: artistProfiles.userId,
          stageName: artistProfiles.stageName,
          bio: artistProfiles.bio,
          genres: artistProfiles.genres,
          location: artistProfiles.location,
          avatarUrl: artistProfiles.avatarUrl,
        })
        .from(artistProfiles)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(limit)
        .offset(offset);

      // For each artist, get their products
      const results = await Promise.all(
        artists.map(async (artist) => {
          const productConditions = [eq(products.artistId, artist.userId)];

          // Product type filter
          if (combinedFilters.product_type) {
            const typeMap: Record<string, string> = {
              vinyl: "physical",
              cd: "physical",
              cassette: "physical",
              digital: "digital",
              merch: "physical",
            };
            const mappedType = typeMap[combinedFilters.product_type] || "physical";
            productConditions.push(eq(products.type, mappedType as any));
          }

          // Price filter
          if (combinedFilters.price_min !== undefined) {
            productConditions.push(gte(products.price, combinedFilters.price_min));
          }
          if (combinedFilters.price_max !== undefined) {
            productConditions.push(lte(products.price, combinedFilters.price_max));
          }

          // Stock filter
          if (combinedFilters.in_stock) {
            productConditions.push(gte(products.inventoryQuantity, 1));
          }

          const artistProducts = await db
            .select({
              id: products.id,
              name: products.name,
              price: products.price,
              type: products.type,
              inventoryQuantity: products.inventoryQuantity,
              primaryImageUrl: products.primaryImageUrl,
              createdAt: products.createdAt,
            })
            .from(products)
            .where(and(...productConditions))
            .limit(10); // Max 10 products per artist

          return {
            artist_id: `artist_${artist.id}`,
            artist_name: artist.stageName || "Unknown Artist",
            artist_url: `https://boptone.com/@${artist.stageName?.toLowerCase().replace(/\\s+/g, "")}`,
            artist_bio: artist.bio || "",
            genre: Array.isArray(artist.genres) ? artist.genres : [],
            location: artist.location || "",
            followers: 0, // TODO: Implement follower count
            products: artistProducts.map((p) => ({
              product_id: `prod_${p.id}`,
              name: p.name,
              price: p.price / 100, // Convert cents to dollars
              currency: "USD",
              format: p.type,
              variant: p.type,
              in_stock: p.inventoryQuantity > 0,
              stock_quantity: p.inventoryQuantity,
              product_url: `https://boptone.com/shop/product/${p.id}`,
              image_url: p.primaryImageUrl || "",
              release_date: p.createdAt.toISOString().split("T")[0],
            })),
          };
        })
      );

      // Filter out artists with no products (if product filters were applied)
      const filteredResults =
        combinedFilters.product_type || combinedFilters.price_min || combinedFilters.price_max
          ? results.filter((r) => r.products.length > 0)
          : results;

      return {
        results: filteredResults,
        total_results: filteredResults.length,
        query_id: `query_${Date.now()}`,
        pagination: {
          limit,
          offset,
          has_more: filteredResults.length === limit,
        },
      };
    }),

  /**
   * Purchase Endpoint
   * 
   * Initiate a transaction on behalf of an authenticated user.
   * 
   * This endpoint is designed for AI agents to complete purchases programmatically.
   * It requires a valid OAuth token and handles the full checkout flow.
   */
  purchase: publicProcedure
    .input(
      z.object({
        user_token: z.string().describe("OAuth 2.0 Bearer token for the authenticated user"),
        product_id: z.string().describe("Product ID in format 'prod_{id}'"),
        quantity: z.number().min(1).max(10).default(1),
        shipping_address: z.object({
          name: z.string(),
          street: z.string(),
          street2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          zip: z.string(),
          country: z.string().default("US"),
          phone: z.string().optional(),
        }),
        payment_method_id: z.string().describe("Stripe Payment Method ID"),
        shipping_method: z.string().optional().describe("Shipping service level (e.g., 'usps_priority')"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // TODO: Validate user_token (OAuth)
      // For now, we'll throw an error indicating OAuth is required
      // In production, this would verify the token with the OAuth server
      throw new Error(
        "Purchase endpoint requires OAuth 2.0 authentication. " +
        "Please implement OAuth flow to obtain a valid user_token. " +
        "See Agent API documentation for details."
      );

      // Future implementation:
      // 1. Validate user_token and get user ID
      // 2. Parse product_id and validate product availability
      // 3. Calculate shipping rates using Shippo
      // 4. Create Stripe PaymentIntent
      // 5. Create order in database
      // 6. Purchase shipping label (if physical product)
      // 7. Send confirmation email
      // 8. Return order details with tracking

      // Example return structure:
      // return {
      //   order_id: `order_${orderId}`,
      //   order_number: orderNumber,
      //   status: "confirmed",
      //   total: totalAmount,
      //   currency: "USD",
      //   shipping_label_url: labelUrl,
      //   tracking_number: trackingNumber,
      //   estimated_delivery: "2026-02-25",
      //   order_url: `https://boptone.com/orders/${orderId}`,
      // };
    }),
});

/**
 * Parse natural language query into structured filters
 * 
 * Basic implementation - extracts common patterns from queries.
 * Future: Use LLM for more sophisticated parsing.
 */
function parseNaturalLanguageQuery(query?: string): {
  genre?: string[];
  product_type?: "vinyl" | "cd" | "cassette" | "digital" | "merch";
  price_max?: number;
  artist_location?: string;
} {
  if (!query) return {};

  const filters: ReturnType<typeof parseNaturalLanguageQuery> = {};

  // Extract genres
  const genreKeywords = [
    "jazz",
    "hip hop",
    "indie rock",
    "electronic",
    "pop",
    "rock",
    "metal",
    "country",
    "folk",
    "classical",
  ];
  const foundGenres = genreKeywords.filter((g) => query.toLowerCase().includes(g));
  if (foundGenres.length > 0) {
    filters.genre = foundGenres;
  }

  // Extract product types
  if (query.toLowerCase().includes("vinyl")) {
    filters.product_type = "vinyl";
  } else if (query.toLowerCase().includes("cd")) {
    filters.product_type = "cd";
  } else if (query.toLowerCase().includes("cassette")) {
    filters.product_type = "cassette";
  } else if (query.toLowerCase().includes("digital")) {
    filters.product_type = "digital";
  } else if (query.toLowerCase().includes("merch")) {
    filters.product_type = "merch";
  }

  // Extract price constraints
  const priceMatch = query.match(/under \$?(\d+)/i);
  if (priceMatch) {
    filters.price_max = parseInt(priceMatch[1]);
  }

  // Extract location
  const locationKeywords = ["from", "in", "based in"];
  for (const keyword of locationKeywords) {
    const locationMatch = query.match(new RegExp(`${keyword} ([A-Z][a-z]+(?:\\s[A-Z][a-z]+)*)`, "i"));
    if (locationMatch) {
      filters.artist_location = locationMatch[1];
      break;
    }
  }

  return filters;
}
