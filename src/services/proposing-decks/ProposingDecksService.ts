/**
 * ProposingDecksService - Wake up to decks ready for review
 *
 * Generates two types of decks during idle/dreaming periods:
 * 1. Knowledge Decks - SRS cards for spaced repetition learning
 * 2. Proposal Decks - Module/skill/pattern proposals for human approval
 *
 * The user wakes up to:
 * - Daily knowledge review deck with due cards
 * - Pending proposals organized by type and priority
 *
 * Part of the proposing-decks module (Layer 5 - Meta).
 */

import { EventEmitter } from 'events';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';
import type { DreamEngine, DreamProposal, ProposalType } from '../dreaming/index.js';
import type { SpacedRepetitionService, Card, Deck, DueCards } from '../spaced-repetition/index.js';
import type { KnowledgeGraphService } from '../knowledge-graph/index.js';
import type { SkillRegistry } from '../SkillRegistry.js';

// ============================================================================
// Types
// ============================================================================

export interface ProposingDecksServiceOptions {
  dataPath: string;
  /** Hour of day to generate morning deck (0-23). Default: 6 */
  morningHour?: number;
  /** Maximum cards in daily knowledge deck. Default: 20 */
  maxDailyCards?: number;
  /** Maximum proposals in proposal deck. Default: 10 */
  maxDailyProposals?: number;
}

/**
 * Deck type for the two main use cases
 */
export type ReviewDeckType = 'knowledge' | 'proposal';

/**
 * A generated deck ready for review
 */
export interface ReviewDeck {
  id: string;
  type: ReviewDeckType;
  title: string;
  description: string;
  generatedAt: string;
  generatedFor: string;  // Date this deck is for (YYYY-MM-DD)

  // Status
  status: 'pending' | 'in-review' | 'completed' | 'skipped';
  startedAt?: string;
  completedAt?: string;

  // Content summary
  itemCount: number;
  estimatedMinutes: number;

  // For knowledge decks
  knowledgeDeck?: {
    deckId: string;
    newCards: number;
    reviewCards: number;
    cardIds: string[];
  };

  // For proposal decks
  proposalDeck?: {
    proposals: ProposalSummary[];
    byType: Record<ProposalType, number>;
    highPriority: number;
  };
}

/**
 * Summary of a proposal for the deck
 */
export interface ProposalSummary {
  id: string;
  type: ProposalType;
  title: string;
  priority: 'high' | 'medium' | 'low';
  leverage: number;
  target: string;
  createdAt: string;
}

/**
 * Daily review summary - what to review today
 */
export interface DailyReviewSummary {
  date: string;  // YYYY-MM-DD
  generatedAt: string;

  // Knowledge review
  knowledgeDeck: ReviewDeck | null;
  dueCards: number;
  newCards: number;

  // Proposal review
  proposalDeck: ReviewDeck | null;
  pendingProposals: number;
  highPriorityProposals: number;

  // Combined stats
  totalItems: number;
  estimatedMinutes: number;

  // Streak tracking
  streakDays: number;
  lastReviewDate: string | null;
}

/**
 * Generation schedule configuration
 */
export interface GenerationSchedule {
  enabled: boolean;
  morningHour: number;
  timezone: string;
  lastGeneration: string | null;
  nextGeneration: string | null;
}

/**
 * Review history entry
 */
export interface ReviewHistoryEntry {
  id: string;
  date: string;
  deckId: string;
  deckType: ReviewDeckType;
  itemsReviewed: number;
  itemsApproved: number;
  itemsRejected: number;
  itemsSkipped: number;
  duration: number;  // Minutes
  completedAt: string;
}

/**
 * Service statistics
 */
export interface ProposingDecksStats {
  totalDecksGenerated: number;
  totalKnowledgeDecks: number;
  totalProposalDecks: number;
  decksCompleted: number;
  decksSkipped: number;
  averageCompletionRate: number;
  streakDays: number;
  longestStreak: number;
  lastReviewDate: string | null;
}

// ============================================================================
// Service
// ============================================================================

export class ProposingDecksService extends EventEmitter {
  private dreamEngine: DreamEngine | null = null;
  private spacedRepetitionService: SpacedRepetitionService | null = null;
  private knowledgeGraphService: KnowledgeGraphService | null = null;
  private skillRegistry: SkillRegistry | null = null;

  private decks: Map<string, ReviewDeck> = new Map();
  private history: ReviewHistoryEntry[] = [];
  private schedule: GenerationSchedule;

  private generationTimer: ReturnType<typeof setInterval> | null = null;
  private initialized = false;

  private readonly morningHour: number;
  private readonly maxDailyCards: number;
  private readonly maxDailyProposals: number;
  private readonly dataPath: string;

  constructor(private options: ProposingDecksServiceOptions) {
    super();
    this.dataPath = options.dataPath;
    this.morningHour = options.morningHour ?? 6;
    this.maxDailyCards = options.maxDailyCards ?? 20;
    this.maxDailyProposals = options.maxDailyProposals ?? 10;

    this.schedule = {
      enabled: true,
      morningHour: this.morningHour,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lastGeneration: null,
      nextGeneration: null,
    };
  }

  /**
   * Set service dependencies
   */
  setDependencies(deps: {
    dreamEngine?: DreamEngine;
    spacedRepetitionService?: SpacedRepetitionService;
    knowledgeGraphService?: KnowledgeGraphService;
    skillRegistry?: SkillRegistry;
  }): void {
    this.dreamEngine = deps.dreamEngine || null;
    this.spacedRepetitionService = deps.spacedRepetitionService || null;
    this.knowledgeGraphService = deps.knowledgeGraphService || null;
    this.skillRegistry = deps.skillRegistry || null;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    await mkdir(dirname(this.dataPath), { recursive: true });
    await this.loadState();

    // Calculate next generation time
    this.updateNextGeneration();

    // Start generation scheduler
    this.startScheduler();

    this.initialized = true;
    this.log('info', 'ProposingDecksService initialized');
  }

  /**
   * Shutdown the service
   */
  shutdown(): void {
    if (this.generationTimer) {
      clearInterval(this.generationTimer);
      this.generationTimer = null;
    }
    this.log('info', 'ProposingDecksService shutdown');
  }

  // --------------------------------------------------------------------------
  // Deck Generation
  // --------------------------------------------------------------------------

  /**
   * Generate the daily review deck (called automatically or manually)
   */
  async generateDailyDeck(forDate?: string): Promise<DailyReviewSummary> {
    const date = forDate || this.getTodayDate();

    // Check if already generated for this date
    const existing = this.getDailyDecks(date);
    if (existing.knowledge || existing.proposal) {
      return this.getDailyReviewSummary(date);
    }

    this.log('info', `Generating daily decks for ${date}`);

    // Generate knowledge deck
    let knowledgeDeck: ReviewDeck | null = null;
    if (this.spacedRepetitionService) {
      knowledgeDeck = await this.generateKnowledgeDeck(date);
    }

    // Generate proposal deck
    let proposalDeck: ReviewDeck | null = null;
    if (this.dreamEngine) {
      proposalDeck = await this.generateProposalDeck(date);
    }

    // Update schedule
    this.schedule.lastGeneration = new Date().toISOString();
    this.updateNextGeneration();
    await this.saveState();

    this.emit('decks-generated', { date, knowledgeDeck, proposalDeck });

    return this.getDailyReviewSummary(date);
  }

  /**
   * Generate a knowledge deck from due SRS cards
   */
  private async generateKnowledgeDeck(forDate: string): Promise<ReviewDeck | null> {
    if (!this.spacedRepetitionService) return null;

    try {
      // Get all decks and their due cards
      const allDue = this.spacedRepetitionService.getDueCards();

      // Flatten and prioritize
      const allNewCards: Card[] = [];
      const allReviewCards: Card[] = [];

      for (const due of allDue) {
        allNewCards.push(...due.newCards);
        allReviewCards.push(...due.reviewCards);
      }

      // Limit cards
      const newCards = allNewCards.slice(0, Math.floor(this.maxDailyCards / 3));
      const reviewCards = allReviewCards.slice(0, this.maxDailyCards - newCards.length);
      const cardIds = [...newCards, ...reviewCards].map(c => c.id);

      if (cardIds.length === 0) {
        this.log('info', 'No cards due for review');
        return null;
      }

      const deck: ReviewDeck = {
        id: `knowledge-${forDate}-${randomUUID().slice(0, 8)}`,
        type: 'knowledge',
        title: `Knowledge Review - ${forDate}`,
        description: `${newCards.length} new cards, ${reviewCards.length} review cards`,
        generatedAt: new Date().toISOString(),
        generatedFor: forDate,
        status: 'pending',
        itemCount: cardIds.length,
        estimatedMinutes: Math.ceil(cardIds.length * 0.5),  // ~30 seconds per card
        knowledgeDeck: {
          deckId: 'daily',
          newCards: newCards.length,
          reviewCards: reviewCards.length,
          cardIds,
        },
      };

      this.decks.set(deck.id, deck);
      await this.saveState();

      this.log('info', `Generated knowledge deck: ${cardIds.length} cards`);
      return deck;

    } catch (err) {
      this.log('error', `Failed to generate knowledge deck: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }

  /**
   * Generate a proposal deck from pending dream proposals
   */
  private async generateProposalDeck(forDate: string): Promise<ReviewDeck | null> {
    if (!this.dreamEngine) return null;

    try {
      // Get pending proposals
      const proposals = this.dreamEngine.listProposals({ status: 'pending' });

      if (proposals.length === 0) {
        this.log('info', 'No pending proposals');
        return null;
      }

      // Sort by priority and leverage
      const sorted = [...proposals].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.leverage - a.leverage;
      });

      // Limit and summarize
      const limited = sorted.slice(0, this.maxDailyProposals);
      const summaries: ProposalSummary[] = limited.map(p => ({
        id: p.id,
        type: p.type,
        title: p.title,
        priority: p.priority,
        leverage: p.leverage,
        target: p.target,
        createdAt: p.createdAt,
      }));

      // Count by type
      const byType: Record<ProposalType, number> = {
        'new-module': 0,
        'skill-improvement': 0,
        'pattern-capture': 0,
        'blocked-module': 0,
      };
      for (const p of summaries) {
        byType[p.type]++;
      }

      const highPriority = summaries.filter(p => p.priority === 'high').length;

      const deck: ReviewDeck = {
        id: `proposal-${forDate}-${randomUUID().slice(0, 8)}`,
        type: 'proposal',
        title: `Proposal Review - ${forDate}`,
        description: `${summaries.length} proposals (${highPriority} high priority)`,
        generatedAt: new Date().toISOString(),
        generatedFor: forDate,
        status: 'pending',
        itemCount: summaries.length,
        estimatedMinutes: Math.ceil(summaries.length * 2),  // ~2 minutes per proposal
        proposalDeck: {
          proposals: summaries,
          byType,
          highPriority,
        },
      };

      this.decks.set(deck.id, deck);
      await this.saveState();

      this.log('info', `Generated proposal deck: ${summaries.length} proposals`);
      return deck;

    } catch (err) {
      this.log('error', `Failed to generate proposal deck: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }

  /**
   * Manually trigger deck generation
   */
  async triggerGeneration(): Promise<DailyReviewSummary> {
    return this.generateDailyDeck();
  }

  // --------------------------------------------------------------------------
  // Deck Review
  // --------------------------------------------------------------------------

  /**
   * Start reviewing a deck
   */
  async startReview(deckId: string): Promise<ReviewDeck> {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error(`Deck not found: ${deckId}`);
    }

    if (deck.status !== 'pending') {
      throw new Error(`Deck is not pending: ${deck.status}`);
    }

    deck.status = 'in-review';
    deck.startedAt = new Date().toISOString();

    await this.saveState();
    this.emit('review-started', { deckId, type: deck.type });

    return deck;
  }

  /**
   * Complete a deck review
   */
  async completeReview(
    deckId: string,
    results: {
      itemsReviewed: number;
      itemsApproved: number;
      itemsRejected: number;
      itemsSkipped: number;
    }
  ): Promise<ReviewDeck> {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error(`Deck not found: ${deckId}`);
    }

    deck.status = 'completed';
    deck.completedAt = new Date().toISOString();

    // Record in history
    const duration = deck.startedAt
      ? Math.round((Date.now() - new Date(deck.startedAt).getTime()) / 60000)
      : 0;

    const entry: ReviewHistoryEntry = {
      id: randomUUID(),
      date: deck.generatedFor,
      deckId: deck.id,
      deckType: deck.type,
      itemsReviewed: results.itemsReviewed,
      itemsApproved: results.itemsApproved,
      itemsRejected: results.itemsRejected,
      itemsSkipped: results.itemsSkipped,
      duration,
      completedAt: deck.completedAt,
    };

    this.history.push(entry);
    await this.saveState();

    this.emit('review-completed', { deckId, type: deck.type, results });

    return deck;
  }

  /**
   * Skip a deck (not reviewing today)
   */
  async skipDeck(deckId: string, reason?: string): Promise<ReviewDeck> {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error(`Deck not found: ${deckId}`);
    }

    deck.status = 'skipped';
    deck.completedAt = new Date().toISOString();

    await this.saveState();
    this.emit('deck-skipped', { deckId, type: deck.type, reason });

    return deck;
  }

  // --------------------------------------------------------------------------
  // Queries
  // --------------------------------------------------------------------------

  /**
   * Get the daily review summary
   */
  getDailyReviewSummary(date?: string): DailyReviewSummary {
    const targetDate = date || this.getTodayDate();
    const { knowledge, proposal } = this.getDailyDecks(targetDate);

    // Calculate streak
    const { streakDays, lastReviewDate } = this.calculateStreak();

    return {
      date: targetDate,
      generatedAt: knowledge?.generatedAt || proposal?.generatedAt || new Date().toISOString(),

      knowledgeDeck: knowledge,
      dueCards: knowledge?.knowledgeDeck?.reviewCards || 0,
      newCards: knowledge?.knowledgeDeck?.newCards || 0,

      proposalDeck: proposal,
      pendingProposals: proposal?.proposalDeck?.proposals.length || 0,
      highPriorityProposals: proposal?.proposalDeck?.highPriority || 0,

      totalItems: (knowledge?.itemCount || 0) + (proposal?.itemCount || 0),
      estimatedMinutes: (knowledge?.estimatedMinutes || 0) + (proposal?.estimatedMinutes || 0),

      streakDays,
      lastReviewDate,
    };
  }

  /**
   * Get decks for a specific date
   */
  getDailyDecks(date: string): { knowledge: ReviewDeck | null; proposal: ReviewDeck | null } {
    let knowledge: ReviewDeck | null = null;
    let proposal: ReviewDeck | null = null;

    for (const deck of this.decks.values()) {
      if (deck.generatedFor === date) {
        if (deck.type === 'knowledge') knowledge = deck;
        if (deck.type === 'proposal') proposal = deck;
      }
    }

    return { knowledge, proposal };
  }

  /**
   * Get a specific deck
   */
  getDeck(deckId: string): ReviewDeck | null {
    return this.decks.get(deckId) || null;
  }

  /**
   * List all decks
   */
  listDecks(filter?: {
    type?: ReviewDeckType;
    status?: ReviewDeck['status'];
    limit?: number;
  }): ReviewDeck[] {
    let decks = Array.from(this.decks.values());

    if (filter?.type) {
      decks = decks.filter(d => d.type === filter.type);
    }
    if (filter?.status) {
      decks = decks.filter(d => d.status === filter.status);
    }

    // Sort by date (newest first)
    decks.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    if (filter?.limit) {
      decks = decks.slice(0, filter.limit);
    }

    return decks;
  }

  /**
   * Get service statistics
   */
  getStats(): ProposingDecksStats {
    const allDecks = Array.from(this.decks.values());
    const { streakDays, lastReviewDate, longestStreak } = this.calculateStreak();

    const completed = allDecks.filter(d => d.status === 'completed').length;
    const skipped = allDecks.filter(d => d.status === 'skipped').length;
    const total = allDecks.length;

    return {
      totalDecksGenerated: total,
      totalKnowledgeDecks: allDecks.filter(d => d.type === 'knowledge').length,
      totalProposalDecks: allDecks.filter(d => d.type === 'proposal').length,
      decksCompleted: completed,
      decksSkipped: skipped,
      averageCompletionRate: total > 0 ? Math.round((completed / total) * 100) / 100 : 0,
      streakDays,
      longestStreak,
      lastReviewDate,
    };
  }

  /**
   * Get generation schedule
   */
  getSchedule(): GenerationSchedule {
    return { ...this.schedule };
  }

  /**
   * Configure generation schedule
   */
  async configureSchedule(config: Partial<GenerationSchedule>): Promise<GenerationSchedule> {
    if (config.enabled !== undefined) this.schedule.enabled = config.enabled;
    if (config.morningHour !== undefined) this.schedule.morningHour = config.morningHour;
    if (config.timezone !== undefined) this.schedule.timezone = config.timezone;

    this.updateNextGeneration();
    await this.saveState();

    return this.schedule;
  }

  /**
   * Get review history
   */
  getHistory(limit?: number): ReviewHistoryEntry[] {
    const sorted = [...this.history].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  // --------------------------------------------------------------------------
  // Scheduling
  // --------------------------------------------------------------------------

  /**
   * Start the automatic generation scheduler
   */
  private startScheduler(): void {
    // Check every minute if it's time to generate
    this.generationTimer = setInterval(() => {
      this.checkAndGenerate();
    }, 60000);

    // Also check immediately
    this.checkAndGenerate();
  }

  /**
   * Check if it's time to generate and do so if needed
   */
  private async checkAndGenerate(): Promise<void> {
    if (!this.schedule.enabled) return;

    const now = new Date();
    const today = this.getTodayDate();

    // Check if we already generated today
    const { knowledge, proposal } = this.getDailyDecks(today);
    if (knowledge || proposal) return;

    // Check if it's the right hour
    const currentHour = now.getHours();
    if (currentHour >= this.schedule.morningHour) {
      try {
        await this.generateDailyDeck(today);
      } catch (err) {
        this.log('error', `Auto-generation failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  /**
   * Update the next generation time
   */
  private updateNextGeneration(): void {
    const now = new Date();
    const next = new Date(now);

    // Set to morning hour
    next.setHours(this.schedule.morningHour, 0, 0, 0);

    // If already past today's time, move to tomorrow
    if (now >= next) {
      next.setDate(next.getDate() + 1);
    }

    this.schedule.nextGeneration = next.toISOString();
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  /**
   * Get today's date as YYYY-MM-DD
   */
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Calculate review streak
   */
  private calculateStreak(): { streakDays: number; lastReviewDate: string | null; longestStreak: number } {
    if (this.history.length === 0) {
      return { streakDays: 0, lastReviewDate: null, longestStreak: 0 };
    }

    // Get unique dates with completed reviews
    const reviewDates = new Set<string>();
    for (const entry of this.history) {
      reviewDates.add(entry.date);
    }

    const sortedDates = Array.from(reviewDates).sort().reverse();
    const lastReviewDate = sortedDates[0] || null;

    // Calculate current streak
    let streakDays = 0;
    const today = this.getTodayDate();
    let checkDate = today;

    for (let i = 0; i < 365; i++) {
      if (reviewDates.has(checkDate)) {
        streakDays++;
      } else if (checkDate !== today) {
        // Streak broken (allow today to not be reviewed yet)
        break;
      }

      // Move to previous day
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split('T')[0];
    }

    // Calculate longest streak
    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of Array.from(reviewDates).sort()) {
      const date = new Date(dateStr);
      if (prevDate) {
        const diff = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      prevDate = date;
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    return { streakDays, lastReviewDate, longestStreak };
  }

  // --------------------------------------------------------------------------
  // Persistence
  // --------------------------------------------------------------------------

  private async loadState(): Promise<void> {
    try {
      const content = await readFile(this.dataPath, 'utf-8');
      const data = JSON.parse(content);

      if (data.decks) {
        this.decks = new Map(Object.entries(data.decks));
      }
      if (data.history) {
        this.history = data.history;
      }
      if (data.schedule) {
        this.schedule = { ...this.schedule, ...data.schedule };
      }
    } catch {
      // No existing state
      this.decks = new Map();
      this.history = [];
    }
  }

  private async saveState(): Promise<void> {
    const data = {
      decks: Object.fromEntries(this.decks),
      history: this.history.slice(-500),  // Keep last 500 entries
      schedule: this.schedule,
      savedAt: new Date().toISOString(),
    };

    await mkdir(dirname(this.dataPath), { recursive: true });
    await writeFile(this.dataPath, JSON.stringify(data, null, 2));
  }

  private log(level: 'info' | 'warn' | 'error', message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'ProposingDecksService',
      message,
    }));
  }
}
