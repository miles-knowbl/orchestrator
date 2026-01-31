/**
 * Service for archiving and querying loop runs
 *
 * Handles:
 * - Archiving completed loop runs to ~/.claude/runs/
 * - Querying archived runs with filters
 * - Pruning active state files after archival
 * - Updating Dream State documents on completion
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { homedir } from 'os';

export interface RunContext {
  tier: 'organization' | 'system' | 'module';
  organization: string;
  system: string | null;
  module: string | null;
}

export interface RunSummary {
  loop: string;
  system: string;
  module: string | null;
  started_at: string;
  completed_at: string;
  duration_minutes: number;
  outcome: 'success' | 'failed' | 'abandoned';
  phases_completed: string[];
  phases_skipped: string[];
  gates_passed: string[];
  gates_failed: string[];
  deliverables: string[];
  checklist_progress: {
    completed: number;
    total: number;
  };
}

export interface ArchivedRun {
  meta: {
    archived_at: string;
    archive_version: string;
    file_path: string;
  };
  summary: RunSummary;
  state: Record<string, unknown>;
}

export interface QueryRunsParams {
  loop?: string;
  system?: string;
  module?: string;
  since?: string;
  until?: string;
  outcome?: 'success' | 'failed' | 'abandoned';
  limit?: number;
  include_state?: boolean;
}

export class RunArchivalService {
  private runsDir: string;

  constructor() {
    this.runsDir = path.join(homedir(), '.claude', 'runs');
  }

  /**
   * Ensure the runs directory exists
   */
  async ensureRunsDir(): Promise<void> {
    await fs.mkdir(this.runsDir, { recursive: true });
  }

  /**
   * Get the runs directory path
   */
  getRunsPath(): string {
    return this.runsDir;
  }

  /**
   * Get the archive path for a run
   */
  getArchivePath(system: string, loop: string, completedAt: Date): string {
    const yearMonth = completedAt.toISOString().slice(0, 7); // "2025-01"
    const timestamp = completedAt.toISOString().slice(8, 19).replace(/:/g, '-'); // "29T14-30-00"
    const filename = `${system}-${loop}-${timestamp}.json`;
    return path.join(this.runsDir, yearMonth, filename);
  }

  /**
   * Archive a completed loop run
   */
  async archiveRun(
    state: Record<string, unknown>,
    summary: RunSummary
  ): Promise<string> {
    await this.ensureRunsDir();

    const completedAt = new Date(summary.completed_at);
    const archivePath = this.getArchivePath(summary.system, summary.loop, completedAt);

    // Ensure year-month directory exists
    await fs.mkdir(path.dirname(archivePath), { recursive: true });

    const archivedRun: ArchivedRun = {
      meta: {
        archived_at: new Date().toISOString(),
        archive_version: '1.0.0',
        file_path: archivePath,
      },
      summary,
      state,
    };

    await fs.writeFile(archivePath, JSON.stringify(archivedRun, null, 2));

    return archivePath;
  }

  /**
   * Query archived runs with filters
   */
  async queryRuns(params: QueryRunsParams = {}): Promise<ArchivedRun[]> {
    const { loop, system, module, since, until, outcome, limit = 10, include_state = false } = params;

    await this.ensureRunsDir();

    const results: ArchivedRun[] = [];

    // Get all year-month directories
    let yearMonthDirs: string[];
    try {
      yearMonthDirs = await fs.readdir(this.runsDir);
    } catch {
      return []; // No runs directory yet
    }

    // Sort descending (most recent first)
    yearMonthDirs.sort().reverse();

    // Filter by date range if specified
    const sinceDate = since ? new Date(since) : null;
    const untilDate = until ? new Date(until) : null;

    for (const yearMonth of yearMonthDirs) {
      // Skip if outside date range
      if (sinceDate) {
        const [year, month] = yearMonth.split('-').map(Number);
        const dirDate = new Date(year, month - 1);
        if (dirDate < new Date(sinceDate.getFullYear(), sinceDate.getMonth())) {
          continue;
        }
      }
      if (untilDate) {
        const [year, month] = yearMonth.split('-').map(Number);
        const dirDate = new Date(year, month);
        if (dirDate > untilDate) {
          continue;
        }
      }

      const dirPath = path.join(this.runsDir, yearMonth);
      let files: string[];
      try {
        files = await fs.readdir(dirPath);
      } catch {
        continue;
      }

      // Sort files descending (most recent first)
      files.sort().reverse();

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        // Quick filter by filename pattern: {system}-{loop}-{timestamp}.json
        if (system && !file.startsWith(`${system}-`)) continue;
        if (loop && !file.includes(`-${loop}-`)) continue;

        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const run: ArchivedRun = JSON.parse(content);

        // Apply filters
        if (system && run.summary.system !== system) continue;
        if (loop && run.summary.loop !== loop) continue;
        if (module && run.summary.module !== module) continue;
        if (outcome && run.summary.outcome !== outcome) continue;

        if (sinceDate && new Date(run.summary.completed_at) < sinceDate) continue;
        if (untilDate && new Date(run.summary.completed_at) > untilDate) continue;

        // Optionally strip state to reduce payload
        if (!include_state) {
          const { state, ...runWithoutState } = run;
          results.push(runWithoutState as ArchivedRun);
        } else {
          results.push(run);
        }

        if (results.length >= limit) {
          return results;
        }
      }
    }

    return results;
  }

  /**
   * Get recent runs for context injection
   */
  async getRecentRunsForContext(
    system: string,
    limit: number = 5
  ): Promise<RunSummary[]> {
    const runs = await this.queryRuns({ system, limit, include_state: false });
    return runs.map(r => r.summary);
  }

  /**
   * Prune (delete) an active state file
   */
  async pruneStateFile(stateFilePath: string): Promise<boolean> {
    try {
      await fs.unlink(stateFilePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a run summary from loop state
   */
  createRunSummary(
    state: Record<string, unknown>,
    outcome: 'success' | 'failed' | 'abandoned' = 'success'
  ): RunSummary {
    const context = (state.context as RunContext) || {
      system: 'unknown',
      module: null,
    };

    const phases = (state.phases as Record<string, { status: string }>) || {};
    const gates = (state.gates as Record<string, { status: string }>) || {};

    const completedPhases: string[] = [];
    const skippedPhases: string[] = [];
    for (const [phase, phaseState] of Object.entries(phases)) {
      if (phaseState.status === 'complete') {
        completedPhases.push(phase);
      } else if (phaseState.status === 'skipped') {
        skippedPhases.push(phase);
      }
    }

    const passedGates: string[] = [];
    const failedGates: string[] = [];
    for (const [gate, gateState] of Object.entries(gates)) {
      if (gateState.status === 'passed') {
        passedGates.push(gate);
      } else if (gateState.status === 'failed') {
        failedGates.push(gate);
      }
    }

    const startedAt = (state.started_at as string) || new Date().toISOString();
    const completedAt = new Date().toISOString();
    const duration = Math.round(
      (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000
    );

    return {
      loop: (state.loop as string) || 'unknown',
      system: context.system || 'unknown',
      module: context.module,
      started_at: startedAt,
      completed_at: completedAt,
      duration_minutes: duration,
      outcome,
      phases_completed: completedPhases,
      phases_skipped: skippedPhases,
      gates_passed: passedGates,
      gates_failed: failedGates,
      deliverables: (state.deliverables as string[]) || [],
      checklist_progress: {
        completed: completedPhases.length,
        total: Object.keys(phases).length,
      },
    };
  }
}
