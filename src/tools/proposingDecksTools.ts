/**
 * MCP Tools for Proposing Decks Service
 *
 * Tools for generating and reviewing daily decks:
 * - Knowledge decks (SRS cards)
 * - Proposal decks (module/skill/pattern proposals)
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type {
  ProposingDecksService,
  ReviewDeckType,
  ReviewDeck,
} from '../services/proposing-decks/index.js';

// ============================================================================
// Tool Definitions
// ============================================================================

export const proposingDecksTools: Tool[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Daily Review
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_daily_review',
    description: 'Get the daily review summary showing knowledge cards and proposals ready for review.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (defaults to today)',
        },
      },
    },
  },
  {
    name: 'generate_daily_decks',
    description: 'Trigger generation of daily review decks (knowledge + proposals).',
    inputSchema: {
      type: 'object',
      properties: {
        forDate: {
          type: 'string',
          description: 'Generate for specific date (YYYY-MM-DD)',
        },
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Deck Management
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'list_review_decks',
    description: 'List review decks with optional filtering.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['knowledge', 'proposal'],
          description: 'Filter by deck type',
        },
        status: {
          type: 'string',
          enum: ['pending', 'in-review', 'completed', 'skipped'],
          description: 'Filter by status',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of decks to return',
        },
      },
    },
  },
  {
    name: 'get_review_deck',
    description: 'Get details of a specific review deck.',
    inputSchema: {
      type: 'object',
      properties: {
        deckId: {
          type: 'string',
          description: 'The deck ID',
        },
      },
      required: ['deckId'],
    },
  },
  {
    name: 'start_deck_review',
    description: 'Start reviewing a deck (changes status to in-review).',
    inputSchema: {
      type: 'object',
      properties: {
        deckId: {
          type: 'string',
          description: 'The deck ID to start reviewing',
        },
      },
      required: ['deckId'],
    },
  },
  {
    name: 'complete_deck_review',
    description: 'Complete a deck review with results.',
    inputSchema: {
      type: 'object',
      properties: {
        deckId: {
          type: 'string',
          description: 'The deck ID',
        },
        itemsReviewed: {
          type: 'number',
          description: 'Number of items reviewed',
        },
        itemsApproved: {
          type: 'number',
          description: 'Number of items approved/correct',
        },
        itemsRejected: {
          type: 'number',
          description: 'Number of items rejected/incorrect',
        },
        itemsSkipped: {
          type: 'number',
          description: 'Number of items skipped',
        },
      },
      required: ['deckId', 'itemsReviewed', 'itemsApproved', 'itemsRejected'],
    },
  },
  {
    name: 'skip_review_deck',
    description: 'Skip reviewing a deck.',
    inputSchema: {
      type: 'object',
      properties: {
        deckId: {
          type: 'string',
          description: 'The deck ID to skip',
        },
        reason: {
          type: 'string',
          description: 'Reason for skipping',
        },
      },
      required: ['deckId'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Schedule & Configuration
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_generation_schedule',
    description: 'Get the automatic deck generation schedule.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'configure_generation_schedule',
    description: 'Configure automatic deck generation schedule.',
    inputSchema: {
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          description: 'Enable/disable automatic generation',
        },
        morningHour: {
          type: 'number',
          description: 'Hour to generate decks (0-23)',
        },
        timezone: {
          type: 'string',
          description: 'Timezone for scheduling',
        },
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Stats & History
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_proposing_decks_stats',
    description: 'Get statistics about deck generation and review habits.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_deck_review_history',
    description: 'Get history of completed deck reviews.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of entries',
        },
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Terminal View
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_morning_review_view',
    description: 'Get a terminal-friendly view of what to review this morning.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// ============================================================================
// Tool Handlers
// ============================================================================

export function createProposingDecksToolHandlers(service: ProposingDecksService) {
  return {
    get_daily_review: async (params: unknown) => {
      const args = (params || {}) as { date?: string };
      const summary = service.getDailyReviewSummary(args.date);
      return {
        success: true,
        summary,
        message: summary.totalItems > 0
          ? `${summary.totalItems} items ready for review (${summary.estimatedMinutes} min estimated)`
          : 'No items ready for review',
      };
    },

    generate_daily_decks: async (params: unknown) => {
      const args = (params || {}) as { forDate?: string };
      const summary = await service.generateDailyDeck(args.forDate);
      return {
        success: true,
        summary,
        message: `Generated decks for ${summary.date}: ${summary.totalItems} items`,
      };
    },

    list_review_decks: async (params: unknown) => {
      const args = (params || {}) as { type?: ReviewDeckType; status?: ReviewDeck['status']; limit?: number };
      const decks = service.listDecks(args);
      return {
        success: true,
        count: decks.length,
        decks,
      };
    },

    get_review_deck: async (params: unknown) => {
      const args = params as { deckId: string };
      if (!args?.deckId) {
        return { error: 'deckId is required' };
      }
      const deck = service.getDeck(args.deckId);
      if (!deck) {
        return { error: `Deck not found: ${args.deckId}` };
      }
      return { success: true, deck };
    },

    start_deck_review: async (params: unknown) => {
      const args = params as { deckId: string };
      if (!args?.deckId) {
        return { error: 'deckId is required' };
      }
      try {
        const deck = await service.startReview(args.deckId);
        return {
          success: true,
          deck,
          message: `Started reviewing ${deck.type} deck: ${deck.itemCount} items`,
        };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    complete_deck_review: async (params: unknown) => {
      const args = params as {
        deckId: string;
        itemsReviewed: number;
        itemsApproved: number;
        itemsRejected: number;
        itemsSkipped?: number;
      };
      if (!args?.deckId || args.itemsReviewed === undefined) {
        return { error: 'deckId and review counts are required' };
      }
      try {
        const deck = await service.completeReview(args.deckId, {
          itemsReviewed: args.itemsReviewed,
          itemsApproved: args.itemsApproved,
          itemsRejected: args.itemsRejected,
          itemsSkipped: args.itemsSkipped || 0,
        });
        return {
          success: true,
          deck,
          message: `Completed ${deck.type} deck review: ${args.itemsReviewed} reviewed, ${args.itemsApproved} approved`,
        };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    skip_review_deck: async (params: unknown) => {
      const args = params as { deckId: string; reason?: string };
      if (!args?.deckId) {
        return { error: 'deckId is required' };
      }
      try {
        const deck = await service.skipDeck(args.deckId, args.reason);
        return {
          success: true,
          deck,
          message: `Skipped ${deck.type} deck`,
        };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    get_generation_schedule: async () => {
      const schedule = service.getSchedule();
      return { success: true, schedule };
    },

    configure_generation_schedule: async (params: unknown) => {
      const args = (params || {}) as { enabled?: boolean; morningHour?: number; timezone?: string };
      const schedule = await service.configureSchedule(args);
      return {
        success: true,
        schedule,
        message: `Schedule updated: generation at ${schedule.morningHour}:00`,
      };
    },

    get_proposing_decks_stats: async () => {
      const stats = service.getStats();
      return { success: true, stats };
    },

    get_deck_review_history: async (params: unknown) => {
      const args = (params || {}) as { limit?: number };
      const history = service.getHistory(args.limit);
      return {
        success: true,
        count: history.length,
        history,
      };
    },

    get_morning_review_view: async () => {
      const summary = service.getDailyReviewSummary();
      const stats = service.getStats();

      const lines: string[] = [];
      lines.push('═'.repeat(70));
      lines.push('  MORNING REVIEW');
      lines.push('═'.repeat(70));
      lines.push('');

      // Streak info
      if (stats.streakDays > 0) {
        lines.push(`  🔥 ${stats.streakDays} day streak (longest: ${stats.longestStreak})`);
        lines.push('');
      }

      // Knowledge deck
      lines.push('  KNOWLEDGE DECK');
      lines.push('  ' + '─'.repeat(50));
      if (summary.knowledgeDeck) {
        const kd = summary.knowledgeDeck;
        lines.push(`  Status: ${kd.status.toUpperCase()}`);
        lines.push(`  Cards: ${summary.newCards} new + ${summary.dueCards} review`);
        lines.push(`  Est. time: ${kd.estimatedMinutes} minutes`);
        lines.push(`  Deck ID: ${kd.id}`);
      } else {
        lines.push('  No knowledge cards due today');
      }
      lines.push('');

      // Proposal deck
      lines.push('  PROPOSAL DECK');
      lines.push('  ' + '─'.repeat(50));
      if (summary.proposalDeck) {
        const pd = summary.proposalDeck;
        lines.push(`  Status: ${pd.status.toUpperCase()}`);
        lines.push(`  Proposals: ${summary.pendingProposals} (${summary.highPriorityProposals} high priority)`);

        if (pd.proposalDeck) {
          const byType = pd.proposalDeck.byType;
          const types = Object.entries(byType)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => `${type}: ${count}`)
            .join(', ');
          if (types) lines.push(`  Types: ${types}`);
        }

        lines.push(`  Est. time: ${pd.estimatedMinutes} minutes`);
        lines.push(`  Deck ID: ${pd.id}`);
      } else {
        lines.push('  No proposals pending review');
      }
      lines.push('');

      // Summary
      lines.push('═'.repeat(70));
      lines.push(`  TOTAL: ${summary.totalItems} items | ${summary.estimatedMinutes} minutes`);
      lines.push('═'.repeat(70));

      if (summary.totalItems > 0) {
        lines.push('');
        lines.push('  Commands:');
        if (summary.knowledgeDeck && summary.knowledgeDeck.status === 'pending') {
          lines.push(`    start_deck_review(deckId="${summary.knowledgeDeck.id}")`);
        }
        if (summary.proposalDeck && summary.proposalDeck.status === 'pending') {
          lines.push(`    start_deck_review(deckId="${summary.proposalDeck.id}")`);
        }
      }

      return {
        success: true,
        view: lines.join('\n'),
        summary,
      };
    },
  };
}
