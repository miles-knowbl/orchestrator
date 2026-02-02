/**
 * ScoringService - System-level evaluation around module-specific value
 *
 * Quantifies how much each module contributes to dream state advancement.
 * Unifies scoring from multiple sources into comprehensive module and system scores.
 *
 * Part of the scoring module (Layer 2).
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import type { RoadmapService, LeverageScore, RoadmapProgress, Module } from '../roadmapping/index.js';
import type { AnalyticsService, AnalyticsSummary } from '../analytics/index.js';
import type { CalibrationService } from '../CalibrationService.js';

// ============================================================================
// Types
// ============================================================================

export interface ScoringServiceOptions {
  dataPath: string;
  historyRetentionDays?: number;
}

/**
 * Comprehensive score for a single module
 */
export interface ModuleScore {
  moduleId: string;
  moduleName: string;
  layer: number;
  status: string;

  // Overall composite score (0-100)
  overallScore: number;

  // Component scores (0-100 each)
  components: {
    /** Dream state alignment - how directly this advances the goal */
    dreamStateAlignment: number;
    /** Downstream impact - how many modules this unblocks */
    downstreamImpact: number;
    /** Completion value - contribution to overall progress */
    completionValue: number;
    /** Execution quality - historical success rate if completed */
    executionQuality: number;
    /** Strategic position - layer importance and dependency criticality */
    strategicPosition: number;
  };

  // Metadata
  leverage?: LeverageScore;
  isComplete: boolean;
  isCriticalPath: boolean;
  blockedByCount: number;
  unlocksCount: number;

  computedAt: string;
}

/**
 * Aggregate score for the entire system
 */
export interface SystemScore {
  systemId: string;

  // Overall system health (0-100)
  overallHealth: number;

  // Completion metrics
  completion: {
    percentage: number;
    modulesComplete: number;
    modulesTotal: number;
    layersComplete: number;
    layersTotal: number;
  };

  // Quality metrics
  quality: {
    avgModuleScore: number;
    avgExecutionQuality: number;
    calibrationAccuracy: number;
    patternCoverage: number;
  };

  // Momentum metrics
  momentum: {
    recentCompletions: number;  // Last 7 days
    velocityTrend: 'accelerating' | 'steady' | 'slowing';
    nextHighestLeverageScore: number;
  };

  // Risk metrics
  risk: {
    blockedModules: number;
    criticalPathLength: number;
    estimationDrift: number;
  };

  computedAt: string;
}

/**
 * Historical score entry
 */
export interface ScoreHistoryEntry {
  timestamp: string;
  systemScore: number;
  completionPercentage: number;
  moduleScores: { moduleId: string; score: number }[];
}

/**
 * Score comparison between two points in time
 */
export interface ScoreComparison {
  fromTimestamp: string;
  toTimestamp: string;
  systemScoreDelta: number;
  completionDelta: number;
  modulesCompleted: string[];
  scoreImprovements: { moduleId: string; delta: number }[];
  scoreDeclines: { moduleId: string; delta: number }[];
}

// ============================================================================
// Service
// ============================================================================

export class ScoringService {
  private roadmapService: RoadmapService | null = null;
  private analyticsService: AnalyticsService | null = null;
  private calibrationService: CalibrationService | null = null;

  private historyPath: string;
  private history: ScoreHistoryEntry[] = [];
  private historyRetentionDays: number;

  constructor(private options: ScoringServiceOptions) {
    this.historyPath = join(options.dataPath, 'score-history.json');
    this.historyRetentionDays = options.historyRetentionDays || 90;
  }

  /**
   * Set dependencies (called after construction to avoid circular deps)
   */
  setDependencies(deps: {
    roadmapService: RoadmapService;
    analyticsService?: AnalyticsService;
    calibrationService?: CalibrationService;
  }): void {
    this.roadmapService = deps.roadmapService;
    this.analyticsService = deps.analyticsService || null;
    this.calibrationService = deps.calibrationService || null;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    await mkdir(dirname(this.historyPath), { recursive: true });
    await this.loadHistory();
  }

  // --------------------------------------------------------------------------
  // Module Scoring
  // --------------------------------------------------------------------------

  /**
   * Calculate comprehensive score for a single module
   */
  async scoreModule(moduleId: string): Promise<ModuleScore | null> {
    if (!this.roadmapService) {
      throw new Error('RoadmapService not set. Call setDependencies first.');
    }

    const module = this.roadmapService.getModule(moduleId);
    if (!module) return null;

    const progress = this.roadmapService.getProgress();
    const leverageScores = this.roadmapService.calculateLeverageScores();
    const leverage = leverageScores.find(l => l.moduleId === moduleId);

    // Calculate component scores
    const dreamStateAlignment = this.calculateDreamStateAlignment(module, progress);
    const downstreamImpact = this.calculateDownstreamImpact(module, progress);
    const completionValue = this.calculateCompletionValue(module, progress);
    const executionQuality = await this.calculateExecutionQuality(module);
    const strategicPosition = this.calculateStrategicPosition(module, progress);

    // Weighted composite (0-100)
    const overallScore = Math.round(
      dreamStateAlignment * 0.25 +
      downstreamImpact * 0.20 +
      completionValue * 0.20 +
      executionQuality * 0.15 +
      strategicPosition * 0.20
    );

    // Determine if on critical path
    const criticalPath = progress.criticalPath.map(m => m.id);
    const isCriticalPath = criticalPath.includes(moduleId);

    // Count dependencies
    const blockedByCount = module.dependsOn.filter(d => d !== '—').length;
    const unlocksCount = this.countUnlocks(moduleId, progress);

    return {
      moduleId,
      moduleName: module.name,
      layer: module.layer,
      status: module.status,
      overallScore,
      components: {
        dreamStateAlignment,
        downstreamImpact,
        completionValue,
        executionQuality,
        strategicPosition,
      },
      leverage,
      isComplete: module.status === 'complete',
      isCriticalPath,
      blockedByCount,
      unlocksCount,
      computedAt: new Date().toISOString(),
    };
  }

  /**
   * Score all modules
   */
  async scoreAllModules(): Promise<ModuleScore[]> {
    if (!this.roadmapService) {
      throw new Error('RoadmapService not set. Call setDependencies first.');
    }

    const roadmap = this.roadmapService.getRoadmap();
    const scores: ModuleScore[] = [];

    for (const module of roadmap.modules) {
      const score = await this.scoreModule(module.id);
      if (score) scores.push(score);
    }

    return scores.sort((a, b) => b.overallScore - a.overallScore);
  }

  /**
   * Get top N modules by score
   */
  async getTopModules(n: number = 10): Promise<ModuleScore[]> {
    const all = await this.scoreAllModules();
    return all.slice(0, n);
  }

  /**
   * Get modules needing attention (low scores, blocked, etc.)
   */
  async getModulesNeedingAttention(): Promise<ModuleScore[]> {
    const all = await this.scoreAllModules();
    return all.filter(m =>
      !m.isComplete && (
        m.overallScore < 50 ||
        m.status === 'blocked' ||
        m.components.executionQuality < 50
      )
    );
  }

  // --------------------------------------------------------------------------
  // System Scoring
  // --------------------------------------------------------------------------

  /**
   * Calculate comprehensive system score
   */
  async scoreSystem(): Promise<SystemScore> {
    if (!this.roadmapService) {
      throw new Error('RoadmapService not set. Call setDependencies first.');
    }

    const progress = this.roadmapService.getProgress();
    const leverageScores = this.roadmapService.calculateLeverageScores();
    const moduleScores = await this.scoreAllModules();

    // Completion metrics
    const completedLayers = progress.layerProgress.filter(l => l.percentage === 100).length;

    // Quality metrics
    const avgModuleScore = moduleScores.length > 0
      ? Math.round(moduleScores.reduce((sum, m) => sum + m.overallScore, 0) / moduleScores.length)
      : 0;

    const avgExecutionQuality = moduleScores.length > 0
      ? Math.round(moduleScores.reduce((sum, m) => sum + m.components.executionQuality, 0) / moduleScores.length)
      : 0;

    // Get calibration accuracy
    let calibrationAccuracy = 70; // Default
    if (this.calibrationService) {
      try {
        const report = await this.calibrationService.getCalibrationReport();
        calibrationAccuracy = Math.round(report.global.accuracy * 100);
      } catch {
        // Use default
      }
    }

    // Pattern coverage (simplified)
    let patternCoverage = 60; // Default
    if (this.analyticsService) {
      try {
        const summary = await this.analyticsService.getAnalyticsSummary();
        patternCoverage = Math.min(100, summary.patterns.total * 5); // 20 patterns = 100%
      } catch {
        // Use default
      }
    }

    // Momentum metrics
    const recentCompletions = this.countRecentCompletions(progress, 7);
    const velocityTrend = this.calculateVelocityTrend();
    const nextHighestLeverageScore = leverageScores.length > 0
      ? Math.round(leverageScores[0].score * 10)
      : 0;

    // Risk metrics
    const blockedModules = progress.blockedModules;
    const criticalPathLength = progress.criticalPath.length;

    let estimationDrift = 0;
    if (this.calibrationService) {
      try {
        const report = await this.calibrationService.getCalibrationReport();
        estimationDrift = Math.abs(report.global.multiplier - 1) * 100; // % deviation from 1.0
      } catch {
        // Use default
      }
    }

    // Overall health score (weighted composite)
    const overallHealth = Math.round(
      progress.overallPercentage * 0.30 +           // Completion weight
      avgModuleScore * 0.25 +                        // Quality weight
      (100 - blockedModules * 10) * 0.15 +          // Flow weight (fewer blocks = better)
      calibrationAccuracy * 0.15 +                   // Accuracy weight
      nextHighestLeverageScore * 0.15               // Momentum weight
    );

    return {
      systemId: this.roadmapService.getRoadmap().system,
      overallHealth: Math.max(0, Math.min(100, overallHealth)),
      completion: {
        percentage: progress.overallPercentage,
        modulesComplete: progress.completeModules,
        modulesTotal: progress.totalModules,
        layersComplete: completedLayers,
        layersTotal: progress.layerProgress.length,
      },
      quality: {
        avgModuleScore,
        avgExecutionQuality,
        calibrationAccuracy,
        patternCoverage,
      },
      momentum: {
        recentCompletions,
        velocityTrend,
        nextHighestLeverageScore,
      },
      risk: {
        blockedModules,
        criticalPathLength,
        estimationDrift: Math.round(estimationDrift),
      },
      computedAt: new Date().toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // History & Trends
  // --------------------------------------------------------------------------

  /**
   * Record current scores to history
   */
  async recordHistory(): Promise<void> {
    const systemScore = await this.scoreSystem();
    const moduleScores = await this.scoreAllModules();

    const entry: ScoreHistoryEntry = {
      timestamp: new Date().toISOString(),
      systemScore: systemScore.overallHealth,
      completionPercentage: systemScore.completion.percentage,
      moduleScores: moduleScores.map(m => ({
        moduleId: m.moduleId,
        score: m.overallScore,
      })),
    };

    this.history.push(entry);
    this.pruneHistory();
    await this.saveHistory();
  }

  /**
   * Get score history
   */
  getHistory(days: number = 30): ScoreHistoryEntry[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.history.filter(e => new Date(e.timestamp) >= cutoff);
  }

  /**
   * Compare scores between two timestamps
   */
  compareScores(fromTimestamp: string, toTimestamp: string): ScoreComparison | null {
    const fromEntry = this.history.find(e => e.timestamp === fromTimestamp);
    const toEntry = this.history.find(e => e.timestamp === toTimestamp);

    if (!fromEntry || !toEntry) return null;

    const fromModules = new Map(fromEntry.moduleScores.map(m => [m.moduleId, m.score]));
    const toModules = new Map(toEntry.moduleScores.map(m => [m.moduleId, m.score]));

    const improvements: { moduleId: string; delta: number }[] = [];
    const declines: { moduleId: string; delta: number }[] = [];
    const completed: string[] = [];

    for (const [moduleId, toScore] of toModules) {
      const fromScore = fromModules.get(moduleId);
      if (fromScore === undefined) continue;

      const delta = toScore - fromScore;
      if (delta > 5) {
        improvements.push({ moduleId, delta });
      } else if (delta < -5) {
        declines.push({ moduleId, delta });
      }

      // Check if completed (score went to 100)
      if (toScore === 100 && fromScore < 100) {
        completed.push(moduleId);
      }
    }

    return {
      fromTimestamp,
      toTimestamp,
      systemScoreDelta: toEntry.systemScore - fromEntry.systemScore,
      completionDelta: toEntry.completionPercentage - fromEntry.completionPercentage,
      modulesCompleted: completed,
      scoreImprovements: improvements.sort((a, b) => b.delta - a.delta),
      scoreDeclines: declines.sort((a, b) => a.delta - b.delta),
    };
  }

  /**
   * Get score trends
   */
  getScoreTrends(days: number = 30): {
    systemTrend: 'improving' | 'stable' | 'declining';
    completionTrend: 'accelerating' | 'steady' | 'slowing';
    avgDailyProgress: number;
  } {
    const history = this.getHistory(days);
    if (history.length < 2) {
      return {
        systemTrend: 'stable',
        completionTrend: 'steady',
        avgDailyProgress: 0,
      };
    }

    // Compare first half to second half
    const mid = Math.floor(history.length / 2);
    const firstHalf = history.slice(0, mid);
    const secondHalf = history.slice(mid);

    const avgFirst = firstHalf.reduce((s, e) => s + e.systemScore, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, e) => s + e.systemScore, 0) / secondHalf.length;

    const systemDiff = avgSecond - avgFirst;
    let systemTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (systemDiff > 3) systemTrend = 'improving';
    else if (systemDiff < -3) systemTrend = 'declining';

    // Completion trend
    const firstCompletion = firstHalf[firstHalf.length - 1]?.completionPercentage || 0;
    const lastCompletion = secondHalf[secondHalf.length - 1]?.completionPercentage || 0;
    const completionGain = lastCompletion - firstCompletion;

    let completionTrend: 'accelerating' | 'steady' | 'slowing' = 'steady';
    if (completionGain > 5) completionTrend = 'accelerating';
    else if (completionGain < 0) completionTrend = 'slowing';

    // Average daily progress
    const oldest = history[0];
    const newest = history[history.length - 1];
    const daysDiff = Math.max(1,
      (new Date(newest.timestamp).getTime() - new Date(oldest.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    );
    const avgDailyProgress = (newest.completionPercentage - oldest.completionPercentage) / daysDiff;

    return {
      systemTrend,
      completionTrend,
      avgDailyProgress: Math.round(avgDailyProgress * 100) / 100,
    };
  }

  // --------------------------------------------------------------------------
  // Terminal Visualization
  // --------------------------------------------------------------------------

  /**
   * Generate terminal-friendly score visualization
   */
  async generateTerminalView(): Promise<string> {
    const systemScore = await this.scoreSystem();
    const moduleScores = await this.scoreAllModules();
    const trends = this.getScoreTrends();

    const lines: string[] = [];

    lines.push('╔══════════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                              SYSTEM SCORECARD                                    ║');
    lines.push('╠══════════════════════════════════════════════════════════════════════════════════╣');

    // Overall health
    const healthBar = this.generateBar(systemScore.overallHealth, 30);
    lines.push(`║  Overall Health: ${healthBar} ${systemScore.overallHealth}%`.padEnd(83) + '║');
    lines.push('║                                                                                  ║');

    // Completion
    lines.push(`║  Completion: ${systemScore.completion.modulesComplete}/${systemScore.completion.modulesTotal} modules (${systemScore.completion.percentage}%)`.padEnd(83) + '║');
    lines.push(`║  Layers: ${systemScore.completion.layersComplete}/${systemScore.completion.layersTotal} complete`.padEnd(83) + '║');
    lines.push('║                                                                                  ║');

    // Quality
    lines.push('║  QUALITY METRICS'.padEnd(83) + '║');
    lines.push(`║    Module Score: ${systemScore.quality.avgModuleScore}/100`.padEnd(83) + '║');
    lines.push(`║    Execution Quality: ${systemScore.quality.avgExecutionQuality}/100`.padEnd(83) + '║');
    lines.push(`║    Calibration: ${systemScore.quality.calibrationAccuracy}%`.padEnd(83) + '║');
    lines.push('║                                                                                  ║');

    // Momentum
    lines.push('║  MOMENTUM'.padEnd(83) + '║');
    lines.push(`║    Recent Completions (7d): ${systemScore.momentum.recentCompletions}`.padEnd(83) + '║');
    lines.push(`║    Velocity: ${systemScore.momentum.velocityTrend}`.padEnd(83) + '║');
    lines.push(`║    Next Leverage: ${systemScore.momentum.nextHighestLeverageScore}/100`.padEnd(83) + '║');
    lines.push('║                                                                                  ║');

    // Risk
    lines.push('║  RISK'.padEnd(83) + '║');
    lines.push(`║    Blocked Modules: ${systemScore.risk.blockedModules}`.padEnd(83) + '║');
    lines.push(`║    Critical Path Length: ${systemScore.risk.criticalPathLength}`.padEnd(83) + '║');
    lines.push(`║    Estimation Drift: ${systemScore.risk.estimationDrift}%`.padEnd(83) + '║');
    lines.push('║                                                                                  ║');

    // Top modules
    lines.push('╠══════════════════════════════════════════════════════════════════════════════════╣');
    lines.push('║  TOP MODULES BY SCORE                                                            ║');
    for (const m of moduleScores.slice(0, 5)) {
      const status = m.isComplete ? '✓' : m.status === 'in-progress' ? '◉' : '○';
      const line = `║    ${status} ${m.moduleName.padEnd(30)} ${m.overallScore}/100`;
      lines.push(line.padEnd(83) + '║');
    }

    lines.push('║                                                                                  ║');
    lines.push('║  TRENDS (30d)'.padEnd(83) + '║');
    lines.push(`║    System: ${trends.systemTrend}  |  Completion: ${trends.completionTrend}  |  Daily: +${trends.avgDailyProgress}%`.padEnd(83) + '║');

    lines.push('╚══════════════════════════════════════════════════════════════════════════════════╝');

    return lines.join('\n');
  }

  // --------------------------------------------------------------------------
  // Private Helpers - Component Scoring
  // --------------------------------------------------------------------------

  private calculateDreamStateAlignment(module: Module, progress: RoadmapProgress): number {
    // Layer 0 modules are most aligned (foundational)
    // Score decreases with layer number
    const layerScore = Math.max(0, 100 - module.layer * 12);

    // Bonus for being on critical path
    const criticalPathBonus = progress.criticalPath.some(m => m.id === module.id) ? 15 : 0;

    // Bonus for having many unlocks
    const unlockCount = this.countUnlocks(module.id, progress);
    const unlockBonus = Math.min(unlockCount * 5, 15);

    return Math.min(100, layerScore + criticalPathBonus + unlockBonus);
  }

  private calculateDownstreamImpact(module: Module, progress: RoadmapProgress): number {
    const unlockCount = this.countUnlocks(module.id, progress);
    // More unlocks = higher impact (max at ~10 unlocks)
    return Math.min(100, unlockCount * 10);
  }

  private calculateCompletionValue(module: Module, progress: RoadmapProgress): number {
    if (module.status === 'complete') return 100;

    // Value based on how much this contributes to overall completion
    const contribution = 100 / progress.totalModules;
    const baseValue = contribution * 10; // Scale up

    // Bonus for unblocking blocked modules
    const blockedCount = progress.blockedModules;
    const wouldUnblock = this.countBlockedDependents(module.id, progress);
    const unblockBonus = blockedCount > 0 ? (wouldUnblock / blockedCount) * 30 : 0;

    return Math.min(100, baseValue + unblockBonus + 50); // Base of 50 for pending
  }

  private async calculateExecutionQuality(module: Module): Promise<number> {
    if (module.status !== 'complete') {
      // For incomplete modules, use a default based on layer (lower layers = more tested)
      return Math.max(50, 80 - module.layer * 5);
    }

    // For complete modules, try to get actual metrics
    if (this.analyticsService) {
      try {
        const summary = await this.analyticsService.getAnalyticsSummary();
        // Use system-wide success rate as proxy
        return Math.round(summary.runs.successRate * 100);
      } catch {
        // Fall through to default
      }
    }

    // Default for completed modules
    return 85;
  }

  private calculateStrategicPosition(module: Module, progress: RoadmapProgress): number {
    // Foundation layer is most strategic
    const layerValue = Math.max(0, 100 - module.layer * 10);

    // Being a dependency for many others is strategic
    const dependentCount = this.countUnlocks(module.id, progress);
    const dependentValue = Math.min(dependentCount * 8, 40);

    // Having few dependencies is also strategic (easier to start)
    const depCount = module.dependsOn.filter(d => d !== '—').length;
    const independenceValue = Math.max(0, 30 - depCount * 10);

    return Math.min(100, (layerValue + dependentValue + independenceValue) / 2);
  }

  // --------------------------------------------------------------------------
  // Private Helpers - Utilities
  // --------------------------------------------------------------------------

  private countUnlocks(moduleId: string, progress: RoadmapProgress): number {
    let count = 0;
    for (const layer of progress.layerProgress) {
      for (const m of layer.modules) {
        if (m.dependsOn.some(d => d.includes(moduleId))) {
          count++;
        }
      }
    }
    return count;
  }

  private countBlockedDependents(moduleId: string, progress: RoadmapProgress): number {
    let count = 0;
    for (const layer of progress.layerProgress) {
      for (const m of layer.modules) {
        if (m.status === 'blocked' && m.dependsOn.some(d => d.includes(moduleId))) {
          count++;
        }
      }
    }
    return count;
  }

  private countRecentCompletions(progress: RoadmapProgress, days: number): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    let count = 0;
    for (const layer of progress.layerProgress) {
      for (const m of layer.modules) {
        if (m.completedAt && new Date(m.completedAt) >= cutoff) {
          count++;
        }
      }
    }
    return count;
  }

  private calculateVelocityTrend(): 'accelerating' | 'steady' | 'slowing' {
    const trends = this.getScoreTrends(14);
    return trends.completionTrend;
  }

  private generateBar(percentage: number, width: number): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  // --------------------------------------------------------------------------
  // Private Helpers - Persistence
  // --------------------------------------------------------------------------

  private async loadHistory(): Promise<void> {
    try {
      const content = await readFile(this.historyPath, 'utf-8');
      this.history = JSON.parse(content);
    } catch {
      this.history = [];
    }
  }

  private async saveHistory(): Promise<void> {
    await writeFile(this.historyPath, JSON.stringify(this.history, null, 2));
  }

  private pruneHistory(): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.historyRetentionDays);
    this.history = this.history.filter(e => new Date(e.timestamp) >= cutoff);
  }
}
