/**
 * Voice Channel Adapter
 *
 * Integrates VoiceOutputService with ProactiveMessagingService.
 * Converts formatted messages to speech-friendly text and queues for TTS.
 */

import type { ChannelAdapter } from './ChannelAdapter.js';
import type { FormattedMessage, ChannelStatus, InboundCommand } from '../types.js';
import { VoiceOutputService, type VoiceChannelConfig } from '../../voice/index.js';

export class VoiceAdapter implements ChannelAdapter {
  readonly name = 'voice';
  private config: VoiceChannelConfig;
  private service: VoiceOutputService;
  private connected = false;
  private lastMessageAt?: string;
  private error?: string;

  constructor(config: VoiceChannelConfig) {
    this.config = config;
    this.service = new VoiceOutputService(config);
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      await this.service.initialize();
      this.connected = this.config.enabled;
      this.error = undefined;
      console.log('[ProactiveMessaging] Voice adapter initialized');
    } catch (err) {
      this.error = err instanceof Error ? err.message : String(err);
      console.error('[ProactiveMessaging] Failed to initialize voice:', this.error);
    }
  }

  async send(message: FormattedMessage): Promise<string | undefined> {
    if (!this.config.enabled || !this.connected) {
      return;
    }

    const eventType = message.metadata?.eventType;

    // Check if this event type should be spoken
    if (eventType && !this.service.shouldSpeakEvent(eventType)) {
      console.log(`[VoiceAdapter] Skipping event type: ${eventType}`);
      return;
    }

    // Format the message for speech
    const formatter = this.service.getFormatter();
    const speechText = formatter.formatForSpeech(message);

    // Determine priority
    const priority = formatter.getEventPriority(eventType);

    // Queue the speech
    await this.service.speak(speechText, {
      priority,
      eventType,
    });

    this.lastMessageAt = new Date().toISOString();

    // Return a pseudo-ID (voice doesn't have message IDs)
    return `voice-${Date.now()}`;
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

  /**
   * Voice is output-only, no inbound commands
   */
  onCommand(_handler: (command: InboundCommand) => Promise<void>): void {
    // Voice adapter is output-only, no inbound commands
  }

  /**
   * Get the underlying VoiceOutputService for direct access
   */
  getService(): VoiceOutputService {
    return this.service;
  }

  async disconnect(): Promise<void> {
    this.service.disconnect();
    this.connected = false;
  }
}
