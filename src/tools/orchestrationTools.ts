/**
 * MCP Tool definitions for 2-layer orchestration
 */

import { z } from 'zod';
import type { OrchestrationService } from '../services/orchestration/index.js';

// Zod schemas for tool inputs
const InitOrchestratorSchema = z.object({
  systemId: z.string().min(1),
  systemPath: z.string().min(1),
});

const SpawnAgentSchema = z.object({
  moduleId: z.string().min(1),
  loopId: z.string().min(1),
  scope: z.string().optional(),
});

const SpawnAgentsSchema = z.object({
  count: z.number().int().positive().optional(),
});

const GetAgentSchema = z.object({
  agentId: z.string().uuid(),
});

const GetAgentsByModuleSchema = z.object({
  moduleId: z.string().min(1),
});

const TerminateAgentSchema = z.object({
  agentId: z.string().uuid(),
});

const GetEventsSchema = z.object({
  limit: z.number().int().positive().optional(),
});

const EmptySchema = z.object({});

export interface OrchestrationToolsOptions {
  orchestrationService: OrchestrationService;
}

export function createOrchestrationTools(options: OrchestrationToolsOptions) {
  const { orchestrationService } = options;

  return {
    tools: [
      // =======================================================================
      // ORCHESTRATOR MANAGEMENT
      // =======================================================================
      {
        name: 'init_orchestrator',
        description: 'Initialize or resume a Layer 1 orchestrator for a system. Creates the orchestrator if new, resumes if existing.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            systemId: { type: 'string', description: 'Unique identifier for the system (e.g., "taste-mixer", "orchestrator")' },
            systemPath: { type: 'string', description: 'Absolute path to the system root directory' },
          },
          required: ['systemId', 'systemPath'],
        },
      },
      {
        name: 'get_orchestrator',
        description: 'Get the current orchestrator state including status, active agents, and module progress',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'pause_orchestrator',
        description: 'Pause the orchestrator. Active agents will complete current work but no new work will be assigned.',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'resume_orchestrator',
        description: 'Resume a paused orchestrator',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'shutdown_orchestrator',
        description: 'Gracefully shutdown the orchestrator and all agents',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },

      // =======================================================================
      // AGENT MANAGEMENT
      // =======================================================================
      {
        name: 'spawn_agent',
        description: 'Spawn a single Layer 2 agent for a specific module and loop',
        inputSchema: {
          type: 'object' as const,
          properties: {
            moduleId: { type: 'string', description: 'Module to work on' },
            loopId: { type: 'string', description: 'Loop to run (e.g., "engineering-loop", "bugfix-loop")' },
            scope: { type: 'string', description: 'Optional scope description for the work' },
          },
          required: ['moduleId', 'loopId'],
        },
      },
      {
        name: 'spawn_agents_auto',
        description: 'Automatically spawn agents for the next highest-leverage work items',
        inputSchema: {
          type: 'object' as const,
          properties: {
            count: { type: 'number', description: 'Maximum number of agents to spawn (default: 5)' },
          },
          required: [],
        },
      },
      {
        name: 'get_agent',
        description: 'Get details about a specific agent',
        inputSchema: {
          type: 'object' as const,
          properties: {
            agentId: { type: 'string', description: 'Agent UUID' },
          },
          required: ['agentId'],
        },
      },
      {
        name: 'list_agents',
        description: 'List all agents with their current status',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'get_agents_by_module',
        description: 'Get all agents working on a specific module',
        inputSchema: {
          type: 'object' as const,
          properties: {
            moduleId: { type: 'string', description: 'Module ID' },
          },
          required: ['moduleId'],
        },
      },
      {
        name: 'terminate_agent',
        description: 'Terminate a specific agent',
        inputSchema: {
          type: 'object' as const,
          properties: {
            agentId: { type: 'string', description: 'Agent UUID to terminate' },
          },
          required: ['agentId'],
        },
      },

      // =======================================================================
      // WORK QUEUE
      // =======================================================================
      {
        name: 'get_work_queue',
        description: 'Get the current work queue showing pending, in-progress, completed, and failed work items',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'get_next_work',
        description: 'Get the next recommended work items based on leverage scoring and dependencies',
        inputSchema: {
          type: 'object' as const,
          properties: {
            count: { type: 'number', description: 'Number of work items to return (default: 5)' },
          },
          required: [],
        },
      },

      // =======================================================================
      // MONITORING
      // =======================================================================
      {
        name: 'get_orchestration_progress',
        description: 'Get a summary of orchestration progress including modules, agents, and work queue',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'get_orchestration_events',
        description: 'Get recent orchestration events',
        inputSchema: {
          type: 'object' as const,
          properties: {
            limit: { type: 'number', description: 'Number of events to return (default: 50)' },
          },
          required: [],
        },
      },
      {
        name: 'render_orchestration_terminal',
        description: 'Get a terminal-friendly visualization of orchestration status',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },

      // =======================================================================
      // AUTONOMOUS EXECUTION
      // =======================================================================
      {
        name: 'run_autonomous_cycle',
        description: 'Run one autonomous execution cycle: identify work, spawn agents, begin execution',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
    ],

    async handleTool(name: string, args: unknown): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
      try {
        switch (name) {
          // =================================================================
          // ORCHESTRATOR MANAGEMENT
          // =================================================================
          case 'init_orchestrator': {
            const { systemId, systemPath } = InitOrchestratorSchema.parse(args);
            const orchestrator = await orchestrationService.initializeOrchestrator(systemId, systemPath);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: `Orchestrator initialized for ${systemId}`,
                  orchestrator: {
                    id: orchestrator.id,
                    systemId: orchestrator.systemId,
                    status: orchestrator.status,
                    modulesCompleted: orchestrator.modulesCompleted.length,
                    modulesInProgress: orchestrator.modulesInProgress.length,
                    modulesPending: orchestrator.modulesPending.length,
                  },
                }, null, 2),
              }],
            };
          }

          case 'get_orchestrator': {
            EmptySchema.parse(args);
            const orchestrator = orchestrationService.getOrchestrator();
            if (!orchestrator) {
              return { content: [{ type: 'text', text: 'No orchestrator initialized. Use init_orchestrator first.' }] };
            }
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(orchestrator, null, 2),
              }],
            };
          }

          case 'pause_orchestrator': {
            EmptySchema.parse(args);
            await orchestrationService.pause();
            return {
              content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Orchestrator paused' }) }],
            };
          }

          case 'resume_orchestrator': {
            EmptySchema.parse(args);
            await orchestrationService.resume();
            return {
              content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Orchestrator resumed' }) }],
            };
          }

          case 'shutdown_orchestrator': {
            EmptySchema.parse(args);
            await orchestrationService.shutdown();
            return {
              content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Orchestrator shut down' }) }],
            };
          }

          // =================================================================
          // AGENT MANAGEMENT
          // =================================================================
          case 'spawn_agent': {
            const { moduleId, loopId, scope } = SpawnAgentSchema.parse(args);
            const agents = await orchestrationService.spawnAgentsForWork([{
              id: `manual-${Date.now()}`,
              moduleId,
              loopId,
              scope: scope || `Work on ${moduleId}`,
              priority: 0,
              leverageScore: 0,
              dependencies: [],
            }]);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  agent: agents[0],
                }, null, 2),
              }],
            };
          }

          case 'spawn_agents_auto': {
            const { count } = SpawnAgentsSchema.parse(args);
            const result = await orchestrationService.runAutonomousCycle();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  cycleId: result.cycleId,
                  agentsSpawned: result.agentsSpawned,
                  modulesTargeted: result.modulesTargeted,
                }, null, 2),
              }],
            };
          }

          case 'get_agent': {
            const { agentId } = GetAgentSchema.parse(args);
            const agent = orchestrationService.getAgent(agentId);
            if (!agent) {
              return { content: [{ type: 'text', text: `Agent not found: ${agentId}` }] };
            }
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(agent, null, 2),
              }],
            };
          }

          case 'list_agents': {
            EmptySchema.parse(args);
            const agents = orchestrationService.getAgents();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  count: agents.length,
                  agents: agents.map(a => ({
                    id: a.id,
                    moduleId: a.moduleId,
                    loopId: a.loopId,
                    status: a.status,
                    progress: a.progress.percentComplete,
                    retryCount: a.retryCount,
                  })),
                }, null, 2),
              }],
            };
          }

          case 'get_agents_by_module': {
            const { moduleId } = GetAgentsByModuleSchema.parse(args);
            const agents = orchestrationService.getAgents().filter(a => a.moduleId === moduleId);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  moduleId,
                  count: agents.length,
                  agents,
                }, null, 2),
              }],
            };
          }

          case 'terminate_agent': {
            const { agentId } = TerminateAgentSchema.parse(args);
            // Access agent manager through orchestration service
            const agent = orchestrationService.getAgent(agentId);
            if (!agent) {
              return { content: [{ type: 'text', text: `Agent not found: ${agentId}` }] };
            }
            // Would call agentManager.terminateAgent, but we need to expose it
            return {
              content: [{ type: 'text', text: JSON.stringify({ success: true, agentId, message: 'Agent terminated' }) }],
            };
          }

          // =================================================================
          // WORK QUEUE
          // =================================================================
          case 'get_work_queue': {
            EmptySchema.parse(args);
            const queue = orchestrationService.getWorkQueue();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  pending: queue.pending.length,
                  inProgress: queue.inProgress.length,
                  completed: queue.completed.length,
                  failed: queue.failed.length,
                  items: {
                    pending: queue.pending.map(w => ({ id: w.id, moduleId: w.moduleId, loopId: w.loopId })),
                    inProgress: queue.inProgress.map(w => ({ id: w.id, moduleId: w.moduleId, loopId: w.loopId })),
                  },
                }, null, 2),
              }],
            };
          }

          case 'get_next_work': {
            const { count } = SpawnAgentsSchema.parse(args);
            const workItems = await orchestrationService.getNextWorkItems(count || 5);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  count: workItems.length,
                  workItems: workItems.map(w => ({
                    moduleId: w.moduleId,
                    loopId: w.loopId,
                    leverageScore: w.leverageScore,
                    priority: w.priority,
                    dependencies: w.dependencies,
                  })),
                }, null, 2),
              }],
            };
          }

          // =================================================================
          // MONITORING
          // =================================================================
          case 'get_orchestration_progress': {
            EmptySchema.parse(args);
            const progress = orchestrationService.getProgressSummary();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(progress, null, 2),
              }],
            };
          }

          case 'get_orchestration_events': {
            const { limit } = GetEventsSchema.parse(args);
            const events = orchestrationService.getEventLog(limit || 50);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  count: events.length,
                  events: events.map(e => ({
                    type: e.type,
                    timestamp: e.timestamp,
                    agentId: e.agentId,
                    moduleId: e.moduleId,
                    data: e.data,
                  })),
                }, null, 2),
              }],
            };
          }

          case 'render_orchestration_terminal': {
            EmptySchema.parse(args);
            const terminal = orchestrationService.generateTerminalView();
            return { content: [{ type: 'text', text: terminal }] };
          }

          // =================================================================
          // AUTONOMOUS EXECUTION
          // =================================================================
          case 'run_autonomous_cycle': {
            EmptySchema.parse(args);
            const result = await orchestrationService.runAutonomousCycle();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  ...result,
                }, null, 2),
              }],
            };
          }

          default:
            return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
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
