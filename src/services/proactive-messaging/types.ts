/**
 * Proactive Messaging Types
 */

// ============================================================================
// Events
// ============================================================================

export interface GuaranteeStatus {
  id: string;
  name: string;
  passed: boolean;
  errors?: string[];
}

export interface GateWaitingEvent {
  type: 'gate_waiting';
  gateId: string;
  executionId: string;
  loopId: string;
  phase: string;
  deliverables: string[];
  approvalType: 'human' | 'auto' | 'conditional';
  // Guarantee pre-check status
  guarantees?: {
    total: number;
    passed: number;
    failed: number;
    canApprove: boolean;
    blocking?: GuaranteeStatus[];
  };
}

export interface LoopStartEvent {
  type: 'loop_start';
  loopId: string;
  executionId: string;
  target: string;
  branch?: string;
  engineer?: string;
}

export interface LoopCompleteEvent {
  type: 'loop_complete';
  loopId: string;
  executionId: string;
  module: string;
  summary: string;
  deliverables: string[];
}

export interface DreamProposalsReadyEvent {
  type: 'dream_proposals_ready';
  count: number;
  proposals: Array<{
    id: string;
    type: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface ExecutorBlockedEvent {
  type: 'executor_blocked';
  executionId: string;
  reason: string;
  phase?: string;
  gateId?: string;
}

export interface ErrorEvent {
  type: 'error';
  message: string;
  severity: 'critical' | 'warning' | 'info';
  context?: Record<string, unknown>;
}

export interface DeckReadyEvent {
  type: 'deck_ready';
  deckId: string;
  deckType: 'knowledge' | 'proposal';
  itemCount: number;
  estimatedMinutes: number;
}

export interface SkillCompleteEvent {
  type: 'skill_complete';
  executionId: string;
  loopId: string;
  phase: string;
  skillId: string;
  deliverables?: string[];
}

export interface PhaseCompleteEvent {
  type: 'phase_complete';
  executionId: string;
  loopId: string;
  phase: string;
  skillsCompleted: number;
  hasGate: boolean;
  gateId?: string;
}

export interface PhaseStartEvent {
  type: 'phase_start';
  executionId: string;
  loopId: string;
  phase: string;
  phaseNumber: number;
  totalPhases: number;
  skills: string[];
}

export interface CustomNotificationEvent {
  type: 'custom';
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    value: string;
  }>;
}

export interface StartupWelcomeEvent {
  type: 'startup_welcome';
  version: string;
  skillCount: number;
  loopCount: number;
  hasDreamState: boolean;
  dreamStateProgress?: {
    name: string;
    modulesComplete: number;
    modulesTotal: number;
  };
  recommendedLoop: string;
  recommendedTarget?: string;
  availableLoops: string[];
}

export interface RoadmapMove {
  moduleId: string;
  moduleName: string;
  score: number;
  layer: number;
  description: string;
}

export interface RoadmapDriftStatus {
  hasDrift: boolean;
  roadmapComplete: number;
  roadmapTotal: number;
  roadmapPercentage: number;
  dreamStateComplete: number;
  dreamStateTotal: number;
  dreamStatePercentage: number;
  driftAmount: number;  // How many modules differ
  lastSyncAt?: string;
}

export interface DailyWelcomeEvent {
  type: 'daily_welcome';
  greeting: string;
  version: string;
  versionStatus: 'current' | 'update_available';
  latestVersion?: string;
  hasDreamState: boolean;
  dreamStateProgress?: {
    name: string;
    modulesComplete: number;
    modulesTotal: number;
  };
  pendingProposals: number;
  recommendedLoop: string;
  recommendedTarget?: string;
  updateNotes?: string[];
  // Roadmap status (new)
  hasRoadmap: boolean;
  roadmapDrift?: RoadmapDriftStatus;
  availableMoves?: RoadmapMove[];
}

export type ProactiveEvent =
  | LoopStartEvent
  | GateWaitingEvent
  | LoopCompleteEvent
  | DreamProposalsReadyEvent
  | ExecutorBlockedEvent
  | ErrorEvent
  | DeckReadyEvent
  | SkillCompleteEvent
  | PhaseCompleteEvent
  | PhaseStartEvent
  | CustomNotificationEvent
  | StartupWelcomeEvent
  | DailyWelcomeEvent;

// ============================================================================
// Commands (Inbound)
// ============================================================================

export interface ApproveCommand {
  type: 'approve';
  interactionId: string;
  context: {
    gateId?: string;
    executionId?: string;
    proposalId?: string;
    skipGuarantees?: boolean;  // Force approve despite failed guarantees
  };
}

export interface RejectCommand {
  type: 'reject';
  interactionId: string;
  reason?: string;
  context: {
    gateId?: string;
    executionId?: string;
    proposalId?: string;
  };
}

export interface FeedbackCommand {
  type: 'feedback';
  interactionId: string;
  text: string;
  context: Record<string, unknown>;
}

export interface ContinueCommand {
  type: 'continue';
  executionId?: string;
}

export interface StartLoopCommand {
  type: 'start_loop';
  loopId: string;
  target?: string;
}

export interface ApproveAllProposalsCommand {
  type: 'approve_all_proposals';
  interactionId: string;
  proposalIds: string[];
}

export interface StartNextLoopCommand {
  type: 'start_next_loop';
  interactionId: string;
  executionId: string;
  completedLoopId: string;
  completedModule: string;
}

export interface CreateDeliverablesCommand {
  type: 'create_deliverables';
  interactionId: string;
  executionId: string;
  gateId: string;
  missingFiles: string[];
}

/**
 * Pending task for Claude Code to pick up
 */
export interface PendingClaudeTask {
  id: string;
  type: 'create_deliverable' | 'run_skill';
  createdAt: string;
  executionId: string;
  gateId?: string;
  skillId?: string;
  deliverables?: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  requestedVia: 'slack' | 'terminal' | 'api';
  completedAt?: string;
  error?: string;
}

export type InboundCommand =
  | ApproveCommand
  | RejectCommand
  | FeedbackCommand
  | ContinueCommand
  | StartLoopCommand
  | ApproveAllProposalsCommand
  | StartNextLoopCommand
  | CreateDeliverablesCommand;

// ============================================================================
// Interactions
// ============================================================================

export interface PendingInteraction {
  id: string;
  event: ProactiveEvent;
  sentAt: string;
  channels: string[];
  status: 'pending' | 'responded' | 'expired';
  response?: {
    command: InboundCommand;
    respondedAt: string;
    channel: string;
  };
  expiresAt?: string;
}

// ============================================================================
// Channel Configuration
// ============================================================================

export interface TerminalChannelConfig {
  enabled: boolean;
  osNotifications: boolean;
}

export interface SlackEngineerConfig {
  name: string;           // Engineer identifier (e.g., "alice")
  slackUserId: string;    // Slack member ID for @mentions (e.g., U12345678)
  channelId: string;      // Their dedicated channel
}

export interface SlackChannelConfig {
  enabled: boolean;
  botToken?: string;
  appToken?: string;
  socketMode: boolean;

  // Solo mode (single engineer)
  channelId?: string;
  slackUserId?: string;   // Slack member ID (e.g., U12345678) for @mentions

  // Multi-engineer mode
  engineers?: SlackEngineerConfig[];
}

// Re-export voice types for convenience
export type { VoiceChannelConfig } from '../voice/types.js';
import type { VoiceChannelConfig } from '../voice/types.js';

export interface ChannelConfig {
  terminal: TerminalChannelConfig;
  slack: SlackChannelConfig;
  voice?: VoiceChannelConfig;
}

export interface ProactiveMessagingConfig {
  channels: ChannelConfig;
  routing: {
    allEventsToAllChannels: boolean;
  };
}

// ============================================================================
// Channel Status
// ============================================================================

export interface ChannelStatus {
  name: string;
  enabled: boolean;
  connected: boolean;
  lastMessageAt?: string;
  error?: string;
}

// ============================================================================
// Message Format
// ============================================================================

export interface FormattedMessage {
  text: string;  // Full formatted text (terminal display, Slack blocks fallback)
  notificationText?: string;  // Clean summary for Slack notification banner (no ASCII art)
  blocks?: unknown[];  // Slack Block Kit blocks
  actions?: Array<{
    id: string;
    label: string;
    style?: 'primary' | 'danger';
    value: string;
  }>;
  metadata?: {
    interactionId: string;
    eventType: string;
    executionId?: string;  // For thread-per-execution routing
    engineer?: string;     // For multi-engineer routing
  };
  threadTs?: string;  // Slack thread timestamp for replies
}
