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
  LoopStartEvent,
  GateWaitingEvent,
  LoopCompleteEvent,
  DreamProposalsReadyEvent,
  ExecutorBlockedEvent,
  ErrorEvent,
  DeckReadyEvent,
  SkillCompleteEvent,
  PhaseCompleteEvent,
  PhaseStartEvent,
  CustomNotificationEvent,
  StartupWelcomeEvent,
  DailyWelcomeEvent,
} from './types.js';

export class MessageFormatter {
  private readonly width = 63;

  format(event: ProactiveEvent): FormattedMessage {
    const interactionId = uuidv4();

    switch (event.type) {
      case 'loop_start':
        return this.formatLoopStart(event, interactionId);
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
      case 'skill_complete':
        return this.formatSkillComplete(event, interactionId);
      case 'phase_complete':
        return this.formatPhaseComplete(event, interactionId);
      case 'phase_start':
        return this.formatPhaseStart(event, interactionId);
      case 'custom':
        return this.formatCustom(event, interactionId);
      case 'startup_welcome':
        return this.formatStartupWelcome(event, interactionId);
      case 'daily_welcome':
        return this.formatDailyWelcome(event, interactionId);
      default:
        return this.formatUnknown(event as ProactiveEvent, interactionId);
    }
  }

  private formatLoopStart(event: LoopStartEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];
    const loopName = event.loopId.replace(/-loop$/, '');

    lines.push('```');
    lines.push(this.border());
    lines.push(this.formatTitle('LOOP STARTED', '[ACTIVE]'));
    lines.push(this.emptyLine());

    lines.push(this.padLine(`/${event.loopId} -> ${event.target}`));
    if (event.branch) {
      lines.push(this.padLine(`Branch: ${event.branch}`));
    }
    if (event.engineer) {
      lines.push(this.padLine(`Engineer: ${event.engineer}`));
    }
    lines.push(this.padLine(`Execution: ${event.executionId.slice(0, 12)}...`));
    lines.push(this.emptyLine());

    lines.push(this.padLine('This thread will receive all updates for this execution.'));
    lines.push(this.emptyLine());
    lines.push(this.border());
    lines.push('```');

    return {
      text: lines.join('\n'),
      actions: [
        {
          id: `view_${interactionId}`,
          label: 'View in Dashboard',
          value: JSON.stringify({ action: 'view_execution', interactionId, executionId: event.executionId }),
        },
      ],
      metadata: {
        interactionId,
        eventType: 'loop_start',
        executionId: event.executionId,
      },
    };
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
        executionId: event.executionId,
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

    return {
      text: lines.join('\n'),
      actions: [
        {
          id: `next_loop_${interactionId}`,
          label: 'Start Next Loop',
          style: 'primary',
          value: JSON.stringify({
            action: 'start_next_loop',
            interactionId,
            executionId: event.executionId,
            completedLoopId: event.loopId,
            completedModule: event.module,
          }),
        },
        {
          id: `view_${interactionId}`,
          label: 'View Details',
          value: JSON.stringify({
            action: 'view_execution',
            interactionId,
            executionId: event.executionId,
          }),
        },
      ],
      metadata: {
        interactionId,
        eventType: 'loop_complete',
        executionId: event.executionId,
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

    // Build actions: Approve All for quick mobile approval, plus individual high-priority approvals
    const actions: Array<{ id: string; label: string; style?: 'primary' | 'danger'; value: string }> = [
      {
        id: `approve_all_${interactionId}`,
        label: 'Approve All',
        style: 'primary',
        value: JSON.stringify({
          action: 'approve_all_proposals',
          interactionId,
          proposalIds: event.proposals.map(p => p.id),
        }),
      },
    ];

    // Add individual approve buttons for high priority proposals (max 2 for mobile usability)
    for (const proposal of high.slice(0, 2)) {
      actions.push({
        id: `approve_${proposal.id}_${interactionId}`,
        label: `✓ ${proposal.title.slice(0, 20)}`,
        value: JSON.stringify({
          action: 'approve',
          interactionId,
          proposalId: proposal.id,
        }),
      });
    }

    actions.push({
      id: `review_${interactionId}`,
      label: 'Review',
      value: JSON.stringify({ action: 'review_proposals', interactionId }),
    });

    return {
      text: lines.join('\n'),
      actions,
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
        executionId: event.executionId,
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

  private formatSkillComplete(event: SkillCompleteEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];

    // Compact format for thread updates
    lines.push(`\`[${event.phase}]\` Skill complete: **${event.skillId}**`);

    if (event.deliverables && event.deliverables.length > 0) {
      const delivs = event.deliverables.slice(0, 3).join(', ');
      lines.push(`  → ${delivs}`);
    }

    return {
      text: lines.join('\n'),
      metadata: {
        interactionId,
        eventType: 'skill_complete',
        executionId: event.executionId,
      },
    };
  }

  private formatPhaseComplete(event: PhaseCompleteEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];

    if (event.hasGate) {
      // Gate waiting will send its own notification
      lines.push(`\`[${event.phase}]\` Phase complete (${event.skillsCompleted} skills) → Gate: ${event.gateId}`);
    } else {
      lines.push(`\`[${event.phase}]\` Phase complete (${event.skillsCompleted} skills)`);
    }

    // Add Continue button when there's no gate blocking
    const actions = event.hasGate ? undefined : [
      {
        id: `continue_${interactionId}`,
        label: 'Continue',
        style: 'primary' as const,
        value: JSON.stringify({
          action: 'continue',
          interactionId,
          executionId: event.executionId,
        }),
      },
    ];

    return {
      text: lines.join('\n'),
      actions,
      metadata: {
        interactionId,
        eventType: 'phase_complete',
        executionId: event.executionId,
      },
    };
  }

  private formatPhaseStart(event: PhaseStartEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];

    lines.push(`\`[${event.phaseNumber}/${event.totalPhases}]\` Entering phase: **${event.phase}**`);

    if (event.skills.length > 0) {
      const skillList = event.skills.slice(0, 5).join(', ');
      const suffix = event.skills.length > 5 ? `, +${event.skills.length - 5} more` : '';
      lines.push(`  Skills: ${skillList}${suffix}`);
    }

    return {
      text: lines.join('\n'),
      metadata: {
        interactionId,
        eventType: 'phase_start',
        executionId: event.executionId,
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

  private formatStartupWelcome(event: StartupWelcomeEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];

    if (event.hasDreamState && event.dreamStateProgress) {
      // Returning user with Dream State
      const progress = event.dreamStateProgress;
      const pct = Math.round((progress.modulesComplete / progress.modulesTotal) * 100);

      lines.push('```');
      lines.push(this.border());
      lines.push(this.formatTitle('ORCHESTRATOR READY'));
      lines.push(this.emptyLine());

      lines.push(this.padLine(`Version: ${event.version}`));
      lines.push(this.padLine(`Skills: ${event.skillCount} | Loops: ${event.loopCount}`));
      lines.push(this.emptyLine());

      lines.push(this.padLine(`Dream State: ${progress.name}`));
      lines.push(this.padLine(`Progress: ${progress.modulesComplete}/${progress.modulesTotal} modules (${pct}%)`));
      lines.push(this.emptyLine());

      lines.push(this.padLine('Next highest leverage move:'));
      if (event.recommendedTarget) {
        lines.push(this.padLine(`  /${event.recommendedLoop} -> ${event.recommendedTarget}`));
      } else {
        lines.push(this.padLine(`  /${event.recommendedLoop}`));
      }
      lines.push(this.emptyLine());

      lines.push(this.padLine('Available loops:'));
      const loopList = event.availableLoops.map(l => `/${l}`).join(', ');
      const wrappedLoops = this.wrapText(loopList, this.width - 6);
      for (const line of wrappedLoops) {
        lines.push(this.padLine(`  ${line}`));
      }

      lines.push(this.emptyLine());
      lines.push(this.border());
      lines.push('```');
    } else {
      // Fresh install - no Dream State
      lines.push('```');
      lines.push(this.border());
      lines.push(this.formatTitle('WELCOME TO ORCHESTRATOR'));
      lines.push(this.emptyLine());

      lines.push(this.padLine(`Version: ${event.version}`));
      lines.push(this.padLine(`Skills: ${event.skillCount} | Loops: ${event.loopCount}`));
      lines.push(this.emptyLine());

      lines.push(this.padLine('No Dream State found.'));
      lines.push(this.padLine('Start by defining your vision:'));
      lines.push(this.emptyLine());

      lines.push(this.padLine('Recommended: /dream-loop'));
      lines.push(this.emptyLine());

      lines.push(this.padLine('This will capture your end goal and decompose'));
      lines.push(this.padLine('it into actionable systems and modules.'));
      lines.push(this.emptyLine());

      lines.push(this.padLine("Say 'go' in Claude Code to begin."));

      lines.push(this.emptyLine());
      lines.push(this.border());
      lines.push('```');
    }

    return {
      text: lines.join('\n'),
      metadata: {
        interactionId,
        eventType: 'startup_welcome',
      },
    };
  }

  private formatDailyWelcome(event: DailyWelcomeEvent, interactionId: string): FormattedMessage {
    const lines: string[] = [];

    lines.push('```');
    lines.push(this.border());

    if (!event.hasDreamState) {
      // Fresh install - no Dream State
      lines.push(this.formatTitle('WELCOME TO ORCHESTRATOR'));
      lines.push(this.emptyLine());

      lines.push(this.padLine(`Version: ${event.version}`));
      lines.push(this.emptyLine());

      lines.push(this.padLine('No Dream State found.'));
      lines.push(this.emptyLine());

      lines.push(this.padLine('Run /dream-loop to establish your vision and roadmap.'));
    } else if (event.versionStatus === 'update_available') {
      // Update available
      lines.push(this.formatTitle('UPDATE AVAILABLE'));
      lines.push(this.emptyLine());

      lines.push(this.padLine(`Current: ${event.version} -> Latest: ${event.latestVersion}`));
      lines.push(this.emptyLine());

      lines.push(this.padLine('Run /install-loop to update.'));
      lines.push(this.emptyLine());

      if (event.updateNotes && event.updateNotes.length > 0) {
        lines.push(this.padLine(`What's new in ${event.latestVersion}:`));
        for (const note of event.updateNotes.slice(0, 3)) {
          lines.push(this.padLine(`  - ${note}`));
        }
      }
    } else {
      // Normal daily welcome
      lines.push(this.formatTitle(event.greeting));
      lines.push(this.emptyLine());

      // Dream State progress
      if (event.dreamStateProgress) {
        const progress = event.dreamStateProgress;
        const pct = Math.round((progress.modulesComplete / progress.modulesTotal) * 100);
        lines.push(this.padLine(`Dream State: ${progress.name}`));
        lines.push(this.padLine(`  ${progress.modulesComplete}/${progress.modulesTotal} modules (${pct}%)`));

        // Progress bar
        const barWidth = 30;
        const filled = Math.round((pct / 100) * barWidth);
        const bar = '[' + '='.repeat(filled) + ' '.repeat(barWidth - filled) + ']';
        lines.push(this.padLine(`  ${bar}`));
      }

      // Roadmap drift warning
      if (event.hasRoadmap && event.roadmapDrift?.hasDrift) {
        lines.push(this.emptyLine());
        lines.push(this.padLine('ROADMAP DRIFT DETECTED'));
        lines.push(this.padLine(`  Roadmap: ${event.roadmapDrift.roadmapComplete}/${event.roadmapDrift.roadmapTotal} (${event.roadmapDrift.roadmapPercentage}%)`));
        lines.push(this.padLine(`  Dream State: ${event.roadmapDrift.dreamStateComplete}/${event.roadmapDrift.dreamStateTotal} (${event.roadmapDrift.dreamStatePercentage}%)`));
        lines.push(this.padLine(`  Drift: ${event.roadmapDrift.driftAmount} modules out of sync`));
        lines.push(this.emptyLine());
        lines.push(this.padLine('Run update_roadmap_status to sync.'));
      }

      // Available moves
      if (event.availableMoves && event.availableMoves.length > 0) {
        lines.push(this.emptyLine());
        lines.push(this.padLine('AVAILABLE MOVES'));
        for (const move of event.availableMoves.slice(0, 3)) {
          const scoreStr = move.score.toFixed(1);
          lines.push(this.padLine(`  ${move.moduleName} (L${move.layer}) - ${scoreStr}`));
        }
      }

      lines.push(this.emptyLine());

      if (event.pendingProposals > 0) {
        lines.push(this.padLine(`Proposals: ${event.pendingProposals} pending review`));
      }

      lines.push(this.padLine(`Version: ${event.version} (up to date)`));
      lines.push(this.emptyLine());

      lines.push(this.padLine('Recommended:'));
      if (event.recommendedTarget) {
        lines.push(this.padLine(`  /${event.recommendedLoop} -> ${event.recommendedTarget}`));
      } else {
        lines.push(this.padLine(`  /${event.recommendedLoop}`));
      }
    }

    lines.push(this.emptyLine());
    lines.push(this.border());
    lines.push('```');

    return {
      text: lines.join('\n'),
      metadata: {
        interactionId,
        eventType: 'daily_welcome',
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
