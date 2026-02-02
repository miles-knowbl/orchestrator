/**
 * MCP Tools for Loop Sequencing
 *
 * Provides control over loop sequence analysis and multi-move planning.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { LoopSequencingService } from '../services/loop-sequencing/index.js';

export const loopSequencingTools: Tool[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Analysis
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'analyze_loop_history',
    description: 'Analyze run archives to detect loop co-occurrence patterns and transitions.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of runs to analyze (default: 500)',
        },
        since: {
          type: 'string',
          description: 'Only analyze runs since this ISO date',
        },
      },
    },
  },
  {
    name: 'get_sequence_analysis',
    description: 'Get the results of the last sequence analysis.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Transitions
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'list_loop_transitions',
    description: 'List recorded loop-to-loop transitions with statistics.',
    inputSchema: {
      type: 'object',
      properties: {
        minOccurrences: {
          type: 'number',
          description: 'Only show transitions with at least this many occurrences',
        },
        loop: {
          type: 'string',
          description: 'Filter to transitions involving this loop',
        },
      },
    },
  },
  {
    name: 'get_loop_transition',
    description: 'Get details of a specific loop-to-loop transition.',
    inputSchema: {
      type: 'object',
      properties: {
        fromLoop: {
          type: 'string',
          description: 'The source loop',
        },
        toLoop: {
          type: 'string',
          description: 'The destination loop',
        },
      },
      required: ['fromLoop', 'toLoop'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Sequences
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'list_loop_sequences',
    description: 'List recorded multi-loop sequences.',
    inputSchema: {
      type: 'object',
      properties: {
        minOccurrences: {
          type: 'number',
          description: 'Only show sequences with at least this many occurrences',
        },
        containsLoop: {
          type: 'string',
          description: 'Filter to sequences containing this loop',
        },
      },
    },
  },
  {
    name: 'get_loop_sequence',
    description: 'Get details of a specific loop sequence.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The sequence ID (loops joined by →)',
        },
      },
      required: ['id'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Line Generation (Multi-Move Planning)
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'generate_line',
    description: 'Generate a multi-move line (plan) based on historical patterns and leverage.',
    inputSchema: {
      type: 'object',
      properties: {
        startingLoop: {
          type: 'string',
          description: 'The loop to start with (optional, will determine best first move if not provided)',
        },
        target: {
          type: 'string',
          description: 'Target module or system to work toward',
        },
        depth: {
          type: 'number',
          description: 'Maximum number of moves to plan ahead (default: 5)',
        },
      },
    },
  },
  {
    name: 'list_generated_lines',
    description: 'List previously generated multi-move lines.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of lines to return',
        },
      },
    },
  },
  {
    name: 'get_generated_line',
    description: 'Get details of a specific generated line.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The line ID',
        },
      },
      required: ['id'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Status & View
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_sequencing_status',
    description: 'Get current status of the loop sequencing service.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_sequencing_terminal_view',
    description: 'Get a terminal-friendly view of loop sequencing status.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export function createLoopSequencingToolHandlers(sequencingService: LoopSequencingService) {
  return {
    analyze_loop_history: async (params: unknown) => {
      const args = (params || {}) as { limit?: number; since?: string };
      const analysis = await sequencingService.analyzeRunHistory({
        limit: args.limit,
        since: args.since,
      });
      return {
        success: true,
        analysis: {
          totalRunsAnalyzed: analysis.totalRunsAnalyzed,
          uniqueLoops: analysis.uniqueLoops,
          uniqueTransitions: analysis.uniqueTransitions,
          uniqueSequences: analysis.uniqueSequences,
          topTransitions: analysis.topTransitions.slice(0, 5).map(t => ({
            from: t.fromLoop,
            to: t.toLoop,
            occurrences: t.occurrences,
            successRate: t.successRate,
          })),
          topSequences: analysis.topSequences.slice(0, 5).map(s => ({
            loops: s.loops,
            occurrences: s.occurrences,
            successRate: s.successRate,
          })),
          insightCount: analysis.insights.length,
          topInsights: analysis.insights.slice(0, 3),
        },
      };
    },

    get_sequence_analysis: async (_params: unknown) => {
      const analysis = sequencingService.getLastAnalysis();
      if (!analysis) {
        return { error: 'No analysis has been run yet. Use analyze_loop_history first.' };
      }
      return analysis;
    },

    list_loop_transitions: async (params: unknown) => {
      const args = (params || {}) as { minOccurrences?: number; loop?: string };
      const transitions = sequencingService.getTransitions({
        minOccurrences: args.minOccurrences,
        loop: args.loop,
      });
      return {
        count: transitions.length,
        transitions: transitions.map(t => ({
          from: t.fromLoop,
          to: t.toLoop,
          occurrences: t.occurrences,
          successRate: t.successRate,
          avgGapMinutes: t.avgGapMinutes,
          contexts: t.contexts,
        })),
      };
    },

    get_loop_transition: async (params: unknown) => {
      const args = params as { fromLoop: string; toLoop: string };
      if (!args?.fromLoop || !args?.toLoop) {
        return { error: 'fromLoop and toLoop are required' };
      }
      const transition = sequencingService.getTransition(args.fromLoop, args.toLoop);
      if (!transition) {
        return { error: `Transition ${args.fromLoop} → ${args.toLoop} not found` };
      }
      return transition;
    },

    list_loop_sequences: async (params: unknown) => {
      const args = (params || {}) as { minOccurrences?: number; containsLoop?: string };
      const sequences = sequencingService.getSequences({
        minOccurrences: args.minOccurrences,
        containsLoop: args.containsLoop,
      });
      return {
        count: sequences.length,
        sequences: sequences.map(s => ({
          id: s.id,
          loops: s.loops,
          occurrences: s.occurrences,
          successRate: s.successRate,
          avgTotalDuration: s.avgTotalDuration,
        })),
      };
    },

    get_loop_sequence: async (params: unknown) => {
      const args = params as { id: string };
      if (!args?.id) {
        return { error: 'id is required' };
      }
      const sequence = sequencingService.getSequence(args.id);
      if (!sequence) {
        return { error: `Sequence not found: ${args.id}` };
      }
      return sequence;
    },

    generate_line: async (params: unknown) => {
      const args = (params || {}) as { startingLoop?: string; target?: string; depth?: number };
      try {
        const line = await sequencingService.generateLine({
          startingLoop: args.startingLoop,
          target: args.target,
          depth: args.depth,
        });
        return {
          success: true,
          line: {
            id: line.id,
            totalMoves: line.totalMoves,
            compoundLeverage: line.compoundLeverage,
            expectedDuration: line.expectedDuration,
            confidence: line.confidence,
            moves: line.moves.map(m => ({
              position: m.position,
              loop: m.loop,
              target: m.target,
              leverage: m.leverage,
              cumulativeLeverage: m.cumulativeLeverage,
              estimatedDuration: m.estimatedDuration,
              transitionSuccessRate: m.transitionFromPrevious?.historicalSuccessRate,
            })),
            reasoning: line.reasoning,
            risks: line.risks,
            alternatives: line.alternatives,
          },
        };
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to generate line' };
      }
    },

    list_generated_lines: async (params: unknown) => {
      const args = (params || {}) as { limit?: number };
      const lines = sequencingService.getLines({ limit: args.limit });
      return {
        count: lines.length,
        lines: lines.map(l => ({
          id: l.id,
          totalMoves: l.totalMoves,
          compoundLeverage: l.compoundLeverage,
          confidence: l.confidence,
          generatedAt: l.generatedAt,
          firstMove: l.moves[0]?.loop,
        })),
      };
    },

    get_generated_line: async (params: unknown) => {
      const args = params as { id: string };
      if (!args?.id) {
        return { error: 'id is required' };
      }
      const line = sequencingService.getLine(args.id);
      if (!line) {
        return { error: `Line not found: ${args.id}` };
      }
      return line;
    },

    get_sequencing_status: async (_params: unknown) => {
      return sequencingService.getStatus();
    },

    get_sequencing_terminal_view: async (_params: unknown) => {
      return { view: sequencingService.generateTerminalView() };
    },
  };
}
