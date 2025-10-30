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
// MERCHANDISE / E-COMMERCE
// ============================================================================

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull(), // In cents
  inventoryCount: int("inventoryCount").default(0).notNull(),
  images: json("images").$type<string[]>(), // Array of image URLs
  variants: json("variants").$type<{
    size?: string[];
    color?: string[];
    [key: string]: string[] | undefined;
  }>(),
  productType: mysqlEnum("productType", ["physical", "digital", "experience"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

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
