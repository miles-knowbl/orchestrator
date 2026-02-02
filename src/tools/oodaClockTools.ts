/**
 * OODA Clock MCP Tools
 *
 * Tools for interacting with the OODA clock visualization.
 */

import { z } from 'zod';
import type { OODAClockService } from '../services/ooda-clock/index.js';
import type { ExecutionEngine } from '../services/ExecutionEngine.js';

export function createOODAClockTools(
  clockService: OODAClockService,
  executionEngine: ExecutionEngine
) {
  return {
    /**
     * List executions available for clock visualization
     */
    list_clock_executions: {
      description: 'List executions available for OODA clock visualization',
      parameters: z.object({
        status: z.enum(['active', 'paused', 'completed', 'failed', 'all']).optional()
          .describe('Filter by execution status'),
        limit: z.number().optional()
          .describe('Maximum number of executions to return'),
      }),
      handler: async ({ status, limit }: { status?: string; limit?: number }) => {
        const allExecutions = await executionEngine.listExecutions();

        let filtered = allExecutions;
        if (status && status !== 'all') {
          filtered = filtered.filter(e => e.status === status);
        }

        if (limit) {
          filtered = filtered.slice(0, limit);
        }

        // Map ExecutionSummary to ClockExecutionSummary
        const summaries = filtered.map(e => ({
          id: e.id,
          loopId: e.loopId,
          project: e.project,
          status: e.status,
          currentPhase: e.currentPhase,
          eventCount: e.progress.skillsCompleted + e.progress.phasesCompleted,
          startedAt: e.startedAt,
        }));

        return {
          executions: summaries,
          total: summaries.length,
        };
      },
    },

    /**
     * Get clock events for an execution
     */
    get_clock_events: {
      description: 'Get clock events for a specific execution',
      parameters: z.object({
        executionId: z.string().describe('The execution ID'),
        includePatterns: z.boolean().optional()
          .describe('Include detected rhythm patterns'),
      }),
      handler: async ({
        executionId,
        includePatterns,
      }: {
        executionId: string;
        includePatterns?: boolean;
      }) => {
        const execution = await executionEngine.getExecution(executionId);
        if (!execution) {
          throw new Error(`Execution not found: ${executionId}`);
        }

        const events = clockService.processLogs(execution.logs);
        const progress = clockService.getCycleProgress(execution);

        const result: {
          execution: {
            id: string;
            loopId: string;
            project: string;
            status: string;
            startedAt: Date;
            completedAt?: Date;
          };
          events: typeof events;
          progress: typeof progress;
          patterns?: ReturnType<typeof clockService.analyzeRhythm>;
        } = {
          execution: {
            id: execution.id,
            loopId: execution.loopId,
            project: execution.project,
            status: execution.status,
            startedAt: execution.startedAt,
            completedAt: execution.completedAt,
          },
          events,
          progress,
        };

        if (includePatterns) {
          result.patterns = clockService.analyzeRhythm(events);
        }

        return result;
      },
    },

    /**
     * Get rhythm patterns across all executions
     */
    get_rhythm_patterns: {
      description: 'Analyze rhythm patterns across executions',
      parameters: z.object({
        executionIds: z.array(z.string()).optional()
          .describe('Specific execution IDs to analyze (all if omitted)'),
        minConfidence: z.number().min(0).max(1).optional()
          .describe('Minimum confidence threshold (0-1)'),
      }),
      handler: async ({
        executionIds,
        minConfidence = 0.5,
      }: {
        executionIds?: string[];
        minConfidence?: number;
      }) => {
        // Get execution IDs to analyze
        let idsToFetch: string[];
        if (executionIds) {
          idsToFetch = executionIds;
        } else {
          const summaries = await executionEngine.listExecutions();
          idsToFetch = summaries.map(s => s.id);
        }

        // Fetch full executions with logs
        const executions = await Promise.all(
          idsToFetch.map(id => executionEngine.getExecution(id))
        );

        const validExecutions = executions.filter((e): e is NonNullable<typeof e> => e !== null);

        // Collect all events
        const allEvents = validExecutions.flatMap(e =>
          clockService.processLogs(e.logs)
        );

        // Analyze patterns
        const patterns = clockService.analyzeRhythm(allEvents);

        // Filter by confidence
        const filtered = patterns.filter(p => p.confidence >= minConfidence);

        return {
          patterns: filtered,
          totalEvents: allEvents.length,
          executionsAnalyzed: validExecutions.length,
        };
      },
    },

    /**
     * Get current cycle progress for an execution
     */
    get_cycle_progress: {
      description: 'Get the current OODA cycle progress for an execution',
      parameters: z.object({
        executionId: z.string().describe('The execution ID'),
      }),
      handler: async ({ executionId }: { executionId: string }) => {
        const execution = await executionEngine.getExecution(executionId);
        if (!execution) {
          throw new Error(`Execution not found: ${executionId}`);
        }

        return clockService.getCycleProgress(execution);
      },
    },
  };
}
