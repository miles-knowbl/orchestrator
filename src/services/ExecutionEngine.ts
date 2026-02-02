/**
 * Execution Engine - State machine for running loops
 */

import { readFile, writeFile, mkdir, readdir, rm } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { LoopComposer } from './LoopComposer.js';
import type { SkillRegistry } from './SkillRegistry.js';
import type { GuaranteeService } from './GuaranteeService.js';
import type { DeliverableManager } from './DeliverableManager.js';
import type { ProactiveMessagingService } from './proactive-messaging/index.js';
import type { RoadmapService } from './roadmapping/index.js';
import type {
  Loop,
  LoopExecution,
  ExecutionStatus,
  ExecutionSummary,
  PhaseExecutionState,
  GateState,
  SkillExecution,
  ExecutionLogEntry,
  Phase,
  LoopMode,
  AutonomyLevel,
  PreLoopContext,
  RoadmapStatus,
  ModuleLeverageScore,
} from '../types.js';
import type { ValidationContext } from '../types/guarantee.js';
import { GuaranteeViolationError } from '../errors/GuaranteeViolationError.js';

export interface ExecutionEngineOptions {
  dataPath: string;  // Path to data/executions/
  projectsPath?: string;  // Base path for project directories
}

export class ExecutionEngine {
  private executions: Map<string, LoopExecution> = new Map();
  private guaranteeService: GuaranteeService | null = null;
  private deliverableManager: DeliverableManager | null = null;
  private messagingService: ProactiveMessagingService | null = null;
  private roadmapService: RoadmapService | null = null;

  constructor(
    private options: ExecutionEngineOptions,
    private loopComposer: LoopComposer,
    private skillRegistry: SkillRegistry
  ) {}

  /**
   * Set the GuaranteeService for validation
   */
  setGuaranteeService(service: GuaranteeService): void {
    this.guaranteeService = service;
    this.log('info', 'GuaranteeService attached to ExecutionEngine');
  }

  /**
   * Set the DeliverableManager for organized deliverable storage
   */
  setDeliverableManager(manager: DeliverableManager): void {
    this.deliverableManager = manager;
    this.log('info', 'DeliverableManager attached to ExecutionEngine');
  }

  /**
   * Set the ProactiveMessagingService for notifications
   */
  setMessagingService(service: ProactiveMessagingService): void {
    this.messagingService = service;
    this.log('info', 'ProactiveMessagingService attached to ExecutionEngine');
  }

  /**
   * Set the RoadmapService for roadmap status in pre-loop context
   */
  setRoadmapService(service: RoadmapService): void {
    this.roadmapService = service;
    this.log('info', 'RoadmapService attached to ExecutionEngine');
  }

  /**
   * Get the DeliverableManager (for external access)
   */
  getDeliverableManager(): DeliverableManager | null {
    return this.deliverableManager;
  }

  /**
   * Get the project path for an execution
   */
  private getProjectPath(execution: LoopExecution): string {
    // If projectsPath is configured, use it as base
    if (this.options.projectsPath) {
      return join(this.options.projectsPath, execution.project);
    }
    // Otherwise assume project is a path or use current directory
    return execution.project.startsWith('/') ? execution.project : process.cwd();
  }

  /**
   * Initialize by loading active executions
   */
  async initialize(): Promise<void> {
    await mkdir(this.options.dataPath, { recursive: true });

    try {
      const entries = await readdir(this.options.dataPath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const statePath = join(this.options.dataPath, entry.name, 'state.json');
        try {
          const content = await readFile(statePath, 'utf-8');
          const execution = JSON.parse(content) as LoopExecution;

          // Restore dates
          execution.startedAt = new Date(execution.startedAt);
          execution.updatedAt = new Date(execution.updatedAt);
          if (execution.completedAt) {
            execution.completedAt = new Date(execution.completedAt);
          }

          this.executions.set(execution.id, execution);
        } catch {
          // Invalid or missing state file
        }
      }

      this.log('info', `Loaded ${this.executions.size} active executions`);
    } catch (error) {
      this.log('warn', `Failed to load executions: ${error}`);
    }
  }

  // ==========================================================================
  // EXECUTION LIFECYCLE
  // ==========================================================================

  /**
   * Start a new loop execution
   */
  async startExecution(params: {
    loopId: string;
    project: string;
    mode?: LoopMode;
    autonomy?: AutonomyLevel;
  }): Promise<LoopExecution> {
    const loop = this.loopComposer.getLoop(params.loopId);
    if (!loop) {
      throw new Error(`Loop not found: ${params.loopId}`);
    }

    const id = randomUUID();
    const now = new Date();

    // Initialize phase states
    const phases: PhaseExecutionState[] = loop.phases.map(phase => ({
      phase: phase.name,
      status: 'pending',
      skills: phase.skills.map(s => ({
        skillId: s.skillId,
        status: 'pending',
      })),
    }));

    // Initialize gate states
    const gates: GateState[] = loop.gates.map(gate => ({
      gateId: gate.id,
      status: 'pending',
    }));

    const execution: LoopExecution = {
      id,
      loopId: params.loopId,
      loopVersion: loop.version,
      project: params.project,
      mode: params.mode || loop.defaultMode,
      autonomy: params.autonomy || loop.defaultAutonomy,
      currentPhase: loop.phases[0].name,
      status: 'active',
      phases,
      gates,
      skillExecutions: [],
      logs: [],
      startedAt: now,
      updatedAt: now,
      memoryId: `memory-${id}`,
    };

    // Add initial log entry
    this.addExecutionLog(execution, {
      level: 'info',
      category: 'system',
      message: `Started ${loop.name} execution`,
      details: { project: params.project, mode: execution.mode, autonomy: execution.autonomy },
    });

    // Mark first phase as in-progress
    execution.phases[0].status = 'in-progress';
    execution.phases[0].startedAt = now;

    // Initialize deliverable run directory (if manager available)
    if (this.deliverableManager) {
      await this.deliverableManager.initializeRun({
        executionId: id,
        loopId: params.loopId,
        project: params.project,
        phases: loop.phases.map(p => p.name),
      });
    }

    // Save and track
    await this.saveExecution(execution);
    this.executions.set(id, execution);

    // Send loop start notification (creates Slack thread)
    if (this.messagingService) {
      try {
        await this.messagingService.notifyLoopStart(
          params.loopId,
          id,
          params.project
        );
      } catch (err) {
        this.log('warn', `Failed to send loop start notification: ${err}`);
      }
    }

    this.log('info', `Started execution ${id} for loop ${params.loopId}`);

    // Gather pre-loop context for caller (required deliverables, guarantees)
    execution.preLoopContext = await this.gatherPreLoopContext(loop, execution);

    return execution;
  }

  /**
   * Gather pre-loop context including required deliverables and guarantees
   * This helps callers understand what's required BEFORE they start executing
   */
  private async gatherPreLoopContext(loop: Loop, execution: LoopExecution): Promise<PreLoopContext> {
    const requiredDeliverables: Array<{ phase: string; skill: string; deliverables: string[] }> = [];
    const skillGuarantees: Array<{ skill: string; guaranteeCount: number; guaranteeNames: string[] }> = [];

    // Get guarantees from GuaranteeService if available
    if (this.guaranteeService) {
      for (const phase of loop.phases) {
        for (const skill of phase.skills) {
          try {
            const guarantees = this.guaranteeService.getSkillGuarantees(skill.skillId);
            if (guarantees && guarantees.length > 0) {
              // Extract deliverable requirements
              const deliverableGuarantees = guarantees.filter(g => g.type === 'deliverable');
              const deliverables = deliverableGuarantees.flatMap(g =>
                g.validation?.files?.map(f => f.pattern) || []
              );

              if (deliverables.length > 0) {
                requiredDeliverables.push({
                  phase: phase.name,
                  skill: skill.skillId,
                  deliverables
                });
              }

              skillGuarantees.push({
                skill: skill.skillId,
                guaranteeCount: guarantees.length,
                guaranteeNames: guarantees.map(g => g.name)
              });
            }
          } catch {
            // Skill may not have guarantees defined
          }
        }
      }
    }

    // Check for Dream State and ROADMAP in project
    const projectPath = this.getProjectPath(execution);
    let dreamStatePath: string | null = null;
    let roadmapPath: string | null = null;

    try {
      const { stat } = await import('fs/promises');
      const dsPath = join(projectPath, '.claude', 'DREAM-STATE.md');
      await stat(dsPath);
      dreamStatePath = dsPath;
    } catch {
      // Dream State doesn't exist
    }

    try {
      const { stat } = await import('fs/promises');
      const rmPath = join(projectPath, 'ROADMAP.md');
      await stat(rmPath);
      roadmapPath = rmPath;
    } catch {
      // ROADMAP doesn't exist
    }

    // Gather roadmap status if RoadmapService is available
    let roadmapStatus: RoadmapStatus | null = null;
    if (this.roadmapService) {
      try {
        const progress = this.roadmapService.getProgress();
        const leverageScores = this.roadmapService.calculateLeverageScores();
        const roadmap = this.roadmapService.getRoadmap();

        // Count deferred modules (those with *deferred* marker in description or status)
        const deferredCount = roadmap.modules.filter(m =>
          m.description?.toLowerCase().includes('deferred') ||
          m.status === 'blocked'
        ).length;

        // Transform leverage scores to include more context
        const availableMoves: ModuleLeverageScore[] = leverageScores.slice(0, 5).map(score => {
          const module = this.roadmapService!.getModule(score.moduleId);
          return {
            moduleId: score.moduleId,
            moduleName: score.moduleName,
            score: score.score,
            layer: module?.layer ?? 0,
            description: module?.description ?? '',
            reasoning: score.reasoning,
          };
        });

        roadmapStatus = {
          totalModules: progress.totalModules,
          completeModules: progress.completeModules,
          inProgressModules: progress.inProgressModules,
          pendingModules: progress.pendingModules,
          blockedModules: progress.blockedModules,
          percentage: progress.overallPercentage,
          currentModule: progress.currentModule?.id ?? null,
          availableMoves,
          deferredCount,
          layerSummary: progress.layerProgress.map(lp => ({
            layer: lp.layer,
            complete: lp.complete,
            total: lp.total,
          })),
        };
      } catch (err) {
        this.log('warn', `Failed to gather roadmap status: ${err}`);
      }
    }

    return {
      requiredDeliverables,
      skillGuarantees,
      dreamStatePath,
      roadmapPath,
      roadmapStatus,
    };
  }

  /**
   * Get an execution by ID
   */
  getExecution(id: string): LoopExecution | null {
    return this.executions.get(id) || null;
  }

  /**
   * List all executions
   */
  listExecutions(filter?: {
    status?: ExecutionStatus;
    loopId?: string;
  }): ExecutionSummary[] {
    let results = [...this.executions.values()];

    if (filter?.status) {
      results = results.filter(e => e.status === filter.status);
    }
    if (filter?.loopId) {
      results = results.filter(e => e.loopId === filter.loopId);
    }

    return results.map(e => this.toSummary(e));
  }

  // ==========================================================================
  // PHASE TRANSITIONS
  // ==========================================================================

  /**
   * Advance to the next phase
   */
  async advancePhase(executionId: string): Promise<LoopExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    if (execution.status !== 'active') {
      throw new Error(`Cannot advance phase: execution is ${execution.status}`);
    }

    const loop = this.loopComposer.getLoop(execution.loopId);
    if (!loop) {
      throw new Error(`Loop not found: ${execution.loopId}`);
    }

    // Find current phase index
    const currentIndex = loop.phases.findIndex(p => p.name === execution.currentPhase);
    if (currentIndex === -1) {
      throw new Error(`Current phase not found: ${execution.currentPhase}`);
    }

    // Check if current phase is complete
    const currentPhaseState = execution.phases[currentIndex];
    if (currentPhaseState.status !== 'completed') {
      throw new Error(`Current phase ${execution.currentPhase} is not completed`);
    }

    // Check for blocking gate
    const gate = loop.gates.find(g => g.afterPhase === execution.currentPhase);
    if (gate) {
      const gateState = execution.gates.find(g => g.gateId === gate.id);
      if (gateState && gateState.status !== 'approved' && gate.required) {
        throw new Error(`Gate ${gate.id} must be approved before advancing`);
      }
    }

    // Check if there's a next phase
    if (currentIndex >= loop.phases.length - 1) {
      // Loop complete
      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.updatedAt = new Date();

      this.addExecutionLog(execution, {
        level: 'info',
        category: 'system',
        message: `Loop execution completed`,
        details: {
          totalPhases: loop.phases.length,
          totalDurationMs: execution.completedAt.getTime() - execution.startedAt.getTime(),
        },
      });

      await this.saveExecution(execution);

      // Send loop complete notification (to same Slack thread)
      if (this.messagingService) {
        try {
          const deliverables = execution.skillExecutions
            .flatMap(s => s.deliverables || [])
            .filter(Boolean);
          await this.messagingService.notifyLoopComplete(
            execution.loopId,
            executionId,
            execution.project,
            `Completed in ${Math.round((execution.completedAt.getTime() - execution.startedAt.getTime()) / 1000)}s`,
            deliverables
          );
        } catch (err) {
          this.log('warn', `Failed to send loop complete notification: ${err}`);
        }
      }

      this.log('info', `Execution ${executionId} completed`);
      return execution;
    }

    // Advance to next phase
    const nextPhase = loop.phases[currentIndex + 1];
    execution.currentPhase = nextPhase.name;
    execution.phases[currentIndex + 1].status = 'in-progress';
    execution.phases[currentIndex + 1].startedAt = new Date();
    execution.updatedAt = new Date();

    this.addExecutionLog(execution, {
      level: 'info',
      category: 'phase',
      phase: nextPhase.name,
      message: `Entered ${nextPhase.name} phase`,
      details: { skills: nextPhase.skills.map(s => s.skillId) },
    });

    await this.saveExecution(execution);
    this.log('info', `Execution ${executionId} advanced to phase ${nextPhase.name}`);
    return execution;
  }

  /**
   * Complete the current phase
   */
  async completePhase(executionId: string): Promise<LoopExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    const phaseState = execution.phases.find(p => p.phase === execution.currentPhase);
    if (!phaseState) {
      throw new Error(`Phase state not found: ${execution.currentPhase}`);
    }

    // Check all skills are completed
    const pendingSkills = phaseState.skills.filter(
      s => s.status !== 'completed' && s.status !== 'skipped'
    );

    if (pendingSkills.length > 0) {
      throw new Error(
        `Cannot complete phase: ${pendingSkills.length} skills pending`
      );
    }

    phaseState.status = 'completed';
    phaseState.completedAt = new Date();
    execution.updatedAt = new Date();

    await this.saveExecution(execution);
    return execution;
  }

  // ==========================================================================
  // SKILL EXECUTION
  // ==========================================================================

  /**
   * Record a skill execution
   */
  async recordSkillExecution(
    executionId: string,
    skillExecution: Omit<SkillExecution, 'id'>
  ): Promise<SkillExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    const fullExecution: SkillExecution = {
      id: randomUUID(),
      ...skillExecution,
    };

    execution.skillExecutions.push(fullExecution);

    // Update phase skill status
    const phaseState = execution.phases.find(p => p.phase === skillExecution.phase);
    if (phaseState) {
      const skillState = phaseState.skills.find(s => s.skillId === skillExecution.skillId);
      if (skillState) {
        // Map skill execution status to phase skill status
        const statusMap: Record<string, 'pending' | 'in-progress' | 'completed' | 'skipped' | 'failed'> = {
          'pending': 'pending',
          'running': 'in-progress',
          'completed': 'completed',
          'failed': 'failed',
          'skipped': 'skipped',
        };
        skillState.status = statusMap[skillExecution.status] || 'pending';
      }
    }

    execution.updatedAt = new Date();
    await this.saveExecution(execution);

    return fullExecution;
  }

  /**
   * Mark a skill as completed in the current phase
   */
  async completeSkill(
    executionId: string,
    skillId: string,
    result?: {
      deliverables?: string[];
      outcome?: { success: boolean; score: number };
      skipGuarantees?: boolean;  // For testing or manual override
    }
  ): Promise<LoopExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    const phaseState = execution.phases.find(p => p.phase === execution.currentPhase);
    if (!phaseState) {
      throw new Error(`Phase state not found`);
    }

    const skillState = phaseState.skills.find(s => s.skillId === skillId);
    if (!skillState) {
      throw new Error(`Skill not found in current phase: ${skillId}`);
    }

    // ==========================================================================
    // GUARANTEE VALIDATION
    // ==========================================================================
    if (this.guaranteeService && !result?.skipGuarantees) {
      const context: ValidationContext = {
        executionId,
        loopId: execution.loopId,
        skillId,
        phase: execution.currentPhase,
        mode: execution.mode,
        projectPath: this.getProjectPath(execution),
      };

      const guaranteeResult = await this.guaranteeService.validateSkillGuarantees(context);

      if (!guaranteeResult.passed) {
        // Log the blocking guarantees
        this.addExecutionLog(execution, {
          level: 'error',
          category: 'skill',
          phase: execution.currentPhase,
          skillId,
          message: `Skill "${skillId}" blocked by ${guaranteeResult.blocking.length} failed guarantee(s)`,
          details: {
            blocking: guaranteeResult.blocking.map(g => ({
              id: g.guaranteeId,
              name: g.name,
              errors: g.errors,
            })),
          },
        });

        // Block execution
        execution.status = 'blocked';
        execution.updatedAt = new Date();
        await this.saveExecution(execution);

        throw GuaranteeViolationError.fromBlocking({ skillId }, guaranteeResult.blocking);
      }

      // Log any warnings
      if (guaranteeResult.warnings.length > 0) {
        this.addExecutionLog(execution, {
          level: 'warn',
          category: 'skill',
          phase: execution.currentPhase,
          skillId,
          message: `Skill "${skillId}" has ${guaranteeResult.warnings.length} warning(s)`,
          details: {
            warnings: guaranteeResult.warnings.map(g => ({
              id: g.guaranteeId,
              name: g.name,
              errors: g.errors,
            })),
          },
        });
      }
    }
    // ==========================================================================

    skillState.status = 'completed';

    // Record the execution
    const skill = await this.skillRegistry.getSkill(skillId);
    await this.recordSkillExecution(executionId, {
      skillId,
      skillVersion: skill?.version || '1.0.0',
      phase: execution.currentPhase,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      deliverables: result?.deliverables || [],
      referencesRead: [],
      outcome: result?.outcome ? { ...result.outcome, signals: [] } : undefined,
    });

    this.addExecutionLog(execution, {
      level: 'info',
      category: 'skill',
      phase: execution.currentPhase,
      skillId,
      message: `Skill "${skillId}" completed`,
      details: {
        deliverables: result?.deliverables,
        outcome: result?.outcome,
      },
    });

    await this.saveExecution(execution);
    return execution;
  }

  /**
   * Skip a skill
   */
  async skipSkill(
    executionId: string,
    skillId: string,
    reason: string
  ): Promise<LoopExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    const phaseState = execution.phases.find(p => p.phase === execution.currentPhase);
    if (!phaseState) {
      throw new Error(`Phase state not found`);
    }

    const skillState = phaseState.skills.find(s => s.skillId === skillId);
    if (!skillState) {
      throw new Error(`Skill not found in current phase: ${skillId}`);
    }

    skillState.status = 'skipped';
    execution.updatedAt = new Date();

    this.addExecutionLog(execution, {
      level: 'info',
      category: 'skill',
      phase: execution.currentPhase,
      skillId,
      message: `Skill "${skillId}" skipped`,
      details: { reason },
    });

    await this.saveExecution(execution);
    this.log('info', `Skill ${skillId} skipped: ${reason}`);
    return execution;
  }

  // ==========================================================================
  // GATE HANDLING
  // ==========================================================================

  /**
   * Approve a gate
   */
  async approveGate(
    executionId: string,
    gateId: string,
    approvedBy?: string,
    options?: { skipGuarantees?: boolean }
  ): Promise<LoopExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    const gateState = execution.gates.find(g => g.gateId === gateId);
    if (!gateState) {
      throw new Error(`Gate not found: ${gateId}`);
    }

    if (gateState.status === 'approved') {
      return execution; // Already approved
    }

    // ==========================================================================
    // GUARANTEE VALIDATION
    // ==========================================================================
    if (this.guaranteeService && !options?.skipGuarantees) {
      const context: ValidationContext = {
        executionId,
        loopId: execution.loopId,
        skillId: '',  // Gate-level validation
        phase: execution.currentPhase,
        mode: execution.mode,
        projectPath: this.getProjectPath(execution),
      };

      const guaranteeResult = await this.guaranteeService.validateGateGuarantees(
        execution.loopId,
        gateId,
        context
      );

      if (!guaranteeResult.passed) {
        // Log the blocking guarantees
        this.addExecutionLog(execution, {
          level: 'error',
          category: 'gate',
          gateId,
          message: `Gate "${gateId}" blocked by ${guaranteeResult.blocking.length} failed guarantee(s)`,
          details: {
            blocking: guaranteeResult.blocking.map(g => ({
              id: g.guaranteeId,
              name: g.name,
              errors: g.errors,
            })),
          },
        });

        // Do not approve gate
        execution.updatedAt = new Date();
        await this.saveExecution(execution);

        throw GuaranteeViolationError.fromBlocking({ gateId }, guaranteeResult.blocking);
      }
    }
    // ==========================================================================

    gateState.status = 'approved';
    gateState.approvedBy = approvedBy;
    gateState.approvedAt = new Date();
    execution.updatedAt = new Date();

    this.addExecutionLog(execution, {
      level: 'info',
      category: 'gate',
      gateId,
      message: `Gate "${gateId}" approved`,
      details: { approvedBy },
    });

    await this.saveExecution(execution);
    this.log('info', `Gate ${gateId} approved for execution ${executionId}`);
    return execution;
  }

  /**
   * Reject a gate
   */
  async rejectGate(
    executionId: string,
    gateId: string,
    feedback: string
  ): Promise<LoopExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    const gateState = execution.gates.find(g => g.gateId === gateId);
    if (!gateState) {
      throw new Error(`Gate not found: ${gateId}`);
    }

    gateState.status = 'rejected';
    gateState.feedback = feedback;
    execution.updatedAt = new Date();

    // Optionally block execution
    execution.status = 'blocked';

    this.addExecutionLog(execution, {
      level: 'warn',
      category: 'gate',
      gateId,
      message: `Gate "${gateId}" rejected - execution blocked`,
      details: { feedback },
    });

    await this.saveExecution(execution);
    this.log('info', `Gate ${gateId} rejected for execution ${executionId}`);
    return execution;
  }

  // ==========================================================================
  // EXECUTION CONTROL
  // ==========================================================================

  /**
   * Pause an execution
   */
  async pauseExecution(executionId: string): Promise<LoopExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    if (execution.status !== 'active') {
      throw new Error(`Cannot pause: execution is ${execution.status}`);
    }

    execution.status = 'paused';
    execution.updatedAt = new Date();

    await this.saveExecution(execution);
    this.log('info', `Execution ${executionId} paused`);
    return execution;
  }

  /**
   * Resume a paused execution
   */
  async resumeExecution(executionId: string): Promise<LoopExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    if (execution.status !== 'paused' && execution.status !== 'blocked') {
      throw new Error(`Cannot resume: execution is ${execution.status}`);
    }

    execution.status = 'active';
    execution.updatedAt = new Date();

    await this.saveExecution(execution);
    this.log('info', `Execution ${executionId} resumed`);
    return execution;
  }

  /**
   * Abort an execution
   */
  async abortExecution(executionId: string, reason?: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    execution.status = 'failed';
    execution.completedAt = new Date();
    execution.updatedAt = new Date();

    await this.saveExecution(execution);
    this.executions.delete(executionId);

    this.log('info', `Execution ${executionId} aborted: ${reason || 'No reason'}`);
  }

  // ==========================================================================
  // PERSISTENCE
  // ==========================================================================

  private async saveExecution(execution: LoopExecution): Promise<void> {
    const execDir = join(this.options.dataPath, execution.id);
    await mkdir(execDir, { recursive: true });

    const statePath = join(execDir, 'state.json');
    await writeFile(statePath, JSON.stringify(execution, null, 2));
  }

  private toSummary(execution: LoopExecution): ExecutionSummary {
    const completedPhases = execution.phases.filter(
      p => p.status === 'completed'
    ).length;
    const completedSkills = execution.phases.reduce(
      (sum, p) => sum + p.skills.filter(s => s.status === 'completed').length,
      0
    );
    const totalSkills = execution.phases.reduce(
      (sum, p) => sum + p.skills.length,
      0
    );

    return {
      id: execution.id,
      loopId: execution.loopId,
      project: execution.project,
      status: execution.status,
      currentPhase: execution.currentPhase,
      progress: {
        phasesCompleted: completedPhases,
        phasesTotal: execution.phases.length,
        skillsCompleted: completedSkills,
        skillsTotal: totalSkills,
      },
      startedAt: execution.startedAt,
      updatedAt: execution.updatedAt,
    };
  }

  // ==========================================================================
  // EXECUTION LOGGING
  // ==========================================================================

  /**
   * Add a log entry to an execution
   */
  addExecutionLog(
    execution: LoopExecution,
    entry: Omit<ExecutionLogEntry, 'id' | 'timestamp'>
  ): void {
    const logEntry: ExecutionLogEntry = {
      id: randomUUID(),
      timestamp: new Date(),
      ...entry,
    };
    execution.logs.push(logEntry);

    // Also log to console
    this.log(entry.level, `[${execution.id.slice(0, 8)}] ${entry.message}`);
  }

  /**
   * Add log entry by execution ID
   */
  async addLog(
    executionId: string,
    entry: Omit<ExecutionLogEntry, 'id' | 'timestamp'>
  ): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    this.addExecutionLog(execution, entry);
    await this.saveExecution(execution);
  }

  /**
   * Get logs for an execution
   */
  getLogs(executionId: string, options?: {
    level?: ExecutionLogEntry['level'];
    category?: ExecutionLogEntry['category'];
    since?: Date;
    limit?: number;
  }): ExecutionLogEntry[] {
    const execution = this.executions.get(executionId);
    if (!execution) {
      return [];
    }

    let logs = execution.logs || [];

    if (options?.level) {
      logs = logs.filter(l => l.level === options.level);
    }
    if (options?.category) {
      logs = logs.filter(l => l.category === options.category);
    }
    if (options?.since) {
      logs = logs.filter(l => new Date(l.timestamp) > options.since!);
    }
    if (options?.limit) {
      logs = logs.slice(-options.limit);
    }

    return logs;
  }

  private log(level: string, message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'ExecutionEngine',
      message,
    }));
  }
}
