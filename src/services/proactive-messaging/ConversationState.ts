/**
 * Conversation State
 *
 * Tracks pending interactions across channels, allowing responses
 * to be correlated with the original events.
 */

import type { ProactiveEvent, PendingInteraction, InboundCommand } from './types.js';

export class ConversationState {
  private interactions: Map<string, PendingInteraction> = new Map();
  private latestByType: Map<string, string> = new Map(); // eventType -> interactionId

  /**
   * Record a new interaction (message sent)
   */
  recordInteraction(
    interactionId: string,
    event: ProactiveEvent,
    channels: string[],
    expiresInMs?: number
  ): PendingInteraction {
    const interaction: PendingInteraction = {
      id: interactionId,
      event,
      sentAt: new Date().toISOString(),
      channels,
      status: 'pending',
      expiresAt: expiresInMs
        ? new Date(Date.now() + expiresInMs).toISOString()
        : undefined,
    };

    this.interactions.set(interactionId, interaction);
    this.latestByType.set(event.type, interactionId);

    return interaction;
  }

  /**
   * Get a pending interaction by ID
   */
  getInteraction(interactionId: string): PendingInteraction | undefined {
    return this.interactions.get(interactionId);
  }

  /**
   * Get the latest interaction of a specific type
   */
  getLatestByType(eventType: string): PendingInteraction | undefined {
    const id = this.latestByType.get(eventType);
    return id ? this.interactions.get(id) : undefined;
  }

  /**
   * Get all pending interactions
   */
  getPending(): PendingInteraction[] {
    return Array.from(this.interactions.values())
      .filter(i => i.status === 'pending')
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  /**
   * Get all interactions (for history)
   */
  getAll(limit?: number): PendingInteraction[] {
    const all = Array.from(this.interactions.values())
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    return limit ? all.slice(0, limit) : all;
  }

  /**
   * Record a response to an interaction
   */
  recordResponse(
    interactionId: string,
    command: InboundCommand,
    channel: string
  ): PendingInteraction | undefined {
    const interaction = this.interactions.get(interactionId);
    if (!interaction) return undefined;

    interaction.status = 'responded';
    interaction.response = {
      command,
      respondedAt: new Date().toISOString(),
      channel,
    };

    return interaction;
  }

  /**
   * Resolve "latest" interactionId to actual ID
   */
  resolveInteractionId(interactionId: string, eventType?: string): string | undefined {
    if (interactionId === 'latest') {
      // Find most recent pending interaction
      const pending = this.getPending();
      if (eventType) {
        const match = pending.find(p => p.event.type === eventType);
        return match?.id;
      }
      return pending[0]?.id;
    }
    return interactionId;
  }

  /**
   * Expire old interactions
   */
  expireOld(): number {
    const now = Date.now();
    let expired = 0;

    for (const [id, interaction] of this.interactions) {
      if (
        interaction.status === 'pending' &&
        interaction.expiresAt &&
        new Date(interaction.expiresAt).getTime() < now
      ) {
        interaction.status = 'expired';
        expired++;
      }
    }

    return expired;
  }

  /**
   * Clean up old responded/expired interactions
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - maxAge;
    let removed = 0;

    for (const [id, interaction] of this.interactions) {
      if (
        interaction.status !== 'pending' &&
        new Date(interaction.sentAt).getTime() < cutoff
      ) {
        this.interactions.delete(id);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    pending: number;
    responded: number;
    expired: number;
  } {
    let pending = 0;
    let responded = 0;
    let expired = 0;

    for (const interaction of this.interactions.values()) {
      switch (interaction.status) {
        case 'pending':
          pending++;
          break;
        case 'responded':
          responded++;
          break;
        case 'expired':
          expired++;
          break;
      }
    }

    return {
      total: this.interactions.size,
      pending,
      responded,
      expired,
    };
  }
}
