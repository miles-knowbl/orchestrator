/**
 * GuaranteeService
 *
 * Core validation service for the guarantee enforcement system.
 * Validates skill and gate completion against defined guarantees.
 */

import { readFile, stat } from 'fs/promises';
import { glob } from 'glob';
import { join } from 'path';
import type {
  GuaranteeRegistry,
  Guarantee,
  GuaranteeValidation,
  GuaranteeResult,
  ValidationContext,
  ValidationSummary,
  Evidence,
  StepProofArtifact,
  GuaranteeFailureRecord,
  GuaranteeType,
  GitStateCheck,
  GuaranteeAcknowledgment,
  GuaranteeResolutionType,
} from '../types/guarantee.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
import type { Phase, LoopMode } from '../types.js';
import { StepProofCollector } from './StepProofCollector.js';
import type { LoopGuaranteeAggregator } from './LoopGuaranteeAggregator.js';
import type { DeliverableManager } from './DeliverableManager.js';

export interface GuaranteeServiceOptions {
  registryPath: string;  // Path to guarantees.json
  dataPath: string;      // Path to data/executions/
}

export class GuaranteeService {
  private registry: GuaranteeRegistry | null = null;
  private failureRecords: GuaranteeFailureRecord[] = [];
  private acknowledgments: GuaranteeAcknowledgment[] = [];
  private aggregator: LoopGuaranteeAggregator | null = null;
  private deliverableManager: DeliverableManager | null = null;
  private acknowledgmentsDirty = false;  // Track if acknowledgments need saving

  constructor(private options: GuaranteeServiceOptions) {
    // Load persisted acknowledgments on startup
    this.loadAcknowledgments().catch(err => {
      this.log('warn', `Failed to load acknowledgments: ${err}`);
    });
  }

  /**
   * Load acknowledgments from disk
   */
  private async loadAcknowledgments(): Promise<void> {
    const { join } = await import('path');
    const { readFile } = await import('fs/promises');
    const ackPath = join(this.options.dataPath, 'acknowledgments.json');
    try {
      const content = await readFile(ackPath, 'utf-8');
      const data = JSON.parse(content) as GuaranteeAcknowledgment[];
      this.acknowledgments = data.map(a => ({
        ...a,
        acknowledgedAt: new Date(a.acknowledgedAt),
      }));
      this.log('info', `Loaded ${this.acknowledgments.length} acknowledgments`);
    } catch {
      // File doesn't exist yet, start fresh
    }
  }

  /**
   * Save acknowledgments to disk
   */
  private async saveAcknowledgments(): Promise<void> {
    if (!this.acknowledgmentsDirty) return;

    const { join, dirname } = await import('path');
    const { writeFile, mkdir } = await import('fs/promises');
    const ackPath = join(this.options.dataPath, 'acknowledgments.json');
    await mkdir(dirname(ackPath), { recursive: true });
    await writeFile(ackPath, JSON.stringify(this.acknowledgments, null, 2));
    this.acknowledgmentsDirty = false;
    this.log('debug', `Saved ${this.acknowledgments.length} acknowledgments`);
  }

  /**
   * Flush all pending writes to disk (for graceful shutdown)
   */
  async flush(): Promise<void> {
    await this.saveAcknowledgments();
    this.log('info', 'GuaranteeService flushed to disk');
  }

  /**
   * Set the deliverable manager for organized deliverable validation
   */
  setDeliverableManager(manager: DeliverableManager): void {
    this.deliverableManager = manager;
    this.log('info', 'DeliverableManager attached to GuaranteeService');
  }

  /**
   * Set the loop guarantee aggregator for comprehensive validation
   */
  setAggregator(aggregator: LoopGuaranteeAggregator): void {
    this.aggregator = aggregator;
    this.log('info', 'LoopGuaranteeAggregator attached to GuaranteeService');
  }

  /**
   * Initialize by loading the guarantee registry
   */
  async initialize(): Promise<void> {
    await this.loadRegistry();
    this.log('info', `GuaranteeService initialized with registry v${this.registry?.version}`);
  }

  private async loadRegistry(): Promise<void> {
    try {
      const content = await readFile(this.options.registryPath, 'utf-8');
      this.registry = JSON.parse(content) as GuaranteeRegistry;
    } catch (error) {
      this.log('warn', `Failed to load guarantee registry: ${error}`);
      // Initialize with empty registry
      this.registry = { version: '0.0.0', skills: {}, loops: {}, phases: {} };
    }
  }

  /**
   * Reload the registry (for hot-reload scenarios)
   */
  async reload(): Promise<void> {
    await this.loadRegistry();
    this.log('info', 'Guarantee registry reloaded');
  }

  // ==========================================================================
  // CORE VALIDATION API
  // ==========================================================================

  /**
   * Validate all guarantees for a skill completion
   *
   * Uses belt-and-suspenders approach:
   * 1. If aggregator available: use loop-aggregated guarantees (comprehensive)
   * 2. Always also check registry directly (fallback/double-check)
   * 3. Union of all guarantees is validated
   */
  async validateSkillGuarantees(
    context: ValidationContext
  ): Promise<ValidationSummary> {
    const results: GuaranteeResult[] = [];
    const blocking: GuaranteeResult[] = [];
    const warnings: GuaranteeResult[] = [];

    // Collect all guarantees from multiple sources
    const allGuarantees = new Map<string, Guarantee>();

    // Source 1: Loop-aggregated guarantees (if aggregator available)
    if (this.aggregator) {
      const aggregatedGuarantees = this.aggregator.getSkillGuaranteesInLoop(
        context.loopId,
        context.phase,
        context.skillId
      );
      for (const g of aggregatedGuarantees) {
        allGuarantees.set(g.id, g);
      }
    }

    // Source 2: Direct registry lookup (fallback/double-check)
    const skillGuarantees = this.registry?.skills[context.skillId]?.guarantees || [];
    for (const g of skillGuarantees) {
      if (!allGuarantees.has(g.id)) {
        allGuarantees.set(g.id, g);
      }
    }

    // Source 3: Phase-level global guarantees from registry
    const phaseGuarantees =
      this.registry?.phases[context.phase]?.globalGuarantees || [];
    for (const g of phaseGuarantees) {
      if (!allGuarantees.has(g.id)) {
        allGuarantees.set(g.id, g);
      }
    }

    // Source 4: Loop-phase guarantees from registry
    const loopPhaseGuarantees =
      this.registry?.loops[context.loopId]?.phaseGuarantees?.[context.phase] || [];
    for (const g of loopPhaseGuarantees) {
      if (!allGuarantees.has(g.id)) {
        allGuarantees.set(g.id, g);
      }
    }

    this.log('debug', `Validating ${allGuarantees.size} guarantees for skill "${context.skillId}"`);

    // Convert to array for processing
    const guaranteesToValidate = [...allGuarantees.values()];

    for (const guarantee of guaranteesToValidate) {
      // Check condition
      if (guarantee.condition && !this.evaluateCondition(guarantee.condition, context)) {
        this.log('debug', `Skipping ${guarantee.id} - condition not met`);
        continue;
      }

      // Check if this guarantee has been acknowledged (resolved through alternative means)
      if (this.isGuaranteeAcknowledged(context.executionId, context.skillId, guarantee.id)) {
        this.log('info', `Skipping ${guarantee.id} - acknowledged/resolved`);
        // Create a synthetic "passed" result for acknowledged guarantees
        results.push({
          guaranteeId: guarantee.id,
          name: guarantee.name,
          type: guarantee.type,
          passed: true,
          required: guarantee.required,
          evidence: [{ type: 'proof', value: 'Acknowledged by user' }],
          errors: [],
          warnings: ['Guarantee was acknowledged/resolved, not formally validated'],
          timestamp: new Date(),
        });
        continue;
      }

      const result = await this.validateGuarantee(guarantee, context);
      results.push(result);

      if (!result.passed) {
        if (result.required) {
          blocking.push(result);
        } else {
          warnings.push(result);
        }
      }
    }

    const passed = blocking.length === 0;

    // Record failures for learning
    if (!passed) {
      await this.recordFailures(context, blocking);
    }

    return { passed, results, blocking, warnings };
  }

  /**
   * Validate all guarantees for a gate approval
   *
   * Uses belt-and-suspenders approach:
   * 1. If aggregator available: use loop-aggregated gate guarantees
   * 2. Also check registry directly
   * 3. Union of all guarantees is validated
   */
  async validateGateGuarantees(
    loopId: string,
    gateId: string,
    context: ValidationContext
  ): Promise<ValidationSummary> {
    const results: GuaranteeResult[] = [];
    const blocking: GuaranteeResult[] = [];
    const warnings: GuaranteeResult[] = [];

    // Collect all gate guarantees from multiple sources
    const allGuarantees = new Map<string, Guarantee>();

    // Source 1: Aggregated gate guarantees
    if (this.aggregator) {
      const aggregatedGuarantees = this.aggregator.getGateGuarantees(loopId, gateId);
      for (const g of aggregatedGuarantees) {
        allGuarantees.set(g.id, g);
      }
    }

    // Source 2: Direct registry lookup
    const registryGuarantees =
      this.registry?.loops[loopId]?.gateGuarantees[gateId] || [];
    for (const g of registryGuarantees) {
      if (!allGuarantees.has(g.id)) {
        allGuarantees.set(g.id, g);
      }
    }

    this.log('debug', `Validating ${allGuarantees.size} guarantees for gate "${gateId}"`);

    for (const guarantee of allGuarantees.values()) {
      if (guarantee.condition && !this.evaluateCondition(guarantee.condition, context)) {
        continue;
      }

      // Check if this guarantee has been acknowledged (resolved through alternative means)
      // Use the "any skill" check since gate guarantees aggregate from multiple skills
      if (this.isGuaranteeAcknowledgedAny(context.executionId, guarantee.id)) {
        this.log('info', `Skipping gate guarantee ${guarantee.id} - acknowledged/resolved`);
        // Create a synthetic "passed" result for acknowledged guarantees
        results.push({
          guaranteeId: guarantee.id,
          name: guarantee.name,
          type: guarantee.type,
          passed: true,
          required: guarantee.required,
          evidence: [{ type: 'proof', value: 'Acknowledged by user' }],
          errors: [],
          warnings: [],
          timestamp: new Date(),
        });
        continue;
      }

      const result = await this.validateGuarantee(guarantee, context);
      results.push(result);

      if (!result.passed) {
        if (result.required) {
          blocking.push(result);
        } else {
          warnings.push(result);
        }
      }
    }

    const passed = blocking.length === 0;

    if (!passed) {
      await this.recordFailures(context, blocking);
    }

    return { passed, results, blocking, warnings };
  }

  /**
   * Validate a single guarantee
   */
  private async validateGuarantee(
    guarantee: Guarantee,
    context: ValidationContext
  ): Promise<GuaranteeResult> {
    const result: GuaranteeResult = {
      guaranteeId: guarantee.id,
      name: guarantee.name,
      type: guarantee.type,
      passed: false,
      required: guarantee.required,
      evidence: [],
      errors: [],
      warnings: [],
      timestamp: new Date(),
    };

    try {
      switch (guarantee.type) {
        case 'deliverable':
          await this.validateDeliverables(guarantee.validation, context, result);
          break;
        case 'step_proof':
          await this.validateStepProof(guarantee.validation, context, result);
          break;
        case 'content':
          await this.validateContent(guarantee.validation, context, result);
          break;
        case 'quality':
          await this.validateQuality(guarantee.validation, context, result);
          break;
        case 'git_state':
          await this.validateGitState(guarantee.validation, context, result);
          break;
      }
    } catch (error) {
      result.errors.push(`Validation error: ${error}`);
    }

    result.passed = result.errors.length === 0;
    return result;
  }

  // ==========================================================================
  // VALIDATION IMPLEMENTATIONS
  // ==========================================================================

  private async validateDeliverables(
    validation: GuaranteeValidation,
    context: ValidationContext,
    result: GuaranteeResult
  ): Promise<void> {
    for (const filePattern of validation.files || []) {
      // Check file pattern condition
      if (filePattern.condition && !this.evaluateCondition(filePattern.condition, context)) {
        continue;
      }

      const matches: string[] = [];
      const allFiles: string[] = [];

      // Source 1: Check traditional project path
      const projectPattern = join(context.projectPath, filePattern.pattern);
      const projectMatches = await glob(projectPattern, { nodir: true });
      matches.push(...projectMatches);
      allFiles.push(...projectMatches.map(f => `project:${f}`));

      // Source 2: Check orchestra deliverables (if manager available)
      if (this.deliverableManager && this.isDeliverableName(filePattern.pattern)) {
        const deliverableName = this.extractDeliverableName(filePattern.pattern);
        const orchestraPath = await this.deliverableManager.getDeliverablePathForValidation(
          context.executionId,
          deliverableName
        );
        if (orchestraPath) {
          try {
            await stat(orchestraPath);
            matches.push(orchestraPath);
            allFiles.push(`orchestra:${orchestraPath}`);
          } catch {
            // File doesn't exist in orchestra
          }
        }
      }

      // Deduplicate matches
      const uniqueMatches = [...new Set(matches)];

      result.evidence.push({
        type: 'file',
        path: filePattern.pattern,
        value: uniqueMatches.length,
        details: {
          files: allFiles.slice(0, 10),  // Limit to first 10
          sources: {
            project: projectMatches.length,
            orchestra: uniqueMatches.length - projectMatches.length,
          },
        },
      });

      if (filePattern.minCount !== undefined && uniqueMatches.length < filePattern.minCount) {
        result.errors.push(
          `Expected at least ${filePattern.minCount} file(s) matching "${filePattern.pattern}", found ${uniqueMatches.length}`
        );
      }

      if (filePattern.maxCount !== undefined && uniqueMatches.length > filePattern.maxCount) {
        result.errors.push(
          `Expected at most ${filePattern.maxCount} file(s) matching "${filePattern.pattern}", found ${uniqueMatches.length}`
        );
      }
    }
  }

  /**
   * Check if a pattern refers to a known deliverable (e.g., REQUIREMENTS.md)
   */
  private isDeliverableName(pattern: string): boolean {
    // Known deliverable patterns
    const deliverablePatterns = [
      /^[A-Z][A-Z0-9_-]+\.md$/,           // REQUIREMENTS.md, FEATURESPEC.md
      /^[A-Z][A-Z0-9_-]+-v\d+\.md$/,      // REQUIREMENTS-v1.md
      /^\*\*\/[A-Z][A-Z0-9_-]+\.md$/,     // **/REQUIREMENTS.md
    ];
    const basename = pattern.split('/').pop() || pattern;
    return deliverablePatterns.some(p => p.test(basename));
  }

  /**
   * Extract the base deliverable name from a pattern
   */
  private extractDeliverableName(pattern: string): string {
    const basename = pattern.split('/').pop() || pattern;
    // Remove version suffix if present: REQUIREMENTS-v1.md -> REQUIREMENTS.md
    return basename.replace(/-v\d+\.md$/, '.md');
  }

  private async validateStepProof(
    validation: GuaranteeValidation,
    context: ValidationContext,
    result: GuaranteeResult
  ): Promise<void> {
    if (validation.proofType === 'artifact') {
      // Look for proof artifact in execution directory
      const proofPattern = validation.proofPattern || `${context.skillId}-PROOF.json`;
      const artifactPath = join(
        this.options.dataPath,
        context.executionId,
        'proofs',
        proofPattern
      );

      const exists = await StepProofCollector.artifactExists(artifactPath);
      if (!exists) {
        result.errors.push(`Step proof artifact not found: ${proofPattern}`);
        return;
      }

      const artifact = await StepProofCollector.loadArtifact(artifactPath);
      if (!artifact) {
        result.errors.push(`Failed to parse step proof artifact: ${proofPattern}`);
        return;
      }

      result.evidence.push({
        type: 'proof',
        path: artifactPath,
        value: artifact.steps.length,
        details: {
          stepCount: artifact.steps.length,
          steps: artifact.steps.map(s => ({
            number: s.stepNumber,
            name: s.stepName,
            type: s.proofType,
          })),
        },
      });

      // Validate proof completeness
      if (artifact.steps.length === 0) {
        result.errors.push('Step proof artifact exists but contains no steps');
      }
    } else if (validation.proofType === 'log') {
      result.warnings.push('Log-based proof validation not yet implemented');
    } else if (validation.proofType === 'git') {
      result.warnings.push('Git-based proof validation not yet implemented');
    } else if (validation.proofType === 'state') {
      result.warnings.push('State-based proof validation not yet implemented');
    }
  }

  private async validateContent(
    validation: GuaranteeValidation,
    context: ValidationContext,
    result: GuaranteeResult
  ): Promise<void> {
    for (const check of validation.contentChecks || []) {
      // Try multiple sources for the file
      let content: string | null = null;
      let foundPath: string | null = null;
      let source: 'project' | 'orchestra' | null = null;

      // Source 1: Try project path first
      const projectPath = join(context.projectPath, check.file);
      try {
        content = await readFile(projectPath, 'utf-8');
        foundPath = projectPath;
        source = 'project';
      } catch {
        // Not in project path, try orchestra
      }

      // Source 2: Try orchestra deliverables (if manager available and not found yet)
      if (!content && this.deliverableManager && this.isDeliverableName(check.file)) {
        const deliverableName = this.extractDeliverableName(check.file);
        const orchestraPath = await this.deliverableManager.getDeliverablePathForValidation(
          context.executionId,
          deliverableName
        );
        if (orchestraPath) {
          try {
            content = await readFile(orchestraPath, 'utf-8');
            foundPath = orchestraPath;
            source = 'orchestra';
          } catch {
            // Not in orchestra either
          }
        }
      }

      if (!content) {
        result.errors.push(`File not found: ${check.file}`);
        continue;
      }

      const lines = content.split('\n');

      result.evidence.push({
        type: 'content',
        path: check.file,
        value: lines.length,
        details: {
          source,
          actualPath: foundPath,
        },
      });

      // Check line count
      if (check.minLines && lines.length < check.minLines) {
        result.errors.push(
          `${check.file} has ${lines.length} lines, expected at least ${check.minLines}`
        );
      }

      if (check.maxLines && lines.length > check.maxLines) {
        result.errors.push(
          `${check.file} has ${lines.length} lines, expected at most ${check.maxLines}`
        );
      }

      // Check required sections
      if (check.sections) {
        const missingSections: string[] = [];
        for (const section of check.sections) {
          // Flexible section matching - look for heading pattern
          const sectionText = section.replace(/^#+\s*/, '');  // Remove leading #
          const sectionPattern = new RegExp(
            `^#+\\s*${this.escapeRegex(sectionText)}`,
            'im'
          );
          if (!sectionPattern.test(content)) {
            missingSections.push(section);
          }
        }
        if (missingSections.length > 0) {
          result.errors.push(
            `${check.file} missing sections: ${missingSections.join(', ')}`
          );
        }
      }

      // Check required patterns
      if (check.patterns) {
        for (const pattern of check.patterns) {
          try {
            const regex = new RegExp(pattern, 'im');
            if (!regex.test(content)) {
              result.errors.push(
                `${check.file} missing required pattern: ${pattern}`
              );
            }
          } catch {
            result.warnings.push(`Invalid regex pattern: ${pattern}`);
          }
        }
      }
    }
  }

  private async validateQuality(
    validation: GuaranteeValidation,
    context: ValidationContext,
    result: GuaranteeResult
  ): Promise<void> {
    for (const threshold of validation.qualityThresholds || []) {
      let actualValue: number | null = null;

      if (threshold.source === 'file' && threshold.path) {
        actualValue = await this.extractMetricFromFile(
          join(context.projectPath, threshold.path),
          threshold.metric
        );
      } else if (threshold.source === 'command') {
        // Command-based metric extraction would need shell execution
        result.warnings.push(
          `Command-based metric "${threshold.metric}" not yet implemented`
        );
        continue;
      } else if (threshold.source === 'metric_api') {
        result.warnings.push(
          `Metric API "${threshold.metric}" not yet implemented`
        );
        continue;
      }

      if (actualValue === null) {
        result.errors.push(`Could not extract metric "${threshold.metric}"`);
        continue;
      }

      result.evidence.push({
        type: 'metric',
        value: actualValue,
        details: {
          metric: threshold.metric,
          threshold: threshold.value,
          operator: threshold.operator,
        },
      });

      const passed = this.compareValues(actualValue, threshold.operator, threshold.value);
      if (!passed) {
        result.errors.push(
          `Metric "${threshold.metric}" = ${actualValue}, expected ${threshold.operator} ${threshold.value}`
        );
      }
    }
  }

  private async validateGitState(
    validation: GuaranteeValidation,
    context: ValidationContext,
    result: GuaranteeResult
  ): Promise<void> {
    const cwd = context.projectPath;

    for (const check of validation.gitChecks || []) {
      const remote = check.remote || 'origin';
      const branch = check.branch || 'HEAD';

      try {
        switch (check.check) {
          case 'no_uncommitted': {
            // Check for uncommitted changes (staged or unstaged)
            const { stdout } = await execAsync('git status --porcelain', { cwd });
            // Don't trim() before split - it would strip the leading space from first line
            // which is part of the git status format (XY path)
            const rawChanges = stdout.split('\n').filter(l => l.trim().length > 0);

            // Apply exclude patterns if specified
            const excludePatterns = check.excludePatterns || [];
            let changes = rawChanges;
            if (excludePatterns.length > 0) {
              changes = rawChanges.filter(change => {
                // Git status porcelain format: "XY path" or "XY path -> newpath"
                // XY is 2 characters (index + working tree status), followed by space
                // Handle both formats: "M  path" (staged) and " M path" (unstaged)
                // The path starts at position 3
                const fullPath = change.substring(3).split(' -> ').pop() || '';
                // Trim to handle any leading space in edge cases
                const filePath = fullPath.trim();
                return !excludePatterns.some(pattern => filePath.startsWith(pattern));
              });
            }

            result.evidence.push({
              type: 'proof',
              path: 'git status',
              value: changes.length,
              details: {
                uncommittedFiles: changes.slice(0, 10),
                excludedPatterns: excludePatterns,
              },
            });

            if (changes.length > 0) {
              result.errors.push(
                `Found ${changes.length} uncommitted change(s): ${changes.slice(0, 3).join(', ')}${changes.length > 3 ? '...' : ''}`
              );
            }
            break;
          }

          case 'no_unpushed': {
            // Check for unpushed commits on current branch
            try {
              const { stdout } = await execAsync(
                `git log ${remote}/${branch === 'HEAD' ? '$(git rev-parse --abbrev-ref HEAD)' : branch}..HEAD --oneline`,
                { cwd }
              );
              const commits = stdout.trim().split('\n').filter(l => l.length > 0);

              result.evidence.push({
                type: 'proof',
                path: 'git log unpushed',
                value: commits.length,
                details: { unpushedCommits: commits.slice(0, 10) },
              });

              if (commits.length > 0) {
                result.errors.push(
                  `Found ${commits.length} unpushed commit(s): ${commits.slice(0, 2).join(', ')}${commits.length > 2 ? '...' : ''}`
                );
              }
            } catch (err) {
              // No upstream tracking branch - check if any local commits exist
              result.warnings.push(
                `No upstream tracking branch for ${branch}. Skipping unpushed check.`
              );
            }
            break;
          }

          case 'branch_pushed': {
            // Verify a specific branch has been pushed to remote
            const branchName = branch === 'HEAD'
              ? (await execAsync('git rev-parse --abbrev-ref HEAD', { cwd })).stdout.trim()
              : branch;

            try {
              const localRef = (await execAsync(`git rev-parse ${branchName}`, { cwd })).stdout.trim();
              const remoteRef = (await execAsync(`git rev-parse ${remote}/${branchName}`, { cwd })).stdout.trim();

              result.evidence.push({
                type: 'proof',
                path: `branch ${branchName}`,
                value: localRef === remoteRef ? 1 : 0,
                details: { localRef, remoteRef, branch: branchName },
              });

              if (localRef !== remoteRef) {
                result.errors.push(
                  `Branch "${branchName}" not fully pushed to ${remote}. Local: ${localRef.slice(0, 7)}, Remote: ${remoteRef.slice(0, 7)}`
                );
              }
            } catch {
              result.errors.push(
                `Branch "${branchName}" does not exist on remote ${remote}`
              );
            }
            break;
          }

          case 'worktree_clean': {
            // Check all worktrees for uncommitted changes
            try {
              const { stdout } = await execAsync('git worktree list --porcelain', { cwd });
              const worktrees = stdout.split('\n\n').filter(w => w.includes('worktree'));
              const dirtyWorktrees: string[] = [];

              for (const wt of worktrees) {
                const pathMatch = wt.match(/^worktree (.+)$/m);
                if (pathMatch) {
                  const wtPath = pathMatch[1];
                  try {
                    const { stdout: status } = await execAsync('git status --porcelain', { cwd: wtPath });
                    if (status.trim().length > 0) {
                      dirtyWorktrees.push(wtPath);
                    }
                  } catch {
                    // Worktree might not be accessible
                  }
                }
              }

              result.evidence.push({
                type: 'proof',
                path: 'worktree status',
                value: dirtyWorktrees.length,
                details: {
                  totalWorktrees: worktrees.length,
                  dirtyWorktrees
                },
              });

              if (dirtyWorktrees.length > 0) {
                result.errors.push(
                  `Found ${dirtyWorktrees.length} worktree(s) with uncommitted changes`
                );
              }
            } catch {
              result.warnings.push('Could not enumerate worktrees');
            }
            break;
          }
        }
      } catch (error) {
        result.errors.push(`Git check "${check.check}" failed: ${error}`);
      }
    }
  }

  // ==========================================================================
  // FAILURE LEARNING
  // ==========================================================================

  private async recordFailures(
    context: ValidationContext,
    failures: GuaranteeResult[]
  ): Promise<void> {
    for (const failure of failures) {
      const record: GuaranteeFailureRecord = {
        id: `FAIL-${Date.now().toString(36)}`,
        timestamp: new Date(),
        executionId: context.executionId,
        skillId: context.skillId,
        phase: context.phase,
        guaranteeId: failure.guaranteeId,
        guaranteeType: failure.type,
        errors: failure.errors,
        context: {
          mode: context.mode,
        },
      };

      this.failureRecords.push(record);
      this.log('warn', `Guarantee failure: ${failure.guaranteeId} - ${failure.errors.join('; ')}`);
    }
  }

  /**
   * Get all recorded failures
   */
  getFailureRecords(): GuaranteeFailureRecord[] {
    return [...this.failureRecords];
  }

  /**
   * Get failures for a specific skill
   */
  getSkillFailures(skillId: string): GuaranteeFailureRecord[] {
    return this.failureRecords.filter(r => r.skillId === skillId);
  }

  /**
   * Mark a failure as resolved
   */
  resolveFailure(
    failureId: string,
    resolution: { type: 'fixed' | 'skipped' | 'overridden'; timeMs: number; retryCount: number }
  ): void {
    const record = this.failureRecords.find(r => r.id === failureId);
    if (record) {
      record.resolution = resolution;
    }
  }

  // ==========================================================================
  // GUARANTEE ACKNOWLEDGMENT
  // ==========================================================================

  /**
   * Acknowledge a guarantee as resolved through alternative means.
   * This allows skill completion to proceed even when the formal guarantee check fails.
   *
   * @param executionId - The execution ID
   * @param skillId - The skill ID
   * @param guaranteeId - The guarantee ID to acknowledge
   * @param resolutionType - How the guarantee was satisfied
   * @param evidence - Optional explanation/evidence for the acknowledgment
   */
  acknowledgeGuarantee(
    executionId: string,
    skillId: string,
    guaranteeId: string,
    resolutionType: GuaranteeResolutionType,
    evidence?: string
  ): GuaranteeAcknowledgment {
    // Check if already acknowledged
    const existing = this.acknowledgments.find(
      a => a.executionId === executionId &&
           a.skillId === skillId &&
           a.guaranteeId === guaranteeId
    );
    if (existing) {
      // Update existing acknowledgment
      existing.resolutionType = resolutionType;
      existing.evidence = evidence;
      existing.acknowledgedAt = new Date();
      this.log('info', `Updated acknowledgment for ${guaranteeId} in skill ${skillId}`);
      return existing;
    }

    // Create new acknowledgment
    const acknowledgment: GuaranteeAcknowledgment = {
      executionId,
      skillId,
      guaranteeId,
      resolutionType,
      evidence,
      acknowledgedAt: new Date(),
    };

    this.acknowledgments.push(acknowledgment);
    this.acknowledgmentsDirty = true;
    // Save asynchronously (don't block the caller)
    this.saveAcknowledgments().catch(err => {
      this.log('error', `Failed to save acknowledgments: ${err}`);
    });
    this.log('info', `Acknowledged guarantee ${guaranteeId} for skill ${skillId}: ${resolutionType}`);
    return acknowledgment;
  }

  /**
   * Check if a guarantee has been acknowledged for a specific execution/skill
   */
  isGuaranteeAcknowledged(
    executionId: string,
    skillId: string,
    guaranteeId: string
  ): boolean {
    return this.acknowledgments.some(
      a => a.executionId === executionId &&
           a.skillId === skillId &&
           a.guaranteeId === guaranteeId
    );
  }

  /**
   * Get all acknowledgments for an execution
   */
  getAcknowledgments(executionId: string): GuaranteeAcknowledgment[] {
    return this.acknowledgments.filter(a => a.executionId === executionId);
  }

  /**
   * Get acknowledgments for a specific skill in an execution
   */
  getSkillAcknowledgments(executionId: string, skillId: string): GuaranteeAcknowledgment[] {
    return this.acknowledgments.filter(
      a => a.executionId === executionId && a.skillId === skillId
    );
  }

  /**
   * Clear acknowledgments for an execution (e.g., when execution completes)
   */
  clearAcknowledgments(executionId: string): void {
    const before = this.acknowledgments.length;
    this.acknowledgments = this.acknowledgments.filter(
      a => a.executionId !== executionId
    );
    if (this.acknowledgments.length !== before) {
      this.acknowledgmentsDirty = true;
      this.saveAcknowledgments().catch(err => {
        this.log('error', `Failed to save acknowledgments: ${err}`);
      });
    }
  }

  /**
   * Clear acknowledgments for a specific skill (e.g., when skill is reset)
   */
  clearSkillAcknowledgments(executionId: string, skillId: string): void {
    const before = this.acknowledgments.length;
    this.acknowledgments = this.acknowledgments.filter(
      a => !(a.executionId === executionId && a.skillId === skillId)
    );
    if (this.acknowledgments.length !== before) {
      this.acknowledgmentsDirty = true;
      this.log('info', `Cleared ${before - this.acknowledgments.length} acknowledgment(s) for skill ${skillId}`);
      this.saveAcknowledgments().catch(err => {
        this.log('error', `Failed to save acknowledgments: ${err}`);
      });
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  private evaluateCondition(condition: string, context: ValidationContext): boolean {
    try {
      // Simple condition evaluation using Function constructor
      // Supports: mode === 'greenfield', skillId === 'implement', etc.
      const func = new Function(
        'mode',
        'phase',
        'skillId',
        'loopId',
        `return ${condition}`
      );
      return func(context.mode, context.phase, context.skillId, context.loopId);
    } catch {
      this.log('warn', `Invalid condition: ${condition}`);
      return true;  // Default to checking if condition is invalid
    }
  }

  private compareValues(
    actual: number,
    operator: string,
    expected: number
  ): boolean {
    switch (operator) {
      case 'eq':
        return actual === expected;
      case 'gte':
        return actual >= expected;
      case 'lte':
        return actual <= expected;
      case 'gt':
        return actual > expected;
      case 'lt':
        return actual < expected;
      default:
        return false;
    }
  }

  private async extractMetricFromFile(
    filePath: string,
    metric: string
  ): Promise<number | null> {
    try {
      const content = await readFile(filePath, 'utf-8');

      // Look for JSON blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1]);
          if (metric === 'verification_pass_rate') {
            return data.result === 'PASS' ? 1.0 : 0.0;
          }
          if (metric === 'critical_issues') {
            return data.critical || 0;
          }
          if (data[metric] !== undefined) {
            return Number(data[metric]);
          }
        } catch {
          // JSON parse failed, continue to other methods
        }
      }

      // Look for PASS/FAIL markers
      if (metric === 'verification_pass_rate') {
        if (/result.*:.*PASS/i.test(content)) return 1.0;
        if (/result.*:.*FAIL/i.test(content)) return 0.0;
        if (/Overall.*:.*PASS/i.test(content)) return 1.0;
        if (/Overall.*:.*FAIL/i.test(content)) return 0.0;
      }

      // Look for critical issues count
      if (metric === 'critical_issues') {
        const criticalMatch = content.match(/critical[:\s]+(\d+)/i);
        if (criticalMatch) return parseInt(criticalMatch[1], 10);
        // If no critical section found, assume 0
        if (/no critical/i.test(content)) return 0;
      }

      // Look for build success
      if (metric === 'build_success') {
        if (/build.*success/i.test(content)) return 1;
        if (/build.*fail/i.test(content)) return 0;
      }

      return null;
    } catch {
      return null;
    }
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private log(level: string, message: string): void {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        service: 'GuaranteeService',
        message,
      })
    );
  }

  // ==========================================================================
  // REGISTRY INSPECTION
  // ==========================================================================

  /**
   * Get guarantees for a specific skill
   */
  getSkillGuarantees(skillId: string): Guarantee[] {
    return this.registry?.skills[skillId]?.guarantees || [];
  }

  /**
   * Get guarantees for a specific gate
   */
  getGateGuarantees(loopId: string, gateId: string): Guarantee[] {
    return this.registry?.loops[loopId]?.gateGuarantees[gateId] || [];
  }

  /**
   * Get all skills with guarantees
   */
  getSkillsWithGuarantees(): string[] {
    return Object.keys(this.registry?.skills || {});
  }

  /**
   * Get registry version
   */
  getRegistryVersion(): string {
    return this.registry?.version || '0.0.0';
  }

  /**
   * Find which skill owns a guarantee by its ID.
   * Searches all skills in the registry to find the owner.
   */
  findGuaranteeOwner(guaranteeId: string): string | null {
    if (!this.registry) return null;

    for (const [skillId, skillGuarantees] of Object.entries(this.registry.skills)) {
      if (skillGuarantees.guarantees.some(g => g.id === guaranteeId)) {
        return skillId;
      }
    }
    return null;
  }

  /**
   * Check if a guarantee has been acknowledged, looking up the skill owner if needed.
   * This is useful for gate-level validation where the skillId isn't known upfront.
   */
  isGuaranteeAcknowledgedAny(executionId: string, guaranteeId: string): boolean {
    // Check if acknowledged for any skill
    return this.acknowledgments.some(
      a => a.executionId === executionId && a.guaranteeId === guaranteeId
    );
  }
}
