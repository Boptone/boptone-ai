# Boptone Repository Structure

## Branch Overview

### `main` branch
**Purpose:** Original AI experiments and early prototypes  
**Status:** Historical reference  
**Deploy:** ❌ Do not deploy

### `platform-v2` branch ⭐ **PRODUCTION**
**Purpose:** Complete production platform with unified AI system  
**Status:** Production-ready, fully tested  
**Deploy:** ✅ Deploy this branch

---

## What's in `platform-v2` (Production Branch)

### Core Features
1. **Unified AI Nervous System**
   - AIOrchestrator service connecting all AI features
   - Toney chatbot with LLM integration and full platform awareness
   - AI Workflow Assistant (natural language → executable workflows)
   - Proactive AI recommendations engine

2. **Workflow Automation System**
   - n8n-inspired visual workflow builder (React Flow)
   - 10 pre-built templates for common artist tasks
   - Node-based execution engine with topological sorting
   - Trigger system (webhook, schedule, event, manual)
   - Action system (email, social, SMS, webhooks, AI)

3. **Payout System**
   - Instant payouts (1% fee, 1-hour delivery)
   - Standard payouts (free, next-day)
   - Bank account management
   - Earnings dashboard widget
   - Flexible payout schedules

4. **Database Schema**
   - 6 workflow tables (workflows, executions, logs, triggers, templates, history)
   - 3 AI context tables (ai_context, ai_events, ai_recommendations)
   - 3 payout tables (payout_accounts, payouts, earnings_balance)
   - Complete artist/user management

### Technical Stack
- **Frontend:** React 19 + Tailwind 4 + Vite
- **Backend:** Express 4 + tRPC 11
- **Database:** MySQL/TiDB (Drizzle ORM)
- **AI:** LLM integration via built-in helpers
- **Storage:** S3 for file storage
- **Workflow Engine:** Custom node-based execution with React Flow UI

### Code Quality
- ✅ Zero TypeScript compilation errors
- ✅ All major pages tested and working
- ✅ Production-ready codebase
- ✅ Comprehensive documentation in `/docs`

---

## Documentation

All architecture documents are in the `/docs` folder:

1. **`boptone-trillion-dollar-audit.md`**
   - Comprehensive architecture audit
   - Competitive analysis (vs Spotify, SoundCloud, DistroKid)
   - Scalability assessment
   - Roadmap to trillion-dollar valuation
   - Critical gaps and recommendations

2. **`boptone-ai-architecture.md`**
   - Unified AI system design
   - AIOrchestrator architecture
   - Context management system
   - Event bus design
   - AI capability registry

3. **`workflow-research.md`**
   - n8n architecture analysis
   - React Flow implementation guide
   - 24 artist-specific workflow use cases
   - Pre-built template designs

---

## For Engineers: Getting Started

### 1. Clone and Setup
```bash
git clone https://github.com/Boptone/boptone-ai.git
cd boptone-ai
git checkout platform-v2  # ⭐ IMPORTANT: Use this branch
pnpm install
```

### 2. Environment Setup
Required environment variables are auto-injected by the Manus platform:
- Database connection (DATABASE_URL)
- JWT secrets
- OAuth configuration
- S3 storage credentials
- LLM API keys

### 3. Database Migration
```bash
pnpm db:push  # Push schema to database
```

### 4. Run Development Server
```bash
pnpm dev  # Starts on http://localhost:3000
```

### 5. Key Files to Understand
- `server/aiOrchestrator.ts` - Central AI brain
- `server/workflowEngine.ts` - Workflow execution engine
- `server/routers/` - All tRPC API endpoints
- `client/src/pages/` - Main UI pages
- `drizzle/schema.ts` - Complete database schema

---

## Deployment

The `platform-v2` branch is production-ready and can be deployed via:
1. Manus platform (built-in hosting with custom domains)
2. Vercel/Netlify (frontend) + Railway/Render (backend)
3. AWS/GCP (full control)

**Recommended:** Use Manus platform for fastest deployment with zero config.

---

## Questions?

Contact: [Your contact info]

**Last Updated:** February 12, 2026  
**Platform Version:** v2.0 (Unified AI System)
