/**
 * MCP Tools for Proactive Messaging Service
 *
 * Tools for managing multi-channel notifications and bidirectional communication.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { ProactiveMessagingService } from '../services/proactive-messaging/index.js';
import type { InstallStateService } from '../services/InstallStateService.js';
import type { DreamEngine } from '../services/dreaming/index.js';
import type { RoadmapService } from '../services/roadmapping/RoadmapService.js';
import type { RoadmapDriftStatus, RoadmapMove } from '../services/proactive-messaging/types.js';

// ============================================================================
// Tool Definitions
// ============================================================================

export const proactiveMessagingTools: Tool[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Sending Notifications
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'send_notification',
    description: 'Sending notification — delivers to all enabled channels',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Notification title',
        },
        message: {
          type: 'string',
          description: 'Notification message body',
        },
        actions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              value: { type: 'string' },
            },
            required: ['label', 'value'],
          },
          description: 'Optional action buttons',
        },
      },
      required: ['title', 'message'],
    },
  },
  {
    name: 'notify_gate_waiting',
    description: 'Notifying gate approval — alerts channels about waiting gate',
    inputSchema: {
      type: 'object',
      properties: {
        gateId: {
          type: 'string',
          description: 'Gate identifier',
        },
        executionId: {
          type: 'string',
          description: 'Execution identifier',
        },
        loopId: {
          type: 'string',
          description: 'Loop identifier',
        },
        phase: {
          type: 'string',
          description: 'Current phase',
        },
        deliverables: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of deliverables ready for review',
        },
      },
      required: ['gateId', 'executionId', 'loopId', 'phase'],
    },
  },
  {
    name: 'notify_loop_complete',
    description: 'Notifying loop completion — alerts channels about finished loop',
    inputSchema: {
      type: 'object',
      properties: {
        loopId: {
          type: 'string',
          description: 'Loop identifier (e.g., "engineering-loop")',
        },
        executionId: {
          type: 'string',
          description: 'Execution identifier',
        },
        module: {
          type: 'string',
          description: 'Module that was completed',
        },
        summary: {
          type: 'string',
          description: 'Brief summary of what was accomplished',
        },
        deliverables: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of deliverables produced',
        },
      },
      required: ['loopId', 'executionId', 'module', 'summary'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Pending Interactions
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_pending_interactions',
    description: 'Listing pending interactions — retrieves items awaiting response',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'respond_to_interaction',
    description: 'Responding to interaction — processes pending item response',
    inputSchema: {
      type: 'object',
      properties: {
        interactionId: {
          type: 'string',
          description: 'Interaction ID (or "latest" for most recent)',
        },
        action: {
          type: 'string',
          enum: ['approve', 'reject', 'continue'],
          description: 'Action to take',
        },
        reason: {
          type: 'string',
          description: 'Reason (for reject action)',
        },
      },
      required: ['interactionId', 'action'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Channel Configuration
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'configure_messaging_channel',
    description: 'Configuring messaging — enables/disables channels and sets tokens',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          enum: ['terminal', 'slack'],
          description: 'Channel to configure',
        },
        enabled: {
          type: 'boolean',
          description: 'Enable or disable the channel',
        },
        botToken: {
          type: 'string',
          description: 'Slack bot token (xoxb-...)',
        },
        appToken: {
          type: 'string',
          description: 'Slack app token (xapp-...)',
        },
        channelId: {
          type: 'string',
          description: 'Slack channel ID',
        },
        osNotifications: {
          type: 'boolean',
          description: 'Enable OS-level notifications (terminal only)',
        },
      },
      required: ['channel'],
    },
  },
  {
    name: 'get_messaging_config',
    description: 'Checking messaging config — retrieves channel settings',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Status & Testing
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_channel_status',
    description: 'Checking channel connections — tests all messaging channels',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'test_messaging_channel',
    description: 'Testing messaging — sends verification message to channel',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          enum: ['terminal', 'slack'],
          description: 'Channel to test',
        },
      },
      required: ['channel'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // History & Stats
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'list_message_conversations',
    description: 'Listing notification history — retrieves recent conversations',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of conversations to return',
        },
      },
    },
  },
  {
    name: 'get_messaging_stats',
    description: 'Checking messaging statistics — retrieves channel and interaction metrics',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Daily Status
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'check_daily_status',
    description: 'Checking daily status — shows welcome message if first call of day',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Pending Tasks (from Slack)
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_pending_slack_tasks',
    description: 'Loading queued tasks — retrieves Slack-queued items needing handling',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'complete_slack_task',
    description: 'Completing queued task — marks Slack-queued item as handled',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'Task ID to mark as completed',
        },
      },
      required: ['taskId'],
    },
  },
];

// ============================================================================
// Tool Handlers
// ============================================================================

export function createProactiveMessagingToolHandlers(
  service: ProactiveMessagingService,
  installStateService?: InstallStateService,
  dreamEngine?: DreamEngine,
  repoPath?: string,
  roadmapService?: RoadmapService
) {
  return {
    send_notification: async (params: unknown) => {
      const args = params as { title: string; message: string; actions?: Array<{ label: string; value: string }> };
      if (!args?.title || !args?.message) {
        return { error: 'title and message are required' };
      }

      const interactionId = await service.sendNotification(args.title, args.message, args.actions);
      return {
        success: true,
        interactionId,
        message: 'Notification sent to all enabled channels',
      };
    },

    notify_gate_waiting: async (params: unknown) => {
      const args = params as {
        gateId: string;
        executionId: string;
        loopId: string;
        phase: string;
        deliverables?: string[];
      };
      if (!args?.gateId || !args?.executionId || !args?.loopId || !args?.phase) {
        return { error: 'gateId, executionId, loopId, and phase are required' };
      }

      const interactionId = await service.notifyGateWaiting(
        args.gateId,
        args.executionId,
        args.loopId,
        args.phase,
        args.deliverables || []
      );

      return {
        success: true,
        interactionId,
        message: `Gate notification sent for ${args.gateId}`,
      };
    },

    notify_loop_complete: async (params: unknown) => {
      const args = params as {
        loopId: string;
        executionId: string;
        module: string;
        summary: string;
        deliverables?: string[];
      };
      if (!args?.loopId || !args?.executionId || !args?.module || !args?.summary) {
        return { error: 'loopId, executionId, module, and summary are required' };
      }

      const interactionId = await service.notifyLoopComplete(
        args.loopId,
        args.executionId,
        args.module,
        args.summary,
        args.deliverables || []
      );

      return {
        success: true,
        interactionId,
        message: `Loop complete notification sent for ${args.loopId} -> ${args.module}`,
      };
    },

    get_pending_interactions: async () => {
      const pending = service.getPendingInteractions();
      return {
        success: true,
        count: pending.length,
        interactions: pending.map(i => ({
          id: i.id,
          type: i.event.type,
          sentAt: i.sentAt,
          channels: i.channels,
          expiresAt: i.expiresAt,
        })),
      };
    },

    respond_to_interaction: async (params: unknown) => {
      const args = params as { interactionId: string; action: 'approve' | 'reject' | 'continue'; reason?: string };
      if (!args?.interactionId || !args?.action) {
        return { error: 'interactionId and action are required' };
      }

      const interaction = service.getInteraction(args.interactionId);
      if (!interaction) {
        return { error: `Interaction not found: ${args.interactionId}` };
      }

      // The service's command handler will process this
      // For now, return what would happen
      return {
        success: true,
        interaction: {
          id: interaction.id,
          type: interaction.event.type,
          action: args.action,
        },
        message: `Would ${args.action} interaction ${args.interactionId}`,
      };
    },

    configure_messaging_channel: async (params: unknown) => {
      const args = params as {
        channel: 'terminal' | 'slack';
        enabled?: boolean;
        botToken?: string;
        appToken?: string;
        channelId?: string;
        osNotifications?: boolean;
      };
      if (!args?.channel) {
        return { error: 'channel is required' };
      }

      const config: Record<string, unknown> = {};
      if (args.enabled !== undefined) config.enabled = args.enabled;

      if (args.channel === 'slack') {
        if (args.botToken) config.botToken = args.botToken;
        if (args.appToken) config.appToken = args.appToken;
        if (args.channelId) config.channelId = args.channelId;
      } else if (args.channel === 'terminal') {
        if (args.osNotifications !== undefined) config.osNotifications = args.osNotifications;
      }

      await service.configureChannel(args.channel, config);

      return {
        success: true,
        channel: args.channel,
        message: `Channel ${args.channel} configured`,
      };
    },

    get_messaging_config: async () => {
      const config = service.getConfig();
      // Redact sensitive tokens
      const redacted = {
        ...config,
        channels: {
          ...config.channels,
          slack: {
            ...config.channels.slack,
            botToken: config.channels.slack.botToken ? '***' : undefined,
            appToken: config.channels.slack.appToken ? '***' : undefined,
          },
        },
      };
      return { success: true, config: redacted };
    },

    get_channel_status: async () => {
      const statuses = service.getChannelStatus();
      return {
        success: true,
        channels: statuses,
      };
    },

    test_messaging_channel: async (params: unknown) => {
      const args = params as { channel: string };
      if (!args?.channel) {
        return { error: 'channel is required' };
      }

      const result = await service.testChannel(args.channel);
      return result;
    },

    list_message_conversations: async (params: unknown) => {
      const args = (params || {}) as { limit?: number };
      const conversations = service.getConversationHistory(args.limit || 20);
      return {
        success: true,
        count: conversations.length,
        conversations: conversations.map(c => ({
          id: c.id,
          eventType: c.event.type,
          sentAt: c.sentAt,
          status: c.status,
          channels: c.channels,
          response: c.response
            ? {
                action: c.response.command.type,
                respondedAt: c.response.respondedAt,
                channel: c.response.channel,
              }
            : undefined,
        })),
      };
    },

    get_messaging_stats: async () => {
      const stats = service.getStats();
      return { success: true, stats };
    },

    check_daily_status: async () => {
      if (!installStateService) {
        return {
          success: false,
          error: 'Install state service not available',
        };
      }

      // Record interaction and check if first of day
      const { isFirstOfDay, isFreshInstall } = await installStateService.recordInteraction();
      const state = installStateService.getState();

      // Check for updates from GitHub (only on first call of day to avoid rate limits)
      if (isFirstOfDay) {
        try {
          const response = await fetch('https://api.github.com/repos/miles-knowbl/orchestrator/releases/latest');
          if (response.ok) {
            const release = await response.json() as { tag_name?: string; name?: string };
            const latestVersion = release.tag_name?.replace(/^v/, '') || release.name?.match(/(\d+\.\d+\.\d+)/)?.[1];
            if (latestVersion) {
              await installStateService.recordUpdateCheck(latestVersion);
            }
          }
        } catch {
          // Ignore fetch errors - version check is best effort
        }
      }

      const versionStatus = installStateService.getVersionStatus();

      // Get pending proposals count from dream engine if available
      let pendingProposals = 0;
      if (dreamEngine) {
        try {
          const proposals = dreamEngine.listProposals({ status: 'pending' });
          pendingProposals = proposals.length;
        } catch {
          // Ignore errors
        }
      }

      // Get roadmap status if available
      let hasRoadmap = false;
      let roadmapDrift: RoadmapDriftStatus | undefined;
      let availableMoves: RoadmapMove[] | undefined;
      let dreamStateComplete = 0;
      let dreamStateTotal = 0;

      if (roadmapService && repoPath) {
        try {
          const progress = roadmapService.getProgress();
          hasRoadmap = progress.totalModules > 0;

          if (hasRoadmap) {
            // Get available moves (leverage scores)
            const leverageScores = roadmapService.calculateLeverageScores();
            availableMoves = leverageScores.slice(0, 3).map(s => ({
              moduleId: s.moduleId,
              moduleName: s.moduleName,
              score: s.score,
              layer: s.layer,
              description: s.description,
            }));

            // Parse Dream State JSON to get completion for drift detection
            const fs = await import('fs/promises');
            const path = await import('path');
            const dreamStateJsonPath = path.join(repoPath, '.claude', 'dream-state.json');
            try {
              const content = await fs.readFile(dreamStateJsonPath, 'utf-8');
              const dreamState = JSON.parse(content);
              const modules = dreamState.modules || [];
              dreamStateTotal = modules.length;
              dreamStateComplete = modules.filter((m: { status: string }) => m.status === 'complete').length;
            } catch {
              // Dream State doesn't exist or can't be read
            }

            // Calculate drift
            const driftAmount = Math.abs(progress.completeModules - dreamStateComplete);
            roadmapDrift = {
              hasDrift: driftAmount > 0,
              roadmapComplete: progress.completeModules,
              roadmapTotal: progress.totalModules,
              roadmapPercentage: progress.overallPercentage,
              dreamStateComplete,
              dreamStateTotal,
              dreamStatePercentage: dreamStateTotal > 0 ? Math.round((dreamStateComplete / dreamStateTotal) * 100) : 0,
              driftAmount,
              lastSyncAt: installStateService.getLastRoadmapSync().syncedAt,
            };
          }
        } catch {
          // Ignore roadmap errors
        }
      }

      // If first call of day or fresh install, send welcome message
      if (isFirstOfDay && repoPath) {
        await service.sendDailyWelcome({
          greeting: installStateService.getGreeting(),
          version: state.installedVersion,
          versionStatus: versionStatus.status === 'unknown' ? 'current' : versionStatus.status,
          latestVersion: versionStatus.latestVersion,
          repoPath,
          pendingProposals,
          hasRoadmap,
          roadmapDrift,
          availableMoves,
        });
      }

      return {
        success: true,
        isFirstOfDay,
        isFreshInstall,
        greeting: installStateService.getGreeting(),
        version: state.installedVersion,
        versionStatus: versionStatus.status,
        latestVersion: versionStatus.latestVersion,
        totalInteractions: state.totalInteractions,
        lastInteractionDate: state.lastInteractionDate,
        pendingProposals,
        welcomeMessageSent: isFirstOfDay,
        hasRoadmap,
        roadmapDrift,
        availableMoves,
      };
    },

    get_pending_slack_tasks: async () => {
      const tasks = service.getPendingTasks();
      if (tasks.length === 0) {
        return {
          success: true,
          count: 0,
          tasks: [],
          message: 'No pending tasks from Slack',
        };
      }

      return {
        success: true,
        count: tasks.length,
        tasks: tasks.map(t => ({
          id: t.id,
          type: t.type,
          executionId: t.executionId,
          gateId: t.gateId,
          deliverables: t.deliverables,
          createdAt: t.createdAt,
          requestedVia: t.requestedVia,
        })),
        message: `${tasks.length} pending task(s) from Slack. Handle them and call complete_slack_task when done.`,
      };
    },

    complete_slack_task: async (params: unknown) => {
      const args = params as { taskId: string };
      if (!args?.taskId) {
        return { error: 'taskId is required' };
      }

      const task = service.getTask(args.taskId);
      if (!task) {
        return { error: `Task not found: ${args.taskId}` };
      }

      service.completeTask(args.taskId);

      return {
        success: true,
        taskId: args.taskId,
        message: `Task ${args.taskId} marked as completed`,
      };
    },
  };
}
