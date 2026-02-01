/**
 * Slack Integration Module
 *
 * Full bidirectional Slack control with channel parity.
 * Enables loop invocation, gate approvals, merge workflows,
 * and cross-engineer coordination from Slack.
 */

export * from './types.js';
export { SlackCommandParser } from './SlackCommandParser.js';
export { SlackThreadManager } from './SlackThreadManager.js';
export { SlackMergeWorkflow } from './SlackMergeWorkflow.js';
export { SlackIntegrationService } from './SlackIntegrationService.js';
export type { SlackIntegrationServiceOptions, CommandContext, CommandResult } from './SlackIntegrationService.js';
export type { SlackMergeWorkflowOptions } from './SlackMergeWorkflow.js';
export type { SlackThreadManagerOptions } from './SlackThreadManager.js';
