import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { requireProTier, hasProAccess } from "../tierGuard";
import {
  createWorkflow,
  getWorkflowsByArtist,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  createWorkflowExecution,
  getWorkflowExecutions,
  getWorkflowExecutionById,
  getWorkflowExecutionLogs,
  getAllWorkflowTemplates,
  getWorkflowTemplateById,
  createWorkflowFromTemplate,
  createWorkflowTrigger,
  getWorkflowTriggers,
  updateWorkflowTrigger,
  deleteWorkflowTrigger,
} from "../workflowDb";
import { executeWorkflow } from "../workflowEngine";
import { generateWorkflowFromText, refineWorkflow } from "../aiWorkflowGenerator";

// Workflow definition schema
const workflowDefinitionSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["trigger", "action", "condition", "data"]),
      subtype: z.string(),
      position: z.object({ x: z.number(), y: z.number() }),
      data: z.record(z.string(), z.any()),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      sourceHandle: z.string().optional(),
      targetHandle: z.string().optional(),
    })
  ),
  settings: z.record(z.string(), z.any()).optional(),
});

export const workflowsRouter = router({
  // ============================================================================
  // AI WORKFLOW GENERATION
  // ============================================================================

  // Returns whether the current user has PRO/Enterprise access (used by frontend)
  tierStatus: protectedProcedure.query(async ({ ctx }) => {
    const isPro = await hasProAccess(ctx.user.id, ctx.user.role);
    return { isPro, tier: isPro ? "pro" : "free" };
  }),

  generateFromText: protectedProcedure
    .input(z.object({ description: z.string().min(10).max(500), workflowId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      await requireProTier(ctx.user.id, ctx.user.role);
      const workflow = await generateWorkflowFromText(input.description);
      return workflow;
    }),

  refineWorkflow: protectedProcedure
    .input(
      z.object({
        currentWorkflow: workflowDefinitionSchema,
        refinementRequest: z.string().min(5).max(200),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireProTier(ctx.user.id, ctx.user.role);
      const refined = await refineWorkflow(
        input.currentWorkflow,
        input.refinementRequest
      );
      return refined;
    }),

  saveGeneratedWorkflow: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        category: z.enum([
          "fan_engagement",
          "release_automation",
          "revenue_tracking",
          "marketing",
          "collaboration",
          "custom",
        ]),
        definition: workflowDefinitionSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireProTier(ctx.user.id, ctx.user.role);
      const workflow = await createWorkflow({
        artistId: ctx.user.id,
        name: input.name,
        description: input.description,
        category: input.category,
        definition: input.definition,
        status: "draft",
      });
      return workflow;
    }),

  // ============================================================================
  // WORKFLOW CRUD
  // ============================================================================

  list: protectedProcedure.query(async ({ ctx }) => {
    // Get artist profile ID from user
    // For now, use user ID as artist ID (will need to join with artistProfiles table)
    return getWorkflowsByArtist(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getWorkflowById(input.id);
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.enum([
          "fan_engagement",
          "release_automation",
          "revenue_tracking",
          "marketing",
          "collaboration",
          "custom",
        ]),
        definition: workflowDefinitionSchema,
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireProTier(ctx.user.id, ctx.user.role);
      const workflowId = await createWorkflow({
        artistId: ctx.user.id,
        name: input.name,
        description: input.description,
        category: input.category,
        definition: input.definition,
        tags: input.tags,
        status: "draft",
      });

      return { id: workflowId };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        status: z.enum(["active", "paused", "draft"]).optional(),
        definition: workflowDefinitionSchema.optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateWorkflow(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteWorkflow(input.id);
      return { success: true };
    }),

  // ============================================================================
  // WORKFLOW EXECUTION
  // ============================================================================

  execute: protectedProcedure
    .input(
      z.object({
        workflowId: z.number(),
        triggerData: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireProTier(ctx.user.id, ctx.user.role);
      const workflow = await getWorkflowById(input.workflowId);
      if (!workflow) {
        throw new Error("Workflow not found");
      }

      // Create execution record
      const executionId = await createWorkflowExecution({
        workflowId: input.workflowId,
        status: "pending",
        triggeredBy: "manual",
        triggerData: input.triggerData,
      });

      // Execute workflow
      try {
        const result = await executeWorkflow(
          input.workflowId,
          "manual",
          input.triggerData || {}
        );
        return { executionId: result.executionId, success: result.success };
      } catch (error) {
        return {
          executionId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  getExecutions: protectedProcedure
    .input(
      z.object({
        workflowId: z.number(),
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      return getWorkflowExecutions(input.workflowId, input.limit);
    }),

  getExecutionDetails: protectedProcedure
    .input(z.object({ executionId: z.number() }))
    .query(async ({ input }) => {
      const execution = await getWorkflowExecutionById(input.executionId);
      const logs = await getWorkflowExecutionLogs(input.executionId);

      return {
        execution,
        logs,
      };
    }),

  // ============================================================================
  // WORKFLOW TEMPLATES
  // ============================================================================

  listTemplates: protectedProcedure.query(async () => {
    return getAllWorkflowTemplates();
  }),

  getTemplateById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getWorkflowTemplateById(input.id);
    }),

  createFromTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        name: z.string().min(1).max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireProTier(ctx.user.id, ctx.user.role);
      const workflowId = await createWorkflowFromTemplate(
        input.templateId,
        ctx.user.id,
        input.name
      );

      return { id: workflowId };
    }),

  // ============================================================================
  // WORKFLOW TRIGGERS
  // ============================================================================

  createTrigger: protectedProcedure
    .input(
      z.object({
        workflowId: z.number(),
        type: z.enum(["webhook", "schedule", "event", "manual"]),
        config: z.object({
          eventType: z.string().optional(), // e.g., "stream_milestone", "new_follower", "sale"
          threshold: z.number().optional(), // e.g., 1000 streams
          comparison: z.enum(["equals", "greater_than", "less_than", "greater_or_equal", "less_or_equal"]).optional(),
          schedule: z.string().optional(), // cron expression for scheduled triggers
          webhookUrl: z.string().url().optional(),
          metadata: z.record(z.string(), z.any()).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireProTier(ctx.user.id, ctx.user.role);
      const triggerId = await createWorkflowTrigger({
        workflowId: input.workflowId,
        type: input.type,
        config: input.config,
        isActive: true,
      });

      return { id: triggerId };
    }),

  getTriggers: protectedProcedure
    .input(z.object({ workflowId: z.number() }))
    .query(async ({ input }) => {
      return getWorkflowTriggers(input.workflowId);
    }),

  updateTrigger: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        config: z.object({
          eventType: z.string().optional(),
          threshold: z.number().optional(),
          comparison: z.enum(["equals", "greater_than", "less_than", "greater_or_equal", "less_or_equal"]).optional(),
          schedule: z.string().optional(),
          webhookUrl: z.string().url().optional(),
          metadata: z.record(z.string(), z.any()).optional(),
        }).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateWorkflowTrigger(id, data);
      return { success: true };
    }),

  deleteTrigger: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteWorkflowTrigger(input.id);
      return { success: true };
    }),
});
