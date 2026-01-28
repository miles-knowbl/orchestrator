/**
 * Skill Registry - Index, search, and version skills
 */

import { readFile, readdir, stat, writeFile, mkdir } from 'fs/promises';
import { join, basename } from 'path';
import { watch, type FSWatcher } from 'fs';
import { parseSkillFile, parseChangelog, serializeSkillFile } from '../parser/skillParser.js';
import { GitStorage } from '../storage/GitStorage.js';
import type {
  Skill,
  SkillSummary,
  SkillReference,
  SkillCategory,
  SkillLearning,
  Phase,
  ListSkillsParams,
  ListSkillsResult,
  ImprovementRecord,
} from '../types.js';

// Skill categorization
const META_SKILLS = [
  'loop-controller', 'skill-verifier', 'journey-tracer', 'retrospective',
  'calibration-tracker', 'coordination-protocol', 'portability',
  'manifest-manager', 'roadmap-tracker',
];

const CORE_SKILLS = [
  'entry-portal', 'requirements', 'spec', 'estimation', 'triage',
  'memory-manager', 'architect', 'architecture-review', 'scaffold',
  'git-workflow', 'implement', 'test-generation', 'code-verification',
  'debug-assist', 'code-validation', 'integration-test', 'security-audit',
  'perf-analysis', 'document', 'code-review', 'refactor', 'deploy', 'distribute',
];

const INFRA_SKILLS = [
  'infra-database', 'infra-docker', 'infra-services', 'infra-devenv', 'infra-monorepo',
];

const SPECIALIZED_SKILLS = [
  'frontend-design', 'engineering-loop', 'taste-schema', 'deck-image-schema', 'deck-text-schema',
];

export interface SkillRegistryOptions {
  skillsPath: string;
  repoPath: string;
  watchEnabled?: boolean;
}

/** Inline version bump when git is not available */
function calculateNextVersionInline(current: string | null, bump: 'patch' | 'minor' | 'major') {
  const from = current || '0.0.0';
  const [major, minor, patch] = from.split('.').map(Number);
  const to = bump === 'major' ? `${major + 1}.0.0`
    : bump === 'minor' ? `${major}.${minor + 1}.0`
    : `${major}.${minor}.${patch + 1}`;
  return { from, to, type: bump };
}

export class SkillRegistry {
  private skills: Map<string, Skill> = new Map();
  private byPhase: Map<Phase, Skill[]> = new Map();
  private byCategory: Map<SkillCategory, Skill[]> = new Map();
  private watchers: FSWatcher[] = [];
  private reindexTimeout: NodeJS.Timeout | null = null;
  private gitStorage: GitStorage | null;
  private lastIndexed: Date = new Date();

  constructor(private options: SkillRegistryOptions) {
    this.gitStorage = new GitStorage(options.repoPath);
  }

  /**
   * Initialize the registry
   */
  async initialize(): Promise<void> {
    try {
      await this.gitStorage!.initialize();
    } catch {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'warn',
        message: 'Git not available — versioning features disabled',
      }));
      this.gitStorage = null;
    }
    await this.indexAll();

    if (this.options.watchEnabled !== false) {
      this.startWatchers();
    }
  }

  /**
   * Index all skills from the skills directory
   */
  private async indexAll(): Promise<void> {
    this.skills.clear();
    this.byPhase.clear();
    this.byCategory.clear();

    try {
      const entries = await readdir(this.options.skillsPath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const skillDir = join(this.options.skillsPath, entry.name);
        const skillMdPath = join(skillDir, 'SKILL.md');

        try {
          const stats = await stat(skillMdPath);
          if (!stats.isFile()) continue;

          const skill = await this.parseSkillDirectory(entry.name, skillDir);
          if (skill) {
            this.addToIndex(skill);
          }
        } catch {
          // SKILL.md doesn't exist, skip
        }
      }

      this.lastIndexed = new Date();
      this.log('info', `Indexed ${this.skills.size} skills`);
    } catch (error) {
      this.log('error', `Failed to index skills: ${error}`);
    }
  }

  /**
   * Parse a skill directory into a Skill object
   */
  private async parseSkillDirectory(
    skillName: string,
    skillDir: string
  ): Promise<Skill | null> {
    try {
      const skillMdPath = join(skillDir, 'SKILL.md');
      const content = await readFile(skillMdPath, 'utf-8');
      const parsed = parseSkillFile(content);

      // Get references
      const references = await this.loadReferences(skillDir);

      // Get version from git or frontmatter
      let version = parsed.version || '1.0.0';
      if (this.gitStorage) {
        try {
          const gitVersion = await this.gitStorage.getLatestVersion(skillName);
          if (gitVersion) {
            version = gitVersion;
          }
        } catch {
          // Use frontmatter version if git fails
        }
      }

      // Load learning metadata from memory file if exists
      const learning = await this.loadLearningMetadata(skillName, parsed.learning);

      // Load changelog
      const changelogPath = join(skillDir, 'CHANGELOG.md');
      let improvementHistory: ImprovementRecord[] = [];
      try {
        const changelogContent = await readFile(changelogPath, 'utf-8');
        const entries = parseChangelog(changelogContent);
        improvementHistory = entries.map((entry, i) => ({
          id: `CHG-${String(i + 1).padStart(3, '0')}`,
          version: entry.version,
          timestamp: new Date(entry.date),
          source: 'changelog',
          category: 'enhancement' as const,
          feedback: entry.changes.join('; '),
        }));
      } catch {
        // No changelog
      }

      const skill: Skill = {
        id: skillName,
        version,
        description: parsed.description || '',
        phase: parsed.phase,
        category: this.determineCategory(skillName, parsed.category),
        content: parsed.content,
        references,
        tags: parsed.tags,
        dependsOn: parsed.dependsOn,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: parsed.author,
        learning: {
          ...learning,
          improvementHistory: [...learning.improvementHistory, ...improvementHistory],
        },
      };

      return skill;
    } catch (error) {
      this.log('warn', `Failed to parse skill ${skillName}: ${error}`);
      return null;
    }
  }

  /**
   * Load references from skill's references/ directory
   */
  private async loadReferences(skillDir: string): Promise<SkillReference[]> {
    const referencesDir = join(skillDir, 'references');
    const references: SkillReference[] = [];

    try {
      const files = await readdir(referencesDir);
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        references.push({
          name: file,
          path: join(referencesDir, file),
          // Content is lazy-loaded
        });
      }
    } catch {
      // No references directory
    }

    return references;
  }

  /**
   * Load learning metadata from memory file
   */
  private async loadLearningMetadata(
    skillName: string,
    frontmatterLearning?: Partial<SkillLearning>
  ): Promise<SkillLearning> {
    const memoryPath = join(this.options.repoPath, 'memory', 'skills', `${skillName}.json`);

    try {
      const content = await readFile(memoryPath, 'utf-8');
      const data = JSON.parse(content);
      return {
        executionCount: data.executionCount || frontmatterLearning?.executionCount || 0,
        successRate: data.successRate || frontmatterLearning?.successRate || 0,
        lastExecuted: data.lastExecuted ? new Date(data.lastExecuted) : frontmatterLearning?.lastExecuted,
        improvementHistory: data.improvementHistory || [],
      };
    } catch {
      // Return defaults
      return {
        executionCount: frontmatterLearning?.executionCount || 0,
        successRate: frontmatterLearning?.successRate || 0,
        lastExecuted: frontmatterLearning?.lastExecuted,
        improvementHistory: [],
      };
    }
  }

  /**
   * Determine category for a skill
   */
  private determineCategory(
    name: string,
    frontmatterCategory?: SkillCategory
  ): SkillCategory {
    if (frontmatterCategory) return frontmatterCategory;
    if (META_SKILLS.includes(name)) return 'meta';
    if (CORE_SKILLS.includes(name)) return 'core';
    if (INFRA_SKILLS.includes(name)) return 'infra';
    if (SPECIALIZED_SKILLS.includes(name)) return 'specialized';
    return 'custom';
  }

  /**
   * Add skill to index maps
   */
  private addToIndex(skill: Skill): void {
    if (this.skills.has(skill.id)) {
      this.log('debug', `Skill '${skill.id}' already indexed, skipping`);
      return;
    }

    this.skills.set(skill.id, skill);

    if (skill.phase) {
      const phaseSkills = this.byPhase.get(skill.phase) || [];
      phaseSkills.push(skill);
      this.byPhase.set(skill.phase, phaseSkills);
    }

    const categorySkills = this.byCategory.get(skill.category) || [];
    categorySkills.push(skill);
    this.byCategory.set(skill.category, categorySkills);
  }

  /**
   * Start file watchers for hot reload
   */
  private startWatchers(): void {
    try {
      const watcher = watch(
        this.options.skillsPath,
        { recursive: true },
        (event, filename) => {
          if (filename?.endsWith('SKILL.md')) {
            this.scheduleReindex();
          }
        }
      );
      this.watchers.push(watcher);
    } catch (error) {
      this.log('warn', `Failed to start watcher: ${error}`);
    }
  }

  private scheduleReindex(): void {
    if (this.reindexTimeout) {
      clearTimeout(this.reindexTimeout);
    }
    this.reindexTimeout = setTimeout(() => {
      this.log('info', 'File change detected, re-indexing...');
      this.indexAll().catch((error) => {
        this.log('error', `Re-index failed: ${error}`);
      });
    }, 500);
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  get skillCount(): number {
    return this.skills.size;
  }

  /**
   * List skills with filtering
   */
  listSkills(params: ListSkillsParams = {}): ListSkillsResult {
    let results: Skill[];

    if (params.phase) {
      results = this.byPhase.get(params.phase) || [];
    } else {
      results = [...this.skills.values()];
    }

    if (params.category) {
      results = results.filter(s => s.category === params.category);
    }

    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(s =>
        s.id.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }

    // Sort by name
    results.sort((a, b) => a.id.localeCompare(b.id));

    const total = results.length;
    const offset = params.offset || 0;
    const limit = Math.min(params.limit || 100, 500);
    const sliced = results.slice(offset, offset + limit);

    return {
      skills: sliced.map(s => this.toSummary(s)),
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get a skill by name
   */
  async getSkill(
    name: string,
    options: { includeReferences?: boolean; version?: string } = {}
  ): Promise<Skill | null> {
    const skill = this.skills.get(name);
    if (!skill) return null;

    // If specific version requested, get content from git
    if (options.version && options.version !== skill.version && this.gitStorage) {
      const content = await this.gitStorage.getFileAtVersion(
        name,
        options.version,
        'SKILL.md'
      );
      if (content) {
        const parsed = parseSkillFile(content);
        return {
          ...skill,
          version: options.version,
          content: parsed.content,
        };
      }
    }

    // Load reference content if requested
    if (options.includeReferences) {
      const referencesWithContent = await Promise.all(
        skill.references.map(async (ref) => {
          try {
            const content = await readFile(ref.path, 'utf-8');
            return { ...ref, content };
          } catch {
            return ref;
          }
        })
      );
      return { ...skill, references: referencesWithContent };
    }

    return skill;
  }

  /**
   * Search skills by query
   */
  searchSkills(
    query: string,
    options: { phase?: Phase; limit?: number } = {}
  ): SkillSummary[] {
    const lowerQuery = query.toLowerCase();

    let results = [...this.skills.values()].filter(s =>
      s.id.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery)
    );

    if (options.phase) {
      results = results.filter(s => s.phase === options.phase);
    }

    // Sort by relevance
    results.sort((a, b) => {
      const aNameMatch = a.id.toLowerCase().includes(lowerQuery);
      const bNameMatch = b.id.toLowerCase().includes(lowerQuery);
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      return a.id.localeCompare(b.id);
    });

    const limit = Math.min(options.limit || 20, 100);
    return results.slice(0, limit).map(s => this.toSummary(s));
  }

  /**
   * Find skills with similar names (for MECE enforcement)
   * Uses Jaccard similarity on hyphen-split words
   */
  findSimilarSkills(name: string, threshold: number = 0.5): { skill: Skill; similarity: number }[] {
    const skills = [...this.skills.values()];
    const nameWords = new Set(name.split('-'));

    return skills
      .map(s => {
        const skillWords = new Set(s.id.split('-'));
        const intersection = [...nameWords].filter(w => skillWords.has(w));
        const union = new Set([...nameWords, ...skillWords]);
        const similarity = intersection.length / union.size; // Jaccard similarity
        return { skill: s, similarity };
      })
      .filter(({ similarity, skill }) => similarity >= threshold && skill.id !== name)
      .sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Validate skill dependencies exist
   */
  validateDependencies(skill: Skill): string[] {
    const warnings: string[] = [];
    for (const dep of skill.dependsOn || []) {
      if (!this.skills.has(dep)) {
        warnings.push(`Skill '${skill.id}' depends on unknown skill '${dep}'`);
      }
    }
    return warnings;
  }

  /**
   * Analyze skill coverage by phase and identify gaps
   */
  analyzeSkillCoverage(): {
    byPhase: Record<string, string[]>;
    byCategory: Record<string, string[]>;
    emptyPhases: string[];
    orphanSkills: string[];
    dependencyWarnings: string[];
    suggestions: string[];
  } {
    const skills = [...this.skills.values()];
    const phases = ['INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY', 'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'];

    // Phase coverage
    const byPhase: Record<string, string[]> = {};
    for (const phase of phases) {
      byPhase[phase] = skills.filter(s => s.phase === phase).map(s => s.id);
    }
    const emptyPhases = phases.filter(p => byPhase[p].length === 0);

    // Category coverage
    const categories = ['core', 'meta', 'specialized', 'custom'];
    const byCategory: Record<string, string[]> = {};
    for (const cat of categories) {
      byCategory[cat] = skills.filter(s => s.category === cat).map(s => s.id);
    }

    // Dependency analysis - find orphan skills
    const dependedUpon = new Set(skills.flatMap(s => s.dependsOn || []));
    const hasDependents = new Set(
      skills.filter(s => (s.dependsOn || []).length > 0).map(s => s.id)
    );
    const orphanSkills = skills
      .filter(s => !dependedUpon.has(s.id) && !hasDependents.has(s.id))
      .map(s => s.id);

    // Validate all dependencies
    const dependencyWarnings: string[] = [];
    for (const skill of skills) {
      dependencyWarnings.push(...this.validateDependencies(skill));
    }

    // Generate suggestions
    const suggestions: string[] = [];
    for (const phase of emptyPhases) {
      suggestions.push(`No skills for phase ${phase} - consider adding coverage`);
    }
    if (orphanSkills.length > 5) {
      suggestions.push(`${orphanSkills.length} orphan skills without dependency relationships`);
    }

    return { byPhase, byCategory, emptyPhases, orphanSkills, dependencyWarnings, suggestions };
  }

  /**
   * Get skill dependency graph
   */
  getSkillGraph(): {
    nodes: { id: string; phase?: string; category: string }[];
    edges: { from: string; to: string }[];
  } {
    const skills = [...this.skills.values()];

    const nodes = skills.map(s => ({
      id: s.id,
      phase: s.phase,
      category: s.category,
    }));

    const edges: { from: string; to: string }[] = [];
    for (const skill of skills) {
      for (const dep of skill.dependsOn || []) {
        edges.push({ from: skill.id, to: dep });
      }
    }

    return { nodes, edges };
  }

  /**
   * Create a new skill
   */
  async createSkill(params: {
    name: string;
    description: string;
    content: string;
    phase?: Phase;
    category?: SkillCategory;
  }): Promise<Skill> {
    // Check for exact duplicate in registry
    if (this.skills.has(params.name)) {
      throw new Error(`Skill '${params.name}' already exists. Use updateSkill() to modify.`);
    }

    // Check filesystem as safety net
    const skillDir = join(this.options.skillsPath, params.name);
    try {
      await stat(skillDir);
      throw new Error(`Skill directory '${params.name}' already exists on disk.`);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
      // Directory doesn't exist, safe to proceed
    }

    // Check for similar skills (MECE enforcement)
    const similar = this.findSimilarSkills(params.name);
    if (similar.length > 0) {
      const matches = similar.map(s => `'${s.skill.id}' (${Math.round(s.similarity * 100)}% similar)`).join(', ');
      throw new Error(
        `Cannot create skill '${params.name}' - similar skills already exist: ${matches}. ` +
        `Consider enhancing the existing skill instead, or use a more distinct name.`
      );
    }

    // Create directory
    await mkdir(skillDir, { recursive: true });
    await mkdir(join(skillDir, 'references'), { recursive: true });

    // Create SKILL.md
    const skillContent = serializeSkillFile({
      name: params.name,
      description: params.description,
      version: '1.0.0',
      phase: params.phase,
      category: params.category,
      content: params.content,
    });

    await writeFile(join(skillDir, 'SKILL.md'), skillContent);

    // Create CHANGELOG.md
    const changelog = `# Changelog

## [1.0.0] - ${new Date().toISOString().split('T')[0]}

- Initial release
`;
    await writeFile(join(skillDir, 'CHANGELOG.md'), changelog);

    // Stage and commit (if git available)
    if (this.gitStorage) {
      await this.gitStorage.stageSkillFiles(params.name);
      await this.gitStorage.commitSkillChanges(params.name, '1.0.0', 'Initial release');
      await this.gitStorage.createVersion(params.name, '1.0.0', 'Initial release');
    }

    // Re-index
    await this.indexAll();

    return this.skills.get(params.name)!;
  }

  /**
   * Update a skill and create new version
   */
  async updateSkill(params: {
    name: string;
    content?: string;
    description?: string;
    versionBump: 'patch' | 'minor' | 'major';
    changeDescription: string;
  }): Promise<Skill> {
    const skill = this.skills.get(params.name);
    if (!skill) {
      throw new Error(`Skill not found: ${params.name}`);
    }

    // Calculate new version
    const versionBump = this.gitStorage
      ? this.gitStorage.calculateNextVersion(skill.version, params.versionBump)
      : calculateNextVersionInline(skill.version, params.versionBump);

    // Update SKILL.md
    const skillMdPath = join(this.options.skillsPath, params.name, 'SKILL.md');
    const newContent = serializeSkillFile({
      name: params.name,
      description: params.description || skill.description,
      version: versionBump.to,
      phase: skill.phase,
      category: skill.category,
      author: skill.author,
      learning: skill.learning,
      content: params.content || skill.content,
    });

    await writeFile(skillMdPath, newContent);

    // Update CHANGELOG.md
    const changelogPath = join(this.options.skillsPath, params.name, 'CHANGELOG.md');
    let changelog: string;
    try {
      changelog = await readFile(changelogPath, 'utf-8');
    } catch {
      changelog = '# Changelog\n';
    }

    const newEntry = `
## [${versionBump.to}] - ${new Date().toISOString().split('T')[0]}

- ${params.changeDescription}
`;
    changelog = changelog.replace('# Changelog\n', `# Changelog\n${newEntry}`);
    await writeFile(changelogPath, changelog);

    // Git operations (if git available)
    if (this.gitStorage) {
      await this.gitStorage.stageSkillFiles(params.name);
      await this.gitStorage.commitSkillChanges(
        params.name,
        versionBump.to,
        params.changeDescription
      );
      await this.gitStorage.createVersion(
        params.name,
        versionBump.to,
        params.changeDescription
      );
    }

    // Re-index
    await this.indexAll();

    return this.skills.get(params.name)!;
  }

  /**
   * Add a reference document to an existing skill
   */
  async addReference(params: {
    skillName: string;
    referenceName: string;
    content: string;
    description: string;
    versionBump?: 'patch' | 'minor';
  }): Promise<Skill> {
    const skill = this.skills.get(params.skillName);
    if (!skill) {
      throw new Error(`Skill not found: ${params.skillName}`);
    }

    const fileName = params.referenceName.endsWith('.md')
      ? params.referenceName
      : `${params.referenceName}.md`;

    const referencesDir = join(this.options.skillsPath, params.skillName, 'references');
    await mkdir(referencesDir, { recursive: true });

    const refPath = join(referencesDir, fileName);

    // Check if reference already exists
    try {
      await stat(refPath);
      throw new Error(`Reference '${fileName}' already exists in skill '${params.skillName}'`);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    }

    await writeFile(refPath, params.content);

    return this.updateSkill({
      name: params.skillName,
      versionBump: params.versionBump || 'patch',
      changeDescription: `Added reference: ${fileName} - ${params.description}`,
    });
  }

  /**
   * Get version history for a skill
   */
  async getVersionHistory(skillName: string) {
    if (!this.gitStorage) return [];
    return this.gitStorage.getSkillVersions(skillName);
  }

  /**
   * Get diff between versions
   */
  async getVersionDiff(skillName: string, fromVersion: string, toVersion: string) {
    if (!this.gitStorage) throw new Error('Git not available — version diff requires git');
    return this.gitStorage.getVersionDiff(skillName, fromVersion, toVersion);
  }

  /**
   * Force re-index
   */
  async refresh(): Promise<{ indexed: number; duration: number }> {
    const start = Date.now();
    await this.indexAll();
    return {
      indexed: this.skills.size,
      duration: Date.now() - start,
    };
  }

  /**
   * Get all phases with their skills
   */
  getPhases(): { name: Phase; skillCount: number; skills: string[] }[] {
    const PHASE_ORDER: Phase[] = [
      'INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY',
      'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'
    ];

    return PHASE_ORDER.map(name => {
      const skills = this.byPhase.get(name) || [];
      return {
        name,
        skillCount: skills.length,
        skills: skills.map(s => s.id).sort(),
      };
    });
  }

  /**
   * Clean up resources
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

  private toSummary(skill: Skill): SkillSummary {
    return {
      id: skill.id,
      name: skill.id,
      version: skill.version,
      description: skill.description,
      phase: skill.phase,
      category: skill.category,
    };
  }

  private log(level: string, message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'SkillRegistry',
      message,
    }));
  }
}
