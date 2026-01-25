/**
 * MCP Tool definitions for skill operations
 */

import { z } from 'zod';
import type { SkillRegistry } from '../services/SkillRegistry.js';
import type { Phase, SkillCategory } from '../types.js';

// Zod schemas for validation
const ListSkillsSchema = z.object({
  phase: z.enum([
    'INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY',
    'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'
  ]).optional(),
  category: z.enum(['core', 'infra', 'meta', 'specialized', 'custom']).optional(),
  query: z.string().optional(),
  limit: z.number().min(1).max(500).optional(),
  offset: z.number().min(0).optional(),
});

const GetSkillSchema = z.object({
  name: z.string().min(1),
  includeReferences: z.boolean().optional(),
  version: z.string().optional(),
});

const CreateSkillSchema = z.object({
  name: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens'),
  description: z.string().min(1),
  content: z.string().min(1),
  phase: z.enum([
    'INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY',
    'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'
  ]).optional(),
  category: z.enum(['core', 'infra', 'meta', 'specialized', 'custom']).optional(),
});

const UpdateSkillSchema = z.object({
  name: z.string().min(1),
  content: z.string().optional(),
  description: z.string().optional(),
  versionBump: z.enum(['patch', 'minor', 'major']),
  changeDescription: z.string().min(1),
});

const CaptureImprovementSchema = z.object({
  feedback: z.string().min(1),
  source: z.string().optional(),
  category: z.enum(['bug', 'enhancement', 'clarification', 'new-feature']).optional(),
  skill: z.string().optional(),
  section: z.string().optional(),
});

const SkillVersionsSchema = z.object({
  name: z.string().min(1),
});

const SearchSkillsSchema = z.object({
  query: z.string().min(2),
  phase: z.enum([
    'INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY',
    'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'
  ]).optional(),
  limit: z.number().min(1).max(100).optional(),
});

/**
 * Tool definitions for MCP registration
 */
export const skillToolDefinitions = [
  {
    name: 'list_skills',
    description: 'List all indexed skills with optional filtering by phase, category, or query',
    inputSchema: {
      type: 'object',
      properties: {
        phase: {
          type: 'string',
          enum: ['INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY', 'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'],
          description: 'Filter by phase',
        },
        category: {
          type: 'string',
          enum: ['core', 'infra', 'meta', 'specialized', 'custom'],
          description: 'Filter by category',
        },
        query: {
          type: 'string',
          description: 'Search query for name/description',
        },
        limit: {
          type: 'number',
          description: 'Maximum results (default 100, max 500)',
        },
        offset: {
          type: 'number',
          description: 'Pagination offset',
        },
      },
    },
  },
  {
    name: 'get_skill',
    description: 'Get full skill definition including content and optionally references',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Skill name (e.g., "implement")',
        },
        includeReferences: {
          type: 'boolean',
          description: 'Include reference file contents',
        },
        version: {
          type: 'string',
          description: 'Specific version to retrieve',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'create_skill',
    description: 'Create a new skill definition',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Skill name (lowercase, hyphens allowed)',
        },
        description: {
          type: 'string',
          description: 'Brief description of the skill',
        },
        content: {
          type: 'string',
          description: 'Full markdown content for SKILL.md',
        },
        phase: {
          type: 'string',
          enum: ['INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY', 'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'],
          description: 'Primary phase affinity',
        },
        category: {
          type: 'string',
          enum: ['core', 'infra', 'meta', 'specialized', 'custom'],
          description: 'Skill category',
        },
      },
      required: ['name', 'description', 'content'],
    },
  },
  {
    name: 'update_skill',
    description: 'Update a skill and create a new version',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Skill name',
        },
        content: {
          type: 'string',
          description: 'New content (optional)',
        },
        description: {
          type: 'string',
          description: 'New description (optional)',
        },
        versionBump: {
          type: 'string',
          enum: ['patch', 'minor', 'major'],
          description: 'Type of version bump',
        },
        changeDescription: {
          type: 'string',
          description: 'Description of changes for changelog',
        },
      },
      required: ['name', 'versionBump', 'changeDescription'],
    },
  },
  {
    name: 'skill_versions',
    description: 'Get version history for a skill',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Skill name',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'search_skills',
    description: 'Search skills by keyword',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (min 2 chars)',
        },
        phase: {
          type: 'string',
          enum: ['INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY', 'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'],
          description: 'Filter by phase',
        },
        limit: {
          type: 'number',
          description: 'Maximum results (default 20)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'capture_improvement',
    description: 'Capture feedback for improving a skill',
    inputSchema: {
      type: 'object',
      properties: {
        feedback: {
          type: 'string',
          description: 'The improvement feedback',
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
        skill: {
          type: 'string',
          description: 'Skill name if identifiable',
        },
        section: {
          type: 'string',
          description: 'Specific section of skill',
        },
      },
      required: ['feedback'],
    },
  },
  {
    name: 'get_phases',
    description: 'Get all phases with their associated skills',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'refresh_index',
    description: 'Force re-index of all skills',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * Create skill tool handlers
 */
export function createSkillToolHandlers(registry: SkillRegistry) {
  return {
    list_skills: async (params: unknown) => {
      const validated = ListSkillsSchema.parse(params);
      return registry.listSkills({
        phase: validated.phase as Phase | undefined,
        category: validated.category as SkillCategory | undefined,
        query: validated.query,
        limit: validated.limit,
        offset: validated.offset,
      });
    },

    get_skill: async (params: unknown) => {
      const validated = GetSkillSchema.parse(params);
      const skill = await registry.getSkill(validated.name, {
        includeReferences: validated.includeReferences,
        version: validated.version,
      });

      if (!skill) {
        throw new Error(`Skill not found: ${validated.name}`);
      }

      return {
        name: skill.id,
        version: skill.version,
        description: skill.description,
        phase: skill.phase,
        category: skill.category,
        content: skill.content,
        references: skill.references.map(r => ({
          name: r.name,
          content: r.content,
        })),
        learning: skill.learning,
      };
    },

    create_skill: async (params: unknown) => {
      const validated = CreateSkillSchema.parse(params);
      const skill = await registry.createSkill({
        name: validated.name,
        description: validated.description,
        content: validated.content,
        phase: validated.phase as Phase | undefined,
        category: validated.category as SkillCategory | undefined,
      });

      return {
        name: skill.id,
        version: skill.version,
        message: `Skill '${skill.id}' created at version ${skill.version}`,
      };
    },

    update_skill: async (params: unknown) => {
      const validated = UpdateSkillSchema.parse(params);
      const skill = await registry.updateSkill({
        name: validated.name,
        content: validated.content,
        description: validated.description,
        versionBump: validated.versionBump,
        changeDescription: validated.changeDescription,
      });

      return {
        name: skill.id,
        version: skill.version,
        message: `Skill '${skill.id}' updated to version ${skill.version}`,
      };
    },

    skill_versions: async (params: unknown) => {
      const validated = SkillVersionsSchema.parse(params);
      const versions = await registry.getVersionHistory(validated.name);
      return { name: validated.name, versions };
    },

    search_skills: async (params: unknown) => {
      const validated = SearchSkillsSchema.parse(params);
      const results = registry.searchSkills(validated.query, {
        phase: validated.phase as Phase | undefined,
        limit: validated.limit,
      });
      return { query: validated.query, results, total: results.length };
    },

    capture_improvement: async (params: unknown) => {
      const validated = CaptureImprovementSchema.parse(params);

      // For now, just log the improvement. Full implementation would:
      // 1. Append to IMPROVEMENTS.md
      // 2. Link to recent executions
      // 3. Suggest skill if not provided

      const id = `IMP-${Date.now().toString(36).toUpperCase()}`;
      const skill = validated.skill || 'general';

      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        type: 'improvement',
        id,
        skill,
        category: validated.category || 'enhancement',
        feedback: validated.feedback,
        source: validated.source,
      }));

      return {
        id,
        skill,
        message: `Captured improvement ${id}: ${validated.feedback.slice(0, 50)}...`,
      };
    },

    get_phases: async () => {
      return { phases: registry.getPhases() };
    },

    refresh_index: async () => {
      const result = await registry.refresh();
      return {
        indexed: result.indexed,
        duration: result.duration,
        message: `Indexed ${result.indexed} skills in ${result.duration}ms`,
      };
    },
  };
}
