/**
 * GameDesignService - Finite/Infinite Game Framing
 *
 * Frames the dream state ladder at each level as games with clear structures:
 * - Module → System: Finite games with clear win conditions
 * - System → Org: Finite games with launch criteria
 * - Org (mission): Infinite game with continuous play
 *
 * Part of the game-design module (Layer 5 - Meta).
 */

import { EventEmitter } from 'events';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import type { RoadmapService, Module } from '../roadmapping/index.js';
import type { CoherenceService } from '../coherence/index.js';

// ============================================================================
// Types
// ============================================================================

export interface GameDesignServiceOptions {
  dataPath: string;
}

/**
 * Game type classification
 */
export type GameType = 'finite' | 'infinite';

/**
 * Game scope/level in the hierarchy
 */
export type GameScope = 'module' | 'system' | 'organization';

/**
 * A win condition that must be satisfied
 */
export interface WinCondition {
  id: string;
  description: string;
  metric: string;                   // What to measure
  target: string | number | boolean;  // Target value
  operator: 'equals' | 'gte' | 'lte' | 'contains' | 'exists';
  weight: number;                   // Importance (0-1)
  satisfied: boolean;
  satisfiedAt?: string;
  evidence?: string;                // Proof of satisfaction
}

/**
 * A checkpoint/milestone in a finite game
 */
export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  order: number;
  winConditions: WinCondition[];
  reached: boolean;
  reachedAt?: string;
  celebrationMessage?: string;      // What to show when reached
}

/**
 * A finite game with clear end state
 */
export interface FiniteGame {
  id: string;
  name: string;
  description: string;
  scope: 'module' | 'system';
  targetId: string;                 // Module ID or system ID

  // Structure
  checkpoints: Checkpoint[];
  finalWinConditions: WinCondition[];

  // State
  status: 'not-started' | 'in-progress' | 'won' | 'abandoned';
  currentCheckpoint: number;
  progress: number;                 // 0-100

  // Timing
  startedAt?: string;
  wonAt?: string;
  estimatedCompletion?: string;

  // Meta
  createdAt: string;
  updatedAt: string;
}

/**
 * An infinite game with continuous play
 */
export interface InfiniteGame {
  id: string;
  name: string;
  mission: string;                  // The cosmic purpose
  scope: 'organization';

  // Principles (not win conditions)
  principles: GamePrinciple[];

  // Metrics we track (not to "win" but to stay in the game)
  healthMetrics: HealthMetric[];

  // Finite games that serve this infinite game
  activeFiniteGames: string[];
  completedFiniteGames: string[];

  // State
  status: 'active' | 'paused' | 'evolved';
  healthScore: number;              // 0-100

  createdAt: string;
  updatedAt: string;
}

/**
 * A principle for infinite game play
 */
export interface GamePrinciple {
  id: string;
  name: string;
  description: string;
  examples: string[];
  violations: string[];             // Anti-patterns
}

/**
 * A health metric for infinite games
 */
export interface HealthMetric {
  id: string;
  name: string;
  description: string;
  currentValue: number;
  healthyRange: { min: number; max: number };
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
}

/**
 * Game state summary
 */
export interface GameState {
  finiteGames: {
    total: number;
    won: number;
    inProgress: number;
    notStarted: number;
  };
  infiniteGames: {
    total: number;
    active: number;
    avgHealth: number;
  };
  overallProgress: number;
  nextMilestone?: {
    gameId: string;
    gameName: string;
    checkpointName: string;
    progress: number;
  };
}

/**
 * Persisted state
 */
interface GameDesignState {
  finiteGames: FiniteGame[];
  infiniteGames: InfiniteGame[];
  lastUpdated: string;
}

// ============================================================================
// Service Implementation
// ============================================================================

export class GameDesignService extends EventEmitter {
  private options: GameDesignServiceOptions;
  private finiteGames: Map<string, FiniteGame> = new Map();
  private infiniteGames: Map<string, InfiniteGame> = new Map();

  // Dependencies
  private roadmapService?: RoadmapService;
  private coherenceService?: CoherenceService;

  constructor(options: GameDesignServiceOptions) {
    super();
    this.options = options;
  }

  /**
   * Set service dependencies
   */
  setDependencies(deps: {
    roadmapService?: RoadmapService;
    coherenceService?: CoherenceService;
  }): void {
    this.roadmapService = deps.roadmapService;
    this.coherenceService = deps.coherenceService;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    await this.loadState();
    this.emit('initialized');
  }

  private async loadState(): Promise<void> {
    try {
      const content = await readFile(this.options.dataPath, 'utf-8');
      const state: GameDesignState = JSON.parse(content);

      this.finiteGames.clear();
      for (const game of state.finiteGames) {
        this.finiteGames.set(game.id, game);
      }

      this.infiniteGames.clear();
      for (const game of state.infiniteGames) {
        this.infiniteGames.set(game.id, game);
      }
    } catch {
      // No existing state, start fresh
    }
  }

  private async saveState(): Promise<void> {
    const state: GameDesignState = {
      finiteGames: Array.from(this.finiteGames.values()),
      infiniteGames: Array.from(this.infiniteGames.values()),
      lastUpdated: new Date().toISOString(),
    };

    await mkdir(dirname(this.options.dataPath), { recursive: true });
    await writeFile(this.options.dataPath, JSON.stringify(state, null, 2));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Finite Game Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a finite game for a module or system
   */
  async createFiniteGame(params: {
    name: string;
    description: string;
    scope: 'module' | 'system';
    targetId: string;
    checkpoints?: Omit<Checkpoint, 'reached' | 'reachedAt'>[];
    finalWinConditions?: Omit<WinCondition, 'satisfied' | 'satisfiedAt'>[];
  }): Promise<FiniteGame> {
    const id = `game-${params.scope}-${params.targetId}`;

    // Generate default win conditions if not provided
    const finalWinConditions = params.finalWinConditions?.map(wc => ({
      ...wc,
      satisfied: false,
    })) ?? this.generateDefaultWinConditions(params.scope, params.targetId);

    // Generate default checkpoints if not provided
    const checkpoints = params.checkpoints?.map(cp => ({
      ...cp,
      reached: false,
      winConditions: cp.winConditions.map(wc => ({ ...wc, satisfied: false })),
    })) ?? this.generateDefaultCheckpoints(params.scope, params.targetId);

    const game: FiniteGame = {
      id,
      name: params.name,
      description: params.description,
      scope: params.scope,
      targetId: params.targetId,
      checkpoints,
      finalWinConditions,
      status: 'not-started',
      currentCheckpoint: 0,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.finiteGames.set(id, game);
    await this.saveState();

    this.emit('finite-game-created', game);
    return game;
  }

  /**
   * Generate default win conditions based on scope
   */
  private generateDefaultWinConditions(
    scope: 'module' | 'system',
    targetId: string
  ): WinCondition[] {
    if (scope === 'module') {
      return [
        {
          id: `${targetId}-implemented`,
          description: 'All functions implemented and operational',
          metric: 'implementation_status',
          target: 'complete',
          operator: 'equals',
          weight: 0.4,
          satisfied: false,
        },
        {
          id: `${targetId}-tested`,
          description: 'Build passes without errors',
          metric: 'build_status',
          target: 'passing',
          operator: 'equals',
          weight: 0.3,
          satisfied: false,
        },
        {
          id: `${targetId}-documented`,
          description: 'Module documented in DREAM-STATE.md',
          metric: 'documentation_status',
          target: true,
          operator: 'exists',
          weight: 0.2,
          satisfied: false,
        },
        {
          id: `${targetId}-integrated`,
          description: 'Wired into server infrastructure',
          metric: 'integration_status',
          target: 'complete',
          operator: 'equals',
          weight: 0.1,
          satisfied: false,
        },
      ];
    } else {
      // System-level win conditions
      return [
        {
          id: `${targetId}-modules-complete`,
          description: 'All modules in system complete',
          metric: 'module_completion_percentage',
          target: 100,
          operator: 'gte',
          weight: 0.3,
          satisfied: false,
        },
        {
          id: `${targetId}-coherent`,
          description: 'System passes coherence validation',
          metric: 'coherence_score',
          target: 0.8,
          operator: 'gte',
          weight: 0.25,
          satisfied: false,
        },
        {
          id: `${targetId}-functional`,
          description: 'Core functionality demonstrated',
          metric: 'functional_demo',
          target: true,
          operator: 'exists',
          weight: 0.25,
          satisfied: false,
        },
        {
          id: `${targetId}-documented`,
          description: 'System documentation complete',
          metric: 'docs_complete',
          target: true,
          operator: 'exists',
          weight: 0.2,
          satisfied: false,
        },
      ];
    }
  }

  /**
   * Generate default checkpoints
   */
  private generateDefaultCheckpoints(
    scope: 'module' | 'system',
    targetId: string
  ): Checkpoint[] {
    if (scope === 'module') {
      return [
        {
          id: `${targetId}-cp1`,
          name: 'Service Created',
          description: 'Core service class implemented',
          order: 1,
          winConditions: [{
            id: `${targetId}-cp1-wc1`,
            description: 'Service file exists',
            metric: 'service_exists',
            target: true,
            operator: 'exists',
            weight: 1,
            satisfied: false,
          }],
          reached: false,
          celebrationMessage: '🎯 Service scaffolded!',
        },
        {
          id: `${targetId}-cp2`,
          name: 'Tools Defined',
          description: 'MCP tools created',
          order: 2,
          winConditions: [{
            id: `${targetId}-cp2-wc1`,
            description: 'Tools file exists',
            metric: 'tools_exists',
            target: true,
            operator: 'exists',
            weight: 1,
            satisfied: false,
          }],
          reached: false,
          celebrationMessage: '🔧 Tools ready!',
        },
        {
          id: `${targetId}-cp3`,
          name: 'API Wired',
          description: 'REST endpoints added',
          order: 3,
          winConditions: [{
            id: `${targetId}-cp3-wc1`,
            description: 'Routes added',
            metric: 'routes_added',
            target: true,
            operator: 'exists',
            weight: 1,
            satisfied: false,
          }],
          reached: false,
          celebrationMessage: '🌐 API connected!',
        },
        {
          id: `${targetId}-cp4`,
          name: 'Build Passing',
          description: 'TypeScript compiles without errors',
          order: 4,
          winConditions: [{
            id: `${targetId}-cp4-wc1`,
            description: 'Build succeeds',
            metric: 'build_passing',
            target: true,
            operator: 'exists',
            weight: 1,
            satisfied: false,
          }],
          reached: false,
          celebrationMessage: '✅ Build green!',
        },
      ];
    } else {
      return [
        {
          id: `${targetId}-cp1`,
          name: 'Foundation Complete',
          description: 'Layer 0 modules done',
          order: 1,
          winConditions: [{
            id: `${targetId}-cp1-wc1`,
            description: 'Foundation layers complete',
            metric: 'layer0_complete',
            target: true,
            operator: 'exists',
            weight: 1,
            satisfied: false,
          }],
          reached: false,
          celebrationMessage: '🏗️ Foundation laid!',
        },
        {
          id: `${targetId}-cp2`,
          name: 'Core Loop',
          description: 'Primary workflow operational',
          order: 2,
          winConditions: [{
            id: `${targetId}-cp2-wc1`,
            description: 'Core loop functional',
            metric: 'core_loop_works',
            target: true,
            operator: 'exists',
            weight: 1,
            satisfied: false,
          }],
          reached: false,
          celebrationMessage: '🔄 Core loop spinning!',
        },
        {
          id: `${targetId}-cp3`,
          name: 'Self-Improving',
          description: 'Learning systems active',
          order: 3,
          winConditions: [{
            id: `${targetId}-cp3-wc1`,
            description: 'Learning active',
            metric: 'learning_active',
            target: true,
            operator: 'exists',
            weight: 1,
            satisfied: false,
          }],
          reached: false,
          celebrationMessage: '🧠 System learning!',
        },
      ];
    }
  }

  /**
   * Start a finite game
   */
  async startGame(gameId: string): Promise<FiniteGame> {
    const game = this.finiteGames.get(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    game.status = 'in-progress';
    game.startedAt = new Date().toISOString();
    game.updatedAt = new Date().toISOString();

    await this.saveState();
    this.emit('game-started', game);
    return game;
  }

  /**
   * Update win condition status
   */
  async satisfyWinCondition(
    gameId: string,
    conditionId: string,
    evidence?: string
  ): Promise<FiniteGame> {
    const game = this.finiteGames.get(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    // Check in checkpoints
    for (const checkpoint of game.checkpoints) {
      const condition = checkpoint.winConditions.find(wc => wc.id === conditionId);
      if (condition && !condition.satisfied) {
        condition.satisfied = true;
        condition.satisfiedAt = new Date().toISOString();
        condition.evidence = evidence;

        // Check if checkpoint is now complete
        if (checkpoint.winConditions.every(wc => wc.satisfied)) {
          checkpoint.reached = true;
          checkpoint.reachedAt = new Date().toISOString();
          game.currentCheckpoint = checkpoint.order;
          this.emit('checkpoint-reached', { game, checkpoint });
        }
      }
    }

    // Check in final conditions
    const finalCondition = game.finalWinConditions.find(wc => wc.id === conditionId);
    if (finalCondition && !finalCondition.satisfied) {
      finalCondition.satisfied = true;
      finalCondition.satisfiedAt = new Date().toISOString();
      finalCondition.evidence = evidence;
    }

    // Recalculate progress
    game.progress = this.calculateGameProgress(game);

    // Check for win
    if (game.finalWinConditions.every(wc => wc.satisfied)) {
      game.status = 'won';
      game.wonAt = new Date().toISOString();
      this.emit('game-won', game);
    }

    game.updatedAt = new Date().toISOString();
    await this.saveState();

    return game;
  }

  /**
   * Calculate game progress percentage
   */
  private calculateGameProgress(game: FiniteGame): number {
    const checkpointWeight = 0.6;
    const finalWeight = 0.4;

    // Checkpoint progress
    const totalCheckpoints = game.checkpoints.length;
    const reachedCheckpoints = game.checkpoints.filter(cp => cp.reached).length;
    const checkpointProgress = totalCheckpoints > 0
      ? (reachedCheckpoints / totalCheckpoints) * 100
      : 0;

    // Final win conditions progress
    const totalFinal = game.finalWinConditions.reduce((sum, wc) => sum + wc.weight, 0);
    const satisfiedFinal = game.finalWinConditions
      .filter(wc => wc.satisfied)
      .reduce((sum, wc) => sum + wc.weight, 0);
    const finalProgress = totalFinal > 0
      ? (satisfiedFinal / totalFinal) * 100
      : 0;

    return Math.round(checkpointProgress * checkpointWeight + finalProgress * finalWeight);
  }

  /**
   * Get a finite game
   */
  getFiniteGame(id: string): FiniteGame | null {
    return this.finiteGames.get(id) ?? null;
  }

  /**
   * List finite games
   */
  listFiniteGames(filter?: {
    scope?: 'module' | 'system';
    status?: FiniteGame['status'];
  }): FiniteGame[] {
    let games = Array.from(this.finiteGames.values());

    if (filter?.scope) {
      games = games.filter(g => g.scope === filter.scope);
    }
    if (filter?.status) {
      games = games.filter(g => g.status === filter.status);
    }

    return games.sort((a, b) => b.progress - a.progress);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Infinite Game Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create an infinite game for an organization
   */
  async createInfiniteGame(params: {
    name: string;
    mission: string;
    principles?: Omit<GamePrinciple, 'id'>[];
    healthMetrics?: Omit<HealthMetric, 'id' | 'lastUpdated'>[];
  }): Promise<InfiniteGame> {
    const id = `infinite-${Date.now()}`;

    const principles: GamePrinciple[] = params.principles?.map((p, i) => ({
      ...p,
      id: `${id}-principle-${i}`,
    })) ?? this.getDefaultPrinciples(id);

    const healthMetrics: HealthMetric[] = params.healthMetrics?.map((m, i) => ({
      ...m,
      id: `${id}-metric-${i}`,
      lastUpdated: new Date().toISOString(),
    })) ?? this.getDefaultHealthMetrics(id);

    const game: InfiniteGame = {
      id,
      name: params.name,
      mission: params.mission,
      scope: 'organization',
      principles,
      healthMetrics,
      activeFiniteGames: [],
      completedFiniteGames: [],
      status: 'active',
      healthScore: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.infiniteGames.set(id, game);
    await this.saveState();

    this.emit('infinite-game-created', game);
    return game;
  }

  private getDefaultPrinciples(gameId: string): GamePrinciple[] {
    return [
      {
        id: `${gameId}-principle-1`,
        name: 'Compound Leverage',
        description: 'Every action should create future optionality',
        examples: [
          'Build reusable skills rather than one-off solutions',
          'Capture patterns that apply across contexts',
        ],
        violations: [
          'Building throw-away code',
          'Solving the same problem repeatedly',
        ],
      },
      {
        id: `${gameId}-principle-2`,
        name: 'Coherent Evolution',
        description: 'Grow in alignment with the dream state',
        examples: [
          'New modules ladder up to system completion',
          'Changes pass coherence validation',
        ],
        violations: [
          'Adding features that don\'t serve the vision',
          'Breaking existing functionality for novelty',
        ],
      },
      {
        id: `${gameId}-principle-3`,
        name: 'Sustainable Pace',
        description: 'Maintain ability to play indefinitely',
        examples: [
          'Regular retrospectives and improvements',
          'Technical debt addressed continuously',
        ],
        violations: [
          'Burnout-inducing sprints',
          'Accumulating debt without plan',
        ],
      },
    ];
  }

  private getDefaultHealthMetrics(gameId: string): HealthMetric[] {
    return [
      {
        id: `${gameId}-metric-1`,
        name: 'System Coherence',
        description: 'How well components align',
        currentValue: 80,
        healthyRange: { min: 70, max: 100 },
        trend: 'stable',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: `${gameId}-metric-2`,
        name: 'Module Velocity',
        description: 'Rate of module completion',
        currentValue: 75,
        healthyRange: { min: 50, max: 100 },
        trend: 'improving',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: `${gameId}-metric-3`,
        name: 'Learning Rate',
        description: 'Skill improvements captured',
        currentValue: 60,
        healthyRange: { min: 40, max: 100 },
        trend: 'stable',
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  /**
   * Link a finite game to an infinite game
   */
  async linkFiniteGame(infiniteGameId: string, finiteGameId: string): Promise<void> {
    const infinite = this.infiniteGames.get(infiniteGameId);
    const finite = this.finiteGames.get(finiteGameId);

    if (!infinite) throw new Error(`Infinite game not found: ${infiniteGameId}`);
    if (!finite) throw new Error(`Finite game not found: ${finiteGameId}`);

    if (!infinite.activeFiniteGames.includes(finiteGameId)) {
      infinite.activeFiniteGames.push(finiteGameId);
      infinite.updatedAt = new Date().toISOString();
      await this.saveState();
    }
  }

  /**
   * Update health metric
   */
  async updateHealthMetric(
    gameId: string,
    metricId: string,
    value: number
  ): Promise<InfiniteGame> {
    const game = this.infiniteGames.get(gameId);
    if (!game) throw new Error(`Game not found: ${gameId}`);

    const metric = game.healthMetrics.find(m => m.id === metricId);
    if (!metric) throw new Error(`Metric not found: ${metricId}`);

    const oldValue = metric.currentValue;
    metric.currentValue = value;
    metric.lastUpdated = new Date().toISOString();

    // Update trend
    if (value > oldValue + 5) {
      metric.trend = 'improving';
    } else if (value < oldValue - 5) {
      metric.trend = 'declining';
    } else {
      metric.trend = 'stable';
    }

    // Recalculate overall health
    game.healthScore = this.calculateHealthScore(game);
    game.updatedAt = new Date().toISOString();

    await this.saveState();
    return game;
  }

  private calculateHealthScore(game: InfiniteGame): number {
    if (game.healthMetrics.length === 0) return 100;

    let score = 0;
    for (const metric of game.healthMetrics) {
      const { min, max } = metric.healthyRange;
      if (metric.currentValue >= min && metric.currentValue <= max) {
        score += 100;
      } else if (metric.currentValue < min) {
        score += Math.max(0, (metric.currentValue / min) * 100);
      } else {
        score += 100; // Above max is still healthy
      }
    }

    return Math.round(score / game.healthMetrics.length);
  }

  /**
   * Get an infinite game
   */
  getInfiniteGame(id: string): InfiniteGame | null {
    return this.infiniteGames.get(id) ?? null;
  }

  /**
   * List infinite games
   */
  listInfiniteGames(): InfiniteGame[] {
    return Array.from(this.infiniteGames.values());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-Generation from Roadmap
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Generate finite games from roadmap modules
   */
  async generateGamesFromRoadmap(): Promise<FiniteGame[]> {
    if (!this.roadmapService) {
      throw new Error('RoadmapService not set');
    }

    const roadmap = await this.roadmapService.load();
    const created: FiniteGame[] = [];

    for (const module of roadmap.modules) {
      const gameId = `game-module-${module.id}`;

      // Skip if already exists
      if (this.finiteGames.has(gameId)) continue;

      const game = await this.createFiniteGame({
        name: `Complete: ${module.name}`,
        description: module.description,
        scope: 'module',
        targetId: module.id,
      });

      // If module is already complete, mark the game as won
      if (module.status === 'complete') {
        game.status = 'won';
        game.progress = 100;
        game.wonAt = new Date().toISOString();
        for (const cp of game.checkpoints) {
          cp.reached = true;
          cp.reachedAt = game.wonAt;
          for (const wc of cp.winConditions) {
            wc.satisfied = true;
            wc.satisfiedAt = game.wonAt;
          }
        }
        for (const wc of game.finalWinConditions) {
          wc.satisfied = true;
          wc.satisfiedAt = game.wonAt;
        }
      }

      created.push(game);
    }

    await this.saveState();
    return created;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // State & Status
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get overall game state
   */
  getGameState(): GameState {
    const finiteGames = Array.from(this.finiteGames.values());
    const infiniteGames = Array.from(this.infiniteGames.values());

    const won = finiteGames.filter(g => g.status === 'won').length;
    const inProgress = finiteGames.filter(g => g.status === 'in-progress').length;
    const notStarted = finiteGames.filter(g => g.status === 'not-started').length;

    const avgHealth = infiniteGames.length > 0
      ? infiniteGames.reduce((sum, g) => sum + g.healthScore, 0) / infiniteGames.length
      : 100;

    // Find next milestone
    let nextMilestone: GameState['nextMilestone'];
    const activeGame = finiteGames.find(g => g.status === 'in-progress');
    if (activeGame) {
      const nextCheckpoint = activeGame.checkpoints.find(cp => !cp.reached);
      if (nextCheckpoint) {
        nextMilestone = {
          gameId: activeGame.id,
          gameName: activeGame.name,
          checkpointName: nextCheckpoint.name,
          progress: activeGame.progress,
        };
      }
    }

    return {
      finiteGames: {
        total: finiteGames.length,
        won,
        inProgress,
        notStarted,
      },
      infiniteGames: {
        total: infiniteGames.length,
        active: infiniteGames.filter(g => g.status === 'active').length,
        avgHealth,
      },
      overallProgress: finiteGames.length > 0
        ? Math.round(finiteGames.reduce((sum, g) => sum + g.progress, 0) / finiteGames.length)
        : 0,
      nextMilestone,
    };
  }

  /**
   * Get service status
   */
  getStatus(): {
    finiteGameCount: number;
    infiniteGameCount: number;
    gamesWon: number;
    gamesInProgress: number;
    overallProgress: number;
  } {
    const state = this.getGameState();
    return {
      finiteGameCount: state.finiteGames.total,
      infiniteGameCount: state.infiniteGames.total,
      gamesWon: state.finiteGames.won,
      gamesInProgress: state.finiteGames.inProgress,
      overallProgress: state.overallProgress,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Terminal View
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Generate terminal-friendly view
   */
  generateTerminalView(): string {
    const lines: string[] = [];
    const state = this.getGameState();

    lines.push('╔══════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                            GAME DESIGN STATUS                                ║');
    lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');

    // Summary
    lines.push(`║  FINITE GAMES: ${state.finiteGames.total} total | ${state.finiteGames.won} won | ${state.finiteGames.inProgress} active | ${state.finiteGames.notStarted} pending`.padEnd(77) + '║');
    lines.push(`║  INFINITE GAMES: ${state.infiniteGames.total} total | ${state.infiniteGames.active} active | Health: ${state.infiniteGames.avgHealth}%`.padEnd(77) + '║');
    lines.push(`║  OVERALL PROGRESS: ${state.overallProgress}%`.padEnd(77) + '║');

    // Progress bar
    const barLength = 50;
    const filled = Math.round((state.overallProgress / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    lines.push(`║  [${bar}]`.padEnd(77) + '║');

    // Next milestone
    if (state.nextMilestone) {
      lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
      lines.push('║  NEXT MILESTONE                                                              ║');
      lines.push(`║    Game: ${state.nextMilestone.gameName.substring(0, 50)}`.padEnd(77) + '║');
      lines.push(`║    Checkpoint: ${state.nextMilestone.checkpointName}`.padEnd(77) + '║');
    }

    // Active finite games
    const activeGames = this.listFiniteGames({ status: 'in-progress' }).slice(0, 5);
    if (activeGames.length > 0) {
      lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
      lines.push('║  ACTIVE GAMES                                                                ║');
      lines.push('║  ─────────────────────────────────────────────────────────────────────────── ║');

      for (const game of activeGames) {
        const progressBar = '█'.repeat(Math.round(game.progress / 10)) + '░'.repeat(10 - Math.round(game.progress / 10));
        lines.push(`║    ${game.name.substring(0, 40).padEnd(40)} [${progressBar}] ${game.progress}%`.padEnd(77) + '║');
      }
    }

    // Infinite games
    const infiniteGames = this.listInfiniteGames().slice(0, 3);
    if (infiniteGames.length > 0) {
      lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
      lines.push('║  INFINITE GAMES (Missions)                                                   ║');
      lines.push('║  ─────────────────────────────────────────────────────────────────────────── ║');

      for (const game of infiniteGames) {
        const healthIcon = game.healthScore >= 70 ? '💚' : game.healthScore >= 40 ? '💛' : '❤️';
        lines.push(`║    ${healthIcon} ${game.name.substring(0, 50).padEnd(50)} Health: ${game.healthScore}%`.padEnd(77) + '║');
      }
    }

    lines.push('╚══════════════════════════════════════════════════════════════════════════════╝');
    return lines.join('\n');
  }
}
