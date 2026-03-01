/**
 * Workflow Schedule Cron Runner Tests
 *
 * Tests for the node-cron based schedule trigger runner that activates
 * the PRO tier workflow automation value proposition.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mock node-cron ───────────────────────────────────────────────────────────
const mockTasks = new Map<string, { stop: ReturnType<typeof vi.fn>; expression: string }>();

vi.mock("node-cron", () => ({
  default: {
    validate: (expr: string) => {
      // Accept standard 5-field cron expressions for testing
      const parts = expr.trim().split(/\s+/);
      return parts.length === 5;
    },
    schedule: vi.fn((expression: string, _callback: () => void) => {
      const task = { stop: vi.fn(), expression };
      mockTasks.set(expression, task);
      return task;
    }),
  },
}));

// ─── Mock workflowDb ─────────────────────────────────────────────────────────
const mockGetActiveScheduleTriggers = vi.fn();
const mockRecordTriggerFired = vi.fn();

vi.mock("../workflowDb", () => ({
  getActiveScheduleTriggers: () => mockGetActiveScheduleTriggers(),
  recordTriggerFired: (id: number) => mockRecordTriggerFired(id),
}));

// ─── Mock workflowEngine ─────────────────────────────────────────────────────
const mockExecuteWorkflow = vi.fn();

vi.mock("../workflowEngine", () => ({
  executeWorkflow: (workflowId: number, triggeredBy: string, data: Record<string, any>) =>
    mockExecuteWorkflow(workflowId, triggeredBy, data),
}));

// ─── Import after mocks ───────────────────────────────────────────────────────
import {
  startWorkflowCronRunner,
  stopWorkflowCronRunner,
  getRegisteredJobCount,
  getRegisteredJobs,
} from "../services/workflowCronRunner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTrigger(overrides: Partial<{
  triggerId: number;
  workflowId: number;
  schedule: string;
  isActive: boolean;
}> = {}) {
  return {
    triggerId: overrides.triggerId ?? 1,
    workflowId: overrides.workflowId ?? 10,
    config: { schedule: overrides.schedule ?? "0 9 * * 1" },
    isActive: overrides.isActive ?? true,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("WorkflowCronRunner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTasks.clear();
    stopWorkflowCronRunner(); // ensure clean state
    mockGetActiveScheduleTriggers.mockResolvedValue([]);
    mockRecordTriggerFired.mockResolvedValue(undefined);
    mockExecuteWorkflow.mockResolvedValue({ success: true, executionId: 99 });
  });

  afterEach(() => {
    stopWorkflowCronRunner();
  });

  // ── Startup ────────────────────────────────────────────────────────────────

  it("starts without error when no schedule triggers exist", async () => {
    mockGetActiveScheduleTriggers.mockResolvedValue([]);
    await expect(startWorkflowCronRunner()).resolves.not.toThrow();
    expect(getRegisteredJobCount()).toBe(0);
  });

  it("registers one cron job per active schedule trigger on startup", async () => {
    mockGetActiveScheduleTriggers.mockResolvedValue([
      makeTrigger({ triggerId: 1, workflowId: 10, schedule: "0 9 * * 1" }),
      makeTrigger({ triggerId: 2, workflowId: 20, schedule: "0 18 * * 5" }),
    ]);

    await startWorkflowCronRunner();

    expect(getRegisteredJobCount()).toBe(2);
    const jobs = getRegisteredJobs();
    expect(jobs.map((j) => j.triggerId).sort()).toEqual([1, 2]);
    expect(jobs.map((j) => j.cronExpression).sort()).toEqual(
      ["0 18 * * 5", "0 9 * * 1"]
    );
  });

  it("is idempotent — calling start twice does not double-register jobs", async () => {
    mockGetActiveScheduleTriggers.mockResolvedValue([
      makeTrigger({ triggerId: 1, workflowId: 10, schedule: "0 9 * * 1" }),
    ]);

    await startWorkflowCronRunner();
    await startWorkflowCronRunner(); // second call should be a no-op

    expect(getRegisteredJobCount()).toBe(1);
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  it("skips triggers with invalid cron expressions", async () => {
    mockGetActiveScheduleTriggers.mockResolvedValue([
      makeTrigger({ triggerId: 1, workflowId: 10, schedule: "not-a-cron" }),
      makeTrigger({ triggerId: 2, workflowId: 20, schedule: "0 9 * * 1" }),
    ]);

    await startWorkflowCronRunner();

    // Only the valid one should be registered
    expect(getRegisteredJobCount()).toBe(1);
    expect(getRegisteredJobs()[0].triggerId).toBe(2);
  });

  it("skips triggers with no schedule config", async () => {
    mockGetActiveScheduleTriggers.mockResolvedValue([
      {
        triggerId: 5,
        workflowId: 50,
        config: null, // no schedule field
        isActive: true,
      },
    ]);

    await startWorkflowCronRunner();
    expect(getRegisteredJobCount()).toBe(0);
  });

  it("skips triggers with empty config object", async () => {
    mockGetActiveScheduleTriggers.mockResolvedValue([
      {
        triggerId: 6,
        workflowId: 60,
        config: {}, // schedule key missing
        isActive: true,
      },
    ]);

    await startWorkflowCronRunner();
    expect(getRegisteredJobCount()).toBe(0);
  });

  // ── Stop ───────────────────────────────────────────────────────────────────

  it("stops all registered jobs when stopWorkflowCronRunner is called", async () => {
    mockGetActiveScheduleTriggers.mockResolvedValue([
      makeTrigger({ triggerId: 1, workflowId: 10, schedule: "0 9 * * 1" }),
      makeTrigger({ triggerId: 2, workflowId: 20, schedule: "0 18 * * 5" }),
    ]);

    await startWorkflowCronRunner();
    expect(getRegisteredJobCount()).toBe(2);

    stopWorkflowCronRunner();
    expect(getRegisteredJobCount()).toBe(0);
  });

  it("can be restarted after being stopped", async () => {
    mockGetActiveScheduleTriggers.mockResolvedValue([
      makeTrigger({ triggerId: 1, workflowId: 10, schedule: "0 9 * * 1" }),
    ]);

    await startWorkflowCronRunner();
    stopWorkflowCronRunner();
    expect(getRegisteredJobCount()).toBe(0);

    await startWorkflowCronRunner();
    expect(getRegisteredJobCount()).toBe(1);
  });

  // ── Reconciliation ─────────────────────────────────────────────────────────

  it("getRegisteredJobs returns correct shape for each registered job", async () => {
    mockGetActiveScheduleTriggers.mockResolvedValue([
      makeTrigger({ triggerId: 7, workflowId: 70, schedule: "30 8 * * *" }),
    ]);

    await startWorkflowCronRunner();

    const jobs = getRegisteredJobs();
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      triggerId: 7,
      workflowId: 70,
      cronExpression: "30 8 * * *",
    });
  });

  it("handles DB errors during reconciliation gracefully without crashing", async () => {
    mockGetActiveScheduleTriggers.mockRejectedValue(new Error("DB connection lost"));

    // Should not throw — the runner should log and continue
    await expect(startWorkflowCronRunner()).resolves.not.toThrow();
    expect(getRegisteredJobCount()).toBe(0);
  });

  // ── executeWorkflow integration ────────────────────────────────────────────

  it("calls executeWorkflow with correct args when a schedule trigger fires", async () => {
    const trigger = makeTrigger({ triggerId: 3, workflowId: 30, schedule: "0 9 * * 1" });
    mockGetActiveScheduleTriggers.mockResolvedValue([trigger]);
    mockExecuteWorkflow.mockResolvedValue({ success: true, executionId: 42 });

    await startWorkflowCronRunner();

    // Simulate the cron firing by calling the registered callback directly
    const cron = await import("node-cron");
    const scheduleCall = vi.mocked(cron.default.schedule).mock.calls[0];
    const callback = scheduleCall[1] as () => Promise<void>;
    await callback();

    expect(mockExecuteWorkflow).toHaveBeenCalledWith(
      30,
      "schedule",
      expect.objectContaining({
        triggerId: 3,
        cronExpression: "0 9 * * 1",
      })
    );
  });

  it("calls recordTriggerFired after a successful workflow execution", async () => {
    const trigger = makeTrigger({ triggerId: 4, workflowId: 40, schedule: "0 9 * * 1" });
    mockGetActiveScheduleTriggers.mockResolvedValue([trigger]);
    mockExecuteWorkflow.mockResolvedValue({ success: true, executionId: 55 });

    await startWorkflowCronRunner();

    const cron = await import("node-cron");
    const callback = vi.mocked(cron.default.schedule).mock.calls[0][1] as () => Promise<void>;
    await callback();

    expect(mockRecordTriggerFired).toHaveBeenCalledWith(4);
  });

  it("does not call recordTriggerFired when workflow execution fails", async () => {
    const trigger = makeTrigger({ triggerId: 8, workflowId: 80, schedule: "0 9 * * 1" });
    mockGetActiveScheduleTriggers.mockResolvedValue([trigger]);
    mockExecuteWorkflow.mockResolvedValue({ success: false, executionId: 66, errors: ["Action failed"] });

    await startWorkflowCronRunner();

    const cron = await import("node-cron");
    const callback = vi.mocked(cron.default.schedule).mock.calls[0][1] as () => Promise<void>;
    await callback();

    expect(mockRecordTriggerFired).not.toHaveBeenCalled();
  });

  it("does not crash when executeWorkflow throws an unhandled error", async () => {
    const trigger = makeTrigger({ triggerId: 9, workflowId: 90, schedule: "0 9 * * 1" });
    mockGetActiveScheduleTriggers.mockResolvedValue([trigger]);
    mockExecuteWorkflow.mockRejectedValue(new Error("Unexpected engine crash"));

    await startWorkflowCronRunner();

    const cron = await import("node-cron");
    const callback = vi.mocked(cron.default.schedule).mock.calls[0][1] as () => Promise<void>;
    await expect(callback()).resolves.not.toThrow();
  });
});
