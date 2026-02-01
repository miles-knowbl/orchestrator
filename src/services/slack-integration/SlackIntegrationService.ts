/**
 * Slack Integration Service
 *
 * Orchestrates all Slack integration components for full bidirectional control.
 * Handles command parsing, thread management, merge workflows, and cross-engineer coordination.
 */

import type { WebClient } from '@slack/web-api';
import type {
  SemanticCommand,
  SlackChannelConfig,
  ExecutionThread,
  EngineerStatus,
  MainUpdateNotification,
  BranchStatus,
  SlackIntegrationEvent,
} from './types.js';
import { SlackCommandParser } from './SlackCommandParser.js';
import { SlackThreadManager } from './SlackThreadManager.js';
import { SlackMergeWorkflow } from './SlackMergeWorkflow.js';

export interface SlackIntegrationServiceOptions {
  dataPath: string;
  onEvent?: (event: SlackIntegrationEvent) => void;
}

export interface CommandContext {
  channelId: string;
  threadTs?: string;
  userId: string;
  engineer: string;
}

export interface CommandResult {
  success: boolean;
  message?: string;
  threadTs?: string;
  executionId?: string;
  error?: string;
}

export class SlackIntegrationService {
  private commandParser: SlackCommandParser;
  private threadManager: SlackThreadManager;
  private mergeWorkflow: SlackMergeWorkflow;

  private channelConfigs: Map<string, SlackChannelConfig> = new Map();
  private engineerStatus: Map<string, EngineerStatus> = new Map();
  private slackClients: Map<string, WebClient> = new Map();

  constructor(private options: SlackIntegrationServiceOptions) {
    this.commandParser = new SlackCommandParser();
    this.threadManager = new SlackThreadManager({ dataPath: options.dataPath });
    this.mergeWorkflow = new SlackMergeWorkflow({
      onMergeComplete: this.handleMergeComplete.bind(this),
      onConflictDetected: this.handleConflictDetected.bind(this),
    });
  }

  async initialize(): Promise<void> {
    await this.threadManager.initialize();
  }

  /**
   * Register a channel configuration
   */
  registerChannel(config: SlackChannelConfig, client?: WebClient): void {
    this.channelConfigs.set(config.channelId, config);
    if (client) {
      this.slackClients.set(config.channelId, client);
    }

    // Initialize engineer status
    this.engineerStatus.set(config.engineer, {
      engineer: config.engineer,
      channelId: config.channelId,
      projectPath: config.projectPath,
      worktreePath: config.worktreePath,
      lastActivityAt: new Date().toISOString(),
    });
  }

  /**
   * Get channel configuration
   */
  getChannelConfig(channelId: string): SlackChannelConfig | null {
    return this.channelConfigs.get(channelId) || null;
  }

  /**
   * Get all registered engineers
   */
  getEngineers(): string[] {
    return [...this.engineerStatus.keys()];
  }

  /**
   * Handle incoming message from Slack
   */
  async handleMessage(
    text: string,
    context: CommandContext
  ): Promise<CommandResult> {
    const config = this.channelConfigs.get(context.channelId);
    if (!config) {
      return { success: false, error: 'Channel not configured' };
    }

    // Parse the command
    const command = this.commandParser.parse(text, 'slack');
    if (!command) {
      // Not a recognized command - might be regular conversation
      return { success: true, message: 'No command detected' };
    }

    // Update engineer activity
    this.updateEngineerActivity(config.engineer);

    // Emit event
    this.emitEvent({
      type: 'command_received',
      engineer: config.engineer,
      channelId: context.channelId,
      timestamp: new Date().toISOString(),
      data: { command },
    });

    // Route to appropriate handler
    return this.routeCommand(command, context, config);
  }

  /**
   * Handle button click from Slack
   */
  async handleButtonClick(
    actionId: string,
    value: string,
    context: CommandContext
  ): Promise<CommandResult> {
    const config = this.channelConfigs.get(context.channelId);
    if (!config) {
      return { success: false, error: 'Channel not configured' };
    }

    // Map button actions to semantic commands
    const buttonCommands: Record<string, SemanticCommand> = {
      'approve': { type: 'approved', source: 'slack', raw: 'approved' },
      'reject': { type: 'reject', source: 'slack', raw: 'reject' },
      'go': { type: 'go', source: 'slack', raw: 'go' },
      'continue': { type: 'go', source: 'slack', raw: 'continue' },
      'merge': { type: 'merge', source: 'slack', raw: 'merge' },
      'rebase': { type: 'rebase', source: 'slack', raw: 'rebase' },
    };

    const command = buttonCommands[actionId];
    if (!command) {
      return { success: false, error: `Unknown action: ${actionId}` };
    }

    // Add value as payload if present
    if (value) {
      command.payload = { ...command.payload, target: value };
    }

    this.updateEngineerActivity(config.engineer);

    return this.routeCommand(command, context, config);
  }

  /**
   * Route command to appropriate handler
   */
  private async routeCommand(
    command: SemanticCommand,
    context: CommandContext,
    config: SlackChannelConfig
  ): Promise<CommandResult> {
    switch (command.type) {
      case 'start_loop':
        return this.handleStartLoop(command, context, config);

      case 'go':
      case 'approved':
        return this.handleApproval(command, context, config);

      case 'reject':
      case 'changes':
        return this.handleRejection(command, context, config);

      case 'merge':
        return this.handleMerge(context, config);

      case 'rebase':
        return this.handleRebase(context, config);

      case 'status':
        return this.handleStatus(context, config);

      case 'show':
        return this.handleShow(command, context, config);

      case 'capture':
        return this.handleCapture(command, context, config);

      default:
        return { success: false, error: `Unknown command type: ${command.type}` };
    }
  }

  /**
   * Handle start_loop command
   */
  private async handleStartLoop(
    command: SemanticCommand,
    context: CommandContext,
    config: SlackChannelConfig
  ): Promise<CommandResult> {
    const loopId = command.payload?.loopId || config.defaultLoop || 'engineering-loop';
    const target = command.payload?.target;

    // Generate branch name
    const branchName = target
      ? `${config.branchPrefix}${target.replace(/\s+/g, '-').toLowerCase()}`
      : `${config.branchPrefix}loop-${Date.now()}`;

    // Create execution (would integrate with ExecutionEngine)
    const executionId = `exec-${Date.now()}`;

    // Create thread for this execution
    const threadTitle = this.threadManager.generateThreadTitle(loopId, target || 'default', branchName);

    // Note: In real implementation, we'd post to Slack and get the threadTs
    // For now, generate a placeholder
    const threadTs = `${Date.now()}.000000`;

    const thread = await this.threadManager.createThread({
      threadTs,
      channelId: context.channelId,
      executionId,
      loopId,
      target: target || 'default',
      branch: branchName,
      engineer: config.engineer,
    });

    // Update engineer status
    const status = this.engineerStatus.get(config.engineer);
    if (status) {
      status.activeExecution = {
        executionId,
        loopId,
        target: target || 'default',
        phase: 'INIT',
        threadTs,
      };
      status.currentBranch = branchName;
    }

    this.emitEvent({
      type: 'thread_created',
      engineer: config.engineer,
      channelId: context.channelId,
      timestamp: new Date().toISOString(),
      data: { thread },
    });

    return {
      success: true,
      message: `Started ${loopId} for ${target || 'default'} on branch ${branchName}`,
      threadTs,
      executionId,
    };
  }

  /**
   * Handle approval commands (go, approved)
   */
  private async handleApproval(
    command: SemanticCommand,
    context: CommandContext,
    config: SlackChannelConfig
  ): Promise<CommandResult> {
    // Get thread context
    if (!context.threadTs) {
      return { success: false, error: 'Approval must be in a thread' };
    }

    const threadContext = this.threadManager.getThreadContext(context.threadTs);
    if (!threadContext) {
      return { success: false, error: 'Thread not found or not associated with an execution' };
    }

    // Would integrate with ExecutionEngine to approve gate
    await this.threadManager.touchThread(context.threadTs);

    return {
      success: true,
      message: `${command.type === 'go' ? 'Continuing' : 'Approved'}`,
      executionId: threadContext.thread.executionId,
    };
  }

  /**
   * Handle rejection commands (reject, changes)
   */
  private async handleRejection(
    command: SemanticCommand,
    context: CommandContext,
    config: SlackChannelConfig
  ): Promise<CommandResult> {
    if (!context.threadTs) {
      return { success: false, error: 'Rejection must be in a thread' };
    }

    const threadContext = this.threadManager.getThreadContext(context.threadTs);
    if (!threadContext) {
      return { success: false, error: 'Thread not found' };
    }

    const reason = command.payload?.reason || 'No reason provided';

    // Would integrate with ExecutionEngine to reject gate
    await this.threadManager.touchThread(context.threadTs);

    return {
      success: true,
      message: `${command.type === 'reject' ? 'Rejected' : 'Changes requested'}: ${reason}`,
      executionId: threadContext.thread.executionId,
    };
  }

  /**
   * Handle merge command
   */
  private async handleMerge(
    context: CommandContext,
    config: SlackChannelConfig
  ): Promise<CommandResult> {
    const status = this.engineerStatus.get(config.engineer);
    if (!status?.currentBranch) {
      return { success: false, error: 'No active branch to merge' };
    }

    const mergeRequest = await this.mergeWorkflow.initiateMerge({
      engineer: config.engineer,
      branch: status.currentBranch,
      worktreePath: config.worktreePath,
      executionId: status.activeExecution?.executionId,
    });

    if (mergeRequest.status === 'conflicts') {
      return {
        success: false,
        error: `Conflicts detected in: ${mergeRequest.conflictFiles?.join(', ')}`,
      };
    }

    if (mergeRequest.status === 'ready') {
      const result = await this.mergeWorkflow.executeMerge(
        mergeRequest.id,
        config.worktreePath
      );

      if (result.success) {
        return {
          success: true,
          message: `Merged ${status.currentBranch} to main`,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Merge failed',
        };
      }
    }

    return {
      success: false,
      error: `Unexpected merge status: ${mergeRequest.status}`,
    };
  }

  /**
   * Handle rebase command
   */
  private async handleRebase(
    context: CommandContext,
    config: SlackChannelConfig
  ): Promise<CommandResult> {
    const status = this.engineerStatus.get(config.engineer);
    if (!status?.currentBranch) {
      return { success: false, error: 'No active branch to rebase' };
    }

    const rebaseRequest = await this.mergeWorkflow.initiateRebase({
      engineer: config.engineer,
      branch: status.currentBranch,
      worktreePath: config.worktreePath,
    });

    const result = await this.mergeWorkflow.executeRebase(
      rebaseRequest.id,
      config.worktreePath
    );

    if (result.success) {
      return {
        success: true,
        message: `Rebased ${status.currentBranch} from main`,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Rebase failed',
      };
    }
  }

  /**
   * Handle status command
   */
  private async handleStatus(
    context: CommandContext,
    config: SlackChannelConfig
  ): Promise<CommandResult> {
    const status = this.engineerStatus.get(config.engineer);
    if (!status) {
      return { success: false, error: 'Engineer status not found' };
    }

    // Get branch status if there's an active branch
    let branchStatus: BranchStatus | undefined;
    if (status.currentBranch) {
      branchStatus = await this.mergeWorkflow.getBranchStatus(
        config.worktreePath,
        status.currentBranch
      );
      branchStatus.engineer = config.engineer;
    }

    const statusMessage = this.formatStatus(status, branchStatus);

    return {
      success: true,
      message: statusMessage,
    };
  }

  /**
   * Handle show command
   */
  private async handleShow(
    command: SemanticCommand,
    context: CommandContext,
    config: SlackChannelConfig
  ): Promise<CommandResult> {
    const deliverable = command.payload?.deliverable;
    if (!deliverable) {
      return { success: false, error: 'No deliverable specified' };
    }

    // Would integrate with artifact system to fetch content
    return {
      success: true,
      message: `Showing: ${deliverable}`,
    };
  }

  /**
   * Handle capture command (inbox capture)
   */
  private async handleCapture(
    command: SemanticCommand,
    context: CommandContext,
    config: SlackChannelConfig
  ): Promise<CommandResult> {
    const url = command.payload?.url;
    const content = command.payload?.content;

    if (!url && !content) {
      return { success: false, error: 'No content or URL to capture' };
    }

    // Emit capture event for external handling by InboxProcessor
    this.emitEvent({
      type: 'command_received',
      engineer: config.engineer,
      channelId: context.channelId,
      timestamp: new Date().toISOString(),
      data: {
        command: 'capture',
        url,
        content,
        threadTs: context.threadTs,
      },
    });

    // Return success - actual processing happens via event listener
    // This allows InboxProcessor to be wired up externally
    return {
      success: true,
      message: url
        ? `Captured URL: ${url}`
        : `Captured content (${content?.length || 0} chars)`,
    };
  }

  /**
   * Handle merge complete - notify other engineers
   */
  private async handleMergeComplete(notification: MainUpdateNotification): Promise<void> {
    this.emitEvent({
      type: 'merge_complete',
      engineer: notification.engineer,
      channelId: '', // Will be filled per notification
      timestamp: notification.timestamp,
      data: { notification },
    });

    // Notify all other engineers
    for (const [engineer, status] of this.engineerStatus.entries()) {
      if (engineer === notification.engineer) continue;
      if (!status.currentBranch) continue;

      const config = this.channelConfigs.get(status.channelId);
      if (!config) continue;

      // Get their branch status relative to new main
      const branchStatus = await this.mergeWorkflow.getBranchStatus(
        config.worktreePath,
        status.currentBranch
      );

      // Would post notification to their channel
      // For now, just update their status
      status.branchStatus = {
        ...branchStatus,
        engineer,
      };
    }
  }

  /**
   * Handle conflict detected
   */
  private async handleConflictDetected(request: unknown): Promise<void> {
    this.emitEvent({
      type: 'conflict_detected',
      engineer: '',
      channelId: '',
      timestamp: new Date().toISOString(),
      data: { request },
    });
  }

  /**
   * Format status for display
   */
  private formatStatus(status: EngineerStatus, branchStatus?: BranchStatus): string {
    const lines: string[] = [
      `Engineer: ${status.engineer}`,
      `Branch: ${status.currentBranch || 'none'}`,
    ];

    if (status.activeExecution) {
      lines.push(`Loop: ${status.activeExecution.loopId}`);
      lines.push(`Phase: ${status.activeExecution.phase}`);
      lines.push(`Target: ${status.activeExecution.target}`);
    }

    if (branchStatus) {
      lines.push(`Behind main: ${branchStatus.behindMain} commits`);
      lines.push(`Ahead of main: ${branchStatus.aheadOfMain} commits`);
      if (branchStatus.potentialConflicts.length > 0) {
        lines.push(`Potential conflicts: ${branchStatus.potentialConflicts.join(', ')}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Update engineer activity timestamp
   */
  private updateEngineerActivity(engineer: string): void {
    const status = this.engineerStatus.get(engineer);
    if (status) {
      status.lastActivityAt = new Date().toISOString();
    }
  }

  /**
   * Emit integration event
   */
  private emitEvent(event: SlackIntegrationEvent): void {
    if (this.options.onEvent) {
      this.options.onEvent(event);
    }
  }

  /**
   * Get engineer status
   */
  getEngineerStatus(engineer: string): EngineerStatus | null {
    return this.engineerStatus.get(engineer) || null;
  }

  /**
   * Get all active threads
   */
  getActiveThreads(channelId?: string): ExecutionThread[] {
    if (channelId) {
      return this.threadManager.getActiveThreads(channelId);
    }
    return this.threadManager.listThreads({ status: 'active' });
  }

  /**
   * Get command parser for external use
   */
  getCommandParser(): SlackCommandParser {
    return this.commandParser;
  }

  /**
   * Get thread manager for external use
   */
  getThreadManager(): SlackThreadManager {
    return this.threadManager;
  }

  /**
   * Get merge workflow for external use
   */
  getMergeWorkflow(): SlackMergeWorkflow {
    return this.mergeWorkflow;
  }
}
