/**
 * KnoPilot Module
 *
 * AI-powered sales intelligence system for deal management,
 * intelligence extraction, scoring, and next-best-action recommendations.
 */

export * from './types.js';
export { DealManager } from './DealManager.js';
export { ScoringEngine } from './ScoringEngine.js';
export { NBAEngine } from './NBAEngine.js';
export { KnoPilotService, getKnoPilotService } from './KnoPilotService.js';
