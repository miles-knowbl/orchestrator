/**
 * MCP Tool definitions for deliverable and transient state management
 */

import { z } from 'zod';
import type { DeliverableManager } from '../services/DeliverableManager.js';
import type { TransientCategory } from '../types/deliverable.js';
import type { Phase } from '../types.js';

// Zod schemas
const WriteTransientSchema = z.object({
  executionId: z.string().min(1),
  category: z.enum(['context', 'working', 'scratch']),
  name: z.string().min(1),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

const ReadTransientSchema = z.object({
  executionId: z.string().min(1),
  category: z.enum(['context', 'working', 'scratch']),
  name: z.string().min(1),
});

const ListTransientSchema = z.object({
  executionId: z.string().min(1),
  category: z.enum(['context', 'working', 'scratch']).optional(),
});

const SaveCheckpointSchema = z.object({
  executionId: z.string().min(1),
  phase: z.string().min(1),
  skillId: z.string().optional(),
  data: z.record(z.unknown()),
});

const LoadCheckpointSchema = z.object({
  executionId: z.string().min(1),
});

const CleanupTransientSchema = z.object({
  executionId: z.string().min(1),
  scratchOnly: z.boolean().optional(),
});

const GetTransientStateSchema = z.object({
  executionId: z.string().min(1),
});

/**
 * Deliverable tool definitions for MCP registration
 */
export const deliverableToolDefinitions = [
  {
    name: 'write_transient',
    description: 'Writing transient file — saves per-execution working file (context, working, or scratch)',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
        category: {
          type: 'string',
          enum: ['context', 'working', 'scratch'],
          description: 'File category: context (execution context), working (in-progress), scratch (temporary)',
        },
        name: {
          type: 'string',
          description: 'File name (e.g., "analysis.json", "notes.md")',
        },
        content: {
          type: 'string',
          description: 'File content',
        },
        metadata: {
          type: 'object',
          description: 'Optional metadata to attach to the file',
        },
      },
      required: ['executionId', 'category', 'name', 'content'],
    },
  },
  {
    name: 'read_transient',
    description: 'Reading transient file — loads per-execution working file',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
        category: {
          type: 'string',
          enum: ['context', 'working', 'scratch'],
          description: 'File category',
        },
        name: {
          type: 'string',
          description: 'File name',
        },
      },
      required: ['executionId', 'category', 'name'],
    },
  },
  {
    name: 'list_transient',
    description: 'Listing transient files — shows per-execution files by category',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
        category: {
          type: 'string',
          enum: ['context', 'working', 'scratch'],
          description: 'Optional: filter by category',
        },
      },
      required: ['executionId'],
    },
  },
  {
    name: 'save_checkpoint',
    description: 'Saving checkpoint — preserves execution state for resumption',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
        phase: {
          type: 'string',
          description: 'Current phase name',
        },
        skillId: {
          type: 'string',
          description: 'Optional: current skill ID',
        },
        data: {
          type: 'object',
          description: 'Checkpoint data (progress, state, context)',
        },
      },
      required: ['executionId', 'phase', 'data'],
    },
  },
  {
    name: 'load_checkpoint',
    description: 'Loading checkpoint — restores execution state for resumption',
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
    name: 'cleanup_transient',
    description: 'Cleaning transient files — removes per-execution temporary files',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'Execution ID',
        },
        scratchOnly: {
          type: 'boolean',
          description: 'If true, only clean scratch files (default: false, cleans all)',
        },
      },
      required: ['executionId'],
    },
  },
  {
    name: 'get_transient_state',
    description: 'Checking transient state — summarizes files and checkpoint for execution',
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
];

/**
 * Create deliverable tool handlers
 */
export function createDeliverableToolHandlers(deliverableManager: DeliverableManager) {
  return {
    write_transient: async (params: unknown) => {
      const validated = WriteTransientSchema.parse(params);
      const file = await deliverableManager.writeTransient({
        executionId: validated.executionId,
        category: validated.category as TransientCategory,
        name: validated.name,
        content: validated.content,
        metadata: validated.metadata,
      });
      return {
        path: file.path,
        category: file.category,
        name: file.name,
        size: file.size,
        message: `Transient file written: ${file.category}/${file.name}`,
      };
    },

    read_transient: async (params: unknown) => {
      const validated = ReadTransientSchema.parse(params);
      const content = await deliverableManager.readTransient({
        executionId: validated.executionId,
        category: validated.category as TransientCategory,
        name: validated.name,
      });
      if (content === null) {
        return {
          found: false,
          message: `Transient file not found: ${validated.category}/${validated.name}`,
        };
      }
      return {
        found: true,
        content,
        category: validated.category,
        name: validated.name,
      };
    },

    list_transient: async (params: unknown) => {
      const validated = ListTransientSchema.parse(params);
      const files = await deliverableManager.listTransient({
        executionId: validated.executionId,
        category: validated.category as TransientCategory | undefined,
      });
      return {
        executionId: validated.executionId,
        count: files.length,
        files: files.map(f => ({
          name: f.name,
          category: f.category,
          path: f.path,
          size: f.size,
          updatedAt: f.updatedAt,
        })),
      };
    },

    save_checkpoint: async (params: unknown) => {
      const validated = SaveCheckpointSchema.parse(params);
      const checkpoint = await deliverableManager.saveCheckpoint({
        executionId: validated.executionId,
        phase: validated.phase as Phase,
        skillId: validated.skillId,
        data: validated.data,
      });
      return {
        phase: checkpoint.phase,
        skillId: checkpoint.skillId,
        savedAt: checkpoint.savedAt,
        message: `Checkpoint saved at ${checkpoint.phase}${checkpoint.skillId ? `/${checkpoint.skillId}` : ''}`,
      };
    },

    load_checkpoint: async (params: unknown) => {
      const validated = LoadCheckpointSchema.parse(params);
      const checkpoint = await deliverableManager.loadCheckpoint(validated.executionId);
      if (!checkpoint) {
        return {
          found: false,
          message: 'No checkpoint found for this execution',
        };
      }
      return {
        found: true,
        phase: checkpoint.phase,
        skillId: checkpoint.skillId,
        data: checkpoint.data,
        savedAt: checkpoint.savedAt,
        message: `Checkpoint loaded from ${checkpoint.phase}${checkpoint.skillId ? `/${checkpoint.skillId}` : ''}`,
      };
    },

    cleanup_transient: async (params: unknown) => {
      const validated = CleanupTransientSchema.parse(params);
      const result = await deliverableManager.cleanupTransient({
        executionId: validated.executionId,
        scratchOnly: validated.scratchOnly,
      });
      return {
        executionId: validated.executionId,
        deletedCount: result.deletedCount,
        scratchOnly: validated.scratchOnly || false,
        message: `Cleaned up ${result.deletedCount} transient files${validated.scratchOnly ? ' (scratch only)' : ''}`,
      };
    },

    get_transient_state: async (params: unknown) => {
      const validated = GetTransientStateSchema.parse(params);
      const state = await deliverableManager.getTransientState(validated.executionId);
      if (!state) {
        return {
          executionId: validated.executionId,
          hasState: false,
          message: 'No transient state for this execution',
        };
      }
      return {
        executionId: state.executionId,
        hasState: true,
        fileCount: state.files.length,
        hasCheckpoint: !!state.checkpoint,
        checkpoint: state.checkpoint ? {
          phase: state.checkpoint.phase,
          skillId: state.checkpoint.skillId,
          savedAt: state.checkpoint.savedAt,
        } : null,
        filesByCategory: {
          context: state.files.filter(f => f.category === 'context').length,
          working: state.files.filter(f => f.category === 'working').length,
          scratch: state.files.filter(f => f.category === 'scratch').length,
        },
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
      };
    },
  };
}
