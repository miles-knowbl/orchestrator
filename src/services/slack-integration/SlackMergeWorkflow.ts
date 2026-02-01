/**
 * Slack Merge Workflow
 * 
 * Handles merge and rebase operations triggered from Slack.
 * Integrates with MultiAgentCoordinator for worktree management.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import type { 
  MergeRequest, 
  RebaseRequest, 
  MergeConflict,
  BranchStatus,
  MainUpdateNotification,
  SlackChannelConfig,
} from './types.js';

const execAsync = promisify(exec);

export interface SlackMergeWorkflowOptions {
  onMergeComplete?: (notification: MainUpdateNotification) => Promise<void>;
  onConflictDetected?: (request: MergeRequest | RebaseRequest) => Promise<void>;
}

export class SlackMergeWorkflow {
  private mergeRequests: Map<string, MergeRequest> = new Map();
  private rebaseRequests: Map<string, RebaseRequest> = new Map();

  constructor(private options: SlackMergeWorkflowOptions = {}) {}

  /**
   * Check branch status relative to main
   */
  async getBranchStatus(
    worktreePath: string,
    branch: string
  ): Promise<BranchStatus> {
    try {
      // Fetch latest from origin
      await execAsync('git fetch origin', { cwd: worktreePath });

      // Get commits behind/ahead
      const { stdout: behindAhead } = await execAsync(
        `git rev-list --left-right --count origin/main...${branch}`,
        { cwd: worktreePath }
      );
      const [ahead, behind] = behindAhead.trim().split('\t').map(Number);

      // Check for potential conflicts
      const potentialConflicts = await this.checkPotentialConflicts(
        worktreePath,
        branch,
        'origin/main'
      );

      return {
        engineer: '', // Filled in by caller
        branch,
        behindMain: behind || 0,
        aheadOfMain: ahead || 0,
        potentialConflicts,
      };
    } catch (error) {
      return {
        engineer: '',
        branch,
        behindMain: 0,
        aheadOfMain: 0,
        potentialConflicts: [],
      };
    }
  }

  /**
   * Check for potential merge conflicts
   */
  private async checkPotentialConflicts(
    worktreePath: string,
    branch: string,
    targetBranch: string
  ): Promise<string[]> {
    try {
      // Get files changed in both branches since divergence
      const { stdout: mergeBase } = await execAsync(
        `git merge-base ${targetBranch} ${branch}`,
        { cwd: worktreePath }
      );
      const base = mergeBase.trim();

      const { stdout: ourChanges } = await execAsync(
        `git diff --name-only ${base}...${branch}`,
        { cwd: worktreePath }
      );
      const { stdout: theirChanges } = await execAsync(
        `git diff --name-only ${base}...${targetBranch}`,
        { cwd: worktreePath }
      );

      const ourFiles = new Set(ourChanges.trim().split('\n').filter(Boolean));
      const theirFiles = theirChanges.trim().split('\n').filter(Boolean);

      // Files modified in both branches = potential conflicts
      return theirFiles.filter(f => ourFiles.has(f));
    } catch {
      return [];
    }
  }

  /**
   * Initiate merge to main
   */
  async initiateMerge(params: {
    engineer: string;
    branch: string;
    worktreePath: string;
    executionId?: string;
  }): Promise<MergeRequest> {
    const request: MergeRequest = {
      id: randomUUID(),
      engineer: params.engineer,
      branch: params.branch,
      targetBranch: 'main',
      executionId: params.executionId,
      status: 'checking',
      createdAt: new Date().toISOString(),
    };

    this.mergeRequests.set(request.id, request);

    // Check for conflicts
    const conflicts = await this.checkPotentialConflicts(
      params.worktreePath,
      params.branch,
      'origin/main'
    );

    if (conflicts.length > 0) {
      request.status = 'conflicts';
      request.conflictFiles = conflicts;
      
      if (this.options.onConflictDetected) {
        await this.options.onConflictDetected(request);
      }
    } else {
      request.status = 'ready';
    }

    return request;
  }

  /**
   * Execute merge
   */
  async executeMerge(
    requestId: string,
    worktreePath: string
  ): Promise<{ success: boolean; error?: string; notification?: MainUpdateNotification }> {
    const request = this.mergeRequests.get(requestId);
    if (!request) {
      return { success: false, error: 'Merge request not found' };
    }

    if (request.status !== 'ready') {
      return { success: false, error: `Cannot merge in status: ${request.status}` };
    }

    try {
      // Checkout main and pull latest
      await execAsync('git checkout main && git pull origin main', { cwd: worktreePath });

      // Merge the branch
      const { stdout: mergeOutput } = await execAsync(
        `git merge ${request.branch} --no-ff -m "Merge ${request.branch} into main"`,
        { cwd: worktreePath }
      );

      // Push to origin
      await execAsync('git push origin main', { cwd: worktreePath });

      // Get merge stats
      const { stdout: diffStats } = await execAsync(
        `git diff --stat HEAD~1`,
        { cwd: worktreePath }
      );
      const files = diffStats.split('\n')
        .filter(line => line.includes('|'))
        .map(line => line.split('|')[0].trim());

      const { stdout: logOutput } = await execAsync(
        `git rev-list ${request.branch} ^main~1 --count`,
        { cwd: worktreePath }
      );
      const commits = parseInt(logOutput.trim()) || 1;

      // Update request status
      request.status = 'merged';
      request.completedAt = new Date().toISOString();

      // Create notification
      const notification: MainUpdateNotification = {
        engineer: request.engineer,
        branch: request.branch,
        target: request.branch.split('/').pop() || request.branch,
        commits,
        files,
        timestamp: new Date().toISOString(),
      };

      // Notify listeners
      if (this.options.onMergeComplete) {
        await this.options.onMergeComplete(notification);
      }

      // Checkout back to the feature branch
      await execAsync(`git checkout ${request.branch}`, { cwd: worktreePath });

      return { success: true, notification };
    } catch (error) {
      request.status = 'failed';
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  /**
   * Initiate rebase from main
   */
  async initiateRebase(params: {
    engineer: string;
    branch: string;
    worktreePath: string;
  }): Promise<RebaseRequest> {
    const request: RebaseRequest = {
      id: randomUUID(),
      engineer: params.engineer,
      branch: params.branch,
      sourceBranch: 'main',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.rebaseRequests.set(request.id, request);
    return request;
  }

  /**
   * Execute rebase
   */
  async executeRebase(
    requestId: string,
    worktreePath: string
  ): Promise<{ success: boolean; error?: string }> {
    const request = this.rebaseRequests.get(requestId);
    if (!request) {
      return { success: false, error: 'Rebase request not found' };
    }

    request.status = 'in_progress';

    try {
      // Fetch latest
      await execAsync('git fetch origin', { cwd: worktreePath });

      // Attempt rebase
      await execAsync(`git rebase origin/main`, { cwd: worktreePath });

      // Push with force-with-lease (safe force push)
      await execAsync(`git push origin ${request.branch} --force-with-lease`, { cwd: worktreePath });

      request.status = 'success';
      request.completedAt = new Date().toISOString();

      return { success: true };
    } catch (error) {
      // Check if it's a conflict
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      if (errorMsg.includes('CONFLICT') || errorMsg.includes('could not apply')) {
        request.status = 'conflicts';
        
        // Get conflict files
        try {
          const { stdout } = await execAsync('git diff --name-only --diff-filter=U', { cwd: worktreePath });
          request.conflictFiles = stdout.trim().split('\n').filter(Boolean);
        } catch {
          request.conflictFiles = [];
        }

        // Abort rebase to leave worktree clean
        await execAsync('git rebase --abort', { cwd: worktreePath }).catch(() => {});

        if (this.options.onConflictDetected) {
          await this.options.onConflictDetected(request);
        }

        return { success: false, error: 'Conflicts detected during rebase' };
      }

      request.status = 'failed';
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Get merge request by ID
   */
  getMergeRequest(id: string): MergeRequest | null {
    return this.mergeRequests.get(id) || null;
  }

  /**
   * Get rebase request by ID
   */
  getRebaseRequest(id: string): RebaseRequest | null {
    return this.rebaseRequests.get(id) || null;
  }

  /**
   * List pending merge requests for an engineer
   */
  getPendingMerges(engineer: string): MergeRequest[] {
    return [...this.mergeRequests.values()]
      .filter(r => r.engineer === engineer && !['merged', 'failed'].includes(r.status));
  }

  /**
   * List pending rebase requests for an engineer
   */
  getPendingRebases(engineer: string): RebaseRequest[] {
    return [...this.rebaseRequests.values()]
      .filter(r => r.engineer === engineer && !['success', 'failed'].includes(r.status));
  }
}
