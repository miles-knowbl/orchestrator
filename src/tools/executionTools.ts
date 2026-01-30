/**
 * MCP Tool definitions for execution operations
 */

import { z } from 'zod';
import type { ExecutionEngine } from '../services/ExecutionEngine.js';
import type { LearningService } from '../services/LearningService.js';
import type { LoopMode, AutonomyLevel, ExecutionStatus, SkillRubric, SectionRecommendation, Phase } from '../types.js';

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

const RubricSchema = z.object({
  completeness: z.number().min(1).max(5),
  quality: z.number().min(1).max(5),
  friction: z.number().min(1).max(5),
  relevance: z.number().min(1).max(5),
});

const SectionRecommendationSchema = z.object({
  type: z.enum(['add', 'remove', 'update']),
  section: z.string().min(1),
  reason: z.string().min(1),
  proposedContent: z.string().optional(),
});

const CompleteSkillSchema = z.object({
  executionId: z.string().min(1),
  skillId: z.string().min(1),
  deliverables: z.array(z.string()).optional(),
  success: z.boolean().optional(),
  score: z.number().min(0).max(1).optional(),
  // Learning system: rubric and section recommendations
  rubric: RubricSchema.optional(),
  sectionRecommendations: z.array(SectionRecommendationSchema).optional(),
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

const CompleteRunTrackingSchema = z.object({
  executionId: z.string().min(1),
});

const ListUpgradeProposalsSchema = z.object({
  skill: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'applied']).optional(),
});

const ApproveUpgradeProposalSchema = z.object({
  proposalId: z.string().min(1),
  approvedBy: z.string().optional(),
});

const RejectUpgradeProposalSchema = z.object({
  proposalId: z.string().min(1),
  reason: z.string().min(1),
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
    description: 'Mark a skill as completed in the current phase with rubric scoring for learning',
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
        rubric: {
          type: 'object',
          description: 'Skill execution rubric (1-5 for each dimension)',
          properties: {
            completeness: { type: 'number', description: 'Did the skill produce all expected outputs? (1-5)' },
            quality: { type: 'number', description: 'How well did outputs meet the spec? (1-5)' },
            friction: { type: 'number', description: 'How smooth was execution? 5=no rework (1-5)' },
            relevance: { type: 'number', description: 'Was every section of the skill useful? (1-5)' },
          },
          required: ['completeness', 'quality', 'friction', 'relevance'],
        },
        sectionRecommendations: {
          type: 'array',
          description: 'Recommendations for improving skill sections',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['add', 'remove', 'update'], description: 'Type of change' },
              section: { type: 'string', description: 'Section name' },
              reason: { type: 'string', description: 'Why this change is recommended' },
              proposedContent: { type: 'string', description: 'Proposed content for add/update' },
            },
            required: ['type', 'section', 'reason'],
          },
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
  // Learning System Tools
  {
    name: 'complete_run_tracking',
    description: 'Complete run tracking and trigger learning analysis. Automatically called when loop completes, but can be called manually.',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID to complete tracking for',
        },
      },
      required: ['executionId'],
    },
  },
  {
    name: 'list_upgrade_proposals',
    description: 'List skill upgrade proposals generated by the learning system',
    inputSchema: {
      type: 'object',
      properties: {
        skill: {
          type: 'string',
          description: 'Filter by skill name',
        },
        status: {
          type: 'string',
          enum: ['pending', 'approved', 'rejected', 'applied'],
          description: 'Filter by proposal status',
        },
      },
    },
  },
  {
    name: 'get_learning_summary',
    description: 'Get summary of learning system state including run signals and proposals',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'approve_upgrade_proposal',
    description: 'Approve a skill upgrade proposal and apply the changes',
    inputSchema: {
      type: 'object',
      properties: {
        proposalId: {
          type: 'string',
          description: 'Proposal ID to approve',
        },
        approvedBy: {
          type: 'string',
          description: 'Who is approving',
        },
      },
      required: ['proposalId'],
    },
  },
  {
    name: 'reject_upgrade_proposal',
    description: 'Reject a skill upgrade proposal',
    inputSchema: {
      type: 'object',
      properties: {
        proposalId: {
          type: 'string',
          description: 'Proposal ID to reject',
        },
        reason: {
          type: 'string',
          description: 'Reason for rejection',
        },
      },
      required: ['proposalId', 'reason'],
    },
  },
];

/**
 * Create execution tool handlers
 */
export function createExecutionToolHandlers(
  executionEngine: ExecutionEngine,
  learningService?: LearningService
) {
  return {
    start_execution: async (params: unknown) => {
      const validated = StartExecutionSchema.parse(params);
      const execution = await executionEngine.startExecution({
        loopId: validated.loopId,
        project: validated.project,
        mode: validated.mode as LoopMode | undefined,
        autonomy: validated.autonomy as AutonomyLevel | undefined,
      });

      // Start learning tracking
      if (learningService) {
        learningService.startRunTracking(execution.id, execution.loopId, execution.project);
      }

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

      // If loop completed, run learning analysis
      let learningResult: { runId: string; newProposals: any[]; summary: string } | null = null;
      if (execution.status === 'completed' && learningService) {
        try {
          learningResult = await learningService.completeRunTracking(validated.executionId);
        } catch (err) {
          // Log but don't fail the advance
          console.error('Learning analysis error:', err);
        }
      }

      return {
        id: execution.id,
        status: execution.status,
        currentPhase: execution.currentPhase,
        message: execution.status === 'completed'
          ? 'Loop completed'
          : `Advanced to phase ${execution.currentPhase}`,
        learning: learningResult ? {
          runId: learningResult.runId,
          newProposals: learningResult.newProposals.length,
          summary: learningResult.summary,
        } : undefined,
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

      // Capture learning signal if rubric provided
      if (learningService && validated.rubric) {
        const skill = await executionEngine.getExecution(validated.executionId);
        const skillVersion = skill?.skillExecutions.find(s => s.skillId === validated.skillId)?.skillVersion || '1.0.0';

        learningService.captureSkillSignal(
          validated.executionId,
          execution.currentPhase as Phase,
          {
            skillId: validated.skillId,
            skillVersion,
            rubric: validated.rubric as SkillRubric,
            sectionRecommendations: (validated.sectionRecommendations || []) as SectionRecommendation[],
          }
        );
      }

      // Build rubric display for response
      const rubricDisplay = validated.rubric
        ? `\n  Rubric: C=${validated.rubric.completeness} Q=${validated.rubric.quality} F=${validated.rubric.friction} R=${validated.rubric.relevance}`
        : '';
      const sectionNotes = validated.sectionRecommendations?.length
        ? `\n  Section notes: ${validated.sectionRecommendations.length}`
        : '';

      return {
        id: execution.id,
        skillId: validated.skillId,
        rubric: validated.rubric,
        sectionRecommendations: validated.sectionRecommendations,
        message: `Skill ${validated.skillId} completed${rubricDisplay}${sectionNotes}`,
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

      // Track gate attempts before approval
      const executionBefore = executionEngine.getExecution(validated.executionId);
      const gateBefore = executionBefore?.gates.find(g => g.gateId === validated.gateId);
      const attempts = gateBefore?.status === 'rejected' ? 2 : 1; // Simple attempt tracking

      const execution = await executionEngine.approveGate(
        validated.executionId,
        validated.gateId,
        validated.approvedBy
      );

      // Record gate outcome for learning
      if (learningService) {
        learningService.recordGateOutcome(validated.executionId, validated.gateId, 'passed', attempts);
      }

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

      // Record gate outcome for learning
      if (learningService) {
        learningService.recordGateOutcome(validated.executionId, validated.gateId, 'failed', 1);
      }

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

    // Learning System Handlers
    complete_run_tracking: async (params: unknown) => {
      if (!learningService) {
        throw new Error('Learning service not available');
      }

      const validated = CompleteRunTrackingSchema.parse(params);
      const result = await learningService.completeRunTracking(validated.executionId);

      return {
        runId: result.runId,
        newProposals: result.newProposals.length,
        summary: result.summary,
        proposals: result.newProposals.map(p => ({
          id: p.id,
          skill: p.skill,
          changes: p.changes.map(c => `${c.type}: ${c.section}`),
        })),
      };
    },

    list_upgrade_proposals: async (params: unknown) => {
      if (!learningService) {
        throw new Error('Learning service not available');
      }

      const validated = ListUpgradeProposalsSchema.parse(params);
      const proposals = learningService.listUpgradeProposals({
        skill: validated.skill,
        status: validated.status,
      });

      return {
        count: proposals.length,
        proposals: proposals.map(p => ({
          id: p.id,
          skill: p.skill,
          currentVersion: p.currentVersion,
          proposedVersion: p.proposedVersion,
          status: p.status,
          createdAt: p.createdAt,
          changes: p.changes.map(c => ({
            type: c.type,
            section: c.section,
            reason: c.reason,
          })),
          evidenceCount: p.evidence.length,
        })),
      };
    },

    get_learning_summary: async () => {
      if (!learningService) {
        throw new Error('Learning service not available');
      }

      const summary = await learningService.getLearningSummary();

      return {
        runSignals: summary.runSignals,
        upgradeProposals: summary.upgradeProposals,
        pendingProposals: summary.pendingProposals.map(p => ({
          id: p.id,
          skill: p.skill,
          changes: p.changes.length,
        })),
        recentRuns: summary.recentRuns.length,
      };
    },

    approve_upgrade_proposal: async (params: unknown) => {
      if (!learningService) {
        throw new Error('Learning service not available');
      }

      const validated = ApproveUpgradeProposalSchema.parse(params);
      const result = await learningService.approveUpgradeProposal(
        validated.proposalId,
        validated.approvedBy
      );

      return {
        proposalId: result.proposal.id,
        skill: result.proposal.skill,
        newVersion: result.skill.version,
        changes: result.proposal.changes.map(c => `${c.type}: ${c.section}`),
        message: `Skill ${result.proposal.skill} upgraded to v${result.skill.version}`,
      };
    },

    reject_upgrade_proposal: async (params: unknown) => {
      if (!learningService) {
        throw new Error('Learning service not available');
      }

      const validated = RejectUpgradeProposalSchema.parse(params);
      const proposal = await learningService.rejectUpgradeProposal(
        validated.proposalId,
        validated.reason
      );

      return {
        proposalId: proposal.id,
        skill: proposal.skill,
        status: proposal.status,
        message: `Proposal ${proposal.id} rejected: ${validated.reason}`,
      };
    },
  };
}
