/**
 * KnoPilot MCP Tools
 *
 * MCP tool definitions and handlers for the KnoPilot sales intelligence system.
 */

import { z } from 'zod';
import type { KnoPilotService } from '../services/knopilot/KnoPilotService.js';
import type {
  DealStage,
  CommunicationType,
  StakeholderRole,
  StakeholderSentiment,
} from '../services/knopilot/types.js';

// ============================================================================
// Zod Schemas
// ============================================================================

const DealStageSchema = z.enum(['lead', 'target', 'discovery', 'contracting', 'production']);
const CommunicationTypeSchema = z.enum(['email', 'meeting', 'call', 'note']);
const StakeholderRoleSchema = z.enum(['champion', 'decision-maker', 'influencer', 'blocker']);
const StakeholderSentimentSchema = z.enum(['supportive', 'neutral', 'skeptical']);

const CreateDealSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  industry: z.string().optional(),
  stage: DealStageSchema.optional(),
  value: z.number().optional(),
});

const GetDealSchema = z.object({
  dealId: z.string().min(1),
});

const ListDealsSchema = z.object({
  stage: DealStageSchema.optional(),
  company: z.string().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  search: z.string().optional(),
});

const UpdateDealSchema = z.object({
  dealId: z.string().min(1),
  name: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
  value: z.number().optional(),
});

const AdvanceStageSchema = z.object({
  dealId: z.string().min(1),
  reason: z.string().optional(),
});

const AddCommunicationSchema = z.object({
  dealId: z.string().min(1),
  type: CommunicationTypeSchema,
  subject: z.string().optional(),
  content: z.string().min(1),
  participants: z.array(z.string()).optional(),
  timestamp: z.string().optional(),
});

const ProcessCommunicationSchema = z.object({
  dealId: z.string().min(1),
  communicationId: z.string().min(1),
});

const AddStakeholderSchema = z.object({
  dealId: z.string().min(1),
  name: z.string().min(1),
  title: z.string().min(1),
  email: z.string().optional(),
  role: StakeholderRoleSchema,
  sentiment: StakeholderSentimentSchema.optional(),
});

const UpdateStakeholderSchema = z.object({
  dealId: z.string().min(1),
  stakeholderId: z.string().min(1),
  name: z.string().optional(),
  title: z.string().optional(),
  email: z.string().optional(),
  role: StakeholderRoleSchema.optional(),
  sentiment: StakeholderSentimentSchema.optional(),
});

const DealIdSchema = z.object({
  dealId: z.string().min(1),
});

// ============================================================================
// Tool Definitions
// ============================================================================

export const knopilotToolDefinitions = [
  {
    name: 'knopilot_create_deal',
    description: 'Creating deal — adds new deal to KnoPilot sales intelligence',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Deal name' },
        company: { type: 'string', description: 'Company name' },
        industry: { type: 'string', description: 'Industry (optional)' },
        stage: {
          type: 'string',
          enum: ['lead', 'target', 'discovery', 'contracting', 'production'],
          description: 'Initial stage (default: lead)',
        },
        value: { type: 'number', description: 'Deal value in dollars (optional)' },
      },
      required: ['name', 'company'],
    },
  },
  {
    name: 'knopilot_get_deal',
    description: 'Loading deal — retrieves full view with stakeholders, scores, NBA, and intelligence',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'string', description: 'Deal ID' },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'knopilot_list_deals',
    description: 'Listing deals — filters by stage, status, or priority',
    inputSchema: {
      type: 'object',
      properties: {
        stage: {
          type: 'string',
          enum: ['lead', 'target', 'discovery', 'contracting', 'production'],
          description: 'Filter by stage',
        },
        company: { type: 'string', description: 'Filter by company name' },
        minValue: { type: 'number', description: 'Minimum deal value' },
        maxValue: { type: 'number', description: 'Maximum deal value' },
        search: { type: 'string', description: 'Search query' },
      },
    },
  },
  {
    name: 'knopilot_update_deal',
    description: 'Updating deal — modifies deal properties',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'string', description: 'Deal ID' },
        name: { type: 'string', description: 'New deal name' },
        company: { type: 'string', description: 'New company name' },
        industry: { type: 'string', description: 'New industry' },
        value: { type: 'number', description: 'New deal value' },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'knopilot_advance_stage',
    description: 'Advancing deal — moves to next pipeline stage',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'string', description: 'Deal ID' },
        reason: { type: 'string', description: 'Reason for stage advancement' },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'knopilot_add_communication',
    description: 'Adding communication — records email, meeting, call, or note for deal',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'string', description: 'Deal ID' },
        type: {
          type: 'string',
          enum: ['email', 'meeting', 'call', 'note'],
          description: 'Communication type',
        },
        subject: { type: 'string', description: 'Subject line' },
        content: { type: 'string', description: 'Full communication content' },
        participants: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of participants',
        },
        timestamp: { type: 'string', description: 'ISO timestamp (defaults to now)' },
      },
      required: ['dealId', 'type', 'content'],
    },
  },
  {
    name: 'knopilot_process_communication',
    description: 'Processing communication — extracts intelligence and updates scores',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'string', description: 'Deal ID' },
        communicationId: { type: 'string', description: 'Communication ID to process' },
      },
      required: ['dealId', 'communicationId'],
    },
  },
  {
    name: 'knopilot_add_stakeholder',
    description: 'Adding stakeholder — registers contact for deal',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'string', description: 'Deal ID' },
        name: { type: 'string', description: 'Stakeholder name' },
        title: { type: 'string', description: 'Job title' },
        email: { type: 'string', description: 'Email address' },
        role: {
          type: 'string',
          enum: ['champion', 'decision-maker', 'influencer', 'blocker'],
          description: 'Stakeholder role',
        },
        sentiment: {
          type: 'string',
          enum: ['supportive', 'neutral', 'skeptical'],
          description: 'Current sentiment (default: neutral)',
        },
      },
      required: ['dealId', 'name', 'title', 'role'],
    },
  },
  {
    name: 'knopilot_update_stakeholder',
    description: 'Updating stakeholder — modifies contact details',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'string', description: 'Deal ID' },
        stakeholderId: { type: 'string', description: 'Stakeholder ID' },
        name: { type: 'string', description: 'New name' },
        title: { type: 'string', description: 'New title' },
        email: { type: 'string', description: 'New email' },
        role: {
          type: 'string',
          enum: ['champion', 'decision-maker', 'influencer', 'blocker'],
          description: 'New role',
        },
        sentiment: {
          type: 'string',
          enum: ['supportive', 'neutral', 'skeptical'],
          description: 'New sentiment',
        },
      },
      required: ['dealId', 'stakeholderId'],
    },
  },
  {
    name: 'knopilot_get_intelligence',
    description: 'Loading deal intelligence — retrieves pain points, AI maturity, budget, and competitive data',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'string', description: 'Deal ID' },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'knopilot_compute_scores',
    description: 'Recomputing deal scores — recalculates AI Readiness and Deal Confidence',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'string', description: 'Deal ID' },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'knopilot_generate_nba',
    description: 'Generating next best actions — recommends actions based on stage and scores',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'string', description: 'Deal ID' },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'knopilot_get_pipeline',
    description: 'Loading pipeline summary — retrieves metrics, priorities, and stage distribution',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'knopilot_get_weekly_focus',
    description: 'Loading weekly focus — retrieves top 5 actions based on NBA scores',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'knopilot_list_communications',
    description: 'Listing deal communications — retrieves message history',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'string', description: 'Deal ID' },
      },
      required: ['dealId'],
    },
  },
  {
    name: 'knopilot_list_stakeholders',
    description: 'Listing deal stakeholders — retrieves contact list',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: { type: 'string', description: 'Deal ID' },
      },
      required: ['dealId'],
    },
  },
];

// ============================================================================
// Tool Handlers
// ============================================================================

export function createKnoPilotToolHandlers(service: KnoPilotService) {
  return {
    knopilot_create_deal: async (params: unknown) => {
      const validated = CreateDealSchema.parse(params);
      const deal = await service.createDeal({
        name: validated.name,
        company: validated.company,
        industry: validated.industry,
        stage: validated.stage as DealStage | undefined,
        value: validated.value,
      });
      return {
        deal,
        message: `Created deal '${deal.name}' (${deal.id}) at stage ${deal.stage}`,
      };
    },

    knopilot_get_deal: async (params: unknown) => {
      const validated = GetDealSchema.parse(params);
      const dealView = await service.getDeal(validated.dealId);
      if (!dealView) {
        throw new Error(`Deal not found: ${validated.dealId}`);
      }
      return dealView;
    },

    knopilot_list_deals: async (params: unknown) => {
      const validated = ListDealsSchema.parse(params);
      const deals = await service.listDeals({
        stage: validated.stage as DealStage | undefined,
        company: validated.company,
        minValue: validated.minValue,
        maxValue: validated.maxValue,
        search: validated.search,
      });
      return {
        count: deals.length,
        deals,
      };
    },

    knopilot_update_deal: async (params: unknown) => {
      const validated = UpdateDealSchema.parse(params);
      const { dealId, ...update } = validated;
      const deal = await service.updateDeal(dealId, update);
      return {
        deal,
        message: `Updated deal '${deal.name}'`,
      };
    },

    knopilot_advance_stage: async (params: unknown) => {
      const validated = AdvanceStageSchema.parse(params);
      const deal = await service.advanceStage(validated.dealId, validated.reason);
      return {
        deal,
        message: `Advanced deal to stage: ${deal.stage}`,
      };
    },

    knopilot_add_communication: async (params: unknown) => {
      const validated = AddCommunicationSchema.parse(params);
      const { dealId, ...input } = validated;
      const comm = await service.addCommunication(dealId, {
        type: input.type as CommunicationType,
        subject: input.subject,
        content: input.content,
        participants: input.participants,
        timestamp: input.timestamp,
      });
      return {
        communication: comm,
        message: `Added ${comm.type} communication (${comm.id})`,
      };
    },

    knopilot_process_communication: async (params: unknown) => {
      const validated = ProcessCommunicationSchema.parse(params);
      await service.processCommunication(validated.dealId, validated.communicationId);
      return {
        message: `Processed communication ${validated.communicationId} — intelligence extracted, scores updated, NBA regenerated`,
      };
    },

    knopilot_add_stakeholder: async (params: unknown) => {
      const validated = AddStakeholderSchema.parse(params);
      const { dealId, ...input } = validated;
      const stakeholder = await service.addStakeholder(dealId, {
        name: input.name,
        title: input.title,
        email: input.email,
        role: input.role as StakeholderRole,
        sentiment: input.sentiment as StakeholderSentiment | undefined,
      });
      return {
        stakeholder,
        message: `Added stakeholder '${stakeholder.name}' as ${stakeholder.role}`,
      };
    },

    knopilot_update_stakeholder: async (params: unknown) => {
      const validated = UpdateStakeholderSchema.parse(params);
      const { dealId, stakeholderId, ...update } = validated;
      const stakeholder = await service.updateStakeholder(dealId, stakeholderId, {
        name: update.name,
        title: update.title,
        email: update.email,
        role: update.role as StakeholderRole | undefined,
        sentiment: update.sentiment as StakeholderSentiment | undefined,
      });
      return {
        stakeholder,
        message: `Updated stakeholder '${stakeholder.name}'`,
      };
    },

    knopilot_get_intelligence: async (params: unknown) => {
      const validated = DealIdSchema.parse(params);
      const intelligence = await service.getIntelligence(validated.dealId);
      return intelligence;
    },

    knopilot_compute_scores: async (params: unknown) => {
      const validated = DealIdSchema.parse(params);
      const scores = await service.computeScores(validated.dealId);
      return {
        scores,
        message: `AI Readiness: ${scores.aiReadinessScore}/100, Deal Confidence: ${scores.dealConfidence}%`,
      };
    },

    knopilot_generate_nba: async (params: unknown) => {
      const validated = DealIdSchema.parse(params);
      const nba = await service.generateNBA(validated.dealId);
      return {
        nba,
        topAction: nba.actions.length > 0 ? nba.actions[0].action : 'No actions generated',
        riskCount: nba.risks.length,
      };
    },

    knopilot_get_pipeline: async () => {
      const summary = await service.getPipelineSummary();
      return summary;
    },

    knopilot_get_weekly_focus: async () => {
      const focus = await service.getWeeklyFocus();
      return focus;
    },

    knopilot_list_communications: async (params: unknown) => {
      const validated = DealIdSchema.parse(params);
      const communications = await service.listCommunications(validated.dealId);
      return {
        count: communications.length,
        communications,
      };
    },

    knopilot_list_stakeholders: async (params: unknown) => {
      const validated = DealIdSchema.parse(params);
      const stakeholders = await service.listStakeholders(validated.dealId);
      return {
        count: stakeholders.length,
        stakeholders,
      };
    },
  };
}
