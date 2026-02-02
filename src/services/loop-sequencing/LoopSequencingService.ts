/**
 * LoopSequencingService - Multi-move planning beyond single leverage decisions
 *
 * Develops intuition for which loops commonly run together (NLP-like pattern detection)
 * and uses that to look multiple moves ahead in the "line" (chess-inspired).
 *
 * Key concepts:
 * - Sequence: A recorded pattern of loops that ran consecutively
 * - Line: A proposed multi-move plan with compound leverage scoring
 * - Transition: A single A→B loop transition with frequency and success data
 *
 * Part of the loop-sequencing module (Layer 1).
 */

import { EventEmitter } from 'events';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import type { RunArchivalService, ArchivedRun, RunSummary } from '../RunArchivalService.js';
import type { RoadmapService, LeverageScore } from '../roadmapping/index.js';
import type { LoopComposer } from '../LoopComposer.js';

// ============================================================================
// Types
// ============================================================================

export interface LoopSequencingServiceOptions {
  dataPath: string;
  minSequenceOccurrences?: number;  // Minimum times a sequence must appear to be significant
  maxLineDepth?: number;            // Maximum moves to look ahead
  decayFactor?: number;             // How much older transitions decay in weight
}

/**
 * A single loop-to-loop transition with statistics
 */
export interface LoopTransition {
  fromLoop: string;
  toLoop: string;
  occurrences: number;
  successRate: number;           // Success rate when this transition occurs
  avgGapMinutes: number;         // Average time between loops
  contexts: string[];            // Module/system contexts where this occurred
  lastSeen: string;
  firstSeen: string;
}

/**
 * A recorded sequence of loops that occurred together
 */
export interface LoopSequence {
  id: string;
  loops: string[];               // Ordered list of loops in sequence
  occurrences: number;
  avgTotalDuration: number;      // Average total duration for full sequence
  successRate: number;           // Rate of full sequence completion
  contexts: {
    systems: string[];
    modules: string[];
  };
  lastSeen: string;
  firstSeen: string;
}

/**
 * A proposed multi-move plan
 */
export interface Line {
  id: string;
  moves: LineMove[];
  totalMoves: number;

  // Compound scoring
  compoundLeverage: number;      // Sum of individual leverages with decay
  expectedDuration: number;      // Estimated total duration
  confidence: number;            // Based on historical sequence data

  // Analysis
  reasoning: string;
  risks: string[];
  alternatives: string[];

  // Metadata
  generatedAt: string;
  basedOnSequences: string[];    // Sequence IDs this was derived from
}

/**
 * A single move in a line
 */
export interface LineMove {
  position: number;              // 1-indexed position in line
  loop: string;
  target?: string;               // Module or system target

  // Single-move metrics
  leverage: number;
  estimatedDuration: number;

  // Cumulative metrics at this point
  cumulativeLeverage: number;
  cumulativeDuration: number;

  // Transition data
  transitionFromPrevious?: {
    historicalSuccessRate: number;
    avgGapMinutes: number;
  };
}

/**
 * Analysis of loop co-occurrence patterns
 */
export interface SequenceAnalysis {
  totalRunsAnalyzed: number;
  uniqueLoops: number;
  uniqueTransitions: number;
  uniqueSequences: number;

  // Top patterns
  topTransitions: LoopTransition[];
  topSequences: LoopSequence[];

  // Insights
  insights: SequenceInsight[];

  analyzedAt: string;
}

export interface SequenceInsight {
  type: 'frequent-pair' | 'common-starter' | 'common-finisher' | 'hub-loop' | 'isolated-loop' | 'success-pattern';
  description: string;
  loops: string[];
  significance: number;          // 0-1 importance score
}

/**
 * Persisted state
 */
interface SequencingState {
  transitions: LoopTransition[];
  sequences: LoopSequence[];
  lastAnalysis?: SequenceAnalysis;
  generatedLines: Line[];
  lastUpdated: string;
}

// ============================================================================
// Service Implementation
// ============================================================================

export class LoopSequencingService extends EventEmitter {
  private options: Required<LoopSequencingServiceOptions>;
  private transitions: Map<string, LoopTransition> = new Map();
  private sequences: Map<string, LoopSequence> = new Map();
  private generatedLines: Map<string, Line> = new Map();
  private lastAnalysis?: SequenceAnalysis;

  // Dependencies (set via setDependencies)
  private runArchivalService?: RunArchivalService;
  private roadmapService?: RoadmapService;
  private loopComposer?: LoopComposer;

  constructor(options: LoopSequencingServiceOptions) {
    super();
    this.options = {
      dataPath: options.dataPath,
      minSequenceOccurrences: options.minSequenceOccurrences ?? 2,
      maxLineDepth: options.maxLineDepth ?? 5,
      decayFactor: options.decayFactor ?? 0.85,
    };
  }

  /**
   * Set service dependencies
   */
  setDependencies(deps: {
    runArchivalService?: RunArchivalService;
    roadmapService?: RoadmapService;
    loopComposer?: LoopComposer;
  }): void {
    this.runArchivalService = deps.runArchivalService;
    this.roadmapService = deps.roadmapService;
    this.loopComposer = deps.loopComposer;
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
      const state: SequencingState = JSON.parse(content);

      this.transitions.clear();
      for (const t of state.transitions) {
        this.transitions.set(this.transitionKey(t.fromLoop, t.toLoop), t);
      }

      this.sequences.clear();
      for (const s of state.sequences) {
        this.sequences.set(s.id, s);
      }

      this.generatedLines.clear();
      for (const l of state.generatedLines) {
        this.generatedLines.set(l.id, l);
      }

      this.lastAnalysis = state.lastAnalysis;
    } catch {
      // No existing state, start fresh
    }
  }

  private async saveState(): Promise<void> {
    const state: SequencingState = {
      transitions: Array.from(this.transitions.values()),
      sequences: Array.from(this.sequences.values()),
      generatedLines: Array.from(this.generatedLines.values()),
      lastAnalysis: this.lastAnalysis,
      lastUpdated: new Date().toISOString(),
    };

    await mkdir(dirname(this.options.dataPath), { recursive: true });
    await writeFile(this.options.dataPath, JSON.stringify(state, null, 2));
  }

  private transitionKey(from: string, to: string): string {
    return `${from}→${to}`;
  }

  private sequenceKey(loops: string[]): string {
    return loops.join('→');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Analysis Operations
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Analyze run archives to detect loop sequences and transitions
   */
  async analyzeRunHistory(options: { limit?: number; since?: string } = {}): Promise<SequenceAnalysis> {
    if (!this.runArchivalService) {
      throw new Error('RunArchivalService not set. Call setDependencies first.');
    }

    const runs = await this.runArchivalService.queryRuns({
      limit: options.limit ?? 500,
      since: options.since,
      include_state: false,
    });

    // Group runs by system to find sequences within each system
    const runsBySystem = new Map<string, RunSummary[]>();
    for (const run of runs) {
      const system = run.summary.system;
      if (!runsBySystem.has(system)) {
        runsBySystem.set(system, []);
      }
      runsBySystem.get(system)!.push(run.summary);
    }

    // Sort each system's runs by time and detect transitions/sequences
    for (const [system, systemRuns] of runsBySystem) {
      const sorted = systemRuns.sort((a, b) =>
        new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
      );

      // Detect transitions (pairs)
      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        // Only count if within reasonable time window (24 hours)
        const gapMs = new Date(next.started_at).getTime() - new Date(current.completed_at).getTime();
        const gapMinutes = gapMs / (1000 * 60);

        if (gapMinutes < 24 * 60) {
          this.recordTransition(current, next, gapMinutes, system);
        }
      }

      // Detect longer sequences (3+ loops)
      this.detectSequences(sorted, system);
    }

    // Generate insights
    const insights = this.generateInsights();

    // Build analysis result
    const analysis: SequenceAnalysis = {
      totalRunsAnalyzed: runs.length,
      uniqueLoops: new Set(runs.map(r => r.summary.loop)).size,
      uniqueTransitions: this.transitions.size,
      uniqueSequences: this.sequences.size,
      topTransitions: Array.from(this.transitions.values())
        .sort((a, b) => b.occurrences - a.occurrences)
        .slice(0, 10),
      topSequences: Array.from(this.sequences.values())
        .sort((a, b) => b.occurrences - a.occurrences)
        .slice(0, 10),
      insights,
      analyzedAt: new Date().toISOString(),
    };

    this.lastAnalysis = analysis;
    await this.saveState();

    this.emit('analysis-complete', analysis);
    return analysis;
  }

  private recordTransition(
    from: RunSummary,
    to: RunSummary,
    gapMinutes: number,
    system: string
  ): void {
    const key = this.transitionKey(from.loop, to.loop);
    const existing = this.transitions.get(key);

    if (existing) {
      // Update existing transition
      existing.occurrences++;
      existing.avgGapMinutes = (existing.avgGapMinutes * (existing.occurrences - 1) + gapMinutes) / existing.occurrences;

      // Update success rate based on both runs succeeding
      const bothSuccess = from.outcome === 'success' && to.outcome === 'success';
      const prevSuccesses = existing.successRate * (existing.occurrences - 1);
      existing.successRate = (prevSuccesses + (bothSuccess ? 1 : 0)) / existing.occurrences;

      if (!existing.contexts.includes(system)) {
        existing.contexts.push(system);
      }
      existing.lastSeen = to.started_at;
    } else {
      // Create new transition
      const bothSuccess = from.outcome === 'success' && to.outcome === 'success';
      this.transitions.set(key, {
        fromLoop: from.loop,
        toLoop: to.loop,
        occurrences: 1,
        successRate: bothSuccess ? 1 : 0,
        avgGapMinutes: gapMinutes,
        contexts: [system],
        lastSeen: to.started_at,
        firstSeen: from.started_at,
      });
    }
  }

  private detectSequences(runs: RunSummary[], system: string): void {
    // Look for sequences of 3, 4, 5 consecutive loops
    for (let seqLength = 3; seqLength <= 5; seqLength++) {
      for (let i = 0; i <= runs.length - seqLength; i++) {
        const window = runs.slice(i, i + seqLength);

        // Check if all runs are within reasonable time (48 hours total)
        const totalMs = new Date(window[window.length - 1].completed_at).getTime() -
                       new Date(window[0].started_at).getTime();
        const totalMinutes = totalMs / (1000 * 60);

        if (totalMinutes < 48 * 60) {
          this.recordSequence(window, system);
        }
      }
    }
  }

  private recordSequence(runs: RunSummary[], system: string): void {
    const loops = runs.map(r => r.loop);
    const key = this.sequenceKey(loops);
    const existing = this.sequences.get(key);

    const totalMs = new Date(runs[runs.length - 1].completed_at).getTime() -
                   new Date(runs[0].started_at).getTime();
    const totalMinutes = totalMs / (1000 * 60);
    const allSuccess = runs.every(r => r.outcome === 'success');

    if (existing) {
      existing.occurrences++;
      existing.avgTotalDuration = (existing.avgTotalDuration * (existing.occurrences - 1) + totalMinutes) / existing.occurrences;

      const prevSuccesses = existing.successRate * (existing.occurrences - 1);
      existing.successRate = (prevSuccesses + (allSuccess ? 1 : 0)) / existing.occurrences;

      if (!existing.contexts.systems.includes(system)) {
        existing.contexts.systems.push(system);
      }

      for (const run of runs) {
        if (run.module && !existing.contexts.modules.includes(run.module)) {
          existing.contexts.modules.push(run.module);
        }
      }

      existing.lastSeen = runs[runs.length - 1].completed_at;
    } else {
      this.sequences.set(key, {
        id: key,
        loops,
        occurrences: 1,
        avgTotalDuration: totalMinutes,
        successRate: allSuccess ? 1 : 0,
        contexts: {
          systems: [system],
          modules: runs.filter(r => r.module).map(r => r.module!),
        },
        lastSeen: runs[runs.length - 1].completed_at,
        firstSeen: runs[0].started_at,
      });
    }
  }

  private generateInsights(): SequenceInsight[] {
    const insights: SequenceInsight[] = [];

    // Find frequent pairs
    const frequentPairs = Array.from(this.transitions.values())
      .filter(t => t.occurrences >= this.options.minSequenceOccurrences)
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 5);

    for (const pair of frequentPairs) {
      insights.push({
        type: 'frequent-pair',
        description: `${pair.fromLoop} → ${pair.toLoop} occurs ${pair.occurrences} times (${(pair.successRate * 100).toFixed(0)}% success)`,
        loops: [pair.fromLoop, pair.toLoop],
        significance: Math.min(pair.occurrences / 10, 1) * pair.successRate,
      });
    }

    // Find common starters (loops that often start sequences)
    const starterCounts = new Map<string, number>();
    for (const t of this.transitions.values()) {
      starterCounts.set(t.fromLoop, (starterCounts.get(t.fromLoop) ?? 0) + t.occurrences);
    }
    const topStarters = Array.from(starterCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    for (const [loop, count] of topStarters) {
      if (count >= this.options.minSequenceOccurrences) {
        insights.push({
          type: 'common-starter',
          description: `${loop} commonly starts sequences (${count} transitions out)`,
          loops: [loop],
          significance: Math.min(count / 20, 1),
        });
      }
    }

    // Find common finishers
    const finisherCounts = new Map<string, number>();
    for (const t of this.transitions.values()) {
      finisherCounts.set(t.toLoop, (finisherCounts.get(t.toLoop) ?? 0) + t.occurrences);
    }
    const topFinishers = Array.from(finisherCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    for (const [loop, count] of topFinishers) {
      if (count >= this.options.minSequenceOccurrences) {
        insights.push({
          type: 'common-finisher',
          description: `${loop} commonly ends sequences (${count} transitions in)`,
          loops: [loop],
          significance: Math.min(count / 20, 1),
        });
      }
    }

    // Find hub loops (high in/out connections)
    const allLoops = new Set<string>();
    for (const t of this.transitions.values()) {
      allLoops.add(t.fromLoop);
      allLoops.add(t.toLoop);
    }

    for (const loop of allLoops) {
      const inCount = Array.from(this.transitions.values()).filter(t => t.toLoop === loop).length;
      const outCount = Array.from(this.transitions.values()).filter(t => t.fromLoop === loop).length;

      if (inCount >= 3 && outCount >= 3) {
        insights.push({
          type: 'hub-loop',
          description: `${loop} is a hub with ${inCount} incoming and ${outCount} outgoing transitions`,
          loops: [loop],
          significance: Math.min((inCount + outCount) / 10, 1),
        });
      }
    }

    // Find high-success patterns
    const highSuccessSequences = Array.from(this.sequences.values())
      .filter(s => s.successRate >= 0.9 && s.occurrences >= this.options.minSequenceOccurrences)
      .slice(0, 3);

    for (const seq of highSuccessSequences) {
      insights.push({
        type: 'success-pattern',
        description: `${seq.loops.join(' → ')} has ${(seq.successRate * 100).toFixed(0)}% success rate`,
        loops: seq.loops,
        significance: seq.successRate * Math.min(seq.occurrences / 5, 1),
      });
    }

    return insights.sort((a, b) => b.significance - a.significance);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Line Generation (Multi-Move Planning)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Generate a multi-move line starting from current context
   */
  async generateLine(options: {
    startingLoop?: string;
    target?: string;
    depth?: number;
  } = {}): Promise<Line> {
    const depth = options.depth ?? this.options.maxLineDepth;
    const moves: LineMove[] = [];
    let currentLoop = options.startingLoop;

    // If no starting loop, determine best first move using leverage
    if (!currentLoop) {
      const firstMove = await this.determineBestFirstMove(options.target);
      if (!firstMove) {
        throw new Error('Could not determine starting loop');
      }
      currentLoop = firstMove.loop;
      moves.push(firstMove);
    } else {
      // Add starting loop as first move
      const leverage = await this.getLeverageForLoop(currentLoop, options.target);
      moves.push({
        position: 1,
        loop: currentLoop,
        target: options.target,
        leverage,
        estimatedDuration: this.estimateDuration(currentLoop),
        cumulativeLeverage: leverage,
        cumulativeDuration: this.estimateDuration(currentLoop),
      });
    }

    // Build subsequent moves based on transitions and leverage
    for (let i = moves.length; i < depth; i++) {
      const nextMove = await this.determineNextMove(currentLoop!, moves, options.target);
      if (!nextMove) break;

      moves.push(nextMove);
      currentLoop = nextMove.loop;
    }

    // Calculate compound metrics
    const compoundLeverage = this.calculateCompoundLeverage(moves);
    const confidence = this.calculateLineConfidence(moves);
    const basedOnSequences = this.findMatchingSequences(moves.map(m => m.loop));

    const line: Line = {
      id: `line-${Date.now()}`,
      moves,
      totalMoves: moves.length,
      compoundLeverage,
      expectedDuration: moves[moves.length - 1]?.cumulativeDuration ?? 0,
      confidence,
      reasoning: this.generateLineReasoning(moves, basedOnSequences),
      risks: this.identifyLineRisks(moves),
      alternatives: await this.identifyAlternatives(moves),
      generatedAt: new Date().toISOString(),
      basedOnSequences,
    };

    this.generatedLines.set(line.id, line);
    await this.saveState();

    this.emit('line-generated', line);
    return line;
  }

  private async determineBestFirstMove(target?: string): Promise<LineMove | null> {
    if (!this.roadmapService) {
      // Fallback: use most common starting loop
      const starterCounts = new Map<string, number>();
      for (const t of this.transitions.values()) {
        starterCounts.set(t.fromLoop, (starterCounts.get(t.fromLoop) ?? 0) + t.occurrences);
      }

      const topStarter = Array.from(starterCounts.entries())
        .sort((a, b) => b[1] - a[1])[0];

      if (topStarter) {
        return {
          position: 1,
          loop: topStarter[0],
          target,
          leverage: 5.0,
          estimatedDuration: 30,
          cumulativeLeverage: 5.0,
          cumulativeDuration: 30,
        };
      }
      return null;
    }

    // Use roadmap's leverage scores to determine best first move
    const leverageScores = this.roadmapService.calculateLeverageScores();
    if (leverageScores.length === 0) return null;

    const topScore = leverageScores[0];
    const loop = this.selectLoopForModule(topScore.moduleId);
    const leverage = topScore.score;

    return {
      position: 1,
      loop,
      target: topScore.moduleId,
      leverage,
      estimatedDuration: this.estimateDuration(loop),
      cumulativeLeverage: leverage,
      cumulativeDuration: this.estimateDuration(loop),
    };
  }

  private async determineNextMove(
    currentLoop: string,
    previousMoves: LineMove[],
    target?: string
  ): Promise<LineMove | null> {
    // Get all transitions from current loop
    const outgoingTransitions = Array.from(this.transitions.values())
      .filter(t => t.fromLoop === currentLoop)
      .sort((a, b) => (b.occurrences * b.successRate) - (a.occurrences * a.successRate));

    if (outgoingTransitions.length === 0) {
      // No historical data, try leverage-based selection
      return this.leverageBasedNextMove(previousMoves, target);
    }

    // Score each potential next loop
    const candidates: Array<{ loop: string; score: number; transition: LoopTransition }> = [];

    for (const transition of outgoingTransitions) {
      // Skip if already in the line (avoid cycles)
      if (previousMoves.some(m => m.loop === transition.toLoop)) continue;

      const leverage = await this.getLeverageForLoop(transition.toLoop, target);
      const historicalScore = transition.occurrences * transition.successRate;

      // Combined score: leverage + historical patterns
      const score = leverage * 0.6 + historicalScore * 0.4;

      candidates.push({
        loop: transition.toLoop,
        score,
        transition,
      });
    }

    if (candidates.length === 0) return null;

    // Pick best candidate
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];

    const previousMove = previousMoves[previousMoves.length - 1];
    const duration = this.estimateDuration(best.loop);
    const leverage = await this.getLeverageForLoop(best.loop, target);

    return {
      position: previousMoves.length + 1,
      loop: best.loop,
      target,
      leverage,
      estimatedDuration: duration,
      cumulativeLeverage: previousMove.cumulativeLeverage + leverage * Math.pow(this.options.decayFactor, previousMoves.length),
      cumulativeDuration: previousMove.cumulativeDuration + duration,
      transitionFromPrevious: {
        historicalSuccessRate: best.transition.successRate,
        avgGapMinutes: best.transition.avgGapMinutes,
      },
    };
  }

  private async leverageBasedNextMove(
    previousMoves: LineMove[],
    target?: string
  ): Promise<LineMove | null> {
    if (!this.loopComposer) return null;

    // Get all available loops
    const loops = this.loopComposer.listLoops();
    const usedLoops = new Set(previousMoves.map(m => m.loop));

    // Find best unused loop by leverage
    let bestLoop: string | null = null;
    let bestLeverage = 0;

    for (const loop of loops) {
      if (usedLoops.has(loop.id)) continue;

      const leverage = await this.getLeverageForLoop(loop.id, target);
      if (leverage > bestLeverage) {
        bestLeverage = leverage;
        bestLoop = loop.id;
      }
    }

    if (!bestLoop) return null;

    const previousMove = previousMoves[previousMoves.length - 1];
    const duration = this.estimateDuration(bestLoop);

    return {
      position: previousMoves.length + 1,
      loop: bestLoop,
      target,
      leverage: bestLeverage,
      estimatedDuration: duration,
      cumulativeLeverage: previousMove.cumulativeLeverage + bestLeverage * Math.pow(this.options.decayFactor, previousMoves.length),
      cumulativeDuration: previousMove.cumulativeDuration + duration,
    };
  }

  private async getLeverageForLoop(_loop: string, target?: string): Promise<number> {
    // Simple heuristic if no roadmap service
    if (!this.roadmapService) {
      return 5.0; // Default middle score
    }

    // If we have a target module, find its leverage score
    if (target) {
      try {
        const leverageScores = this.roadmapService.calculateLeverageScores();
        const targetScore = leverageScores.find(s => s.moduleId === target);
        if (targetScore) {
          return targetScore.score;
        }
      } catch {
        return 5.0;
      }
    }

    // Otherwise, use average leverage of top available modules
    const leverageScores = this.roadmapService.calculateLeverageScores();
    if (leverageScores.length === 0) return 5.0;

    const topScores = leverageScores.slice(0, 3);
    return topScores.reduce((sum: number, item) => sum + item.score, 0) / topScores.length;
  }

  private selectLoopForModule(moduleId: string): string {
    // Heuristic: select loop based on module characteristics
    // This could be enhanced with more sophisticated matching
    if (moduleId.includes('loop')) return 'engineering-loop';
    if (moduleId.includes('test')) return 'engineering-loop';
    if (moduleId.includes('bug') || moduleId.includes('fix')) return 'bugfix-loop';
    if (moduleId.includes('docs') || moduleId.includes('doc')) return 'engineering-loop';
    return 'engineering-loop'; // Default
  }

  private estimateDuration(loop: string): number {
    // Estimate based on historical data or defaults
    const relevantTransitions = Array.from(this.transitions.values())
      .filter(t => t.fromLoop === loop || t.toLoop === loop);

    if (relevantTransitions.length > 0) {
      // Use average gap as proxy for duration
      const avgGap = relevantTransitions.reduce((sum, t) => sum + t.avgGapMinutes, 0) / relevantTransitions.length;
      return Math.max(avgGap, 15); // Minimum 15 minutes
    }

    // Defaults by loop type
    const defaults: Record<string, number> = {
      'engineering-loop': 60,
      'bugfix-loop': 30,
      'learning-loop': 20,
      'proposal-loop': 45,
      'meta-loop': 90,
      'distribution-loop': 15,
      'audit-loop': 30,
    };

    return defaults[loop] ?? 45;
  }

  private calculateCompoundLeverage(moves: LineMove[]): number {
    return moves.reduce((sum, move, i) => {
      const decay = Math.pow(this.options.decayFactor, i);
      return sum + move.leverage * decay;
    }, 0);
  }

  private calculateLineConfidence(moves: LineMove[]): number {
    // Base confidence on historical transition data
    let totalConfidence = 1.0;

    for (let i = 1; i < moves.length; i++) {
      const transition = moves[i].transitionFromPrevious;
      if (transition) {
        // Higher historical success rate = higher confidence
        totalConfidence *= (0.5 + transition.historicalSuccessRate * 0.5);
      } else {
        // No historical data = lower confidence
        totalConfidence *= 0.7;
      }
    }

    // Also factor in sequence matches
    const matchingSequences = this.findMatchingSequences(moves.map(m => m.loop));
    if (matchingSequences.length > 0) {
      totalConfidence *= 1.1; // Boost for matching known sequences
    }

    return Math.min(totalConfidence, 1.0);
  }

  private findMatchingSequences(loops: string[]): string[] {
    const matching: string[] = [];

    for (const [id, seq] of this.sequences) {
      // Check if this line contains the sequence
      const seqStr = seq.loops.join('→');
      const lineStr = loops.join('→');

      if (lineStr.includes(seqStr) || seqStr.includes(lineStr)) {
        matching.push(id);
      }
    }

    return matching;
  }

  private generateLineReasoning(moves: LineMove[], basedOnSequences: string[]): string {
    const parts: string[] = [];

    parts.push(`${moves.length}-move line with compound leverage of ${moves[moves.length - 1]?.cumulativeLeverage.toFixed(1)}.`);

    if (basedOnSequences.length > 0) {
      parts.push(`Based on ${basedOnSequences.length} historically successful sequence(s).`);
    }

    // Highlight strong transitions
    const strongTransitions = moves
      .filter(m => m.transitionFromPrevious && m.transitionFromPrevious.historicalSuccessRate >= 0.8)
      .map((m, i) => `${moves[i]?.loop} → ${m.loop}`);

    if (strongTransitions.length > 0) {
      parts.push(`Strong historical patterns: ${strongTransitions.join(', ')}.`);
    }

    return parts.join(' ');
  }

  private identifyLineRisks(moves: LineMove[]): string[] {
    const risks: string[] = [];

    // Check for weak transitions
    for (let i = 1; i < moves.length; i++) {
      const transition = moves[i].transitionFromPrevious;
      if (transition && transition.historicalSuccessRate < 0.5) {
        risks.push(`${moves[i - 1].loop} → ${moves[i].loop} has low historical success (${(transition.historicalSuccessRate * 100).toFixed(0)}%)`);
      }
      if (!transition) {
        risks.push(`${moves[i - 1].loop} → ${moves[i].loop} has no historical data`);
      }
    }

    // Check for long duration
    const totalDuration = moves[moves.length - 1]?.cumulativeDuration ?? 0;
    if (totalDuration > 240) {
      risks.push(`Total estimated duration (${totalDuration} min) may be difficult to complete in one session`);
    }

    // Check for confidence decay
    if (moves.length > 3) {
      risks.push(`Confidence decreases with each move; later moves may diverge from plan`);
    }

    return risks;
  }

  private async identifyAlternatives(moves: LineMove[]): Promise<string[]> {
    const alternatives: string[] = [];

    if (moves.length < 2) return alternatives;

    // For each move after the first, suggest alternatives
    for (let i = 1; i < Math.min(moves.length, 3); i++) {
      const prevLoop = moves[i - 1].loop;
      const currentLoop = moves[i].loop;

      const otherTransitions = Array.from(this.transitions.values())
        .filter(t => t.fromLoop === prevLoop && t.toLoop !== currentLoop)
        .sort((a, b) => b.occurrences - a.occurrences)
        .slice(0, 2);

      for (const alt of otherTransitions) {
        alternatives.push(`Move ${i + 1}: ${alt.toLoop} instead of ${currentLoop} (${alt.occurrences} historical occurrences)`);
      }
    }

    return alternatives.slice(0, 5);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Query Operations
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all recorded transitions
   */
  getTransitions(options: { minOccurrences?: number; loop?: string } = {}): LoopTransition[] {
    let transitions = Array.from(this.transitions.values());

    if (options.minOccurrences) {
      transitions = transitions.filter(t => t.occurrences >= options.minOccurrences!);
    }

    if (options.loop) {
      transitions = transitions.filter(t => t.fromLoop === options.loop || t.toLoop === options.loop);
    }

    return transitions.sort((a, b) => b.occurrences - a.occurrences);
  }

  /**
   * Get a specific transition
   */
  getTransition(fromLoop: string, toLoop: string): LoopTransition | null {
    return this.transitions.get(this.transitionKey(fromLoop, toLoop)) ?? null;
  }

  /**
   * Get all recorded sequences
   */
  getSequences(options: { minOccurrences?: number; containsLoop?: string } = {}): LoopSequence[] {
    let sequences = Array.from(this.sequences.values());

    if (options.minOccurrences) {
      sequences = sequences.filter(s => s.occurrences >= options.minOccurrences!);
    }

    if (options.containsLoop) {
      sequences = sequences.filter(s => s.loops.includes(options.containsLoop!));
    }

    return sequences.sort((a, b) => b.occurrences - a.occurrences);
  }

  /**
   * Get a specific sequence
   */
  getSequence(id: string): LoopSequence | null {
    return this.sequences.get(id) ?? null;
  }

  /**
   * Get generated lines
   */
  getLines(options: { limit?: number } = {}): Line[] {
    const lines = Array.from(this.generatedLines.values())
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    return options.limit ? lines.slice(0, options.limit) : lines;
  }

  /**
   * Get a specific line
   */
  getLine(id: string): Line | null {
    return this.generatedLines.get(id) ?? null;
  }

  /**
   * Get the last analysis
   */
  getLastAnalysis(): SequenceAnalysis | null {
    return this.lastAnalysis ?? null;
  }

  /**
   * Get service status
   */
  getStatus(): {
    transitionCount: number;
    sequenceCount: number;
    lineCount: number;
    lastAnalysis: string | null;
    topTransitions: Array<{ from: string; to: string; count: number }>;
  } {
    const topTransitions = Array.from(this.transitions.values())
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 5)
      .map(t => ({ from: t.fromLoop, to: t.toLoop, count: t.occurrences }));

    return {
      transitionCount: this.transitions.size,
      sequenceCount: this.sequences.size,
      lineCount: this.generatedLines.size,
      lastAnalysis: this.lastAnalysis?.analyzedAt ?? null,
      topTransitions,
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

    lines.push('╔══════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                        LOOP SEQUENCING STATUS                                ║');
    lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');

    // Status summary
    const status = this.getStatus();
    lines.push(`║  Transitions: ${String(status.transitionCount).padEnd(8)} Sequences: ${String(status.sequenceCount).padEnd(8)} Lines: ${String(status.lineCount).padEnd(5)}   ║`);
    lines.push(`║  Last Analysis: ${(status.lastAnalysis ?? 'Never').padEnd(58)}  ║`);
    lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');

    // Top transitions
    lines.push('║  TOP TRANSITIONS                                                             ║');
    lines.push('║  ─────────────────────────────────────────────────────────────────────────── ║');

    for (const t of status.topTransitions) {
      const arrow = `${t.from} → ${t.to}`;
      lines.push(`║    ${arrow.padEnd(45)} (${String(t.count).padStart(3)} times)      ║`);
    }

    if (status.topTransitions.length === 0) {
      lines.push('║    No transitions recorded yet. Run analysis to detect patterns.            ║');
    }

    // Top sequences
    lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
    lines.push('║  TOP SEQUENCES                                                               ║');
    lines.push('║  ─────────────────────────────────────────────────────────────────────────── ║');

    const topSeqs = Array.from(this.sequences.values())
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 3);

    for (const s of topSeqs) {
      const seqStr = s.loops.join(' → ');
      const truncated = seqStr.length > 50 ? seqStr.substring(0, 47) + '...' : seqStr;
      lines.push(`║    ${truncated.padEnd(50)} (${String(s.occurrences).padStart(2)}x)      ║`);
    }

    if (topSeqs.length === 0) {
      lines.push('║    No sequences recorded yet. Run analysis to detect patterns.              ║');
    }

    // Insights
    if (this.lastAnalysis?.insights?.length) {
      lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
      lines.push('║  INSIGHTS                                                                    ║');
      lines.push('║  ─────────────────────────────────────────────────────────────────────────── ║');

      for (const insight of this.lastAnalysis.insights.slice(0, 3)) {
        const desc = insight.description.length > 68 ? insight.description.substring(0, 65) + '...' : insight.description;
        lines.push(`║    • ${desc.padEnd(70)}  ║`);
      }
    }

    lines.push('╚══════════════════════════════════════════════════════════════════════════════╝');

    return lines.join('\n');
  }
}
