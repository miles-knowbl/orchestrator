/**
 * MCP Tools for Slack Integration Service
 *
 * Tools for managing full bidirectional Slack control with channel parity.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { SlackIntegrationService } from '../services/slack-integration/index.js';

// ============================================================================
// Tool Definitions
// ============================================================================

export const slackIntegrationTools: Tool[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Channel Configuration
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'configure_slack_channel',
    description: 'Configure a Slack channel for an engineer (channel = engineer = worktree = branch).',
    inputSchema: {
      type: 'object',
      properties: {
        channelId: {
          type: 'string',
          description: 'Slack channel ID (e.g., C0ALICE)',
        },
        engineer: {
          type: 'string',
          description: 'Engineer username',
        },
        projectPath: {
          type: 'string',
          description: 'Path to the main project repository',
        },
        worktreePath: {
          type: 'string',
          description: 'Path to the engineer worktree',
        },
        branchPrefix: {
          type: 'string',
          description: 'Branch prefix for this engineer (e.g., "alice/")',
        },
        botToken: {
          type: 'string',
          description: 'Slack bot token (xoxb-...)',
        },
        appToken: {
          type: 'string',
          description: 'Slack app token (xapp-...)',
        },
        defaultLoop: {
          type: 'string',
          description: 'Default loop to start if none specified',
        },
        autoRebase: {
          type: 'boolean',
          description: 'Auto-rebase when main is updated',
        },
      },
      required: ['channelId', 'engineer', 'projectPath', 'worktreePath', 'branchPrefix'],
    },
  },
  {
    name: 'list_slack_channels',
    description: 'List all configured Slack channels and their engineers.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Thread Management
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_slack_threads',
    description: 'Get active threads for a channel or engineer.',
    inputSchema: {
      type: 'object',
      properties: {
        channelId: {
          type: 'string',
          description: 'Filter by channel ID',
        },
        engineer: {
          type: 'string',
          description: 'Filter by engineer',
        },
        status: {
          type: 'string',
          enum: ['active', 'complete', 'failed'],
          description: 'Filter by thread status',
        },
        limit: {
          type: 'number',
          description: 'Maximum threads to return',
        },
      },
    },
  },
  {
    name: 'get_thread_context',
    description: 'Get full context for a specific thread.',
    inputSchema: {
      type: 'object',
      properties: {
        threadTs: {
          type: 'string',
          description: 'Thread timestamp identifier',
        },
      },
      required: ['threadTs'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Command Processing
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'send_slack_command',
    description: 'Send a semantic command as if from Slack (for testing).',
    inputSchema: {
      type: 'object',
      properties: {
        channelId: {
          type: 'string',
          description: 'Channel to send command in',
        },
        threadTs: {
          type: 'string',
          description: 'Thread timestamp (optional)',
        },
        command: {
          type: 'string',
          description: 'Command text (e.g., "go", "approved", "merge")',
        },
        engineer: {
          type: 'string',
          description: 'Engineer sending the command',
        },
      },
      required: ['channelId', 'command', 'engineer'],
    },
  },
  {
    name: 'parse_slack_command',
    description: 'Parse text into a semantic command without executing.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to parse',
        },
      },
      required: ['text'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Engineer Status
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_engineer_status',
    description: 'Get current work status for an engineer.',
    inputSchema: {
      type: 'object',
      properties: {
        engineer: {
          type: 'string',
          description: 'Engineer username',
        },
      },
      required: ['engineer'],
    },
  },
  {
    name: 'list_engineers',
    description: 'List all registered engineers and their status.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Merge/Rebase Workflow
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'trigger_merge',
    description: 'Trigger merge workflow for an engineer branch to main.',
    inputSchema: {
      type: 'object',
      properties: {
        engineer: {
          type: 'string',
          description: 'Engineer whose branch to merge',
        },
        branch: {
          type: 'string',
          description: 'Branch to merge (optional, uses current branch)',
        },
      },
      required: ['engineer'],
    },
  },
  {
    name: 'trigger_rebase',
    description: 'Trigger rebase workflow to update engineer branch from main.',
    inputSchema: {
      type: 'object',
      properties: {
        engineer: {
          type: 'string',
          description: 'Engineer whose branch to rebase',
        },
        branch: {
          type: 'string',
          description: 'Branch to rebase (optional, uses current branch)',
        },
      },
      required: ['engineer'],
    },
  },
  {
    name: 'get_branch_status',
    description: 'Check branch status relative to main (behind/ahead, potential conflicts).',
    inputSchema: {
      type: 'object',
      properties: {
        engineer: {
          type: 'string',
          description: 'Engineer username',
        },
        branch: {
          type: 'string',
          description: 'Branch to check (optional, uses current branch)',
        },
      },
      required: ['engineer'],
    },
  },
  {
    name: 'get_pending_merges',
    description: 'Get pending merge requests for an engineer.',
    inputSchema: {
      type: 'object',
      properties: {
        engineer: {
          type: 'string',
          description: 'Engineer username',
        },
      },
      required: ['engineer'],
    },
  },
  {
    name: 'get_pending_rebases',
    description: 'Get pending rebase requests for an engineer.',
    inputSchema: {
      type: 'object',
      properties: {
        engineer: {
          type: 'string',
          description: 'Engineer username',
        },
      },
      required: ['engineer'],
    },
  },
];

// ============================================================================
// Tool Handlers
// ============================================================================

export function createSlackIntegrationToolHandlers(service: SlackIntegrationService) {
  return {
    configure_slack_channel: async (params: unknown) => {
      const args = params as {
        channelId: string;
        engineer: string;
        projectPath: string;
        worktreePath: string;
        branchPrefix: string;
        botToken?: string;
        appToken?: string;
        defaultLoop?: string;
        autoRebase?: boolean;
      };

      if (!args?.channelId || !args?.engineer || !args?.projectPath || !args?.worktreePath || !args?.branchPrefix) {
        return { error: 'channelId, engineer, projectPath, worktreePath, and branchPrefix are required' };
      }

      service.registerChannel({
        channelId: args.channelId,
        enabled: true,
        botToken: args.botToken || '',
        appToken: args.appToken || '',
        socketMode: true,
        engineer: args.engineer,
        projectPath: args.projectPath,
        worktreePath: args.worktreePath,
        branchPrefix: args.branchPrefix,
        defaultLoop: args.defaultLoop,
        autoRebase: args.autoRebase,
      });

      return {
        success: true,
        message: `Channel ${args.channelId} configured for engineer ${args.engineer}`,
      };
    },

    list_slack_channels: async () => {
      const engineers = service.getEngineers();
      const channels = engineers.map(engineer => {
        const status = service.getEngineerStatus(engineer);
        return {
          engineer,
          channelId: status?.channelId,
          projectPath: status?.projectPath,
          worktreePath: status?.worktreePath,
          currentBranch: status?.currentBranch,
          activeExecution: status?.activeExecution,
        };
      });

      return {
        success: true,
        count: channels.length,
        channels,
      };
    },

    get_slack_threads: async (params: unknown) => {
      const args = (params || {}) as {
        channelId?: string;
        engineer?: string;
        status?: 'active' | 'complete' | 'failed';
        limit?: number;
      };

      const threadManager = service.getThreadManager();
      const threads = threadManager.listThreads({
        channelId: args.channelId,
        engineer: args.engineer,
        status: args.status,
        limit: args.limit,
      });

      return {
        success: true,
        count: threads.length,
        threads,
      };
    },

    get_thread_context: async (params: unknown) => {
      const args = params as { threadTs: string };
      if (!args?.threadTs) {
        return { error: 'threadTs is required' };
      }

      const threadManager = service.getThreadManager();
      const context = threadManager.getThreadContext(args.threadTs);

      if (!context) {
        return { error: 'Thread not found' };
      }

      return {
        success: true,
        context,
      };
    },

    send_slack_command: async (params: unknown) => {
      const args = params as {
        channelId: string;
        threadTs?: string;
        command: string;
        engineer: string;
      };

      if (!args?.channelId || !args?.command || !args?.engineer) {
        return { error: 'channelId, command, and engineer are required' };
      }

      const result = await service.handleMessage(args.command, {
        channelId: args.channelId,
        threadTs: args.threadTs,
        userId: args.engineer,
        engineer: args.engineer,
      });

      return result;
    },

    parse_slack_command: async (params: unknown) => {
      const args = params as { text: string };
      if (!args?.text) {
        return { error: 'text is required' };
      }

      const parser = service.getCommandParser();
      const command = parser.parse(args.text, 'slack');

      return {
        success: true,
        isCommand: parser.isCommand(args.text),
        command,
      };
    },

    get_engineer_status: async (params: unknown) => {
      const args = params as { engineer: string };
      if (!args?.engineer) {
        return { error: 'engineer is required' };
      }

      const status = service.getEngineerStatus(args.engineer);
      if (!status) {
        return { error: `Engineer not found: ${args.engineer}` };
      }

      return {
        success: true,
        status,
      };
    },

    list_engineers: async () => {
      const engineers = service.getEngineers();
      const statuses = engineers.map(engineer => ({
        engineer,
        ...service.getEngineerStatus(engineer),
      }));

      return {
        success: true,
        count: engineers.length,
        engineers: statuses,
      };
    },

    trigger_merge: async (params: unknown) => {
      const args = params as { engineer: string; branch?: string };
      if (!args?.engineer) {
        return { error: 'engineer is required' };
      }

      const status = service.getEngineerStatus(args.engineer);
      if (!status) {
        return { error: `Engineer not found: ${args.engineer}` };
      }

      const result = await service.handleMessage('merge', {
        channelId: status.channelId,
        userId: args.engineer,
        engineer: args.engineer,
      });

      return result;
    },

    trigger_rebase: async (params: unknown) => {
      const args = params as { engineer: string; branch?: string };
      if (!args?.engineer) {
        return { error: 'engineer is required' };
      }

      const status = service.getEngineerStatus(args.engineer);
      if (!status) {
        return { error: `Engineer not found: ${args.engineer}` };
      }

      const result = await service.handleMessage('rebase', {
        channelId: status.channelId,
        userId: args.engineer,
        engineer: args.engineer,
      });

      return result;
    },

    get_branch_status: async (params: unknown) => {
      const args = params as { engineer: string; branch?: string };
      if (!args?.engineer) {
        return { error: 'engineer is required' };
      }

      const status = service.getEngineerStatus(args.engineer);
      if (!status) {
        return { error: `Engineer not found: ${args.engineer}` };
      }

      const branch = args.branch || status.currentBranch;
      if (!branch) {
        return { error: 'No active branch' };
      }

      const mergeWorkflow = service.getMergeWorkflow();
      const branchStatus = await mergeWorkflow.getBranchStatus(status.worktreePath, branch);

      return {
        success: true,
        status: {
          ...branchStatus,
          engineer: args.engineer,
        },
      };
    },

    get_pending_merges: async (params: unknown) => {
      const args = params as { engineer: string };
      if (!args?.engineer) {
        return { error: 'engineer is required' };
      }

      const mergeWorkflow = service.getMergeWorkflow();
      const pending = mergeWorkflow.getPendingMerges(args.engineer);

      return {
        success: true,
        count: pending.length,
        merges: pending,
      };
    },

    get_pending_rebases: async (params: unknown) => {
      const args = params as { engineer: string };
      if (!args?.engineer) {
        return { error: 'engineer is required' };
      }

      const mergeWorkflow = service.getMergeWorkflow();
      const pending = mergeWorkflow.getPendingRebases(args.engineer);

      return {
        success: true,
        count: pending.length,
        rebases: pending,
      };
    },
  };
}
