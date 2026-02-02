/**
 * Proactive Messaging Service
 *
 * Core service that coordinates multi-channel notifications and bidirectional
 * communication. Sends events to terminal and Slack, receives commands back.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  ProactiveEvent,
  ProactiveMessagingConfig,
  ChannelStatus,
  PendingInteraction,
  InboundCommand,
  RoadmapDriftStatus,
  RoadmapMove,
} from './types.js';
import { ChannelAdapter, TerminalAdapter, SlackAdapter } from './adapters/index.js';
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
        console.error('[ProactiveMessaging] Command handler error:', err);
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
            await this.executionEngine.approveGate(command.context.executionId, command.context.gateId);
            if (interaction) {
              this.conversationState.recordResponse(interaction.id, command, 'builtin');
            }
          } catch (err) {
            console.error('[ProactiveMessaging] Failed to approve gate:', err);
          }
        }
        if (command.context.proposalId && this.dreamEngine) {
          try {
            await this.dreamEngine.approveProposal(command.context.proposalId);
            if (interaction) {
              this.conversationState.recordResponse(interaction.id, command, 'builtin');
            }
          } catch (err) {
            console.error('[ProactiveMessaging] Failed to approve proposal:', err);
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
            console.error('[ProactiveMessaging] Failed to reject gate:', err);
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
            console.error('[ProactiveMessaging] Failed to reject proposal:', err);
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
            console.error('[ProactiveMessaging] Failed to advance phase:', err);
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
            console.log(`[ProactiveMessaging] Approved ${command.proposalIds.length} proposals`);
          } catch (err) {
            console.error('[ProactiveMessaging] Failed to approve proposals:', err);
          }
        }
        break;

      case 'start_next_loop':
        // Emit event for external handling - the leverage protocol determines next loop
        // This will be picked up by command handlers registered via onCommand()
        console.log(`[ProactiveMessaging] Start next loop requested after ${command.completedLoopId} -> ${command.completedModule}`);
        if (interaction) {
          this.conversationState.recordResponse(interaction.id, command, 'builtin');
        }
        // Note: Actual loop starting is delegated to external handlers that have
        // access to the leverage protocol and can determine the best next move
        break;
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
          console.error(`[ProactiveMessaging] Failed to send to ${name}:`, err);
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
    return this.notify({
      type: 'gate_waiting',
      gateId,
      executionId,
      loopId,
      phase,
      deliverables,
      approvalType,
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

    // Check for Dream State
    const dreamStatePath = path.join(repoPath, '.claude', 'DREAM-STATE.md');
    let hasDreamState = false;
    let dreamStateProgress: { name: string; modulesComplete: number; modulesTotal: number } | undefined;

    try {
      const content = await fs.readFile(dreamStatePath, 'utf-8');
      hasDreamState = true;

      // Parse Dream State for progress
      // Look for: "# System Dream State: {name}"
      const nameMatch = content.match(/^#\s+(?:System\s+)?Dream State:\s*(.+)$/mi);
      const name = nameMatch ? nameMatch[1].trim() : 'Unknown';

      // Count complete vs total modules from the table
      // Look for status column with "complete" or progress percentage
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
      // Has Dream State - recommend engineering-loop or distribution-loop
      if (dreamStateProgress.modulesComplete < dreamStateProgress.modulesTotal) {
        recommendedLoop = 'engineering-loop';
        recommendedTarget = 'next module';
      } else {
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
        console.error(`[ProactiveMessaging] Error disconnecting adapter:`, err);
      }
    }
    this.adapters.clear();
  }
}
