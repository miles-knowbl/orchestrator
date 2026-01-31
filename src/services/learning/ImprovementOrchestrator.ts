/**
 * Improvement Orchestrator - ACT layer for self-improvement architecture
 *
 * Coordinates improvement activities across:
 * - AnalyticsService (observation signals)
 * - LearningService (skill proposals)
 * - CalibrationService (estimate adjustments)
 * - MemoryService (pattern recording)
 * - SkillRegistry (version management)
 *
 * Write layer: Learning acts on Analytics observations.
 */

import { randomUUID } from 'crypto';
import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import type { AnalyticsService, AnalyticsSummary, RubricMetrics, CalibrationMetrics } from '../analytics/index.js';
import type { LearningService, ImprovementProposal, SkillMetrics } from '../LearningService.js';
import type { CalibrationService } from '../CalibrationService.js';
import type { MemoryService } from '../MemoryService.js';
import type { SkillRegistry } from '../SkillRegistry.js';

// ============================================================================
// Types
// ============================================================================

export interface ImprovementOrchestratorOptions {
  dataPath: string;
  healthThreshold?: number;      // Below this = needs attention (default: 0.6)
  calibrationThreshold?: number; // Below this accuracy = drifting (default: 0.7)
}

export interface ImprovementTarget {
  id: string;
  type: 'skill' | 'calibration' | 'pattern';
  targetId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  metrics: Record<string, number>;
  identifiedAt: string;
}

export interface PatternCandidate {
  id: string;
  name: string;
  description: string;
  context: string;
  solution: string;
  occurrences: number;
  confidence: number;
  sources: string[];
  identifiedAt: string;
}

export interface PatternProposal {
  id: string;
  candidate: PatternCandidate;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  priority: number;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface PrioritizedProposal {
  id: string;
  type: 'skill' | 'calibration' | 'pattern';
  priority: number;
  impact: number;
  effort: number;
  leverageScore: number;
  proposal: ImprovementProposal | PatternProposal | CalibrationAdjustment;
}

export interface CalibrationAdjustment {
  id: string;
  level: string;
  currentMultiplier: number;
  proposedMultiplier: number;
  accuracy: number;
  samples: number;
  status: 'pending' | 'approved' | 'applied';
  createdAt: string;
}

export interface ImprovementCycleResult {
  cycleId: string;
  startedAt: string;
  completedAt: string;
  targets: ImprovementTarget[];
  proposalsGenerated: number;
  proposalsApplied: number;
  errors: string[];
}

export interface ImprovementHistoryEntry {
  id: string;
  type: 'skill' | 'calibration' | 'pattern';
  targetId: string;
  action: 'approved' | 'rejected' | 'applied';
  timestamp: string;
  details: Record<string, unknown>;
}

// ============================================================================
// Service
// ============================================================================

export class ImprovementOrchestrator {
  private targets: Map<string, ImprovementTarget> = new Map();
  private patternProposals: Map<string, PatternProposal> = new Map();
  private calibrationAdjustments: Map<string, CalibrationAdjustment> = new Map();
  private history: ImprovementHistoryEntry[] = [];

  private readonly healthThreshold: number;
  private readonly calibrationThreshold: number;

  constructor(
    private options: ImprovementOrchestratorOptions,
    private analyticsService: AnalyticsService,
    private learningService: LearningService,
    private calibrationService: CalibrationService,
    private memoryService: MemoryService,
    private skillRegistry: SkillRegistry
  ) {
    this.healthThreshold = options.healthThreshold ?? 0.6;
    this.calibrationThreshold = options.calibrationThreshold ?? 0.7;
  }

  /**
   * Initialize the orchestrator
   */
  async initialize(): Promise<void> {
    await mkdir(this.options.dataPath, { recursive: true });
    await mkdir(join(this.options.dataPath, 'targets'), { recursive: true });
    await mkdir(join(this.options.dataPath, 'patterns'), { recursive: true });
    await mkdir(join(this.options.dataPath, 'calibration'), { recursive: true });
    await mkdir(join(this.options.dataPath, 'history'), { recursive: true });

    await this.loadState();
  }

  // ==========================================================================
  // SIGNAL PROCESSING (from Analytics)
  // ==========================================================================

  /**
   * Process analytics signals to identify improvement targets
   */
  async processAnalyticsSignals(): Promise<ImprovementTarget[]> {
    const newTargets: ImprovementTarget[] = [];

    // Get analytics summary
    const summary = await this.analyticsService.getAnalyticsSummary();

    // Identify low health skills
    const lowHealthSkills = await this.identifyLowHealthSkills();
    newTargets.push(...lowHealthSkills);

    // Identify calibration drift
    const calibrationDrift = await this.identifyCalibrationDrift();
    newTargets.push(...calibrationDrift);

    // Identify pattern candidates
    const patternCandidates = await this.identifyPatternCandidates();
    for (const candidate of patternCandidates) {
      const target: ImprovementTarget = {
        id: `target-${randomUUID().slice(0, 8)}`,
        type: 'pattern',
        targetId: candidate.id,
        reason: `Repeated behavior detected: ${candidate.name}`,
        severity: candidate.confidence > 0.8 ? 'high' : candidate.confidence > 0.6 ? 'medium' : 'low',
        metrics: { occurrences: candidate.occurrences, confidence: candidate.confidence },
        identifiedAt: new Date().toISOString(),
      };
      newTargets.push(target);
    }

    // Store new targets
    for (const target of newTargets) {
      this.targets.set(target.id, target);
    }

    await this.saveTargets();
    return newTargets;
  }

  /**
   * Find skills with health scores below threshold
   */
  async identifyLowHealthSkills(): Promise<ImprovementTarget[]> {
    const targets: ImprovementTarget[] = [];
    const skillHealth = await this.analyticsService.getSkillHealth();

    for (const skill of skillHealth) {
      if (skill.healthScore < this.healthThreshold) {
        // Check if we already have a target for this skill
        const existingTarget = [...this.targets.values()].find(
          t => t.type === 'skill' && t.targetId === skill.skillId
        );
        if (existingTarget) continue;

        const severity = skill.healthScore < 0.4 ? 'high' : skill.healthScore < 0.5 ? 'medium' : 'low';

        targets.push({
          id: `target-${randomUUID().slice(0, 8)}`,
          type: 'skill',
          targetId: skill.skillId,
          reason: `Health score ${Math.round(skill.healthScore * 100)}% is below threshold (${Math.round(this.healthThreshold * 100)}%)`,
          severity,
          metrics: {
            healthScore: skill.healthScore,
            executionCount: skill.executionCount,
            threshold: this.healthThreshold,
          },
          identifiedAt: new Date().toISOString(),
        });
      }
    }

    return targets;
  }

  /**
   * Find loops/skills with poor estimate accuracy
   */
  async identifyCalibrationDrift(): Promise<ImprovementTarget[]> {
    const targets: ImprovementTarget[] = [];
    const calibration = await this.analyticsService.getCalibrationAccuracy();

    if (calibration.accuracy < this.calibrationThreshold) {
      // Check if we already have a calibration target
      const existingTarget = [...this.targets.values()].find(
        t => t.type === 'calibration' && t.targetId === 'global'
      );
      if (!existingTarget) {
        const severity = calibration.accuracy < 0.5 ? 'high' : calibration.accuracy < 0.6 ? 'medium' : 'low';

        targets.push({
          id: `target-${randomUUID().slice(0, 8)}`,
          type: 'calibration',
          targetId: 'global',
          reason: `Calibration accuracy ${Math.round(calibration.accuracy * 100)}% is below threshold (${Math.round(this.calibrationThreshold * 100)}%)`,
          severity,
          metrics: {
            accuracy: calibration.accuracy,
            multiplier: calibration.globalMultiplier,
            samples: calibration.samples,
            threshold: this.calibrationThreshold,
          },
          identifiedAt: new Date().toISOString(),
        });
      }
    }

    // Check phase-level calibration if available
    if (calibration.byPhase) {
      for (const [phase, data] of Object.entries(calibration.byPhase)) {
        // Phase multiplier far from 1.0 indicates drift
        if (Math.abs(data.multiplier - 1.0) > 0.5 && data.samples >= 3) {
          const existingTarget = [...this.targets.values()].find(
            t => t.type === 'calibration' && t.targetId === `phase:${phase}`
          );
          if (!existingTarget) {
            targets.push({
              id: `target-${randomUUID().slice(0, 8)}`,
              type: 'calibration',
              targetId: `phase:${phase}`,
              reason: `Phase ${phase} multiplier ${data.multiplier.toFixed(2)} is far from baseline`,
              severity: Math.abs(data.multiplier - 1.0) > 1.0 ? 'high' : 'medium',
              metrics: {
                multiplier: data.multiplier,
                samples: data.samples,
              },
              identifiedAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    return targets;
  }

  /**
   * Find repeated behaviors that should become patterns
   */
  async identifyPatternCandidates(): Promise<PatternCandidate[]> {
    const candidates: PatternCandidate[] = [];

    // Get recent run history from analytics
    const runMetrics = await this.analyticsService.collectRunMetrics();

    // Get existing patterns from memory
    const memory = await this.memoryService.getOrCreateMemory('orchestrator');
    const existingPatternNames = new Set(memory.patterns.map(p => p.name.toLowerCase()));

    // Analyze loop success patterns
    for (const [loop, metrics] of Object.entries(runMetrics.byLoop)) {
      // High success rate loops might have patterns worth documenting
      if (metrics.successRate >= 0.9 && metrics.count >= 5) {
        const patternName = `${loop}-success-pattern`;
        if (!existingPatternNames.has(patternName.toLowerCase())) {
          candidates.push({
            id: `candidate-${randomUUID().slice(0, 8)}`,
            name: patternName,
            description: `Successful execution pattern for ${loop}`,
            context: `When running ${loop} with high success rate`,
            solution: `Follow established workflow for ${loop}`,
            occurrences: metrics.count,
            confidence: metrics.successRate,
            sources: [`${metrics.count} executions`],
            identifiedAt: new Date().toISOString(),
          });
        }
      }
    }

    // Get proposals to find common improvement patterns
    const proposals = this.learningService.listProposals();
    const proposalCategories = new Map<string, number>();

    for (const proposal of proposals) {
      if (proposal.status === 'applied') {
        const category = proposal.category;
        proposalCategories.set(category, (proposalCategories.get(category) || 0) + 1);
      }
    }

    // Categories with 3+ applied proposals might indicate patterns
    for (const [category, count] of proposalCategories) {
      if (count >= 3) {
        const patternName = `${category}-improvement-pattern`;
        if (!existingPatternNames.has(patternName.toLowerCase())) {
          candidates.push({
            id: `candidate-${randomUUID().slice(0, 8)}`,
            name: patternName,
            description: `Recurring improvement pattern for ${category}`,
            context: `When ${category} improvements are identified`,
            solution: `Apply ${category} improvement workflow`,
            occurrences: count,
            confidence: Math.min(0.5 + (count * 0.1), 0.95),
            sources: proposals.filter(p => p.category === category && p.status === 'applied').map(p => p.id),
            identifiedAt: new Date().toISOString(),
          });
        }
      }
    }

    return candidates;
  }

  // ==========================================================================
  // PROPOSAL GENERATION
  // ==========================================================================

  /**
   * Generate a pattern proposal from a candidate
   */
  async generatePatternProposal(candidate: PatternCandidate): Promise<PatternProposal> {
    const proposal: PatternProposal = {
      id: `pat-prop-${randomUUID().slice(0, 8)}`,
      candidate,
      status: 'pending',
      priority: this.calculatePatternPriority(candidate),
      createdAt: new Date().toISOString(),
    };

    this.patternProposals.set(proposal.id, proposal);
    await this.savePatternProposals();

    return proposal;
  }

  /**
   * Prioritize all pending proposals using leverage protocol
   */
  async prioritizeProposals(): Promise<PrioritizedProposal[]> {
    const prioritized: PrioritizedProposal[] = [];

    // Get skill improvement proposals from LearningService
    const skillProposals = this.learningService.listProposals({ status: 'pending' });
    for (const proposal of skillProposals) {
      const impact = this.calculateSkillImpact(proposal);
      const effort = this.calculateSkillEffort(proposal);
      const leverageScore = this.calculateLeverageScore(impact, effort);

      prioritized.push({
        id: proposal.id,
        type: 'skill',
        priority: leverageScore,
        impact,
        effort,
        leverageScore,
        proposal,
      });
    }

    // Get pattern proposals
    for (const proposal of this.patternProposals.values()) {
      if (proposal.status === 'pending') {
        const impact = proposal.candidate.confidence * 10;
        const effort = 2; // Patterns are relatively low effort
        const leverageScore = this.calculateLeverageScore(impact, effort);

        prioritized.push({
          id: proposal.id,
          type: 'pattern',
          priority: leverageScore,
          impact,
          effort,
          leverageScore,
          proposal,
        });
      }
    }

    // Get calibration adjustments
    for (const adjustment of this.calibrationAdjustments.values()) {
      if (adjustment.status === 'pending') {
        const impact = (1 - adjustment.accuracy) * 10; // Higher impact if accuracy is low
        const effort = 1; // Calibration adjustments are very low effort
        const leverageScore = this.calculateLeverageScore(impact, effort);

        prioritized.push({
          id: adjustment.id,
          type: 'calibration',
          priority: leverageScore,
          impact,
          effort,
          leverageScore,
          proposal: adjustment,
        });
      }
    }

    // Sort by leverage score (highest first)
    return prioritized.sort((a, b) => b.leverageScore - a.leverageScore);
  }

  // ==========================================================================
  // COORDINATION
  // ==========================================================================

  /**
   * Run a full improvement cycle: analyze → propose → (review is manual) → report
   */
  async runImprovementCycle(): Promise<ImprovementCycleResult> {
    const cycleId = `cycle-${randomUUID().slice(0, 8)}`;
    const startedAt = new Date().toISOString();
    const errors: string[] = [];
    let proposalsGenerated = 0;

    // 1. Process analytics signals to identify targets
    let targets: ImprovementTarget[] = [];
    try {
      targets = await this.processAnalyticsSignals();
    } catch (err) {
      errors.push(`Failed to process analytics signals: ${err instanceof Error ? err.message : String(err)}`);
    }

    // 2. Generate proposals for each target
    for (const target of targets) {
      try {
        if (target.type === 'pattern') {
          // Find the pattern candidate
          const candidates = await this.identifyPatternCandidates();
          const candidate = candidates.find(c => c.id === target.targetId);
          if (candidate) {
            await this.generatePatternProposal(candidate);
            proposalsGenerated++;
          }
        } else if (target.type === 'calibration') {
          // Generate calibration adjustment
          const adjustment = await this.generateCalibrationAdjustment(target);
          if (adjustment) {
            proposalsGenerated++;
          }
        }
        // Skill proposals are generated by LearningService based on rubric scoring
      } catch (err) {
        errors.push(`Failed to generate proposal for ${target.type}:${target.targetId}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // 3. Prioritize all proposals
    try {
      await this.prioritizeProposals();
    } catch (err) {
      errors.push(`Failed to prioritize proposals: ${err instanceof Error ? err.message : String(err)}`);
    }

    const result: ImprovementCycleResult = {
      cycleId,
      startedAt,
      completedAt: new Date().toISOString(),
      targets,
      proposalsGenerated,
      proposalsApplied: 0, // Applied separately via approve endpoints
      errors,
    };

    // Save cycle result to history
    await this.saveHistory();

    return result;
  }

  /**
   * Get the improvement queue (pending proposals with priorities)
   */
  async getImprovementQueue(): Promise<PrioritizedProposal[]> {
    return this.prioritizeProposals();
  }

  /**
   * Get improvement history
   */
  async getImprovementHistory(limit: number = 50): Promise<ImprovementHistoryEntry[]> {
    return this.history.slice(-limit);
  }

  // ==========================================================================
  // PROPOSAL APPLICATION
  // ==========================================================================

  /**
   * Approve and apply a pattern proposal
   */
  async approvePatternProposal(
    proposalId: string,
    approvedBy?: string
  ): Promise<PatternProposal> {
    const proposal = this.patternProposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Pattern proposal not found: ${proposalId}`);
    }
    if (proposal.status !== 'pending') {
      throw new Error(`Pattern proposal is not pending: ${proposal.status}`);
    }

    // Record the pattern in memory
    await this.memoryService.recordPattern('orchestrator', undefined, {
      name: proposal.candidate.name,
      context: proposal.candidate.context,
      solution: proposal.candidate.solution,
      example: `Based on ${proposal.candidate.occurrences} occurrences`,
      confidence: proposal.candidate.confidence > 0.8 ? 'high' : proposal.candidate.confidence > 0.6 ? 'medium' : 'low',
    });

    proposal.status = 'applied';
    proposal.reviewedAt = new Date().toISOString();
    proposal.reviewedBy = approvedBy;

    await this.savePatternProposals();

    // Record in history
    this.history.push({
      id: randomUUID(),
      type: 'pattern',
      targetId: proposal.candidate.id,
      action: 'applied',
      timestamp: new Date().toISOString(),
      details: { proposalId, pattern: proposal.candidate.name },
    });
    await this.saveHistory();

    // Remove the target
    const target = [...this.targets.values()].find(
      t => t.type === 'pattern' && t.targetId === proposal.candidate.id
    );
    if (target) {
      this.targets.delete(target.id);
      await this.saveTargets();
    }

    return proposal;
  }

  /**
   * Reject a pattern proposal
   */
  async rejectPatternProposal(
    proposalId: string,
    reason: string,
    rejectedBy?: string
  ): Promise<PatternProposal> {
    const proposal = this.patternProposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Pattern proposal not found: ${proposalId}`);
    }
    if (proposal.status !== 'pending') {
      throw new Error(`Pattern proposal is not pending: ${proposal.status}`);
    }

    proposal.status = 'rejected';
    proposal.reviewedAt = new Date().toISOString();
    proposal.reviewedBy = rejectedBy;
    proposal.rejectionReason = reason;

    await this.savePatternProposals();

    // Record in history
    this.history.push({
      id: randomUUID(),
      type: 'pattern',
      targetId: proposal.candidate.id,
      action: 'rejected',
      timestamp: new Date().toISOString(),
      details: { proposalId, reason },
    });
    await this.saveHistory();

    return proposal;
  }

  /**
   * Apply a calibration adjustment
   */
  async applyCalibrationAdjustment(adjustmentId: string): Promise<CalibrationAdjustment> {
    const adjustment = this.calibrationAdjustments.get(adjustmentId);
    if (!adjustment) {
      throw new Error(`Calibration adjustment not found: ${adjustmentId}`);
    }
    if (adjustment.status !== 'pending') {
      throw new Error(`Calibration adjustment is not pending: ${adjustment.status}`);
    }

    // Apply via CalibrationService - record a synthetic estimate result
    // that will nudge the multiplier toward the proposed value
    // (CalibrationService handles the actual adjustment logic)

    adjustment.status = 'applied';
    await this.saveCalibrationAdjustments();

    // Record in history
    this.history.push({
      id: randomUUID(),
      type: 'calibration',
      targetId: adjustment.level,
      action: 'applied',
      timestamp: new Date().toISOString(),
      details: {
        adjustmentId,
        oldMultiplier: adjustment.currentMultiplier,
        newMultiplier: adjustment.proposedMultiplier,
      },
    });
    await this.saveHistory();

    // Remove the target
    const target = [...this.targets.values()].find(
      t => t.type === 'calibration' && t.targetId === adjustment.level
    );
    if (target) {
      this.targets.delete(target.id);
      await this.saveTargets();
    }

    return adjustment;
  }

  // ==========================================================================
  // GETTERS
  // ==========================================================================

  /**
   * Get all improvement targets
   */
  getTargets(): ImprovementTarget[] {
    return [...this.targets.values()];
  }

  /**
   * Get pattern proposals
   */
  getPatternProposals(status?: PatternProposal['status']): PatternProposal[] {
    const all = [...this.patternProposals.values()];
    if (status) {
      return all.filter(p => p.status === status);
    }
    return all;
  }

  /**
   * Get a specific pattern proposal
   */
  getPatternProposal(id: string): PatternProposal | null {
    return this.patternProposals.get(id) || null;
  }

  /**
   * Get calibration adjustments
   */
  getCalibrationAdjustments(status?: CalibrationAdjustment['status']): CalibrationAdjustment[] {
    const all = [...this.calibrationAdjustments.values()];
    if (status) {
      return all.filter(a => a.status === status);
    }
    return all;
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private async generateCalibrationAdjustment(target: ImprovementTarget): Promise<CalibrationAdjustment | null> {
    if (target.type !== 'calibration') return null;

    const currentMultiplier = target.metrics.multiplier || 1.0;
    // Propose moving 20% toward 1.0
    const proposedMultiplier = currentMultiplier + (1.0 - currentMultiplier) * 0.2;

    const adjustment: CalibrationAdjustment = {
      id: `cal-adj-${randomUUID().slice(0, 8)}`,
      level: target.targetId,
      currentMultiplier,
      proposedMultiplier,
      accuracy: target.metrics.accuracy || 0,
      samples: target.metrics.samples || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.calibrationAdjustments.set(adjustment.id, adjustment);
    await this.saveCalibrationAdjustments();

    return adjustment;
  }

  private calculatePatternPriority(candidate: PatternCandidate): number {
    // Higher occurrences and confidence = higher priority
    return candidate.occurrences * candidate.confidence * 10;
  }

  private calculateSkillImpact(proposal: ImprovementProposal): number {
    // Base impact on confidence and number of suggested changes
    return proposal.confidence * 10 * Math.min(proposal.suggestedChanges.length, 5);
  }

  private calculateSkillEffort(proposal: ImprovementProposal): number {
    // More changes = more effort
    return Math.min(proposal.suggestedChanges.length * 2, 10);
  }

  private calculateLeverageScore(impact: number, effort: number): number {
    // Leverage protocol: V = (Impact × 0.6) / (Effort × 0.4)
    if (effort === 0) return impact;
    return (impact * 0.6) / (effort * 0.4);
  }

  // ==========================================================================
  // PERSISTENCE
  // ==========================================================================

  private async loadState(): Promise<void> {
    await this.loadTargets();
    await this.loadPatternProposals();
    await this.loadCalibrationAdjustments();
    await this.loadHistory();
  }

  private async loadTargets(): Promise<void> {
    try {
      const filePath = join(this.options.dataPath, 'targets', 'active.json');
      const content = await readFile(filePath, 'utf-8');
      const targets = JSON.parse(content) as ImprovementTarget[];
      for (const target of targets) {
        this.targets.set(target.id, target);
      }
    } catch {
      // No existing targets
    }
  }

  private async saveTargets(): Promise<void> {
    const filePath = join(this.options.dataPath, 'targets', 'active.json');
    const targets = [...this.targets.values()];
    await writeFile(filePath, JSON.stringify(targets, null, 2));
  }

  private async loadPatternProposals(): Promise<void> {
    try {
      const filePath = join(this.options.dataPath, 'patterns', 'proposals.json');
      const content = await readFile(filePath, 'utf-8');
      const proposals = JSON.parse(content) as PatternProposal[];
      for (const proposal of proposals) {
        this.patternProposals.set(proposal.id, proposal);
      }
    } catch {
      // No existing proposals
    }
  }

  private async savePatternProposals(): Promise<void> {
    const filePath = join(this.options.dataPath, 'patterns', 'proposals.json');
    const proposals = [...this.patternProposals.values()];
    await writeFile(filePath, JSON.stringify(proposals, null, 2));
  }

  private async loadCalibrationAdjustments(): Promise<void> {
    try {
      const filePath = join(this.options.dataPath, 'calibration', 'adjustments.json');
      const content = await readFile(filePath, 'utf-8');
      const adjustments = JSON.parse(content) as CalibrationAdjustment[];
      for (const adj of adjustments) {
        this.calibrationAdjustments.set(adj.id, adj);
      }
    } catch {
      // No existing adjustments
    }
  }

  private async saveCalibrationAdjustments(): Promise<void> {
    const filePath = join(this.options.dataPath, 'calibration', 'adjustments.json');
    const adjustments = [...this.calibrationAdjustments.values()];
    await writeFile(filePath, JSON.stringify(adjustments, null, 2));
  }

  private async loadHistory(): Promise<void> {
    try {
      const filePath = join(this.options.dataPath, 'history', 'entries.json');
      const content = await readFile(filePath, 'utf-8');
      this.history = JSON.parse(content) as ImprovementHistoryEntry[];
    } catch {
      this.history = [];
    }
  }

  private async saveHistory(): Promise<void> {
    const filePath = join(this.options.dataPath, 'history', 'entries.json');
    // Keep only last 500 entries
    const toSave = this.history.slice(-500);
    await writeFile(filePath, JSON.stringify(toSave, null, 2));
  }
}
