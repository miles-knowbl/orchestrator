/**
 * Terminal Channel Adapter
 *
 * Outputs messages to console and optionally sends OS-level notifications.
 */

import type { ChannelAdapter } from './ChannelAdapter.js';
import type {
  FormattedMessage,
  InboundCommand,
  ChannelStatus,
  TerminalChannelConfig,
} from '../types.js';

export class TerminalAdapter implements ChannelAdapter {
  readonly name = 'terminal';
  private config: TerminalChannelConfig;
  private lastMessageAt?: string;
  private commandHandler?: (command: InboundCommand) => Promise<void>;
  private notifier: { notify: (options: object) => void } | null = null;

  constructor(config: TerminalChannelConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.config.osNotifications) {
      try {
        // Dynamic import to make it optional
        const nodeNotifier = await import('node-notifier');
        this.notifier = nodeNotifier.default || nodeNotifier;
      } catch {
        console.warn('[ProactiveMessaging] node-notifier not available, OS notifications disabled');
      }
    }
  }

  async send(message: FormattedMessage): Promise<void> {
    if (!this.config.enabled) return;

    // Console output with box drawing
    console.log('\n' + '═'.repeat(70));
    console.log(message.text);

    if (message.actions && message.actions.length > 0) {
      console.log('─'.repeat(70));
      console.log('Actions: ' + message.actions.map(a => `[${a.label}]`).join('  '));
    }

    console.log('═'.repeat(70) + '\n');

    // OS notification
    if (this.config.osNotifications && this.notifier) {
      const title = this.extractTitle(message.text);
      const body = this.extractBody(message.text);

      this.notifier.notify({
        title: title || 'Orchestrator',
        message: body || message.text.slice(0, 100),
        sound: true,
        wait: false,
      });
    }

    this.lastMessageAt = new Date().toISOString();
  }

  async update(_messageId: string, message: FormattedMessage): Promise<void> {
    // Terminal can't update messages, just send new one
    await this.send(message);
  }

  getStatus(): ChannelStatus {
    return {
      name: this.name,
      enabled: this.config.enabled,
      connected: true, // Terminal is always "connected"
      lastMessageAt: this.lastMessageAt,
    };
  }

  onCommand(handler: (command: InboundCommand) => Promise<void>): void {
    this.commandHandler = handler;
    // Terminal doesn't receive commands through this adapter
    // Commands come through the main CLI/MCP interface
  }

  async disconnect(): Promise<void> {
    // Nothing to disconnect
  }

  /**
   * Allow external command injection (for CLI integration)
   */
  async injectCommand(command: InboundCommand): Promise<void> {
    if (this.commandHandler) {
      await this.commandHandler(command);
    }
  }

  private extractTitle(text: string): string | undefined {
    // Extract title from box-drawing formatted message
    // Look for lines like "║  SPEC GATE                    [HUMAN] ║"
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      // Match lines with side borders containing uppercase text
      const match = trimmed.match(/^║\s+([A-Z][A-Z\s]+)/);
      if (match) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  private extractBody(text: string): string | undefined {
    // Get first meaningful content line (strip box-drawing characters)
    const lines = text.split('\n');
    for (const line of lines) {
      // Skip borders and empty lines
      if (line.match(/^[═─`]+$/) || line.match(/^║\s+║$/)) continue;
      // Extract content from box lines
      const match = line.match(/^║\s+(.+?)\s+║$/);
      if (match) {
        const content = match[1].trim();
        // Skip title lines (all caps with brackets)
        if (!content.match(/^[A-Z\s]+\s+\[/)) {
          return content.slice(0, 100);
        }
      }
    }
    return undefined;
  }
}
