/**
 * MCP Tool definitions for roadmap operations
 *
 * Project-agnostic: All tools accept a projectPath parameter to scope
 * roadmap operations to a specific project's .claude/ directory.
 * This ensures each project has its own roadmap (blank slate for new projects).
 */

import { z } from 'zod';
import { join } from 'path';
import type { RoadmapService, ModuleStatus } from '../services/roadmapping/index.js';
import { RoadmapService as RoadmapServiceClass } from '../services/roadmapping/index.js';

// Cache of project-scoped RoadmapService instances
const projectServices = new Map<string, RoadmapService>();

/**
 * Get or create a RoadmapService for a specific project path
 */
async function getProjectRoadmapService(projectPath: string): Promise<RoadmapService> {
  const cached = projectServices.get(projectPath);
  if (cached) {
    return cached;
  }

  const service = new RoadmapServiceClass({
    roadmapPath: join(projectPath, 'ROADMAP.md'),
    statePath: join(projectPath, '.claude', 'roadmap.json'),
  });

  try {
    await service.load();
  } catch {
    // Roadmap doesn't exist yet - that's fine, it's a blank slate
  }

  projectServices.set(projectPath, service);
  return service;
}

// Zod schemas
const ModuleStatusSchema = z.enum(['pending', 'in-progress', 'complete', 'blocked']);

const ProjectPathSchema = z.object({
  projectPath: z.string().min(1).describe('Absolute path to the target project directory'),
});

const GetRoadmapSchema = ProjectPathSchema;

const GetProgressSchema = ProjectPathSchema;

const GetModuleSchema = ProjectPathSchema.extend({
  moduleId: z.string().min(1),
});

const GetModulesByLayerSchema = ProjectPathSchema.extend({
  layer: z.number().min(0).max(6),
});

const UpdateModuleStatusSchema = ProjectPathSchema.extend({
  moduleId: z.string().min(1),
  status: ModuleStatusSchema,
});

const SetCurrentModuleSchema = ProjectPathSchema.extend({
  moduleId: z.string().min(1),
});

const GetNextModuleSchema = ProjectPathSchema;

const GetLeverageScoresSchema = ProjectPathSchema;

const GetTerminalViewSchema = ProjectPathSchema;

export interface RoadmapToolsOptions {
  roadmapService?: RoadmapService; // Optional legacy global service (deprecated)
}

export function createRoadmapTools(options: RoadmapToolsOptions = {}) {
  // Legacy global service is now optional and deprecated
  const legacyService = options.roadmapService;

  return {
    tools: [
      {
        name: 'get_roadmap',
        description: 'Loading roadmap — retrieves modules, layers, and current status',
        inputSchema: {
          type: 'object' as const,
          properties: {
            projectPath: { type: 'string', description: 'Absolute path to the target project directory' },
          },
          required: ['projectPath'],
        },
      },
      {
        name: 'get_roadmap_progress',
        description: 'Checking roadmap progress — retrieves per-layer progress and next modules',
        inputSchema: {
          type: 'object' as const,
          properties: {
            projectPath: { type: 'string', description: 'Absolute path to the target project directory' },
          },
          required: ['projectPath'],
        },
      },
      {
        name: 'get_roadmap_module',
        description: 'Loading module — retrieves details by ID',
        inputSchema: {
          type: 'object' as const,
          properties: {
            projectPath: { type: 'string', description: 'Absolute path to the target project directory' },
            moduleId: { type: 'string', description: 'The module ID (lowercase, hyphenated)' },
          },
          required: ['projectPath', 'moduleId'],
        },
      },
      {
        name: 'get_modules_by_layer',
        description: 'Listing layer modules — retrieves modules for a specific layer',
        inputSchema: {
          type: 'object' as const,
          properties: {
            projectPath: { type: 'string', description: 'Absolute path to the target project directory' },
            layer: { type: 'number', description: 'Layer number (0-6)' },
          },
          required: ['projectPath', 'layer'],
        },
      },
      {
        name: 'update_module_status',
        description: 'Updating module status — changes to pending, in-progress, complete, or blocked',
        inputSchema: {
          type: 'object' as const,
          properties: {
            projectPath: { type: 'string', description: 'Absolute path to the target project directory' },
            moduleId: { type: 'string', description: 'The module ID' },
            status: { type: 'string', enum: ['pending', 'in-progress', 'complete', 'blocked'], description: 'New status' },
          },
          required: ['projectPath', 'moduleId', 'status'],
        },
      },
      {
        name: 'set_current_module',
        description: 'Setting active module — marks module as currently being worked on',
        inputSchema: {
          type: 'object' as const,
          properties: {
            projectPath: { type: 'string', description: 'Absolute path to the target project directory' },
            moduleId: { type: 'string', description: 'The module ID to set as current' },
          },
          required: ['projectPath', 'moduleId'],
        },
      },
      {
        name: 'get_next_module',
        description: 'Finding next module — identifies highest leverage work via leverage protocol',
        inputSchema: {
          type: 'object' as const,
          properties: {
            projectPath: { type: 'string', description: 'Absolute path to the target project directory' },
          },
          required: ['projectPath'],
        },
      },
      {
        name: 'get_leverage_scores',
        description: 'Scoring module leverage — ranks all available modules by value',
        inputSchema: {
          type: 'object' as const,
          properties: {
            projectPath: { type: 'string', description: 'Absolute path to the target project directory' },
          },
          required: ['projectPath'],
        },
      },
      {
        name: 'render_roadmap_terminal',
        description: 'Visualizing roadmap — generates terminal-friendly progress display',
        inputSchema: {
          type: 'object' as const,
          properties: {
            projectPath: { type: 'string', description: 'Absolute path to the target project directory' },
          },
          required: ['projectPath'],
        },
      },
    ],

    async handleTool(name: string, args: unknown): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
      try {
        switch (name) {
          case 'get_roadmap': {
            const { projectPath } = GetRoadmapSchema.parse(args);
            const roadmapService = await getProjectRoadmapService(projectPath);

            if (!roadmapService.isLoaded()) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    projectPath,
                    status: 'no_roadmap',
                    message: `No roadmap found for project at ${projectPath}. Create one by adding a ROADMAP.md or using module planning tools.`,
                  }, null, 2),
                }],
              };
            }

            const roadmap = roadmapService.getRoadmap();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  projectPath,
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
            const { projectPath } = GetProgressSchema.parse(args);
            const roadmapService = await getProjectRoadmapService(projectPath);

            if (!roadmapService.isLoaded()) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    projectPath,
                    status: 'no_roadmap',
                    message: `No roadmap found for project at ${projectPath}.`,
                  }, null, 2),
                }],
              };
            }

            const progress = roadmapService.getProgress();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ projectPath, ...progress }, null, 2),
              }],
            };
          }

          case 'get_roadmap_module': {
            const { projectPath, moduleId } = GetModuleSchema.parse(args);
            const roadmapService = await getProjectRoadmapService(projectPath);

            if (!roadmapService.isLoaded()) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    projectPath,
                    status: 'no_roadmap',
                    message: `No roadmap found for project at ${projectPath}.`,
                  }, null, 2),
                }],
              };
            }

            const module = roadmapService.getModule(moduleId);
            if (!module) {
              return {
                content: [{ type: 'text', text: JSON.stringify({ error: `Module not found: ${moduleId}` }) }],
              };
            }
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ projectPath, ...module }, null, 2),
              }],
            };
          }

          case 'get_modules_by_layer': {
            const { projectPath, layer } = GetModulesByLayerSchema.parse(args);
            const roadmapService = await getProjectRoadmapService(projectPath);

            if (!roadmapService.isLoaded()) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    projectPath,
                    status: 'no_roadmap',
                    layer,
                    modules: [],
                  }, null, 2),
                }],
              };
            }

            const modules = roadmapService.getModulesByLayer(layer);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  projectPath,
                  layer,
                  count: modules.length,
                  modules,
                }, null, 2),
              }],
            };
          }

          case 'update_module_status': {
            const { projectPath, moduleId, status } = UpdateModuleStatusSchema.parse(args);
            const roadmapService = await getProjectRoadmapService(projectPath);

            if (!roadmapService.isLoaded()) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    error: `No roadmap found for project at ${projectPath}. Cannot update module status.`,
                  }, null, 2),
                }],
              };
            }

            const module = await roadmapService.updateModuleStatus(moduleId, status as ModuleStatus);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  projectPath,
                  module,
                }, null, 2),
              }],
            };
          }

          case 'set_current_module': {
            const { projectPath, moduleId } = SetCurrentModuleSchema.parse(args);
            const roadmapService = await getProjectRoadmapService(projectPath);

            if (!roadmapService.isLoaded()) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    error: `No roadmap found for project at ${projectPath}. Cannot set current module.`,
                  }, null, 2),
                }],
              };
            }

            await roadmapService.setCurrentModule(moduleId);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  projectPath,
                  currentModule: moduleId,
                }, null, 2),
              }],
            };
          }

          case 'get_next_module': {
            const { projectPath } = GetNextModuleSchema.parse(args);
            const roadmapService = await getProjectRoadmapService(projectPath);

            if (!roadmapService.isLoaded()) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    projectPath,
                    status: 'no_roadmap',
                    message: `No roadmap found for project at ${projectPath}.`,
                    next: null,
                  }, null, 2),
                }],
              };
            }

            const next = roadmapService.getNextHighestLeverageModule();
            if (!next) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    projectPath,
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
                  projectPath,
                  next,
                  reasoning: `${next.moduleName} has the highest leverage score (${next.score}) based on dream state alignment, downstream unlock, and likelihood of completion.`,
                }, null, 2),
              }],
            };
          }

          case 'get_leverage_scores': {
            const { projectPath } = GetLeverageScoresSchema.parse(args);
            const roadmapService = await getProjectRoadmapService(projectPath);

            if (!roadmapService.isLoaded()) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    projectPath,
                    status: 'no_roadmap',
                    scores: [],
                  }, null, 2),
                }],
              };
            }

            const scores = roadmapService.calculateLeverageScores();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  projectPath,
                  count: scores.length,
                  scores,
                }, null, 2),
              }],
            };
          }

          case 'render_roadmap_terminal': {
            const { projectPath } = GetTerminalViewSchema.parse(args);
            const roadmapService = await getProjectRoadmapService(projectPath);

            if (!roadmapService.isLoaded()) {
              return {
                content: [{
                  type: 'text',
                  text: `No roadmap found for project at ${projectPath}.\n\nTo create a roadmap, add a ROADMAP.md file or use module planning tools.`,
                }],
              };
            }

            const terminal = roadmapService.generateTerminalView();
            return {
              content: [{
                type: 'text',
                text: `Project: ${projectPath}\n\n${terminal}`,
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
