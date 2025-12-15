# Fan Funnel & Marketing Infrastructure Research

## Current Market Landscape

### Existing Tools Analysis

| Tool | Focus | Pricing | Key Gap |
|------|-------|---------|---------|
| **Feature.fm** | Smart links, pre-saves, bio links | Free - $199/mo | No streaming data after click, limited CRM |
| **Linkfire** | Smart links, streaming insights | $10-100/mo | Only tool with post-click streaming data (exclusive partnerships) |
| **Linktree** | General bio links | Free - $27/mo | Not music-focused, no streaming integrations |
| **Laylo** | Drop CRM, SMS/email marketing | $25/mo + messaging | Focused on drops/events, not full funnel |
| **ToneDen** | Event marketing, ads | $50-1300/mo | Too expensive for indies, event-focused |
| **Chartmetric** | Analytics dashboard | Enterprise pricing | Read-only analytics, no fan capture |
| **Spotify for Artists** | Platform-specific analytics | Free | Locked to Spotify, no cross-platform view |

### Critical Gaps for Independent Artists

1. **No unified fan identity across platforms**
   - Artists can see Spotify listeners separately from Apple Music, YouTube, etc.
   - No way to know if the same person follows them on multiple platforms
   - Can't track a fan's journey from discovery to superfan

2. **Discovery source attribution is broken**
   - Smart links track clicks, but not WHERE fans originally discovered the artist
   - Was it a TikTok video? A playlist? A friend's recommendation? Radio?
   - This data is critical for knowing where to invest marketing effort

3. **No funnel visualization**
   - Artists can't see: Listener → Follower → Email subscriber → Merch buyer → Concert attendee
   - No way to identify "superfans" who engage across multiple touchpoints

4. **Data ownership is fragmented**
   - Fan emails in Mailchimp
   - Streaming data in Spotify for Artists
   - Social data in Instagram Insights
   - Sales data in Shopify
   - No single source of truth

5. **No predictive insights**
   - Which fans are most likely to buy merch?
   - Which cities should I tour?
   - When should I release new music?

## What Boptone Can Build (Differentiation)

### 1. Fan Identity Graph
- Unified fan profiles that connect:
  - Email address
  - Phone number
  - Spotify profile (via OAuth)
  - Apple Music profile
  - Social media handles
  - Purchase history
  - Concert attendance
  - Engagement history

### 2. Discovery Source Tracking
- "How did you discover [Artist]?" survey on first interaction
- UTM parameter tracking across all smart links
- Referral source categories:
  - Streaming playlists (Spotify, Apple, etc.)
  - Social media (TikTok, Instagram, YouTube)
  - Word of mouth / friend recommendation
  - Live performance
  - Radio / podcast
  - Press / blog
  - Shazam / music discovery app
  - Algorithm recommendation

### 3. Fan Funnel Stages
```
AWARENESS → INTEREST → ENGAGEMENT → CONVERSION → ADVOCACY
   |           |           |            |           |
Discovered  Followed    Engaged      Purchased   Referred
the artist  on social   (email,      (merch,     others
            or stream   comment,     tickets,
                       like)        music)
```

### 4. Cohort Analysis
- Group fans by:
  - Discovery source
  - Geographic location
  - Engagement level
  - Purchase history
  - Time since first interaction
  - Platform preference

### 5. Fan Scoring
- Assign each fan a score based on:
  - Recency of engagement
  - Frequency of interaction
  - Monetary value (purchases)
  - Advocacy (shares, referrals)
- Identify top 1%, 5%, 10% superfans

### 6. Actionable Insights
- "Your TikTok fans convert to merch buyers at 3x the rate of Spotify playlist fans"
- "Fans in Austin have highest engagement - consider a show there"
- "Your email list has 40% inactive subscribers - time for re-engagement campaign"

## Technical Architecture

### Data Collection Points
1. **Smart Links** - Track clicks, source, device, location
2. **Artist Page** - Embedded tracking pixel
3. **Email Signup** - Discovery source survey
4. **OAuth Connections** - Spotify, Apple Music, YouTube
5. **Purchase Events** - Merch, tickets, music
6. **Engagement Events** - Comments, likes, shares

### Database Schema Needs
- `fans` - Unified fan profiles
- `fan_identities` - Email, phone, social handles
- `fan_events` - All interactions (timestamped)
- `fan_discovery_sources` - How they found the artist
- `fan_segments` - Cohort memberships
- `fan_scores` - Calculated engagement scores
- `smart_links` - Trackable links with UTM support
- `link_clicks` - Click events with attribution

### Privacy Considerations
- GDPR/CCPA compliant data collection
- Clear opt-in for data collection
- Fan data belongs to artist, not platform
- Easy export/deletion of fan data

## Competitive Moat

What makes this different from Feature.fm + Linkfire + Laylo combined:

1. **Single source of truth** - All fan data in one place
2. **Cross-platform identity** - Connect the same fan across Spotify, email, merch
3. **Discovery attribution** - Know WHERE fans came from originally
4. **Funnel visualization** - See the complete fan journey
5. **Artist-owned data** - Full export, no lock-in
6. **Integrated with Boptone ecosystem** - BAP streaming, Kick In tips, etc.

## Implementation Priority

### Phase 1: Foundation
- [ ] Fan profile database schema
- [ ] Smart link system with UTM tracking
- [ ] Basic discovery source survey
- [ ] Link click analytics

### Phase 2: Identity
- [ ] Email/phone collection
- [ ] Spotify OAuth integration
- [ ] Fan profile merging

### Phase 3: Funnel
- [ ] Funnel stage tracking
- [ ] Cohort analysis
- [ ] Fan scoring algorithm

### Phase 4: Insights
- [ ] Dashboard with visualizations
- [ ] Automated insights generation
- [ ] Export functionality
