/**
 * Agent Manager
 *
 * Manages Layer 2 agents (ephemeral task workers).
 * Handles spawning, monitoring, and coordinating agents.
 * Uses worker threads for true parallelism.
 */

import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises';
import type {
  Agent,
  AgentStatus,
  AgentProgress,
  AgentManagerOptions,
  OrchestrationConfig,
  OrchestrationEvent,
  FailureDecision,
  FailureAction,
  ConcurrencyMode,
  ConcurrencyDecision,
} from './types.js';
import type { WorktreeManager } from './WorktreeManager.js';

export interface SpawnAgentOptions {
  moduleId: string;
  loopId: string;
  scope: string;
  priority?: number;
  maxRetries?: number;
}

export interface AgentMessage {
  type: 'status' | 'progress' | 'heartbeat' | 'error' | 'complete' | 'blocked';
  agentId: string;
  data: Record<string, unknown>;
}

export class AgentManager extends EventEmitter {
  private orchestratorId: string;
  private systemPath: string;
  private config: OrchestrationConfig;
  private agents: Map<string, Agent> = new Map();
  private workers: Map<string, Worker> = new Map();
  private worktreeManager?: WorktreeManager;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(options: AgentManagerOptions) {
    super();
    this.orchestratorId = options.orchestratorId;
    this.systemPath = options.systemPath;
    this.config = options.config;
  }

  /**
   * Set the worktree manager
   */
  setWorktreeManager(manager: WorktreeManager): void {
    this.worktreeManager = manager;
  }

  /**
   * Initialize the agent manager
   */
  async initialize(): Promise<void> {
    // Start heartbeat monitoring
    this.startHeartbeatMonitoring();

    // Load any persisted agent state
    await this.loadAgentState();
  }

  /**
   * Spawn a new agent
   */
  async spawnAgent(options: SpawnAgentOptions): Promise<Agent> {
    const agentId = randomUUID();

    // Create worktree for module if needed
    let worktreePath: string | undefined;
    let branchName: string | undefined;

    if (this.worktreeManager) {
      const worktree = await this.worktreeManager.createWorktree(options.moduleId);
      worktreePath = worktree.worktreePath;
      branchName = worktree.branchName;
    }

    const agent: Agent = {
      id: agentId,
      orchestratorId: this.orchestratorId,
      moduleId: options.moduleId,
      loopId: options.loopId,
      scope: options.scope,
      worktreePath,
      branchName,
      status: 'spawning',
      progress: {
        phasesCompleted: 0,
        phasesTotal: 0,
        skillsCompleted: 0,
        skillsTotal: 0,
        gatesPassed: 0,
        gatesTotal: 0,
        percentComplete: 0,
      },
      retryCount: 0,
      maxRetries: options.maxRetries ?? this.config.defaultMaxRetries,
      spawnedAt: new Date(),
      lastHeartbeat: new Date(),
    };

    this.agents.set(agentId, agent);

    // Emit spawn event
    this.emitEvent('agent:spawned', { agent });

    // Start the agent worker
    await this.startAgentWorker(agent);

    return agent;
  }

  /**
   * Start a worker thread for an agent
   */
  private async startAgentWorker(agent: Agent): Promise<void> {
    // For now, we'll use a simplified in-process execution model
    // In production, this would spawn actual worker threads
    // that run the execution engine independently

    // Update status
    agent.status = 'active';
    agent.startedAt = new Date();
    this.emitEvent('agent:started', { agentId: agent.id });

    // In a full implementation, we would:
    // 1. Create a Worker with the agent-worker.js script
    // 2. Pass configuration via workerData
    // 3. Set up message handlers for progress/errors/completion
    //
    // const worker = new Worker(path.join(__dirname, 'agent-worker.js'), {
    //   workerData: {
    //     agentId: agent.id,
    //     moduleId: agent.moduleId,
    //     loopId: agent.loopId,
    //     scope: agent.scope,
    //     worktreePath: agent.worktreePath,
    //     config: this.config,
    //   },
    // });
    //
    // this.workers.set(agent.id, worker);
    // this.setupWorkerHandlers(agent, worker);

    // For now, mark as ready for execution
    // The actual execution will be driven by the orchestration service
  }

  /**
   * Set up message handlers for a worker
   */
  private setupWorkerHandlers(agent: Agent, worker: Worker): void {
    worker.on('message', (message: AgentMessage) => {
      this.handleAgentMessage(agent, message);
    });

    worker.on('error', (error) => {
      this.handleAgentError(agent, error);
    });

    worker.on('exit', (code) => {
      this.handleAgentExit(agent, code);
    });
  }

  /**
   * Handle a message from an agent
   */
  private handleAgentMessage(agent: Agent, message: AgentMessage): void {
    switch (message.type) {
      case 'status':
        agent.status = message.data.status as AgentStatus;
        this.emitEvent(`agent:${agent.status}`, { agentId: agent.id, data: message.data });
        break;

      case 'progress':
        agent.progress = message.data.progress as AgentProgress;
        agent.currentPhase = message.data.phase as any;
        this.emitEvent('agent:progress', { agentId: agent.id, progress: agent.progress });
        break;

      case 'heartbeat':
        agent.lastHeartbeat = new Date();
        break;

      case 'error':
        agent.lastError = message.data.error as string;
        this.handleAgentError(agent, new Error(agent.lastError));
        break;

      case 'complete':
        this.handleAgentComplete(agent, message.data);
        break;

      case 'blocked':
        agent.status = 'blocked';
        this.emitEvent('agent:blocked', { agentId: agent.id, reason: message.data.reason });
        break;
    }

    this.persistAgentState();
  }

  /**
   * Handle agent error
   */
  private async handleAgentError(agent: Agent, error: Error): Promise<void> {
    agent.lastError = error.message;
    agent.failureContext = {
      error: error.message,
      stack: error.stack,
      phase: agent.currentPhase,
      progress: agent.progress,
      timestamp: new Date(),
    };

    // Determine failure action
    const decision = this.decideFailureAction(agent);

    switch (decision.action) {
      case 'retry':
        await this.retryAgent(agent, decision);
        break;

      case 'reassign':
        await this.reassignAgent(agent, decision);
        break;

      case 'escalate':
        await this.escalateAgent(agent, decision);
        break;
    }
  }

  /**
   * Decide what to do when an agent fails
   */
  private decideFailureAction(agent: Agent): FailureDecision {
    // If we haven't exceeded retry limit, retry with context
    if (agent.retryCount < agent.maxRetries) {
      return {
        action: 'retry',
        reasoning: `Retry ${agent.retryCount + 1}/${agent.maxRetries}: ${agent.lastError}`,
        context: agent.failureContext || {},
        nextSteps: [
          'Analyze failure context',
          'Adjust approach based on error',
          'Retry execution',
        ],
      };
    }

    // If retries exhausted, try reassigning to fresh agent
    if (agent.retryCount === agent.maxRetries) {
      return {
        action: 'reassign',
        reasoning: `Retries exhausted (${agent.maxRetries}). Spawning fresh agent.`,
        context: {
          ...agent.failureContext,
          previousAttempts: agent.retryCount,
        },
        nextSteps: [
          'Terminate current agent',
          'Spawn new agent with failure context',
          'New agent reviews what went wrong',
        ],
      };
    }

    // Last resort: escalate to human
    return {
      action: 'escalate',
      reasoning: 'All automated recovery attempts failed. Human intervention required.',
      context: {
        ...agent.failureContext,
        previousAttempts: agent.retryCount,
        moduleId: agent.moduleId,
        loopId: agent.loopId,
      },
      nextSteps: [
        'Pause agent execution',
        'Notify human operator',
        'Wait for intervention',
      ],
    };
  }

  /**
   * Retry an agent with context from failure
   */
  private async retryAgent(agent: Agent, decision: FailureDecision): Promise<void> {
    agent.retryCount++;
    agent.status = 'retrying';

    this.emitEvent('failure:retry', {
      agentId: agent.id,
      attempt: agent.retryCount,
      decision,
    });

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, this.config.retryDelayMs));

    // Restart the agent worker with failure context
    agent.status = 'spawning';
    await this.startAgentWorker(agent);
  }

  /**
   * Reassign work to a fresh agent
   */
  private async reassignAgent(agent: Agent, decision: FailureDecision): Promise<void> {
    this.emitEvent('failure:reassign', {
      agentId: agent.id,
      decision,
    });

    // Terminate current agent
    await this.terminateAgent(agent.id);

    // Spawn new agent with context from failure
    const newAgent = await this.spawnAgent({
      moduleId: agent.moduleId,
      loopId: agent.loopId,
      scope: agent.scope,
      maxRetries: agent.maxRetries,
    });

    // Transfer failure context to new agent
    newAgent.failureContext = {
      ...decision.context,
      reassignedFrom: agent.id,
    };
  }

  /**
   * Escalate to human intervention
   */
  private async escalateAgent(agent: Agent, decision: FailureDecision): Promise<void> {
    agent.status = 'failed';

    this.emitEvent('failure:escalate', {
      agentId: agent.id,
      moduleId: agent.moduleId,
      decision,
    });

    // The orchestration service will handle notifying the human
  }

  /**
   * Handle agent completion
   */
  private handleAgentComplete(agent: Agent, data: Record<string, unknown>): void {
    agent.status = 'completed';
    agent.completedAt = new Date();
    agent.progress.percentComplete = 100;

    this.emitEvent('agent:completed', {
      agentId: agent.id,
      moduleId: agent.moduleId,
      duration: agent.completedAt.getTime() - (agent.startedAt?.getTime() || agent.spawnedAt.getTime()),
      data,
    });

    // Clean up worker
    const worker = this.workers.get(agent.id);
    if (worker) {
      worker.terminate();
      this.workers.delete(agent.id);
    }

    this.persistAgentState();
  }

  /**
   * Handle agent exit
   */
  private handleAgentExit(agent: Agent, code: number): void {
    if (agent.status !== 'completed' && agent.status !== 'terminated') {
      // Unexpected exit
      this.handleAgentError(agent, new Error(`Agent exited unexpectedly with code ${code}`));
    }

    this.workers.delete(agent.id);
  }

  /**
   * Update agent progress (called from orchestration service)
   */
  updateAgentProgress(agentId: string, progress: Partial<AgentProgress>): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.progress = { ...agent.progress, ...progress };
    agent.lastHeartbeat = new Date();

    this.emitEvent('agent:progress', { agentId, progress: agent.progress });
    this.persistAgentState();
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentId: string, status: AgentStatus, data?: Record<string, unknown>): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.status = status;
    agent.lastHeartbeat = new Date();

    if (status === 'completed') {
      agent.completedAt = new Date();
    }

    this.emitEvent(`agent:${status}`, { agentId, ...data });
    this.persistAgentState();
  }

  /**
   * Terminate an agent
   */
  async terminateAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // Terminate worker if running
    const worker = this.workers.get(agentId);
    if (worker) {
      worker.terminate();
      this.workers.delete(agentId);
    }

    agent.status = 'terminated';
    agent.completedAt = new Date();

    this.emitEvent('agent:terminated', { agentId });
    this.persistAgentState();
  }

  /**
   * Get an agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get active agents
   */
  getActiveAgents(): Agent[] {
    return this.getAllAgents().filter(a =>
      a.status === 'active' || a.status === 'spawning' || a.status === 'retrying'
    );
  }

  /**
   * Get agents by module
   */
  getAgentsByModule(moduleId: string): Agent[] {
    return this.getAllAgents().filter(a => a.moduleId === moduleId);
  }

  /**
   * Get agents by status
   */
  getAgentsByStatus(status: AgentStatus): Agent[] {
    return this.getAllAgents().filter(a => a.status === status);
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      this.checkHeartbeats();
    }, this.config.heartbeatIntervalMs);
  }

  /**
   * Check agent heartbeats for timeouts
   */
  private checkHeartbeats(): void {
    const now = Date.now();
    const timeout = this.config.heartbeatTimeoutMs;

    for (const agent of this.agents.values()) {
      if (agent.status === 'active' || agent.status === 'retrying') {
        const lastHeartbeat = agent.lastHeartbeat.getTime();
        if (now - lastHeartbeat > timeout) {
          this.handleAgentError(agent, new Error('Agent heartbeat timeout'));
        }
      }
    }
  }

  /**
   * Emit an orchestration event
   */
  private emitEvent(type: string, data: Record<string, unknown>): void {
    const event: OrchestrationEvent = {
      id: randomUUID(),
      type: type as any,
      orchestratorId: this.orchestratorId,
      agentId: data.agentId as string | undefined,
      moduleId: data.moduleId as string | undefined,
      timestamp: new Date(),
      data,
    };

    this.emit('event', event);
    this.emit(type, event);
  }

  /**
   * Persist agent state to disk
   */
  private async persistAgentState(): Promise<void> {
    // This would be implemented to save state to disk
    // For crash recovery
  }

  /**
   * Load agent state from disk
   */
  private async loadAgentState(): Promise<void> {
    // This would be implemented to restore state after crash
  }

  /**
   * Decide concurrency mode based on current state
   */
  decideConcurrencyMode(workItems: Array<{ moduleId: string; files?: string[] }>): ConcurrencyDecision {
    const agentCount = workItems.length;

    // Check for file overlap (potential merge conflicts)
    const fileOverlap = this.checkFileOverlap(workItems);

    // Check for dependency conflicts
    const dependencyConflicts = false; // Would check roadmap dependencies

    // Check resource constraints
    const resourceConstrained = false; // Would check system resources

    let mode: ConcurrencyMode;
    let reasoning: string;

    if (dependencyConflicts || fileOverlap) {
      mode = 'sequential';
      reasoning = fileOverlap
        ? 'File overlap detected - running sequentially to avoid conflicts'
        : 'Dependency conflicts detected - running sequentially';
    } else if (agentCount <= 4) {
      mode = 'parallel-async';
      reasoning = `${agentCount} agents - using async parallelism`;
    } else {
      mode = 'parallel-threads';
      reasoning = `${agentCount} agents - using worker threads for full parallelism`;
    }

    return {
      mode,
      reasoning,
      factors: {
        dependencyConflicts,
        fileOverlap,
        resourceConstrained,
        agentCount,
      },
    };
  }

  /**
   * Check if work items have file overlap
   */
  private checkFileOverlap(workItems: Array<{ moduleId: string; files?: string[] }>): boolean {
    const allFiles = new Set<string>();

    for (const item of workItems) {
      if (item.files) {
        for (const file of item.files) {
          if (allFiles.has(file)) {
            return true;
          }
          allFiles.add(file);
        }
      }
    }

    return false;
  }

  /**
   * Shutdown the agent manager
   */
  async shutdown(): Promise<void> {
    // Stop heartbeat monitoring
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Terminate all agents
    for (const agent of this.agents.values()) {
      if (agent.status === 'active' || agent.status === 'retrying') {
        await this.terminateAgent(agent.id);
      }
    }

    // Persist final state
    await this.persistAgentState();
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    total: number;
    byStatus: Record<AgentStatus, number>;
    byModule: Record<string, number>;
    activeCount: number;
  } {
    const agents = this.getAllAgents();
    const byStatus: Record<AgentStatus, number> = {
      spawning: 0,
      active: 0,
      blocked: 0,
      retrying: 0,
      completed: 0,
      failed: 0,
      terminated: 0,
    };
    const byModule: Record<string, number> = {};

    for (const agent of agents) {
      byStatus[agent.status]++;
      byModule[agent.moduleId] = (byModule[agent.moduleId] || 0) + 1;
    }

    return {
      total: agents.length,
      byStatus,
      byModule,
      activeCount: byStatus.active + byStatus.spawning + byStatus.retrying,
    };
  }
}
