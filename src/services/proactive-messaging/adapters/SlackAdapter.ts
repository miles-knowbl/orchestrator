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
      body: { actions: Array<{ value: string }> };
      say: (text: string) => Promise<void>;
    }) => Promise<void>
  ): void;
  message(
    pattern: RegExp,
    handler: (args: {
      message: { text: string };
      say: (text: string) => Promise<void>;
    }) => Promise<void>
  ): void;
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
    this.app.action(/^pm_action_/, async ({ ack, body, say }) => {
      await ack();

      const action = body.actions[0];
      if (!action) return;

      try {
        const payload = JSON.parse(action.value);
        const command = this.parseActionToCommand(payload);

        if (command && this.commandHandler) {
          await this.commandHandler(command);
          await say(`✓ Action received: ${payload.action}`);
        }
      } catch (err) {
        console.error('[ProactiveMessaging] Error handling Slack action:', err);
      }
    });

    // Handle text messages
    this.app.message(/.*/, async ({ message, say }) => {
      const text = (message as { text?: string }).text?.toLowerCase().trim();
      if (!text) return;

      let command: InboundCommand | null = null;

      if (text === 'go' || text === 'continue') {
        command = { type: 'continue' };
      } else if (text === 'approved' || text === 'approve') {
        // Need context - for now just acknowledge
        await say('Please use the [Approve] button on a specific notification.');
        return;
      } else if (text.startsWith('feedback:')) {
        command = {
          type: 'feedback',
          interactionId: 'latest', // Will be resolved by service
          text: text.replace('feedback:', '').trim(),
          context: {},
        };
      }

      if (command && this.commandHandler) {
        await this.commandHandler(command);
      }
    });
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
