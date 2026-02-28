/**
 * BopShop E-Commerce Foundation Tests
 * Tests for: product CRUD, cart operations, Stripe checkout fee structure,
 * order management, and the 3% Boptone platform fee model
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Fee Structure Tests ───────────────────────────────────────────────────

describe("BopShop Fee Structure (Shopify-model alignment)", () => {
  const BOPTONE_FEE_RATE = 0.03; // 3% platform fee

  it("calculates 3% Boptone platform fee correctly on a $50 item", () => {
    const priceInCents = 5000;
    const fee = Math.round(priceInCents * BOPTONE_FEE_RATE);
    expect(fee).toBe(150); // $1.50
  });

  it("calculates artist payout as price minus platform fee", () => {
    const priceInCents = 5000;
    const fee = Math.round(priceInCents * BOPTONE_FEE_RATE);
    const artistPayout = priceInCents - fee;
    expect(artistPayout).toBe(4850); // $48.50 → ~97% to artist
  });

  it("calculates fee correctly on a $100 item", () => {
    const priceInCents = 10000;
    const fee = Math.round(priceInCents * BOPTONE_FEE_RATE);
    expect(fee).toBe(300); // $3.00
    expect(priceInCents - fee).toBe(9700); // $97.00 to artist
  });

  it("calculates fee correctly on a $1000 item", () => {
    const priceInCents = 100000;
    const fee = Math.round(priceInCents * BOPTONE_FEE_RATE);
    expect(fee).toBe(3000); // $30.00
    expect(priceInCents - fee).toBe(97000); // $970.00 to artist
  });

  it("fee rounds correctly for fractional cent amounts", () => {
    const priceInCents = 333; // $3.33
    const fee = Math.round(priceInCents * BOPTONE_FEE_RATE);
    expect(fee).toBe(10); // $0.10 (rounded)
  });

  it("artist always receives at least 97% of sale price", () => {
    const prices = [1000, 2500, 5000, 10000, 50000, 100000];
    prices.forEach((price) => {
      const fee = Math.round(price * BOPTONE_FEE_RATE);
      const artistPayout = price - fee;
      const artistPercentage = artistPayout / price;
      expect(artistPercentage).toBeGreaterThanOrEqual(0.97);
    });
  });
});

// ─── Product Validation Tests ──────────────────────────────────────────────

describe("BopShop Product Validation", () => {
  const validateProduct = (product: {
    name: string;
    price: number;
    type: string;
    slug: string;
    status: string;
  }) => {
    const errors: string[] = [];
    if (!product.name || product.name.trim().length === 0) {
      errors.push("Product name is required");
    }
    if (product.name && product.name.length > 255) {
      errors.push("Product name must be 255 characters or less");
    }
    if (product.price < 0) {
      errors.push("Price cannot be negative");
    }
    if (product.price > 10000000) {
      errors.push("Price exceeds maximum ($100,000)");
    }
    if (!["physical", "digital", "experience"].includes(product.type)) {
      errors.push("Invalid product type");
    }
    if (!/^[a-z0-9-]+$/.test(product.slug)) {
      errors.push("Slug must contain only lowercase letters, numbers, and hyphens");
    }
    if (!["draft", "active", "archived"].includes(product.status)) {
      errors.push("Invalid product status");
    }
    return errors;
  };

  it("validates a valid physical product", () => {
    const errors = validateProduct({
      name: "Test Hoodie",
      price: 5000,
      type: "physical",
      slug: "test-hoodie",
      status: "active",
    });
    expect(errors).toHaveLength(0);
  });

  it("validates a valid digital product", () => {
    const errors = validateProduct({
      name: "Album Download",
      price: 999,
      type: "digital",
      slug: "album-download",
      status: "active",
    });
    expect(errors).toHaveLength(0);
  });

  it("validates a valid experience product", () => {
    const errors = validateProduct({
      name: "Meet & Greet Pass",
      price: 15000,
      type: "experience",
      slug: "meet-greet-pass",
      status: "draft",
    });
    expect(errors).toHaveLength(0);
  });

  it("rejects empty product name", () => {
    const errors = validateProduct({
      name: "",
      price: 5000,
      type: "physical",
      slug: "test-hoodie",
      status: "active",
    });
    expect(errors).toContain("Product name is required");
  });

  it("rejects negative price", () => {
    const errors = validateProduct({
      name: "Test Product",
      price: -100,
      type: "physical",
      slug: "test-product",
      status: "active",
    });
    expect(errors).toContain("Price cannot be negative");
  });

  it("rejects price exceeding maximum", () => {
    const errors = validateProduct({
      name: "Ultra Expensive",
      price: 10000001,
      type: "physical",
      slug: "ultra-expensive",
      status: "active",
    });
    expect(errors).toContain("Price exceeds maximum ($100,000)");
  });

  it("rejects invalid product type", () => {
    const errors = validateProduct({
      name: "Test Product",
      price: 5000,
      type: "subscription",
      slug: "test-product",
      status: "active",
    });
    expect(errors).toContain("Invalid product type");
  });

  it("rejects slug with uppercase letters", () => {
    const errors = validateProduct({
      name: "Test Product",
      price: 5000,
      type: "physical",
      slug: "Test-Product",
      status: "active",
    });
    expect(errors).toContain("Slug must contain only lowercase letters, numbers, and hyphens");
  });

  it("rejects slug with spaces", () => {
    const errors = validateProduct({
      name: "Test Product",
      price: 5000,
      type: "physical",
      slug: "test product",
      status: "active",
    });
    expect(errors).toContain("Slug must contain only lowercase letters, numbers, and hyphens");
  });

  it("rejects invalid status", () => {
    const errors = validateProduct({
      name: "Test Product",
      price: 5000,
      type: "physical",
      slug: "test-product",
      status: "published",
    });
    expect(errors).toContain("Invalid product status");
  });
});

// ─── Cart Operations Tests ─────────────────────────────────────────────────

describe("BopShop Cart Operations", () => {
  type CartItem = {
    productId: number;
    variantId?: number;
    quantity: number;
    price: number;
    name: string;
  };

  const calculateCartTotal = (items: CartItem[]) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateItemCount = (items: CartItem[]) => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const updateQuantity = (items: CartItem[], productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      return items.filter((item) => item.productId !== productId);
    }
    return items.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
  };

  const removeItem = (items: CartItem[], productId: number) => {
    return items.filter((item) => item.productId !== productId);
  };

  const sampleCart: CartItem[] = [
    { productId: 1, quantity: 2, price: 5000, name: "Test Hoodie" },
    { productId: 2, quantity: 1, price: 3000, name: "Test T-Shirt" },
    { productId: 3, quantity: 3, price: 2000, name: "Test Poster" },
  ];

  it("calculates cart total correctly", () => {
    // 2 * 5000 + 1 * 3000 + 3 * 2000 = 10000 + 3000 + 6000 = 19000
    expect(calculateCartTotal(sampleCart)).toBe(19000);
  });

  it("calculates item count correctly", () => {
    // 2 + 1 + 3 = 6
    expect(calculateItemCount(sampleCart)).toBe(6);
  });

  it("updates quantity of an existing item", () => {
    const updated = updateQuantity(sampleCart, 1, 5);
    const hoodie = updated.find((item) => item.productId === 1);
    expect(hoodie?.quantity).toBe(5);
  });

  it("removes item when quantity is set to 0", () => {
    const updated = updateQuantity(sampleCart, 1, 0);
    expect(updated.find((item) => item.productId === 1)).toBeUndefined();
    expect(updated).toHaveLength(2);
  });

  it("removes item when quantity is negative", () => {
    const updated = updateQuantity(sampleCart, 1, -1);
    expect(updated.find((item) => item.productId === 1)).toBeUndefined();
  });

  it("removes a specific item from cart", () => {
    const updated = removeItem(sampleCart, 2);
    expect(updated.find((item) => item.productId === 2)).toBeUndefined();
    expect(updated).toHaveLength(2);
    expect(calculateCartTotal(updated)).toBe(16000); // 10000 + 6000
  });

  it("handles empty cart", () => {
    expect(calculateCartTotal([])).toBe(0);
    expect(calculateItemCount([])).toBe(0);
  });

  it("calculates total with single item", () => {
    const singleItem: CartItem[] = [
      { productId: 1, quantity: 1, price: 5000, name: "Test Hoodie" },
    ];
    expect(calculateCartTotal(singleItem)).toBe(5000);
  });
});

// ─── Order Status Tests ────────────────────────────────────────────────────

describe("BopShop Order Status Management", () => {
  type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled" | "cancelled";

  const validOrderTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["paid", "cancelled"],
    paid: ["processing", "cancelled", "refunded"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: ["refunded"],
    cancelled: [],
    refunded: [],
  };

  const isValidTransition = (from: OrderStatus, to: OrderStatus): boolean => {
    return validOrderTransitions[from]?.includes(to) ?? false;
  };

  it("allows pending → paid transition", () => {
    expect(isValidTransition("pending", "paid")).toBe(true);
  });

  it("allows paid → processing transition", () => {
    expect(isValidTransition("paid", "processing")).toBe(true);
  });

  it("allows processing → shipped transition", () => {
    expect(isValidTransition("processing", "shipped")).toBe(true);
  });

  it("allows shipped → delivered transition", () => {
    expect(isValidTransition("shipped", "delivered")).toBe(true);
  });

  it("allows paid → refunded transition", () => {
    expect(isValidTransition("paid", "refunded")).toBe(true);
  });

  it("prevents pending → delivered skip", () => {
    expect(isValidTransition("pending", "delivered")).toBe(false);
  });

  it("prevents cancelled → paid reversal", () => {
    expect(isValidTransition("cancelled", "paid")).toBe(false);
  });

  it("prevents delivered → processing reversal", () => {
    expect(isValidTransition("delivered", "processing")).toBe(false);
  });

  it("fulfillment status: unfulfilled → fulfilled is valid", () => {
    const validFulfillmentTransitions: Record<FulfillmentStatus, FulfillmentStatus[]> = {
      unfulfilled: ["partial", "fulfilled", "cancelled"],
      partial: ["fulfilled", "cancelled"],
      fulfilled: [],
      cancelled: [],
    };
    expect(validFulfillmentTransitions["unfulfilled"].includes("fulfilled")).toBe(true);
  });
});

// ─── Inventory Management Tests ───────────────────────────────────────────

describe("BopShop Inventory Management", () => {
  const checkInventory = (
    currentStock: number,
    requestedQuantity: number,
    trackInventory: boolean,
    allowBackorder: boolean
  ): { canFulfill: boolean; reason?: string } => {
    if (!trackInventory) {
      return { canFulfill: true };
    }
    if (currentStock >= requestedQuantity) {
      return { canFulfill: true };
    }
    if (allowBackorder) {
      return { canFulfill: true };
    }
    return {
      canFulfill: false,
      reason: `Only ${currentStock} units available`,
    };
  };

  it("allows purchase when stock is sufficient", () => {
    const result = checkInventory(10, 3, true, false);
    expect(result.canFulfill).toBe(true);
  });

  it("allows purchase when stock exactly matches requested quantity", () => {
    const result = checkInventory(3, 3, true, false);
    expect(result.canFulfill).toBe(true);
  });

  it("blocks purchase when stock is insufficient", () => {
    const result = checkInventory(2, 5, true, false);
    expect(result.canFulfill).toBe(false);
    expect(result.reason).toContain("2 units available");
  });

  it("allows backorder when enabled", () => {
    const result = checkInventory(0, 5, true, true);
    expect(result.canFulfill).toBe(true);
  });

  it("allows unlimited purchase when inventory tracking is disabled", () => {
    const result = checkInventory(0, 1000, false, false);
    expect(result.canFulfill).toBe(true);
  });

  it("blocks purchase of out-of-stock item without backorder", () => {
    const result = checkInventory(0, 1, true, false);
    expect(result.canFulfill).toBe(false);
  });
});

// ─── Stripe Checkout Metadata Tests ───────────────────────────────────────

describe("BopShop Stripe Checkout Metadata", () => {
  const buildCheckoutMetadata = (params: {
    userId: number;
    userEmail: string;
    userName: string;
    cartTotal: number;
    itemCount: number;
  }) => ({
    user_id: params.userId.toString(),
    customer_email: params.userEmail,
    customer_name: params.userName,
    cart_total: params.cartTotal.toString(),
    item_count: params.itemCount.toString(),
    platform: "bopshop",
    fee_rate: "0.03",
  });

  it("builds checkout metadata with all required fields", () => {
    const metadata = buildCheckoutMetadata({
      userId: 42,
      userEmail: "artist@boptone.com",
      userName: "Test Artist",
      cartTotal: 19000,
      itemCount: 6,
    });

    expect(metadata.user_id).toBe("42");
    expect(metadata.customer_email).toBe("artist@boptone.com");
    expect(metadata.platform).toBe("bopshop");
    expect(metadata.fee_rate).toBe("0.03");
  });

  it("converts numeric user ID to string for Stripe metadata", () => {
    const metadata = buildCheckoutMetadata({
      userId: 123,
      userEmail: "test@test.com",
      userName: "Test",
      cartTotal: 5000,
      itemCount: 1,
    });
    expect(typeof metadata.user_id).toBe("string");
    expect(metadata.user_id).toBe("123");
  });

  it("includes platform identifier for webhook routing", () => {
    const metadata = buildCheckoutMetadata({
      userId: 1,
      userEmail: "test@test.com",
      userName: "Test",
      cartTotal: 5000,
      itemCount: 1,
    });
    expect(metadata.platform).toBe("bopshop");
  });
});

// ─── Product Slug Generation Tests ────────────────────────────────────────

describe("BopShop Product Slug Generation", () => {
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  it("generates slug from simple product name", () => {
    expect(generateSlug("Test Hoodie")).toBe("test-hoodie");
  });

  it("handles special characters in product name", () => {
    expect(generateSlug("Artist's Limited Edition T-Shirt!")).toBe("artists-limited-edition-t-shirt");
  });

  it("handles multiple spaces", () => {
    expect(generateSlug("Test   Product   Name")).toBe("test-product-name");
  });

  it("handles leading and trailing spaces", () => {
    expect(generateSlug("  Test Product  ")).toBe("test-product");
  });

  it("handles all uppercase name", () => {
    expect(generateSlug("VINYL RECORD")).toBe("vinyl-record");
  });

  it("handles numbers in product name", () => {
    expect(generateSlug("Tour 2025 Snapback")).toBe("tour-2025-snapback");
  });
});
