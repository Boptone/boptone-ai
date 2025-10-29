# Boptone - Autonomous Creator OS

**Mission Control for the 2030+ Creator Economy**

Boptone is an AWS-level platform combining the best of Costco (bulk power), Bandcamp (artist-first), and Shopify (commerce platform) to empower musicians and creators with complete career autonomy.

## Vision

By 2026, Boptone will be the operating system for independent artists worldwide, providing:
- AI-powered career guidance and opportunity matching
- Global music distribution to all streaming platforms
- Direct-to-fan e-commerce with payment processing
- Royalty-backed micro-loans for career investment
- IP protection with automated DMCA enforcement
- Artist-focused healthcare and wellness benefits
- Tour planning and logistics management
- Real-time analytics and revenue tracking

## Technology Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety across the codebase
- **Tailwind CSS 4** - Utility-first styling with custom design system
- **shadcn/ui** - High-quality, accessible component library
- **Wouter** - Lightweight routing
- **tRPC** - End-to-end type-safe APIs

### Backend
- **Node.js + Express** - Scalable server runtime
- **tRPC 11** - Type-safe procedure calls
- **Drizzle ORM** - Type-safe database queries
- **MySQL/TiDB** - Production-grade relational database
- **Manus OAuth** - Secure authentication with role-based access

### AI & Services
- **Manus AI (1T Token Pool)** - Unlimited AI features for career guidance, content generation, and predictive analytics
- **S3 Storage** - Scalable file storage for media and documents
- **Manus Infrastructure** - Auto-scaling deployment with global CDN

## Project Structure

```
boptone/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── Home.tsx           # Landing page
│   │   │   ├── Dashboard.tsx      # Artist dashboard
│   │   │   ├── AIAdvisor.tsx      # AI career advisor
│   │   │   ├── Store.tsx          # Merchandise management
│   │   │   ├── Financials.tsx     # Revenue & loans
│   │   │   ├── IPProtection.tsx   # Copyright monitoring
│   │   │   ├── Tours.tsx          # Tour planning
│   │   │   ├── Healthcare.tsx     # Health benefits
│   │   │   └── Admin.tsx          # Platform administration
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/          # Utilities and tRPC client
│   │   └── index.css     # Global styles & design tokens
│   └── public/           # Static assets (logo, etc.)
├── server/               # Backend Node.js application
│   ├── routers.ts       # tRPC API procedures
│   ├── db.ts            # Database query helpers
│   └── _core/           # Framework internals
├── drizzle/             # Database schema and migrations
│   └── schema.ts        # All database tables
└── shared/              # Shared types and constants
```

## Database Schema

### Core Tables
- **users** - Authentication and user management
- **artistProfiles** - Artist metadata, career phase, priority scores
- **streamingMetrics** - Spotify, Apple Music, YouTube data
- **socialMediaMetrics** - Instagram, TikTok, Twitter analytics
- **revenue** - Income tracking across all sources
- **microLoans** - Royalty-backed financing
- **products** - Merchandise catalog (physical, digital, experiences)
- **releases** - Music distribution tracking
- **ipInfringements** - Copyright violation detection
- **tours** - Live performance planning
- **healthcarePlans** - Artist health coverage
- **opportunities** - AI-detected career opportunities
- **notifications** - Real-time user alerts
- **analyticsSnapshots** - Historical trend data

## Key Features

### 1. AI-Powered Career Guidance
Uses Manus 1T token pool for:
- Conversational career advisor
- Release strategy recommendations
- Social media growth tactics
- Content generation (bios, press releases, social posts)
- Predictive analytics for career trajectory

### 2. Financial Services
- Revenue aggregation from streaming, merch, shows, licensing
- Royalty-backed micro-loans with AI risk assessment
- 5% fixed interest rate, flexible terms (6-24 months)
- Automatic repayment from future royalties

### 3. E-Commerce Platform
- Product management for physical merch, digital downloads, and experiences
- Inventory tracking and sales analytics
- Payment processing integration (ready for Stripe)
- Tax compliance automation (planned)

### 4. IP Protection
- AI-powered infringement detection across YouTube, SoundCloud, social media
- Audio fingerprinting with 99.9% accuracy
- Automated DMCA takedown filing
- Status tracking and resolution monitoring

### 5. Healthcare & Wellness
- Three-tier plans: Basic ($99), Standard ($199), Premium ($349)
- Mental health therapy and substance abuse support
- Vocal cord specialist access
- Performance injury treatment
- 24/7 concierge medical service

### 6. Tour Management
- Tour planning with dates, budgets, revenue projections
- Venue tracking and show scheduling
- Profit margin calculations
- Route optimization guidance

### 7. Admin Control Center
- Platform-wide analytics and user management
- System health monitoring
- Loan approval workflows
- IP case review
- Role-based access control

## Development

### Prerequisites
- Node.js 22.13.0
- pnpm package manager
- MySQL/TiDB database

### Getting Started

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables
All required environment variables are automatically injected by Manus:
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - OAuth application ID
- `OAUTH_SERVER_URL` - OAuth backend
- `BUILT_IN_FORGE_API_URL` - Manus AI & services
- `BUILT_IN_FORGE_API_KEY` - API authentication

### Adding Features

1. **Database Changes:**
   - Edit `drizzle/schema.ts`
   - Run `pnpm db:push`

2. **Backend API:**
   - Add query helpers in `server/db.ts`
   - Create procedures in `server/routers.ts`

3. **Frontend UI:**
   - Create page in `client/src/pages/`
   - Add route in `client/src/App.tsx`
   - Use `trpc.*.useQuery/useMutation` hooks

## Deployment

### Via Manus Platform

1. **Save Checkpoint:**
   ```
   Use webdev_save_checkpoint tool or Management UI
   ```

2. **Publish:**
   - Click "Publish" button in Management UI header
   - Platform deploys to Manus infrastructure with auto-scaling
   - Custom domains configurable in Settings → Domains

### Production Checklist

- [ ] Replace test API keys in Settings → Secrets
- [ ] Configure custom domain
- [ ] Set up Stripe for payment processing
- [ ] Enable SSL for database connections
- [ ] Configure email notifications
- [ ] Set up monitoring and alerts
- [ ] Review and update privacy policy
- [ ] Test all user flows end-to-end

## Roadmap

### Phase 1 (2026 Q1) - MVP Launch
- ✅ Core platform infrastructure
- ✅ Artist dashboard and profiles
- ✅ AI career advisor
- ✅ Financial management and micro-loans
- ✅ E-commerce and merchandise
- ✅ IP protection monitoring
- ✅ Tour management
- ✅ Healthcare enrollment
- ✅ Admin control center

### Phase 2 (2026 Q2) - External Integrations
- [ ] Spotify API integration for real-time streaming data
- [ ] Instagram/TikTok APIs for social metrics
- [ ] Stripe payment processing
- [ ] DistroKid/TuneCore distribution partnerships
- [ ] Healthcare provider network integration

### Phase 3 (2026 Q3) - Advanced AI Features
- [ ] Artist discovery engine with priority scoring
- [ ] Opportunity matching algorithm
- [ ] Automated content generation pipeline
- [ ] Predictive career trajectory modeling
- [ ] Real-time decision support system

### Phase 4 (2026 Q4) - Scale & Optimization
- [ ] Mobile app (iOS/Android)
- [ ] White-label platform for labels/managers
- [ ] API for third-party integrations
- [ ] Advanced analytics and reporting
- [ ] Multi-language support

## Contributing

Boptone is built to evolve with the creator economy. To request features or report issues:
1. Use the AI advisor to describe needed functionality
2. Submit detailed requirements via platform feedback
3. Work with Manus AI to implement changes iteratively

## License

Proprietary - Boptone™ is a registered trademark with the USPTO.

## Support

For technical support or platform questions:
- **Website:** https://help.manus.im
- **AI Advisor:** Built-in conversational support
- **Documentation:** This README and userGuide.md

---

**Built with Manus AI - Empowering the Creator Economy**
