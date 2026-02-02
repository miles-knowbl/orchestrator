/**
 * OODA Clock Types
 */

import type { Phase, ExecutionLogEntry } from '../../types.js';

/**
 * A clock event rendered on the visualization
 */
export interface ClockEvent {
  id: string;
  type: 'skill' | 'pattern' | 'gate' | 'phase';
  name: string;
  startAngle: number;      // 0-360 degrees
  endAngle?: number;       // For duration arcs
  radius: 'inner' | 'middle' | 'outer';
  color: string;
  timestamp: Date;
  duration?: number;       // ms
  status: 'pending' | 'active' | 'complete' | 'failed';
}

/**
 * A detected rhythm pattern across executions
 */
export interface RhythmPattern {
  id: string;
  name: string;
  events: string[];        // Sequence of event types
  averageDuration: number; // ms
  frequency: number;       // Times observed
  confidence: number;      // 0-1
}

/**
 * OODA quadrant configuration
 */
export interface QuadrantConfig {
  name: 'OBSERVE' | 'ORIENT' | 'DECIDE' | 'ACT';
  startAngle: number;
  endAngle: number;
  phases: Phase[];
}

/**
 * Phase to angle mapping
 */
export interface PhaseAngleMapping {
  phase: Phase;
  startAngle: number;
  endAngle: number;
  quadrant: QuadrantConfig['name'];
}

/**
 * Clock event colors by type
 */
export const CLOCK_COLORS = {
  skill: '#10b981',    // Emerald
  pattern: '#0ea5e9',  // Sky
  gate: '#f59e0b',     // Amber
  phase: '#8b5cf6',    // Violet
  active: '#ffffff',   // White
  background: '#0a0a0a',
  face: '#1f1f1f',
} as const;

/**
 * OODA quadrant definitions
 */
export const OODA_QUADRANTS: QuadrantConfig[] = [
  {
    name: 'OBSERVE',
    startAngle: 270,
    endAngle: 360,
    phases: ['INIT'],
  },
  {
    name: 'ORIENT',
    startAngle: 0,
    endAngle: 90,
    phases: ['SCAFFOLD'],
  },
  {
    name: 'DECIDE',
    startAngle: 90,
    endAngle: 180,
    phases: ['IMPLEMENT', 'TEST'],
  },
  {
    name: 'ACT',
    startAngle: 180,
    endAngle: 270,
    phases: ['VERIFY', 'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'],
  },
];

/**
 * Phase to angle mapping (fine-grained within quadrants)
 */
export const PHASE_ANGLES: Record<Phase, { start: number; end: number }> = {
  INIT: { start: 270, end: 360 },
  SCAFFOLD: { start: 0, end: 90 },
  IMPLEMENT: { start: 90, end: 135 },
  TEST: { start: 135, end: 180 },
  VERIFY: { start: 180, end: 200 },
  VALIDATE: { start: 200, end: 220 },
  DOCUMENT: { start: 220, end: 240 },
  REVIEW: { start: 240, end: 255 },
  SHIP: { start: 255, end: 265 },
  COMPLETE: { start: 265, end: 270 },
};

/**
 * Layer radii (percentage of clock radius)
 */
export const LAYER_RADII = {
  inner: 0.55,   // Skills
  middle: 0.70,  // Patterns
  outer: 0.85,   // Gates
} as const;

/**
 * Clock state for React component
 */
export interface ClockState {
  events: ClockEvent[];
  currentAngle: number;
  selectedEvent: ClockEvent | null;
  isLive: boolean;
  isPlaying: boolean;
  playbackSpeed: number;
  playbackPosition: number; // 0-1
}

/**
 * Clock action types
 */
export type ClockAction =
  | { type: 'ADD_EVENT'; event: ClockEvent }
  | { type: 'SET_EVENTS'; events: ClockEvent[] }
  | { type: 'SELECT_EVENT'; event: ClockEvent | null }
  | { type: 'SET_ANGLE'; angle: number }
  | { type: 'SET_LIVE'; isLive: boolean }
  | { type: 'SET_PLAYBACK_SPEED'; speed: number }
  | { type: 'SEEK'; position: number }
  | { type: 'TOGGLE_PLAY' };

/**
 * Execution summary for clock list
 */
export interface ClockExecutionSummary {
  id: string;
  loopId: string;
  project: string;
  status: string;
  currentPhase: Phase;
  eventCount: number;
  startedAt: Date;
  completedAt?: Date;
}
