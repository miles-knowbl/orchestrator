/**
 * MCP Tool definitions for skill operations
 */

import { z } from 'zod';
import type { SkillRegistry } from '../services/SkillRegistry.js';
import type { LearningService } from '../services/LearningService.js';
import type { Phase, SkillCategory, ImprovementCategory } from '../types.js';

// Zod schemas for validation
const ListSkillsSchema = z.object({
  phase: z.enum([
    'INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY',
    'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'
  ]).optional(),
  category: z.enum([
    'engineering', 'sales', 'operations', 'content', 'strategy'
  ]).optional(),
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
  category: z.enum([
    'engineering', 'sales', 'operations', 'content', 'strategy'
  ]).optional(),
});

const UpdateSkillSchema = z.object({
  name: z.string().min(1),
  content: z.string().optional(),
  description: z.string().optional(),
  versionBump: z.enum(['patch', 'minor', 'major']).default('patch'),
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
          enum: ['engineering', 'sales', 'operations', 'content', 'strategy'],
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
          enum: ['engineering', 'sales', 'operations', 'content', 'strategy'],
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
          description: 'Type of version bump (defaults to patch)',
        },
        changeDescription: {
          type: 'string',
          description: 'Description of changes for changelog',
        },
      },
      required: ['name', 'changeDescription'],
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
  {
    name: 'get_skill_graph',
    description: 'Get skill dependency graph showing relationships between skills',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'analyze_skill_coverage',
    description: 'Analyze skill coverage by phase and category, identify gaps and orphan skills',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'find_similar_skills',
    description: 'Find skills with similar names to check for potential duplicates',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Skill name to check for similar matches',
        },
        threshold: {
          type: 'number',
          description: 'Minimum similarity threshold (0-1, default 0.3)',
        },
      },
      required: ['name'],
    },
  },
];

/**
 * Create skill tool handlers
 */
export function createSkillToolHandlers(
  registry: SkillRegistry,
  learningService?: LearningService
) {
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
      const skill = validated.skill || 'general';
      const category = (validated.category || 'enhancement') as ImprovementCategory;

      // If learningService is available and skill is specified, create a proper proposal
      if (learningService && skill !== 'general') {
        try {
          const proposal = await learningService.captureImprovement({
            skillId: skill,
            feedback: validated.feedback,
            source: validated.source || 'manual',
            category,
          });

          return {
            id: proposal.id,
            skill: proposal.skillId,
            status: proposal.status,
            message: `Improvement proposal ${proposal.id} created for skill '${skill}'`,
          };
        } catch (error) {
          // Fall back to simple logging if skill not found
          console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'warn',
            message: `Failed to create proposal: ${error}`,
          }));
        }
      }

      // Fallback: log the improvement
      const id = `IMP-${Date.now().toString(36).toUpperCase()}`;

      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        type: 'improvement',
        id,
        skill,
        category,
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

    get_skill_graph: async () => {
      return registry.getSkillGraph();
    },

    analyze_skill_coverage: async () => {
      return registry.analyzeSkillCoverage();
    },

    find_similar_skills: async (params: unknown) => {
      const validated = z.object({
        name: z.string().min(1),
        threshold: z.number().min(0).max(1).optional(),
      }).parse(params);

      const similar = registry.findSimilarSkills(
        validated.name,
        validated.threshold ?? 0.3
      );

      return {
        query: validated.name,
        threshold: validated.threshold ?? 0.3,
        similar: similar.map(({ skill, similarity }) => ({
          name: skill.id,
          description: skill.description,
          similarity: Math.round(similarity * 100),
          phase: skill.phase,
        })),
        message: similar.length > 0
          ? `Found ${similar.length} similar skill(s)`
          : 'No similar skills found',
      };
    },
  };
}
