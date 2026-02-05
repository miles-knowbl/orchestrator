/**
 * MCP Tools for Spaced Repetition Service
 *
 * Provides SRS learning for skills and patterns.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type {
  SpacedRepetitionService,
  CardType,
  ResponseQuality,
  Card,
} from '../services/spaced-repetition/index.js';

export const spacedRepetitionTools: Tool[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Cards
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'create_srs_card',
    description: 'Creating SRS card — adds new spaced repetition card',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['skill', 'pattern', 'concept', 'custom'],
          description: 'Type of content',
        },
        sourceId: {
          type: 'string',
          description: 'Source ID (skill ID, pattern ID, or custom identifier)',
        },
        front: {
          type: 'string',
          description: 'Question/prompt shown during review',
        },
        back: {
          type: 'string',
          description: 'Answer/explanation shown after response',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for organization',
        },
        deckId: {
          type: 'string',
          description: 'Deck to add card to',
        },
      },
      required: ['type', 'sourceId', 'front', 'back'],
    },
  },
  {
    name: 'get_srs_card',
    description: 'Loading SRS card — retrieves card details',
    inputSchema: {
      type: 'object',
      properties: {
        cardId: {
          type: 'string',
          description: 'Card ID',
        },
      },
      required: ['cardId'],
    },
  },
  {
    name: 'list_srs_cards',
    description: 'Listing SRS cards — filters by deck, tag, or status',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['skill', 'pattern', 'concept', 'custom'],
          description: 'Filter by type',
        },
        deckId: {
          type: 'string',
          description: 'Filter by deck',
        },
        tag: {
          type: 'string',
          description: 'Filter by tag',
        },
        due: {
          type: 'boolean',
          description: 'Filter to only due cards',
        },
        suspended: {
          type: 'boolean',
          description: 'Filter by suspended status',
        },
      },
    },
  },
  {
    name: 'update_srs_card',
    description: 'Updating SRS card — modifies card content or metadata',
    inputSchema: {
      type: 'object',
      properties: {
        cardId: {
          type: 'string',
          description: 'Card ID',
        },
        front: {
          type: 'string',
          description: 'New front content',
        },
        back: {
          type: 'string',
          description: 'New back content',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'New tags',
        },
        suspended: {
          type: 'boolean',
          description: 'Suspend or unsuspend card',
        },
      },
      required: ['cardId'],
    },
  },
  {
    name: 'delete_srs_card',
    description: 'Deleting SRS card — permanently removes card',
    inputSchema: {
      type: 'object',
      properties: {
        cardId: {
          type: 'string',
          description: 'Card ID',
        },
      },
      required: ['cardId'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Decks
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'create_srs_deck',
    description: 'Creating SRS deck — adds new card collection',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Deck name',
        },
        description: {
          type: 'string',
          description: 'Deck description',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for organization',
        },
        newCardsPerDay: {
          type: 'number',
          description: 'Max new cards per day (default 20)',
        },
        reviewsPerDay: {
          type: 'number',
          description: 'Max reviews per day (default 100)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_srs_deck',
    description: 'Loading SRS deck — retrieves deck details',
    inputSchema: {
      type: 'object',
      properties: {
        deckId: {
          type: 'string',
          description: 'Deck ID',
        },
      },
      required: ['deckId'],
    },
  },
  {
    name: 'list_srs_decks',
    description: 'Listing SRS decks — retrieves all card collections',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'add_card_to_deck',
    description: 'Adding card to deck — assigns card to collection',
    inputSchema: {
      type: 'object',
      properties: {
        cardId: {
          type: 'string',
          description: 'Card ID',
        },
        deckId: {
          type: 'string',
          description: 'Deck ID',
        },
      },
      required: ['cardId', 'deckId'],
    },
  },
  {
    name: 'remove_card_from_deck',
    description: 'Removing card from deck — unassigns card from collection',
    inputSchema: {
      type: 'object',
      properties: {
        cardId: {
          type: 'string',
          description: 'Card ID',
        },
        deckId: {
          type: 'string',
          description: 'Deck ID',
        },
      },
      required: ['cardId', 'deckId'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Review Sessions
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_due_cards',
    description: 'Checking due cards — retrieves cards ready for review',
    inputSchema: {
      type: 'object',
      properties: {
        deckId: {
          type: 'string',
          description: 'Filter to specific deck',
        },
      },
    },
  },
  {
    name: 'start_review_session',
    description: 'Starting review session — begins deck review',
    inputSchema: {
      type: 'object',
      properties: {
        deckId: {
          type: 'string',
          description: 'Deck to review',
        },
      },
      required: ['deckId'],
    },
  },
  {
    name: 'record_review',
    description: 'Recording review response — updates card scheduling via SM-2 algorithm',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Session ID',
        },
        cardId: {
          type: 'string',
          description: 'Card being reviewed',
        },
        quality: {
          type: 'number',
          enum: [0, 1, 2, 3, 4, 5],
          description: 'Response quality: 0-2=fail, 3=hard, 4=good, 5=easy',
        },
        timeSpentMs: {
          type: 'number',
          description: 'Time spent on card in milliseconds',
        },
      },
      required: ['sessionId', 'cardId', 'quality', 'timeSpentMs'],
    },
  },
  {
    name: 'complete_review_session',
    description: 'Completing review session — finalizes and records results',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Session ID',
        },
      },
      required: ['sessionId'],
    },
  },
  {
    name: 'list_review_sessions',
    description: 'Listing review sessions — retrieves session history',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Max sessions to return',
        },
      },
    },
  },
  {
    name: 'get_review_session',
    description: 'Loading review session — retrieves session details and results',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Session ID',
        },
      },
      required: ['sessionId'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-Generation
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'generate_cards_from_skills',
    description: 'Generating cards from skills — auto-creates SRS cards from knowledge graph',
    inputSchema: {
      type: 'object',
      properties: {
        phase: {
          type: 'string',
          description: 'Filter skills by phase',
        },
        tag: {
          type: 'string',
          description: 'Filter skills by tag',
        },
        limit: {
          type: 'number',
          description: 'Max cards to generate',
        },
        deckId: {
          type: 'string',
          description: 'Deck to add cards to',
        },
      },
    },
  },
  {
    name: 'generate_cards_from_patterns',
    description: 'Generating cards from patterns — auto-creates SRS cards from memory patterns',
    inputSchema: {
      type: 'object',
      properties: {
        confidence: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Filter patterns by confidence level',
        },
        limit: {
          type: 'number',
          description: 'Max cards to generate',
        },
        deckId: {
          type: 'string',
          description: 'Deck to add cards to',
        },
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Status
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_srs_learning_stats',
    description: 'Checking learning statistics — retrieves review performance data',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_srs_status',
    description: 'Checking SRS status — retrieves service state',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_srs_terminal_view',
    description: 'Visualizing SRS — generates terminal-friendly status display',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export function createSpacedRepetitionToolHandlers(srsService: SpacedRepetitionService) {
  return {
    create_srs_card: async (params: unknown) => {
      const args = params as {
        type: CardType;
        sourceId: string;
        front: string;
        back: string;
        tags?: string[];
        deckId?: string;
      };
      if (!args?.type || !args?.sourceId || !args?.front || !args?.back) {
        return { error: 'type, sourceId, front, and back are required' };
      }
      const card = await srsService.createCard(args);
      return { success: true, card };
    },

    get_srs_card: async (params: unknown) => {
      const args = params as { cardId: string };
      if (!args?.cardId) {
        return { error: 'cardId is required' };
      }
      const card = srsService.getCard(args.cardId);
      if (!card) {
        return { error: `Card not found: ${args.cardId}` };
      }
      return card;
    },

    list_srs_cards: async (params: unknown) => {
      const args = (params || {}) as {
        type?: CardType;
        deckId?: string;
        tag?: string;
        due?: boolean;
        suspended?: boolean;
      };
      const cards = srsService.listCards(args);
      return { count: cards.length, cards };
    },

    update_srs_card: async (params: unknown) => {
      const args = params as {
        cardId: string;
        front?: string;
        back?: string;
        tags?: string[];
        suspended?: boolean;
      };
      if (!args?.cardId) {
        return { error: 'cardId is required' };
      }
      try {
        const card = await srsService.updateCard(args.cardId, args);
        return { success: true, card };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    delete_srs_card: async (params: unknown) => {
      const args = params as { cardId: string };
      if (!args?.cardId) {
        return { error: 'cardId is required' };
      }
      await srsService.deleteCard(args.cardId);
      return { success: true };
    },

    create_srs_deck: async (params: unknown) => {
      const args = params as {
        name: string;
        description?: string;
        tags?: string[];
        newCardsPerDay?: number;
        reviewsPerDay?: number;
      };
      if (!args?.name) {
        return { error: 'name is required' };
      }
      const deck = await srsService.createDeck(args);
      return { success: true, deck };
    },

    get_srs_deck: async (params: unknown) => {
      const args = params as { deckId: string };
      if (!args?.deckId) {
        return { error: 'deckId is required' };
      }
      const deck = srsService.getDeck(args.deckId);
      if (!deck) {
        return { error: `Deck not found: ${args.deckId}` };
      }
      return deck;
    },

    list_srs_decks: async (_params: unknown) => {
      const decks = srsService.listDecks();
      return { count: decks.length, decks };
    },

    add_card_to_deck: async (params: unknown) => {
      const args = params as { cardId: string; deckId: string };
      if (!args?.cardId || !args?.deckId) {
        return { error: 'cardId and deckId are required' };
      }
      try {
        await srsService.addCardToDeck(args.cardId, args.deckId);
        return { success: true };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    remove_card_from_deck: async (params: unknown) => {
      const args = params as { cardId: string; deckId: string };
      if (!args?.cardId || !args?.deckId) {
        return { error: 'cardId and deckId are required' };
      }
      await srsService.removeCardFromDeck(args.cardId, args.deckId);
      return { success: true };
    },

    get_due_cards: async (params: unknown) => {
      const args = (params || {}) as { deckId?: string };
      const due = srsService.getDueCards(args.deckId);
      return { decks: due, totalDue: due.reduce((sum, d) => sum + d.totalDue, 0) };
    },

    start_review_session: async (params: unknown) => {
      const args = params as { deckId: string };
      if (!args?.deckId) {
        return { error: 'deckId is required' };
      }
      try {
        const session = await srsService.startReviewSession(args.deckId);
        return { success: true, session };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    record_review: async (params: unknown) => {
      const args = params as {
        sessionId: string;
        cardId: string;
        quality: ResponseQuality;
        timeSpentMs: number;
      };
      if (!args?.sessionId || !args?.cardId || args?.quality === undefined || !args?.timeSpentMs) {
        return { error: 'sessionId, cardId, quality, and timeSpentMs are required' };
      }
      try {
        const result = await srsService.recordReview(
          args.sessionId,
          args.cardId,
          args.quality,
          args.timeSpentMs
        );
        return { success: true, ...result };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    complete_review_session: async (params: unknown) => {
      const args = params as { sessionId: string };
      if (!args?.sessionId) {
        return { error: 'sessionId is required' };
      }
      try {
        const session = await srsService.completeSession(args.sessionId);
        return { success: true, session };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    list_review_sessions: async (params: unknown) => {
      const args = (params || {}) as { limit?: number };
      const sessions = srsService.getSessions(args.limit);
      return { count: sessions.length, sessions };
    },

    get_review_session: async (params: unknown) => {
      const args = params as { sessionId: string };
      if (!args?.sessionId) {
        return { error: 'sessionId is required' };
      }
      const session = srsService.getSession(args.sessionId);
      if (!session) {
        return { error: `Session not found: ${args.sessionId}` };
      }
      return session;
    },

    generate_cards_from_skills: async (params: unknown) => {
      const args = (params || {}) as {
        phase?: string;
        tag?: string;
        limit?: number;
        deckId?: string;
      };
      try {
        const cards = await srsService.generateCardsFromSkills(args);
        return { success: true, created: cards.length, cards };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    generate_cards_from_patterns: async (params: unknown) => {
      const args = (params || {}) as {
        confidence?: 'low' | 'medium' | 'high';
        limit?: number;
        deckId?: string;
      };
      try {
        const cards = await srsService.generateCardsFromPatterns(args);
        return { success: true, created: cards.length, cards };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    get_srs_learning_stats: async (_params: unknown) => {
      return srsService.getLearningStats();
    },

    get_srs_status: async (_params: unknown) => {
      return srsService.getStatus();
    },

    get_srs_terminal_view: async (_params: unknown) => {
      return { view: srsService.generateTerminalView() };
    },
  };
}
