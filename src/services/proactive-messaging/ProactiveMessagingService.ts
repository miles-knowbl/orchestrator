/**
 * Proactive Messaging Service
 *
 * Core service that coordinates multi-channel notifications and bidirectional
 * communication. Sends events to terminal and Slack, receives commands back.
 */

import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import type {
  ProactiveEvent,
  ProactiveMessagingConfig,
  ChannelStatus,
  PendingInteraction,
  InboundCommand,
  RoadmapDriftStatus,
  RoadmapMove,
  PendingClaudeTask,
} from './types.js';
import { ChannelAdapter, TerminalAdapter, SlackAdapter, VoiceAdapter } from './adapters/index.js';
import { MessageFormatter } from './MessageFormatter.js';
import { ConversationState } from './ConversationState.js';

// Service dependencies (injected)
import type { ExecutionEngine } from '../ExecutionEngine.js';
import type { DreamEngine } from '../dreaming/index.js';

export interface ProactiveMessagingServiceOptions {
  dataDir: string;
  executionEngine?: ExecutionEngine;
  dreamEngine?: DreamEngine;
}

const DEFAULT_CONFIG: ProactiveMessagingConfig = {
  channels: {
    terminal: {
      enabled: true,
      osNotifications: true,
    },
    slack: {
      enabled: false,
      socketMode: true,
    },
  },
  routing: {
    allEventsToAllChannels: true,
  },
};

export class ProactiveMessagingService {
  private dataDir: string;
  private configPath: string;
  private config: ProactiveMessagingConfig;
  private adapters: Map<string, ChannelAdapter> = new Map();
  private formatter: MessageFormatter;
  private conversationState: ConversationState;
  private initialized = false;

  // Dependencies
  private executionEngine?: ExecutionEngine;
  private dreamEngine?: DreamEngine;

  // Event handlers registered by consumers
  private commandHandlers: Array<(command: InboundCommand, interaction?: PendingInteraction) => Promise<void>> = [];

  // Task queue for Claude Code to pick up
  private pendingTasks: Map<string, PendingClaudeTask> = new Map();

  constructor(options: ProactiveMessagingServiceOptions) {
    this.dataDir = options.dataDir;
    this.configPath = path.join(options.dataDir, 'proactive-messaging-config.json');
    this.config = { ...DEFAULT_CONFIG };
    this.formatter = new MessageFormatter();
    this.conversationState = new ConversationState();
    this.executionEngine = options.executionEngine;
    this.dreamEngine = options.dreamEngine;
  }

  /**
   * Structured logging
   */
  private log(level: 'info' | 'warn' | 'error', message: string, context?: Record<string, unknown>): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'ProactiveMessaging',
      message,
      ...(context && { context }),
    }));
  }

  /**
   * Initialize the service and all channel adapters
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load config
    await this.loadConfig();

    // Create and initialize adapters
    await this.initializeAdapters();

    // Set up periodic cleanup
    setInterval(() => {
      this.conversationState.expireOld();
      this.conversationState.cleanup();
    }, 60 * 60 * 1000); // Every hour

    this.initialized = true;
  }

  private async loadConfig(): Promise<void> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      const loaded = JSON.parse(data) as Partial<ProactiveMessagingConfig>;
      this.config = {
        ...DEFAULT_CONFIG,
        ...loaded,
        channels: {
          ...DEFAULT_CONFIG.channels,
          ...loaded.channels,
          terminal: {
            ...DEFAULT_CONFIG.channels.terminal,
            ...loaded.channels?.terminal,
          },
          slack: {
            ...DEFAULT_CONFIG.channels.slack,
            ...loaded.channels?.slack,
          },
          // Voice is optional, only include if configured
          ...(loaded.channels?.voice && { voice: loaded.channels.voice }),
        },
      };
    } catch {
      // Use defaults
    }
  }

  private async saveConfig(): Promise<void> {
    await fs.mkdir(path.dirname(this.configPath), { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
  }

  private async initializeAdapters(): Promise<void> {
    // Terminal adapter
    const terminalAdapter = new TerminalAdapter(this.config.channels.terminal);
    await terminalAdapter.initialize();
    terminalAdapter.onCommand(this.handleInboundCommand.bind(this));
    this.adapters.set('terminal', terminalAdapter);

    // Slack adapter
    const slackAdapter = new SlackAdapter(this.config.channels.slack);
    await slackAdapter.initialize();
    slackAdapter.onCommand(this.handleInboundCommand.bind(this));
    this.adapters.set('slack', slackAdapter);

    // Voice adapter (if configured)
    if (this.config.channels.voice?.enabled) {
      const voiceAdapter = new VoiceAdapter(this.config.channels.voice);
      await voiceAdapter.initialize();
      voiceAdapter.onCommand(this.handleInboundCommand.bind(this));
      this.adapters.set('voice', voiceAdapter);
    }
  }

  /**
   * Handle inbound commands from any channel
   */
  private async handleInboundCommand(command: InboundCommand): Promise<void> {
    // Resolve "latest" interaction ID
    if ('interactionId' in command && command.interactionId === 'latest') {
      const resolved = this.conversationState.resolveInteractionId('latest');
      if (resolved) {
        (command as { interactionId: string }).interactionId = resolved;
      }
    }

    // Find the interaction
    let interaction: PendingInteraction | undefined;
    if ('interactionId' in command) {
      interaction = this.conversationState.getInteraction(command.interactionId);
    }

    // Execute built-in handlers
    await this.executeBuiltInHandler(command, interaction);

    // Notify external handlers
    for (const handler of this.commandHandlers) {
      try {
        await handler(command, interaction);
      } catch (err) {
        this.log('error', 'Command handler error', { error: String(err) });
      }
    }
  }

  private async executeBuiltInHandler(
    command: InboundCommand,
    interaction?: PendingInteraction
  ): Promise<void> {
    switch (command.type) {
      case 'approve':
        if (command.context.gateId && command.context.executionId && this.executionEngine) {
          try {
            const skipGuarantees = command.context.skipGuarantees ?? false;
            await this.executionEngine.approveGate(
              command.context.executionId,
              command.context.gateId,
              skipGuarantees ? 'force-approved-via-slack' : undefined,
              { skipGuarantees }
            );

            // Advance to the next phase after gate approval
            try {
              await this.executionEngine.advancePhase(command.context.executionId);
            } catch {
              // Gate was approved, advance may fail for valid reasons (e.g., no next phase)
            }

            if (interaction) {
              this.conversationState.recordResponse(interaction.id, command, 'builtin');
            }
          } catch (err) {
            this.log('error', 'Failed to approve gate', { error: String(err) });
            throw err;
          }
        }
        if (command.context.proposalId && this.dreamEngine) {
          try {
            await this.dreamEngine.approveProposal(command.context.proposalId);
            if (interaction) {
              this.conversationState.recordResponse(interaction.id, command, 'builtin');
            }
          } catch (err) {
            this.log('error', 'Failed to approve proposal', { error: String(err) });
            throw err;
          }
        }
        break;

      case 'reject':
        if (command.context.gateId && command.context.executionId && this.executionEngine) {
          try {
            await this.executionEngine.rejectGate(
              command.context.executionId,
              command.context.gateId,
              command.reason || 'Rejected via proactive messaging'
            );
            if (interaction) {
              this.conversationState.recordResponse(interaction.id, command, 'builtin');
            }
          } catch (err) {
            this.log('error', 'Failed to reject gate', { error: String(err) });
            throw err;
          }
        }
        if (command.context.proposalId && this.dreamEngine) {
          try {
            await this.dreamEngine.rejectProposal(
              command.context.proposalId,
              command.reason || 'Rejected via proactive messaging'
            );
            if (interaction) {
              this.conversationState.recordResponse(interaction.id, command, 'builtin');
            }
          } catch (err) {
            this.log('error', 'Failed to reject proposal', { error: String(err) });
            throw err;
          }
        }
        break;

      case 'continue':
        if (command.executionId && this.executionEngine) {
          try {
            await this.executionEngine.advancePhase(command.executionId);
            if (interaction) {
              this.conversationState.recordResponse(interaction.id, command, 'builtin');
            }
          } catch (err) {
            this.log('error', 'Failed to advance phase', { error: String(err) });
          }
        }
        break;

      case 'approve_all_proposals':
        if (this.dreamEngine && command.proposalIds.length > 0) {
          try {
            for (const proposalId of command.proposalIds) {
              await this.dreamEngine.approveProposal(proposalId);
            }
            if (interaction) {
              this.conversationState.recordResponse(interaction.id, command, 'builtin');
            }
          } catch (err) {
            this.log('error', 'Failed to approve proposals', { error: String(err) });
          }
        }
        break;

      case 'start_next_loop': {
        const nextLoopTaskId = `task-${Date.now()}`;
        const nextLoopTask: PendingClaudeTask = {
          id: nextLoopTaskId,
          type: 'start_next_loop',
          createdAt: new Date().toISOString(),
          executionId: command.executionId,
          completedLoopId: command.completedLoopId,
          completedModule: command.completedModule,
          status: 'pending',
          requestedVia: 'slack',
        };
        this.pendingTasks.set(nextLoopTaskId, nextLoopTask);
        this.spawnClaudeCode(nextLoopTask);

        if (interaction) {
          this.conversationState.recordResponse(interaction.id, command, 'builtin');
        }
        break;
      }

      case 'create_deliverables': {
        const taskId = `task-${Date.now()}`;
        const task: PendingClaudeTask = {
          id: taskId,
          type: 'create_deliverable',
          createdAt: new Date().toISOString(),
          executionId: command.executionId,
          gateId: command.gateId,
          deliverables: command.missingFiles,
          status: 'pending',
          requestedVia: 'slack',
        };
        this.pendingTasks.set(taskId, task);

        // Auto-start Claude Code to pick up the task
        this.spawnClaudeCode(task);

        if (interaction) {
          this.conversationState.recordResponse(interaction.id, command, 'builtin');
        }
        break;
      }

      case 'status':
        // Query and respond with current execution state
        await this.handleStatusQuery();
        break;

      case 'next_leverage':
        // Propose next highest leverage move
        await this.handleNextLeverageQuery();
        break;

      case 'start_loop':
        // Start a specific loop
        await this.handleStartLoop(command);
        break;
    }
  }

  /**
   * Handle status query - respond with current execution state
   */
  private async handleStatusQuery(): Promise<void> {
    if (!this.executionEngine) {
      await this.sendNotification('Status', 'No execution engine available');
      return;
    }

    const active = this.executionEngine.listExecutions({ status: 'active' });
    if (active.length === 0) {
      await this.sendNotification('Status', 'No active executions. Say a loop name to start (e.g., "engineering-loop voice-feature")');
      return;
    }

    const exec = active[0];
    const details = this.executionEngine.getExecution(exec.id);
    if (!details) {
      await this.sendNotification('Status', 'Execution not found');
      return;
    }

    const phase = details.currentPhase;
    const progress = exec.progress;
    const message = `*${exec.loopId}* → ${exec.project}\n` +
      `Phase: *${phase}* (${progress.phasesCompleted}/${progress.phasesTotal})\n` +
      `Skills: ${progress.skillsCompleted}/${progress.skillsTotal}\n` +
      `Status: ${exec.status}`;

    await this.sendNotification('Status', message);
  }

  /**
   * Handle next leverage query - propose next highest leverage action
   */
  private async handleNextLeverageQuery(): Promise<void> {
    // Check for active execution first
    if (this.executionEngine) {
      const active = this.executionEngine.listExecutions({ status: 'active' });
      if (active.length > 0) {
        await this.sendNotification(
          'Next Move',
          `Active: *${active[0].loopId}* → ${active[0].project}\nSay "go" to continue or "status" for details`
        );
        return;
      }
    }

    // No active execution - suggest based on roadmap
    // For now, suggest engineering-loop as default
    await this.sendNotification(
      'Next Highest Leverage',
      'No active loop. Suggestions:\n' +
      '• `engineering-loop [project]` - Build a feature\n' +
      '• `bugfix-loop [issue]` - Fix a bug\n' +
      '• `learning-loop` - Review patterns\n\n' +
      'Say a loop name to start.'
    );
  }

  /**
   * Handle start loop command
   */
  private async handleStartLoop(command: { type: 'start_loop'; loopId: string; target?: string }): Promise<void> {
    if (!this.executionEngine) {
      await this.sendNotification('Start Loop', 'No execution engine available');
      return;
    }

    // Check for existing active execution
    const active = this.executionEngine.listExecutions({ status: 'active' });
    if (active.length > 0) {
      await this.sendNotification(
        'Already Running',
        `*${active[0].loopId}* → ${active[0].project} is active.\n` +
        'Complete or abort it first, or say "status" for details.'
      );
      return;
    }

    const project = command.target || 'orchestrator';
    try {
      const execution = await this.executionEngine.startExecution({
        loopId: command.loopId,
        project,
        mode: 'brownfield-polish',
        autonomy: 'supervised',
      });

      await this.sendNotification(
        'Loop Started',
        `*${command.loopId}* → ${project}\nExecution: ${execution.id.slice(0, 8)}...\nSay "go" to proceed through phases.`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.sendNotification('Start Failed', msg);
    }
  }

  /**
   * Send an event to all enabled channels
   */
  async notify(event: ProactiveEvent): Promise<string> {
    const message = this.formatter.format(event);

    // Extract executionId for thread routing
    const executionId = 'executionId' in event ? event.executionId : undefined;
    if (executionId && message.metadata) {
      message.metadata.executionId = executionId;
    }

    const channels: string[] = [];

    for (const [name, adapter] of this.adapters) {
      const status = adapter.getStatus();
      if (status.enabled && status.connected) {
        try {
          await adapter.send(message);
          channels.push(name);
        } catch (err) {
          this.log('error', `Failed to send to ${name}`, { error: String(err) });
        }
      }
    }

    // Record interaction
    const interactionId = message.metadata?.interactionId || 'unknown';
    this.conversationState.recordInteraction(interactionId, event, channels);

    return interactionId;
  }

  /**
   * Send a custom notification
   */
  async sendNotification(
    title: string,
    message: string,
    actions?: Array<{ label: string; value: string }>
  ): Promise<string> {
    return this.notify({
      type: 'custom',
      title,
      message,
      actions,
    });
  }

  /**
   * Send a system notification (startup, shutdown, errors)
   */
  async sendSystemNotification(options: {
    type: 'startup' | 'shutdown' | 'error';
    message: string;
  }): Promise<void> {
    const title = options.type === 'shutdown' ? '🛑 Shutdown'
      : options.type === 'startup' ? '🟢 Startup'
      : '❌ Error';

    try {
      await this.notify({
        type: 'custom',
        title,
        message: options.message,
      });
    } catch (err) {
      // Don't throw during system notifications - just log
      this.log('error', `Failed to send ${options.type} notification`, { error: String(err) });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Event shortcuts for common notifications
  // ─────────────────────────────────────────────────────────────────────────

  async notifyLoopStart(
    loopId: string,
    executionId: string,
    target: string,
    branch?: string,
    engineer?: string
  ): Promise<string> {
    return this.notify({
      type: 'loop_start',
      loopId,
      executionId,
      target,
      branch,
      engineer,
    });
  }

  async notifyGateWaiting(
    gateId: string,
    executionId: string,
    loopId: string,
    phase: string,
    deliverables: string[],
    approvalType: 'human' | 'auto' | 'conditional' = 'human'
  ): Promise<string> {
    // Pre-check guarantees if execution engine is available
    let guarantees: {
      total: number;
      passed: number;
      failed: number;
      canApprove: boolean;
      blocking?: Array<{ id: string; name: string; passed: boolean; errors?: string[] }>;
    } | undefined;

    if (this.executionEngine) {
      try {
        guarantees = await this.executionEngine.getGateGuaranteeStatus(executionId, gateId);
      } catch (err) {
        this.log('error', 'Failed to check guarantees', { error: String(err) });
      }
    }

    return this.notify({
      type: 'gate_waiting',
      gateId,
      executionId,
      loopId,
      phase,
      deliverables,
      approvalType,
      guarantees,
    });
  }

  async notifyLoopComplete(
    loopId: string,
    executionId: string,
    module: string,
    summary: string,
    deliverables: string[]
  ): Promise<string> {
    return this.notify({
      type: 'loop_complete',
      loopId,
      executionId,
      module,
      summary,
      deliverables,
    });
  }

  async notifyDreamProposalsReady(
    proposals: Array<{ id: string; type: string; title: string; priority: 'high' | 'medium' | 'low' }>
  ): Promise<string> {
    return this.notify({
      type: 'dream_proposals_ready',
      count: proposals.length,
      proposals,
    });
  }

  async notifyExecutorBlocked(
    executionId: string,
    reason: string,
    phase?: string,
    gateId?: string
  ): Promise<string> {
    return this.notify({
      type: 'executor_blocked',
      executionId,
      reason,
      phase,
      gateId,
    });
  }

  async notifyError(
    message: string,
    severity: 'critical' | 'warning' | 'info' = 'warning',
    context?: Record<string, unknown>
  ): Promise<string> {
    return this.notify({
      type: 'error',
      message,
      severity,
      context,
    });
  }

  async notifyDeckReady(
    deckId: string,
    deckType: 'knowledge' | 'proposal',
    itemCount: number,
    estimatedMinutes: number
  ): Promise<string> {
    return this.notify({
      type: 'deck_ready',
      deckId,
      deckType,
      itemCount,
      estimatedMinutes,
    });
  }

  async notifySkillComplete(
    executionId: string,
    loopId: string,
    phase: string,
    skillId: string,
    deliverables?: string[]
  ): Promise<string> {
    return this.notify({
      type: 'skill_complete',
      executionId,
      loopId,
      phase,
      skillId,
      deliverables,
    });
  }

  async notifyPhaseComplete(
    executionId: string,
    loopId: string,
    phase: string,
    skillsCompleted: number,
    hasGate: boolean,
    gateId?: string
  ): Promise<string> {
    return this.notify({
      type: 'phase_complete',
      executionId,
      loopId,
      phase,
      skillsCompleted,
      hasGate,
      gateId,
    });
  }

  async notifyPhaseStart(
    executionId: string,
    loopId: string,
    phase: string,
    phaseNumber: number,
    totalPhases: number,
    skills: string[]
  ): Promise<string> {
    return this.notify({
      type: 'phase_start',
      executionId,
      loopId,
      phase,
      phaseNumber,
      totalPhases,
      skills,
    });
  }

  async notifyGateAutoApproved(
    gateId: string,
    executionId: string,
    loopId: string,
    phase: string,
    reason: 'guarantees_passed' | 'after_retry' | 'after_claude',
    retryCount?: number
  ): Promise<string> {
    return this.notify({
      type: 'gate_auto_approved',
      gateId,
      executionId,
      loopId,
      phase,
      reason,
      retryCount,
    });
  }

  /**
   * Send startup welcome message
   * Shows available next moves based on Dream State
   */
  async sendStartupWelcome(options: {
    version: string;
    skillCount: number;
    loopCount: number;
    repoPath: string;
    availableLoops: string[];
  }): Promise<string> {
    const { version, skillCount, loopCount, repoPath, availableLoops } = options;

    // Check for Dream State JSON (PAT-017: JSON is source of truth)
    const dreamStateJsonPath = path.join(repoPath, '.claude', 'dream-state.json');
    let hasDreamState = false;
    let dreamStateProgress: {
      name: string;
      modulesComplete: number;
      modulesTotal: number;
      modulesDeferred: number;
      functionsComplete: number;
      functionsTotal: number;
    } | undefined;

    try {
      const content = await fs.readFile(dreamStateJsonPath, 'utf-8');
      const dreamState = JSON.parse(content);
      hasDreamState = true;

      // Extract progress from JSON
      const modules = dreamState.modules || [];
      const modulesComplete = modules.filter((m: { status: string }) => m.status === 'complete').length;
      const modulesTotal = modules.length;

      // Count deferred modules from separate file if referenced
      let modulesDeferred = 0;
      if (dreamState.deferredRef) {
        try {
          const deferredPath = path.join(repoPath, '.claude', path.basename(dreamState.deferredRef));
          const deferredContent = await fs.readFile(deferredPath, 'utf-8');
          const deferredData = JSON.parse(deferredContent);
          modulesDeferred = (deferredData.modules || []).length;
        } catch {
          // Deferred file not found, count inline deferred modules
          modulesDeferred = modules.filter((m: { status: string }) => m.status === 'deferred').length;
        }
      }

      // Count functions across all modules (including infrastructure)
      let functionsTotal = 0;
      let functionsComplete = 0;
      for (const m of modules) {
        const funcs = m.functions || [];
        functionsTotal += funcs.length;
        functionsComplete += funcs.filter((f: { complete: boolean }) => f.complete).length;
      }

      dreamStateProgress = {
        name: dreamState.system || 'Unknown',
        modulesComplete,
        modulesTotal,
        modulesDeferred,
        functionsComplete,
        functionsTotal,
      };
    } catch {
      // No Dream State JSON file - fall back to markdown parsing
      try {
        const mdPath = path.join(repoPath, '.claude', 'DREAM-STATE.md');
        const content = await fs.readFile(mdPath, 'utf-8');
        hasDreamState = true;

        const nameMatch = content.match(/^#\s+(?:System\s+)?Dream State:\s*(.+)$/mi);
        const name = nameMatch ? nameMatch[1].trim() : 'Unknown';

        const moduleLines = content.match(/^\|[^|]+\|[^|]+\|\s*(complete|in-progress|pending|blocked|deferred)\s*\|/gmi) || [];
        const modulesTotal = moduleLines.length;
        const modulesComplete = moduleLines.filter(l => /\|\s*complete\s*\|/i.test(l)).length;
        const modulesDeferred = moduleLines.filter(l => /\|\s*deferred\s*\|/i.test(l)).length;

        if (modulesTotal > 0) {
          dreamStateProgress = {
            name,
            modulesComplete,
            modulesTotal,
            modulesDeferred,
            functionsComplete: 0,
            functionsTotal: 0,
          };
        }
      } catch {
        // No Dream State file at all
      }
    }

    // Determine recommended loop
    let recommendedLoop = 'dream-loop';
    let recommendedTarget: string | undefined;

    if (hasDreamState && dreamStateProgress) {
      // Calculate active modules (exclude deferred)
      const activeTotal = dreamStateProgress.modulesTotal;
      const activeComplete = dreamStateProgress.modulesComplete;

      if (activeComplete < activeTotal) {
        // Has incomplete active modules - recommend engineering-loop
        recommendedLoop = 'engineering-loop';
        recommendedTarget = 'next module';
      } else {
        // All active modules complete - recommend distribution-loop
        recommendedLoop = 'distribution-loop';
      }
    }

    return this.notify({
      type: 'startup_welcome',
      version,
      skillCount,
      loopCount,
      hasDreamState,
      dreamStateProgress,
      recommendedLoop,
      recommendedTarget,
      availableLoops,
    });
  }

  /**
   * Send daily welcome message
   * Shows contextual greeting on first MCP call of the day
   */
  async sendDailyWelcome(options: {
    greeting: string;
    version: string;
    versionStatus: 'current' | 'update_available';
    latestVersion?: string;
    repoPath: string;
    pendingProposals: number;
    updateNotes?: string[];
    // Roadmap status
    hasRoadmap?: boolean;
    roadmapDrift?: RoadmapDriftStatus;
    availableMoves?: RoadmapMove[];
  }): Promise<string> {
    const { greeting, version, versionStatus, latestVersion, repoPath, pendingProposals, updateNotes, hasRoadmap, roadmapDrift, availableMoves } = options;

    // Check for Dream State (same logic as sendStartupWelcome)
    const dreamStatePath = path.join(repoPath, '.claude', 'DREAM-STATE.md');
    let hasDreamState = false;
    let dreamStateProgress: { name: string; modulesComplete: number; modulesTotal: number } | undefined;

    try {
      const content = await fs.readFile(dreamStatePath, 'utf-8');
      hasDreamState = true;

      const nameMatch = content.match(/^#\s+(?:System\s+)?Dream State:\s*(.+)$/mi);
      const name = nameMatch ? nameMatch[1].trim() : 'Unknown';

      const moduleLines = content.match(/^\|[^|]+\|[^|]+\|\s*(complete|in-progress|pending|blocked)\s*\|/gmi) || [];
      const modulesTotal = moduleLines.length;
      const modulesComplete = moduleLines.filter(l => /complete/i.test(l)).length;

      if (modulesTotal > 0) {
        dreamStateProgress = { name, modulesComplete, modulesTotal };
      }
    } catch {
      // No Dream State file
    }

    // Determine recommended loop
    let recommendedLoop = 'dream-loop';
    let recommendedTarget: string | undefined;

    if (hasDreamState && dreamStateProgress) {
      if (dreamStateProgress.modulesComplete < dreamStateProgress.modulesTotal) {
        recommendedLoop = 'engineering-loop';
        recommendedTarget = 'next module';
      } else {
        recommendedLoop = 'distribution-loop';
      }
    }

    return this.notify({
      type: 'daily_welcome',
      greeting,
      version,
      versionStatus,
      latestVersion,
      hasDreamState,
      dreamStateProgress,
      pendingProposals,
      recommendedLoop,
      recommendedTarget,
      updateNotes,
      // Roadmap status
      hasRoadmap: hasRoadmap ?? false,
      roadmapDrift,
      availableMoves,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Configuration
  // ─────────────────────────────────────────────────────────────────────────

  getConfig(): ProactiveMessagingConfig {
    return { ...this.config };
  }

  async configureChannel(
    channel: 'terminal' | 'slack',
    config: Partial<ProactiveMessagingConfig['channels'][typeof channel]>
  ): Promise<void> {
    if (channel === 'terminal') {
      this.config.channels.terminal = {
        ...this.config.channels.terminal,
        ...config,
      };
    } else if (channel === 'slack') {
      this.config.channels.slack = {
        ...this.config.channels.slack,
        ...(config as Partial<ProactiveMessagingConfig['channels']['slack']>),
      };
    }

    await this.saveConfig();

    // Reinitialize adapters with new config
    await this.disconnect();
    await this.initializeAdapters();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Status & State
  // ─────────────────────────────────────────────────────────────────────────

  getChannelStatus(): ChannelStatus[] {
    return Array.from(this.adapters.values()).map(a => a.getStatus());
  }

  getPendingInteractions(): PendingInteraction[] {
    return this.conversationState.getPending();
  }

  getConversationHistory(limit?: number): PendingInteraction[] {
    return this.conversationState.getAll(limit);
  }

  getInteraction(interactionId: string): PendingInteraction | undefined {
    return this.conversationState.getInteraction(interactionId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Pending Tasks (for Claude Code)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get pending tasks that Claude Code should pick up
   */
  getPendingTasks(): PendingClaudeTask[] {
    return Array.from(this.pendingTasks.values())
      .filter(t => t.status === 'pending')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /**
   * Get a specific task by ID
   */
  getTask(taskId: string): PendingClaudeTask | undefined {
    return this.pendingTasks.get(taskId);
  }

  /**
   * Mark a task as in progress
   */
  startTask(taskId: string): void {
    const task = this.pendingTasks.get(taskId);
    if (task) {
      task.status = 'in_progress';
    }
  }

  /**
   * Mark a task as completed
   */
  completeTask(taskId: string): void {
    const task = this.pendingTasks.get(taskId);
    if (task) {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
    }
  }

  /**
   * Mark a task as failed
   */
  failTask(taskId: string, error: string): void {
    const task = this.pendingTasks.get(taskId);
    if (task) {
      task.status = 'failed';
      task.completedAt = new Date().toISOString();
      task.error = error;
    }
  }

  /**
   * Clear completed/failed tasks older than specified hours
   */
  cleanupTasks(olderThanHours = 24): void {
    const cutoff = Date.now() - olderThanHours * 60 * 60 * 1000;
    for (const [id, task] of this.pendingTasks) {
      if ((task.status === 'completed' || task.status === 'failed') &&
          task.completedAt && new Date(task.completedAt).getTime() < cutoff) {
        this.pendingTasks.delete(id);
      }
    }
  }

  /**
   * Spawn Claude Code in a new Terminal to pick up a task
   * Only spawns if no active execution is running (assumes Claude Code is already handling it)
   */
  private spawnClaudeCode(task: PendingClaudeTask): void {
    const cwd = process.cwd();

    // Check if there's an active execution
    const hasActiveLoop = this.executionEngine &&
      this.executionEngine.listExecutions({ status: 'active' }).length > 0;

    // Build prompt based on task type
    let prompt: string;

    if (task.type === 'start_next_loop') {
      // Start next loop task - pop from async-queue and execute
      const completedLoop = task.completedLoopId || 'unknown';
      const completedModule = task.completedModule || 'unknown';
      const cwd = process.cwd();
      prompt = `TASK FROM SLACK (task ${task.id}): Start the next loop from the async queue. ` +
        `The user just completed ${completedLoop} for ${completedModule} and clicked "Start Next" on Slack. ` +
        `Steps: ` +
        `1. Read ${cwd}/memory/async-queue.json to get the pre-computed work queue. ` +
        `2. Pop the first move from the queue (rank #1). ` +
        `3. If queue is empty or expired, notify user: "Queue empty. Run /async-loop to plan more moves." ` +
        `4. Otherwise, start the loop for that move (e.g., /engineering-loop auth-service). ` +
        `5. Call mcp__orchestrator__complete_slack_task with taskId="${task.id}" when the loop starts. ` +
        `6. Update async-queue.json to remove the executed move. ` +
        `7. Run the loop autonomously - only notify on completion or if human input needed. ` +
        `The user is mobile and expects autonomous operation. ` +
        `IMPORTANT: When running tests, always use "npm test -- --run" to avoid watch mode hanging. ` +
        `If async-queue.json doesn't exist, fall back to running the leverage protocol to pick a move.`;
    } else {
      // Create deliverable task
      const deliverables = task.deliverables?.join(', ') || 'missing deliverables';
      const gateId = task.gateId || 'unknown-gate';
      const gateName = gateId.replace('-gate', '');
      const executionId = task.executionId;

      prompt = hasActiveLoop
        ? // Task runner mode: focused, non-interactive, advances the loop
          `TASK FROM SLACK (task ${task.id}): Create ${deliverables} for the ${gateName} gate. ` +
          `This is a background task for REMOTE loop operation. Steps: ` +
          `1. Create the file with real content (not placeholder). ` +
          `2. Call mcp__orchestrator__complete_slack_task with taskId="${task.id}". ` +
          `3. Call mcp__orchestrator__approve_gate with executionId="${executionId}" gateId="${gateId}". ` +
          `4. Call mcp__orchestrator__advance_phase with executionId="${executionId}" to move to next phase. ` +
          `5. Exit when done. The next Slack notification will be sent automatically.`
        : // Interactive mode: full loop context
          `Create the missing deliverable(s) for the ${gateName} gate: ${deliverables}. ` +
          `This was requested via Slack. After creating the file(s), approve the gate.`;
    }

    // Escape for shell
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/'/g, "'\\''");

    // Notify the running session about the incoming task
    if (hasActiveLoop && task.type !== 'start_next_loop') {
      const deliverables = task.deliverables?.join(', ') || 'missing deliverables';
      this.notify({
        type: 'custom',
        title: 'SLACK TASK SPAWNING',
        message: `Opening new terminal to create ${deliverables}. Gate will auto-approve when ready.`,
      });
    }

    // Detect terminal: ORCHESTRATOR_TERMINAL_CMD > iTerm > Terminal.app
    const customTerminalCmd = process.env.ORCHESTRATOR_TERMINAL_CMD;
    const hasITerm = existsSync('/Applications/iTerm.app');

    // Build the shell command - escape for embedding in AppleScript
    // Always use --dangerously-skip-permissions for autonomous tasks (start_next_loop, or active loop)
    const useAutonomousMode = hasActiveLoop || task.type === 'start_next_loop';
    const shellCmd = useAutonomousMode
      ? `cd '${cwd}' && claude --dangerously-skip-permissions '${prompt.replace(/'/g, "'\\''")}'`
      : `cd '${cwd}' && claude '${prompt.replace(/'/g, "'\\''")}'`;

    let script: string;

    if (customTerminalCmd) {
      // User's custom terminal command - replace placeholders
      const cmd = customTerminalCmd
        .replace('$ORCHESTRATOR_DIR', cwd)
        .replace(/\$CMD/g, shellCmd);
      exec(cmd, (error) => {
        if (error) {
          this.log('error', 'Custom terminal command failed', { error: error.message });
        } else {
          task.status = 'in_progress';
        }
      });
      return;
    } else if (hasITerm) {
      // iTerm2 - open new tab
      script = `
        tell application "iTerm"
          activate
          tell current window
            create tab with default profile
            tell current session
              write text "${shellCmd.replace(/"/g, '\\"')}"
            end tell
          end tell
        end tell
      `;
    } else {
      // Terminal.app fallback
      script = hasActiveLoop
        ? `
          tell application "Terminal"
            activate
            tell application "System Events" to keystroke "t" using command down
            delay 0.3
            do script "${shellCmd.replace(/"/g, '\\"')}" in front window
          end tell
        `
        : `
          tell application "Terminal"
            activate
            do script "${shellCmd.replace(/"/g, '\\"')}"
          end tell
        `;
    }

    exec(`osascript -e '${script.replace(/'/g, "'\\''")}'`, (error) => {
      if (error) {
        this.log('error', 'Failed to spawn Claude Code', { error: error.message });
        // Fallback: just queue the task
        const taskDesc = task.type === 'start_next_loop'
          ? 'start next loop'
          : `create ${task.deliverables?.join(', ') || 'deliverables'}`;
        this.notify({
          type: 'custom',
          title: 'TASK QUEUED',
          message: `Could not spawn terminal. Task queued: ${taskDesc}`,
        });
      } else {
        task.status = 'in_progress';
      }
    });
  }

  getStats(): {
    channels: ChannelStatus[];
    interactions: {
      total: number;
      pending: number;
      responded: number;
      expired: number;
    };
  } {
    return {
      channels: this.getChannelStatus(),
      interactions: this.conversationState.getStats(),
    };
  }

  /**
   * Get the voice adapter for direct access (used by MCP tools and API)
   */
  getVoiceAdapter(): VoiceAdapter | null {
    const adapter = this.adapters.get('voice');
    return adapter instanceof VoiceAdapter ? adapter : null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // External command handlers
  // ─────────────────────────────────────────────────────────────────────────

  onCommand(handler: (command: InboundCommand, interaction?: PendingInteraction) => Promise<void>): void {
    this.commandHandlers.push(handler);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Testing
  // ─────────────────────────────────────────────────────────────────────────

  async testChannel(channel: string): Promise<{ success: boolean; error?: string }> {
    const adapter = this.adapters.get(channel);
    if (!adapter) {
      return { success: false, error: `Unknown channel: ${channel}` };
    }

    const status = adapter.getStatus();
    if (!status.enabled) {
      return { success: false, error: `Channel ${channel} is not enabled` };
    }

    if (!status.connected) {
      return { success: false, error: `Channel ${channel} is not connected: ${status.error}` };
    }

    try {
      await adapter.send({
        text: `🧪 Test message from Orchestrator\n${'═'.repeat(40)}\n\nThis is a test notification.`,
        actions: [
          {
            id: 'test_ack',
            label: 'Acknowledge',
            value: JSON.stringify({ action: 'test_ack' }),
          },
        ],
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  async disconnect(): Promise<void> {
    for (const adapter of this.adapters.values()) {
      try {
        await adapter.disconnect();
      } catch (err) {
        this.log('error', 'Error disconnecting adapter', { error: String(err) });
      }
    }
    this.adapters.clear();
  }
}
