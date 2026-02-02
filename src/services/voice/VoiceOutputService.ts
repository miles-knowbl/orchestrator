/**
 * Voice Output Service
 *
 * Core service managing text-to-speech output for the Orchestrator.
 * Integrates speech queue, quiet hours, and macOS TTS engine.
 */

import { MacOSTTS } from './MacOSTTS.js';
import { SpeechQueue } from './SpeechQueue.js';
import { QuietHoursManager } from './QuietHoursManager.js';
import { EventFormatter } from './EventFormatter.js';
import type { VoiceChannelConfig, VoiceStatus, SpeakOptions, DEFAULT_VOICE_CONFIG } from './types.js';

export class VoiceOutputService {
  private config: VoiceChannelConfig;
  private tts: MacOSTTS;
  private queue: SpeechQueue;
  private quietHours: QuietHoursManager;
  private formatter: EventFormatter;

  private speaking = false;
  private paused = false;
  private lastSpokenAt?: Date;
  private processing = false;

  constructor(config: VoiceChannelConfig) {
    this.config = config;
    this.tts = new MacOSTTS();
    this.queue = new SpeechQueue();
    this.quietHours = new QuietHoursManager(config.quietHours);
    this.formatter = new EventFormatter();

    // Apply initial config
    this.tts.setVoice(config.voice);
    this.tts.setRate(config.rate);
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('[VoiceOutput] Service disabled');
      return;
    }

    const available = await MacOSTTS.isAvailable();
    if (!available) {
      console.warn('[VoiceOutput] macOS say command not available');
      this.config.enabled = false;
      return;
    }

    console.log('[VoiceOutput] Service initialized');
  }

  /**
   * Update configuration
   */
  configure(config: Partial<VoiceChannelConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.voice) {
      this.tts.setVoice(config.voice);
    }

    if (config.rate) {
      this.tts.setRate(config.rate);
    }

    if (config.quietHours) {
      this.quietHours.setConfig({ ...this.config.quietHours, ...config.quietHours });
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): VoiceChannelConfig {
    return { ...this.config };
  }

  /**
   * Add text to the speech queue
   */
  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const priority = options.priority || 'normal';

    // Check quiet hours
    if (!this.quietHours.shouldSpeak(priority)) {
      console.log('[VoiceOutput] Skipping speech during quiet hours');
      return;
    }

    // Add to queue
    this.queue.enqueue(text, priority, options.eventType);

    // Start processing if not already
    this.processQueue();
  }

  /**
   * Speak immediately, interrupting current speech
   */
  async speakNow(text: string, options: SpeakOptions = {}): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Stop current speech
    this.tts.stop();

    // Clear queue and add this at front
    this.queue.clear();
    this.queue.enqueue(text, 'urgent', options.eventType);

    // Process immediately
    this.processQueue();
  }

  /**
   * Get all items in the queue
   */
  getQueue(): ReturnType<SpeechQueue['getAll']> {
    return this.queue.getAll();
  }

  /**
   * Clear the speech queue
   */
  clearQueue(): void {
    this.queue.clear();
  }

  /**
   * Pause speech output
   */
  pause(): void {
    this.paused = true;
    this.tts.stop();
  }

  /**
   * Resume speech output
   */
  resume(): void {
    this.paused = false;
    this.processQueue();
  }

  /**
   * Skip the current speech item
   */
  skip(): void {
    this.tts.stop();
    // Processing will continue with next item
  }

  /**
   * Get current status
   */
  getStatus(): VoiceStatus {
    const current = this.queue.peek();

    return {
      enabled: this.config.enabled,
      speaking: this.speaking,
      paused: this.paused,
      queueLength: this.queue.size(),
      currentItem: current
        ? {
            text: current.text,
            eventType: current.eventType,
          }
        : undefined,
      lastSpokenAt: this.lastSpokenAt,
      quietHours: {
        active: this.quietHours.isQuietHours(),
        until: this.quietHours.getQuietHoursEnd() || undefined,
      },
    };
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.speaking;
  }

  /**
   * Get the event formatter (for external use)
   */
  getFormatter(): EventFormatter {
    return this.formatter;
  }

  /**
   * Check if an event type should be spoken
   */
  shouldSpeakEvent(eventType: string): boolean {
    const eventConfig = this.config.events as Record<string, boolean>;
    return eventConfig[eventType] ?? false;
  }

  /**
   * Process the speech queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.paused || !this.config.enabled) {
      return;
    }

    this.processing = true;

    try {
      while (!this.queue.isEmpty() && !this.paused) {
        const item = this.queue.dequeue();
        if (!item) break;

        // Check quiet hours again (in case it changed)
        if (!this.quietHours.shouldSpeak(item.priority)) {
          continue;
        }

        this.speaking = true;

        try {
          await this.tts.speak(item.text);
          this.lastSpokenAt = new Date();
        } catch (err) {
          console.error('[VoiceOutput] Speech error:', err);
        }

        this.speaking = false;
      }
    } finally {
      this.processing = false;
      this.speaking = false;
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.tts.stop();
    this.queue.clear();
    this.config.enabled = false;
  }
}
