/**
 * Event Formatter
 *
 * Converts ProactiveMessaging events to speech-friendly text.
 * Strips markdown, converts emojis, and simplifies verbose content.
 */

import type { FormattedMessage } from '../proactive-messaging/types.js';

export class EventFormatter {
  /**
   * Emoji to word mappings for speech
   */
  private static readonly EMOJI_MAP: Record<string, string> = {
    '\u2705': 'completed', // ✅
    '\u23f3': 'waiting', // ⏳
    '\u274c': 'failed', // ❌
    '\u26a0\ufe0f': 'warning', // ⚠️
    '\u25b6\ufe0f': 'started', // ▶️
    '\u23f8\ufe0f': 'paused', // ⏸️
    '\ud83d\udd04': 'retry', // 🔄
    '\ud83d\ude80': 'shipped', // 🚀
    '\ud83c\udfaf': 'target', // 🎯
    '\ud83d\udce6': 'package', // 📦
    '\ud83d\udd12': 'locked', // 🔒
    '\ud83d\udd13': 'unlocked', // 🔓
  };

  /**
   * Format a message for speech output
   */
  formatForSpeech(message: FormattedMessage): string {
    let text = message.notificationText || message.text;

    // Strip markdown formatting
    text = this.stripMarkdown(text);

    // Convert emojis to words
    text = this.convertEmojis(text);

    // Simplify verbose phrases
    text = this.simplifyPhrases(text);

    // Fix pronunciation
    text = this.fixPronunciation(text);

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * Strip markdown formatting
   */
  private stripMarkdown(text: string): string {
    return (
      text
        // Remove bold/italic
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        // Remove inline code
        .replace(/`([^`]+)`/g, '$1')
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        // Remove links, keep text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove headers
        .replace(/^#+\s*/gm, '')
        // Remove horizontal rules
        .replace(/^[-*_]{3,}$/gm, '')
        // Remove list markers
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
    );
  }

  /**
   * Convert emojis to spoken words
   */
  private convertEmojis(text: string): string {
    for (const [emoji, word] of Object.entries(EventFormatter.EMOJI_MAP)) {
      text = text.replace(new RegExp(emoji, 'g'), word);
    }

    // Remove any remaining emojis
    // eslint-disable-next-line no-control-regex
    text = text.replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      ''
    );

    return text;
  }

  /**
   * Simplify verbose phrases for speech
   */
  private simplifyPhrases(text: string): string {
    const replacements: [RegExp, string][] = [
      // Gate phrases
      [/Gate (\w+)-gate is waiting for approval/gi, '$1 gate waiting'],
      [/waiting for approval/gi, 'waiting'],
      [/has been approved/gi, 'approved'],
      [/has been rejected/gi, 'rejected'],

      // Phase phrases
      [/Entering phase: (\w+)/gi, 'Starting $1'],
      [/Phase (\w+) completed/gi, '$1 done'],
      [/Moving to phase (\w+)/gi, 'Next: $1'],

      // Skill phrases
      [/Skill (\w+) completed successfully/gi, '$1 completed'],
      [/Executing skill (\w+)/gi, 'Running $1'],

      // Loop phrases
      [/Loop execution completed/gi, 'Loop complete'],
      [/Loop execution started/gi, 'Loop started'],
      [/Engineering loop/gi, 'Engineering loop'],

      // Technical terms
      [/SCAFFOLD/g, 'scaffold'],
      [/IMPLEMENT/g, 'implement'],
      [/VERIFY/g, 'verify'],
      [/VALIDATE/g, 'validate'],
      [/REVIEW/g, 'review'],
      [/INIT/g, 'init'],
      [/TEST/g, 'test'],
      [/SHIP/g, 'ship'],
      [/COMPLETE/g, 'complete'],
      [/DOCUMENT/g, 'document'],
    ];

    for (const [pattern, replacement] of replacements) {
      text = text.replace(pattern, replacement);
    }

    return text;
  }

  /**
   * Fix pronunciation of technical terms
   */
  private fixPronunciation(text: string): string {
    const pronunciations: [RegExp, string][] = [
      [/\bTTS\b/g, 'T T S'],
      [/\bAPI\b/g, 'A P I'],
      [/\bUI\b/g, 'U I'],
      [/\bCLI\b/g, 'C L I'],
      [/\bMCP\b/g, 'M C P'],
      [/\bSSE\b/g, 'S S E'],
      [/\bADR\b/g, 'A D R'],
      [/\bJSON\b/gi, 'jason'],
      [/\bsrc\b/g, 'source'],
      [/\benv\b/g, 'environment'],
      [/\bconfig\b/g, 'config'],
      [/\basync\b/g, 'async'],
    ];

    for (const [pattern, replacement] of pronunciations) {
      text = text.replace(pattern, replacement);
    }

    return text;
  }

  /**
   * Get event type for priority determination
   */
  getEventPriority(eventType?: string): 'normal' | 'urgent' {
    const urgentEvents = ['gate_waiting', 'execution_blocked', 'execution_failed'];

    if (eventType && urgentEvents.includes(eventType)) {
      return 'urgent';
    }

    return 'normal';
  }
}
