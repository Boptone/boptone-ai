/**
 * Workflow Schedule Cron Runner
 *
 * Activates the PRO-tier "schedule" trigger type for workflow automations.
 * On startup it loads all active schedule triggers from the DB, registers a
 * node-cron job for each one, and fires executeWorkflow() when the cron fires.
 *
 * Refresh strategy: every 5 minutes the runner re-queries the DB and
 * reconciles live cron jobs against the current DB state — adding new ones,
 * removing deactivated ones, and updating changed cron expressions without
 * requiring a server restart.
 *
 * Architecture:
 *   workflowTriggers (type="schedule", isActive=true)
 *     └─ config.schedule  →  cron expression (e.g. "0 9 * * 1" = Mon 9am)
 *     └─ workflowId       →  passed to executeWorkflow()
 *     └─ triggerId        →  used to call recordTriggerFired() after fire
 */

import cron, { ScheduledTask } from "node-cron";
import { getActiveScheduleTriggers, recordTriggerFired } from "../workflowDb";
import { executeWorkflow } from "../workflowEngine";

// ─── Internal registry ────────────────────────────────────────────────────────

interface RegisteredJob {
  triggerId: number;
  workflowId: number;
  cronExpression: string;
  task: ScheduledTask;
}

const registry = new Map<number, RegisteredJob>(); // keyed by triggerId
let refreshIntervalId: NodeJS.Timeout | null = null;
let isRunning = false;

// ─── Core helpers ─────────────────────────────────────────────────────────────

function isValidCron(expression: string): boolean {
  return cron.validate(expression);
}

function stopAndRemoveJob(triggerId: number) {
  const job = registry.get(triggerId);
  if (job) {
    job.task.stop();
    registry.delete(triggerId);
    console.log(`[WorkflowCron] Removed job for trigger #${triggerId} (workflow #${job.workflowId})`);
  }
}

function registerJob(triggerId: number, workflowId: number, cronExpression: string) {
  // Validate the cron expression before registering
  if (!isValidCron(cronExpression)) {
    console.warn(
      `[WorkflowCron] Invalid cron expression "${cronExpression}" for trigger #${triggerId} — skipping`
    );
    return;
  }

  const task = cron.schedule(cronExpression, async () => {
    console.log(
      `[WorkflowCron] Firing trigger #${triggerId} → workflow #${workflowId} (${cronExpression})`
    );
    try {
      const result = await executeWorkflow(workflowId, "schedule", {
        triggeredAt: new Date().toISOString(),
        triggerId,
        cronExpression,
      });

      if (result.success) {
        await recordTriggerFired(triggerId);
        console.log(
          `[WorkflowCron] ✓ Workflow #${workflowId} execution #${result.executionId} completed`
        );
      } else {
        console.error(
          `[WorkflowCron] ✗ Workflow #${workflowId} execution #${result.executionId} failed:`,
          result.errors
        );
      }
    } catch (err) {
      console.error(
        `[WorkflowCron] ✗ Unhandled error executing workflow #${workflowId}:`,
        err instanceof Error ? err.message : err
      );
    }
  });

  registry.set(triggerId, { triggerId, workflowId, cronExpression, task });
  console.log(
    `[WorkflowCron] Registered trigger #${triggerId} → workflow #${workflowId} @ "${cronExpression}"`
  );
}

// ─── Reconciliation ───────────────────────────────────────────────────────────

async function reconcile() {
  let dbTriggers: Awaited<ReturnType<typeof getActiveScheduleTriggers>>;

  try {
    dbTriggers = await getActiveScheduleTriggers();
  } catch (err) {
    console.warn("[WorkflowCron] Could not fetch schedule triggers:", err instanceof Error ? err.message : err);
    return;
  }

  const dbIds = new Set(dbTriggers.map((t) => t.triggerId));

  // Remove jobs that are no longer active in the DB
  for (const [triggerId] of registry) {
    if (!dbIds.has(triggerId)) {
      stopAndRemoveJob(triggerId);
    }
  }

  // Add or update jobs from the DB
  for (const row of dbTriggers) {
    const config = row.config as Record<string, any> | null;
    const cronExpression: string | undefined = config?.schedule;

    if (!cronExpression) {
      // Trigger has no cron expression — skip silently
      continue;
    }

    const existing = registry.get(row.triggerId);

    if (existing) {
      // Update if the cron expression changed
      if (existing.cronExpression !== cronExpression) {
        console.log(
          `[WorkflowCron] Updating trigger #${row.triggerId}: "${existing.cronExpression}" → "${cronExpression}"`
        );
        stopAndRemoveJob(row.triggerId);
        registerJob(row.triggerId, row.workflowId, cronExpression);
      }
      // Otherwise leave the existing job running
    } else {
      registerJob(row.triggerId, row.workflowId, cronExpression);
    }
  }

  if (dbTriggers.length > 0) {
    console.log(
      `[WorkflowCron] Reconciled — ${registry.size} active schedule job(s) running`
    );
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Start the workflow schedule cron runner.
 * Safe to call multiple times — idempotent.
 */
export async function startWorkflowCronRunner() {
  if (isRunning) {
    console.log("[WorkflowCron] Already running");
    return;
  }

  isRunning = true;
  console.log("[WorkflowCron] Starting workflow schedule cron runner...");

  // Initial load
  await reconcile();

  // Refresh every 5 minutes to pick up new/changed/deactivated triggers
  refreshIntervalId = setInterval(
    () => {
      reconcile().catch((err) => {
        console.error("[WorkflowCron] Reconcile error:", err instanceof Error ? err.message : err);
      });
    },
    5 * 60 * 1000 // 5 minutes
  );

  console.log("[WorkflowCron] Workflow schedule cron runner started (refresh every 5 min)");
}

/**
 * Stop the workflow schedule cron runner and all registered jobs.
 * Used in tests and graceful shutdown.
 */
export function stopWorkflowCronRunner() {
  if (!isRunning) return;

  for (const [triggerId] of registry) {
    stopAndRemoveJob(triggerId);
  }

  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }

  isRunning = false;
  console.log("[WorkflowCron] Workflow schedule cron runner stopped");
}

/**
 * Return the number of currently registered cron jobs.
 * Used in tests and health checks.
 */
export function getRegisteredJobCount(): number {
  return registry.size;
}

/**
 * Return a snapshot of all registered jobs (for health/debug endpoints).
 */
export function getRegisteredJobs(): Array<{ triggerId: number; workflowId: number; cronExpression: string }> {
  return Array.from(registry.values()).map(({ triggerId, workflowId, cronExpression }) => ({
    triggerId,
    workflowId,
    cronExpression,
  }));
}
