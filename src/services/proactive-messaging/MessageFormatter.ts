/**
 * Message Formatter
 *
 * Converts ProactiveEvents into FormattedMessages with consistent
 * terminal-style formatting that works across all channels.
 *
 * Matches the exact engineering-loop terminal format:
 * - Top/bottom borders: ═══ (no corners)
 * - Side borders: ║
 * - Type tag: [HUMAN], [AUTO], [CONDITIONAL]
 * - Sections: Deliverables, Summary, Commands
 * - No emojis
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  ProactiveEvent,
  FormattedMessage,
  GateWaitingEvent,
  LoopCompleteEvent,
  DreamProposalsReadyEvent,
  ExecutorBlockedEvent,
  ErrorEvent,
  DeckReadyEvent,
  CustomNotificationEvent,
} from './types.js';

export class MessageFormatter {
  private readonly width = 63;

  format(event: ProactiveEvent): FormattedMessage {
    const interactionId = uuidv4();

    switch (event.type) {
      case 'gate_waiting':
        return this.formatGateWaiting(event, interactionId);
      case 'loop_complete':
        return this.formatLoopComplete(event, interactionId);
      case 'dream_proposals_ready':
        return this.formatDreamProposals(event, interactionId);
      case 'executor_blocked':
        return this.formatExecutorBlocked(event, interactionId);
      case 'error':
        return this.formatError(event, interactionId);
      case 'deck_ready':
        return this.formatDeckReady(event, interactionId);
      case 'custom':
        return this.formatCustom(event, interactionId);
      default:
        return this.formatUnknown(event as ProactiveEvent, interactionId);
    }
  }

  private formatGateWaiting(event: GateWaitingEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];
    const typeTag = `[${event.approvalType.toUpperCase()}]`;
    const title = this.formatTitle(event.gateId.toUpperCase().replace('-', ' '), typeTag);

    lines.push('```');
    lines.push(this.border());
    lines.push(title);
    lines.push(this.emptyLine());

    // Deliverables section
    if (event.deliverables.length > 0) {
      lines.push(this.padLine('Deliverables:'));
      for (const d of event.deliverables) {
        lines.push(this.padLine(`  - ${d}`));
      }
      lines.push(this.emptyLine());
    }

    // Summary section
    lines.push(this.padLine('Summary:'));
    lines.push(this.padLine(`  Loop: ${event.loopId}`));
    lines.push(this.padLine(`  Phase: ${event.phase}`));
    lines.push(this.padLine(`  Execution: ${event.executionId.slice(0, 12)}...`));
    lines.push(this.emptyLine());

    // Commands section
    lines.push(this.padLine('Commands:'));
    lines.push(this.padLine('  approved      - Pass gate, continue'));
    lines.push(this.padLine('  changes: ...  - Request modifications'));
    lines.push(this.border());
    lines.push('```');

    const actionPayload = JSON.stringify({
      action: 'approve',
      interactionId,
      gateId: event.gateId,
      executionId: event.executionId,
    });

    const rejectPayload = JSON.stringify({
      action: 'reject',
      interactionId,
      gateId: event.gateId,
      executionId: event.executionId,
    });

    return {
      text: lines.join('\n'),
      actions: [
        {
          id: `approve_${interactionId}`,
          label: 'Approve',
          style: 'primary',
          value: actionPayload,
        },
        {
          id: `reject_${interactionId}`,
          label: 'Reject',
          style: 'danger',
          value: rejectPayload,
        },
      ],
      metadata: {
        interactionId,
        eventType: 'gate_waiting',
      },
    };
  }

  private formatLoopComplete(event: LoopCompleteEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];

    lines.push('```');
    lines.push(this.border());
    lines.push(this.formatTitle('LOOP COMPLETE'));
    lines.push(this.emptyLine());

    lines.push(this.padLine(`/${event.loopId} -> ${event.module}`));
    lines.push(this.emptyLine());

    // Summary
    const summaryLines = this.wrapText(event.summary, this.width - 6);
    for (const line of summaryLines) {
      lines.push(this.padLine(line));
    }
    lines.push(this.emptyLine());

    // Deliverables
    if (event.deliverables.length > 0) {
      lines.push(this.padLine('Deliverables:'));
      for (const d of event.deliverables) {
        lines.push(this.padLine(`  - ${d}`));
      }
      lines.push(this.emptyLine());
    }

    lines.push(this.border());
    lines.push('```');

    const continuePayload = JSON.stringify({
      action: 'continue',
      interactionId,
      executionId: event.executionId,
    });

    return {
      text: lines.join('\n'),
      actions: [
        {
          id: `continue_${interactionId}`,
          label: 'View Details',
          value: continuePayload,
        },
      ],
      metadata: {
        interactionId,
        eventType: 'loop_complete',
      },
    };
  }

  private formatDreamProposals(event: DreamProposalsReadyEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];

    lines.push('```');
    lines.push(this.border());
    lines.push(this.formatTitle('PROPOSALS READY'));
    lines.push(this.emptyLine());

    lines.push(this.padLine(`${event.count} proposals generated`));
    lines.push(this.emptyLine());

    const high = event.proposals.filter(p => p.priority === 'high');
    const medium = event.proposals.filter(p => p.priority === 'medium');
    const low = event.proposals.filter(p => p.priority === 'low');

    if (high.length > 0) {
      lines.push(this.padLine('High Priority:'));
      for (const p of high.slice(0, 3)) {
        lines.push(this.padLine(`  [${p.type}] ${p.title}`.slice(0, this.width - 4)));
      }
    }

    if (medium.length > 0) {
      lines.push(this.padLine('Medium Priority:'));
      for (const p of medium.slice(0, 3)) {
        lines.push(this.padLine(`  [${p.type}] ${p.title}`.slice(0, this.width - 4)));
      }
    }

    if (low.length > 0 && high.length + medium.length < 5) {
      lines.push(this.padLine('Low Priority:'));
      for (const p of low.slice(0, 2)) {
        lines.push(this.padLine(`  [${p.type}] ${p.title}`.slice(0, this.width - 4)));
      }
    }

    lines.push(this.emptyLine());
    lines.push(this.border());
    lines.push('```');

    return {
      text: lines.join('\n'),
      actions: [
        {
          id: `review_${interactionId}`,
          label: 'Review Proposals',
          style: 'primary',
          value: JSON.stringify({ action: 'review_proposals', interactionId }),
        },
      ],
      metadata: {
        interactionId,
        eventType: 'dream_proposals_ready',
      },
    };
  }

  private formatExecutorBlocked(event: ExecutorBlockedEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];

    lines.push('```');
    lines.push(this.border());
    lines.push(this.formatTitle('EXECUTOR BLOCKED', '[BLOCKED]'));
    lines.push(this.emptyLine());

    lines.push(this.padLine(`Execution: ${event.executionId}`));
    if (event.phase) lines.push(this.padLine(`Phase: ${event.phase}`));
    if (event.gateId) lines.push(this.padLine(`Gate: ${event.gateId}`));
    lines.push(this.emptyLine());

    lines.push(this.padLine('Reason:'));
    const reasonLines = this.wrapText(event.reason, this.width - 6);
    for (const line of reasonLines) {
      lines.push(this.padLine(`  ${line}`));
    }

    lines.push(this.emptyLine());
    lines.push(this.border());
    lines.push('```');

    return {
      text: lines.join('\n'),
      actions: [
        {
          id: `investigate_${interactionId}`,
          label: 'Investigate',
          value: JSON.stringify({ action: 'investigate', interactionId, executionId: event.executionId }),
        },
      ],
      metadata: {
        interactionId,
        eventType: 'executor_blocked',
      },
    };
  }

  private formatError(event: ErrorEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];
    const severityTag = `[${event.severity.toUpperCase()}]`;

    lines.push('```');
    lines.push(this.border());
    lines.push(this.formatTitle('ERROR', severityTag));
    lines.push(this.emptyLine());

    const msgLines = this.wrapText(event.message, this.width - 6);
    for (const line of msgLines) {
      lines.push(this.padLine(line));
    }

    if (event.context) {
      lines.push(this.emptyLine());
      lines.push(this.padLine('Context:'));
      const contextStr = JSON.stringify(event.context, null, 2);
      for (const line of contextStr.split('\n').slice(0, 5)) {
        lines.push(this.padLine(`  ${line}`.slice(0, this.width - 4)));
      }
    }

    lines.push(this.emptyLine());
    lines.push(this.border());
    lines.push('```');

    return {
      text: lines.join('\n'),
      metadata: {
        interactionId,
        eventType: 'error',
      },
    };
  }

  private formatDeckReady(event: DeckReadyEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];
    const title = `${event.deckType.toUpperCase()} DECK READY`;

    lines.push('```');
    lines.push(this.border());
    lines.push(this.formatTitle(title));
    lines.push(this.emptyLine());

    lines.push(this.padLine(`Items: ${event.itemCount}`));
    lines.push(this.padLine(`Estimated: ${event.estimatedMinutes} minutes`));
    lines.push(this.emptyLine());

    lines.push(this.padLine('Commands:'));
    lines.push(this.padLine('  start   - Begin review'));
    lines.push(this.padLine('  skip    - Skip this deck'));

    lines.push(this.emptyLine());
    lines.push(this.border());
    lines.push('```');

    return {
      text: lines.join('\n'),
      actions: [
        {
          id: `start_review_${interactionId}`,
          label: 'Start Review',
          style: 'primary',
          value: JSON.stringify({ action: 'start_review', interactionId, deckId: event.deckId }),
        },
        {
          id: `skip_${interactionId}`,
          label: 'Skip',
          value: JSON.stringify({ action: 'skip', interactionId, deckId: event.deckId }),
        },
      ],
      metadata: {
        interactionId,
        eventType: 'deck_ready',
      },
    };
  }

  private formatCustom(event: CustomNotificationEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];

    lines.push('```');
    lines.push(this.border());
    lines.push(this.formatTitle(event.title.toUpperCase()));
    lines.push(this.emptyLine());

    const msgLines = this.wrapText(event.message, this.width - 6);
    for (const line of msgLines) {
      lines.push(this.padLine(line));
    }

    lines.push(this.emptyLine());
    lines.push(this.border());
    lines.push('```');

    const actions = event.actions?.map((a, i) => ({
      id: `custom_${interactionId}_${i}`,
      label: a.label,
      value: JSON.stringify({ action: 'custom', interactionId, value: a.value }),
    }));

    return {
      text: lines.join('\n'),
      actions,
      metadata: {
        interactionId,
        eventType: 'custom',
      },
    };
  }

  private formatUnknown(event: ProactiveEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];

    lines.push('```');
    lines.push(this.border());
    lines.push(this.formatTitle('NOTIFICATION'));
    lines.push(this.emptyLine());

    lines.push(this.padLine(JSON.stringify(event).slice(0, this.width - 4)));

    lines.push(this.emptyLine());
    lines.push(this.border());
    lines.push('```');

    return {
      text: lines.join('\n'),
      metadata: {
        interactionId,
        eventType: (event as { type: string }).type || 'unknown',
      },
    };
  }

  // Helper: top/bottom border (no corners, just ═══)
  private border(): string {
    return '═'.repeat(this.width);
  }

  // Helper: empty line with side borders
  private emptyLine(): string {
    return '║' + ' '.repeat(this.width - 2) + '║';
  }

  // Helper: format title line with optional type tag
  private formatTitle(title: string, tag?: string): string {
    if (tag) {
      const spacing = this.width - 4 - title.length - tag.length;
      return '║  ' + title + ' '.repeat(Math.max(1, spacing)) + tag + ' ║';
    }
    const padding = this.width - 4 - title.length;
    return '║  ' + title + ' '.repeat(Math.max(0, padding)) + ' ║';
  }

  // Helper: pad content line with side borders
  private padLine(content: string): string {
    const truncated = content.slice(0, this.width - 4);
    const padding = this.width - 4 - truncated.length;
    return '║  ' + truncated + ' '.repeat(Math.max(0, padding)) + ' ║';
  }

  // Helper: wrap text to fit within width
  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word.slice(0, maxWidth);
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines;
  }
}
