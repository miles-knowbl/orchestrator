/**
 * Quiet Hours Manager
 *
 * Manages time-based filtering for voice notifications.
 * Supports overnight spans (e.g., 22:00-07:00) and urgent bypass.
 */

import type { QuietHoursConfig } from './types.js';

export class QuietHoursManager {
  private config: QuietHoursConfig;

  constructor(config: QuietHoursConfig) {
    this.config = config;
  }

  /**
   * Update the configuration
   */
  setConfig(config: QuietHoursConfig): void {
    this.config = config;
  }

  /**
   * Get the current configuration
   */
  getConfig(): QuietHoursConfig {
    return { ...this.config };
  }

  /**
   * Check if currently in quiet hours
   */
  isQuietHours(now: Date = new Date()): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = this.parseTime(this.config.start);
    const endMinutes = this.parseTime(this.config.end);

    // Handle overnight span (e.g., 22:00-07:00)
    if (startMinutes > endMinutes) {
      // Quiet hours span midnight
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      // Same-day span (e.g., 12:00-14:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  }

  /**
   * Check if speech should be allowed given the priority
   */
  shouldSpeak(priority: 'normal' | 'urgent'): boolean {
    if (!this.isQuietHours()) {
      return true;
    }

    // During quiet hours, only allow urgent if bypass is enabled
    if (priority === 'urgent' && this.config.urgentBypass) {
      return true;
    }

    return false;
  }

  /**
   * Get when quiet hours end (for status display)
   */
  getQuietHoursEnd(): Date | null {
    if (!this.isQuietHours()) {
      return null;
    }

    const now = new Date();
    const endMinutes = this.parseTime(this.config.end);
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;

    const end = new Date(now);
    end.setHours(endHours, endMins, 0, 0);

    // If end time is earlier than now, it's tomorrow
    if (end <= now) {
      end.setDate(end.getDate() + 1);
    }

    return end;
  }

  /**
   * Parse time string "HH:MM" to minutes since midnight
   */
  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
