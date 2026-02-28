import { getDb } from "./db";
import { 
  workflows, 
  workflowExecutions, 
  workflowExecutionLogs,
  workflowTriggers,
  notifications,
  bapFollows,
  artistProfiles,
  users
} from "../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { ENV } from "./_core/env";

/**
 * Workflow Execution Engine
 * 
 * World-class workflow automation system for Pro/Enterprise artists.
 * Inspired by n8n architecture with artist-specific triggers and actions.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition" | "data";
  subtype: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  settings?: Record<string, any>;
}

export interface ExecutionContext {
  workflowId: number;
  executionId: number;
  artistId: number;
  triggerData: Record<string, any>;
  nodeOutputs: Map<string, any>;
}

// ============================================================================
// WORKFLOW EXECUTION
// ============================================================================

/**
 * Execute a workflow with given trigger data
 * Main entry point for workflow execution
 */
export async function executeWorkflow(
  workflowId: number,
  triggeredBy: "webhook" | "schedule" | "event" | "manual" | "ai",
  triggerData: Record<string, any>
): Promise<{ success: boolean; executionId: number; errors?: string[] }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const startTime = Date.now();

  // Create execution record
  const [execution] = await db.insert(workflowExecutions).values({
    workflowId,
    status: "running",
    triggeredBy,
    triggerData,
    startedAt: new Date(),
  });

  const executionId = execution.insertId;
  const errors: string[] = [];

  try {
    // Get workflow definition
    const [workflow] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, workflowId))
      .limit(1);

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Check if workflow is active
    if (workflow.status !== "active") {
      throw new Error(`Workflow ${workflowId} is not active (status: ${workflow.status})`);
    }

    const definition = workflow.definition as WorkflowDefinition;

    // Create execution context
    const context: ExecutionContext = {
      workflowId,
      executionId,
      artistId: workflow.artistId,
      triggerData,
      nodeOutputs: new Map(),
    };

    // Execute workflow nodes in order (topological sort based on edges)
    const executionOrder = getExecutionOrder(definition);

    for (const nodeId of executionOrder) {
      const node = definition.nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      try {
        const nodeStartTime = Date.now();

        // Get input data from connected nodes
        const inputData = getNodeInputs(node, definition, context);

        // Execute node
        const output = await executeNode(node, inputData, context);

        // Store output for downstream nodes
        context.nodeOutputs.set(nodeId, output);

        // Log successful execution
        await logNodeExecution(db, {
          executionId,
          nodeId: node.id,
          nodeType: node.type,
          nodeSubtype: node.subtype,
          status: "success",
          input: inputData,
          output,
          executedAt: new Date(),
          duration: Date.now() - nodeStartTime,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        errors.push(`Node ${node.id} (${node.subtype}) failed: ${errorMessage}`);

        // Log failed execution
        await logNodeExecution(db, {
          executionId,
          nodeId: node.id,
          nodeType: node.type,
          nodeSubtype: node.subtype,
          status: "failed",
          input: getNodeInputs(node, definition, context),
          output: null,
          errorMessage,
          errorStack,
          executedAt: new Date(),
          duration: 0,
        });

        // Stop execution on error (can be made configurable per workflow)
        break;
      }
    }

    const duration = Date.now() - startTime;
    const success = errors.length === 0;

    // Update execution record
    await db
      .update(workflowExecutions)
      .set({
        status: success ? "completed" : "failed",
        completedAt: new Date(),
        duration,
        errorMessage: errors.length > 0 ? errors.join("; ") : null,
        metadata: {
          nodeExecutions: executionOrder.length,
          actionsPerformed: context.nodeOutputs.size,
        },
      })
      .where(eq(workflowExecutions.id, executionId));

    // Update workflow statistics
    await db
      .update(workflows)
      .set({
        totalRuns: workflow.totalRuns + 1,
        successfulRuns: success ? workflow.successfulRuns + 1 : workflow.successfulRuns,
        failedRuns: success ? workflow.failedRuns : workflow.failedRuns + 1,
        lastRunAt: new Date(),
      })
      .where(eq(workflows.id, workflowId));

    return {
      success,
      executionId,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Workflow execution failed: ${errorMessage}`);

    // Update execution as failed
    await db
      .update(workflowExecutions)
      .set({
        status: "failed",
        completedAt: new Date(),
        duration: Date.now() - startTime,
        errorMessage,
      })
      .where(eq(workflowExecutions.id, executionId));

    return {
      success: false,
      executionId,
      errors,
    };
  }
}

// ============================================================================
// NODE EXECUTION
// ============================================================================

/**
 * Execute a single workflow node
 */
async function executeNode(
  node: WorkflowNode,
  inputData: Record<string, any>,
  context: ExecutionContext
): Promise<any> {
  switch (node.type) {
    case "trigger":
      // Triggers don't execute, they just provide data
      return context.triggerData;

    case "action":
      return await executeAction(node, inputData, context);

    case "condition":
      return await executeCondition(node, inputData, context);

    case "data":
      return await executeDataTransform(node, inputData, context);

    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

/**
 * Execute an action node (send email, post to social, etc.)
 */
async function executeAction(
  node: WorkflowNode,
  inputData: Record<string, any>,
  context: ExecutionContext
): Promise<any> {
  const { subtype, data } = node;

  switch (subtype) {
    case "send_email": {
      // Send email via Manus Forge Email API
      const to = resolveTemplate(data.to || "", inputData);
      const subject = resolveTemplate(data.subject || "Message from Boptone", inputData);
      const body = resolveTemplate(data.body || data.message || "", inputData);
      if (!to) {
        console.warn("[Workflow] send_email: no recipient address");
        return { sent: false, reason: "no_recipient" };
      }
      try {
        const response = await fetch(`${ENV.forgeApiUrl}/email/send`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ENV.forgeApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to,
            subject,
            html: `<div style="font-family:sans-serif;">${body.replace(/\n/g, "<br/>")}</div>`,
            text: body,
          }),
        });
        const ok = response.ok;
        if (!ok) console.warn("[Workflow] send_email failed:", await response.text());
        return { sent: ok, to };
      } catch (err) {
        console.error("[Workflow] send_email error:", err);
        return { sent: false, error: String(err) };
      }
    }

    case "send_notification": {
      // Create an in-app notification for the artist or a specific user
      const db = await getDb();
      if (!db) return { sent: false, reason: "db_unavailable" };
      const targetUserId = data.userId || context.artistId;
      const title = resolveTemplate(data.title || "Boptone Notification", inputData);
      const message = resolveTemplate(data.message || "", inputData);
      await db.insert(notifications).values({
        userId: targetUserId,
        title,
        message,
        type: (data.type as any) || "system",
        actionUrl: data.actionUrl || null,
      });
      return { sent: true, userId: targetUserId };
    }

    case "notify_fans": {
      // Send in-app notifications to all followers of the artist
      const db = await getDb();
      if (!db) return { sent: false, reason: "db_unavailable" };
      // Get artist profile to find followers
      const artistProfile = await db
        .select({ id: artistProfiles.id })
        .from(artistProfiles)
        .where(eq(artistProfiles.userId, context.artistId))
        .limit(1);
      if (!artistProfile.length) return { sent: false, reason: "artist_not_found" };
      const followers = await db
        .select({ followerId: bapFollows.followerId })
        .from(bapFollows)
        .where(eq(bapFollows.followingId, artistProfile[0].id));
      if (!followers.length) return { sent: true, notified: 0 };
      const title = resolveTemplate(data.title || "New update from your artist", inputData);
      const message = resolveTemplate(data.message || "", inputData);
      const notifRows = followers.map((f) => ({
        userId: f.followerId,
        title,
        message,
        type: (data.type as any) || "milestone",
        actionUrl: data.actionUrl || null,
      }));
      // Insert in batches of 100
      for (let i = 0; i < notifRows.length; i += 100) {
        await db.insert(notifications).values(notifRows.slice(i, i + 100));
      }
      return { sent: true, notified: notifRows.length };
    }

    case "post_instagram":
      // Instagram Graph API requires OAuth — log intent and return queued status
      console.log("[Workflow] Instagram post queued (OAuth required):", data.caption);
      return { queued: true, platform: "instagram", caption: data.caption };

    case "post_twitter":
      // Twitter API v2 requires OAuth — log intent and return queued status
      console.log("[Workflow] Twitter post queued (OAuth required):", data.text);
      return { queued: true, platform: "twitter", text: data.text };

    case "send_sms":
      // SMS via Twilio — log intent (Twilio credentials not yet configured)
      console.log("[Workflow] SMS queued (Twilio required):", data.to, data.message);
      return { queued: true, to: data.to };

    case "update_database": {
      // Safe DB update: only allow updating artist-owned records
      // Supported operations: update_workflow_status, log_event
      const db = await getDb();
      if (!db) return { updated: false, reason: "db_unavailable" };
      const op = data.operation as string;
      if (op === "update_workflow_status" && data.workflowId) {
        await db
          .update(workflows)
          .set({ status: data.status || "paused" })
          .where(and(eq(workflows.id, data.workflowId), eq(workflows.artistId, context.artistId)));
        return { updated: true, operation: op };
      }
      // Default: log as a notification
      await db.insert(notifications).values({
        userId: context.artistId,
        title: "Workflow DB Update",
        message: `Operation: ${op}`,
        type: "system",
      });
      return { updated: true, operation: op || "log" };
    }

    case "call_webhook": {
      // HTTP webhook call with configurable method, headers, and body
      const url = resolveTemplate(data.url || "", inputData);
      if (!url) return { called: false, reason: "no_url" };
      try {
        const method = (data.method || "POST").toUpperCase();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(data.headers || {}),
        };
        const body = method !== "GET" ? JSON.stringify({
          ...inputData,
          ...(data.payload || {}),
          _source: "boptone_workflow",
          _workflowId: context.workflowId,
          _executionId: context.executionId,
        }) : undefined;
        const response = await fetch(url, { method, headers, body });
        const responseText = await response.text();
        return {
          called: true,
          url,
          status: response.status,
          ok: response.ok,
          response: responseText.slice(0, 500), // Truncate large responses
        };
      } catch (err) {
        console.error("[Workflow] call_webhook error:", err);
        return { called: false, url, error: String(err) };
      }
    }

    case "generate_ai_content": {
      // Generate content using the Boptone LLM helper
      const prompt = resolveTemplate(data.prompt || "Generate a short artist update", inputData);
      const systemPrompt = data.systemPrompt || "You are a creative assistant helping music artists craft engaging content for their fans. Keep responses concise, authentic, and on-brand.";
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        });
        const content = response.choices?.[0]?.message?.content || "";
        return { generated: true, content, prompt };
      } catch (err) {
        console.error("[Workflow] generate_ai_content error:", err);
        return { generated: false, error: String(err) };
      }
    }

    case "wait": {
      // Delay action — record the delay intent (actual scheduling via BullMQ is handled externally)
      const delayMs = (data.delayMinutes || 0) * 60 * 1000 + (data.delayHours || 0) * 3600 * 1000;
      console.log(`[Workflow] Wait action: ${delayMs}ms delay recorded`);
      return { waited: true, delayMs };
    }

    default:
      console.warn(`[Workflow] Unknown action subtype: ${subtype} — skipping`);
      return { skipped: true, subtype };
  }
}

/**
 * Execute a condition node (if/else, filter, switch)
 */
async function executeCondition(
  node: WorkflowNode,
  inputData: Record<string, any>,
  context: ExecutionContext
): Promise<any> {
  const { subtype, data } = node;

  switch (subtype) {
    case "if_else": {
      const result = evaluateCondition(data.condition, inputData);
      return { branch: result ? "true" : "false", result };
    }

    case "filter": {
      // Filter an array from inputData based on a condition
      const arr = inputData[data.field] as any[];
      if (!Array.isArray(arr)) return { filtered: [], count: 0 };
      const filtered = arr.filter((item) => evaluateCondition(data.condition, item));
      return { filtered, count: filtered.length };
    }

    case "switch": {
      // Match a value against cases
      const value = resolveValue(data.field, inputData);
      const matchedCase = (data.cases as Array<{ value: any; branch: string }> || [])
        .find((c) => String(c.value) === String(value));
      return { branch: matchedCase?.branch || data.defaultBranch || "default", value };
    }

    default:
      console.warn(`[Workflow] Unknown condition subtype: ${subtype} — skipping`);
      return { skipped: true, subtype };
  }
}

/**
 * Execute a data transformation node (map, aggregate, format)
 */
async function executeDataTransform(
  node: WorkflowNode,
  inputData: Record<string, any>,
  context: ExecutionContext
): Promise<any> {
  const { subtype, data } = node;

  switch (subtype) {
    case "map": {
      // Map over an array, extracting a field or applying a template
      const arr = inputData[data.field] as any[];
      if (!Array.isArray(arr)) return { mapped: [], count: 0 };
      const mapped = arr.map((item) =>
        data.template ? resolveTemplate(data.template, item) : item[data.extract]
      );
      return { mapped, count: mapped.length };
    }

    case "aggregate": {
      // Aggregate: count, sum, average
      const arr = inputData[data.field] as any[];
      if (!Array.isArray(arr)) return { result: 0 };
      const op = data.operation as string;
      if (op === "count") return { result: arr.length };
      if (op === "sum") return { result: arr.reduce((a, b) => a + (Number(b[data.valueField]) || 0), 0) };
      if (op === "average") {
        const sum = arr.reduce((a, b) => a + (Number(b[data.valueField]) || 0), 0);
        return { result: arr.length ? sum / arr.length : 0 };
      }
      return { result: arr.length };
    }

    case "format": {
      // Format a value using a template string
      const formatted = resolveTemplate(data.template || "", inputData);
      return { formatted, output: formatted };
    }

    default:
      console.warn(`[Workflow] Unknown data transform subtype: ${subtype} — skipping`);
      return { skipped: true, subtype };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get execution order of nodes (topological sort)
 */
function getExecutionOrder(definition: WorkflowDefinition): string[] {
  const { nodes, edges } = definition;
  const order: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
  }

  // DFS topological sort
  function visit(nodeId: string) {
    if (visited.has(nodeId)) return;
    if (visiting.has(nodeId)) {
      throw new Error("Circular dependency detected in workflow");
    }

    visiting.add(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      visit(neighbor);
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    order.unshift(nodeId); // Add to front for reverse order
  }

  // Find trigger nodes (nodes with no incoming edges)
  const hasIncoming = new Set<string>();
  for (const edge of edges) {
    hasIncoming.add(edge.target);
  }

  const triggerNodes = nodes.filter((n) => !hasIncoming.has(n.id));

  // Start DFS from trigger nodes
  for (const trigger of triggerNodes) {
    visit(trigger.id);
  }

  return order;
}

/**
 * Get input data for a node from connected upstream nodes
 */
function getNodeInputs(
  node: WorkflowNode,
  definition: WorkflowDefinition,
  context: ExecutionContext
): Record<string, any> {
  const inputs: Record<string, any> = {};

  // Find all edges pointing to this node
  const incomingEdges = definition.edges.filter((e) => e.target === node.id);

  for (const edge of incomingEdges) {
    const sourceOutput = context.nodeOutputs.get(edge.source);
    if (sourceOutput !== undefined) {
      inputs[edge.source] = sourceOutput;
    }
  }

  // If no inputs, use trigger data
  if (Object.keys(inputs).length === 0) {
    return context.triggerData;
  }

  return inputs;
}

/**
 * Resolve a dot-notation path from data (e.g. "fan.email" → data.fan.email)
 */
function resolveValue(path: string, data: Record<string, any>): any {
  if (!path) return undefined;
  return path.split(".").reduce((obj: any, key) => obj?.[key], data);
}

/**
 * Resolve a template string with {{variable}} placeholders
 * e.g. "Hello {{fan.name}}" → "Hello Alice"
 */
function resolveTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const value = resolveValue(path.trim(), data);
    return value !== undefined && value !== null ? String(value) : "";
  });
}

/**
 * Evaluate a condition expression against data
 * Supports: equals, not_equals, greater_than, less_than, contains, exists
 */
function evaluateCondition(
  condition: any,
  data: Record<string, any>
): boolean {
  if (!condition) return true;
  const { field, operator, value } = condition as {
    field: string;
    operator: string;
    value: any;
  };
  const actual = resolveValue(field, data);

  switch (operator) {
    case "equals":
    case "==":
      return String(actual) === String(value);
    case "not_equals":
    case "!=":
      return String(actual) !== String(value);
    case "greater_than":
    case ">":
      return Number(actual) > Number(value);
    case "less_than":
    case "<":
      return Number(actual) < Number(value);
    case "greater_than_or_equal":
    case ">=":
      return Number(actual) >= Number(value);
    case "less_than_or_equal":
    case "<=":
      return Number(actual) <= Number(value);
    case "contains":
      return String(actual).includes(String(value));
    case "not_contains":
      return !String(actual).includes(String(value));
    case "starts_with":
      return String(actual).startsWith(String(value));
    case "ends_with":
      return String(actual).endsWith(String(value));
    case "exists":
      return actual !== undefined && actual !== null;
    case "not_exists":
      return actual === undefined || actual === null;
    case "is_true":
      return Boolean(actual) === true;
    case "is_false":
      return Boolean(actual) === false;
    default:
      // AND/OR compound conditions
      if (condition.and && Array.isArray(condition.and)) {
        return condition.and.every((c: any) => evaluateCondition(c, data));
      }
      if (condition.or && Array.isArray(condition.or)) {
        return condition.or.some((c: any) => evaluateCondition(c, data));
      }
      return true;
  }
}

/**
 * Log node execution to database
 */
async function logNodeExecution(
  db: any,
  log: {
    executionId: number;
    nodeId: string;
    nodeType: string;
    nodeSubtype: string;
    status: "success" | "failed" | "skipped";
    input: Record<string, any>;
    output: any;
    errorMessage?: string;
    errorStack?: string;
    executedAt: Date;
    duration: number;
  }
) {
  await db.insert(workflowExecutionLogs).values(log);
}

// ============================================================================
// TRIGGER SYSTEM
// ============================================================================

/**
 * Check and fire triggers for active workflows
 * Called by cron job or event system
 */
export async function checkTriggers(
  triggerType: "webhook" | "schedule" | "event",
  eventData?: Record<string, any>
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get all active triggers of this type
  const triggers = await db
    .select()
    .from(workflowTriggers)
    .where(and(eq(workflowTriggers.type, triggerType), eq(workflowTriggers.isActive, true)));

  for (const trigger of triggers) {
    try {
      // Check if trigger condition is met
      const shouldFire = await evaluateTrigger(trigger, eventData);

      if (shouldFire) {
        // Execute workflow
        await executeWorkflow(trigger.workflowId, triggerType, eventData || {});

        // Update trigger statistics
        await db
          .update(workflowTriggers)
          .set({
            triggerCount: trigger.triggerCount + 1,
            lastTriggeredAt: new Date(),
          })
          .where(eq(workflowTriggers.id, trigger.id));
      }
    } catch (error) {
      console.error(`[Workflow] Trigger ${trigger.id} failed:`, error);
    }
  }
}

/**
 * Evaluate if a trigger should fire based on its type and config
 */
async function evaluateTrigger(
  trigger: any,
  eventData?: Record<string, any>
): Promise<boolean> {
  const config = trigger.config as Record<string, any> || {};
  const data = eventData || {};

  switch (trigger.type) {
    case "manual":
      return true;

    case "webhook":
      // Webhook triggers always fire when called
      return true;

    case "schedule":
      // Schedule triggers are evaluated by the cron system — always true here
      return true;

    case "event": {
      const eventType = config.eventType as string;
      if (!eventType) return true;

      // Match the incoming event type
      if (data.eventType && data.eventType !== eventType) return false;

      // Evaluate optional condition filter
      if (config.condition) {
        return evaluateCondition(config.condition, data);
      }

      // Threshold-based triggers (e.g. stream_milestone, follower_milestone)
      if (eventType === "stream_milestone" || eventType === "follower_milestone") {
        const threshold = Number(config.threshold || 0);
        const current = Number(data.count || data.streams || data.followers || 0);
        return current >= threshold;
      }

      // New follower trigger
      if (eventType === "new_follower") {
        return Boolean(data.followerId);
      }

      // New sale trigger
      if (eventType === "new_sale" || eventType === "bopshop_sale") {
        return Boolean(data.orderId);
      }

      // Tip received trigger
      if (eventType === "tip_received") {
        const minAmount = Number(config.minAmount || 0);
        const tipAmount = Number(data.amount || 0);
        return tipAmount >= minAmount;
      }

      return true;
    }

    default:
      return true;
  }
}

// ============================================================================
// PUBLIC EVENT FIRING API
// ============================================================================

/**
 * Fire a platform event and execute any matching active workflows
 * Call this from event handlers (new follower, sale, tip, etc.)
 */
export async function fireWorkflowEvent(
  eventType: string,
  artistId: number,
  eventData: Record<string, any>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Find all active workflows for this artist that have event triggers
    const artistWorkflows = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.artistId, artistId), eq(workflows.status, "active")));

    for (const workflow of artistWorkflows) {
      // Check if this workflow has a trigger matching the event type
      const triggers = await db
        .select()
        .from(workflowTriggers)
        .where(and(
          eq(workflowTriggers.workflowId, workflow.id),
          eq(workflowTriggers.type, "event"),
          eq(workflowTriggers.isActive, true)
        ));

      for (const trigger of triggers) {
        const config = trigger.config as Record<string, any>;
        if (config.eventType === eventType) {
          const shouldFire = await evaluateTrigger(trigger, { ...eventData, eventType });
          if (shouldFire) {
            // Fire async — don't block the caller
            executeWorkflow(workflow.id, "event", { ...eventData, eventType }).catch((err) =>
              console.error(`[Workflow] Event execution failed for workflow ${workflow.id}:`, err)
            );
            // Update trigger stats
            await db
              .update(workflowTriggers)
              .set({ triggerCount: trigger.triggerCount + 1, lastTriggeredAt: new Date() })
              .where(eq(workflowTriggers.id, trigger.id));
          }
        }
      }
    }
  } catch (err) {
    console.error("[Workflow] fireWorkflowEvent error:", err);
  }
}
