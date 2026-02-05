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
import type { CoherenceService, CoherenceReport } from './coherence/index.js';
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
  private coherenceService: CoherenceService | null = null;

  // Track coherence baselines per execution for delta comparison
  private coherenceBaselines: Map<string, CoherenceReport> = new Map();

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
   * Set the CoherenceService for alignment validation
   */
  setCoherenceService(service: CoherenceService): void {
    this.coherenceService = service;
    this.log('info', 'CoherenceService attached to ExecutionEngine');
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
   * Initialize by loading only active/paused executions
   * Completed/failed executions are archived and not loaded into memory
   */
  async initialize(): Promise<void> {
    await mkdir(this.options.dataPath, { recursive: true });

    // Ensure archive directory exists
    const archivePath = join(this.options.dataPath, '..', 'archived-executions');
    await mkdir(archivePath, { recursive: true });

    try {
      const entries = await readdir(this.options.dataPath, { withFileTypes: true });
      let loadedCount = 0;
      let archivedCount = 0;

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const statePath = join(this.options.dataPath, entry.name, 'state.json');
        try {
          const content = await readFile(statePath, 'utf-8');
          const execution = JSON.parse(content) as LoopExecution;

          // Only load active or paused executions into memory
          // Archive completed/failed executions on startup
          if (execution.status === 'completed' || execution.status === 'failed') {
            await this.archiveExecution(execution.id, execution);
            archivedCount++;
            continue;
          }

          // Restore dates
          execution.startedAt = new Date(execution.startedAt);
          execution.updatedAt = new Date(execution.updatedAt);
          if (execution.completedAt) {
            execution.completedAt = new Date(execution.completedAt);
          }

          this.executions.set(execution.id, execution);
          loadedCount++;
        } catch {
          // Invalid or missing state file
        }
      }

      this.log('info', `Loaded ${loadedCount} active executions (archived ${archivedCount} completed/failed)`);
    } catch (error) {
      this.log('warn', `Failed to load executions: ${error}`);
    }
  }

  /**
   * Archive a completed/failed execution by moving its state to archived-executions
   */
  private async archiveExecution(executionId: string, execution?: LoopExecution): Promise<void> {
    const sourcePath = join(this.options.dataPath, executionId);
    const archivePath = join(this.options.dataPath, '..', 'archived-executions', executionId);

    try {
      // If execution provided, save final state first
      if (execution) {
        await this.saveExecution(execution);
      }

      // Move directory to archive
      await mkdir(archivePath, { recursive: true });
      const statePath = join(sourcePath, 'state.json');
      const archiveStatePath = join(archivePath, 'state.json');

      // Copy state file to archive
      const stateContent = await readFile(statePath, 'utf-8');
      const { writeFile } = await import('fs/promises');
      await writeFile(archiveStatePath, stateContent);

      // Remove from active directory
      const { rm } = await import('fs/promises');
      await rm(sourcePath, { recursive: true, force: true });

      // Remove from memory
      this.executions.delete(executionId);

      this.log('info', `Archived execution ${executionId}`);
    } catch (err) {
      this.log('warn', `Failed to archive execution ${executionId}: ${err}`);
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
      // Initialize transient state directories
      await this.deliverableManager.initializeTransient(id);
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

    // Capture coherence baseline for delta comparison at loop completion
    if (this.coherenceService) {
      try {
        const baseline = await this.coherenceService.runValidation();
        this.coherenceBaselines.set(id, baseline);
        this.log('info', `Captured coherence baseline for ${id} (score: ${baseline.overallScore})`);
      } catch (err) {
        this.log('warn', `Failed to capture coherence baseline: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

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
      // Gate blocks if: exists AND is required AND not approved AND is enabled
      const gateEnabled = gateState?.enabled !== false;
      if (gateState && gateState.status !== 'approved' && gate.required && gateEnabled) {
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

      // Auto-sync roadmap: mark module as complete if it matches
      if (this.roadmapService) {
        try {
          const moduleId = execution.project;
          const updated = await this.roadmapService.markModuleCompleteByName(moduleId);
          if (updated) {
            this.log('info', `Roadmap synced: marked module "${updated.id}" as complete`);
            this.addExecutionLog(execution, {
              level: 'info',
              category: 'system',
              message: `Roadmap auto-synced: ${updated.name} marked complete`,
              details: { moduleId: updated.id, moduleName: updated.name },
            });
          }
        } catch (err) {
          this.log('warn', `Failed to auto-sync roadmap: ${err}`);
        }
      }

      // Per-loop coherence check: compare final state to baseline
      if (this.coherenceService) {
        try {
          const baseline = this.coherenceBaselines.get(executionId);
          const finalReport = await this.coherenceService.runValidation();

          const delta = baseline ? finalReport.overallScore - baseline.overallScore : 0;
          const deltaStr = delta >= 0 ? `+${delta}` : `${delta}`;

          this.addExecutionLog(execution, {
            level: delta < 0 ? 'warn' : 'info',
            category: 'system',
            message: `Loop coherence delta: ${deltaStr} (${baseline?.overallScore || 'N/A'} → ${finalReport.overallScore})`,
            details: {
              baselineScore: baseline?.overallScore,
              finalScore: finalReport.overallScore,
              delta,
              criticalIssues: finalReport.criticalIssues,
              warnings: finalReport.warnings,
            },
          });

          // Notify coherence delta
          if (this.messagingService) {
            await this.messagingService.notify({
              type: 'coherence_check',
              checkType: 'loop',
              score: finalReport.overallScore,
              criticalIssues: finalReport.criticalIssues,
              warnings: finalReport.warnings,
              baselineScore: baseline?.overallScore,
              executionId,
              loopId: execution.loopId,
            });
          }

          // Clean up baseline
          this.coherenceBaselines.delete(executionId);
        } catch (err) {
          this.log('warn', `Loop coherence check failed: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      // Clean up transient state on completion
      if (this.deliverableManager) {
        try {
          const { deletedCount } = await this.deliverableManager.cleanupTransient({
            executionId,
            scratchOnly: false, // Clean all transient files
          });
          if (deletedCount > 0) {
            this.log('info', `Cleaned up ${deletedCount} transient files for ${executionId}`);
          }
        } catch (err) {
          this.log('warn', `Failed to clean up transient state: ${err}`);
        }

        // Archive old runs (keep last 10)
        try {
          const archived = await this.deliverableManager.archiveOldRuns(10);
          if (archived.length > 0) {
            this.log('info', `Archived ${archived.length} old runs (keeping last 10)`);
          }
        } catch (err) {
          this.log('warn', `Failed to archive old runs: ${err}`);
        }
      }

      this.log('info', `Execution ${executionId} completed`);

      // Archive completed execution (move to archived-executions, remove from memory)
      await this.archiveExecution(executionId, execution);

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

    // Send phase start notification to Slack thread
    if (this.messagingService) {
      try {
        await this.messagingService.notifyPhaseStart(
          executionId,
          execution.loopId,
          nextPhase.name,
          currentIndex + 2, // 1-indexed for display
          loop.phases.length,
          nextPhase.skills.map(s => s.skillId)
        );
      } catch (err) {
        this.log('warn', `Failed to send phase start notification: ${err}`);
      }
    }

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

    // Count completed skills for the notification
    const completedSkillsCount = phaseState.skills.filter(
      s => s.status === 'completed'
    ).length;

    // Check if there's a gate after this phase and send notification
    const loop = this.loopComposer.getLoop(execution.loopId);
    if (loop && this.messagingService) {
      const gate = loop.gates.find(g => g.afterPhase === execution.currentPhase);

      // Send phase complete notification
      try {
        await this.messagingService.notifyPhaseComplete(
          executionId,
          execution.loopId,
          execution.currentPhase,
          completedSkillsCount,
          !!gate,
          gate?.id
        );
      } catch (err) {
        this.log('warn', `Failed to send phase complete notification: ${err}`);
      }

      if (gate) {
        const gateState = execution.gates.find(g => g.gateId === gate.id);
        if (gateState && gateState.status === 'pending') {
          // Collect deliverables from this phase
          const phaseDeliverables = execution.skillExecutions
            .filter(s => s.phase === execution.currentPhase)
            .flatMap(s => s.deliverables || [])
            .filter(Boolean);

          try {
            await this.messagingService.notifyGateWaiting(
              gate.id,
              executionId,
              execution.loopId,
              execution.currentPhase,
              phaseDeliverables,
              gate.approvalType || 'human'
            );
            this.log('info', `Gate notification sent for ${gate.id}`);
          } catch (err) {
            this.log('warn', `Failed to send gate notification: ${err}`);
          }
        }
      }
    }

    // Auto-complete execution if this is the last phase
    if (loop) {
      const currentIndex = loop.phases.findIndex(p => p.name === execution.currentPhase);
      const isLastPhase = currentIndex >= loop.phases.length - 1;

      if (isLastPhase) {
        // Check if there's a gate that needs approval first
        const gate = loop.gates.find(g => g.afterPhase === execution.currentPhase);
        const gateState = gate ? execution.gates.find(g => g.gateId === gate.id) : null;
        const gateBlocking = gate && gate.required && gateState?.status !== 'approved' && gateState?.enabled !== false;

        if (!gateBlocking) {
          // Mark execution as completed
          execution.status = 'completed';
          execution.completedAt = new Date();

          this.addExecutionLog(execution, {
            level: 'info',
            category: 'system',
            message: `Loop execution completed (auto-completed on last phase)`,
            details: {
              totalPhases: loop.phases.length,
              totalDurationMs: execution.completedAt.getTime() - execution.startedAt.getTime(),
            },
          });

          // Send loop complete notification
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

          // Auto-sync roadmap
          if (this.roadmapService) {
            try {
              const moduleId = execution.project;
              const updated = await this.roadmapService.markModuleCompleteByName(moduleId);
              if (updated) {
                this.log('info', `Roadmap synced: marked module "${updated.id}" as complete`);
              }
            } catch {
              // Ignore roadmap sync errors
            }
          }

          // Archive completed execution (move to archived-executions, remove from memory)
          await this.saveExecution(execution);
          await this.archiveExecution(executionId, execution);
          return execution;
        }
      }
    }

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

    // Send skill complete notification to Slack thread
    if (this.messagingService) {
      try {
        await this.messagingService.notifySkillComplete(
          executionId,
          execution.loopId,
          execution.currentPhase,
          skillId,
          result?.deliverables
        );
      } catch (err) {
        this.log('warn', `Failed to send skill complete notification: ${err}`);
      }
    }

    await this.saveExecution(execution);
    return execution;
  }

  /**
   * Resolve a guarantee by acknowledging it was satisfied through alternative means.
   * This allows skill completion to proceed even when the formal guarantee check would fail.
   *
   * Use this when:
   * - The deliverable/artifact exists but in a different location
   * - The guarantee intent was satisfied through different means
   * - The guarantee is not applicable for this specific case
   *
   * @param executionId - The execution ID
   * @param skillId - The skill ID (optional - will auto-discover from guarantee ID if not provided)
   * @param guaranteeId - The guarantee ID to resolve
   * @param resolutionType - How the guarantee was satisfied
   * @param evidence - Explanation of how the guarantee was satisfied
   */
  async resolveGuarantee(
    executionId: string,
    skillId: string | undefined,
    guaranteeId: string,
    resolutionType: 'satisfied_alternatively' | 'acceptable_deviation' | 'waived_with_reason',
    evidence: string
  ): Promise<{ success: boolean; message: string; acknowledgment?: unknown; skillId?: string }> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    if (!this.guaranteeService) {
      throw new Error('GuaranteeService not available');
    }

    // Auto-discover skill ID if not provided
    let resolvedSkillId = skillId;
    if (!resolvedSkillId) {
      const discoveredSkillId = this.guaranteeService.findGuaranteeOwner(guaranteeId);
      if (!discoveredSkillId) {
        throw new Error(`Could not find skill that owns guarantee "${guaranteeId}". Please provide skillId explicitly.`);
      }
      resolvedSkillId = discoveredSkillId;
      this.log('info', `Auto-discovered skill "${resolvedSkillId}" for guarantee "${guaranteeId}"`);
    }

    // Acknowledge the guarantee
    const acknowledgment = this.guaranteeService.acknowledgeGuarantee(
      executionId,
      resolvedSkillId,
      guaranteeId,
      resolutionType,
      evidence
    );

    // If execution was blocked, check if we can unblock it
    if (execution.status === 'blocked') {
      execution.status = 'active';
      this.log('info', `Execution ${executionId} unblocked after guarantee resolution`);
    }

    // Log the resolution
    this.addExecutionLog(execution, {
      level: 'info',
      category: 'skill',
      phase: execution.currentPhase,
      skillId: resolvedSkillId,
      message: `Guarantee "${guaranteeId}" resolved: ${resolutionType}`,
      details: {
        guaranteeId,
        resolutionType,
        evidence,
      },
    });

    execution.updatedAt = new Date();
    await this.saveExecution(execution);

    this.log('info', `Guarantee ${guaranteeId} resolved for skill ${resolvedSkillId}: ${resolutionType}`);
    return {
      success: true,
      message: `Guarantee "${guaranteeId}" acknowledged as ${resolutionType}. You can now retry completing the skill or approving the gate.`,
      acknowledgment,
      skillId: resolvedSkillId,
    };
  }

  /**
   * Revalidate guarantees for a skill without completing it.
   * Useful to check what's still failing before retrying.
   */
  async revalidateGuarantees(
    executionId: string,
    skillId: string
  ): Promise<{
    passed: boolean;
    blocking: Array<{ guaranteeId: string; name: string; errors: string[] }>;
    warnings: Array<{ guaranteeId: string; name: string; errors: string[] }>;
    acknowledged: Array<{ guaranteeId: string; resolutionType: string }>;
    message: string;
  }> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    if (!this.guaranteeService) {
      return {
        passed: true,
        blocking: [],
        warnings: [],
        acknowledged: [],
        message: 'Guarantee service not available - validation skipped',
      };
    }

    const context: ValidationContext = {
      executionId,
      loopId: execution.loopId,
      skillId,
      phase: execution.currentPhase,
      mode: execution.mode,
      projectPath: this.getProjectPath(execution),
    };

    const result = await this.guaranteeService.validateSkillGuarantees(context);

    // Get acknowledged guarantees for this skill
    const acknowledged = this.guaranteeService.getSkillAcknowledgments(executionId, skillId)
      .map(ack => ({
        guaranteeId: ack.guaranteeId,
        resolutionType: ack.resolutionType,
      }));

    const blocking = result.blocking.map(g => ({
      guaranteeId: g.guaranteeId,
      name: g.name,
      errors: g.errors,
    }));

    const warnings = result.warnings.map(g => ({
      guaranteeId: g.guaranteeId,
      name: g.name,
      errors: g.errors,
    }));

    let message: string;
    if (result.passed) {
      message = `All guarantees pass for skill "${skillId}". You can now complete the skill.`;
    } else {
      message = `${blocking.length} guarantee(s) still failing for skill "${skillId}". Fix the issues or acknowledge the guarantees.`;
    }

    this.log('info', `Revalidated guarantees for ${skillId}: ${result.passed ? 'PASSED' : 'BLOCKED'}`);
    return {
      passed: result.passed,
      blocking,
      warnings,
      acknowledged,
      message,
    };
  }

  /**
   * Retry completing a skill after fixing deliverables.
   * Convenience method that unblocks and reattempts completion.
   */
  async retrySkillCompletion(
    executionId: string,
    skillId: string,
    result?: {
      deliverables?: string[];
      outcome?: { success: boolean; score: number };
    }
  ): Promise<LoopExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    // If blocked, resume first
    if (execution.status === 'blocked') {
      this.log('info', `Resuming blocked execution ${executionId} for retry`);
      execution.status = 'active';
      execution.updatedAt = new Date();
      await this.saveExecution(execution);
    }

    // Attempt to complete the skill
    return this.completeSkill(executionId, skillId, result);
  }

  /**
   * Reset a skill back to pending status.
   * Use when you need to re-execute a skill from scratch (not just retry completion).
   * Clears any previous acknowledgments for this skill.
   */
  async resetSkill(
    executionId: string,
    skillId: string,
    options?: { clearAcknowledgments?: boolean }
  ): Promise<LoopExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    const skillExec = execution.skillExecutions.find(s => s.skillId === skillId);
    if (!skillExec) {
      throw new Error(`Skill "${skillId}" not found in execution`);
    }

    // Reset the skill execution
    skillExec.status = 'pending';
    skillExec.completedAt = undefined;
    skillExec.deliverables = [];
    skillExec.outcome = undefined;

    // Clear acknowledgments if requested (default: true)
    const shouldClearAcks = options?.clearAcknowledgments !== false;
    if (shouldClearAcks && this.guaranteeService) {
      this.guaranteeService.clearSkillAcknowledgments(executionId, skillId);
    }

    // Update phase status if needed (reset to in-progress since skill is now pending)
    const phaseState = execution.phases.find(p => p.phase === execution.currentPhase);
    if (phaseState && phaseState.status === 'completed') {
      phaseState.status = 'in-progress';
      phaseState.completedAt = undefined;
    }

    // Also reset the skill status in the phase's skills array
    if (phaseState) {
      const phaseSkill = phaseState.skills.find(s => s.skillId === skillId);
      if (phaseSkill) {
        phaseSkill.status = 'pending';
      }
    }

    // Resume if blocked
    if (execution.status === 'blocked') {
      execution.status = 'active';
    }

    this.addExecutionLog(execution, {
      level: 'info',
      category: 'skill',
      phase: execution.currentPhase,
      skillId,
      message: `Skill "${skillId}" reset to pending`,
      details: { clearAcknowledgments: shouldClearAcks },
    });

    execution.updatedAt = new Date();
    await this.saveExecution(execution);

    this.log('info', `Skill ${skillId} reset to pending for execution ${executionId}`);
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

    // ==========================================================================
    // COHERENCE VALIDATION (synergizes with guarantees)
    // ==========================================================================
    if (this.coherenceService && !options?.skipGuarantees) {
      try {
        const coherenceReport = await this.coherenceService.runValidation();

        // Log coherence status with gate
        this.addExecutionLog(execution, {
          level: coherenceReport.criticalIssues > 0 ? 'warn' : 'info',
          category: 'gate',
          gateId,
          message: `Coherence check at gate "${gateId}": score ${coherenceReport.overallScore}/100`,
          details: {
            score: coherenceReport.overallScore,
            criticalIssues: coherenceReport.criticalIssues,
            warnings: coherenceReport.warnings,
            domains: coherenceReport.domainValidations.map(d => ({
              domain: d.domain,
              score: d.score,
              issues: d.issueCount,
            })),
          },
        });

        // Notify on coherence issues (but don't block - guarantees are the hard gate)
        if (coherenceReport.criticalIssues > 0 && this.messagingService) {
          await this.messagingService.notify({
            type: 'coherence_check',
            checkType: 'phase',
            score: coherenceReport.overallScore,
            criticalIssues: coherenceReport.criticalIssues,
            warnings: coherenceReport.warnings,
            executionId,
            loopId: execution.loopId,
            phase: execution.currentPhase,
          });
        }
      } catch (err) {
        // Coherence validation is advisory - don't block on errors
        this.log('warn', `Coherence validation failed at gate: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    // ==========================================================================

    gateState.status = 'approved';
    gateState.approvedBy = approvedBy;
    gateState.approvedAt = new Date();
    execution.updatedAt = new Date();

    // Resume execution if it was blocked (gate approval unblocks)
    if (execution.status === 'blocked') {
      execution.status = 'active';
      this.addExecutionLog(execution, {
        level: 'info',
        category: 'system',
        message: 'Execution unblocked by gate approval',
        details: { gateId },
      });
    }

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

  /**
   * Pre-check gate guarantees without approving
   * Returns status of all guarantees for the gate
   */
  async getGateGuaranteeStatus(
    executionId: string,
    gateId: string
  ): Promise<{
    total: number;
    passed: number;
    failed: number;
    canApprove: boolean;
    blocking?: Array<{
      id: string;
      name: string;
      passed: boolean;
      errors?: string[];
    }>;
  }> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      return { total: 0, passed: 0, failed: 0, canApprove: true };
    }

    if (!this.guaranteeService) {
      return { total: 0, passed: 0, failed: 0, canApprove: true };
    }

    const context: ValidationContext = {
      executionId,
      loopId: execution.loopId,
      skillId: '',  // Gate-level validation
      phase: execution.currentPhase,
      mode: execution.mode,
      projectPath: this.getProjectPath(execution),
    };

    const result = await this.guaranteeService.validateGateGuarantees(
      execution.loopId,
      gateId,
      context
    );

    const blocking = result.blocking.map(g => ({
      id: g.guaranteeId,
      name: g.name,
      passed: false,
      errors: g.errors,
    }));

    return {
      total: result.results.length,
      passed: result.results.filter(r => r.passed).length,
      failed: result.blocking.length,
      canApprove: result.passed,
      blocking: blocking.length > 0 ? blocking : undefined,
    };
  }

  // ==========================================================================
  // GATE CRUD OPERATIONS
  // ==========================================================================

  /**
   * List all gates for an execution with their current state
   */
  async listGates(executionId: string): Promise<Array<{
    gateId: string;
    name: string;
    afterPhase: Phase;
    status: 'pending' | 'approved' | 'rejected';
    enabled: boolean;
    approvalType: 'human' | 'auto' | 'conditional';
    approvalTypeOverride?: 'human' | 'auto' | 'conditional';
    required: boolean;
  }>> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    const loop = await this.loopComposer.getLoop(execution.loopId);
    if (!loop) {
      return execution.gates.map(gs => ({
        gateId: gs.gateId,
        name: gs.gateId,
        afterPhase: 'INIT' as Phase,
        status: gs.status,
        enabled: gs.enabled !== false,
        approvalType: gs.approvalTypeOverride || 'human',
        approvalTypeOverride: gs.approvalTypeOverride,
        required: true,
      }));
    }

    return execution.gates.map(gs => {
      const gateDef = loop.gates.find(g => g.id === gs.gateId);
      return {
        gateId: gs.gateId,
        name: gateDef?.name || gs.gateId,
        afterPhase: gateDef?.afterPhase || ('INIT' as Phase),
        status: gs.status,
        enabled: gs.enabled !== false,
        approvalType: gs.approvalTypeOverride || gateDef?.approvalType || 'human',
        approvalTypeOverride: gs.approvalTypeOverride,
        required: gateDef?.required ?? true,
      };
    });
  }

  /**
   * Update a gate's properties (enable/disable, change approval type)
   */
  async updateGate(
    executionId: string,
    gateId: string,
    updates: {
      enabled?: boolean;
      approvalTypeOverride?: 'human' | 'auto' | 'conditional' | null;
    }
  ): Promise<{ success: boolean; message: string; gate: unknown }> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    const gateState = execution.gates.find(g => g.gateId === gateId);
    if (!gateState) {
      throw new Error(`Gate not found: ${gateId}`);
    }

    // Apply updates
    if (updates.enabled !== undefined) {
      gateState.enabled = updates.enabled;
    }
    if (updates.approvalTypeOverride !== undefined) {
      if (updates.approvalTypeOverride === null) {
        delete gateState.approvalTypeOverride;
      } else {
        gateState.approvalTypeOverride = updates.approvalTypeOverride;
      }
    }

    execution.updatedAt = new Date();

    this.addExecutionLog(execution, {
      level: 'info',
      category: 'gate',
      gateId,
      message: `Gate "${gateId}" updated`,
      details: updates,
    });

    await this.saveExecution(execution);
    this.log('info', `Gate ${gateId} updated for execution ${executionId}`);

    return {
      success: true,
      message: `Gate "${gateId}" updated`,
      gate: gateState,
    };
  }

  /**
   * Disable all gates for an execution (useful for mobile/async work)
   */
  async disableAllGates(executionId: string): Promise<{
    success: boolean;
    message: string;
    disabledCount: number;
  }> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    let count = 0;
    for (const gateState of execution.gates) {
      if (gateState.enabled !== false) {
        gateState.enabled = false;
        count++;
      }
    }

    execution.updatedAt = new Date();

    this.addExecutionLog(execution, {
      level: 'info',
      category: 'system',
      message: `All gates disabled (${count} gates)`,
    });

    await this.saveExecution(execution);
    this.log('info', `All gates disabled for execution ${executionId}`);

    return {
      success: true,
      message: `Disabled ${count} gate(s)`,
      disabledCount: count,
    };
  }

  /**
   * Enable all gates for an execution (restore normal operation)
   */
  async enableAllGates(executionId: string): Promise<{
    success: boolean;
    message: string;
    enabledCount: number;
  }> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    let count = 0;
    for (const gateState of execution.gates) {
      if (gateState.enabled === false) {
        gateState.enabled = true;
        count++;
      }
    }

    execution.updatedAt = new Date();

    this.addExecutionLog(execution, {
      level: 'info',
      category: 'system',
      message: `All gates enabled (${count} gates)`,
    });

    await this.saveExecution(execution);
    this.log('info', `All gates enabled for execution ${executionId}`);

    return {
      success: true,
      message: `Enabled ${count} gate(s)`,
      enabledCount: count,
    };
  }

  /**
   * Set all gates to auto-approve (for autonomous operation)
   */
  async setAllGatesAuto(executionId: string): Promise<{
    success: boolean;
    message: string;
    updatedCount: number;
  }> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    let count = 0;
    for (const gateState of execution.gates) {
      if (gateState.approvalTypeOverride !== 'auto') {
        gateState.approvalTypeOverride = 'auto';
        count++;
      }
    }

    execution.updatedAt = new Date();

    this.addExecutionLog(execution, {
      level: 'info',
      category: 'system',
      message: `All gates set to auto-approve (${count} gates)`,
    });

    await this.saveExecution(execution);
    this.log('info', `All gates set to auto for execution ${executionId}`);

    return {
      success: true,
      message: `Set ${count} gate(s) to auto-approve`,
      updatedCount: count,
    };
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

    // Clean up transient state on abort
    if (this.deliverableManager) {
      try {
        await this.deliverableManager.cleanupTransient({
          executionId,
          scratchOnly: false,
        });
      } catch (err) {
        this.log('warn', `Failed to clean up transient state on abort: ${err}`);
      }
    }

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
