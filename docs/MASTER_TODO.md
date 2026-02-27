# Boptone Ecosystem: Master Todo List

**Vision:** Build the world's most artist-centric platform ecosystem — where artists own their music, monetize their audience, sell their products, and grow their business with zero friction.

**Mindset:** META, Amazon, ByteDance enterprise-level infrastructure from day 1.

**Trademarks on file:** BOPT, BOPT-ONE, BOPT-ONE.COM, BOPT-ONE.IO

**Last updated:** February 27, 2026

---

## How to Read This Document

Each item is marked with one of three statuses:

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete

Items are organized by ecosystem pillar, then by priority tier (P0 = launch-blocking, P1 = high priority, P2 = growth phase).

---

## Pillar 1: Boptone Platform (Core Infrastructure)

The foundation that powers every other pillar. Identity, authentication, profiles, navigation, and platform-wide systems.

### P0 — Launch Blocking

- [x] User authentication (Manus OAuth)
- [x] Artist profiles
- [x] Fan profiles
- [x] Role-based access control (admin, artist, user)
- [x] Database schema (users, artists, products, orders)
- [x] Connection pooling (MySQL)
- [x] Sentry error monitoring
- [x] React error boundaries
- [x] Soft deletes (products, orders, cart items, tracks)
- [x] Database migration strategy documented
- [x] CSRF protection
- [x] Audit logging (user actions, order events)
- [x] S3 file storage with Cache-Control headers
- [x] CloudFront CDN setup documented
- [x] Top navigation: BOPTONE wordmark, all caps, top left
- [x] Copyright year current across all pages and legal docs
- [ ] Fix 4 remaining TypeScript errors (ProductDetail.tsx, StripeCheckoutProps)
- [ ] Fix storage.ts async/await error (line 160)
- [ ] Mobile: Remove push notifications section from mobile view
- [ ] Footer: Verify copyright year is current (2026)

### P1 — High Priority

- [ ] Decentralization strategy: Research and document Web3/blockchain architecture options for trust and transparency
- [ ] Database sharding strategy: Plan for scale beyond 100K users
- [ ] Redis caching layer: Implement when approaching 1,000 concurrent users
- [ ] WebSocket server: Real-time notifications and feed updates
- [ ] Global CDN: Manual AWS CloudFront distribution setup (requires AWS console access)
- [ ] Multi-region S3 replication (us-east-1, eu-west-1, ap-southeast-1)
- [ ] Rate limiting: Per-user and per-IP limits on all API endpoints
- [ ] WAF (Web Application Firewall): DDoS and bot protection
- [ ] Resend email integration: Order confirmations, shipping notifications, system alerts
- [ ] Email templates: Order confirmation, shipping notification, welcome email
- [ ] Push notifications: Firebase Cloud Messaging (desktop only, not mobile)
- [ ] Datadog APM monitoring: Application performance monitoring
- [ ] CloudWatch alarms: CDN error rate, database CPU, Redis memory

### P2 — Growth Phase

- [ ] Decentralized architecture: Implement blockchain-based transparency layer for royalty tracking
- [ ] Multi-language support: Spanish, Portuguese, Japanese, Korean, French, German, Hindi, Arabic (RTL)
- [ ] Artist verification badges
- [ ] Advanced search: Full-text search across artists, tracks, products
- [ ] Recommendation engine: ML-powered content discovery
- [ ] A/B testing framework: Feature flags and experiment tracking
- [ ] SEO: JSON-LD structured data, breadcrumbs, sitemap, robots.txt
- [ ] AEO (Answer Engine Optimization): Optimize for LLM discovery (OpenAI, Perplexity)
- [ ] Accessibility audit: WCAG 2.1 AA compliance

---

## Pillar 2: Boptone Music (Distribution and Streaming)

Artists upload music, distribute to all major platforms, and earn royalties — all from one dashboard.

### P0 — Launch Blocking

- [x] BAP (Boptone Audio Player) — streaming player built
- [x] Track upload to S3
- [x] Track metadata (title, artist, genre, duration)
- [x] Basic artist music dashboard
- [ ] Music player: Persistent bottom bar player (does not interrupt navigation)
- [ ] Track waveform visualization
- [ ] Play count tracking (deduplicated per user per session)
- [ ] Track privacy controls (public, private, unlisted)

### P1 — High Priority

- [ ] Distribution pipeline: Upload to Spotify, Apple Music, Amazon Music, Tidal, YouTube Music
- [ ] ISRC code generation: Automatic assignment per track
- [ ] UPC code generation: Automatic assignment per release
- [ ] Royalty tracking dashboard: Streams, revenue, by platform
- [ ] Royalty payout system: Monthly payouts to artist bank accounts via Stripe Connect
- [ ] Release management: Single, EP, album workflows
- [ ] Pre-save campaigns: Fan pre-save links before release date
- [ ] Playlist pitching: Submit tracks to editorial playlists
- [ ] Lyrics upload and display
- [ ] Credits and liner notes
- [ ] Collaboration tracking: Co-writer and producer credits with split royalties
- [ ] Music licensing: Sync licensing marketplace for film, TV, ads

### P2 — Growth Phase

- [ ] Costco-style fan loyalty model: Annual fan membership with year-end cashback reward tied to streaming
- [ ] Streaming revenue model: Artist-centric per-stream rate (above industry standard)
- [ ] Catalog analytics: Identify which tracks drive the most revenue and fan engagement
- [ ] AI mastering: One-click professional mastering via AI
- [ ] AI stem separation: Isolate vocals, drums, bass for remixing
- [ ] Collaborative releases: Multi-artist album and EP workflows
- [ ] Live recording upload: Setlist-based live album creation
- [ ] Podcast hosting: Artists can host audio podcasts alongside music

---

## Pillar 3: BopShop (Merch and Physical Products)

Artists sell merchandise, vinyl, apparel, and digital products directly to fans with no middleman.

### P0 — Launch Blocking

- [x] Product catalog (create, edit, delete)
- [x] Product images (S3 upload)
- [x] Shopping cart
- [x] Checkout flow (Stripe)
- [x] Order management
- [x] Cursor-based pagination (infinite scroll)
- [x] Wishlist functionality
- [x] Soft deletes on products and orders
- [x] E2E tests (Playwright) — written, pending database seeding
- [ ] Run E2E tests with seeded product data
- [ ] Stripe webhook: Handle payment_intent.succeeded, charge.refunded
- [ ] Order confirmation email (Resend integration)
- [ ] Shippo integration: Shipping label generation and tracking
- [ ] Inventory management: Stock levels, low-stock alerts
- [ ] Product variants: Size, color, format (vinyl, CD, digital)

### P1 — High Priority

- [ ] Print-on-demand (POD) integration: Printful or Printify for apparel and accessories
- [ ] Dual POD strategy: Domestic fulfillment (Printful) + international fulfillment (Printify)
- [ ] Digital product delivery: Instant download after purchase (stems, sample packs, presets)
- [ ] Artist storefront: Custom URL (boptone.com/@artist/shop)
- [ ] Discount codes and promotions
- [ ] Bundle deals: Album + merch bundles
- [ ] Pre-orders: Accept payment before product is ready
- [ ] Abandoned cart recovery: Email reminder after 24 hours
- [ ] Product reviews and ratings
- [ ] Return and refund management
- [ ] Tax calculation: Stripe Tax integration
- [ ] International shipping: Multi-currency, duties and taxes display

### P2 — Growth Phase

- [ ] Shopify-level e-commerce: Full feature parity with Shopify for artist stores
- [ ] PayPal and Venmo integration: Additional payment methods
- [ ] Subscription boxes: Monthly fan subscription with curated artist merch
- [ ] Live event merchandise: Pop-up shop tied to concert dates
- [ ] NFT-gated merchandise: Exclusive products for NFT holders
- [ ] Wholesale ordering: Bulk orders for touring artists
- [ ] Artist affiliate program: Fans earn commission for driving sales

---

## Pillar 4: Bops (Vertical Video Feature)

Artists post 15-30 second vertical videos called "Bops." Fans watch, like, comment, and tip with a lightning bolt button. Mobile-only.

### P0 — Launch Blocking (Week 1-2 Sprint)

- [ ] Database schema: bopsVideos, bopsLikes, bopsTips, bopsComments, bopsViews tables
- [ ] tRPC API: getFeed, upload, like, comment, tip, getComments, trackView
- [ ] Video upload: S3 upload with validation (15-30s, 9:16, 50MB max, 1080p)
- [ ] Video player: Mobile-only vertical player with swipe-up navigation
- [ ] Tap to pause/play
- [ ] Like button: Animated heart, optimistic UI, counter
- [ ] Comment button: Slide-up modal, real-time updates
- [ ] Share button: Native share sheet, link preview
- [ ] Lightning tip button: $1/$5/$10 presets, one-tap Stripe payment
- [ ] Stripe Connect: Artist onboarding, instant payouts
- [ ] Tip fee breakdown: Stripe fee + 5% platform = 86% to artist
- [ ] Artist push notification on tip received
- [ ] Video feed: Cursor-based pagination, Redis caching
- [ ] Upload flow: Record or select from gallery, caption (150 chars), post
- [ ] Video duration enforcement: 15s minimum, 30s maximum
- [ ] Mobile-only gate: Desktop users redirected to download page
- [ ] URL structure: boptone.com/bops (feed), boptone.com/@artist/bops (profile)

### P1 — High Priority (Week 3-4)

- [ ] AWS MediaConvert transcoding: Auto-encode to 1080p, 720p, 480p, 360p
- [ ] HLS/DASH adaptive bitrate streaming: Smooth playback on any connection speed
- [ ] Thumbnail extraction: 3 frames per video (start, middle, end)
- [ ] Video preloading: Preload next 2 Bops in feed
- [ ] Memory management: Unload videos 3+ positions away
- [ ] Content moderation: AWS Rekognition (NSFW, violence detection)
- [ ] Content moderation: Hive API (hate speech, copyright detection)
- [ ] User reporting: Long-press menu, report categories, moderation queue
- [ ] Admin moderation dashboard: Review flagged Bops, approve/reject
- [ ] DMCA takedown process: Form, notification, counter-notice workflow
- [ ] Artist Bops analytics: Views, likes, tips, watch time per Bop
- [ ] Bops profile grid: Artist profile shows all their Bops in grid view

### P2 — Growth Phase (Weeks 5-18)

- [ ] React Native iOS app: Native mobile app for iPhone
- [ ] React Native Android app: Native mobile app for Android
- [ ] Firebase push notifications: New tip, new comment, new follower
- [ ] Offline mode: Cache Bops for offline viewing
- [ ] Deep linking: boptone.com/bops/:id opens in app
- [ ] App Store submission: iOS App Store listing and review
- [ ] Google Play submission: Android Play Store listing and review
- [ ] ML recommendation engine: Personalized "For You" feed
- [ ] Multi-currency tips: USD, EUR, GBP, JPY, BRL
- [ ] Regional payment methods: PIX (Brazil), Alipay (China), UPI (India)
- [ ] Video effects and filters: Basic creative tools for artists
- [ ] Duet/response Bops: Artists respond to fan Bops
- [ ] Trending Bops: Algorithm-surfaced trending content
- [ ] Bops discovery: Genre and mood-based browsing

---

## Pillar 5: Toney (AI Agent)

Toney is Boptone's autonomous AI business manager. Not a chatbot — a business partner that runs an artist's entire operation.

### P0 — Foundation

- [ ] Toney architecture: Define agent capabilities, tool integrations, and decision boundaries
- [ ] LLM integration: Connect to invokeLLM helper for conversational interface
- [ ] Artist data access: Toney reads streaming, sales, and fan data across all pillars
- [ ] Natural language interface: Artist types a question, Toney responds with data and recommendations
- [ ] Streaming analytics summary: "Your top track this week was X with Y streams"
- [ ] Revenue summary: "You earned $Z this month across streaming, tips, and merch"

### P1 — Autonomous Actions

- [ ] Release automation: Toney handles upload, metadata, distribution scheduling
- [ ] Social media scheduling: Toney drafts and schedules posts based on release calendar
- [ ] Playlist pitching: Toney identifies and submits tracks to relevant playlists
- [ ] Merch reorder alerts: "Your best-selling item is low on stock — reorder now?"
- [ ] Fan engagement insights: "Your fans in Brazil are your fastest-growing audience"
- [ ] Collaboration recommendations: "These 5 artists have similar audiences and complementary styles"
- [ ] Licensing opportunity alerts: "Your track was used in 50 videos — claim licensing revenue"

### P2 — Full Autonomy

- [ ] Autonomous marketing spend: Toney adjusts ad spend based on real-time performance
- [ ] Licensing negotiation: Automated sync licensing deals for film, TV, ads
- [ ] Tour planning: Identify cities with highest fan concentration for routing
- [ ] Press outreach: Automated pitching to music blogs and journalists
- [ ] Tax preparation: Generate 1099s, VAT reports, income summaries
- [ ] Contract review: Flag unusual clauses in distribution and licensing agreements
- [ ] Artist manager replacement: Full business operations with 1-2 hours of artist review per week

---

## Platform-Wide: Infrastructure and Operations

These items apply across all pillars and must be maintained as the platform scales.

### Security

- [x] CSRF protection (SameSite + Origin validation)
- [x] Audit logging
- [x] Soft deletes
- [ ] Penetration testing: OWASP ZAP or Burp Suite scan
- [ ] SQL injection and XSS testing
- [ ] JWT validation and CORS review
- [ ] HSTS (HTTP Strict Transport Security)
- [ ] Content Security Policy (CSP)
- [ ] Bot and DDoS protection (Cloudflare or AWS WAF)

### Legal and Compliance

- [x] Terms of Service (Resend as email provider, current year)
- [x] Privacy Policy (GDPR-aware, current year)
- [x] Legal audit completed (February 2026)
- [ ] DMCA agent registration with US Copyright Office
- [ ] GDPR compliance: Data export and deletion requests
- [ ] LGPD compliance: Brazil data protection law
- [ ] CCPA compliance: California Consumer Privacy Act
- [ ] 1099 generation: Annual tax forms for artists earning over $600
- [ ] VAT handling: European tax compliance for digital goods

### Analytics and Business Intelligence

- [ ] ClickHouse or BigQuery: Data warehouse for analytics
- [ ] ETL pipeline: Daily aggregation jobs for all pillars
- [ ] Artist dashboard: Cross-pillar revenue and engagement overview
- [ ] Platform admin dashboard: MAU, DAU, revenue, churn, top artists
- [ ] Cohort retention analysis: D7, D30, D90 retention by signup cohort
- [ ] Revenue attribution: Which features drive the most artist revenue

### Investor and Business

- [x] Investor deck v2 content documented
- [x] Revenue model analysis documented
- [x] Trillion-dollar audit documented
- [ ] Investor deck: Build slide presentation from documented content
- [ ] Financial model: 3-year projection (users, revenue, costs, margins)
- [ ] Pitch deck: One-page executive summary
- [ ] Cap table: Document equity structure

---

## Current Sprint: Immediate Next Steps

These are the highest-priority items to tackle in the next 1-2 sessions.

### Fix Existing Bugs (Today)

- [ ] Fix TypeScript error: `priceId` does not exist on `StripeCheckoutProps` in ProductDetail.tsx
- [ ] Fix TypeScript error: `BreadcrumbItem` type mismatch in ProductDetail.tsx
- [ ] Fix storage.ts: `await` used outside async function (line 160)
- [ ] Run E2E tests with seeded product data to confirm BopShop checkout works

### Start Bops Build (Tomorrow — Week 1)

- [ ] Day 1-2: Create database schema (bopsVideos, bopsLikes, bopsTips, bopsComments)
- [ ] Day 1-2: Implement tRPC API (getFeed, upload, like, comment, tip)
- [ ] Day 3-4: Build mobile-only video player with swipe navigation
- [ ] Day 5-7: Build video upload flow with validation

### Week 2: Interactions and Monetization

- [ ] Day 8-9: Like button with animation and optimistic UI
- [ ] Day 8-9: Comment modal with real-time updates
- [ ] Day 10-12: Lightning tip button with Stripe Connect
- [ ] Day 13-14: Beta launch with 10 artists

---

## Ecosystem Flywheel (The Vision)

The four pillars are not separate products. They are one engine:

1. Artist uploads music to **Boptone Music** — gets distributed globally
2. Artist posts a 30-second **Bop** promoting the new track
3. Fan discovers the Bop, tips the artist via **lightning bolt**
4. Fan buys the vinyl or hoodie on **BopShop**
5. **Toney** analyzes all of this and tells the artist: "Your fans in Tokyo are buying merch and streaming your catalog. Here are 3 actions to double your revenue there."
6. Artist invites another artist. Cycle repeats.

**This is the moat.** No other platform owns all four touchpoints simultaneously. Boptone does.

---

*This document consolidates: todo.md, todo-week2.md, docs/BOPS_TODO.md, docs/TONEY_ROADMAP.md, and all strategy documents in docs/strategy/. It is the single source of truth for the Boptone ecosystem roadmap.*
