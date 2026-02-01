/**
 * Slack Integration Types
 * 
 * Types for full bidirectional Slack control with channel parity.
 */

// ============================================================================
// Semantic Commands (channel-agnostic)
// ============================================================================

export type SemanticCommandType =
  | 'go'
  | 'approved'
  | 'reject'
  | 'changes'
  | 'merge'
  | 'rebase'
  | 'status'
  | 'show'
  | 'start_loop'
  | 'capture';

export interface SemanticCommand {
  type: SemanticCommandType;
  payload?: {
    reason?: string;      // For reject, changes
    target?: string;      // For show, start_loop
    loopId?: string;      // For start_loop
    deliverable?: string; // For show
    url?: string;         // For capture
    content?: string;     // For capture
  };
  source: 'terminal' | 'slack' | 'voice';
  raw: string;            // Original text
}

// ============================================================================
// Channel Configuration
// ============================================================================

export interface SlackChannelConfig {
  channelId: string;
  enabled: boolean;
  botToken: string;
  appToken: string;
  socketMode: boolean;
  
  // Engineer context
  engineer: string;
  projectPath: string;
  worktreePath: string;
  branchPrefix: string;
  
  // Optional
  defaultLoop?: string;
  autoRebase?: boolean;
}

export interface SlackIntegrationConfig {
  channels: {
    slack: SlackChannelConfig | {
      instances: SlackChannelConfig[];
    };
  };
}

// ============================================================================
// Thread Management
// ============================================================================

export interface ExecutionThread {
  threadTs: string;           // Slack thread timestamp
  channelId: string;
  executionId: string;
  loopId: string;
  target: string;
  branch: string;
  engineer: string;
  status: 'active' | 'complete' | 'failed';
  createdAt: string;
  lastMessageAt: string;
}

export interface ThreadContext {
  thread: ExecutionThread;
  pendingGate?: string;
  currentPhase?: string;
}

// ============================================================================
// Merge/Rebase Workflow
// ============================================================================

export interface MergeRequest {
  id: string;
  engineer: string;
  branch: string;
  targetBranch: string;      // Usually 'main'
  executionId?: string;
  status: 'pending' | 'checking' | 'ready' | 'conflicts' | 'merged' | 'failed';
  conflictFiles?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface RebaseRequest {
  id: string;
  engineer: string;
  branch: string;
  sourceBranch: string;      // Usually 'main'
  status: 'pending' | 'in_progress' | 'success' | 'conflicts' | 'failed';
  conflictFiles?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface MergeConflict {
  file: string;
  ourChanges: string;
  theirChanges: string;
}

// ============================================================================
// Cross-Engineer Notifications
// ============================================================================

export interface MainUpdateNotification {
  engineer: string;          // Who merged
  branch: string;            // What branch
  target: string;            // What module/feature
  commits: number;
  files: string[];
  timestamp: string;
}

export interface BranchStatus {
  engineer: string;
  branch: string;
  behindMain: number;        // Commits behind main
  aheadOfMain: number;       // Commits ahead of main
  potentialConflicts: string[];
}

// ============================================================================
// Engineer Status
// ============================================================================

export interface EngineerStatus {
  engineer: string;
  channelId: string;
  projectPath: string;
  worktreePath: string;
  currentBranch?: string;
  activeExecution?: {
    executionId: string;
    loopId: string;
    target: string;
    phase: string;
    threadTs: string;
  };
  branchStatus?: BranchStatus;
  lastActivityAt: string;
}

// ============================================================================
// Service Events
// ============================================================================

export interface SlackIntegrationEvent {
  type: 'command_received' | 'thread_created' | 'merge_complete' | 'rebase_complete' | 'conflict_detected';
  engineer: string;
  channelId: string;
  timestamp: string;
  data: Record<string, unknown>;
}
