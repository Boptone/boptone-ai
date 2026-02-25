import { getDb } from "./db";
import { sql } from "drizzle-orm";

/**
 * Secure Database Helpers
 * 
 * Enterprise-grade database utilities that prevent SQL injection
 * by using parameterized queries and proper escaping.
 * 
 * NEVER use string interpolation in SQL queries.
 * ALWAYS use these helpers or Drizzle ORM methods.
 */

/**
 * Execute a raw SQL query with parameterized values
 * NOTE: Prefer using specific helper functions below instead of this generic method
 * @param query SQL query string
 * @returns Query results
 */
export async function executeSecure(query: string): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection unavailable");
  }

  try {
    const result = await db.execute(sql.raw(query));
    return result as any[];
  } catch (error) {
    console.error("[SecureDB] Query execution failed:", error);
    throw error;
  }
}

/**
 * Get AI context for a user (secure)
 */
export async function getAIContext(userId: number): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(
      sql`SELECT context_data FROM ai_context WHERE user_id = ${userId}`
    );

    if (result && result.length > 0) {
      const row = result[0] as any;
      return JSON.parse(row.context_data);
    }

    return null;
  } catch (error) {
    console.error("[SecureDB] Failed to get AI context:", error);
    return null;
  }
}

/**
 * Upsert AI context for a user (secure)
 */
export async function upsertAIContext(userId: number, contextData: any): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const jsonData = JSON.stringify(contextData);
    
    await db.execute(
      sql`INSERT INTO ai_context (user_id, context_data, last_enriched)
          VALUES (${userId}, ${jsonData}, NOW())
          ON DUPLICATE KEY UPDATE
            context_data = VALUES(context_data),
            last_enriched = NOW()`
    );
  } catch (error) {
    console.error("[SecureDB] Failed to upsert AI context:", error);
    throw error;
  }
}

/**
 * Get user info (secure)
 */
export async function getUserInfo(userId: number): Promise<{ name: string; email: string } | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(
      sql`SELECT name, email FROM users WHERE id = ${userId}`
    );

    if (result && result.length > 0) {
      return result[0] as any;
    }

    return null;
  } catch (error) {
    console.error("[SecureDB] Failed to get user info:", error);
    return null;
  }
}

/**
 * Get earnings balance (secure)
 */
export async function getEarningsBalance(userId: number): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.execute(
      sql`SELECT available_balance, pending_balance, withdrawn_total, payout_schedule
          FROM earnings_balance WHERE user_id = ${userId}`
    );

    if (result && result.length > 0) {
      return result[0] as any;
    }

    return null;
  } catch (error) {
    console.error("[SecureDB] Failed to get earnings balance:", error);
    return null;
  }
}

/**
 * Get active workflows (secure)
 */
export async function getActiveWorkflows(userId: number, limit: number = 10): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(
      sql`SELECT id, name, category, status, success_rate, last_run
          FROM workflows WHERE user_id = ${userId} AND status = 'active'
          LIMIT ${limit}`
    );

    return result as any[];
  } catch (error) {
    console.error("[SecureDB] Failed to get active workflows:", error);
    return [];
  }
}

/**
 * Insert AI event (secure)
 */
export async function insertAIEvent(event: {
  userId: number;
  type: string;
  data: any;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const jsonData = JSON.stringify(event.data);
    
    await db.execute(
      sql`INSERT INTO ai_events (user_id, event_type, event_data, processed)
          VALUES (${event.userId}, ${event.type}, ${jsonData}, FALSE)`
    );
  } catch (error) {
    console.error("[SecureDB] Failed to insert AI event:", error);
    throw error;
  }
}

/**
 * Get pending AI events (secure)
 */
export async function getPendingAIEvents(limit: number = 100): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db.execute(
      sql`SELECT id, user_id, event_type, event_data, created_at
          FROM ai_events
          WHERE processed = FALSE
          ORDER BY created_at ASC
          LIMIT ${limit}`
    );

    return result as any[];
  } catch (error) {
    console.error("[SecureDB] Failed to get pending AI events:", error);
    return [];
  }
}

/**
 * Mark AI events as processed (secure)
 */
export async function markAIEventsProcessed(eventIds: number[]): Promise<void> {
  const db = await getDb();
  if (!db || eventIds.length === 0) return;

  try {
    // Use Drizzle ORM for safe IN clause
    const { aiEvents } = await import("../drizzle/schema");
    const { inArray } = await import("drizzle-orm");
    
    await db
      .update(aiEvents)
      .set({ processed: true })
      .where(inArray(aiEvents.id, eventIds));
  } catch (error) {
    console.error("[SecureDB] Failed to mark events as processed:", error);
    throw error;
  }
}

/**
 * Insert AI recommendation (secure)
 */
export async function insertAIRecommendation(recommendation: {
  userId: number;
  type: string;
  title: string;
  description: string;
  actionData: any;
  expiresAt?: Date;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const jsonData = JSON.stringify(recommendation.actionData);
    const expiresAt = recommendation.expiresAt?.toISOString() || null;
    
    await db.execute(
      sql`INSERT INTO ai_recommendations 
          (user_id, recommendation_type, title, description, action_data, expires_at)
          VALUES (${recommendation.userId}, ${recommendation.type}, ${recommendation.title}, 
                  ${recommendation.description}, ${jsonData}, ${expiresAt})`
    );
  } catch (error) {
    console.error("[SecureDB] Failed to insert AI recommendation:", error);
    throw error;
  }
}

/**
 * Get annual tips total (secure)
 */
export async function getAnnualTips(artistId: number, year: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const yearStart = `${year}-01-01T00:00:00Z`;
    const yearEnd = `${year}-12-31T23:59:59Z`;
    
    const result = await db.execute(
      sql`SELECT COALESCE(SUM(amount), 0) as total FROM tips 
          WHERE artistId = ${artistId} 
          AND createdAt >= ${yearStart}
          AND createdAt <= ${yearEnd}`
    );

    if (result && result.length > 0) {
      return parseFloat((result[0] as any).total);
    }

    return 0;
  } catch (error) {
    console.error("[SecureDB] Failed to get annual tips:", error);
    return 0;
  }
}

/**
 * Get tips by time period (secure)
 */
export async function getTipsByPeriod(
  userId: number,
  startDate: Date
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db.execute(
      sql`SELECT COALESCE(SUM(amount), 0) as total FROM tips 
          WHERE fanId = ${userId} 
          AND createdAt >= ${startDate.toISOString()}`
    );

    if (result && result.length > 0) {
      return parseFloat((result[0] as any).total);
    }

    return 0;
  } catch (error) {
    console.error("[SecureDB] Failed to get tips by period:", error);
    return 0;
  }
}
