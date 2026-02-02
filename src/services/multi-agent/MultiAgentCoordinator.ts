/**
 * Multi-Agent Worktree Coordinator
 *
 * Coordinates multiple collaborators, each with their own agent sets,
 * working in parallel on isolated git worktrees.
 *
 * Key responsibilities:
 * - Collaborator registration and tracking
 * - Resource reservation (modules, files) to prevent conflicts
 * - Merge queue coordination
 * - Cross-collaborator visibility
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { AgentManager } from '../orchestration/AgentManager.js';
import type { WorktreeManager, Worktree } from '../orchestration/WorktreeManager.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Collaborator {
  id: string;
  name: string;
  email?: string;
  agentSetIds: string[];
  reservations: string[]; // reservation IDs
  connectedAt: Date;
  lastActive: Date;
  status: 'active' | 'idle' | 'disconnected';
}

export interface AgentSet {
  id: string;
  collaboratorId: string;
  name: string;
  agentIds: string[];
  worktreeModuleIds: string[];
  createdAt: Date;
  status: 'active' | 'paused' | 'completed';
}

export type ReservationType = 'module' | 'file' | 'path-pattern';

export interface Reservation {
  id: string;
  collaboratorId: string;
  agentSetId?: string;
  type: ReservationType;
  target: string; // module ID, file path, or glob pattern
  reason: string;
  exclusive: boolean; // true = no others can claim; false = shared read
  createdAt: Date;
  expiresAt?: Date;
}

export type MergeRequestStatus =
  | 'pending'
  | 'checking'
  | 'approved'
  | 'merging'
  | 'merged'
  | 'conflict'
  | 'rejected';

export interface MergeRequest {
  id: string;
  collaboratorId: string;
  agentSetId: string;
  moduleId: string;
  branchName: string;
  status: MergeRequestStatus;
  conflictsWith?: string[]; // other merge request IDs or branch names
  conflictDetails?: string;
  queuePosition?: number;
  createdAt: Date;
  checkedAt?: Date;
  mergedAt?: Date;
  rejectedReason?: string;
}

export interface ConflictCheck {
  hasConflict: boolean;
  conflictingReservations: Reservation[];
  conflictingMergeRequests: MergeRequest[];
  conflictingFiles: string[];
}

export interface CoordinatorStatus {
  collaborators: {
    total: number;
    active: number;
    idle: number;
  };
  agentSets: {
    total: number;
    active: number;
    paused: number;
  };
  reservations: {
    total: number;
    byType: Record<ReservationType, number>;
    exclusive: number;
  };
  mergeQueue: {
    pending: number;
    checking: number;
    approved: number;
    merging: number;
  };
  worktrees: {
    total: number;
    active: number;
  };
}

export interface CoordinatorOptions {
  dataPath: string;
  systemPath: string;
  reservationTimeoutMs?: number; // default 1 hour
  mergeCheckIntervalMs?: number; // default 30 seconds
}

export interface CoordinatorEvent {
  id: string;
  type: string;
  collaboratorId?: string;
  agentSetId?: string;
  moduleId?: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// MultiAgentCoordinator
// ─────────────────────────────────────────────────────────────────────────────

export class MultiAgentCoordinator extends EventEmitter {
  private dataPath: string;
  private systemPath: string;
  private reservationTimeoutMs: number;
  private mergeCheckIntervalMs: number;

  private collaborators: Map<string, Collaborator> = new Map();
  private agentSets: Map<string, AgentSet> = new Map();
  private reservations: Map<string, Reservation> = new Map();
  private mergeQueue: Map<string, MergeRequest> = new Map();
  private eventLog: CoordinatorEvent[] = [];

  private agentManager?: AgentManager;
  private worktreeManager?: WorktreeManager;

  private mergeCheckInterval?: NodeJS.Timeout;
  private reservationCleanupInterval?: NodeJS.Timeout;

  constructor(options: CoordinatorOptions) {
    super();
    this.dataPath = options.dataPath;
    this.systemPath = options.systemPath;
    this.reservationTimeoutMs = options.reservationTimeoutMs ?? 3600000; // 1 hour
    this.mergeCheckIntervalMs = options.mergeCheckIntervalMs ?? 30000; // 30 seconds
  }

  /**
   * Set dependencies
   */
  setDependencies(deps: {
    agentManager?: AgentManager;
    worktreeManager?: WorktreeManager;
  }): void {
    this.agentManager = deps.agentManager;
    this.worktreeManager = deps.worktreeManager;
  }

  /**
   * Initialize the coordinator
   */
  async initialize(): Promise<void> {
    // Ensure data directory exists
    await fs.mkdir(path.dirname(this.dataPath), { recursive: true });

    // Load persisted state
    await this.loadState();

    // Start background tasks
    this.startMergeCheckLoop();
    this.startReservationCleanup();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Collaborator Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Register a new collaborator
   */
  registerCollaborator(name: string, email?: string): Collaborator {
    const id = randomUUID();
    const collaborator: Collaborator = {
      id,
      name,
      email,
      agentSetIds: [],
      reservations: [],
      connectedAt: new Date(),
      lastActive: new Date(),
      status: 'active',
    };

    this.collaborators.set(id, collaborator);
    this.emitEvent('collaborator:registered', { collaboratorId: id, name });
    this.persistState();

    return collaborator;
  }

  /**
   * Get a collaborator by ID
   */
  getCollaborator(id: string): Collaborator | undefined {
    return this.collaborators.get(id);
  }

  /**
   * List all collaborators
   */
  listCollaborators(): Collaborator[] {
    return Array.from(this.collaborators.values());
  }

  /**
   * Update collaborator activity
   */
  touchCollaborator(id: string): void {
    const collaborator = this.collaborators.get(id);
    if (collaborator) {
      collaborator.lastActive = new Date();
      collaborator.status = 'active';
    }
  }

  /**
   * Disconnect a collaborator
   */
  disconnectCollaborator(id: string): void {
    const collaborator = this.collaborators.get(id);
    if (collaborator) {
      collaborator.status = 'disconnected';
      this.emitEvent('collaborator:disconnected', { collaboratorId: id });
      this.persistState();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Agent Set Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create an agent set for a collaborator
   */
  createAgentSet(collaboratorId: string, name: string): AgentSet {
    const collaborator = this.collaborators.get(collaboratorId);
    if (!collaborator) {
      throw new Error(`Collaborator not found: ${collaboratorId}`);
    }

    const id = randomUUID();
    const agentSet: AgentSet = {
      id,
      collaboratorId,
      name,
      agentIds: [],
      worktreeModuleIds: [],
      createdAt: new Date(),
      status: 'active',
    };

    this.agentSets.set(id, agentSet);
    collaborator.agentSetIds.push(id);

    this.emitEvent('agentSet:created', { collaboratorId, agentSetId: id, name });
    this.persistState();

    return agentSet;
  }

  /**
   * Get an agent set by ID
   */
  getAgentSet(id: string): AgentSet | undefined {
    return this.agentSets.get(id);
  }

  /**
   * List agent sets for a collaborator
   */
  listAgentSets(collaboratorId?: string): AgentSet[] {
    const sets = Array.from(this.agentSets.values());
    if (collaboratorId) {
      return sets.filter(s => s.collaboratorId === collaboratorId);
    }
    return sets;
  }

  /**
   * Add an agent to a set
   */
  addAgentToSet(agentSetId: string, agentId: string): void {
    const set = this.agentSets.get(agentSetId);
    if (!set) {
      throw new Error(`Agent set not found: ${agentSetId}`);
    }

    if (!set.agentIds.includes(agentId)) {
      set.agentIds.push(agentId);
      this.persistState();
    }
  }

  /**
   * Add a worktree module to a set
   */
  addWorktreeToSet(agentSetId: string, moduleId: string): void {
    const set = this.agentSets.get(agentSetId);
    if (!set) {
      throw new Error(`Agent set not found: ${agentSetId}`);
    }

    if (!set.worktreeModuleIds.includes(moduleId)) {
      set.worktreeModuleIds.push(moduleId);
      this.persistState();
    }
  }

  /**
   * Pause an agent set
   */
  pauseAgentSet(agentSetId: string): void {
    const set = this.agentSets.get(agentSetId);
    if (set) {
      set.status = 'paused';
      this.emitEvent('agentSet:paused', { agentSetId });
      this.persistState();
    }
  }

  /**
   * Resume an agent set
   */
  resumeAgentSet(agentSetId: string): void {
    const set = this.agentSets.get(agentSetId);
    if (set) {
      set.status = 'active';
      this.emitEvent('agentSet:resumed', { agentSetId });
      this.persistState();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Reservation Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a reservation to claim a resource
   */
  createReservation(
    collaboratorId: string,
    type: ReservationType,
    target: string,
    options?: {
      agentSetId?: string;
      reason?: string;
      exclusive?: boolean;
      durationMs?: number;
    }
  ): Reservation | { error: string; conflictsWith: Reservation[] } {
    const collaborator = this.collaborators.get(collaboratorId);
    if (!collaborator) {
      throw new Error(`Collaborator not found: ${collaboratorId}`);
    }

    // Check for conflicts
    const conflicts = this.checkReservationConflict(collaboratorId, type, target, options?.exclusive ?? true);
    if (conflicts.length > 0) {
      return {
        error: 'Reservation conflicts with existing reservations',
        conflictsWith: conflicts,
      };
    }

    const id = randomUUID();
    const reservation: Reservation = {
      id,
      collaboratorId,
      agentSetId: options?.agentSetId,
      type,
      target,
      reason: options?.reason ?? 'Working on this resource',
      exclusive: options?.exclusive ?? true,
      createdAt: new Date(),
      expiresAt: options?.durationMs
        ? new Date(Date.now() + options.durationMs)
        : new Date(Date.now() + this.reservationTimeoutMs),
    };

    this.reservations.set(id, reservation);
    collaborator.reservations.push(id);

    this.emitEvent('reservation:created', {
      collaboratorId,
      reservationId: id,
      type,
      target,
    });
    this.persistState();

    return reservation;
  }

  /**
   * Check if a new reservation would conflict
   */
  private checkReservationConflict(
    collaboratorId: string,
    type: ReservationType,
    target: string,
    exclusive: boolean
  ): Reservation[] {
    const conflicts: Reservation[] = [];

    for (const reservation of this.reservations.values()) {
      // Skip own reservations
      if (reservation.collaboratorId === collaboratorId) continue;

      // Skip expired reservations
      if (reservation.expiresAt && reservation.expiresAt < new Date()) continue;

      // Check if same type and overlapping target
      if (reservation.type === type) {
        if (this.targetsOverlap(type, reservation.target, target)) {
          // Conflict if either is exclusive
          if (reservation.exclusive || exclusive) {
            conflicts.push(reservation);
          }
        }
      }

      // Check cross-type conflicts (e.g., file reservation vs module)
      if (type === 'file' && reservation.type === 'module') {
        // If file is within the reserved module
        if (target.includes(`/${reservation.target}/`)) {
          if (reservation.exclusive || exclusive) {
            conflicts.push(reservation);
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Check if two targets overlap
   */
  private targetsOverlap(type: ReservationType, target1: string, target2: string): boolean {
    if (type === 'module' || type === 'file') {
      return target1 === target2;
    }

    // For path patterns, check if either matches the other
    if (type === 'path-pattern') {
      return this.globMatches(target1, target2) || this.globMatches(target2, target1);
    }

    return false;
  }

  /**
   * Simple glob matching
   */
  private globMatches(pattern: string, path: string): boolean {
    // Convert glob to regex
    const regex = new RegExp(
      '^' + pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$'
    );
    return regex.test(path);
  }

  /**
   * Release a reservation
   */
  releaseReservation(reservationId: string): void {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return;

    this.reservations.delete(reservationId);

    const collaborator = this.collaborators.get(reservation.collaboratorId);
    if (collaborator) {
      collaborator.reservations = collaborator.reservations.filter(id => id !== reservationId);
    }

    this.emitEvent('reservation:released', {
      collaboratorId: reservation.collaboratorId,
      reservationId,
    });
    this.persistState();
  }

  /**
   * Extend a reservation
   */
  extendReservation(reservationId: string, additionalMs: number): void {
    const reservation = this.reservations.get(reservationId);
    if (reservation && reservation.expiresAt) {
      reservation.expiresAt = new Date(reservation.expiresAt.getTime() + additionalMs);
      this.persistState();
    }
  }

  /**
   * List reservations
   */
  listReservations(collaboratorId?: string): Reservation[] {
    const reservations = Array.from(this.reservations.values());
    if (collaboratorId) {
      return reservations.filter(r => r.collaboratorId === collaboratorId);
    }
    return reservations;
  }

  /**
   * Check what's blocking a resource
   */
  checkResourceBlocked(type: ReservationType, target: string): Reservation[] {
    const blocking: Reservation[] = [];

    for (const reservation of this.reservations.values()) {
      if (reservation.expiresAt && reservation.expiresAt < new Date()) continue;

      if (reservation.type === type && this.targetsOverlap(type, reservation.target, target)) {
        if (reservation.exclusive) {
          blocking.push(reservation);
        }
      }
    }

    return blocking;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Merge Queue Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Request to merge a worktree branch
   */
  requestMerge(
    collaboratorId: string,
    agentSetId: string,
    moduleId: string
  ): MergeRequest {
    const set = this.agentSets.get(agentSetId);
    if (!set || set.collaboratorId !== collaboratorId) {
      throw new Error(`Agent set not found or not owned by collaborator`);
    }

    const worktree = this.worktreeManager?.getWorktree(moduleId);
    if (!worktree) {
      throw new Error(`Worktree not found for module: ${moduleId}`);
    }

    const id = randomUUID();
    const mergeRequest: MergeRequest = {
      id,
      collaboratorId,
      agentSetId,
      moduleId,
      branchName: worktree.branchName,
      status: 'pending',
      createdAt: new Date(),
    };

    this.mergeQueue.set(id, mergeRequest);
    this.updateMergeQueuePositions();

    this.emitEvent('merge:requested', {
      collaboratorId,
      agentSetId,
      moduleId,
      mergeRequestId: id,
    });
    this.persistState();

    return mergeRequest;
  }

  /**
   * Check a merge request for conflicts
   */
  async checkMergeConflicts(mergeRequestId: string): Promise<ConflictCheck> {
    const request = this.mergeQueue.get(mergeRequestId);
    if (!request) {
      throw new Error(`Merge request not found: ${mergeRequestId}`);
    }

    request.status = 'checking';

    const result: ConflictCheck = {
      hasConflict: false,
      conflictingReservations: [],
      conflictingMergeRequests: [],
      conflictingFiles: [],
    };

    // Check for conflicting reservations
    const reservationBlocks = this.checkResourceBlocked('module', request.moduleId);
    const otherCollaboratorBlocks = reservationBlocks.filter(
      r => r.collaboratorId !== request.collaboratorId
    );
    if (otherCollaboratorBlocks.length > 0) {
      result.hasConflict = true;
      result.conflictingReservations = otherCollaboratorBlocks;
    }

    // Check for other pending/approved merges that might conflict
    for (const other of this.mergeQueue.values()) {
      if (other.id === mergeRequestId) continue;
      if (other.status === 'merged' || other.status === 'rejected') continue;

      // Check if modules might have overlapping files
      // In a real implementation, we'd do a git merge --no-commit --no-ff dry run
      if (other.moduleId === request.moduleId && other.collaboratorId !== request.collaboratorId) {
        result.hasConflict = true;
        result.conflictingMergeRequests.push(other);
      }
    }

    // If no conflicts, mark as approved
    if (!result.hasConflict) {
      request.status = 'approved';
    } else {
      request.status = 'conflict';
      request.conflictsWith = [
        ...result.conflictingMergeRequests.map(r => r.id),
        ...result.conflictingReservations.map(r => r.collaboratorId),
      ];
    }

    request.checkedAt = new Date();
    this.persistState();

    return result;
  }

  /**
   * Execute a merge
   */
  async executeMerge(mergeRequestId: string): Promise<{ success: boolean; error?: string }> {
    const request = this.mergeQueue.get(mergeRequestId);
    if (!request) {
      return { success: false, error: `Merge request not found: ${mergeRequestId}` };
    }

    if (request.status !== 'approved') {
      return { success: false, error: `Merge request not approved. Status: ${request.status}` };
    }

    request.status = 'merging';

    try {
      if (this.worktreeManager) {
        await this.worktreeManager.mergeToMain(request.moduleId, false);
      }

      request.status = 'merged';
      request.mergedAt = new Date();

      this.emitEvent('merge:completed', {
        collaboratorId: request.collaboratorId,
        moduleId: request.moduleId,
        mergeRequestId,
      });

      // Release associated reservations
      const collaborator = this.collaborators.get(request.collaboratorId);
      if (collaborator) {
        const moduleReservations = collaborator.reservations.filter(rId => {
          const r = this.reservations.get(rId);
          return r?.type === 'module' && r?.target === request.moduleId;
        });
        for (const rId of moduleReservations) {
          this.releaseReservation(rId);
        }
      }

      this.persistState();
      return { success: true };
    } catch (error) {
      request.status = 'conflict';
      request.conflictDetails = error instanceof Error ? error.message : String(error);
      this.persistState();
      return { success: false, error: request.conflictDetails };
    }
  }

  /**
   * Reject a merge request
   */
  rejectMerge(mergeRequestId: string, reason: string): void {
    const request = this.mergeQueue.get(mergeRequestId);
    if (request) {
      request.status = 'rejected';
      request.rejectedReason = reason;
      this.emitEvent('merge:rejected', { mergeRequestId, reason });
      this.persistState();
    }
  }

  /**
   * Update queue positions
   */
  private updateMergeQueuePositions(): void {
    const pending = Array.from(this.mergeQueue.values())
      .filter(r => r.status === 'pending' || r.status === 'approved')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    pending.forEach((request, index) => {
      request.queuePosition = index + 1;
    });
  }

  /**
   * List merge queue
   */
  listMergeQueue(status?: MergeRequestStatus): MergeRequest[] {
    const requests = Array.from(this.mergeQueue.values());
    if (status) {
      return requests.filter(r => r.status === status);
    }
    return requests;
  }

  /**
   * Get merge request
   */
  getMergeRequest(id: string): MergeRequest | undefined {
    return this.mergeQueue.get(id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Conflict Detection
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Full conflict check for a collaborator starting work on a module
   */
  async checkCanWork(
    collaboratorId: string,
    moduleId: string
  ): Promise<{
    canWork: boolean;
    blockedBy: {
      reservations: Reservation[];
      mergeRequests: MergeRequest[];
      activeAgents: string[];
    };
  }> {
    const blockedBy = {
      reservations: [] as Reservation[],
      mergeRequests: [] as MergeRequest[],
      activeAgents: [] as string[],
    };

    // Check reservations
    for (const reservation of this.reservations.values()) {
      if (reservation.collaboratorId === collaboratorId) continue;
      if (reservation.expiresAt && reservation.expiresAt < new Date()) continue;

      if (reservation.type === 'module' && reservation.target === moduleId && reservation.exclusive) {
        blockedBy.reservations.push(reservation);
      }
    }

    // Check merge queue
    for (const request of this.mergeQueue.values()) {
      if (request.collaboratorId === collaboratorId) continue;
      if (request.moduleId === moduleId && request.status === 'merging') {
        blockedBy.mergeRequests.push(request);
      }
    }

    // Check active agents
    if (this.agentManager) {
      const moduleAgents = this.agentManager.getAgentsByModule(moduleId);
      for (const agent of moduleAgents) {
        if (agent.status === 'active') {
          // Find which collaborator owns this agent
          for (const set of this.agentSets.values()) {
            if (set.agentIds.includes(agent.id) && set.collaboratorId !== collaboratorId) {
              blockedBy.activeAgents.push(agent.id);
            }
          }
        }
      }
    }

    const canWork =
      blockedBy.reservations.length === 0 &&
      blockedBy.mergeRequests.length === 0 &&
      blockedBy.activeAgents.length === 0;

    return { canWork, blockedBy };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Cross-Collaborator Visibility
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get what a specific collaborator is working on
   */
  getCollaboratorWork(collaboratorId: string): {
    reservations: Reservation[];
    agentSets: AgentSet[];
    pendingMerges: MergeRequest[];
    activeWorktrees: Worktree[];
  } {
    const reservations = this.listReservations(collaboratorId);
    const agentSets = this.listAgentSets(collaboratorId);
    const pendingMerges = Array.from(this.mergeQueue.values()).filter(
      r => r.collaboratorId === collaboratorId && r.status !== 'merged' && r.status !== 'rejected'
    );

    const activeWorktrees: Worktree[] = [];
    if (this.worktreeManager) {
      for (const set of agentSets) {
        for (const moduleId of set.worktreeModuleIds) {
          const worktree = this.worktreeManager.getWorktree(moduleId);
          if (worktree) {
            activeWorktrees.push(worktree);
          }
        }
      }
    }

    return { reservations, agentSets, pendingMerges, activeWorktrees };
  }

  /**
   * Get all active work across all collaborators
   */
  getAllActiveWork(): {
    byCollaborator: Record<string, {
      name: string;
      modules: string[];
      agentCount: number;
    }>;
    totalModules: number;
    totalAgents: number;
  } {
    const byCollaborator: Record<string, { name: string; modules: string[]; agentCount: number }> = {};
    let totalModules = 0;
    let totalAgents = 0;

    for (const collaborator of this.collaborators.values()) {
      if (collaborator.status === 'disconnected') continue;

      const sets = this.listAgentSets(collaborator.id);
      const modules = new Set<string>();
      let agentCount = 0;

      for (const set of sets) {
        if (set.status === 'active') {
          for (const moduleId of set.worktreeModuleIds) {
            modules.add(moduleId);
          }
          agentCount += set.agentIds.length;
        }
      }

      byCollaborator[collaborator.id] = {
        name: collaborator.name,
        modules: Array.from(modules),
        agentCount,
      };

      totalModules += modules.size;
      totalAgents += agentCount;
    }

    return { byCollaborator, totalModules, totalAgents };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Status & Events
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get coordinator status
   */
  getStatus(): CoordinatorStatus {
    const collaborators = Array.from(this.collaborators.values());
    const agentSets = Array.from(this.agentSets.values());
    const reservations = Array.from(this.reservations.values());
    const mergeRequests = Array.from(this.mergeQueue.values());

    const reservationsByType: Record<ReservationType, number> = {
      module: 0,
      file: 0,
      'path-pattern': 0,
    };
    let exclusiveCount = 0;
    for (const r of reservations) {
      reservationsByType[r.type]++;
      if (r.exclusive) exclusiveCount++;
    }

    const worktrees = this.worktreeManager?.listWorktrees() ?? [];

    return {
      collaborators: {
        total: collaborators.length,
        active: collaborators.filter(c => c.status === 'active').length,
        idle: collaborators.filter(c => c.status === 'idle').length,
      },
      agentSets: {
        total: agentSets.length,
        active: agentSets.filter(s => s.status === 'active').length,
        paused: agentSets.filter(s => s.status === 'paused').length,
      },
      reservations: {
        total: reservations.length,
        byType: reservationsByType,
        exclusive: exclusiveCount,
      },
      mergeQueue: {
        pending: mergeRequests.filter(r => r.status === 'pending').length,
        checking: mergeRequests.filter(r => r.status === 'checking').length,
        approved: mergeRequests.filter(r => r.status === 'approved').length,
        merging: mergeRequests.filter(r => r.status === 'merging').length,
      },
      worktrees: {
        total: worktrees.length,
        active: worktrees.length, // All worktrees are active by definition
      },
    };
  }

  /**
   * Get event log
   */
  getEventLog(limit?: number): CoordinatorEvent[] {
    const events = [...this.eventLog].reverse();
    return limit ? events.slice(0, limit) : events;
  }

  /**
   * Emit an event
   */
  private emitEvent(type: string, data: Record<string, unknown>): void {
    const event: CoordinatorEvent = {
      id: randomUUID(),
      type,
      collaboratorId: data.collaboratorId as string | undefined,
      agentSetId: data.agentSetId as string | undefined,
      moduleId: data.moduleId as string | undefined,
      timestamp: new Date(),
      data,
    };

    this.eventLog.push(event);
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-500);
    }

    this.emit('event', event);
    this.emit(type, event);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Background Tasks
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Start the merge check loop
   */
  private startMergeCheckLoop(): void {
    this.mergeCheckInterval = setInterval(async () => {
      // Auto-check pending merge requests
      for (const request of this.mergeQueue.values()) {
        if (request.status === 'pending') {
          await this.checkMergeConflicts(request.id);
        }
      }

      // Auto-execute approved merges at front of queue
      const approvedInOrder = Array.from(this.mergeQueue.values())
        .filter(r => r.status === 'approved')
        .sort((a, b) => (a.queuePosition ?? 0) - (b.queuePosition ?? 0));

      if (approvedInOrder.length > 0) {
        // Execute the first approved merge
        await this.executeMerge(approvedInOrder[0].id);
      }
    }, this.mergeCheckIntervalMs);
  }

  /**
   * Start reservation cleanup
   */
  private startReservationCleanup(): void {
    this.reservationCleanupInterval = setInterval(() => {
      const now = new Date();
      for (const [id, reservation] of this.reservations.entries()) {
        if (reservation.expiresAt && reservation.expiresAt < now) {
          this.releaseReservation(id);
        }
      }
    }, 60000); // Check every minute
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Persistence
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Persist state to disk
   */
  private async persistState(): Promise<void> {
    const state = {
      collaborators: Array.from(this.collaborators.entries()),
      agentSets: Array.from(this.agentSets.entries()),
      reservations: Array.from(this.reservations.entries()),
      mergeQueue: Array.from(this.mergeQueue.entries()),
      savedAt: new Date().toISOString(),
    };

    await fs.writeFile(this.dataPath, JSON.stringify(state, null, 2));
  }

  /**
   * Load state from disk
   */
  private async loadState(): Promise<void> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const state = JSON.parse(data);

      this.collaborators = new Map(state.collaborators?.map((entry: [string, Collaborator]) => [
        entry[0],
        { ...entry[1], connectedAt: new Date(entry[1].connectedAt), lastActive: new Date(entry[1].lastActive) },
      ]) ?? []);

      this.agentSets = new Map(state.agentSets?.map((entry: [string, AgentSet]) => [
        entry[0],
        { ...entry[1], createdAt: new Date(entry[1].createdAt) },
      ]) ?? []);

      this.reservations = new Map(state.reservations?.map((entry: [string, Reservation]) => [
        entry[0],
        {
          ...entry[1],
          createdAt: new Date(entry[1].createdAt),
          expiresAt: entry[1].expiresAt ? new Date(entry[1].expiresAt) : undefined,
        },
      ]) ?? []);

      this.mergeQueue = new Map(state.mergeQueue?.map((entry: [string, MergeRequest]) => [
        entry[0],
        {
          ...entry[1],
          createdAt: new Date(entry[1].createdAt),
          checkedAt: entry[1].checkedAt ? new Date(entry[1].checkedAt) : undefined,
          mergedAt: entry[1].mergedAt ? new Date(entry[1].mergedAt) : undefined,
        },
      ]) ?? []);
    } catch {
      // No existing state
    }
  }

  /**
   * Shutdown the coordinator
   */
  async shutdown(): Promise<void> {
    if (this.mergeCheckInterval) {
      clearInterval(this.mergeCheckInterval);
    }
    if (this.reservationCleanupInterval) {
      clearInterval(this.reservationCleanupInterval);
    }
    await this.persistState();
  }

  /**
   * Generate terminal view
   */
  generateTerminalView(): string {
    const status = this.getStatus();
    const activeWork = this.getAllActiveWork();

    const lines: string[] = [
      '╔══════════════════════════════════════════════════════════════════╗',
      '║           MULTI-AGENT WORKTREE COORDINATOR                       ║',
      '╠══════════════════════════════════════════════════════════════════╣',
      '║                                                                  ║',
      `║  Collaborators: ${status.collaborators.active} active, ${status.collaborators.idle} idle, ${status.collaborators.total} total`,
      `║  Agent Sets: ${status.agentSets.active} active, ${status.agentSets.paused} paused`,
      `║  Reservations: ${status.reservations.total} (${status.reservations.exclusive} exclusive)`,
      `║  Merge Queue: ${status.mergeQueue.pending} pending, ${status.mergeQueue.approved} approved, ${status.mergeQueue.merging} merging`,
      `║  Worktrees: ${status.worktrees.total} active`,
      '║                                                                  ║',
      '╠══════════════════════════════════════════════════════════════════╣',
      '║  ACTIVE WORK BY COLLABORATOR                                     ║',
      '╠══════════════════════════════════════════════════════════════════╣',
    ];

    for (const [id, work] of Object.entries(activeWork.byCollaborator)) {
      lines.push(`║  ${work.name} (${id.slice(0, 8)}...)`);
      lines.push(`║    Modules: ${work.modules.join(', ') || 'none'}`);
      lines.push(`║    Agents: ${work.agentCount}`);
    }

    if (Object.keys(activeWork.byCollaborator).length === 0) {
      lines.push('║  No active collaborators');
    }

    lines.push('║                                                                  ║');
    lines.push('╚══════════════════════════════════════════════════════════════════╝');

    return lines.map(l => l.padEnd(70) + (l.endsWith('║') ? '' : '║')).join('\n');
  }
}
