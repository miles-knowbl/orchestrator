/**
 * Multi-Agent Worktree Module
 *
 * Coordinates multiple collaborators with their own agent sets
 * working in parallel on isolated git worktrees.
 */

export {
  MultiAgentCoordinator,
  type Collaborator,
  type AgentSet,
  type Reservation,
  type ReservationType,
  type MergeRequest,
  type MergeRequestStatus,
  type ConflictCheck,
  type CoordinatorStatus,
  type CoordinatorOptions,
  type CoordinatorEvent,
} from './MultiAgentCoordinator.js';
