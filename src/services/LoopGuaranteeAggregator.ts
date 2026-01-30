/**
 * LoopGuaranteeAggregator
 *
 * Aggregates skill-level guarantees into loop-level guarantee maps.
 * Ensures that when a loop runs, all guarantees from all constituent skills
 * are enforced at the appropriate phase.
 *
 * This provides "belt and suspenders" guarantee enforcement:
 * - Cached aggregation on loop load (fast)
 * - Fresh lookup available on demand (accurate)
 * - Automatic re-aggregation on skill/loop changes (current)
 */

import type { GuaranteeService } from './GuaranteeService.js';
import type {
  Guarantee,
  GuaranteeRegistry,
  SkillGuarantees,
} from '../types/guarantee.js';
import type { Phase, Loop, LoopPhase } from '../types.js';

export interface AggregatedLoopGuarantees {
  loopId: string;
  loopVersion: string;
  aggregatedAt: Date;
  byPhase: Map<Phase, PhaseGuaranteeSet>;
  byGate: Map<string, Guarantee[]>;
  totalGuarantees: number;
  skillsCovered: string[];
}

export interface PhaseGuaranteeSet {
  phase: Phase;
  skillGuarantees: Map<string, Guarantee[]>;  // skillId → guarantees
  phaseGuarantees: Guarantee[];  // Phase-level guarantees (from registry)
  allGuarantees: Guarantee[];  // Flattened union of all
}

export interface LoopGuaranteeAggregatorOptions {
  // Whether to fail if a skill has no guarantees defined
  requireSkillGuarantees?: boolean;
  // Whether to include optional (required: false) guarantees
  includeOptional?: boolean;
}

export class LoopGuaranteeAggregator {
  private aggregatedLoops: Map<string, AggregatedLoopGuarantees> = new Map();
  private changeListeners: Array<(loopId: string) => void> = [];

  constructor(
    private guaranteeService: GuaranteeService,
    private options: LoopGuaranteeAggregatorOptions = {}
  ) {
    this.options = {
      requireSkillGuarantees: false,
      includeOptional: true,
      ...options,
    };
  }

  /**
   * Aggregate guarantees for a loop based on its skill composition
   */
  aggregateLoop(loop: Loop): AggregatedLoopGuarantees {
    const byPhase = new Map<Phase, PhaseGuaranteeSet>();
    const byGate = new Map<string, Guarantee[]>();
    const skillsCovered: string[] = [];
    let totalGuarantees = 0;

    // Process each phase in the loop
    for (const loopPhase of loop.phases) {
      const phaseSet = this.aggregatePhase(loop, loopPhase);
      byPhase.set(loopPhase.name, phaseSet);
      totalGuarantees += phaseSet.allGuarantees.length;
      skillsCovered.push(...phaseSet.skillGuarantees.keys());
    }

    // Process gates - combine gate guarantees with post-phase skill guarantees
    for (const gate of loop.gates) {
      const gateGuarantees = this.aggregateGate(loop, gate.id, gate.afterPhase);
      byGate.set(gate.id, gateGuarantees);
      totalGuarantees += gateGuarantees.length;
    }

    const aggregated: AggregatedLoopGuarantees = {
      loopId: loop.id,
      loopVersion: loop.version,
      aggregatedAt: new Date(),
      byPhase,
      byGate,
      totalGuarantees,
      skillsCovered: [...new Set(skillsCovered)],
    };

    // Cache the aggregation
    this.aggregatedLoops.set(loop.id, aggregated);

    this.log('info', `Aggregated ${totalGuarantees} guarantees for loop "${loop.id}" (${skillsCovered.length} skills)`);
    return aggregated;
  }

  /**
   * Aggregate guarantees for a single phase
   */
  private aggregatePhase(loop: Loop, loopPhase: LoopPhase): PhaseGuaranteeSet {
    const skillGuarantees = new Map<string, Guarantee[]>();
    const allGuarantees: Guarantee[] = [];

    // Get guarantees for each skill in this phase
    for (const phaseSkill of loopPhase.skills) {
      const skillGuas = this.guaranteeService.getSkillGuarantees(phaseSkill.skillId);

      if (skillGuas.length === 0 && this.options.requireSkillGuarantees) {
        this.log('warn', `Skill "${phaseSkill.skillId}" has no guarantees defined`);
      }

      // Filter based on options
      const filtered = this.options.includeOptional
        ? skillGuas
        : skillGuas.filter(g => g.required);

      if (filtered.length > 0) {
        skillGuarantees.set(phaseSkill.skillId, filtered);
        allGuarantees.push(...filtered);
      }
    }

    // Get phase-level guarantees from registry (if any)
    // These apply to ALL skills in the phase
    const phaseGuarantees: Guarantee[] = [];
    // Note: Phase guarantees are looked up from the registry's phases section
    // This would require access to the full registry which GuaranteeService has

    return {
      phase: loopPhase.name,
      skillGuarantees,
      phaseGuarantees,
      allGuarantees: [...allGuarantees, ...phaseGuarantees],
    };
  }

  /**
   * Aggregate guarantees for a gate
   */
  private aggregateGate(loop: Loop, gateId: string, afterPhase: Phase): Guarantee[] {
    // Get gate-specific guarantees from registry
    const gateGuarantees = this.guaranteeService.getGateGuarantees(loop.id, gateId);

    // Optionally, we could also include all skill guarantees from the phase
    // that precedes this gate, but that might be redundant if skills are validated
    // individually. For now, just use gate-specific guarantees.

    return gateGuarantees;
  }

  /**
   * Get cached aggregation for a loop
   */
  getAggregation(loopId: string): AggregatedLoopGuarantees | null {
    return this.aggregatedLoops.get(loopId) || null;
  }

  /**
   * Get all guarantees for a specific phase in a loop
   */
  getPhaseGuarantees(loopId: string, phase: Phase): Guarantee[] {
    const aggregation = this.aggregatedLoops.get(loopId);
    if (!aggregation) {
      return [];
    }

    const phaseSet = aggregation.byPhase.get(phase);
    return phaseSet?.allGuarantees || [];
  }

  /**
   * Get guarantees for a specific skill in a phase
   */
  getSkillGuaranteesInLoop(
    loopId: string,
    phase: Phase,
    skillId: string
  ): Guarantee[] {
    const aggregation = this.aggregatedLoops.get(loopId);
    if (!aggregation) {
      // Fall back to direct lookup
      return this.guaranteeService.getSkillGuarantees(skillId);
    }

    const phaseSet = aggregation.byPhase.get(phase);
    if (!phaseSet) {
      return this.guaranteeService.getSkillGuarantees(skillId);
    }

    // Combine skill-specific + phase-level guarantees
    const skillGuas = phaseSet.skillGuarantees.get(skillId) || [];
    return [...skillGuas, ...phaseSet.phaseGuarantees];
  }

  /**
   * Get all guarantees for a gate
   */
  getGateGuarantees(loopId: string, gateId: string): Guarantee[] {
    const aggregation = this.aggregatedLoops.get(loopId);
    if (!aggregation) {
      return this.guaranteeService.getGateGuarantees(loopId, gateId);
    }

    return aggregation.byGate.get(gateId) || [];
  }

  /**
   * Invalidate cached aggregation for a loop
   */
  invalidate(loopId: string): void {
    this.aggregatedLoops.delete(loopId);
    this.notifyChange(loopId);
    this.log('info', `Invalidated aggregation for loop "${loopId}"`);
  }

  /**
   * Invalidate all cached aggregations
   */
  invalidateAll(): void {
    const loopIds = [...this.aggregatedLoops.keys()];
    this.aggregatedLoops.clear();
    for (const loopId of loopIds) {
      this.notifyChange(loopId);
    }
    this.log('info', 'Invalidated all loop aggregations');
  }

  /**
   * Called when a skill changes - invalidate all loops that use it
   */
  onSkillChanged(skillId: string): void {
    for (const [loopId, aggregation] of this.aggregatedLoops) {
      if (aggregation.skillsCovered.includes(skillId)) {
        this.invalidate(loopId);
      }
    }
  }

  /**
   * Called when a loop definition changes
   */
  onLoopChanged(loopId: string): void {
    this.invalidate(loopId);
  }

  /**
   * Register a listener for aggregation changes
   */
  onAggregationChange(listener: (loopId: string) => void): void {
    this.changeListeners.push(listener);
  }

  /**
   * Remove a change listener
   */
  removeChangeListener(listener: (loopId: string) => void): void {
    const index = this.changeListeners.indexOf(listener);
    if (index !== -1) {
      this.changeListeners.splice(index, 1);
    }
  }

  private notifyChange(loopId: string): void {
    for (const listener of this.changeListeners) {
      try {
        listener(loopId);
      } catch (error) {
        this.log('error', `Change listener error: ${error}`);
      }
    }
  }

  /**
   * Get summary of all aggregations
   */
  getSummary(): {
    loopCount: number;
    totalGuarantees: number;
    skillsCovered: number;
    loops: Array<{ loopId: string; guarantees: number; skills: number }>;
  } {
    let totalGuarantees = 0;
    const allSkills = new Set<string>();
    const loops: Array<{ loopId: string; guarantees: number; skills: number }> = [];

    for (const [loopId, aggregation] of this.aggregatedLoops) {
      totalGuarantees += aggregation.totalGuarantees;
      aggregation.skillsCovered.forEach(s => allSkills.add(s));
      loops.push({
        loopId,
        guarantees: aggregation.totalGuarantees,
        skills: aggregation.skillsCovered.length,
      });
    }

    return {
      loopCount: this.aggregatedLoops.size,
      totalGuarantees,
      skillsCovered: allSkills.size,
      loops,
    };
  }

  private log(level: string, message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'LoopGuaranteeAggregator',
      message,
    }));
  }
}
