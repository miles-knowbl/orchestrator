/**
 * Slack Integration Module
 *
 * @deprecated Use proactive-messaging/SlackAdapter instead.
 * This module is over-engineered for most use cases.
 * The proactive-messaging system now supports multi-engineer routing
 * with a simpler config:
 *
 * ```typescript
 * {
 *   engineers: [
 *     { name: "alice", slackUserId: "U123", channelId: "C123" },
 *     { name: "bob", slackUserId: "U456", channelId: "C456" },
 *   ]
 * }
 * ```
 *
 * This module will be removed in a future version.
 */

export * from './types.js';
export { SlackCommandParser } from './SlackCommandParser.js';
export { SlackThreadManager } from './SlackThreadManager.js';
export { SlackMergeWorkflow } from './SlackMergeWorkflow.js';
export { SlackIntegrationService } from './SlackIntegrationService.js';
export type { SlackIntegrationServiceOptions, CommandContext, CommandResult } from './SlackIntegrationService.js';
export type { SlackMergeWorkflowOptions } from './SlackMergeWorkflow.js';
export type { SlackThreadManagerOptions } from './SlackThreadManager.js';
