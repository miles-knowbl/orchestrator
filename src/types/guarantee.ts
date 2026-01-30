/**
 * Guarantee Enforcement Types
 *
 * Defines types for the guarantee system that enforces skill/gate completion
 * with hard-blocking validation.
 */

import type { Phase, LoopMode } from '../types.js';

// =============================================================================
// GUARANTEE TYPES
// =============================================================================

export const GUARANTEE_TYPES = [
  'deliverable',
  'step_proof',
  'content',
  'quality'
] as const;

export type GuaranteeType = typeof GUARANTEE_TYPES[number];

export interface GuaranteeRegistry {
  version: string;
  skills: Record<string, SkillGuarantees>;
  loops: Record<string, LoopGuarantees>;
  phases: Partial<Record<Phase, PhaseGuarantees>>;
}

export interface SkillGuarantees {
  skillId: string;
  guarantees: Guarantee[];
}

export interface LoopGuarantees {
  loopId: string;
  phaseGuarantees: Partial<Record<Phase, Guarantee[]>>;
  gateGuarantees: Record<string, Guarantee[]>;
}

export interface PhaseGuarantees {
  phase: Phase;
  globalGuarantees: Guarantee[];
}

export interface Guarantee {
  id: string;                          // e.g., "GUA-IMPL-001"
  name: string;                        // e.g., "Source files created"
  type: GuaranteeType;
  required: boolean;                   // Hard block if true
  condition?: string;                  // e.g., "mode === 'greenfield'"
  validation: GuaranteeValidation;
  failureRecovery?: FailureRecovery;
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

export interface GuaranteeValidation {
  // For deliverable type
  files?: FilePattern[];

  // For step_proof type
  proofType?: 'artifact' | 'log' | 'state' | 'git';
  proofPattern?: string;

  // For content type
  contentChecks?: ContentCheck[];

  // For quality type
  qualityThresholds?: QualityThreshold[];
}

export interface FilePattern {
  pattern: string;           // Glob pattern: "src/**/*.ts"
  minCount?: number;         // At least N files
  maxCount?: number;         // At most N files
  condition?: string;        // When this pattern applies
}

export interface ContentCheck {
  file: string;
  sections?: string[];       // Required markdown sections
  patterns?: string[];       // Required regex patterns
  minLines?: number;
  maxLines?: number;
}

export interface QualityThreshold {
  metric: string;            // e.g., "test_coverage", "lint_errors"
  operator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt';
  value: number;
  source: 'file' | 'command' | 'metric_api';
  path?: string;             // File path or command to run
}

export interface FailureRecovery {
  retryable: boolean;
  maxRetries?: number;
  recoverySteps?: string[];
  escalateTo?: 'human' | 'auto_fix' | 'skip_with_warning';
}

// =============================================================================
// VALIDATION CONTEXT & RESULTS
// =============================================================================

export interface ValidationContext {
  executionId: string;
  loopId: string;
  skillId: string;
  phase: Phase;
  mode: LoopMode;
  projectPath: string;
}

export interface GuaranteeResult {
  guaranteeId: string;
  name: string;
  type: GuaranteeType;
  passed: boolean;
  required: boolean;
  evidence: Evidence[];
  errors: string[];
  warnings: string[];
  timestamp: Date;
}

export interface Evidence {
  type: 'file' | 'content' | 'metric' | 'proof';
  path?: string;
  value?: string | number;
  details?: Record<string, unknown>;
}

export interface ValidationSummary {
  passed: boolean;
  results: GuaranteeResult[];
  blocking: GuaranteeResult[];
  warnings: GuaranteeResult[];
}

// =============================================================================
// STEP PROOF TYPES
// =============================================================================

export interface StepProof {
  id: string;
  executionId: string;
  skillId: string;
  step: StepProofEntry;
  timestamp: Date;
}

export interface StepProofEntry {
  stepNumber: number;
  stepName: string;
  proofType: StepProofType;
  evidence: StepEvidence;
}

export const STEP_PROOF_TYPES = [
  'file_created',
  'file_modified',
  'command_executed',
  'test_passed',
  'human_verified',
  'artifact_generated'
] as const;

export type StepProofType = typeof STEP_PROOF_TYPES[number];

export interface StepEvidence {
  type: StepProofType;

  // For file_created/file_modified
  filePath?: string;
  fileHash?: string;
  beforeHash?: string;  // For modifications

  // For command_executed
  command?: string;
  exitCode?: number;
  outputSnippet?: string;

  // For test_passed
  testSuite?: string;
  testsRun?: number;
  testsPassed?: number;

  // For human_verified
  verifiedBy?: string;
  verificationNote?: string;

  // For artifact_generated
  artifactPath?: string;
  artifactType?: string;
}

export interface StepProofArtifact {
  executionId: string;
  skillId: string;
  steps: StepProofEntry[];
  createdAt: Date;
  completedAt?: Date;
}

// =============================================================================
// FAILURE LEARNING TYPES
// =============================================================================

export interface GuaranteeFailureRecord {
  id: string;
  timestamp: Date;
  executionId: string;
  skillId: string;
  phase: Phase;
  guaranteeId: string;
  guaranteeType: GuaranteeType;
  errors: string[];
  context: {
    mode: LoopMode;
    projectType?: string;
    fileCount?: number;
  };
  resolution?: {
    type: 'fixed' | 'skipped' | 'overridden';
    timeMs: number;  // Time to resolve
    retryCount: number;
  };
}

export interface ProblematicSkill {
  skillId: string;
  failureRate: number;
  commonGuarantees: string[];
  totalFailures: number;
  recentFailures: GuaranteeFailureRecord[];
}
