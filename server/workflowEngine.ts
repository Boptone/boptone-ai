import { getDb } from "./db";
import { 
  workflows, 
  workflowExecutions, 
  workflowExecutionLogs,
  workflowTriggers 
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

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
    case "send_email":
      // TODO: Implement email sending via Resend
      console.log("[Workflow] Send email:", data.to, data.subject);
      return { sent: true, to: data.to };

    case "post_instagram":
      // TODO: Implement Instagram posting
      console.log("[Workflow] Post to Instagram:", data.caption);
      return { posted: true, platform: "instagram" };

    case "post_twitter":
      // TODO: Implement Twitter posting
      console.log("[Workflow] Post to Twitter:", data.text);
      return { posted: true, platform: "twitter" };

    case "send_sms":
      // TODO: Implement SMS via Twilio
      console.log("[Workflow] Send SMS:", data.to, data.message);
      return { sent: true, to: data.to };

    case "update_database":
      // TODO: Implement database updates
      console.log("[Workflow] Update database:", data.table, data.values);
      return { updated: true };

    case "call_webhook":
      // TODO: Implement webhook calls
      console.log("[Workflow] Call webhook:", data.url);
      return { called: true, url: data.url };

    case "generate_ai_content":
      // TODO: Implement AI content generation
      console.log("[Workflow] Generate AI content:", data.prompt);
      return { generated: true, content: "AI-generated content placeholder" };

    default:
      throw new Error(`Unknown action subtype: ${subtype}`);
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
    case "if_else":
      // TODO: Implement if/else logic
      const condition = evaluateCondition(data.condition, inputData);
      return { branch: condition ? "true" : "false", condition };

    case "filter":
      // TODO: Implement array filtering
      return { filtered: true };

    case "switch":
      // TODO: Implement switch logic
      return { branch: "default" };

    default:
      throw new Error(`Unknown condition subtype: ${subtype}`);
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
    case "map":
      // TODO: Implement array mapping
      return { mapped: true };

    case "aggregate":
      // TODO: Implement aggregation
      return { aggregated: true };

    case "format":
      // TODO: Implement formatting
      return { formatted: true };

    default:
      throw new Error(`Unknown data transform subtype: ${subtype}`);
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
 * Evaluate a condition expression
 */
function evaluateCondition(
  condition: any,
  data: Record<string, any>
): boolean {
  // TODO: Implement proper condition evaluation
  // For now, just return true
  return true;
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
 * Evaluate if a trigger should fire
 */
async function evaluateTrigger(
  trigger: any,
  eventData?: Record<string, any>
): Promise<boolean> {
  // TODO: Implement proper trigger evaluation based on config
  // For now, always return true for testing
  return true;
}
