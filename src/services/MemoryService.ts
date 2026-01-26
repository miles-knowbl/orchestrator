/**
 * Memory Service - Hierarchical memory management
 *
 * Memory exists at three levels:
 * - Orchestrator: Global patterns and decisions
 * - Loop: Loop-specific learning
 * - Skill: Skill-specific calibration
 */

import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { randomUUID } from 'crypto';
import type {
  Memory,
  MemoryLevel,
  Decision,
  Pattern,
  CalibrationData,
  Handoff,
  CalibrationAdjustment,
} from '../types.js';

export interface MemoryServiceOptions {
  memoryPath: string;  // Path to memory/ directory
}

export class MemoryService {
  private memories: Map<string, Memory> = new Map();

  constructor(private options: MemoryServiceOptions) {}

  /**
   * Initialize by loading all memory files
   */
  async initialize(): Promise<void> {
    await mkdir(this.options.memoryPath, { recursive: true });
    await mkdir(join(this.options.memoryPath, 'loops'), { recursive: true });
    await mkdir(join(this.options.memoryPath, 'skills'), { recursive: true });

    // Load orchestrator memory
    await this.loadMemory('orchestrator', 'orchestrator');

    // Load loop memories
    try {
      const loopFiles = await readdir(join(this.options.memoryPath, 'loops'));
      for (const file of loopFiles) {
        if (file.endsWith('.json')) {
          const id = file.replace('.json', '');
          await this.loadMemory(`loop:${id}`, 'loop', id);
        }
      }
    } catch {
      // No loop memories yet
    }

    // Load skill memories
    try {
      const skillFiles = await readdir(join(this.options.memoryPath, 'skills'));
      for (const file of skillFiles) {
        if (file.endsWith('.json')) {
          const id = file.replace('.json', '');
          await this.loadMemory(`skill:${id}`, 'skill', id);
        }
      }
    } catch {
      // No skill memories yet
    }

    this.log('info', `Loaded ${this.memories.size} memory entries`);
  }

  /**
   * Load a memory file
   */
  private async loadMemory(
    key: string,
    level: MemoryLevel,
    entityId?: string
  ): Promise<Memory | null> {
    const path = this.getMemoryPath(level, entityId);

    try {
      const content = await readFile(path, 'utf-8');
      const data = JSON.parse(content);

      const memory: Memory = {
        id: data.id || key,
        level,
        parentId: level === 'loop' ? 'orchestrator' : level === 'skill' ? undefined : undefined,
        loopId: level === 'loop' ? entityId : undefined,
        skillId: level === 'skill' ? entityId : undefined,
        summary: data.summary,
        decisions: (data.decisions || []).map((d: any) => ({
          ...d,
          timestamp: new Date(d.timestamp),
        })),
        patterns: (data.patterns || []).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          lastUsed: p.lastUsed ? new Date(p.lastUsed) : undefined,
        })),
        calibration: data.calibration || this.defaultCalibration(),
        handoff: data.handoff ? {
          ...data.handoff,
          sessionDate: new Date(data.handoff.sessionDate),
        } : undefined,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      };

      this.memories.set(key, memory);
      return memory;
    } catch {
      // Create default memory
      const memory = this.createDefaultMemory(key, level, entityId);
      this.memories.set(key, memory);
      await this.saveMemory(memory);
      return memory;
    }
  }

  /**
   * Get memory path based on level
   */
  private getMemoryPath(level: MemoryLevel, entityId?: string): string {
    switch (level) {
      case 'orchestrator':
        return join(this.options.memoryPath, 'orchestrator.json');
      case 'loop':
        return join(this.options.memoryPath, 'loops', `${entityId}.json`);
      case 'skill':
        return join(this.options.memoryPath, 'skills', `${entityId}.json`);
    }
  }

  /**
   * Create default memory structure
   */
  private createDefaultMemory(
    id: string,
    level: MemoryLevel,
    entityId?: string
  ): Memory {
    return {
      id,
      level,
      loopId: level === 'loop' ? entityId : undefined,
      skillId: level === 'skill' ? entityId : undefined,
      decisions: [],
      patterns: [],
      calibration: this.defaultCalibration(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Default calibration data
   */
  private defaultCalibration(): CalibrationData {
    return {
      estimates: [],
      adjustments: {
        global: { multiplier: 1.0, samples: 0 },
      },
    };
  }

  /**
   * Save memory to disk
   */
  private async saveMemory(memory: Memory): Promise<void> {
    const path = this.getMemoryPath(memory.level, memory.loopId || memory.skillId);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(memory, null, 2));
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Get memory by level and optional entity ID
   */
  getMemory(level: MemoryLevel, entityId?: string): Memory | null {
    const key = level === 'orchestrator' ? 'orchestrator' : `${level}:${entityId}`;
    return this.memories.get(key) || null;
  }

  /**
   * Get or create memory
   */
  async getOrCreateMemory(level: MemoryLevel, entityId?: string): Promise<Memory> {
    const existing = this.getMemory(level, entityId);
    if (existing) return existing;

    const key = level === 'orchestrator' ? 'orchestrator' : `${level}:${entityId}`;
    const memory = this.createDefaultMemory(key, level, entityId);
    this.memories.set(key, memory);
    await this.saveMemory(memory);
    return memory;
  }

  /**
   * Update memory summary
   */
  async updateSummary(
    level: MemoryLevel,
    entityId: string | undefined,
    summary: string
  ): Promise<Memory> {
    const memory = await this.getOrCreateMemory(level, entityId);
    memory.summary = summary;
    memory.updatedAt = new Date();
    await this.saveMemory(memory);
    return memory;
  }

  /**
   * Record a decision (ADR)
   */
  async recordDecision(
    level: MemoryLevel,
    entityId: string | undefined,
    decision: Omit<Decision, 'id' | 'timestamp'>
  ): Promise<Decision> {
    const memory = await this.getOrCreateMemory(level, entityId);

    const fullDecision: Decision = {
      id: `ADR-${String(memory.decisions.length + 1).padStart(3, '0')}`,
      ...decision,
      timestamp: new Date(),
    };

    memory.decisions.push(fullDecision);
    memory.updatedAt = new Date();
    await this.saveMemory(memory);

    this.log('info', `Recorded decision ${fullDecision.id}: ${decision.title}`);
    return fullDecision;
  }

  /**
   * Record a pattern
   */
  async recordPattern(
    level: MemoryLevel,
    entityId: string | undefined,
    pattern: Omit<Pattern, 'id' | 'uses' | 'createdAt'>
  ): Promise<Pattern> {
    const memory = await this.getOrCreateMemory(level, entityId);

    // Check for existing pattern with same name
    const existing = memory.patterns.find(p => p.name === pattern.name);
    if (existing) {
      existing.uses++;
      existing.lastUsed = new Date();
      existing.confidence = this.updateConfidence(existing.uses);
      memory.updatedAt = new Date();
      await this.saveMemory(memory);
      return existing;
    }

    const fullPattern: Pattern = {
      id: `PAT-${String(memory.patterns.length + 1).padStart(3, '0')}`,
      ...pattern,
      uses: 1,
      confidence: 'low',
      createdAt: new Date(),
    };

    memory.patterns.push(fullPattern);
    memory.updatedAt = new Date();
    await this.saveMemory(memory);

    this.log('info', `Recorded pattern ${fullPattern.id}: ${pattern.name}`);
    return fullPattern;
  }

  /**
   * Update pattern confidence based on uses
   */
  private updateConfidence(uses: number): 'low' | 'medium' | 'high' {
    if (uses >= 10) return 'high';
    if (uses >= 5) return 'medium';
    return 'low';
  }

  /**
   * Create a session handoff
   */
  async createHandoff(
    level: MemoryLevel,
    entityId: string | undefined,
    handoff: Omit<Handoff, 'id' | 'sessionDate'>
  ): Promise<Handoff> {
    const memory = await this.getOrCreateMemory(level, entityId);

    const fullHandoff: Handoff = {
      id: `HO-${Date.now().toString(36).toUpperCase()}`,
      sessionDate: new Date(),
      ...handoff,
    };

    memory.handoff = fullHandoff;
    memory.updatedAt = new Date();
    await this.saveMemory(memory);

    this.log('info', `Created handoff ${fullHandoff.id}`);
    return fullHandoff;
  }

  /**
   * Load context for cold boot
   */
  async loadContext(level: MemoryLevel, entityId?: string): Promise<{
    summary?: string;
    recentDecisions: Decision[];
    topPatterns: Pattern[];
    handoff?: Handoff;
    calibration: CalibrationData;
  }> {
    const memory = await this.getOrCreateMemory(level, entityId);

    // Get recent decisions (last 5)
    const recentDecisions = memory.decisions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);

    // Get top patterns by confidence and usage
    const topPatterns = memory.patterns
      .sort((a, b) => {
        const confScore = { high: 3, medium: 2, low: 1 };
        return (confScore[b.confidence] * b.uses) - (confScore[a.confidence] * a.uses);
      })
      .slice(0, 10);

    return {
      summary: memory.summary,
      recentDecisions,
      topPatterns,
      handoff: memory.handoff,
      calibration: memory.calibration,
    };
  }

  /**
   * Get calibration data
   */
  getCalibration(level: MemoryLevel, entityId?: string): CalibrationData | null {
    const memory = this.getMemory(level, entityId);
    return memory?.calibration || null;
  }

  /**
   * Update calibration with new estimate/actual pair
   */
  async updateCalibration(
    level: MemoryLevel,
    entityId: string | undefined,
    estimate: { hours: number; complexity: string },
    actual: { hours: number },
    factors?: Record<string, boolean>
  ): Promise<CalibrationData> {
    const memory = await this.getOrCreateMemory(level, entityId);

    const ratio = actual.hours / estimate.hours;

    // Add to estimates history
    memory.calibration.estimates.push({
      id: `EST-${Date.now().toString(36)}`,
      estimated: estimate,
      actual,
      ratio,
      factors: factors || {},
      timestamp: new Date(),
    });

    // Update global adjustment
    const globalAdj = memory.calibration.adjustments.global;
    globalAdj.multiplier = this.calculateNewMultiplier(
      globalAdj.multiplier,
      globalAdj.samples,
      ratio
    );
    globalAdj.samples++;

    memory.updatedAt = new Date();
    await this.saveMemory(memory);

    return memory.calibration;
  }

  /**
   * Calculate new calibration multiplier using exponential moving average
   */
  private calculateNewMultiplier(
    currentMultiplier: number,
    samples: number,
    newRatio: number
  ): number {
    // Weight newer samples more heavily, but cap influence
    const alpha = Math.min(0.3, 1 / (samples + 1));
    return currentMultiplier * (1 - alpha) + newRatio * alpha;
  }

  /**
   * Get all memories at a level
   */
  listMemories(level: MemoryLevel): Memory[] {
    const prefix = level === 'orchestrator' ? 'orchestrator' : `${level}:`;
    return [...this.memories.values()].filter(m =>
      level === 'orchestrator' ? m.id === 'orchestrator' : m.id.startsWith(prefix)
    );
  }

  private log(level: string, message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'MemoryService',
      message,
    }));
  }
}
