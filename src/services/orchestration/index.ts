/**
 * 2-Layer Orchestration Module
 *
 * Exports for the orchestration system.
 */

export {
  OrchestrationService,
  type OrchestrationServiceDependencies,
} from './OrchestrationService.js';

export {
  AgentManager,
  type SpawnAgentOptions,
  type AgentMessage,
} from './AgentManager.js';

export {
  WorktreeManager,
  type Worktree,
} from './WorktreeManager.js';

export {
  // Orchestrator types
  type Orchestrator,
  type OrchestratorStatus,
  OrchestratorSchema,
  OrchestratorStatusSchema,

  // Agent types
  type Agent,
  type AgentStatus,
  type AgentProgress,
  AgentSchema,
  AgentStatusSchema,
  AgentProgressSchema,

  // Work distribution types
  type WorkItem,
  type WorkQueue,
  WorkItemSchema,

  // Concurrency types
  type ConcurrencyMode,
  type ConcurrencyDecision,
  ConcurrencyModeSchema,

  // Failure handling types
  type FailureAction,
  type FailureDecision,
  FailureActionSchema,

  // Event types
  type OrchestrationEvent,
  type OrchestrationEventType,

  // Configuration types
  type OrchestrationConfig,
  type OrchestrationServiceOptions,
  type AgentManagerOptions,
  type WorktreeManagerOptions,
  DEFAULT_CONFIG,
} from './types.js';
