/**
 * ContractValidator
 * 
 * Enforces ironclad validation rules for TaskContracts.
 * No agent can accept a task without passing validation.
 */

import type {
  TaskContract,
  ValidationResult,
  OutputSpec,
  RiskSpec,
  ConstraintSpec,
} from "../shared/taskContract";

export class ContractValidator {
  /**
   * Validate a TaskContract
   * 
   * Returns validation result with errors and warnings.
   * Contract is invalid if ANY errors exist.
   */
  static validate(contract: TaskContract): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!contract.id || contract.id.trim() === "") {
      errors.push("Contract ID is required");
    }

    if (!contract.goal || contract.goal.trim() === "") {
      errors.push("Goal is required");
    } else if (contract.goal.length < 10) {
      warnings.push("Goal is very short - consider adding more detail");
    } else if (contract.goal.length > 500) {
      errors.push("Goal is too long (max 500 characters)");
    }

    if (!contract.nextAction || contract.nextAction.trim() === "") {
      errors.push("Next action is required");
    } else if (contract.nextAction.length < 5) {
      warnings.push("Next action is very short - be more specific");
    }

    if (!contract.createdBy || contract.createdBy.trim() === "") {
      errors.push("CreatedBy agent ID is required");
    }

    if (!contract.createdAt) {
      errors.push("CreatedAt timestamp is required");
    }

    // Accepted outputs validation
    if (!contract.acceptedOutputs || contract.acceptedOutputs.length === 0) {
      errors.push("At least one accepted output must be defined");
    } else {
      contract.acceptedOutputs.forEach((output, index) => {
        this.validateOutputSpec(output, index, errors, warnings);
      });
    }

    // Known risks validation
    if (!contract.knownRisks || contract.knownRisks.length === 0) {
      warnings.push("No known risks defined - consider adding at least one");
    } else {
      contract.knownRisks.forEach((risk, index) => {
        this.validateRiskSpec(risk, index, errors, warnings);
      });
    }

    // Constraints validation
    if (!contract.constraints || contract.constraints.length === 0) {
      warnings.push("No constraints defined - consider adding at least one");
    } else {
      contract.constraints.forEach((constraint, index) => {
        this.validateConstraintSpec(constraint, index, errors, warnings);
      });
    }

    // Status-specific validation
    if (contract.status === "accepted" && !contract.acceptedBy) {
      errors.push("AcceptedBy agent ID is required when status is 'accepted'");
    }

    if (contract.status === "accepted" && !contract.acceptedAt) {
      errors.push("AcceptedAt timestamp is required when status is 'accepted'");
    }

    if (contract.status === "completed" && !contract.actualOutputs) {
      errors.push("ActualOutputs are required when status is 'completed'");
    }

    if (contract.status === "completed" && !contract.completedAt) {
      errors.push("CompletedAt timestamp is required when status is 'completed'");
    }

    if (contract.status === "failed" && !contract.failureReason) {
      errors.push("FailureReason is required when status is 'failed'");
    }

    if (contract.status === "rejected" && !contract.rejectionReason) {
      errors.push("RejectionReason is required when status is 'rejected'");
    }

    // Context validation
    if (contract.context) {
      const contextSize = JSON.stringify(contract.context).length;
      if (contextSize > 10000) {
        errors.push("Context is too large (max 10KB) - use minimal key-value pairs, not full history");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate an OutputSpec
   */
  private static validateOutputSpec(
    output: OutputSpec,
    index: number,
    errors: string[],
    warnings: string[]
  ): void {
    const prefix = `Output[${index}]`;

    if (!output.name || output.name.trim() === "") {
      errors.push(`${prefix}: name is required`);
    }

    if (!output.type) {
      errors.push(`${prefix}: type is required`);
    }

    if (!output.description || output.description.trim() === "") {
      errors.push(`${prefix}: description is required`);
    }

    if (output.required === undefined || output.required === null) {
      errors.push(`${prefix}: required flag must be explicitly set`);
    }

    if (output.type === "url" && !output.validation) {
      warnings.push(`${prefix}: consider adding URL validation pattern`);
    }
  }

  /**
   * Validate a RiskSpec
   */
  private static validateRiskSpec(
    risk: RiskSpec,
    index: number,
    errors: string[],
    warnings: string[]
  ): void {
    const prefix = `Risk[${index}]`;

    if (!risk.id || risk.id.trim() === "") {
      errors.push(`${prefix}: id is required`);
    }

    if (!risk.description || risk.description.trim() === "") {
      errors.push(`${prefix}: description is required`);
    }

    if (risk.probability === undefined || risk.probability === null) {
      errors.push(`${prefix}: probability is required`);
    } else if (risk.probability < 0 || risk.probability > 1) {
      errors.push(`${prefix}: probability must be between 0 and 1`);
    }

    if (risk.impact === undefined || risk.impact === null) {
      errors.push(`${prefix}: impact is required`);
    } else if (risk.impact < 0 || risk.impact > 1) {
      errors.push(`${prefix}: impact must be between 0 and 1`);
    }

    if (risk.probability * risk.impact > 0.5 && !risk.mitigation) {
      warnings.push(`${prefix}: high-risk item (${(risk.probability * risk.impact * 100).toFixed(0)}%) should have mitigation strategy`);
    }
  }

  /**
   * Validate a ConstraintSpec
   */
  private static validateConstraintSpec(
    constraint: ConstraintSpec,
    index: number,
    errors: string[],
    warnings: string[]
  ): void {
    const prefix = `Constraint[${index}]`;

    if (!constraint.name || constraint.name.trim() === "") {
      errors.push(`${prefix}: name is required`);
    }

    if (constraint.value === undefined || constraint.value === null) {
      errors.push(`${prefix}: value is required`);
    }

    if (constraint.hard === undefined || constraint.hard === null) {
      errors.push(`${prefix}: hard flag must be explicitly set`);
    }

    if (!constraint.description || constraint.description.trim() === "") {
      errors.push(`${prefix}: description is required`);
    }
  }

  /**
   * Validate that actualOutputs match acceptedOutputs schema
   */
  static validateActualOutputs(
    contract: TaskContract,
    actualOutputs: Record<string, any>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check that all required outputs are present
    contract.acceptedOutputs.forEach((spec) => {
      if (spec.required && !(spec.name in actualOutputs)) {
        errors.push(`Required output '${spec.name}' is missing`);
      }
    });

    // Check that all provided outputs match schema
    Object.keys(actualOutputs).forEach((key) => {
      const spec = contract.acceptedOutputs.find((s) => s.name === key);
      if (!spec) {
        warnings.push(`Output '${key}' was not defined in acceptedOutputs schema`);
      } else {
        // Type validation
        const actualType = typeof actualOutputs[key];
        if (spec.type === "array" && !Array.isArray(actualOutputs[key])) {
          errors.push(`Output '${key}' should be an array, got ${actualType}`);
        } else if (spec.type === "object" && (actualType !== "object" || Array.isArray(actualOutputs[key]))) {
          errors.push(`Output '${key}' should be an object, got ${actualType}`);
        } else if (spec.type !== "array" && spec.type !== "object" && actualType !== spec.type) {
          errors.push(`Output '${key}' should be ${spec.type}, got ${actualType}`);
        }

        // URL validation
        if (spec.type === "url" && typeof actualOutputs[key] === "string") {
          try {
            new URL(actualOutputs[key]);
          } catch {
            errors.push(`Output '${key}' is not a valid URL`);
          }
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
