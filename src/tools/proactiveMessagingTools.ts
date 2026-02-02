/**
 * MCP Tools for Proactive Messaging Service
 *
 * Tools for managing multi-channel notifications and bidirectional communication.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { ProactiveMessagingService } from '../services/proactive-messaging/index.js';

// ============================================================================
// Tool Definitions
// ============================================================================

export const proactiveMessagingTools: Tool[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Sending Notifications
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'send_notification',
    description: 'Send a custom notification to all enabled channels (terminal + Slack).',
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
    description: 'Send notification that a gate is waiting for approval.',
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

  // ─────────────────────────────────────────────────────────────────────────
  // Pending Interactions
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_pending_interactions',
    description: 'List gates, proposals, and other items awaiting response.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'respond_to_interaction',
    description: 'Programmatically respond to a pending interaction.',
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
    description: 'Enable/disable channels and set configuration (Slack tokens, etc.).',
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
    description: 'Get current proactive messaging configuration.',
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
    description: 'Check connection status for all messaging channels.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'test_messaging_channel',
    description: 'Send a test message to verify channel setup.',
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
    description: 'List recent notification conversations and their responses.',
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
    description: 'Get statistics about messaging channels and interactions.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// ============================================================================
// Tool Handlers
// ============================================================================

export function createProactiveMessagingToolHandlers(service: ProactiveMessagingService) {
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
  };
}
