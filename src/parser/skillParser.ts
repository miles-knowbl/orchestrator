/**
 * Skill Parser - Parse SKILL.md files with YAML frontmatter
 */

import matter from 'gray-matter';
import type { Phase, SkillCategory, SkillLearning } from '../types.js';

export interface ParsedSkill {
  name?: string;
  description?: string;
  version?: string;
  phase?: Phase;
  category?: SkillCategory;
  author?: string;
  learning?: Partial<SkillLearning>;
  dependsOn?: string[];
  tags?: string[];
  content: string;
  raw: string;
}

const VALID_PHASES = [
  'INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY',
  'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'
];

const VALID_CATEGORIES = ['core', 'infra', 'meta', 'specialized', 'custom'];

/**
 * Parse a SKILL.md file content into structured data
 */
export function parseSkillFile(fileContent: string): ParsedSkill {
  const { data, content } = matter(fileContent);

  // Extract and normalize phase
  let phase: Phase | undefined;
  if (data.phase) {
    const normalizedPhase = String(data.phase).toUpperCase();
    if (VALID_PHASES.includes(normalizedPhase)) {
      phase = normalizedPhase as Phase;
    }
  }

  // If no phase in frontmatter, try to infer from content
  if (!phase) {
    phase = inferPhaseFromContent(content);
  }

  // Extract and validate category
  let category: SkillCategory | undefined;
  if (data.category && VALID_CATEGORIES.includes(data.category)) {
    category = data.category as SkillCategory;
  }

  // Extract learning metadata if present
  let learning: Partial<SkillLearning> | undefined;
  if (data.learning) {
    learning = {
      executionCount: data.learning.executions || data.learning.executionCount || 0,
      successRate: data.learning.successRate || 0,
      lastExecuted: data.learning.lastExecuted ? new Date(data.learning.lastExecuted) : undefined,
    };
  }

  return {
    name: data.name,
    description: data.description,
    version: data.version || '1.0.0',
    phase,
    category,
    author: data.author,
    learning,
    dependsOn: Array.isArray(data.depends_on) ? data.depends_on : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    content: content.trim(),
    raw: fileContent,
  };
}

/**
 * Try to infer phase from SKILL.md content
 */
function inferPhaseFromContent(content: string): Phase | undefined {
  const lowerContent = content.toLowerCase();

  // Look for phase indicators in content
  const phaseIndicators: Record<Phase, string[]> = {
    INIT: ['initialization', 'requirements', 'specification', 'feature spec'],
    SCAFFOLD: ['scaffold', 'architecture', 'project structure', 'boilerplate'],
    IMPLEMENT: ['implement', 'coding', 'development', 'build feature'],
    TEST: ['test generation', 'unit test', 'test coverage'],
    VERIFY: ['verification', 'code review', 'quality check'],
    VALIDATE: ['validation', 'integration test', 'security audit'],
    DOCUMENT: ['documentation', 'readme', 'api docs'],
    REVIEW: ['review', 'refactor', 'code quality'],
    SHIP: ['deploy', 'release', 'distribution'],
    COMPLETE: ['completion', 'handoff', 'retrospective'],
  };

  for (const [phase, indicators] of Object.entries(phaseIndicators)) {
    if (indicators.some(indicator => lowerContent.includes(indicator))) {
      return phase as Phase;
    }
  }

  return undefined;
}

/**
 * Parse changelog entries from CHANGELOG.md
 */
export interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: string[];
}

export function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = content.split('\n');

  let currentEntry: Partial<ChangelogEntry> | null = null;
  let currentChanges: string[] = [];

  for (const line of lines) {
    // Match version headers like "## [2.1.0] - 2026-01-15"
    const versionMatch = line.match(/^##\s*\[?(\d+\.\d+\.\d+)\]?\s*[-–]\s*(\d{4}-\d{2}-\d{2})/);
    if (versionMatch) {
      // Save previous entry
      if (currentEntry && currentEntry.version) {
        entries.push({
          version: currentEntry.version,
          date: currentEntry.date || '',
          type: currentEntry.type || 'patch',
          changes: currentChanges,
        });
      }

      const [major, minor, patch] = versionMatch[1].split('.').map(Number);
      let type: 'major' | 'minor' | 'patch' = 'patch';
      if (entries.length === 0) {
        // First entry, determine type from version
        if (major > 0 && minor === 0 && patch === 0) type = 'major';
        else if (patch === 0) type = 'minor';
      }

      currentEntry = {
        version: versionMatch[1],
        date: versionMatch[2],
        type,
      };
      currentChanges = [];
      continue;
    }

    // Match change items like "- Added X" or "* Fixed Y"
    const changeMatch = line.match(/^[-*]\s+(.+)/);
    if (changeMatch && currentEntry) {
      currentChanges.push(changeMatch[1]);
    }
  }

  // Save last entry
  if (currentEntry && currentEntry.version) {
    entries.push({
      version: currentEntry.version,
      date: currentEntry.date || '',
      type: currentEntry.type || 'patch',
      changes: currentChanges,
    });
  }

  return entries;
}

/**
 * Serialize skill data back to SKILL.md format
 */
export function serializeSkillFile(skill: {
  name: string;
  description: string;
  version: string;
  phase?: Phase;
  category?: SkillCategory;
  author?: string;
  learning?: SkillLearning;
  dependsOn?: string[];
  tags?: string[];
  content: string;
}): string {
  const frontmatter: Record<string, unknown> = {
    name: skill.name,
    description: skill.description,
    version: skill.version,
  };

  if (skill.phase) frontmatter.phase = skill.phase;
  if (skill.category) frontmatter.category = skill.category;
  if (skill.dependsOn) frontmatter.depends_on = skill.dependsOn;
  if (skill.tags?.length) frontmatter.tags = skill.tags;
  if (skill.author) frontmatter.author = skill.author;

  if (skill.learning) {
    frontmatter.learning = {
      executionCount: skill.learning.executionCount,
      successRate: skill.learning.successRate,
      lastExecuted: skill.learning.lastExecuted?.toISOString(),
    };
  }

  return matter.stringify(skill.content, frontmatter);
}
