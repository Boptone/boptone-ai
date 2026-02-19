/**
 * Contract Handoff System
 * 
 * Enforces ironclad handoff rules between agents.
 * No agent can accept a task without validating the contract first.
 * All handoffs are auditable and logged.
 */

import type {
  TaskContract,
  HandoffRequest,
  HandoffResponse,
  ContractStatus,
} from "../shared/taskContract";
import { ContractValidator } from "./contractValidator";

/**
 * Agent interface
 * 
 * All agents MUST implement this interface to participate in the contract system.
 */
export interface Agent {
  /** Unique agent identifier */
  id: string;
  
  /** Human-readable agent name */
  name: string;
  
  /** Agent capabilities (what types of tasks it can handle) */
  capabilities: string[];
  
  /**
   * Check if this agent can handle a given contract
   * 
   * Agent should return true only if it has the capabilities
   * and resources to complete the task.
   */
  canHandle(contract: TaskContract): Promise<boolean>;
  
  /**
   * Execute a contract
   * 
   * This is called after the agent accepts a contract.
   * Agent should update the contract status and outputs as it progresses.
   */
  execute(contract: TaskContract): Promise<TaskContract>;
}

/**
 * Handoff result with audit trail
 */
export interface HandoffResult {
  /** Whether the handoff succeeded */
  success: boolean;
  
  /** Updated contract (if handoff succeeded) */
  contract?: TaskContract;
  
  /** Error message (if handoff failed) */
  error?: string;
  
  /** Audit log entry */
  auditLog: AuditLogEntry;
}

/**
 * Audit log entry for handoff tracking
 */
export interface AuditLogEntry {
  /** Unique log entry ID */
  id: string;
  
  /** Contract ID */
  contractId: string;
  
  /** Timestamp */
  timestamp: Date;
  
  /** From agent ID */
  fromAgentId: string;
  
  /** To agent ID */
  toAgentId: string;
  
  /** Action (e.g., "handoff_requested", "handoff_accepted", "handoff_rejected") */
  action: string;
  
  /** Validation result */
  validationResult?: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * ContractHandoffSystem
 * 
 * Manages all contract handoffs between agents.
 * Enforces validation, logging, and state transitions.
 */
export class ContractHandoffSystem {
  private agents: Map<string, Agent> = new Map();
  private auditLog: AuditLogEntry[] = [];

  /**
   * Register an agent with the system
   */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Get a registered agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Request a handoff from one agent to another
   * 
   * This enforces the ironclad contract validation before handoff.
   */
  async requestHandoff(request: HandoffRequest): Promise<HandoffResult> {
    const { contract, toAgentId, message } = request;

    // Step 1: Validate the contract
    const validationResult = ContractValidator.validate(contract);
    
    if (!validationResult.valid) {
      const auditEntry = this.createAuditEntry({
        contractId: contract.id,
        fromAgentId: contract.createdBy,
        toAgentId,
        action: "handoff_rejected_invalid_contract",
        validationResult,
      });
      
      this.auditLog.push(auditEntry);
      
      return {
        success: false,
        error: `Contract validation failed: ${validationResult.errors.join(", ")}`,
        auditLog: auditEntry,
      };
    }

    // Step 2: Check if target agent exists
    const targetAgent = this.getAgent(toAgentId);
    if (!targetAgent) {
      const auditEntry = this.createAuditEntry({
        contractId: contract.id,
        fromAgentId: contract.createdBy,
        toAgentId,
        action: "handoff_rejected_agent_not_found",
        validationResult,
      });
      
      this.auditLog.push(auditEntry);
      
      return {
        success: false,
        error: `Agent '${toAgentId}' not found`,
        auditLog: auditEntry,
      };
    }

    // Step 3: Check if target agent can handle this contract
    const canHandle = await targetAgent.canHandle(contract);
    if (!canHandle) {
      const auditEntry = this.createAuditEntry({
        contractId: contract.id,
        fromAgentId: contract.createdBy,
        toAgentId,
        action: "handoff_rejected_cannot_handle",
        validationResult,
        metadata: {
          agentCapabilities: targetAgent.capabilities,
          message,
        },
      });
      
      this.auditLog.push(auditEntry);
      
      return {
        success: false,
        error: `Agent '${targetAgent.name}' cannot handle this contract`,
        auditLog: auditEntry,
      };
    }

    // Step 4: Update contract status to accepted
    const updatedContract: TaskContract = {
      ...contract,
      status: "accepted" as ContractStatus,
      acceptedBy: toAgentId,
      acceptedAt: new Date(),
    };

    // Step 5: Log successful handoff
    const auditEntry = this.createAuditEntry({
      contractId: contract.id,
      fromAgentId: contract.createdBy,
      toAgentId,
      action: "handoff_accepted",
      validationResult,
      metadata: {
        message,
      },
    });
    
    this.auditLog.push(auditEntry);

    return {
      success: true,
      contract: updatedContract,
      auditLog: auditEntry,
    };
  }

  /**
   * Complete a contract
   * 
   * Validates that actualOutputs match the acceptedOutputs schema.
   */
  async completeContract(
    contract: TaskContract,
    actualOutputs: Record<string, any>
  ): Promise<HandoffResult> {
    // Step 1: Validate that actualOutputs match schema
    const outputValidation = ContractValidator.validateActualOutputs(
      contract,
      actualOutputs
    );

    if (!outputValidation.valid) {
      const auditEntry = this.createAuditEntry({
        contractId: contract.id,
        fromAgentId: contract.acceptedBy || contract.createdBy,
        toAgentId: contract.acceptedBy || contract.createdBy,
        action: "completion_rejected_invalid_outputs",
        validationResult: outputValidation,
      });
      
      this.auditLog.push(auditEntry);
      
      return {
        success: false,
        error: `Output validation failed: ${outputValidation.errors.join(", ")}`,
        auditLog: auditEntry,
      };
    }

    // Step 2: Update contract status to completed
    const updatedContract: TaskContract = {
      ...contract,
      status: "completed" as ContractStatus,
      actualOutputs,
      completedAt: new Date(),
    };

    // Step 3: Log completion
    const auditEntry = this.createAuditEntry({
      contractId: contract.id,
      fromAgentId: contract.acceptedBy || contract.createdBy,
      toAgentId: contract.acceptedBy || contract.createdBy,
      action: "contract_completed",
      validationResult: outputValidation,
    });
    
    this.auditLog.push(auditEntry);

    return {
      success: true,
      contract: updatedContract,
      auditLog: auditEntry,
    };
  }

  /**
   * Fail a contract
   * 
   * Records the failure reason and updates status.
   */
  async failContract(
    contract: TaskContract,
    failureReason: string
  ): Promise<HandoffResult> {
    const updatedContract: TaskContract = {
      ...contract,
      status: "failed" as ContractStatus,
      failureReason,
      completedAt: new Date(),
    };

    const auditEntry = this.createAuditEntry({
      contractId: contract.id,
      fromAgentId: contract.acceptedBy || contract.createdBy,
      toAgentId: contract.acceptedBy || contract.createdBy,
      action: "contract_failed",
      metadata: {
        failureReason,
      },
    });
    
    this.auditLog.push(auditEntry);

    return {
      success: true,
      contract: updatedContract,
      auditLog: auditEntry,
    };
  }

  /**
   * Get audit log for a specific contract
   */
  getAuditLog(contractId: string): AuditLogEntry[] {
    return this.auditLog.filter((entry) => entry.contractId === contractId);
  }

  /**
   * Get all audit logs
   */
  getAllAuditLogs(): AuditLogEntry[] {
    return [...this.auditLog];
  }

  /**
   * Create an audit log entry
   */
  private createAuditEntry(params: {
    contractId: string;
    fromAgentId: string;
    toAgentId: string;
    action: string;
    validationResult?: {
      valid: boolean;
      errors: string[];
      warnings: string[];
    };
    metadata?: Record<string, any>;
  }): AuditLogEntry {
    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      contractId: params.contractId,
      timestamp: new Date(),
      fromAgentId: params.fromAgentId,
      toAgentId: params.toAgentId,
      action: params.action,
      validationResult: params.validationResult,
      metadata: params.metadata,
    };
  }
}

/**
 * Global contract handoff system instance
 */
export const contractHandoffSystem = new ContractHandoffSystem();
