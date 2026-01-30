/**
 * GuaranteeViolationError
 *
 * Thrown when one or more guarantees fail validation during skill/gate completion.
 * Contains detailed information about which guarantees failed and why.
 */

import type { GuaranteeResult } from '../types/guarantee.js';

export class GuaranteeViolationError extends Error {
  public readonly failures: GuaranteeResult[];
  public readonly blockingCount: number;
  public readonly warningCount: number;

  constructor(message: string, failures: GuaranteeResult[]) {
    super(message);
    this.name = 'GuaranteeViolationError';
    this.failures = failures;
    this.blockingCount = failures.filter(f => f.required && !f.passed).length;
    this.warningCount = failures.filter(f => !f.required && !f.passed).length;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GuaranteeViolationError);
    }
  }

  /**
   * Get a summary of all errors across all failures
   */
  getAllErrors(): string[] {
    return this.failures.flatMap(f => f.errors);
  }

  /**
   * Get only the blocking failures (required guarantees that failed)
   */
  getBlockingFailures(): GuaranteeResult[] {
    return this.failures.filter(f => f.required && !f.passed);
  }

  /**
   * Get a formatted summary suitable for logging
   */
  getSummary(): string {
    const blocking = this.getBlockingFailures();
    const lines = [
      `Guarantee Violation: ${this.blockingCount} blocking, ${this.warningCount} warnings`,
      '',
      'Blocking Failures:',
      ...blocking.map(f => `  - [${f.guaranteeId}] ${f.name}: ${f.errors.join('; ')}`),
    ];
    return lines.join('\n');
  }

  /**
   * Convert to a JSON-serializable object
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      blockingCount: this.blockingCount,
      warningCount: this.warningCount,
      failures: this.failures.map(f => ({
        guaranteeId: f.guaranteeId,
        name: f.name,
        type: f.type,
        required: f.required,
        passed: f.passed,
        errors: f.errors,
        warnings: f.warnings,
        evidence: f.evidence,
      })),
    };
  }

  /**
   * Create from a validation summary
   */
  static fromBlocking(
    context: { skillId?: string; gateId?: string },
    blocking: GuaranteeResult[]
  ): GuaranteeViolationError {
    const target = context.skillId
      ? `skill "${context.skillId}"`
      : `gate "${context.gateId}"`;
    const message = `Cannot complete ${target}: ${blocking.length} guarantee(s) failed`;
    return new GuaranteeViolationError(message, blocking);
  }
}
