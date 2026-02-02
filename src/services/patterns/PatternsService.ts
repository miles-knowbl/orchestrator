/**
 * PatternsService - Pattern roundup and automatic detection
 *
 * Two core functions:
 * 1. Round up existing patterns not yet formalized into memory
 * 2. Automatic pattern detection and proposal from observed behaviors
 *
 * Part of the patterns-roundup module (Layer 2).
 */

import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import type { Pattern, MemoryLevel } from '../../types.js';
import type { MemoryService } from '../MemoryService.js';
import type { AnalyticsService } from '../analytics/index.js';

// ============================================================================
// Types
// ============================================================================

export interface PatternsServiceOptions {
  memoryPath: string;
  skillsPath: string;
  runsPath: string;
}

export interface PatternQuery {
  level?: MemoryLevel;
  entityId?: string;
  confidence?: 'low' | 'medium' | 'high';
  minUses?: number;
  search?: string;  // Search in name, context, solution
  tags?: string[];
}

export interface PatternWithLevel extends Pattern {
  level: MemoryLevel;
  entityId?: string;
}

export interface DetectedPattern {
  id: string;
  name: string;
  type: 'behavioral' | 'success' | 'failure' | 'codebase';
  context: string;
  solution: string;
  evidence: PatternEvidence[];
  confidence: number;  // 0-1
  occurrences: number;
  suggestedLevel: MemoryLevel;
  source: string;
  detectedAt: string;
}

export interface PatternEvidence {
  type: 'run' | 'file' | 'skill' | 'loop';
  reference: string;
  description: string;
  timestamp?: string;
}

export interface PatternGap {
  category: string;
  description: string;
  suggestedName: string;
  suggestedContext: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
}

export interface PatternRoundup {
  generatedAt: string;
  level: MemoryLevel;
  entityId?: string;
  summary: {
    total: number;
    byConfidence: Record<string, number>;
    avgUses: number;
    mostUsed: Pattern[];
    leastUsed: Pattern[];
    recentlyAdded: Pattern[];
  };
  patterns: PatternWithLevel[];
  markdown: string;
}

export interface PatternDetectionResult {
  detectedAt: string;
  patterns: DetectedPattern[];
  gaps: PatternGap[];
  summary: {
    totalDetected: number;
    byType: Record<string, number>;
    totalGaps: number;
    highPriorityGaps: number;
  };
}

// ============================================================================
// Service
// ============================================================================

export class PatternsService {
  private memoryService: MemoryService | null = null;
  private analyticsService: AnalyticsService | null = null;

  constructor(private options: PatternsServiceOptions) {}

  /**
   * Set dependencies (called after construction to avoid circular deps)
   */
  setDependencies(deps: {
    memoryService: MemoryService;
    analyticsService?: AnalyticsService;
  }): void {
    this.memoryService = deps.memoryService;
    this.analyticsService = deps.analyticsService || null;
  }

  // --------------------------------------------------------------------------
  // Query Operations
  // --------------------------------------------------------------------------

  /**
   * Query patterns across all levels with filtering
   */
  async queryPatterns(query: PatternQuery = {}): Promise<PatternWithLevel[]> {
    if (!this.memoryService) {
      throw new Error('MemoryService not set. Call setDependencies first.');
    }

    const results: PatternWithLevel[] = [];

    // Get patterns from orchestrator level
    if (!query.level || query.level === 'orchestrator') {
      const orchestratorMemory = await this.memoryService.getMemory('orchestrator');
      if (orchestratorMemory) {
        for (const pattern of orchestratorMemory.patterns) {
          if (this.matchesQuery(pattern, query)) {
            results.push({ ...pattern, level: 'orchestrator' });
          }
        }
      }
    }

    // Get patterns from loop level
    if (!query.level || query.level === 'loop') {
      const loopFiles = await this.listMemoryFiles('loops');
      for (const loopId of loopFiles) {
        if (query.entityId && query.entityId !== loopId) continue;
        const loopMemory = await this.memoryService.getMemory('loop', loopId);
        if (loopMemory) {
          for (const pattern of loopMemory.patterns) {
            if (this.matchesQuery(pattern, query)) {
              results.push({ ...pattern, level: 'loop', entityId: loopId });
            }
          }
        }
      }
    }

    // Get patterns from skill level
    if (!query.level || query.level === 'skill') {
      const skillFiles = await this.listMemoryFiles('skills');
      for (const skillId of skillFiles) {
        if (query.entityId && query.entityId !== skillId) continue;
        const skillMemory = await this.memoryService.getMemory('skill', skillId);
        if (skillMemory) {
          for (const pattern of skillMemory.patterns) {
            if (this.matchesQuery(pattern, query)) {
              results.push({ ...pattern, level: 'skill', entityId: skillId });
            }
          }
        }
      }
    }

    // Sort by uses descending
    return results.sort((a, b) => b.uses - a.uses);
  }

  /**
   * Get a single pattern by ID
   */
  async getPattern(patternId: string): Promise<PatternWithLevel | null> {
    const allPatterns = await this.queryPatterns();
    return allPatterns.find(p => p.id === patternId) || null;
  }

  /**
   * Get patterns by confidence level
   */
  async getPatternsByConfidence(confidence: 'low' | 'medium' | 'high'): Promise<PatternWithLevel[]> {
    return this.queryPatterns({ confidence });
  }

  // --------------------------------------------------------------------------
  // Roundup Operations
  // --------------------------------------------------------------------------

  /**
   * Generate a pattern roundup summary
   */
  async generateRoundup(
    level: MemoryLevel = 'orchestrator',
    entityId?: string
  ): Promise<PatternRoundup> {
    const patterns = await this.queryPatterns({ level, entityId });

    // Calculate summary stats
    const byConfidence: Record<string, number> = { low: 0, medium: 0, high: 0 };
    let totalUses = 0;

    for (const pattern of patterns) {
      byConfidence[pattern.confidence]++;
      totalUses += pattern.uses;
    }

    const sortedByUses = [...patterns].sort((a, b) => b.uses - a.uses);
    const sortedByDate = [...patterns].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const summary = {
      total: patterns.length,
      byConfidence,
      avgUses: patterns.length > 0 ? Math.round(totalUses / patterns.length) : 0,
      mostUsed: sortedByUses.slice(0, 5),
      leastUsed: sortedByUses.slice(-5).reverse(),
      recentlyAdded: sortedByDate.slice(0, 5),
    };

    // Generate markdown
    const markdown = this.generateRoundupMarkdown(level, entityId, summary, patterns);

    return {
      generatedAt: new Date().toISOString(),
      level,
      entityId,
      summary,
      patterns,
      markdown,
    };
  }

  /**
   * Generate markdown representation of roundup
   */
  private generateRoundupMarkdown(
    level: MemoryLevel,
    entityId: string | undefined,
    summary: PatternRoundup['summary'],
    patterns: PatternWithLevel[]
  ): string {
    const lines: string[] = [];
    const levelLabel = entityId ? `${level}/${entityId}` : level;

    lines.push(`# Pattern Roundup: ${levelLabel}`);
    lines.push('');
    lines.push(`> Generated at ${new Date().toISOString()}`);
    lines.push('');

    // Summary stats
    lines.push('## Summary');
    lines.push('');
    lines.push(`- **Total Patterns:** ${summary.total}`);
    lines.push(`- **By Confidence:** High: ${summary.byConfidence.high}, Medium: ${summary.byConfidence.medium}, Low: ${summary.byConfidence.low}`);
    lines.push(`- **Average Uses:** ${summary.avgUses}`);
    lines.push('');

    // Most used
    if (summary.mostUsed.length > 0) {
      lines.push('## Most Used Patterns');
      lines.push('');
      lines.push('| Pattern | Uses | Confidence |');
      lines.push('|---------|------|------------|');
      for (const p of summary.mostUsed) {
        lines.push(`| ${p.name} | ${p.uses} | ${p.confidence} |`);
      }
      lines.push('');
    }

    // Recently added
    if (summary.recentlyAdded.length > 0) {
      lines.push('## Recently Added');
      lines.push('');
      lines.push('| Pattern | Added | Confidence |');
      lines.push('|---------|-------|------------|');
      for (const p of summary.recentlyAdded) {
        const date = new Date(p.createdAt).toISOString().split('T')[0];
        lines.push(`| ${p.name} | ${date} | ${p.confidence} |`);
      }
      lines.push('');
    }

    // Full pattern list
    lines.push('## All Patterns');
    lines.push('');

    for (const pattern of patterns) {
      lines.push(`### ${pattern.name}`);
      lines.push('');
      lines.push(`**ID:** ${pattern.id}`);
      lines.push(`**Uses:** ${pattern.uses} | **Confidence:** ${pattern.confidence}`);
      lines.push('');
      lines.push('**Context:**');
      lines.push(pattern.context);
      lines.push('');
      lines.push('**Solution:**');
      lines.push(pattern.solution);
      lines.push('');
      if (pattern.example) {
        lines.push('**Example:**');
        lines.push('```');
        lines.push(pattern.example);
        lines.push('```');
        lines.push('');
      }
      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }

  // --------------------------------------------------------------------------
  // Detection Operations
  // --------------------------------------------------------------------------

  /**
   * Run automatic pattern detection
   */
  async detectPatterns(): Promise<PatternDetectionResult> {
    const detectedPatterns: DetectedPattern[] = [];
    const gaps: PatternGap[] = [];

    // 1. Detect behavioral patterns from run archives
    const behavioralPatterns = await this.detectBehavioralPatterns();
    detectedPatterns.push(...behavioralPatterns);

    // 2. Detect patterns from codebase (skills, loops)
    const codebasePatterns = await this.detectCodebasePatterns();
    detectedPatterns.push(...codebasePatterns);

    // 3. Identify pattern gaps
    const identifiedGaps = await this.identifyPatternGaps();
    gaps.push(...identifiedGaps);

    // Calculate summary
    const byType: Record<string, number> = {};
    for (const p of detectedPatterns) {
      byType[p.type] = (byType[p.type] || 0) + 1;
    }

    return {
      detectedAt: new Date().toISOString(),
      patterns: detectedPatterns,
      gaps,
      summary: {
        totalDetected: detectedPatterns.length,
        byType,
        totalGaps: gaps.length,
        highPriorityGaps: gaps.filter(g => g.priority === 'high').length,
      },
    };
  }

  /**
   * Detect behavioral patterns from run archives
   */
  private async detectBehavioralPatterns(): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];

    try {
      // Get run archives
      const runsDir = this.options.runsPath;
      const months = await readdir(runsDir).catch(() => []);

      const runFiles: string[] = [];
      for (const month of months) {
        const monthDir = join(runsDir, month);
        try {
          const files = await readdir(monthDir);
          runFiles.push(...files.filter(f => f.endsWith('.json')).map(f => join(monthDir, f)));
        } catch {
          // Skip if not a directory
        }
      }

      // Analyze runs for patterns
      const loopSuccessRates: Record<string, { success: number; total: number }> = {};
      const phasePatterns: Record<string, { skipped: number; failed: number; total: number }> = {};

      for (const runFile of runFiles.slice(-50)) {  // Last 50 runs
        try {
          const content = await readFile(runFile, 'utf-8');
          const run = JSON.parse(content);

          // Track loop success rates
          const loopId = run.loopId || 'unknown';
          if (!loopSuccessRates[loopId]) {
            loopSuccessRates[loopId] = { success: 0, total: 0 };
          }
          loopSuccessRates[loopId].total++;
          if (run.status === 'completed' || run.outcome === 'success') {
            loopSuccessRates[loopId].success++;
          }

          // Track phase patterns
          if (run.phases) {
            for (const [phase, data] of Object.entries(run.phases as Record<string, any>)) {
              if (!phasePatterns[phase]) {
                phasePatterns[phase] = { skipped: 0, failed: 0, total: 0 };
              }
              phasePatterns[phase].total++;
              if (data.status === 'skipped') phasePatterns[phase].skipped++;
              if (data.status === 'failed') phasePatterns[phase].failed++;
            }
          }
        } catch {
          // Skip invalid run files
        }
      }

      // Generate patterns from analysis
      for (const [loopId, stats] of Object.entries(loopSuccessRates)) {
        if (stats.total >= 3) {
          const successRate = stats.success / stats.total;

          if (successRate >= 0.9) {
            patterns.push({
              id: `detected-success-${loopId}`,
              name: `${loopId}-success-pattern`,
              type: 'success',
              context: `When running ${loopId} with proper context`,
              solution: `Follow established ${loopId} workflow patterns`,
              evidence: [{
                type: 'run',
                reference: loopId,
                description: `${Math.round(successRate * 100)}% success rate across ${stats.total} runs`,
              }],
              confidence: successRate,
              occurrences: stats.total,
              suggestedLevel: 'loop',
              source: 'behavioral-detection',
              detectedAt: new Date().toISOString(),
            });
          } else if (successRate < 0.5 && stats.total >= 5) {
            patterns.push({
              id: `detected-failure-${loopId}`,
              name: `${loopId}-failure-pattern`,
              type: 'failure',
              context: `Common failure points in ${loopId}`,
              solution: `Review ${loopId} prerequisites and context requirements`,
              evidence: [{
                type: 'run',
                reference: loopId,
                description: `Only ${Math.round(successRate * 100)}% success rate across ${stats.total} runs`,
              }],
              confidence: 1 - successRate,
              occurrences: stats.total - stats.success,
              suggestedLevel: 'loop',
              source: 'behavioral-detection',
              detectedAt: new Date().toISOString(),
            });
          }
        }
      }

      // Detect frequently skipped phases
      for (const [phase, stats] of Object.entries(phasePatterns)) {
        if (stats.total >= 5 && stats.skipped / stats.total > 0.3) {
          patterns.push({
            id: `detected-skip-${phase}`,
            name: `${phase}-skip-pattern`,
            type: 'behavioral',
            context: `${phase} phase is frequently skipped`,
            solution: `Consider making ${phase} optional or reviewing its necessity`,
            evidence: [{
              type: 'run',
              reference: phase,
              description: `Skipped ${Math.round((stats.skipped / stats.total) * 100)}% of the time`,
            }],
            confidence: stats.skipped / stats.total,
            occurrences: stats.skipped,
            suggestedLevel: 'orchestrator',
            source: 'behavioral-detection',
            detectedAt: new Date().toISOString(),
          });
        }
      }
    } catch {
      // Runs directory may not exist
    }

    return patterns;
  }

  /**
   * Detect patterns from codebase (skills, loops)
   */
  private async detectCodebasePatterns(): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];
    const existingPatterns = await this.queryPatterns();
    const existingNames = new Set(existingPatterns.map(p => p.name.toLowerCase()));

    try {
      // Scan skills for potential patterns
      const skillsDir = this.options.skillsPath;
      const skillDirs = await readdir(skillsDir).catch(() => []);

      for (const skillDir of skillDirs) {
        const skillPath = join(skillsDir, skillDir, 'SKILL.md');
        try {
          const content = await readFile(skillPath, 'utf-8');

          // Look for pattern indicators in skill files
          const patternMatches = content.match(/## (?:Pattern|Best Practice|Approach|Protocol)s?\n([\s\S]*?)(?=\n##|$)/gi);
          if (patternMatches) {
            for (const match of patternMatches) {
              const nameMatch = match.match(/### ([^\n]+)/);
              if (nameMatch) {
                const name = nameMatch[1].trim().toLowerCase().replace(/\s+/g, '-');
                if (!existingNames.has(name)) {
                  patterns.push({
                    id: `detected-codebase-${skillDir}-${name}`,
                    name: name,
                    type: 'codebase',
                    context: `Found in ${skillDir} skill`,
                    solution: 'Review skill documentation for pattern details',
                    evidence: [{
                      type: 'skill',
                      reference: skillPath,
                      description: `Pattern section found in ${skillDir}/SKILL.md`,
                    }],
                    confidence: 0.6,
                    occurrences: 1,
                    suggestedLevel: 'skill',
                    source: 'codebase-scan',
                    detectedAt: new Date().toISOString(),
                  });
                }
              }
            }
          }

          // Look for "when to use" patterns
          const whenToUse = content.match(/## When to Use\n([\s\S]*?)(?=\n##|$)/i);
          if (whenToUse) {
            const patternName = `${skillDir}-usage-pattern`;
            if (!existingNames.has(patternName)) {
              patterns.push({
                id: `detected-usage-${skillDir}`,
                name: patternName,
                type: 'codebase',
                context: whenToUse[1].trim().slice(0, 200),
                solution: `Use the ${skillDir} skill in this context`,
                evidence: [{
                  type: 'skill',
                  reference: skillPath,
                  description: 'When to Use section in skill documentation',
                }],
                confidence: 0.7,
                occurrences: 1,
                suggestedLevel: 'skill',
                source: 'codebase-scan',
                detectedAt: new Date().toISOString(),
              });
            }
          }
        } catch {
          // Skill file may not exist
        }
      }
    } catch {
      // Skills directory may not exist
    }

    return patterns;
  }

  /**
   * Identify pattern gaps
   */
  private async identifyPatternGaps(): Promise<PatternGap[]> {
    const gaps: PatternGap[] = [];
    const existingPatterns = await this.queryPatterns();
    const existingCategories = new Set<string>();

    // Categorize existing patterns
    for (const pattern of existingPatterns) {
      const words = pattern.name.split('-');
      if (words.length > 1) {
        existingCategories.add(words[words.length - 1]);  // Last word often indicates category
      }
    }

    // Expected pattern categories for a mature system
    const expectedCategories = [
      { category: 'error-handling', description: 'Patterns for handling errors and failures' },
      { category: 'testing', description: 'Patterns for test generation and validation' },
      { category: 'deployment', description: 'Patterns for deployment and distribution' },
      { category: 'security', description: 'Patterns for security best practices' },
      { category: 'performance', description: 'Patterns for performance optimization' },
      { category: 'documentation', description: 'Patterns for documentation generation' },
      { category: 'refactoring', description: 'Patterns for code refactoring' },
      { category: 'debugging', description: 'Patterns for debugging issues' },
    ];

    // Check for missing categories
    for (const expected of expectedCategories) {
      const hasCategory = existingPatterns.some(p =>
        p.name.includes(expected.category) ||
        p.context.toLowerCase().includes(expected.category) ||
        p.solution.toLowerCase().includes(expected.category)
      );

      if (!hasCategory) {
        gaps.push({
          category: expected.category,
          description: expected.description,
          suggestedName: `${expected.category}-pattern`,
          suggestedContext: `When ${expected.category} concerns arise during development`,
          reasoning: `No existing patterns address ${expected.category}`,
          priority: ['security', 'error-handling'].includes(expected.category) ? 'high' : 'medium',
        });
      }
    }

    // Check for low-confidence patterns that need reinforcement
    const lowConfidencePatterns = existingPatterns.filter(p => p.confidence === 'low' && p.uses < 3);
    if (lowConfidencePatterns.length > 3) {
      gaps.push({
        category: 'pattern-validation',
        description: 'Multiple patterns need validation through use',
        suggestedName: 'pattern-validation-protocol',
        suggestedContext: 'When reviewing low-confidence patterns',
        reasoning: `${lowConfidencePatterns.length} patterns have low confidence and few uses`,
        priority: 'low',
      });
    }

    return gaps;
  }

  // --------------------------------------------------------------------------
  // Formalization Operations
  // --------------------------------------------------------------------------

  /**
   * Formalize a detected pattern into the memory system
   */
  async formalizePattern(
    detectedPattern: DetectedPattern,
    overrides?: Partial<Pattern>
  ): Promise<Pattern> {
    if (!this.memoryService) {
      throw new Error('MemoryService not set. Call setDependencies first.');
    }

    // Record the pattern
    const pattern = await this.memoryService.recordPattern(
      detectedPattern.suggestedLevel,
      detectedPattern.suggestedLevel !== 'orchestrator' ? detectedPattern.source : undefined,
      {
        name: overrides?.name || detectedPattern.name,
        context: overrides?.context || detectedPattern.context,
        solution: overrides?.solution || detectedPattern.solution,
        example: overrides?.example,
        confidence: this.confidenceFromNumber(detectedPattern.confidence),
      }
    );

    return pattern;
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  private matchesQuery(pattern: Pattern, query: PatternQuery): boolean {
    if (query.confidence && pattern.confidence !== query.confidence) {
      return false;
    }

    if (query.minUses !== undefined && pattern.uses < query.minUses) {
      return false;
    }

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      const matches =
        pattern.name.toLowerCase().includes(searchLower) ||
        pattern.context.toLowerCase().includes(searchLower) ||
        pattern.solution.toLowerCase().includes(searchLower);
      if (!matches) return false;
    }

    return true;
  }

  private async listMemoryFiles(subdir: string): Promise<string[]> {
    try {
      const dir = join(this.options.memoryPath, subdir);
      const files = await readdir(dir);
      return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    } catch {
      return [];
    }
  }

  private confidenceFromNumber(num: number): 'low' | 'medium' | 'high' {
    if (num >= 0.8) return 'high';
    if (num >= 0.5) return 'medium';
    return 'low';
  }
}
