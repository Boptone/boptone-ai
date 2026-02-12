# Boptone Unified AI Architecture - "The Nervous System"

## Vision
Make Boptone feel like a living, breathing organism that artists can trust with their entire career. All AI features connected through unified context, seamless handoffs, proactive intelligence.

## Core Principles
1. **Single Source of Truth** - One unified context for all AI features
2. **Seamless Handoffs** - Artists never feel like they're talking to different tools
3. **Proactive Intelligence** - Platform suggests actions before artists ask
4. **Context Persistence** - AI remembers everything across sessions
5. **Action Capability** - AI can execute tasks, not just answer questions

## Architecture Layers

### Layer 1: Unified Artist Context (The Brain)
Central knowledge graph that stores everything about the artist:

```typescript
interface ArtistContext {
  // Identity
  userId: number;
  artistName: string;
  genre: string[];
  careerStage: "emerging" | "growing" | "established" | "superstar";
  
  // Goals & Intent
  currentGoals: string[];  // ["grow fanbase", "increase revenue", "tour planning"]
  painPoints: string[];    // ["low engagement", "cash flow issues"]
  
  // Financial Data
  revenue: {
    total: number;
    available: number;
    pending: number;
    withdrawn: number;
    monthlyAverage: number;
  };
  payoutSchedule: "manual" | "daily" | "weekly" | "monthly";
  
  // Workflows
  activeWorkflows: {
    id: number;
    name: string;
    category: string;
    status: "active" | "paused";
    successRate: number;
    lastRun: Date;
  }[];
  
  // Engagement Metrics
  fans: {
    total: number;
    growth: number;  // percentage
    topSources: string[];
  };
  streams: {
    total: number;
    monthlyAverage: number;
    trending: boolean;
  };
  
  // Platform Activity
  lastActive: Date;
  currentPage: string;
  recentActions: string[];  // ["viewed workflows", "checked earnings", "uploaded track"]
  
  // AI Interaction History
  conversationHistory: Message[];
  commonQuestions: string[];
  acceptedSuggestions: string[];
  rejectedSuggestions: string[];
}
```

### Layer 2: AI Orchestrator (The Conductor)
Central service that coordinates all AI features:

```typescript
class AIOrchestrator {
  // Core Methods
  async getArtistContext(userId: number): Promise<ArtistContext>
  async updateContext(userId: number, updates: Partial<ArtistContext>): Promise<void>
  async enrichContext(userId: number): Promise<void>  // Auto-gather latest data
  
  // AI Capability Registry
  async getAvailableCapabilities(): Promise<AICapability[]>
  async executeCapability(capability: string, params: any): Promise<any>
  
  // Event Bus
  async publishEvent(event: AIEvent): Promise<void>
  async subscribeToEvents(eventType: string, handler: Function): Promise<void>
  
  // Proactive Intelligence
  async generateRecommendations(userId: number): Promise<Recommendation[]>
  async shouldTriggerProactiveAction(userId: number): Promise<ProactiveAction | null>
}
```

### Layer 3: AI Capabilities (The Hands)
Individual AI features that register with the orchestrator:

```typescript
interface AICapability {
  name: string;  // "workflow_generation", "earnings_analysis", "career_advice"
  description: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  execute: (context: ArtistContext, params: any) => Promise<any>;
}

// Example Capabilities:
const capabilities = [
  {
    name: "workflow_generation",
    description: "Generate workflow from natural language",
    execute: async (context, params) => {
      // Call workflow AI generator
      return await generateWorkflowFromText(params.description, context);
    }
  },
  {
    name: "earnings_analysis",
    description: "Analyze revenue trends and suggest optimizations",
    execute: async (context, params) => {
      // Analyze earnings data
      return await analyzeEarnings(context.revenue);
    }
  },
  {
    name: "workflow_status_check",
    description: "Check status of active workflows",
    execute: async (context, params) => {
      // Return workflow status
      return context.activeWorkflows;
    }
  }
];
```

### Layer 4: AI Event Bus (The Nervous System)
Real-time communication between AI features:

```typescript
interface AIEvent {
  type: string;  // "workflow_created", "earnings_threshold_reached", "fan_milestone"
  userId: number;
  data: any;
  timestamp: Date;
}

// Example Events:
// - workflow_created: Toney can congratulate artist
// - earnings_threshold_reached: Toney can suggest payout
// - fan_milestone: Toney can suggest celebration workflow
// - workflow_failed: Toney can offer troubleshooting
```

## Integration Points

### Toney (Conversational Interface)
**Current State:** Placeholder responses, no AI integration
**New Capabilities:**
- Connected to LLM via `invokeLLM`
- Access to full `ArtistContext`
- Can execute AI capabilities (generate workflows, check balances)
- Receives events from event bus (proactive notifications)
- Suggests workflows based on artist goals

**Example Interaction:**
```
Artist: "I want to thank fans who tip me"
Toney: [Checks context → sees artist has tip jar → suggests workflow]
"I can set up an automatic thank-you workflow for you! 
Would you like me to generate one that sends an email 
when someone tips over $10?"
[Artist clicks "Yes"]
Toney: [Triggers workflow_generation capability]
"Done! I've created a workflow that will automatically 
send a personalized thank-you email to fans who tip $10+. 
You can customize it in your Workflows page."
```

### Workflow Assistant (Automation Engine)
**Current State:** Standalone AI workflow generator
**New Capabilities:**
- Publishes events when workflows are created/executed
- Receives context from orchestrator (knows artist goals)
- Can be triggered by Toney or other AI features
- Suggests workflows proactively based on artist behavior

### Analytics AI (Insights Engine)
**Future Feature:**
- Analyzes revenue, streams, engagement data
- Publishes insights to event bus
- Toney can surface insights in conversation
- Suggests optimizations based on patterns

### Career Advisor AI (Strategic Brain)
**Future Feature:**
- Long-term career planning
- Release strategy recommendations
- Growth trajectory analysis
- Toney can reference career advisor insights

## Database Schema

### New Table: `ai_context`
```sql
CREATE TABLE ai_context (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  context_data JSON NOT NULL,  -- Full ArtistContext object
  last_enriched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### New Table: `ai_events`
```sql
CREATE TABLE ai_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSON NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_type (user_id, event_type),
  INDEX idx_processed (processed, created_at)
);
```

### New Table: `ai_recommendations`
```sql
CREATE TABLE ai_recommendations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  recommendation_type VARCHAR(100) NOT NULL,  -- "workflow", "payout", "content"
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  action_data JSON,  -- Data needed to execute recommendation
  status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_status (user_id, status)
);
```

## Implementation Phases

### Phase 1: Foundation (Current Sprint)
1. Create database tables (ai_context, ai_events, ai_recommendations)
2. Build AIOrchestrator service
3. Implement context manager
4. Connect Toney to LLM

### Phase 2: Toney Integration
1. Connect Toney to AIOrchestrator
2. Add capability execution to Toney
3. Implement Toney → Workflow Assistant handoff
4. Add workflow status checking

### Phase 3: Proactive Intelligence
1. Build recommendation engine
2. Implement event-driven notifications
3. Add proactive workflow suggestions
4. Create AI insights dashboard

### Phase 4: Advanced Features
1. Add Analytics AI capability
2. Implement Career Advisor AI
3. Build predictive models
4. Add automated optimization

## Success Metrics

**Artist Experience:**
- Artists describe platform as "intelligent partner"
- >70% acceptance rate on AI suggestions
- Zero friction between AI features
- Artists feel platform "knows them"

**Technical Metrics:**
- Context enrichment latency <500ms
- Event processing latency <100ms
- AI response time <3s
- Context accuracy >95%

**Business Impact:**
- Increased feature adoption (workflows, payouts)
- Higher retention (artists feel supported)
- Competitive moat (no other platform has this)
- Viral growth (artists tell others about AI)

## Competitive Advantage

**What makes this unique:**
1. **Unified Context** - Other platforms have isolated AI features
2. **Proactive Intelligence** - Other platforms are reactive only
3. **Action Capability** - Other platforms only answer questions
4. **Artist-Centric** - Built specifically for music careers
5. **Trust-First** - Transparent, explainable AI decisions

This is Music Business 2.0 - the platform as intelligent partner, not passive tool.
