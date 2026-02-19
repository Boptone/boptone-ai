import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, index } from "drizzle-orm/mysql-core";

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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

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
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  statusIdx: index("status_idx").on(table.status),
  typeIdx: index("type_idx").on(table.type),
  slugIdx: index("slug_idx").on(table.slug),
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
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

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
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 50 }),
  
  // Notes
  customerNote: text("customerNote"),
  internalNote: text("internalNote"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  cancelledAt: timestamp("cancelledAt"),
  cancellationReason: text("cancellationReason"),
}, (table) => ({
  customerIdIdx: index("customer_id_idx").on(table.customerId),
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  orderNumberIdx: index("order_number_idx").on(table.orderNumber),
  paymentStatusIdx: index("payment_status_idx").on(table.paymentStatus),
  fulfillmentStatusIdx: index("fulfillment_status_idx").on(table.fulfillmentStatus),
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

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

// Product Reviews
export const productReviews = mysqlTable("product_reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id),
  userId: int("userId").notNull().references(() => users.id),
  orderId: int("orderId").references(() => orders.id), // Verified purchase
  
  rating: int("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  content: text("content"),
  
  // Moderation
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  
  // Helpful votes
  helpfulCount: int("helpfulCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  productIdIdx: index("product_id_idx").on(table.productId),
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;

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
 * AI Conversations - Unified table for both public AI chat and personal Toney
 * CRITICAL SECURITY: 
 * - Public AI chat: conversationType="public", userId can be null (anonymous)
 * - Personal Toney: conversationType="toney", userId MUST be set, ALWAYS filter by userId
 * - Each artist's Toney is completely isolated - zero cross-user data access
 */
export const aiConversations = mysqlTable("ai_conversations", {
  id: int("id").autoincrement().primaryKey(),
  
  // User association - REQUIRED for Toney, optional for public chat
  userId: int("userId").references(() => users.id),
  artistId: int("artistId").references(() => artistProfiles.id),
  
  // Conversation type determines isolation rules
  conversationType: mysqlEnum("conversationType", ["public", "toney"]).default("public").notNull(),
  
  // Conversation title (auto-generated from first message)
  title: varchar("title", { length: 255 }),
  
  // Messages stored as JSON array
  messages: json("messages").$type<Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
  }>>(),
  
  // Context/topic for categorization
  context: mysqlEnum("context", ["career_advice", "release_strategy", "content_ideas", "financial_planning", "tour_planning", "general", "search"]).notNull(),
  
  // Token usage tracking
  tokensUsed: int("tokensUsed").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  conversationTypeIdx: index("conversation_type_idx").on(table.conversationType),
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
  
  // Revenue tracking
  pricePerStream: int("pricePerStream").default(100).notNull(), // In cents (default $0.01)
  artistShare: int("artistShare").default(90).notNull(), // Percentage (90% default)
  platformFee: int("platformFee").default(10).notNull(), // Percentage (10% default)
  totalEarnings: int("totalEarnings").default(0).notNull(), // In cents
  
  // Status
  status: mysqlEnum("status", ["draft", "processing", "live", "archived"]).default("draft").notNull(),
  isExplicit: boolean("isExplicit").default(false).notNull(),
  
  // Timestamps
  releasedAt: timestamp("releasedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  statusIdx: index("status_idx").on(table.status),
  releasedAtIdx: index("released_at_idx").on(table.releasedAt),
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
