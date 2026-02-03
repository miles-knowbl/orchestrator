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
  GateAutoApprovedEvent,
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
      case 'gate_auto_approved':
        return this.formatGateAutoApproved(event, interactionId);
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
    const loopName = event.loopId.replace(/-loop$/, '');

    // Concise message
    const lines: string[] = [];
    lines.push(`*${loopName} loop* started → *${event.target}*`);
    if (event.branch) {
      lines.push(`Branch: \`${event.branch}\``);
    }

    return {
      text: lines.join('\n'),
      notificationText: `${loopName} loop started: ${event.target}`,
      metadata: {
        interactionId,
        eventType: 'loop_start',
        executionId: event.executionId,
      },
    };
  }

  private formatGateWaiting(event: GateWaitingEvent, interactionId: string): FormattedMessage {
    // Clean gate name: "spec-gate" → "Spec"
    const gateName = event.gateId.replace('-gate', '').replace(/^\w/, c => c.toUpperCase());

    // Concise message for Slack
    const lines: string[] = [];
    lines.push(`*${gateName} Gate* needs approval`);
    lines.push(`Phase: ${event.phase}`);

    if (event.deliverables.length > 0) {
      const delivs = event.deliverables.slice(0, 3).join(', ');
      const more = event.deliverables.length > 3 ? ` +${event.deliverables.length - 3} more` : '';
      lines.push(`Files: ${delivs}${more}`);
    }

    // Show guarantee status if available
    if (event.guarantees) {
      const { passed, failed, canApprove, blocking } = event.guarantees;
      if (!canApprove && blocking && blocking.length > 0) {
        lines.push('');
        lines.push(`*Blocked:* ${failed} guarantee${failed !== 1 ? 's' : ''} failed`);
        for (const g of blocking.slice(0, 3)) {
          const errorHint = g.errors?.[0] ? `: ${g.errors[0].slice(0, 50)}` : '';
          lines.push(`  • ${g.name}${errorHint}`);
        }
        if (blocking.length > 3) {
          lines.push(`  ...and ${blocking.length - 3} more`);
        }
      } else if (canApprove && passed > 0) {
        lines.push(`*Ready:* ${passed}/${passed + failed} guarantees passed`);
      }
    }

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

    // Adjust notification text based on guarantee status
    const canApprove = event.guarantees?.canApprove ?? true;
    const notificationText = canApprove
      ? `${gateName} gate ready for review`
      : `${gateName} gate BLOCKED - ${event.guarantees?.failed} guarantee${event.guarantees?.failed !== 1 ? 's' : ''} failed`;

    // Build actions list
    const actions: Array<{ id: string; label: string; style?: 'primary' | 'danger'; value: string }> = [];

    if (canApprove) {
      actions.push({
        id: `approve_${interactionId}`,
        label: 'Approve',
        style: 'primary',
        value: actionPayload,
      });
    } else {
      // When blocked, offer "Create Deliverables" to fix missing files
      const missingFiles = event.guarantees?.blocking
        ?.flatMap(g => {
          // Extract file names from error messages like "Expected at least 1 file(s) matching \"CODE-REVIEW.md\""
          const match = g.errors?.[0]?.match(/matching "([^"]+)"/);
          return match ? [match[1]] : [];
        })
        .filter(Boolean) || [];

      if (missingFiles.length > 0) {
        actions.push({
          id: `create_deliverables_${interactionId}`,
          label: 'Create Missing Files',
          style: 'primary',
          value: JSON.stringify({
            action: 'create_deliverables',
            interactionId,
            gateId: event.gateId,
            executionId: event.executionId,
            missingFiles,
          }),
        });
      }
    }

    actions.push({
      id: `reject_${interactionId}`,
      label: 'Reject',
      style: 'danger',
      value: rejectPayload,
    });

    return {
      text: lines.join('\n'),
      notificationText,
      actions,
      metadata: {
        interactionId,
        eventType: 'gate_waiting',
        executionId: event.executionId,
      },
    };
  }

  private formatGateAutoApproved(event: GateAutoApprovedEvent, interactionId: string): FormattedMessage {
    // Clean gate name: "spec-gate" → "Spec"
    const gateName = event.gateId.replace('-gate', '').replace(/^\w/, c => c.toUpperCase());

    // Brief notification - no buttons needed
    let suffix = '';
    if (event.reason === 'after_retry' && event.retryCount) {
      suffix = ` (after ${event.retryCount} ${event.retryCount === 1 ? 'retry' : 'retries'})`;
    } else if (event.reason === 'after_claude') {
      suffix = ' (after Claude fix)';
    }

    const text = `✓ *${gateName} gate* passed${suffix} → advancing`;

    return {
      text,
      notificationText: `${gateName} gate auto-approved`,
      metadata: {
        interactionId,
        eventType: 'gate_auto_approved',
        executionId: event.executionId,
      },
    };
  }

  private formatLoopComplete(event: LoopCompleteEvent, interactionId: string): FormattedMessage {
    const loopName = event.loopId.replace(/-loop$/, '');

    // Concise completion message
    const lines: string[] = [];
    lines.push(`*${loopName} loop complete* → ${event.module}`);
    if (event.summary) {
      lines.push(event.summary.slice(0, 200));
    }
    if (event.deliverables.length > 0) {
      const delivs = event.deliverables.slice(0, 3).join(', ');
      lines.push(`Deliverables: ${delivs}`);
    }

    return {
      text: lines.join('\n'),
      notificationText: `${loopName} loop complete: ${event.module}`,
      actions: [
        {
          id: `next_loop_${interactionId}`,
          label: 'Start Next',
          style: 'primary',
          value: JSON.stringify({
            action: 'start_next_loop',
            interactionId,
            executionId: event.executionId,
            completedLoopId: event.loopId,
            completedModule: event.module,
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

    const highCount = high.length;
    return {
      text: lines.join('\n'),
      notificationText: `📋 ${event.count} proposals ready${highCount > 0 ? ` (${highCount} high priority)` : ''} — Review or Approve All`,
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
      notificationText: `⛔ Blocked: ${event.reason.slice(0, 60)}${event.reason.length > 60 ? '...' : ''}`,
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

    const icon = event.severity === 'critical' ? '🚨' : event.severity === 'warning' ? '⚠️' : 'ℹ️';
    return {
      text: lines.join('\n'),
      notificationText: `${icon} ${event.severity.toUpperCase()}: ${event.message.slice(0, 60)}${event.message.length > 60 ? '...' : ''}`,
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
      notificationText: `🃏 ${event.deckType} deck ready: ${event.itemCount} items (~${event.estimatedMinutes} min)`,
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
    // Very compact - just skill name
    const text = `✓ ${event.skillId}`;

    return {
      text,
      notificationText: `${event.skillId} done`,
      metadata: {
        interactionId,
        eventType: 'skill_complete',
        executionId: event.executionId,
      },
    };
  }

  private formatPhaseComplete(event: PhaseCompleteEvent, interactionId: string): FormattedMessage {
    // Simple completion notification - gate will send its own message if needed
    const gateName = event.gateId?.replace('-gate', '') || '';
    const gateNote = event.hasGate ? ` → ${gateName} gate` : '';
    const text = `✓ *${event.phase}* complete${gateNote}`;

    return {
      text,
      notificationText: `${event.phase} phase done`,
      metadata: {
        interactionId,
        eventType: 'phase_complete',
        executionId: event.executionId,
      },
    };
  }

  private formatPhaseStart(event: PhaseStartEvent, interactionId: string): FormattedMessage {
    // Simple phase notification - no buttons needed
    const skillCount = event.skills.length;
    const text = `*${event.phase}* [${event.phaseNumber}/${event.totalPhases}] — ${skillCount} skill${skillCount !== 1 ? 's' : ''}`;

    return {
      text,
      notificationText: `${event.phase} phase starting`,
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
      notificationText: `${event.title}: ${event.message.slice(0, 50)}${event.message.length > 50 ? '...' : ''}`,
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

      lines.push(this.padLine('Tip: Run /orchestrator-start-loop to update.'));

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

      lines.push(this.padLine('Tip: Run /orchestrator-start-loop to update.'));

      lines.push(this.emptyLine());
      lines.push(this.border());
      lines.push('```');
    }

    const statusText = event.hasDreamState && event.dreamStateProgress
      ? `${event.dreamStateProgress.modulesComplete}/${event.dreamStateProgress.modulesTotal} modules`
      : 'No Dream State';
    return {
      text: lines.join('\n'),
      notificationText: `Orchestrator v${event.version} ready — ${statusText}`,
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

      lines.push(this.padLine('Run /orchestrator-start-loop to update.'));
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

    const progressText = event.dreamStateProgress
      ? ` — ${event.dreamStateProgress.modulesComplete}/${event.dreamStateProgress.modulesTotal} modules`
      : '';
    return {
      text: lines.join('\n'),
      notificationText: `${event.greeting}${progressText}`,
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
