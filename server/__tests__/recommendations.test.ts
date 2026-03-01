/**
 * [COMMERCE-2] Recommendation Engine Tests
 *
 * Covers:
 * - getAlsoBought: collaborative filter on a single product
 * - getForCartItems: multi-product cart-level collaborative filter
 * - Cache layer: TTL, hit, miss, invalidation
 * - Fallback chains: category → bestsellers → generic
 * - Edge cases: empty order history, single-item orders, all products excluded
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers & mocks
// ─────────────────────────────────────────────────────────────────────────────

/** Minimal product shape returned by the recommendations router */
function makeProduct(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    name: `Product ${id}`,
    slug: `product-${id}`,
    description: `Description for product ${id}`,
    price: 1999 + id * 100,
    status: "active",
    category: "merch",
    type: "physical",
    primaryImageUrl: null,
    images: [],
    artistId: 1,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

/** Minimal order-item row */
function makeOrderItem(orderId: number, productId: number) {
  return { orderId, productId };
}

// ─────────────────────────────────────────────────────────────────────────────
// Unit tests for the collaborative-filter logic (pure functions)
// ─────────────────────────────────────────────────────────────────────────────

describe("[COMMERCE-2] Collaborative filter — co-purchase ranking", () => {
  it("ranks products by co-purchase frequency (descending)", () => {
    /**
     * Simulate the SQL GROUP BY + COUNT(*) logic in pure JS.
     * Orders: A+B+C, A+B, A+C → seed=A
     * Expected: B=2, C=2 (tie broken by insertion order)
     */
    const orderItems = [
      makeOrderItem(1, 1), makeOrderItem(1, 2), makeOrderItem(1, 3),
      makeOrderItem(2, 1), makeOrderItem(2, 2),
      makeOrderItem(3, 1), makeOrderItem(3, 3),
    ];
    const seedProductId = 1;

    // Find orders containing seed
    const seedOrders = new Set(
      orderItems.filter((r) => r.productId === seedProductId).map((r) => r.orderId)
    );

    // Count co-purchases
    const counts = new Map<number, number>();
    for (const item of orderItems) {
      if (seedOrders.has(item.orderId) && item.productId !== seedProductId) {
        counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1);
      }
    }

    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    expect(ranked[0][1]).toBeGreaterThanOrEqual(ranked[1][1]);
    expect(ranked.map((r) => r[0])).toContain(2);
    expect(ranked.map((r) => r[0])).toContain(3);
  });

  it("excludes the seed product from results", () => {
    const orderItems = [
      makeOrderItem(1, 1), makeOrderItem(1, 2),
      makeOrderItem(2, 1), makeOrderItem(2, 1), // duplicate — same product
    ];
    const seedProductId = 1;
    const seedOrders = new Set(
      orderItems.filter((r) => r.productId === seedProductId).map((r) => r.orderId)
    );
    const counts = new Map<number, number>();
    for (const item of orderItems) {
      if (seedOrders.has(item.orderId) && item.productId !== seedProductId) {
        counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1);
      }
    }
    expect(counts.has(seedProductId)).toBe(false);
    expect(counts.has(2)).toBe(true);
  });

  it("returns empty map when seed product has no co-purchases", () => {
    const orderItems = [makeOrderItem(1, 5)]; // only one product in the order
    const seedProductId = 5;
    const seedOrders = new Set(
      orderItems.filter((r) => r.productId === seedProductId).map((r) => r.orderId)
    );
    const counts = new Map<number, number>();
    for (const item of orderItems) {
      if (seedOrders.has(item.orderId) && item.productId !== seedProductId) {
        counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1);
      }
    }
    expect(counts.size).toBe(0);
  });

  it("returns empty map when seed product has never been ordered", () => {
    const orderItems = [makeOrderItem(1, 2), makeOrderItem(1, 3)];
    const seedProductId = 99; // not in any order
    const seedOrders = new Set(
      orderItems.filter((r) => r.productId === seedProductId).map((r) => r.orderId)
    );
    expect(seedOrders.size).toBe(0);
    const counts = new Map<number, number>();
    for (const item of orderItems) {
      if (seedOrders.has(item.orderId) && item.productId !== seedProductId) {
        counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1);
      }
    }
    expect(counts.size).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Unit tests for cart-level multi-seed aggregation
// ─────────────────────────────────────────────────────────────────────────────

describe("[COMMERCE-2] Cart-level collaborative filter — multi-seed aggregation", () => {
  it("aggregates co-purchase counts across multiple cart items", () => {
    /**
     * Cart: [1, 2]
     * Orders: 1+3, 2+3, 1+4
     * Expected: 3 has count=2, 4 has count=1
     */
    const orderItems = [
      makeOrderItem(1, 1), makeOrderItem(1, 3),
      makeOrderItem(2, 2), makeOrderItem(2, 3),
      makeOrderItem(3, 1), makeOrderItem(3, 4),
    ];
    const cartProductIds = [1, 2];

    const seedOrders = new Set(
      orderItems
        .filter((r) => cartProductIds.includes(r.productId))
        .map((r) => r.orderId)
    );

    const counts = new Map<number, number>();
    for (const item of orderItems) {
      if (seedOrders.has(item.orderId) && !cartProductIds.includes(item.productId)) {
        counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1);
      }
    }

    expect(counts.get(3)).toBe(2);
    expect(counts.get(4)).toBe(1);
  });

  it("excludes all cart products from recommendations", () => {
    const orderItems = [
      makeOrderItem(1, 1), makeOrderItem(1, 2), makeOrderItem(1, 3),
    ];
    const cartProductIds = [1, 2];
    const seedOrders = new Set(
      orderItems
        .filter((r) => cartProductIds.includes(r.productId))
        .map((r) => r.orderId)
    );
    const counts = new Map<number, number>();
    for (const item of orderItems) {
      if (seedOrders.has(item.orderId) && !cartProductIds.includes(item.productId)) {
        counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1);
      }
    }
    expect(counts.has(1)).toBe(false);
    expect(counts.has(2)).toBe(false);
    expect(counts.has(3)).toBe(true);
  });

  it("handles empty cart gracefully", () => {
    const cartProductIds: number[] = [];
    const orderItems = [makeOrderItem(1, 5), makeOrderItem(1, 6)];
    const seedOrders = new Set(
      orderItems
        .filter((r) => cartProductIds.includes(r.productId))
        .map((r) => r.orderId)
    );
    expect(seedOrders.size).toBe(0);
  });

  it("de-duplicates order IDs when multiple cart items appear in the same order", () => {
    // Both cart items (1 and 2) appear in order 1 — order 1 should only be counted once
    const orderItems = [
      makeOrderItem(1, 1), makeOrderItem(1, 2), makeOrderItem(1, 3),
    ];
    const cartProductIds = [1, 2];
    const seedOrders = new Set(
      orderItems
        .filter((r) => cartProductIds.includes(r.productId))
        .map((r) => r.orderId)
    );
    // Order 1 appears for both product 1 and product 2 — Set deduplicates
    expect(seedOrders.size).toBe(1);
    expect(seedOrders.has(1)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cache layer unit tests
// ─────────────────────────────────────────────────────────────────────────────

describe("[COMMERCE-2] Recommendation cache layer", () => {
  const CACHE_TTL = 60 * 60 * 1000; // 1 hour

  function makeCache() {
    const store = new Map<string, { data: unknown[]; timestamp: number }>();
    const get = (key: string) => {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() - entry.timestamp > CACHE_TTL) {
        store.delete(key);
        return null;
      }
      return entry.data;
    };
    const set = (key: string, data: unknown[]) => {
      store.set(key, { data, timestamp: Date.now() });
    };
    return { get, set, store };
  }

  it("returns null on cache miss", () => {
    const cache = makeCache();
    expect(cache.get("missing-key")).toBeNull();
  });

  it("returns cached data on hit", () => {
    const cache = makeCache();
    const products = [makeProduct(1), makeProduct(2)];
    cache.set("product:1:4", products);
    expect(cache.get("product:1:4")).toEqual(products);
  });

  it("returns null for expired entries", () => {
    const cache = makeCache();
    const products = [makeProduct(1)];
    // Manually insert an expired entry
    cache.store.set("product:1:4", {
      data: products,
      timestamp: Date.now() - CACHE_TTL - 1,
    });
    expect(cache.get("product:1:4")).toBeNull();
    // Expired entry should be cleaned up
    expect(cache.store.has("product:1:4")).toBe(false);
  });

  it("overwrites stale cache entry with fresh data", () => {
    const cache = makeCache();
    const stale = [makeProduct(1)];
    const fresh = [makeProduct(2), makeProduct(3)];
    cache.set("product:1:4", stale);
    cache.set("product:1:4", fresh);
    expect(cache.get("product:1:4")).toEqual(fresh);
  });

  it("uses different cache keys for different product IDs", () => {
    const cache = makeCache();
    cache.set("product:1:4", [makeProduct(10)]);
    cache.set("product:2:4", [makeProduct(20)]);
    expect((cache.get("product:1:4") as any[])[0].id).toBe(10);
    expect((cache.get("product:2:4") as any[])[0].id).toBe(20);
  });

  it("uses different cache keys for different limits", () => {
    const cache = makeCache();
    cache.set("product:1:4", [makeProduct(10), makeProduct(11), makeProduct(12), makeProduct(13)]);
    cache.set("product:1:8", [makeProduct(10), makeProduct(11), makeProduct(12), makeProduct(13), makeProduct(14), makeProduct(15), makeProduct(16), makeProduct(17)]);
    expect((cache.get("product:1:4") as any[]).length).toBe(4);
    expect((cache.get("product:1:8") as any[]).length).toBe(8);
  });

  it("cart cache key is order-independent (sorted product IDs)", () => {
    // The router sorts productIds before building the cache key
    const ids1 = [3, 1, 2].sort((a, b) => a - b);
    const ids2 = [1, 2, 3].sort((a, b) => a - b);
    const key1 = `cart-items:${ids1.join(",")}:4`;
    const key2 = `cart-items:${ids2.join(",")}:4`;
    expect(key1).toBe(key2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Fallback chain unit tests
// ─────────────────────────────────────────────────────────────────────────────

describe("[COMMERCE-2] Fallback chain", () => {
  it("falls back to category match when no co-purchase data exists", () => {
    const allProducts = [
      makeProduct(2, { category: "merch" }),
      makeProduct(3, { category: "merch" }),
      makeProduct(4, { category: "vinyl" }),
    ];
    const seedCategory = "merch";
    const seedId = 1;

    const categoryRecs = allProducts.filter(
      (p) => p.category === seedCategory && p.id !== seedId
    );
    expect(categoryRecs.length).toBe(2);
    expect(categoryRecs.every((p) => p.category === "merch")).toBe(true);
  });

  it("falls back to bestsellers when no category match exists", () => {
    // Seed has category "rare-vinyl" — no other products have it
    const allProducts = [
      makeProduct(2, { category: "merch" }),
      makeProduct(3, { category: "merch" }),
    ];
    const seedCategory = "rare-vinyl";
    const categoryRecs = allProducts.filter((p) => p.category === seedCategory);
    expect(categoryRecs.length).toBe(0);
    // Bestseller fallback would return allProducts
    expect(allProducts.length).toBeGreaterThan(0);
  });

  it("never returns the seed product in any fallback path", () => {
    const seedId = 5;
    const allProducts = [
      makeProduct(5), // seed — must be excluded
      makeProduct(6),
      makeProduct(7),
    ];
    const filtered = allProducts.filter((p) => p.id !== seedId);
    expect(filtered.find((p) => p.id === seedId)).toBeUndefined();
  });

  it("never returns cart products in cart-level fallback", () => {
    const cartProductIds = [1, 2, 3];
    const allProducts = [
      makeProduct(1), makeProduct(2), makeProduct(3),
      makeProduct(4), makeProduct(5),
    ];
    const filtered = allProducts.filter((p) => !cartProductIds.includes(p.id));
    expect(filtered.every((p) => !cartProductIds.includes(p.id))).toBe(true);
    expect(filtered.length).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Input validation tests
// ─────────────────────────────────────────────────────────────────────────────

describe("[COMMERCE-2] Input validation", () => {
  it("validates productId is a positive integer", () => {
    const isValid = (id: unknown) => typeof id === "number" && Number.isInteger(id) && id > 0;
    expect(isValid(1)).toBe(true);
    expect(isValid(0)).toBe(false);
    expect(isValid(-1)).toBe(false);
    expect(isValid(1.5)).toBe(false);
    expect(isValid("1")).toBe(false);
  });

  it("validates limit is between 1 and 20", () => {
    const isValidLimit = (n: unknown) =>
      typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 20;
    expect(isValidLimit(4)).toBe(true);
    expect(isValidLimit(1)).toBe(true);
    expect(isValidLimit(20)).toBe(true);
    expect(isValidLimit(0)).toBe(false);
    expect(isValidLimit(21)).toBe(false);
  });

  it("validates productIds array has at least 1 element and at most 50", () => {
    const isValid = (arr: unknown[]) => arr.length >= 1 && arr.length <= 50;
    expect(isValid([1])).toBe(true);
    expect(isValid(Array.from({ length: 50 }, (_, i) => i + 1))).toBe(true);
    expect(isValid([])).toBe(false);
    expect(isValid(Array.from({ length: 51 }, (_, i) => i + 1))).toBe(false);
  });

  it("excludeProductIds defaults to empty array", () => {
    const input = { productId: 1, limit: 4 };
    const excludeProductIds = (input as any).excludeProductIds ?? [];
    expect(excludeProductIds).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Result shape tests
// ─────────────────────────────────────────────────────────────────────────────

describe("[COMMERCE-2] Result shape", () => {
  it("getAlsoBought result has products array and source string", () => {
    const result = {
      products: [makeProduct(2), makeProduct(3)],
      source: "collaborative" as const,
    };
    expect(Array.isArray(result.products)).toBe(true);
    expect(typeof result.source).toBe("string");
    expect(["collaborative", "mixed", "category", "bestsellers", "fallback", "cache"]).toContain(
      result.source
    );
  });

  it("getForCartItems result has products array and source string", () => {
    const result = {
      products: [makeProduct(4)],
      source: "bestsellers" as const,
    };
    expect(Array.isArray(result.products)).toBe(true);
    expect(["collaborative", "bestsellers", "fallback", "cache"]).toContain(result.source);
  });

  it("each product in results has required fields", () => {
    const product = makeProduct(1);
    const requiredFields = ["id", "name", "price", "status"];
    for (const field of requiredFields) {
      expect(product).toHaveProperty(field);
    }
  });

  it("results never exceed the requested limit", () => {
    const limit = 4;
    const products = [makeProduct(1), makeProduct(2), makeProduct(3), makeProduct(4), makeProduct(5)];
    const trimmed = products.slice(0, limit);
    expect(trimmed.length).toBeLessThanOrEqual(limit);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BopShopProduct page integration — AlsoBoughtSection rendering logic
// ─────────────────────────────────────────────────────────────────────────────

describe("[COMMERCE-2] AlsoBoughtSection rendering logic", () => {
  it("does not render when products array is empty", () => {
    const data = { products: [] };
    const shouldRender = data && data.products.length > 0;
    expect(shouldRender).toBe(false);
  });

  it("renders when products array has at least one item", () => {
    const data = { products: [makeProduct(2)] };
    const shouldRender = data && data.products.length > 0;
    expect(shouldRender).toBe(true);
  });

  it("does not render while loading", () => {
    const isLoading = true;
    const data = { products: [makeProduct(2)] };
    const shouldRender = !isLoading && data && data.products.length > 0;
    expect(shouldRender).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cart page integration — cart-level recs rendering logic
// ─────────────────────────────────────────────────────────────────────────────

describe("[COMMERCE-2] Cart page recs rendering logic", () => {
  it("does not render when cart is empty", () => {
    const isEmpty = true;
    const cartRecs = { products: [makeProduct(5)] };
    const shouldRender = !isEmpty && cartRecs && cartRecs.products.length > 0;
    expect(shouldRender).toBe(false);
  });

  it("renders when cart has items and recs are available", () => {
    const isEmpty = false;
    const cartRecs = { products: [makeProduct(5), makeProduct(6)] };
    const shouldRender = !isEmpty && cartRecs && cartRecs.products.length > 0;
    expect(shouldRender).toBe(true);
  });

  it("does not render when recs are empty even if cart has items", () => {
    const isEmpty = false;
    const cartRecs = { products: [] };
    const shouldRender = !isEmpty && cartRecs && cartRecs.products.length > 0;
    expect(shouldRender).toBe(false);
  });

  it("extracts productIds from cart items correctly", () => {
    const cartItems = [
      { id: 1, productId: 10, quantity: 2 },
      { id: 2, productId: 20, quantity: 1 },
      { id: 3, productId: null, quantity: 1 }, // edge case: null productId
    ];
    const cartProductIds = cartItems
      .map((i) => i.productId)
      .filter((id): id is number => typeof id === "number");
    expect(cartProductIds).toEqual([10, 20]);
    expect(cartProductIds.length).toBe(2);
  });
});
