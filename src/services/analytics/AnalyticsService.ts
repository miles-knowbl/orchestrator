/**
 * Analytics Service - OBSERVE layer for self-improvement architecture
 *
 * Collects, aggregates, and surfaces insights from:
 * - Run archives (execution history)
 * - LearningService (rubric scores, proposals)
 * - CalibrationService (estimate accuracy)
 * - MemoryService (patterns, decisions)
 *
 * Read-only: Analytics observes, Learning acts.
 */

import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import type { LearningService, SkillMetrics, ImprovementProposal } from '../LearningService.js';
import type { CalibrationService, CalibrationReport } from '../CalibrationService.js';
import type { MemoryService } from '../MemoryService.js';
import type { Phase } from '../../types.js';

// ============================================================================
// Types
// ============================================================================

export interface RunArchive {
  loop: string;
  version: string;
  system: string;
  status: 'completed' | 'failed' | 'aborted';
  started_at: string;
  completed_at?: string;
  gates_passed?: string[];
  outcome?: string;
  // Optional fields depending on loop type
  release?: { version: string; commits: number; features: number; fixes: number };
  modules_defined?: Array<{ name: string; functions: number }>;
  improvements?: { patterns_added: string[]; decisions_added: string[] };
}

export interface RunMetrics {
  total: number;
  byStatus: Record<string, number>;
  byLoop: Record<string, { count: number; successRate: number; avgDurationMs?: number }>;
  bySystem: Record<string, number>;
  recentRuns: RunArchive[];
}

export interface RubricMetrics {
  skillCount: number;
  averageScores: {
    completeness: number;
    quality: number;
    friction: number;
    relevance: number;
  };
  skillHealth: Array<{
    skillId: string;
    healthScore: number;
    trend: 'improving' | 'stable' | 'declining';
    executionCount: number;
  }>;
  lowHealthSkills: string[];
}

export interface GateMetrics {
  totalGates: number;
  passRate: number;
  byGate: Record<string, { passed: number; failed: number; revisions: number }>;
  mostBlockingGates: string[];
}

export interface PatternMetrics {
  totalPatterns: number;
  totalDecisions: number;
  patterns: Array<{
    id: string;
    name: string;
    uses: number;
    confidence: string;
  }>;
  recentDecisions: Array<{
    id: string;
    title: string;
    date: string;
  }>;
}

export interface ProposalMetrics {
  pending: number;
  approved: number;
  applied: number;
  rejected: number;
  recentProposals: ImprovementProposal[];
}

export interface CalibrationMetrics {
  globalMultiplier: number;
  accuracy: number;
  samples: number;
  trend: 'improving' | 'stable' | 'worsening';
  byPhase?: Record<Phase, { multiplier: number; samples: number }>;
}

export interface TrendData {
  period: string; // e.g., "2026-01-30"
  runs: number;
  successRate: number;
  avgDuration?: number;
}

export interface AnalyticsSummary {
  runs: {
    total: number;
    completed: number;
    failed: number;
    successRate: number;
  };
  skills: {
    tracked: number;
    healthy: number;
    needsAttention: number;
    avgHealthScore: number;
  };
  calibration: {
    accuracy: number;
    multiplier: number;
    trend: string;
  };
  proposals: {
    pending: number;
    applied: number;
  };
  patterns: {
    total: number;
    decisions: number;
  };
  lastUpdated: string;
}

// ============================================================================
// Service
// ============================================================================

export interface AnalyticsServiceOptions {
  runsPath?: string; // Default: ~/.claude/runs
}

export class AnalyticsService {
  private runsPath: string;
  private cachedRuns: RunArchive[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL_MS = 30000; // 30 seconds

  constructor(
    private options: AnalyticsServiceOptions,
    private learningService: LearningService,
    private calibrationService: CalibrationService,
    private memoryService: MemoryService
  ) {
    this.runsPath = options.runsPath || join(homedir(), '.claude', 'runs');
  }

  // ==========================================================================
  // COLLECT FUNCTIONS
  // ==========================================================================

  /**
   * Collect metrics from run archives
   */
  async collectRunMetrics(): Promise<RunMetrics> {
    const runs = await this.loadRunArchives();

    const byStatus: Record<string, number> = {};
    const byLoop: Record<string, { count: number; successes: number; totalDurationMs: number }> = {};
    const bySystem: Record<string, number> = {};

    for (const run of runs) {
      // By status
      byStatus[run.status] = (byStatus[run.status] || 0) + 1;

      // By loop
      if (!byLoop[run.loop]) {
        byLoop[run.loop] = { count: 0, successes: 0, totalDurationMs: 0 };
      }
      byLoop[run.loop].count++;
      if (run.status === 'completed') {
        byLoop[run.loop].successes++;
      }
      if (run.started_at && run.completed_at) {
        const duration = new Date(run.completed_at).getTime() - new Date(run.started_at).getTime();
        byLoop[run.loop].totalDurationMs += duration;
      }

      // By system
      bySystem[run.system] = (bySystem[run.system] || 0) + 1;
    }

    // Convert byLoop to final format
    const byLoopFinal: Record<string, { count: number; successRate: number; avgDurationMs?: number }> = {};
    for (const [loop, data] of Object.entries(byLoop)) {
      byLoopFinal[loop] = {
        count: data.count,
        successRate: data.count > 0 ? data.successes / data.count : 0,
        avgDurationMs: data.count > 0 ? data.totalDurationMs / data.count : undefined,
      };
    }

    return {
      total: runs.length,
      byStatus,
      byLoop: byLoopFinal,
      bySystem,
      recentRuns: runs.slice(0, 10),
    };
  }

  /**
   * Collect rubric metrics from LearningService
   */
  async collectRubricMetrics(): Promise<RubricMetrics> {
    const allMetrics = this.learningService.getAllMetrics();

    if (allMetrics.length === 0) {
      return {
        skillCount: 0,
        averageScores: { completeness: 0, quality: 0, friction: 0, relevance: 0 },
        skillHealth: [],
        lowHealthSkills: [],
      };
    }

    // Calculate health score for each skill (average of success rate and average score)
    const skillHealth = allMetrics.map(m => ({
      skillId: m.skillId,
      healthScore: (m.successRate + m.averageScore) / 2,
      trend: m.improvementTrend,
      executionCount: m.executionCount,
    }));

    // Find low health skills (below 0.6 health score)
    const lowHealthSkills = skillHealth
      .filter(s => s.healthScore < 0.6)
      .map(s => s.skillId);

    // Calculate average scores (placeholder - would need rubric data from signals)
    const avgHealthScore = skillHealth.reduce((sum, s) => sum + s.healthScore, 0) / skillHealth.length;

    return {
      skillCount: allMetrics.length,
      averageScores: {
        completeness: avgHealthScore,
        quality: avgHealthScore,
        friction: avgHealthScore,
        relevance: avgHealthScore,
      },
      skillHealth: skillHealth.sort((a, b) => b.healthScore - a.healthScore),
      lowHealthSkills,
    };
  }

  /**
   * Collect calibration metrics from CalibrationService
   */
  async collectCalibrationMetrics(): Promise<CalibrationMetrics> {
    const report = await this.calibrationService.getCalibrationReport('orchestrator');

    return {
      globalMultiplier: report.global.multiplier,
      accuracy: report.global.accuracy,
      samples: report.global.samples,
      trend: report.trends.direction,
      byPhase: report.byPhase,
    };
  }

  /**
   * Collect gate metrics from run archives
   */
  async collectGateMetrics(): Promise<GateMetrics> {
    const runs = await this.loadRunArchives();

    const byGate: Record<string, { passed: number; failed: number; revisions: number }> = {};
    let totalGates = 0;
    let totalPassed = 0;

    for (const run of runs) {
      if (run.gates_passed) {
        for (const gate of run.gates_passed) {
          if (!byGate[gate]) {
            byGate[gate] = { passed: 0, failed: 0, revisions: 0 };
          }
          byGate[gate].passed++;
          totalGates++;
          totalPassed++;
        }
      }
    }

    // Find most blocking gates (lowest pass rate)
    const mostBlockingGates = Object.entries(byGate)
      .map(([gate, data]) => ({
        gate,
        passRate: data.passed / (data.passed + data.failed + data.revisions) || 1,
      }))
      .sort((a, b) => a.passRate - b.passRate)
      .slice(0, 3)
      .map(g => g.gate);

    return {
      totalGates,
      passRate: totalGates > 0 ? totalPassed / totalGates : 1,
      byGate,
      mostBlockingGates,
    };
  }

  /**
   * Collect pattern metrics from MemoryService
   */
  async collectPatternMetrics(): Promise<PatternMetrics> {
    const memory = await this.memoryService.getOrCreateMemory('orchestrator');

    const patterns = memory.patterns.map(p => ({
      id: p.id,
      name: p.name,
      uses: p.uses || 1,
      confidence: p.confidence,
    }));

    const recentDecisions = memory.decisions.slice(-5).map(d => ({
      id: d.id,
      title: d.title,
      date: d.timestamp instanceof Date ? d.timestamp.toISOString() : String(d.timestamp),
    }));

    return {
      totalPatterns: patterns.length,
      totalDecisions: memory.decisions.length,
      patterns,
      recentDecisions,
    };
  }

  /**
   * Collect proposal metrics from LearningService
   */
  async collectProposalMetrics(): Promise<ProposalMetrics> {
    const proposals = this.learningService.listProposals();

    return {
      pending: proposals.filter(p => p.status === 'pending').length,
      approved: proposals.filter(p => p.status === 'approved').length,
      applied: proposals.filter(p => p.status === 'applied').length,
      rejected: proposals.filter(p => p.status === 'rejected').length,
      recentProposals: proposals.slice(0, 5),
    };
  }

  // ==========================================================================
  // AGGREGATE FUNCTIONS
  // ==========================================================================

  /**
   * Compute all aggregates
   */
  async computeAggregates(): Promise<{
    runMetrics: RunMetrics;
    rubricMetrics: RubricMetrics;
    calibrationMetrics: CalibrationMetrics;
    gateMetrics: GateMetrics;
    patternMetrics: PatternMetrics;
    proposalMetrics: ProposalMetrics;
  }> {
    const [
      runMetrics,
      rubricMetrics,
      calibrationMetrics,
      gateMetrics,
      patternMetrics,
      proposalMetrics,
    ] = await Promise.all([
      this.collectRunMetrics(),
      this.collectRubricMetrics(),
      this.collectCalibrationMetrics(),
      this.collectGateMetrics(),
      this.collectPatternMetrics(),
      this.collectProposalMetrics(),
    ]);

    return {
      runMetrics,
      rubricMetrics,
      calibrationMetrics,
      gateMetrics,
      patternMetrics,
      proposalMetrics,
    };
  }

  /**
   * Get dashboard-ready summary
   */
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const aggregates = await this.computeAggregates();

    const completed = aggregates.runMetrics.byStatus['completed'] || 0;
    const failed = (aggregates.runMetrics.byStatus['failed'] || 0) +
                   (aggregates.runMetrics.byStatus['aborted'] || 0);

    return {
      runs: {
        total: aggregates.runMetrics.total,
        completed,
        failed,
        successRate: aggregates.runMetrics.total > 0
          ? completed / aggregates.runMetrics.total
          : 0,
      },
      skills: {
        tracked: aggregates.rubricMetrics.skillCount,
        healthy: aggregates.rubricMetrics.skillHealth.filter(s => s.healthScore >= 0.6).length,
        needsAttention: aggregates.rubricMetrics.lowHealthSkills.length,
        avgHealthScore: aggregates.rubricMetrics.skillHealth.length > 0
          ? aggregates.rubricMetrics.skillHealth.reduce((sum, s) => sum + s.healthScore, 0) /
            aggregates.rubricMetrics.skillHealth.length
          : 0,
      },
      calibration: {
        accuracy: aggregates.calibrationMetrics.accuracy,
        multiplier: aggregates.calibrationMetrics.globalMultiplier,
        trend: aggregates.calibrationMetrics.trend,
      },
      proposals: {
        pending: aggregates.proposalMetrics.pending,
        applied: aggregates.proposalMetrics.applied,
      },
      patterns: {
        total: aggregates.patternMetrics.totalPatterns,
        decisions: aggregates.patternMetrics.totalDecisions,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get skill health rankings
   */
  async getSkillHealth(): Promise<RubricMetrics['skillHealth']> {
    const metrics = await this.collectRubricMetrics();
    return metrics.skillHealth;
  }

  /**
   * Get loop performance metrics
   */
  async getLoopPerformance(): Promise<RunMetrics['byLoop']> {
    const metrics = await this.collectRunMetrics();
    return metrics.byLoop;
  }

  /**
   * Get calibration accuracy
   */
  async getCalibrationAccuracy(): Promise<CalibrationMetrics> {
    return this.collectCalibrationMetrics();
  }

  /**
   * Get time-series trend data
   */
  async getTrends(days: number = 30): Promise<TrendData[]> {
    const runs = await this.loadRunArchives();
    const trends: Map<string, { runs: number; successes: number; totalDuration: number }> = new Map();

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    for (const run of runs) {
      const startDate = new Date(run.started_at);
      if (startDate < cutoff) continue;

      const period = startDate.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!trends.has(period)) {
        trends.set(period, { runs: 0, successes: 0, totalDuration: 0 });
      }

      const data = trends.get(period)!;
      data.runs++;
      if (run.status === 'completed') {
        data.successes++;
      }
      if (run.started_at && run.completed_at) {
        data.totalDuration += new Date(run.completed_at).getTime() - new Date(run.started_at).getTime();
      }
    }

    return Array.from(trends.entries())
      .map(([period, data]) => ({
        period,
        runs: data.runs,
        successRate: data.runs > 0 ? data.successes / data.runs : 0,
        avgDuration: data.runs > 0 ? data.totalDuration / data.runs : undefined,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Load run archives from disk with caching
   */
  private async loadRunArchives(): Promise<RunArchive[]> {
    const now = Date.now();
    if (this.cachedRuns && (now - this.cacheTimestamp) < this.CACHE_TTL_MS) {
      return this.cachedRuns;
    }

    const runs: RunArchive[] = [];

    try {
      // List year-month directories
      const months = await readdir(this.runsPath);

      for (const month of months) {
        const monthPath = join(this.runsPath, month);

        try {
          const files = await readdir(monthPath);

          for (const file of files) {
            if (!file.endsWith('.json')) continue;

            try {
              const content = await readFile(join(monthPath, file), 'utf-8');
              const run = JSON.parse(content) as RunArchive;
              runs.push(run);
            } catch {
              // Skip invalid files
            }
          }
        } catch {
          // Skip invalid directories
        }
      }
    } catch {
      // Runs directory doesn't exist yet
    }

    // Sort by started_at descending (most recent first)
    runs.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

    this.cachedRuns = runs;
    this.cacheTimestamp = now;

    return runs;
  }

  /**
   * Invalidate cache (call after new runs are archived)
   */
  invalidateCache(): void {
    this.cachedRuns = null;
    this.cacheTimestamp = 0;
  }
}
