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

export type ProactiveEvent =
  | GateWaitingEvent
  | LoopCompleteEvent
  | DreamProposalsReadyEvent
  | ExecutorBlockedEvent
  | ErrorEvent
  | DeckReadyEvent
  | CustomNotificationEvent;

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
  };
}
