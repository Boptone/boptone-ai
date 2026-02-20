import { eq, and, desc, sql, inArray, lt } from "drizzle-orm";
import { getDb } from "./db";
import {
  products,
  productVariants,
  cartItems,
  orders,
  orderItems,
  shippingRates,
  discountCodes,
  productReviews,
  type Product,
  type InsertProduct,
  type ProductVariant,
  type InsertProductVariant,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type ShippingRate,
  type InsertShippingRate,
  type DiscountCode,
  type InsertDiscountCode,
  type ProductReview,
  type InsertProductReview,
} from "../drizzle/schema";

/**
 * E-COMMERCE DATABASE HELPERS
 * All functions return raw Drizzle results
 */

// ============================================================================
// PRODUCTS
// ============================================================================

export async function createProduct(product: InsertProduct): Promise<Product> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(products).values(product);
  const [newProduct] = await db.select().from(products).where(eq(products.id, Number(result.insertId)));
  return newProduct;
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [product] = await db.select().from(products).where(eq(products.slug, slug));
  return product;
}

export async function getProductsByArtist(artistId: number, status?: string): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(products.artistId, artistId)];
  if (status) {
    conditions.push(eq(products.status, status as any));
  }
  
  return await db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
}

export async function getAllActiveProducts(limit: number = 50): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(products)
    .where(eq(products.status, "active"))
    .orderBy(desc(products.featured), desc(products.createdAt))
    .limit(limit);
}

/**
 * Get active products with cursor-based pagination for infinite scroll
 * Returns products and next cursor for loading more
 */
export async function getActiveProductsPaginated(
  limit: number = 20,
  cursor?: number
): Promise<{ products: Product[]; nextCursor: number | null }> {
  const db = await getDb();
  if (!db) return { products: [], nextCursor: null };
  
  const conditions = [eq(products.status, "active")];
  if (cursor) {
    conditions.push(lt(products.id, cursor));
  }
  
  // Fetch limit + 1 to determine if there are more products
  const results = await db.select().from(products)
    .where(and(...conditions))
    .orderBy(desc(products.featured), desc(products.id))
    .limit(limit + 1);
  
  const hasMore = results.length > limit;
  const productsToReturn = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore && productsToReturn.length > 0 
    ? productsToReturn[productsToReturn.length - 1].id 
    : null;
  
  return {
    products: productsToReturn,
    nextCursor,
  };
}

export async function updateProduct(id: number, updates: Partial<InsertProduct>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(products).set(updates).where(eq(products.id, id));
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(products).where(eq(products.id, id));
}

// ============================================================================
// PRODUCT VARIANTS
// ============================================================================

export async function createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(productVariants).values(variant);
  const [newVariant] = await db.select().from(productVariants).where(eq(productVariants.id, Number(result.insertId)));
  return newVariant;
}

export async function getVariantsByProduct(productId: number): Promise<ProductVariant[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(productVariants).where(eq(productVariants.productId, productId));
}

export async function updateVariant(id: number, updates: Partial<InsertProductVariant>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(productVariants).set(updates).where(eq(productVariants.id, id));
}

// ============================================================================
// SHOPPING CART
// ============================================================================

export async function addToCart(item: InsertCartItem): Promise<CartItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if item already exists in cart
  const existing = await db.select().from(cartItems).where(
    and(
      eq(cartItems.userId, item.userId),
      eq(cartItems.productId, item.productId),
      item.variantId ? eq(cartItems.variantId, item.variantId) : sql`${cartItems.variantId} IS NULL`
    )
  );
  
  if (existing.length > 0) {
    // Update quantity
    const newQuantity = existing[0].quantity + (item.quantity || 1);
    await db.update(cartItems)
      .set({ quantity: newQuantity })
      .where(eq(cartItems.id, existing[0].id));
    
    const [updated] = await db.select().from(cartItems).where(eq(cartItems.id, existing[0].id));
    return updated;
  } else {
    // Insert new item
    const [result] = await db.insert(cartItems).values(item);
    const [newItem] = await db.select().from(cartItems).where(eq(cartItems.id, Number(result.insertId)));
    return newItem;
  }
}

export async function getCartByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Join cart items with products to get product details
  const items = await db
    .select({
      id: cartItems.id,
      userId: cartItems.userId,
      productId: cartItems.productId,
      variantId: cartItems.variantId,
      quantity: cartItems.quantity,
      priceAtAdd: cartItems.priceAtAdd,
      createdAt: cartItems.createdAt,
      updatedAt: cartItems.updatedAt,
      product: products,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));
  
  return items;
}

export async function updateCartItem(id: number, quantity: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
  }
}

export async function removeFromCart(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ============================================================================
// ORDERS
// ============================================================================

export async function createOrder(order: InsertOrder): Promise<Order> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(orders).values(order);
  const [newOrder] = await db.select().from(orders).where(eq(orders.id, Number(result.insertId)));
  return newOrder;
}

export async function getOrderById(id: number): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  return order;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
  return order;
}

export async function getOrdersByCustomer(customerId: number): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersByArtist(artistId: number, fulfillmentStatus?: string): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(orders.artistId, artistId)];
  if (fulfillmentStatus) {
    conditions.push(eq(orders.fulfillmentStatus, fulfillmentStatus as any));
  }
  
  return await db.select().from(orders)
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt));
}

export async function updateOrder(id: number, updates: Partial<InsertOrder>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orders).set(updates).where(eq(orders.id, id));
}

// ============================================================================
// ORDER ITEMS
// ============================================================================

export async function createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(orderItems).values(item);
  const [newItem] = await db.select().from(orderItems).where(eq(orderItems.id, Number(result.insertId)));
  return newItem;
}

export async function getOrderItemsByOrder(orderId: number): Promise<OrderItem[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function updateOrderItem(id: number, updates: Partial<InsertOrderItem>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orderItems).set(updates).where(eq(orderItems.id, id));
}

// ============================================================================
// SHIPPING RATES
// ============================================================================

export async function createShippingRate(rate: InsertShippingRate): Promise<ShippingRate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(shippingRates).values(rate);
  const [newRate] = await db.select().from(shippingRates).where(eq(shippingRates.id, Number(result.insertId)));
  return newRate;
}

export async function getShippingRatesByArtist(artistId: number): Promise<ShippingRate[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(shippingRates)
    .where(and(eq(shippingRates.artistId, artistId), eq(shippingRates.active, true)));
}

// ============================================================================
// DISCOUNT CODES
// ============================================================================

export async function createDiscountCode(code: InsertDiscountCode): Promise<DiscountCode> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(discountCodes).values(code);
  const [newCode] = await db.select().from(discountCodes).where(eq(discountCodes.id, Number(result.insertId)));
  return newCode;
}

export async function getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [discount] = await db.select().from(discountCodes).where(eq(discountCodes.code, code.toUpperCase()));
  return discount;
}

export async function getDiscountCodesByArtist(artistId: number): Promise<DiscountCode[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(discountCodes)
    .where(eq(discountCodes.artistId, artistId))
    .orderBy(desc(discountCodes.createdAt));
}

export async function updateDiscountCode(id: number, updates: Partial<InsertDiscountCode>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(discountCodes).set(updates).where(eq(discountCodes.id, id));
}

// ============================================================================
// PRODUCT REVIEWS
// ============================================================================

export async function createProductReview(review: InsertProductReview): Promise<ProductReview> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(productReviews).values(review);
  const [newReview] = await db.select().from(productReviews).where(eq(productReviews.id, Number(result.insertId)));
  return newReview;
}

export async function getReviewsByProduct(productId: number, status: string = "approved"): Promise<ProductReview[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.status, status as any)))
    .orderBy(desc(productReviews.createdAt));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BOP-${timestamp}-${random}`;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function calculateOrderTotal(subtotal: number, taxAmount: number, shippingAmount: number, discountAmount: number): number {
  return subtotal + taxAmount + shippingAmount - discountAmount;
}
