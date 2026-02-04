/**
 * DreamStateService - Manages system dream state with JSON source of truth
 *
 * PAT-017: JSON source of truth + generated markdown
 *
 * Core capabilities:
 * - Load/save dream state from .claude/dream-state.json
 * - Render DREAM-STATE.md from JSON
 * - Sync module status from RoadmapService
 * - Track function-level completion within modules
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

export const FunctionSchema = z.object({
  name: z.string(),
  complete: z.boolean(),
});
export type Function = z.infer<typeof FunctionSchema>;

export const ModuleStatusSchema = z.enum(['complete', 'in-progress', 'pending', 'deferred']);
export type ModuleStatus = z.infer<typeof ModuleStatusSchema>;

export const DreamModuleSchema = z.object({
  id: z.string(),
  path: z.string(),
  status: ModuleStatusSchema,
  functions: z.array(FunctionSchema).default([]),
  notes: z.string().optional(),
});
export type DreamModule = z.infer<typeof DreamModuleSchema>;

export const ActiveLoopSchema = z.object({
  loop: z.string(),
  phase: z.string(),
  scope: z.string(),
  startedAt: z.string(),
  lastUpdate: z.string(),
});
export type ActiveLoop = z.infer<typeof ActiveLoopSchema>;

export const CompletionSchema = z.object({
  date: z.string(),
  loop: z.string(),
  scope: z.string(),
  outcome: z.enum(['success', 'partial', 'failed']),
  deliverables: z.string(),
});
export type Completion = z.infer<typeof CompletionSchema>;

export const CompletionAlgebraSchema = z.object({
  formula: z.string(),
  current: z.string(),
  pending: z.string().optional(),
  status: z.string(),
  version: z.string(),
});
export type CompletionAlgebra = z.infer<typeof CompletionAlgebraSchema>;

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  date: z.string().optional(),
});
export type Note = z.infer<typeof NoteSchema>;

export const DreamStateSchema = z.object({
  system: z.string(),
  organization: z.string(),
  location: z.string(),
  roadmapRef: z.string().optional(),
  vision: z.string(),
  dreamStatement: z.string(),
  modules: z.array(DreamModuleSchema),
  completionAlgebra: CompletionAlgebraSchema,
  activeLoops: z.array(ActiveLoopSchema).default([]),
  recentCompletions: z.array(CompletionSchema).default([]),
  dependencies: z.object({
    dependsOn: z.array(z.string()).default([]),
    dependedOnBy: z.array(z.string()).default([]),
  }).default({ dependsOn: [], dependedOnBy: [] }),
  notes: z.array(NoteSchema).default([]),
  version: z.string().default('1.0.0'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type DreamState = z.infer<typeof DreamStateSchema>;

export interface DreamStateServiceOptions {
  statePath?: string;
  markdownPath?: string;
}

// ============================================================================
// Service
// ============================================================================

export class DreamStateService {
  private statePath: string;
  private markdownPath: string;
  private dreamState: DreamState | null = null;

  constructor(options: DreamStateServiceOptions = {}) {
    this.statePath = options.statePath || path.join(process.cwd(), '.claude', 'dream-state.json');
    this.markdownPath = options.markdownPath || path.join(process.cwd(), '.claude', 'DREAM-STATE.md');
  }

  // --------------------------------------------------------------------------
  // Core Operations
  // --------------------------------------------------------------------------

  /**
   * Load dream state from JSON file
   */
  async load(): Promise<DreamState> {
    if (fs.existsSync(this.statePath)) {
      const content = fs.readFileSync(this.statePath, 'utf-8');
      this.dreamState = DreamStateSchema.parse(JSON.parse(content));
      return this.dreamState;
    }

    throw new Error(`Dream state not found at ${this.statePath}. Run bootstrap first.`);
  }

  /**
   * Save dream state to JSON and regenerate markdown
   */
  async save(): Promise<void> {
    if (!this.dreamState) {
      throw new Error('No dream state loaded');
    }

    this.dreamState.updatedAt = new Date().toISOString();

    // Ensure directory exists
    const dir = path.dirname(this.statePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save JSON (source of truth)
    fs.writeFileSync(this.statePath, JSON.stringify(this.dreamState, null, 2));

    // Regenerate markdown (derived view)
    const markdown = this.renderMarkdown();
    fs.writeFileSync(this.markdownPath, markdown);
  }

  /**
   * Get the current dream state
   */
  getDreamState(): DreamState {
    if (!this.dreamState) {
      throw new Error('Dream state not loaded. Call load() first.');
    }
    return this.dreamState;
  }

  /**
   * Get completion algebra with function-level counts
   */
  getCompletionAlgebra(): {
    totalModules: number;
    completedModules: number;
    totalFunctions: number;
    completedFunctions: number;
    percentage: number;
    formula: string;
  } {
    if (!this.dreamState) {
      throw new Error('Dream state not loaded. Call load() first.');
    }

    const totalModules = this.dreamState.modules.length;
    const completedModules = this.dreamState.modules.filter(m => m.status === 'complete').length;

    let totalFunctions = 0;
    let completedFunctions = 0;
    for (const m of this.dreamState.modules) {
      totalFunctions += m.functions.length;
      completedFunctions += m.functions.filter(f => f.complete).length;
    }

    const percentage = totalFunctions > 0
      ? Math.round((completedFunctions / totalFunctions) * 100)
      : 0;

    return {
      totalModules,
      completedModules,
      totalFunctions,
      completedFunctions,
      percentage,
      formula: this.dreamState.completionAlgebra.formula,
    };
  }

  // --------------------------------------------------------------------------
  // Module Operations
  // --------------------------------------------------------------------------

  /**
   * Get a specific module by ID
   */
  getModule(moduleId: string): DreamModule | null {
    if (!this.dreamState) return null;
    return this.dreamState.modules.find(m => m.id === moduleId) || null;
  }

  /**
   * Update module status
   */
  async updateModuleStatus(moduleId: string, status: ModuleStatus): Promise<DreamModule> {
    if (!this.dreamState) {
      throw new Error('Dream state not loaded');
    }

    const module = this.dreamState.modules.find(m => m.id === moduleId);
    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    module.status = status;
    await this.save();
    return module;
  }

  /**
   * Update function completion within a module
   */
  async updateFunction(moduleId: string, functionName: string, complete: boolean): Promise<DreamModule> {
    if (!this.dreamState) {
      throw new Error('Dream state not loaded');
    }

    const module = this.dreamState.modules.find(m => m.id === moduleId);
    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    const func = module.functions.find(f => f.name === functionName);
    if (func) {
      func.complete = complete;
    } else {
      module.functions.push({ name: functionName, complete });
    }

    await this.save();
    return module;
  }

  /**
   * Add a new module
   */
  async addModule(module: DreamModule): Promise<void> {
    if (!this.dreamState) {
      throw new Error('Dream state not loaded');
    }

    const existing = this.dreamState.modules.find(m => m.id === module.id);
    if (existing) {
      throw new Error(`Module already exists: ${module.id}`);
    }

    this.dreamState.modules.push(module);
    this.updateCompletionAlgebra();
    await this.save();
  }

  // --------------------------------------------------------------------------
  // Sync Operations
  // --------------------------------------------------------------------------

  /**
   * Sync module statuses from roadmap
   * Called when roadmap changes to keep dream state aligned
   */
  syncFromRoadmap(roadmapModules: Array<{ id: string; status: string; name: string }>): {
    synced: string[];
    added: string[];
    notFound: string[];
  } {
    if (!this.dreamState) {
      throw new Error('Dream state not loaded');
    }

    const synced: string[] = [];
    const added: string[] = [];
    const notFound: string[] = [];

    for (const rm of roadmapModules) {
      // Map roadmap status to dream state status
      let status: ModuleStatus;
      switch (rm.status) {
        case 'complete':
          status = 'complete';
          break;
        case 'in-progress':
          status = 'in-progress';
          break;
        case 'deferred':
          status = 'deferred';
          break;
        default:
          status = 'pending';
      }

      // Find matching dream state module (fuzzy match on id/name)
      const dm = this.dreamState.modules.find(m =>
        m.id === rm.id ||
        m.id === rm.name ||
        m.id.toLowerCase().replace(/[-_]/g, '') === rm.id.toLowerCase().replace(/[-_]/g, '')
      );

      if (dm) {
        if (dm.status !== status) {
          dm.status = status;
          synced.push(dm.id);
        }
      } else {
        // Module exists in roadmap but not in dream state
        notFound.push(rm.id);
      }
    }

    // Update completion algebra after sync
    this.updateCompletionAlgebra();

    return { synced, added, notFound };
  }

  /**
   * Update completion algebra based on current module statuses
   */
  private updateCompletionAlgebra(): void {
    if (!this.dreamState) return;

    const total = this.dreamState.modules.length;
    const complete = this.dreamState.modules.filter(m => m.status === 'complete').length;
    const deferred = this.dreamState.modules.filter(m => m.status === 'deferred').length;
    const pending = this.dreamState.modules.filter(m => m.status === 'pending' || m.status === 'in-progress');

    this.dreamState.completionAlgebra.current = `${complete}/${total} modules complete (${Math.round((complete / total) * 100)}%)`;
    this.dreamState.completionAlgebra.pending = pending.length > 0
      ? pending.map(m => m.id).join(', ')
      : 'None';
  }

  // --------------------------------------------------------------------------
  // Completion Tracking
  // --------------------------------------------------------------------------

  /**
   * Record a loop completion
   */
  async recordCompletion(completion: Completion): Promise<void> {
    if (!this.dreamState) {
      throw new Error('Dream state not loaded');
    }

    // Add to front, keep last 20
    this.dreamState.recentCompletions.unshift(completion);
    if (this.dreamState.recentCompletions.length > 20) {
      this.dreamState.recentCompletions = this.dreamState.recentCompletions.slice(0, 20);
    }

    await this.save();
  }

  /**
   * Update active loops
   */
  async setActiveLoops(loops: ActiveLoop[]): Promise<void> {
    if (!this.dreamState) {
      throw new Error('Dream state not loaded');
    }

    this.dreamState.activeLoops = loops;
    await this.save();
  }

  // --------------------------------------------------------------------------
  // Markdown Rendering
  // --------------------------------------------------------------------------

  /**
   * Render dream state as markdown
   */
  renderMarkdown(): string {
    if (!this.dreamState) {
      throw new Error('Dream state not loaded');
    }

    const ds = this.dreamState;
    const lines: string[] = [];

    // Header
    lines.push(`# System Dream State: ${ds.system}`);
    lines.push('');
    lines.push('> This document defines "done" for the orchestrator system. All modules roll up here.');
    lines.push('');
    lines.push(`**Organization:** ${ds.organization}`);
    lines.push(`**Location:** ${ds.location}`);
    if (ds.roadmapRef) {
      lines.push(`**Roadmap:** [ROADMAP.md](${ds.roadmapRef}) — ${ds.modules.length} modules`);
    }
    lines.push('');

    // Vision
    lines.push('## Vision');
    lines.push('');
    lines.push(ds.vision);
    lines.push('');
    lines.push(`**Dream State:** ${ds.dreamStatement}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Modules table
    lines.push('## Modules');
    lines.push('');
    lines.push('| Module | Path | Status | Functions | Progress |');
    lines.push('|--------|------|--------|-----------|----------|');

    for (const m of ds.modules) {
      const total = m.functions.length;
      const complete = m.functions.filter(f => f.complete).length;
      const progress = total > 0 ? `${Math.round((complete / total) * 100)}%` : 'N/A';
      lines.push(`| ${m.id} | ${m.path} | ${m.status} | ${complete}/${total} | ${progress} |`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');

    // Module checklists
    lines.push('## Module Checklists');
    lines.push('');

    for (const m of ds.modules) {
      if (m.functions.length === 0) continue;

      lines.push(`### ${m.id} (${m.status})`);
      for (const f of m.functions) {
        const checkbox = f.complete ? '[x]' : '[ ]';
        lines.push(`- ${checkbox} ${f.name}`);
      }
      lines.push('');
    }
    lines.push('---');
    lines.push('');

    // Completion algebra
    lines.push('## Completion Algebra');
    lines.push('');
    lines.push('```');
    lines.push(ds.completionAlgebra.formula);
    lines.push('');
    lines.push(`Current: ${ds.completionAlgebra.current}`);
    if (ds.completionAlgebra.pending) {
      lines.push(`Pending: ${ds.completionAlgebra.pending}`);
    }
    lines.push(`Status: ${ds.completionAlgebra.status}`);
    lines.push(`Version: ${ds.completionAlgebra.version}`);
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');

    // Active loops
    lines.push('## Active Loops');
    lines.push('');
    lines.push('| Loop | Phase | Scope | Started | Last Update |');
    lines.push('|------|-------|-------|---------|-------------|');
    if (ds.activeLoops.length === 0) {
      lines.push('| (none) | | | | |');
    } else {
      for (const loop of ds.activeLoops) {
        lines.push(`| ${loop.loop} | ${loop.phase} | ${loop.scope} | ${loop.startedAt} | ${loop.lastUpdate} |`);
      }
    }
    lines.push('');
    lines.push('---');
    lines.push('');

    // Recent completions
    lines.push('## Recent Completions');
    lines.push('');
    lines.push('> Last completed loop runs for this system.');
    lines.push('');
    lines.push('| Date | Loop | Scope | Outcome | Key Deliverables |');
    lines.push('|------|------|-------|---------|------------------|');
    for (const c of ds.recentCompletions.slice(0, 10)) {
      lines.push(`| ${c.date} | ${c.loop} | ${c.scope} | ${c.outcome} | ${c.deliverables} |`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');

    // Dependencies
    lines.push('## Dependencies');
    lines.push('');
    lines.push(`**Depends on:** ${ds.dependencies.dependsOn.length > 0 ? ds.dependencies.dependsOn.join(', ') : 'None (root system)'}`);
    lines.push('');
    lines.push(`**Depended on by:** ${ds.dependencies.dependedOnBy.length > 0 ? ds.dependencies.dependedOnBy.join(', ') : 'None'}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Notes
    if (ds.notes.length > 0) {
      lines.push('## Notes');
      lines.push('');
      for (const note of ds.notes) {
        const dateStr = note.date ? ` (${note.date})` : '';
        lines.push(`- **${note.title}**${dateStr}`);
        lines.push(`  ${note.content}`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Footer
    lines.push(`*Generated from .claude/dream-state.json on ${new Date().toISOString().split('T')[0]}*`);

    return lines.join('\n');
  }

  // --------------------------------------------------------------------------
  // Bootstrap
  // --------------------------------------------------------------------------

  /**
   * Bootstrap dream state JSON from existing markdown
   * Only used for initial migration
   */
  static bootstrap(markdownPath: string, outputPath: string): DreamState {
    const content = fs.readFileSync(markdownPath, 'utf-8');

    // Parse basic info
    const systemMatch = content.match(/# System Dream State: (.+)/);
    const orgMatch = content.match(/\*\*Organization:\*\* (.+)/);
    const locationMatch = content.match(/\*\*Location:\*\* (.+)/);
    const visionMatch = content.match(/## Vision\n\n([\s\S]+?)\n\n\*\*Dream State:\*\*/);
    const dreamMatch = content.match(/\*\*Dream State:\*\* (.+)/);

    // Parse modules table
    const modules: DreamModule[] = [];
    const moduleTableMatch = content.match(/## Modules\n\n\|[^\n]+\n\|[^\n]+\n([\s\S]+?)\n\n---/);
    if (moduleTableMatch) {
      const rows = moduleTableMatch[1].trim().split('\n');
      for (const row of rows) {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length >= 4) {
          modules.push({
            id: cells[0],
            path: cells[1],
            status: cells[2] as ModuleStatus,
            functions: [],
          });
        }
      }
    }

    // Parse module checklists
    const checklistRegex = /### (\S+) \((\w+)\)\n((?:- \[[x ]\] .+\n?)+)/g;
    let match;
    while ((match = checklistRegex.exec(content)) !== null) {
      const moduleId = match[1];
      const checklistContent = match[3];
      const module = modules.find(m => m.id === moduleId);
      if (module) {
        const funcLines = checklistContent.trim().split('\n');
        for (const line of funcLines) {
          const funcMatch = line.match(/- \[(x| )\] (.+)/);
          if (funcMatch) {
            module.functions.push({
              name: funcMatch[2],
              complete: funcMatch[1] === 'x',
            });
          }
        }
      }
    }

    // Parse completion algebra
    const algebraMatch = content.match(/## Completion Algebra\n\n```\n([\s\S]+?)\n```/);
    let completionAlgebra: CompletionAlgebra = {
      formula: 'System.done = ALL(Module.done)',
      current: `${modules.length}/${modules.length}`,
      status: 'Bootstrapped',
      version: '1.0.0',
    };
    if (algebraMatch) {
      const algebraContent = algebraMatch[1];
      const formulaMatch = algebraContent.match(/^(System\.done[\s\S]+?)(?=\n\nCurrent:|$)/m);
      const currentMatch = algebraContent.match(/Current: (.+)/);
      const statusMatch = algebraContent.match(/Status: (.+)/);
      const versionMatch = algebraContent.match(/Version: (.+)/);

      completionAlgebra = {
        formula: formulaMatch ? formulaMatch[1].trim() : completionAlgebra.formula,
        current: currentMatch ? currentMatch[1] : completionAlgebra.current,
        status: statusMatch ? statusMatch[1] : completionAlgebra.status,
        version: versionMatch ? versionMatch[1] : completionAlgebra.version,
      };
    }

    // Parse recent completions
    const recentCompletions: Completion[] = [];
    const completionsMatch = content.match(/## Recent Completions[\s\S]+?\n\|[^\n]+\n\|[^\n]+\n([\s\S]+?)\n\n---/);
    if (completionsMatch) {
      const rows = completionsMatch[1].trim().split('\n');
      for (const row of rows) {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length >= 5 && cells[0] !== '(none)') {
          recentCompletions.push({
            date: cells[0],
            loop: cells[1],
            scope: cells[2],
            outcome: cells[3] as 'success' | 'partial' | 'failed',
            deliverables: cells[4],
          });
        }
      }
    }

    const dreamState: DreamState = {
      system: systemMatch ? systemMatch[1] : 'unknown',
      organization: orgMatch ? orgMatch[1] : 'unknown',
      location: locationMatch ? locationMatch[1] : process.cwd(),
      roadmapRef: '../ROADMAP.md',
      vision: visionMatch ? visionMatch[1].trim() : '',
      dreamStatement: dreamMatch ? dreamMatch[1] : '',
      modules,
      completionAlgebra,
      activeLoops: [],
      recentCompletions,
      dependencies: {
        dependsOn: [],
        dependedOnBy: ['dashboard', 'all other projects using orchestrator'],
      },
      notes: [],
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save bootstrapped state
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(dreamState, null, 2));

    return dreamState;
  }
}

export default DreamStateService;
