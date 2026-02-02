/**
 * OODA Clock Module
 *
 * Gamelan-inspired circular visualization for loop execution timing.
 */

export { OODAClockService } from './OODAClockService.js';
export type { OODAClockServiceOptions } from './OODAClockService.js';

export { RhythmAnalyzer } from './RhythmAnalyzer.js';

export type {
  ClockEvent,
  RhythmPattern,
  QuadrantConfig,
  PhaseAngleMapping,
  ClockState,
  ClockAction,
  ClockExecutionSummary,
} from './types.js';

export {
  CLOCK_COLORS,
  OODA_QUADRANTS,
  PHASE_ANGLES,
  LAYER_RADII,
} from './types.js';
