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
  CoherenceCheckEvent,
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
      case 'coherence_check':
        return this.formatCoherenceCheck(event, interactionId);
      default:
        return this.formatUnknown(event as ProactiveEvent, interactionId);
    }
  }

  private formatLoopStart(event: LoopStartEvent, interactionId: string): FormattedMessage {
    const loopName = event.loopId.replace(/-loop$/, '');

    // Concise message
    let text = `*${loopName} loop* started — *${event.target}*`;
    if (event.branch) {
      text += `\nBranch: \`${event.branch}\``;
    }

    const slackBlocks = [
      { type: 'section', text: { type: 'mrkdwn', text } },
    ];

    return {
      text,
      notificationText: `${loopName} loop started: ${event.target}`,
      blocks: slackBlocks,
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

    const text = lines.join('\n');
    const slackBlocks = [
      { type: 'section', text: { type: 'mrkdwn', text } },
    ];

    return {
      text,
      notificationText,
      blocks: slackBlocks,
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

    const text = `*${gateName} gate* passed${suffix} — advancing`;

    return {
      text,
      notificationText: `${gateName} gate auto-approved`,
      blocks: [
        { type: 'section', text: { type: 'mrkdwn', text } },
      ],
      metadata: {
        interactionId,
        eventType: 'gate_auto_approved',
        executionId: event.executionId,
      },
    };
  }

  private formatLoopComplete(event: LoopCompleteEvent, interactionId: string): FormattedMessage {
    const loopName = event.loopId.replace(/-loop$/, '');

    // Build message text
    let text = `*${loopName} loop* complete — ${event.module}`;
    if (event.summary) {
      text += `\n${event.summary.slice(0, 200)}`;
    }
    if (event.deliverables.length > 0) {
      const delivs = event.deliverables.slice(0, 3).join(', ');
      text += `\nDeliverables: ${delivs}`;
    }

    const slackBlocks = [
      { type: 'section', text: { type: 'mrkdwn', text } },
    ];

    return {
      text,
      notificationText: `${loopName} loop complete: ${event.module}`,
      blocks: slackBlocks,
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
    const high = event.proposals.filter(p => p.priority === 'high');
    const medium = event.proposals.filter(p => p.priority === 'medium');
    const low = event.proposals.filter(p => p.priority === 'low');

    // Terminal display with ASCII
    const lines: string[] = [];
    lines.push('```');
    lines.push(this.border());
    lines.push(this.formatTitle('PROPOSALS READY'));
    lines.push(this.emptyLine());
    lines.push(this.padLine(`${event.count} proposals generated`));
    lines.push(this.emptyLine());

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

    // Slack blocks (clean, no ASCII)
    const slackBlocks: Array<{ type: string; text?: { type: string; text: string }; elements?: Array<{ type: string; text: string }> }> = [];

    let headerText = `*${event.count} Proposals Ready*\n`;
    if (high.length > 0) {
      headerText += `\n*High Priority:*\n`;
      for (const p of high.slice(0, 3)) {
        headerText += `• [${p.type}] ${p.title}\n`;
      }
    }
    if (medium.length > 0) {
      headerText += `\n*Medium Priority:*\n`;
      for (const p of medium.slice(0, 3)) {
        headerText += `• [${p.type}] ${p.title}\n`;
      }
    }

    slackBlocks.push({ type: 'section', text: { type: 'mrkdwn', text: headerText.trim() } });

    // Build actions
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

    for (const proposal of high.slice(0, 2)) {
      actions.push({
        id: `approve_${proposal.id}_${interactionId}`,
        label: proposal.title.slice(0, 20),
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
      notificationText: `${event.count} proposals ready${highCount > 0 ? ` (${highCount} high priority)` : ''}`,
      blocks: slackBlocks,
      actions,
      metadata: {
        interactionId,
        eventType: 'dream_proposals_ready',
      },
    };
  }

  private formatExecutorBlocked(event: ExecutorBlockedEvent, interactionId: string): FormattedMessage {
    // Terminal display with ASCII
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

    // Slack blocks (clean, no ASCII)
    let slackText = `*Blocked*`;
    if (event.phase) slackText += ` at ${event.phase}`;
    if (event.gateId) slackText += ` (${event.gateId.replace('-gate', '')} gate)`;
    slackText += `\n\n${event.reason}`;

    const slackBlocks = [
      { type: 'section', text: { type: 'mrkdwn', text: slackText } },
    ];

    return {
      text: lines.join('\n'),
      notificationText: `Blocked: ${event.reason.slice(0, 60)}${event.reason.length > 60 ? '...' : ''}`,
      blocks: slackBlocks,
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
    const severityTag = `[${event.severity.toUpperCase()}]`;

    // Terminal display with ASCII
    const lines: string[] = [];
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

    // Slack blocks (clean, no ASCII)
    let slackText = `*${event.severity.toUpperCase()}:* ${event.message}`;
    if (event.context) {
      const contextStr = JSON.stringify(event.context, null, 2);
      slackText += `\n\`\`\`${contextStr.slice(0, 200)}\`\`\``;
    }

    const slackBlocks = [
      { type: 'section', text: { type: 'mrkdwn', text: slackText } },
    ];

    return {
      text: lines.join('\n'),
      notificationText: `${event.severity.toUpperCase()}: ${event.message.slice(0, 60)}${event.message.length > 60 ? '...' : ''}`,
      blocks: slackBlocks,
      metadata: {
        interactionId,
        eventType: 'error',
      },
    };
  }

  private formatDeckReady(event: DeckReadyEvent, interactionId: string): FormattedMessage {
    const title = `${event.deckType.toUpperCase()} DECK READY`;

    // Terminal display with ASCII
    const lines: string[] = [];
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

    // Slack blocks (clean, no ASCII)
    const slackText = `*${event.deckType} Deck Ready*\nItems: ${event.itemCount}\nEstimated: ~${event.estimatedMinutes} min`;
    const slackBlocks = [
      { type: 'section', text: { type: 'mrkdwn', text: slackText } },
    ];

    return {
      text: lines.join('\n'),
      notificationText: `${event.deckType} deck ready: ${event.itemCount} items (~${event.estimatedMinutes} min)`,
      blocks: slackBlocks,
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
    const text = `Done: ${event.skillId}`;

    return {
      text,
      notificationText: `${event.skillId} done`,
      blocks: [
        { type: 'section', text: { type: 'mrkdwn', text } },
      ],
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
    const gateNote = event.hasGate ? ` — ${gateName} gate next` : '';
    const text = `*${event.phase}* complete${gateNote}`;

    return {
      text,
      notificationText: `${event.phase} phase done`,
      blocks: [
        { type: 'section', text: { type: 'mrkdwn', text } },
      ],
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

    const slackBlocks = [
      { type: 'section', text: { type: 'mrkdwn', text } },
    ];

    return {
      text,
      notificationText: `${event.phase} phase starting`,
      blocks: slackBlocks,
      metadata: {
        interactionId,
        eventType: 'phase_start',
        executionId: event.executionId,
      },
    };
  }

  private formatCustom(event: CustomNotificationEvent, interactionId: string): FormattedMessage {
    // Terminal display with ASCII
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

    // Slack blocks (clean, no ASCII)
    const slackBlocks = [
      { type: 'section', text: { type: 'mrkdwn', text: `*${event.title}*\n${event.message}` } },
    ];

    const actions = event.actions?.map((a, i) => ({
      id: `custom_${interactionId}_${i}`,
      label: a.label,
      value: JSON.stringify({ action: 'custom', interactionId, value: a.value }),
    }));

    return {
      text: lines.join('\n'),
      notificationText: `${event.title}: ${event.message.slice(0, 50)}${event.message.length > 50 ? '...' : ''}`,
      blocks: slackBlocks,
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
      const deferred = progress.modulesDeferred || 0;
      // modulesTotal is active modules only (deferred are in separate file)
      const activeTotal = progress.modulesTotal;
      const pct = activeTotal > 0 ? Math.round((progress.modulesComplete / activeTotal) * 100) : 0;

      lines.push('```');
      lines.push(this.border());
      lines.push(this.formatTitle('ORCHESTRATOR READY'));
      lines.push(this.emptyLine());

      lines.push(this.padLine(`Version: ${event.version}`));
      lines.push(this.padLine(`Skills: ${event.skillCount} | Loops: ${event.loopCount}`));
      lines.push(this.emptyLine());

      lines.push(this.padLine(`Dream State: ${progress.name}`));
      // Show active modules
      const modulesStr = pct === 100
        ? `Modules: ${progress.modulesComplete} active`
        : `Modules: ${progress.modulesComplete}/${activeTotal} (${pct}%)`;
      lines.push(this.padLine(modulesStr));
      // Show future modules count (dream state backlog)
      if (deferred > 0) {
        lines.push(this.padLine(`Future: ${deferred} modules in dream state`));
      }
      lines.push(this.emptyLine());

      lines.push(this.padLine('Next highest leverage move:'));
      if (event.recommendedTarget) {
        lines.push(this.padLine(`  /${event.recommendedLoop} -> ${event.recommendedTarget}`));
      } else {
        lines.push(this.padLine(`  /${event.recommendedLoop}`));
      }
      lines.push(this.emptyLine());

      // Organize loops by category
      const loopCategories = this.categorizeLoops(event.availableLoops);
      lines.push(this.padLine('Available loops:'));
      for (const [category, loops] of Object.entries(loopCategories)) {
        if (loops.length > 0) {
          lines.push(this.padLine(`  ${category}: ${loops.join(', ')}`));
        }
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

    let statusText = 'No Dream State';
    if (event.hasDreamState && event.dreamStateProgress) {
      const p = event.dreamStateProgress;
      const deferred = p.modulesDeferred || 0;
      const activeTotal = p.modulesTotal;
      statusText = `${p.modulesComplete}/${activeTotal} modules`;
      if (deferred > 0) statusText += ` + ${deferred} future`;
    }

    // Build Slack-native blocks (no ASCII borders)
    const slackBlocks: Array<{ type: string; text?: { type: string; text: string }; elements?: Array<{ type: string; text: string }> }> = [];

    if (event.hasDreamState && event.dreamStateProgress) {
      const p = event.dreamStateProgress;
      const deferred = p.modulesDeferred || 0;
      const activeTotal = p.modulesTotal;
      const pct = activeTotal > 0 ? Math.round((p.modulesComplete / activeTotal) * 100) : 0;

      // Header section
      let headerText = `*Orchestrator v${event.version}*\n`;
      headerText += `Skills: ${event.skillCount} | Loops: ${event.loopCount}\n\n`;
      headerText += `*Dream State:* ${p.name}\n`;
      headerText += pct === 100
        ? `Modules: ${p.modulesComplete} active`
        : `Modules: ${p.modulesComplete}/${activeTotal} (${pct}%)`;
      if (deferred > 0) {
        headerText += ` + ${deferred} future`;
      }

      slackBlocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: headerText },
      });

      // Next move section
      const nextMove = event.recommendedTarget
        ? `/${event.recommendedLoop} -> ${event.recommendedTarget}`
        : `/${event.recommendedLoop}`;
      slackBlocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Next:* ${nextMove}` },
      });

      // Loops by category
      const loopCategories = this.categorizeLoops(event.availableLoops);
      const loopLines: string[] = [];
      for (const [category, catLoops] of Object.entries(loopCategories)) {
        if (catLoops.length > 0) {
          loopLines.push(`${category}: ${catLoops.join(', ')}`);
        }
      }
      slackBlocks.push({
        type: 'context',
        elements: [{ type: 'mrkdwn', text: loopLines.join('\n') }],
      });
    } else {
      // No dream state
      slackBlocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Orchestrator v${event.version}*\nNo Dream State. Run /dream-loop to get started.`,
        },
      });
    }

    return {
      text: lines.join('\n'),
      notificationText: `Orchestrator v${event.version} ready — ${statusText}`,
      blocks: slackBlocks,
      metadata: {
        interactionId,
        eventType: 'startup_welcome',
      },
    };
  }

  private formatDailyWelcome(event: DailyWelcomeEvent, interactionId: string): FormattedMessage {
    // Terminal display with ASCII
    const lines: string[] = [];
    lines.push('```');
    lines.push(this.border());

    if (!event.hasDreamState) {
      lines.push(this.formatTitle('WELCOME TO ORCHESTRATOR'));
      lines.push(this.emptyLine());
      lines.push(this.padLine(`Version: ${event.version}`));
      lines.push(this.emptyLine());
      lines.push(this.padLine('No Dream State found.'));
      lines.push(this.emptyLine());
      lines.push(this.padLine('Run /dream-loop to establish your vision and roadmap.'));
    } else if (event.versionStatus === 'update_available') {
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
      lines.push(this.formatTitle(event.greeting));
      lines.push(this.emptyLine());

      if (event.dreamStateProgress) {
        const progress = event.dreamStateProgress;
        const pct = Math.round((progress.modulesComplete / progress.modulesTotal) * 100);
        lines.push(this.padLine(`Dream State: ${progress.name}`));
        lines.push(this.padLine(`  ${progress.modulesComplete}/${progress.modulesTotal} modules (${pct}%)`));
        const barWidth = 30;
        const filled = Math.round((pct / 100) * barWidth);
        const bar = '[' + '='.repeat(filled) + ' '.repeat(barWidth - filled) + ']';
        lines.push(this.padLine(`  ${bar}`));
      }

      if (event.hasRoadmap && event.roadmapDrift?.hasDrift) {
        lines.push(this.emptyLine());
        lines.push(this.padLine('ROADMAP DRIFT DETECTED'));
        lines.push(this.padLine(`  Roadmap: ${event.roadmapDrift.roadmapComplete}/${event.roadmapDrift.roadmapTotal} (${event.roadmapDrift.roadmapPercentage}%)`));
        lines.push(this.padLine(`  Dream State: ${event.roadmapDrift.dreamStateComplete}/${event.roadmapDrift.dreamStateTotal} (${event.roadmapDrift.dreamStatePercentage}%)`));
        lines.push(this.padLine(`  Drift: ${event.roadmapDrift.driftAmount} modules out of sync`));
        lines.push(this.emptyLine());
        lines.push(this.padLine('Run update_roadmap_status to sync.'));
      }

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

    // Slack blocks (clean, no ASCII)
    const slackBlocks: Array<{ type: string; text?: { type: string; text: string }; elements?: Array<{ type: string; text: string }> }> = [];

    if (!event.hasDreamState) {
      slackBlocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Welcome to Orchestrator*\nVersion: ${event.version}\n\nNo Dream State. Run /dream-loop to get started.` },
      });
    } else if (event.versionStatus === 'update_available') {
      let updateText = `*Update Available*\nCurrent: ${event.version} → Latest: ${event.latestVersion}`;
      if (event.updateNotes && event.updateNotes.length > 0) {
        updateText += `\n\nWhat's new:\n`;
        for (const note of event.updateNotes.slice(0, 3)) {
          updateText += `• ${note}\n`;
        }
      }
      slackBlocks.push({ type: 'section', text: { type: 'mrkdwn', text: updateText } });
    } else {
      let headerText = `*${event.greeting}*\n`;
      if (event.dreamStateProgress) {
        const p = event.dreamStateProgress;
        const pct = Math.round((p.modulesComplete / p.modulesTotal) * 100);
        headerText += `\n*Dream State:* ${p.name}\nModules: ${p.modulesComplete}/${p.modulesTotal} (${pct}%)`;
      }
      slackBlocks.push({ type: 'section', text: { type: 'mrkdwn', text: headerText } });

      if (event.hasRoadmap && event.roadmapDrift?.hasDrift) {
        slackBlocks.push({
          type: 'section',
          text: { type: 'mrkdwn', text: `*Roadmap Drift:* ${event.roadmapDrift.driftAmount} modules out of sync` },
        });
      }

      if (event.availableMoves && event.availableMoves.length > 0) {
        const movesText = event.availableMoves.slice(0, 3)
          .map(m => `${m.moduleName} (L${m.layer}) - ${m.score.toFixed(1)}`)
          .join('\n');
        slackBlocks.push({
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `Available moves:\n${movesText}` }],
        });
      }

      const nextMove = event.recommendedTarget
        ? `/${event.recommendedLoop} → ${event.recommendedTarget}`
        : `/${event.recommendedLoop}`;
      slackBlocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Next:* ${nextMove}` },
      });
    }

    const progressText = event.dreamStateProgress
      ? ` — ${event.dreamStateProgress.modulesComplete}/${event.dreamStateProgress.modulesTotal} modules`
      : '';
    return {
      text: lines.join('\n'),
      notificationText: `${event.greeting}${progressText}`,
      blocks: slackBlocks,
      metadata: {
        interactionId,
        eventType: 'daily_welcome',
      },
    };
  }

  private formatUnknown(event: ProactiveEvent, interactionId: string): FormattedMessage {
    // Terminal display with ASCII
    const lines: string[] = [];
    lines.push('```');
    lines.push(this.border());
    lines.push(this.formatTitle('NOTIFICATION'));
    lines.push(this.emptyLine());
    lines.push(this.padLine(JSON.stringify(event).slice(0, this.width - 4)));
    lines.push(this.emptyLine());
    lines.push(this.border());
    lines.push('```');

    // Slack blocks (clean, no ASCII)
    const eventType = (event as { type: string }).type || 'unknown';
    const slackBlocks = [
      { type: 'section', text: { type: 'mrkdwn', text: `*Notification:* ${eventType}` } },
    ];

    return {
      text: lines.join('\n'),
      notificationText: `Notification: ${eventType}`,
      blocks: slackBlocks,
      metadata: {
        interactionId,
        eventType,
      },
    };
  }

  private formatCoherenceCheck(event: CoherenceCheckEvent, interactionId: string): FormattedMessage {
    // Determine severity and formatting based on issues
    const isCritical = event.criticalIssues > 0;
    const hasWarnings = event.warnings > 0;

    // Calculate delta for loop checks
    const delta = event.baselineScore !== undefined ? event.score - event.baselineScore : null;
    const deltaStr = delta !== null ? (delta >= 0 ? `+${delta}` : `${delta}`) : '';
    const deltaColor = delta !== null && delta < 0 ? ' (degraded)' : delta !== null && delta > 0 ? ' (improved)' : '';

    // Build text based on check type
    let text: string;
    let notificationText: string;

    switch (event.checkType) {
      case 'tick':
        if (isCritical) {
          text = `*Coherence Alert* — ${event.criticalIssues} critical issue${event.criticalIssues !== 1 ? 's' : ''}\nScore: ${event.score}/100`;
          notificationText = `Coherence: ${event.criticalIssues} critical issues (score: ${event.score})`;
        } else if (hasWarnings) {
          text = `Coherence: ${event.score}/100 — ${event.warnings} warning${event.warnings !== 1 ? 's' : ''}`;
          notificationText = `Coherence: ${event.score}/100`;
        } else {
          text = `Coherence: ${event.score}/100`;
          notificationText = `Coherence check passed`;
        }
        break;

      case 'phase':
        text = `*${event.phase}* coherence check: ${event.score}/100`;
        if (isCritical) {
          text += `\n${event.criticalIssues} critical issue${event.criticalIssues !== 1 ? 's' : ''} detected`;
        }
        notificationText = `${event.phase || 'Phase'} coherence: ${event.score}`;
        break;

      case 'loop':
        text = `*Loop coherence*: ${event.score}/100`;
        if (delta !== null) {
          text += ` (${deltaStr}${deltaColor})`;
          text += `\nBaseline: ${event.baselineScore} → Final: ${event.score}`;
        }
        if (isCritical) {
          text += `\n${event.criticalIssues} critical issue${event.criticalIssues !== 1 ? 's' : ''}`;
        }
        notificationText = `Loop coherence: ${event.score} (${deltaStr})`;
        break;

      default:
        text = `Coherence: ${event.score}/100`;
        notificationText = 'Coherence check';
    }

    const slackBlocks = [
      { type: 'section', text: { type: 'mrkdwn', text } },
    ];

    return {
      text,
      notificationText,
      blocks: slackBlocks,
      metadata: {
        interactionId,
        eventType: 'coherence_check',
        executionId: event.executionId,
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

  // Helper: categorize loops for organized display
  private categorizeLoops(loops: string[]): Record<string, string[]> {
    const categories: Record<string, string[]> = {
      'Build': [],
      'Plan': [],
      'Sales': [],
      'Other': [],
    };

    const buildLoops = ['engineering', 'bugfix', 'distribution', 'infra', 'infrastructure'];
    const planLoops = ['dream', 'learning', 'audit', 'proposal', 'async', 'transpose', 'meta'];
    const salesLoops = ['champion', 'close-prep', 'cultivation', 'deal-intake', 'deal-review', 'discovery', 'pipeline', 'intelligence'];

    for (const loop of loops) {
      const base = loop.replace(/-loop$/, '');

      if (buildLoops.some(b => base.includes(b))) {
        categories['Build'].push(loop);
      } else if (planLoops.some(p => base.includes(p))) {
        categories['Plan'].push(loop);
      } else if (salesLoops.some(s => base.includes(s))) {
        categories['Sales'].push(loop);
      } else {
        categories['Other'].push(loop);
      }
    }

    // Remove empty categories
    for (const key of Object.keys(categories)) {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    }

    return categories;
  }
}
