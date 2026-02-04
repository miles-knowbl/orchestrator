/**
 * Deliverable Management Types
 *
 * Types for organizing, versioning, and tracking deliverables
 * produced during loop execution.
 *
 * Directory Structure:
 * .orchestra/
 *   runs/
 *     {execution-id}/
 *       manifest.json
 *       INIT/
 *         REQUIREMENTS-v1.md
 *         FEATURESPEC-v1.md
 *       SCAFFOLD/
 *         ARCHITECTURE-v1.md
 *       ...
 *   current -> runs/{latest-execution-id}  (symlink)
 */

import type { Phase, ExecutionStatus } from '../types.js';

// =============================================================================
// MANIFEST TYPES
// =============================================================================

/**
 * Manifest for a single execution run
 * Stored at .orchestra/runs/{execution-id}/manifest.json
 */
export interface DeliverableManifest {
  version: '1.0.0';
  executionId: string;
  loopId: string;
  project: string;
  status: ExecutionStatus;

  // Timing
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Deliverable index
  deliverables: Record<string, DeliverableEntry>;

  // Phase summaries
  phases: Record<Phase, PhaseSummary>;

  // Metadata
  tags?: string[];
  notes?: string;
}

export interface PhaseSummary {
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  deliverableCount: number;
  startedAt?: Date;
  completedAt?: Date;
}

// =============================================================================
// DELIVERABLE TYPES
// =============================================================================

/**
 * Entry for a single deliverable type (e.g., REQUIREMENTS.md)
 */
export interface DeliverableEntry {
  name: string;              // e.g., "REQUIREMENTS.md"
  phase: Phase;
  category: DeliverableCategory;

  // Version tracking
  versions: DeliverableVersion[];
  currentVersion: number;

  // Metadata
  description?: string;
  guaranteeIds?: string[];   // Which guarantees this satisfies
}

export interface DeliverableVersion {
  version: number;
  path: string;              // Relative path: "INIT/REQUIREMENTS-v1.md"
  createdAt: Date;
  updatedAt?: Date;
  hash: string;              // sha256 for content verification
  sizeBytes: number;
  lineCount: number;

  // Optional metadata
  author?: string;
  changeNote?: string;
}

export type DeliverableCategory =
  | 'specification'    // REQUIREMENTS, FEATURESPEC
  | 'architecture'     // ARCHITECTURE, ADRs
  | 'implementation'   // Code-related deliverables
  | 'testing'          // Test plans, coverage reports
  | 'verification'     // VERIFICATION, VALIDATION
  | 'security'         // SECURITY-AUDIT
  | 'documentation'    // README, CHANGELOG
  | 'review'           // CODE-REVIEW
  | 'deployment'       // Deploy configs, release notes
  | 'analysis'         // ROOT-CAUSE, POSTMORTEM
  | 'planning'         // MIGRATION-PLAN, RELEASE-PLAN
  | 'other';

// =============================================================================
// SERVICE TYPES
// =============================================================================

export interface CreateDeliverableParams {
  executionId: string;
  phase: Phase;
  name: string;              // e.g., "REQUIREMENTS.md"
  content: string;
  category?: DeliverableCategory;
  changeNote?: string;
  author?: string;
}

export interface CreateDeliverableResult {
  path: string;              // Full path to created file
  relativePath: string;      // Path relative to .orchestra
  version: number;
  hash: string;
}

export interface GetDeliverableParams {
  executionId: string;
  name: string;
  version?: number;          // If not specified, returns latest
}

export interface ListDeliverablesParams {
  executionId?: string;      // If not specified, searches all runs
  phase?: Phase;
  category?: DeliverableCategory;
  namePattern?: string;      // Glob pattern
}

export interface DeliverableSummary {
  executionId: string;
  name: string;
  phase: Phase;
  category: DeliverableCategory;
  currentVersion: number;
  latestPath: string;
  updatedAt: Date;
}

export interface SearchDeliverablesParams {
  query: string;             // Text to search for
  executionId?: string;
  phase?: Phase;
  limit?: number;
}

export interface SearchResult {
  executionId: string;
  name: string;
  version: number;
  path: string;
  matches: SearchMatch[];
}

export interface SearchMatch {
  line: number;
  content: string;
  context?: string;          // Surrounding lines
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Map deliverable names to their expected categories
 */
export const DELIVERABLE_CATEGORIES: Record<string, DeliverableCategory> = {
  'REQUIREMENTS.md': 'specification',
  'FEATURESPEC.md': 'specification',
  'ARCHITECTURE.md': 'architecture',
  'SCAFFOLD.md': 'architecture',
  'VERIFICATION.md': 'verification',
  'VALIDATION.md': 'verification',
  'SECURITY-AUDIT.md': 'security',
  'CODE-REVIEW.md': 'review',
  'README.md': 'documentation',
  'CHANGELOG.md': 'documentation',
  'RELEASE-NOTES.md': 'deployment',
  'DEPLOY.md': 'deployment',
  'ROOT-CAUSE.md': 'analysis',
  'POSTMORTEM.md': 'analysis',
  'BUG-REPRODUCTION.md': 'analysis',
  'MIGRATION-PLAN.md': 'planning',
  'RELEASE-PLAN.md': 'planning',
  'COMPATIBILITY.md': 'planning',
  'TEST-PLAN.md': 'testing',
  'COVERAGE.md': 'testing',
};

/**
 * Get category for a deliverable name
 */
export function getDeliverableCategory(name: string): DeliverableCategory {
  return DELIVERABLE_CATEGORIES[name] || 'other';
}

/**
 * Generate versioned filename
 */
export function getVersionedFilename(name: string, version: number): string {
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  const base = name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name;
  return `${base}-v${version}${ext}`;
}

/**
 * Parse version from filename
 */
export function parseVersionFromFilename(filename: string): number | null {
  const match = filename.match(/-v(\d+)\./);
  return match ? parseInt(match[1], 10) : null;
}

// =============================================================================
// TRANSIENT STATE TYPES
// =============================================================================

/**
 * Transient state for per-execution working data.
 * Lives in .orchestra/runs/{execution-id}/transient/
 * Automatically cleaned up on execution completion.
 *
 * Directory Structure:
 * transient/
 *   context/           # Gathered context (sources, research)
 *     sources.json     # Context sources metadata
 *     *.md             # Raw context documents
 *   working/           # Active working state
 *     checkpoint.json  # Resumable state checkpoint
 *     notes.md         # Working notes
 *   scratch/           # Temporary files (always cleaned)
 */

export type TransientCategory = 'context' | 'working' | 'scratch';

export interface TransientFile {
  name: string;
  category: TransientCategory;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  size: number;
  metadata?: Record<string, unknown>;
}

export interface TransientState {
  executionId: string;
  files: TransientFile[];
  checkpoint?: TransientCheckpoint;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransientCheckpoint {
  phase: Phase;
  skillId?: string;
  data: Record<string, unknown>;
  savedAt: Date;
}

export interface WriteTransientParams {
  executionId: string;
  category: TransientCategory;
  name: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ReadTransientParams {
  executionId: string;
  category: TransientCategory;
  name: string;
}

export interface ListTransientParams {
  executionId: string;
  category?: TransientCategory;
}

export interface SaveCheckpointParams {
  executionId: string;
  phase: Phase;
  skillId?: string;
  data: Record<string, unknown>;
}

export interface CleanupTransientParams {
  executionId: string;
  /** If true, only clean scratch/; otherwise clean all transient state */
  scratchOnly?: boolean;
}
