/**
 * Loop Composer - Load, validate, and compose loops from skills
 */

import { readFile, readdir, stat, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { watch, type FSWatcher } from 'fs';
import {
  parseLoopConfig,
  parseLoopMarkdown,
  configToLoop,
  validateLoopSkills,
  type LoopConfig,
} from '../parser/loopParser.js';
import type { SkillRegistry } from './SkillRegistry.js';
import type {
  Loop,
  LoopSummary,
  LoopPhase,
  Gate,
  Phase,
  LoopMode,
  AutonomyLevel,
} from '../types.js';

export interface LoopComposerOptions {
  loopsPath: string;
  watchEnabled?: boolean;
}

export class LoopComposer {
  private loops: Map<string, Loop> = new Map();
  private watchers: FSWatcher[] = [];
  private reindexTimeout: NodeJS.Timeout | null = null;

  constructor(
    private options: LoopComposerOptions,
    private skillRegistry: SkillRegistry
  ) {}

  /**
   * Initialize the composer by loading all loop definitions
   */
  async initialize(): Promise<void> {
    await this.indexAll();

    if (this.options.watchEnabled !== false) {
      this.startWatchers();
    }
  }

  /**
   * Index all loops from the loops directory
   */
  private async indexAll(): Promise<void> {
    this.loops.clear();

    try {
      const entries = await readdir(this.options.loopsPath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const loopDir = join(this.options.loopsPath, entry.name);
        const loopJsonPath = join(loopDir, 'loop.json');

        try {
          const stats = await stat(loopJsonPath);
          if (!stats.isFile()) continue;

          const loop = await this.loadLoop(loopDir);
          if (loop) {
            this.loops.set(loop.id, loop);
          }
        } catch {
          // loop.json doesn't exist, skip
        }
      }

      this.log('info', `Indexed ${this.loops.size} loops`);
    } catch (error) {
      this.log('warn', `Failed to index loops: ${error}`);
    }
  }

  /**
   * Load a single loop from its directory
   */
  private async loadLoop(loopDir: string): Promise<Loop | null> {
    try {
      // Load loop.json
      const jsonPath = join(loopDir, 'loop.json');
      const jsonContent = await readFile(jsonPath, 'utf-8');
      const config = parseLoopConfig(jsonContent);

      // Load LOOP.md if exists
      let markdownContent: string | undefined;
      try {
        const mdPath = join(loopDir, 'LOOP.md');
        const mdContent = await readFile(mdPath, 'utf-8');
        const parsed = parseLoopMarkdown(mdContent);
        markdownContent = parsed.content;
      } catch {
        // No LOOP.md
      }

      // Convert to Loop entity
      const loop = configToLoop(config, markdownContent);

      // Validate skills exist
      const availableSkills = new Set(
        this.skillRegistry.listSkills({ limit: 500 }).skills.map(s => s.id)
      );
      const validation = validateLoopSkills(loop, availableSkills);

      if (!validation.valid) {
        this.log('warn', `Loop ${loop.id} has missing skills: ${validation.missing.join(', ')}`);
      }

      return loop;
    } catch (error) {
      this.log('error', `Failed to load loop from ${loopDir}: ${error}`);
      return null;
    }
  }

  /**
   * Start file watchers
   */
  private startWatchers(): void {
    try {
      const watcher = watch(
        this.options.loopsPath,
        { recursive: true },
        (event, filename) => {
          if (filename?.endsWith('.json') || filename?.endsWith('.md')) {
            this.scheduleReindex();
          }
        }
      );
      this.watchers.push(watcher);
    } catch (error) {
      this.log('warn', `Failed to start loop watcher: ${error}`);
    }
  }

  private scheduleReindex(): void {
    if (this.reindexTimeout) {
      clearTimeout(this.reindexTimeout);
    }
    this.reindexTimeout = setTimeout(() => {
      this.log('info', 'Loop file change detected, re-indexing...');
      this.indexAll().catch((error) => {
        this.log('error', `Loop re-index failed: ${error}`);
      });
    }, 500);
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  get loopCount(): number {
    return this.loops.size;
  }

  /**
   * List all loops
   */
  listLoops(): LoopSummary[] {
    return [...this.loops.values()]
      .map(loop => ({
        id: loop.id,
        name: loop.name,
        version: loop.version,
        description: loop.description.slice(0, 200),
        phaseCount: loop.phases.length,
        skillCount: loop.skillCount,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get a loop by ID
   */
  getLoop(id: string): Loop | null {
    return this.loops.get(id) || null;
  }

  /**
   * Create a new loop from configuration
   */
  async createLoop(config: LoopConfig): Promise<Loop> {
    // Validate skills exist
    const availableSkills = new Set(
      this.skillRegistry.listSkills({ limit: 500 }).skills.map(s => s.id)
    );

    const allSkills = config.phases.flatMap(p => p.skills);
    const missing = allSkills.filter(s => !availableSkills.has(s));

    if (missing.length > 0) {
      throw new Error(`Missing skills: ${missing.join(', ')}`);
    }

    // Create loop directory
    const loopDir = join(this.options.loopsPath, config.id);
    await mkdir(loopDir, { recursive: true });

    // Write loop.json
    const jsonPath = join(loopDir, 'loop.json');
    await writeFile(jsonPath, JSON.stringify(config, null, 2));

    // Write LOOP.md
    const mdPath = join(loopDir, 'LOOP.md');
    const mdContent = `# ${config.name}

${config.description || ''}

## Phases

${config.phases.map(p => `### ${p.name}\n${p.skills.map(s => `- ${s}`).join('\n')}`).join('\n\n')}
`;
    await writeFile(mdPath, mdContent);

    // Reload
    await this.indexAll();

    return this.loops.get(config.id)!;
  }

  /**
   * Compose a loop from natural language description
   */
  async composeFromDescription(description: string): Promise<LoopConfig> {
    // Get available skills
    const skills = this.skillRegistry.listSkills({ limit: 500 }).skills;

    // This is a simplified composition - in practice, this would use
    // Claude to interpret the description and select appropriate skills
    const config: LoopConfig = {
      id: `custom-loop-${Date.now()}`,
      name: 'Custom Loop',
      version: '1.0.0',
      description,
      phases: [
        {
          name: 'INIT' as Phase,
          skills: skills.filter(s => s.phase === 'INIT').map(s => s.id),
        },
        {
          name: 'IMPLEMENT' as Phase,
          skills: skills.filter(s => s.phase === 'IMPLEMENT').map(s => s.id),
        },
        {
          name: 'COMPLETE' as Phase,
          skills: ['loop-controller'],
        },
      ].filter(p => p.skills.length > 0),
    };

    return config;
  }

  /**
   * Validate a loop configuration
   */
  validateLoop(config: LoopConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!config.id) errors.push('Missing loop id');
    if (!config.name) errors.push('Missing loop name');
    if (!config.phases || config.phases.length === 0) {
      errors.push('No phases defined');
    }

    // Check skills exist
    const availableSkills = new Set(
      this.skillRegistry.listSkills({ limit: 500 }).skills.map(s => s.id)
    );

    for (const phase of config.phases || []) {
      for (const skillId of phase.skills) {
        if (!availableSkills.has(skillId)) {
          errors.push(`Skill not found: ${skillId}`);
        }
      }
    }

    // Check for loop-controller
    const hasLoopController = config.phases?.some(p =>
      p.skills.includes('loop-controller')
    );
    if (!hasLoopController) {
      warnings.push('Loop does not include loop-controller skill');
    }

    // Check gate references valid phases
    for (const gate of config.gates || []) {
      const phaseExists = config.phases?.some(p => p.name === gate.afterPhase);
      if (!phaseExists) {
        errors.push(`Gate ${gate.id} references non-existent phase: ${gate.afterPhase}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get phases for a loop with skill details
   */
  getLoopPhases(loopId: string): LoopPhase[] | null {
    const loop = this.loops.get(loopId);
    if (!loop) return null;
    return loop.phases;
  }

  /**
   * Get gates for a loop
   */
  getLoopGates(loopId: string): Gate[] | null {
    const loop = this.loops.get(loopId);
    if (!loop) return null;
    return loop.gates;
  }

  /**
   * Force re-index
   */
  async refresh(): Promise<{ indexed: number }> {
    await this.indexAll();
    return { indexed: this.loops.size };
  }

  /**
   * Clean up
   */
  destroy(): void {
    if (this.reindexTimeout) {
      clearTimeout(this.reindexTimeout);
    }
    for (const watcher of this.watchers) {
      watcher.close();
    }
    this.watchers = [];
  }

  private log(level: string, message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'LoopComposer',
      message,
    }));
  }
}
