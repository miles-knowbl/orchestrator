/**
 * Inbox MCP Tool Handlers
 *
 * Tools for managing the second brain inbox - harvesting skills from external resources.
 */

import { z } from 'zod';
import type { InboxProcessor } from '../services/InboxProcessor.js';
import type { InboxSource } from '../types.js';

// Zod schemas for validation
const AddToInboxSchema = z.object({
  content: z.string().min(1),
  sourceType: z.enum(['paste', 'conversation', 'file']),
  sourceName: z.string().min(1),
});

const AddUrlToInboxSchema = z.object({
  url: z.string().url(),
});

const ListInboxSchema = z.object({
  status: z.enum(['pending', 'processing', 'extracted', 'rejected']).optional(),
  sourceType: z.enum(['url', 'file', 'paste', 'conversation']).optional(),
});

const GetInboxItemSchema = z.object({
  id: z.string().min(1),
});

const ProcessInboxItemSchema = z.object({
  id: z.string().min(1),
});

const ApproveExtractionSchema = z.object({
  itemId: z.string().min(1),
  skillIndex: z.number().min(0),
  modifications: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    phase: z.enum([
      'INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY',
      'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'
    ]).optional(),
  }).optional(),
});

const RejectExtractionSchema = z.object({
  itemId: z.string().min(1),
  skillIndex: z.number().min(0),
  reason: z.string().optional(),
});

const RejectInboxItemSchema = z.object({
  id: z.string().min(1),
  reason: z.string().optional(),
});

const DeleteInboxItemSchema = z.object({
  id: z.string().min(1),
});

export interface InboxToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const inboxToolDefinitions: InboxToolDefinition[] = [
  {
    name: 'add_to_inbox',
    description: 'Adding to inbox — captures content for skill extraction',
    inputSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The content to add (paste, conversation excerpt, etc.)',
        },
        sourceType: {
          type: 'string',
          enum: ['paste', 'conversation', 'file'],
          description: 'Type of source content',
        },
        sourceName: {
          type: 'string',
          description: 'Name/identifier for the source (e.g., filename, conversation topic)',
        },
      },
      required: ['content', 'sourceType', 'sourceName'],
    },
  },
  {
    name: 'add_url_to_inbox',
    description: 'Fetching URL — downloads content and adds to inbox for extraction',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to fetch and add (documentation, blog post, tutorial, etc.)',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'list_inbox',
    description: 'Checking inbox — lists items with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'processing', 'extracted', 'rejected'],
          description: 'Filter by status',
        },
        sourceType: {
          type: 'string',
          enum: ['url', 'file', 'paste', 'conversation'],
          description: 'Filter by source type',
        },
      },
    },
  },
  {
    name: 'get_inbox_item',
    description: 'Loading inbox item — retrieves details and extracted skills',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The inbox item ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'process_inbox_item',
    description: 'Processing inbox item — extracting skills and patterns via AI analysis',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The inbox item ID to process',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'approve_extraction',
    description: 'Approving extraction — creates skill from inbox item in registry',
    inputSchema: {
      type: 'object',
      properties: {
        itemId: {
          type: 'string',
          description: 'The inbox item ID',
        },
        skillIndex: {
          type: 'number',
          description: 'Index of the skill in extractedSkills array',
        },
        modifications: {
          type: 'object',
          description: 'Optional modifications to apply before creating',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            content: { type: 'string' },
            phase: { type: 'string' },
          },
        },
      },
      required: ['itemId', 'skillIndex'],
    },
  },
  {
    name: 'reject_extraction',
    description: 'Rejecting extraction — removes skill from pending extractions',
    inputSchema: {
      type: 'object',
      properties: {
        itemId: {
          type: 'string',
          description: 'The inbox item ID',
        },
        skillIndex: {
          type: 'number',
          description: 'Index of the skill to reject',
        },
        reason: {
          type: 'string',
          description: 'Reason for rejection',
        },
      },
      required: ['itemId', 'skillIndex'],
    },
  },
  {
    name: 'reject_inbox_item',
    description: 'Rejecting inbox item — marks as rejected, keeps for reference',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The inbox item ID to reject',
        },
        reason: {
          type: 'string',
          description: 'Reason for rejection',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_inbox_item',
    description: 'Deleting inbox item — permanently removes item and source file',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The inbox item ID to delete',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_inbox_stats',
    description: 'Checking inbox stats — counts by status and extracted skills',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'refresh_inbox',
    description: 'Scanning inbox — discovers new externally-added files',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'approve_classified_extraction',
    description: 'Approving classified extraction — creates skill, enhancement, or reference doc',
    inputSchema: {
      type: 'object',
      properties: {
        itemId: {
          type: 'string',
          description: 'The inbox item ID',
        },
        extractionIndex: {
          type: 'number',
          description: 'Index of the extraction in classifiedExtractions array',
        },
        modifications: {
          type: 'object',
          description: 'Optional modifications to apply before creating',
          properties: {
            name: { type: 'string' },
            content: { type: 'string' },
            section: { type: 'string' },
          },
        },
      },
      required: ['itemId', 'extractionIndex'],
    },
  },
  {
    name: 'reject_classified_extraction',
    description: 'Rejecting classified extraction — declines with reason',
    inputSchema: {
      type: 'object',
      properties: {
        itemId: {
          type: 'string',
          description: 'The inbox item ID',
        },
        extractionIndex: {
          type: 'number',
          description: 'Index of the extraction to reject',
        },
        reason: {
          type: 'string',
          description: 'Reason for rejection',
        },
      },
      required: ['itemId', 'extractionIndex'],
    },
  },
];

export function createInboxToolHandlers(processor: InboxProcessor) {
  return {
    add_to_inbox: async (params: unknown) => {
      const validated = AddToInboxSchema.parse(params);
      const source: InboxSource = {
        type: validated.sourceType,
        name: validated.sourceName,
      };

      const item = await processor.addItem({
        content: validated.content,
        source,
      });

      return {
        id: item.id,
        source: item.source,
        status: item.status,
        createdAt: item.createdAt,
        contentPreview: item.content.slice(0, 200) + (item.content.length > 200 ? '...' : ''),
        message: `Added to inbox. Use process_inbox_item to extract skills.`,
      };
    },

    add_url_to_inbox: async (params: unknown) => {
      const validated = AddUrlToInboxSchema.parse(params);
      const item = await processor.addUrl(validated.url);

      return {
        id: item.id,
        url: item.url,
        source: item.source,
        status: item.status,
        createdAt: item.createdAt,
        contentPreview: item.content.slice(0, 200) + (item.content.length > 200 ? '...' : ''),
        message: `Fetched URL and added to inbox. Use process_inbox_item to extract skills.`,
      };
    },

    list_inbox: async (params: unknown) => {
      const validated = ListInboxSchema.parse(params);
      const items = processor.listItems({
        status: validated.status,
        sourceType: validated.sourceType,
      });

      return {
        count: items.length,
        items: items.map(item => ({
          id: item.id,
          source: item.source,
          url: item.url,
          status: item.status,
          createdAt: item.createdAt,
          processedAt: item.processedAt,
          extractedSkillsCount: item.extractedSkills?.length || 0,
          extractedPatternsCount: item.extractedPatterns?.length || 0,
          contentPreview: item.content.slice(0, 100) + (item.content.length > 100 ? '...' : ''),
        })),
      };
    },

    get_inbox_item: async (params: unknown) => {
      const validated = GetInboxItemSchema.parse(params);
      const item = processor.getItem(validated.id);

      if (!item) {
        throw new Error(`Inbox item not found: ${validated.id}`);
      }

      return {
        id: item.id,
        source: item.source,
        url: item.url,
        status: item.status,
        createdAt: item.createdAt,
        processedAt: item.processedAt,
        content: item.content,
        extractedSkills: item.extractedSkills?.map((s, i) => ({
          index: i,
          name: s.name,
          description: s.description,
          phase: s.phase,
          confidence: s.confidence,
          needsReview: s.needsReview,
          contentPreview: s.content.slice(0, 200) + (s.content.length > 200 ? '...' : ''),
        })),
        extractedPatterns: item.extractedPatterns,
      };
    },

    process_inbox_item: async (params: unknown) => {
      const validated = ProcessInboxItemSchema.parse(params);
      const result = await processor.processItem(validated.id);

      return {
        itemId: result.item.id,
        confidence: result.confidence,
        classifiedExtractions: result.classifiedExtractions.map((ce, i) => ({
          index: i,
          type: ce.type,
          confidence: ce.confidence,
          reasoning: ce.reasoning,
          ...(ce.type === 'standalone_skill' && ce.skill ? {
            skillName: ce.skill.name,
            skillDescription: ce.skill.description,
          } : {}),
          ...(ce.type === 'skill_enhancement' ? {
            targetSkill: ce.targetSkill,
            enhancementDescription: ce.enhancement?.description,
          } : {}),
          ...(ce.type === 'reference_doc' ? {
            parentSkill: ce.parentSkill,
            referenceName: ce.reference?.name,
          } : {}),
        })),
        extractedSkills: result.extractedSkills.map((s, i) => ({
          index: i,
          name: s.name,
          description: s.description,
          phase: s.phase,
          confidence: s.confidence,
          needsReview: s.needsReview,
        })),
        extractedPatterns: result.extractedPatterns.map(p => ({
          id: p.id,
          name: p.name,
          context: p.context,
        })),
        message: `Extracted ${result.classifiedExtractions.length} classified items. Use approve_classified_extraction or reject_classified_extraction to manage them.`,
      };
    },

    approve_extraction: async (params: unknown) => {
      const validated = ApproveExtractionSchema.parse(params);
      const result = await processor.approveSkill(
        validated.itemId,
        validated.skillIndex,
        validated.modifications
      );

      return {
        skillId: result.skillId,
        version: result.version,
        message: `Created skill '${result.skillId}' v${result.version} from inbox extraction`,
      };
    },

    reject_extraction: async (params: unknown) => {
      const validated = RejectExtractionSchema.parse(params);
      await processor.rejectSkill(validated.itemId, validated.skillIndex, validated.reason);

      return {
        message: `Rejected skill extraction ${validated.skillIndex} from item ${validated.itemId}`,
        reason: validated.reason,
      };
    },

    reject_inbox_item: async (params: unknown) => {
      const validated = RejectInboxItemSchema.parse(params);
      await processor.rejectItem(validated.id, validated.reason);

      return {
        message: `Rejected inbox item ${validated.id}`,
        reason: validated.reason,
      };
    },

    delete_inbox_item: async (params: unknown) => {
      const validated = DeleteInboxItemSchema.parse(params);
      await processor.deleteItem(validated.id);

      return {
        message: `Deleted inbox item ${validated.id}`,
      };
    },

    get_inbox_stats: async () => {
      const stats = processor.getStats();

      return {
        ...stats,
        summary: `${stats.pending} pending, ${stats.extracted} extracted (${stats.skillsExtracted} skills, ${stats.patternsExtracted} patterns)`,
      };
    },

    refresh_inbox: async () => {
      const result = await processor.refresh();

      return {
        newItems: result.newItems,
        message: result.newItems > 0
          ? `Found ${result.newItems} new items in inbox directory`
          : 'No new items found',
      };
    },

    approve_classified_extraction: async (params: unknown) => {
      const validated = z.object({
        itemId: z.string().min(1),
        extractionIndex: z.number().min(0),
        modifications: z.object({
          name: z.string().optional(),
          content: z.string().optional(),
          section: z.string().optional(),
        }).optional(),
      }).parse(params);

      const item = processor.getItem(validated.itemId);
      if (!item || !item.classifiedExtractions || validated.extractionIndex >= item.classifiedExtractions.length) {
        throw new Error('Extraction not found');
      }

      const extraction = item.classifiedExtractions[validated.extractionIndex];

      switch (extraction.type) {
        case 'standalone_skill': {
          if (!extraction.skill) throw new Error('No skill data');
          const result = await processor.approveSkill(
            validated.itemId, 0, {
              name: extraction.skill.name,
              description: extraction.skill.description,
              content: validated.modifications?.content || extraction.skill.content,
              phase: extraction.skill.phase,
            }
          );
          return { type: 'standalone_skill', ...result, message: `Created skill '${result.skillId}' v${result.version}` };
        }
        case 'skill_enhancement': {
          const result = await processor.approveEnhancement(
            validated.itemId, validated.extractionIndex, validated.modifications
          );
          return { type: 'skill_enhancement', ...result, message: `Enhanced skill '${result.skillId}' to v${result.version}` };
        }
        case 'reference_doc': {
          const result = await processor.approveReference(
            validated.itemId, validated.extractionIndex, validated.modifications
          );
          return { type: 'reference_doc', ...result, message: `Added reference '${result.referenceName}' to skill '${result.skillId}'` };
        }
        default:
          throw new Error(`Unknown extraction type: ${extraction.type}`);
      }
    },

    reject_classified_extraction: async (params: unknown) => {
      const validated = z.object({
        itemId: z.string().min(1),
        extractionIndex: z.number().min(0),
        reason: z.string().optional(),
      }).parse(params);

      await processor.rejectExtraction(validated.itemId, validated.extractionIndex, validated.reason);
      return {
        message: `Rejected extraction ${validated.extractionIndex} from item ${validated.itemId}`,
        reason: validated.reason,
      };
    },
  };
}
