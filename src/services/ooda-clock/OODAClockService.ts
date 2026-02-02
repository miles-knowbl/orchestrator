/**
 * OODA Clock Service
 *
 * Transforms execution logs into clock-renderable events for the
 * Gamelan-inspired circular visualization.
 */

import { randomUUID } from 'crypto';
import type { ExecutionLogEntry, Phase, LoopExecution } from '../../types.js';
import type { ClockEvent, RhythmPattern, ClockExecutionSummary } from './types.js';
import { PHASE_ANGLES, CLOCK_COLORS, LAYER_RADII } from './types.js';
import { RhythmAnalyzer } from './RhythmAnalyzer.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OODAClockServiceOptions {
  // Future options
}

export class OODAClockService {
  private rhythmAnalyzer: RhythmAnalyzer;

  constructor(options: OODAClockServiceOptions = {}) {
    this.rhythmAnalyzer = new RhythmAnalyzer();
  }

  /**
   * Transform execution logs to clock events
   */
  processLogs(logs: ExecutionLogEntry[]): ClockEvent[] {
    return logs
      .filter(log => this.isClockRelevant(log))
      .map(log => this.logToClockEvent(log));
  }

  /**
   * Process a single log entry to a clock event
   */
  processLog(log: ExecutionLogEntry): ClockEvent | null {
    if (!this.isClockRelevant(log)) {
      return null;
    }
    return this.logToClockEvent(log);
  }

  /**
   * Get current cycle progress for an execution
   */
  getCycleProgress(execution: LoopExecution): {
    angle: number;
    phase: string;
    percentComplete: number;
  } {
    const phase = execution.currentPhase;
    const phaseAngles = PHASE_ANGLES[phase];

    // Calculate progress within phase
    const phaseState = execution.phases.find(p => p.phase === phase);
    const phaseSkillStates = phaseState?.skills || [];
    const completedSkills = phaseSkillStates.filter(
      s => s.status === 'completed'
    ).length;
    const phaseProgress = phaseSkillStates.length > 0
      ? completedSkills / phaseSkillStates.length
      : 0;

    // Interpolate angle within phase range
    const angle = phaseAngles.start +
      (phaseAngles.end - phaseAngles.start) * phaseProgress;

    // Calculate overall progress
    const phases: Phase[] = ['INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY',
      'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'];
    const currentIndex = phases.indexOf(phase);
    const percentComplete = ((currentIndex + phaseProgress) / phases.length) * 100;

    return {
      angle: this.normalizeAngle(angle),
      phase,
      percentComplete,
    };
  }

  /**
   * Detect rhythm patterns from events
   */
  analyzeRhythm(events: ClockEvent[]): RhythmPattern[] {
    return this.rhythmAnalyzer.detectPatterns(events);
  }

  /**
   * Get execution summary for clock display
   */
  getExecutionSummary(execution: LoopExecution): ClockExecutionSummary {
    return {
      id: execution.id,
      loopId: execution.loopId,
      project: execution.project,
      status: execution.status,
      currentPhase: execution.currentPhase,
      eventCount: execution.logs.length,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
    };
  }

  /**
   * Check if a log entry is relevant for clock display
   */
  private isClockRelevant(log: ExecutionLogEntry): boolean {
    // Include skill, gate, and phase events
    return ['skill', 'gate', 'phase'].includes(log.category);
  }

  /**
   * Convert a log entry to a clock event
   */
  private logToClockEvent(log: ExecutionLogEntry): ClockEvent {
    const type = this.getEventType(log);
    const phase = log.phase || 'INIT';
    const phaseAngles = PHASE_ANGLES[phase];

    // Calculate angle based on timestamp within execution
    // For now, place at phase midpoint
    const angle = (phaseAngles.start + phaseAngles.end) / 2;

    return {
      id: log.id || randomUUID(),
      type,
      name: this.getEventName(log),
      startAngle: this.normalizeAngle(angle),
      endAngle: log.durationMs
        ? this.normalizeAngle(angle + this.durationToAngle(log.durationMs))
        : undefined,
      radius: this.getEventRadius(type),
      color: this.getEventColor(type, log.level),
      timestamp: new Date(log.timestamp),
      duration: log.durationMs,
      status: this.getEventStatus(log),
    };
  }

  /**
   * Determine event type from log category
   */
  private getEventType(log: ExecutionLogEntry): ClockEvent['type'] {
    switch (log.category) {
      case 'skill':
        return 'skill';
      case 'gate':
        return 'gate';
      case 'phase':
        return 'phase';
      default:
        return 'pattern';
    }
  }

  /**
   * Extract event name from log
   */
  private getEventName(log: ExecutionLogEntry): string {
    if (log.skillId) return log.skillId;
    if (log.gateId) return log.gateId;
    if (log.phase) return log.phase;
    return log.message.substring(0, 30);
  }

  /**
   * Get radius layer for event type
   */
  private getEventRadius(type: ClockEvent['type']): ClockEvent['radius'] {
    switch (type) {
      case 'gate':
        return 'outer';
      case 'pattern':
        return 'middle';
      case 'skill':
      case 'phase':
      default:
        return 'inner';
    }
  }

  /**
   * Get color for event type and level
   */
  private getEventColor(type: ClockEvent['type'], level: ExecutionLogEntry['level']): string {
    if (level === 'error') return '#ef4444'; // Red

    switch (type) {
      case 'skill':
        return CLOCK_COLORS.skill;
      case 'gate':
        return CLOCK_COLORS.gate;
      case 'pattern':
        return CLOCK_COLORS.pattern;
      case 'phase':
        return CLOCK_COLORS.phase;
      default:
        return CLOCK_COLORS.skill;
    }
  }

  /**
   * Determine event status from log
   */
  private getEventStatus(log: ExecutionLogEntry): ClockEvent['status'] {
    if (log.level === 'error') return 'failed';

    // Check message for status hints
    const msg = log.message.toLowerCase();
    if (msg.includes('complete') || msg.includes('passed') || msg.includes('approved')) {
      return 'complete';
    }
    if (msg.includes('start') || msg.includes('begin') || msg.includes('running')) {
      return 'active';
    }

    return 'pending';
  }

  /**
   * Convert duration (ms) to angle degrees
   * Assuming a full cycle = 60 seconds = 360 degrees
   */
  private durationToAngle(durationMs: number): number {
    const fullCycleMs = 60000; // 60 seconds
    return (durationMs / fullCycleMs) * 360;
  }

  /**
   * Normalize angle to 0-360 range
   */
  private normalizeAngle(angle: number): number {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }
}
