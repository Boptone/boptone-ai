import { eq, desc, and } from "drizzle-orm";
import { getDb } from "./db";
import {
  workflows,
  workflowExecutions,
  workflowExecutionLogs,
  workflowTriggers,
  workflowTemplates,
  workflowHistory,
  type Workflow,
  type InsertWorkflow,
  type WorkflowExecution,
  type InsertWorkflowExecution,
  type InsertWorkflowExecutionLog,
  type WorkflowTemplate,
  type InsertWorkflowTemplate,
} from "../drizzle/schema";

// ============================================================================
// WORKFLOWS
// ============================================================================

export async function createWorkflow(data: InsertWorkflow) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(workflows).values(data);
  return result[0].insertId;
}

export async function getWorkflowsByArtist(artistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.artistId, artistId))
    .orderBy(desc(workflows.updatedAt));
}

export async function getWorkflowById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, id))
    .limit(1);
  
  return workflow;
}

export async function updateWorkflow(id: number, data: Partial<InsertWorkflow>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(workflows).set(data).where(eq(workflows.id, id));
}

export async function deleteWorkflow(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(workflows).where(eq(workflows.id, id));
}

export async function updateWorkflowStats(
  id: number,
  stats: { totalRuns?: number; successfulRuns?: number; failedRuns?: number; lastRunAt?: Date }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(workflows).set(stats).where(eq(workflows.id, id));
}

// ============================================================================
// WORKFLOW EXECUTIONS
// ============================================================================

export async function createWorkflowExecution(data: InsertWorkflowExecution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(workflowExecutions).values(data);
  return result[0].insertId;
}

export async function getWorkflowExecutions(workflowId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(workflowExecutions)
    .where(eq(workflowExecutions.workflowId, workflowId))
    .orderBy(desc(workflowExecutions.createdAt))
    .limit(limit);
}

export async function getWorkflowExecutionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const [execution] = await db
    .select()
    .from(workflowExecutions)
    .where(eq(workflowExecutions.id, id))
    .limit(1);
  
  return execution;
}

export async function updateWorkflowExecution(id: number, data: Partial<InsertWorkflowExecution>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(workflowExecutions).set(data).where(eq(workflowExecutions.id, id));
}

// ============================================================================
// WORKFLOW EXECUTION LOGS
// ============================================================================

export async function createWorkflowExecutionLog(data: InsertWorkflowExecutionLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(workflowExecutionLogs).values(data);
}

export async function getWorkflowExecutionLogs(executionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(workflowExecutionLogs)
    .where(eq(workflowExecutionLogs.executionId, executionId))
    .orderBy(workflowExecutionLogs.executedAt);
}

// ============================================================================
// WORKFLOW TEMPLATES
// ============================================================================

export async function getAllWorkflowTemplates() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(workflowTemplates)
    .orderBy(desc(workflowTemplates.usageCount));
}

export async function getWorkflowTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const [template] = await db
    .select()
    .from(workflowTemplates)
    .where(eq(workflowTemplates.id, id))
    .limit(1);
  
  return template;
}

export async function createWorkflowFromTemplate(templateId: number, artistId: number, name?: string) {
  const template = await getWorkflowTemplateById(templateId);
  if (!template) throw new Error("Template not found");
  
  // Increment template usage count
  const db = await getDb();
  if (db) {
    await db
      .update(workflowTemplates)
      .set({ usageCount: template.usageCount + 1 })
      .where(eq(workflowTemplates.id, templateId));
  }
  
  // Create workflow from template
  const workflowId = await createWorkflow({
    artistId,
    name: name || template.name,
    description: template.description,
    status: "draft",
    definition: template.definition,
    category: template.category,
    tags: template.tags,
    isTemplate: false,
    templateSourceId: templateId,
  });
  
  return workflowId;
}

export async function createWorkflowTemplate(data: InsertWorkflowTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(workflowTemplates).values(data);
  return result[0].insertId;
}

// ============================================================================
// WORKFLOW TRIGGERS
// ============================================================================

export async function createWorkflowTrigger(data: {
  workflowId: number;
  type: "webhook" | "schedule" | "event" | "manual";
  config: any;
  isActive: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(workflowTriggers).values(data);
  return result[0].insertId;
}

export async function getWorkflowTriggers(workflowId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(workflowTriggers)
    .where(eq(workflowTriggers.workflowId, workflowId))
    .orderBy(desc(workflowTriggers.createdAt));
}

export async function updateWorkflowTrigger(
  id: number,
  data: {
    config?: any;
    isActive?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(workflowTriggers).set(data).where(eq(workflowTriggers.id, id));
}

export async function deleteWorkflowTrigger(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(workflowTriggers).where(eq(workflowTriggers.id, id));
}
