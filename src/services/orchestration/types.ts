/**
 * 2-Layer Orchestration Types
 *
 * Layer 1: System Orchestrator - persistent, human-facing portal
 * Layer 2: Task Agents - ephemeral, module-scoped workers
 */

import { z } from 'zod';
import type { Phase } from '../../types.js';

// =============================================================================
// ORCHESTRATOR (Layer 1)
// =============================================================================

export type OrchestratorStatus = 'initializing' | 'active' | 'idle' | 'paused' | 'terminated';

export const OrchestratorStatusSchema = z.enum(['initializing', 'active', 'idle', 'paused', 'terminated']);

export interface Orchestrator {
  id: string;                      // UUID
  systemId: string;                // Which system (repo/app) this orchestrates
  systemPath: string;              // Absolute path to system root
  status: OrchestratorStatus;

  // Git integration
  mainBranch: string;              // Usually 'main' or 'master'
  worktreesPath: string;           // Path to .worktrees directory

  // Active work
  activeAgents: string[];          // Agent IDs currently running
  activeModules: string[];         // Module IDs with active worktrees

  // Progress tracking
  modulesCompleted: string[];
  modulesInProgress: string[];
  modulesPending: string[];

  // Timestamps
  createdAt: Date;
  lastActiveAt: Date;
}

export const OrchestratorSchema = z.object({
  id: z.string().uuid(),
  systemId: z.string().min(1),
  systemPath: z.string().min(1),
  status: OrchestratorStatusSchema,
  mainBranch: z.string().default('main'),
  worktreesPath: z.string(),
  activeAgents: z.array(z.string()),
  activeModules: z.array(z.string()),
  modulesCompleted: z.array(z.string()),
  modulesInProgress: z.array(z.string()),
  modulesPending: z.array(z.string()),
  createdAt: z.coerce.date(),
  lastActiveAt: z.coerce.date(),
});

// =============================================================================
// AGENT (Layer 2)
// =============================================================================

export type AgentStatus =
  | 'spawning'      // Being created
  | 'active'        // Running a loop
  | 'blocked'       // Waiting (gate, dependency)
  | 'retrying'      // Failed, retrying with context
  | 'completed'     // Successfully finished
  | 'failed'        // Failed after retries, escalated
  | 'terminated';   // Manually stopped

export const AgentStatusSchema = z.enum([
  'spawning', 'active', 'blocked', 'retrying', 'completed', 'failed', 'terminated'
]);

export interface Agent {
  id: string;                      // UUID
  orchestratorId: string;          // Parent orchestrator

  // Assignment
  moduleId: string;                // Which module working on
  loopId: string;                  // Which loop running (engineering-loop, bugfix-loop, etc.)
  scope: string;                   // Specific task description

  // Execution
  executionId?: string;            // Linked execution in ExecutionEngine
  worktreePath?: string;           // Git worktree for this module
  branchName?: string;             // Git branch (module/{moduleId})

  // Status
  status: AgentStatus;
  currentPhase?: Phase;
  progress: AgentProgress;

  // Failure handling
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  failureContext?: Record<string, unknown>;

  // Timestamps
  spawnedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  lastHeartbeat: Date;
}

export interface AgentProgress {
  phasesCompleted: number;
  phasesTotal: number;
  skillsCompleted: number;
  skillsTotal: number;
  gatesPassed: number;
  gatesTotal: number;
  percentComplete: number;
}

export const AgentProgressSchema = z.object({
  phasesCompleted: z.number().int().min(0),
  phasesTotal: z.number().int().min(0),
  skillsCompleted: z.number().int().min(0),
  skillsTotal: z.number().int().min(0),
  gatesPassed: z.number().int().min(0),
  gatesTotal: z.number().int().min(0),
  percentComplete: z.number().min(0).max(100),
});

export const AgentSchema = z.object({
  id: z.string().uuid(),
  orchestratorId: z.string().uuid(),
  moduleId: z.string().min(1),
  loopId: z.string().min(1),
  scope: z.string(),
  executionId: z.string().optional(),
  worktreePath: z.string().optional(),
  branchName: z.string().optional(),
  status: AgentStatusSchema,
  currentPhase: z.string().optional(),
  progress: AgentProgressSchema,
  retryCount: z.number().int().min(0),
  maxRetries: z.number().int().min(1),
  lastError: z.string().optional(),
  failureContext: z.record(z.unknown()).optional(),
  spawnedAt: z.coerce.date(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  lastHeartbeat: z.coerce.date(),
});

// =============================================================================
// WORK DISTRIBUTION
// =============================================================================

export interface WorkItem {
  id: string;
  moduleId: string;
  loopId: string;
  scope: string;
  priority: number;                // Higher = more urgent
  leverageScore: number;           // From leverage protocol
  dependencies: string[];          // Module IDs that must complete first
  estimatedDuration?: number;      // Milliseconds
  metadata?: Record<string, unknown>;
}

export const WorkItemSchema = z.object({
  id: z.string(),
  moduleId: z.string().min(1),
  loopId: z.string().min(1),
  scope: z.string(),
  priority: z.number(),
  leverageScore: z.number(),
  dependencies: z.array(z.string()),
  estimatedDuration: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export interface WorkQueue {
  pending: WorkItem[];
  inProgress: WorkItem[];
  completed: WorkItem[];
  failed: WorkItem[];
}

// =============================================================================
// CONCURRENCY
// =============================================================================

export type ConcurrencyMode = 'sequential' | 'parallel-async' | 'parallel-threads';

export const ConcurrencyModeSchema = z.enum(['sequential', 'parallel-async', 'parallel-threads']);

export interface ConcurrencyDecision {
  mode: ConcurrencyMode;
  reasoning: string;
  factors: {
    dependencyConflicts: boolean;
    fileOverlap: boolean;
    resourceConstrained: boolean;
    agentCount: number;
  };
}

// =============================================================================
// FAILURE HANDLING
// =============================================================================

export type FailureAction = 'retry' | 'reassign' | 'escalate';

export const FailureActionSchema = z.enum(['retry', 'reassign', 'escalate']);

export interface FailureDecision {
  action: FailureAction;
  reasoning: string;
  context: Record<string, unknown>;
  nextSteps: string[];
}

// =============================================================================
// EVENTS
// =============================================================================

export type OrchestrationEventType =
  | 'orchestrator:created'
  | 'orchestrator:started'
  | 'orchestrator:paused'
  | 'orchestrator:resumed'
  | 'orchestrator:terminated'
  | 'agent:spawned'
  | 'agent:started'
  | 'agent:progress'
  | 'agent:blocked'
  | 'agent:retrying'
  | 'agent:completed'
  | 'agent:failed'
  | 'agent:terminated'
  | 'worktree:created'
  | 'worktree:merged'
  | 'worktree:deleted'
  | 'work:assigned'
  | 'work:completed'
  | 'failure:retry'
  | 'failure:reassign'
  | 'failure:escalate';

export interface OrchestrationEvent {
  id: string;
  type: OrchestrationEventType;
  orchestratorId: string;
  agentId?: string;
  moduleId?: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface OrchestrationConfig {
  // Concurrency
  defaultConcurrencyMode: ConcurrencyMode;
  maxParallelAgents?: number;      // undefined = unlimited

  // Failure handling
  defaultMaxRetries: number;
  retryDelayMs: number;
  escalationThreshold: number;     // After this many total failures, alert human

  // Git
  worktreesDirectory: string;      // Relative to system root
  branchPrefix: string;            // e.g., 'module/'
  autoMergeOnComplete: boolean;

  // Heartbeat
  heartbeatIntervalMs: number;
  heartbeatTimeoutMs: number;

  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const DEFAULT_CONFIG: OrchestrationConfig = {
  defaultConcurrencyMode: 'parallel-threads',
  maxParallelAgents: undefined,    // Unlimited
  defaultMaxRetries: 3,
  retryDelayMs: 5000,
  escalationThreshold: 10,
  worktreesDirectory: '.worktrees',
  branchPrefix: 'module/',
  autoMergeOnComplete: false,      // Require human approval for merges
  heartbeatIntervalMs: 5000,
  heartbeatTimeoutMs: 30000,
  logLevel: 'info',
};

// =============================================================================
// SERVICE OPTIONS
// =============================================================================

export interface OrchestrationServiceOptions {
  dataDir: string;                 // Where to persist orchestration state
  config?: Partial<OrchestrationConfig>;
}

export interface AgentManagerOptions {
  orchestratorId: string;
  systemPath: string;
  config: OrchestrationConfig;
}

export interface WorktreeManagerOptions {
  systemPath: string;
  worktreesDirectory: string;
  branchPrefix: string;
  mainBranch: string;
}
