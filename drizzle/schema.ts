import { int, bigint, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, index, uniqueIndex, date } from "drizzle-orm/mysql-core";

/**
 * BOPTONE DATABASE SCHEMA
 * Complete schema for the autonomous creator OS platform
 */

// ============================================================================
// CORE USER & AUTH
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["artist", "manager", "admin"]).default("artist").notNull(),
  // Stripe Connect fields for artist payouts
  stripeConnectAccountId: varchar("stripe_connect_account_id", { length: 255 }),
  stripeConnectOnboardingComplete: int("stripe_connect_onboarding_complete").default(0).notNull(), // 0 = not started, 1 = complete
  stripeConnectChargesEnabled: int("stripe_connect_charges_enabled").default(0).notNull(),
  stripeConnectPayoutsEnabled: int("stripe_connect_payouts_enabled").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// AUDIT LOGS
// ============================================================================

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "order.created", "profile.updated"
  entityType: varchar("entityType", { length: 50 }).notNull(), // e.g., "order", "product", "user"
  entityId: int("entityId"), // ID of the affected entity
  changes: json("changes").$type<Record<string, any>>(), // Before/after values
  metadata: json("metadata").$type<Record<string, any>>(), // Additional context
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  actionIdx: index("action_idx").on(table.action),
  entityIdx: index("entity_idx").on(table.entityType, table.entityId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ============================================================================
// ARTIST PROFILES
// ============================================================================

export const artistProfiles = mysqlTable("artist_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  stageName: varchar("stageName", { length: 255 }).notNull(),
  bio: text("bio"),
  genres: json("genres").$type<string[]>(), // ["hip-hop", "r&b", etc.]
  location: varchar("location", { length: 255 }),
  careerPhase: mysqlEnum("careerPhase", ["discovery", "development", "launch", "scale"]).default("discovery").notNull(),
  priorityScore: decimal("priorityScore", { precision: 3, scale: 2 }).default("0.00"), // 0.00 to 10.00
  verifiedStatus: boolean("verifiedStatus").default(false).notNull(),
  avatarUrl: text("avatarUrl"),
  coverImageUrl: text("coverImageUrl"),
  socialLinks: json("socialLinks").$type<{
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
    website?: string;
  }>(),
  // Profile Customization
  themeColor: varchar("themeColor", { length: 7 }).default("#0066ff"), // Hex color code
  accentColor: varchar("accentColor", { length: 7 }).default("#00d4aa"),
  layoutStyle: mysqlEnum("layoutStyle", ["default", "minimal", "grid"]).default("default"),
  fontFamily: varchar("fontFamily", { length: 100 }).default("Inter"),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  // BopShop Seller Type & Pricing
  sellerType: mysqlEnum("sellerType", ["music_artist", "visual_artist", "general_creator"]).default("music_artist").notNull(),
  platformFeePercentage: decimal("platformFeePercentage", { precision: 4, scale: 2 }).default("0.00"), // 0.00 to 99.99 (music artists = 0%, visual = 12%, general = 15%)
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "pro", "premium"]).default("free").notNull(),
  metadata: json("metadata").$type<{
    stripeAccountId?: string;
    [key: string]: any;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type ArtistProfile = typeof artistProfiles.$inferSelect;
export type InsertArtistProfile = typeof artistProfiles.$inferInsert;

// ============================================================================
// STREAMING METRICS
// ============================================================================

export const streamingMetrics = mysqlTable("streaming_metrics", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  platform: mysqlEnum("platform", ["spotify", "apple_music", "youtube_music", "amazon_music", "tidal", "soundcloud"]).notNull(),
  metricType: mysqlEnum("metricType", ["streams", "followers", "monthly_listeners", "saves", "playlist_adds"]).notNull(),
  value: int("value").notNull(),
  growthRate: decimal("growthRate", { precision: 5, scale: 2 }), // Percentage growth
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  artistDateIdx: index("artist_date_idx").on(table.artistId, table.date),
  artistPlatformDateIdx: index("artist_platform_date_idx").on(table.artistId, table.platform, table.date), // Composite index for platform-specific queries
}));

export type StreamingMetric = typeof streamingMetrics.$inferSelect;
export type InsertStreamingMetric = typeof streamingMetrics.$inferInsert;

// ============================================================================
// SOCIAL MEDIA METRICS
// ============================================================================

export const socialMediaMetrics = mysqlTable("social_media_metrics", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "twitter", "youtube", "facebook"]).notNull(),
  followers: int("followers").notNull(),
  engagementRate: decimal("engagementRate", { precision: 5, scale: 2 }), // Percentage
  viralScore: decimal("viralScore", { precision: 5, scale: 2 }), // 0-100 score
  totalPosts: int("totalPosts"),
  averageLikes: int("averageLikes"),
  averageComments: int("averageComments"),
  averageShares: int("averageShares"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  artistDateIdx: index("artist_date_idx").on(table.artistId, table.date),
}));

export type SocialMediaMetric = typeof socialMediaMetrics.$inferSelect;
export type InsertSocialMediaMetric = typeof socialMediaMetrics.$inferInsert;

// ============================================================================
// REVENUE TRACKING
// ============================================================================

export const revenueRecords = mysqlTable("revenue_records", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  source: mysqlEnum("source", ["streaming", "merchandise", "shows", "licensing", "brand_deals", "youtube_ads", "patreon", "other"]).notNull(),
  amount: int("amount").notNull(), // Store in cents to avoid decimal issues
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "paid", "disputed", "cancelled"]).default("pending").notNull(),
  paymentDate: timestamp("paymentDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  artistSourceIdx: index("artist_source_idx").on(table.artistId, table.source), // Composite index for revenue source queries
}));

export type RevenueRecord = typeof revenueRecords.$inferSelect;
export type InsertRevenueRecord = typeof revenueRecords.$inferInsert;

// ============================================================================
// MICRO-LOANS (ROYALTY-BACKED)
// ============================================================================

export const microLoans = mysqlTable("micro_loans", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  amount: int("amount").notNull(), // In cents
  interestRate: decimal("interestRate", { precision: 5, scale: 2 }).notNull(), // Percentage
  repaymentTermMonths: int("repaymentTermMonths").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "active", "paid", "defaulted", "rejected"]).default("pending").notNull(),
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }), // 0-100 risk score
  collateralType: varchar("collateralType", { length: 100 }).default("future_royalties").notNull(),
  approvedAt: timestamp("approvedAt"),
  disbursedAt: timestamp("disbursedAt"),
  paidOffAt: timestamp("paidOffAt"),
  monthlyPayment: int("monthlyPayment"), // In cents
  remainingBalance: int("remainingBalance"), // In cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
}));

export type MicroLoan = typeof microLoans.$inferSelect;
export type InsertMicroLoan = typeof microLoans.$inferInsert;

// ============================================================================
// E-COMMERCE SYSTEM (Shopify-level)
// ============================================================================

// Products - Main product catalog
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  type: mysqlEnum("type", ["physical", "digital", "experience"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull(), // In cents
  compareAtPrice: int("compareAtPrice"), // Original price for discounts, in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  // Inventory
  sku: varchar("sku", { length: 100 }),
  inventoryQuantity: int("inventoryQuantity").default(0).notNull(),
  trackInventory: boolean("trackInventory").default(true).notNull(),
  allowBackorder: boolean("allowBackorder").default(false).notNull(),
  
  // Digital product fields
  digitalFileUrl: varchar("digitalFileUrl", { length: 500 }),
  digitalFileSize: int("digitalFileSize"), // Bytes
  downloadLimit: int("downloadLimit"), // null = unlimited
  
  // Experience/ticket fields
  eventDate: timestamp("eventDate"),
  eventLocation: varchar("eventLocation", { length: 255 }),
  maxAttendees: int("maxAttendees"),
  
  // Media
  images: json("images").$type<Array<{url: string; alt?: string; position: number}>>(),
  primaryImageUrl: varchar("primaryImageUrl", { length: 500 }),
  
  // SEO & Discovery
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  tags: json("tags").$type<string[]>(), // ["t-shirt", "black", "cotton"]
  category: varchar("category", { length: 100 }),
  
  // Shipping
  requiresShipping: boolean("requiresShipping").default(false).notNull(),
  weight: decimal("weight", { precision: 8, scale: 2 }), // Pounds
  weightUnit: varchar("weightUnit", { length: 10 }).default("lb"),
  
  // Status
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  featured: boolean("featured").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"), // Soft delete - null means not deleted
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  statusIdx: index("status_idx").on(table.status),
  typeIdx: index("type_idx").on(table.type),
  slugIdx: index("slug_idx").on(table.slug),
  createdAtIdx: index("created_at_idx").on(table.createdAt), // Index for "new arrivals" sorting
  featuredIdx: index("featured_idx").on(table.featured), // Index for featured products
  artistStatusIdx: index("artist_status_idx").on(table.artistId, table.status), // Composite index for artist product queries
  statusCreatedAtIdx: index("status_created_at_idx").on(table.status, table.createdAt), // Composite for active products sorted by date
  deletedAtIdx: index("deleted_at_idx").on(table.deletedAt), // Index for filtering soft-deleted records
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Product Variants - For products with multiple options (sizes, colors, etc.)
export const productVariants = mysqlTable("product_variants", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Small / Black"
  sku: varchar("sku", { length: 100 }),
  price: int("price"), // Override product price if different, in cents
  compareAtPrice: int("compareAtPrice"),
  
  // Options
  option1: varchar("option1", { length: 100 }), // e.g., "Small"
  option2: varchar("option2", { length: 100 }), // e.g., "Black"
  option3: varchar("option3", { length: 100 }),
  
  // Inventory
  inventoryQuantity: int("inventoryQuantity").default(0).notNull(),
  
  // Media
  imageUrl: varchar("imageUrl", { length: 500 }),
  
  // Status
  available: boolean("available").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  productIdIdx: index("product_id_idx").on(table.productId),
}));

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

// Shopping Cart Items
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  productId: int("productId").notNull().references(() => products.id),
  variantId: int("variantId").references(() => productVariants.id),
  quantity: int("quantity").default(1).notNull(),
  priceAtAdd: int("priceAtAdd").notNull(), // Price when added, in cents
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"), // Soft delete - null means not deleted
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  userProductIdx: index("user_product_idx").on(table.userId, table.productId), // Composite index for cart queries
  deletedAtIdx: index("deleted_at_idx").on(table.deletedAt), // Index for filtering soft-deleted records
}));

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// Wishlists
export const wishlists = mysqlTable("wishlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  productId: int("productId").notNull().references(() => products.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  userProductIdx: index("user_product_idx").on(table.userId, table.productId), // Composite index for wishlist queries
  uniqueUserProduct: index("unique_user_product").on(table.userId, table.productId), // Prevent duplicate wishlist entries
}));

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;

// Orders
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  
  // Parties
  customerId: int("customerId").notNull().references(() => users.id),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  
  // Pricing (all in cents)
  subtotal: int("subtotal").notNull(),
  taxAmount: int("taxAmount").default(0).notNull(),
  taxJurisdiction: varchar("taxJurisdiction", { length: 100 }), // State/country where tax was collected (e.g., "US-CA", "GB")
  shippingAmount: int("shippingAmount").default(0).notNull(),
  discountAmount: int("discountAmount").default(0).notNull(),
  total: int("total").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  // Payment
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded", "partially_refunded"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // 'stripe', 'paypal', 'venmo'
  paymentIntentId: varchar("paymentIntentId", { length: 255 }),
  paidAt: timestamp("paidAt"),
  
  // Fulfillment
  fulfillmentStatus: mysqlEnum("fulfillmentStatus", ["unfulfilled", "partial", "fulfilled", "cancelled"]).default("unfulfilled").notNull(),
  shippingMethod: varchar("shippingMethod", { length: 100 }),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  trackingUrl: varchar("trackingUrl", { length: 500 }),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
  
  // Addresses
  shippingAddress: json("shippingAddress").$type<{
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
  }>(),
  billingAddress: json("billingAddress").$type<{
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>(),
  
  // Customer info
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 50 }),
  
  // Notes
  customerNote: text("customerNote"),
  internalNote: text("internalNote"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  cancelledAt: timestamp("cancelledAt"),
  cancellationReason: text("cancellationReason"),
  deletedAt: timestamp("deletedAt"), // Soft delete - null means not deleted
}, (table) => ({
  customerIdIdx: index("customer_id_idx").on(table.customerId),
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  orderNumberIdx: index("order_number_idx").on(table.orderNumber),
  paymentStatusIdx: index("payment_status_idx").on(table.paymentStatus),
  fulfillmentStatusIdx: index("fulfillment_status_idx").on(table.fulfillmentStatus),
  createdAtIdx: index("created_at_idx").on(table.createdAt), // Index for sorting by date
  artistPaymentStatusIdx: index("artist_payment_status_idx").on(table.artistId, table.paymentStatus), // Composite index for artist order queries
  customerCreatedAtIdx: index("customer_created_at_idx").on(table.customerId, table.createdAt), // Composite for user order history
  deletedAtIdx: index("deleted_at_idx").on(table.deletedAt), // Index for filtering soft-deleted records
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ============================================================================
// SHIPPING LABELS & TRACKING
// ============================================================================

export const shippingLabels = mysqlTable("shipping_labels", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
  
  // Shippo IDs
  shipmentId: varchar("shipmentId", { length: 255 }).notNull(), // Shippo shipment object_id
  rateId: varchar("rateId", { length: 255 }).notNull(), // Selected rate object_id
  transactionId: varchar("transactionId", { length: 255 }), // Shippo transaction object_id (after purchase)
  
  // Carrier info
  carrier: varchar("carrier", { length: 100 }), // USPS, FedEx, UPS, DHL
  service: varchar("service", { length: 100 }), // Priority Mail, Ground, etc.
  
  // Tracking
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  trackingUrl: text("trackingUrl"),
  
  // Label
  labelUrl: text("labelUrl"), // URL to PDF label
  
  // Cost
  cost: decimal("cost", { precision: 10, scale: 2 }), // Shipping cost
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Status
  status: mysqlEnum("status", ["pending", "purchased", "printed", "shipped", "delivered", "failed"]).default("pending").notNull(),
  
  // Addresses and parcel (stored for reference)
  addressFrom: json("addressFrom").$type<{
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>(),
  addressTo: json("addressTo").$type<{
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>(),
  parcel: json("parcel").$type<{
    length: number;
    width: number;
    height: number;
    weight: number;
    distanceUnit: string;
    massUnit: string;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orderIdIdx: index("order_id_idx").on(table.orderId),
  trackingNumberIdx: index("tracking_number_idx").on(table.trackingNumber),
  statusIdx: index("status_idx").on(table.status),
}));

export type ShippingLabel = typeof shippingLabels.$inferSelect;
export type InsertShippingLabel = typeof shippingLabels.$inferInsert;

export const trackingEvents = mysqlTable("tracking_events", {
  id: int("id").autoincrement().primaryKey(),
  shippingLabelId: int("shippingLabelId").notNull().references(() => shippingLabels.id, { onDelete: "cascade" }),
  
  status: varchar("status", { length: 50 }), // TRANSIT, OUT_FOR_DELIVERY, DELIVERED, etc.
  statusDetails: text("statusDetails"),
  location: json("location").$type<{
    city?: string;
    state?: string;
    country?: string;
  }>(),
  eventDate: timestamp("eventDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  shippingLabelIdIdx: index("shipping_label_id_idx").on(table.shippingLabelId),
  statusIdx: index("status_idx").on(table.status),
}));

export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type InsertTrackingEvent = typeof trackingEvents.$inferInsert;

// Order Items
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id),
  productId: int("productId").notNull().references(() => products.id),
  variantId: int("variantId").references(() => productVariants.id),
  
  // Snapshot data (preserve even if product deleted/changed)
  productName: varchar("productName", { length: 255 }).notNull(),
  variantName: varchar("variantName", { length: 255 }),
  productType: mysqlEnum("productType", ["physical", "digital", "experience"]).notNull(),
  sku: varchar("sku", { length: 100 }),
  
  // Pricing (in cents)
  quantity: int("quantity").notNull(),
  pricePerUnit: int("pricePerUnit").notNull(),
  subtotal: int("subtotal").notNull(),
  taxAmount: int("taxAmount").default(0).notNull(),
  total: int("total").notNull(),
  
  // Digital delivery
  digitalFileUrl: varchar("digitalFileUrl", { length: 500 }),
  downloadCount: int("downloadCount").default(0).notNull(),
  downloadLimit: int("downloadLimit"),
  
  // Fulfillment
  fulfillmentStatus: mysqlEnum("fulfillmentStatus", ["unfulfilled", "fulfilled", "cancelled"]).default("unfulfilled").notNull(),
  fulfilledAt: timestamp("fulfilledAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orderIdIdx: index("order_id_idx").on(table.orderId),
  productIdIdx: index("product_id_idx").on(table.productId),
  variantIdIdx: index("variant_id_idx").on(table.variantId),
  fulfillmentStatusIdx: index("fulfillment_status_idx").on(table.fulfillmentStatus),
}));

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Shipping Rates
export const shippingRates = mysqlTable("shipping_rates", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  
  // Pricing (in cents)
  price: int("price").notNull(),
  freeShippingThreshold: int("freeShippingThreshold"), // Free shipping over $X
  
  // Conditions
  minOrderAmount: int("minOrderAmount"),
  maxOrderAmount: int("maxOrderAmount"),
  
  // Geography
  countries: json("countries").$type<string[]>(), // ['US', 'CA', 'UK']
  
  // Delivery estimate
  minDeliveryDays: int("minDeliveryDays"),
  maxDeliveryDays: int("maxDeliveryDays"),
  
  // Status
  active: boolean("active").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
}));

export type ShippingRate = typeof shippingRates.$inferSelect;
export type InsertShippingRate = typeof shippingRates.$inferInsert;

// Discount Codes
export const discountCodes = mysqlTable("discount_codes", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  code: varchar("code", { length: 50 }).notNull().unique(),
  
  // Discount type
  type: mysqlEnum("type", ["percentage", "fixed_amount", "free_shipping"]).notNull(),
  value: int("value").notNull(), // 20 for 20% off, or 1000 for $10 off (cents)
  
  // Conditions
  minPurchaseAmount: int("minPurchaseAmount"), // In cents
  maxUses: int("maxUses"), // null = unlimited
  maxUsesPerCustomer: int("maxUsesPerCustomer").default(1).notNull(),
  usageCount: int("usageCount").default(0).notNull(),
  
  // Validity
  startsAt: timestamp("startsAt"),
  expiresAt: timestamp("expiresAt"),
  active: boolean("active").default(true).notNull(),
  
  // Applicable products
  appliesToAllProducts: boolean("appliesToAllProducts").default(true).notNull(),
  productIds: json("productIds").$type<number[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  codeIdx: index("code_idx").on(table.code),
}));

export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = typeof discountCodes.$inferInsert;

/**
 * Product Reviews table
 * 
 * Stores customer reviews for BopShop products with ratings, photos, and verified purchase badges.
 * Optimized for Google Review schema and SEO.
 */
export const productReviews = mysqlTable("product_reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id),
  userId: int("userId").notNull().references(() => users.id),
  orderId: int("orderId").references(() => orders.id), // For verified purchase badge
  
  // Review content
  rating: int("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  
  // Verified purchase
  verifiedPurchase: boolean("verifiedPurchase").default(false).notNull(),
  
  // Helpfulness voting
  helpfulVotes: int("helpfulVotes").default(0).notNull(),
  unhelpfulVotes: int("unhelpfulVotes").default(0).notNull(),
  
  // Moderation
  status: mysqlEnum("status", ["pending", "approved", "rejected", "flagged"]).default("approved").notNull(),
  moderationNotes: text("moderationNotes"),
  
  // Metadata
  reviewerName: varchar("reviewerName", { length: 255 }), // Display name (can differ from user.name)
  reviewerLocation: varchar("reviewerLocation", { length: 255 }), // Optional location display
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  productIdIdx: index("product_id_idx").on(table.productId),
  userIdIdx: index("user_id_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
  ratingIdx: index("rating_idx").on(table.rating),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;

/**
 * Review Responses table
 * 
 * Stores seller/artist responses to customer reviews.
 * Builds trust and engagement through public dialogue.
 */
export const reviewResponses = mysqlTable("review_responses", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: int("reviewId").notNull().references(() => productReviews.id),
  userId: int("userId").notNull().references(() => users.id), // Artist/seller who responded
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  reviewIdIdx: index("review_id_idx").on(table.reviewId),
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type ReviewResponse = typeof reviewResponses.$inferSelect;
export type InsertReviewResponse = typeof reviewResponses.$inferInsert;

/**
 * Review Reminder Log table
 * 
 * Tracks sent review reminder emails to prevent duplicates.
 * Automated system sends reminders 7 days after purchase.
 */
export const reviewReminderLog = mysqlTable("review_reminder_log", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id),
  userId: int("userId").notNull().references(() => users.id),
  productId: int("productId").notNull().references(() => products.id),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  emailStatus: mysqlEnum("emailStatus", ["sent", "failed", "bounced"]).default("sent").notNull(),
}, (table) => ({
  orderIdIdx: index("order_id_idx").on(table.orderId),
  userIdIdx: index("user_id_idx").on(table.userId),
  productIdIdx: index("product_id_idx").on(table.productId),
}));

export type ReviewReminderLog = typeof reviewReminderLog.$inferSelect;
export type InsertReviewReminderLog = typeof reviewReminderLog.$inferInsert;

// ============================================================================
// DISTRIBUTION RELEASES
// ============================================================================

export const releases = mysqlTable("releases", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  title: varchar("title", { length: 255 }).notNull(),
  releaseType: mysqlEnum("releaseType", ["single", "ep", "album", "compilation"]).notNull(),
  releaseDate: timestamp("releaseDate").notNull(),
  platforms: json("platforms").$type<string[]>(), // ["spotify", "apple_music", etc.]
  upcCode: varchar("upcCode", { length: 20 }),
  isrcCodes: json("isrcCodes").$type<string[]>(), // Array of ISRC codes for tracks
  artworkUrl: text("artworkUrl"),
  status: mysqlEnum("status", ["draft", "scheduled", "released", "cancelled"]).default("draft").notNull(),
  totalTracks: int("totalTracks"),
  metadata: json("metadata").$type<{
    genre?: string;
    label?: string;
    copyrightYear?: number;
    [key: string]: unknown;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
}));

export type Release = typeof releases.$inferSelect;
export type InsertRelease = typeof releases.$inferInsert;

// ============================================================================
// IP PROTECTION / INFRINGEMENT DETECTION
// ============================================================================

export const infringements = mysqlTable("infringements", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  detectedUrl: text("detectedUrl").notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  confidenceScore: decimal("confidenceScore", { precision: 5, scale: 2 }), // 0-100
  status: mysqlEnum("status", ["detected", "dmca_sent", "resolved", "disputed", "false_positive"]).default("detected").notNull(),
  dmcaNoticeUrl: text("dmcaNoticeUrl"),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
}));

export type Infringement = typeof infringements.$inferSelect;
export type InsertInfringement = typeof infringements.$inferInsert;

// ============================================================================
// TOUR MANAGEMENT
// ============================================================================

export const tours = mysqlTable("tours", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  tourName: varchar("tourName", { length: 255 }).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  venues: json("venues").$type<Array<{
    name: string;
    city: string;
    state?: string;
    country: string;
    date: string;
    capacity?: number;
    ticketsSold?: number;
  }>>(),
  budget: int("budget"), // In cents
  revenueProjection: int("revenueProjection"), // In cents
  actualRevenue: int("actualRevenue"), // In cents
  status: mysqlEnum("status", ["planning", "confirmed", "in_progress", "completed", "cancelled"]).default("planning").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
}));

export type Tour = typeof tours.$inferSelect;
export type InsertTour = typeof tours.$inferInsert;

// ============================================================================
// HEALTHCARE PLANS
// ============================================================================

export const healthcarePlans = mysqlTable("healthcare_plans", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  provider: varchar("provider", { length: 255 }).notNull(),
  planType: varchar("planType", { length: 100 }).notNull(),
  monthlyCost: int("monthlyCost").notNull(), // In cents
  coverageDetails: json("coverageDetails").$type<{
    medical?: boolean;
    dental?: boolean;
    vision?: boolean;
    mentalHealth?: boolean;
    [key: string]: boolean | undefined;
  }>(),
  enrollmentDate: timestamp("enrollmentDate").notNull(),
  status: mysqlEnum("status", ["active", "pending", "cancelled", "expired"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
}));

export type HealthcarePlan = typeof healthcarePlans.$inferSelect;
export type InsertHealthcarePlan = typeof healthcarePlans.$inferInsert;

// ============================================================================
// AI CONVERSATIONS (DUAL SYSTEM: PUBLIC SEARCH/AI CHAT + PERSONAL TONEY)
// ============================================================================

/**
 * AI Conversations - STUB matching existing database schema
 * TODO: Migrate to new schema with conversationType field
 * Current database schema: artistId (required), no userId, no conversationType
 */
export const aiConversations = mysqlTable("ai_conversations", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  messages: json("messages").$type<Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
  }>>(),
  context: mysqlEnum("context", ["career_advice", "release_strategy", "content_ideas", "financial_planning", "tour_planning", "general"]).notNull(),
  tokensUsed: int("tokensUsed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  // Added fields for compatibility with new code (will be null in existing rows)
  userId: int("userId").references(() => users.id),
  conversationType: mysqlEnum("conversationType", ["public", "toney"]).default("public"),
  title: varchar("title", { length: 255 }),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = typeof aiConversations.$inferInsert;

// ============================================================================
// OPPORTUNITIES (PLAYLISTS, COLLABS, VENUES, ETC.)
// ============================================================================

export const opportunities = mysqlTable("opportunities", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  opportunityType: mysqlEnum("opportunityType", ["playlist", "collaboration", "venue_booking", "brand_deal", "label_interest", "other"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  source: varchar("source", { length: 255 }), // Where the opportunity came from
  status: mysqlEnum("status", ["new", "contacted", "in_progress", "accepted", "declined", "expired"]).default("new").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  deadline: timestamp("deadline"),
  contactInfo: json("contactInfo").$type<{
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: string | undefined;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
}));

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["milestone", "opportunity", "financial", "system", "alert"]).notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  actionUrl: text("actionUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  isReadIdx: index("is_read_idx").on(table.isRead),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  userReadIdx: index("user_read_idx").on(table.userId, table.isRead), // Composite for unread notifications
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================================================
// ANALYTICS SNAPSHOTS (FOR HISTORICAL TRACKING)
// ============================================================================

export const analyticsSnapshots = mysqlTable("analytics_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  snapshotDate: timestamp("snapshotDate").notNull(),
  totalStreams: int("totalStreams"),
  totalFollowers: int("totalFollowers"),
  totalRevenue: int("totalRevenue"), // In cents
  engagementScore: decimal("engagementScore", { precision: 5, scale: 2 }),
  careerPhase: mysqlEnum("careerPhase", ["discovery", "development", "launch", "scale"]).notNull(),
  priorityScore: decimal("priorityScore", { precision: 3, scale: 2 }),
  metadata: json("metadata").$type<{
    topPlatform?: string;
    topCountry?: string;
    [key: string]: unknown;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  artistDateIdx: index("artist_date_idx").on(table.artistId, table.snapshotDate),
}));

export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;
export type InsertAnalyticsSnapshot = typeof analyticsSnapshots.$inferInsert;

// ============================================================================
// SUBSCRIPTIONS & PAYMENTS (STRIPE INTEGRATION)
// ============================================================================

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Stripe data
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  
  // Subscription details
  tier: mysqlEnum("tier", ["free", "pro", "enterprise"]).notNull().default("free"),
  plan: mysqlEnum("plan", ["free", "pro", "enterprise"]).notNull().default("free"),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "annual"]).notNull().default("monthly"),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing", "incomplete"]).notNull().default("active"),
  
  // Billing
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  trialEndsAt: timestamp("trialEndsAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  stripeCustomerIdx: index("stripe_customer_idx").on(table.stripeCustomerId),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Stripe data
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeChargeId: varchar("stripeChargeId", { length: 255 }),
  
  // Payment details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("usd"),
  status: mysqlEnum("status", ["succeeded", "pending", "failed", "refunded"]).notNull(),
  
  // Product info
  productType: mysqlEnum("productType", ["subscription", "merchandise", "other"]).notNull(),
  productId: int("productId"), // Reference to products table if merchandise
  description: text("description"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  stripePaymentIntentIdx: index("stripe_payment_intent_idx").on(table.stripePaymentIntentId),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ============================================================================
// BOPTONE AUDIO PROTOCOL (BAP) - MUSIC STREAMING PLATFORM
// ============================================================================

/**
 * BAP Tracks - Core music content with metadata
 * Artists keep 90% of streaming revenue
 */
export const bapTracks = mysqlTable("bap_tracks", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  
  // Core metadata
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull(), // Can differ from profile name
  albumId: int("albumId").references(() => bapAlbums.id),
  
  // Audio technical details
  duration: int("duration").notNull(), // Duration in seconds
  bpm: int("bpm"), // Beats per minute
  musicalKey: varchar("musicalKey", { length: 10 }), // e.g., "C Major", "A Minor"
  genre: varchar("genre", { length: 100 }),
  mood: varchar("mood", { length: 100 }), // e.g., "energetic", "chill", "sad"
  
  // File storage
  audioUrl: text("audioUrl").notNull(), // S3 URL to audio file
  waveformUrl: text("waveformUrl"), // S3 URL to waveform image
  artworkUrl: text("artworkUrl"), // Cover art
  fileSize: int("fileSize"), // In bytes
  audioFormat: varchar("audioFormat", { length: 20 }).default("mp3"), // mp3, wav, flac, etc.
  
  // BAP Protocol fields
  did: varchar("did", { length: 255 }).unique(), // did:boptone:artistname:trackid
  contentHash: varchar("contentHash", { length: 128 }), // SHA-256 hash for integrity
  
  // Compliance & Metadata fields
  isrcCode: varchar("isrcCode", { length: 12 }), // International Standard Recording Code (CC-XXX-YY-NNNNN)
  upcCode: varchar("upcCode", { length: 12 }), // Universal Product Code (12 digits)
  songwriterSplits: json("songwriterSplits").$type<Array<{name: string; percentage: number; ipi?: string}>>(), // Must add to 100%
  publishingData: json("publishingData").$type<{publisher?: string; pro?: string; [key: string]: unknown}>(), // PRO = Performance Rights Organization
  aiDisclosure: json("aiDisclosure").$type<{used: boolean; types?: Array<'lyrics' | 'production' | 'mastering' | 'vocals' | 'artwork'>}>(), // AI usage disclosure
  
  // Engagement metrics
  playCount: int("playCount").default(0).notNull(),
  likeCount: int("likeCount").default(0).notNull(),
  repostCount: int("repostCount").default(0).notNull(),
  
  // Revenue tracking (updated for Music Business 2.0 model)
  pricePerStream: int("pricePerStream").default(200).notNull(), // In cents (default $0.02, range $0.01-$0.05)
  artistShare: int("artistShare").default(95).notNull(), // Percentage (95% for streaming)
  platformFee: int("platformFee").default(5).notNull(), // Percentage (5% for streaming, 10% for DSP)
  totalEarnings: int("totalEarnings").default(0).notNull(), // In cents
  
  // Status
  status: mysqlEnum("status", ["draft", "processing", "live", "archived"]).default("draft").notNull(),
  isExplicit: boolean("isExplicit").default(false).notNull(),
  
  // Timestamps
  releasedAt: timestamp("releasedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"), // Soft delete - null means not deleted
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  statusIdx: index("status_idx").on(table.status),
  releasedAtIdx: index("released_at_idx").on(table.releasedAt),
  deletedAtIdx: index("deleted_at_idx").on(table.deletedAt), // Index for filtering soft-deleted records
}));

export type BapTrack = typeof bapTracks.$inferSelect;
export type InsertBapTrack = typeof bapTracks.$inferInsert;

/**
 * BAP Albums - Collections of tracks
 */
export const bapAlbums = mysqlTable("bap_albums", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  artworkUrl: text("artworkUrl"),
  
  albumType: mysqlEnum("albumType", ["single", "ep", "album", "compilation"]).notNull(),
  genre: varchar("genre", { length: 100 }),
  
  releaseDate: timestamp("releaseDate").notNull(),
  trackCount: int("trackCount").default(0).notNull(),
  totalDuration: int("totalDuration").default(0).notNull(), // Total seconds
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
}));

export type BapAlbum = typeof bapAlbums.$inferSelect;
export type InsertBapAlbum = typeof bapAlbums.$inferInsert;

/**
 * BAP Playlists - User-curated collections
 */
export const bapPlaylists = mysqlTable("bap_playlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  coverImageUrl: text("coverImageUrl"),
  
  isPublic: boolean("isPublic").default(true).notNull(),
  isCurated: boolean("isCurated").default(false).notNull(), // Official Boptone curation
  
  trackIds: json("trackIds").$type<number[]>(), // Array of track IDs
  trackCount: int("trackCount").default(0).notNull(),
  
  followerCount: int("followerCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  isCuratedIdx: index("is_curated_idx").on(table.isCurated),
}));

export type BapPlaylist = typeof bapPlaylists.$inferSelect;
export type InsertBapPlaylist = typeof bapPlaylists.$inferInsert;

/**
 * BAP Follows - Artist/User following relationships
 */
export const bapFollows = mysqlTable("bap_follows", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("followerId").notNull().references(() => users.id),
  followingId: int("followingId").notNull().references(() => users.id),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  followerIdx: index("follower_idx").on(table.followerId),
  followingIdx: index("following_idx").on(table.followingId),
  uniqueFollow: index("unique_follow").on(table.followerId, table.followingId),
}));

export type BapFollow = typeof bapFollows.$inferSelect;
export type InsertBapFollow = typeof bapFollows.$inferInsert;

/**
 * BAP Likes - Track favorites
 */
export const bapLikes = mysqlTable("bap_likes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  trackId: int("trackId").notNull().references(() => bapTracks.id),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  trackIdIdx: index("track_id_idx").on(table.trackId),
  uniqueLike: index("unique_like").on(table.userId, table.trackId),
}));

export type BapLike = typeof bapLikes.$inferSelect;
export type InsertBapLike = typeof bapLikes.$inferInsert;

/**
 * BAP Streams - Play tracking for payment calculation
 * Each stream = $0.01 (90% to artist, 10% to platform)
 */
export const bapStreams = mysqlTable("bap_streams", {
  id: int("id").autoincrement().primaryKey(),
  trackId: int("trackId").notNull().references(() => bapTracks.id),
  userId: int("userId").references(() => users.id), // Null for anonymous listeners
  
  // Stream details
  durationPlayed: int("durationPlayed").notNull(), // Seconds played (must be >30s to count)
  completionRate: int("completionRate").notNull(), // Percentage (0-100)
  
  // Payment calculation
  paymentAmount: int("paymentAmount").default(1).notNull(), // In cents (default $0.01)
  artistShare: int("artistShare").default(0).notNull(), // 90% in cents
  platformShare: int("platformShare").default(0).notNull(), // 10% in cents
  
  // Context
  source: mysqlEnum("source", ["feed", "playlist", "artist_page", "search", "direct"]).notNull(),
  deviceType: varchar("deviceType", { length: 50 }), // "mobile", "desktop", "tablet"
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  trackIdIdx: index("track_id_idx").on(table.trackId),
  userIdIdx: index("user_id_idx").on(table.userId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type BapStream = typeof bapStreams.$inferSelect;
export type InsertBapStream = typeof bapStreams.$inferInsert;

/**
 * BAP Payments - 90/10 revenue split tracking
 */
export const bapPayments = mysqlTable("bap_payments", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  
  // Payment details
  amount: int("amount").notNull(), // Total artist earnings in cents
  streamCount: int("streamCount").notNull(), // Number of streams in this payment
  
  // Stripe integration
  stripePayoutId: varchar("stripePayoutId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "processing", "paid", "failed"]).default("pending").notNull(),
  
  // Period covered
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  // Timestamps
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  statusIdx: index("status_idx").on(table.status),
}));

export type BapPayment = typeof bapPayments.$inferSelect;
export type InsertBapPayment = typeof bapPayments.$inferInsert;

/**
 * BAP Stream Payments - Stripe payment tracking for individual streams
 * Fans pay $0.01-$0.05 per stream via Stripe
 */
export const bapStreamPayments = mysqlTable("bap_stream_payments", {
  id: int("id").autoincrement().primaryKey(),
  trackId: int("trackId").notNull().references(() => bapTracks.id),
  userId: int("userId").references(() => users.id), // Null for anonymous listeners
  
  // Payment details
  amount: int("amount").notNull(), // Total amount in cents ($0.01 = 1)
  artistShare: int("artistShare").notNull(), // 90% to artist in cents
  platformShare: int("platformShare").notNull(), // 10% to platform in cents
  
  // Stripe integration
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "refunded"]).default("pending").notNull(),
  
  // Metadata
  paymentMethod: varchar("paymentMethod", { length: 50 }), // "card", "apple_pay", etc.
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  
  // Timestamps
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  trackIdIdx: index("track_id_idx").on(table.trackId),
  userIdIdx: index("user_id_idx").on(table.userId),
  stripePaymentIntentIdx: index("stripe_payment_intent_idx").on(table.stripePaymentIntentId),
}));

export type BapStreamPayment = typeof bapStreamPayments.$inferSelect;
export type InsertBapStreamPayment = typeof bapStreamPayments.$inferInsert;

/**
 * Paid Stream Sessions - Track 24-hour unlock periods
 * After paying once, fans can listen free for 24 hours
 */
export const paidStreamSessions = mysqlTable("paid_stream_sessions", {
  id: int("id").autoincrement().primaryKey(),
  trackId: int("trackId").notNull().references(() => bapTracks.id),
  paymentId: int("paymentId").notNull().references(() => bapStreamPayments.id),
  
  // Session tracking
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().unique(), // Stored in localStorage
  userId: int("userId").references(() => users.id), // Null for anonymous
  
  // Expiration
  expiresAt: timestamp("expiresAt").notNull(), // 24 hours from payment
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  trackIdIdx: index("track_id_idx").on(table.trackId),
  sessionTokenIdx: index("session_token_idx").on(table.sessionToken),
  expiresAtIdx: index("expires_at_idx").on(table.expiresAt),
}));

export type PaidStreamSession = typeof paidStreamSessions.$inferSelect;
export type InsertPaidStreamSession = typeof paidStreamSessions.$inferInsert;

/**
 * BAP Reposts - Social sharing of tracks
 */
export const bapReposts = mysqlTable("bap_reposts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  trackId: int("trackId").notNull().references(() => bapTracks.id),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  trackIdIdx: index("track_id_idx").on(table.trackId),
  uniqueRepost: index("unique_repost").on(table.userId, table.trackId),
}));

export type BapRepost = typeof bapReposts.$inferSelect;
export type InsertBapRepost = typeof bapReposts.$inferInsert;

// ============================================================================
// TONE REWARDS MEMBERSHIP SYSTEM
// ============================================================================

/**
 * Fan Memberships - Basic (free), Member ($36/yr), Executive ($99/yr)
 * Executive members get 2% cashback on all artist support spending
 */
export const fanMemberships = mysqlTable("fan_memberships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  tier: mysqlEnum("tier", ["basic", "member", "executive"]).default("basic").notNull(),
  annualFee: decimal("annualFee", { precision: 10, scale: 2 }).default("0.00"),
  cashbackRate: decimal("cashbackRate", { precision: 5, scale: 4 }).default("0.0000"), // 0.02 = 2%
  startDate: timestamp("startDate").defaultNow().notNull(),
  renewalDate: timestamp("renewalDate"),
  status: mysqlEnum("status", ["active", "expired", "canceled"]).default("active").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FanMembership = typeof fanMemberships.$inferSelect;
export type InsertFanMembership = typeof fanMemberships.$inferInsert;

/**
 * Artist Backing - Fans choose which artists to support with monthly backing
 * This is the core of the Tone Economy - direct fan-to-artist support
 */
export const artistBacking = mysqlTable("artist_backing", {
  id: int("id").autoincrement().primaryKey(),
  fanUserId: int("fanUserId").notNull().references(() => users.id),
  artistProfileId: int("artistProfileId").notNull().references(() => artistProfiles.id),
  monthlyAmount: decimal("monthlyAmount", { precision: 10, scale: 2 }).notNull(), // $3-25+
  tier: mysqlEnum("tier", ["backer", "patron", "investor"]).default("backer").notNull(),
  // backer = $3/mo, patron = $10/mo, investor = $25+/mo
  revenueSharePercent: decimal("revenueSharePercent", { precision: 5, scale: 4 }).default("0.0000"), // For investors
  status: mysqlEnum("status", ["active", "paused", "canceled"]).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  nextBillingDate: timestamp("nextBillingDate"),
  totalContributed: decimal("totalContributed", { precision: 12, scale: 2 }).default("0.00"),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ArtistBacking = typeof artistBacking.$inferSelect;
export type InsertArtistBacking = typeof artistBacking.$inferInsert;

/**
 * Backing Transactions - All spending tracked for cashback calculation
 * Includes: backing payments, merch, Kick In tips, concert tickets
 */
export const backingTransactions = mysqlTable("backing_transactions", {
  id: int("id").autoincrement().primaryKey(),
  fanUserId: int("fanUserId").notNull().references(() => users.id),
  artistProfileId: int("artistProfileId").references(() => artistProfiles.id), // Can be null for platform purchases
  type: mysqlEnum("type", ["backing", "merch", "kickin", "tickets", "exclusive_content", "other"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  artistShare: decimal("artistShare", { precision: 10, scale: 2 }).notNull(), // 90% typically
  platformShare: decimal("platformShare", { precision: 10, scale: 2 }).notNull(), // 10% typically
  cashbackEligible: boolean("cashbackEligible").default(true).notNull(),
  cashbackAmount: decimal("cashbackAmount", { precision: 10, scale: 2 }).default("0.00"), // Calculated based on membership
  description: text("description"),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  year: int("year").notNull(), // For annual cashback grouping
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BackingTransaction = typeof backingTransactions.$inferSelect;
export type InsertBackingTransaction = typeof backingTransactions.$inferInsert;

/**
 * Cashback Rewards - Annual cashback for Executive members
 * Calculated at year end based on total eligible spending
 */
export const cashbackRewards = mysqlTable("cashback_rewards", {
  id: int("id").autoincrement().primaryKey(),
  fanUserId: int("fanUserId").notNull().references(() => users.id),
  year: int("year").notNull(),
  totalEligibleSpending: decimal("totalEligibleSpending", { precision: 12, scale: 2 }).notNull(),
  cashbackRate: decimal("cashbackRate", { precision: 5, scale: 4 }).notNull(), // 0.02 = 2%
  cashbackAmount: decimal("cashbackAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "calculated", "paid", "expired"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  stripePayoutId: varchar("stripePayoutId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CashbackReward = typeof cashbackRewards.$inferSelect;
export type InsertCashbackReward = typeof cashbackRewards.$inferInsert;

/**
 * Artist Dividends - Loyalty rewards for artists (3% of earnings)
 * "Thanks for building on Boptone. Here's your share of our success."
 */
export const artistDividends = mysqlTable("artist_dividends", {
  id: int("id").autoincrement().primaryKey(),
  artistProfileId: int("artistProfileId").notNull().references(() => artistProfiles.id),
  year: int("year").notNull(),
  totalEarnings: decimal("totalEarnings", { precision: 12, scale: 2 }).notNull(),
  dividendRate: decimal("dividendRate", { precision: 5, scale: 4 }).notNull(), // 0.03 = 3%
  dividendAmount: decimal("dividendAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "calculated", "paid"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  stripePayoutId: varchar("stripePayoutId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ArtistDividend = typeof artistDividends.$inferSelect;
export type InsertArtistDividend = typeof artistDividends.$inferInsert;

/**
 * Investor Revenue Share - Track revenue share for Investor tier backers
 * Fans who invest $25+/mo get a small % of artist's future earnings
 */
export const investorRevenueShare = mysqlTable("investor_revenue_share", {
  id: int("id").autoincrement().primaryKey(),
  backingId: int("backingId").notNull().references(() => artistBacking.id),
  fanUserId: int("fanUserId").notNull().references(() => users.id),
  artistProfileId: int("artistProfileId").notNull().references(() => artistProfiles.id),
  year: int("year").notNull(),
  artistTotalEarnings: decimal("artistTotalEarnings", { precision: 12, scale: 2 }).notNull(),
  sharePercent: decimal("sharePercent", { precision: 5, scale: 4 }).notNull(), // 0.0002 = 0.02%
  shareAmount: decimal("shareAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "calculated", "paid"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestorRevenueShare = typeof investorRevenueShare.$inferSelect;
export type InsertInvestorRevenueShare = typeof investorRevenueShare.$inferInsert;


// ============================================================================
// ARTIST MICRO-LOANS (FINTECH)
// ============================================================================

/**
 * Artist Micro-Loans - Up to $750 advances repaid from royalties
 * Use cases: Emergency funds, production costs, marketing, equipment
 * Low risk for Boptone (automatic repayment), high trust for artists
 */
export const artistLoans = mysqlTable("artist_loans", {
  id: int("id").autoincrement().primaryKey(),
  artistProfileId: int("artistProfileId").notNull().references(() => artistProfiles.id),
  userId: int("userId").notNull().references(() => users.id),
  
  // Loan details
  requestedAmount: decimal("requestedAmount", { precision: 10, scale: 2 }).notNull(), // Max $750
  approvedAmount: decimal("approvedAmount", { precision: 10, scale: 2 }),
  purpose: mysqlEnum("purpose", ["emergency", "production", "marketing", "equipment", "other"]).notNull(),
  purposeDescription: text("purposeDescription"),
  
  // Terms
  originationFee: decimal("originationFee", { precision: 10, scale: 2 }).default("0.00"), // 3-5% fee
  interestRate: decimal("interestRate", { precision: 5, scale: 4 }).default("0.0000"), // Annual rate if any
  repaymentPercent: decimal("repaymentPercent", { precision: 5, scale: 2 }).default("15.00"), // % of royalties withheld
  
  // Status tracking
  status: mysqlEnum("status", ["pending", "approved", "rejected", "active", "repaid", "defaulted"]).default("pending").notNull(),
  
  // Amounts
  totalOwed: decimal("totalOwed", { precision: 10, scale: 2 }), // Principal + fees
  totalRepaid: decimal("totalRepaid", { precision: 10, scale: 2 }).default("0.00"),
  remainingBalance: decimal("remainingBalance", { precision: 10, scale: 2 }),
  
  // Eligibility snapshot at time of application
  monthlyEarningsAvg: decimal("monthlyEarningsAvg", { precision: 10, scale: 2 }), // 3-month avg
  accountAgeMonths: int("accountAgeMonths"),
  riskScore: int("riskScore"), // 1-100, higher = lower risk
  
  // Dates
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  disbursedAt: timestamp("disbursedAt"),
  expectedRepaymentDate: timestamp("expectedRepaymentDate"),
  actualRepaidAt: timestamp("actualRepaidAt"),
  
  // Admin
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewNotes: text("reviewNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ArtistLoan = typeof artistLoans.$inferSelect;
export type InsertArtistLoan = typeof artistLoans.$inferInsert;

/**
 * Loan Repayments - Track each automatic deduction from royalties
 */
export const loanRepayments = mysqlTable("loan_repayments", {
  id: int("id").autoincrement().primaryKey(),
  loanId: int("loanId").notNull().references(() => artistLoans.id),
  artistProfileId: int("artistProfileId").notNull().references(() => artistProfiles.id),
  
  // Repayment details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  source: mysqlEnum("source", ["bap_streams", "kick_in", "backing", "merch", "manual"]).notNull(),
  sourceTransactionId: varchar("sourceTransactionId", { length: 255 }), // Reference to original transaction
  
  // Balance tracking
  balanceBefore: decimal("balanceBefore", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balanceAfter", { precision: 10, scale: 2 }).notNull(),
  
  processedAt: timestamp("processedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoanRepayment = typeof loanRepayments.$inferSelect;
export type InsertLoanRepayment = typeof loanRepayments.$inferInsert;

/**
 * AI Recommendations - Log all AI recommendations for transparency (Nvidia Pillar)
 * Enables "Why?" button on every AI recommendation showing reasoning, confidence, data sources
 */
export const aiRecommendations = mysqlTable("ai_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  artistProfileId: int("artistProfileId").notNull().references(() => artistProfiles.id),
  
  // Recommendation details
  type: mysqlEnum("type", ["release_timing", "marketing_strategy", "pricing", "collaboration", "content", "career_move", "other"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(), // e.g., "Release your next single on Friday"
  description: text("description").notNull(), // Full recommendation text
  
  // Transparency fields (Glass Box AI)
  reasoning: text("reasoning").notNull(), // Why this recommendation was made
  confidenceScore: int("confidenceScore").notNull(), // 0-100
  dataSources: json("dataSources").$type<string[]>().notNull(), // ["Your analytics", "Industry benchmarks", "Platform trends"]
  
  // Artist interaction
  status: mysqlEnum("status", ["pending", "accepted", "overridden", "dismissed"]).default("pending").notNull(),
  artistResponse: text("artistResponse"), // Artist's explanation if overridden
  respondedAt: timestamp("respondedAt"),
  
  // Metadata
  priority: int("priority").default(5).notNull(), // 1-10, higher = more important
  expiresAt: timestamp("expiresAt"), // Some recommendations are time-sensitive
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAIRecommendation = typeof aiRecommendations.$inferInsert;

/**
 * Artist Values - Store ethical boundaries and non-negotiables (Shadow #4 mitigation)
 * Enables artists to define hard-coded AI boundaries: "No brand deals with alcohol", "Only eco-friendly merch"
 */
export const artistValues = mysqlTable("artist_values", {
  id: int("id").autoincrement().primaryKey(),
  artistProfileId: int("artistProfileId").notNull().references(() => artistProfiles.id),
  
  // Core values
  mission: text("mission"), // Artist's stated mission/purpose
  nonNegotiables: json("nonNegotiables").$type<string[]>(), // ["No explicit content", "No alcohol sponsors", "Eco-friendly only"]
  
  // Content boundaries
  explicitContentAllowed: boolean("explicitContentAllowed").default(true),
  politicalContentAllowed: boolean("politicalContentAllowed").default(true),
  brandDealsAllowed: boolean("brandDealsAllowed").default(true),
  brandDealCategories: json("brandDealCategories").$type<string[]>(), // ["alcohol", "tobacco", "gambling"] = blocked categories
  
  // Collaboration preferences
  collaborationOpenness: mysqlEnum("collaborationOpenness", ["closed", "selective", "open"]).default("selective"),
  preferredGenres: json("preferredGenres").$type<string[]>(),
  
  // AI behavior boundaries
  aiAutomationLevel: mysqlEnum("aiAutomationLevel", ["manual", "assisted", "automated"]).default("assisted"),
  requireApprovalFor: json("requireApprovalFor").$type<string[]>(), // ["pricing_changes", "content_posting", "brand_deals"]
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ArtistValues = typeof artistValues.$inferSelect;
export type InsertArtistValues = typeof artistValues.$inferInsert;

/**
 * Communities - Enable "Sovereign Swarm" network effects (Meta Pillar)
 * Artists can create/join communities for collaboration, support, knowledge sharing
 */
export const communities = mysqlTable("communities", {
  id: int("id").autoincrement().primaryKey(),
  
  // Community details
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL-friendly name
  description: text("description"),
  imageUrl: text("imageUrl"),
  
  // Community type
  type: mysqlEnum("type", ["genre", "location", "career_phase", "interest", "private"]).notNull(),
  visibility: mysqlEnum("visibility", ["public", "private", "invite_only"]).default("public").notNull(),
  
  // Ownership
  createdBy: int("createdBy").notNull().references(() => artistProfiles.id),
  moderators: json("moderators").$type<number[]>(), // Array of artistProfileIds
  
  // Stats
  memberCount: int("memberCount").default(0).notNull(),
  postCount: int("postCount").default(0).notNull(),
  
  // Settings
  allowPosts: boolean("allowPosts").default(true),
  requireApproval: boolean("requireApproval").default(false), // Approve new members?
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Community = typeof communities.$inferSelect;
export type InsertCommunity = typeof communities.$inferInsert;

/**
 * Forum Posts - Community discussions and knowledge sharing (Meta Pillar)
 */
export const forumPosts = mysqlTable("forum_posts", {
  id: int("id").autoincrement().primaryKey(),
  communityId: int("communityId").notNull().references(() => communities.id),
  authorId: int("authorId").notNull().references(() => artistProfiles.id),
  
  // Post content
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["discussion", "question", "resource", "announcement"]).default("discussion").notNull(),
  
  // Engagement
  likeCount: int("likeCount").default(0).notNull(),
  replyCount: int("replyCount").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  
  // Moderation
  isPinned: boolean("isPinned").default(false),
  isLocked: boolean("isLocked").default(false),
  isDeleted: boolean("isDeleted").default(false),
  
  // Threading
  parentPostId: int("parentPostId"), // For replies - self-reference
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;

// ============================================================================
// PRINT-ON-DEMAND (POD) INTEGRATION
// ============================================================================

// POD Providers (Printful, Printify)
export const podProviders = mysqlTable("pod_providers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // 'printful', 'printify'
  displayName: varchar("displayName", { length: 100 }).notNull(), // 'Printful', 'Printify'
  apiBaseUrl: varchar("apiBaseUrl", { length: 255 }).notNull(),
  webhookSecret: varchar("webhookSecret", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  metadata: json("metadata").$type<{
    oauthClientId?: string;
    oauthClientSecret?: string;
    [key: string]: any;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PodProvider = typeof podProviders.$inferSelect;
export type InsertPodProvider = typeof podProviders.$inferInsert;

// Artist POD Account Connections
export const artistPodAccounts = mysqlTable("artist_pod_accounts", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  providerId: int("providerId").notNull().references(() => podProviders.id),
  
  // Authentication
  apiToken: text("apiToken").notNull(), // Encrypted Printful/Printify API token
  refreshToken: text("refreshToken"), // For OAuth refresh
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  
  // Provider-specific IDs
  providerStoreId: varchar("providerStoreId", { length: 100 }), // Printful store ID
  providerAccountId: varchar("providerAccountId", { length: 100 }), // Printify account ID
  
  // Status
  status: mysqlEnum("status", ["active", "disconnected", "expired", "error"]).default("active").notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
  
  // Metadata
  metadata: json("metadata").$type<{
    storeUrl?: string;
    email?: string;
    [key: string]: any;
  }>(),
  
  connectedAt: timestamp("connectedAt").defaultNow().notNull(),
  disconnectedAt: timestamp("disconnectedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistProviderIdx: index("artist_provider_idx").on(table.artistId, table.providerId),
}));

export type ArtistPodAccount = typeof artistPodAccounts.$inferSelect;
export type InsertArtistPodAccount = typeof artistPodAccounts.$inferInsert;

// POD Product Mappings (links Boptone products to POD provider products)
export const podProductMappings = mysqlTable("pod_product_mappings", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id),
  providerId: int("providerId").notNull().references(() => podProviders.id),
  artistPodAccountId: int("artistPodAccountId").notNull().references(() => artistPodAccounts.id),
  
  // Provider product identifiers
  providerProductId: varchar("providerProductId", { length: 100 }).notNull(), // Printful product ID (e.g., "71" for t-shirt)
  providerVariantId: varchar("providerVariantId", { length: 100 }).notNull(), // Printful variant ID (e.g., "4018" for size M)
  providerSku: varchar("providerSku", { length: 100 }),
  
  // Pricing (in cents)
  wholesaleCost: int("wholesaleCost").notNull(), // Provider's cost (e.g., $12.50 = 1250)
  shippingCost: int("shippingCost").default(0).notNull(), // Estimated shipping cost
  
  // Design files
  designFileUrl: varchar("designFileUrl", { length: 500 }), // Artist's uploaded design
  designPlacement: varchar("designPlacement", { length: 50 }), // 'front', 'back', 'sleeve', etc.
  mockupUrls: json("mockupUrls").$type<string[]>(), // Generated mockup images
  
  // Sync settings
  syncEnabled: boolean("syncEnabled").default(true).notNull(),
  autoFulfill: boolean("autoFulfill").default(true).notNull(), // Auto-submit orders to provider
  
  // Provider metadata
  providerMetadata: json("providerMetadata").$type<{
    productName?: string;
    variantName?: string;
    color?: string;
    size?: string;
    [key: string]: any;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  productIdIdx: index("product_id_idx").on(table.productId),
  providerProductIdx: index("provider_product_idx").on(table.providerId, table.providerProductId),
}));

export type PodProductMapping = typeof podProductMappings.$inferSelect;
export type InsertPodProductMapping = typeof podProductMappings.$inferInsert;

// POD Order Fulfillments (tracks POD orders sent to providers)
export const podOrderFulfillments = mysqlTable("pod_order_fulfillments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id),
  orderItemId: int("orderItemId").notNull().references(() => orderItems.id),
  providerId: int("providerId").notNull().references(() => podProviders.id),
  artistPodAccountId: int("artistPodAccountId").notNull().references(() => artistPodAccounts.id),
  
  // Provider order identifiers
  providerOrderId: varchar("providerOrderId", { length: 100 }).notNull(), // Printful order ID
  providerOrderNumber: varchar("providerOrderNumber", { length: 100 }), // Human-readable order number
  
  // Fulfillment status
  status: mysqlEnum("status", [
    "pending",      // Order created in Boptone, not yet submitted
    "submitted",    // Submitted to provider
    "confirmed",    // Provider confirmed receipt
    "printing",     // Provider is printing
    "shipped",      // Provider shipped
    "delivered",    // Delivered to customer
    "cancelled",    // Order cancelled
    "failed"        // Submission or fulfillment failed
  ]).default("pending").notNull(),
  
  // Tracking
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  trackingUrl: varchar("trackingUrl", { length: 500 }),
  carrier: varchar("carrier", { length: 50 }), // 'USPS', 'UPS', 'FedEx', etc.
  
  // Costs (in cents)
  providerCost: int("providerCost").notNull(), // What provider charged
  shippingCost: int("shippingCost").default(0).notNull(),
  taxAmount: int("taxAmount").default(0).notNull(),
  totalCost: int("totalCost").notNull(),
  
  // Timestamps
  submittedAt: timestamp("submittedAt"),
  confirmedAt: timestamp("confirmedAt"),
  printingStartedAt: timestamp("printingStartedAt"),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
  cancelledAt: timestamp("cancelledAt"),
  
  // Error handling
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0).notNull(),
  lastRetryAt: timestamp("lastRetryAt"),
  
  // Provider response
  providerResponse: json("providerResponse").$type<{
    [key: string]: any;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orderIdIdx: index("order_id_idx").on(table.orderId),
  providerOrderIdx: index("provider_order_idx").on(table.providerId, table.providerOrderId),
  statusIdx: index("status_idx").on(table.status),
}));

export type PodOrderFulfillment = typeof podOrderFulfillments.$inferSelect;
export type InsertPodOrderFulfillment = typeof podOrderFulfillments.$inferInsert;

// POD Webhook Events (log all webhook events from providers)
export const podWebhookEvents = mysqlTable("pod_webhook_events", {
  id: int("id").autoincrement().primaryKey(),
  providerId: int("providerId").notNull().references(() => podProviders.id),
  
  // Event details
  eventType: varchar("eventType", { length: 100 }).notNull(), // 'order.created', 'order.updated', 'order.shipped', etc.
  providerOrderId: varchar("providerOrderId", { length: 100 }),
  
  // Payload
  payload: json("payload").$type<{
    [key: string]: any;
  }>().notNull(),
  
  // Processing status
  processed: boolean("processed").default(false).notNull(),
  processedAt: timestamp("processedAt"),
  processingError: text("processingError"),
  
  // Request metadata
  requestId: varchar("requestId", { length: 100 }),
  signature: varchar("signature", { length: 255 }), // Webhook signature for verification
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  eventTypeIdx: index("event_type_idx").on(table.eventType),
  providerOrderIdx: index("provider_order_idx").on(table.providerOrderId),
  processedIdx: index("processed_idx").on(table.processed),
}));

export type PodWebhookEvent = typeof podWebhookEvents.$inferSelect;
export type InsertPodWebhookEvent = typeof podWebhookEvents.$inferInsert;

// ============================================================================
// WALLET SYSTEM (Payment Methods & Transactions)
// ============================================================================

// Artist Wallets - One wallet per artist
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id).unique(),
  
  // Balance tracking (in cents)
  balance: int("balance").default(0).notNull(), // Current balance
  pendingBalance: int("pendingBalance").default(0).notNull(), // Pending/processing balance
  lifetimeEarnings: int("lifetimeEarnings").default(0).notNull(), // Total all-time earnings
  
  // Wallet status
  status: mysqlEnum("status", ["active", "suspended", "closed"]).default("active").notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "pending", "verified", "rejected"]).default("unverified").notNull(),
  
  // Metadata
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  metadata: json("metadata").$type<{
    stripeCustomerId?: string;
    cryptoAddresses?: {
      bitcoin?: string;
      ethereum?: string;
      [key: string]: string | undefined;
    };
    [key: string]: any;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
}));

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

// Payment Methods - Multiple payment methods per wallet
export const paymentMethods = mysqlTable("payment_methods", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull().references(() => wallets.id),
  
  // Payment method type
  type: mysqlEnum("type", ["credit_card", "debit_card", "apple_pay", "venmo", "zelle", "cryptocurrency", "bank_account"]).notNull(),
  provider: varchar("provider", { length: 50 }), // "visa", "mastercard", "bitcoin", "ethereum", etc.
  
  // Card/Account details (encrypted or tokenized)
  last4: varchar("last4", { length: 4 }), // Last 4 digits of card/account
  expiryMonth: int("expiryMonth"), // For cards
  expiryYear: int("expiryYear"), // For cards
  brand: varchar("brand", { length: 50 }), // "Visa", "Mastercard", etc.
  
  // Crypto wallet addresses
  cryptoAddress: varchar("cryptoAddress", { length: 255 }), // For cryptocurrency
  cryptoNetwork: varchar("cryptoNetwork", { length: 50 }), // "Bitcoin", "Ethereum", etc.
  
  // Venmo/Zelle identifiers
  accountIdentifier: varchar("accountIdentifier", { length: 255 }), // Email/phone for Venmo/Zelle
  
  // Status
  status: mysqlEnum("status", ["active", "inactive", "expired", "failed_verification"]).default("active").notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  verified: boolean("verified").default(false).notNull(),
  
  // External provider IDs (Stripe, etc.)
  externalId: varchar("externalId", { length: 255 }), // Stripe payment method ID
  externalCustomerId: varchar("externalCustomerId", { length: 255 }), // Stripe customer ID
  
  // Metadata
  metadata: json("metadata").$type<{
    nickname?: string; // User-friendly name like "My Visa Card"
    billingAddress?: {
      line1?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    [key: string]: any;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  walletIdIdx: index("wallet_id_idx").on(table.walletId),
  typeIdx: index("type_idx").on(table.type),
}));

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

// Transactions - All wallet transactions (payments, tips, withdrawals)
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull().references(() => wallets.id),
  
  // Transaction details
  type: mysqlEnum("type", ["payment", "tip", "withdrawal", "refund", "payout", "fee", "adjustment"]).notNull(),
  amount: int("amount").notNull(), // In cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  // Transaction status
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled", "refunded"]).default("pending").notNull(),
  
  // Payment method used
  paymentMethodId: int("paymentMethodId").references(() => paymentMethods.id),
  
  // Related entities
  fromUserId: int("fromUserId").references(() => users.id), // Who sent the money (for tips)
  toUserId: int("toUserId").references(() => users.id), // Who received the money
  orderId: int("orderId").references(() => orders.id), // Related order (if applicable)
  
  // Fees (in cents)
  platformFee: int("platformFee").default(0).notNull(), // Boptone platform fee (0% for tips)
  processingFee: int("processingFee").default(0).notNull(), // Payment processor fee
  netAmount: int("netAmount").notNull(), // Amount after fees
  
  // Description
  description: text("description"),
  internalNotes: text("internalNotes"), // Admin notes
  
  // External provider IDs
  externalId: varchar("externalId", { length: 255 }), // Stripe payment intent ID, etc.
  externalStatus: varchar("externalStatus", { length: 50 }), // External provider status
  
  // Timestamps
  processedAt: timestamp("processedAt"),
  completedAt: timestamp("completedAt"),
  failedAt: timestamp("failedAt"),
  
  // Metadata
  metadata: json("metadata").$type<{
    tipMessage?: string; // Message from tipper
    refundReason?: string;
    failureReason?: string;
    [key: string]: any;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  walletIdIdx: index("wallet_id_idx").on(table.walletId),
  typeIdx: index("type_idx").on(table.type),
  statusIdx: index("status_idx").on(table.status),
  fromUserIdx: index("from_user_idx").on(table.fromUserId),
  toUserIdx: index("to_user_idx").on(table.toUserId),
}));

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Tips (Kick In) - Dedicated tip jar transactions with 0% platform fees
export const tips = mysqlTable("tips", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: int("transactionId").notNull().references(() => transactions.id).unique(),
  
  // Tip details
  fromUserId: int("fromUserId").notNull().references(() => users.id), // Tipper
  toArtistId: int("toArtistId").notNull().references(() => artistProfiles.id), // Artist receiving tip
  amount: int("amount").notNull(), // In cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  // Tip message
  message: text("message"), // Optional message from tipper
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  
  // Payment method used
  paymentMethodId: int("paymentMethodId").references(() => paymentMethods.id),
  paymentType: varchar("paymentType", { length: 50 }).notNull(), // "credit_card", "apple_pay", "crypto", etc.
  
  // Status
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  
  // IMPORTANT: 0% platform fee for tips
  platformFee: int("platformFee").default(0).notNull(), // Always 0 for tips
  processingFee: int("processingFee").default(0).notNull(), // Payment processor fee (unavoidable)
  netAmount: int("netAmount").notNull(), // Amount artist receives (amount - processingFee)
  
  // Timestamps
  completedAt: timestamp("completedAt"),
  
  // Metadata
  metadata: json("metadata").$type<{
    tipSource?: string; // "profile_page", "track_page", "dashboard", etc.
    [key: string]: any;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  fromUserIdx: index("from_user_idx").on(table.fromUserId),
  toArtistIdx: index("to_artist_idx").on(table.toArtistId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Tip = typeof tips.$inferSelect;
export type InsertTip = typeof tips.$inferInsert;

// ============================================================================
// WRITER PAYMENT SYSTEM (SONGWRITER SPLITS & PAYOUTS)
// ============================================================================

/**
 * Writer Profiles - Songwriters/producers who receive split payments
 * Separate from artist profiles to allow non-artists to receive payments
 */
export const writerProfiles = mysqlTable("writer_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id), // Optional - writer may not have Boptone account yet
  
  // Identity
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  ipiNumber: varchar("ipiNumber", { length: 20 }), // International Performer Identifier
  proAffiliation: varchar("proAffiliation", { length: 100 }), // ASCAP, BMI, SESAC, etc.
  
  // Tax info
  taxCountry: varchar("taxCountry", { length: 2 }), // ISO country code
  taxId: varchar("taxId", { length: 50 }), // SSN/EIN (US) or equivalent
  taxFormType: mysqlEnum("taxFormType", ["w9", "w8ben", "none"]).default("none"),
  taxFormUrl: text("taxFormUrl"), // S3 URL to uploaded tax form
  taxFormSubmittedAt: timestamp("taxFormSubmittedAt"),
  
  // Profile status
  status: mysqlEnum("status", ["invited", "pending_verification", "active", "suspended"]).default("invited").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  
  // Metadata
  metadata: json("metadata").$type<{
    invitedBy?: number; // Artist ID who invited this writer
    [key: string]: unknown;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type WriterProfile = typeof writerProfiles.$inferSelect;
export type InsertWriterProfile = typeof writerProfiles.$inferInsert;

/**
 * Writer Payment Methods - How writers receive their split payments
 */
export const writerPaymentMethods = mysqlTable("writer_payment_methods", {
  id: int("id").autoincrement().primaryKey(),
  writerProfileId: int("writerProfileId").notNull().references(() => writerProfiles.id),
  
  // Payment method type
  type: mysqlEnum("type", ["bank_account", "paypal", "venmo", "zelle", "crypto"]).notNull(),
  
  // Bank account details (encrypted)
  bankName: varchar("bankName", { length: 255 }),
  bankAccountType: mysqlEnum("bankAccountType", ["checking", "savings"]),
  bankRoutingNumber: varchar("bankRoutingNumber", { length: 20 }), // Encrypted
  bankAccountNumber: varchar("bankAccountNumber", { length: 50 }), // Encrypted
  
  // PayPal/Venmo/Zelle
  paypalEmail: varchar("paypalEmail", { length: 320 }),
  venmoHandle: varchar("venmoHandle", { length: 100 }),
  zelleEmail: varchar("zelleEmail", { length: 320 }),
  
  // Cryptocurrency
  cryptoWalletAddress: varchar("cryptoWalletAddress", { length: 255 }),
  cryptoCurrency: varchar("cryptoCurrency", { length: 20 }), // BTC, ETH, USDC, etc.
  
  // Verification
  isVerified: boolean("isVerified").default(false).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  
  // Default payment method
  isDefault: boolean("isDefault").default(false).notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "active", "failed", "disabled"]).default("pending").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  writerProfileIdx: index("writer_profile_idx").on(table.writerProfileId),
}));

export type WriterPaymentMethod = typeof writerPaymentMethods.$inferSelect;
export type InsertWriterPaymentMethod = typeof writerPaymentMethods.$inferInsert;

/**
 * Writer Invitations - Pending invites sent to writers during track upload
 */
export const writerInvitations = mysqlTable("writer_invitations", {
  id: int("id").autoincrement().primaryKey(),
  
  // Invitation details
  email: varchar("email", { length: 320 }).notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  invitedByArtistId: int("invitedByArtistId").notNull().references(() => artistProfiles.id),
  
  // Track association
  trackId: int("trackId").references(() => bapTracks.id),
  splitPercentage: decimal("splitPercentage", { precision: 5, scale: 2 }).notNull(), // e.g., 25.00 for 25%
  
  // Invitation token
  inviteToken: varchar("inviteToken", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "accepted", "expired", "cancelled"]).default("pending").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  writerProfileId: int("writerProfileId").references(() => writerProfiles.id), // Set when accepted
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  inviteTokenIdx: index("invite_token_idx").on(table.inviteToken),
  trackIdIdx: index("track_id_idx").on(table.trackId),
}));

export type WriterInvitation = typeof writerInvitations.$inferSelect;
export type InsertWriterInvitation = typeof writerInvitations.$inferInsert;

/**
 * Writer Earnings - Track earnings split by writer for automatic payouts
 */
export const writerEarnings = mysqlTable("writer_earnings", {
  id: int("id").autoincrement().primaryKey(),
  
  // Writer and track
  writerProfileId: int("writerProfileId").notNull().references(() => writerProfiles.id),
  trackId: int("trackId").notNull().references(() => bapTracks.id),
  
  // Split details
  splitPercentage: decimal("splitPercentage", { precision: 5, scale: 2 }).notNull(), // e.g., 25.00 for 25%
  
  // Earnings tracking
  totalEarned: int("totalEarned").default(0).notNull(), // In cents - lifetime earnings for this writer on this track
  pendingPayout: int("pendingPayout").default(0).notNull(), // In cents - not yet paid out
  totalPaidOut: int("totalPaidOut").default(0).notNull(), // In cents - already paid
  
  // Last payout
  lastPayoutAt: timestamp("lastPayoutAt"),
  lastPayoutAmount: int("lastPayoutAmount"), // In cents
  
  // Metadata
  metadata: json("metadata").$type<{
    payoutHistory?: Array<{
      amount: number;
      date: string;
      transactionId: string;
    }>;
    [key: string]: unknown;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  writerTrackIdx: index("writer_track_idx").on(table.writerProfileId, table.trackId),
  writerProfileIdx: index("writer_profile_idx").on(table.writerProfileId),
  trackIdIdx: index("track_id_idx").on(table.trackId),
}));

export type WriterEarning = typeof writerEarnings.$inferSelect;
export type InsertWriterEarning = typeof writerEarnings.$inferInsert;

/**
 * Writer Payouts - Individual payout transactions to writers
 */
export const writerPayouts = mysqlTable("writer_payouts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Writer and payment method
  writerProfileId: int("writerProfileId").notNull().references(() => writerProfiles.id),
  paymentMethodId: int("paymentMethodId").notNull().references(() => writerPaymentMethods.id),
  
  // Payout details
  amount: int("amount").notNull(), // In cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  // Tracks included in this payout
  trackIds: json("trackIds").$type<number[]>(), // Array of track IDs
  
  // Payment processing
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending").notNull(),
  paymentProcessor: varchar("paymentProcessor", { length: 50 }), // "stripe", "paypal", etc.
  externalPaymentId: varchar("externalPaymentId", { length: 255 }), // Stripe transfer ID, PayPal transaction ID, etc.
  
  // Failure handling
  failureReason: text("failureReason"),
  retryCount: int("retryCount").default(0).notNull(),
  
  // Timestamps
  scheduledFor: timestamp("scheduledFor"),
  processedAt: timestamp("processedAt"),
  completedAt: timestamp("completedAt"),
  
  // Metadata
  metadata: json("metadata").$type<{
    earningsBreakdown?: Array<{
      trackId: number;
      trackTitle: string;
      amount: number;
    }>;
    [key: string]: unknown;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  writerProfileIdx: index("writer_profile_idx").on(table.writerProfileId),
  statusIdx: index("status_idx").on(table.status),
  scheduledForIdx: index("scheduled_for_idx").on(table.scheduledFor),
}));

export type WriterPayout = typeof writerPayouts.$inferSelect;
export type InsertWriterPayout = typeof writerPayouts.$inferInsert;

// ============================================================================
// SUBSCRIPTION CHANGES (UPGRADE/DOWNGRADE TRACKING)
// ============================================================================

export const subscriptionChanges = mysqlTable("subscription_changes", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: int("subscriptionId").notNull().references(() => subscriptions.id),
  fromPlan: mysqlEnum("fromPlan", ["free", "pro", "enterprise"]).notNull(),
  toPlan: mysqlEnum("toPlan", ["free", "pro", "enterprise"]).notNull(),
  fromBillingCycle: mysqlEnum("fromBillingCycle", ["monthly", "annual"]).notNull(),
  toBillingCycle: mysqlEnum("toBillingCycle", ["monthly", "annual"]).notNull(),
  proratedCredit: decimal("proratedCredit", { precision: 10, scale: 2 }).default("0.00"), // Credit applied
  effectiveDate: timestamp("effectiveDate").notNull(),
  reason: text("reason"), // User-provided reason for change
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  subscriptionIdIdx: index("subscription_change_subscriptionId_idx").on(table.subscriptionId),
}));

export type SubscriptionChange = typeof subscriptionChanges.$inferSelect;
export type InsertSubscriptionChange = typeof subscriptionChanges.$inferInsert;

// ============================================================================
// THIRD-PARTY DISTRIBUTION SYSTEM
// ============================================================================

/**
 * Distribution Platforms
 * Supported third-party streaming platforms for music distribution
 */
export const distributionPlatforms = mysqlTable("distribution_platforms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // "Spotify", "Apple Music", etc.
  slug: varchar("slug", { length: 100 }).notNull().unique(), // "spotify", "apple_music"
  logoUrl: text("logoUrl"),
  apiEndpoint: text("apiEndpoint"), // Placeholder for future API integration
  isActive: boolean("isActive").default(true).notNull(),
  
  // Platform-specific settings
  requiresIsrc: boolean("requiresIsrc").default(true).notNull(),
  requiresUpc: boolean("requiresUpc").default(false).notNull(),
  supportsPrerelease: boolean("supportsPrerelease").default(true).notNull(),
  
  // Metadata
  description: text("description"),
  websiteUrl: text("websiteUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DistributionPlatform = typeof distributionPlatforms.$inferSelect;
export type InsertDistributionPlatform = typeof distributionPlatforms.$inferInsert;

/**
 * Track Distribution
 * Tracks which platforms each track is distributed to
 */
export const trackDistributions = mysqlTable("track_distributions", {
  id: int("id").autoincrement().primaryKey(),
  trackId: int("trackId").notNull().references(() => bapTracks.id),
  platformId: int("platformId").notNull().references(() => distributionPlatforms.id),
  
  // Distribution status
  status: mysqlEnum("status", [
    "pending",      // Queued for distribution
    "processing",   // Being sent to platform
    "live",         // Successfully distributed
    "failed",       // Distribution failed
    "takedown",     // Removed from platform
  ]).default("pending").notNull(),
  
  // Platform-specific data
  platformTrackId: varchar("platformTrackId", { length: 255 }), // External platform's track ID
  platformUrl: text("platformUrl"), // Direct link to track on platform
  
  // Release scheduling
  releaseDate: timestamp("releaseDate"), // When to publish on this platform
  publishedAt: timestamp("publishedAt"), // When actually went live
  
  // Revenue tracking
  totalStreams: int("totalStreams").default(0).notNull(),
  totalEarnings: int("totalEarnings").default(0).notNull(), // In cents
  
  // Error handling
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0).notNull(),
  lastAttemptAt: timestamp("lastAttemptAt"),
  
  // Metadata
  distributionMetadata: json("distributionMetadata").$type<{
    territories?: string[]; // Countries where distributed
    pricing?: string; // "standard", "premium"
    [key: string]: unknown;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  trackIdIdx: index("track_id_idx").on(table.trackId),
  platformIdIdx: index("platform_id_idx").on(table.platformId),
  statusIdx: index("status_idx").on(table.status),
  uniqueTrackPlatform: index("unique_track_platform").on(table.trackId, table.platformId),
}));

export type TrackDistribution = typeof trackDistributions.$inferSelect;
export type InsertTrackDistribution = typeof trackDistributions.$inferInsert;

/**
 * Distribution Revenue
 * Track revenue from third-party platforms
 */
export const distributionRevenue = mysqlTable("distribution_revenue", {
  id: int("id").autoincrement().primaryKey(),
  trackDistributionId: int("trackDistributionId").notNull().references(() => trackDistributions.id),
  
  // Revenue period
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  // Metrics
  streams: int("streams").notNull(),
  grossRevenue: int("grossRevenue").notNull(), // In cents, before Boptone cut
  platformFee: int("platformFee").notNull(), // Platform's fee in cents
  boptoneFee: int("boptoneFee").notNull(), // Boptone's revenue share in cents
  artistRevenue: int("artistRevenue").notNull(), // What artist receives in cents
  
  // Revenue share percentages (based on subscription tier)
  boptoneSharePercent: decimal("boptoneSharePercent", { precision: 5, scale: 2 }).notNull(), // e.g., 10.00 for 10%
  
  // Payout tracking
  payoutStatus: mysqlEnum("payoutStatus", ["pending", "processing", "paid", "failed"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  trackDistributionIdIdx: index("track_distribution_id_idx").on(table.trackDistributionId),
  periodIdx: index("period_idx").on(table.periodStart, table.periodEnd),
}));

export type DistributionRevenue = typeof distributionRevenue.$inferSelect;
export type InsertDistributionRevenue = typeof distributionRevenue.$inferInsert;


// ============================================================================
// WORKFLOW AUTOMATION SYSTEM (PRO/ENTERPRISE FEATURE)
// ============================================================================

export const workflows = mysqlTable("workflows", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "paused", "draft"]).default("draft").notNull(),
  definition: json("definition").notNull(),
  category: mysqlEnum("category", ["fan_engagement", "release_automation", "revenue_tracking", "marketing", "collaboration", "custom"]).notNull(),
  tags: json("tags"),
  isTemplate: boolean("isTemplate").default(false).notNull(),
  templateSourceId: int("templateSourceId"),
  version: int("version").default(1).notNull(),
  totalRuns: int("totalRuns").default(0).notNull(),
  successfulRuns: int("successfulRuns").default(0).notNull(),
  failedRuns: int("failedRuns").default(0).notNull(),
  lastRunAt: timestamp("lastRunAt"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const workflowExecutions = mysqlTable("workflow_executions", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: int("workflowId").notNull().references(() => workflows.id),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed", "cancelled"]).default("pending").notNull(),
  triggeredBy: mysqlEnum("triggeredBy", ["webhook", "schedule", "event", "manual", "ai"]).notNull(),
  triggerData: json("triggerData"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  duration: int("duration"),
  errorMessage: text("errorMessage"),
  errorCode: varchar("errorCode", { length: 50 }),
  retryCount: int("retryCount").default(0).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const workflowExecutionLogs = mysqlTable("workflow_execution_logs", {
  id: int("id").autoincrement().primaryKey(),
  executionId: int("executionId").notNull().references(() => workflowExecutions.id),
  nodeId: varchar("nodeId", { length: 50 }).notNull(),
  nodeType: varchar("nodeType", { length: 50 }).notNull(),
  nodeSubtype: varchar("nodeSubtype", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["success", "failed", "skipped"]).notNull(),
  input: json("input"),
  output: json("output"),
  errorMessage: text("errorMessage"),
  errorStack: text("errorStack"),
  executedAt: timestamp("executedAt").notNull(),
  duration: int("duration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const workflowTriggers = mysqlTable("workflow_triggers", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: int("workflowId").notNull().references(() => workflows.id),
  type: mysqlEnum("type", ["webhook", "schedule", "event", "manual"]).notNull(),
  config: json("config").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  triggerCount: int("triggerCount").default(0).notNull(),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const workflowTemplates = mysqlTable("workflow_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["fan_engagement", "release_automation", "revenue_tracking", "marketing", "collaboration", "custom"]).notNull(),
  definition: json("definition").notNull(),
  tags: json("tags"),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  isOfficial: boolean("isOfficial").default(false).notNull(),
  createdBy: varchar("createdBy", { length: 255 }),
  usageCount: int("usageCount").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  ratingCount: int("ratingCount").default(0).notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  demoVideoUrl: text("demoVideoUrl"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const workflowHistory = mysqlTable("workflow_history", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: int("workflowId").notNull().references(() => workflows.id),
  version: int("version").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  definition: json("definition").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  changeDescription: text("changeDescription"),
  changedBy: varchar("changedBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type InsertWorkflowExecution = typeof workflowExecutions.$inferInsert;
export type WorkflowExecutionLog = typeof workflowExecutionLogs.$inferSelect;
export type InsertWorkflowExecutionLog = typeof workflowExecutionLogs.$inferInsert;
export type WorkflowTrigger = typeof workflowTriggers.$inferSelect;
export type InsertWorkflowTrigger = typeof workflowTriggers.$inferInsert;
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type InsertWorkflowTemplate = typeof workflowTemplates.$inferInsert;
export type WorkflowHistory = typeof workflowHistory.$inferSelect;
export type InsertWorkflowHistory = typeof workflowHistory.$inferInsert;

// ============================================================================
// ARTIST PAYOUT SYSTEM
// ============================================================================

/**
 * Payout Accounts - Artist bank accounts for withdrawals
 * Artists can add multiple bank accounts and set one as default
 */
export const payoutAccounts = mysqlTable("payout_accounts", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  
  // Bank account details (encrypted in production)
  accountHolderName: varchar("accountHolderName", { length: 255 }).notNull(),
  accountType: mysqlEnum("accountType", ["checking", "savings"]).default("checking").notNull(),
  routingNumber: varchar("routingNumber", { length: 20 }).notNull(),
  accountNumberLast4: varchar("accountNumberLast4", { length: 4 }).notNull(), // Only store last 4 digits
  accountNumberHash: varchar("accountNumberHash", { length: 255 }).notNull(), // Hash of full account number for duplicate detection
  
  // Bank information
  bankName: varchar("bankName", { length: 255 }),
  
  // Verification status
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "failed"]).default("pending").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  verificationMethod: varchar("verificationMethod", { length: 50 }), // "micro_deposits", "instant", "manual"
  
  // Account status
  isDefault: boolean("isDefault").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  
  // Metadata
  metadata: json("metadata").$type<{
    stripeExternalAccountId?: string; // Stripe external account ID for payouts
    [key: string]: unknown;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
}));

export type PayoutAccount = typeof payoutAccounts.$inferSelect;
export type InsertPayoutAccount = typeof payoutAccounts.$inferInsert;

/**
 * Payouts - Individual payout transactions to artists
 * Tracks both standard (free, next-day) and instant (1% fee, 1-hour) payouts
 */
export const payouts = mysqlTable("payouts", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  payoutAccountId: int("payoutAccountId").notNull().references(() => payoutAccounts.id),
  
  // Payout details
  amount: int("amount").notNull(), // In cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  // Payout type and fees
  payoutType: mysqlEnum("payoutType", ["standard", "instant"]).default("standard").notNull(),
  fee: int("fee").default(0).notNull(), // In cents (0 for standard, 1% for instant)
  netAmount: int("netAmount").notNull(), // Amount after fees, in cents
  
  // Status tracking
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending").notNull(),
  
  // Payment processing
  paymentProcessor: varchar("paymentProcessor", { length: 50 }).default("stripe"), // "stripe", "paypal", etc.
  externalPayoutId: varchar("externalPayoutId", { length: 255 }), // Stripe payout ID, PayPal transaction ID, etc.
  
  // Failure handling
  failureReason: text("failureReason"),
  failureCode: varchar("failureCode", { length: 50 }),
  retryCount: int("retryCount").default(0).notNull(),
  
  // Timestamps
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  scheduledFor: timestamp("scheduledFor"), // When payout should be processed
  processedAt: timestamp("processedAt"), // When payment processor started processing
  completedAt: timestamp("completedAt"), // When funds arrived in bank account
  estimatedArrival: timestamp("estimatedArrival"), // Expected arrival date
  
  // Metadata
  metadata: json("metadata").$type<{
    earningsBreakdown?: Array<{
      source: string; // "bap_streaming", "bopshop_sales", "tips", etc.
      amount: number;
    }>;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: unknown;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  statusIdx: index("status_idx").on(table.status),
  requestedAtIdx: index("requested_at_idx").on(table.requestedAt),
}));

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;

/**
 * Earnings Balance - Current available balance for each artist
 * Single source of truth for how much an artist can withdraw
 */
export const earningsBalance = mysqlTable("earnings_balance", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id).unique(),
  
  // Balance tracking (all in cents)
  totalEarnings: int("totalEarnings").default(0).notNull(), // Lifetime total earnings
  availableBalance: int("availableBalance").default(0).notNull(), // Current available to withdraw
  pendingBalance: int("pendingBalance").default(0).notNull(), // Earnings being processed (7-day hold for new accounts)
  withdrawnBalance: int("withdrawnBalance").default(0).notNull(), // Total withdrawn to date
  
  // Payout preferences
  payoutSchedule: mysqlEnum("payoutSchedule", ["daily", "weekly", "monthly", "manual"]).default("manual").notNull(),
  autoPayoutEnabled: boolean("autoPayoutEnabled").default(false).notNull(),
  autoPayoutThreshold: int("autoPayoutThreshold").default(2000).notNull(), // Minimum balance for auto-payout ($20.00)
  
  // Account holds (for fraud protection)
  isOnHold: boolean("isOnHold").default(false).notNull(),
  holdReason: text("holdReason"),
  holdUntil: timestamp("holdUntil"),
  
  // Last payout tracking
  lastPayoutAt: timestamp("lastPayoutAt"),
  lastPayoutAmount: int("lastPayoutAmount"),
  
  // Metadata
  metadata: json("metadata").$type<{
    earningsSources?: {
      bapStreaming?: number;
      thirdPartyDistribution?: number;
      bopshopSales?: number;
      tips?: number;
      memberships?: number;
      syncLicensing?: number;
      liveEvents?: number;
    };
    [key: string]: unknown;
  }>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
}));

export type EarningsBalance = typeof earningsBalance.$inferSelect;
export type InsertEarningsBalance = typeof earningsBalance.$inferInsert;



// ============================================================================
// INVISIBLE FLYWHEEL SYSTEM (Strategic Moat)
// ============================================================================

/**
 * FLYWHEEL CORE PRINCIPLE:
 * "If artists make money, Boptone makes money"
 * 
 * This system amplifies artist revenue through network effects:
 * - 1% of all streams fund growth initiatives (network pool)
 * - Artists get discovery bonuses when their fans find other artists (2% for 30 days)
 * - Milestone achievements trigger automated promotional boosts
 * - Super Fans (stream 3+ artists) generate 5% revenue multipliers
 * - Artists never see mechanics, only benefits ("magic")
 * 
 * Result: Positive-sum ecosystem where every artist benefits as platform grows
 */

/**
 * Network Pool - 1% of all BAP streams fund growth initiatives
 * Separate from platform fee (artists still get 90%, platform gets 9%, pool gets 1%)
 * Pool funds: milestone boosts, discovery bonuses, Super Fan multipliers
 */
export const flywheelNetworkPool = mysqlTable("flywheel_network_pool", {
  id: int("id").autoincrement().primaryKey(),
  
  // Contribution tracking
  streamId: int("streamId").notNull().references(() => bapStreams.id),
  trackId: int("trackId").notNull().references(() => bapTracks.id),
  contributionAmount: int("contributionAmount").notNull(), // 1% of stream price in cents
  
  // Pool allocation (what this contribution funded)
  allocatedTo: mysqlEnum("allocatedTo", ["milestone_boost", "discovery_bonus", "superfan_multiplier", "unallocated"]).default("unallocated").notNull(),
  allocationId: int("allocationId"), // Reference to specific boost/bonus record
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  streamIdIdx: index("stream_id_idx").on(table.streamId),
  trackIdIdx: index("track_id_idx").on(table.trackId),
  allocatedToIdx: index("allocated_to_idx").on(table.allocatedTo),
}));

export type FlywheelNetworkPool = typeof flywheelNetworkPool.$inferSelect;
export type InsertFlywheelNetworkPool = typeof flywheelNetworkPool.$inferInsert;

/**
 * Discovery Tracking - Who discovered whom through Boptone
 * Enables 2% discovery bonuses: when Artist A's fans discover Artist B,
 * Artist A gets 2% of Artist B's streams for 30 days
 */
export const flywheelDiscoveryTracking = mysqlTable("flywheel_discovery_tracking", {
  id: int("id").autoincrement().primaryKey(),
  
  // Discovery relationship
  discovererArtistId: int("discovererArtistId").notNull().references(() => artistProfiles.id), // Artist A (gets bonus)
  discoveredArtistId: int("discoveredArtistId").notNull().references(() => artistProfiles.id), // Artist B (being discovered)
  fanUserId: int("fanUserId").notNull().references(() => users.id), // Fan who made the discovery
  
  // Discovery context
  source: mysqlEnum("source", ["discover_page", "artist_profile", "playlist", "search", "recommendation"]).notNull(),
  firstStreamId: int("firstStreamId").notNull().references(() => bapStreams.id), // First stream = discovery event
  
  // Bonus tracking
  bonusActive: boolean("bonusActive").default(true).notNull(), // False after 30 days
  bonusExpiresAt: timestamp("bonusExpiresAt").notNull(), // 30 days from discovery
  totalBonusEarned: int("totalBonusEarned").default(0).notNull(), // Total cents earned from this discovery
  
  discoveredAt: timestamp("discoveredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  discovererIdx: index("discoverer_idx").on(table.discovererArtistId),
  discoveredIdx: index("discovered_idx").on(table.discoveredArtistId),
  fanIdx: index("fan_idx").on(table.fanUserId),
  bonusActiveIdx: index("bonus_active_idx").on(table.bonusActive),
}));

export type FlywheelDiscoveryTracking = typeof flywheelDiscoveryTracking.$inferSelect;
export type InsertFlywheelDiscoveryTracking = typeof flywheelDiscoveryTracking.$inferInsert;

/**
 * Artist Milestones - Track achievement of stream count milestones
 * Triggers automated promotional boosts (Discover featuring, email blasts, social promotion)
 */
export const flywheelMilestones = mysqlTable("flywheel_milestones", {
  id: int("id").autoincrement().primaryKey(),
  
  // Milestone details
  artistProfileId: int("artistProfileId").notNull().references(() => artistProfiles.id),
  milestoneType: mysqlEnum("milestoneType", ["1k_streams", "10k_streams", "50k_streams", "100k_streams", "500k_streams", "1m_streams"]).notNull(),
  streamCount: int("streamCount").notNull(), // Actual count when milestone was hit
  
  // Automated boost triggered
  boostTriggered: boolean("boostTriggered").default(false).notNull(),
  boostType: mysqlEnum("boostType", ["discover_featured", "email_blast", "social_promotion", "playlist_inclusion"]),
  boostStartDate: timestamp("boostStartDate"),
  boostEndDate: timestamp("boostEndDate"), // 7-day boost window
  
  // Impact tracking
  additionalStreams: int("additionalStreams").default(0).notNull(), // Streams gained from boost
  additionalRevenue: int("additionalRevenue").default(0).notNull(), // Revenue gained in cents
  
  achievedAt: timestamp("achievedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistProfileId),
  milestoneTypeIdx: index("milestone_type_idx").on(table.milestoneType),
  boostTriggeredIdx: index("boost_triggered_idx").on(table.boostTriggered),
}));

export type FlywheelMilestone = typeof flywheelMilestones.$inferSelect;
export type InsertFlywheelMilestone = typeof flywheelMilestones.$inferInsert;

/**
 * Super Fans - Fans who stream 3+ different artists in 30 days
 * Super Fan streams generate 5% revenue multiplier for artists (funded by network pool)
 */
export const flywheelSuperFans = mysqlTable("flywheel_super_fans", {
  id: int("id").autoincrement().primaryKey(),
  
  // Super Fan details
  userId: int("userId").notNull().references(() => users.id),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  
  // Qualification tracking
  uniqueArtistsStreamed: int("uniqueArtistsStreamed").default(0).notNull(), // Count of unique artists in last 30 days
  totalStreamsLast30Days: int("totalStreamsLast30Days").default(0).notNull(),
  qualifiedAt: timestamp("qualifiedAt").defaultNow().notNull(),
  lastStreamAt: timestamp("lastStreamAt").defaultNow().notNull(),
  
  // Impact tracking
  multiplierStreams: int("multiplierStreams").default(0).notNull(), // Total streams with 5% boost
  totalBonusGenerated: int("totalBonusGenerated").default(0).notNull(), // Total bonus cents generated for artists
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
  lastStreamIdx: index("last_stream_idx").on(table.lastStreamAt),
}));

export type FlywheelSuperFan = typeof flywheelSuperFans.$inferSelect;
export type InsertFlywheelSuperFan = typeof flywheelSuperFans.$inferInsert;

/**
 * Discovery Bonuses - 2% bonus payments to artists whose fans discovered other artists
 * Artist A's fan discovers Artist B → Artist A gets 2% of Artist B's streams for 30 days
 */
export const flywheelDiscoveryBonuses = mysqlTable("flywheel_discovery_bonuses", {
  id: int("id").autoincrement().primaryKey(),
  
  // Bonus details
  discoveryTrackingId: int("discoveryTrackingId").notNull().references(() => flywheelDiscoveryTracking.id),
  discovererArtistId: int("discovererArtistId").notNull().references(() => artistProfiles.id), // Artist getting bonus
  discoveredArtistId: int("discoveredArtistId").notNull().references(() => artistProfiles.id), // Artist being streamed
  
  // Stream that generated bonus
  streamId: int("streamId").notNull().references(() => bapStreams.id),
  trackId: int("trackId").notNull().references(() => bapTracks.id),
  
  // Bonus calculation
  baseRevenue: int("baseRevenue").notNull(), // Artist B's revenue from stream in cents
  bonusAmount: int("bonusAmount").notNull(), // 2% of baseRevenue in cents
  fundedBy: mysqlEnum("fundedBy", ["network_pool"]).default("network_pool").notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "paid", "expired"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  discovererIdx: index("discoverer_idx").on(table.discovererArtistId),
  discoveredIdx: index("discovered_idx").on(table.discoveredArtistId),
  streamIdIdx: index("stream_id_idx").on(table.streamId),
  statusIdx: index("status_idx").on(table.status),
}));

export type FlywheelDiscoveryBonus = typeof flywheelDiscoveryBonuses.$inferSelect;
export type InsertFlywheelDiscoveryBonus = typeof flywheelDiscoveryBonuses.$inferInsert;

/**
 * Milestone Boosts - Automated promotional boosts triggered by milestone achievements
 * Funded by network pool, managed by platform, invisible to artists (just shows as notification)
 */
export const flywheelBoosts = mysqlTable("flywheel_boosts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Boost details
  milestoneId: int("milestoneId").notNull().references(() => flywheelMilestones.id),
  artistProfileId: int("artistProfileId").notNull().references(() => artistProfiles.id),
  
  // Boost configuration
  boostType: mysqlEnum("boostType", ["discover_featured", "email_blast", "social_promotion", "playlist_inclusion"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(), // 7-day boost window
  
  // Targeting
  targetGenres: json("targetGenres").$type<string[]>(), // Genre-specific targeting
  targetAudience: mysqlEnum("targetAudience", ["all", "genre_fans", "similar_artists_fans"]).default("all").notNull(),
  
  // Impact tracking
  impressions: int("impressions").default(0).notNull(), // How many people saw the boost
  clicks: int("clicks").default(0).notNull(), // How many clicked through
  newStreams: int("newStreams").default(0).notNull(), // Streams generated from boost
  newFollowers: int("newFollowers").default(0).notNull(), // Followers gained
  revenueGenerated: int("revenueGenerated").default(0).notNull(), // Revenue in cents
  
  // Cost tracking (funded by network pool)
  poolCostCents: int("poolCostCents").default(0).notNull(), // How much pool budget was used
  
  // Status
  status: mysqlEnum("status", ["scheduled", "active", "completed", "canceled"]).default("scheduled").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistProfileId),
  statusIdx: index("status_idx").on(table.status),
  startDateIdx: index("start_date_idx").on(table.startDate),
}));

export type FlywheelBoost = typeof flywheelBoosts.$inferSelect;
export type InsertFlywheelBoost = typeof flywheelBoosts.$inferInsert;



// ============================================================================
// PRODUCT REVIEW SYSTEM (BopShop Trust & Social Proof)
// ============================================================================
// Note: productReviews table already exists earlier in schema (line ~600)
// Review photos and helpfulness votes added here:

/**
 * Review Photos table
 * 
 * Stores photos uploaded with product reviews.
 * Includes AI-generated alt-text for accessibility and SEO.
 */
export const reviewPhotos = mysqlTable("review_photos", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: int("reviewId").notNull().references(() => productReviews.id),
  
  // Photo storage
  photoUrl: varchar("photoUrl", { length: 500 }).notNull(), // S3 URL
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }), // Optimized thumbnail
  
  // AI-generated accessibility
  altText: text("altText").notNull(), // Auto-generated via AI vision model
  altTextConfidence: decimal("altTextConfidence", { precision: 3, scale: 2 }), // 0.00 to 1.00
  
  // Display order
  displayOrder: int("displayOrder").default(0).notNull(),
  
  // Metadata
  fileSize: int("fileSize"), // Bytes
  mimeType: varchar("mimeType", { length: 50 }),
  width: int("width"),
  height: int("height"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  reviewIdIdx: index("review_id_idx").on(table.reviewId),
  displayOrderIdx: index("display_order_idx").on(table.displayOrder),
}));

export type ReviewPhoto = typeof reviewPhotos.$inferSelect;
export type InsertReviewPhoto = typeof reviewPhotos.$inferInsert;

/**
 * Review Helpfulness Votes table
 * 
 * Tracks which users found which reviews helpful.
 * Prevents duplicate voting and enables "most helpful" sorting.
 */
export const reviewHelpfulnessVotes = mysqlTable("review_helpfulness_votes", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: int("reviewId").notNull().references(() => productReviews.id),
  userId: int("userId").notNull().references(() => users.id),
  
  // Vote type
  voteType: mysqlEnum("voteType", ["helpful", "unhelpful"]).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  reviewIdIdx: index("review_id_idx").on(table.reviewId),
  userIdIdx: index("user_id_idx").on(table.userId),
  uniqueUserReview: index("unique_user_review").on(table.userId, table.reviewId), // Prevent duplicate votes
}));

export type ReviewHelpfulnessVote = typeof reviewHelpfulnessVotes.$inferSelect;
export type InsertReviewHelpfulnessVote = typeof reviewHelpfulnessVotes.$inferInsert;

// ============================================================================
// TASK CONTRACT SYSTEM (Ironclad Agent Handoffs)
// ============================================================================

/**
 * Task Contracts table
 * 
 * Stores all task contracts for agent handoffs.
 * Enforces ironclad contract system for preventing silent divergence.
 */
export const taskContracts = mysqlTable("task_contracts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  goal: text("goal").notNull(),
  acceptedOutputs: text("acceptedOutputs").notNull(), // JSON string
  knownRisks: text("knownRisks").notNull(), // JSON string
  nextAction: text("nextAction").notNull(),
  constraints: text("constraints").notNull(), // JSON string
  priority: mysqlEnum("priority", ["critical", "high", "medium", "low"]).notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "completed", "failed", "rejected"]).notNull(),
  createdBy: varchar("createdBy", { length: 255 }).notNull(),
  acceptedBy: varchar("acceptedBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
  completedAt: timestamp("completedAt"),
  actualOutputs: text("actualOutputs"), // JSON string
  failureReason: text("failureReason"),
  rejectionReason: text("rejectionReason"),
  context: text("context"), // JSON string
  parentContractId: varchar("parentContractId", { length: 255 }),
  childContractIds: text("childContractIds"), // JSON array string
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  createdByIdx: index("created_by_idx").on(table.createdBy),
  acceptedByIdx: index("accepted_by_idx").on(table.acceptedBy),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type TaskContract = typeof taskContracts.$inferSelect;
export type InsertTaskContract = typeof taskContracts.$inferInsert;

/**
 * Contract Audit Log table
 * 
 * Stores all handoff events for debugging and auditing.
 */
export const contractAuditLog = mysqlTable("contract_audit_log", {
  id: varchar("id", { length: 255 }).primaryKey(),
  contractId: varchar("contractId", { length: 255 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  fromAgentId: varchar("fromAgentId", { length: 255 }).notNull(),
  toAgentId: varchar("toAgentId", { length: 255 }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  validationResult: text("validationResult"), // JSON string
  metadata: text("metadata"), // JSON string
}, (table) => ({
  contractIdIdx: index("contract_id_idx").on(table.contractId),
  timestampIdx: index("timestamp_idx").on(table.timestamp),
  actionIdx: index("action_idx").on(table.action),
}));

export type ContractAuditLog = typeof contractAuditLog.$inferSelect;
export type InsertContractAuditLog = typeof contractAuditLog.$inferInsert;

// ============================================================================
// AI CONTENT DETECTION & MODERATION
// ============================================================================

/**
 * AI Detection Results
 * Stores results from AI detection API (Hive AI) for uploaded tracks
 */
export const aiDetectionResults = mysqlTable("ai_detection_results", {
  id: int("id").autoincrement().primaryKey(),
  trackId: int("trackId").notNull().references(() => bapTracks.id),
  
  // Detection results
  isAiGenerated: boolean("isAiGenerated"), // null = not yet analyzed
  confidenceScore: decimal("confidenceScore", { precision: 5, scale: 2 }), // 0.00 to 100.00
  detectedEngine: varchar("detectedEngine", { length: 100 }), // e.g., "Suno AI", "Udio AI", "Unknown"
  
  // Audio analysis
  musicIsAi: boolean("musicIsAi"), // Is the music AI-generated?
  musicConfidence: decimal("musicConfidence", { precision: 5, scale: 2 }),
  vocalsAreAi: boolean("vocalsAreAi"), // Are the vocals AI-generated?
  vocalsConfidence: decimal("vocalsConfidence", { precision: 5, scale: 2 }),
  
  // API response metadata
  apiProvider: varchar("apiProvider", { length: 50 }).default("huggingface").notNull(), // "huggingface", "manual", etc.
  rawResponse: json("rawResponse").$type<Record<string, any>>(), // Full API response for debugging
  
  // Timestamps
  analyzedAt: timestamp("analyzedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  trackIdIdx: index("track_id_idx").on(table.trackId),
  isAiGeneratedIdx: index("is_ai_generated_idx").on(table.isAiGenerated),
  analyzedAtIdx: index("analyzed_at_idx").on(table.analyzedAt),
}));

export type AiDetectionResult = typeof aiDetectionResults.$inferSelect;
export type InsertAiDetectionResult = typeof aiDetectionResults.$inferInsert;

/**
 * Content Moderation Queue
 * Tracks content flagged for manual review by admins
 */
export const contentModerationQueue = mysqlTable("content_moderation_queue", {
  id: int("id").autoincrement().primaryKey(),
  trackId: int("trackId").notNull().references(() => bapTracks.id),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  
  // Flagging reason
  flagReason: mysqlEnum("flagReason", [
    "ai_detection_high_confidence", // AI detection score > 80%
    "ai_detection_medium_confidence", // AI detection score 50-80%
    "prohibited_tool_disclosed", // Artist disclosed Suno/Udio in upload form
    "manual_report", // User reported the track
    "copyright_claim", // DMCA/copyright claim
    "other"
  ]).notNull(),
  flagDetails: text("flagDetails"), // Additional context
  
  // AI detection link
  aiDetectionId: int("aiDetectionId").references(() => aiDetectionResults.id),
  
  // Moderation status
  status: mysqlEnum("status", [
    "pending", // Awaiting review
    "under_review", // Admin is reviewing
    "approved", // Content is legitimate
    "removed", // Content removed for policy violation
    "appealed", // Artist appealed the decision
    "appeal_approved", // Appeal was successful
    "appeal_rejected" // Appeal was rejected
  ]).default("pending").notNull(),
  
  // Moderation decision
  reviewedBy: int("reviewedBy").references(() => users.id), // Admin who reviewed
  reviewNotes: text("reviewNotes"), // Admin's notes
  reviewedAt: timestamp("reviewedAt"),
  
  // Strike tracking (TOS Section 9.12.6)
  strikeIssued: boolean("strikeIssued").default(false).notNull(),
  strikeNumber: int("strikeNumber"), // 1, 2, or 3
  
  // Timestamps
  flaggedAt: timestamp("flaggedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  trackIdIdx: index("track_id_idx").on(table.trackId),
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  statusIdx: index("status_idx").on(table.status),
  flaggedAtIdx: index("flagged_at_idx").on(table.flaggedAt),
}));

export type ContentModerationQueue = typeof contentModerationQueue.$inferSelect;
export type InsertContentModerationQueue = typeof contentModerationQueue.$inferInsert;

/**
 * Artist Strike History
 * Tracks AI policy violations per artist (TOS Section 9.12.6: 3-Strike Policy)
 */
export const artistStrikeHistory = mysqlTable("artist_strike_history", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  
  // Strike details
  strikeNumber: int("strikeNumber").notNull(), // 1, 2, or 3
  reason: text("reason").notNull(), // Why the strike was issued
  trackId: int("trackId").references(() => bapTracks.id), // Related track (if applicable)
  moderationQueueId: int("moderationQueueId").references(() => contentModerationQueue.id),
  
  // Penalty
  penalty: mysqlEnum("penalty", [
    "warning", // 1st strike: warning
    "suspension", // 2nd strike: 30-day suspension
    "permanent_ban" // 3rd strike: permanent ban + funds forfeiture
  ]).notNull(),
  suspensionEndsAt: timestamp("suspensionEndsAt"), // For 2nd strike
  
  // Strike issued by
  issuedBy: int("issuedBy").notNull().references(() => users.id), // Admin who issued strike
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  
  // Appeal
  appealStatus: mysqlEnum("appealStatus", ["none", "pending", "approved", "rejected"]).default("none").notNull(),
  appealReason: text("appealReason"),
  appealedAt: timestamp("appealedAt"),
  appealReviewedBy: int("appealReviewedBy").references(() => users.id),
  appealReviewedAt: timestamp("appealReviewedAt"),
  appealNotes: text("appealNotes"), // Admin's notes on appeal decision
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  strikeNumberIdx: index("strike_number_idx").on(table.strikeNumber),
  issuedAtIdx: index("issued_at_idx").on(table.issuedAt),
}));

export type ArtistStrikeHistory = typeof artistStrikeHistory.$inferSelect;
export type InsertArtistStrikeHistory = typeof artistStrikeHistory.$inferInsert;

// ============================================================================
// COOKIE PREFERENCES
// ============================================================================

/**
 * User Cookie Preferences
 * Stores cookie consent preferences for logged-in users
 * Syncs across devices for consistent privacy settings
 */
export const userCookiePreferences = mysqlTable("user_cookie_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Cookie categories (essential cookies are always enabled)
  analyticsCookies: int("analyticsCookies").default(0).notNull(), // 0 = disabled, 1 = enabled
  marketingCookies: int("marketingCookies").default(0).notNull(), // 0 = disabled, 1 = enabled
  
  // Metadata
  consentGivenAt: timestamp("consentGivenAt").defaultNow().notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().onUpdateNow().notNull(),
  
  // Device/browser info (for audit purposes)
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type UserCookiePreferences = typeof userCookiePreferences.$inferSelect;
export type InsertUserCookiePreferences = typeof userCookiePreferences.$inferInsert;

// ============================================================================
// POST-PURCHASE AUTOMATION
// ============================================================================

/**
 * Cart Events
 * Tracks cart interactions for abandoned cart detection
 */
export const cartEvents = mysqlTable("cart_events", {
  id: int("id").autoincrement().primaryKey(),
  
  // User identification (null for guests)
  userId: int("userId").references(() => users.id),
  sessionId: varchar("sessionId", { length: 255 }).notNull(), // For guest tracking
  
  // Event details
  eventType: mysqlEnum("eventType", ["cart_viewed", "item_added", "item_removed", "checkout_started", "checkout_abandoned", "checkout_completed"]).notNull(),
  productId: int("productId").references(() => products.id),
  variantId: int("variantId").references(() => productVariants.id),
  quantity: int("quantity"),
  
  // Cart snapshot (for abandoned cart emails)
  cartSnapshot: json("cartSnapshot").$type<{
    items: Array<{
      productId: number;
      variantId?: number;
      name: string;
      imageUrl?: string;
      price: number;
      quantity: number;
    }>;
    subtotal: number;
    currency: string;
  }>(),
  
  // Metadata
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  referrer: text("referrer"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  sessionIdIdx: index("session_id_idx").on(table.sessionId),
  eventTypeIdx: index("event_type_idx").on(table.eventType),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type CartEvent = typeof cartEvents.$inferSelect;
export type InsertCartEvent = typeof cartEvents.$inferInsert;

/**
 * Email Logs
 * Complete audit trail of all transactional emails sent
 */
export const emailLogs = mysqlTable("email_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Email details
  emailType: mysqlEnum("emailType", [
    "order_confirmation",
    "abandoned_cart",
    "shipping_in_transit",
    "shipping_out_for_delivery",
    "shipping_delivered",
    "review_request",
  ]).notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  recipientName: varchar("recipientName", { length: 255 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  
  // Status tracking
  status: mysqlEnum("status", ["queued", "sent", "failed"]).notNull(),
  messageId: varchar("messageId", { length: 255 }), // From email provider
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0).notNull(),
  
  // Metadata
  metadata: json("metadata").$type<Record<string, any>>(), // Order ID, cart ID, etc.
  
  // Timestamps
  queuedAt: timestamp("queuedAt"),
  sentAt: timestamp("sentAt"),
  failedAt: timestamp("failedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  emailTypeIdx: index("email_type_idx").on(table.emailType),
  recipientEmailIdx: index("recipient_email_idx").on(table.recipientEmail),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;

/**
 * Scheduled Jobs
 * Background job queue for timed emails and automation
 */
export const scheduledJobs = mysqlTable("scheduled_jobs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Job details
  jobType: mysqlEnum("jobType", [
    "send_order_confirmation",
    "send_abandoned_cart",
    "send_shipping_update",
    "send_review_request",
  ]).notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(),
  payload: json("payload").$type<Record<string, any>>().notNull(),
  
  // Status tracking
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  attempts: int("attempts").default(0).notNull(),
  maxAttempts: int("maxAttempts").default(3).notNull(),
  lastAttemptAt: timestamp("lastAttemptAt"),
  errorMessage: text("errorMessage"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  jobTypeIdx: index("job_type_idx").on(table.jobType),
  statusIdx: index("status_idx").on(table.status),
  scheduledForIdx: index("scheduled_for_idx").on(table.scheduledFor),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type ScheduledJob = typeof scheduledJobs.$inferSelect;
export type InsertScheduledJob = typeof scheduledJobs.$inferInsert;


// ============================================================================
// BOPIXEL™ - ENTERPRISE TRACKING SYSTEM
// ============================================================================

/**
 * Pixel Events
 * Raw tracking events from BOPixel JavaScript SDK
 */
export const pixelEvents = mysqlTable("pixel_events", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  
  // Event identification
  eventId: varchar("eventId", { length: 64 }).notNull().unique(),
  pixelUserId: varchar("pixelUserId", { length: 64 }).notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  
  // Artist association
  artistId: int("artistId").references(() => artistProfiles.id),
  
  // Event details
  eventType: varchar("eventType", { length: 50 }).notNull(), // page_view, product_viewed, purchase, etc.
  eventName: varchar("eventName", { length: 100 }),
  
  // Page context
  pageUrl: text("pageUrl"),
  pageTitle: varchar("pageTitle", { length: 255 }),
  referrer: text("referrer"),
  
  // UTM parameters
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  utmContent: varchar("utmContent", { length: 100 }),
  utmTerm: varchar("utmTerm", { length: 100 }),
  
  // Device & browser
  deviceType: varchar("deviceType", { length: 20 }), // mobile, desktop, tablet
  browser: varchar("browser", { length: 50 }),
  os: varchar("os", { length: 50 }),
  
  // Location
  country: varchar("country", { length: 2 }),
  region: varchar("region", { length: 100 }),
  city: varchar("city", { length: 100 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  
  // Technical
  userAgent: text("userAgent"),
  
  // Custom data
  customData: json("customData").$type<Record<string, any>>(),
  
  // E-commerce
  revenue: decimal("revenue", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  productId: int("productId").references(() => products.id),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  pixelUserIdx: index("pixel_user_idx").on(table.pixelUserId),
  sessionIdx: index("session_idx").on(table.sessionId),
  artistIdx: index("artist_idx").on(table.artistId),
  eventTypeIdx: index("event_type_idx").on(table.eventType),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  productIdx: index("product_idx").on(table.productId),
}));

export type PixelEvent = typeof pixelEvents.$inferSelect;
export type InsertPixelEvent = typeof pixelEvents.$inferInsert;

/**
 * Pixel Users
 * Anonymous user profiles tracked by BOPixel
 */
export const pixelUsers = mysqlTable("pixel_users", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  
  // User identification
  pixelUserId: varchar("pixelUserId", { length: 64 }).notNull().unique(),
  userId: int("userId").references(() => users.id), // Linked when user logs in
  
  // Activity tracking
  firstSeen: timestamp("firstSeen").defaultNow().notNull(),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  totalEvents: int("totalEvents").default(0).notNull(),
  totalSessions: int("totalSessions").default(0).notNull(),
  totalRevenue: decimal("totalRevenue", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Device fingerprint (privacy-compliant)
  deviceFingerprint: varchar("deviceFingerprint", { length: 255 }),
  
  // Privacy & consent
  consentStatus: mysqlEnum("consentStatus", ["unknown", "granted", "denied"]).default("unknown").notNull(),
  consentTimestamp: timestamp("consentTimestamp"),
  privacyTier: mysqlEnum("privacyTier", ["strict", "moderate", "permissive"]).default("permissive").notNull(),
  
  // Location (for privacy tier determination)
  country: varchar("country", { length: 2 }),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  consentIdx: index("consent_idx").on(table.consentStatus),
  countryIdx: index("country_idx").on(table.country),
}));

export type PixelUser = typeof pixelUsers.$inferSelect;
export type InsertPixelUser = typeof pixelUsers.$inferInsert;

/**
 * Pixel Sessions
 * User sessions tracked by BOPixel
 */
export const pixelSessions = mysqlTable("pixel_sessions", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  
  // Session identification
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  pixelUserId: varchar("pixelUserId", { length: 64 }).notNull(),
  artistId: int("artistId").references(() => artistProfiles.id),
  
  // Session timing
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  durationSeconds: int("durationSeconds"),
  
  // Session activity
  pageViews: int("pageViews").default(0).notNull(),
  events: int("events").default(0).notNull(),
  converted: int("converted").default(0).notNull(), // 0 = false, 1 = true
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Session context
  landingPage: text("landingPage"),
  exitPage: text("exitPage"),
  referrer: text("referrer"),
  
  // UTM parameters
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  
  // Device & location
  country: varchar("country", { length: 2 }),
  deviceType: varchar("deviceType", { length: 20 }),
}, (table) => ({
  pixelUserIdx: index("pixel_user_idx").on(table.pixelUserId),
  artistIdx: index("artist_idx").on(table.artistId),
  startedAtIdx: index("started_at_idx").on(table.startedAt),
  convertedIdx: index("converted_idx").on(table.converted),
}));

export type PixelSession = typeof pixelSessions.$inferSelect;
export type InsertPixelSession = typeof pixelSessions.$inferInsert;

/**
 * Pixel Audiences
 * Custom audience segments created by artists
 */
export const pixelAudiences = mysqlTable("pixel_audiences", {
  id: int("id").autoincrement().primaryKey(),
  
  // Audience details
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Audience rules (JSON format)
  rules: json("rules").$type<Record<string, any>>().notNull(),
  
  // Audience size
  userCount: int("userCount").default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdx: index("artist_idx").on(table.artistId),
}));

export type PixelAudience = typeof pixelAudiences.$inferSelect;
export type InsertPixelAudience = typeof pixelAudiences.$inferInsert;

/**
 * Pixel Consent
 * GDPR/CCPA consent logs for compliance
 */
export const pixelConsent = mysqlTable("pixel_consent", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  
  // User identification
  pixelUserId: varchar("pixelUserId", { length: 64 }).notNull(),
  
  // Consent details
  consentType: mysqlEnum("consentType", ["analytics", "marketing", "functional"]).notNull(),
  consentStatus: mysqlEnum("consentStatus", ["granted", "denied"]).notNull(),
  consentMethod: varchar("consentMethod", { length: 50 }), // banner, settings, api
  
  // Technical details
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  pixelUserIdx: index("pixel_user_idx").on(table.pixelUserId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type PixelConsent = typeof pixelConsent.$inferSelect;
export type InsertPixelConsent = typeof pixelConsent.$inferInsert;

// ============================================================================
// AI ORCHESTRATOR TABLES
// ============================================================================

/**
 * AI Context
 * Stores unified artist context for AI features (Toney, Workflow Assistant, etc.)
 */
export const aiContext = mysqlTable("ai_context", {
  id: int("id").autoincrement().primaryKey(),
  
  // User reference
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Context data (JSON)
  contextData: json("contextData").$type<Record<string, any>>().notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastEnriched: timestamp("lastEnriched").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  lastEnrichedIdx: index("last_enriched_idx").on(table.lastEnriched),
}));

export type AIContext = typeof aiContext.$inferSelect;
export type InsertAIContext = typeof aiContext.$inferInsert;

/**
 * AI Events
 * Event bus for AI system to track user actions and trigger workflows
 */
export const aiEvents = mysqlTable("ai_events", {
  id: int("id").autoincrement().primaryKey(),
  
  // User reference
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Event details
  eventType: varchar("eventType", { length: 100 }).notNull(),
  eventData: json("eventData").$type<Record<string, any>>().notNull(),
  
  // Processing status
  processed: boolean("processed").default(false).notNull(),
  processedAt: timestamp("processedAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  processedIdx: index("processed_idx").on(table.processed),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  userProcessedIdx: index("user_processed_idx").on(table.userId, table.processed), // Composite for user event queries
}));

export type AIEvent = typeof aiEvents.$inferSelect;
export type InsertAIEvent = typeof aiEvents.$inferInsert;


/**
 * ========================================
 * FAN STREAMING WALLET SYSTEM (Layer 1)
 * ========================================
 * Core monetization layer for Boptone's "Music Business 2.0" model.
 * Fans preload $5-$20, streams debit at $0.01-$0.03 per play.
 * Artists get paid instantly (95%), Boptone takes 5% protocol fee.
 */

/**
 * Fan Wallets
 * Preloaded balance system for streaming payments
 */
export const fanWallets = mysqlTable("fan_wallets", {
  id: int("id").autoincrement().primaryKey(),
  
  // User reference (one wallet per user)
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Balance tracking (all amounts in cents)
  balance: int("balance").default(0).notNull(), // Current balance in cents
  lifetimeSpent: int("lifetimeSpent").default(0).notNull(), // Total amount spent on streams
  lifetimeTopups: int("lifetimeTopups").default(0).notNull(), // Total amount added to wallet
  
  // Auto-reload settings
  autoReloadEnabled: boolean("autoReloadEnabled").default(false).notNull(),
  autoReloadThreshold: int("autoReloadThreshold").default(500).notNull(), // Reload when balance < $5
  autoReloadAmount: int("autoReloadAmount").default(2000).notNull(), // Reload $20
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastTopupAt: timestamp("lastTopupAt"),
  lastDebitAt: timestamp("lastDebitAt"),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  balanceIdx: index("balance_idx").on(table.balance), // For low balance queries
  autoReloadIdx: index("auto_reload_idx").on(table.autoReloadEnabled, table.balance), // For auto-reload triggers
}));

export type FanWallet = typeof fanWallets.$inferSelect;
export type InsertFanWallet = typeof fanWallets.$inferInsert;

/**
 * Stream Debits
 * Per-stream payment tracking with protocol fee split
 */
export const streamDebits = mysqlTable("stream_debits", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  fanWalletId: int("fanWalletId").notNull().references(() => fanWallets.id, { onDelete: "cascade" }),
  streamId: int("streamId").notNull().references(() => bapStreams.id, { onDelete: "cascade" }),
  trackId: int("trackId").notNull().references(() => bapTracks.id, { onDelete: "cascade" }),
  artistId: int("artistId").notNull().references(() => artistProfiles.id, { onDelete: "cascade" }),
  
  // Payment amounts (all in cents)
  amount: int("amount").notNull(), // Total debit amount (1-3 cents per stream)
  balanceBefore: int("balanceBefore").notNull(), // Fan balance before debit
  balanceAfter: int("balanceAfter").notNull(), // Fan balance after debit
  
  // Fee split
  protocolFee: int("protocolFee").notNull(), // 5% to Boptone
  artistPayout: int("artistPayout").notNull(), // 95% to artist
  
  // Processing status
  processed: boolean("processed").default(false).notNull(), // Batch processing flag
  processedAt: timestamp("processedAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  fanWalletIdIdx: index("fan_wallet_id_idx").on(table.fanWalletId),
  streamIdIdx: index("stream_id_idx").on(table.streamId),
  trackIdIdx: index("track_id_idx").on(table.trackId),
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  processedIdx: index("processed_idx").on(table.processed),
  // Composite indexes for common queries
  fanWalletCreatedIdx: index("fan_wallet_created_idx").on(table.fanWalletId, table.createdAt),
  artistCreatedIdx: index("artist_created_idx").on(table.artistId, table.createdAt),
  processedCreatedIdx: index("processed_created_idx").on(table.processed, table.createdAt), // For batch processing
}));

export type StreamDebit = typeof streamDebits.$inferSelect;
export type InsertStreamDebit = typeof streamDebits.$inferInsert;

/**
 * Wallet Topups
 * Fan wallet recharge transactions (Stripe, PayPal, crypto)
 */
export const walletTopups = mysqlTable("wallet_topups", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  fanWalletId: int("fanWalletId").notNull().references(() => fanWallets.id, { onDelete: "cascade" }),
  
  // Payment details
  amount: int("amount").notNull(), // Amount in cents
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(), // "stripe", "paypal", "crypto"
  
  // Payment processor references
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  paypalTransactionId: varchar("paypalTransactionId", { length: 255 }),
  cryptoTxHash: varchar("cryptoTxHash", { length: 255 }),
  
  // Status tracking
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  failureReason: text("failureReason"),
  
  // Auto-reload flag
  isAutoReload: boolean("isAutoReload").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  failedAt: timestamp("failedAt"),
  refundedAt: timestamp("refundedAt"),
}, (table) => ({
  fanWalletIdIdx: index("fan_wallet_id_idx").on(table.fanWalletId),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  stripePaymentIntentIdIdx: index("stripe_payment_intent_id_idx").on(table.stripePaymentIntentId),
  // Composite for wallet transaction history
  fanWalletStatusIdx: index("fan_wallet_status_idx").on(table.fanWalletId, table.status),
  fanWalletCreatedIdx: index("fan_wallet_created_idx").on(table.fanWalletId, table.createdAt),
}));

export type WalletTopup = typeof walletTopups.$inferSelect;
export type InsertWalletTopup = typeof walletTopups.$inferInsert;

/**
 * Protocol Revenue
 * Boptone's 5% protocol fee tracking (for analytics and reporting)
 */
export const protocolRevenue = mysqlTable("protocol_revenue", {
  id: int("id").autoincrement().primaryKey(),
  
  // Revenue source
  source: varchar("source", { length: 50 }).notNull(), // "streaming", "ecommerce", "tips"
  sourceId: int("sourceId"), // Reference to streamDebit, order, etc.
  
  // Amount tracking (in cents)
  amount: int("amount").notNull(), // Protocol fee collected
  grossAmount: int("grossAmount").notNull(), // Total transaction amount
  
  // Artist reference (for reporting)
  artistId: int("artistId").references(() => artistProfiles.id, { onDelete: "set null" }),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  recordedDate: date("recordedDate").notNull(), // For daily/monthly aggregation
}, (table) => ({
  sourceIdx: index("source_idx").on(table.source),
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  recordedDateIdx: index("recorded_date_idx").on(table.recordedDate),
  // Composite for revenue reporting
  sourceArtistIdx: index("source_artist_idx").on(table.source, table.artistId),
  dateSourceIdx: index("date_source_idx").on(table.recordedDate, table.source),
}));

export type ProtocolRevenue = typeof protocolRevenue.$inferSelect;
export type InsertProtocolRevenue = typeof protocolRevenue.$inferInsert;


/**
 * ========================================
 * ARTIST SUBSCRIPTION SYSTEM
 * ========================================
 * Opt-in monthly subscriptions where fans pay artists directly
 * for unlimited streaming access to all their music.
 * Example: "Subscribe to Artist A for $5/month, stream all their music unlimited"
 */

/**
 * Artist Subscriptions
 * Artists create subscription tiers for fans
 */
export const artistSubscriptions = mysqlTable("artist_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Artist reference
  artistId: int("artistId").notNull().references(() => artistProfiles.id, { onDelete: "cascade" }),
  
  // Subscription details
  subscriptionName: varchar("subscriptionName", { length: 255 }).notNull(), // e.g., "All Access Pass", "VIP Fan Club"
  description: text("description"), // What fans get
  monthlyPrice: int("monthlyPrice").notNull(), // In cents (e.g., 500 = $5/month)
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Stats
  subscriberCount: int("subscriberCount").default(0).notNull(),
  totalRevenue: int("totalRevenue").default(0).notNull(), // Lifetime revenue in cents
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  isActiveIdx: index("is_active_idx").on(table.isActive),
  artistActiveIdx: index("artist_active_idx").on(table.artistId, table.isActive),
}));

export type ArtistSubscription = typeof artistSubscriptions.$inferSelect;
export type InsertArtistSubscription = typeof artistSubscriptions.$inferInsert;

/**
 * Fan Subscriptions
 * Fans subscribe to artists for unlimited streaming
 */
export const fanSubscriptions = mysqlTable("fan_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  artistSubscriptionId: int("artistSubscriptionId").notNull().references(() => artistSubscriptions.id, { onDelete: "cascade" }),
  artistId: int("artistId").notNull().references(() => artistProfiles.id, { onDelete: "cascade" }), // Denormalized for fast queries
  
  // Stripe subscription
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull(),
  
  // Status
  status: mysqlEnum("status", ["active", "cancelled", "expired", "past_due"]).default("active").notNull(),
  
  // Billing period
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  
  // Cancellation
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  cancelledAt: timestamp("cancelledAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  artistSubscriptionIdIdx: index("artist_subscription_id_idx").on(table.artistSubscriptionId),
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  statusIdx: index("status_idx").on(table.status),
  stripeSubscriptionIdIdx: index("stripe_subscription_id_idx").on(table.stripeSubscriptionId),
  // Composite indexes for common queries
  userStatusIdx: index("user_status_idx").on(table.userId, table.status),
  artistStatusIdx: index("artist_status_idx").on(table.artistId, table.status),
  userArtistIdx: index("user_artist_idx").on(table.userId, table.artistId), // Check if user subscribed to artist
}));

export type FanSubscription = typeof fanSubscriptions.$inferSelect;
export type InsertFanSubscription = typeof fanSubscriptions.$inferInsert;


/**
 * BopShop POD Fulfillment Settings
 * Tracks which POD provider (Printful/Printify/DIY) is used for each product
 */
export const productFulfillmentSettings = mysqlTable("product_fulfillment_settings", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  
  // Fulfillment mode
  fulfillmentMode: mysqlEnum("fulfillmentMode", ["printful", "printify", "diy"]).notNull(),
  
  // Printful fields
  printfulProductId: varchar("printfulProductId", { length: 255 }),
  printfulVariantId: varchar("printfulVariantId", { length: 255 }),
  
  // Printify fields
  printifyBlueprintId: varchar("printifyBlueprintId", { length: 255 }),
  printifyPrintProviderId: varchar("printifyPrintProviderId", { length: 255 }),
  printifyVariantId: varchar("printifyVariantId", { length: 255 }),
  
  // DIY fields
  diyInstructions: text("diyInstructions"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  productIdIdx: index("product_id_idx").on(table.productId),
  fulfillmentModeIdx: index("fulfillment_mode_idx").on(table.fulfillmentMode),
}));

export type ProductFulfillmentSetting = typeof productFulfillmentSettings.$inferSelect;
export type InsertProductFulfillmentSetting = typeof productFulfillmentSettings.$inferInsert;

/**
 * Artist Shipping Settings
 * Tracks whether artist uses Shippo or DIY shipping
 */
export const artistShippingSettings = mysqlTable("artist_shipping_settings", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  artistId: int("artistId").notNull().unique().references(() => artistProfiles.id, { onDelete: "cascade" }),
  
  // Shipping mode
  shippingMode: mysqlEnum("shippingMode", ["shippo", "diy"]).default("shippo").notNull(),
  
  // DIY shipping settings
  diyShippingType: mysqlEnum("diyShippingType", ["flat_rate", "free", "calculated"]),
  diyFlatRate: int("diyFlatRate"), // in cents
  
  // Liability acceptance
  acceptedLiability: boolean("acceptedLiability").default(false).notNull(),
  acceptedLiabilityDate: timestamp("acceptedLiabilityDate"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  shippingModeIdx: index("shipping_mode_idx").on(table.shippingMode),
}));

export type ArtistShippingSetting = typeof artistShippingSettings.$inferSelect;
export type InsertArtistShippingSetting = typeof artistShippingSettings.$inferInsert;

/**
 * Printful Orders
 * Tracks orders forwarded to Printful for fulfillment
 */
export const printfulOrders = mysqlTable("printful_orders", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
  
  // Printful order ID
  printfulOrderId: varchar("printfulOrderId", { length: 255 }).notNull().unique(),
  
  // Status
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "failed"]).default("pending").notNull(),
  
  // Tracking
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  trackingUrl: text("trackingUrl"),
  estimatedDeliveryDate: date("estimatedDeliveryDate"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orderIdIdx: index("order_id_idx").on(table.orderId),
  printfulOrderIdIdx: index("printful_order_id_idx").on(table.printfulOrderId),
  statusIdx: index("status_idx").on(table.status),
}));

export type PrintfulOrder = typeof printfulOrders.$inferSelect;
export type InsertPrintfulOrder = typeof printfulOrders.$inferInsert;

/**
 * Printify Orders
 * Tracks orders forwarded to Printify for fulfillment
 */
export const printifyOrders = mysqlTable("printify_orders", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
  
  // Printify order ID
  printifyOrderId: varchar("printifyOrderId", { length: 255 }).notNull().unique(),
  printProviderId: varchar("printProviderId", { length: 255 }).notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "failed"]).default("pending").notNull(),
  
  // Tracking
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  trackingUrl: text("trackingUrl"),
  estimatedDeliveryDate: date("estimatedDeliveryDate"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orderIdIdx: index("order_id_idx").on(table.orderId),
  printifyOrderIdIdx: index("printify_order_id_idx").on(table.printifyOrderId),
  printProviderIdIdx: index("print_provider_id_idx").on(table.printProviderId),
  statusIdx: index("status_idx").on(table.status),
}));

export type PrintifyOrder = typeof printifyOrders.$inferSelect;
export type InsertPrintifyOrder = typeof printifyOrders.$inferInsert;

/**
 * Shippo Shipments
 * Tracks shipping labels generated via Shippo
 */
export const shippoShipments = mysqlTable("shippo_shipments", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
  
  // Shippo IDs
  shippoShipmentId: varchar("shippoShipmentId", { length: 255 }).notNull().unique(),
  shippoTransactionId: varchar("shippoTransactionId", { length: 255 }).unique(),
  
  // Carrier info
  carrier: varchar("carrier", { length: 100 }), // USPS, FedEx, UPS
  serviceLevel: varchar("serviceLevel", { length: 100 }), // Priority, Ground, etc.
  
  // Tracking
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  trackingUrl: text("trackingUrl"),
  labelUrl: text("labelUrl"),
  
  // Cost
  cost: int("cost"), // in cents
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orderIdIdx: index("order_id_idx").on(table.orderId),
  shippoShipmentIdIdx: index("shippo_shipment_id_idx").on(table.shippoShipmentId),
  shippoTransactionIdIdx: index("shippo_transaction_id_idx").on(table.shippoTransactionId),
  trackingNumberIdx: index("tracking_number_idx").on(table.trackingNumber),
}));

export type ShippoShipment = typeof shippoShipments.$inferSelect;
export type InsertShippoShipment = typeof shippoShipments.$inferInsert;


// ============================================================================
// IP PROTECTION & CONTENT MODERATION (BopShop Expansion)
// ============================================================================

/**
 * IP Screening Results
 * Tracks AI-powered IP screening for product designs
 */
export const ipScreeningResults = mysqlTable("ip_screening_results", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  
  // Design info
  designUrl: varchar("designUrl", { length: 500 }).notNull(),
  
  // Screening status
  screeningStatus: mysqlEnum("screeningStatus", ["pending", "approved", "rejected", "flagged"]).default("pending").notNull(),
  
  // AI detection results
  aiConfidenceScore: decimal("aiConfidenceScore", { precision: 5, scale: 2 }), // 0.00 to 100.00
  detectedLogos: json("detectedLogos").$type<Array<{name: string; confidence: number}>>(),
  detectedCelebrities: json("detectedCelebrities").$type<Array<{name: string; confidence: number}>>(),
  detectedText: json("detectedText").$type<string[]>(),
  perceptualHashSimilarity: decimal("perceptualHashSimilarity", { precision: 5, scale: 2 }), // 0.00 to 100.00
  matchedCopyrightedImages: json("matchedCopyrightedImages").$type<Array<{name: string; similarity: number}>>(),
  
  // Flagged reason
  flaggedReason: text("flaggedReason"),
  
  // Human review
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  productIdIdx: index("product_id_idx").on(table.productId),
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  screeningStatusIdx: index("screening_status_idx").on(table.screeningStatus),
  aiConfidenceScoreIdx: index("ai_confidence_score_idx").on(table.aiConfidenceScore),
  reviewedByIdx: index("reviewed_by_idx").on(table.reviewedBy),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type IpScreeningResult = typeof ipScreeningResults.$inferSelect;
export type InsertIpScreeningResult = typeof ipScreeningResults.$inferInsert;

/**
 * IP Strikes
 * Tracks three-strike policy for IP infringement
 */
export const ipStrikes = mysqlTable("ip_strikes", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  productId: int("productId").references(() => products.id, { onDelete: "set null" }), // Product may be deleted
  
  // Strike info
  strikeNumber: int("strikeNumber").notNull(), // 1, 2, or 3
  strikeReason: text("strikeReason").notNull(),
  strikeDate: timestamp("strikeDate").defaultNow().notNull(),
  
  // Evidence
  designUrl: varchar("designUrl", { length: 500 }),
  evidenceUrl: varchar("evidenceUrl", { length: 500 }),
  
  // Resolution
  resolved: boolean("resolved").default(false).notNull(),
  resolvedBy: int("resolvedBy").references(() => users.id),
  resolvedAt: timestamp("resolvedAt"),
  resolutionNotes: text("resolutionNotes"),
  
  // Appeal
  appealSubmitted: boolean("appealSubmitted").default(false).notNull(),
  appealReason: text("appealReason"),
  appealDate: timestamp("appealDate"),
  appealDecision: mysqlEnum("appealDecision", ["pending", "approved", "rejected"]),
  appealDecisionDate: timestamp("appealDecisionDate"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  productIdIdx: index("product_id_idx").on(table.productId),
  strikeNumberIdx: index("strike_number_idx").on(table.strikeNumber),
  strikeDateIdx: index("strike_date_idx").on(table.strikeDate),
  resolvedIdx: index("resolved_idx").on(table.resolved),
  appealSubmittedIdx: index("appeal_submitted_idx").on(table.appealSubmitted),
  artistStrikeNumberIdx: index("artist_strike_number_idx").on(table.artistId, table.strikeNumber), // Composite for counting strikes
}));

export type IpStrike = typeof ipStrikes.$inferSelect;
export type InsertIpStrike = typeof ipStrikes.$inferInsert;

/**
 * DMCA Notices
 * Tracks DMCA takedown notices and counter-notices
 */
export const dmcaNotices = mysqlTable("dmca_notices", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  productId: int("productId").references(() => products.id, { onDelete: "set null" }), // Product may be deleted
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  
  // Complainant info
  complainantName: varchar("complainantName", { length: 255 }).notNull(),
  complainantEmail: varchar("complainantEmail", { length: 320 }).notNull(),
  complainantCompany: varchar("complainantCompany", { length: 255 }),
  complainantAddress: text("complainantAddress"),
  
  // Infringement details
  infringementDescription: text("infringementDescription").notNull(),
  copyrightedWorkDescription: text("copyrightedWorkDescription").notNull(),
  evidenceUrl: varchar("evidenceUrl", { length: 500 }),
  
  // Notice details
  noticeDate: timestamp("noticeDate").defaultNow().notNull(),
  digitalSignature: text("digitalSignature"), // "I declare under penalty of perjury..."
  
  // Status
  status: mysqlEnum("status", ["pending", "takedown", "counter_notice", "resolved", "rejected"]).default("pending").notNull(),
  
  // Action taken
  actionTaken: text("actionTaken"),
  actionDate: timestamp("actionDate"),
  actionBy: int("actionBy").references(() => users.id),
  
  // Counter-notice (if artist disputes)
  counterNoticeSubmitted: boolean("counterNoticeSubmitted").default(false).notNull(),
  counterNoticeReason: text("counterNoticeReason"),
  counterNoticeDate: timestamp("counterNoticeDate"),
  counterNoticeSignature: text("counterNoticeSignature"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  productIdIdx: index("product_id_idx").on(table.productId),
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  statusIdx: index("status_idx").on(table.status),
  noticeDateIdx: index("notice_date_idx").on(table.noticeDate),
  counterNoticeSubmittedIdx: index("counter_notice_submitted_idx").on(table.counterNoticeSubmitted),
  complainantEmailIdx: index("complainant_email_idx").on(table.complainantEmail),
}));

export type DmcaNotice = typeof dmcaNotices.$inferSelect;
export type InsertDmcaNotice = typeof dmcaNotices.$inferInsert;

/**
 * Known Copyrighted Images
 * Database of copyrighted images for perceptual hashing comparison
 */
export const knownCopyrightedImages = mysqlTable("known_copyrighted_images", {
  id: int("id").autoincrement().primaryKey(),
  
  // Image info
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Nike Swoosh", "Mickey Mouse"
  category: varchar("category", { length: 100 }).notNull(), // e.g., "logo", "character", "celebrity"
  rightsHolder: varchar("rightsHolder", { length: 255 }), // e.g., "Nike, Inc.", "Disney"
  
  // Image data
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  perceptualHash: varchar("perceptualHash", { length: 64 }).notNull(), // pHash string
  
  // Metadata
  description: text("description"),
  tags: json("tags").$type<string[]>(), // ["brand", "sports", "apparel"]
  
  // Source
  sourceUrl: varchar("sourceUrl", { length: 500 }),
  addedBy: int("addedBy").references(() => users.id),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("name_idx").on(table.name),
  categoryIdx: index("category_idx").on(table.category),
  rightsHolderIdx: index("rights_holder_idx").on(table.rightsHolder),
  perceptualHashIdx: index("perceptual_hash_idx").on(table.perceptualHash),
}));

export type KnownCopyrightedImage = typeof knownCopyrightedImages.$inferSelect;
export type InsertKnownCopyrightedImage = typeof knownCopyrightedImages.$inferInsert;

// =============================================================================
// BOPS — VERTICAL VIDEO FEATURE
// "Post a Bop on Boptone" — 15-30 second artist videos with instant tipping
//
// Architecture principles:
//  • Composite indexes on every hot query path (feed, profile, trending)
//  • Soft deletes on all content — nothing is hard-deleted (full audit trail)
//  • Idempotent likes/views via unique constraints — no double-counting ever
//  • Tip fee model: card processing fees only — Boptone takes ZERO cut (Kick In policy)
//  • Content moderation hooks built-in — ready for AI pipeline integration
//  • Designed to scale to 1B+ views without schema changes
// =============================================================================

/**
 * Bops Videos
 * Core table for all Bop (short-form vertical video) content.
 * Every Bop is 15-30 seconds, 9:16 aspect ratio, 1080p max resolution.
 */
export const bopsVideos = mysqlTable("bops_videos", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  caption: varchar("caption", { length: 150 }),
  videoKey: varchar("videoKey", { length: 500 }).notNull(),
  videoUrl: varchar("videoUrl", { length: 500 }).notNull(),
  rawVideoKey: varchar("rawVideoKey", { length: 500 }),
  thumbnailKey: varchar("thumbnailKey", { length: 500 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  waveformKey: varchar("waveformKey", { length: 500 }),
  durationMs: int("durationMs").notNull(),
  width: int("width").default(1080),
  height: int("height").default(1920),
  fileSizeBytes: int("fileSizeBytes"),
  mimeType: varchar("mimeType", { length: 50 }).default("video/mp4"),
  processingStatus: mysqlEnum("processingStatus", ["pending", "processing", "ready", "failed"]).default("pending").notNull(),
  processingError: text("processingError"),
  processedAt: timestamp("processedAt"),
  linkedTrackId: int("linkedTrackId").references(() => bapTracks.id, { onDelete: "set null" }),
  viewCount: int("viewCount").default(0).notNull(),
  likeCount: int("likeCount").default(0).notNull(),
  commentCount: int("commentCount").default(0).notNull(),
  tipCount: int("tipCount").default(0).notNull(),
  tipTotalCents: int("tipTotalCents").default(0).notNull(),
  shareCount: int("shareCount").default(0).notNull(),
  trendingScore: int("trendingScore").default(0).notNull(),
  trendingUpdatedAt: timestamp("trendingUpdatedAt"),
  moderationStatus: mysqlEnum("moderationStatus", ["pending", "approved", "flagged", "rejected", "appealing"]).default("pending").notNull(),
  moderationNote: text("moderationNote"),
  moderatedAt: timestamp("moderatedAt"),
  moderatedBy: int("moderatedBy").references(() => users.id, { onDelete: "set null" }),
  isPublished: boolean("isPublished").default(false).notNull(),
  isArchived: boolean("isArchived").default(false).notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  deletedAt: timestamp("deletedAt"),
  deletedBy: int("deletedBy").references(() => users.id, { onDelete: "set null" }),
  geoRestrictions: json("geoRestrictions").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt"),
}, (table) => ({
  artistIdIdx: index("bops_artist_id_idx").on(table.artistId),
  userIdIdx: index("bops_user_id_idx").on(table.userId),
  linkedTrackIdx: index("bops_linked_track_idx").on(table.linkedTrackId),
  feedIdx: index("bops_feed_idx").on(table.isPublished, table.isDeleted, table.isArchived, table.publishedAt),
  trendingIdx: index("bops_trending_idx").on(table.trendingScore, table.isPublished, table.isDeleted),
  artistFeedIdx: index("bops_artist_feed_idx").on(table.artistId, table.isPublished, table.isDeleted, table.publishedAt),
  processingIdx: index("bops_processing_idx").on(table.processingStatus, table.createdAt),
  moderationIdx: index("bops_moderation_idx").on(table.moderationStatus, table.createdAt),
}));
export type BopsVideo = typeof bopsVideos.$inferSelect;
export type InsertBopsVideo = typeof bopsVideos.$inferInsert;

/**
 * Bops Likes
 * Unique constraint on (userId, videoId) prevents double-liking.
 * isActive=false = unliked (row kept for analytics).
 */
export const bopsLikes = mysqlTable("bops_likes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: int("videoId").notNull().references(() => bopsVideos.id, { onDelete: "cascade" }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueLike: uniqueIndex("bops_likes_unique").on(table.userId, table.videoId),
  videoIdIdx: index("bops_likes_video_idx").on(table.videoId, table.isActive),
  userIdIdx: index("bops_likes_user_idx").on(table.userId, table.isActive),
}));
export type BopsLike = typeof bopsLikes.$inferSelect;
export type InsertBopsLike = typeof bopsLikes.$inferInsert;

/**
 * Bops Views
 * One row per view session. Deduplication for trending score at application layer.
 */
export const bopsViews = mysqlTable("bops_views", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").notNull().references(() => bopsVideos.id, { onDelete: "cascade" }),
  userId: int("userId").references(() => users.id, { onDelete: "set null" }),
  sessionId: varchar("sessionId", { length: 128 }),
  watchDurationMs: int("watchDurationMs"),
  watchPercent: int("watchPercent"),
  completedWatch: boolean("completedWatch").default(false).notNull(),
  source: mysqlEnum("source", ["for_you", "following", "profile", "search", "share", "direct"]).default("for_you"),
  platform: mysqlEnum("platform", ["ios", "android", "web"]).default("web"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  videoIdIdx: index("bops_views_video_idx").on(table.videoId, table.createdAt),
  userIdIdx: index("bops_views_user_idx").on(table.userId, table.createdAt),
  trendingViewIdx: index("bops_views_trending_idx").on(table.videoId, table.completedWatch, table.createdAt),
}));
export type BopsView = typeof bopsViews.$inferSelect;
export type InsertBopsView = typeof bopsViews.$inferInsert;

/**
 * Bops Tips (Lightning Tip Button)
 * Fee model: Stripe processing fees only — Boptone takes ZERO cut (Kick In policy).
 * All amounts in cents — never store floats for money.
 */
export const bopsTips = mysqlTable("bops_tips", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").notNull().references(() => bopsVideos.id, { onDelete: "restrict" }),
  fromUserId: int("fromUserId").notNull().references(() => users.id, { onDelete: "restrict" }),
  toArtistId: int("toArtistId").notNull().references(() => artistProfiles.id, { onDelete: "restrict" }),
  toUserId: int("toUserId").notNull().references(() => users.id, { onDelete: "restrict" }),
  grossAmountCents: int("grossAmountCents").notNull(),
  stripeFeesCents: int("stripeFeesCents").notNull(),
  netAmountCents: int("netAmountCents").notNull(),
  platformFeeCents: int("platformFeeCents").default(0).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).unique(),
  stripeChargeId: varchar("stripeChargeId", { length: 255 }),
  stripeTransferId: varchar("stripeTransferId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded", "disputed"]).default("pending").notNull(),
  message: varchar("message", { length: 150 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  videoIdIdx: index("bops_tips_video_idx").on(table.videoId),
  fromUserIdx: index("bops_tips_from_user_idx").on(table.fromUserId),
  toArtistIdx: index("bops_tips_to_artist_idx").on(table.toArtistId, table.status),
  statusIdx: index("bops_tips_status_idx").on(table.status, table.createdAt),
  artistEarningsIdx: index("bops_tips_artist_earnings_idx").on(table.toArtistId, table.status, table.createdAt),
}));
export type BopsTip = typeof bopsTips.$inferSelect;
export type InsertBopsTip = typeof bopsTips.$inferInsert;

/**
 * Bops Comments
 * Max depth: 1 level (comment → reply only). Keeps UX simple and performant.
 */
export const bopsComments = mysqlTable("bops_comments", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").notNull().references(() => bopsVideos.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: varchar("body", { length: 300 }).notNull(),
  parentCommentId: int("parentCommentId"),
  likeCount: int("likeCount").default(0).notNull(),
  replyCount: int("replyCount").default(0).notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  deletedAt: timestamp("deletedAt"),
  deletedBy: int("deletedBy").references(() => users.id, { onDelete: "set null" }),
  isFlagged: boolean("isFlagged").default(false).notNull(),
  flagReason: varchar("flagReason", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  videoIdIdx: index("bops_comments_video_idx").on(table.videoId, table.isDeleted, table.createdAt),
  userIdIdx: index("bops_comments_user_idx").on(table.userId),
  parentIdx: index("bops_comments_parent_idx").on(table.parentCommentId, table.isDeleted),
  flaggedIdx: index("bops_comments_flagged_idx").on(table.isFlagged, table.createdAt),
}));
export type BopsComment = typeof bopsComments.$inferSelect;
export type InsertBopsComment = typeof bopsComments.$inferInsert;

/**
 * Bops Comment Likes
 * Unique constraint prevents double-liking a comment.
 */
export const bopsCommentLikes = mysqlTable("bops_comment_likes", {
  id: int("id").autoincrement().primaryKey(),
  commentId: int("commentId").notNull().references(() => bopsComments.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniqueCommentLike: uniqueIndex("bops_comment_likes_unique").on(table.commentId, table.userId),
  commentIdIdx: index("bops_comment_likes_comment_idx").on(table.commentId),
  userIdIdx: index("bops_comment_likes_user_idx").on(table.userId),
}));
export type BopsCommentLike = typeof bopsCommentLikes.$inferSelect;
export type InsertBopsCommentLike = typeof bopsCommentLikes.$inferInsert;

/**
 * Bops Artist Follows
 * Fans follow artists to receive notifications when new Bops are posted.
 * Unique constraint prevents duplicate follows.
 */
export const bopsArtistFollows = mysqlTable("bops_artist_follows", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("followerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  artistId: int("artistId").notNull().references(() => artistProfiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniqueFollow: uniqueIndex("bops_artist_follows_unique").on(table.followerId, table.artistId),
  followerIdx: index("bops_artist_follows_follower_idx").on(table.followerId),
  artistIdx: index("bops_artist_follows_artist_idx").on(table.artistId),
}));
export type BopsArtistFollow = typeof bopsArtistFollows.$inferSelect;
export type InsertBopsArtistFollow = typeof bopsArtistFollows.$inferInsert;
