/**
 * MCP Tools for Skill Trees
 *
 * Provides tools for skill tree generation, visualization, and progression tracking.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { SkillTreeService, TreeDomain } from '../services/skill-trees/index.js';

export const skillTreeTools: Tool[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Tree Generation
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'generate_skill_tree',
    description: 'Generate a skill tree for a specific domain (phase, tag, category, or loop).',
    inputSchema: {
      type: 'object',
      properties: {
        domainType: {
          type: 'string',
          enum: ['phase', 'tag', 'category', 'loop'],
          description: 'Type of domain to filter by',
        },
        domainValue: {
          type: 'string',
          description: 'Value for the domain filter (e.g., "INIT" for phase, "engineering-loop" for loop)',
        },
      },
      required: ['domainType', 'domainValue'],
    },
  },
  {
    name: 'list_skill_trees',
    description: 'List all generated skill trees.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_skill_tree',
    description: 'Get a specific skill tree by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The tree ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_available_domains',
    description: 'Get available domains (phases, tags, categories, loops) for tree generation.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Progression Tracking
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_skill_progression',
    description: 'Get progression status for a skill.',
    inputSchema: {
      type: 'object',
      properties: {
        skillId: {
          type: 'string',
          description: 'The skill ID',
        },
      },
      required: ['skillId'],
    },
  },
  {
    name: 'record_skill_output',
    description: 'Record that user saw output from a skill (increases familiarity).',
    inputSchema: {
      type: 'object',
      properties: {
        skillId: {
          type: 'string',
          description: 'The skill ID',
        },
      },
      required: ['skillId'],
    },
  },
  {
    name: 'record_skill_usage',
    description: 'Record that user used a skill in a loop (increases familiarity).',
    inputSchema: {
      type: 'object',
      properties: {
        skillId: {
          type: 'string',
          description: 'The skill ID',
        },
      },
      required: ['skillId'],
    },
  },
  {
    name: 'update_skill_progression',
    description: 'Manually update progression for a skill.',
    inputSchema: {
      type: 'object',
      properties: {
        skillId: {
          type: 'string',
          description: 'The skill ID',
        },
        status: {
          type: 'string',
          enum: ['locked', 'available', 'in-progress', 'familiar', 'mastered'],
          description: 'New status',
        },
        notes: {
          type: 'string',
          description: 'Optional notes',
        },
      },
      required: ['skillId'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Learning Paths
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'generate_learning_path',
    description: 'Generate a learning path to reach a target skill.',
    inputSchema: {
      type: 'object',
      properties: {
        targetSkillId: {
          type: 'string',
          description: 'The skill you want to learn',
        },
        includeRecommended: {
          type: 'boolean',
          description: 'Include recommended (not required) skills',
        },
      },
      required: ['targetSkillId'],
    },
  },
  {
    name: 'list_learning_paths',
    description: 'List all generated learning paths.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_learning_path',
    description: 'Get a specific learning path by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The path ID',
        },
      },
      required: ['id'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Status & View
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_skill_tree_status',
    description: 'Get current status of the skill tree service.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_skill_tree_terminal_view',
    description: 'Get a terminal-friendly view of skill trees.',
    inputSchema: {
      type: 'object',
      properties: {
        treeId: {
          type: 'string',
          description: 'Optional specific tree ID to view',
        },
      },
    },
  },
];

export function createSkillTreeToolHandlers(skillTreeService: SkillTreeService) {
  return {
    generate_skill_tree: async (params: unknown) => {
      const args = params as { domainType: string; domainValue: string };
      if (!args?.domainType || !args?.domainValue) {
        return { error: 'domainType and domainValue are required' };
      }

      try {
        const domain: TreeDomain = {
          type: args.domainType as TreeDomain['type'],
          value: args.domainValue,
        };
        const tree = await skillTreeService.generateTree(domain);
        return {
          success: true,
          tree: {
            id: tree.id,
            name: tree.name,
            domain: tree.domain,
            stats: tree.stats,
            roots: tree.roots,
            leaves: tree.leaves,
            criticalPath: tree.criticalPath,
            suggestedOrder: tree.suggestedOrder.slice(0, 10),
          },
        };
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to generate tree' };
      }
    },

    list_skill_trees: async (_params: unknown) => {
      const trees = skillTreeService.getTrees();
      return {
        count: trees.length,
        trees: trees.map(t => ({
          id: t.id,
          name: t.name,
          domain: t.domain,
          stats: t.stats,
          generatedAt: t.generatedAt,
        })),
      };
    },

    get_skill_tree: async (params: unknown) => {
      const args = params as { id: string };
      if (!args?.id) {
        return { error: 'id is required' };
      }
      const tree = skillTreeService.getTree(args.id);
      if (!tree) {
        return { error: `Tree not found: ${args.id}` };
      }
      return tree;
    },

    get_available_domains: async (_params: unknown) => {
      return { domains: skillTreeService.getAvailableDomains() };
    },

    get_skill_progression: async (params: unknown) => {
      const args = params as { skillId: string };
      if (!args?.skillId) {
        return { error: 'skillId is required' };
      }
      return skillTreeService.getProgression(args.skillId);
    },

    record_skill_output: async (params: unknown) => {
      const args = params as { skillId: string };
      if (!args?.skillId) {
        return { error: 'skillId is required' };
      }
      const progression = await skillTreeService.recordSkillOutput(args.skillId);
      return { success: true, progression };
    },

    record_skill_usage: async (params: unknown) => {
      const args = params as { skillId: string };
      if (!args?.skillId) {
        return { error: 'skillId is required' };
      }
      const progression = await skillTreeService.recordSkillUsage(args.skillId);
      return { success: true, progression };
    },

    update_skill_progression: async (params: unknown) => {
      const args = params as { skillId: string; status?: string; notes?: string };
      if (!args?.skillId) {
        return { error: 'skillId is required' };
      }
      const update: Record<string, unknown> = {};
      if (args.status) update.status = args.status;
      if (args.notes) update.notes = args.notes;

      const progression = await skillTreeService.updateProgression(args.skillId, update);
      return { success: true, progression };
    },

    generate_learning_path: async (params: unknown) => {
      const args = params as { targetSkillId: string; includeRecommended?: boolean };
      if (!args?.targetSkillId) {
        return { error: 'targetSkillId is required' };
      }

      try {
        const path = await skillTreeService.generateLearningPath(args.targetSkillId, {
          includeRecommended: args.includeRecommended,
        });
        return { success: true, path };
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to generate path' };
      }
    },

    list_learning_paths: async (_params: unknown) => {
      const paths = skillTreeService.getLearningPaths();
      return {
        count: paths.length,
        paths: paths.map(p => ({
          id: p.id,
          name: p.name,
          skillCount: p.skills.length,
          difficulty: p.difficulty,
          estimatedEffort: p.estimatedEffort,
        })),
      };
    },

    get_learning_path: async (params: unknown) => {
      const args = params as { id: string };
      if (!args?.id) {
        return { error: 'id is required' };
      }
      const path = skillTreeService.getLearningPath(args.id);
      if (!path) {
        return { error: `Path not found: ${args.id}` };
      }
      return path;
    },

    get_skill_tree_status: async (_params: unknown) => {
      return skillTreeService.getStatus();
    },

    get_skill_tree_terminal_view: async (params: unknown) => {
      const args = (params || {}) as { treeId?: string };
      return { view: skillTreeService.generateTerminalView(args.treeId) };
    },
  };
}
