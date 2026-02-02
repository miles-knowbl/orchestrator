/**
 * Speech Queue
 *
 * Priority-based queue for managing speech output.
 * Urgent items are inserted at the front of the queue.
 */

import type { SpeechQueueItem } from './types.js';

export class SpeechQueue {
  private queue: SpeechQueueItem[] = [];
  private idCounter = 0;
  private maxSize = 10;

  /**
   * Add an item to the queue
   */
  enqueue(text: string, priority: 'normal' | 'urgent' = 'normal', eventType?: string): string {
    const id = `speech-${++this.idCounter}`;
    const item: SpeechQueueItem = {
      id,
      text,
      priority,
      eventType,
      createdAt: new Date(),
    };

    if (priority === 'urgent') {
      // Insert at front
      this.queue.unshift(item);
    } else {
      // Append to end
      this.queue.push(item);
    }

    // Enforce max size by dropping oldest non-urgent items
    this.enforceMaxSize();

    return id;
  }

  /**
   * Get and remove the next item from the queue
   */
  dequeue(): SpeechQueueItem | null {
    return this.queue.shift() || null;
  }

  /**
   * Peek at the next item without removing it
   */
  peek(): SpeechQueueItem | null {
    return this.queue[0] || null;
  }

  /**
   * Clear all items from the queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Get the number of items in the queue
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if the queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Get all items in the queue (for status display)
   */
  getAll(): SpeechQueueItem[] {
    return [...this.queue];
  }

  /**
   * Set the maximum queue size
   */
  setMaxSize(size: number): void {
    this.maxSize = Math.max(1, size);
    this.enforceMaxSize();
  }

  /**
   * Enforce max size by dropping oldest non-urgent items
   */
  private enforceMaxSize(): void {
    while (this.queue.length > this.maxSize) {
      // Find the oldest non-urgent item
      const oldestNormalIndex = this.queue.findIndex(item => item.priority === 'normal');

      if (oldestNormalIndex >= 0) {
        this.queue.splice(oldestNormalIndex, 1);
      } else {
        // All items are urgent, drop the oldest
        this.queue.pop();
      }
    }
  }
}
