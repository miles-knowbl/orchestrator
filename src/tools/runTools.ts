/**
 * MCP Tool definitions for run archival and querying
 */

import { z } from 'zod';
import type { RunArchivalService, QueryRunsParams } from '../services/RunArchivalService.js';

// Zod schemas
const QueryRunsSchema = z.object({
  loop: z.string().optional(),
  system: z.string().optional(),
  module: z.string().optional(),
  since: z.string().optional(),
  until: z.string().optional(),
  outcome: z.enum(['success', 'failed', 'abandoned']).optional(),
  limit: z.number().min(1).max(100).optional(),
  include_state: z.boolean().optional(),
});

const ArchiveRunSchema = z.object({
  state_file_path: z.string().min(1),
  outcome: z.enum(['success', 'failed', 'abandoned']).optional(),
  prune_state: z.boolean().optional(),
});

const GetRecentContextSchema = z.object({
  system: z.string().min(1),
  limit: z.number().min(1).max(10).optional(),
});

/**
 * Run archival tool definitions
 */
export const runToolDefinitions = [
  {
    name: 'query_runs',
    description: 'Query archived loop runs with filters. Use this to find past executions for context, learning, or analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        loop: {
          type: 'string',
          description: 'Filter by loop type (e.g., "engineering-loop", "learning-loop")',
        },
        system: {
          type: 'string',
          description: 'Filter by system name (repository name)',
        },
        module: {
          type: 'string',
          description: 'Filter by module name within a system',
        },
        since: {
          type: 'string',
          description: 'Filter runs completed after this ISO date',
        },
        until: {
          type: 'string',
          description: 'Filter runs completed before this ISO date',
        },
        outcome: {
          type: 'string',
          enum: ['success', 'failed', 'abandoned'],
          description: 'Filter by run outcome',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 10, max: 100)',
        },
        include_state: {
          type: 'boolean',
          description: 'Include full state in results (default: false)',
        },
      },
    },
  },
  {
    name: 'archive_run',
    description: 'Archive a completed loop run. Call this when a loop reaches COMPLETE phase to save the run and optionally prune the active state file.',
    inputSchema: {
      type: 'object',
      properties: {
        state_file_path: {
          type: 'string',
          description: 'Path to the active state file (e.g., "./loop-state.json")',
        },
        outcome: {
          type: 'string',
          enum: ['success', 'failed', 'abandoned'],
          description: 'Run outcome (default: success)',
        },
        prune_state: {
          type: 'boolean',
          description: 'Delete the active state file after archival (default: true)',
        },
      },
      required: ['state_file_path'],
    },
  },
  {
    name: 'get_recent_context',
    description: 'Get recent runs for a system to inject as context for new loops. Returns summaries of the last N runs.',
    inputSchema: {
      type: 'object',
      properties: {
        system: {
          type: 'string',
          description: 'System name (repository name)',
        },
        limit: {
          type: 'number',
          description: 'Number of recent runs to return (default: 5, max: 10)',
        },
      },
      required: ['system'],
    },
  },
];

/**
 * Create run archival tool handlers
 */
export function createRunToolHandlers(runArchivalService: RunArchivalService) {
  return {
    query_runs: async (params: unknown) => {
      const validated = QueryRunsSchema.parse(params);
      const runs = await runArchivalService.queryRuns(validated as QueryRunsParams);

      return {
        runs: runs.map(run => ({
          loop: run.summary.loop,
          system: run.summary.system,
          module: run.summary.module,
          completed_at: run.summary.completed_at,
          duration_minutes: run.summary.duration_minutes,
          outcome: run.summary.outcome,
          phases_completed: run.summary.phases_completed.length,
          gates_passed: run.summary.gates_passed.length,
          deliverables: run.summary.deliverables,
          file_path: run.meta.file_path,
          ...(validated.include_state ? { state: run.state } : {}),
        })),
        total: runs.length,
        query: validated,
      };
    },

    archive_run: async (params: unknown) => {
      const validated = ArchiveRunSchema.parse(params);
      const { promises: fs } = await import('fs');

      // Read the state file
      let state: Record<string, unknown>;
      try {
        const content = await fs.readFile(validated.state_file_path, 'utf-8');
        state = JSON.parse(content);
      } catch (error) {
        throw new Error(`Failed to read state file: ${validated.state_file_path}`);
      }

      // Create summary
      const summary = runArchivalService.createRunSummary(
        state,
        validated.outcome || 'success'
      );

      // Archive the run
      const archivePath = await runArchivalService.archiveRun(state, summary);

      // Optionally prune the state file
      let pruned = false;
      if (validated.prune_state !== false) {
        pruned = await runArchivalService.pruneStateFile(validated.state_file_path);
      }

      return {
        archived: true,
        archive_path: archivePath,
        summary: {
          loop: summary.loop,
          system: summary.system,
          duration_minutes: summary.duration_minutes,
          outcome: summary.outcome,
          phases_completed: summary.phases_completed.length,
          gates_passed: summary.gates_passed.length,
        },
        state_pruned: pruned,
        message: `Run archived to ${archivePath}${pruned ? ' (state file pruned)' : ''}`,
      };
    },

    get_recent_context: async (params: unknown) => {
      const validated = GetRecentContextSchema.parse(params);
      const summaries = await runArchivalService.getRecentRunsForContext(
        validated.system,
        validated.limit || 5
      );

      return {
        system: validated.system,
        recent_runs: summaries.map(s => ({
          loop: s.loop,
          module: s.module,
          completed_at: s.completed_at,
          outcome: s.outcome,
          duration_minutes: s.duration_minutes,
          deliverables: s.deliverables,
        })),
        total: summaries.length,
        message: summaries.length > 0
          ? `Found ${summaries.length} recent runs for ${validated.system}`
          : `No archived runs found for ${validated.system}`,
      };
    },
  };
}
