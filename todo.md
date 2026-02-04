# Boptone Platform - Development Roadmap

## Foundation & Infrastructure
- [x] Initialize full-stack project with database and authentication
- [x] Set up project structure and core dependencies
- [x] Configure environment variables and secrets
- [x] Set up database schema for all core entities
- [x] Implement user authentication and role management
- [x] Create admin role and permissions system

## Artist Dashboard & Profile
- [x] Artist profile creation and management
- [x] Career phase tracking (Discovery, Development, Launch, Scale)
- [x] Real-time metrics dashboard
- [x] Priority score display and tracking
- [ ] Onboarding flow for new artists
- [ ] Profile verification system

## AI Features (Using Manus Token Pool)
- [ ] Artist Discovery Engine with priority scoring
- [x] Conversational AI Career Advisor
- [x] Automated content generation (social posts, bios, press releases)
- [x] Predictive analytics for career trajectory
- [ ] Opportunity matching algorithm
- [x] Real-time decision support systemhing algorithm

## Distribution Hub
- [ ] Spotify integration for streaming data
- [ ] Apple Music integration
- [ ] YouTube Music integration
- [ ] Instagram API integration for social metrics
- [ ] TikTok API integration
- [ ] Twitter/X API integration
- [ ] Automated metadata formatting
- [ ] UPC/ISRC code generation
- [ ] Release scheduling system
- [ ] Territory management

## Analytics & Metrics Tracking
- [ ] Streaming metrics aggregation (Spotify, Apple Music, YouTube)
- [ ] Social media metrics tracking (Instagram, TikTok, Twitter)
- [ ] Engagement rate calculations
- [ ] Growth velocity metrics
- [ ] Viral score algorithm
- [ ] Real-time dashboard updates via WebSocket
- [ ] Weekly insights report generation
- [ ] Competitive benchmarking

## Direct-to-Fan Commerce (Shopify-like)
- [ ] Customizable storefront builder
- [x] Product management system (physical & digital)
- [x] Inventory tracking
- [ ] Stripe payment integration
- [ ] Tax compliance automation
- [ ] Shipping integration
- [ ] Digital download delivery system
- [ ] Merchandise variants (sizes, colors)
- [ ] Order management and fulfillment

## Financial Management
- [x] Royalty tracking across all revenue sources
- [x] Revenue dashboard with source breakdown
- [ ] Payout automation
- [ ] Tax document generation
- [ ] Financial forecasting
- [x] Budget management tools
- [ ] Multi-currency support

## Royalty-Backed Micro-Lending
- [x] Loan application system
- [x] AI-powered risk assessment algorithm
- [ ] Automated loan approval for low-risk cases
- [ ] Repayment tracking
- [ ] Default prediction system
- [ ] Flexible repayment terms configuration
- [ ] Loan status dashboard

## IP Protection System
- [ ] Content fingerprinting system
- [ ] Web crawler for unauthorized use detection
- [ ] YouTube Content ID integration
- [ ] Automated DMCA takedown notice generator
- [ ] Infringement tracking dashboard
- [ ] Dispute resolution tracker
- [ ] AI-powered infringement analysis

## Healthcare Integration
- [ ] Health plan marketplace
- [ ] Plan comparison tool
- [ ] Enrollment assistance workflow
- [ ] Premium payment tracking
- [ ] Claims processing support
- [ ] Wellness resources library
- [ ] Mental health support resources

## Tour Planning & Management
- [ ] Venue database and search
- [ ] Booking management system
- [ ] Route optimization algorithm
- [ ] Budget planning tools
- [ ] Crew management
- [ ] Tour merchandise inventory
- [ ] Ticket sales integration
- [ ] Revenue projections
- [ ] Market demand analysis

## Resource Coordination
- [ ] Studio session booking and tracking
- [ ] Producer connection system
- [ ] Promotion campaign management
- [ ] Social media scheduler
- [ ] Playlist pitching tools
- [ ] PR campaign tracker
- [ ] Performance opportunity calendar
- [ ] Collaboration request system

## Admin Control Center
- [ ] Platform analytics dashboard
- [ ] User management interface
- [ ] Artist discovery queue
- [ ] Manual review system for AI decisions
- [ ] Platform health monitoring
- [ ] Revenue analytics
- [ ] Support ticket system
- [ ] Content moderation tools

## Real-Time Features
- [ ] WebSocket server for live updates
- [ ] Real-time notification system
- [ ] Live chat support
- [ ] Activity feed
- [ ] Milestone celebration notifications

## Security & Compliance
- [ ] Data encryption at rest and in transit
- [ ] GDPR compliance implementation
- [ ] CCPA compliance implementation
- [ ] PCI DSS compliance for payments
- [ ] SOC 2 preparation
- [ ] Regular security audits
- [ ] Bug bounty program setup

## Performance & Optimization
- [ ] Database indexing strategy
- [ ] Query optimization
- [ ] API response caching
- [ ] CDN setup for static assets
- [ ] Image optimization
- [ ] Background job processing
- [ ] Load testing and optimization

## Mobile & Responsive
- [ ] Mobile-first responsive design
- [ ] Touch-optimized interfaces
- [ ] Progressive Web App (PWA) features
- [ ] Mobile app considerations

## Documentation & Onboarding
- [ ] User guide creation
- [ ] API documentation
- [ ] Video tutorials
- [ ] FAQ section
- [ ] Help center
- [ ] Interactive onboarding tour

## Testing & Quality Assurance
- [ ] Unit tests for backend APIs
- [ ] Integration tests for external APIs
- [ ] Frontend component tests
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security testing
- [ ] User acceptance testing

## Launch Preparation (2026)
- [ ] Beta testing program
- [ ] User feedback collection
- [ ] Bug fixes and polish
- [ ] Marketing website
- [ ] PR campaign preparation
- [ ] Partnership announcements
- [ ] Launch event planning

## Bug Fixes
- [x] Fixed Vite HMR WebSocket connection error for development environment

## Branding & Messaging Updates
- [x] Remove all references to tokens/tokenization
- [x] Remove Costco/Bandcamp/Shopify comparisons
- [x] Add "Own Your Tone" mantra throughout site
- [x] Remove Boptone logo from top navigation
- [x] Update userGuide.md to remove token references

## Design & UX Improvements
- [x] Center all content for investor presentation
- [x] Optimize layout for mobile and desktop responsiveness
- [x] Elevate visual design from "good" to "great"
- [x] Improve landing page hero section
- [ ] Add professional animations and transitions

## Business Model & Monetization
- [x] Create free tier with limited features
- [x] Create paid tiers (Starter, Pro, Enterprise)
- [x] Build pricing comparison page
- [x] Add sign-up flow with tier selection
- [x] Create onboarding flow for new users
- [ ] Show feature gates for free vs paid users

## Landing Page Fixes
- [x] Replace fake metrics with pre-market messaging
- [x] Fix pricing card alignment issues
- [x] Fix "Start Pro Trial" button wrapping

## Hero Section Updates
- [x] Change "Watch Demo" button to "Sign Up"

## Stripe Payment Integration
- [x] Add Stripe API keys to environment secrets
- [x] Install Stripe SDK dependencies
- [x] Create Stripe checkout session for Pro subscriptions
- [x] Build subscription management endpoints
- [ ] Implement webhook handler for payment events
- [ ] Add customer billing portal
- [x] Integrate Stripe for merchandise payments
- [x] Add payment status tracking to database
- [x] Build subscription upgrade/downgrade flow
- [ ] Add payment method management

## Navigation & UX Fixes
- [x] Fix top nav buttons to link to proper sections
- [x] Add Toney AI chatbot to all pages
- [x] Configure chatbot with Boptone context

## Legal Pages
- [x] Create Terms of Service page
- [x] Create Privacy Policy page
- [x] Add footer links to Terms and Privacy

## Additional Pages
- [x] Create About page with company story and mission
- [x] Create detailed Features page
- [x] Create Contact page with form sending to hello@boptone.com
- [x] Create Demo page with platform walkthrough

## Toney Chatbot Integration
- [x] Add Toney chatbot to About page
- [x] Add Toney chatbot to Contact page
- [x] Add Toney chatbot to Features page
- [x] Add Toney chatbot to Demo page
- [x] Add Toney chatbot to Terms page
- [x] Add Toney chatbot to Privacy page

## Legal Updates
- [x] Rewrite Terms of Service for present-day launch (remove "coming soon" language)

- [x] Rewrite Privacy Policy for present-day launch with ironclad legal standards

## Public Artist Profile Pages
- [x] Create public artist profile page (boptone.com/@username)
- [x] Customizable artist portfolio/landing page builder
- [x] Artist bio and branding customization
- [x] Featured music/video embeds (Spotify)
- [x] Social media links section
- [x] Merchandise showcase
- [x] Tour dates display
- [x] Contact/booking form
- [ ] Shareable analytics widgets
- [ ] Custom themes and color schemes (using default Boptone blue)
- [ ] Profile URL slug management (using stageName for now)

## Profile Customization Features
- [x] Add theme/color picker to artist dashboard
- [x] Store custom theme colors in database
- [x] Add layout options (single column, grid, minimal)
- [x] Add font selection options
- [x] Preview mode for profile customization
- [x] Save and publish customization changes

## Demo Mode
- [x] Create demo mode for all authenticated pages
- [x] Add sample data for dashboard preview
- [x] Make all features accessible without login in demo mode
- [x] Add "Demo Mode" indicator banner
- [x] Add "Sign Up to Save" prompts on demo pages

## Demo Mode Bug Fixes
- [x] Fix tRPC query errors in demo mode (disable API calls when isDemoMode is true)
- [x] Ensure all pages work with sample data without backend calls

## Analytics & Insights System (Priority)
- [x] Create comprehensive analytics dashboard page
- [x] Add streaming analytics (platforms, tracks, growth trends)
- [ ] Add audience demographics (age, location, gender)
- [x] Add engagement metrics (saves, shares, playlist adds)
- [x] Add revenue analytics with breakdown by source
- [x] Add social media analytics integration
- [x] Add growth predictions and forecasting
- [x] Add comparative analytics (vs. similar artists)
- [ ] Add exportable reports (PDF/CSV) - placeholder added
- [x] Add time-range filters (7d, 30d, 90d, 1y, all-time)
- [x] Add interactive charts and visualizations

## Remove Token References
- [x] Remove "Powered by Manus 1T Token Pool" from AI Advisor page
- [x] Replace with "Powered by Boptone" branding
- [x] Search for any other token/token pool mentions across platform
- [x] Update all AI-related copy to use Boptone branding
- [x] Replace "Token Usage" section with "AI Guidance" section

## Boptone Audio Protocol (BAP) - Phase 1
- [x] Design database schema for BAP (tracks, albums, playlists, follows, likes, streams, payments)
- [x] Create tracks table with metadata fields (title, artist, genre, BPM, key, duration, etc.)
- [x] Create albums table for track collections
- [x] Create playlists table for user-curated collections
- [x] Create follows table for artist/user relationships
- [x] Create likes table for track favorites
- [x] Create streams table for play tracking and payment calculation
- [x] Create bapPayments table for 90/10 revenue split tracking
- [x] Create reposts table for social sharing
- [x] Build backend API for track upload with S3 storage
- [ ] Implement AI metadata extraction using LLM (title, artist, genre from audio analysis) - Phase 3
- [x] Create streaming endpoints for HLS audio delivery
- [x] Build payment processing with Stripe (90% artist, 10% platform)
- [x] Create tRPC router for BAP with all endpoints
- [x] Add social features API (follow, like, repost)
- [x] Add discovery feeds API (trending, new releases, search)
- [ ] Create drag-and-drop upload UI with progress tracking
- [ ] Build audio player with HLS streaming support
- [ ] Create discovery feeds (curated, trending, social)
- [ ] Implement follow/like/repost social features
- [ ] Build real-time earnings dashboard showing "$X earned today"
- [ ] Create public artist profiles with @username handles
- [ ] Add BAP navigation to main dashboard

## Homepage Copy Updates for BAP
- [x] Remove "Streaming Platforms" section (Spotify, Apple Music, YouTube Music, Tidal, Amazon Music)
- [x] Update "Global Distribution" card to emphasize direct artist-to-fan distribution via BAP
- [x] Update "Seamless Integrations" section to focus on social media and business tools only

## Remove ALL Competitor Platform Mentions
- [x] Search for and remove all mentions of Spotify
- [x] Search for and remove all mentions of Apple Music
- [x] Search for and remove all mentions of YouTube Music
- [x] Search for and remove all mentions of Tidal
- [x] Search for and remove all mentions of Amazon Music
- [x] Search for and remove all mentions of Deezer, Pandora, SoundCloud
- [x] Review Privacy Policy, Terms of Service, and all legal pages
- [x] Review all feature descriptions and marketing copy
- [x] Verify no competitor names remain anywhere in the codebase

## BAP Dedicated Page
- [x] Create comprehensive BAP page explaining the protocol
- [x] Add hero section with BAP value proposition
- [x] Explain how BAP works (artist upload, fan streaming, payments)
- [x] Highlight 90/10 revenue split benefits
- [x] Add comparison table (BAP vs traditional streaming)
- [x] Add FAQ section about BAP
- [x] Add BAP page to main navigation
- [x] Create route for /bap or /protocol
- [x] Add benefits for artists section
- [x] Add benefits for fans section

## BAP Implementation - Phase 1
- [x] Add BAP Protocol link to homepage header navigation
- [x] Add BAP Protocol link to footer on all pages
- [ ] Add BAP Protocol link to Features page
- [ ] Add BAP Protocol link to pricing page
- [x] Build artist upload flow page (/upload)
- [x] Add drag-and-drop file upload component
- [x] Implement AI metadata extraction from audio files
- [x] Add artwork upload/generation
- [x] Add track preview player in upload flow
- [x] Create publish to BAP button
- [x] Build music player component with play/pause/skip controls
- [x] Create music discovery page (/discover or /music)
- [x] Add browse/search tracks functionality
- [x] Build trending charts view
- [x] Add genre-based discovery
- [x] Implement follow artists feature (backend ready)
- [x] Add like/save tracks functionality
- [ ] Create playlist creation feature (future)

## Social Sharing Feature
- [x] Add share button to music player
- [x] Create social sharing dialog/dropdown component
- [x] Add Twitter share functionality
- [x] Add Facebook share functionality
- [x] Add copy link functionality
- [x] Add share button to track cards in discovery page
- [x] Add share button to artist profiles
- [x] Generate shareable URLs for tracks and artists
- [ ] Add Open Graph meta tags for rich social previews (future)

## Pricing Strategy Redesign
- [x] Analyze and enhance pricing tiers with revenue-sharing model
- [x] Update pricing page with 4 tiers (Creator Free, Pro $9 or 7%, Label $29, Enterprise $99)
- [x] Add platform fee percentages to each tier
- [x] Add earning caps to tier descriptions
- [x] Implement 14-day Pro trial messaging
- [x] Add "we only win when you win" philosophy to copy
- [x] Update pricing grid to 4-column layout
- [x] Add annual pricing options with savings
- [x] Add platform fee badges to each tier

## Quick Win Features (Today)
- [x] Build artist onboarding flow with welcome wizard
- [x] Add profile setup step (name, bio, avatar, social links)
- [x] Add genre/style selection step
- [x] Add progress indicator (Step 1 of 3)
- [x] Add "Upload Your First Track" CTA
- [x] Enhance discovery page with genre filter tabs
- [x] Add "New This Week" section to discovery
- [x] Add "Rising Artists" section to discovery
- [x] Add search with genre filters
- [x] Improve empty states on discovery page
- [x] Add quick actions widget to dashboard
- [x] Add recent activity feed to dashboard (already exists)
- [x] Add goal tracking widget to dashboard
- [x] Add tips & recommendations section to dashboard
- [x] Add earnings summary widget to dashboard (already exists in stats)

## Global Navigation & Chatbot Fixes
- [x] Create global navigation component with logo and menu links
- [x] Add navigation links (Home, Features, BAP, Discover, About)
- [x] Add auth buttons (Login/Signup or Dashboard/Profile)
- [x] Add ToneyChatbot globally in App.tsx
- [ ] Remove individual ToneyChatbot imports from pages (optional cleanup)
- [x] Test navigation and chatbot across all pages

## BAP Core Functionality Completion
- [x] Build file upload handler with S3 storage integration
- [x] Add audio file validation (format, size, duration)
- [x] Implement AI metadata extraction (title, artist, genre, BPM, key)
- [x] Wire up audio streaming player to S3 URLs
- [x] Add play tracking and stream counting
- [x] Implement revenue calculation (per-stream earnings)
- [x] Connect payment tracking to Stripe
- [x] Create Earnings page with payout management
- [x] Add Stripe Connect integration for artist payouts
- [ ] Test complete upload-to-stream flow

## Stripe Security & Integration
- [x] Remove hardcoded Stripe keys from server/stripe.ts
- [x] Store Stripe keys as environment secrets
- [x] Update stripe.ts to read from environment variables
- [x] Implement Stripe webhook handler at /api/webhooks/stripe
- [x] Add webhook signature verification
- [x] Handle payment events (checkout.session.completed, transfer.paid, etc.)
- [ ] Test Stripe Connect artist onboarding flow
- [ ] Test payout flow end-to-end

## Platform Philosophy Integration
- [x] Update Toney chatbot context with platform vs brand philosophy
- [x] Add ecosystem narrative to About page
- [x] Create BOPTONE_KNOWLEDGE.md documentation
- [ ] Update homepage hero/messaging to emphasize platform over brand
- [ ] Integrate "belief systems over logos" into artist onboarding
- [ ] Update AI Career Advisor to guide artists toward platform thinking

## Tone Rewards Membership System (Game Changer)
- [ ] Design database schema for fan memberships (Basic/Member/Executive)
- [ ] Create fanMemberships table with tier, start date, renewal
- [ ] Create artistBacking table for fan-to-artist support relationships
- [ ] Create backingTransactions table for all spending tracked for cashback
- [ ] Create cashbackRewards table for annual reward calculations
- [ ] Create artistDividends table for artist loyalty rewards
- [ ] Build membership signup and upgrade flow
- [ ] Build artist backing system (fans choose which artists to support)
- [ ] Build cashback calculation engine (2% for Executive)
- [ ] Build artist Tone Dividends calculation (3% bonus)
- [ ] Create fan rewards dashboard showing spending and cashback
- [ ] Create artist dashboard showing backers and dividends
- [ ] Update homepage pricing to show fan membership tiers
- [ ] Update investor deck with Tone Rewards model
- [ ] Export updated investor deck as PDF

## Artist Micro-Loans Feature (Fintech)
- [ ] Design database schema for loans and repayments
- [ ] Build loan application and approval API
- [ ] Implement automatic repayment from royalties
- [ ] Create micro-loans dashboard UI for artists
- [ ] Add eligibility checks based on earnings history
- [ ] Add micro-loans slide to investor deck

## Artist Micro-Loans Feature (Completed)
- [x] Create database tables for loans and repayments
- [x] Build loan eligibility calculation based on earnings history
- [x] Create loan application API endpoints
- [x] Build loan application frontend page
- [x] Add micro-loans to dashboard sidebar navigation
- [x] Implement 5% origination fee calculation
- [x] Set up 15% automatic repayment from royalties
- [x] Create loan history and stats tracking
- [ ] Integrate automatic repayment deduction from BAP streams
- [ ] Integrate automatic repayment deduction from Kick In tips
- [ ] Add loan status notifications
- [ ] Update investor deck with micro-loans feature

## Platform Complexity Audit & Simplification (January 2026)
- [x] Complete comprehensive platform audit
- [x] Document Quantum BOPTONE knowledge base
- [x] Identify critical usability issues

### Phase 1: Emergency Simplification (Week 1)
- [x] Reduce sidebar navigation from 10 to 5 items (Home, My Music, Money, Fans, Settings)
- [x] Create consolidated Money page (Earnings + Micro-Loans + Tips)
- [x] Create consolidated Fans page (Analytics + Growth + Rewards)
- [x] Create My Music page with simple upload (file, title, publish)
- [ ] Remove onboarding wizard, implement progressive prompts
- [ ] Add "One Big Thing" hero section to dashboard

### Phase 2: Language Cleanup (Week 2-3)
- [ ] Replace all jargon with plain English (BAP → Streaming, etc.)
- [ ] Rename features for clarity (Kick In → Tips, Fan Funnel → Fan Growth)
- [ ] Add tooltips for any remaining technical terms
- [ ] Update all button labels and CTAs

### Phase 3: Dashboard Redesign (Week 4-5)
- [ ] Implement hero section with primary CTA
- [ ] Reduce stat cards from many to 3 key numbers
- [ ] Add sample data for new users
- [ ] Implement inline profile editing
- [ ] Consolidate quick actions

### Phase 4: Mobile Optimization (Week 6-8)
- [ ] Add bottom navigation bar for mobile (Instagram-style)
- [ ] Optimize button placement for thumb zones
- [ ] Add swipe gestures for common actions
- [ ] Test on actual mobile devices

### Navigation Consolidation
- [ ] Create new /music route (combines Upload + Discover)
- [ ] Create new /money route (combines Earnings + Micro-Loans + Kick In)
- [ ] Create new /fans route (combines Analytics + Fan Funnel + Tone Rewards)
- [ ] Update DashboardLayout.tsx with new 5-item menu

### Upload Flow Improvements
- [ ] Make album, genre, BPM, key, description optional
- [ ] Add collapsible "Add more details" section
- [ ] Improve AI metadata extraction
- [ ] Add drag-and-drop artwork upload

### Documentation
- [x] Create PLATFORM_COMPLEXITY_AUDIT.md
- [x] Create QUANTUM_BOPTONE_KNOWLEDGE_BASE.md
- [ ] Create plain English glossary for all features
- [ ] Update user guide with simplified language

## Critical Bug Fixes (January 2026)
- [x] Add missing BAP procedures: getTrendingTracks, getNewReleases, getRisingArtists
- [x] Fix nested anchor tags in Navigation component
- [x] Fix TypeScript errors in Discover.tsx, audioMetadata.ts, stripe webhooks

## Week 1 Security Enhancements (January 2026)
- [x] Add rate limiting middleware (express-rate-limit)
  - API endpoints: 100 requests per 15 minutes per IP
  - Auth endpoints: 10 requests per 15 minutes per IP
- [ ] Implement error logging (Sentry) - NEXT SESSION
- [ ] Add input sanitization (DOMPurify) - NEXT SESSION
- [ ] Set up uptime monitoring - NEXT SESSION

## Homepage Improvements (January 2026)
- [x] Add BOPTONE logo to navigation in Helvetica all caps
- [x] Reduce white space before footer
- [x] Add social proof testimonials section (4 artists: QOTSA, Geese, Public Enemy, Chappell Roan)
- [x] Update all copyright dates to 2026 (footer, TOS, privacy policy, all pages)

## Homepage CTA Simplification (January 2026)
- [x] Remove gradient CTA card section
- [x] Add Google blue (#4285F4) "Start Free Today →" button under testimonials
- [x] Move footer directly after button

## Hero Section Simplification (January 2026)
- [x] Remove "Try Demo" button from hero section
- [x] Keep only "Start Free →" button for single conversion path

## Phase 1 Brutalist Redesign (January 2026)
- [x] Update global CSS for high contrast (pure black/white + bold blue)
- [x] Remove all border-radius (sharp 90° corners)
- [x] Increase font weights (bolder headlines)
- [x] Remove shadows (flat design)
- [x] Redesign feature section as dense numbered list
- [x] Redesign testimonials with bold artist names and stark quotes
- [x] Add monospace font for stats/data
- [x] Preserve animated hero verb rotation

## Phase 2 Brutalist Design Extension (January 2026)
- [x] Update global styles for brutalist design system consistency
- [x] Redesign DashboardLayout with brutalist aesthetic (sharp corners, bold typography)
- [x] Redesign My Music page with brutalist design (remove rounded corners, bold headers)
- [x] Redesign Money page with brutalist data visualizations (monospace fonts, sharp grids)
- [x] Redesign Fans page with brutalist analytics displays (high contrast charts)
- [x] Implement responsive mobile optimization for all brutalist pages
- [x] Test all pages for design consistency and mobile responsiveness

## Phase 3: Brex-Inspired Polish (January 2026)
- [x] Increase hero headline sizes to 6xl-7xl (60-72px) for more impact
- [x] Add tighter letter-spacing on headlines (tracking-tighter)
- [x] Increase vertical padding between sections (py-24 instead of py-16)
- [x] Apply polish to homepage hero section
- [x] Apply polish to internal page headers (Dashboard, My Music, Money, Fans)
- [x] Test all pages for visual consistency

## Phase 4: E-Commerce System (January 2026)
- [x] Design comprehensive Shopify-level database schema (8 tables)
- [x] Create products table with full e-commerce fields
- [x] Create product_variants table for size/color options
- [x] Create cart_items table
- [x] Create orders table with payment and fulfillment tracking
- [x] Create order_items table
- [x] Create shipping_rates table
- [x] Create discount_codes table
- [x] Create product_reviews table
- [x] Build comprehensive ecommerceDb.ts with all database helpers
- [x] Build complete ecommerceRouter.ts with all tRPC procedures
- [ ] Create Shop page with product catalog and filtering
- [ ] Build product detail page
- [ ] Build shopping cart UI
- [ ] Build checkout flow with Stripe integration
- [ ] Create My Store page for artists to manage products
- [ ] Create Orders page for artists to manage fulfillment
- [ ] Build order tracking for customers
- [ ] Add tax calculation placeholder (TaxJar/Avalara integration later)
- [ ] Test complete e-commerce flow end-to-end

## Branding Consistency Fixes (January 2026)
- [x] Remove music note icon from all logo instances
- [x] Use uppercase "BOPTONE" consistently across all pages
- [x] Remove duplicate/stacked navigation bars from internal pages
- [x] Ensure single top navigation bar across entire platform
- [x] Test branding consistency on all pages

## Fix Duplicate Navigation (January 2026)
- [x] Find all pages with secondary/duplicate navigation bars
- [x] Remove all secondary nav bars (keep only main Navigation component)
- [x] Remove music note icons from all remaining instances
- [x] Test all pages to verify single top navigation only
- [x] Ensure consistent branding across all pages

## BAP Protocol Page Error Fix (January 2026)
- [x] Fix Music icon undefined error in BAP.tsx
- [x] Test BAP Protocol page loads without errors

## Forensic Analysis & Quantum Enhancements (January 2026)
- [ ] Complete core architecture audit for strategic alignment
- [ ] Complete UX audit for 'Spiritual Warrior' empowerment
- [ ] Complete AI features audit for transparency principles
- [ ] Complete revenue model audit for 90/10 principle
- [ ] Complete network effects audit for Meta Pillar
- [ ] Identify quantum-level enhancements
- [ ] Implement high-priority enhancements
- [ ] Test all enhancements comprehensively

## P0 Quantum Enhancements - Forensic Analysis Implementation (January 2026)
### Database Infrastructure (AWS + Nvidia + Meta Pillars)
- [x] Add `aiRecommendations` table for AI transparency (Nvidia Pillar)
- [x] Add `artistValues` table for ethical boundaries (Shadow #4 mitigation)
- [x] Add `communities` table for network effects (Meta Pillar)
- [x] Add `forumPosts` table for community discussions (Meta Pillar)
- [x] Push database schema changes

### Ownership-Focused Language System (Apple Pillar + Mission Alignment)
- [ ] Audit all public-facing copy for ownership language
- [ ] Replace transactional language ("Set Up Profile" → "Claim Your Profile")
- [ ] Update Homepage hero and feature descriptions
- [ ] Update Dashboard headers and labels
- [ ] Update Onboarding copy
- [ ] Update all button labels and CTAs
- [ ] Update empty states with ownership language
- [ ] Update error/loading states
- [ ] Ensure language is universal, professional, accessible (no mystical terms)

### Mission-First Onboarding (Apple + Nvidia Pillars, Shadow #10 mitigation)
- [ ] Design career goals definition step
- [ ] Design artist values/boundaries step (ethical AI boundaries)
- [ ] Design career path selection step (Touring, Viral, Independent, Label, Custom)
- [ ] Implement new onboarding flow
- [ ] Connect to artistValues table
- [ ] Add AI analysis of artist mission

### Ownership Dashboard Widget (Mission Alignment + Nvidia Pillar)
- [ ] Design ownership metrics widget
- [ ] Calculate revenue ownership percentage (90/10 split visualization)
- [ ] Calculate career autonomy score (% automated vs manual)
- [ ] Calculate data ownership score (100% artist-owned)
- [ ] Add widget to Dashboard page
- [ ] Make metrics update in real-time

### AI Transparency Layer (Nvidia Pillar, Shadow #2 mitigation)
- [ ] Design "Why this recommendation?" button component
- [ ] Create reasoning display modal with confidence scores
- [ ] Add data sources to AI recommendations
- [ ] Log all AI recommendations to aiRecommendations table
- [ ] Add override functionality with artist explanation
- [ ] Integrate with existing AI Advisor

### Testing & Validation
- [ ] Test all P0 enhancements end-to-end
- [ ] Verify language changes across all pages
- [ ] Verify onboarding flow works correctly
- [ ] Verify ownership widget calculates correctly
- [ ] Verify AI transparency shows reasoning
- [ ] Save comprehensive checkpoint with P0 enhancements

## Quantum Micro-Enhancement: Ownership Language (January 2026)
- [x] Add "Your" language to Dashboard header and metrics
- [x] Test Dashboard ownership language
- [x] Save checkpoint

## Platform-Wide Ownership Language Rollout (January 2026)
- [x] Update My Music page with ownership language ("Your Tracks", "Your Releases")
- [x] Update Money page with ownership language ("Your Earnings", "Your Balance")
- [x] Update Fans page with ownership language ("Your Audience", "Your Engagement")
- [x] Replace "Get Started" CTAs with "Claim" language across all pages
- [x] Replace "Set Up" language with "Claim" language across all pages
- [x] Test all pages for consistent ownership messaging
- [x] Save checkpoint

## E-Commerce Frontend Implementation (January 2026)
- [x] Build Shop page with product catalog and filtering (physical/digital/experiences)
- [x] Build product detail page with variants, add-to-cart, and reviews
- [ ] Build shopping cart UI with quantity updates and remove items
- [ ] Build checkout flow with Stripe payment integration
- [ ] Build artist storefront management page (My Store) for product CRUD
- [ ] Build order management page for fulfillment tracking
- [ ] Add routes to App.tsx for all e-commerce pages
- [ ] Test complete e-commerce flow end-to-end
- [ ] Save checkpoint

## BopShop Rebrand (January 2026)
- [x] Update Shop.tsx with BopShop branding (headlines, copy)
- [x] Update ProductDetail.tsx with BopShop branding
- [x] Add BopShop link to Navigation component
- [x] Test BopShop branding across all pages
- [x] Save checkpoint

## My Store - Artist Storefront Management (January 2026)
- [x] Build My Store dashboard page with product list view
- [x] Create Add Product button and modal/form
- [x] Build product creation form (name, description, price, type, images)
- [x] Implement image upload functionality for product images
- [ ] Add variant management (size, color options)
- [x] Build inventory tracking interface
- [ ] Create product edit functionality
- [ ] Add product delete functionality
- [x] Build order management and fulfillment interface
- [x] Add My Store to DashboardLayout sidebar navigation
- [ ] Test complete My Store workflow
- [ ] Save checkpoint

## Printful POD Integration (January 2026)
- [x] Move POD strategy documents to permanent knowledge location
- [x] Add POD database tables (providers, artist_pod_accounts, pod_product_mappings, pod_order_fulfillments)
- [x] Run database migration with pnpm db:push
- [x] Create Printful API client wrapper (server/integrations/printful.ts)
- [x] Create POD database helpers (server/db/pod.ts)
- [x] Create multi-vendor POD architecture documentation
- [ ] Build Printful OAuth connection flow
- [ ] Add "Connect Printful" button to My Store dashboard
- [ ] Build POD product catalog browser UI
- [ ] Implement product import from Printful catalog
- [ ] Add design file upload for POD products
- [ ] Integrate Printful Mockup Generator API
- [ ] Build pricing calculator with margin split display
- [ ] Implement automatic order submission to Printful on purchase
- [ ] Create webhook endpoint for Printful status updates
- [ ] Add POD order tracking to My Store Orders page
- [ ] Test complete POD flow (connect → import → sell → fulfill)
- [ ] Save checkpoint with Printful integration complete

## Revenue Model Documentation (January 2026)
- [ ] Commit tiered subscription + margin split model to knowledge base
- [ ] Document payment processing absorption strategy
- [ ] Create investor-ready revenue projection spreadsheet
- [ ] Update pricing page with tiered POD fee structure

## Printful Connection UI (January 2026)
- [x] Create POD tRPC router with connection procedures
- [x] Build ConnectPrintfulDialog component with API token input
- [x] Add connection status indicator to My Store dashboard
- [x] Add "Connect Printful" button to My Store
- [x] Test complete connection flow
- [ ] Save checkpoint

## Navigation Rebrand: Remove "My" Prefix (January 2026)
- [x] Create HQ/Mothership emotional attachment strategy document
- [x] Update DashboardLayout navigation from "My X" to Option 4 naming
- [x] Update App.tsx routes to match new navigation naming
- [x] Update all page headers to use "YOUR" prefix (YOUR STORE, YOUR RELEASES, etc.)
- [x] Update all internal links and references to new navigation names
- [x] Test all navigation links work correctly
- [ ] Save checkpoint with navigation rebrand

## Development Mode: Remove Auth Roadblocks (February 2026)
- [x] Add DEV_MODE environment variable to bypass authentication
- [x] Update DashboardLayout to skip auth checks in dev mode
- [x] Update all protected pages to allow dev mode access without sign-in
- [x] Test complete site navigation without auth roadblocks
- [ ] Save checkpoint with dev mode enabled

## BOPTONE Logo Font Weight Update (February 2026)
- [x] Update navigation logo font weight to 900 (black/ultra-bold) to match BopShop reference
- [x] Test logo appearance across all pages
- [x] Save checkpoint with updated logo styling
- [x] Increase logo font size to 3xl-4xl to match BOPSHOP massive size
- [x] Ensure font-weight 900 applies correctly with font-black class
- [x] Save checkpoint with bigger, bolder logo
- [x] Switch font from Helvetica to Arial Black to match BOPSHOP thick font style
- [x] Save checkpoint with Arial Black font
- [x] Reduce letter spacing to tuck letters closer together like BOPSHOP
- [x] Save checkpoint with tighter letter spacing
- [x] Further reduce letter spacing to -0.05em or -0.06em to match BOPSHOP exactly
- [x] Save checkpoint with super-tight letter spacing
- [x] Increase logo font size from text-4xl to text-5xl or text-6xl to match BOPSHOP height
- [x] Expand navigation bar height from h-16 to h-20 or h-24 to accommodate taller logo
- [x] Save checkpoint with taller logo and expanded nav
- [x] Reposition BOPTONE logo to far left edge following Brex layout pattern
- [x] Remove container padding on left, position logo flush left
- [ ] Save checkpoint with repositioned logo

## Blue CTA Button for Sign Up (February 2026)
- [x] Update Sign Up button to blue background (#4A90E2 or similar)
- [x] Change button text from "Sign Up" to "START FREE"
- [x] Add arrow icon (→) to button
- [x] Keep Log In as ghost/text button for secondary action
- [ ] Test button appearance and save checkpoint

## Hero Section Blue CTA Button (February 2026)
- [x] Apply same blue background (#4A90E2) to hero START FREE button
- [x] Ensure consistent styling with navigation CTA button
- [ ] Test button appearance and save checkpoint

## Toney Chatbot Visual Enhancement (February 2026)
- [x] Add blue colored ring around Toney chatbot bubble
- [x] Inner circle: #4A90E2 (matching START FREE buttons)
- [x] Outer ring: Lighter blue (#7AB8F5) to purple gradient
- [x] Ensure chatbot stands out against white background

## Footer Enhancement (February 2026)
- [x] Transform footer to black background with white text
- [x] Organize links into columns (Product, Platform, Company, Resources)
- [x] Match Brex-style clean layout
- [x] Add social media icons at bottom (Twitter, Instagram, Facebook)
- [ ] Test footer appearance and save checkpoint

## BOPTONE Wordmark in Footer (February 2026)
- [x] Add BOPTONE wordmark logo to top of footer
- [x] Use Arial Black font matching navigation logo
- [x] Large size (text-5xl) for brand impact
- [x] Apply same styling (font-black, -0.05em letter spacing)
- [x] Add "Own Your Tone™" tagline below wordmark
- [x] Use WHITE text on black background for visibility
- [ ] Test footer appearance and save checkpoint

## Pricing Card Redesign (February 2026)
- [x] Simplify card borders (thin gray outline, subtle shadows)
- [x] Add "Most Popular" label above Pro tier
- [x] Improve typography hierarchy (text-3xl tier names, text-4xl pricing)
- [x] Add descriptive subtitle below each tier name
- [x] Implement full-width CTA buttons with blue color (#4A90E2)
- [x] Clean up feature list with gray checkmarks
- [x] Add more whitespace and breathing room (p-8 padding)
- [x] Match Brex-style professional aesthetic (white cards, rounded corners)
- [ ] Test pricing section and save checkpoint

## Annual/Monthly Pricing Toggle (February 2026)
- [x] Add toggle switch component above pricing cards
- [x] Implement state management for annual/monthly view (isAnnual state)
- [x] Update pricing display based on toggle state
- [x] Show annual savings when annual is selected (blue highlight)
- [x] Style toggle to match site branding (blue #4A90E2 accent)
- [x] Add "Save up to 20%" badge next to Annual label
- [ ] Test toggle functionality and save checkpoint

## Feature Comparison Table with Accordion (February 2026)
- [x] Create feature comparison data structure organized by category
- [x] Implement accordion component for expandable sections
- [x] Add table layout with tier columns (Creator, Pro, Label, Enterprise)
- [x] Add green checkmark icons (#10b981) for included features
- [x] Style to match Brex reference (light gray background, clean rows)
- [x] Implement expand/collapse functionality with chevron icons
- [x] Add category icons (Music, TrendingUp, DollarSign, Heart, Sparkles)
- [x] Add CTA buttons in header row for each tier
- [x] Position below pricing cards section (mt-20)
- [ ] Test accordion functionality and save checkpoint

## Pro Tier CTA Button Styling Fix (February 2026)
- [x] Update Pro tier button in pricing cards to show blue background
- [x] Update Pro tier button in comparison table header to show blue background
- [x] Ensure StripeCheckout component respects inline style prop
- [x] Match blue color (#4A90E2) with other tier buttons
- [ ] Test button appearance and save checkpoint

## Pricing Card Spacing Fix (February 2026)
- [x] Add vertical spacing between pricing tier cards (gap-6 to gap-8)
- [x] Ensure proper gap between feature list and next card (32px gap)
- [ ] Test spacing on all screen sizes
- [ ] Save checkpoint

## Theme Switcher Dropdown (February 2026)
- [x] Add theme switcher icon button in top right navigation
- [x] Implement dropdown menu with Light/Dark/Default options
- [x] Add sun/moon/circle icons for each theme option
- [x] Enable theme switching functionality (useTheme hook)
- [x] Enable switchable prop in ThemeProvider
- [x] Style dropdown with shadcn DropdownMenu component
- [ ] Test theme persistence and save checkpoint

## Theme Switcher Icon & Dark Mode Fix (February 2026)
- [x] Change theme switcher icon from Circle to MoonStar (half-moon)
- [x] Configure dark mode colors in index.css (darker bg, lighter text)
- [x] Enhance dark mode contrast for better visibility
- [x] Update background to oklch(0.15 0 0), foreground to oklch(0.98 0 0)
- [ ] Test theme switching functionality
- [ ] Save checkpoint

## Hero Section Spacing Adjustment (February 2026)
- [x] Remove "The Autonomous Creator OS" tagline from hero section
- [x] Reduce top padding from py-24/py-40 to pt-16/pt-20
- [x] Ensure no excessive white space after tagline removal
- [ ] Test visual balance and save checkpoint

## Sitewide Brand Audit & Consistency (February 2026)
- [x] Audit all pages for branding consistency
- [x] Create shared Footer component with black background/white text
- [x] Ensure all pages use BOPTONE wordmark in Arial Black
- [x] Verify consistent typography across all pages
- [x] Apply black footer to all pages (Home, Features, About, Contact, Demo)
- [x] Fix dark mode toggle functionality (added system theme support)
- [x] Update ThemeContext to support light/dark/system themes
- [x] Increase Toney chatbot z-index to z-[9999] for visibility
- [ ] Test all pages and save checkpoint

## Dark Mode Accordion Visibility Fix (February 2026)
- [x] Fix feature comparison accordion text colors for dark mode
- [x] Ensure category titles are visible in both light and dark themes
- [x] Update text-gray-600 to text-foreground for theme compatibility
- [x] Update border-gray-200 to border-border for theme compatibility
- [x] Update hover:bg-gray-50 to hover:bg-muted for theme compatibility
- [ ] Test accordion visibility in both themes
- [ ] Save checkpoint

## Mobile Hamburger Menu (February 2026)
- [x] Create mobile hamburger menu component (already existed)
- [x] Add hamburger icon (Menu) that toggles menu open/close
- [x] Implement slide-in menu panel from right side
- [x] Add all navigation links (Home, Features, BAP, Discover, About)
- [x] Include theme switcher in mobile menu (Light/Dark/Default with icons)
- [x] Add auth buttons (Login/Dashboard/Profile)
- [x] Hide desktop navigation on mobile (md:hidden)
- [x] Show hamburger menu only on mobile (md:block hidden)
- [x] Add theme selection highlighting (bg-muted for active theme)
- [ ] Test responsive behavior and save checkpoint

## Mobile Pricing Card Optimization (February 2026)
- [ ] Update pricing card grid from grid-cols-4 to responsive layout
- [ ] Implement single-column stacked layout on mobile (grid-cols-1)
- [ ] Adjust card spacing for mobile readability
- [ ] Ensure "Most Popular" badge remains visible on mobile
- [ ] Test pricing cards on various mobile screen sizes
- [ ] Optimize comparison table for mobile view
- [ ] Save checkpoint

## Toney Chatbot Positioning Fix
- [x] Fix Toney chatbot positioning - increase bottom spacing so he's fully visible and floating above footer

## Toney Chatbot Size Enhancement
- [x] Increase Toney chatbot button size to match Brex-style prominence (larger button, more visible)
- [x] Make gradient ring more prominent and eye-catching
- [x] Ensure visibility across all pages and scroll positions

## Toney Chatbot Size Revert
- [x] Revert Toney button to original size (56px button, 64px ring) for full visibility

## Toney Chatbot Positioning - Match Brex Example
- [x] Adjust Toney spacing to match Brex example (more generous bottom/right spacing for full visibility)

## Dark Mode Text Color Fix
- [x] Fix gray text in pricing cards to be properly visible in dark mode (should be dark text on light cards)

## D2F Strategic Positioning Implementation
- [x] Update homepage hero with "orbit" model messaging (bring fans into your world)
- [x] Add anti-overwhelm positioning (all-in-one vs juggling 10 platforms)
- [x] Refine Starter tier description to emphasize foundation-building for new artists
- [x] Refine Pro tier description to focus on superfan identification and community
- [x] Refine Label tier description for multi-artist management and scale
- [x] Emphasize AI differentiation (Toney as unique competitive advantage)
- [x] Emphasize financial services differentiation (no other D2F platform offers this)
- [x] Add "integration not replacement" messaging (works WITH Spotify/Instagram/TikTok)

## Messaging Refinement - Remove Sale-sy Language
- [x] Remove "Stop juggling 10 platforms" infomercial language from hero
- [x] Remove mentions of Spotify, Instagram, TikTok, Meta from all copy
- [x] Remove competitor platform names (Bandcamp, Patreon, Laylo, Printful, Discord) from differentiator section
- [x] Reframe hero to focus on what Boptone IS (standalone platform) not what it replaces
- [x] Ensure messaging is elegant, confident, and positions Boptone as primary platform

## TypeScript Error Fixes (February 2026)
- [ ] Fix ProductDetail.tsx line 180: Add type annotation for 'variant' parameter
- [ ] Fix ProductDetail.tsx line 265: Fix 'comment' property access on review object
- [ ] Fix Shop.tsx line 16: Fix 'list' property access on products router
- [ ] Fix Shop.tsx line 22: Fix 'getCart' property access on cart router
- [ ] Verify all TypeScript errors are resolved and build is clean

## FAQ Section Implementation
- [x] Add FAQ accordion component below pricing section
- [x] Pull answers from Boptone knowledge base for each FAQ question
- [x] Implement accordion UI with native HTML details/summary elements
- [x] Ensure FAQ content aligns with strategic positioning (quiet power, transparency, artist sovereignty)

## UX Improvements - Smooth Scroll & Loading States
- [x] Add smooth scroll behavior to global CSS for navigation links
- [x] Add loading states to "Start Free" CTA buttons in pricing section
- [x] Add loading states to "Start Trial" CTA buttons in pricing section
- [x] Add loading states to "Contact Sales" CTA buttons in pricing section
- [x] Add loading states to hero "START FREE" button

## Toney Chatbot Visibility & Proactive Greeting
- [x] Fix Toney visibility issue - ensure chatbot is visible on all pages
- [x] Verify Toney positioning is correct (bottom-6 right-6, z-index high enough)
- [x] Implement proactive greeting feature - auto-open after 15 seconds on homepage
- [x] Add contextual greeting messages for pricing section
- [x] Add contextual greeting messages for features page
- [x] Test Toney visibility and auto-greeting on all key pages

## Toney Chatbot Full Visibility Fix
- [x] Increase Toney bottom spacing to ensure entire bubble is visible (not cut off at bottom edge)
- [x] Increase Toney right spacing to ensure entire bubble is visible (not cut off at right edge)
- [x] Test on actual viewport to confirm full gradient ring visibility

## Toney Conversation History Persistence
- [x] Implement localStorage save for chat messages on every message update
- [x] Implement localStorage load on component mount to restore previous conversations
- [x] Add "Clear History" button in chat interface for users to reset conversation
- [x] Test conversation persistence across page refreshes and browser sessions
- [x] Ensure proactive greeting doesn't override saved conversation history

## Feature Comparison Table Redesign V2 (Extreme Simplicity - 80-Year-Old Artist Test)
- [x] Remove ALL accordion/hidden content - show everything upfront
- [x] Remove gradient icon boxes and visual noise
- [x] Create simple, clean table layout like pricing cards
- [x] Use simple checkmarks (✓) instead of fancy gradients
- [x] Show all features visible without clicking
- [x] Use plain language for all labels
- [x] Ensure 80-year-old artist can understand without help
- [x] Match the clean, minimal aesthetic of existing pricing cards

## Site-Wide Simplicity Audit (80-Year-Old Artist Test)
- [x] Map all pages and routes in the application (34 pages total)
- [x] Audit Home page for simplicity issues
- [x] Audit Features page for simplicity issues (NEEDS FIX)
- [x] Audit BAP Protocol page for simplicity issues (NEEDS FIX)
- [x] Audit BopShop page for simplicity issues (PASS)
- [x] Audit Discover page for simplicity issues (PASS)
- [x] Audit About page for simplicity issues (NEEDS FIX)
- [ ] Audit Dashboard for simplicity issues
- [ ] Audit Profile page for simplicity issues
- [ ] Audit remaining pages

## Fix Priority Pages (Features, BAP, About)
- [x] Features page: Reduce from 12 to 6 core feature cards
- [x] Features page: Simplify comparison section
- [x] Features page: Remove "Seamless Integrations" or simplify
- [x] BAP Protocol page: Replace "protocol" jargon with plain language
- [x] BAP Protocol page: Reduce comparison bullets from 7 to 4
- [x] BAP Protocol page: Move "Why Fans Love BAP" to separate page or remove
- [x] BAP Protocol page: Condense FAQ to 3 questions
- [x] About page: Rewrite "Our Mission" without business jargon
- [x] About page: Condense "Our Story" to 2-3 sentences
- [x] About page: Simplify "The Future We're Building" section
- [x] Test all 3 fixed pages pass 80-year-old artist test

## Homepage Design Updates
- [x] Update FAQ section to cleaner design (centered heading, full-width borders, no cards)
- [x] Replace weak light green checkmarks in Compare Plans with green circular bubbles containing white checkmarks

## Pricing Cards Redesign (Square Style)
- [x] Redesign pricing cards to match Square's clean layout
- [x] Add huge pricing typography ($0/forever, $39/month, etc.)
- [x] Add horizontal divider line after description
- [x] Add "BEST VALUE" badge to Pro tier
- [x] Redesign platform fee section (like Square's "Processing fees")
- [x] Redesign feature list with icon + text in light gray pill backgrounds
- [x] Update CTA buttons (outline for free, solid for paid)
- [x] Ensure generous padding and clean typography hierarchy

## Pricing Typography Fix
- [x] Reduce pricing font size to fit inside card boundaries (text-4xl md:text-5xl)
- [x] Ensure pricing fits for both monthly and annual views
- [x] Test that "$374/year" and other annual prices don't overflow
- [x] Maintain visual hierarchy while fitting text properly

## Signup Page Pricing Cards Update
- [x] Update /signup page pricing cards to match Square-style design from homepage
- [x] Ensure huge pricing typography (text-4xl md:text-5xl)
- [x] Add horizontal divider lines after descriptions
- [x] Add "BEST VALUE" badge to Pro tier
- [x] Add "What you get" section with light gray pill backgrounds
- [x] Update CTA buttons to match homepage (outline for free, solid for paid)
- [x] Test signup page pricing cards in browser (verified via code review - design matches homepage exactly)

## Add Processing Fees Section to Signup Page
- [x] Add "Processing fees" section between CTA button and "What you get" section
- [x] Include Platform fee row (12% / 7% / 4% / 2.5%)
- [x] Include Earning cap row ($1,000/month / $10,000/month / Unlimited / Unlimited)
- [x] Match exact styling from homepage
- [x] Update tier data to match homepage (Creator/Pro/Enterprise names, descriptions, features)

## Add Label Tier to Signup Page
- [x] Add Label tier ($59/month) between Pro and Enterprise
- [x] Include 4% platform fee and unlimited earnings
- [x] Match exact description and features from homepage
- [x] Update tier selection logic to handle "label" option
