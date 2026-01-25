/**
 * MCP Tool definitions for execution operations
 */

import { z } from 'zod';
import type { ExecutionEngine } from '../services/ExecutionEngine.js';
import type { LoopMode, AutonomyLevel, ExecutionStatus } from '../types.js';

// Zod schemas
const StartExecutionSchema = z.object({
  loopId: z.string().min(1),
  project: z.string().min(1),
  mode: z.enum(['greenfield', 'brownfield-polish', 'brownfield-enterprise']).optional(),
  autonomy: z.enum(['full', 'supervised', 'manual']).optional(),
});

const GetExecutionSchema = z.object({
  id: z.string().min(1),
});

const ListExecutionsSchema = z.object({
  status: z.enum(['pending', 'active', 'paused', 'blocked', 'completed', 'failed']).optional(),
  loopId: z.string().optional(),
});

const AdvancePhaseSchema = z.object({
  executionId: z.string().min(1),
});

const CompletePhaseSchema = z.object({
  executionId: z.string().min(1),
});

const CompleteSkillSchema = z.object({
  executionId: z.string().min(1),
  skillId: z.string().min(1),
  deliverables: z.array(z.string()).optional(),
  success: z.boolean().optional(),
  score: z.number().min(0).max(1).optional(),
});

const SkipSkillSchema = z.object({
  executionId: z.string().min(1),
  skillId: z.string().min(1),
  reason: z.string().min(1),
});

const ApproveGateSchema = z.object({
  executionId: z.string().min(1),
  gateId: z.string().min(1),
  approvedBy: z.string().optional(),
});

const RejectGateSchema = z.object({
  executionId: z.string().min(1),
  gateId: z.string().min(1),
  feedback: z.string().min(1),
});

const PauseResumeSchema = z.object({
  executionId: z.string().min(1),
});

const AbortSchema = z.object({
  executionId: z.string().min(1),
  reason: z.string().optional(),
});

/**
 * Execution tool definitions for MCP registration
 */
export const executionToolDefinitions = [
  {
    name: 'start_execution',
    description: 'Start a new loop execution',
    inputSchema: {
      type: 'object',
      properties: {
        loopId: {
          type: 'string',
          description: 'Loop ID to execute (e.g., "engineering-loop")',
        },
        project: {
          type: 'string',
          description: 'Project name or path',
        },
        mode: {
          type: 'string',
          enum: ['greenfield', 'brownfield-polish', 'brownfield-enterprise'],
          description: 'Execution mode',
        },
        autonomy: {
          type: 'string',
          enum: ['full', 'supervised', 'manual'],
          description: 'Autonomy level',
        },
      },
      required: ['loopId', 'project'],
    },
  },
  {
    name: 'get_execution',
    description: 'Get current state of an execution',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Execution ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_executions',
    description: 'List all executions with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'active', 'paused', 'blocked', 'completed', 'failed'],
          description: 'Filter by status',
        },
        loopId: {
          type: 'string',
          description: 'Filter by loop ID',
        },
      },
    },
  },
  {
    name: 'advance_phase',
    description: 'Advance execution to the next phase (requires current phase completed and gate approved)',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
      },
      required: ['executionId'],
    },
  },
  {
    name: 'complete_phase',
    description: 'Mark the current phase as completed (requires all skills completed)',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
      },
      required: ['executionId'],
    },
  },
  {
    name: 'complete_skill',
    description: 'Mark a skill as completed in the current phase',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
        skillId: {
          type: 'string',
          description: 'Skill ID',
        },
        deliverables: {
          type: 'array',
          items: { type: 'string' },
          description: 'Files produced by the skill',
        },
        success: {
          type: 'boolean',
          description: 'Whether execution was successful',
        },
        score: {
          type: 'number',
          description: 'Outcome score (0-1)',
        },
      },
      required: ['executionId', 'skillId'],
    },
  },
  {
    name: 'skip_skill',
    description: 'Skip a skill in the current phase',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
        skillId: {
          type: 'string',
          description: 'Skill ID to skip',
        },
        reason: {
          type: 'string',
          description: 'Reason for skipping',
        },
      },
      required: ['executionId', 'skillId', 'reason'],
    },
  },
  {
    name: 'approve_gate',
    description: 'Approve a gate to allow phase advancement',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
        gateId: {
          type: 'string',
          description: 'Gate ID to approve',
        },
        approvedBy: {
          type: 'string',
          description: 'Who approved the gate',
        },
      },
      required: ['executionId', 'gateId'],
    },
  },
  {
    name: 'reject_gate',
    description: 'Reject a gate with feedback (blocks execution)',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
        gateId: {
          type: 'string',
          description: 'Gate ID to reject',
        },
        feedback: {
          type: 'string',
          description: 'Feedback explaining rejection',
        },
      },
      required: ['executionId', 'gateId', 'feedback'],
    },
  },
  {
    name: 'pause_execution',
    description: 'Pause an active execution',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
      },
      required: ['executionId'],
    },
  },
  {
    name: 'resume_execution',
    description: 'Resume a paused or blocked execution',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
      },
      required: ['executionId'],
    },
  },
  {
    name: 'abort_execution',
    description: 'Abort an execution',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
        reason: {
          type: 'string',
          description: 'Reason for aborting',
        },
      },
      required: ['executionId'],
    },
  },
];

/**
 * Create execution tool handlers
 */
export function createExecutionToolHandlers(executionEngine: ExecutionEngine) {
  return {
    start_execution: async (params: unknown) => {
      const validated = StartExecutionSchema.parse(params);
      const execution = await executionEngine.startExecution({
        loopId: validated.loopId,
        project: validated.project,
        mode: validated.mode as LoopMode | undefined,
        autonomy: validated.autonomy as AutonomyLevel | undefined,
      });

      return {
        id: execution.id,
        loopId: execution.loopId,
        project: execution.project,
        status: execution.status,
        currentPhase: execution.currentPhase,
        message: `Execution started for ${validated.loopId}`,
      };
    },

    get_execution: async (params: unknown) => {
      const validated = GetExecutionSchema.parse(params);
      const execution = executionEngine.getExecution(validated.id);

      if (!execution) {
        throw new Error(`Execution not found: ${validated.id}`);
      }

      return {
        id: execution.id,
        loopId: execution.loopId,
        loopVersion: execution.loopVersion,
        project: execution.project,
        mode: execution.mode,
        autonomy: execution.autonomy,
        status: execution.status,
        currentPhase: execution.currentPhase,
        phases: execution.phases,
        gates: execution.gates,
        skillExecutions: execution.skillExecutions.length,
        startedAt: execution.startedAt,
        updatedAt: execution.updatedAt,
        completedAt: execution.completedAt,
      };
    },

    list_executions: async (params: unknown) => {
      const validated = ListExecutionsSchema.parse(params);
      const executions = executionEngine.listExecutions({
        status: validated.status as ExecutionStatus | undefined,
        loopId: validated.loopId,
      });

      return {
        executions,
        total: executions.length,
      };
    },

    advance_phase: async (params: unknown) => {
      const validated = AdvancePhaseSchema.parse(params);
      const execution = await executionEngine.advancePhase(validated.executionId);

      return {
        id: execution.id,
        status: execution.status,
        currentPhase: execution.currentPhase,
        message: execution.status === 'completed'
          ? 'Loop completed'
          : `Advanced to phase ${execution.currentPhase}`,
      };
    },

    complete_phase: async (params: unknown) => {
      const validated = CompletePhaseSchema.parse(params);
      const execution = await executionEngine.completePhase(validated.executionId);

      return {
        id: execution.id,
        currentPhase: execution.currentPhase,
        message: `Phase ${execution.currentPhase} completed`,
      };
    },

    complete_skill: async (params: unknown) => {
      const validated = CompleteSkillSchema.parse(params);
      const execution = await executionEngine.completeSkill(
        validated.executionId,
        validated.skillId,
        {
          deliverables: validated.deliverables,
          outcome: validated.success !== undefined
            ? { success: validated.success, score: validated.score || (validated.success ? 1 : 0) }
            : undefined,
        }
      );

      return {
        id: execution.id,
        skillId: validated.skillId,
        message: `Skill ${validated.skillId} completed`,
      };
    },

    skip_skill: async (params: unknown) => {
      const validated = SkipSkillSchema.parse(params);
      const execution = await executionEngine.skipSkill(
        validated.executionId,
        validated.skillId,
        validated.reason
      );

      return {
        id: execution.id,
        skillId: validated.skillId,
        message: `Skill ${validated.skillId} skipped: ${validated.reason}`,
      };
    },

    approve_gate: async (params: unknown) => {
      const validated = ApproveGateSchema.parse(params);
      const execution = await executionEngine.approveGate(
        validated.executionId,
        validated.gateId,
        validated.approvedBy
      );

      return {
        id: execution.id,
        gateId: validated.gateId,
        message: `Gate ${validated.gateId} approved`,
      };
    },

    reject_gate: async (params: unknown) => {
      const validated = RejectGateSchema.parse(params);
      const execution = await executionEngine.rejectGate(
        validated.executionId,
        validated.gateId,
        validated.feedback
      );

      return {
        id: execution.id,
        gateId: validated.gateId,
        status: execution.status,
        message: `Gate ${validated.gateId} rejected`,
      };
    },

    pause_execution: async (params: unknown) => {
      const validated = PauseResumeSchema.parse(params);
      const execution = await executionEngine.pauseExecution(validated.executionId);

      return {
        id: execution.id,
        status: execution.status,
        message: 'Execution paused',
      };
    },

    resume_execution: async (params: unknown) => {
      const validated = PauseResumeSchema.parse(params);
      const execution = await executionEngine.resumeExecution(validated.executionId);

      return {
        id: execution.id,
        status: execution.status,
        message: 'Execution resumed',
      };
    },

    abort_execution: async (params: unknown) => {
      const validated = AbortSchema.parse(params);
      await executionEngine.abortExecution(validated.executionId, validated.reason);

      return {
        id: validated.executionId,
        message: 'Execution aborted',
      };
    },
  };
}
