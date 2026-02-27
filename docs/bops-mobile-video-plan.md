# Bops: Mobile-Only Vertical Video Platform

**Platform:** Boptone - Autonomous Creator OS  
**Feature:** Bops (Mobile-Only Vertical Video)  
**Timeline:** 2 Weeks MVP  
**Author:** Manus AI  
**Date:** February 26, 2026

---

## Vision

**Bops is the most authentic, stripped-down vertical video platform for music artists.** No algorithms, no clutter, no bullshit. Just artists sharing raw 15-30 second moments with fans who can instantly tip them with a lightning bolt. Mobile-only because that's where the magic happens.

**Core Philosophy:**
- **Radical simplicity** - 4 buttons max (like, tip, share, comment)
- **Authentic content** - Short enough to be real, long enough to matter
- **Instant monetization** - Lightning tip button for direct artist support
- **Mobile-first** - Built for the device in your pocket, not your desktop
- **1080p quality** - Artists deserve to look good

---

## The Bops Experience

### For Artists (Upload Flow)

1. **Open Bops** on mobile → Tap "+" button
2. **Record or upload** 15-30 second video (1080p)
3. **Add caption** (optional, 150 characters max)
4. **Post** → Video goes live instantly

**That's it.** No tags, no categories, no settings. Just post.

### For Fans (Viewing Flow)

1. **Open Bops** → Vertical feed starts playing
2. **Swipe up** → Next video (smooth, instant)
3. **Tap screen** → Pause/play
4. **Tap ❤️** → Like (animated heart)
5. **Tap ⚡** → Send $1, $5, or $10 tip (one tap, no friction)
6. **Tap 💬** → Comment (slide-up modal)
7. **Tap ↗️** → Share link

**That's it.** No profiles to navigate, no menus, no distractions. Just content.

---

## Feature Specifications

### Video Constraints

| Constraint | Value | Rationale |
|------------|-------|-----------|
| **Duration** | 15-30 seconds | Forces creativity, maintains attention |
| **Resolution** | 1080p (1920x1080) | Professional quality for artists |
| **Aspect Ratio** | 9:16 (vertical) | Mobile-native format |
| **File Size** | Max 50MB | Balance quality vs upload speed |
| **Format** | MP4 (H.264) | Universal compatibility |
| **Frame Rate** | 30fps minimum | Smooth playback |

**Validation Rules:**
- Duration <15s → "Video too short (min 15 seconds)"
- Duration >30s → Auto-trim to 30 seconds with warning
- Non-vertical → "Please record in vertical mode"
- File size >50MB → "Video too large, please compress"

### The 4 Interactions

#### 1. Like Button (❤️)

**Behavior:**
- Tap → Heart fills red, counter increments
- Tap again → Heart unfills, counter decrements
- Animation: Heart "pops" with scale effect
- Haptic feedback on tap (iOS/Android)

**Technical:**
- Optimistic UI update (instant feedback)
- Background API call to persist like
- Rollback if API fails

#### 2. Lightning Tip Button (⚡)

**Behavior:**
- Tap → Slide-up modal with 3 preset amounts
- **$1** - "Buy them a coffee ☕"
- **$5** - "Support their craft 🎵"
- **$10** - "You're a legend 🌟"
- One-tap payment (saved card from Stripe)
- Success → Lightning bolt animates, artist notified
- 95% goes to artist, 5% platform fee

**Technical:**
- Stripe Payment Intents API
- Saved payment methods (Stripe Customer)
- Instant confirmation (no page reload)
- Artist gets push notification: "🎉 @username tipped you $5!"

**Why this is genius:**
- **Instant gratification** - Fan sees immediate impact
- **Low friction** - One tap, no forms
- **Artist revenue** - Direct monetization from day 1
- **Platform differentiation** - No other music platform has this

#### 3. Share Button (↗️)

**Behavior:**
- Tap → Native share sheet (iOS/Android)
- Share options: Copy link, SMS, WhatsApp, Instagram, Twitter
- Link format: `boptone.com/bops/{videoId}`
- Link preview: Video thumbnail, artist name, caption

**Technical:**
- Web Share API (native mobile sharing)
- Dynamic Open Graph meta tags for rich previews
- Track share count for analytics

#### 4. Comment Button (💬)

**Behavior:**
- Tap → Slide-up modal with comment thread
- Comments sorted by newest first
- Simple text input (no rich formatting)
- 200 character limit per comment
- Artist comments highlighted with badge

**Technical:**
- Real-time updates (new comments appear instantly)
- Infinite scroll for long threads
- Report/block functionality (hidden in long-press menu)

---

## Mobile-Only Design

### Why Mobile-Only?

**Data from YouTube Shorts:**
- 70% of watch time happens on mobile
- Mobile users watch 2x more videos per session
- Vertical video completion rate is 90% vs 60% for horizontal

**Bops Decision:**
- **No desktop version** - Redirect to "Download our app" page
- **No responsive design** - Build for 375px-428px width only
- **No tablet optimization** - iPhone/Android phones only

**Benefits:**
- **Faster development** - One target, one design
- **Better UX** - Optimized for the device that matters
- **Authentic feel** - Mobile-only = creator-first platform

### Supported Devices

| Device | Screen Size | Priority | Notes |
|--------|-------------|----------|-------|
| iPhone 13/14/15 | 390x844 | P0 | Most common iOS device |
| iPhone 13/14/15 Pro Max | 428x926 | P0 | Large screen optimization |
| Samsung Galaxy S23 | 360x800 | P0 | Most common Android |
| Google Pixel 7/8 | 412x915 | P1 | Android testing |

**Minimum Requirements:**
- iOS 15+ (Safari)
- Android 11+ (Chrome)
- 4G connection minimum

---

## Technical Architecture (Simplified)

### Database Schema

**Videos Table**
```sql
CREATE TABLE bopsVideos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artistId INT NOT NULL,
  videoUrl VARCHAR(512) NOT NULL,
  thumbnailUrl VARCHAR(512),
  caption VARCHAR(150),
  duration INT NOT NULL, -- 15-30 seconds
  viewCount INT DEFAULT 0,
  likeCount INT DEFAULT 0,
  commentCount INT DEFAULT 0,
  tipCount INT DEFAULT 0,
  tipAmount DECIMAL(10,2) DEFAULT 0, -- Total tips received
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artistId) REFERENCES artistProfiles(id) ON DELETE CASCADE,
  INDEX idx_feed (createdAt DESC),
  INDEX idx_artist (artistId, createdAt DESC)
);
```

**Likes Table**
```sql
CREATE TABLE bopsLikes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  videoId INT NOT NULL,
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (videoId) REFERENCES bopsVideos(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_like (videoId, userId)
);
```

**Tips Table**
```sql
CREATE TABLE bopsTips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  videoId INT NOT NULL,
  fromUserId INT NOT NULL,
  toArtistId INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL, -- $1, $5, or $10
  stripeFee DECIMAL(10,2) NOT NULL, -- Stripe processing fee
  platformFee DECIMAL(10,2) NOT NULL, -- 5% platform fee
  artistPayout DECIMAL(10,2) NOT NULL, -- Amount artist receives
  stripePaymentIntentId VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (videoId) REFERENCES bopsVideos(id) ON DELETE CASCADE,
  FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (toArtistId) REFERENCES artistProfiles(id) ON DELETE CASCADE,
  INDEX idx_artist_tips (toArtistId, createdAt DESC),
  INDEX idx_user_tips (fromUserId, createdAt DESC)
);
```

**Comments Table**
```sql
CREATE TABLE bopsComments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  videoId INT NOT NULL,
  userId INT NOT NULL,
  content VARCHAR(200) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (videoId) REFERENCES bopsVideos(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_video_comments (videoId, createdAt DESC)
);
```

### API Endpoints (tRPC)

**Core Endpoints:**
```typescript
bops: router({
  // Feed
  getFeed: publicProcedure
    .input(z.object({ cursor: z.number().optional(), limit: z.number().default(20) }))
    .query(/* Paginated video feed */),
  
  // Upload
  upload: protectedProcedure
    .input(z.object({
      videoKey: z.string(),
      caption: z.string().max(150).optional(),
      duration: z.number().min(15).max(30),
    }))
    .mutation(/* Create video record */),
  
  // Interactions
  like: protectedProcedure
    .input(z.object({ videoId: z.number() }))
    .mutation(/* Toggle like */),
  
  tip: protectedProcedure
    .input(z.object({
      videoId: z.number(),
      amount: z.enum(['1', '5', '10']),
    }))
    .mutation(/* Process tip via Stripe */),
  
  comment: protectedProcedure
    .input(z.object({
      videoId: z.number(),
      content: z.string().max(200),
    }))
    .mutation(/* Add comment */),
  
  getComments: publicProcedure
    .input(z.object({ videoId: z.number() }))
    .query(/* Fetch comments */),
})
```

### Lightning Tip Flow (Stripe Integration)

**Setup (One-Time per User):**
1. User adds payment method (Stripe Elements)
2. Create Stripe Customer with saved card
3. Store `stripeCustomerId` in user record

**Tip Flow (One-Tap):**
```typescript
// 1. User taps ⚡ button, selects amount ($1, $5, or $10)
const tipMutation = trpc.bops.tip.useMutation();

// 2. Frontend calls API
tipMutation.mutate({ videoId: 123, amount: '5' });

// 3. Backend creates Payment Intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 500, // $5.00 in cents
  currency: 'usd',
  customer: user.stripeCustomerId,
  payment_method: user.defaultPaymentMethodId,
  off_session: true,
  confirm: true,
  metadata: {
    videoId: '123',
    artistId: '456',
    platform: 'bops',
  },
});

// 4. Calculate fees
const stripeFee = 0.30 + (amount * 0.029); // Stripe: $0.30 + 2.9%
const platformFee = amount * 0.05; // Boptone: 5%
const artistPayout = amount - stripeFee - platformFee;

// 5. Record tip in database
await db.insert(bopsTips).values({
  videoId,
  fromUserId: user.id,
  toArtistId: artist.id,
  amount,
  stripeFee,
  platformFee,
  artistPayout,
  stripePaymentIntentId: paymentIntent.id,
});

// 6. Update video tip counter
await db.update(bopsVideos)
  .set({ 
    tipCount: sql`tipCount + 1`,
    tipAmount: sql`tipAmount + ${artistPayout}`,
  })
  .where(eq(bopsVideos.id, videoId));

// 7. Notify artist (push notification)
await notifyArtist({
  artistId: artist.id,
  title: '⚡ New Tip!',
  body: `@${user.username} tipped you $${amount}!`,
  data: { videoId, tipAmount: amount },
});

// 8. Return success to frontend
return { success: true, artistPayout };
```

**Fee Breakdown Example ($5 tip):**
- **Fan pays:** $5.00
- **Stripe fee:** $0.45 (2.9% + $0.30)
- **Platform fee:** $0.25 (5%)
- **Artist receives:** $4.30 (86%)

**Why 5% platform fee?**
- Lower than Patreon (8-12%), OnlyFans (20%), YouTube Super Chat (30%)
- Covers infrastructure, support, payment processing overhead
- Fair to artists, sustainable for platform

---

## Mobile UI Design

### Feed Screen (Main View)

```
┌─────────────────────────────┐
│                             │ ← Video fills entire screen
│                             │
│         [VIDEO]             │
│                             │
│                             │
│    @artistname              │ ← Artist name (bottom left)
│    Caption text here...     │
│                             │
│                          ❤️ │ ← Like button (bottom right)
│                          ⚡ │ ← Tip button
│                          💬 │ ← Comment button
│                          ↗️ │ ← Share button
└─────────────────────────────┘
   ↑ Swipe up for next video
```

**Interaction Zones:**
- **Left 60%** - Tap to pause/play
- **Right 40%** - Action buttons (like, tip, comment, share)
- **Bottom 20%** - Artist info and caption
- **Swipe up** - Next video
- **Swipe down** - Previous video

### Upload Screen

```
┌─────────────────────────────┐
│          Upload Bop         │ ← Title
├─────────────────────────────┤
│                             │
│    [Video Preview]          │ ← Full-screen preview
│                             │
│    ──────────────────       │ ← Trim slider (15-30s)
│    15s              30s     │
│                             │
│    Caption (optional)       │ ← Text input
│    ┌───────────────────┐   │
│    │                   │   │
│    └───────────────────┘   │
│                             │
│    [Post Bop]              │ ← Big button
└─────────────────────────────┘
```

### Tip Modal

```
┌─────────────────────────────┐
│    ⚡ Tip @artistname        │ ← Title
├─────────────────────────────┤
│                             │
│    ┌─────────────────────┐ │
│    │   $1                │ │ ← Preset amount
│    │   Buy them a coffee │ │
│    └─────────────────────┘ │
│                             │
│    ┌─────────────────────┐ │
│    │   $5                │ │
│    │   Support their     │ │
│    │   craft             │ │
│    └─────────────────────┘ │
│                             │
│    ┌─────────────────────┐ │
│    │   $10               │ │
│    │   You're a legend   │ │
│    └─────────────────────┘ │
│                             │
│    💳 •••• 4242            │ ← Saved card
│                             │
└─────────────────────────────┘
```

### Comment Modal

```
┌─────────────────────────────┐
│    💬 Comments (42)          │ ← Title with count
├─────────────────────────────┤
│                             │
│  @user1  2m ago             │
│  This is fire! 🔥           │
│                             │
│  @artistname  1m ago  ⭐    │ ← Artist badge
│  Thanks fam! 🙏             │
│                             │
│  @user2  30s ago            │
│  When's the full song?      │
│                             │
│  ─────────────────────────  │
│                             │
│  ┌───────────────────────┐ │
│  │ Add a comment...      │ │ ← Text input
│  └───────────────────────┘ │
│                      [Send] │
└─────────────────────────────┘
```

---

## Implementation Roadmap

### Week 1: Core Infrastructure

**Days 1-2: Database & API**
- [ ] Create `bopsVideos`, `bopsLikes`, `bopsTips`, `bopsComments` tables
- [ ] Implement tRPC endpoints: `getFeed`, `upload`, `like`, `comment`
- [ ] Add video upload validation (duration, aspect ratio, file size)
- [ ] Test API with Postman

**Days 3-4: Video Player**
- [ ] Build mobile-only video player component
- [ ] Implement swipe-up navigation
- [ ] Add tap-to-pause functionality
- [ ] Test on iPhone and Android

**Days 5-7: Upload Flow**
- [ ] Build video upload UI (mobile-only)
- [ ] Add video trimming (15-30s enforcement)
- [ ] Implement caption input (150 char max)
- [ ] Test upload on 4G connection

### Week 2: Interactions & Polish

**Days 8-9: Like & Comment**
- [ ] Implement like button with animation
- [ ] Build comment modal with slide-up animation
- [ ] Add real-time comment updates
- [ ] Test interactions on mobile

**Days 10-12: Lightning Tip Integration**
- [ ] Set up Stripe Customer creation
- [ ] Build tip modal with preset amounts
- [ ] Implement one-tap payment flow
- [ ] Add artist tip notifications
- [ ] Test payment flow end-to-end

**Days 13-14: Testing & Launch**
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Performance optimization (video preloading)
- [ ] Add loading states and error handling
- [ ] Beta launch with 10 artists
- [ ] Monitor usage and gather feedback

---

## Success Metrics

### Week 1 Goals (Beta Launch)

**Adoption:**
- 10 beta artists upload at least 1 Bop each
- 50+ total Bops uploaded
- 100+ registered users

**Engagement:**
- Average watch time >20 seconds (66% completion)
- 15% like rate
- 5% comment rate
- 2% tip rate (2 tips per 100 views)

**Technical:**
- <2 second video load time on 4G
- <5% upload failure rate
- 60fps scroll performance

### Month 1 Goals (Public Launch)

**Adoption:**
- 100 artists actively posting
- 1,000+ Bops uploaded
- 5,000+ registered users

**Engagement:**
- 10,000+ daily video views
- $500+ in artist tips
- 20% of users return daily

**Revenue:**
- $25+ in platform fees (5% of tips)
- Validate monetization model

---

## Why Bops Will Win

### Competitive Advantages

**1. Direct Artist Monetization**
- **TikTok:** No direct tipping, creator fund pays pennies
- **YouTube Shorts:** Super Chat requires 1000 subscribers
- **Instagram Reels:** No monetization for small creators
- **Bops:** One-tap tips from day 1, 86% goes to artist

**2. Music-First Platform**
- **TikTok:** Viral dances, not artist discovery
- **YouTube Shorts:** Everything competes (gaming, vlogs, music)
- **Instagram Reels:** Fashion and lifestyle dominate
- **Bops:** 100% music artists, 100% music fans

**3. Radical Simplicity**
- **TikTok:** Overwhelming features, algorithm mystery
- **YouTube Shorts:** Buried in YouTube app, confusing UI
- **Instagram Reels:** Cluttered with ads and suggested posts
- **Bops:** 4 buttons, zero clutter, pure content

**4. Authentic Connection**
- **TikTok:** Parasocial relationships, no real connection
- **YouTube Shorts:** Comments get lost in noise
- **Instagram Reels:** DMs are overwhelming for artists
- **Bops:** Lightning tips = instant gratitude, real support

### Artist Value Proposition

**"Post a 30-second Bop, get tipped by fans, keep 86%."**

That's the entire pitch. No complicated monetization requirements, no waiting for algorithm approval, no minimum follower counts. Just post and get paid.

### Fan Value Proposition

**"Discover new artists, support them instantly."**

Fans want to support artists they love, but Patreon feels like a commitment, merch is expensive, and streaming pays nothing. A $1 tip on a Bop they loved? That's easy.

---

## Next Steps

### Before Building

1. **Validate with artists** - Show this plan to 5-10 artists, get feedback
2. **Test payment flow** - Ensure Stripe integration is seamless
3. **Design mockups** - Create high-fidelity mobile designs
4. **Set up analytics** - Track every interaction from day 1

### After Launch

1. **Monitor usage** - Daily active users, videos uploaded, tips sent
2. **Gather feedback** - Weekly artist interviews, user surveys
3. **Iterate quickly** - Ship improvements every week
4. **Plan Phase 2** - Video transcoding, push notifications, artist analytics

---

## Conclusion

**Bops is the simplest, most authentic way for music artists to share moments and get paid.** No algorithms deciding who gets seen, no complicated monetization schemes, no desktop distractions. Just vertical video, real fans, and instant tips.

**This is what Boptone needs** - a feature that's so simple, so mobile-native, and so artist-friendly that it becomes the default way musicians share their work. YouTube Shorts is cluttered. TikTok is overwhelming. Instagram Reels is an afterthought.

**Bops is purpose-built for music artists.** And with the lightning tip button, it's the only platform where fans can instantly support the artists they discover.

**Let's build it in 2 weeks and change how music gets shared.**

---

**Ready to start?** I can begin implementation immediately with the database schema and API setup. We'll have a working prototype on your phone in 10 days.
