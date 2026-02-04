/**
 * MCP Tool definitions for memory, learning, and calibration operations
 */

import { z } from 'zod';
import type { MemoryService } from '../services/MemoryService.js';
import type { LearningService } from '../services/LearningService.js';
import type { CalibrationService, Estimate } from '../services/CalibrationService.js';
import type { MemoryLevel, Phase, LoopMode, ImprovementCategory } from '../types.js';

// Zod schemas
const MemoryLevelSchema = z.enum(['orchestrator', 'loop', 'skill']);
const PhaseSchema = z.enum([
  'INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY',
  'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'
]);
const LoopModeSchema = z.enum(['greenfield', 'brownfield-polish', 'brownfield-enterprise']);

const GetMemorySchema = z.object({
  level: MemoryLevelSchema,
  entityId: z.string().optional(),
});

const UpdateSummarySchema = z.object({
  level: MemoryLevelSchema,
  entityId: z.string().optional(),
  summary: z.string().min(1),
});

const RecordDecisionSchema = z.object({
  level: MemoryLevelSchema,
  entityId: z.string().optional(),
  title: z.string().min(1),
  context: z.string().min(1),
  decision: z.string().min(1),
  consequences: z.string().min(1),
  supersedes: z.string().optional(),
});

const RecordPatternSchema = z.object({
  level: MemoryLevelSchema,
  entityId: z.string().optional(),
  name: z.string().min(1),
  context: z.string().min(1),
  solution: z.string().min(1),
  example: z.string().optional(),
});

const CreateHandoffSchema = z.object({
  level: MemoryLevelSchema,
  entityId: z.string().optional(),
  summary: z.string().min(1),
  completed: z.array(z.string()),
  inProgress: z.array(z.string()),
  blocked: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()),
  openQuestions: z.array(z.string()).optional(),
});

const LoadContextSchema = z.object({
  level: MemoryLevelSchema,
  entityId: z.string().optional(),
});

// Learning schemas
const CaptureImprovementSchema = z.object({
  skillId: z.string().min(1),
  feedback: z.string().min(1),
  source: z.string().optional(),
  category: z.enum(['bug', 'enhancement', 'clarification', 'new-feature']).optional(),
});

const ListProposalsSchema = z.object({
  skillId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'applied']).optional(),
  category: z.enum(['bug', 'enhancement', 'clarification', 'new-feature']).optional(),
});

const ApplyProposalSchema = z.object({
  proposalId: z.string().min(1),
  content: z.string().optional(),
  description: z.string().optional(),
  versionBump: z.enum(['patch', 'minor', 'major']).default('patch'),
});

const ProposalActionSchema = z.object({
  proposalId: z.string().min(1),
  reason: z.string().optional(),
});

const GetMetricsSchema = z.object({
  skillId: z.string().optional(),
});

// Calibration schemas
const GetCalibratedEstimateSchema = z.object({
  hours: z.number().positive(),
  complexity: z.enum(['trivial', 'simple', 'moderate', 'complex', 'epic']),
  confidence: z.number().min(0).max(1).optional(),
  level: MemoryLevelSchema.optional(),
  entityId: z.string().optional(),
  mode: LoopModeSchema.optional(),
  phase: PhaseSchema.optional(),
  skillId: z.string().optional(),
});

const RecordEstimateResultSchema = z.object({
  hours: z.number().positive(),
  complexity: z.enum(['trivial', 'simple', 'moderate', 'complex', 'epic']),
  actualHours: z.number().positive(),
  level: MemoryLevelSchema.optional(),
  entityId: z.string().optional(),
  mode: LoopModeSchema.optional(),
  phase: PhaseSchema.optional(),
  skillId: z.string().optional(),
});

const CalibrationReportSchema = z.object({
  level: MemoryLevelSchema.optional(),
  entityId: z.string().optional(),
});

/**
 * Memory and learning tool definitions
 */
export const memoryToolDefinitions = [
  // Memory tools
  {
    name: 'get_memory',
    description: 'Get memory content at orchestrator, loop, or skill level',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['orchestrator', 'loop', 'skill'],
          description: 'Memory level',
        },
        entityId: {
          type: 'string',
          description: 'Loop or skill ID (required for loop/skill level)',
        },
      },
      required: ['level'],
    },
  },
  {
    name: 'update_summary',
    description: 'Update the summary for a memory level',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['orchestrator', 'loop', 'skill'],
          description: 'Memory level',
        },
        entityId: {
          type: 'string',
          description: 'Loop or skill ID',
        },
        summary: {
          type: 'string',
          description: 'New summary text',
        },
      },
      required: ['level', 'summary'],
    },
  },
  {
    name: 'record_decision',
    description: 'Record an Architecture Decision Record (ADR)',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['orchestrator', 'loop', 'skill'],
          description: 'Memory level',
        },
        entityId: {
          type: 'string',
          description: 'Loop or skill ID',
        },
        title: {
          type: 'string',
          description: 'Decision title',
        },
        context: {
          type: 'string',
          description: 'Why this decision was needed',
        },
        decision: {
          type: 'string',
          description: 'What was decided',
        },
        consequences: {
          type: 'string',
          description: 'Expected outcomes',
        },
        supersedes: {
          type: 'string',
          description: 'ID of decision this replaces',
        },
      },
      required: ['level', 'title', 'context', 'decision', 'consequences'],
    },
  },
  {
    name: 'record_pattern',
    description: 'Record a learned pattern',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['orchestrator', 'loop', 'skill'],
          description: 'Memory level',
        },
        entityId: {
          type: 'string',
          description: 'Loop or skill ID',
        },
        name: {
          type: 'string',
          description: 'Pattern name',
        },
        context: {
          type: 'string',
          description: 'When to use this pattern',
        },
        solution: {
          type: 'string',
          description: 'How to apply the pattern',
        },
        example: {
          type: 'string',
          description: 'Example usage',
        },
      },
      required: ['level', 'name', 'context', 'solution'],
    },
  },
  {
    name: 'create_handoff',
    description: 'Create a session handoff for continuity',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['orchestrator', 'loop', 'skill'],
          description: 'Memory level',
        },
        entityId: {
          type: 'string',
          description: 'Loop or skill ID',
        },
        summary: {
          type: 'string',
          description: 'Session summary',
        },
        completed: {
          type: 'array',
          items: { type: 'string' },
          description: 'Completed items',
        },
        inProgress: {
          type: 'array',
          items: { type: 'string' },
          description: 'In-progress items',
        },
        blocked: {
          type: 'array',
          items: { type: 'string' },
          description: 'Blocked items',
        },
        nextSteps: {
          type: 'array',
          items: { type: 'string' },
          description: 'Recommended next steps',
        },
        openQuestions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Unresolved questions',
        },
      },
      required: ['level', 'summary', 'completed', 'inProgress', 'nextSteps'],
    },
  },
  {
    name: 'load_context',
    description: 'Load context for cold boot (recent decisions, patterns, handoff)',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['orchestrator', 'loop', 'skill'],
          description: 'Memory level',
        },
        entityId: {
          type: 'string',
          description: 'Loop or skill ID',
        },
      },
      required: ['level'],
    },
  },

  // Learning tools
  {
    name: 'capture_skill_improvement',
    description: 'Capture improvement feedback for a skill (creates a proposal)',
    inputSchema: {
      type: 'object',
      properties: {
        skillId: {
          type: 'string',
          description: 'Skill to improve',
        },
        feedback: {
          type: 'string',
          description: 'Improvement feedback',
        },
        source: {
          type: 'string',
          description: 'Context (e.g., "project-x IMPLEMENT phase")',
        },
        category: {
          type: 'string',
          enum: ['bug', 'enhancement', 'clarification', 'new-feature'],
          description: 'Type of improvement',
        },
      },
      required: ['skillId', 'feedback'],
    },
  },
  {
    name: 'list_proposals',
    description: 'List improvement proposals',
    inputSchema: {
      type: 'object',
      properties: {
        skillId: {
          type: 'string',
          description: 'Filter by skill',
        },
        status: {
          type: 'string',
          enum: ['pending', 'approved', 'rejected', 'applied'],
          description: 'Filter by status',
        },
        category: {
          type: 'string',
          enum: ['bug', 'enhancement', 'clarification', 'new-feature'],
          description: 'Filter by category',
        },
      },
    },
  },
  {
    name: 'apply_proposal',
    description: 'Apply an improvement proposal to a skill',
    inputSchema: {
      type: 'object',
      properties: {
        proposalId: {
          type: 'string',
          description: 'Proposal ID',
        },
        content: {
          type: 'string',
          description: 'New skill content',
        },
        description: {
          type: 'string',
          description: 'Updated description',
        },
        versionBump: {
          type: 'string',
          enum: ['patch', 'minor', 'major'],
          description: 'Version bump type (defaults to patch)',
        },
      },
      required: ['proposalId'],
    },
  },
  {
    name: 'approve_proposal',
    description: 'Approve a proposal for later application',
    inputSchema: {
      type: 'object',
      properties: {
        proposalId: {
          type: 'string',
          description: 'Proposal ID',
        },
      },
      required: ['proposalId'],
    },
  },
  {
    name: 'reject_proposal',
    description: 'Reject an improvement proposal',
    inputSchema: {
      type: 'object',
      properties: {
        proposalId: {
          type: 'string',
          description: 'Proposal ID',
        },
        reason: {
          type: 'string',
          description: 'Rejection reason',
        },
      },
      required: ['proposalId'],
    },
  },
  {
    name: 'get_skill_metrics',
    description: 'Get execution metrics for a skill or all skills',
    inputSchema: {
      type: 'object',
      properties: {
        skillId: {
          type: 'string',
          description: 'Skill ID (omit for all)',
        },
      },
    },
  },
  {
    name: 'get_learning_status',
    description: 'Get overall learning system status',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'identify_underutilized_skills',
    description: 'Find skills that may need pruning or improvement',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // Calibration tools
  {
    name: 'get_calibrated_estimate',
    description: 'Get a calibrated time estimate based on historical data',
    inputSchema: {
      type: 'object',
      properties: {
        hours: {
          type: 'number',
          description: 'Initial estimate in hours',
        },
        complexity: {
          type: 'string',
          enum: ['trivial', 'simple', 'moderate', 'complex', 'epic'],
          description: 'Task complexity',
        },
        confidence: {
          type: 'number',
          description: 'Confidence in estimate (0-1)',
        },
        level: {
          type: 'string',
          enum: ['orchestrator', 'loop', 'skill'],
          description: 'Calibration level',
        },
        entityId: {
          type: 'string',
          description: 'Loop or skill ID',
        },
        mode: {
          type: 'string',
          enum: ['greenfield', 'brownfield-polish', 'brownfield-enterprise'],
          description: 'Loop mode',
        },
        phase: {
          type: 'string',
          enum: ['INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY', 'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'],
          description: 'Execution phase',
        },
        skillId: {
          type: 'string',
          description: 'Skill being executed',
        },
      },
      required: ['hours', 'complexity'],
    },
  },
  {
    name: 'record_estimate_result',
    description: 'Record actual time for a task (updates calibration)',
    inputSchema: {
      type: 'object',
      properties: {
        hours: {
          type: 'number',
          description: 'Original estimate in hours',
        },
        complexity: {
          type: 'string',
          enum: ['trivial', 'simple', 'moderate', 'complex', 'epic'],
          description: 'Task complexity',
        },
        actualHours: {
          type: 'number',
          description: 'Actual time taken',
        },
        level: {
          type: 'string',
          enum: ['orchestrator', 'loop', 'skill'],
          description: 'Calibration level',
        },
        entityId: {
          type: 'string',
          description: 'Loop or skill ID',
        },
        mode: {
          type: 'string',
          enum: ['greenfield', 'brownfield-polish', 'brownfield-enterprise'],
          description: 'Loop mode',
        },
        phase: {
          type: 'string',
          enum: ['INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY', 'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'],
          description: 'Execution phase',
        },
        skillId: {
          type: 'string',
          description: 'Skill being executed',
        },
      },
      required: ['hours', 'complexity', 'actualHours'],
    },
  },
  {
    name: 'get_calibration_report',
    description: 'Get detailed calibration statistics and recommendations',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['orchestrator', 'loop', 'skill'],
          description: 'Calibration level',
        },
        entityId: {
          type: 'string',
          description: 'Loop or skill ID',
        },
      },
    },
  },
  {
    name: 'get_calibration_recommendations',
    description: 'Get recommendations for improving estimation accuracy',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['orchestrator', 'loop', 'skill'],
          description: 'Calibration level',
        },
        entityId: {
          type: 'string',
          description: 'Loop or skill ID',
        },
      },
    },
  },
];

/**
 * Create memory, learning, and calibration tool handlers
 */
export function createMemoryToolHandlers(
  memoryService: MemoryService,
  learningService: LearningService,
  calibrationService: CalibrationService
) {
  return {
    // Memory handlers
    get_memory: async (params: unknown) => {
      const validated = GetMemorySchema.parse(params);
      const memory = await memoryService.getOrCreateMemory(
        validated.level as MemoryLevel,
        validated.entityId
      );
      return {
        id: memory.id,
        level: memory.level,
        summary: memory.summary,
        decisionCount: memory.decisions.length,
        patternCount: memory.patterns.length,
        hasHandoff: !!memory.handoff,
        createdAt: memory.createdAt,
        updatedAt: memory.updatedAt,
      };
    },

    update_summary: async (params: unknown) => {
      const validated = UpdateSummarySchema.parse(params);
      const memory = await memoryService.updateSummary(
        validated.level as MemoryLevel,
        validated.entityId,
        validated.summary
      );
      return {
        id: memory.id,
        message: 'Summary updated',
      };
    },

    record_decision: async (params: unknown) => {
      const validated = RecordDecisionSchema.parse(params);
      const decision = await memoryService.recordDecision(
        validated.level as MemoryLevel,
        validated.entityId,
        {
          title: validated.title,
          context: validated.context,
          decision: validated.decision,
          consequences: validated.consequences,
          supersedes: validated.supersedes,
        }
      );
      return {
        id: decision.id,
        title: decision.title,
        message: `Decision ${decision.id} recorded`,
      };
    },

    record_pattern: async (params: unknown) => {
      const validated = RecordPatternSchema.parse(params);
      const pattern = await memoryService.recordPattern(
        validated.level as MemoryLevel,
        validated.entityId,
        {
          name: validated.name,
          context: validated.context,
          solution: validated.solution,
          example: validated.example,
          confidence: 'low',
        }
      );
      return {
        id: pattern.id,
        name: pattern.name,
        uses: pattern.uses,
        confidence: pattern.confidence,
        message: pattern.uses > 1
          ? `Pattern '${pattern.name}' used ${pattern.uses} times (confidence: ${pattern.confidence})`
          : `Pattern '${pattern.name}' recorded`,
      };
    },

    create_handoff: async (params: unknown) => {
      const validated = CreateHandoffSchema.parse(params);
      const handoff = await memoryService.createHandoff(
        validated.level as MemoryLevel,
        validated.entityId,
        {
          summary: validated.summary,
          completed: validated.completed,
          inProgress: validated.inProgress,
          blocked: validated.blocked || [],
          nextSteps: validated.nextSteps,
          openQuestions: validated.openQuestions || [],
        }
      );
      return {
        id: handoff.id,
        sessionDate: handoff.sessionDate,
        message: `Handoff ${handoff.id} created`,
      };
    },

    load_context: async (params: unknown) => {
      const validated = LoadContextSchema.parse(params);
      const context = await memoryService.loadContext(
        validated.level as MemoryLevel,
        validated.entityId
      );
      return {
        summary: context.summary,
        recentDecisions: context.recentDecisions.map(d => ({
          id: d.id,
          title: d.title,
          decision: d.decision,
        })),
        topPatterns: context.topPatterns.map(p => ({
          name: p.name,
          context: p.context,
          confidence: p.confidence,
        })),
        handoff: context.handoff ? {
          id: context.handoff.id,
          summary: context.handoff.summary,
          nextSteps: context.handoff.nextSteps,
        } : null,
        calibrationMultiplier: context.calibration.adjustments.global.multiplier,
      };
    },

    // Learning handlers
    capture_skill_improvement: async (params: unknown) => {
      const validated = CaptureImprovementSchema.parse(params);
      const proposal = await learningService.captureImprovement({
        skillId: validated.skillId,
        feedback: validated.feedback,
        source: validated.source || 'manual',
        category: (validated.category as ImprovementCategory) || 'enhancement',
      });
      return {
        id: proposal.id,
        skillId: proposal.skillId,
        title: proposal.title,
        status: proposal.status,
        message: `Improvement proposal ${proposal.id} created`,
      };
    },

    list_proposals: async (params: unknown) => {
      const validated = ListProposalsSchema.parse(params);
      const proposals = learningService.listProposals({
        skillId: validated.skillId,
        status: validated.status,
        category: validated.category as ImprovementCategory,
      });
      return {
        proposals: proposals.map(p => ({
          id: p.id,
          skillId: p.skillId,
          title: p.title,
          category: p.category,
          status: p.status,
          confidence: p.confidence,
          createdAt: p.createdAt,
        })),
        total: proposals.length,
      };
    },

    apply_proposal: async (params: unknown) => {
      const validated = ApplyProposalSchema.parse(params);
      const result = await learningService.applyProposal(validated.proposalId, {
        content: validated.content,
        description: validated.description,
        versionBump: validated.versionBump,
      });
      return {
        proposalId: result.proposal.id,
        skillId: result.skill.id,
        newVersion: result.skill.version,
        message: `Proposal applied, skill updated to v${result.skill.version}`,
      };
    },

    approve_proposal: async (params: unknown) => {
      const validated = ProposalActionSchema.parse(params);
      const proposal = await learningService.approveProposal(validated.proposalId);
      return {
        id: proposal.id,
        status: proposal.status,
        message: `Proposal ${proposal.id} approved`,
      };
    },

    reject_proposal: async (params: unknown) => {
      const validated = ProposalActionSchema.parse(params);
      const proposal = await learningService.rejectProposal(
        validated.proposalId,
        validated.reason
      );
      return {
        id: proposal.id,
        status: proposal.status,
        message: `Proposal ${proposal.id} rejected`,
      };
    },

    get_skill_metrics: async (params: unknown) => {
      const validated = GetMetricsSchema.parse(params);
      if (validated.skillId) {
        const metrics = learningService.getSkillMetrics(validated.skillId);
        if (!metrics) {
          return { message: `No metrics found for skill: ${validated.skillId}` };
        }
        return metrics;
      }
      return {
        metrics: learningService.getAllMetrics(),
      };
    },

    get_learning_status: async () => {
      return learningService.getLearningStatus();
    },

    identify_underutilized_skills: async () => {
      return {
        skills: learningService.identifyUnderutilizedSkills(),
      };
    },

    // Calibration handlers
    get_calibrated_estimate: async (params: unknown) => {
      const validated = GetCalibratedEstimateSchema.parse(params);
      const estimate: Estimate = {
        hours: validated.hours,
        complexity: validated.complexity,
        confidence: validated.confidence,
      };
      const result = await calibrationService.getCalibratedEstimate({
        estimate,
        level: validated.level as MemoryLevel,
        entityId: validated.entityId,
        mode: validated.mode as LoopMode,
        phase: validated.phase as Phase,
        skillId: validated.skillId,
      });
      return {
        original: `${result.original.hours}h`,
        calibrated: `${result.calibrated.hours.toFixed(1)}h`,
        range: `${result.calibrated.range.low.toFixed(1)}h - ${result.calibrated.range.high.toFixed(1)}h`,
        multipliers: result.multipliers,
        confidence: result.confidence,
        basedOnSamples: result.basedOnSamples,
      };
    },

    record_estimate_result: async (params: unknown) => {
      const validated = RecordEstimateResultSchema.parse(params);
      const estimate: Estimate = {
        hours: validated.hours,
        complexity: validated.complexity,
      };
      const calibration = await calibrationService.recordEstimateResult({
        estimate,
        actualHours: validated.actualHours,
        level: validated.level as MemoryLevel,
        entityId: validated.entityId,
        mode: validated.mode as LoopMode,
        phase: validated.phase as Phase,
        skillId: validated.skillId,
      });
      const ratio = validated.actualHours / validated.hours;
      return {
        estimated: `${validated.hours}h`,
        actual: `${validated.actualHours}h`,
        ratio: ratio.toFixed(2),
        newMultiplier: calibration.adjustments.global.multiplier.toFixed(2),
        samples: calibration.adjustments.global.samples,
        message: ratio > 1.2
          ? 'Task took longer than estimated - calibration updated'
          : ratio < 0.8
          ? 'Task completed faster than estimated - calibration updated'
          : 'Estimate was accurate - calibration confirmed',
      };
    },

    get_calibration_report: async (params: unknown) => {
      const validated = CalibrationReportSchema.parse(params);
      return calibrationService.getCalibrationReport(
        validated.level as MemoryLevel,
        validated.entityId
      );
    },

    get_calibration_recommendations: async (params: unknown) => {
      const validated = CalibrationReportSchema.parse(params);
      const recommendations = await calibrationService.getRecommendations(
        validated.level as MemoryLevel,
        validated.entityId
      );
      return { recommendations };
    },
  };
}
