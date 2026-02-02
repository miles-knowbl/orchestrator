/**
 * AutonomousExecutor - Background execution service for autonomous loop operation
 *
 * Enables "it works while I sleep" functionality by:
 * - Auto-approving gates based on approvalType and guarantee validation
 * - Auto-advancing phases when all skills complete
 * - Running on configurable intervals in background
 * - Coordinating with 2-layer orchestration for agent spawning
 *
 * Part of the autonomous module (Layer 1).
 */

import { exec } from 'child_process';
import { existsSync } from 'fs';
import type { ExecutionEngine } from '../ExecutionEngine.js';
import type { LoopComposer } from '../LoopComposer.js';
import type { LearningService } from '../LearningService.js';
import type { ProactiveMessagingService } from '../proactive-messaging/index.js';
import type { LoopExecution, Gate, AutonomyLevel } from '../../types.js';

// ============================================================================
// Types
// ============================================================================

export interface AutonomousExecutorOptions {
  /** Interval between autonomous ticks (ms). Default: 5000 */
  tickInterval?: number;
  /** Maximum parallel autonomous executions. Default: 3 */
  maxParallelExecutions?: number;
  /** Maximum retries for failed skills before escalation. Default: 3 */
  maxSkillRetries?: number;
  /** Whether to auto-start background runner. Default: false */
  autoStart?: boolean;
  /** Delay between gate retry attempts (ms). Default: 10000 */
  gateRetryDelayMs?: number;
  /** Maximum gate retry attempts before Claude spawn. Default: 3 */
  maxGateRetries?: number;
  /** Timeout for Claude Code task (ms). Default: 300000 (5 min) */
  claudeTaskTimeoutMs?: number;
}

/**
 * State machine for gate retry flow
 */
export type GateRetryStatus = 'pending' | 'retrying' | 'awaiting_claude' | 'escalated';

export interface GateRetryState {
  gateId: string;
  executionId: string;
  status: GateRetryStatus;
  retryCount: number;
  lastAttemptAt: number;
  claudeSpawnedAt?: number;
  escalatedAt?: number;
  missingFiles?: string[];
}

export interface AutonomousStatus {
  running: boolean;
  tickInterval: number;
  maxParallelExecutions: number;
  activeExecutions: number;
  totalTicksProcessed: number;
  lastTickAt: string | null;
  startedAt: string | null;
}

export interface TickResult {
  executionId: string;
  actions: TickAction[];
  errors: string[];
}

export interface TickAction {
  type: 'gate_auto_approved' | 'phase_advanced' | 'phase_completed' | 'loop_completed' | 'skill_retry' | 'escalation';
  target: string;  // gateId, phase name, or skillId
  details?: Record<string, unknown>;
}

export interface AutoApprovalResult {
  approved: boolean;
  reason: string;
  gateId: string;
}

// ============================================================================
// Service
// ============================================================================

export class AutonomousExecutor {
  private executionEngine: ExecutionEngine | null = null;
  private loopComposer: LoopComposer | null = null;
  private learningService: LearningService | null = null;
  private messagingService: ProactiveMessagingService | null = null;

  private running = false;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private tickInterval: number;
  private maxParallelExecutions: number;
  private maxSkillRetries: number;
  private gateRetryDelayMs: number;
  private maxGateRetries: number;
  private claudeTaskTimeoutMs: number;

  private totalTicksProcessed = 0;
  private lastTickAt: Date | null = null;
  private startedAt: Date | null = null;

  // Track skill retry counts per execution
  private skillRetries: Map<string, Map<string, number>> = new Map();

  // Track gate retry states: key = `${executionId}:${gateId}`
  private gateRetries: Map<string, GateRetryState> = new Map();

  constructor(private options: AutonomousExecutorOptions = {}) {
    this.tickInterval = options.tickInterval || 5000;
    this.maxParallelExecutions = options.maxParallelExecutions || 3;
    this.maxSkillRetries = options.maxSkillRetries || 3;
    this.gateRetryDelayMs = options.gateRetryDelayMs || 10000;
    this.maxGateRetries = options.maxGateRetries || 3;
    this.claudeTaskTimeoutMs = options.claudeTaskTimeoutMs || 300000;
  }

  /**
   * Set dependencies (called after construction)
   */
  setDependencies(deps: {
    executionEngine: ExecutionEngine;
    loopComposer: LoopComposer;
    learningService?: LearningService;
  }): void {
    this.executionEngine = deps.executionEngine;
    this.loopComposer = deps.loopComposer;
    this.learningService = deps.learningService || null;
  }

  /**
   * Set the messaging service for notifications
   */
  setMessagingService(service: ProactiveMessagingService): void {
    this.messagingService = service;
    this.log('info', 'ProactiveMessagingService attached to AutonomousExecutor');
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.options.autoStart) {
      this.start();
    }
  }

  // --------------------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------------------

  /**
   * Start background autonomous execution
   */
  start(): void {
    if (this.running) return;

    this.running = true;
    this.startedAt = new Date();

    this.tickTimer = setInterval(() => {
      this.tick().catch(err => {
        this.log('error', `Autonomous tick error: ${err.message}`);
      });
    }, this.tickInterval);

    this.log('info', `Autonomous executor started (interval: ${this.tickInterval}ms)`);
  }

  /**
   * Stop background autonomous execution
   */
  stop(): void {
    if (!this.running) return;

    this.running = false;
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }

    this.log('info', 'Autonomous executor stopped');
  }

  /**
   * Pause without stopping active executions
   */
  pause(): void {
    this.stop();
    this.log('info', 'Autonomous executor paused');
  }

  /**
   * Resume after pause
   */
  resume(): void {
    this.start();
  }

  /**
   * Get current status
   */
  getStatus(): AutonomousStatus {
    const activeExecutions = this.getAutonomousExecutions().length;

    return {
      running: this.running,
      tickInterval: this.tickInterval,
      maxParallelExecutions: this.maxParallelExecutions,
      activeExecutions,
      totalTicksProcessed: this.totalTicksProcessed,
      lastTickAt: this.lastTickAt?.toISOString() || null,
      startedAt: this.startedAt?.toISOString() || null,
    };
  }

  /**
   * Update configuration
   */
  configure(options: Partial<AutonomousExecutorOptions>): void {
    if (options.tickInterval !== undefined) {
      this.tickInterval = options.tickInterval;
      // Restart timer if running
      if (this.running) {
        this.stop();
        this.start();
      }
    }
    if (options.maxParallelExecutions !== undefined) {
      this.maxParallelExecutions = options.maxParallelExecutions;
    }
    if (options.maxSkillRetries !== undefined) {
      this.maxSkillRetries = options.maxSkillRetries;
    }
  }

  // --------------------------------------------------------------------------
  // Core Tick Logic
  // --------------------------------------------------------------------------

  /**
   * Run a single autonomous tick
   */
  async tick(): Promise<TickResult[]> {
    if (!this.executionEngine || !this.loopComposer) {
      throw new Error('Dependencies not set. Call setDependencies first.');
    }

    const results: TickResult[] = [];
    const executions = this.getAutonomousExecutions();

    // Limit to max parallel
    const toProcess = executions.slice(0, this.maxParallelExecutions);

    for (const execution of toProcess) {
      try {
        const result = await this.processExecution(execution);
        results.push(result);
      } catch (err) {
        results.push({
          executionId: execution.id,
          actions: [],
          errors: [err instanceof Error ? err.message : String(err)],
        });
      }
    }

    this.totalTicksProcessed++;
    this.lastTickAt = new Date();

    return results;
  }

  /**
   * Process a single execution
   */
  private async processExecution(execution: LoopExecution): Promise<TickResult> {
    const actions: TickAction[] = [];
    const errors: string[] = [];

    const loop = this.loopComposer!.getLoop(execution.loopId);
    if (!loop) {
      errors.push(`Loop not found: ${execution.loopId}`);
      return { executionId: execution.id, actions, errors };
    }

    // 1. Try to auto-approve any pending gates for the current phase
    const gateResult = await this.tryAutoApproveGates(execution, loop);
    actions.push(...gateResult.actions);
    errors.push(...gateResult.errors);

    // 2. Check if current phase can be completed
    const phaseComplete = await this.tryCompletePhase(execution);
    if (phaseComplete.completed) {
      actions.push({
        type: 'phase_completed',
        target: execution.currentPhase,
      });
    }

    // 3. Try to advance to next phase
    const advanceResult = await this.tryAdvancePhase(execution, loop);
    if (advanceResult.advanced) {
      actions.push({
        type: 'phase_advanced',
        target: advanceResult.newPhase!,
      });
    }

    // 4. Check if loop is now complete
    const updatedExecution = await this.executionEngine!.getExecution(execution.id);
    if (updatedExecution?.status === 'completed') {
      actions.push({
        type: 'loop_completed',
        target: execution.loopId,
      });

      // Trigger learning service
      if (this.learningService) {
        try {
          await this.learningService.completeRunTracking(execution.id);
        } catch {
          // Learning is non-blocking
        }
      }
    }

    return { executionId: execution.id, actions, errors };
  }

  // --------------------------------------------------------------------------
  // Auto-Approval Logic (with retry and Claude Code spawning)
  // --------------------------------------------------------------------------

  /**
   * Try to auto-approve any pending gates
   *
   * Flow:
   * 1. Check guarantees first
   * 2. If green → auto-approve with brief notification
   * 3. If red → start retry flow (3 attempts, 10s delay)
   * 4. If still red → spawn Claude Code to create missing files
   * 5. If still red → escalate to human (full notification with buttons)
   */
  private async tryAutoApproveGates(
    execution: LoopExecution,
    loop: { gates: Gate[] }
  ): Promise<{ actions: TickAction[]; errors: string[] }> {
    const actions: TickAction[] = [];
    const errors: string[] = [];

    // Find gates for current phase that are pending
    const currentPhaseGates = loop.gates.filter(g => g.afterPhase === execution.currentPhase);

    for (const gate of currentPhaseGates) {
      const gateState = execution.gates.find(g => g.gateId === gate.id);
      if (!gateState || gateState.status === 'approved') continue;

      // Check if this gate is eligible for auto-approval
      const canAutoApproveResult = this.canAutoApprove(execution, gate);
      if (!canAutoApproveResult.approved) {
        continue; // Not eligible for auto-approval (e.g., human gate or wrong autonomy level)
      }

      // Check current retry state
      const retryKey = `${execution.id}:${gate.id}`;
      let retryState = this.gateRetries.get(retryKey);

      // Pre-check guarantees
      const guaranteeStatus = await this.checkGateGuarantees(execution.id, gate.id);

      if (guaranteeStatus.canApprove) {
        // Guarantees passed! Auto-approve immediately
        try {
          await this.executionEngine!.approveGate(
            execution.id,
            gate.id,
            `autonomous-executor (${canAutoApproveResult.reason})`
          );

          // Determine reason for notification
          let reason: 'guarantees_passed' | 'after_retry' | 'after_claude' = 'guarantees_passed';
          let retryCount: number | undefined;

          if (retryState) {
            if (retryState.status === 'awaiting_claude') {
              reason = 'after_claude';
            } else if (retryState.retryCount > 0) {
              reason = 'after_retry';
              retryCount = retryState.retryCount;
            }
            // Clean up retry state
            this.gateRetries.delete(retryKey);
          }

          // Send brief notification
          await this.sendAutoApproveNotification(execution, gate.id, reason, retryCount);

          actions.push({
            type: 'gate_auto_approved',
            target: gate.id,
            details: { reason: canAutoApproveResult.reason, retryCount },
          });

          // Auto-advance to next phase
          try {
            await this.executionEngine!.advancePhase(execution.id);
            actions.push({
              type: 'phase_advanced',
              target: execution.currentPhase,
            });
          } catch {
            // Advance may fail for valid reasons (e.g., not all skills complete)
          }

        } catch (err) {
          errors.push(`Failed to auto-approve gate ${gate.id}: ${err instanceof Error ? err.message : String(err)}`);
        }
      } else {
        // Guarantees failed - process retry state machine
        const result = await this.processGateRetryState(
          execution,
          gate,
          retryState,
          guaranteeStatus
        );
        actions.push(...result.actions);
        errors.push(...result.errors);
      }
    }

    return { actions, errors };
  }

  /**
   * Check gate guarantees and return status
   */
  private async checkGateGuarantees(
    executionId: string,
    gateId: string
  ): Promise<{
    canApprove: boolean;
    missingFiles: string[];
    blocking: Array<{ id: string; name: string; errors?: string[] }>;
  }> {
    if (!this.executionEngine) {
      return { canApprove: true, missingFiles: [], blocking: [] };
    }

    try {
      const status = await this.executionEngine.getGateGuaranteeStatus(executionId, gateId);

      // Extract missing files from blocking guarantee errors
      const missingFiles: string[] = [];
      if (status.blocking) {
        for (const g of status.blocking) {
          if (g.errors) {
            for (const error of g.errors) {
              // Extract file names from error messages like 'Expected at least 1 file(s) matching "SPEC.md"'
              const match = error.match(/matching "([^"]+)"/);
              if (match) {
                missingFiles.push(match[1]);
              }
            }
          }
        }
      }

      return {
        canApprove: status.canApprove,
        missingFiles,
        blocking: status.blocking || [],
      };
    } catch (err) {
      this.log('error', `Failed to check gate guarantees: ${err instanceof Error ? err.message : String(err)}`);
      return { canApprove: true, missingFiles: [], blocking: [] };
    }
  }

  /**
   * Process the gate retry state machine
   */
  private async processGateRetryState(
    execution: LoopExecution,
    gate: Gate,
    retryState: GateRetryState | undefined,
    guaranteeStatus: { canApprove: boolean; missingFiles: string[]; blocking: Array<{ id: string; name: string; errors?: string[] }> }
  ): Promise<{ actions: TickAction[]; errors: string[] }> {
    const actions: TickAction[] = [];
    const errors: string[] = [];
    const retryKey = `${execution.id}:${gate.id}`;
    const now = Date.now();

    if (!retryState) {
      // First failure - initialize retry state
      retryState = {
        gateId: gate.id,
        executionId: execution.id,
        status: 'retrying',
        retryCount: 1,
        lastAttemptAt: now,
        missingFiles: guaranteeStatus.missingFiles,
      };
      this.gateRetries.set(retryKey, retryState);
      this.log('info', `Gate ${gate.id} failed guarantees, starting retry flow (attempt 1/${this.maxGateRetries})`);
      return { actions, errors };
    }

    // Check if enough time has passed for next retry
    const timeSinceLastAttempt = now - retryState.lastAttemptAt;

    switch (retryState.status) {
      case 'retrying':
        if (timeSinceLastAttempt < this.gateRetryDelayMs) {
          // Not enough time passed, wait
          return { actions, errors };
        }

        if (retryState.retryCount < this.maxGateRetries) {
          // Increment retry count and wait for next tick
          retryState.retryCount++;
          retryState.lastAttemptAt = now;
          retryState.missingFiles = guaranteeStatus.missingFiles;
          this.log('info', `Gate ${gate.id} retry attempt ${retryState.retryCount}/${this.maxGateRetries}`);
        } else {
          // Max retries reached - spawn Claude Code
          retryState.status = 'awaiting_claude';
          retryState.claudeSpawnedAt = now;
          this.log('info', `Gate ${gate.id} max retries reached, spawning Claude Code`);
          await this.spawnClaudeCodeForGate(execution, gate, guaranteeStatus.missingFiles);
        }
        break;

      case 'awaiting_claude':
        // Check if Claude task has timed out
        const claudeElapsed = now - (retryState.claudeSpawnedAt || now);
        if (claudeElapsed > this.claudeTaskTimeoutMs) {
          // Claude timed out - escalate to human
          retryState.status = 'escalated';
          retryState.escalatedAt = now;
          this.log('warn', `Gate ${gate.id} Claude task timed out, escalating to human`);
          await this.escalateToHuman(execution, gate, guaranteeStatus);
        }
        // Otherwise, wait for Claude to complete (guarantees will pass on next check)
        break;

      case 'escalated':
        // Already escalated, nothing to do
        break;
    }

    return { actions, errors };
  }

  /**
   * Spawn Claude Code to create missing deliverables
   */
  private async spawnClaudeCodeForGate(
    execution: LoopExecution,
    gate: Gate,
    missingFiles: string[]
  ): Promise<void> {
    if (missingFiles.length === 0) {
      this.log('warn', `No missing files identified for gate ${gate.id}, escalating immediately`);
      await this.escalateToHuman(execution, gate, { canApprove: false, missingFiles: [], blocking: [] });
      return;
    }

    const deliverables = missingFiles.join(', ');
    const gateName = gate.id.replace('-gate', '');
    const cwd = process.cwd();

    // Build prompt for Claude Code
    const prompt = `AUTONOMOUS GATE RECOVERY (gate: ${gate.id}): ` +
      `Create the missing deliverable(s): ${deliverables}. ` +
      `This is for the ${gateName} gate in execution ${execution.id}. ` +
      `Create real content (not placeholder). ` +
      `The gate will auto-approve once the files exist.`;

    // Notify about the spawn
    if (this.messagingService) {
      await this.messagingService.notify({
        type: 'custom',
        title: 'AUTO-RECOVERY',
        message: `Spawning Claude Code to create: ${deliverables}`,
      });
    }

    // Detect terminal and spawn
    const hasITerm = existsSync('/Applications/iTerm.app');
    const escapedPrompt = prompt.replace(/'/g, "'\\''");
    const shellCmd = `cd '${cwd}' && claude --dangerously-skip-permissions '${escapedPrompt}'`;

    let script: string;
    if (hasITerm) {
      script = `
        tell application "iTerm"
          activate
          tell current window
            create tab with default profile
            tell current session
              write text "${shellCmd.replace(/"/g, '\\"')}"
            end tell
          end tell
        end tell
      `;
    } else {
      script = `
        tell application "Terminal"
          activate
          tell application "System Events" to keystroke "t" using command down
          delay 0.3
          do script "${shellCmd.replace(/"/g, '\\"')}" in front window
        end tell
      `;
    }

    exec(`osascript -e '${script.replace(/'/g, "'\\''")}'`, (error) => {
      if (error) {
        this.log('error', `Failed to spawn Claude Code: ${error.message}`);
      } else {
        this.log('info', `Spawned Claude Code for gate ${gate.id}`);
      }
    });
  }

  /**
   * Escalate to human with full notification
   */
  private async escalateToHuman(
    execution: LoopExecution,
    gate: Gate,
    guaranteeStatus: { canApprove: boolean; missingFiles: string[]; blocking: Array<{ id: string; name: string; errors?: string[] }> }
  ): Promise<void> {
    if (!this.messagingService) {
      this.log('warn', `Cannot escalate gate ${gate.id} - no messaging service`);
      return;
    }

    // Get deliverables from the gate definition
    const deliverables = gate.deliverables || [];

    // Send full gate_waiting notification with buttons
    await this.messagingService.notifyGateWaiting(
      gate.id,
      execution.id,
      execution.loopId,
      execution.currentPhase,
      deliverables,
      gate.approvalType || 'human'
    );

    this.log('info', `Gate ${gate.id} escalated to human`);
  }

  /**
   * Send brief auto-approve notification
   */
  private async sendAutoApproveNotification(
    execution: LoopExecution,
    gateId: string,
    reason: 'guarantees_passed' | 'after_retry' | 'after_claude',
    retryCount?: number
  ): Promise<void> {
    if (!this.messagingService) return;

    await this.messagingService.notify({
      type: 'gate_auto_approved',
      gateId,
      executionId: execution.id,
      loopId: execution.loopId,
      phase: execution.currentPhase,
      reason,
      retryCount,
    });
  }

  /**
   * Check if a gate can be auto-approved
   */
  canAutoApprove(execution: LoopExecution, gate: Gate): AutoApprovalResult {
    // Only auto-approve in 'full' autonomy mode
    if (execution.autonomy !== 'full') {
      return {
        approved: false,
        reason: `Autonomy level is '${execution.autonomy}', not 'full'`,
        gateId: gate.id,
      };
    }

    // Check approval type
    switch (gate.approvalType) {
      case 'auto':
        // Auto gates always auto-approve (guarantees checked in approveGate)
        return {
          approved: true,
          reason: 'approvalType=auto',
          gateId: gate.id,
        };

      case 'conditional': {
        // Conditional gates auto-approve if condition is met
        // For now, we check if there's no deploy target configured
        // This can be extended with more sophisticated condition checking
        const conditionMet = this.evaluateConditionalGate(execution, gate);
        return {
          approved: conditionMet,
          reason: conditionMet ? 'conditional gate condition met' : 'conditional gate condition not met',
          gateId: gate.id,
        };
      }

      case 'human':
        // Human gates never auto-approve
        return {
          approved: false,
          reason: 'approvalType=human requires manual approval',
          gateId: gate.id,
        };

      default:
        return {
          approved: false,
          reason: `Unknown approvalType: ${gate.approvalType}`,
          gateId: gate.id,
        };
    }
  }

  /**
   * Evaluate a conditional gate
   */
  private evaluateConditionalGate(execution: LoopExecution, gate: Gate): boolean {
    // Default conditional logic:
    // - deploy-gate: passes if no deploy target configured
    // - other gates: pass by default

    if (gate.id === 'deploy-gate') {
      // Check if deploy is configured (simplified check)
      // In a real implementation, this would check for deploy config
      return true;  // Auto-pass if no deploy configured
    }

    // Default: conditional gates pass
    return true;
  }

  // --------------------------------------------------------------------------
  // Phase Management
  // --------------------------------------------------------------------------

  /**
   * Try to complete the current phase
   */
  private async tryCompletePhase(
    execution: LoopExecution
  ): Promise<{ completed: boolean }> {
    const phaseState = execution.phases.find(p => p.phase === execution.currentPhase);
    if (!phaseState) return { completed: false };

    // Check if already completed
    if (phaseState.status === 'completed') return { completed: false };

    // Check if all skills are done
    const pendingSkills = phaseState.skills.filter(
      s => s.status !== 'completed' && s.status !== 'skipped'
    );

    if (pendingSkills.length > 0) return { completed: false };

    try {
      await this.executionEngine!.completePhase(execution.id);
      return { completed: true };
    } catch {
      return { completed: false };
    }
  }

  /**
   * Try to advance to the next phase
   */
  private async tryAdvancePhase(
    execution: LoopExecution,
    loop: { gates: Gate[] }
  ): Promise<{ advanced: boolean; newPhase?: string }> {
    // Check if current phase is completed
    const phaseState = execution.phases.find(p => p.phase === execution.currentPhase);
    if (!phaseState || phaseState.status !== 'completed') {
      return { advanced: false };
    }

    // Check if blocking gate is approved
    const blockingGate = loop.gates.find(
      g => g.afterPhase === execution.currentPhase && g.required
    );

    if (blockingGate) {
      const gateState = execution.gates.find(g => g.gateId === blockingGate.id);
      if (!gateState || gateState.status !== 'approved') {
        return { advanced: false };
      }
    }

    try {
      const updated = await this.executionEngine!.advancePhase(execution.id);
      return { advanced: true, newPhase: updated.currentPhase };
    } catch {
      return { advanced: false };
    }
  }

  // --------------------------------------------------------------------------
  // Execution Queries
  // --------------------------------------------------------------------------

  /**
   * Get all executions running in autonomous mode
   */
  getAutonomousExecutions(): LoopExecution[] {
    if (!this.executionEngine) return [];

    const summaries = this.executionEngine.listExecutions();
    const autonomousExecutions: LoopExecution[] = [];

    for (const summary of summaries) {
      if (summary.status !== 'active') continue;

      const full = this.executionEngine.getExecution(summary.id);
      if (full && full.autonomy === 'full') {
        autonomousExecutions.push(full);
      }
    }

    return autonomousExecutions;
  }

  /**
   * Get executions eligible for autonomous processing
   * (supervised executions can have auto gates auto-approved)
   */
  getEligibleExecutions(): LoopExecution[] {
    if (!this.executionEngine) return [];

    const summaries = this.executionEngine.listExecutions();
    const eligibleExecutions: LoopExecution[] = [];

    for (const summary of summaries) {
      if (summary.status !== 'active') continue;

      const full = this.executionEngine.getExecution(summary.id);
      if (full && (full.autonomy === 'full' || full.autonomy === 'supervised')) {
        eligibleExecutions.push(full);
      }
    }

    return eligibleExecutions;
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  private log(level: 'info' | 'warn' | 'error', message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'AutonomousExecutor',
      message,
    }));
  }
}
