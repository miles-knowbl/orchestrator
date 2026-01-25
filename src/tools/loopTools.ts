/**
 * MCP Tool definitions for loop operations
 */

import { z } from 'zod';
import type { LoopComposer } from '../services/LoopComposer.js';
import type { Phase } from '../types.js';

// Zod schemas
const ListLoopsSchema = z.object({});

const GetLoopSchema = z.object({
  id: z.string().min(1),
});

const CreateLoopSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, 'ID must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1),
  description: z.string().optional(),
  phases: z.array(z.object({
    name: z.enum([
      'INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY',
      'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'
    ]),
    skills: z.array(z.string().min(1)),
    required: z.boolean().optional(),
    parallel: z.boolean().optional(),
  })),
  gates: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    afterPhase: z.enum([
      'INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY',
      'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'
    ]),
    required: z.boolean().optional(),
    deliverables: z.array(z.string()).optional(),
  })).optional(),
});

const ValidateLoopSchema = z.object({
  id: z.string().optional(),
  config: z.any().optional(),
});

/**
 * Loop tool definitions for MCP registration
 */
export const loopToolDefinitions = [
  {
    name: 'list_loops',
    description: 'List all available loops',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_loop',
    description: 'Get a loop definition with phases, skills, and gates',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Loop ID (e.g., "engineering-loop")',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_loop',
    description: 'Create a new loop from configuration',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Loop ID (lowercase, hyphens allowed)',
        },
        name: {
          type: 'string',
          description: 'Display name',
        },
        description: {
          type: 'string',
          description: 'Loop description',
        },
        phases: {
          type: 'array',
          description: 'Array of phase definitions',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              skills: { type: 'array', items: { type: 'string' } },
              required: { type: 'boolean' },
            },
          },
        },
        gates: {
          type: 'array',
          description: 'Array of gate definitions',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              afterPhase: { type: 'string' },
              required: { type: 'boolean' },
              deliverables: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
      required: ['id', 'name', 'phases'],
    },
  },
  {
    name: 'validate_loop',
    description: 'Validate a loop configuration',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Existing loop ID to validate',
        },
        config: {
          type: 'object',
          description: 'Loop configuration to validate',
        },
      },
    },
  },
];

/**
 * Create loop tool handlers
 */
export function createLoopToolHandlers(loopComposer: LoopComposer) {
  return {
    list_loops: async (_params: unknown) => {
      const loops = loopComposer.listLoops();
      return {
        loops,
        total: loops.length,
      };
    },

    get_loop: async (params: unknown) => {
      const validated = GetLoopSchema.parse(params);
      const loop = loopComposer.getLoop(validated.id);

      if (!loop) {
        throw new Error(`Loop not found: ${validated.id}`);
      }

      return {
        id: loop.id,
        name: loop.name,
        version: loop.version,
        description: loop.description,
        phases: loop.phases.map(p => ({
          name: p.name,
          order: p.order,
          skills: p.skills.map(s => s.skillId),
          required: p.required,
        })),
        gates: loop.gates.map(g => ({
          id: g.id,
          name: g.name,
          afterPhase: g.afterPhase,
          required: g.required,
          approvalType: g.approvalType,
          deliverables: g.deliverables,
        })),
        skillCount: loop.skillCount,
        ui: loop.ui,
      };
    },

    create_loop: async (params: unknown) => {
      const validated = CreateLoopSchema.parse(params);

      const loop = await loopComposer.createLoop({
        id: validated.id,
        name: validated.name,
        version: '1.0.0',
        description: validated.description || '',
        phases: validated.phases.map(p => ({
          name: p.name as Phase,
          skills: p.skills,
          required: p.required,
          parallel: p.parallel,
        })),
        gates: validated.gates?.map(g => ({
          id: g.id,
          name: g.name,
          afterPhase: g.afterPhase as Phase,
          required: g.required,
          deliverables: g.deliverables,
        })),
      });

      return {
        id: loop.id,
        name: loop.name,
        version: loop.version,
        message: `Loop '${loop.id}' created with ${loop.skillCount} skills`,
      };
    },

    validate_loop: async (params: unknown) => {
      const validated = ValidateLoopSchema.parse(params);

      if (validated.id) {
        const loop = loopComposer.getLoop(validated.id);
        if (!loop) {
          return { valid: false, errors: [`Loop not found: ${validated.id}`], warnings: [] };
        }
        // Loop exists and was loaded successfully
        return { valid: true, errors: [], warnings: [] };
      }

      if (validated.config) {
        return loopComposer.validateLoop(validated.config);
      }

      return { valid: false, errors: ['Must provide either id or config'], warnings: [] };
    },
  };
}
