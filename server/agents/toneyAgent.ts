/**
 * Toney Autonomous Agent
 *
 * Runs on a cron schedule (every 6 hours by default).
 * For each artist with a Toney profile, it:
 *   1. Pulls a metric snapshot (streaming, revenue, fans, earnings balance)
 *   2. Compares against the previous 7-day baseline
 *   3. Detects signal events (drops, spikes, milestones, release gaps)
 *   4. Calls invokeLLM to generate a personalised insight + recommended action
 *   5. Deduplicates against recent actions (24-hour cooldown per category)
 *   6. Persists the action to toney_agent_actions
 *   7. Optionally auto-creates a workflow when confidence is high
 *
 * Architecture:
 *   toneyAgent.ts          ← this file (pure logic, no Express/tRPC)
 *   toneyAgentRunner.ts    ← cron wrapper that calls runToneyAgentCycle()
 *   server/routers/toneyAgent.ts ← tRPC procedures for the UI panel
 */

import { and, desc, eq, gte, isNull, lt, sql } from "drizzle-orm";
import {
  artistProfiles,
  artistToneyProfiles,
  bapStreams,
  bapTracks,
  earningsBalance,
  orders,
  tips,
  toneyAgentActions,
  workflows,
} from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MetricSnapshot {
  artistProfileId: number;
  userId: number;
  stageName: string;
  // Streaming (BAP)
  bapStreams7d: number;
  bapStreamsPrev7d: number;
  // Revenue
  revenueAvailableCents: number;
  revenuePendingCents: number;
  // Orders (BopShop)
  orders7d: number;
  ordersPrev7d: number;
  // Tips
  tips7d: number;
  tipsPrev7d: number;
  // Super fans
  superFanCount: number;
  // Days since last BAP track upload (release gap)
  daysSinceLastRelease: number | null;
  // Toney profile context
  toneyProfile: {
    careerStage: string | null;
    primaryGenre: string | null;
    activeGoals: string | null;
    financialPatternsSummary: string | null;
    prefersBriefResponses: boolean;
  } | null;
  snapshotAt: Date;
}

export type InsightCategory =
  | "streaming_drop"
  | "streaming_spike"
  | "revenue_milestone"
  | "revenue_drop"
  | "fan_engagement_spike"
  | "release_gap"
  | "workflow_suggestion"
  | "goal_progress"
  | "earnings_available"
  | "superfan_detected"
  | "general";

export type InsightPriority = "low" | "medium" | "high" | "critical";

export interface DetectedSignal {
  category: InsightCategory;
  priority: InsightPriority;
  contextForLLM: string;
}

export interface GeneratedInsight {
  title: string;
  insight: string;
  category: InsightCategory;
  priority: InsightPriority;
  autoExecute: boolean;
  workflowDefinition?: object;
}

// ─── Metric snapshot ─────────────────────────────────────────────────────────

export async function buildMetricSnapshot(
  artistProfileId: number
): Promise<MetricSnapshot | null> {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86_400_000);
  const d14 = new Date(now.getTime() - 14 * 86_400_000);

  // Artist profile + Toney profile
  const [profile] = await db
    .select({
      id: artistProfiles.id,
      userId: artistProfiles.userId,
      stageName: artistProfiles.stageName,
    })
    .from(artistProfiles)
    .where(eq(artistProfiles.id, artistProfileId))
    .limit(1);

  if (!profile) return null;

  const [toneyProfile] = await db
    .select({
      careerStage: artistToneyProfiles.careerStage,
      primaryGenre: artistToneyProfiles.primaryGenre,
      activeGoals: artistToneyProfiles.activeGoals,
      financialPatternsSummary: artistToneyProfiles.financialPatternsSummary,
      prefersBriefResponses: artistToneyProfiles.prefersBriefResponses,
    })
    .from(artistToneyProfiles)
    .where(eq(artistToneyProfiles.artistProfileId, artistProfileId))
    .limit(1);

  // BAP streams — current 7d vs previous 7d (join through bapTracks for artistId)
  const [streamsNow] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(bapStreams)
    .innerJoin(bapTracks, eq(bapStreams.trackId, bapTracks.id))
    .where(
      and(
        eq(bapTracks.artistId, artistProfileId),
        gte(bapStreams.createdAt, d7)
      )
    );
  const [streamsPrev] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(bapStreams)
    .innerJoin(bapTracks, eq(bapStreams.trackId, bapTracks.id))
    .where(
      and(
        eq(bapTracks.artistId, artistProfileId),
        gte(bapStreams.createdAt, d14),
        lt(bapStreams.createdAt, d7)
      )
    );

  // Earnings balance
  const [balance] = await db
    .select({
      available: earningsBalance.availableBalance,
      pending: earningsBalance.pendingBalance,
    })
    .from(earningsBalance)
    .where(eq(earningsBalance.artistId, artistProfileId))
    .limit(1);

  // BopShop orders — current 7d vs previous 7d
  const [ordersNow] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(orders)
    .where(
      and(
        eq(orders.artistId, artistProfileId),
        gte(orders.createdAt, d7)
      )
    );
  const [ordersPrev] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(orders)
    .where(
      and(
        eq(orders.artistId, artistProfileId),
        gte(orders.createdAt, d14),
        lt(orders.createdAt, d7)
      )
    );

  // Tips — current 7d vs previous 7d
  const [tipsNow] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(tips)
    .where(
      and(
        eq(tips.toArtistId, artistProfileId),
        gte(tips.createdAt, d7)
      )
    );
  const [tipsPrev] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(tips)
    .where(
      and(
        eq(tips.toArtistId, artistProfileId),
        gte(tips.createdAt, d14),
        lt(tips.createdAt, d7)
      )
    );

  // Super fans — count unique tippers this week (proxy for superfan engagement)
  const [sfCount] = await db
    .select({ total: sql<number>`COUNT(DISTINCT ${tips.fromUserId})` })
    .from(tips)
    .where(
      and(
        eq(tips.toArtistId, artistProfileId),
        gte(tips.createdAt, d7)
      )
    );

  // Days since last BAP track release — use bapTracks upload date
  const [lastTrack] = await db
    .select({ lastAt: sql<Date>`MAX(${bapTracks.createdAt})` })
    .from(bapTracks)
    .where(eq(bapTracks.artistId, artistProfileId));

  const daysSinceLastRelease = lastTrack?.lastAt
    ? Math.floor((now.getTime() - new Date(lastTrack.lastAt).getTime()) / 86_400_000)
    : null;

  return {
    artistProfileId,
    userId: profile.userId,
    stageName: profile.stageName,
    bapStreams7d: Number(streamsNow?.total ?? 0),
    bapStreamsPrev7d: Number(streamsPrev?.total ?? 0),
    revenueAvailableCents: Number(balance?.available ?? 0),
    revenuePendingCents: Number(balance?.pending ?? 0),
    orders7d: Number(ordersNow?.total ?? 0),
    ordersPrev7d: Number(ordersPrev?.total ?? 0),
    tips7d: Number(tipsNow?.total ?? 0),
    tipsPrev7d: Number(tipsPrev?.total ?? 0),
    superFanCount: Number(sfCount?.total ?? 0),
    daysSinceLastRelease,
    toneyProfile: toneyProfile
      ? {
          careerStage: toneyProfile.careerStage ?? null,
          primaryGenre: toneyProfile.primaryGenre ?? null,
          activeGoals: toneyProfile.activeGoals ?? null,
          financialPatternsSummary: toneyProfile.financialPatternsSummary ?? null,
          prefersBriefResponses: toneyProfile.prefersBriefResponses ?? false,
        }
      : null,
    snapshotAt: now,
  };
}

// ─── Signal detection ─────────────────────────────────────────────────────────

export function detectSignals(snapshot: MetricSnapshot): DetectedSignal[] {
  const signals: DetectedSignal[] = [];

  // Streaming drop: >30% week-over-week decline with meaningful volume
  if (
    snapshot.bapStreamsPrev7d >= 10 &&
    snapshot.bapStreams7d < snapshot.bapStreamsPrev7d * 0.7
  ) {
    const pct = Math.round(
      ((snapshot.bapStreamsPrev7d - snapshot.bapStreams7d) /
        snapshot.bapStreamsPrev7d) *
        100
    );
    signals.push({
      category: "streaming_drop",
      priority: pct > 60 ? "high" : "medium",
      contextForLLM: `BAP streams dropped ${pct}% this week (${snapshot.bapStreams7d} vs ${snapshot.bapStreamsPrev7d} last week).`,
    });
  }

  // Streaming spike: >50% week-over-week increase
  if (
    snapshot.bapStreamsPrev7d >= 5 &&
    snapshot.bapStreams7d > snapshot.bapStreamsPrev7d * 1.5
  ) {
    const pct = Math.round(
      ((snapshot.bapStreams7d - snapshot.bapStreamsPrev7d) /
        snapshot.bapStreamsPrev7d) *
        100
    );
    signals.push({
      category: "streaming_spike",
      priority: pct > 100 ? "high" : "medium",
      contextForLLM: `BAP streams spiked ${pct}% this week (${snapshot.bapStreams7d} vs ${snapshot.bapStreamsPrev7d} last week). Something is working.`,
    });
  }

  // Earnings available: >$50 sitting idle
  if (snapshot.revenueAvailableCents >= 5000) {
    const dollars = (snapshot.revenueAvailableCents / 100).toFixed(2);
    signals.push({
      category: "earnings_available",
      priority: snapshot.revenueAvailableCents >= 50000 ? "high" : "medium",
      contextForLLM: `Artist has $${dollars} available to withdraw and hasn't initiated a payout recently.`,
    });
  }

  // Release gap: no activity in 21+ days
  if (snapshot.daysSinceLastRelease !== null && snapshot.daysSinceLastRelease >= 21) {
    signals.push({
      category: "release_gap",
      priority: snapshot.daysSinceLastRelease >= 60 ? "high" : "medium",
      contextForLLM: `No new BAP activity detected in ${snapshot.daysSinceLastRelease} days. Audience engagement may be declining.`,
    });
  }

  // Super fan detected: first super fan or milestone
  if (snapshot.superFanCount > 0 && snapshot.superFanCount <= 5) {
    signals.push({
      category: "superfan_detected",
      priority: "medium",
      contextForLLM: `Artist has ${snapshot.superFanCount} super fan${snapshot.superFanCount > 1 ? "s" : ""} — listeners who stream 3+ artists in the network. High-value audience segment.`,
    });
  }

  // Fan engagement spike: tips up >50%
  if (snapshot.tipsPrev7d >= 2 && snapshot.tips7d > snapshot.tipsPrev7d * 1.5) {
    const pct = Math.round(
      ((snapshot.tips7d - snapshot.tipsPrev7d) / snapshot.tipsPrev7d) * 100
    );
    signals.push({
      category: "fan_engagement_spike",
      priority: "medium",
      contextForLLM: `Tips received increased ${pct}% this week (${snapshot.tips7d} vs ${snapshot.tipsPrev7d}). Fans are more engaged than usual.`,
    });
  }

  // Revenue milestone: first BopShop order this week
  if (snapshot.orders7d > 0 && snapshot.ordersPrev7d === 0) {
    signals.push({
      category: "revenue_milestone",
      priority: "medium",
      contextForLLM: `Artist received their first BopShop order(s) this week (${snapshot.orders7d} order${snapshot.orders7d > 1 ? "s" : ""}). First-sale momentum.`,
    });
  }

  return signals;
}

// ─── LLM insight generation ───────────────────────────────────────────────────

export async function generateInsight(
  snapshot: MetricSnapshot,
  signal: DetectedSignal
): Promise<GeneratedInsight | null> {
  const brief = snapshot.toneyProfile?.prefersBriefResponses;
  const genre = snapshot.toneyProfile?.primaryGenre ?? "music";
  const stage = snapshot.toneyProfile?.careerStage ?? "emerging";
  const goals = snapshot.toneyProfile?.activeGoals ?? "grow audience and revenue";

  const systemPrompt = `You are Toney, the autonomous AI advisor inside Boptone — a platform for independent artists.
You monitor each artist's metrics and proactively surface actionable insights.
Artist context: ${stage} ${genre} artist. Goals: ${goals}.
${brief ? "Keep your response concise — this artist prefers brief messages." : "Provide a thorough, data-grounded insight."}
Respond in JSON with this exact schema:
{
  "title": "short headline (max 60 chars)",
  "insight": "2-4 sentence insight with specific numbers and a concrete next action",
  "autoExecute": false,
  "workflowDefinition": null
}
Set autoExecute to true only if you are highly confident a simple workflow (e.g., a fan thank-you email sequence) should be created automatically.
Never use spiritual, warrior, or overly salesy language. Be direct, data-driven, and human.`;

  const userPrompt = `Signal detected for ${snapshot.stageName}:
${signal.contextForLLM}

Generate an insight and recommended action for this artist.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "toney_insight",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              insight: { type: "string" },
              autoExecute: { type: "boolean" },
              workflowDefinition: {},
            },
            required: ["title", "insight", "autoExecute", "workflowDefinition"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    return {
      title: String(parsed.title ?? "").slice(0, 255),
      insight: String(parsed.insight ?? ""),
      category: signal.category,
      priority: signal.priority,
      autoExecute: Boolean(parsed.autoExecute),
      workflowDefinition: parsed.workflowDefinition ?? undefined,
    };
  } catch (err) {
    console.error("[ToneyAgent] LLM error:", err instanceof Error ? err.message : err);
    return null;
  }
}

// ─── Deduplication ────────────────────────────────────────────────────────────

/** Returns true if a similar action was already created within the cooldown window */
export async function isDuplicate(
  artistProfileId: number,
  category: InsightCategory,
  cooldownHours = 24
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const since = new Date(Date.now() - cooldownHours * 3_600_000);

  const [existing] = await db
    .select({ id: toneyAgentActions.id })
    .from(toneyAgentActions)
    .where(
      and(
        eq(toneyAgentActions.artistProfileId, artistProfileId),
        eq(toneyAgentActions.category, category),
        gte(toneyAgentActions.createdAt, since)
      )
    )
    .limit(1);

  return !!existing;
}

// ─── Workflow auto-creation ───────────────────────────────────────────────────

async function maybeCreateWorkflow(
  artistProfileId: number,
  insight: GeneratedInsight,
  snapshot: MetricSnapshot
): Promise<number | null> {
  if (!insight.autoExecute || !insight.workflowDefinition) return null;

  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(workflows).values({
      artistId: artistProfileId,
      name: `Toney: ${insight.title}`,
      description: insight.insight,
      status: "active",
      definition: insight.workflowDefinition as object,
      category: "fan_engagement",
      tags: ["toney", "auto-generated"],
      isTemplate: false,
      version: 1,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      metadata: { generatedBy: "toneyAgent", artistProfileId },
    });

    const insertId = (result as any)[0]?.insertId;
    return typeof insertId === "number" ? insertId : null;
  } catch (err) {
    console.error("[ToneyAgent] Workflow creation error:", err instanceof Error ? err.message : err);
    return null;
  }
}

// ─── Persist action ───────────────────────────────────────────────────────────

export async function persistAction(
  snapshot: MetricSnapshot,
  insight: GeneratedInsight,
  workflowId: number | null
): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(toneyAgentActions).values({
      artistProfileId: snapshot.artistProfileId,
      userId: snapshot.userId,
      category: insight.category,
      title: insight.title,
      insight: insight.insight,
      actionPayload: insight.workflowDefinition ?? null,
      autoExecuted: workflowId !== null,
      workflowId: workflowId ?? undefined,
      dismissed: false,
      priority: insight.priority,
      snapshotAt: snapshot.snapshotAt,
    });

    const insertId = (result as any)[0]?.insertId;
    return typeof insertId === "number" ? insertId : null;
  } catch (err) {
    console.error("[ToneyAgent] Persist error:", err instanceof Error ? err.message : err);
    return null;
  }
}

// ─── Per-artist agent run ─────────────────────────────────────────────────────

export async function runAgentForArtist(artistProfileId: number): Promise<{
  actionsCreated: number;
  skipped: number;
  errors: number;
}> {
  const result = { actionsCreated: 0, skipped: 0, errors: 0 };

  try {
    const snapshot = await buildMetricSnapshot(artistProfileId);
    if (!snapshot) {
      result.errors++;
      return result;
    }

    const signals = detectSignals(snapshot);
    if (signals.length === 0) {
      return result;
    }

    for (const signal of signals) {
      // Deduplication check
      const dup = await isDuplicate(artistProfileId, signal.category);
      if (dup) {
        result.skipped++;
        continue;
      }

      const insight = await generateInsight(snapshot, signal);
      if (!insight) {
        result.errors++;
        continue;
      }

      const workflowId = await maybeCreateWorkflow(artistProfileId, insight, snapshot);
      const actionId = await persistAction(snapshot, insight, workflowId);

      if (actionId) {
        result.actionsCreated++;
        console.log(
          `[ToneyAgent] Action #${actionId} created for artist #${artistProfileId}: [${insight.category}] ${insight.title}`
        );
      } else {
        result.errors++;
      }
    }
  } catch (err) {
    console.error(
      `[ToneyAgent] Error processing artist #${artistProfileId}:`,
      err instanceof Error ? err.message : err
    );
    result.errors++;
  }

  return result;
}

// ─── Full cycle (all artists with Toney profiles) ─────────────────────────────

export async function runToneyAgentCycle(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[ToneyAgent] Database not available — skipping cycle");
    return;
  }

  console.log("[ToneyAgent] Starting autonomous agent cycle...");
  const cycleStart = Date.now();

  // Get all artists with a Toney profile
  const profiles = await db
    .select({ artistProfileId: artistToneyProfiles.artistProfileId })
    .from(artistToneyProfiles);

  let totalActions = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const { artistProfileId } of profiles) {
    const res = await runAgentForArtist(artistProfileId);
    totalActions += res.actionsCreated;
    totalSkipped += res.skipped;
    totalErrors += res.errors;
  }

  const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);
  console.log(
    `[ToneyAgent] Cycle complete in ${elapsed}s — ${profiles.length} artists, ${totalActions} actions created, ${totalSkipped} skipped (dedup), ${totalErrors} errors`
  );
}
