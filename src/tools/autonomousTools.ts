/**
 * MCP Tools for AutonomousExecutor
 *
 * Provides control over autonomous background execution.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { AutonomousExecutor } from '../services/autonomous/index.js';

export const autonomousTools: Tool[] = [
  {
    name: 'start_autonomous',
    description: 'Start the autonomous background executor. Begins processing executions with autonomy=full.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'stop_autonomous',
    description: 'Stop the autonomous background executor. Active executions continue but no new ticks are processed.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'pause_autonomous',
    description: 'Pause autonomous execution. Can be resumed later.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'resume_autonomous',
    description: 'Resume paused autonomous execution.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_autonomous_status',
    description: 'Get current status of the autonomous executor',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'configure_autonomous',
    description: 'Update autonomous executor configuration',
    inputSchema: {
      type: 'object',
      properties: {
        tickInterval: {
          type: 'number',
          description: 'Interval between ticks in milliseconds (default: 5000)',
        },
        maxParallelExecutions: {
          type: 'number',
          description: 'Maximum parallel autonomous executions (default: 3)',
        },
        maxSkillRetries: {
          type: 'number',
          description: 'Maximum skill retries before escalation (default: 3)',
        },
      },
    },
  },
  {
    name: 'run_autonomous_tick',
    description: 'Manually run a single autonomous tick. Useful for testing or one-off processing.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_autonomous_executions',
    description: 'List all executions currently running in autonomous mode',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'check_gate_auto_approval',
    description: 'Check if a gate can be auto-approved based on autonomy level and approval type',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
        gateId: {
          type: 'string',
          description: 'Gate ID to check',
        },
      },
      required: ['executionId', 'gateId'],
    },
  },
];

export function createAutonomousToolHandlers(autonomousExecutor: AutonomousExecutor) {
  return {
    start_autonomous: async (_params: unknown) => {
      autonomousExecutor.start();
      return {
        success: true,
        message: 'Autonomous executor started',
        status: autonomousExecutor.getStatus(),
      };
    },

    stop_autonomous: async (_params: unknown) => {
      autonomousExecutor.stop();
      return {
        success: true,
        message: 'Autonomous executor stopped',
        status: autonomousExecutor.getStatus(),
      };
    },

    pause_autonomous: async (_params: unknown) => {
      autonomousExecutor.pause();
      return {
        success: true,
        message: 'Autonomous executor paused',
        status: autonomousExecutor.getStatus(),
      };
    },

    resume_autonomous: async (_params: unknown) => {
      autonomousExecutor.resume();
      return {
        success: true,
        message: 'Autonomous executor resumed',
        status: autonomousExecutor.getStatus(),
      };
    },

    get_autonomous_status: async (_params: unknown) => {
      return autonomousExecutor.getStatus();
    },

    configure_autonomous: async (params: unknown) => {
      const args = (params || {}) as {
        tickInterval?: number;
        maxParallelExecutions?: number;
        maxSkillRetries?: number;
      };

      autonomousExecutor.configure(args);
      return {
        success: true,
        message: 'Configuration updated',
        status: autonomousExecutor.getStatus(),
      };
    },

    run_autonomous_tick: async (_params: unknown) => {
      const results = await autonomousExecutor.tick();
      return {
        tickProcessed: true,
        results,
        status: autonomousExecutor.getStatus(),
      };
    },

    list_autonomous_executions: async (_params: unknown) => {
      const executions = autonomousExecutor.getAutonomousExecutions();
      return {
        count: executions.length,
        executions: executions.map(e => ({
          id: e.id,
          loopId: e.loopId,
          project: e.project,
          currentPhase: e.currentPhase,
          autonomy: e.autonomy,
          status: e.status,
          startedAt: e.startedAt,
        })),
      };
    },

    check_gate_auto_approval: async (params: unknown) => {
      const args = params as { executionId: string; gateId: string };
      if (!args?.executionId || !args?.gateId) {
        return { error: 'executionId and gateId are required' };
      }

      // Get execution and gate from the executor's dependencies
      const executions = autonomousExecutor.getAutonomousExecutions();
      const execution = executions.find(e => e.id === args.executionId);

      if (!execution) {
        // Also check eligible executions (supervised mode)
        const eligible = autonomousExecutor.getEligibleExecutions();
        const supervisedExecution = eligible.find(e => e.id === args.executionId);
        if (!supervisedExecution) {
          return { error: `Execution not found or not in autonomous/supervised mode: ${args.executionId}` };
        }
        return {
          executionId: args.executionId,
          gateId: args.gateId,
          autonomy: supervisedExecution.autonomy,
          canAutoApprove: false,
          reason: 'Supervised mode requires manual review of auto gates',
        };
      }

      // We can't directly check the gate here without accessing loopComposer
      // Return basic info about the execution's autonomy level
      return {
        executionId: args.executionId,
        gateId: args.gateId,
        autonomy: execution.autonomy,
        note: 'Full auto-approval check requires loop definition. Use run_autonomous_tick to process.',
      };
    },
  };
}
