/**
 * DeliverableManager
 *
 * Manages deliverables produced during loop execution:
 * - Creates versioned deliverables in .orchestra/runs/{execution-id}/{phase}/
 * - Maintains manifest.json per run for indexing and search
 * - Handles version numbering (DELIVERABLE-v1.md, DELIVERABLE-v2.md)
 * - Provides search across runs
 *
 * Directory Structure:
 * .orchestra/
 *   runs/
 *     {execution-id}/
 *       manifest.json
 *       INIT/
 *         REQUIREMENTS-v1.md
 *       SCAFFOLD/
 *         ARCHITECTURE-v1.md
 *   current -> runs/{latest-execution-id}
 */

import { createHash } from 'crypto';
import { readFile, writeFile, mkdir, readdir, stat, symlink, unlink, rm } from 'fs/promises';
import { join, dirname, relative } from 'path';
import type { Phase, ExecutionStatus } from '../types.js';
import type {
  DeliverableManifest,
  DeliverableEntry,
  DeliverableVersion,
  DeliverableCategory,
  PhaseSummary,
  CreateDeliverableParams,
  CreateDeliverableResult,
  GetDeliverableParams,
  ListDeliverablesParams,
  DeliverableSummary,
  SearchDeliverablesParams,
  SearchResult,
  SearchMatch,
  TransientCategory,
  TransientFile,
  TransientState,
  TransientCheckpoint,
  WriteTransientParams,
  ReadTransientParams,
  ListTransientParams,
  SaveCheckpointParams,
  CleanupTransientParams,
} from '../types/deliverable.js';
import {
  getDeliverableCategory,
  getVersionedFilename,
  parseVersionFromFilename,
} from '../types/deliverable.js';

export interface DeliverableManagerOptions {
  projectPath: string;  // Project root (where .orchestra will be created)
}

const ORCHESTRA_DIR = '.orchestra';
const RUNS_DIR = 'runs';
const MANIFEST_FILE = 'manifest.json';
const CURRENT_LINK = 'current';
const TRANSIENT_DIR = 'transient';
const CHECKPOINT_FILE = 'checkpoint.json';

export class DeliverableManager {
  private manifests: Map<string, DeliverableManifest> = new Map();

  constructor(private options: DeliverableManagerOptions) {}

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Initialize the .orchestra directory structure
   */
  async initialize(): Promise<void> {
    const orchestraPath = this.getOrchestraPath();
    const runsPath = join(orchestraPath, RUNS_DIR);
    await mkdir(runsPath, { recursive: true });
    this.log('info', `Initialized .orchestra at ${orchestraPath}`);
  }

  /**
   * Initialize a new execution run
   */
  async initializeRun(params: {
    executionId: string;
    loopId: string;
    project: string;
    phases: Phase[];
  }): Promise<DeliverableManifest> {
    const runPath = this.getRunPath(params.executionId);
    await mkdir(runPath, { recursive: true });

    // Create phase directories
    for (const phase of params.phases) {
      await mkdir(join(runPath, phase), { recursive: true });
    }

    // Initialize manifest
    const manifest: DeliverableManifest = {
      version: '1.0.0',
      executionId: params.executionId,
      loopId: params.loopId,
      project: params.project,
      status: 'active',
      startedAt: new Date(),
      updatedAt: new Date(),
      deliverables: {},
      phases: Object.fromEntries(
        params.phases.map(p => [p, {
          status: 'pending',
          deliverableCount: 0,
        } as PhaseSummary])
      ) as Record<Phase, PhaseSummary>,
    };

    await this.saveManifest(params.executionId, manifest);

    // Update current symlink
    await this.updateCurrentLink(params.executionId);

    this.log('info', `Initialized run ${params.executionId} with ${params.phases.length} phases`);
    return manifest;
  }

  // ==========================================================================
  // DELIVERABLE CRUD
  // ==========================================================================

  /**
   * Create or update a deliverable
   */
  async createDeliverable(params: CreateDeliverableParams): Promise<CreateDeliverableResult> {
    const manifest = await this.loadManifest(params.executionId);
    if (!manifest) {
      throw new Error(`Run not found: ${params.executionId}`);
    }

    // Get or create deliverable entry
    let entry = manifest.deliverables[params.name];
    let version: number;

    if (entry) {
      // Increment version
      version = entry.currentVersion + 1;
    } else {
      // New deliverable
      version = 1;
      entry = {
        name: params.name,
        phase: params.phase,
        category: params.category || getDeliverableCategory(params.name),
        versions: [],
        currentVersion: 0,
      };
    }

    // Generate versioned filename and path
    const versionedName = getVersionedFilename(params.name, version);
    const relativePath = join(params.phase, versionedName);
    const fullPath = join(this.getRunPath(params.executionId), relativePath);

    // Write the file
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, params.content, 'utf-8');

    // Compute hash and stats
    const hash = this.computeHash(params.content);
    const lineCount = params.content.split('\n').length;
    const sizeBytes = Buffer.byteLength(params.content, 'utf-8');

    // Create version record
    const versionRecord: DeliverableVersion = {
      version,
      path: relativePath,
      createdAt: new Date(),
      hash,
      sizeBytes,
      lineCount,
      author: params.author,
      changeNote: params.changeNote,
    };

    // Update entry
    entry.versions.push(versionRecord);
    entry.currentVersion = version;
    manifest.deliverables[params.name] = entry;

    // Update phase summary
    if (manifest.phases[params.phase]) {
      manifest.phases[params.phase].deliverableCount =
        Object.values(manifest.deliverables).filter(d => d.phase === params.phase).length;
    }

    // Update manifest
    manifest.updatedAt = new Date();
    await this.saveManifest(params.executionId, manifest);

    this.log('info', `Created ${params.name} v${version} in ${params.phase}`);

    return {
      path: fullPath,
      relativePath: join(ORCHESTRA_DIR, RUNS_DIR, params.executionId, relativePath),
      version,
      hash,
    };
  }

  /**
   * Get deliverable content
   */
  async getDeliverable(params: GetDeliverableParams): Promise<{
    content: string;
    version: DeliverableVersion;
    entry: DeliverableEntry;
  } | null> {
    const manifest = await this.loadManifest(params.executionId);
    if (!manifest) return null;

    const entry = manifest.deliverables[params.name];
    if (!entry) return null;

    // Get requested version or latest
    const targetVersion = params.version || entry.currentVersion;
    const versionRecord = entry.versions.find(v => v.version === targetVersion);
    if (!versionRecord) return null;

    // Read the file
    const fullPath = join(this.getRunPath(params.executionId), versionRecord.path);
    try {
      const content = await readFile(fullPath, 'utf-8');
      return { content, version: versionRecord, entry };
    } catch {
      return null;
    }
  }

  /**
   * List deliverables
   */
  async listDeliverables(params: ListDeliverablesParams = {}): Promise<DeliverableSummary[]> {
    const results: DeliverableSummary[] = [];

    // Get runs to search
    let executionIds: string[];
    if (params.executionId) {
      executionIds = [params.executionId];
    } else {
      executionIds = await this.listRuns();
    }

    for (const executionId of executionIds) {
      const manifest = await this.loadManifest(executionId);
      if (!manifest) continue;

      for (const [name, entry] of Object.entries(manifest.deliverables)) {
        // Apply filters
        if (params.phase && entry.phase !== params.phase) continue;
        if (params.category && entry.category !== params.category) continue;
        if (params.namePattern) {
          const pattern = new RegExp(
            params.namePattern.replace(/\*/g, '.*').replace(/\?/g, '.'),
            'i'
          );
          if (!pattern.test(name)) continue;
        }

        const latestVersion = entry.versions[entry.versions.length - 1];
        results.push({
          executionId,
          name,
          phase: entry.phase,
          category: entry.category,
          currentVersion: entry.currentVersion,
          latestPath: join(
            ORCHESTRA_DIR, RUNS_DIR, executionId, latestVersion.path
          ),
          updatedAt: new Date(latestVersion.createdAt),
        });
      }
    }

    // Sort by updatedAt descending
    results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return results;
  }

  /**
   * Search deliverables for text
   */
  async searchDeliverables(params: SearchDeliverablesParams): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const limit = params.limit || 50;

    // Get deliverables to search
    const deliverables = await this.listDeliverables({
      executionId: params.executionId,
      phase: params.phase,
    });

    for (const summary of deliverables) {
      if (results.length >= limit) break;

      const result = await this.getDeliverable({
        executionId: summary.executionId,
        name: summary.name,
      });
      if (!result) continue;

      // Search content
      const lines = result.content.split('\n');
      const matches: SearchMatch[] = [];

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(params.query.toLowerCase())) {
          matches.push({
            line: i + 1,
            content: lines[i],
            context: [
              lines[i - 1] || '',
              lines[i],
              lines[i + 1] || '',
            ].join('\n'),
          });
        }
      }

      if (matches.length > 0) {
        results.push({
          executionId: summary.executionId,
          name: summary.name,
          version: summary.currentVersion,
          path: summary.latestPath,
          matches: matches.slice(0, 5), // Limit matches per file
        });
      }
    }

    return results;
  }

  // ==========================================================================
  // MANIFEST MANAGEMENT
  // ==========================================================================

  /**
   * Load manifest for a run
   */
  async loadManifest(executionId: string): Promise<DeliverableManifest | null> {
    // Check cache first
    if (this.manifests.has(executionId)) {
      return this.manifests.get(executionId)!;
    }

    const manifestPath = join(this.getRunPath(executionId), MANIFEST_FILE);
    try {
      const content = await readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(content) as DeliverableManifest;

      // Restore dates
      manifest.startedAt = new Date(manifest.startedAt);
      manifest.updatedAt = new Date(manifest.updatedAt);
      if (manifest.completedAt) {
        manifest.completedAt = new Date(manifest.completedAt);
      }
      for (const entry of Object.values(manifest.deliverables)) {
        for (const version of entry.versions) {
          version.createdAt = new Date(version.createdAt);
          if (version.updatedAt) {
            version.updatedAt = new Date(version.updatedAt);
          }
        }
      }

      this.manifests.set(executionId, manifest);
      return manifest;
    } catch {
      return null;
    }
  }

  /**
   * Save manifest for a run
   */
  private async saveManifest(executionId: string, manifest: DeliverableManifest): Promise<void> {
    const manifestPath = join(this.getRunPath(executionId), MANIFEST_FILE);
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    this.manifests.set(executionId, manifest);
  }

  /**
   * Update run status
   */
  async updateRunStatus(executionId: string, status: ExecutionStatus): Promise<void> {
    const manifest = await this.loadManifest(executionId);
    if (!manifest) return;

    manifest.status = status;
    manifest.updatedAt = new Date();
    if (status === 'completed' || status === 'failed') {
      manifest.completedAt = new Date();
    }

    await this.saveManifest(executionId, manifest);
  }

  /**
   * Update phase status
   */
  async updatePhaseStatus(
    executionId: string,
    phase: Phase,
    status: 'pending' | 'in-progress' | 'completed' | 'skipped'
  ): Promise<void> {
    const manifest = await this.loadManifest(executionId);
    if (!manifest || !manifest.phases[phase]) return;

    const phaseSummary = manifest.phases[phase];
    phaseSummary.status = status;

    if (status === 'in-progress' && !phaseSummary.startedAt) {
      phaseSummary.startedAt = new Date();
    }
    if (status === 'completed' || status === 'skipped') {
      phaseSummary.completedAt = new Date();
    }

    manifest.updatedAt = new Date();
    await this.saveManifest(executionId, manifest);
  }

  // ==========================================================================
  // RUN MANAGEMENT
  // ==========================================================================

  /**
   * List all runs
   */
  async listRuns(): Promise<string[]> {
    const runsPath = join(this.getOrchestraPath(), RUNS_DIR);
    try {
      const entries = await readdir(runsPath, { withFileTypes: true });
      return entries
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .sort()
        .reverse(); // Most recent first
    } catch {
      return [];
    }
  }

  /**
   * Get current run ID (from symlink)
   */
  async getCurrentRunId(): Promise<string | null> {
    const currentPath = join(this.getOrchestraPath(), CURRENT_LINK);
    try {
      const stats = await stat(currentPath);
      if (stats.isSymbolicLink()) {
        const target = await readFile(currentPath, 'utf-8');
        return target.split('/').pop() || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Update the "current" symlink
   */
  private async updateCurrentLink(executionId: string): Promise<void> {
    const currentPath = join(this.getOrchestraPath(), CURRENT_LINK);
    const targetPath = join(RUNS_DIR, executionId);

    try {
      await unlink(currentPath);
    } catch {
      // Doesn't exist, ignore
    }

    try {
      await symlink(targetPath, currentPath);
    } catch (error) {
      this.log('warn', `Failed to create current symlink: ${error}`);
    }
  }

  /**
   * Archive old runs (keep last N)
   */
  async archiveOldRuns(keepCount: number = 10): Promise<string[]> {
    const runs = await this.listRuns();
    const archived: string[] = [];

    if (runs.length <= keepCount) {
      return archived;
    }

    const toArchive = runs.slice(keepCount);
    for (const runId of toArchive) {
      const runPath = this.getRunPath(runId);
      try {
        await rm(runPath, { recursive: true });
        this.manifests.delete(runId);
        archived.push(runId);
      } catch (error) {
        this.log('warn', `Failed to archive run ${runId}: ${error}`);
      }
    }

    if (archived.length > 0) {
      this.log('info', `Archived ${archived.length} old runs`);
    }

    return archived;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Get the path to .orchestra
   */
  getOrchestraPath(): string {
    return join(this.options.projectPath, ORCHESTRA_DIR);
  }

  /**
   * Get the path to a specific run
   */
  getRunPath(executionId: string): string {
    return join(this.getOrchestraPath(), RUNS_DIR, executionId);
  }

  /**
   * Get the path where a deliverable should be created
   */
  getDeliverablePath(executionId: string, phase: Phase, name: string, version: number): string {
    const versionedName = getVersionedFilename(name, version);
    return join(this.getRunPath(executionId), phase, versionedName);
  }

  /**
   * Check if a deliverable exists
   */
  async deliverableExists(executionId: string, name: string): Promise<boolean> {
    const manifest = await this.loadManifest(executionId);
    return !!manifest?.deliverables[name];
  }

  /**
   * Get deliverable path for guarantee validation
   */
  async getDeliverablePathForValidation(
    executionId: string,
    name: string
  ): Promise<string | null> {
    const manifest = await this.loadManifest(executionId);
    if (!manifest) return null;

    const entry = manifest.deliverables[name];
    if (!entry || entry.versions.length === 0) return null;

    const latestVersion = entry.versions[entry.versions.length - 1];
    return join(this.getRunPath(executionId), latestVersion.path);
  }

  /**
   * Compute SHA-256 hash of content
   */
  private computeHash(content: string): string {
    return `sha256:${createHash('sha256').update(content).digest('hex')}`;
  }

  // ==========================================================================
  // TRANSIENT STATE MANAGEMENT
  // ==========================================================================

  /**
   * Get transient directory path for an execution
   */
  private getTransientPath(executionId: string, category?: TransientCategory): string {
    const basePath = join(this.getRunPath(executionId), TRANSIENT_DIR);
    return category ? join(basePath, category) : basePath;
  }

  /**
   * Initialize transient state directories for an execution
   */
  async initializeTransient(executionId: string): Promise<void> {
    const categories: TransientCategory[] = ['context', 'working', 'scratch'];
    for (const category of categories) {
      await mkdir(this.getTransientPath(executionId, category), { recursive: true });
    }
    this.log('info', `Initialized transient state for execution ${executionId}`);
  }

  /**
   * Write a transient file
   */
  async writeTransient(params: WriteTransientParams): Promise<TransientFile> {
    const { executionId, category, name, content, metadata } = params;
    const categoryPath = this.getTransientPath(executionId, category);
    await mkdir(categoryPath, { recursive: true });

    const filePath = join(categoryPath, name);
    await writeFile(filePath, content, 'utf-8');

    const stats = await stat(filePath);
    const file: TransientFile = {
      name,
      category,
      path: relative(this.getRunPath(executionId), filePath),
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
      size: stats.size,
      metadata,
    };

    this.log('info', `Wrote transient file: ${category}/${name} for ${executionId}`);
    return file;
  }

  /**
   * Read a transient file
   */
  async readTransient(params: ReadTransientParams): Promise<string | null> {
    const { executionId, category, name } = params;
    const filePath = join(this.getTransientPath(executionId, category), name);

    try {
      return await readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  /**
   * List transient files for an execution
   */
  async listTransient(params: ListTransientParams): Promise<TransientFile[]> {
    const { executionId, category } = params;
    const files: TransientFile[] = [];
    const categories: TransientCategory[] = category ? [category] : ['context', 'working', 'scratch'];

    for (const cat of categories) {
      const categoryPath = this.getTransientPath(executionId, cat);
      try {
        const entries = await readdir(categoryPath);
        for (const entry of entries) {
          const filePath = join(categoryPath, entry);
          const stats = await stat(filePath);
          if (stats.isFile()) {
            files.push({
              name: entry,
              category: cat,
              path: relative(this.getRunPath(executionId), filePath),
              createdAt: stats.birthtime,
              updatedAt: stats.mtime,
              size: stats.size,
            });
          }
        }
      } catch {
        // Directory doesn't exist, skip
      }
    }

    return files;
  }

  /**
   * Save a checkpoint for resumable state
   */
  async saveCheckpoint(params: SaveCheckpointParams): Promise<TransientCheckpoint> {
    const { executionId, phase, skillId, data } = params;
    const checkpoint: TransientCheckpoint = {
      phase,
      skillId,
      data,
      savedAt: new Date(),
    };

    await this.writeTransient({
      executionId,
      category: 'working',
      name: CHECKPOINT_FILE,
      content: JSON.stringify(checkpoint, null, 2),
    });

    this.log('info', `Saved checkpoint for ${executionId} at ${phase}${skillId ? `/${skillId}` : ''}`);
    return checkpoint;
  }

  /**
   * Load a checkpoint
   */
  async loadCheckpoint(executionId: string): Promise<TransientCheckpoint | null> {
    const content = await this.readTransient({
      executionId,
      category: 'working',
      name: CHECKPOINT_FILE,
    });

    if (!content) return null;

    try {
      const checkpoint = JSON.parse(content);
      checkpoint.savedAt = new Date(checkpoint.savedAt);
      return checkpoint;
    } catch {
      return null;
    }
  }

  /**
   * Clean up transient state for an execution
   */
  async cleanupTransient(params: CleanupTransientParams): Promise<{ deletedCount: number }> {
    const { executionId, scratchOnly } = params;
    let deletedCount = 0;

    const categoriesToClean: TransientCategory[] = scratchOnly
      ? ['scratch']
      : ['context', 'working', 'scratch'];

    for (const category of categoriesToClean) {
      const categoryPath = this.getTransientPath(executionId, category);
      try {
        const entries = await readdir(categoryPath);
        for (const entry of entries) {
          await rm(join(categoryPath, entry), { recursive: true, force: true });
          deletedCount++;
        }
      } catch {
        // Directory doesn't exist, skip
      }
    }

    // If cleaning all, remove the transient directory itself
    if (!scratchOnly) {
      try {
        await rm(this.getTransientPath(executionId), { recursive: true, force: true });
      } catch {
        // Ignore errors
      }
    }

    this.log('info', `Cleaned up ${deletedCount} transient files for ${executionId}${scratchOnly ? ' (scratch only)' : ''}`);
    return { deletedCount };
  }

  /**
   * Get transient state summary for an execution
   */
  async getTransientState(executionId: string): Promise<TransientState | null> {
    const files = await this.listTransient({ executionId });
    const checkpoint = await this.loadCheckpoint(executionId);

    if (files.length === 0 && !checkpoint) return null;

    // Find earliest and latest timestamps
    const timestamps = files.map(f => f.createdAt.getTime());
    const createdAt = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : new Date();
    const updatedAt = timestamps.length > 0 ? new Date(Math.max(...files.map(f => f.updatedAt.getTime()))) : new Date();

    return {
      executionId,
      files,
      checkpoint: checkpoint ?? undefined,
      createdAt,
      updatedAt,
    };
  }

  private log(level: string, message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'DeliverableManager',
      message,
    }));
  }
}
