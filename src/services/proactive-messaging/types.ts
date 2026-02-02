/**
 * Proactive Messaging Types
 */

// ============================================================================
// Events
// ============================================================================

export interface GateWaitingEvent {
  type: 'gate_waiting';
  gateId: string;
  executionId: string;
  loopId: string;
  phase: string;
  deliverables: string[];
  approvalType: 'human' | 'auto' | 'conditional';
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
}

export type ProactiveEvent =
  | LoopStartEvent
  | GateWaitingEvent
  | LoopCompleteEvent
  | DreamProposalsReadyEvent
  | ExecutorBlockedEvent
  | ErrorEvent
  | DeckReadyEvent
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

export type InboundCommand =
  | ApproveCommand
  | RejectCommand
  | FeedbackCommand
  | ContinueCommand
  | StartLoopCommand;

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

export interface SlackChannelConfig {
  enabled: boolean;
  botToken?: string;
  appToken?: string;
  channelId?: string;
  socketMode: boolean;
}

export interface ChannelConfig {
  terminal: TerminalChannelConfig;
  slack: SlackChannelConfig;
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
  text: string;  // Plain text fallback
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
  };
  threadTs?: string;  // Slack thread timestamp for replies
}
