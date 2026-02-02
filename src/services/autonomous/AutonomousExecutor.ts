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

import type { ExecutionEngine } from '../ExecutionEngine.js';
import type { LoopComposer } from '../LoopComposer.js';
import type { LearningService } from '../LearningService.js';
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

  private running = false;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private tickInterval: number;
  private maxParallelExecutions: number;
  private maxSkillRetries: number;

  private totalTicksProcessed = 0;
  private lastTickAt: Date | null = null;
  private startedAt: Date | null = null;

  // Track skill retry counts per execution
  private skillRetries: Map<string, Map<string, number>> = new Map();

  constructor(private options: AutonomousExecutorOptions = {}) {
    this.tickInterval = options.tickInterval || 5000;
    this.maxParallelExecutions = options.maxParallelExecutions || 3;
    this.maxSkillRetries = options.maxSkillRetries || 3;
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
  // Auto-Approval Logic
  // --------------------------------------------------------------------------

  /**
   * Try to auto-approve any pending gates
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

      const canApprove = this.canAutoApprove(execution, gate);
      if (canApprove.approved) {
        try {
          await this.executionEngine!.approveGate(
            execution.id,
            gate.id,
            `autonomous-executor (${canApprove.reason})`
          );
          actions.push({
            type: 'gate_auto_approved',
            target: gate.id,
            details: { reason: canApprove.reason },
          });
        } catch (err) {
          errors.push(`Failed to auto-approve gate ${gate.id}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    return { actions, errors };
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

      case 'conditional':
        // Conditional gates auto-approve if condition is met
        // For now, we check if there's no deploy target configured
        // This can be extended with more sophisticated condition checking
        const conditionMet = this.evaluateConditionalGate(execution, gate);
        return {
          approved: conditionMet,
          reason: conditionMet ? 'conditional gate condition met' : 'conditional gate condition not met',
          gateId: gate.id,
        };

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
