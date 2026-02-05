/**
 * Slack Channel Adapter
 *
 * Uses Slack Bolt SDK for bidirectional communication with Block Kit buttons.
 */

import type { ChannelAdapter } from './ChannelAdapter.js';
import type {
  FormattedMessage,
  InboundCommand,
  ChannelStatus,
  SlackChannelConfig,
} from '../types.js';

// Types for Slack Bolt (optional dependency)
interface SlackApp {
  start(): Promise<void>;
  stop(): Promise<void>;
  client: {
    chat: {
      postMessage(params: {
        channel: string;
        text: string;
        blocks?: unknown[];
        metadata?: unknown;
        thread_ts?: string;
      }): Promise<{ ts?: string }>;
      update(params: {
        channel: string;
        ts: string;
        text: string;
        blocks?: unknown[];
      }): Promise<void>;
    };
  };
  action(
    actionId: string | RegExp,
    handler: (args: {
      ack: () => Promise<void>;
      body: SlackActionBody;
      say: (text: string) => Promise<void>;
    }) => Promise<void>
  ): void;
  message(
    pattern: RegExp,
    handler: (args: {
      message: { text: string; thread_ts?: string };
      say: (text: string) => Promise<void>;
    }) => Promise<void>
  ): void;
}

interface SlackActionBody {
  actions: Array<{ value: string; action_id: string }>;
  channel: { id: string };
  message: {
    ts: string;
    thread_ts?: string;
    text: string;
    blocks?: unknown[];
  };
  user: { id: string };
}

export class SlackAdapter implements ChannelAdapter {
  readonly name = 'slack';
  private config: SlackChannelConfig;
  private app: SlackApp | null = null;
  private connected = false;
  private lastMessageAt?: string;
  private error?: string;
  private commandHandler?: (command: InboundCommand) => Promise<void>;
  private messageTimestamps: Map<string, string> = new Map(); // interactionId -> ts
  private executionThreads: Map<string, string> = new Map(); // executionId -> threadTs

  constructor(config: SlackChannelConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) return;

    // Need tokens and either a default channel or engineers configured
    const hasChannel = this.config.channelId || (this.config.engineers && this.config.engineers.length > 0);
    if (!this.config.botToken || !this.config.appToken || !hasChannel) {
      this.error = 'Missing Slack configuration (botToken, appToken, and channelId or engineers)';
      console.warn(`[ProactiveMessaging] ${this.error}`);
      return;
    }

    try {
      // Dynamic import to make Slack SDK optional
      const { App } = await import('@slack/bolt');

      this.app = new App({
        token: this.config.botToken,
        appToken: this.config.appToken,
        socketMode: this.config.socketMode,
      }) as unknown as SlackApp;

      // Set up action handlers
      this.setupActionHandlers();

      // Start the app
      await this.app.start();
      this.connected = true;
      this.error = undefined;
      console.log('[ProactiveMessaging] Slack adapter connected');
    } catch (err) {
      this.error = err instanceof Error ? err.message : String(err);
      console.error('[ProactiveMessaging] Failed to initialize Slack:', this.error);
    }
  }

  private setupActionHandlers(): void {
    if (!this.app) return;

    // Handle button clicks
    this.app.action(/^pm_action_/, async ({ ack, body }) => {
      await ack();

      const action = body.actions[0];
      if (!action?.value) {
        console.error('[SlackAdapter] No action value');
        return;
      }

      const channelId = body.channel.id;
      const messageTs = body.message.ts;
      const threadTs = body.message.thread_ts || messageTs;

      try {
        const payload = JSON.parse(action.value);
        const command = this.parseActionToCommand(payload);

        if (!command || !this.commandHandler) {
          await this.postThreadReply(channelId, threadTs, `Something went wrong. Try again.`);
          return;
        }

        // Execute the command
        await this.commandHandler(command);

        // Update original message to remove buttons and show result
        await this.updateMessageAfterAction(channelId, messageTs, body.message, payload);

        // Post natural feedback in thread
        const feedback = this.getActionFeedback(payload);
        await this.postThreadReply(channelId, threadTs, feedback);

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('[SlackAdapter] Action error:', errorMsg);

        // Provide actionable feedback for guarantee failures
        let userMessage = `Something went wrong: ${errorMsg}`;
        if (errorMsg.includes('guarantee') || errorMsg.includes('Guarantee')) {
          // Parse guarantee error for cleaner message
          const match = errorMsg.match(/(\d+)\s*guarantee/i);
          const count = match ? match[1] : 'some';
          userMessage = `Cannot approve: ${count} guarantee(s) not satisfied.\n\nCheck the notification above for details on what's blocking, or run the loop from Claude Code to see full diagnostics.`;
        }

        await this.postThreadReply(channelId, threadTs, userMessage);
      }
    });

    // Handle text messages - natural language command parsing
    this.app.message(/.*/, async ({ message, say }) => {
      let text = (message as { text?: string }).text?.toLowerCase().trim();
      if (!text) return;

      // Strip Slack @mentions
      text = text.replace(/<@[A-Z0-9]+>/gi, '').trim();
      if (!text) return;

      const { command, feedback } = this.parseNaturalLanguage(text);

      if (command && this.commandHandler) {
        try {
          await this.commandHandler(command);
          if (feedback) await say(feedback);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          await say(`Problem: ${errorMsg}`);
        }
      }
    });
  }

  /**
   * Parse natural language text into commands
   * Supports: go, loops, skip, status, approve, feedback
   */
  private parseNaturalLanguage(text: string): { command: InboundCommand | null; feedback: string | null } {
    // Available loops (matching loops/ directory)
    const loops = [
      'engineering-loop', 'bugfix-loop', 'distribution-loop', 'proposal-loop',
      'audit-loop', 'dream-loop', 'learning-loop', 'infrastructure-loop',
      'deck-loop', 'transpose-loop', 'loop-composer', 'async-loop', 'cultivation-loop'
    ];

    // Normalize: remove hyphens for matching
    const normalized = text.replace(/-/g, '').replace(/\s+/g, ' ');

    // 1. GO / CONTINUE / NEXT / YES - proceed with current action
    if (/^(go|continue|next|yes|proceed|ok|okay|k|yep|yeah|y)$/i.test(text)) {
      return { command: { type: 'continue' }, feedback: 'Continuing...' };
    }

    // 2. APPROVE variants
    if (/^(approve|approved|lgtm|ship it|shipit)$/i.test(text)) {
      return {
        command: { type: 'approve', interactionId: 'latest', context: {} },
        feedback: 'Approving...'
      };
    }

    // 3. STATUS query
    if (/^(status|what'?s happening|what'?s up|where are we|current|state)$/i.test(text)) {
      return { command: { type: 'status' }, feedback: null };
    }

    // 4. NEXT LEVERAGE query
    if (/^(next|what'?s next|next move|leverage|what should i do)$/i.test(text)) {
      return { command: { type: 'next_leverage' }, feedback: null };
    }

    // 5. LOOP COMMANDS - flexible parsing for speech input
    // "engineering loop voice validation" / "start engineering loop" / "run bugfix loop"
    for (const loop of loops) {
      const loopBase = loop.replace(/-loop$/, ''); // "engineering", "bugfix", etc.

      // Patterns: "engineering loop X", "start engineering loop X", "run engineering loop X"
      const patterns = [
        new RegExp(`^(?:start\\s+|run\\s+)?${loopBase}\\s*loop(?:\\s+(.+))?$`, 'i'),
        new RegExp(`^(?:start\\s+|run\\s+)?${loop}(?:\\s+(.+))?$`, 'i'),
      ];

      for (const pattern of patterns) {
        const match = text.replace(/-/g, ' ').match(pattern);
        if (match) {
          const target = match[1]?.trim();
          return {
            command: { type: 'start_loop', loopId: loop, target },
            feedback: target ? `Starting ${loop} for ${target}...` : `Starting ${loop}...`
          };
        }
      }
    }

    // 7. FEEDBACK
    if (text.startsWith('feedback:')) {
      return {
        command: {
          type: 'feedback',
          interactionId: 'latest',
          text: text.replace('feedback:', '').trim(),
          context: {},
        },
        feedback: 'Got your feedback.'
      };
    }

    // 8. REJECT
    if (/^(reject|no|nope|stop|pause|hold)$/i.test(text)) {
      return {
        command: { type: 'reject', interactionId: 'latest', context: {} },
        feedback: 'Rejected. Loop paused.'
      };
    }

    // No match
    return { command: null, feedback: null };
  }

  /**
   * Update the original message to remove buttons after action
   */
  private async updateMessageAfterAction(
    channelId: string,
    messageTs: string,
    originalMessage: { text: string; blocks?: unknown[] },
    payload: { action: string; gateId?: string }
  ): Promise<void> {
    if (!this.app) return;

    try {
      // Keep text blocks, remove action blocks
      const updatedBlocks = (originalMessage.blocks || []).filter(
        (block: unknown) => (block as { type: string }).type !== 'actions'
      );

      // Add a context block showing what happened
      const actionText = payload.action === 'approve' ? '✓ Approved' :
                        payload.action === 'reject' ? '✗ Rejected' :
                        `✓ ${payload.action}`;

      updatedBlocks.push({
        type: 'context',
        elements: [{ type: 'mrkdwn', text: actionText }],
      });

      await this.app.client.chat.update({
        channel: channelId,
        ts: messageTs,
        text: originalMessage.text,
        blocks: updatedBlocks,
      });
    } catch (err) {
      console.error('[SlackAdapter] Failed to update message:', err);
    }
  }

  /**
   * Post a reply in the thread
   */
  private async postThreadReply(channelId: string, threadTs: string, text: string): Promise<void> {
    if (!this.app) return;

    try {
      await this.app.client.chat.postMessage({
        channel: channelId,
        text,
        thread_ts: threadTs,
      });
    } catch (err) {
      console.error('[SlackAdapter] Failed to post reply:', err);
    }
  }

  /**
   * Get natural feedback text for an action
   */
  private getActionFeedback(payload: { action: string; gateId?: string; phase?: string; missingFiles?: string[] }): string {
    switch (payload.action) {
      case 'approve':
        return payload.gateId
          ? `Got it. Approved ${payload.gateId.replace('-gate', '')} gate, continuing to next phase.`
          : 'Approved, continuing...';
      case 'force_approve':
        return payload.gateId
          ? `Force approved ${payload.gateId.replace('-gate', '')} gate (skipped guarantees), continuing...`
          : 'Force approved, continuing...';
      case 'reject':
        return payload.gateId
          ? `Rejected ${payload.gateId.replace('-gate', '')} gate. Loop paused.`
          : 'Rejected. Loop paused.';
      case 'start_next':
        return 'Starting next phase...';
      case 'continue':
        return 'Continuing...';
      case 'start_next_loop':
        return 'Starting next loop...';
      case 'create_deliverables':
        const files = payload.missingFiles?.join(', ') || 'missing files';
        return `Queued task for Claude Code to create: ${files}. Run \`get_pending_interactions\` in Claude Code or wait for it to pick up the task.`;
      default:
        return 'Done.';
    }
  }

  private parseActionToCommand(payload: {
    action: string;
    interactionId: string;
    gateId?: string;
    executionId?: string;
    proposalId?: string;
    proposalIds?: string[];
    completedLoopId?: string;
    completedModule?: string;
    missingFiles?: string[];
    value?: string; // For custom notifications that wrap the original value
  }): InboundCommand | null {
    switch (payload.action) {
      case 'approve':
        return {
          type: 'approve',
          interactionId: payload.interactionId,
          context: {
            gateId: payload.gateId,
            executionId: payload.executionId,
            proposalId: payload.proposalId,
          },
        };
      case 'force_approve':
        // Approve with skipGuarantees flag
        return {
          type: 'approve',
          interactionId: payload.interactionId,
          context: {
            gateId: payload.gateId,
            executionId: payload.executionId,
            skipGuarantees: true,
          },
        };
      case 'reject':
        return {
          type: 'reject',
          interactionId: payload.interactionId,
          context: {
            gateId: payload.gateId,
            executionId: payload.executionId,
            proposalId: payload.proposalId,
          },
        };
      case 'continue':
        return {
          type: 'continue',
          executionId: payload.executionId,
        };
      case 'approve_all_proposals':
        return {
          type: 'approve_all_proposals',
          interactionId: payload.interactionId,
          proposalIds: payload.proposalIds || [],
        };
      case 'start_next_loop':
        return {
          type: 'start_next_loop',
          interactionId: payload.interactionId,
          executionId: payload.executionId || '',
          completedLoopId: payload.completedLoopId || '',
          completedModule: payload.completedModule || '',
        };
      case 'start_next':
        // User clicked "Start Next" on a phase_start notification
        // This is an acknowledgment that they're ready for the phase to proceed
        return {
          type: 'continue',
          executionId: payload.executionId,
        };
      case 'create_deliverables':
        return {
          type: 'create_deliverables',
          interactionId: payload.interactionId,
          executionId: payload.executionId || '',
          gateId: payload.gateId || '',
          missingFiles: payload.missingFiles || [],
        };
      case 'custom':
        // Custom notifications wrap the original value - unwrap and re-parse
        if (payload.value) {
          try {
            const innerPayload = typeof payload.value === 'string'
              ? JSON.parse(payload.value)
              : payload.value;
            return this.parseActionToCommand({ ...innerPayload, interactionId: payload.interactionId });
          } catch {
            return null;
          }
        }
        return null;
      default:
        return null;
    }
  }

  async send(message: FormattedMessage): Promise<string | undefined> {
    if (!this.config.enabled || !this.app || !this.connected) return;

    try {
      const blocks = message.blocks || this.textToBlocks(message);
      const executionId = message.metadata?.executionId;
      const engineer = message.metadata?.engineer;

      // Resolve channel and user for multi-engineer routing
      const { channelId, slackUserId } = this.resolveEngineerConfig(engineer);

      if (!channelId) {
        console.error('[ProactiveMessaging] No channel configured for engineer:', engineer);
        return;
      }

      // Use notificationText for banner (clean, no ASCII art), fall back to text
      // Add @mention for notifications
      let text = message.notificationText || message.text;
      if (slackUserId && this.shouldMention(message.metadata?.eventType)) {
        text = `<@${slackUserId}> ${text}`;
      }

      // Determine thread_ts: explicit > lookup by executionId
      let threadTs = message.threadTs;
      if (!threadTs && executionId) {
        threadTs = this.executionThreads.get(executionId);
      }

      const result = await this.app.client.chat.postMessage({
        channel: channelId,
        text,
        blocks,
        thread_ts: threadTs,
        metadata: message.metadata
          ? {
              event_type: 'proactive_message',
              event_payload: message.metadata,
            }
          : undefined,
      });

      // Store timestamp for potential updates
      if (result.ts && message.metadata?.interactionId) {
        this.messageTimestamps.set(message.metadata.interactionId, result.ts);
      }

      // If this is a new thread (no threadTs provided but we have executionId),
      // store the mapping for future messages in this execution
      if (!threadTs && result.ts && executionId) {
        this.executionThreads.set(executionId, result.ts);
        console.log(`[ProactiveMessaging] Created thread ${result.ts} for execution ${executionId}`);
      }

      this.lastMessageAt = new Date().toISOString();
      return result.ts;
    } catch (err) {
      console.error('[ProactiveMessaging] Failed to send Slack message:', err);
      throw err;
    }
  }

  /**
   * Resolve channel and user ID for an engineer
   * Falls back to default config if engineer not found or not specified
   */
  private resolveEngineerConfig(engineer?: string): { channelId?: string; slackUserId?: string } {
    // If engineer specified and we have engineers config, look them up
    if (engineer && this.config.engineers) {
      const engineerConfig = this.config.engineers.find(e => e.name === engineer);
      if (engineerConfig) {
        return {
          channelId: engineerConfig.channelId,
          slackUserId: engineerConfig.slackUserId,
        };
      }
    }

    // Fall back to default config
    return {
      channelId: this.config.channelId,
      slackUserId: this.config.slackUserId,
    };
  }

  /**
   * Get thread timestamp for an execution
   */
  getThreadTs(executionId: string): string | undefined {
    return this.executionThreads.get(executionId);
  }

  /**
   * Set thread timestamp for an execution (for external thread management)
   */
  setThreadTs(executionId: string, threadTs: string): void {
    this.executionThreads.set(executionId, threadTs);
  }

  /**
   * Determine if an event type should trigger a user @mention
   * All notifications mention the user for maximum visibility on mobile
   */
  private shouldMention(eventType?: string): boolean {
    // Mention on all notifications for mobile visibility
    return !!eventType;
  }

  /**
   * Send a message to all configured engineers (broadcast)
   */
  async broadcast(message: FormattedMessage): Promise<void> {
    if (!this.config.enabled || !this.app || !this.connected) return;

    // If we have engineers configured, send to each
    if (this.config.engineers && this.config.engineers.length > 0) {
      for (const engineer of this.config.engineers) {
        const engineerMessage = {
          ...message,
          metadata: {
            ...message.metadata,
            engineer: engineer.name,
          },
        } as FormattedMessage;
        await this.send(engineerMessage);
      }
    } else if (this.config.channelId) {
      // Fall back to default channel
      await this.send(message);
    }
  }

  /**
   * Get list of configured engineer names
   */
  getEngineers(): string[] {
    return this.config.engineers?.map(e => e.name) || [];
  }

  async update(messageId: string, message: FormattedMessage): Promise<void> {
    if (!this.config.enabled || !this.app || !this.connected) return;

    const ts = this.messageTimestamps.get(messageId);
    if (!ts) {
      // Can't update, send new message instead
      await this.send(message);
      return;
    }

    try {
      const blocks = message.blocks || this.textToBlocks(message);
      const { channelId } = this.resolveEngineerConfig(message.metadata?.engineer);

      if (!channelId) {
        console.error('[ProactiveMessaging] No channel for update');
        return;
      }

      await this.app.client.chat.update({
        channel: channelId,
        ts,
        text: message.text,
        blocks,
      });
    } catch (err) {
      console.error('[ProactiveMessaging] Failed to update Slack message:', err);
    }
  }

  private textToBlocks(message: FormattedMessage): unknown[] {
    const blocks: unknown[] = [];

    // Split text into sections
    const lines = message.text.split('\n');
    let currentSection = '';

    for (const line of lines) {
      if (line.match(/^[═]+$/)) {
        // Divider
        if (currentSection.trim()) {
          blocks.push({
            type: 'section',
            text: { type: 'mrkdwn', text: currentSection.trim() },
          });
          currentSection = '';
        }
        blocks.push({ type: 'divider' });
      } else if (line.match(/^[─]+$/)) {
        // Light divider - just add spacing
        if (currentSection.trim()) {
          blocks.push({
            type: 'section',
            text: { type: 'mrkdwn', text: currentSection.trim() },
          });
          currentSection = '';
        }
      } else {
        currentSection += line + '\n';
      }
    }

    // Add remaining section
    if (currentSection.trim()) {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: currentSection.trim() },
      });
    }

    // Add action buttons
    if (message.actions && message.actions.length > 0) {
      blocks.push({
        type: 'actions',
        elements: message.actions.map((action) => ({
          type: 'button',
          text: { type: 'plain_text', text: action.label },
          action_id: `pm_action_${action.id}`,
          value: action.value,
          style: action.style,
        })),
      });
    }

    return blocks;
  }

  getStatus(): ChannelStatus {
    return {
      name: this.name,
      enabled: this.config.enabled,
      connected: this.connected,
      lastMessageAt: this.lastMessageAt,
      error: this.error,
    };
  }

  onCommand(handler: (command: InboundCommand) => Promise<void>): void {
    this.commandHandler = handler;
  }

  async disconnect(): Promise<void> {
    if (this.app) {
      try {
        await this.app.stop();
        this.connected = false;
      } catch (err) {
        console.error('[ProactiveMessaging] Error disconnecting Slack:', err);
      }
    }
  }
}
