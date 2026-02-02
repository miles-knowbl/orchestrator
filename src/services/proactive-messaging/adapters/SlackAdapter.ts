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

  constructor(config: SlackChannelConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) return;

    if (!this.config.botToken || !this.config.appToken || !this.config.channelId) {
      this.error = 'Missing Slack configuration (botToken, appToken, or channelId)';
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
      default:
        return null;
    }
  }

  async send(message: FormattedMessage): Promise<void> {
    if (!this.config.enabled || !this.app || !this.connected) return;

    try {
      const blocks = message.blocks || this.textToBlocks(message);

      const result = await this.app.client.chat.postMessage({
        channel: this.config.channelId!,
        text: message.text,
        blocks,
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

      this.lastMessageAt = new Date().toISOString();
    } catch (err) {
      console.error('[ProactiveMessaging] Failed to send Slack message:', err);
      throw err;
    }
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

      await this.app.client.chat.update({
        channel: this.config.channelId!,
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
