import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpeechQueue } from '../services/voice/SpeechQueue.js';
import { QuietHoursManager } from '../services/voice/QuietHoursManager.js';
import { EventFormatter } from '../services/voice/EventFormatter.js';
import type { FormattedMessage } from '../services/proactive-messaging/types.js';

describe('SpeechQueue', () => {
  let queue: SpeechQueue;

  beforeEach(() => {
    queue = new SpeechQueue();
  });

  it('enqueues items in order', () => {
    queue.enqueue('first', 'normal');
    queue.enqueue('second', 'normal');
    queue.enqueue('third', 'normal');

    expect(queue.size()).toBe(3);
    expect(queue.dequeue()?.text).toBe('first');
    expect(queue.dequeue()?.text).toBe('second');
    expect(queue.dequeue()?.text).toBe('third');
  });

  it('prioritizes urgent items at front', () => {
    queue.enqueue('normal1', 'normal');
    queue.enqueue('normal2', 'normal');
    queue.enqueue('urgent', 'urgent');

    expect(queue.dequeue()?.text).toBe('urgent');
    expect(queue.dequeue()?.text).toBe('normal1');
  });

  it('returns null when empty', () => {
    expect(queue.dequeue()).toBeNull();
    expect(queue.peek()).toBeNull();
  });

  it('clears all items', () => {
    queue.enqueue('item1', 'normal');
    queue.enqueue('item2', 'normal');
    queue.clear();

    expect(queue.isEmpty()).toBe(true);
    expect(queue.size()).toBe(0);
  });

  it('peeks without removing', () => {
    queue.enqueue('item', 'normal');

    expect(queue.peek()?.text).toBe('item');
    expect(queue.size()).toBe(1);
  });

  it('includes event type in queue item', () => {
    queue.enqueue('gate waiting', 'urgent', 'gate_waiting');
    const item = queue.dequeue();

    expect(item?.eventType).toBe('gate_waiting');
  });
});

describe('QuietHoursManager', () => {
  it('returns false when disabled', () => {
    const manager = new QuietHoursManager({
      enabled: false,
      start: '22:00',
      end: '07:00',
      urgentBypass: true,
    });

    expect(manager.isQuietHours()).toBe(false);
    expect(manager.shouldSpeak('normal')).toBe(true);
  });

  it('detects quiet hours during overnight span', () => {
    const manager = new QuietHoursManager({
      enabled: true,
      start: '22:00',
      end: '07:00',
      urgentBypass: true,
    });

    // 23:00 should be quiet hours
    const lateNight = new Date();
    lateNight.setHours(23, 0, 0, 0);
    expect(manager.isQuietHours(lateNight)).toBe(true);

    // 03:00 should be quiet hours
    const earlyMorning = new Date();
    earlyMorning.setHours(3, 0, 0, 0);
    expect(manager.isQuietHours(earlyMorning)).toBe(true);

    // 12:00 should not be quiet hours
    const midday = new Date();
    midday.setHours(12, 0, 0, 0);
    expect(manager.isQuietHours(midday)).toBe(false);
  });

  it('respects urgent bypass during quiet hours', () => {
    const manager = new QuietHoursManager({
      enabled: true,
      start: '22:00',
      end: '07:00',
      urgentBypass: true,
    });

    const lateNight = new Date();
    lateNight.setHours(23, 0, 0, 0);

    // Mock isQuietHours to return true
    vi.spyOn(manager, 'isQuietHours').mockReturnValue(true);

    expect(manager.shouldSpeak('normal')).toBe(false);
    expect(manager.shouldSpeak('urgent')).toBe(true);
  });

  it('blocks all when urgentBypass is false', () => {
    const manager = new QuietHoursManager({
      enabled: true,
      start: '22:00',
      end: '07:00',
      urgentBypass: false,
    });

    vi.spyOn(manager, 'isQuietHours').mockReturnValue(true);

    expect(manager.shouldSpeak('normal')).toBe(false);
    expect(manager.shouldSpeak('urgent')).toBe(false);
  });
});

describe('EventFormatter', () => {
  let formatter: EventFormatter;

  beforeEach(() => {
    formatter = new EventFormatter();
  });

  it('strips markdown formatting', () => {
    const message: FormattedMessage = {
      text: '**Bold** and *italic* and `code`',
    };

    const result = formatter.formatForSpeech(message);
    expect(result).toBe('Bold and italic and code');
  });

  it('converts common emojis to words', () => {
    const message: FormattedMessage = {
      text: '✅ Task completed',
    };

    const result = formatter.formatForSpeech(message);
    expect(result).toContain('completed');
  });

  it('simplifies gate waiting phrases', () => {
    const message: FormattedMessage = {
      text: 'Gate SCAFFOLD-gate is waiting for approval',
    };

    const result = formatter.formatForSpeech(message);
    // SCAFFOLD gets lowercased by the simplification rules
    expect(result).toBe('scaffold gate waiting');
  });

  it('uses notificationText when available', () => {
    const message: FormattedMessage = {
      text: 'Long detailed message with **markdown**',
      notificationText: 'Short notification',
    };

    const result = formatter.formatForSpeech(message);
    expect(result).toBe('Short notification');
  });

  it('determines priority based on event type', () => {
    expect(formatter.getEventPriority('gate_waiting')).toBe('urgent');
    expect(formatter.getEventPriority('execution_blocked')).toBe('urgent');
    expect(formatter.getEventPriority('phase_start')).toBe('normal');
    expect(formatter.getEventPriority('loop_complete')).toBe('normal');
    expect(formatter.getEventPriority(undefined)).toBe('normal');
  });

  it('fixes pronunciation of acronyms', () => {
    const message: FormattedMessage = {
      text: 'The TTS API is ready',
    };

    const result = formatter.formatForSpeech(message);
    expect(result).toContain('T T S');
    expect(result).toContain('A P I');
  });
});
