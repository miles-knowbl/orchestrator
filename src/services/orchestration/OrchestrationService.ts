/**
 * Orchestration Service
 *
 * Layer 1 System Orchestrator - the persistent, human-facing portal.
 * Manages the dream state, spawns Layer 2 agents, coordinates work,
 * and tracks progress toward system completion.
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  Orchestrator,
  OrchestratorStatus,
  Agent,
  WorkItem,
  WorkQueue,
  OrchestrationConfig,
  OrchestrationServiceOptions,
  OrchestrationEvent,
  ConcurrencyMode,
  DEFAULT_CONFIG,
} from './types.js';
import { AgentManager, SpawnAgentOptions } from './AgentManager.js';
import { WorktreeManager } from './WorktreeManager.js';
import type { RoadmapService } from '../roadmapping/index.js';
import type { ExecutionEngine } from '../ExecutionEngine.js';
import type { LoopComposer } from '../LoopComposer.js';
import type { MemoryService } from '../MemoryService.js';

export interface OrchestrationServiceDependencies {
  roadmapService?: RoadmapService;
  executionEngine?: ExecutionEngine;
  loopComposer?: LoopComposer;
  memoryService?: MemoryService;
}

export class OrchestrationService extends EventEmitter {
  private dataDir: string;
  private config: OrchestrationConfig;
  private orchestrator?: Orchestrator;
  private agentManager?: AgentManager;
  private worktreeManager?: WorktreeManager;
  private workQueue: WorkQueue = {
    pending: [],
    inProgress: [],
    completed: [],
    failed: [],
  };
  private eventLog: OrchestrationEvent[] = [];

  // Dependencies
  private roadmapService?: RoadmapService;
  private executionEngine?: ExecutionEngine;
  private loopComposer?: LoopComposer;
  private memoryService?: MemoryService;

  constructor(options: OrchestrationServiceOptions) {
    super();
    this.dataDir = options.dataDir;
    this.config = {
      defaultConcurrencyMode: 'parallel-threads',
      maxParallelAgents: undefined,
      defaultMaxRetries: 3,
      retryDelayMs: 5000,
      escalationThreshold: 10,
      worktreesDirectory: '.worktrees',
      branchPrefix: 'module/',
      autoMergeOnComplete: false,
      heartbeatIntervalMs: 5000,
      heartbeatTimeoutMs: 30000,
      logLevel: 'info',
      ...options.config,
    };
  }

  /**
   * Set dependencies
   */
  setDependencies(deps: OrchestrationServiceDependencies): void {
    this.roadmapService = deps.roadmapService;
    this.executionEngine = deps.executionEngine;
    this.loopComposer = deps.loopComposer;
    this.memoryService = deps.memoryService;
  }

  /**
   * Initialize or resume an orchestrator for a system
   */
  async initializeOrchestrator(systemId: string, systemPath: string): Promise<Orchestrator> {
    // Try to load existing orchestrator state
    const existingState = await this.loadOrchestratorState(systemId);

    if (existingState) {
      this.orchestrator = existingState;
      this.orchestrator.status = 'active';
      this.orchestrator.lastActiveAt = new Date();

      // Initialize managers with existing state
      await this.initializeManagers();

      this.logEvent('orchestrator:resumed', { systemId });
      return this.orchestrator;
    }

    // Create new orchestrator
    const orchestratorId = randomUUID();

    // Detect main branch
    const mainBranch = await this.detectMainBranch(systemPath);

    this.orchestrator = {
      id: orchestratorId,
      systemId,
      systemPath,
      status: 'initializing',
      mainBranch,
      worktreesPath: path.join(systemPath, this.config.worktreesDirectory),
      activeAgents: [],
      activeModules: [],
      modulesCompleted: [],
      modulesInProgress: [],
      modulesPending: [],
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };

    // Initialize managers
    await this.initializeManagers();

    // Load module state from roadmap if available
    await this.syncWithRoadmap();

    this.orchestrator.status = 'active';
    await this.saveOrchestratorState();

    this.logEvent('orchestrator:created', { orchestratorId, systemId });
    return this.orchestrator;
  }

  /**
   * Initialize agent and worktree managers
   */
  private async initializeManagers(): Promise<void> {
    if (!this.orchestrator) {
      throw new Error('Orchestrator not initialized');
    }

    // Initialize worktree manager
    this.worktreeManager = new WorktreeManager({
      systemPath: this.orchestrator.systemPath,
      worktreesDirectory: this.config.worktreesDirectory,
      branchPrefix: this.config.branchPrefix,
      mainBranch: this.orchestrator.mainBranch,
    });
    await this.worktreeManager.initialize();

    // Initialize agent manager
    this.agentManager = new AgentManager({
      orchestratorId: this.orchestrator.id,
      systemPath: this.orchestrator.systemPath,
      config: this.config,
    });
    this.agentManager.setWorktreeManager(this.worktreeManager);

    // Wire up event forwarding
    this.agentManager.on('event', (event: OrchestrationEvent) => {
      this.eventLog.push(event);
      this.emit('event', event);
    });

    await this.agentManager.initialize();
  }

  /**
   * Sync orchestrator state with roadmap service
   */
  private async syncWithRoadmap(): Promise<void> {
    if (!this.roadmapService || !this.orchestrator) return;

    const roadmap = this.roadmapService.getRoadmap();

    this.orchestrator.modulesPending = roadmap.modules
      .filter(m => m.status === 'pending')
      .map(m => m.id);

    this.orchestrator.modulesInProgress = roadmap.modules
      .filter(m => m.status === 'in-progress')
      .map(m => m.id);

    this.orchestrator.modulesCompleted = roadmap.modules
      .filter(m => m.status === 'complete')
      .map(m => m.id);
  }

  /**
   * Get the next work items based on leverage and dependencies
   */
  async getNextWorkItems(count: number = 5): Promise<WorkItem[]> {
    if (!this.roadmapService) {
      return [];
    }

    // Get available modules (dependencies met)
    const available = this.roadmapService.getNextAvailableModules();

    // Calculate leverage scores
    const leverageScores = this.roadmapService.calculateLeverageScores();
    const scoreMap = new Map(leverageScores.map(s => [s.moduleId, s.score]));

    // Build work items
    const workItems: WorkItem[] = available.slice(0, count).map(module => ({
      id: randomUUID(),
      moduleId: module.id,
      loopId: 'engineering-loop', // Default to engineering loop
      scope: module.description,
      priority: module.layer, // Lower layer = higher priority
      leverageScore: scoreMap.get(module.id) || 0,
      dependencies: module.dependsOn,
    }));

    // Sort by leverage score (descending)
    workItems.sort((a, b) => b.leverageScore - a.leverageScore);

    return workItems;
  }

  /**
   * Spawn agents for work items
   */
  async spawnAgentsForWork(workItems: WorkItem[]): Promise<Agent[]> {
    if (!this.agentManager || !this.orchestrator) {
      throw new Error('Orchestrator not initialized');
    }

    // Decide concurrency mode
    const concurrencyDecision = this.agentManager.decideConcurrencyMode(
      workItems.map(w => ({ moduleId: w.moduleId }))
    );

    this.logEvent('work:assigned', {
      workItems: workItems.map(w => w.moduleId),
      concurrency: concurrencyDecision,
    });

    const agents: Agent[] = [];

    for (const workItem of workItems) {
      // Add to in-progress queue
      this.workQueue.inProgress.push(workItem);

      // Spawn agent
      const agent = await this.agentManager.spawnAgent({
        moduleId: workItem.moduleId,
        loopId: workItem.loopId,
        scope: workItem.scope,
      });

      agents.push(agent);

      // Update orchestrator state
      this.orchestrator.activeAgents.push(agent.id);
      if (!this.orchestrator.activeModules.includes(workItem.moduleId)) {
        this.orchestrator.activeModules.push(workItem.moduleId);
      }
      if (!this.orchestrator.modulesInProgress.includes(workItem.moduleId)) {
        this.orchestrator.modulesInProgress.push(workItem.moduleId);
        const pendingIdx = this.orchestrator.modulesPending.indexOf(workItem.moduleId);
        if (pendingIdx >= 0) {
          this.orchestrator.modulesPending.splice(pendingIdx, 1);
        }
      }
    }

    await this.saveOrchestratorState();
    return agents;
  }

  /**
   * Handle agent completion
   */
  async handleAgentComplete(agentId: string): Promise<void> {
    if (!this.orchestrator || !this.agentManager) return;

    const agent = this.agentManager.getAgent(agentId);
    if (!agent) return;

    // Move work item to completed
    const workItemIdx = this.workQueue.inProgress.findIndex(w => w.moduleId === agent.moduleId);
    if (workItemIdx >= 0) {
      const workItem = this.workQueue.inProgress.splice(workItemIdx, 1)[0];
      this.workQueue.completed.push(workItem);
    }

    // Update orchestrator state
    const agentIdx = this.orchestrator.activeAgents.indexOf(agentId);
    if (agentIdx >= 0) {
      this.orchestrator.activeAgents.splice(agentIdx, 1);
    }

    // Check if module is complete (no more agents working on it)
    const moduleAgents = this.agentManager.getAgentsByModule(agent.moduleId);
    const activeModuleAgents = moduleAgents.filter(a =>
      a.status === 'active' || a.status === 'spawning' || a.status === 'retrying'
    );

    if (activeModuleAgents.length === 0) {
      // Module complete
      const moduleIdx = this.orchestrator.activeModules.indexOf(agent.moduleId);
      if (moduleIdx >= 0) {
        this.orchestrator.activeModules.splice(moduleIdx, 1);
      }

      const inProgressIdx = this.orchestrator.modulesInProgress.indexOf(agent.moduleId);
      if (inProgressIdx >= 0) {
        this.orchestrator.modulesInProgress.splice(inProgressIdx, 1);
      }

      if (!this.orchestrator.modulesCompleted.includes(agent.moduleId)) {
        this.orchestrator.modulesCompleted.push(agent.moduleId);
      }

      // Update roadmap if available
      if (this.roadmapService) {
        await this.roadmapService.updateModuleStatus(agent.moduleId, 'complete');
      }

      this.logEvent('work:completed', {
        moduleId: agent.moduleId,
        agentId,
      });
    }

    await this.saveOrchestratorState();
  }

  /**
   * Handle agent failure (after all retries exhausted)
   */
  async handleAgentFailed(agentId: string): Promise<void> {
    if (!this.orchestrator || !this.agentManager) return;

    const agent = this.agentManager.getAgent(agentId);
    if (!agent) return;

    // Move work item to failed
    const workItemIdx = this.workQueue.inProgress.findIndex(w => w.moduleId === agent.moduleId);
    if (workItemIdx >= 0) {
      const workItem = this.workQueue.inProgress.splice(workItemIdx, 1)[0];
      this.workQueue.failed.push(workItem);
    }

    // Update orchestrator state
    const agentIdx = this.orchestrator.activeAgents.indexOf(agentId);
    if (agentIdx >= 0) {
      this.orchestrator.activeAgents.splice(agentIdx, 1);
    }

    await this.saveOrchestratorState();

    // This is an escalation - human intervention needed
    this.emit('escalation', {
      type: 'agent-failed',
      agentId,
      moduleId: agent.moduleId,
      error: agent.lastError,
      context: agent.failureContext,
    });
  }

  /**
   * Run autonomous execution cycle
   */
  async runAutonomousCycle(): Promise<{
    cycleId: string;
    agentsSpawned: number;
    modulesTargeted: string[];
  }> {
    if (!this.orchestrator) {
      throw new Error('Orchestrator not initialized');
    }

    const cycleId = randomUUID();

    // Get next work items
    const workItems = await this.getNextWorkItems(5);

    if (workItems.length === 0) {
      return { cycleId, agentsSpawned: 0, modulesTargeted: [] };
    }

    // Spawn agents
    const agents = await this.spawnAgentsForWork(workItems);

    return {
      cycleId,
      agentsSpawned: agents.length,
      modulesTargeted: workItems.map(w => w.moduleId),
    };
  }

  /**
   * Get orchestrator state
   */
  getOrchestrator(): Orchestrator | undefined {
    return this.orchestrator;
  }

  /**
   * Get all agents
   */
  getAgents(): Agent[] {
    return this.agentManager?.getAllAgents() || [];
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agentManager?.getAgent(agentId);
  }

  /**
   * Get work queue
   */
  getWorkQueue(): WorkQueue {
    return this.workQueue;
  }

  /**
   * Get event log
   */
  getEventLog(limit?: number): OrchestrationEvent[] {
    if (limit) {
      return this.eventLog.slice(-limit);
    }
    return this.eventLog;
  }

  /**
   * Get progress summary
   */
  getProgressSummary(): {
    orchestrator: {
      id: string;
      systemId: string;
      status: OrchestratorStatus;
    } | null;
    modules: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
      percentComplete: number;
    };
    agents: {
      total: number;
      active: number;
      completed: number;
      failed: number;
    };
    workQueue: {
      pending: number;
      inProgress: number;
      completed: number;
      failed: number;
    };
  } {
    const agentSummary = this.agentManager?.getSummary() || {
      total: 0,
      byStatus: {
        spawning: 0,
        active: 0,
        blocked: 0,
        retrying: 0,
        completed: 0,
        failed: 0,
        terminated: 0,
      },
      byModule: {},
      activeCount: 0,
    };

    const totalModules =
      (this.orchestrator?.modulesCompleted.length || 0) +
      (this.orchestrator?.modulesInProgress.length || 0) +
      (this.orchestrator?.modulesPending.length || 0);

    const completedModules = this.orchestrator?.modulesCompleted.length || 0;

    return {
      orchestrator: this.orchestrator ? {
        id: this.orchestrator.id,
        systemId: this.orchestrator.systemId,
        status: this.orchestrator.status,
      } : null,
      modules: {
        total: totalModules,
        completed: completedModules,
        inProgress: this.orchestrator?.modulesInProgress.length || 0,
        pending: this.orchestrator?.modulesPending.length || 0,
        percentComplete: totalModules > 0
          ? Math.round((completedModules / totalModules) * 100)
          : 0,
      },
      agents: {
        total: agentSummary.total,
        active: agentSummary.activeCount,
        completed: agentSummary.byStatus.completed,
        failed: agentSummary.byStatus.failed,
      },
      workQueue: {
        pending: this.workQueue.pending.length,
        inProgress: this.workQueue.inProgress.length,
        completed: this.workQueue.completed.length,
        failed: this.workQueue.failed.length,
      },
    };
  }

  /**
   * Pause the orchestrator
   */
  async pause(): Promise<void> {
    if (!this.orchestrator) return;

    this.orchestrator.status = 'paused';
    await this.saveOrchestratorState();

    this.logEvent('orchestrator:paused', {});
  }

  /**
   * Resume the orchestrator
   */
  async resume(): Promise<void> {
    if (!this.orchestrator) return;

    this.orchestrator.status = 'active';
    this.orchestrator.lastActiveAt = new Date();
    await this.saveOrchestratorState();

    this.logEvent('orchestrator:resumed', {});
  }

  /**
   * Shutdown the orchestrator
   */
  async shutdown(): Promise<void> {
    if (!this.orchestrator) return;

    // Shutdown agent manager
    if (this.agentManager) {
      await this.agentManager.shutdown();
    }

    this.orchestrator.status = 'terminated';
    await this.saveOrchestratorState();

    this.logEvent('orchestrator:terminated', {});
  }

  /**
   * Generate terminal visualization
   */
  generateTerminalView(): string {
    const summary = this.getProgressSummary();
    const agents = this.getAgents();

    let output = `
╔════════════════════════════════════════════════════════════════════╗
║                    ORCHESTRATOR STATUS                              ║
╠════════════════════════════════════════════════════════════════════╣`;

    if (summary.orchestrator) {
      output += `
║  System: ${summary.orchestrator.systemId.padEnd(52)}║
║  Status: ${summary.orchestrator.status.padEnd(52)}║`;
    }

    output += `
╠════════════════════════════════════════════════════════════════════╣
║  MODULES                                                           ║
║  ────────────────────────────────────────────────────────────────  ║
║  Total: ${String(summary.modules.total).padEnd(8)} Completed: ${String(summary.modules.completed).padEnd(8)} In Progress: ${String(summary.modules.inProgress).padEnd(8)}║
║  Pending: ${String(summary.modules.pending).padEnd(8)} Progress: ${String(summary.modules.percentComplete + '%').padEnd(29)}║
╠════════════════════════════════════════════════════════════════════╣
║  AGENTS                                                            ║
║  ────────────────────────────────────────────────────────────────  ║
║  Total: ${String(summary.agents.total).padEnd(8)} Active: ${String(summary.agents.active).padEnd(10)} Completed: ${String(summary.agents.completed).padEnd(10)}║`;

    if (agents.length > 0) {
      output += `
║                                                                    ║`;

      for (const agent of agents.filter(a => a.status === 'active' || a.status === 'spawning')) {
        const status = agent.status === 'active' ? '●' : '○';
        const progress = `${agent.progress.percentComplete}%`;
        output += `
║  ${status} ${agent.moduleId.padEnd(20)} ${agent.loopId.padEnd(20)} ${progress.padEnd(8)}║`;
      }
    }

    output += `
╠════════════════════════════════════════════════════════════════════╣
║  WORK QUEUE                                                        ║
║  ────────────────────────────────────────────────────────────────  ║
║  Pending: ${String(summary.workQueue.pending).padEnd(8)} In Progress: ${String(summary.workQueue.inProgress).padEnd(8)} Completed: ${String(summary.workQueue.completed).padEnd(8)}║
╚════════════════════════════════════════════════════════════════════╝`;

    return output;
  }

  /**
   * Detect the main branch of a repository
   */
  private async detectMainBranch(systemPath: string): Promise<string> {
    try {
      // Check for common main branch names
      const { spawn } = await import('child_process');

      return new Promise((resolve) => {
        const proc = spawn('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: systemPath });
        let output = '';

        proc.stdout.on('data', (data) => {
          output += data.toString();
        });

        proc.on('close', () => {
          const branch = output.trim();
          resolve(branch || 'main');
        });

        proc.on('error', () => {
          resolve('main');
        });
      });
    } catch {
      return 'main';
    }
  }

  /**
   * Log an orchestration event
   */
  private logEvent(type: string, data: Record<string, unknown>): void {
    const event: OrchestrationEvent = {
      id: randomUUID(),
      type: type as any,
      orchestratorId: this.orchestrator?.id || 'unknown',
      timestamp: new Date(),
      data,
    };

    this.eventLog.push(event);
    this.emit('event', event);
  }

  /**
   * Save orchestrator state to disk
   */
  private async saveOrchestratorState(): Promise<void> {
    if (!this.orchestrator) return;

    const statePath = path.join(this.dataDir, 'orchestrators', `${this.orchestrator.systemId}.json`);
    await fs.mkdir(path.dirname(statePath), { recursive: true });
    await fs.writeFile(statePath, JSON.stringify(this.orchestrator, null, 2));
  }

  /**
   * Load orchestrator state from disk
   */
  private async loadOrchestratorState(systemId: string): Promise<Orchestrator | null> {
    const statePath = path.join(this.dataDir, 'orchestrators', `${systemId}.json`);

    try {
      const content = await fs.readFile(statePath, 'utf-8');
      const state = JSON.parse(content);

      // Convert date strings back to Date objects
      state.createdAt = new Date(state.createdAt);
      state.lastActiveAt = new Date(state.lastActiveAt);

      return state;
    } catch {
      return null;
    }
  }
}
