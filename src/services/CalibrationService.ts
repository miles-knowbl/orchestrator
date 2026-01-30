/**
 * Calibration Service - Estimate vs Actual tracking for improving estimates
 *
 * Tracks:
 * - Execution time estimates vs actuals
 * - Complexity assessments vs outcomes
 * - Phase-specific calibration factors
 * - Skill-specific adjustment multipliers
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { MemoryService } from './MemoryService.js';
import type {
  Phase,
  LoopMode,
  CalibrationData,
  CalibrationAdjustment,
  EstimateRecord,
  MemoryLevel,
} from '../types.js';
import type {
  GuaranteeFailureRecord,
  ProblematicSkill,
} from '../types/guarantee.js';

export interface CalibrationServiceOptions {
  dataPath: string;
}

export interface Estimate {
  hours: number;
  complexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'epic';
  confidence?: number;  // 0-1
  factors?: Record<string, boolean>;  // e.g., { unfamiliarStack: true, clearRequirements: false }
}

export interface CalibratedEstimate {
  original: Estimate;
  calibrated: {
    hours: number;
    range: { low: number; high: number };
  };
  multipliers: {
    global: number;
    mode?: number;
    phase?: number;
    skill?: number;
    complexity?: number;
  };
  confidence: number;
  basedOnSamples: number;
}

export interface CalibrationReport {
  level: MemoryLevel;
  entityId?: string;
  global: {
    multiplier: number;
    samples: number;
    accuracy: number;  // How close estimates are after calibration
  };
  byMode?: Record<LoopMode, { multiplier: number; samples: number }>;
  byPhase?: Record<Phase, { multiplier: number; samples: number }>;
  byComplexity?: Record<string, { multiplier: number; samples: number }>;
  recentEstimates: EstimateRecord[];
  trends: {
    direction: 'improving' | 'stable' | 'worsening';
    message: string;
  };
}

// Complexity multipliers (baseline)
const COMPLEXITY_MULTIPLIERS: Record<string, number> = {
  trivial: 0.5,
  simple: 1.0,
  moderate: 2.0,
  complex: 4.0,
  epic: 8.0,
};

export class CalibrationService {
  private calibrationData: Map<string, CalibrationData> = new Map();

  constructor(
    private options: CalibrationServiceOptions,
    private memoryService: MemoryService
  ) {}

  /**
   * Initialize by loading calibration data
   */
  async initialize(): Promise<void> {
    await mkdir(this.options.dataPath, { recursive: true });
    await this.loadCalibrationData();
    this.log('info', `Loaded calibration data for ${this.calibrationData.size} entities`);
  }

  /**
   * Load calibration data from memory service
   */
  private async loadCalibrationData(): Promise<void> {
    // Load orchestrator-level calibration
    const orchestratorMemory = await this.memoryService.getOrCreateMemory('orchestrator');
    this.calibrationData.set('orchestrator', orchestratorMemory.calibration);

    // Load loop-level calibrations
    const loopMemories = this.memoryService.listMemories('loop');
    for (const memory of loopMemories) {
      if (memory.loopId) {
        this.calibrationData.set(`loop:${memory.loopId}`, memory.calibration);
      }
    }

    // Load skill-level calibrations
    const skillMemories = this.memoryService.listMemories('skill');
    for (const memory of skillMemories) {
      if (memory.skillId) {
        this.calibrationData.set(`skill:${memory.skillId}`, memory.calibration);
      }
    }
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Get a calibrated estimate based on historical data
   */
  async getCalibratedEstimate(params: {
    estimate: Estimate;
    level?: MemoryLevel;
    entityId?: string;
    mode?: LoopMode;
    phase?: Phase;
    skillId?: string;
  }): Promise<CalibratedEstimate> {
    const { estimate, level = 'orchestrator', entityId, mode, phase, skillId } = params;

    // Get calibration data
    const key = level === 'orchestrator' ? 'orchestrator' : `${level}:${entityId}`;
    const calibration = this.calibrationData.get(key) || this.defaultCalibration();

    // Calculate multipliers
    const multipliers: CalibratedEstimate['multipliers'] = {
      global: calibration.adjustments.global.multiplier,
    };

    // Mode multiplier
    if (mode && calibration.adjustments.byMode?.[mode]) {
      multipliers.mode = calibration.adjustments.byMode[mode].multiplier;
    }

    // Phase multiplier
    if (phase && calibration.adjustments.byPhase?.[phase]) {
      multipliers.phase = calibration.adjustments.byPhase[phase].multiplier;
    }

    // Skill multiplier
    if (skillId && calibration.adjustments.bySkill?.[skillId]) {
      multipliers.skill = calibration.adjustments.bySkill[skillId].multiplier;
    }

    // Complexity baseline
    multipliers.complexity = COMPLEXITY_MULTIPLIERS[estimate.complexity] || 1.0;

    // Calculate combined multiplier
    const combinedMultiplier = this.calculateCombinedMultiplier(multipliers);

    // Calculate calibrated hours
    const calibratedHours = estimate.hours * combinedMultiplier;

    // Calculate range based on variance in historical data
    const variance = this.calculateVariance(calibration);
    const rangeFactor = 1 + variance;

    return {
      original: estimate,
      calibrated: {
        hours: calibratedHours,
        range: {
          low: calibratedHours / rangeFactor,
          high: calibratedHours * rangeFactor,
        },
      },
      multipliers,
      confidence: estimate.confidence || this.calculateConfidence(calibration),
      basedOnSamples: calibration.adjustments.global.samples,
    };
  }

  /**
   * Calculate combined multiplier from individual factors
   */
  private calculateCombinedMultiplier(
    multipliers: CalibratedEstimate['multipliers']
  ): number {
    // Start with global
    let combined = multipliers.global;

    // Layer in context-specific multipliers (weighted average)
    const contextMultipliers: number[] = [];
    if (multipliers.mode) contextMultipliers.push(multipliers.mode);
    if (multipliers.phase) contextMultipliers.push(multipliers.phase);
    if (multipliers.skill) contextMultipliers.push(multipliers.skill);

    if (contextMultipliers.length > 0) {
      const contextAvg = contextMultipliers.reduce((a, b) => a + b, 0) / contextMultipliers.length;
      // Blend global with context (60% context, 40% global when context exists)
      combined = combined * 0.4 + contextAvg * 0.6;
    }

    return combined;
  }

  /**
   * Calculate variance from historical estimates
   */
  private calculateVariance(calibration: CalibrationData): number {
    if (calibration.estimates.length < 3) {
      return 0.5;  // High uncertainty with few samples
    }

    const ratios = calibration.estimates.map(e => e.ratio);
    const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const squaredDiffs = ratios.map(r => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / ratios.length;

    // Cap variance at reasonable levels
    return Math.min(Math.sqrt(variance), 1.0);
  }

  /**
   * Calculate confidence based on sample size
   */
  private calculateConfidence(calibration: CalibrationData): number {
    const samples = calibration.adjustments.global.samples;
    if (samples === 0) return 0.1;
    if (samples < 5) return 0.3;
    if (samples < 10) return 0.5;
    if (samples < 20) return 0.7;
    return 0.9;
  }

  /**
   * Record an estimate vs actual result
   */
  async recordEstimateResult(params: {
    level?: MemoryLevel;
    entityId?: string;
    estimate: Estimate;
    actualHours: number;
    mode?: LoopMode;
    phase?: Phase;
    skillId?: string;
  }): Promise<CalibrationData> {
    const { level = 'orchestrator', entityId, estimate, actualHours, mode, phase, skillId } = params;

    // Update memory service
    const calibration = await this.memoryService.updateCalibration(
      level,
      entityId,
      estimate,
      { hours: actualHours },
      estimate.factors
    );

    // Update by-mode calibration if applicable
    if (mode) {
      await this.updateContextCalibration(level, entityId, 'byMode', mode, estimate.hours, actualHours);
    }

    // Update by-phase calibration if applicable
    if (phase) {
      await this.updateContextCalibration(level, entityId, 'byPhase', phase, estimate.hours, actualHours);
    }

    // Update by-skill calibration if applicable
    if (skillId) {
      await this.updateContextCalibration(level, entityId, 'bySkill', skillId, estimate.hours, actualHours);
    }

    // Refresh local cache
    const key = level === 'orchestrator' ? 'orchestrator' : `${level}:${entityId}`;
    this.calibrationData.set(key, calibration);

    this.log('info', `Recorded estimate result: ${estimate.hours}h estimated, ${actualHours}h actual (ratio: ${(actualHours / estimate.hours).toFixed(2)})`);
    return calibration;
  }

  /**
   * Update context-specific calibration (mode, phase, skill)
   */
  private async updateContextCalibration(
    level: MemoryLevel,
    entityId: string | undefined,
    contextType: 'byMode' | 'byPhase' | 'bySkill',
    contextValue: string,
    estimatedHours: number,
    actualHours: number
  ): Promise<void> {
    const memory = await this.memoryService.getOrCreateMemory(level, entityId);
    const calibration = memory.calibration;

    // Initialize context map if needed
    if (!calibration.adjustments[contextType]) {
      (calibration.adjustments as any)[contextType] = {};
    }

    // Get or create adjustment for this context
    const contextMap = calibration.adjustments[contextType] as Record<string, CalibrationAdjustment>;
    const existing = contextMap[contextValue] || { multiplier: 1.0, samples: 0 };

    // Update multiplier using exponential moving average
    const ratio = actualHours / estimatedHours;
    const alpha = Math.min(0.3, 1 / (existing.samples + 1));
    existing.multiplier = existing.multiplier * (1 - alpha) + ratio * alpha;
    existing.samples++;

    contextMap[contextValue] = existing;
  }

  /**
   * Generate a calibration report
   */
  async getCalibrationReport(
    level: MemoryLevel = 'orchestrator',
    entityId?: string
  ): Promise<CalibrationReport> {
    const memory = await this.memoryService.getOrCreateMemory(level, entityId);
    const calibration = memory.calibration;

    // Calculate accuracy (how close calibrated estimates are to actual)
    const accuracy = this.calculateAccuracy(calibration);

    // Analyze trends
    const trends = this.analyzeTrends(calibration);

    return {
      level,
      entityId,
      global: {
        multiplier: calibration.adjustments.global.multiplier,
        samples: calibration.adjustments.global.samples,
        accuracy,
      },
      byMode: calibration.adjustments.byMode,
      byPhase: calibration.adjustments.byPhase,
      byComplexity: this.calculateComplexityStats(calibration),
      recentEstimates: calibration.estimates.slice(-10),
      trends,
    };
  }

  /**
   * Calculate estimation accuracy (1 = perfect, 0 = poor)
   */
  private calculateAccuracy(calibration: CalibrationData): number {
    if (calibration.estimates.length < 3) return 0.5;

    // Calculate mean absolute percentage error (MAPE)
    const recentEstimates = calibration.estimates.slice(-20);
    const errors = recentEstimates.map(e => {
      const calibrated = e.estimated.hours * calibration.adjustments.global.multiplier;
      return Math.abs(calibrated - e.actual.hours) / e.actual.hours;
    });

    const mape = errors.reduce((a, b) => a + b, 0) / errors.length;

    // Convert MAPE to accuracy (0.2 MAPE = 80% accuracy)
    return Math.max(0, 1 - mape);
  }

  /**
   * Calculate complexity-based statistics
   */
  private calculateComplexityStats(
    calibration: CalibrationData
  ): Record<string, { multiplier: number; samples: number }> {
    const stats: Record<string, { total: number; count: number }> = {};

    for (const estimate of calibration.estimates) {
      const complexity = estimate.estimated.complexity;
      if (!stats[complexity]) {
        stats[complexity] = { total: 0, count: 0 };
      }
      stats[complexity].total += estimate.ratio;
      stats[complexity].count++;
    }

    const result: Record<string, { multiplier: number; samples: number }> = {};
    for (const [complexity, data] of Object.entries(stats)) {
      result[complexity] = {
        multiplier: data.total / data.count,
        samples: data.count,
      };
    }

    return result;
  }

  /**
   * Analyze estimation trends
   */
  private analyzeTrends(calibration: CalibrationData): {
    direction: 'improving' | 'stable' | 'worsening';
    message: string;
  } {
    if (calibration.estimates.length < 5) {
      return {
        direction: 'stable',
        message: 'Insufficient data for trend analysis',
      };
    }

    const recentHalf = calibration.estimates.slice(-5);
    const olderHalf = calibration.estimates.slice(-10, -5);

    if (olderHalf.length === 0) {
      return {
        direction: 'stable',
        message: 'Building baseline calibration data',
      };
    }

    // Calculate average error for each half
    const recentError = this.averageError(recentHalf, calibration.adjustments.global.multiplier);
    const olderError = this.averageError(olderHalf, calibration.adjustments.global.multiplier);

    const improvement = olderError - recentError;

    if (improvement > 0.1) {
      return {
        direction: 'improving',
        message: `Estimation accuracy improving (${Math.round(improvement * 100)}% better)`,
      };
    } else if (improvement < -0.1) {
      return {
        direction: 'worsening',
        message: `Estimation accuracy declining (${Math.round(-improvement * 100)}% worse)`,
      };
    }

    return {
      direction: 'stable',
      message: 'Estimation accuracy stable',
    };
  }

  /**
   * Calculate average estimation error
   */
  private averageError(estimates: EstimateRecord[], multiplier: number): number {
    if (estimates.length === 0) return 0;

    const errors = estimates.map(e => {
      const calibrated = e.estimated.hours * multiplier;
      return Math.abs(calibrated - e.actual.hours) / e.actual.hours;
    });

    return errors.reduce((a, b) => a + b, 0) / errors.length;
  }

  /**
   * Get calibration adjustment recommendations
   */
  async getRecommendations(
    level: MemoryLevel = 'orchestrator',
    entityId?: string
  ): Promise<string[]> {
    const report = await this.getCalibrationReport(level, entityId);
    const recommendations: string[] = [];

    // Low sample count
    if (report.global.samples < 5) {
      recommendations.push('Continue recording estimates to improve calibration accuracy');
    }

    // High multiplier suggests systematic underestimation
    if (report.global.multiplier > 1.5) {
      recommendations.push('Estimates tend to be too optimistic - consider adding buffer time');
    }

    // Low multiplier suggests systematic overestimation
    if (report.global.multiplier < 0.7) {
      recommendations.push('Estimates tend to be too conservative - consider reducing padding');
    }

    // Phase-specific issues
    if (report.byPhase) {
      for (const [phase, data] of Object.entries(report.byPhase)) {
        if (data.multiplier > 2.0 && data.samples >= 3) {
          recommendations.push(`${phase} phase takes ~${data.multiplier.toFixed(1)}x longer than estimated`);
        }
      }
    }

    // Accuracy issues
    if (report.global.accuracy < 0.6) {
      recommendations.push('Consider breaking down large tasks for more accurate estimation');
    }

    // Declining trends
    if (report.trends.direction === 'worsening') {
      recommendations.push('Review recent estimates to identify calibration drift causes');
    }

    return recommendations;
  }

  /**
   * Reset calibration data for fresh start
   */
  async resetCalibration(
    level: MemoryLevel = 'orchestrator',
    entityId?: string
  ): Promise<void> {
    const memory = await this.memoryService.getOrCreateMemory(level, entityId);
    memory.calibration = this.defaultCalibration();

    // Update cache
    const key = level === 'orchestrator' ? 'orchestrator' : `${level}:${entityId}`;
    this.calibrationData.set(key, memory.calibration);

    this.log('info', `Reset calibration for ${key}`);
  }

  /**
   * Default calibration data
   */
  private defaultCalibration(): CalibrationData {
    return {
      estimates: [],
      adjustments: {
        global: { multiplier: 1.0, samples: 0 },
      },
    };
  }

  // ==========================================================================
  // GUARANTEE FAILURE TRACKING
  // ==========================================================================

  private guaranteeFailures: GuaranteeFailureRecord[] = [];

  /**
   * Record a guarantee failure for calibration
   */
  async recordGuaranteeFailure(
    failure: GuaranteeFailureRecord
  ): Promise<void> {
    // Store in memory
    this.guaranteeFailures.push(failure);

    // Record pattern in memory service for learning
    await this.memoryService.recordPattern('skill', failure.skillId, {
      name: `guarantee:${failure.guaranteeId}`,
      context: `Fails in ${failure.phase} phase`,
      solution: failure.errors.join('; '),
      confidence: 'low',
    });

    // Adjust time estimates for skills with guarantee failures
    // Skills that fail guarantees typically take longer to complete
    await this.updateSkillMultiplierForFailure(failure.skillId);

    this.log(
      'info',
      `Recorded guarantee failure: ${failure.guaranteeId} for skill ${failure.skillId}`
    );
  }

  /**
   * Update skill multiplier when guarantees fail
   */
  private async updateSkillMultiplierForFailure(skillId: string): Promise<void> {
    // Get or create skill-level memory
    const memory = await this.memoryService.getOrCreateMemory('skill', skillId);
    const calibration = memory.calibration;

    // Initialize bySkill if needed
    if (!calibration.adjustments.bySkill) {
      calibration.adjustments.bySkill = {};
    }

    // Get or create skill adjustment
    const existing = calibration.adjustments.bySkill[skillId] || {
      multiplier: 1.0,
      samples: 0,
    };

    // Increase multiplier by 10% for each failure (capped at 3.0)
    existing.multiplier = Math.min(existing.multiplier * 1.1, 3.0);
    existing.samples++;

    calibration.adjustments.bySkill[skillId] = existing;

    // Update cache
    this.calibrationData.set(`skill:${skillId}`, calibration);
  }

  /**
   * Get skills with frequent guarantee failures
   */
  getProblematicSkills(): ProblematicSkill[] {
    // Group failures by skill
    const bySkill = new Map<string, GuaranteeFailureRecord[]>();

    for (const failure of this.guaranteeFailures) {
      const existing = bySkill.get(failure.skillId) || [];
      existing.push(failure);
      bySkill.set(failure.skillId, existing);
    }

    // Calculate metrics for each skill
    const problematic: ProblematicSkill[] = [];

    for (const [skillId, failures] of bySkill) {
      // Count unique guarantee failures
      const guaranteeIds = new Set(failures.map(f => f.guaranteeId));

      // Only include skills with 2+ failures or 2+ different guarantee types
      if (failures.length >= 2 || guaranteeIds.size >= 2) {
        // Find most common guarantees
        const guaranteeCounts = new Map<string, number>();
        for (const f of failures) {
          guaranteeCounts.set(f.guaranteeId, (guaranteeCounts.get(f.guaranteeId) || 0) + 1);
        }

        const commonGuarantees = Array.from(guaranteeCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id]) => id);

        // Calculate failure rate (failures / total completions attempt)
        // For now, use a simple ratio based on failure count
        const failureRate = Math.min(failures.length / 10, 1.0);

        problematic.push({
          skillId,
          failureRate,
          commonGuarantees,
          totalFailures: failures.length,
          recentFailures: failures.slice(-5),
        });
      }
    }

    // Sort by failure rate descending
    return problematic.sort((a, b) => b.failureRate - a.failureRate);
  }

  /**
   * Get guarantee failures for a specific skill
   */
  getSkillGuaranteeFailures(skillId: string): GuaranteeFailureRecord[] {
    return this.guaranteeFailures.filter(f => f.skillId === skillId);
  }

  /**
   * Get all guarantee failure records
   */
  getAllGuaranteeFailures(): GuaranteeFailureRecord[] {
    return [...this.guaranteeFailures];
  }

  /**
   * Clear guarantee failures (for testing or reset)
   */
  clearGuaranteeFailures(): void {
    this.guaranteeFailures = [];
    this.log('info', 'Cleared guarantee failure records');
  }

  private log(level: string, message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'CalibrationService',
      message,
    }));
  }
}
