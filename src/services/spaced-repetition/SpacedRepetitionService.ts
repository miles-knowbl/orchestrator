/**
 * SpacedRepetitionService - SRS for Skill Mastery
 *
 * Implements spaced repetition learning for skills and patterns.
 * The orchestrator helps users internalize knowledge through timed review.
 *
 * Uses SM-2 algorithm variant for scheduling:
 * - Ease factor adjusts based on response quality
 * - Intervals grow exponentially for well-remembered items
 * - Failed items reset to short intervals
 *
 * Part of the spaced-repetition module (Layer 5 - Meta).
 */

import { EventEmitter } from 'events';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import type { KnowledgeGraphService } from '../knowledge-graph/index.js';
import type { SkillRegistry } from '../SkillRegistry.js';
import type { MemoryService } from '../MemoryService.js';

// ============================================================================
// Types
// ============================================================================

export interface SpacedRepetitionServiceOptions {
  dataPath: string;
}

/**
 * Content type for review items
 */
export type CardType = 'skill' | 'pattern' | 'concept' | 'custom';

/**
 * Response quality for SM-2 algorithm (0-5 scale)
 */
export type ResponseQuality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * A review card
 */
export interface Card {
  id: string;
  type: CardType;
  sourceId: string;                 // Skill ID, pattern ID, or custom

  // Content
  front: string;                    // Question/prompt
  back: string;                     // Answer/explanation
  tags: string[];

  // SM-2 parameters
  easeFactor: number;               // Starting at 2.5
  interval: number;                 // Days until next review
  repetitions: number;              // Successful repetitions in a row

  // Scheduling
  nextReview: string;               // ISO date
  lastReview?: string;

  // Stats
  totalReviews: number;
  correctReviews: number;

  // Meta
  createdAt: string;
  updatedAt: string;
  suspended: boolean;
}

/**
 * A deck of cards
 */
export interface Deck {
  id: string;
  name: string;
  description: string;
  tags: string[];
  cardIds: string[];

  // Settings
  newCardsPerDay: number;
  reviewsPerDay: number;

  // Stats
  totalCards: number;
  matureCards: number;              // Interval >= 21 days
  youngCards: number;               // Interval < 21 days
  newCards: number;                 // Never reviewed
  suspendedCards: number;

  createdAt: string;
  updatedAt: string;
}

/**
 * A review session
 */
export interface ReviewSession {
  id: string;
  deckId: string;
  startedAt: string;
  completedAt?: string;

  // Progress
  cardsReviewed: number;
  cardsCorrect: number;
  cardsIncorrect: number;

  // Details
  reviews: ReviewRecord[];
}

/**
 * Single review record
 */
export interface ReviewRecord {
  cardId: string;
  quality: ResponseQuality;
  timeSpentMs: number;
  timestamp: string;

  // SM-2 results
  newInterval: number;
  newEaseFactor: number;
}

/**
 * Cards due for review
 */
export interface DueCards {
  deckId: string;
  deckName: string;
  newCards: Card[];
  reviewCards: Card[];
  totalDue: number;
}

/**
 * Learning statistics
 */
export interface LearningStats {
  totalCards: number;
  totalDecks: number;
  cardsLearned: number;             // At least one review
  cardsMastered: number;            // Interval >= 30 days
  totalReviews: number;
  averageRetention: number;         // Percentage correct
  streakDays: number;               // Consecutive days with reviews
  lastStudyDate?: string;
}

/**
 * Persisted state
 */
interface SpacedRepetitionState {
  cards: Card[];
  decks: Deck[];
  sessions: ReviewSession[];
  stats: {
    totalReviews: number;
    streakDays: number;
    lastStudyDate?: string;
  };
  lastUpdated: string;
}

// ============================================================================
// SM-2 Algorithm Constants
// ============================================================================

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const INITIAL_INTERVAL = 1;         // 1 day
const GRADUATING_INTERVAL = 4;      // 4 days after first success
const MATURE_INTERVAL = 21;         // Days to be considered "mature"
const MASTERED_INTERVAL = 30;       // Days to be considered "mastered"

// ============================================================================
// Service Implementation
// ============================================================================

export class SpacedRepetitionService extends EventEmitter {
  private options: SpacedRepetitionServiceOptions;
  private cards: Map<string, Card> = new Map();
  private decks: Map<string, Deck> = new Map();
  private sessions: ReviewSession[] = [];
  private stats: {
    totalReviews: number;
    streakDays: number;
    lastStudyDate: string | undefined;
  } = {
    totalReviews: 0,
    streakDays: 0,
    lastStudyDate: undefined,
  };

  // Dependencies
  private knowledgeGraphService?: KnowledgeGraphService;
  private skillRegistry?: SkillRegistry;
  private memoryService?: MemoryService;

  constructor(options: SpacedRepetitionServiceOptions) {
    super();
    this.options = options;
  }

  /**
   * Set service dependencies
   */
  setDependencies(deps: {
    knowledgeGraphService?: KnowledgeGraphService;
    skillRegistry?: SkillRegistry;
    memoryService?: MemoryService;
  }): void {
    this.knowledgeGraphService = deps.knowledgeGraphService;
    this.skillRegistry = deps.skillRegistry;
    this.memoryService = deps.memoryService;
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
      const state: SpacedRepetitionState = JSON.parse(content);

      this.cards.clear();
      for (const card of state.cards) {
        this.cards.set(card.id, card);
      }

      this.decks.clear();
      for (const deck of state.decks) {
        this.decks.set(deck.id, deck);
      }

      this.sessions = state.sessions || [];
      if (state.stats) {
        this.stats = {
          totalReviews: state.stats.totalReviews,
          streakDays: state.stats.streakDays,
          lastStudyDate: state.stats.lastStudyDate,
        };
      }
    } catch {
      // No existing state, start fresh
    }
  }

  private async saveState(): Promise<void> {
    const state: SpacedRepetitionState = {
      cards: Array.from(this.cards.values()),
      decks: Array.from(this.decks.values()),
      sessions: this.sessions.slice(-100), // Keep last 100 sessions
      stats: this.stats,
      lastUpdated: new Date().toISOString(),
    };

    await mkdir(dirname(this.options.dataPath), { recursive: true });
    await writeFile(this.options.dataPath, JSON.stringify(state, null, 2));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Card Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a new card
   */
  async createCard(params: {
    type: CardType;
    sourceId: string;
    front: string;
    back: string;
    tags?: string[];
    deckId?: string;
  }): Promise<Card> {
    const id = `card-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const card: Card = {
      id,
      type: params.type,
      sourceId: params.sourceId,
      front: params.front,
      back: params.back,
      tags: params.tags || [],
      easeFactor: DEFAULT_EASE_FACTOR,
      interval: 0,
      repetitions: 0,
      nextReview: new Date().toISOString(),
      totalReviews: 0,
      correctReviews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      suspended: false,
    };

    this.cards.set(id, card);

    // Add to deck if specified
    if (params.deckId) {
      const deck = this.decks.get(params.deckId);
      if (deck) {
        deck.cardIds.push(id);
        deck.totalCards++;
        deck.newCards++;
        deck.updatedAt = new Date().toISOString();
      }
    }

    await this.saveState();
    this.emit('card-created', card);
    return card;
  }

  /**
   * Get a card by ID
   */
  getCard(id: string): Card | null {
    return this.cards.get(id) ?? null;
  }

  /**
   * List cards with filtering
   */
  listCards(filter?: {
    type?: CardType;
    deckId?: string;
    tag?: string;
    due?: boolean;
    suspended?: boolean;
  }): Card[] {
    let cards = Array.from(this.cards.values());

    if (filter?.type) {
      cards = cards.filter(c => c.type === filter.type);
    }
    if (filter?.deckId) {
      const deck = this.decks.get(filter.deckId);
      if (deck) {
        const cardIds = new Set(deck.cardIds);
        cards = cards.filter(c => cardIds.has(c.id));
      }
    }
    if (filter?.tag) {
      cards = cards.filter(c => c.tags.includes(filter.tag!));
    }
    if (filter?.due !== undefined) {
      const now = new Date();
      if (filter.due) {
        cards = cards.filter(c => new Date(c.nextReview) <= now && !c.suspended);
      } else {
        cards = cards.filter(c => new Date(c.nextReview) > now);
      }
    }
    if (filter?.suspended !== undefined) {
      cards = cards.filter(c => c.suspended === filter.suspended);
    }

    return cards;
  }

  /**
   * Update a card
   */
  async updateCard(id: string, updates: Partial<Pick<Card, 'front' | 'back' | 'tags' | 'suspended'>>): Promise<Card> {
    const card = this.cards.get(id);
    if (!card) {
      throw new Error(`Card not found: ${id}`);
    }

    if (updates.front !== undefined) card.front = updates.front;
    if (updates.back !== undefined) card.back = updates.back;
    if (updates.tags !== undefined) card.tags = updates.tags;
    if (updates.suspended !== undefined) card.suspended = updates.suspended;
    card.updatedAt = new Date().toISOString();

    await this.saveState();
    return card;
  }

  /**
   * Delete a card
   */
  async deleteCard(id: string): Promise<void> {
    const card = this.cards.get(id);
    if (!card) return;

    // Remove from all decks
    for (const deck of this.decks.values()) {
      const idx = deck.cardIds.indexOf(id);
      if (idx !== -1) {
        deck.cardIds.splice(idx, 1);
        this.updateDeckStats(deck);
      }
    }

    this.cards.delete(id);
    await this.saveState();
    this.emit('card-deleted', id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Deck Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a new deck
   */
  async createDeck(params: {
    name: string;
    description?: string;
    tags?: string[];
    newCardsPerDay?: number;
    reviewsPerDay?: number;
  }): Promise<Deck> {
    const id = `deck-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const deck: Deck = {
      id,
      name: params.name,
      description: params.description || '',
      tags: params.tags || [],
      cardIds: [],
      newCardsPerDay: params.newCardsPerDay ?? 20,
      reviewsPerDay: params.reviewsPerDay ?? 100,
      totalCards: 0,
      matureCards: 0,
      youngCards: 0,
      newCards: 0,
      suspendedCards: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.decks.set(id, deck);
    await this.saveState();

    this.emit('deck-created', deck);
    return deck;
  }

  /**
   * Get a deck by ID
   */
  getDeck(id: string): Deck | null {
    return this.decks.get(id) ?? null;
  }

  /**
   * List all decks
   */
  listDecks(): Deck[] {
    return Array.from(this.decks.values());
  }

  /**
   * Add card to deck
   */
  async addCardToDeck(cardId: string, deckId: string): Promise<void> {
    const card = this.cards.get(cardId);
    const deck = this.decks.get(deckId);

    if (!card) throw new Error(`Card not found: ${cardId}`);
    if (!deck) throw new Error(`Deck not found: ${deckId}`);

    if (!deck.cardIds.includes(cardId)) {
      deck.cardIds.push(cardId);
      this.updateDeckStats(deck);
      await this.saveState();
    }
  }

  /**
   * Remove card from deck
   */
  async removeCardFromDeck(cardId: string, deckId: string): Promise<void> {
    const deck = this.decks.get(deckId);
    if (!deck) return;

    const idx = deck.cardIds.indexOf(cardId);
    if (idx !== -1) {
      deck.cardIds.splice(idx, 1);
      this.updateDeckStats(deck);
      await this.saveState();
    }
  }

  /**
   * Update deck statistics
   */
  private updateDeckStats(deck: Deck): void {
    let mature = 0, young = 0, newCount = 0, suspended = 0;

    for (const cardId of deck.cardIds) {
      const card = this.cards.get(cardId);
      if (!card) continue;

      if (card.suspended) {
        suspended++;
      } else if (card.repetitions === 0) {
        newCount++;
      } else if (card.interval >= MATURE_INTERVAL) {
        mature++;
      } else {
        young++;
      }
    }

    deck.totalCards = deck.cardIds.length;
    deck.matureCards = mature;
    deck.youngCards = young;
    deck.newCards = newCount;
    deck.suspendedCards = suspended;
    deck.updatedAt = new Date().toISOString();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Review & SM-2 Algorithm
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get cards due for review
   */
  getDueCards(deckId?: string): DueCards[] {
    const now = new Date();
    const results: DueCards[] = [];

    const decksToCheck = deckId
      ? [this.decks.get(deckId)].filter(Boolean) as Deck[]
      : Array.from(this.decks.values());

    for (const deck of decksToCheck) {
      const newCards: Card[] = [];
      const reviewCards: Card[] = [];

      for (const cardId of deck.cardIds) {
        const card = this.cards.get(cardId);
        if (!card || card.suspended) continue;

        if (card.repetitions === 0) {
          newCards.push(card);
        } else if (new Date(card.nextReview) <= now) {
          reviewCards.push(card);
        }
      }

      // Sort by next review date (oldest first)
      reviewCards.sort((a, b) =>
        new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
      );

      // Limit to daily limits
      const limitedNew = newCards.slice(0, deck.newCardsPerDay);
      const limitedReview = reviewCards.slice(0, deck.reviewsPerDay);

      results.push({
        deckId: deck.id,
        deckName: deck.name,
        newCards: limitedNew,
        reviewCards: limitedReview,
        totalDue: limitedNew.length + limitedReview.length,
      });
    }

    return results;
  }

  /**
   * Start a review session
   */
  async startReviewSession(deckId: string): Promise<ReviewSession> {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error(`Deck not found: ${deckId}`);
    }

    const session: ReviewSession = {
      id: `session-${Date.now()}`,
      deckId,
      startedAt: new Date().toISOString(),
      cardsReviewed: 0,
      cardsCorrect: 0,
      cardsIncorrect: 0,
      reviews: [],
    };

    this.sessions.push(session);
    this.emit('session-started', session);
    return session;
  }

  /**
   * Record a review response using SM-2 algorithm
   */
  async recordReview(
    sessionId: string,
    cardId: string,
    quality: ResponseQuality,
    timeSpentMs: number
  ): Promise<{ card: Card; session: ReviewSession }> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const card = this.cards.get(cardId);
    if (!card) {
      throw new Error(`Card not found: ${cardId}`);
    }

    // Apply SM-2 algorithm
    const { newInterval, newEaseFactor } = this.calculateSM2(card, quality);

    // Update card
    card.easeFactor = newEaseFactor;
    card.interval = newInterval;
    card.lastReview = new Date().toISOString();
    card.nextReview = this.addDays(new Date(), newInterval).toISOString();
    card.totalReviews++;
    card.updatedAt = new Date().toISOString();

    if (quality >= 3) {
      card.repetitions++;
      card.correctReviews++;
    } else {
      card.repetitions = 0;
    }

    // Record in session
    const record: ReviewRecord = {
      cardId,
      quality,
      timeSpentMs,
      timestamp: new Date().toISOString(),
      newInterval,
      newEaseFactor,
    };
    session.reviews.push(record);
    session.cardsReviewed++;
    if (quality >= 3) {
      session.cardsCorrect++;
    } else {
      session.cardsIncorrect++;
    }

    // Update global stats
    this.stats.totalReviews++;
    this.updateStreak();

    // Update deck stats
    const deck = this.decks.get(session.deckId);
    if (deck) {
      this.updateDeckStats(deck);
    }

    await this.saveState();
    this.emit('review-recorded', { card, record });

    return { card, session };
  }

  /**
   * SM-2 algorithm implementation
   */
  private calculateSM2(card: Card, quality: ResponseQuality): {
    newInterval: number;
    newEaseFactor: number;
  } {
    let newEaseFactor = card.easeFactor;
    let newInterval: number;

    // Update ease factor
    newEaseFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEaseFactor < MIN_EASE_FACTOR) {
      newEaseFactor = MIN_EASE_FACTOR;
    }

    if (quality < 3) {
      // Failed - reset to beginning
      newInterval = INITIAL_INTERVAL;
    } else {
      // Passed
      if (card.repetitions === 0) {
        newInterval = INITIAL_INTERVAL;
      } else if (card.repetitions === 1) {
        newInterval = GRADUATING_INTERVAL;
      } else {
        newInterval = Math.round(card.interval * newEaseFactor);
      }
    }

    return { newInterval, newEaseFactor };
  }

  /**
   * Complete a review session
   */
  async completeSession(sessionId: string): Promise<ReviewSession> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.completedAt = new Date().toISOString();
    await this.saveState();

    this.emit('session-completed', session);
    return session;
  }

  /**
   * Update study streak
   */
  private updateStreak(): void {
    const today = new Date().toISOString().split('T')[0];

    if (!this.stats.lastStudyDate) {
      this.stats.streakDays = 1;
    } else {
      const lastDate = new Date(this.stats.lastStudyDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (this.stats.lastStudyDate === today) {
        // Already studied today, no change
      } else if (this.stats.lastStudyDate === yesterdayStr) {
        // Consecutive day
        this.stats.streakDays++;
      } else {
        // Streak broken
        this.stats.streakDays = 1;
      }
    }

    this.stats.lastStudyDate = today;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-Generation from Knowledge Graph
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Generate cards from skills in knowledge graph
   */
  async generateCardsFromSkills(options?: {
    phase?: string;
    tag?: string;
    limit?: number;
    deckId?: string;
  }): Promise<Card[]> {
    if (!this.knowledgeGraphService || !this.skillRegistry) {
      throw new Error('KnowledgeGraphService and SkillRegistry required');
    }

    const graph = this.knowledgeGraphService.getGraph();
    if (!graph) {
      throw new Error('Knowledge graph not built');
    }

    let nodes = graph.nodes;
    if (options?.phase) {
      nodes = nodes.filter(n => n.phase === options.phase);
    }
    if (options?.tag) {
      nodes = nodes.filter(n => n.tags.includes(options.tag!));
    }
    if (options?.limit) {
      nodes = nodes.slice(0, options.limit);
    }

    const created: Card[] = [];

    for (const node of nodes) {
      // Skip if card already exists for this skill
      const existing = Array.from(this.cards.values()).find(
        c => c.type === 'skill' && c.sourceId === node.id
      );
      if (existing) continue;

      // Get skill details
      const skill = await this.skillRegistry.getSkill(node.id);
      if (!skill) continue;

      // Create card with skill info
      const card = await this.createCard({
        type: 'skill',
        sourceId: node.id,
        front: `What does the **${skill.id}** skill do?\n\nPhase: ${skill.phase || 'general'}\nTags: ${(skill.tags || []).join(', ')}`,
        back: skill.description,
        tags: skill.tags || [],
        deckId: options?.deckId,
      });

      created.push(card);
    }

    return created;
  }

  /**
   * Generate cards from patterns in memory
   */
  async generateCardsFromPatterns(options?: {
    confidence?: 'low' | 'medium' | 'high';
    limit?: number;
    deckId?: string;
  }): Promise<Card[]> {
    if (!this.memoryService) {
      throw new Error('MemoryService required');
    }

    const memory = await this.memoryService.getMemory('orchestrator');
    if (!memory?.patterns) {
      return [];
    }

    let patterns = memory.patterns;
    if (options?.confidence) {
      patterns = patterns.filter((p: any) => p.confidence === options.confidence);
    }
    if (options?.limit) {
      patterns = patterns.slice(0, options.limit);
    }

    const created: Card[] = [];

    for (const pattern of patterns) {
      // Skip if card already exists
      const existing = Array.from(this.cards.values()).find(
        c => c.type === 'pattern' && c.sourceId === pattern.id
      );
      if (existing) continue;

      const card = await this.createCard({
        type: 'pattern',
        sourceId: pattern.id,
        front: `What is the **${pattern.name}** pattern?\n\n**Context:** ${pattern.context}`,
        back: `**Solution:**\n${pattern.solution}` +
          (pattern.example ? `\n\n**Example:**\n${pattern.example}` : ''),
        tags: [],
        deckId: options?.deckId,
      });

      created.push(card);
    }

    return created;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Statistics & Status
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get learning statistics
   */
  getLearningStats(): LearningStats {
    const cards = Array.from(this.cards.values());
    const learned = cards.filter(c => c.totalReviews > 0);
    const mastered = cards.filter(c => c.interval >= MASTERED_INTERVAL);

    const totalCorrect = cards.reduce((sum, c) => sum + c.correctReviews, 0);
    const totalReviews = cards.reduce((sum, c) => sum + c.totalReviews, 0);
    const retention = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;

    return {
      totalCards: cards.length,
      totalDecks: this.decks.size,
      cardsLearned: learned.length,
      cardsMastered: mastered.length,
      totalReviews: this.stats.totalReviews,
      averageRetention: Math.round(retention * 10) / 10,
      streakDays: this.stats.streakDays,
      lastStudyDate: this.stats.lastStudyDate,
    };
  }

  /**
   * Get service status
   */
  getStatus(): {
    totalCards: number;
    totalDecks: number;
    cardsLearned: number;
    cardsDue: number;
    streakDays: number;
    lastStudyDate?: string;
  } {
    const cards = Array.from(this.cards.values());
    const now = new Date();
    const due = cards.filter(c =>
      !c.suspended && new Date(c.nextReview) <= now
    );

    return {
      totalCards: cards.length,
      totalDecks: this.decks.size,
      cardsLearned: cards.filter(c => c.totalReviews > 0).length,
      cardsDue: due.length,
      streakDays: this.stats.streakDays,
      lastStudyDate: this.stats.lastStudyDate,
    };
  }

  /**
   * Get review sessions
   */
  getSessions(limit?: number): ReviewSession[] {
    const sessions = [...this.sessions].reverse();
    return limit ? sessions.slice(0, limit) : sessions;
  }

  /**
   * Get specific session
   */
  getSession(id: string): ReviewSession | null {
    return this.sessions.find(s => s.id === id) ?? null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Terminal View
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Generate terminal-friendly view
   */
  generateTerminalView(): string {
    const lines: string[] = [];
    const stats = this.getLearningStats();
    const dueCards = this.getDueCards();

    lines.push('╔══════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                        SPACED REPETITION STATUS                              ║');
    lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');

    // Overview
    lines.push(`║  CARDS: ${stats.totalCards} total | ${stats.cardsLearned} learned | ${stats.cardsMastered} mastered`.padEnd(77) + '║');
    lines.push(`║  DECKS: ${stats.totalDecks} | REVIEWS: ${stats.totalReviews} | RETENTION: ${stats.averageRetention}%`.padEnd(77) + '║');
    lines.push(`║  STREAK: ${stats.streakDays} days${stats.lastStudyDate ? ` | Last study: ${stats.lastStudyDate}` : ''}`.padEnd(77) + '║');

    // Due cards by deck
    const totalDue = dueCards.reduce((sum, d) => sum + d.totalDue, 0);
    if (totalDue > 0) {
      lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
      lines.push(`║  DUE FOR REVIEW: ${totalDue} cards`.padEnd(77) + '║');
      lines.push('║  ─────────────────────────────────────────────────────────────────────────── ║');

      for (const due of dueCards) {
        if (due.totalDue > 0) {
          lines.push(`║    ${due.deckName.substring(0, 30).padEnd(30)} New: ${String(due.newCards.length).padStart(3)} | Review: ${String(due.reviewCards.length).padStart(3)}`.padEnd(77) + '║');
        }
      }
    } else {
      lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
      lines.push('║  ✓ All caught up! No cards due for review.                                   ║');
    }

    // Decks summary
    const decks = this.listDecks();
    if (decks.length > 0) {
      lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
      lines.push('║  DECKS                                                                       ║');
      lines.push('║  ─────────────────────────────────────────────────────────────────────────── ║');

      for (const deck of decks.slice(0, 5)) {
        const progress = deck.totalCards > 0
          ? Math.round(((deck.matureCards + deck.youngCards) / deck.totalCards) * 100)
          : 0;
        const bar = '█'.repeat(Math.round(progress / 10)) + '░'.repeat(10 - Math.round(progress / 10));
        lines.push(`║    ${deck.name.substring(0, 25).padEnd(25)} [${bar}] ${String(progress).padStart(3)}% (${deck.totalCards} cards)`.padEnd(77) + '║');
      }
    }

    lines.push('╚══════════════════════════════════════════════════════════════════════════════╝');
    return lines.join('\n');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────────────────

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
