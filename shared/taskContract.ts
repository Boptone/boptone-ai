/**
 * Ironclad Task Contract System
 * 
 * This system enforces shared state assumptions between agents to prevent silent divergence.
 * Every agent handoff MUST include a valid TaskContract that defines:
 * - What we're trying to achieve (goal)
 * - What "done" looks like (acceptedOutputs)
 * - What could go wrong (knownRisks)
 * - What to do next (nextAction)
 * 
 * Agents cannot accept a task without a valid contract.
 * All handoffs are auditable and type-safe.
 */

/**
 * Status of a task contract
 */
export enum ContractStatus {
  PENDING = "pending",       // Contract created, waiting for agent to accept
  ACCEPTED = "accepted",     // Agent accepted and is working on it
  COMPLETED = "completed",   // Task completed successfully
  FAILED = "failed",         // Task failed (see failureReason)
  REJECTED = "rejected",     // Agent rejected the contract (see rejectionReason)
}

/**
 * Priority level for task execution
 */
export enum TaskPriority {
  CRITICAL = "critical",     // Must be done immediately
  HIGH = "high",             // Important, do soon
  MEDIUM = "medium",         // Normal priority
  LOW = "low",               // Can be deferred
}

/**
 * Output format specification
 */
export interface OutputSpec {
  /** Name of the output field (e.g., "track_id", "pdf_url") */
  name: string;
  
  /** Expected data type */
  type: "string" | "number" | "boolean" | "object" | "array" | "url" | "file";
  
  /** Human-readable description */
  description: string;
  
  /** Whether this output is required */
  required: boolean;
  
  /** Validation pattern (regex for strings, range for numbers, etc.) */
  validation?: string;
  
  /** Example value */
  example?: any;
}

/**
 * Known risk specification
 */
export interface RiskSpec {
  /** Risk identifier */
  id: string;
  
  /** Human-readable description of the risk */
  description: string;
  
  /** Probability (0-1) */
  probability: number;
  
  /** Impact if it occurs (0-1) */
  impact: number;
  
  /** Mitigation strategy */
  mitigation?: string;
}

/**
 * Constraint specification
 */
export interface ConstraintSpec {
  /** Constraint name (e.g., "max_budget", "deadline") */
  name: string;
  
  /** Constraint value */
  value: any;
  
  /** Whether this is a hard constraint (must be met) or soft (nice to have) */
  hard: boolean;
  
  /** Human-readable description */
  description: string;
}

/**
 * Core TaskContract schema
 * 
 * This is the minimal contract that MUST be passed between agents.
 * All fields are required except where explicitly marked optional.
 */
export interface TaskContract {
  /** Unique contract ID */
  id: string;
  
  /** What we're trying to achieve (clear, measurable goal) */
  goal: string;
  
  /** What "done" looks like (structured output specifications) */
  acceptedOutputs: OutputSpec[];
  
  /** What could go wrong (known risks with probabilities) */
  knownRisks: RiskSpec[];
  
  /** Immediate next action the receiving agent should take */
  nextAction: string;
  
  /** Hard and soft constraints (budget, time, scope, etc.) */
  constraints: ConstraintSpec[];
  
  /** Priority level */
  priority: TaskPriority;
  
  /** Current status */
  status: ContractStatus;
  
  /** Agent ID that created this contract */
  createdBy: string;
  
  /** Agent ID that accepted this contract (if any) */
  acceptedBy?: string;
  
  /** When the contract was created */
  createdAt: Date;
  
  /** When the contract was accepted (if any) */
  acceptedAt?: Date;
  
  /** When the contract was completed/failed (if any) */
  completedAt?: Date;
  
  /** Actual outputs produced (if completed) */
  actualOutputs?: Record<string, any>;
  
  /** Failure reason (if failed) */
  failureReason?: string;
  
  /** Rejection reason (if rejected) */
  rejectionReason?: string;
  
  /** Key-value context (NOT full history, just essential state) */
  context?: Record<string, string>;
  
  /** Parent contract ID (if this is a sub-task) */
  parentContractId?: string;
  
  /** Child contract IDs (if this task spawned sub-tasks) */
  childContractIds?: string[];
}

/**
 * Contract validation result
 */
export interface ValidationResult {
  /** Whether the contract is valid */
  valid: boolean;
  
  /** Validation errors (if any) */
  errors: string[];
  
  /** Validation warnings (non-blocking issues) */
  warnings: string[];
}

/**
 * Contract handoff request
 */
export interface HandoffRequest {
  /** The contract being handed off */
  contract: TaskContract;
  
  /** Agent ID receiving the handoff */
  toAgentId: string;
  
  /** Optional message to the receiving agent */
  message?: string;
}

/**
 * Contract handoff response
 */
export interface HandoffResponse {
  /** Whether the agent accepted the contract */
  accepted: boolean;
  
  /** Reason for rejection (if not accepted) */
  rejectionReason?: string;
  
  /** Estimated completion time (if accepted) */
  estimatedCompletionTime?: Date;
}
