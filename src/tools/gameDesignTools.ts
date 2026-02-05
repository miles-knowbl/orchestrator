/**
 * MCP Tools for Game Design Service
 *
 * Provides finite/infinite game framing for dream state ladders.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type {
  GameDesignService,
  FiniteGame,
  InfiniteGame,
} from '../services/game-design/index.js';

export const gameDesignTools: Tool[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Finite Games
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'create_finite_game',
    description: 'Create a finite game for a module or system with win conditions.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the game',
        },
        description: {
          type: 'string',
          description: 'Description of what completing this game achieves',
        },
        scope: {
          type: 'string',
          enum: ['module', 'system'],
          description: 'Scope level (module or system)',
        },
        targetId: {
          type: 'string',
          description: 'ID of the module or system this game tracks',
        },
      },
      required: ['name', 'description', 'scope', 'targetId'],
    },
  },
  {
    name: 'start_finite_game',
    description: 'Start a finite game to begin tracking progress.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'ID of the game to start',
        },
      },
      required: ['gameId'],
    },
  },
  {
    name: 'satisfy_win_condition',
    description: 'Mark a win condition as satisfied with evidence.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'ID of the game',
        },
        conditionId: {
          type: 'string',
          description: 'ID of the win condition to satisfy',
        },
        evidence: {
          type: 'string',
          description: 'Evidence/proof of satisfaction',
        },
      },
      required: ['gameId', 'conditionId'],
    },
  },
  {
    name: 'get_finite_game',
    description: 'Get details of a specific finite game.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'ID of the game',
        },
      },
      required: ['gameId'],
    },
  },
  {
    name: 'list_finite_games',
    description: 'List finite games with optional filtering.',
    inputSchema: {
      type: 'object',
      properties: {
        scope: {
          type: 'string',
          enum: ['module', 'system'],
          description: 'Filter by scope',
        },
        status: {
          type: 'string',
          enum: ['not-started', 'in-progress', 'won', 'abandoned'],
          description: 'Filter by status',
        },
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Infinite Games
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'create_infinite_game',
    description: 'Create an infinite game for an organization mission.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the infinite game',
        },
        mission: {
          type: 'string',
          description: 'The cosmic purpose/mission statement',
        },
      },
      required: ['name', 'mission'],
    },
  },
  {
    name: 'link_finite_to_infinite',
    description: 'Link a finite game to an infinite game.',
    inputSchema: {
      type: 'object',
      properties: {
        infiniteGameId: {
          type: 'string',
          description: 'ID of the infinite game',
        },
        finiteGameId: {
          type: 'string',
          description: 'ID of the finite game to link',
        },
      },
      required: ['infiniteGameId', 'finiteGameId'],
    },
  },
  {
    name: 'update_health_metric',
    description: 'Update a health metric value for an infinite game.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'ID of the infinite game',
        },
        metricId: {
          type: 'string',
          description: 'ID of the metric to update',
        },
        value: {
          type: 'number',
          description: 'New metric value',
        },
      },
      required: ['gameId', 'metricId', 'value'],
    },
  },
  {
    name: 'get_infinite_game',
    description: 'Get details of a specific infinite game.',
    inputSchema: {
      type: 'object',
      properties: {
        gameId: {
          type: 'string',
          description: 'ID of the game',
        },
      },
      required: ['gameId'],
    },
  },
  {
    name: 'list_infinite_games',
    description: 'List all infinite games.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-Generation & Status
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'generate_games_from_roadmap',
    description: 'Generate finite games from roadmap modules.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_game_state',
    description: 'Get overall game state summary.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_game_design_status',
    description: 'Get game design service status.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_game_design_terminal_view',
    description: 'Get a terminal-friendly view of game design status.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export function createGameDesignToolHandlers(gameDesignService: GameDesignService) {
  return {
    create_finite_game: async (params: unknown) => {
      const args = params as {
        name: string;
        description: string;
        scope: 'module' | 'system';
        targetId: string;
      };
      if (!args?.name || !args?.description || !args?.scope || !args?.targetId) {
        return { error: 'name, description, scope, and targetId are required' };
      }
      const game = await gameDesignService.createFiniteGame(args);
      return { success: true, game };
    },

    start_finite_game: async (params: unknown) => {
      const args = params as { gameId: string };
      if (!args?.gameId) {
        return { error: 'gameId is required' };
      }
      try {
        const game = await gameDesignService.startGame(args.gameId);
        return { success: true, game };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    satisfy_win_condition: async (params: unknown) => {
      const args = params as { gameId: string; conditionId: string; evidence?: string };
      if (!args?.gameId || !args?.conditionId) {
        return { error: 'gameId and conditionId are required' };
      }
      try {
        const game = await gameDesignService.satisfyWinCondition(
          args.gameId,
          args.conditionId,
          args.evidence
        );
        return { success: true, game };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    get_finite_game: async (params: unknown) => {
      const args = params as { gameId: string };
      if (!args?.gameId) {
        return { error: 'gameId is required' };
      }
      const game = gameDesignService.getFiniteGame(args.gameId);
      if (!game) {
        return { error: `Game not found: ${args.gameId}` };
      }
      return game;
    },

    list_finite_games: async (params: unknown) => {
      const args = (params || {}) as {
        scope?: 'module' | 'system';
        status?: FiniteGame['status'];
      };
      const games = gameDesignService.listFiniteGames(args);
      return { count: games.length, games };
    },

    create_infinite_game: async (params: unknown) => {
      const args = params as { name: string; mission: string };
      if (!args?.name || !args?.mission) {
        return { error: 'name and mission are required' };
      }
      const game = await gameDesignService.createInfiniteGame(args);
      return { success: true, game };
    },

    link_finite_to_infinite: async (params: unknown) => {
      const args = params as { infiniteGameId: string; finiteGameId: string };
      if (!args?.infiniteGameId || !args?.finiteGameId) {
        return { error: 'infiniteGameId and finiteGameId are required' };
      }
      try {
        await gameDesignService.linkFiniteGame(args.infiniteGameId, args.finiteGameId);
        return { success: true };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    update_health_metric: async (params: unknown) => {
      const args = params as { gameId: string; metricId: string; value: number };
      if (!args?.gameId || !args?.metricId || args?.value === undefined) {
        return { error: 'gameId, metricId, and value are required' };
      }
      try {
        const game = await gameDesignService.updateHealthMetric(
          args.gameId,
          args.metricId,
          args.value
        );
        return { success: true, game };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    get_infinite_game: async (params: unknown) => {
      const args = params as { gameId: string };
      if (!args?.gameId) {
        return { error: 'gameId is required' };
      }
      const game = gameDesignService.getInfiniteGame(args.gameId);
      if (!game) {
        return { error: `Game not found: ${args.gameId}` };
      }
      return game;
    },

    list_infinite_games: async (_params: unknown) => {
      const games = gameDesignService.listInfiniteGames();
      return { count: games.length, games };
    },

    generate_games_from_roadmap: async (_params: unknown) => {
      try {
        const games = await gameDesignService.generateGamesFromRoadmap();
        return { success: true, created: games.length, games };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    get_game_state: async (_params: unknown) => {
      return gameDesignService.getGameState();
    },

    get_game_design_status: async (_params: unknown) => {
      return gameDesignService.getStatus();
    },

    get_game_design_terminal_view: async (_params: unknown) => {
      return { view: gameDesignService.generateTerminalView() };
    },
  };
}
