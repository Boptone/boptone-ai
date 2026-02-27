# Boptone Platform Architecture
## The Interconnected Creator OS

**Version:** 1.0  
**Date:** February 2026  
**Classification:** Internal Engineering Reference

---

## The Core Principle

Every pillar of Boptone — the artist profile, Boptone Music, BopShop, and Bops — shares a single source of truth: the **Artist Profile**. This is not four separate products that happen to share a login. It is one unified platform where every action in one pillar creates value in all others. An artist who posts a Bop drives music streams. A music stream triggers a BopShop recommendation. A BopShop purchase feeds the artist's analytics dashboard. The analytics inform Toney AI's next recommendation. This is the flywheel.

---

## The Single Source of Truth: The Artist Profile

The `artistProfiles` table is the central node of the entire platform. Every other table in the database has a foreign key relationship — direct or indirect — back to `artistProfiles.id`. This is not an accident. It is the architectural decision that makes everything else possible.

```
users
  └── artistProfiles (one-to-one)
        ├── bopsVideos (one-to-many)
        ├── bapTracks / musicReleases (one-to-many)
        ├── products / shopItems (one-to-many)
        ├── subscriptions (one-to-one)
        ├── stripeConnectAccounts (one-to-one)
        ├── artistAnalytics (one-to-many)
        ├── fanRelationships (one-to-many)
        └── toneyAiSessions (one-to-many)
```

**Implication:** An artist cannot post a Bop, upload music, or open a BopShop without a completed artist profile. The profile is the gate. The profile is the business.

---

## The Artist Onboarding Flow: The Revenue Engine

This is the most important flow in the entire platform. Every dollar Boptone earns begins here.

### Step 1: Web Signup (boptone.com/artist/signup)
- Artist visits the web platform (not the app)
- Selects subscription tier: Starter / Pro / Label
- Enters email, creates password
- Stripe subscription created immediately
- `users` record created, `artistProfiles` record initialized with `onboardingCompleted: false`

### Step 2: Profile Setup (boptone.com/artist/setup)
- Stage name, bio, location, genres
- Profile photo upload (optimized to 512x512, stored in S3)
- Social links (optional but encouraged)
- `artistProfiles.onboardingCompleted` set to `true` on completion

### Step 3: Payout Setup (boptone.com/artist/payout)
- Stripe Connect Express onboarding
- Artist connects bank account for tip payouts and BopShop revenue
- `stripeConnectAccounts` record created with `accountId` and `payoutsEnabled` flag
- **Gate:** Artist cannot receive tips or BopShop revenue without completing this step

### Step 4: Dashboard (boptone.com/dashboard)
- Welcome screen with completion checklist
- QR code linking to their Bops profile in the app
- Quick-start CTAs: Post a Bop, Upload Music, Open BopShop

### The Gate Logic (Applied Platform-Wide)

```
Artist attempts any revenue action:
  → Check: artistProfiles.onboardingCompleted === true
  → Check: stripeConnectAccounts.payoutsEnabled === true
  → If either false: redirect to the incomplete step
  → If both true: allow action
```

This gate is enforced at the tRPC procedure level, not the UI level. It cannot be bypassed.

---

## The Four Pillars and Their Interconnections

### Pillar 1: Boptone (Identity and Community)

**What it owns:** User authentication, artist profiles, fan relationships, notifications, analytics, Toney AI.

**What it feeds:**
- Profile data (name, photo, genres) surfaces in Bops feed, music player, and BopShop
- Fan follow relationships determine personalized feed ranking
- Analytics aggregate data from all three other pillars into one dashboard
- Toney AI reads all pillar data to generate recommendations

**Database tables:** `users`, `artistProfiles`, `fanRelationships`, `artistAnalytics`, `notifications`, `toneyAiSessions`

---

### Pillar 2: Boptone Music (Distribution and Streaming)

**What it owns:** Track uploads, metadata (ISRC, UPC), distribution pipeline, streaming metrics, royalty tracking, playlist management.

**What it feeds into other pillars:**
- Track metadata populates the Bops video player (when an artist tags a track to a Bop, the track title and artwork appear as an overlay)
- Streaming revenue feeds the artist's unified earnings dashboard
- New release events trigger Toney AI to suggest posting a Bop about the release
- Genre and mood tags from tracks feed the algorithmic Bops feed ranking

**Database tables:** `bapTracks`, `musicReleases`, `streamingMetrics`, `royaltyPayments`, `playlists`, `playlistTracks`

**Cross-pillar event:** `track.published` → Toney AI generates: "Your new track is live. Post a Bop to announce it to your fans."

---

### Pillar 3: BopShop (Commerce)

**What it owns:** Products, variants, inventory, orders, shipping, print-on-demand, digital downloads.

**What it feeds into other pillars:**
- Product photos and merch items surface as a "Shop" tab on the artist's Bops profile page
- Order completion events feed the artist's unified earnings dashboard
- Top-selling products inform Toney AI's merchandising recommendations
- Fan purchase history feeds personalized product recommendations on the fan's feed

**Database tables:** `products`, `productVariants`, `orders`, `orderItems`, `shopifyIntegration`, `printOnDemandJobs`

**Cross-pillar event:** `order.completed` → Artist dashboard updates revenue total in real time → Toney AI logs the sale for monthly report generation

---

### Pillar 4: Bops (Vertical Video)

**What it owns:** Video uploads, the feed, likes, comments, tips, view tracking.

**What it feeds into other pillars:**
- Tip revenue feeds the artist's unified earnings dashboard
- View counts and engagement data feed the artist's analytics
- Tagged tracks in Bops drive music stream discovery
- High-performing Bops trigger Toney AI to suggest posting similar content
- Fan engagement on Bops (likes, comments, follows) strengthens the fan relationship score, which improves the fan's personalized feed ranking

**Database tables:** `bopsVideos`, `bopsLikes`, `bopsViews`, `bopsTips`, `bopsComments`, `bopsCommentLikes`

**Cross-pillar event:** `bop.tip.received` → Artist push notification → Earnings dashboard updates → Monthly tip report generated by Toney AI

---

## The Unified Earnings Dashboard

This is the feature that makes artists feel Boptone is their headquarters. Every revenue stream — subscriptions, tips, music royalties, BopShop sales — flows into a single real-time dashboard.

```
Unified Earnings Dashboard
├── Total Revenue (all-time, MTD, YTD)
├── Bops Tips (from bopsTips table)
├── Music Royalties (from royaltyPayments table)
├── BopShop Revenue (from orders table)
├── Subscription Revenue (from subscriptions table — future: fan subscriptions)
└── Payout Schedule (next Stripe Connect payout date and amount)
```

**Implementation:** A single `artistAnalytics` table aggregates daily snapshots from all four pillars. The dashboard reads from this table, not from the individual pillar tables, ensuring sub-100ms query times regardless of data volume.

---

## The Event Bus: How Pillars Talk to Each Other

Every significant action on the platform emits an event. These events are processed asynchronously by a background job queue, ensuring that cross-pillar updates never slow down the primary user action.

### Event Flow Architecture

```
User Action
  → Primary DB write (synchronous, <50ms)
  → Event emitted to job queue (async)
  → Background worker processes event
  → Secondary DB writes (analytics, notifications, AI triggers)
  → Push notification sent (if applicable)
```

### Critical Events and Their Downstream Effects

| Event | Source Pillar | Downstream Effects |
|-------|--------------|-------------------|
| `artist.profile.completed` | Boptone | Unlock all features, send welcome email, Toney AI onboarding session |
| `bop.published` | Bops | Notify followers, update artist Bops count, feed ranking update |
| `bop.tip.received` | Bops | Artist push notification, earnings dashboard update, Toney AI log |
| `bop.liked` | Bops | Optimistic UI update, engagement score update, feed ranking signal |
| `track.published` | Music | Notify followers, Toney AI suggests Bop announcement, distribution trigger |
| `order.completed` | BopShop | Artist notification, earnings update, fulfillment trigger, Toney AI log |
| `fan.followed` | Boptone | Feed personalization update, artist follower count update |
| `stripe.payout.paid` | Boptone | Artist notification, payout history record |

### Implementation

Events are stored in a `platformEvents` table and processed by the existing `JobScheduler` background worker (already running in `server/_core/index.ts`). This avoids the complexity of an external message broker (Kafka, RabbitMQ) at current scale while providing the same logical separation.

```typescript
// Event emission pattern (server-side, after primary DB write)
await emitPlatformEvent({
  type: 'bop.tip.received',
  artistId: bop.artistId,
  payload: { tipAmount, fanId, bopId },
  processAt: new Date(), // immediate
});

// Background worker picks up and processes
// → updates artistAnalytics
// → sends push notification
// → logs to Toney AI context
```

---

## The App vs. Web Boundary

This is the architectural decision that protects Boptone's subscription revenue.

| Capability | Web Only | App Only | Both |
|-----------|----------|----------|------|
| Artist signup and subscription | X | | |
| Profile setup | X | | |
| Stripe Connect payout onboarding | X | | |
| Music distribution setup | X | | |
| BopShop product management | X | | |
| Analytics dashboard | X | | |
| Toney AI full interface | X | | |
| Post a Bop (video upload) | | | X |
| Browse Bops feed | | X | |
| Tip an artist | | X | |
| Stream music | | | X |
| Browse BopShop | | | X |

**The rule:** Revenue-generating setup happens on web. Consumption and engagement happens on app. This ensures every artist who generates revenue on the platform has gone through the web subscription flow.

---

## The Fan Relationship Model

Fans are not passive consumers on Boptone. Their behavior directly shapes the platform's value for artists.

```
Fan actions that generate artist value:
  → Follow: increases artist's follower count, improves feed ranking
  → View Bop: contributes to view count, engagement score
  → Like Bop: strong engagement signal, improves Bop's reach
  → Comment: high-value engagement signal
  → Tip: direct revenue, strongest loyalty signal
  → Purchase (BopShop): direct revenue, fan loyalty score increase
  → Stream track: royalty contribution
```

The `fanRelationships` table stores a `loyaltyScore` for each fan-artist pair. This score is updated by the event bus whenever a fan takes any of the above actions. Artists with high average loyalty scores receive preferential placement in the discovery algorithm.

---

## The Toney AI Integration Layer

Toney AI is not a chatbot bolted onto the platform. It is the intelligence layer that reads all pillar data and surfaces actionable insights for the artist.

**What Toney reads:**
- Bops performance (views, likes, tips per video)
- Music streaming trends (which tracks are growing)
- BopShop sales patterns (which products sell best)
- Fan engagement patterns (when fans are most active)
- Earnings trends (MoM revenue growth)

**What Toney produces:**
- "Your last 3 Bops posted on Tuesday got 40% more views. Post your next one Tuesday."
- "Your 'Vintage Logo Tee' is your top seller. Consider a limited colorway drop."
- "Your new track has 200 streams in 48 hours. Post a Bop about it while momentum is building."
- "Your tip revenue is up 85% this month. Your most-tipped Bop was the studio session clip."

**Implementation:** Toney reads from `artistAnalytics` (aggregated snapshots) and `toneyAiSessions` (conversation history). It never queries individual pillar tables directly, ensuring fast response times and clean separation of concerns.

---

## The Build Sequence

The order in which we build determines whether the platform is coherent or fragmented. The correct sequence is:

**Phase 1: The Revenue Gate (Build Now)**
1. Artist subscription flow (`/artist/signup` → Stripe subscription)
2. Artist profile setup wizard (`/artist/setup`)
3. Stripe Connect payout onboarding (`/artist/payout`)
4. Artist dashboard with completion checklist

**Phase 2: The Content Pillars (Build Next)**
5. Bops posting (already built — now gate it behind completed profile)
6. Music upload and distribution flow
7. BopShop product creation flow

**Phase 3: The Intelligence Layer (Build After)**
8. Unified earnings dashboard (aggregates all pillar revenue)
9. Platform events table and background worker events
10. Toney AI cross-pillar insights

**Phase 4: The Fan Experience (Build Last)**
11. Fan discovery feed (algorithmic Bops ranking)
12. Fan loyalty score system
13. Fan-facing BopShop and music player

This sequence ensures that every feature built in Phase 2 and beyond has a revenue foundation underneath it. We never build a feature that generates engagement without first building the system that captures the revenue from that engagement.

---

## Security and Data Integrity

**Row-level security:** Every database query that returns artist data includes a `WHERE artistId = ctx.user.artistProfileId` clause. Artists can never see or modify each other's data.

**Stripe webhook verification:** All Stripe events are verified with `stripe.webhooks.constructEvent()` before any database write occurs.

**Soft deletes everywhere:** No content is ever hard-deleted. All tables include `deletedAt` timestamps. This protects against accidental deletion and provides a complete audit trail.

**Rate limiting:** All public-facing tRPC procedures are rate-limited at the procedure level. Tip procedures are additionally rate-limited per fan per artist per hour to prevent abuse.

**Input validation:** All tRPC inputs are validated with Zod schemas at the procedure boundary. No raw user input ever reaches the database.

---

## Performance Targets

| Metric | Target | How Achieved |
|--------|--------|-------------|
| API response time (P99) | <200ms | Composite indexes on all hot query paths |
| Bops feed load time | <1 second | CDN-cached thumbnails, cursor pagination |
| Dashboard load time | <500ms | Pre-aggregated `artistAnalytics` snapshots |
| Tip processing | <3 seconds | Stripe Payment Intents, optimistic UI |
| Video upload | <30 seconds for 200MB | Direct S3 multipart upload, XHR progress |
| Database query time (P99) | <50ms | 30 composite indexes on Bops tables alone |

---

## The North Star Metric

Every architectural decision on this platform should be evaluated against one question:

**Does this make it easier for an artist to earn money from their art?**

If yes, build it. If no, cut it. This is the filter that keeps Boptone focused and prevents feature bloat. The platform exists to serve artists. Everything else is infrastructure.
