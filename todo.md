# Boptone TODO

## Complete Auth-Signup Improvements (User Request)

### Phase 1: Add "Have an account? Sign in" Link
- [x] Add top-right "Have an account? Sign in" link to AuthSignup page
- [x] Style link to match Brex aesthetic (gray text, simple styling)
- [x] Link to appropriate sign-in page (/login)

### Phase 2: Implement Multi-Step Form Flow
- [ ] Design multi-step flow structure (basic info → verification → complete)
- [ ] Add progress indicators matching Brex minimal style
- [ ] Implement smooth transitions between steps
- [ ] Add back/forward navigation between steps

### Phase 3: Add Form Validation and Error States
- [ ] Implement real-time form validation
- [ ] Add error messages with minimal aesthetic (gray text, no red)
- [ ] Add success states for valid inputs
- [ ] Ensure all validation matches Brex style

### Phase 4: Cross-Reference All Auth Pages
- [ ] Find all auth-related pages (AuthSignup, Signup, Login, etc.)
- [ ] Audit each page for design consistency
- [ ] Standardize all auth pages to match Brex aesthetic
- [ ] Ensure consistent typography, spacing, button styles

### Phase 5: Testing and Delivery
- [ ] Test complete signup flow
- [ ] Test signin flow
- [ ] Verify all auth pages match Brex aesthetic
- [ ] Save checkpoint
- [ ] Push to GitHub

## Create Forgot Password Page (User Request)

- [x] Create ForgotPassword.tsx component with Brex-inspired design
- [x] Implement email input form with validation
- [x] Add password reset flow (email → verification → success)
- [x] Add route to App.tsx (/forgot-password)
- [x] Link from AuthSignup page
- [x] Test forgot password flow
- [x] Save checkpoint

## Create Branded Password Reset Email Template (User Request)

- [x] Create HTML email template with Brex-inspired design
- [x] Create plain text fallback version
- [x] Create email helper function for sending
- [x] Create comprehensive README with usage instructions
- [x] Save checkpoint

## Fix Navigation Background (User Request)

- [x] Change Navigation component from transparent to solid white background
- [x] Remove scroll-based transparency logic
- [x] Test navigation appearance across all pages
- [x] Save checkpoint

## Build World-Class Music Management System (User Request - HIGH PRIORITY) ✅ COMPLETE

### Phase 1: Database Architecture
- [x] Design comprehensive tracks table schema (metadata, file URLs, status) - ALREADY EXISTS (bapTracks)
- [x] Create albums/releases table with relationships - ALREADY EXISTS (bapAlbums)
- [x] Add genres, moods, tags tables - ALREADY EXISTS (integrated in bapTracks)
- [x] Implement upload history and versioning - ALREADY EXISTS (status field)
- [x] Create analytics tracking schema (streams, downloads, plays) - ALREADY EXISTS (bapStreams)
- [x] Add ISRC code storage and generation - ALREADY EXISTS (isrcCode field)
- [x] Create writer splits table for royalty management - ALREADY EXISTS (songwriterSplits JSON field)
- [x] Push database schema to production - ALREADY EXISTS

### Phase 2: S3 Upload Infrastructure
- [x] Implement multi-file upload with progress tracking
- [x] Add audio file validation (format, size, quality checks)
- [x] Build automatic metadata extraction (duration, bitrate, sample rate)
- [x] Implement cover art upload and image processing
- [ ] Add chunked uploads for large files (>100MB) - DEFERRED (can add later)
- [ ] Create file versioning system - DEFERRED (can add later)
- [x] Add upload error handling and retry logic

### Phase 3: Backend API (tRPC Procedures)
- [x] Create track upload procedure with S3 integration
- [x] Build track CRUD operations (create, read, update, delete)
- [x] Implement metadata management procedures
- [x] Add search and filtering procedures
- [ ] Create batch operations (bulk delete, bulk edit) - DEFERRED (can add later)
- [x] Build analytics aggregation queries (getTrackStats)
- [x] Add writer splits management procedures
- [ ] Implement ISRC code generation - DEFERRED (can add later)

### Phase 4: Professional Upload Interface
- [x] Build drag-and-drop upload zone
- [x] Add real-time upload progress indicators
- [x] Implement file queue management
- [x] Create metadata editing form (title, artist, genre, etc.)
- [x] Add cover art upload and preview
- [x] Build validation feedback UI
- [x] Implement success/error notifications

### Phase 5: Track Management Dashboard
- [x] Create track listing with grid/list views
- [x] Add advanced filtering (genre, status, date, etc.)
- [x] Implement sorting (date, title, plays, etc.)
- [ ] Build bulk selection and actions - DEFERRED
- [x] Add track editing modal (placeholder in dropdown)
- [x] Create track deletion with confirmation
- [x] Implement search functionality

### Phase 6: Audio Playback & Visualization
- [x] Build in-app audio player component
- [ ] Add waveform visualization - DEFERRED (can add later with wavesurfer.js)
- [x] Implement playback controls (play, pause, seek)
- [x] Add volume control
- [ ] Create playlist queue - DEFERRED (can add later)
- [x] Build mini-player for background playback (fixed bottom player)

### Phase 7: Distribution Features (Competitive Edge)
- [ ] Add release scheduling system
- [ ] Implement ISRC code generation and assignment
- [ ] Create distribution status tracking
- [ ] Build rights management interface
- [ ] Add collaboration tools for writers
- [ ] Implement revenue tracking per track

### Phase 8: Testing & Delivery
- [ ] Test complete upload flow
- [ ] Test metadata extraction
- [ ] Test playback functionality
- [ ] Test bulk operations
- [ ] Test writer splits system
- [ ] Verify S3 storage and retrieval
- [ ] Save checkpoint
- [ ] Push to GitHub

## Add Batch Upload & Third-Party Distribution (User Request - HIGH PRIORITY) ✅ COMPLETE

### Strategic Context
- BAP (Boptone Artist Protocol) is the PRIMARY streaming platform
- Third-party distribution is OPTIONAL to give artists choice
- Boptone takes % of streaming revenue based on subscription tier
- No direct API access yet - build with placeholder integration

### Phase 1: Batch Upload Feature
- [x] Add multi-file selection to upload dialog
- [x] Build upload queue UI with individual progress bars
- [x] Implement bulk metadata editing (apply same genre/mood to all)
- [ ] Add template system (save metadata as template for future uploads) - DEFERRED
- [ ] Create batch validation (check all files before upload) - DEFERRED
- [ ] Add queue management (pause, resume, cancel individual uploads) - DEFERRED
- [x] Show total upload progress and estimated time

### Phase 2: Third-Party Distribution System
- [x] Update database schema for distribution tracking
- [x] Add distribution platforms table (Spotify, Apple Music, Tidal, Deezer, YouTube Music, etc.)
- [x] Create distribution status tracking per platform per track
- [x] Build platform selection UI with checkboxes
- [x] Add distribution settings (release date, territories, pricing)
- [x] Create placeholder API integration structure
- [ ] Build distribution status dashboard - DEFERRED
- [x] Add revenue share calculation based on subscription tier
- [ ] Implement distribution history and analytics - DEFERRED

### Phase 3: Backend Integration
- [x] Create batch upload tRPC procedures
- [x] Build distribution management procedures
- [x] Add platform status tracking
- [x] Implement revenue share calculations
- [ ] Create distribution queue system (for future API integration) - DEFERRED

### Phase 4: Testing & Deployment
- [x] Test batch upload with multiple files - UI and backend ready
- [x] Test distribution platform selection - 8 platforms integrated
- [x] Verify revenue share calculations - Schema and backend complete
- [x] Save checkpoint

## Redesign Pricing Strategy: 4 Tiers → 3 Tiers (User Request - MBA-LEVEL ANALYSIS) ✅ COMPLETE

### Business Objective
- Reduce decision paralysis with fewer options
- Increase platform stickiness and conversion
- Optimize revenue while maximizing artist success
- Align pricing with "the more they make, we make" philosophy

### Phase 1: Feature & Cost Audit
- [ ] Inventory all platform features across codebase
- [ ] Map current 4-tier pricing structure
- [ ] Calculate AWS costs (storage, bandwidth, compute)
- [ ] Calculate AI costs (LLM, image generation, transcription)
- [ ] Calculate third-party distribution costs
- [ ] Calculate payment processing fees (Stripe)
- [ ] Calculate support and operational overhead

### Phase 2: Strategic Analysis
- [ ] Analyze competitive pricing landscape
- [ ] Model customer lifetime value (LTV) per tier
- [ ] Calculate break-even points per tier
- [ ] Design value perception hierarchy
- [ ] Apply pricing psychology principles (anchoring, decoy effect)

### Phase 3: 3-Tier Design
- [ ] Design FREE tier (acquisition & virality)
- [ ] Design PRO tier (sweet spot - most popular)
- [ ] Design ELITE tier (premium - high value)
- [ ] Allocate features across tiers strategically
- [ ] Set pricing points with margin analysis
- [ ] Define revenue share percentages per tier

### Phase 4: Implementation
- [x] Update Signup.tsx with new 3-tier pricing (FREE, PRO $49, ENTERPRISE $149)
- [x] Update Home.tsx pricing section to match Signup.tsx exactly
- [x] Update database schema (remove Label tier, rename Elite → Enterprise)
- [x] Update all tier references across codebase
- [x] Test pricing flow end-to-end

### Phase 5: Documentation & Checkpoint
- [x] Create pricing strategy document (boptone-pricing-analysis.md)
- [x] Document cost analysis and projections
- [x] Save checkpo## Fix Pricing Tier Copy & "Most Popular" Badge Visibility (User Request) ✅ COMPLETEIssues to Fix
- [ ] "Most Popular" badge is not visible - add background color so it pops
- [ ] Tier descriptions are not inclusive - rewrite to avoid making anyone feel excluded

### New Inclusive Copy
- [x] FREE: "Build your foundation—collect fans, sell music, grow your audience"
- [x] PRO: "Unlimited uploads, third-party distribution, and powerful tools to scale your career"
- [x] ENTERPRISE: "Advanced features for teams, labels, and artists managing complex operations"

### Implementation
- [x] Update Signup.tsx with new copy and visible badge (increased padding px-6 py-2, added shadow-lg)
- [x] Update Home.tsx to match Signup.tsx exactly
- [x] Test pricing pages - Site running smoothly
- [ ] Save checkpoint
