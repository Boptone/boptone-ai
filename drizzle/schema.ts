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
// AI CONVERSATIONS (CAREER ADVISOR)
// ============================================================================

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
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
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
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing", "incomplete"]).notNull().default("active"),
  
  // Billing
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
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
  
  // Engagement metrics
  playCount: int("playCount").default(0).notNull(),
  likeCount: int("likeCount").default(0).notNull(),
  repostCount: int("repostCount").default(0).notNull(),
  
  // Revenue tracking
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
