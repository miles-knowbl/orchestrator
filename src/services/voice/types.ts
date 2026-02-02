/**
 * Voice Module Types
 *
 * Type definitions for the voice output system.
 */

/**
 * Quiet hours configuration for voice output
 */
export interface QuietHoursConfig {
  enabled: boolean;
  start: string; // "22:00" (24-hour format)
  end: string; // "07:00"
  urgentBypass: boolean; // Allow urgent notifications during quiet hours
}

/**
 * Voice channel configuration
 */
export interface VoiceChannelConfig {
  enabled: boolean;

  // macOS say command options
  voice: string; // "Samantha", "Alex", "Daniel", etc.
  rate: number; // Words per minute (80-300, default 175)

  // Event filtering
  events: {
    gate_waiting: boolean;
    loop_complete: boolean;
    phase_start: boolean;
    skill_complete: boolean;
    execution_status: boolean;
  };

  // Quiet hours
  quietHours: QuietHoursConfig;
}

/**
 * Default voice configuration
 */
export const DEFAULT_VOICE_CONFIG: VoiceChannelConfig = {
  enabled: true,
  voice: 'Samantha',
  rate: 175,
  events: {
    gate_waiting: true,
    loop_complete: true,
    phase_start: true,
    skill_complete: false,
    execution_status: false,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
    urgentBypass: true,
  },
};

/**
 * Speech queue item
 */
export interface SpeechQueueItem {
  id: string;
  text: string;
  priority: 'normal' | 'urgent';
  eventType?: string;
  createdAt: Date;
}

/**
 * Options for speak() method
 */
export interface SpeakOptions {
  priority?: 'normal' | 'urgent';
  eventType?: string;
}

/**
 * Voice status response
 */
export interface VoiceStatus {
  enabled: boolean;
  speaking: boolean;
  paused: boolean;
  queueLength: number;
  currentItem?: {
    text: string;
    eventType?: string;
  };
  lastSpokenAt?: Date;
  quietHours: {
    active: boolean;
    until?: Date;
  };
}
