/**
 * RoadmapService - System-level visibility into module progress, dependencies, and completion
 *
 * Core capabilities:
 * - Parse/validate ROADMAP.md format
 * - Track module status (pending/in-progress/complete)
 * - Calculate progress (per layer, overall)
 * - Identify next module based on dependencies
 * - Terminal visualization
 * - Integration with engineering-loop and leverage protocol
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

export const ModuleStatusSchema = z.enum(['pending', 'in-progress', 'complete', 'blocked']);
export type ModuleStatus = z.infer<typeof ModuleStatusSchema>;

export const ModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  layer: z.number().min(0).max(6),
  status: ModuleStatusSchema,
  dependsOn: z.array(z.string()).default([]),
  unlocks: z.array(z.string()).default([]),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
});
export type Module = z.infer<typeof ModuleSchema>;

export const UpdateSchema = z.object({
  id: z.string(),
  target: z.string(),
  description: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  status: ModuleStatusSchema,
});
export type Update = z.infer<typeof UpdateSchema>;

export const RoadmapSchema = z.object({
  system: z.string(),
  dreamState: z.string(),
  modules: z.array(ModuleSchema),
  updates: z.array(UpdateSchema).default([]),
  brainstorm: z.array(z.object({
    idea: z.string(),
    notes: z.string().optional(),
  })).default([]),
  currentModule: z.string().optional(),
  version: z.string().default('1.0.0'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Roadmap = z.infer<typeof RoadmapSchema>;

export interface LayerProgress {
  layer: number;
  total: number;
  complete: number;
  inProgress: number;
  pending: number;
  blocked: number;
  percentage: number;
  modules: Module[];
}

export interface RoadmapProgress {
  totalModules: number;
  completeModules: number;
  inProgressModules: number;
  pendingModules: number;
  blockedModules: number;
  overallPercentage: number;
  layerProgress: LayerProgress[];
  currentModule: Module | null;
  nextModules: Module[];
  criticalPath: Module[];
}

export interface LeverageScore {
  moduleId: string;
  moduleName: string;
  layer: number;
  description: string;
  score: number;
  reasoning: {
    dreamStateAlignment: number;
    downstreamUnlock: number;
    likelihood: number;
    time: number;
    effort: number;
  };
}

export interface RoadmapServiceOptions {
  roadmapPath?: string;
  statePath?: string;
}

// ============================================================================
// Service
// ============================================================================

export class RoadmapService {
  private roadmapPath: string;
  private statePath: string;
  private roadmap: Roadmap | null = null;

  constructor(options: RoadmapServiceOptions = {}) {
    this.roadmapPath = options.roadmapPath || path.join(process.cwd(), 'ROADMAP.md');
    this.statePath = options.statePath || path.join(process.cwd(), 'roadmap-state.json');
  }

  // --------------------------------------------------------------------------
  // Core Operations
  // --------------------------------------------------------------------------

  /**
   * Load roadmap from ROADMAP.md and state from roadmap-state.json
   */
  async load(): Promise<Roadmap> {
    // Check for existing state file first
    if (fs.existsSync(this.statePath)) {
      const stateContent = fs.readFileSync(this.statePath, 'utf-8');
      this.roadmap = RoadmapSchema.parse(JSON.parse(stateContent));
      return this.roadmap;
    }

    // Parse from ROADMAP.md
    if (!fs.existsSync(this.roadmapPath)) {
      throw new Error(`ROADMAP.md not found at ${this.roadmapPath}`);
    }

    const content = fs.readFileSync(this.roadmapPath, 'utf-8');
    this.roadmap = this.parseRoadmapMd(content);

    // Save initial state
    await this.save();

    return this.roadmap;
  }

  /**
   * Save current state to roadmap-state.json
   */
  async save(): Promise<void> {
    if (!this.roadmap) {
      throw new Error('No roadmap loaded');
    }

    this.roadmap.updatedAt = new Date().toISOString();
    fs.writeFileSync(this.statePath, JSON.stringify(this.roadmap, null, 2));
  }

  /**
   * Get the current roadmap
   */
  getRoadmap(): Roadmap {
    if (!this.roadmap) {
      throw new Error('Roadmap not loaded. Call load() first.');
    }
    return this.roadmap;
  }

  // --------------------------------------------------------------------------
  // Module Operations
  // --------------------------------------------------------------------------

  /**
   * Get a specific module by ID
   */
  getModule(moduleId: string): Module | null {
    if (!this.roadmap) return null;
    return this.roadmap.modules.find(m => m.id === moduleId) || null;
  }

  /**
   * Get all modules in a specific layer
   */
  getModulesByLayer(layer: number): Module[] {
    if (!this.roadmap) return [];
    return this.roadmap.modules.filter(m => m.layer === layer);
  }

  /**
   * Update module status
   */
  async updateModuleStatus(moduleId: string, status: ModuleStatus): Promise<Module> {
    if (!this.roadmap) {
      throw new Error('Roadmap not loaded');
    }

    const module = this.roadmap.modules.find(m => m.id === moduleId);
    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    module.status = status;

    if (status === 'in-progress' && !module.startedAt) {
      module.startedAt = new Date().toISOString();
      this.roadmap.currentModule = moduleId;
    }

    if (status === 'complete') {
      module.completedAt = new Date().toISOString();
      if (this.roadmap.currentModule === moduleId) {
        this.roadmap.currentModule = undefined;
      }
      // Update blocked modules that might now be unblocked
      this.updateBlockedModules();
    }

    await this.save();
    return module;
  }

  /**
   * Set the current active module
   */
  async setCurrentModule(moduleId: string): Promise<void> {
    if (!this.roadmap) {
      throw new Error('Roadmap not loaded');
    }

    const module = this.getModule(moduleId);
    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    this.roadmap.currentModule = moduleId;
    if (module.status === 'pending') {
      await this.updateModuleStatus(moduleId, 'in-progress');
    } else {
      await this.save();
    }
  }

  // --------------------------------------------------------------------------
  // Progress Calculation
  // --------------------------------------------------------------------------

  /**
   * Calculate overall roadmap progress
   */
  getProgress(): RoadmapProgress {
    if (!this.roadmap) {
      throw new Error('Roadmap not loaded');
    }

    const modules = this.roadmap.modules;
    const complete = modules.filter(m => m.status === 'complete');
    const inProgress = modules.filter(m => m.status === 'in-progress');
    const pending = modules.filter(m => m.status === 'pending');
    const blocked = modules.filter(m => m.status === 'blocked');

    // Calculate per-layer progress
    const layerProgress: LayerProgress[] = [];
    for (let layer = 0; layer <= 6; layer++) {
      const layerModules = modules.filter(m => m.layer === layer);
      if (layerModules.length > 0) {
        const layerComplete = layerModules.filter(m => m.status === 'complete').length;
        layerProgress.push({
          layer,
          total: layerModules.length,
          complete: layerComplete,
          inProgress: layerModules.filter(m => m.status === 'in-progress').length,
          pending: layerModules.filter(m => m.status === 'pending').length,
          blocked: layerModules.filter(m => m.status === 'blocked').length,
          percentage: Math.round((layerComplete / layerModules.length) * 100),
          modules: layerModules,
        });
      }
    }

    // Get current module
    const currentModule = this.roadmap.currentModule
      ? this.getModule(this.roadmap.currentModule)
      : null;

    // Get next available modules (ready to start)
    const nextModules = this.getNextAvailableModules();

    // Calculate critical path
    const criticalPath = this.calculateCriticalPath();

    return {
      totalModules: modules.length,
      completeModules: complete.length,
      inProgressModules: inProgress.length,
      pendingModules: pending.length,
      blockedModules: blocked.length,
      overallPercentage: Math.round((complete.length / modules.length) * 100),
      layerProgress,
      currentModule,
      nextModules,
      criticalPath,
    };
  }

  /**
   * Get modules that are ready to start (dependencies met)
   */
  getNextAvailableModules(): Module[] {
    if (!this.roadmap) return [];

    const completeIds = new Set(
      this.roadmap.modules
        .filter(m => m.status === 'complete')
        .map(m => m.id)
    );

    // Add "(exists)" dependencies as always satisfied
    const existingDeps = new Set(['leverage-protocol', 'analytics']);

    return this.roadmap.modules.filter(m => {
      if (m.status !== 'pending') return false;

      // Check if all dependencies are met
      return m.dependsOn.every(dep => {
        const cleanDep = dep.replace(' (exists)', '');
        return completeIds.has(cleanDep) || existingDeps.has(cleanDep) || dep === '—';
      });
    });
  }

  /**
   * Calculate the critical path through the dependency graph
   */
  calculateCriticalPath(): Module[] {
    if (!this.roadmap) return [];

    // Find modules with most downstream dependencies
    const moduleScores = new Map<string, number>();

    for (const module of this.roadmap.modules) {
      if (module.status !== 'complete') {
        const score = this.countDownstreamModules(module.id);
        moduleScores.set(module.id, score);
      }
    }

    // Sort by score descending and return top modules
    const sorted = Array.from(moduleScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sorted
      .map(([id]) => this.getModule(id))
      .filter((m): m is Module => m !== null);
  }

  // --------------------------------------------------------------------------
  // Leverage Protocol Integration
  // --------------------------------------------------------------------------

  /**
   * Calculate leverage score for available modules
   */
  calculateLeverageScores(): LeverageScore[] {
    const available = this.getNextAvailableModules();

    return available.map(module => {
      // Dream State Alignment (40%) - how directly does this advance the dream state
      const dsa = this.calculateDreamStateAlignment(module);

      // Downstream Unlock (25%) - how many modules does this unblock
      const downstreamCount = this.countDownstreamModules(module.id);
      const downstream = Math.min(downstreamCount / 5, 1) * 10; // normalize to 0-10

      // Likelihood (15%) - can we complete this given current context
      const likelihood = this.estimateLikelihood(module);

      // Time (10%) - inverse, faster is better
      const time = this.estimateTime(module);

      // Effort (10%) - inverse, lower is better
      const effort = this.estimateEffort(module);

      // Value equation: (DSA×0.40 + Unlock×0.25 + Likelihood×0.15) / (Time×0.10 + Effort×0.10)
      const numerator = (dsa * 0.40) + (downstream * 0.25) + (likelihood * 0.15);
      const denominator = Math.max((time * 0.10) + (effort * 0.10), 0.1);
      const score = numerator / denominator;

      return {
        moduleId: module.id,
        moduleName: module.name,
        layer: module.layer,
        description: module.description,
        score: Math.round(score * 10) / 10,
        reasoning: {
          dreamStateAlignment: dsa,
          downstreamUnlock: downstream,
          likelihood,
          time,
          effort,
        },
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Get the next highest leverage module
   */
  getNextHighestLeverageModule(): LeverageScore | null {
    const scores = this.calculateLeverageScores();
    return scores.length > 0 ? scores[0] : null;
  }

  // --------------------------------------------------------------------------
  // Terminal Visualization
  // --------------------------------------------------------------------------

  /**
   * Generate terminal-friendly roadmap visualization
   */
  generateTerminalView(): string {
    if (!this.roadmap) {
      return 'No roadmap loaded';
    }

    const progress = this.getProgress();
    const lines: string[] = [];

    // Header
    lines.push('╔══════════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                           SYSTEM ROADMAP                                         ║');
    lines.push('╠══════════════════════════════════════════════════════════════════════════════════╣');
    lines.push(`║  System: ${this.roadmap.system.padEnd(69)}║`);
    lines.push(`║  Progress: ${progress.completeModules}/${progress.totalModules} modules ${this.generateProgressBar(progress.overallPercentage, 20)} ${progress.overallPercentage}%`.padEnd(83) + '║');
    lines.push('╠══════════════════════════════════════════════════════════════════════════════════╣');

    // Layer progress
    for (const layer of progress.layerProgress.sort((a, b) => b.layer - a.layer)) {
      lines.push('║                                                                                  ║');
      lines.push(`║  Layer ${layer.layer}  ${this.generateProgressBar(layer.percentage, 15)} ${layer.complete}/${layer.total}`.padEnd(83) + '║');

      // Module list for this layer
      for (const module of layer.modules) {
        const status = this.getStatusIcon(module.status);
        const current = this.roadmap.currentModule === module.id ? ' ◄── HERE' : '';
        const moduleLine = `║    ${status} ${module.name}${current}`;
        lines.push(moduleLine.padEnd(83) + '║');
      }
    }

    lines.push('║                                                                                  ║');
    lines.push('╠══════════════════════════════════════════════════════════════════════════════════╣');

    // Next available modules
    if (progress.nextModules.length > 0) {
      lines.push('║  NEXT AVAILABLE                                                                  ║');
      const leverageScores = this.calculateLeverageScores();
      for (const score of leverageScores.slice(0, 3)) {
        const line = `║    → ${score.moduleName} (leverage: ${score.score})`;
        lines.push(line.padEnd(83) + '║');
      }
    }

    lines.push('╚══════════════════════════════════════════════════════════════════════════════════╝');

    return lines.join('\n');
  }

  /**
   * Generate a compact progress bar
   */
  private generateProgressBar(percentage: number, width: number): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Get status icon for a module
   */
  private getStatusIcon(status: ModuleStatus): string {
    switch (status) {
      case 'complete': return '✓';
      case 'in-progress': return '◉';
      case 'pending': return '○';
      case 'blocked': return '⊘';
      default: return '?';
    }
  }

  // --------------------------------------------------------------------------
  // Private Helpers
  // --------------------------------------------------------------------------

  /**
   * Parse ROADMAP.md into structured data
   */
  private parseRoadmapMd(content: string): Roadmap {
    const modules: Module[] = [];
    const updates: Update[] = [];
    const brainstorm: { idea: string; notes?: string }[] = [];

    // Extract system name
    const systemMatch = content.match(/\*\*System\*\*:\s*(.+?)(?:\s*—|$)/m);
    const system = systemMatch ? systemMatch[1].trim() : 'Unknown System';

    // Extract dream state
    const dreamStateMatch = content.match(/\*\*Dream State\*\*:\s*(.+)$/m);
    const dreamState = dreamStateMatch ? dreamStateMatch[1].trim() : '';

    // Parse layer sections
    const layerRegex = /## Layer (\d)\n\n\|[^\n]+\n\|[^\n]+\n((?:\|[^\n]+\n)+)/g;
    let match;

    while ((match = layerRegex.exec(content)) !== null) {
      const layer = parseInt(match[1], 10);
      const tableRows = match[2].trim().split('\n');

      for (const row of tableRows) {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length >= 2) {
          const nameMatch = cells[0].match(/\*\*(.+?)\*\*/);
          const name = nameMatch ? nameMatch[1] : cells[0];
          const description = cells[1];

          // Parse dependencies/unlocks from third column
          let dependsOn: string[] = [];
          let unlocks: string[] = [];

          if (cells[2]) {
            const thirdCol = cells[2];
            if (thirdCol !== '—') {
              // Check if it's "Unlocks" (Layer 0) or "Depends On" (other layers)
              if (content.includes(`## Layer ${layer}`) &&
                  content.substring(content.indexOf(`## Layer ${layer}`), content.indexOf(`## Layer ${layer}`) + 200).includes('Unlocks')) {
                unlocks = thirdCol.split(',').map(s => s.trim());
              } else {
                dependsOn = thirdCol.split(',').map(s => s.trim());
              }
            }
          }

          modules.push({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            description,
            layer,
            status: 'pending',
            dependsOn,
            unlocks,
          });
        }
      }
    }

    // Parse updates section
    const updatesMatch = content.match(/## Updates to Existing Modules\n\n\|[^\n]+\n\|[^\n]+\n((?:\|[^\n]+\n)+)/);
    if (updatesMatch) {
      const updateRows = updatesMatch[1].trim().split('\n');
      for (const row of updateRows) {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length >= 3) {
          const targetMatch = cells[0].match(/\*\*(.+?)\*\*/);
          const target = targetMatch ? targetMatch[1] : cells[0];
          updates.push({
            id: `update-${target.toLowerCase().replace(/\s+/g, '-')}`,
            target,
            description: cells[1],
            priority: cells[2].toLowerCase() as 'high' | 'medium' | 'low',
            status: 'pending',
          });
        }
      }
    }

    // Parse brainstorm section
    const brainstormMatch = content.match(/## Brainstorm[^\n]*\n\n\|[^\n]+\n\|[^\n]+\n((?:\|[^\n]+\n)+)/);
    if (brainstormMatch) {
      const brainstormRows = brainstormMatch[1].trim().split('\n');
      for (const row of brainstormRows) {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length >= 1) {
          const ideaMatch = cells[0].match(/\*\*(.+?)\*\*/);
          brainstorm.push({
            idea: ideaMatch ? ideaMatch[1] : cells[0],
            notes: cells[1] || undefined,
          });
        }
      }
    }

    // Update blocked status based on dependencies
    this.updateBlockedModulesInternal(modules);

    return {
      system,
      dreamState,
      modules,
      updates,
      brainstorm,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Update blocked modules based on current state
   */
  private updateBlockedModules(): void {
    if (!this.roadmap) return;
    this.updateBlockedModulesInternal(this.roadmap.modules);
  }

  private updateBlockedModulesInternal(modules: Module[]): void {
    const completeIds = new Set(
      modules.filter(m => m.status === 'complete').map(m => m.id)
    );
    const existingDeps = new Set(['leverage-protocol', 'analytics']);

    for (const module of modules) {
      if (module.status === 'pending' || module.status === 'blocked') {
        const hasUnmetDeps = module.dependsOn.some(dep => {
          if (dep === '—') return false;
          const cleanDep = dep.replace(' (exists)', '');
          return !completeIds.has(cleanDep) && !existingDeps.has(cleanDep);
        });

        module.status = hasUnmetDeps ? 'blocked' : 'pending';
      }
    }
  }

  /**
   * Count downstream modules that depend on this one
   */
  private countDownstreamModules(moduleId: string): number {
    if (!this.roadmap) return 0;

    let count = 0;
    const visited = new Set<string>();
    const queue = [moduleId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      for (const module of this.roadmap.modules) {
        if (module.dependsOn.some(d => d.includes(current)) && !visited.has(module.id)) {
          count++;
          queue.push(module.id);
        }
      }
    }

    return count;
  }

  /**
   * Calculate dream state alignment score (0-10)
   */
  private calculateDreamStateAlignment(module: Module): number {
    // Layer 0 modules are most aligned (they're foundational)
    // Lower layers = higher alignment
    const layerScore = 10 - (module.layer * 1.5);

    // Foundation modules get bonus
    if (module.layer === 0) return 10;

    return Math.max(layerScore, 3);
  }

  /**
   * Estimate likelihood of completion (0-10)
   */
  private estimateLikelihood(module: Module): number {
    // Base likelihood
    let likelihood = 7;

    // Fewer dependencies = higher likelihood
    const depCount = module.dependsOn.filter(d => d !== '—').length;
    likelihood += Math.max(0, 3 - depCount);

    return Math.min(likelihood, 10);
  }

  /**
   * Estimate time score (0-10, lower is better)
   */
  private estimateTime(module: Module): number {
    // Estimate based on description length and complexity
    const descLength = module.description.length;
    if (descLength < 100) return 3;
    if (descLength < 200) return 5;
    return 7;
  }

  /**
   * Estimate effort score (0-10, lower is better)
   */
  private estimateEffort(module: Module): number {
    // Foundation modules typically require more effort
    if (module.layer === 0) return 7;

    // Higher layers often build on existing work
    return Math.max(3, 7 - module.layer);
  }

  // --------------------------------------------------------------------------
  // Sync Operations
  // --------------------------------------------------------------------------

  /**
   * Mark a module as complete by name (fuzzy match)
   * Used by loop completion hook to auto-sync roadmap
   */
  async markModuleCompleteByName(moduleName: string): Promise<Module | null> {
    if (!this.roadmap) return null;

    // Try exact match first
    let module = this.roadmap.modules.find(
      m => m.id === moduleName || m.name.toLowerCase() === moduleName.toLowerCase()
    );

    // Try fuzzy match (contains)
    if (!module) {
      const normalized = moduleName.toLowerCase().replace(/[-_\s]/g, '');
      module = this.roadmap.modules.find(m => {
        const normalizedId = m.id.toLowerCase().replace(/[-_\s]/g, '');
        const normalizedName = m.name.toLowerCase().replace(/[-_\s]/g, '');
        return normalizedId.includes(normalized) || normalized.includes(normalizedId) ||
               normalizedName.includes(normalized) || normalized.includes(normalizedName);
      });
    }

    if (module && module.status !== 'complete') {
      return await this.updateModuleStatus(module.id, 'complete');
    }

    return module || null;
  }

  /**
   * Get drift status between roadmap and an external completion count
   */
  getDriftStatus(externalComplete: number, externalTotal: number): {
    hasDrift: boolean;
    roadmapComplete: number;
    roadmapTotal: number;
    roadmapPercentage: number;
    externalComplete: number;
    externalTotal: number;
    externalPercentage: number;
    driftAmount: number;
  } {
    const progress = this.getProgress();
    const roadmapPct = progress.overallPercentage;
    const externalPct = externalTotal > 0 ? Math.round((externalComplete / externalTotal) * 100) : 0;

    // Drift is significant if difference is > 3 modules or > 10%
    const driftAmount = Math.abs(progress.completeModules - externalComplete);
    const hasDrift = driftAmount >= 3 || Math.abs(roadmapPct - externalPct) >= 10;

    return {
      hasDrift,
      roadmapComplete: progress.completeModules,
      roadmapTotal: progress.totalModules,
      roadmapPercentage: roadmapPct,
      externalComplete,
      externalTotal,
      externalPercentage: externalPct,
      driftAmount,
    };
  }

  /**
   * Bulk sync: mark multiple modules as complete
   */
  async syncCompletedModules(moduleIds: string[]): Promise<{ synced: string[]; notFound: string[] }> {
    const synced: string[] = [];
    const notFound: string[] = [];

    for (const moduleId of moduleIds) {
      const result = await this.markModuleCompleteByName(moduleId);
      if (result) {
        synced.push(result.id);
      } else {
        notFound.push(moduleId);
      }
    }

    return { synced, notFound };
  }
}
