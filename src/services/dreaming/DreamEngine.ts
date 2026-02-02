/**
 * DreamEngine - Background processing for proposing new work
 *
 * Runs during idle periods to analyze the system state and generate
 * proposals for new modules, skill improvements, and pattern captures.
 * Proposals are stored for human review when they return.
 *
 * "The system dreams up new work while idle, ready for review when you return."
 *
 * Part of the dreaming module (Layer 1).
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { randomUUID } from 'crypto';
import type { RoadmapService, LeverageScore } from '../roadmapping/index.js';
import type { ScoringService, ModuleScore } from '../scoring/index.js';
import type { PatternsService } from '../patterns/index.js';
import type { ImprovementOrchestrator } from '../learning/index.js';
import type { AutonomousExecutor } from '../autonomous/index.js';

// ============================================================================
// Types
// ============================================================================

export interface DreamEngineOptions {
  /** Path to store dreaming data */
  dataPath: string;
  /** Minimum idle time before dreaming starts (ms). Default: 60000 (1 min) */
  idleThreshold?: number;
  /** Interval between dreaming cycles when idle (ms). Default: 300000 (5 min) */
  dreamInterval?: number;
  /** Maximum proposals to generate per cycle. Default: 5 */
  maxProposalsPerCycle?: number;
  /** Auto-start dreaming on initialization. Default: false */
  autoStart?: boolean;
}

export type ProposalType = 'new-module' | 'skill-improvement' | 'pattern-capture' | 'blocked-module';
export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'implemented';
export type ProposalSource = 'roadmap-gap' | 'leverage-analysis' | 'scoring' | 'pattern-detection' | 'blocked-analysis';

export interface DreamProposal {
  id: string;
  type: ProposalType;
  title: string;
  description: string;
  target: string;  // moduleId, skillId, or patternId

  reasoning: string;
  evidence: ProposalEvidence[];

  leverage: number;  // 0-10 composite score
  priority: 'high' | 'medium' | 'low';

  status: ProposalStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  implementedAt?: string;
}

export interface ProposalEvidence {
  source: ProposalSource;
  description: string;
  data?: Record<string, unknown>;
}

export interface DreamSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  idleDuration: number;  // How long system was idle before dreaming
  proposalsGenerated: number;
  proposalIds: string[];
  analysisResults: {
    modulesAnalyzed: number;
    patternsChecked: number;
    gapsFound: number;
  };
}

export interface DreamingStatus {
  running: boolean;
  idle: boolean;
  idleSince: string | null;
  lastDreamAt: string | null;
  totalSessions: number;
  pendingProposals: number;
  approvedProposals: number;
  dreamInterval: number;
  idleThreshold: number;
}

export interface DreamingStats {
  totalSessions: number;
  totalProposals: number;
  proposalsByType: Record<ProposalType, number>;
  proposalsByStatus: Record<ProposalStatus, number>;
  approvalRate: number;
  avgProposalsPerSession: number;
  lastSessionAt: string | null;
}

// ============================================================================
// Service
// ============================================================================

export class DreamEngine {
  private roadmapService: RoadmapService | null = null;
  private scoringService: ScoringService | null = null;
  private patternsService: PatternsService | null = null;
  private improvementOrchestrator: ImprovementOrchestrator | null = null;
  private autonomousExecutor: AutonomousExecutor | null = null;

  private proposals: Map<string, DreamProposal> = new Map();
  private sessions: DreamSession[] = [];

  private running = false;
  private idle = false;
  private idleSince: Date | null = null;
  private lastDreamAt: Date | null = null;
  private dreamTimer: ReturnType<typeof setInterval> | null = null;
  private idleCheckTimer: ReturnType<typeof setInterval> | null = null;

  private idleThreshold: number;
  private dreamInterval: number;
  private maxProposalsPerCycle: number;
  private dataPath: string;

  constructor(private options: DreamEngineOptions) {
    this.dataPath = options.dataPath;
    this.idleThreshold = options.idleThreshold || 60000;  // 1 minute
    this.dreamInterval = options.dreamInterval || 300000;  // 5 minutes
    this.maxProposalsPerCycle = options.maxProposalsPerCycle || 5;
  }

  /**
   * Set dependencies (called after construction)
   */
  setDependencies(deps: {
    roadmapService?: RoadmapService;
    scoringService?: ScoringService;
    patternsService?: PatternsService;
    improvementOrchestrator?: ImprovementOrchestrator;
    autonomousExecutor?: AutonomousExecutor;
  }): void {
    this.roadmapService = deps.roadmapService || null;
    this.scoringService = deps.scoringService || null;
    this.patternsService = deps.patternsService || null;
    this.improvementOrchestrator = deps.improvementOrchestrator || null;
    this.autonomousExecutor = deps.autonomousExecutor || null;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    await mkdir(dirname(this.dataPath), { recursive: true });
    await this.loadState();

    if (this.options.autoStart) {
      this.start();
    }
  }

  // --------------------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------------------

  /**
   * Start the dream engine
   */
  start(): void {
    if (this.running) return;

    this.running = true;

    // Start idle detection (check every 10 seconds)
    this.idleCheckTimer = setInterval(() => {
      this.checkIdleState();
    }, 10000);

    this.log('info', 'Dream engine started');
  }

  /**
   * Stop the dream engine
   */
  stop(): void {
    if (!this.running) return;

    this.running = false;
    this.idle = false;
    this.idleSince = null;

    if (this.idleCheckTimer) {
      clearInterval(this.idleCheckTimer);
      this.idleCheckTimer = null;
    }
    if (this.dreamTimer) {
      clearInterval(this.dreamTimer);
      this.dreamTimer = null;
    }

    this.log('info', 'Dream engine stopped');
  }

  /**
   * Get current status
   */
  getStatus(): DreamingStatus {
    return {
      running: this.running,
      idle: this.idle,
      idleSince: this.idleSince?.toISOString() || null,
      lastDreamAt: this.lastDreamAt?.toISOString() || null,
      totalSessions: this.sessions.length,
      pendingProposals: this.countProposalsByStatus('pending'),
      approvedProposals: this.countProposalsByStatus('approved'),
      dreamInterval: this.dreamInterval,
      idleThreshold: this.idleThreshold,
    };
  }

  /**
   * Get dreaming statistics
   */
  getStats(): DreamingStats {
    const proposals = Array.from(this.proposals.values());
    const byType: Record<ProposalType, number> = {
      'new-module': 0,
      'skill-improvement': 0,
      'pattern-capture': 0,
      'blocked-module': 0,
    };
    const byStatus: Record<ProposalStatus, number> = {
      'pending': 0,
      'approved': 0,
      'rejected': 0,
      'implemented': 0,
    };

    for (const p of proposals) {
      byType[p.type]++;
      byStatus[p.status]++;
    }

    const totalReviewed = byStatus.approved + byStatus.rejected;
    const approvalRate = totalReviewed > 0 ? byStatus.approved / totalReviewed : 0;

    return {
      totalSessions: this.sessions.length,
      totalProposals: proposals.length,
      proposalsByType: byType,
      proposalsByStatus: byStatus,
      approvalRate: Math.round(approvalRate * 100) / 100,
      avgProposalsPerSession: this.sessions.length > 0
        ? Math.round(proposals.length / this.sessions.length * 10) / 10
        : 0,
      lastSessionAt: this.sessions.length > 0
        ? this.sessions[this.sessions.length - 1].startedAt
        : null,
    };
  }

  /**
   * Configure the engine
   */
  configure(options: Partial<DreamEngineOptions>): void {
    if (options.idleThreshold !== undefined) {
      this.idleThreshold = options.idleThreshold;
    }
    if (options.dreamInterval !== undefined) {
      this.dreamInterval = options.dreamInterval;
    }
    if (options.maxProposalsPerCycle !== undefined) {
      this.maxProposalsPerCycle = options.maxProposalsPerCycle;
    }
  }

  // --------------------------------------------------------------------------
  // Idle Detection
  // --------------------------------------------------------------------------

  /**
   * Check if system is idle
   */
  private checkIdleState(): void {
    const wasIdle = this.idle;
    const hasActiveWork = this.hasActiveWork();

    if (hasActiveWork) {
      // System is busy
      this.idle = false;
      this.idleSince = null;
      if (this.dreamTimer) {
        clearInterval(this.dreamTimer);
        this.dreamTimer = null;
      }
    } else {
      // System might be idle
      if (!this.idleSince) {
        this.idleSince = new Date();
      }

      const idleDuration = Date.now() - this.idleSince.getTime();
      if (idleDuration >= this.idleThreshold) {
        this.idle = true;

        // Start dreaming if not already
        if (!wasIdle && !this.dreamTimer) {
          this.startDreamingCycle();
        }
      }
    }
  }

  /**
   * Check if there's active work
   */
  private hasActiveWork(): boolean {
    if (this.autonomousExecutor) {
      const executions = this.autonomousExecutor.getAutonomousExecutions();
      return executions.length > 0;
    }
    return false;
  }

  /**
   * Start the dreaming cycle
   */
  private startDreamingCycle(): void {
    // Run first dream immediately
    this.dream().catch(err => {
      this.log('error', `Dream cycle error: ${err.message}`);
    });

    // Then run on interval
    this.dreamTimer = setInterval(() => {
      if (this.idle) {
        this.dream().catch(err => {
          this.log('error', `Dream cycle error: ${err.message}`);
        });
      }
    }, this.dreamInterval);

    this.log('info', 'Dreaming cycle started');
  }

  // --------------------------------------------------------------------------
  // Core Dreaming Logic
  // --------------------------------------------------------------------------

  /**
   * Run a single dream cycle
   */
  async dream(): Promise<DreamSession> {
    const session: DreamSession = {
      id: randomUUID(),
      startedAt: new Date().toISOString(),
      idleDuration: this.idleSince ? Date.now() - this.idleSince.getTime() : 0,
      proposalsGenerated: 0,
      proposalIds: [],
      analysisResults: {
        modulesAnalyzed: 0,
        patternsChecked: 0,
        gapsFound: 0,
      },
    };

    const newProposals: DreamProposal[] = [];

    try {
      // 1. Analyze roadmap for high-leverage modules
      if (this.roadmapService && this.scoringService) {
        const moduleProposals = await this.analyzeModules(session);
        newProposals.push(...moduleProposals);
      }

      // 2. Check for blocked modules
      if (this.scoringService) {
        const blockedProposals = await this.analyzeBlockedModules(session);
        newProposals.push(...blockedProposals);
      }

      // 3. Detect pattern gaps
      if (this.patternsService) {
        const patternProposals = await this.analyzePatternGaps(session);
        newProposals.push(...patternProposals);
      }

      // 4. Check for skill improvements
      if (this.improvementOrchestrator) {
        const skillProposals = await this.analyzeSkillImprovements(session);
        newProposals.push(...skillProposals);
      }

      // Prioritize and limit proposals
      const prioritized = this.prioritizeProposals(newProposals);
      const limited = prioritized.slice(0, this.maxProposalsPerCycle);

      // Store proposals
      for (const proposal of limited) {
        this.proposals.set(proposal.id, proposal);
        session.proposalIds.push(proposal.id);
      }

      session.proposalsGenerated = limited.length;
      session.completedAt = new Date().toISOString();

      this.sessions.push(session);
      this.lastDreamAt = new Date();

      await this.saveState();

      this.log('info', `Dream session ${session.id} completed: ${session.proposalsGenerated} proposals`);

    } catch (err) {
      this.log('error', `Dream session failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    return session;
  }

  /**
   * Manually trigger a dream cycle
   */
  async triggerDream(): Promise<DreamSession> {
    return this.dream();
  }

  // --------------------------------------------------------------------------
  // Analysis Methods
  // --------------------------------------------------------------------------

  /**
   * Analyze modules for high-leverage opportunities
   */
  private async analyzeModules(session: DreamSession): Promise<DreamProposal[]> {
    const proposals: DreamProposal[] = [];

    if (!this.roadmapService || !this.scoringService) return proposals;

    try {
      const leverageScores = this.roadmapService.calculateLeverageScores();
      const moduleScores = await this.scoringService.scoreAllModules();

      session.analysisResults.modulesAnalyzed = moduleScores.length;

      // Find high-leverage modules that aren't started
      for (const leverage of leverageScores.slice(0, 3)) {
        const moduleScore = moduleScores.find(m => m.moduleId === leverage.moduleId);
        if (!moduleScore) continue;

        // Only propose if not already complete or in-progress
        if (moduleScore.status === 'complete' || moduleScore.status === 'in-progress') continue;

        // Check if we already have a pending proposal for this module
        const existingProposal = Array.from(this.proposals.values()).find(
          p => p.target === leverage.moduleId && p.status === 'pending'
        );
        if (existingProposal) continue;

        proposals.push({
          id: randomUUID(),
          type: 'new-module',
          title: `Start module: ${moduleScore.moduleName}`,
          description: `High-leverage module identified for development. Layer ${moduleScore.layer}.`,
          target: leverage.moduleId,
          reasoning: `Dream state alignment: ${leverage.reasoning.dreamStateAlignment.toFixed(1)}, Downstream unlock: ${leverage.reasoning.downstreamUnlock.toFixed(1)}, Likelihood: ${leverage.reasoning.likelihood.toFixed(1)}`,
          evidence: [
            {
              source: 'leverage-analysis',
              description: `Leverage score: ${leverage.score.toFixed(2)}/10`,
              data: { leverageScore: leverage.score, layer: moduleScore.layer },
            },
            {
              source: 'scoring',
              description: `Module score: ${moduleScore.overallScore}/100`,
              data: { moduleScore: moduleScore.overallScore },
            },
          ],
          leverage: leverage.score,
          priority: leverage.score >= 8 ? 'high' : leverage.score >= 6 ? 'medium' : 'low',
          status: 'pending',
          createdAt: new Date().toISOString(),
        });

        session.analysisResults.gapsFound++;
      }
    } catch (err) {
      this.log('warn', `Module analysis failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    return proposals;
  }

  /**
   * Analyze blocked modules
   */
  private async analyzeBlockedModules(session: DreamSession): Promise<DreamProposal[]> {
    const proposals: DreamProposal[] = [];

    if (!this.scoringService) return proposals;

    try {
      const needsAttention = await this.scoringService.getModulesNeedingAttention();

      for (const module of needsAttention) {
        if (module.status !== 'blocked') continue;

        // Check for existing proposal
        const existingProposal = Array.from(this.proposals.values()).find(
          p => p.target === module.moduleId && p.type === 'blocked-module' && p.status === 'pending'
        );
        if (existingProposal) continue;

        proposals.push({
          id: randomUUID(),
          type: 'blocked-module',
          title: `Unblock: ${module.moduleName}`,
          description: `Module is blocked with ${module.blockedByCount} dependencies. Score: ${module.overallScore}/100.`,
          target: module.moduleId,
          reasoning: `Unblocking this module would enable ${module.unlocksCount} downstream modules.`,
          evidence: [
            {
              source: 'blocked-analysis',
              description: `Blocked by ${module.blockedByCount} dependencies`,
              data: { blockedByCount: module.blockedByCount, unlocksCount: module.unlocksCount },
            },
          ],
          leverage: module.unlocksCount * 1.5,  // Higher leverage for modules that unlock many
          priority: module.unlocksCount >= 3 ? 'high' : 'medium',
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      this.log('warn', `Blocked analysis failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    return proposals;
  }

  /**
   * Analyze pattern gaps
   */
  private async analyzePatternGaps(session: DreamSession): Promise<DreamProposal[]> {
    const proposals: DreamProposal[] = [];

    if (!this.patternsService) return proposals;

    try {
      const detectionResult = await this.patternsService.detectPatterns();
      session.analysisResults.patternsChecked = detectionResult.summary.totalDetected;

      for (const gap of detectionResult.gaps) {
        // Check for existing proposal
        const existingProposal = Array.from(this.proposals.values()).find(
          p => p.target === gap.category && p.type === 'pattern-capture' && p.status === 'pending'
        );
        if (existingProposal) continue;

        proposals.push({
          id: randomUUID(),
          type: 'pattern-capture',
          title: `Capture pattern: ${gap.suggestedName}`,
          description: gap.description || `Missing patterns in ${gap.category} category.`,
          target: gap.category,
          reasoning: gap.reasoning,
          evidence: [
            {
              source: 'pattern-detection',
              description: `Gap in ${gap.category} category`,
              data: { category: gap.category, suggestedContext: gap.suggestedContext },
            },
          ],
          leverage: gap.priority === 'high' ? 7 : gap.priority === 'medium' ? 5 : 3,
          priority: gap.priority,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });

        session.analysisResults.gapsFound++;
      }
    } catch (err) {
      this.log('warn', `Pattern analysis failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    return proposals;
  }

  /**
   * Analyze skill improvements
   */
  private async analyzeSkillImprovements(session: DreamSession): Promise<DreamProposal[]> {
    const proposals: DreamProposal[] = [];

    if (!this.improvementOrchestrator) return proposals;

    try {
      const queue = await this.improvementOrchestrator.getImprovementQueue();

      for (const item of queue.slice(0, 3)) {
        // Get target name from the proposal
        const targetName = 'proposal' in item && item.proposal
          ? ('skillId' in item.proposal ? item.proposal.skillId : item.id)
          : item.id;

        // Check for existing proposal
        const existingProposal = Array.from(this.proposals.values()).find(
          p => p.target === targetName && p.type === 'skill-improvement' && p.status === 'pending'
        );
        if (existingProposal) continue;

        // Determine priority based on leverage score
        const priority: 'high' | 'medium' | 'low' =
          item.leverageScore >= 7 ? 'high' :
          item.leverageScore >= 4 ? 'medium' : 'low';

        proposals.push({
          id: randomUUID(),
          type: 'skill-improvement',
          title: `Improve: ${targetName}`,
          description: `${item.type} improvement opportunity detected.`,
          target: targetName,
          reasoning: `Based on execution patterns. Impact: ${item.impact}, Effort: ${item.effort}.`,
          evidence: [
            {
              source: 'scoring',
              description: `Leverage score: ${item.leverageScore.toFixed(2)}`,
              data: { leverageScore: item.leverageScore, impact: item.impact, effort: item.effort },
            },
          ],
          leverage: item.leverageScore,
          priority,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      this.log('warn', `Skill analysis failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    return proposals;
  }

  /**
   * Prioritize proposals using leverage protocol
   */
  private prioritizeProposals(proposals: DreamProposal[]): DreamProposal[] {
    return proposals.sort((a, b) => {
      // Sort by priority first, then by leverage
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.leverage - a.leverage;
    });
  }

  // --------------------------------------------------------------------------
  // Proposal Management
  // --------------------------------------------------------------------------

  /**
   * List all proposals
   */
  listProposals(filter?: {
    status?: ProposalStatus;
    type?: ProposalType;
    limit?: number;
  }): DreamProposal[] {
    let proposals = Array.from(this.proposals.values());

    if (filter?.status) {
      proposals = proposals.filter(p => p.status === filter.status);
    }
    if (filter?.type) {
      proposals = proposals.filter(p => p.type === filter.type);
    }

    // Sort by creation date (newest first)
    proposals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filter?.limit) {
      proposals = proposals.slice(0, filter.limit);
    }

    return proposals;
  }

  /**
   * Get a specific proposal
   */
  getProposal(id: string): DreamProposal | null {
    return this.proposals.get(id) || null;
  }

  /**
   * Approve a proposal
   */
  async approveProposal(id: string, approvedBy?: string): Promise<DreamProposal> {
    const proposal = this.proposals.get(id);
    if (!proposal) {
      throw new Error(`Proposal not found: ${id}`);
    }

    proposal.status = 'approved';
    proposal.reviewedAt = new Date().toISOString();
    proposal.reviewedBy = approvedBy;

    await this.saveState();
    this.log('info', `Proposal ${id} approved`);

    return proposal;
  }

  /**
   * Reject a proposal
   */
  async rejectProposal(id: string, reason: string): Promise<DreamProposal> {
    const proposal = this.proposals.get(id);
    if (!proposal) {
      throw new Error(`Proposal not found: ${id}`);
    }

    proposal.status = 'rejected';
    proposal.reviewedAt = new Date().toISOString();
    proposal.rejectionReason = reason;

    await this.saveState();
    this.log('info', `Proposal ${id} rejected: ${reason}`);

    return proposal;
  }

  /**
   * Mark a proposal as implemented
   */
  async markImplemented(id: string): Promise<DreamProposal> {
    const proposal = this.proposals.get(id);
    if (!proposal) {
      throw new Error(`Proposal not found: ${id}`);
    }

    proposal.status = 'implemented';
    proposal.implementedAt = new Date().toISOString();

    await this.saveState();
    this.log('info', `Proposal ${id} marked as implemented`);

    return proposal;
  }

  /**
   * List dream sessions
   */
  listSessions(limit?: number): DreamSession[] {
    const sessions = [...this.sessions].reverse();  // Newest first
    return limit ? sessions.slice(0, limit) : sessions;
  }

  // --------------------------------------------------------------------------
  // Persistence
  // --------------------------------------------------------------------------

  private async loadState(): Promise<void> {
    try {
      const content = await readFile(this.dataPath, 'utf-8');
      const data = JSON.parse(content);

      if (data.proposals) {
        this.proposals = new Map(Object.entries(data.proposals));
      }
      if (data.sessions) {
        this.sessions = data.sessions;
      }
    } catch {
      // No existing state
      this.proposals = new Map();
      this.sessions = [];
    }
  }

  private async saveState(): Promise<void> {
    const data = {
      proposals: Object.fromEntries(this.proposals),
      sessions: this.sessions,
      savedAt: new Date().toISOString(),
    };

    await mkdir(dirname(this.dataPath), { recursive: true });
    await writeFile(this.dataPath, JSON.stringify(data, null, 2));
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  private countProposalsByStatus(status: ProposalStatus): number {
    return Array.from(this.proposals.values()).filter(p => p.status === status).length;
  }

  private log(level: 'info' | 'warn' | 'error', message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'DreamEngine',
      message,
    }));
  }
}
