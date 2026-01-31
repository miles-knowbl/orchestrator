/**
 * MCP Tool definitions for roadmap operations
 */

import { z } from 'zod';
import type { RoadmapService, ModuleStatus } from '../services/roadmapping/index.js';

// Zod schemas
const ModuleStatusSchema = z.enum(['pending', 'in-progress', 'complete', 'blocked']);

const GetRoadmapSchema = z.object({});

const GetProgressSchema = z.object({});

const GetModuleSchema = z.object({
  moduleId: z.string().min(1),
});

const GetModulesByLayerSchema = z.object({
  layer: z.number().min(0).max(6),
});

const UpdateModuleStatusSchema = z.object({
  moduleId: z.string().min(1),
  status: ModuleStatusSchema,
});

const SetCurrentModuleSchema = z.object({
  moduleId: z.string().min(1),
});

const GetNextModuleSchema = z.object({});

const GetLeverageScoresSchema = z.object({});

const GetTerminalViewSchema = z.object({});

export interface RoadmapToolsOptions {
  roadmapService: RoadmapService;
}

export function createRoadmapTools(options: RoadmapToolsOptions) {
  const { roadmapService } = options;

  return {
    tools: [
      {
        name: 'get_roadmap',
        description: 'Get the full roadmap with all modules, layers, and current status',
        inputSchema: {
          type: 'object' as const,
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_roadmap_progress',
        description: 'Get progress summary including per-layer progress, current module, and next available modules',
        inputSchema: {
          type: 'object' as const,
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_roadmap_module',
        description: 'Get details about a specific module by ID',
        inputSchema: {
          type: 'object' as const,
          properties: {
            moduleId: { type: 'string', description: 'The module ID (lowercase, hyphenated)' },
          },
          required: ['moduleId'],
        },
      },
      {
        name: 'get_modules_by_layer',
        description: 'Get all modules in a specific layer (0-6)',
        inputSchema: {
          type: 'object' as const,
          properties: {
            layer: { type: 'number', description: 'Layer number (0-6)' },
          },
          required: ['layer'],
        },
      },
      {
        name: 'update_module_status',
        description: 'Update the status of a module (pending, in-progress, complete, blocked)',
        inputSchema: {
          type: 'object' as const,
          properties: {
            moduleId: { type: 'string', description: 'The module ID' },
            status: { type: 'string', enum: ['pending', 'in-progress', 'complete', 'blocked'], description: 'New status' },
          },
          required: ['moduleId', 'status'],
        },
      },
      {
        name: 'set_current_module',
        description: 'Set the current active module being worked on',
        inputSchema: {
          type: 'object' as const,
          properties: {
            moduleId: { type: 'string', description: 'The module ID to set as current' },
          },
          required: ['moduleId'],
        },
      },
      {
        name: 'get_next_module',
        description: 'Get the next highest leverage module to work on based on the leverage protocol',
        inputSchema: {
          type: 'object' as const,
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_leverage_scores',
        description: 'Get leverage scores for all available modules, ranked by value',
        inputSchema: {
          type: 'object' as const,
          properties: {},
          required: [],
        },
      },
      {
        name: 'render_roadmap_terminal',
        description: 'Get a terminal-friendly visualization of the roadmap with progress',
        inputSchema: {
          type: 'object' as const,
          properties: {},
          required: [],
        },
      },
    ],

    async handleTool(name: string, args: unknown): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
      try {
        switch (name) {
          case 'get_roadmap': {
            GetRoadmapSchema.parse(args);
            const roadmap = roadmapService.getRoadmap();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  system: roadmap.system,
                  dreamState: roadmap.dreamState,
                  moduleCount: roadmap.modules.length,
                  currentModule: roadmap.currentModule,
                  modules: roadmap.modules,
                  updates: roadmap.updates,
                  brainstorm: roadmap.brainstorm,
                  version: roadmap.version,
                }, null, 2),
              }],
            };
          }

          case 'get_roadmap_progress': {
            GetProgressSchema.parse(args);
            const progress = roadmapService.getProgress();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(progress, null, 2),
              }],
            };
          }

          case 'get_roadmap_module': {
            const { moduleId } = GetModuleSchema.parse(args);
            const module = roadmapService.getModule(moduleId);
            if (!module) {
              return {
                content: [{ type: 'text', text: `Module not found: ${moduleId}` }],
              };
            }
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(module, null, 2),
              }],
            };
          }

          case 'get_modules_by_layer': {
            const { layer } = GetModulesByLayerSchema.parse(args);
            const modules = roadmapService.getModulesByLayer(layer);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  layer,
                  count: modules.length,
                  modules,
                }, null, 2),
              }],
            };
          }

          case 'update_module_status': {
            const { moduleId, status } = UpdateModuleStatusSchema.parse(args);
            const module = await roadmapService.updateModuleStatus(moduleId, status as ModuleStatus);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  module,
                }, null, 2),
              }],
            };
          }

          case 'set_current_module': {
            const { moduleId } = SetCurrentModuleSchema.parse(args);
            await roadmapService.setCurrentModule(moduleId);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  currentModule: moduleId,
                }, null, 2),
              }],
            };
          }

          case 'get_next_module': {
            GetNextModuleSchema.parse(args);
            const next = roadmapService.getNextHighestLeverageModule();
            if (!next) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    message: 'No available modules (all complete or blocked)',
                    next: null,
                  }, null, 2),
                }],
              };
            }
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  next,
                  reasoning: `${next.moduleName} has the highest leverage score (${next.score}) based on dream state alignment, downstream unlock, and likelihood of completion.`,
                }, null, 2),
              }],
            };
          }

          case 'get_leverage_scores': {
            GetLeverageScoresSchema.parse(args);
            const scores = roadmapService.calculateLeverageScores();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  count: scores.length,
                  scores,
                }, null, 2),
              }],
            };
          }

          case 'render_roadmap_terminal': {
            GetTerminalViewSchema.parse(args);
            const terminal = roadmapService.generateTerminalView();
            return {
              content: [{
                type: 'text',
                text: terminal,
              }],
            };
          }

          default:
            return {
              content: [{
                type: 'text',
                text: `Unknown tool: ${name}`,
              }],
            };
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          }],
        };
      }
    },
  };
}
