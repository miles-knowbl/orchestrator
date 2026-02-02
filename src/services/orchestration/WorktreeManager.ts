/**
 * Git Worktree Manager
 *
 * Manages git worktrees for module isolation.
 * Each module gets its own worktree and branch.
 */

import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { WorktreeManagerOptions } from './types.js';

export interface Worktree {
  moduleId: string;
  branchName: string;
  worktreePath: string;
  createdAt: Date;
  lastCommit?: string;
  commitCount: number;
}

export class WorktreeManager {
  private systemPath: string;
  private worktreesDirectory: string;
  private branchPrefix: string;
  private mainBranch: string;
  private worktrees: Map<string, Worktree> = new Map();

  constructor(options: WorktreeManagerOptions) {
    this.systemPath = options.systemPath;
    this.worktreesDirectory = options.worktreesDirectory;
    this.branchPrefix = options.branchPrefix;
    this.mainBranch = options.mainBranch;
  }

  /**
   * Initialize the worktree manager
   */
  async initialize(): Promise<void> {
    // Ensure worktrees directory exists
    const worktreesPath = path.join(this.systemPath, this.worktreesDirectory);
    await fs.mkdir(worktreesPath, { recursive: true });

    // Load existing worktrees
    await this.loadExistingWorktrees();
  }

  /**
   * Load existing worktrees from git
   */
  private async loadExistingWorktrees(): Promise<void> {
    try {
      const result = await this.runGit(['worktree', 'list', '--porcelain']);
      const lines = result.split('\n');

      let currentWorktree: Partial<Worktree> = {};

      for (const line of lines) {
        if (line.startsWith('worktree ')) {
          currentWorktree.worktreePath = line.substring(9);
        } else if (line.startsWith('branch refs/heads/')) {
          const branchName = line.substring(18);
          if (branchName.startsWith(this.branchPrefix)) {
            currentWorktree.branchName = branchName;
            currentWorktree.moduleId = branchName.substring(this.branchPrefix.length);
          }
        } else if (line === '') {
          // End of worktree entry
          if (currentWorktree.moduleId && currentWorktree.worktreePath) {
            this.worktrees.set(currentWorktree.moduleId, {
              moduleId: currentWorktree.moduleId,
              branchName: currentWorktree.branchName!,
              worktreePath: currentWorktree.worktreePath,
              createdAt: new Date(), // We don't know exact creation time
              commitCount: 0,
            });
          }
          currentWorktree = {};
        }
      }
    } catch {
      // No worktrees or git not initialized
    }
  }

  /**
   * Create a worktree for a module
   */
  async createWorktree(moduleId: string): Promise<Worktree> {
    const branchName = `${this.branchPrefix}${moduleId}`;
    const worktreePath = path.join(this.systemPath, this.worktreesDirectory, moduleId);

    // Check if worktree already exists
    if (this.worktrees.has(moduleId)) {
      return this.worktrees.get(moduleId)!;
    }

    // Check if branch exists
    const branchExists = await this.branchExists(branchName);

    if (branchExists) {
      // Add worktree for existing branch
      await this.runGit(['worktree', 'add', worktreePath, branchName]);
    } else {
      // Create new branch and worktree from main
      await this.runGit(['worktree', 'add', '-b', branchName, worktreePath, this.mainBranch]);
    }

    const worktree: Worktree = {
      moduleId,
      branchName,
      worktreePath,
      createdAt: new Date(),
      commitCount: 0,
    };

    this.worktrees.set(moduleId, worktree);
    return worktree;
  }

  /**
   * Get worktree for a module
   */
  getWorktree(moduleId: string): Worktree | undefined {
    return this.worktrees.get(moduleId);
  }

  /**
   * List all active worktrees
   */
  listWorktrees(): Worktree[] {
    return Array.from(this.worktrees.values());
  }

  /**
   * Commit changes in a worktree
   */
  async commit(moduleId: string, message: string, files?: string[]): Promise<string> {
    const worktree = this.worktrees.get(moduleId);
    if (!worktree) {
      throw new Error(`Worktree not found for module: ${moduleId}`);
    }

    // Stage files
    if (files && files.length > 0) {
      await this.runGitInWorktree(worktree.worktreePath, ['add', ...files]);
    } else {
      await this.runGitInWorktree(worktree.worktreePath, ['add', '-A']);
    }

    // Check if there are changes to commit
    const status = await this.runGitInWorktree(worktree.worktreePath, ['status', '--porcelain']);
    if (!status.trim()) {
      return ''; // Nothing to commit
    }

    // Commit with co-author
    const fullMessage = `${message}\n\nCo-Authored-By: Claude <noreply@anthropic.com>`;
    await this.runGitInWorktree(worktree.worktreePath, ['commit', '-m', fullMessage]);

    // Get commit hash
    const commitHash = await this.runGitInWorktree(worktree.worktreePath, ['rev-parse', 'HEAD']);

    worktree.lastCommit = commitHash.trim();
    worktree.commitCount++;

    return commitHash.trim();
  }

  /**
   * Get status of a worktree
   */
  async getStatus(moduleId: string): Promise<{ clean: boolean; changes: string[] }> {
    const worktree = this.worktrees.get(moduleId);
    if (!worktree) {
      throw new Error(`Worktree not found for module: ${moduleId}`);
    }

    const status = await this.runGitInWorktree(worktree.worktreePath, ['status', '--porcelain']);
    const changes = status.split('\n').filter(line => line.trim());

    return {
      clean: changes.length === 0,
      changes,
    };
  }

  /**
   * Merge worktree branch into main
   */
  async mergeToMain(moduleId: string, deleteAfterMerge: boolean = false): Promise<void> {
    const worktree = this.worktrees.get(moduleId);
    if (!worktree) {
      throw new Error(`Worktree not found for module: ${moduleId}`);
    }

    // Switch to main in the main repo
    await this.runGit(['checkout', this.mainBranch]);

    // Merge the module branch
    await this.runGit(['merge', worktree.branchName, '--no-ff', '-m',
      `Merge ${worktree.branchName}: Module ${moduleId} complete\n\nCo-Authored-By: Claude <noreply@anthropic.com>`]);

    if (deleteAfterMerge) {
      await this.deleteWorktree(moduleId);
    }
  }

  /**
   * Delete a worktree
   */
  async deleteWorktree(moduleId: string, force: boolean = false): Promise<void> {
    const worktree = this.worktrees.get(moduleId);
    if (!worktree) {
      return; // Already deleted
    }

    // Remove worktree
    const args = ['worktree', 'remove', worktree.worktreePath];
    if (force) {
      args.push('--force');
    }
    await this.runGit(args);

    // Optionally delete branch
    // await this.runGit(['branch', '-d', worktree.branchName]);

    this.worktrees.delete(moduleId);
  }

  /**
   * Get commit log for a worktree
   */
  async getCommitLog(moduleId: string, limit: number = 10): Promise<Array<{
    hash: string;
    message: string;
    date: Date;
  }>> {
    const worktree = this.worktrees.get(moduleId);
    if (!worktree) {
      throw new Error(`Worktree not found for module: ${moduleId}`);
    }

    const log = await this.runGitInWorktree(worktree.worktreePath, [
      'log',
      `--max-count=${limit}`,
      '--pretty=format:%H|%s|%aI',
    ]);

    return log.split('\n').filter(line => line).map(line => {
      const [hash, message, date] = line.split('|');
      return { hash, message, date: new Date(date) };
    });
  }

  /**
   * Check if a branch exists
   */
  private async branchExists(branchName: string): Promise<boolean> {
    try {
      await this.runGit(['rev-parse', '--verify', branchName]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Run a git command in the main repo
   */
  private runGit(args: string[]): Promise<string> {
    return this.runGitInPath(this.systemPath, args);
  }

  /**
   * Run a git command in a worktree
   */
  private runGitInWorktree(worktreePath: string, args: string[]): Promise<string> {
    return this.runGitInPath(worktreePath, args);
  }

  /**
   * Run a git command in a specific path
   */
  private runGitInPath(cwd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn('git', args, { cwd });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Git command failed: git ${args.join(' ')}\n${stderr}`));
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Get summary of all worktrees
   */
  getSummary(): {
    total: number;
    worktrees: Array<{
      moduleId: string;
      branchName: string;
      commitCount: number;
      lastCommit?: string;
    }>;
  } {
    const worktrees = Array.from(this.worktrees.values()).map(w => ({
      moduleId: w.moduleId,
      branchName: w.branchName,
      commitCount: w.commitCount,
      lastCommit: w.lastCommit,
    }));

    return {
      total: worktrees.length,
      worktrees,
    };
  }
}
