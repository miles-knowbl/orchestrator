/**
 * Learning Service - Post-execution analysis and skill improvement
 *
 * Analyzes execution outcomes to:
 * - Track success/failure patterns
 * - Generate improvement proposals
 * - Update skill metrics
 * - Record learnings in memory
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { randomUUID } from 'crypto';
import type { SkillRegistry } from './SkillRegistry.js';
import type { MemoryService } from './MemoryService.js';
import type {
  Skill,
  SkillExecution,
  LoopExecution,
  ImprovementRecord,
  ImprovementCategory,
  Pattern,
  Phase,
} from '../types.js';

export interface LearningServiceOptions {
  dataPath: string;  // Path for learning data storage
}

export interface ImprovementProposal {
  id: string;
  skillId: string;
  skillVersion: string;
  category: ImprovementCategory;
  title: string;
  description: string;
  suggestedChanges: string[];
  source: ExecutionAnalysis;
  confidence: number;  // 0-1
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  createdAt: Date;
}

export interface ExecutionAnalysis {
  executionId: string;
  skillId: string;
  phase: Phase;
  outcome: {
    success: boolean;
    score: number;
    signals: string[];
  };
  deliverables: string[];
  durationMs?: number;
  patterns: string[];  // Detected patterns
  issues: string[];    // Detected issues
}

export interface SkillMetrics {
  skillId: string;
  executionCount: number;
  successRate: number;
  averageScore: number;
  averageDuration: number;
  recentExecutions: ExecutionAnalysis[];
  improvementTrend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

export class LearningService {
  private proposals: Map<string, ImprovementProposal> = new Map();
  private metrics: Map<string, SkillMetrics> = new Map();

  constructor(
    private options: LearningServiceOptions,
    private skillRegistry: SkillRegistry,
    private memoryService: MemoryService
  ) {}

  /**
   * Initialize by loading stored learning data
   */
  async initialize(): Promise<void> {
    await mkdir(this.options.dataPath, { recursive: true });
    await mkdir(join(this.options.dataPath, 'proposals'), { recursive: true });
    await mkdir(join(this.options.dataPath, 'metrics'), { recursive: true });

    // Load existing proposals
    await this.loadProposals();

    // Load skill metrics
    await this.loadMetrics();

    this.log('info', `Loaded ${this.proposals.size} proposals, ${this.metrics.size} skill metrics`);
  }

  /**
   * Load improvement proposals from disk
   */
  private async loadProposals(): Promise<void> {
    const proposalsPath = join(this.options.dataPath, 'proposals.json');
    try {
      const content = await readFile(proposalsPath, 'utf-8');
      const data = JSON.parse(content) as ImprovementProposal[];
      for (const proposal of data) {
        proposal.createdAt = new Date(proposal.createdAt);
        this.proposals.set(proposal.id, proposal);
      }
    } catch {
      // No proposals file yet
    }
  }

  /**
   * Load skill metrics from disk
   */
  private async loadMetrics(): Promise<void> {
    const metricsPath = join(this.options.dataPath, 'metrics.json');
    try {
      const content = await readFile(metricsPath, 'utf-8');
      const data = JSON.parse(content) as Record<string, SkillMetrics>;
      for (const [id, metrics] of Object.entries(data)) {
        metrics.lastUpdated = new Date(metrics.lastUpdated);
        this.metrics.set(id, metrics);
      }
    } catch {
      // No metrics file yet
    }
  }

  /**
   * Save proposals to disk
   */
  private async saveProposals(): Promise<void> {
    const proposalsPath = join(this.options.dataPath, 'proposals.json');
    const data = [...this.proposals.values()];
    await writeFile(proposalsPath, JSON.stringify(data, null, 2));
  }

  /**
   * Save metrics to disk
   */
  private async saveMetrics(): Promise<void> {
    const metricsPath = join(this.options.dataPath, 'metrics.json');
    const data = Object.fromEntries(this.metrics);
    await writeFile(metricsPath, JSON.stringify(data, null, 2));
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Analyze a completed skill execution and record learnings
   */
  async analyzeExecution(
    execution: SkillExecution,
    loopExecution: LoopExecution
  ): Promise<ExecutionAnalysis> {
    const skill = await this.skillRegistry.getSkill(execution.skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${execution.skillId}`);
    }

    // Build execution analysis
    const analysis: ExecutionAnalysis = {
      executionId: execution.id,
      skillId: execution.skillId,
      phase: execution.phase,
      outcome: execution.outcome || {
        success: execution.status === 'completed',
        score: execution.status === 'completed' ? 1 : 0,
        signals: [],
      },
      deliverables: execution.deliverables,
      durationMs: execution.durationMs,
      patterns: this.detectPatterns(execution, skill),
      issues: this.detectIssues(execution, skill),
    };

    // Update skill metrics
    await this.updateMetrics(execution.skillId, analysis);

    // Record patterns in memory
    for (const patternName of analysis.patterns) {
      await this.memoryService.recordPattern('skill', execution.skillId, {
        name: patternName,
        context: `Detected during ${execution.phase} phase execution`,
        solution: `Pattern observed in ${execution.skillId}`,
        confidence: 'low',
      });
    }

    // Generate improvement proposals for issues
    if (analysis.issues.length > 0) {
      await this.generateProposals(skill, analysis);
    }

    this.log('info', `Analyzed execution ${execution.id} for skill ${execution.skillId}`);
    return analysis;
  }

  /**
   * Detect patterns in a skill execution
   */
  private detectPatterns(execution: SkillExecution, skill: Skill): string[] {
    const patterns: string[] = [];

    // Fast execution pattern
    if (execution.durationMs && execution.durationMs < 5000) {
      patterns.push('fast-execution');
    }

    // High deliverable output
    if (execution.deliverables.length > 5) {
      patterns.push('high-output');
    }

    // Reference-heavy execution
    if (execution.referencesRead.length > 3) {
      patterns.push('reference-intensive');
    }

    // Perfect score
    if (execution.outcome?.score === 1) {
      patterns.push('perfect-execution');
    }

    return patterns;
  }

  /**
   * Detect potential issues in a skill execution
   */
  private detectIssues(execution: SkillExecution, skill: Skill): string[] {
    const issues: string[] = [];

    // Failed execution
    if (execution.status === 'failed') {
      issues.push(`Execution failed: ${execution.error || 'Unknown error'}`);
    }

    // Low score
    if (execution.outcome && execution.outcome.score < 0.5) {
      issues.push(`Low outcome score: ${execution.outcome.score}`);
    }

    // No deliverables produced
    if (execution.deliverables.length === 0 && execution.status === 'completed') {
      issues.push('No deliverables produced despite completion');
    }

    // Very long execution
    if (execution.durationMs && execution.durationMs > 300000) {
      issues.push(`Long execution time: ${Math.round(execution.durationMs / 1000)}s`);
    }

    return issues;
  }

  /**
   * Update metrics for a skill
   */
  private async updateMetrics(
    skillId: string,
    analysis: ExecutionAnalysis
  ): Promise<SkillMetrics> {
    const existing = this.metrics.get(skillId) || {
      skillId,
      executionCount: 0,
      successRate: 0,
      averageScore: 0,
      averageDuration: 0,
      recentExecutions: [],
      improvementTrend: 'stable' as const,
      lastUpdated: new Date(),
    };

    // Update counts
    existing.executionCount++;

    // Update success rate (exponential moving average)
    const successValue = analysis.outcome.success ? 1 : 0;
    existing.successRate = this.exponentialAverage(
      existing.successRate,
      successValue,
      existing.executionCount
    );

    // Update average score
    existing.averageScore = this.exponentialAverage(
      existing.averageScore,
      analysis.outcome.score,
      existing.executionCount
    );

    // Update average duration
    if (analysis.durationMs) {
      existing.averageDuration = this.exponentialAverage(
        existing.averageDuration,
        analysis.durationMs,
        existing.executionCount
      );
    }

    // Keep recent executions (last 20)
    existing.recentExecutions.unshift(analysis);
    if (existing.recentExecutions.length > 20) {
      existing.recentExecutions.pop();
    }

    // Calculate improvement trend
    existing.improvementTrend = this.calculateTrend(existing.recentExecutions);

    existing.lastUpdated = new Date();
    this.metrics.set(skillId, existing);
    await this.saveMetrics();

    return existing;
  }

  /**
   * Exponential moving average calculation
   */
  private exponentialAverage(
    current: number,
    newValue: number,
    samples: number
  ): number {
    const alpha = Math.min(0.3, 1 / samples);
    return current * (1 - alpha) + newValue * alpha;
  }

  /**
   * Calculate improvement trend from recent executions
   */
  private calculateTrend(
    executions: ExecutionAnalysis[]
  ): 'improving' | 'stable' | 'declining' {
    if (executions.length < 5) return 'stable';

    const recentHalf = executions.slice(0, Math.floor(executions.length / 2));
    const olderHalf = executions.slice(Math.floor(executions.length / 2));

    const recentAvg = recentHalf.reduce((sum, e) => sum + e.outcome.score, 0) / recentHalf.length;
    const olderAvg = olderHalf.reduce((sum, e) => sum + e.outcome.score, 0) / olderHalf.length;

    const diff = recentAvg - olderAvg;
    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'declining';
    return 'stable';
  }

  /**
   * Generate improvement proposals from execution analysis
   */
  private async generateProposals(
    skill: Skill,
    analysis: ExecutionAnalysis
  ): Promise<ImprovementProposal[]> {
    const proposals: ImprovementProposal[] = [];

    for (const issue of analysis.issues) {
      const proposal: ImprovementProposal = {
        id: `PROP-${Date.now().toString(36).toUpperCase()}`,
        skillId: skill.id,
        skillVersion: skill.version,
        category: this.categorizeIssue(issue),
        title: this.generateProposalTitle(issue),
        description: issue,
        suggestedChanges: this.suggestChanges(issue, skill),
        source: analysis,
        confidence: this.calculateConfidence(analysis),
        status: 'pending',
        createdAt: new Date(),
      };

      proposals.push(proposal);
      this.proposals.set(proposal.id, proposal);
    }

    await this.saveProposals();
    return proposals;
  }

  /**
   * Categorize an issue into improvement category
   */
  private categorizeIssue(issue: string): ImprovementCategory {
    if (issue.includes('failed') || issue.includes('error')) return 'bug';
    if (issue.includes('score') || issue.includes('Low')) return 'enhancement';
    if (issue.includes('time') || issue.includes('duration')) return 'enhancement';
    return 'clarification';
  }

  /**
   * Generate a proposal title from an issue
   */
  private generateProposalTitle(issue: string): string {
    if (issue.includes('failed')) return 'Address execution failure';
    if (issue.includes('score')) return 'Improve outcome quality';
    if (issue.includes('deliverables')) return 'Add deliverable guidance';
    if (issue.includes('time')) return 'Optimize execution time';
    return 'General improvement';
  }

  /**
   * Suggest changes based on issue
   */
  private suggestChanges(issue: string, skill: Skill): string[] {
    const suggestions: string[] = [];

    if (issue.includes('failed')) {
      suggestions.push('Add error handling guidance');
      suggestions.push('Clarify prerequisites and dependencies');
      suggestions.push('Add common failure recovery patterns');
    }

    if (issue.includes('score')) {
      suggestions.push('Add quality checklist');
      suggestions.push('Clarify success criteria');
      suggestions.push('Add examples of high-quality output');
    }

    if (issue.includes('deliverables')) {
      suggestions.push('Specify expected deliverables');
      suggestions.push('Add deliverable templates');
    }

    if (issue.includes('time')) {
      suggestions.push('Break down into smaller sub-tasks');
      suggestions.push('Add time-boxing guidance');
      suggestions.push('Identify parallelizable steps');
    }

    return suggestions;
  }

  /**
   * Calculate confidence for a proposal
   */
  private calculateConfidence(analysis: ExecutionAnalysis): number {
    // Lower confidence if it's the first failure
    const metrics = this.metrics.get(analysis.skillId);
    if (!metrics || metrics.executionCount < 3) {
      return 0.3;
    }

    // Higher confidence for recurring issues
    const recentIssues = metrics.recentExecutions.filter(
      e => e.issues.length > 0
    ).length;

    if (recentIssues >= 3) return 0.9;
    if (recentIssues >= 2) return 0.7;
    return 0.5;
  }

  /**
   * Capture explicit improvement feedback
   */
  async captureImprovement(params: {
    skillId: string;
    feedback: string;
    source: string;
    category: ImprovementCategory;
  }): Promise<ImprovementProposal> {
    const skill = await this.skillRegistry.getSkill(params.skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${params.skillId}`);
    }

    const proposal: ImprovementProposal = {
      id: `PROP-${Date.now().toString(36).toUpperCase()}`,
      skillId: params.skillId,
      skillVersion: skill.version,
      category: params.category,
      title: `User feedback: ${params.feedback.slice(0, 50)}...`,
      description: params.feedback,
      suggestedChanges: [],  // User provides the changes
      source: {
        executionId: 'manual',
        skillId: params.skillId,
        phase: skill.phase || 'IMPLEMENT',
        outcome: { success: true, score: 1, signals: ['manual-feedback'] },
        deliverables: [],
        patterns: [],
        issues: [params.feedback],
      },
      confidence: 1.0,  // User feedback is high confidence
      status: 'pending',
      createdAt: new Date(),
    };

    this.proposals.set(proposal.id, proposal);
    await this.saveProposals();

    this.log('info', `Captured improvement ${proposal.id} for skill ${params.skillId}`);
    return proposal;
  }

  /**
   * Apply an improvement proposal
   */
  async applyProposal(
    proposalId: string,
    changes: {
      content?: string;
      description?: string;
      versionBump: 'patch' | 'minor' | 'major';
    }
  ): Promise<{ skill: Skill; proposal: ImprovementProposal }> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }

    if (proposal.status !== 'pending' && proposal.status !== 'approved') {
      throw new Error(`Proposal ${proposalId} is ${proposal.status}, cannot apply`);
    }

    // Update the skill
    const skill = await this.skillRegistry.updateSkill({
      name: proposal.skillId,
      content: changes.content,
      description: changes.description,
      versionBump: changes.versionBump,
      changeDescription: proposal.title,
    });

    // Mark proposal as applied
    proposal.status = 'applied';
    await this.saveProposals();

    // Record decision in memory
    await this.memoryService.recordDecision('skill', proposal.skillId, {
      title: proposal.title,
      context: proposal.description,
      decision: `Applied improvement: ${proposal.suggestedChanges.join(', ')}`,
      consequences: `Skill updated to version ${skill.version}`,
    });

    this.log('info', `Applied proposal ${proposalId} to skill ${proposal.skillId}`);
    return { skill, proposal };
  }

  /**
   * Approve a proposal for later application
   */
  async approveProposal(proposalId: string): Promise<ImprovementProposal> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }

    proposal.status = 'approved';
    await this.saveProposals();

    this.log('info', `Approved proposal ${proposalId}`);
    return proposal;
  }

  /**
   * Reject a proposal
   */
  async rejectProposal(proposalId: string, reason?: string): Promise<ImprovementProposal> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }

    proposal.status = 'rejected';
    await this.saveProposals();

    this.log('info', `Rejected proposal ${proposalId}: ${reason || 'No reason'}`);
    return proposal;
  }

  /**
   * List improvement proposals
   */
  listProposals(filter?: {
    skillId?: string;
    status?: ImprovementProposal['status'];
    category?: ImprovementCategory;
  }): ImprovementProposal[] {
    let results = [...this.proposals.values()];

    if (filter?.skillId) {
      results = results.filter(p => p.skillId === filter.skillId);
    }
    if (filter?.status) {
      results = results.filter(p => p.status === filter.status);
    }
    if (filter?.category) {
      results = results.filter(p => p.category === filter.category);
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get a specific proposal
   */
  getProposal(id: string): ImprovementProposal | null {
    return this.proposals.get(id) || null;
  }

  /**
   * Get metrics for a skill
   */
  getSkillMetrics(skillId: string): SkillMetrics | null {
    return this.metrics.get(skillId) || null;
  }

  /**
   * Get metrics for all skills
   */
  getAllMetrics(): SkillMetrics[] {
    return [...this.metrics.values()];
  }

  /**
   * Identify skills that may need pruning (low usage, low success)
   */
  identifyUnderutilizedSkills(): {
    skillId: string;
    reason: string;
    metrics: SkillMetrics;
  }[] {
    const underutilized: { skillId: string; reason: string; metrics: SkillMetrics }[] = [];

    for (const metrics of this.metrics.values()) {
      const reasons: string[] = [];

      // Low execution count
      if (metrics.executionCount < 3 &&
          metrics.lastUpdated.getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000) {
        reasons.push('Low usage (< 3 executions in 30 days)');
      }

      // Low success rate
      if (metrics.successRate < 0.5 && metrics.executionCount >= 5) {
        reasons.push(`Low success rate (${Math.round(metrics.successRate * 100)}%)`);
      }

      // Declining trend
      if (metrics.improvementTrend === 'declining') {
        reasons.push('Declining performance trend');
      }

      if (reasons.length > 0) {
        underutilized.push({
          skillId: metrics.skillId,
          reason: reasons.join('; '),
          metrics,
        });
      }
    }

    return underutilized;
  }

  /**
   * Get learning summary for display
   */
  async getLearningStatus(): Promise<{
    proposalCount: { pending: number; approved: number; applied: number; rejected: number };
    skillsWithMetrics: number;
    averageSuccessRate: number;
    underutilizedSkills: number;
    improvingSkills: number;
    decliningSkills: number;
  }> {
    const proposals = [...this.proposals.values()];
    const metrics = [...this.metrics.values()];

    return {
      proposalCount: {
        pending: proposals.filter(p => p.status === 'pending').length,
        approved: proposals.filter(p => p.status === 'approved').length,
        applied: proposals.filter(p => p.status === 'applied').length,
        rejected: proposals.filter(p => p.status === 'rejected').length,
      },
      skillsWithMetrics: metrics.length,
      averageSuccessRate: metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length
        : 0,
      underutilizedSkills: this.identifyUnderutilizedSkills().length,
      improvingSkills: metrics.filter(m => m.improvementTrend === 'improving').length,
      decliningSkills: metrics.filter(m => m.improvementTrend === 'declining').length,
    };
  }

  private log(level: string, message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'LearningService',
      message,
    }));
  }
}
