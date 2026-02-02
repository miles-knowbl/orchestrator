/**
 * MCP Tools for DreamEngine
 *
 * Provides control over the dreaming system - background proposal generation.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DreamEngine, ProposalStatus, ProposalType } from '../services/dreaming/index.js';

export const dreamingTools: Tool[] = [
  {
    name: 'start_dreaming',
    description: 'Start the dream engine. Begins monitoring for idle periods and generating proposals.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'stop_dreaming',
    description: 'Stop the dream engine.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_dreaming_status',
    description: 'Get current status of the dream engine including idle state and pending proposals.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_dreaming_stats',
    description: 'Get statistics about dreaming sessions and proposals.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'trigger_dream',
    description: 'Manually trigger a dream cycle to generate proposals immediately.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_dream_proposals',
    description: 'List dream proposals with optional filtering.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'approved', 'rejected', 'implemented'],
          description: 'Filter by proposal status',
        },
        type: {
          type: 'string',
          enum: ['new-module', 'skill-improvement', 'pattern-capture', 'blocked-module'],
          description: 'Filter by proposal type',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of proposals to return',
        },
      },
    },
  },
  {
    name: 'get_dream_proposal',
    description: 'Get details of a specific dream proposal.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Proposal ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'approve_dream_proposal',
    description: 'Approve a dream proposal for implementation.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Proposal ID to approve',
        },
        approvedBy: {
          type: 'string',
          description: 'Name of approver (optional)',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'reject_dream_proposal',
    description: 'Reject a dream proposal.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Proposal ID to reject',
        },
        reason: {
          type: 'string',
          description: 'Reason for rejection',
        },
      },
      required: ['id', 'reason'],
    },
  },
  {
    name: 'mark_proposal_implemented',
    description: 'Mark a proposal as implemented.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Proposal ID to mark as implemented',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_dream_sessions',
    description: 'List recent dream sessions.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of sessions to return',
        },
      },
    },
  },
  {
    name: 'configure_dreaming',
    description: 'Configure dream engine settings.',
    inputSchema: {
      type: 'object',
      properties: {
        idleThreshold: {
          type: 'number',
          description: 'Minimum idle time before dreaming starts (ms)',
        },
        dreamInterval: {
          type: 'number',
          description: 'Interval between dream cycles when idle (ms)',
        },
        maxProposalsPerCycle: {
          type: 'number',
          description: 'Maximum proposals to generate per dream cycle',
        },
      },
    },
  },
];

export function createDreamingToolHandlers(dreamEngine: DreamEngine) {
  return {
    start_dreaming: async (_params: unknown) => {
      dreamEngine.start();
      return {
        success: true,
        message: 'Dream engine started',
        status: dreamEngine.getStatus(),
      };
    },

    stop_dreaming: async (_params: unknown) => {
      dreamEngine.stop();
      return {
        success: true,
        message: 'Dream engine stopped',
        status: dreamEngine.getStatus(),
      };
    },

    get_dreaming_status: async (_params: unknown) => {
      return dreamEngine.getStatus();
    },

    get_dreaming_stats: async (_params: unknown) => {
      return dreamEngine.getStats();
    },

    trigger_dream: async (_params: unknown) => {
      const session = await dreamEngine.triggerDream();
      return {
        success: true,
        session,
        status: dreamEngine.getStatus(),
      };
    },

    list_dream_proposals: async (params: unknown) => {
      const args = (params || {}) as {
        status?: ProposalStatus;
        type?: ProposalType;
        limit?: number;
      };

      const proposals = dreamEngine.listProposals(args);
      return {
        count: proposals.length,
        proposals,
      };
    },

    get_dream_proposal: async (params: unknown) => {
      const args = params as { id: string };
      if (!args?.id) {
        return { error: 'id is required' };
      }

      const proposal = dreamEngine.getProposal(args.id);
      if (!proposal) {
        return { error: `Proposal not found: ${args.id}` };
      }

      return proposal;
    },

    approve_dream_proposal: async (params: unknown) => {
      const args = params as { id: string; approvedBy?: string };
      if (!args?.id) {
        return { error: 'id is required' };
      }

      try {
        const proposal = await dreamEngine.approveProposal(args.id, args.approvedBy);
        return {
          success: true,
          message: `Proposal ${args.id} approved`,
          proposal,
        };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    reject_dream_proposal: async (params: unknown) => {
      const args = params as { id: string; reason: string };
      if (!args?.id || !args?.reason) {
        return { error: 'id and reason are required' };
      }

      try {
        const proposal = await dreamEngine.rejectProposal(args.id, args.reason);
        return {
          success: true,
          message: `Proposal ${args.id} rejected`,
          proposal,
        };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    mark_proposal_implemented: async (params: unknown) => {
      const args = params as { id: string };
      if (!args?.id) {
        return { error: 'id is required' };
      }

      try {
        const proposal = await dreamEngine.markImplemented(args.id);
        return {
          success: true,
          message: `Proposal ${args.id} marked as implemented`,
          proposal,
        };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    list_dream_sessions: async (params: unknown) => {
      const args = (params || {}) as { limit?: number };
      const sessions = dreamEngine.listSessions(args.limit);
      return {
        count: sessions.length,
        sessions,
      };
    },

    configure_dreaming: async (params: unknown) => {
      const args = (params || {}) as {
        idleThreshold?: number;
        dreamInterval?: number;
        maxProposalsPerCycle?: number;
      };

      dreamEngine.configure(args);
      return {
        success: true,
        message: 'Configuration updated',
        status: dreamEngine.getStatus(),
      };
    },
  };
}
