/**
 * Task Contract tRPC Router
 * 
 * Provides CRUD operations and handoff management for task contracts.
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { taskContracts, contractAuditLog } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import type {
  TaskContract as TaskContractType,
  OutputSpec,
  RiskSpec,
  ConstraintSpec,
  ContractStatus,
  TaskPriority,
} from "../../shared/taskContract";
import { ContractValidator } from "../contractValidator";
import { contractHandoffSystem } from "../contractHandoff";

// Zod schemas for validation
const OutputSpecSchema = z.object({
  name: z.string(),
  type: z.enum(["string", "number", "boolean", "object", "array", "url", "file"]),
  description: z.string(),
  required: z.boolean(),
  validation: z.string().optional(),
  example: z.any().optional(),
});

const RiskSpecSchema = z.object({
  id: z.string(),
  description: z.string(),
  probability: z.number().min(0).max(1),
  impact: z.number().min(0).max(1),
  mitigation: z.string().optional(),
});

const ConstraintSpecSchema = z.object({
  name: z.string(),
  value: z.any(),
  hard: z.boolean(),
  description: z.string(),
});

const TaskContractInputSchema = z.object({
  id: z.string(),
  goal: z.string().min(10).max(500),
  acceptedOutputs: z.array(OutputSpecSchema).min(1),
  knownRisks: z.array(RiskSpecSchema),
  nextAction: z.string().min(5),
  constraints: z.array(ConstraintSpecSchema),
  priority: z.enum(["critical", "high", "medium", "low"]),
  status: z.enum(["pending", "accepted", "completed", "failed", "rejected"]),
  createdBy: z.string(),
  acceptedBy: z.string().optional(),
  context: z.record(z.string(), z.string()).optional(),
  parentContractId: z.string().optional(),
});

export const taskContractRouter = router({
  /**
   * Create a new task contract
   */
  create: protectedProcedure
    .input(TaskContractInputSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Validate contract before creating
      const taskContract: TaskContractType = {
        ...input,
        priority: input.priority as any,
        status: input.status as any,
        createdAt: new Date(),
        acceptedAt: undefined,
        completedAt: undefined,
        actualOutputs: undefined,
        failureReason: undefined,
        rejectionReason: undefined,
        childContractIds: undefined,
      };

      const validationResult = ContractValidator.validate(taskContract);
      if (!validationResult.valid) {
        throw new Error(`Contract validation failed: ${validationResult.errors.join(", ")}`);
      }

      // Insert into database
      await db.insert(taskContracts).values({
        id: input.id,
        goal: input.goal,
        acceptedOutputs: JSON.stringify(input.acceptedOutputs),
        knownRisks: JSON.stringify(input.knownRisks),
        nextAction: input.nextAction,
        constraints: JSON.stringify(input.constraints),
        priority: input.priority,
        status: input.status,
        createdBy: input.createdBy,
        acceptedBy: input.acceptedBy,
        context: input.context ? JSON.stringify(input.context as Record<string, string>) : null,
        parentContractId: input.parentContractId,
      });

      return {
        success: true,
        contract: taskContract,
        validation: validationResult,
      };
    }),

  /**
   * Get a contract by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(taskContracts)
        .where(eq(taskContracts.id, input.id))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const row = result[0];
      const contract: TaskContractType = {
        id: row.id,
        goal: row.goal,
        acceptedOutputs: JSON.parse(row.acceptedOutputs) as OutputSpec[],
        knownRisks: JSON.parse(row.knownRisks) as RiskSpec[],
        nextAction: row.nextAction,
        constraints: JSON.parse(row.constraints) as ConstraintSpec[],
        priority: row.priority as TaskPriority,
        status: row.status as ContractStatus,
        createdBy: row.createdBy,
        acceptedBy: row.acceptedBy || undefined,
        createdAt: row.createdAt,
        acceptedAt: row.acceptedAt || undefined,
        completedAt: row.completedAt || undefined,
        actualOutputs: row.actualOutputs ? JSON.parse(row.actualOutputs) : undefined,
        failureReason: row.failureReason || undefined,
        rejectionReason: row.rejectionReason || undefined,
        context: row.context ? JSON.parse(row.context) : undefined,
        parentContractId: row.parentContractId || undefined,
        childContractIds: row.childContractIds ? JSON.parse(row.childContractIds) : undefined,
      };

      return contract;
    }),

  /**
   * List contracts with filters
   */
  list: publicProcedure
    .input(
      z.object({
        status: z.enum(["pending", "accepted", "completed", "failed", "rejected"]).optional(),
        createdBy: z.string().optional(),
        acceptedBy: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(taskContracts);

      if (input.status) {
        query = query.where(eq(taskContracts.status, input.status)) as any;
      }
      if (input.createdBy) {
        query = query.where(eq(taskContracts.createdBy, input.createdBy)) as any;
      }
      if (input.acceptedBy) {
        query = query.where(eq(taskContracts.acceptedBy, input.acceptedBy)) as any;
      }

      const results = await query
        .orderBy(desc(taskContracts.createdAt))
        .limit(input.limit) as any;
      return results.map((row: any): TaskContractType => ({
        id: row.id,
        goal: row.goal,
        acceptedOutputs: JSON.parse(row.acceptedOutputs) as OutputSpec[],
        knownRisks: JSON.parse(row.knownRisks) as RiskSpec[],
        nextAction: row.nextAction,
        constraints: JSON.parse(row.constraints) as ConstraintSpec[],
        priority: row.priority as TaskPriority,
        status: row.status as ContractStatus,
        createdBy: row.createdBy,
        acceptedBy: row.acceptedBy || undefined,
        createdAt: row.createdAt,
        acceptedAt: row.acceptedAt || undefined,
        completedAt: row.completedAt || undefined,
        actualOutputs: row.actualOutputs ? JSON.parse(row.actualOutputs) : undefined,
        failureReason: row.failureReason || undefined,
        rejectionReason: row.rejectionReason || undefined,
        context: row.context ? JSON.parse(row.context) : undefined,
        parentContractId: row.parentContractId || undefined,
        childContractIds: row.childContractIds ? JSON.parse(row.childContractIds) : undefined,
      })) as TaskContractType[];
    }),

  /**
   * Request a handoff to another agent
   */
  requestHandoff: protectedProcedure
    .input(
      z.object({
        contractId: z.string(),
        toAgentId: z.string(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get the contract
      const result = await db
        .select()
        .from(taskContracts)
        .where(eq(taskContracts.id, input.contractId))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Contract not found");
      }

      const row = result[0];
      const contract: TaskContractType = {
        id: row.id,
        goal: row.goal,
        acceptedOutputs: JSON.parse(row.acceptedOutputs) as OutputSpec[],
        knownRisks: JSON.parse(row.knownRisks) as RiskSpec[],
        nextAction: row.nextAction,
        constraints: JSON.parse(row.constraints) as ConstraintSpec[],
        priority: row.priority as TaskPriority,
        status: row.status as ContractStatus,
        createdBy: row.createdBy,
        acceptedBy: row.acceptedBy || undefined,
        createdAt: row.createdAt,
        acceptedAt: row.acceptedAt || undefined,
        completedAt: row.completedAt || undefined,
        actualOutputs: row.actualOutputs ? JSON.parse(row.actualOutputs) : undefined,
        failureReason: row.failureReason || undefined,
        rejectionReason: row.rejectionReason || undefined,
        context: row.context ? JSON.parse(row.context) : undefined,
        parentContractId: row.parentContractId || undefined,
        childContractIds: row.childContractIds ? JSON.parse(row.childContractIds) : undefined,
      };

      // Request handoff through the system
      const handoffResult = await contractHandoffSystem.requestHandoff({
        contract,
        toAgentId: input.toAgentId,
        message: input.message,
      });

      if (!handoffResult.success) {
        throw new Error(handoffResult.error);
      }

      // Update database
      if (handoffResult.contract) {
        await db
          .update(taskContracts)
          .set({
            status: handoffResult.contract.status,
            acceptedBy: handoffResult.contract.acceptedBy,
            acceptedAt: handoffResult.contract.acceptedAt,
          })
          .where(eq(taskContracts.id, input.contractId));
      }

      // Log audit entry
      await db.insert(contractAuditLog).values({
        id: handoffResult.auditLog.id,
        contractId: handoffResult.auditLog.contractId,
        timestamp: handoffResult.auditLog.timestamp,
        fromAgentId: handoffResult.auditLog.fromAgentId,
        toAgentId: handoffResult.auditLog.toAgentId,
        action: handoffResult.auditLog.action,
        validationResult: handoffResult.auditLog.validationResult
          ? JSON.stringify(handoffResult.auditLog.validationResult)
          : null,
        metadata: handoffResult.auditLog.metadata
          ? JSON.stringify(handoffResult.auditLog.metadata)
          : null,
      });

      return handoffResult;
    }),

  /**
   * Complete a contract
   */
  complete: protectedProcedure
    .input(
      z.object({
        contractId: z.string(),
        actualOutputs: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get the contract
      const result = await db
        .select()
        .from(taskContracts)
        .where(eq(taskContracts.id, input.contractId))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Contract not found");
      }

      const row = result[0];
      const contract: TaskContractType = {
        id: row.id,
        goal: row.goal,
        acceptedOutputs: JSON.parse(row.acceptedOutputs) as OutputSpec[],
        knownRisks: JSON.parse(row.knownRisks) as RiskSpec[],
        nextAction: row.nextAction,
        constraints: JSON.parse(row.constraints) as ConstraintSpec[],
        priority: row.priority as TaskPriority,
        status: row.status as ContractStatus,
        createdBy: row.createdBy,
        acceptedBy: row.acceptedBy || undefined,
        createdAt: row.createdAt,
        acceptedAt: row.acceptedAt || undefined,
        completedAt: row.completedAt || undefined,
        actualOutputs: row.actualOutputs ? JSON.parse(row.actualOutputs) : undefined,
        failureReason: row.failureReason || undefined,
        rejectionReason: row.rejectionReason || undefined,
        context: row.context ? JSON.parse(row.context) : undefined,
        parentContractId: row.parentContractId || undefined,
        childContractIds: row.childContractIds ? JSON.parse(row.childContractIds) : undefined,
      };

      // Complete through the system
      const completionResult = await contractHandoffSystem.completeContract(
        contract,
        input.actualOutputs
      );

      if (!completionResult.success) {
        throw new Error(completionResult.error);
      }

      // Update database
      if (completionResult.contract) {
        await db
          .update(taskContracts)
          .set({
            status: completionResult.contract.status,
            actualOutputs: JSON.stringify(completionResult.contract.actualOutputs),
            completedAt: completionResult.contract.completedAt,
          })
          .where(eq(taskContracts.id, input.contractId));
      }

      // Log audit entry
      await db.insert(contractAuditLog).values({
        id: completionResult.auditLog.id,
        contractId: completionResult.auditLog.contractId,
        timestamp: completionResult.auditLog.timestamp,
        fromAgentId: completionResult.auditLog.fromAgentId,
        toAgentId: completionResult.auditLog.toAgentId,
        action: completionResult.auditLog.action,
        validationResult: completionResult.auditLog.validationResult
          ? JSON.stringify(completionResult.auditLog.validationResult)
          : null,
        metadata: completionResult.auditLog.metadata
          ? JSON.stringify(completionResult.auditLog.metadata)
          : null,
      });

      return completionResult;
    }),

  /**
   * Get audit log for a contract
   */
  getAuditLog: publicProcedure
    .input(z.object({ contractId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results = await db
        .select()
        .from(contractAuditLog)
        .where(eq(contractAuditLog.contractId, input.contractId))
        .orderBy(desc(contractAuditLog.timestamp)) as any;

      return results.map((row: any) => ({
        id: row.id,
        contractId: row.contractId,
        timestamp: row.timestamp,
        fromAgentId: row.fromAgentId,
        toAgentId: row.toAgentId,
        action: row.action,
        validationResult: row.validationResult ? JSON.parse(row.validationResult) : undefined,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      }));
    }),
});
