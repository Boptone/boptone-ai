import { getDb } from "./db";
import { workflows, workflowExecutions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Workflow Execution Engine
 * 
 * Handles trigger detection and action execution for artist workflows.
 * This is the core automation system that makes Boptone workflows "just work".
 */

export interface TriggerConfig {
  type: string;
  config: Record<string, any>;
}

export interface Action {
  type: string;
  config: Record<string, any>;
}

export interface WorkflowDefinition {
  id: number;
  userId: number;
  name: string;
  triggerType: string;
  triggerConfig: TriggerConfig;
  actions: Action[];
}

/**
 * Execute a workflow with given trigger data
 */
export async function executeWorkflow(
  workflowId: number,
  triggerData: Record<string, any>
): Promise<{ success: boolean; executionId: number; errors?: string[] }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Create execution record
  const [execution] = await db.insert(workflowExecutions).values({
    workflowId,
    status: "running",
    triggerData,
    executionLog: [],
  });

  const executionId = execution.insertId;
  const errors: string[] = [];
  const log: any[] = [];

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

    const actions = workflow.actions as Action[];

    // Execute each action sequentially
    for (const action of actions) {
      try {
        log.push({
          timestamp: new Date().toISOString(),
          action: action.type,
          status: "started",
        });

        await executeAction(action, triggerData, workflow.userId);

        log.push({
          timestamp: new Date().toISOString(),
          action: action.type,
          status: "completed",
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Action ${action.type} failed: ${errorMessage}`);
        log.push({
          timestamp: new Date().toISOString(),
          action: action.type,
          status: "failed",
          error: errorMessage,
        });
      }
    }

    // Update execution record
    await db
      .update(workflowExecutions)
      .set({
        status: errors.length > 0 ? "failed" : "success",
        executionLog: log,
        completedAt: new Date(),
      })
      .where(eq(workflowExecutions.id, executionId));

    return {
      success: errors.length === 0,
      executionId,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Workflow execution failed: ${errorMessage}`);

    // Update execution record with failure
    await db
      .update(workflowExecutions)
      .set({
        status: "failed",
        executionLog: log,
        completedAt: new Date(),
      })
      .where(eq(workflowExecutions.id, executionId));

    return {
      success: false,
      executionId,
      errors,
    };
  }
}

/**
 * Execute a single action
 */
async function executeAction(
  action: Action,
  triggerData: Record<string, any>,
  userId: number
): Promise<void> {
  switch (action.type) {
    case "send_email":
      await sendEmailAction(action.config, triggerData, userId);
      break;

    case "post_to_instagram":
      await postToInstagramAction(action.config, triggerData, userId);
      break;

    case "post_to_twitter":
      await postToTwitterAction(action.config, triggerData, userId);
      break;

    case "notify_artist":
      await notifyArtistAction(action.config, triggerData, userId);
      break;

    case "ai_generate_social_post":
      await aiGenerateSocialPostAction(action.config, triggerData, userId);
      break;

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

/**
 * Action: Send Email
 */
async function sendEmailAction(
  config: Record<string, any>,
  triggerData: Record<string, any>,
  userId: number
): Promise<void> {
  // TODO: Implement email sending via SendGrid/AWS SES
  // For now, just log the action
  console.log("[Workflow] Send Email:", {
    to: config.to,
    subject: interpolate(config.subject, triggerData),
    body: interpolate(config.body, triggerData),
  });
}

/**
 * Action: Post to Instagram
 */
async function postToInstagramAction(
  config: Record<string, any>,
  triggerData: Record<string, any>,
  userId: number
): Promise<void> {
  // TODO: Implement Instagram API integration
  // For now, just log the action
  console.log("[Workflow] Post to Instagram:", {
    caption: interpolate(config.caption, triggerData),
    image: config.image,
  });
}

/**
 * Action: Post to Twitter
 */
async function postToTwitterAction(
  config: Record<string, any>,
  triggerData: Record<string, any>,
  userId: number
): Promise<void> {
  // TODO: Implement Twitter API integration
  // For now, just log the action
  console.log("[Workflow] Post to Twitter:", {
    text: interpolate(config.text, triggerData),
  });
}

/**
 * Action: Notify Artist
 */
async function notifyArtistAction(
  config: Record<string, any>,
  triggerData: Record<string, any>,
  userId: number
): Promise<void> {
  // TODO: Implement in-app notification system
  // For now, just log the action
  console.log("[Workflow] Notify Artist:", {
    title: interpolate(config.title, triggerData),
    message: interpolate(config.message, triggerData),
  });
}

/**
 * Action: AI Generate Social Post
 */
async function aiGenerateSocialPostAction(
  config: Record<string, any>,
  triggerData: Record<string, any>,
  userId: number
): Promise<void> {
  // TODO: Implement AI-powered social post generation using LLM
  // For now, just log the action
  console.log("[Workflow] AI Generate Social Post:", {
    platform: config.platform,
    template: interpolate(config.template, triggerData),
  });
}

/**
 * Interpolate template variables with trigger data
 * Example: "You hit {{streams}} streams!" + {streams: 1000} → "You hit 1000 streams!"
 */
function interpolate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
}

/**
 * Check if a workflow should be triggered based on an event
 */
export async function checkTriggers(
  triggerType: string,
  eventData: Record<string, any>
): Promise<void> {
  const db = await getDb();
  if (!db) {
    return;
  }

  // Find all active workflows with this trigger type
  const matchingWorkflows = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.triggerType, triggerType), eq(workflows.isActive, true)));

  // Execute each matching workflow
  for (const workflow of matchingWorkflows) {
    const triggerConfig = workflow.triggerConfig as TriggerConfig;

    // Check if trigger conditions are met
    if (shouldTrigger(triggerConfig, eventData)) {
      // Execute workflow asynchronously (don't block)
      executeWorkflow(workflow.id, eventData).catch((error) => {
        console.error(`[Workflow] Failed to execute workflow ${workflow.id}:`, error);
      });
    }
  }
}

/**
 * Determine if a trigger should fire based on config and event data
 */
function shouldTrigger(triggerConfig: TriggerConfig, eventData: Record<string, any>): boolean {
  const config = triggerConfig.config || triggerConfig;

  switch (triggerConfig.type || config.type) {
    case "bap_milestone":
      // Example: trigger when total_streams >= 1000
      return (
        eventData.metric === config.metric &&
        eventData.value >= config.threshold &&
        (config.song_id === null || eventData.song_id === config.song_id)
      );

    case "bopshop_sale":
      // Trigger on any BopShop sale
      return true;

    case "schedule":
      // Schedule triggers are handled by cron jobs, not event-based
      return false;

    default:
      return false;
  }
}
