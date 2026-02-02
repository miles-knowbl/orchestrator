/**
 * Rhythm Analyzer
 *
 * Detects recurring patterns in execution event sequences,
 * inspired by Gamelan music's interlocking rhythmic cycles.
 */

import { randomUUID } from 'crypto';
import type { ClockEvent, RhythmPattern } from './types.js';

export class RhythmAnalyzer {
  private patternCache: Map<string, RhythmPattern> = new Map();

  /**
   * Detect patterns in a sequence of clock events
   */
  detectPatterns(events: ClockEvent[]): RhythmPattern[] {
    if (events.length < 3) {
      return [];
    }

    const patterns: RhythmPattern[] = [];

    // Analyze event type sequences
    const typeSequences = this.findTypeSequences(events);
    patterns.push(...typeSequences);

    // Analyze timing patterns
    const timingPatterns = this.findTimingPatterns(events);
    patterns.push(...timingPatterns);

    // Merge and deduplicate
    return this.mergePatterns(patterns);
  }

  /**
   * Find repeating sequences of event types
   */
  private findTypeSequences(events: ClockEvent[]): RhythmPattern[] {
    const patterns: RhythmPattern[] = [];
    const typeSequence = events.map(e => e.type);

    // Look for sequences of length 2-5
    for (let len = 2; len <= Math.min(5, events.length / 2); len++) {
      const sequenceCounts = new Map<string, { count: number; durations: number[] }>();

      for (let i = 0; i <= events.length - len; i++) {
        const seq = typeSequence.slice(i, i + len).join('→');
        const duration = this.getSequenceDuration(events.slice(i, i + len));

        const existing = sequenceCounts.get(seq) || { count: 0, durations: [] };
        existing.count++;
        existing.durations.push(duration);
        sequenceCounts.set(seq, existing);
      }

      // Keep patterns that appear at least twice
      for (const [seq, data] of sequenceCounts) {
        if (data.count >= 2) {
          const avgDuration = data.durations.reduce((a, b) => a + b, 0) / data.durations.length;
          const variance = this.calculateVariance(data.durations);
          const confidence = Math.max(0, 1 - variance / avgDuration);

          patterns.push({
            id: randomUUID(),
            name: `Type sequence: ${seq}`,
            events: seq.split('→'),
            averageDuration: avgDuration,
            frequency: data.count,
            confidence,
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Find patterns in event timing
   */
  private findTimingPatterns(events: ClockEvent[]): RhythmPattern[] {
    const patterns: RhythmPattern[] = [];

    // Calculate inter-event intervals
    const intervals: number[] = [];
    for (let i = 1; i < events.length; i++) {
      const interval = events[i].timestamp.getTime() - events[i - 1].timestamp.getTime();
      intervals.push(interval);
    }

    if (intervals.length < 2) {
      return patterns;
    }

    // Look for regular intervals (rhythm)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = this.calculateVariance(intervals);
    const regularity = 1 - Math.min(1, variance / avgInterval);

    if (regularity > 0.7) {
      patterns.push({
        id: randomUUID(),
        name: 'Regular rhythm',
        events: ['*'],
        averageDuration: avgInterval,
        frequency: intervals.length,
        confidence: regularity,
      });
    }

    // Look for burst patterns (rapid succession followed by pause)
    const bursts = this.findBursts(intervals);
    if (bursts.length > 1) {
      const avgBurstSize = bursts.reduce((a, b) => a + b.size, 0) / bursts.length;
      patterns.push({
        id: randomUUID(),
        name: `Burst pattern (avg ${avgBurstSize.toFixed(1)} events)`,
        events: ['burst'],
        averageDuration: avgInterval * avgBurstSize,
        frequency: bursts.length,
        confidence: 0.8,
      });
    }

    return patterns;
  }

  /**
   * Find bursts of rapid events
   */
  private findBursts(intervals: number[]): Array<{ start: number; size: number }> {
    const bursts: Array<{ start: number; size: number }> = [];
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const threshold = avgInterval * 0.3; // Events within 30% of avg are "rapid"

    let burstStart = -1;
    let burstSize = 0;

    for (let i = 0; i < intervals.length; i++) {
      if (intervals[i] < threshold) {
        if (burstStart === -1) {
          burstStart = i;
          burstSize = 2; // First rapid interval connects 2 events
        } else {
          burstSize++;
        }
      } else {
        if (burstStart !== -1 && burstSize >= 3) {
          bursts.push({ start: burstStart, size: burstSize });
        }
        burstStart = -1;
        burstSize = 0;
      }
    }

    // Check for burst at end
    if (burstStart !== -1 && burstSize >= 3) {
      bursts.push({ start: burstStart, size: burstSize });
    }

    return bursts;
  }

  /**
   * Get total duration of an event sequence
   */
  private getSequenceDuration(events: ClockEvent[]): number {
    if (events.length < 2) return 0;
    const first = events[0].timestamp.getTime();
    const last = events[events.length - 1].timestamp.getTime();
    return last - first;
  }

  /**
   * Calculate variance of a number array
   */
  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Merge similar patterns and deduplicate
   */
  private mergePatterns(patterns: RhythmPattern[]): RhythmPattern[] {
    // Sort by confidence descending
    const sorted = [...patterns].sort((a, b) => b.confidence - a.confidence);

    // Keep only top patterns, avoiding duplicates
    const seen = new Set<string>();
    const result: RhythmPattern[] = [];

    for (const pattern of sorted) {
      const key = pattern.events.join('→');
      if (!seen.has(key)) {
        seen.add(key);
        result.push(pattern);
      }
      if (result.length >= 10) break; // Cap at 10 patterns
    }

    return result;
  }

  /**
   * Clear pattern cache
   */
  clearCache(): void {
    this.patternCache.clear();
  }
}
