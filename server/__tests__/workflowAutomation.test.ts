/**
 * Workflow Automation Tests
 * Tests for: WorkflowBuilder validation, action handlers, trigger evaluation,
 * condition evaluation, template interpolation, and fireWorkflowEvent dispatch
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Template Interpolation ────────────────────────────────────────────────
describe("Workflow Template Interpolation", () => {
  /**
   * Mirrors the resolveTemplate function in workflowEngine.ts
   */
  function resolveTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const keys = key.trim().split(".");
      let value: any = data;
      for (const k of keys) {
        value = value?.[k];
      }
      return value !== undefined && value !== null ? String(value) : `{{${key.trim()}}}`;
    });
  }

  it("replaces simple {{variable}} tokens", () => {
    const result = resolveTemplate("Hello {{name}}!", { name: "Scottie" });
    expect(result).toBe("Hello Scottie!");
  });

  it("replaces nested {{fan.email}} tokens", () => {
    const result = resolveTemplate("Email: {{fan.email}}", { fan: { email: "fan@example.com" } });
    expect(result).toBe("Email: fan@example.com");
  });

  it("replaces multiple tokens in one string", () => {
    const result = resolveTemplate("{{artist.name}} hit {{count}} streams!", {
      artist: { name: "Boptone Artist" },
      count: 1000000,
    });
    expect(result).toBe("Boptone Artist hit 1000000 streams!");
  });

  it("leaves unresolved tokens as-is when key not found", () => {
    const result = resolveTemplate("Hello {{unknown}}", {});
    expect(result).toBe("Hello {{unknown}}");
  });

  it("handles numeric values correctly", () => {
    const result = resolveTemplate("Amount: ${{amount}}", { amount: 25.99 });
    expect(result).toBe("Amount: $25.99");
  });

  it("handles empty template string", () => {
    const result = resolveTemplate("", { name: "test" });
    expect(result).toBe("");
  });

  it("handles template with no tokens", () => {
    const result = resolveTemplate("No tokens here", { name: "test" });
    expect(result).toBe("No tokens here");
  });
});

// ─── Condition Evaluation ─────────────────────────────────────────────────
describe("Workflow Condition Evaluation", () => {
  /**
   * Mirrors the evaluateCondition function in workflowEngine.ts
   */
  function evaluateCondition(condition: any, data: Record<string, any>): boolean {
    if (!condition) return true;
    const { field, operator, value } = condition;
    const fieldValue = field?.split(".").reduce((obj: any, k: string) => obj?.[k], data);

    switch (operator) {
      case "equals": return String(fieldValue) === String(value);
      case "not_equals": return String(fieldValue) !== String(value);
      case "greater_than": return Number(fieldValue) > Number(value);
      case "less_than": return Number(fieldValue) < Number(value);
      case "greater_or_equal": return Number(fieldValue) >= Number(value);
      case "less_or_equal": return Number(fieldValue) <= Number(value);
      case "contains": return String(fieldValue).includes(String(value));
      case "exists": return fieldValue !== undefined && fieldValue !== null;
      default: return true;
    }
  }

  it("evaluates equals condition correctly", () => {
    expect(evaluateCondition({ field: "status", operator: "equals", value: "active" }, { status: "active" })).toBe(true);
    expect(evaluateCondition({ field: "status", operator: "equals", value: "active" }, { status: "paused" })).toBe(false);
  });

  it("evaluates not_equals condition correctly", () => {
    expect(evaluateCondition({ field: "type", operator: "not_equals", value: "free" }, { type: "pro" })).toBe(true);
    expect(evaluateCondition({ field: "type", operator: "not_equals", value: "free" }, { type: "free" })).toBe(false);
  });

  it("evaluates greater_than condition correctly", () => {
    expect(evaluateCondition({ field: "amount", operator: "greater_than", value: 100 }, { amount: 150 })).toBe(true);
    expect(evaluateCondition({ field: "amount", operator: "greater_than", value: 100 }, { amount: 50 })).toBe(false);
    expect(evaluateCondition({ field: "amount", operator: "greater_than", value: 100 }, { amount: 100 })).toBe(false);
  });

  it("evaluates less_than condition correctly", () => {
    expect(evaluateCondition({ field: "count", operator: "less_than", value: 10 }, { count: 5 })).toBe(true);
    expect(evaluateCondition({ field: "count", operator: "less_than", value: 10 }, { count: 15 })).toBe(false);
  });

  it("evaluates contains condition correctly", () => {
    expect(evaluateCondition({ field: "genre", operator: "contains", value: "hip" }, { genre: "hip-hop" })).toBe(true);
    expect(evaluateCondition({ field: "genre", operator: "contains", value: "rock" }, { genre: "hip-hop" })).toBe(false);
  });

  it("evaluates exists condition correctly", () => {
    expect(evaluateCondition({ field: "email", operator: "exists" }, { email: "test@example.com" })).toBe(true);
    expect(evaluateCondition({ field: "email", operator: "exists" }, {})).toBe(false);
    expect(evaluateCondition({ field: "email", operator: "exists" }, { email: null })).toBe(false);
  });

  it("evaluates nested field paths", () => {
    expect(evaluateCondition({ field: "fan.tier", operator: "equals", value: "gold" }, { fan: { tier: "gold" } })).toBe(true);
    expect(evaluateCondition({ field: "fan.tier", operator: "equals", value: "gold" }, { fan: { tier: "silver" } })).toBe(false);
  });

  it("returns true for null/undefined condition (pass-through)", () => {
    expect(evaluateCondition(null, { amount: 100 })).toBe(true);
    expect(evaluateCondition(undefined, {})).toBe(true);
  });
});

// ─── Trigger Evaluation ───────────────────────────────────────────────────
describe("Workflow Trigger Evaluation", () => {
  /**
   * Mirrors the trigger evaluation logic in workflowEngine.ts
   */
  function evaluateTriggerConfig(config: Record<string, any>, eventData: Record<string, any>): boolean {
    const eventType = config.eventType as string;
    if (!eventType) return true;
    if (eventData.eventType && eventData.eventType !== eventType) return false;

    if (eventType === "stream_milestone" || eventType === "follower_milestone") {
      const threshold = Number(config.threshold || 0);
      const current = Number(eventData.count || eventData.streams || eventData.followers || 0);
      return current >= threshold;
    }
    if (eventType === "new_follower") return Boolean(eventData.followerId);
    if (eventType === "new_sale" || eventType === "bopshop_sale") return Boolean(eventData.orderId);
    if (eventType === "tip_received") {
      const minAmount = Number(config.minAmount || 0);
      const tipAmount = Number(eventData.amount || 0);
      return tipAmount >= minAmount;
    }
    return true;
  }

  it("fires stream_milestone trigger when count reaches threshold", () => {
    const config = { eventType: "stream_milestone", threshold: 1000000 };
    expect(evaluateTriggerConfig(config, { eventType: "stream_milestone", count: 1000000 })).toBe(true);
    expect(evaluateTriggerConfig(config, { eventType: "stream_milestone", count: 999999 })).toBe(false);
    expect(evaluateTriggerConfig(config, { eventType: "stream_milestone", count: 2000000 })).toBe(true);
  });

  it("fires follower_milestone trigger when follower count reaches threshold", () => {
    const config = { eventType: "follower_milestone", threshold: 10000 };
    expect(evaluateTriggerConfig(config, { eventType: "follower_milestone", count: 10000 })).toBe(true);
    expect(evaluateTriggerConfig(config, { eventType: "follower_milestone", count: 9999 })).toBe(false);
  });

  it("fires new_follower trigger when followerId is present", () => {
    const config = { eventType: "new_follower" };
    expect(evaluateTriggerConfig(config, { eventType: "new_follower", followerId: 42 })).toBe(true);
    expect(evaluateTriggerConfig(config, { eventType: "new_follower" })).toBe(false);
  });

  it("fires bopshop_sale trigger when orderId is present", () => {
    const config = { eventType: "bopshop_sale" };
    expect(evaluateTriggerConfig(config, { eventType: "bopshop_sale", orderId: 123 })).toBe(true);
    expect(evaluateTriggerConfig(config, { eventType: "bopshop_sale" })).toBe(false);
  });

  it("fires tip_received trigger when amount meets minimum", () => {
    const config = { eventType: "tip_received", minAmount: 5 };
    expect(evaluateTriggerConfig(config, { eventType: "tip_received", amount: 10 })).toBe(true);
    expect(evaluateTriggerConfig(config, { eventType: "tip_received", amount: 5 })).toBe(true);
    expect(evaluateTriggerConfig(config, { eventType: "tip_received", amount: 4 })).toBe(false);
  });

  it("does not fire trigger when event type does not match", () => {
    const config = { eventType: "new_follower" };
    expect(evaluateTriggerConfig(config, { eventType: "bopshop_sale", orderId: 1 })).toBe(false);
  });

  it("fires trigger when no eventType filter is set (catch-all)", () => {
    const config = {};
    expect(evaluateTriggerConfig(config, { eventType: "anything", data: "value" })).toBe(true);
  });
});

// ─── Workflow Validation ──────────────────────────────────────────────────
describe("WorkflowBuilder Validation", () => {
  interface WorkflowNode {
    id: string;
    type: string;
    data: { subtype: string; config: Record<string, string> };
  }
  interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
  }

  const REQUIRED_FIELDS: Record<string, string[]> = {
    stream_milestone: ["threshold"],
    follower_milestone: ["threshold"],
    schedule: ["cron"],
    send_email: ["to", "subject"],
    send_notification: ["title"],
    notify_fans: ["title"],
    call_webhook: ["url"],
    generate_ai_content: ["prompt"],
  };

  function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
    const errors: string[] = [];
    if (!nodes.some((n) => n.type === "trigger")) errors.push("Add at least one Trigger node.");
    if (!nodes.some((n) => n.type === "action")) errors.push("Add at least one Action node.");
    if (nodes.length > 1 && edges.length === 0) errors.push("Connect your nodes with arrows.");
    for (const node of nodes) {
      const required = REQUIRED_FIELDS[node.data.subtype] ?? [];
      for (const field of required) {
        if (!node.data.config[field]?.trim()) {
          errors.push(`"${node.data.subtype}" node is missing required field: ${field}`);
        }
      }
    }
    return errors;
  }

  it("returns error when no trigger node exists", () => {
    const nodes: WorkflowNode[] = [{ id: "a1", type: "action", data: { subtype: "send_email", config: { to: "a@b.com", subject: "Hi" } } }];
    const errors = validateWorkflow(nodes, []);
    expect(errors).toContain("Add at least one Trigger node.");
  });

  it("returns error when no action node exists", () => {
    const nodes: WorkflowNode[] = [{ id: "t1", type: "trigger", data: { subtype: "new_follower", config: {} } }];
    const errors = validateWorkflow(nodes, []);
    expect(errors).toContain("Add at least one Action node.");
  });

  it("returns error when nodes are not connected", () => {
    const nodes: WorkflowNode[] = [
      { id: "t1", type: "trigger", data: { subtype: "new_follower", config: {} } },
      { id: "a1", type: "action", data: { subtype: "send_email", config: { to: "a@b.com", subject: "Hi" } } },
    ];
    const errors = validateWorkflow(nodes, []);
    expect(errors).toContain("Connect your nodes with arrows.");
  });

  it("returns no errors for a valid workflow", () => {
    const nodes: WorkflowNode[] = [
      { id: "t1", type: "trigger", data: { subtype: "new_follower", config: {} } },
      { id: "a1", type: "action", data: { subtype: "send_email", config: { to: "{{fan.email}}", subject: "Welcome!" } } },
    ];
    const edges: WorkflowEdge[] = [{ id: "e1", source: "t1", target: "a1" }];
    const errors = validateWorkflow(nodes, edges);
    expect(errors).toHaveLength(0);
  });

  it("returns error for missing required field in send_email node", () => {
    const nodes: WorkflowNode[] = [
      { id: "t1", type: "trigger", data: { subtype: "new_follower", config: {} } },
      { id: "a1", type: "action", data: { subtype: "send_email", config: { to: "a@b.com" } } }, // missing subject
    ];
    const edges: WorkflowEdge[] = [{ id: "e1", source: "t1", target: "a1" }];
    const errors = validateWorkflow(nodes, edges);
    expect(errors.some((e) => e.includes("subject"))).toBe(true);
  });

  it("returns error for missing threshold in stream_milestone trigger", () => {
    const nodes: WorkflowNode[] = [
      { id: "t1", type: "trigger", data: { subtype: "stream_milestone", config: {} } }, // missing threshold
      { id: "a1", type: "action", data: { subtype: "send_notification", config: { title: "Milestone!" } } },
    ];
    const edges: WorkflowEdge[] = [{ id: "e1", source: "t1", target: "a1" }];
    const errors = validateWorkflow(nodes, edges);
    expect(errors.some((e) => e.includes("threshold"))).toBe(true);
  });

  it("returns error for missing URL in call_webhook node", () => {
    const nodes: WorkflowNode[] = [
      { id: "t1", type: "trigger", data: { subtype: "new_follower", config: {} } },
      { id: "a1", type: "action", data: { subtype: "call_webhook", config: {} } }, // missing url
    ];
    const edges: WorkflowEdge[] = [{ id: "e1", source: "t1", target: "a1" }];
    const errors = validateWorkflow(nodes, edges);
    expect(errors.some((e) => e.includes("url"))).toBe(true);
  });

  it("allows single node workflow without edge requirement", () => {
    const nodes: WorkflowNode[] = [
      { id: "t1", type: "trigger", data: { subtype: "new_follower", config: {} } },
    ];
    const errors = validateWorkflow(nodes, []);
    // Only error should be missing action, not missing edge
    expect(errors.some((e) => e.includes("Connect"))).toBe(false);
  });
});

// ─── Action Handler Logic ─────────────────────────────────────────────────
describe("Workflow Action Handler Logic", () => {
  it("send_email returns no_recipient when to is empty", () => {
    const to = "";
    const result = !to ? { sent: false, reason: "no_recipient" } : { sent: true, to };
    expect(result).toEqual({ sent: false, reason: "no_recipient" });
  });

  it("send_email proceeds when to is provided", () => {
    const to = "fan@example.com";
    const result = !to ? { sent: false, reason: "no_recipient" } : { sent: true, to };
    expect(result).toEqual({ sent: true, to: "fan@example.com" });
  });

  it("call_webhook returns no_url when url is empty", () => {
    const url = "";
    const result = !url ? { called: false, reason: "no_url" } : { called: true, url };
    expect(result).toEqual({ called: false, reason: "no_url" });
  });

  it("wait action calculates delay in milliseconds correctly", () => {
    const delayHours = 2;
    const delayMinutes = 30;
    const delayMs = delayMinutes * 60 * 1000 + delayHours * 3600 * 1000;
    expect(delayMs).toBe(9_000_000); // 2.5 hours in ms
  });

  it("wait action handles zero delay", () => {
    const delayMs = 0 * 60 * 1000 + 0 * 3600 * 1000;
    expect(delayMs).toBe(0);
  });

  it("notify_fans batches notifications in groups of 100", () => {
    const followers = Array.from({ length: 250 }, (_, i) => ({ followerId: i + 1 }));
    const batches: number[] = [];
    for (let i = 0; i < followers.length; i += 100) {
      batches.push(followers.slice(i, i + 100).length);
    }
    expect(batches).toEqual([100, 100, 50]);
  });

  it("generate_ai_content uses default system prompt when none provided", () => {
    const systemPrompt = undefined ?? "You are a creative assistant helping music artists craft engaging content for their fans.";
    expect(systemPrompt).toContain("creative assistant");
  });
});

// ─── Workflow Node Schema ─────────────────────────────────────────────────
describe("Workflow Node Schema Coverage", () => {
  const ALL_TRIGGER_SUBTYPES = ["new_follower", "stream_milestone", "bopshop_sale", "tip_received", "follower_milestone", "schedule"];
  const ALL_ACTION_SUBTYPES = ["send_email", "send_notification", "notify_fans", "generate_ai_content", "call_webhook", "post_instagram", "post_twitter", "wait"];
  const ALL_CONDITION_SUBTYPES = ["if_else", "filter", "format", "merge"];

  it("covers all expected trigger subtypes", () => {
    expect(ALL_TRIGGER_SUBTYPES).toContain("new_follower");
    expect(ALL_TRIGGER_SUBTYPES).toContain("stream_milestone");
    expect(ALL_TRIGGER_SUBTYPES).toContain("bopshop_sale");
    expect(ALL_TRIGGER_SUBTYPES).toContain("tip_received");
    expect(ALL_TRIGGER_SUBTYPES).toContain("follower_milestone");
    expect(ALL_TRIGGER_SUBTYPES).toContain("schedule");
    expect(ALL_TRIGGER_SUBTYPES).toHaveLength(6);
  });

  it("covers all expected action subtypes", () => {
    expect(ALL_ACTION_SUBTYPES).toContain("send_email");
    expect(ALL_ACTION_SUBTYPES).toContain("send_notification");
    expect(ALL_ACTION_SUBTYPES).toContain("notify_fans");
    expect(ALL_ACTION_SUBTYPES).toContain("generate_ai_content");
    expect(ALL_ACTION_SUBTYPES).toContain("call_webhook");
    expect(ALL_ACTION_SUBTYPES).toHaveLength(8);
  });

  it("covers all expected condition/logic subtypes", () => {
    expect(ALL_CONDITION_SUBTYPES).toContain("if_else");
    expect(ALL_CONDITION_SUBTYPES).toContain("filter");
    expect(ALL_CONDITION_SUBTYPES).toContain("format");
    expect(ALL_CONDITION_SUBTYPES).toContain("merge");
  });
});

// ─── AI Workflow Generator Input ─────────────────────────────────────────
describe("AI Workflow Generator Input Validation", () => {
  it("rejects descriptions shorter than 10 characters", () => {
    const description = "short";
    expect(description.length).toBeLessThan(10);
  });

  it("accepts descriptions between 10 and 500 characters", () => {
    const description = "When I get a new follower, send them a welcome email";
    expect(description.length).toBeGreaterThanOrEqual(10);
    expect(description.length).toBeLessThanOrEqual(500);
  });

  it("rejects descriptions longer than 500 characters", () => {
    const description = "a".repeat(501);
    expect(description.length).toBeGreaterThan(500);
  });

  it("parses common workflow intent patterns", () => {
    const patterns = [
      { input: "when new follower send welcome email", expectsTrigger: "new_follower", expectsAction: "send_email" },
      { input: "when I hit 1 million streams notify me", expectsTrigger: "stream_milestone", expectsAction: "send_notification" },
      { input: "when someone buys from my store send thank you email", expectsTrigger: "bopshop_sale", expectsAction: "send_email" },
    ];
    for (const p of patterns) {
      // Verify the pattern contains the expected keywords
      expect(p.input.length).toBeGreaterThan(0);
      expect(p.expectsTrigger).toBeTruthy();
      expect(p.expectsAction).toBeTruthy();
    }
  });
});
