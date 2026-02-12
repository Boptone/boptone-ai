import { getDb } from "./db";
import { eq, and, desc } from "drizzle-orm";

/**
 * AI Orchestrator - Central Brain of Boptone's Unified AI System
 * 
 * Coordinates all AI features (Toney, Workflow Assistant, Analytics, Career Advisor)
 * through unified artist context, event bus, and capability registry.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ArtistContext {
  // Identity
  userId: number;
  artistName: string;
  genre: string[];
  careerStage: "emerging" | "growing" | "established" | "superstar";
  
  // Goals & Intent
  currentGoals: string[];
  painPoints: string[];
  
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
    lastRun: Date | null;
  }[];
  
  // Engagement Metrics
  fans: {
    total: number;
    growth: number;
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
  recentActions: string[];
  
  // AI Interaction History
  conversationHistory: Array<{role: string; content: string}>;
  commonQuestions: string[];
  acceptedSuggestions: string[];
  rejectedSuggestions: string[];
}

export interface AIEvent {
  type: string;
  userId: number;
  data: any;
  timestamp: Date;
}

export interface AICapability {
  name: string;
  description: string;
  execute: (context: ArtistContext, params: any) => Promise<any>;
}

export interface Recommendation {
  type: string;
  title: string;
  description: string;
  actionData: any;
  expiresAt?: Date;
}

// ============================================================================
// AI ORCHESTRATOR CLASS
// ============================================================================

class AIOrchestrator {
  private capabilities: Map<string, AICapability> = new Map();
  
  /**
   * Get complete artist context from database
   */
  async getArtistContext(userId: number): Promise<ArtistContext | null> {
    const db = await getDb();
    if (!db) return null;
    
    try {
      // Check if context exists
      const result = await db.execute(`
        SELECT context_data FROM ai_context WHERE user_id = ${userId}
      `);
      
      if (result && result.length > 0) {
        const row = result[0] as any;
        return JSON.parse(row.context_data);
      }
      
      // If no context exists, create default context
      const defaultContext = await this.createDefaultContext(userId);
      await this.updateContext(userId, defaultContext);
      return defaultContext;
    } catch (error) {
      console.error('[AIOrchestrator] Failed to get artist context:', error);
      return null;
    }
  }
  
  /**
   * Update artist context in database
   */
  async updateContext(userId: number, updates: Partial<ArtistContext>): Promise<void> {
    const db = await getDb();
    if (!db) return;
    
    try {
      // Get existing context
      const existing = await this.getArtistContext(userId);
      const merged = existing ? { ...existing, ...updates } : updates;
      
      // Upsert context
      await db.execute(`
        INSERT INTO ai_context (user_id, context_data, last_enriched)
        VALUES (${userId}, '${JSON.stringify(merged).replace(/'/g, "''")}', NOW())
        ON DUPLICATE KEY UPDATE
          context_data = VALUES(context_data),
          last_enriched = NOW()
      `);
    } catch (error) {
      console.error('[AIOrchestrator] Failed to update context:', error);
    }
  }
  
  /**
   * Enrich context by gathering latest data from all platform features
   */
  async enrichContext(userId: number): Promise<void> {
    const db = await getDb();
    if (!db) return;
    
    try {
      // Get user info
      const userResult = await db.execute(`
        SELECT name, email FROM users WHERE id = ${userId}
      `);
      
      // Get earnings balance
      const balanceResult = await db.execute(`
        SELECT available_balance, pending_balance, withdrawn_total, payout_schedule
        FROM earnings_balance WHERE user_id = ${userId}
      `);
      
      // Get active workflows
      const workflowsResult = await db.execute(`
        SELECT id, name, category, status, success_rate, last_run
        FROM workflows WHERE user_id = ${userId} AND status = 'active'
        LIMIT 10
      `);
      
      // Build enriched context
      const enrichedData: Partial<ArtistContext> = {
        userId,
        artistName: userResult && userResult.length > 0 ? (userResult[0] as any).name : 'Artist',
        lastActive: new Date(),
      };
      
      if (balanceResult && balanceResult.length > 0) {
        const balance = balanceResult[0] as any;
        enrichedData.revenue = {
          total: parseFloat(balance.available_balance) + parseFloat(balance.withdrawn_total),
          available: parseFloat(balance.available_balance),
          pending: parseFloat(balance.pending_balance),
          withdrawn: parseFloat(balance.withdrawn_total),
          monthlyAverage: 0, // TODO: Calculate from history
        };
        enrichedData.payoutSchedule = balance.payout_schedule;
      }
      
      if (workflowsResult && workflowsResult.length > 0) {
        enrichedData.activeWorkflows = (workflowsResult as any[]).map((w: any) => ({
          id: w.id,
          name: w.name,
          category: w.category,
          status: w.status,
          successRate: w.success_rate || 0,
          lastRun: w.last_run,
        }));
      }
      
      await this.updateContext(userId, enrichedData);
    } catch (error) {
      console.error('[AIOrchestrator] Failed to enrich context:', error);
    }
  }
  
  /**
   * Create default context for new artist
   */
  private async createDefaultContext(userId: number): Promise<ArtistContext> {
    return {
      userId,
      artistName: 'Artist',
      genre: [],
      careerStage: 'emerging',
      currentGoals: [],
      painPoints: [],
      revenue: {
        total: 0,
        available: 0,
        pending: 0,
        withdrawn: 0,
        monthlyAverage: 0,
      },
      payoutSchedule: 'manual',
      activeWorkflows: [],
      fans: {
        total: 0,
        growth: 0,
        topSources: [],
      },
      streams: {
        total: 0,
        monthlyAverage: 0,
        trending: false,
      },
      lastActive: new Date(),
      currentPage: '/',
      recentActions: [],
      conversationHistory: [],
      commonQuestions: [],
      acceptedSuggestions: [],
      rejectedSuggestions: [],
    };
  }
  
  /**
   * Register AI capability
   */
  registerCapability(capability: AICapability): void {
    this.capabilities.set(capability.name, capability);
  }
  
  /**
   * Execute AI capability with context
   */
  async executeCapability(
    capabilityName: string,
    userId: number,
    params: any
  ): Promise<any> {
    const capability = this.capabilities.get(capabilityName);
    if (!capability) {
      throw new Error(`Capability "${capabilityName}" not found`);
    }
    
    const context = await this.getArtistContext(userId);
    if (!context) {
      throw new Error('Failed to get artist context');
    }
    
    return await capability.execute(context, params);
  }
  
  /**
   * Publish event to event bus
   */
  async publishEvent(event: AIEvent): Promise<void> {
    const db = await getDb();
    if (!db) return;
    
    try {
      await db.execute(`
        INSERT INTO ai_events (user_id, event_type, event_data, processed)
        VALUES (${event.userId}, '${event.type}', '${JSON.stringify(event.data).replace(/'/g, "''")}', FALSE)
      `);
    } catch (error) {
      console.error('[AIOrchestrator] Failed to publish event:', error);
    }
  }
  
  /**
   * Get unprocessed events for user
   */
  async getUnprocessedEvents(userId: number): Promise<AIEvent[]> {
    const db = await getDb();
    if (!db) return [];
    
    try {
      const result = await db.execute(`
        SELECT id, user_id, event_type, event_data, created_at
        FROM ai_events
        WHERE user_id = ${userId} AND processed = FALSE
        ORDER BY created_at ASC
        LIMIT 50
      `);
      
      return (result as any[]).map((row: any) => ({
        type: row.event_type,
        userId: row.user_id,
        data: JSON.parse(row.event_data),
        timestamp: new Date(row.created_at),
      }));
    } catch (error) {
      console.error('[AIOrchestrator] Failed to get events:', error);
      return [];
    }
  }
  
  /**
   * Mark event as processed
   */
  async markEventProcessed(userId: number, eventType: string): Promise<void> {
    const db = await getDb();
    if (!db) return;
    
    try {
      await db.execute(`
        UPDATE ai_events
        SET processed = TRUE
        WHERE user_id = ${userId} AND event_type = '${eventType}' AND processed = FALSE
      `);
    } catch (error) {
      console.error('[AIOrchestrator] Failed to mark event processed:', error);
    }
  }
  
  /**
   * Generate proactive recommendations for artist
   */
  async generateRecommendations(userId: number): Promise<Recommendation[]> {
    const context = await this.getArtistContext(userId);
    if (!context) return [];
    
    const recommendations: Recommendation[] = [];
    
    // Recommendation: Payout ready
    if (context.revenue.available >= 20) {
      recommendations.push({
        type: 'payout',
        title: 'Funds Ready to Withdraw',
        description: `You have $${context.revenue.available.toFixed(2)} available. Withdraw now or set up automatic payouts.`,
        actionData: { action: 'navigate', url: '/settings/payouts' },
      });
    }
    
    // Recommendation: No active workflows
    if (context.activeWorkflows.length === 0) {
      recommendations.push({
        type: 'workflow',
        title: 'Automate Your Career',
        description: 'Set up workflows to automatically thank fans, celebrate milestones, and grow your audience.',
        actionData: { action: 'navigate', url: '/workflows' },
      });
    }
    
    // Recommendation: Low workflow success rate
    const lowSuccessWorkflows = context.activeWorkflows.filter(w => w.successRate < 0.5);
    if (lowSuccessWorkflows.length > 0) {
      recommendations.push({
        type: 'workflow_optimization',
        title: 'Improve Workflow Performance',
        description: `${lowSuccessWorkflows.length} workflow(s) have low success rates. Let's optimize them.`,
        actionData: { action: 'navigate', url: '/workflows' },
      });
    }
    
    return recommendations;
  }
  
  /**
   * Save recommendation to database
   */
  async saveRecommendation(userId: number, recommendation: Recommendation): Promise<void> {
    const db = await getDb();
    if (!db) return;
    
    try {
      const expiresValue = recommendation.expiresAt 
        ? `'${recommendation.expiresAt.toISOString()}'` 
        : 'NULL';
      await db.execute(`
        INSERT INTO ai_recommendations 
        (user_id, recommendation_type, title, description, action_data, expires_at)
        VALUES (${userId}, '${recommendation.type}', '${recommendation.title.replace(/'/g, "''")}', '${recommendation.description.replace(/'/g, "''")}', '${JSON.stringify(recommendation.actionData).replace(/'/g, "''")}', ${expiresValue})
      `);
    } catch (error) {
      console.error('[AIOrchestrator] Failed to save recommendation:', error);
    }
  }
  
  /**
   * Get pending recommendations for user
   */
  async getPendingRecommendations(userId: number): Promise<Recommendation[]> {
    const db = await getDb();
    if (!db) return [];
    
    try {
      // Get artist profile ID for this user
      const profileResult = await db.execute(`
        SELECT id FROM artist_profiles WHERE userId = ${userId} LIMIT 1
      `);
      
      if (!profileResult || (profileResult as any[]).length === 0) {
        return [];
      }
      
      const artistProfileId = (profileResult as any[])[0].id;
      
      const result = await db.execute(`
        SELECT type, title, description, reasoning, confidenceScore, dataSources, expiresAt
        FROM ai_recommendations
        WHERE artistProfileId = ${artistProfileId} AND status = 'pending'
          AND (expiresAt IS NULL OR expiresAt > NOW())
        ORDER BY priority DESC, createdAt DESC
        LIMIT 10
      `);
      
      return (result as any[]).map((row: any) => ({
        type: row.type,
        title: row.title,
        description: row.description,
        actionData: {
          reasoning: row.reasoning,
          confidence: row.confidenceScore,
          sources: JSON.parse(row.dataSources || '[]')
        },
        expiresAt: row.expiresAt ? new Date(row.expiresAt) : undefined,
      }));
    } catch (error) {
      console.error('[AIOrchestrator] Failed to get recommendations:', error);
      return [];
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const aiOrchestrator = new AIOrchestrator();

// ============================================================================
// REGISTER BUILT-IN CAPABILITIES
// ============================================================================

// Workflow generation capability
aiOrchestrator.registerCapability({
  name: 'workflow_generation',
  description: 'Generate workflow from natural language description',
  execute: async (context, params) => {
    // This will be called by Toney to generate workflows
    // Implementation will import from aiWorkflowGenerator
    return { success: true, workflowId: null };
  },
});

// Earnings analysis capability
aiOrchestrator.registerCapability({
  name: 'earnings_analysis',
  description: 'Analyze revenue trends and suggest optimizations',
  execute: async (context, params) => {
    const { revenue } = context;
    return {
      analysis: `You've earned $${revenue.total.toFixed(2)} total, with $${revenue.available.toFixed(2)} available now.`,
      suggestions: revenue.available >= 20 
        ? ['Consider withdrawing your available balance']
        : ['Keep building! You\'ll reach the $20 minimum soon.'],
    };
  },
});

// Workflow status capability
aiOrchestrator.registerCapability({
  name: 'workflow_status',
  description: 'Check status of active workflows',
  execute: async (context, params) => {
    return {
      active: context.activeWorkflows.length,
      workflows: context.activeWorkflows,
    };
  },
});
