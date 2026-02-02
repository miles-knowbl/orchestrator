/**
 * Channel Adapter Interface
 *
 * All channel adapters implement this interface for consistent
 * message sending and receiving across terminal, Slack, etc.
 */

import type { FormattedMessage, InboundCommand, ChannelStatus } from '../types.js';

export interface ChannelAdapter {
  /** Unique name for this channel */
  readonly name: string;

  /** Initialize the adapter (connect, authenticate, etc.) */
  initialize(): Promise<void>;

  /** Send a formatted message to this channel */
  send(message: FormattedMessage): Promise<void>;

  /** Update an existing message (for Slack message updates) */
  update?(messageId: string, message: FormattedMessage): Promise<void>;

  /** Get the current connection status */
  getStatus(): ChannelStatus;

  /** Set handler for inbound commands */
  onCommand(handler: (command: InboundCommand) => Promise<void>): void;

  /** Gracefully disconnect */
  disconnect(): Promise<void>;
}
