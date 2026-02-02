export {
  ProactiveMessagingService,
  type ProactiveMessagingServiceOptions,
} from './ProactiveMessagingService.js';

export type {
  ProactiveEvent,
  GateWaitingEvent,
  LoopCompleteEvent,
  DreamProposalsReadyEvent,
  ExecutorBlockedEvent,
  ErrorEvent,
  DeckReadyEvent,
  CustomNotificationEvent,
  StartupWelcomeEvent,
  DailyWelcomeEvent,
  InboundCommand,
  ApproveCommand,
  RejectCommand,
  FeedbackCommand,
  ContinueCommand,
  StartLoopCommand,
  PendingInteraction,
  ProactiveMessagingConfig,
  ChannelConfig,
  TerminalChannelConfig,
  SlackChannelConfig,
  ChannelStatus,
  FormattedMessage,
} from './types.js';

export { MessageFormatter } from './MessageFormatter.js';
export { ConversationState } from './ConversationState.js';
export { TerminalAdapter, SlackAdapter } from './adapters/index.js';
export type { ChannelAdapter } from './adapters/index.js';
