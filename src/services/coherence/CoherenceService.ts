/**
 * Coherence Service
 *
 * Validates alignment across all orchestrator components to ensure
 * the system doesn't drift or develop conflicts.
 *
 * The "spec-driven organization" spine:
 * - Skill-based ontology (knowledge graph)
 * - Dream state (vision and goals)
 * - Roadmap (execution plan)
 * - Patterns (learned behaviors)
 *
 * This service detects:
 * - Misalignments between components
 * - Drift from declared intentions
 * - Conflicts in dependencies or definitions
 * - Stale or orphaned artifacts
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { RoadmapService, Module } from '../roadmapping/index.js';
import type { KnowledgeGraphService, SkillNode } from '../knowledge-graph/index.js';
import type { PatternsService } from '../patterns/index.js';
import type { MECEOpportunityService } from '../mece/index.js';
import type { SkillRegistry } from '../SkillRegistry.js';
import type { LoopComposer } from '../LoopComposer.js';
import type { MemoryService } from '../MemoryService.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type AlignmentDomain =
  | 'dream-roadmap'      // Dream state ↔ Roadmap alignment
  | 'skill-loop'         // Skills ↔ Loops alignment
  | 'pattern-impl'       // Patterns ↔ Implementation alignment
  | 'graph-skill'        // Knowledge graph ↔ Skills alignment
  | 'mece-roadmap'       // MECE analysis ↔ Roadmap alignment
  | 'dependency-order'   // Module dependencies ↔ Build order
  | 'memory-consistency' // Memory artifacts ↔ Current state
  | 'version-sync';      // Version numbers across system

export type IssueSeverity = 'critical' | 'warning' | 'info';
export type IssueStatus = 'open' | 'acknowledged' | 'resolved' | 'wont-fix';

/**
 * A coherence issue detected by validation
 */
export interface CoherenceIssue {
  id: string;
  domain: AlignmentDomain;
  severity: IssueSeverity;
  status: IssueStatus;
  title: string;
  description: string;
  affectedComponents: string[];
  evidence: string[];
  suggestedFix?: string;
  detectedAt: string;
  resolvedAt?: string;
}

/**
 * Domain-specific validation result
 */
export interface DomainValidation {
  domain: AlignmentDomain;
  valid: boolean;
  score: number; // 0-100
  issueCount: number;
  issues: CoherenceIssue[];
  checkedAt: string;
}

/**
 * Full coherence report
 */
export interface CoherenceReport {
  id: string;
  timestamp: string;
  overallScore: number; // 0-100
  overallValid: boolean;
  domainValidations: DomainValidation[];
  totalIssues: number;
  criticalIssues: number;
  warnings: number;
  recommendations: CoherenceRecommendation[];
  metadata: {
    skillsChecked: number;
    loopsChecked: number;
    modulesChecked: number;
    patternsChecked: number;
    validationTimeMs: number;
  };
}

/**
 * Recommendation from coherence analysis
 */
export interface CoherenceRecommendation {
  id: string;
  priority: number;
  title: string;
  description: string;
  action: string;
  relatedIssueIds: string[];
}

/**
 * Coherence rule definition
 */
export interface CoherenceRule {
  id: string;
  domain: AlignmentDomain;
  name: string;
  description: string;
  severity: IssueSeverity;
  check: () => Promise<CoherenceIssue[]>;
}

export interface CoherenceServiceOptions {
  dataPath: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CoherenceService
// ─────────────────────────────────────────────────────────────────────────────

export class CoherenceService extends EventEmitter {
  private dataPath: string;
  private issues: Map<string, CoherenceIssue> = new Map();
  private lastReport?: CoherenceReport;
  private rules: CoherenceRule[] = [];

  // Dependencies
  private roadmapService?: RoadmapService;
  private knowledgeGraphService?: KnowledgeGraphService;
  private patternsService?: PatternsService;
  private meceService?: MECEOpportunityService;
  private skillRegistry?: SkillRegistry;
  private loopComposer?: LoopComposer;
  private memoryService?: MemoryService;

  constructor(options: CoherenceServiceOptions) {
    super();
    this.dataPath = options.dataPath;
  }

  /**
   * Set dependencies
   */
  setDependencies(deps: {
    roadmapService?: RoadmapService;
    knowledgeGraphService?: KnowledgeGraphService;
    patternsService?: PatternsService;
    meceService?: MECEOpportunityService;
    skillRegistry?: SkillRegistry;
    loopComposer?: LoopComposer;
    memoryService?: MemoryService;
  }): void {
    this.roadmapService = deps.roadmapService;
    this.knowledgeGraphService = deps.knowledgeGraphService;
    this.patternsService = deps.patternsService;
    this.meceService = deps.meceService;
    this.skillRegistry = deps.skillRegistry;
    this.loopComposer = deps.loopComposer;
    this.memoryService = deps.memoryService;

    // Initialize rules after dependencies are set
    this.initializeRules();
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
    await this.loadState();
  }

  /**
   * Initialize coherence rules
   */
  private initializeRules(): void {
    this.rules = [
      // Dream ↔ Roadmap alignment
      {
        id: 'dream-roadmap-coverage',
        domain: 'dream-roadmap',
        name: 'Dream State Coverage',
        description: 'Verify roadmap modules cover dream state goals',
        severity: 'warning',
        check: () => this.checkDreamRoadmapCoverage(),
      },
      {
        id: 'roadmap-module-status',
        domain: 'dream-roadmap',
        name: 'Module Status Consistency',
        description: 'Verify module status matches actual implementation',
        severity: 'warning',
        check: () => this.checkModuleStatusConsistency(),
      },

      // Skill ↔ Loop alignment
      {
        id: 'loop-skill-references',
        domain: 'skill-loop',
        name: 'Loop Skill References',
        description: 'Verify loops only reference existing skills',
        severity: 'critical',
        check: () => this.checkLoopSkillReferences(),
      },
      {
        id: 'skill-dependency-satisfaction',
        domain: 'skill-loop',
        name: 'Skill Dependencies',
        description: 'Verify skill dependencies are satisfied',
        severity: 'warning',
        check: () => this.checkSkillDependencies(),
      },

      // Knowledge Graph ↔ Skills alignment
      {
        id: 'graph-skill-sync',
        domain: 'graph-skill',
        name: 'Graph-Skill Synchronization',
        description: 'Verify knowledge graph is in sync with skill registry',
        severity: 'warning',
        check: () => this.checkGraphSkillSync(),
      },

      // Pattern ↔ Implementation alignment
      {
        id: 'pattern-adoption',
        domain: 'pattern-impl',
        name: 'Pattern Adoption',
        description: 'Check if declared patterns are being followed',
        severity: 'info',
        check: () => this.checkPatternAdoption(),
      },

      // MECE ↔ Roadmap alignment
      {
        id: 'mece-roadmap-sync',
        domain: 'mece-roadmap',
        name: 'MECE-Roadmap Sync',
        description: 'Verify MECE opportunities align with roadmap',
        severity: 'info',
        check: () => this.checkMECERoadmapSync(),
      },

      // Dependency order validation
      {
        id: 'circular-dependencies',
        domain: 'dependency-order',
        name: 'Circular Dependencies',
        description: 'Detect circular module dependencies',
        severity: 'critical',
        check: () => this.checkCircularDependencies(),
      },
      {
        id: 'dependency-order-violation',
        domain: 'dependency-order',
        name: 'Build Order Violations',
        description: 'Check if completed modules respect dependency order',
        severity: 'warning',
        check: () => this.checkDependencyOrder(),
      },

      // Memory consistency
      {
        id: 'orphaned-patterns',
        domain: 'memory-consistency',
        name: 'Orphaned Patterns',
        description: 'Detect patterns without corresponding implementations',
        severity: 'info',
        check: () => this.checkOrphanedPatterns(),
      },
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Run full coherence validation
   */
  async runValidation(): Promise<CoherenceReport> {
    const startTime = Date.now();
    const domainValidations: DomainValidation[] = [];
    const allIssues: CoherenceIssue[] = [];

    // Group rules by domain
    const rulesByDomain = new Map<AlignmentDomain, CoherenceRule[]>();
    for (const rule of this.rules) {
      const existing = rulesByDomain.get(rule.domain) || [];
      existing.push(rule);
      rulesByDomain.set(rule.domain, existing);
    }

    // Run validation for each domain
    for (const [domain, rules] of rulesByDomain.entries()) {
      const domainIssues: CoherenceIssue[] = [];

      for (const rule of rules) {
        try {
          const issues = await rule.check();
          domainIssues.push(...issues);
          allIssues.push(...issues);
        } catch (err) {
          // Log but don't fail entire validation
          console.error(`Rule ${rule.id} failed:`, err);
        }
      }

      // Store issues
      for (const issue of domainIssues) {
        this.issues.set(issue.id, issue);
      }

      // Calculate domain score
      const score = this.calculateDomainScore(domainIssues);

      domainValidations.push({
        domain,
        valid: domainIssues.filter(i => i.severity === 'critical').length === 0,
        score,
        issueCount: domainIssues.length,
        issues: domainIssues,
        checkedAt: new Date().toISOString(),
      });
    }

    // Calculate overall score
    const overallScore = domainValidations.length > 0
      ? Math.round(domainValidations.reduce((sum, d) => sum + d.score, 0) / domainValidations.length)
      : 100;

    const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
    const warningCount = allIssues.filter(i => i.severity === 'warning').length;

    // Generate recommendations
    const recommendations = this.generateRecommendations(allIssues);

    const report: CoherenceReport = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      overallScore,
      overallValid: criticalCount === 0,
      domainValidations,
      totalIssues: allIssues.length,
      criticalIssues: criticalCount,
      warnings: warningCount,
      recommendations,
      metadata: {
        skillsChecked: this.skillRegistry?.skillCount || 0,
        loopsChecked: this.loopComposer?.loopCount || 0,
        modulesChecked: this.roadmapService?.getProgress().totalModules || 0,
        patternsChecked: 0, // Would need patterns service method
        validationTimeMs: Date.now() - startTime,
      },
    };

    this.lastReport = report;
    await this.saveState();

    this.emit('validation:complete', report);
    return report;
  }

  /**
   * Calculate domain score based on issues
   */
  private calculateDomainScore(issues: CoherenceIssue[]): number {
    if (issues.length === 0) return 100;

    let deductions = 0;
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical': deductions += 30; break;
        case 'warning': deductions += 10; break;
        case 'info': deductions += 2; break;
      }
    }

    return Math.max(0, 100 - deductions);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Individual Checks
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Check dream state ↔ roadmap coverage
   */
  private async checkDreamRoadmapCoverage(): Promise<CoherenceIssue[]> {
    const issues: CoherenceIssue[] = [];

    if (!this.roadmapService) return issues;

    const progress = this.roadmapService.getProgress();

    // Check for modules without descriptions (suggests incomplete planning)
    const undescribed = progress.layerProgress.flatMap(lp => lp.modules)
      .filter(m => !m.description || m.description.length < 10);

    if (undescribed.length > 0) {
      issues.push(this.createIssue(
        'dream-roadmap',
        'warning',
        'Modules with insufficient descriptions',
        `${undescribed.length} modules lack proper descriptions, making dream state alignment unclear`,
        undescribed.map(m => m.id),
        undescribed.map(m => `Module "${m.name}" has description: "${m.description || '(empty)'}"`)
      ));
    }

    // Check for layers with no modules (potential gap)
    for (let layer = 0; layer <= 6; layer++) {
      const layerModules = progress.layerProgress.find(lp => lp.layer === layer);
      if (!layerModules || layerModules.total === 0) {
        issues.push(this.createIssue(
          'dream-roadmap',
          'info',
          `Layer ${layer} has no modules`,
          `Layer ${layer} in the roadmap has no planned modules`,
          [`layer-${layer}`],
          [`No modules found for layer ${layer}`],
          `Consider if layer ${layer} needs modules or if the layer structure should be revised`
        ));
      }
    }

    return issues;
  }

  /**
   * Check module status consistency
   */
  private async checkModuleStatusConsistency(): Promise<CoherenceIssue[]> {
    const issues: CoherenceIssue[] = [];

    if (!this.roadmapService) return issues;

    const progress = this.roadmapService.getProgress();

    // Check for modules marked complete but still blocked
    for (const lp of progress.layerProgress) {
      for (const module of lp.modules) {
        // Check if dependencies are complete for in-progress modules
        if (module.status === 'in-progress') {
          const incompleteDeps = module.dependsOn.filter(depId => {
            const dep = progress.layerProgress.flatMap(l => l.modules).find(m => m.id === depId);
            return dep && dep.status !== 'complete';
          });

          if (incompleteDeps.length > 0) {
            issues.push(this.createIssue(
              'dream-roadmap',
              'warning',
              `Module "${module.name}" started before dependencies complete`,
              `Module is in-progress but has ${incompleteDeps.length} incomplete dependencies`,
              [module.id, ...incompleteDeps],
              incompleteDeps.map(d => `Dependency "${d}" is not complete`),
              `Complete dependencies first or mark them as non-blocking`
            ));
          }
        }
      }
    }

    return issues;
  }

  /**
   * Check loop skill references
   */
  private async checkLoopSkillReferences(): Promise<CoherenceIssue[]> {
    const issues: CoherenceIssue[] = [];

    if (!this.loopComposer || !this.skillRegistry) return issues;

    const loops = this.loopComposer.listLoops();

    for (const loopSummary of loops) {
      const loop = this.loopComposer.getLoop(loopSummary.id);
      if (!loop) continue;

      // Check each phase's skills
      for (const phase of loop.phases) {
        for (const skillRef of phase.skills) {
          const skill = await this.skillRegistry.getSkill(skillRef.skillId);
          if (!skill) {
            issues.push(this.createIssue(
              'skill-loop',
              'critical',
              `Loop "${loop.name}" references missing skill`,
              `Phase "${phase.name}" references skill "${skillRef.skillId}" which doesn't exist`,
              [loop.id, skillRef.skillId],
              [`Skill "${skillRef.skillId}" not found in registry`],
              `Either create the skill or remove the reference`
            ));
          }
        }
      }
    }

    return issues;
  }

  /**
   * Check skill dependencies
   */
  private async checkSkillDependencies(): Promise<CoherenceIssue[]> {
    const issues: CoherenceIssue[] = [];

    if (!this.skillRegistry) return issues;

    const skills = this.skillRegistry.listSkills({});

    for (const skillInfo of skills.skills) {
      const skill = await this.skillRegistry.getSkill(skillInfo.id);
      if (!skill?.dependsOn?.length) continue;

      for (const dep of skill.dependsOn) {
        const depSkill = await this.skillRegistry.getSkill(dep);
        if (!depSkill) {
          issues.push(this.createIssue(
            'skill-loop',
            'warning',
            `Skill "${skillInfo.id}" has missing dependency`,
            `Skill declares dependency on "${dep}" which doesn't exist`,
            [skillInfo.id, dep],
            [`Dependency "${dep}" not found`],
            `Either create the dependency skill or remove the declaration`
          ));
        }
      }
    }

    return issues;
  }

  /**
   * Check knowledge graph ↔ skill sync
   */
  private async checkGraphSkillSync(): Promise<CoherenceIssue[]> {
    const issues: CoherenceIssue[] = [];

    if (!this.knowledgeGraphService || !this.skillRegistry) return issues;

    try {
      const graph = this.knowledgeGraphService.getGraph();
      if (!graph) return issues;

      const graphSkillIds = new Set(graph.nodes.map(n => n.id));
      const registrySkills = this.skillRegistry.listSkills({});
      const registrySkillIds = new Set(registrySkills.skills.map(s => s.id));

      // Skills in registry but not in graph
      const missingFromGraph: string[] = [];
      for (const id of registrySkillIds) {
        if (!graphSkillIds.has(id)) {
          missingFromGraph.push(id);
        }
      }

      if (missingFromGraph.length > 0) {
        issues.push(this.createIssue(
          'graph-skill',
          'warning',
          'Skills missing from knowledge graph',
          `${missingFromGraph.length} skills exist in registry but not in knowledge graph`,
          missingFromGraph,
          missingFromGraph.slice(0, 5).map(s => `Skill "${s}" not in graph`),
          `Run knowledge graph rebuild to sync`
        ));
      }

      // Skills in graph but not in registry (stale)
      const staleInGraph: string[] = [];
      for (const id of graphSkillIds) {
        if (!registrySkillIds.has(id)) {
          staleInGraph.push(id);
        }
      }

      if (staleInGraph.length > 0) {
        issues.push(this.createIssue(
          'graph-skill',
          'info',
          'Stale skills in knowledge graph',
          `${staleInGraph.length} skills in graph no longer exist in registry`,
          staleInGraph,
          staleInGraph.slice(0, 5).map(s => `Skill "${s}" is stale`),
          `Run knowledge graph rebuild to remove stale entries`
        ));
      }
    } catch {
      // Graph may not be built
    }

    return issues;
  }

  /**
   * Check pattern adoption
   */
  private async checkPatternAdoption(): Promise<CoherenceIssue[]> {
    const issues: CoherenceIssue[] = [];

    if (!this.patternsService || !this.memoryService) return issues;

    // This would analyze if declared patterns are being followed
    // For now, just check for patterns marked as "required" but not evidenced
    const patterns = await this.patternsService.queryPatterns({});

    for (const pattern of patterns) {
      // Check for high-confidence patterns without recent usage
      if (pattern.confidence === 'high' && !pattern.lastUsed) {
        issues.push(this.createIssue(
          'pattern-impl',
          'info',
          `High-confidence pattern "${pattern.name}" has no usage evidence`,
          `Pattern is marked as high-confidence but no usage has been recorded`,
          [pattern.id],
          [`Pattern "${pattern.name}" is high-confidence but unused`],
          `Either record pattern usage or reconsider confidence level`
        ));
      }
    }

    return issues;
  }

  /**
   * Check MECE ↔ Roadmap sync
   */
  private async checkMECERoadmapSync(): Promise<CoherenceIssue[]> {
    const issues: CoherenceIssue[] = [];

    if (!this.meceService || !this.roadmapService) return issues;

    const meceStatus = this.meceService.getStatus();
    const roadmapProgress = this.roadmapService.getProgress();

    // Check if MECE has been run
    if (!meceStatus.lastAnalysis) {
      issues.push(this.createIssue(
        'mece-roadmap',
        'info',
        'MECE analysis has not been run',
        'No MECE analysis exists to validate roadmap coverage',
        ['mece-service'],
        ['No MECE analysis timestamp found'],
        'Run MECE analysis to identify coverage gaps'
      ));
      return issues;
    }

    // Check if roadmap modules are covered by MECE opportunities
    const opportunities = this.meceService.getOpportunities({});
    const roadmapModuleIds = new Set(
      roadmapProgress.layerProgress.flatMap(lp => lp.modules.map(m => m.id))
    );

    const meceCoveredModules = new Set(
      opportunities
        .filter(o => o.source === 'roadmap')
        .map(o => o.sourceId)
        .filter(Boolean)
    );

    const uncoveredModules = [...roadmapModuleIds].filter(id => !meceCoveredModules.has(id));

    if (uncoveredModules.length > 0 && roadmapModuleIds.size > 0) {
      issues.push(this.createIssue(
        'mece-roadmap',
        'info',
        'Roadmap modules not in MECE analysis',
        `${uncoveredModules.length} roadmap modules are not covered by MECE opportunities`,
        uncoveredModules,
        uncoveredModules.slice(0, 5).map(m => `Module "${m}" not in MECE`),
        'Run MECE analysis to sync with roadmap'
      ));
    }

    return issues;
  }

  /**
   * Check for circular dependencies
   */
  private async checkCircularDependencies(): Promise<CoherenceIssue[]> {
    const issues: CoherenceIssue[] = [];

    if (!this.roadmapService) return issues;

    const progress = this.roadmapService.getProgress();
    const modules = progress.layerProgress.flatMap(lp => lp.modules);
    const moduleMap = new Map(modules.map(m => [m.id, m]));

    // DFS to detect cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (moduleId: string, path: string[]): string[] | null => {
      if (recursionStack.has(moduleId)) {
        return [...path, moduleId];
      }
      if (visited.has(moduleId)) {
        return null;
      }

      visited.add(moduleId);
      recursionStack.add(moduleId);

      const module = moduleMap.get(moduleId);
      if (module) {
        for (const dep of module.dependsOn) {
          const cycle = detectCycle(dep, [...path, moduleId]);
          if (cycle) return cycle;
        }
      }

      recursionStack.delete(moduleId);
      return null;
    };

    for (const module of modules) {
      const cycle = detectCycle(module.id, []);
      if (cycle) {
        issues.push(this.createIssue(
          'dependency-order',
          'critical',
          'Circular dependency detected',
          `Circular dependency: ${cycle.join(' → ')}`,
          cycle,
          [`Cycle: ${cycle.join(' → ')}`],
          'Break the cycle by removing one of the dependencies'
        ));
        break; // One cycle is enough to report
      }
    }

    return issues;
  }

  /**
   * Check dependency order
   */
  private async checkDependencyOrder(): Promise<CoherenceIssue[]> {
    const issues: CoherenceIssue[] = [];

    if (!this.roadmapService) return issues;

    const progress = this.roadmapService.getProgress();
    const modules = progress.layerProgress.flatMap(lp => lp.modules);
    const moduleMap = new Map(modules.map(m => [m.id, m]));

    for (const module of modules) {
      if (module.status === 'complete') {
        // Check if all dependencies were complete when this was marked complete
        for (const depId of module.dependsOn) {
          const dep = moduleMap.get(depId);
          if (dep && dep.status !== 'complete') {
            issues.push(this.createIssue(
              'dependency-order',
              'warning',
              `Module "${module.name}" completed before dependency`,
              `Module was marked complete but dependency "${depId}" is not complete`,
              [module.id, depId],
              [`Dependency "${depId}" status: ${dep.status}`],
              `Review if the dependency is actually required`
            ));
          }
        }
      }
    }

    return issues;
  }

  /**
   * Check for orphaned patterns
   */
  private async checkOrphanedPatterns(): Promise<CoherenceIssue[]> {
    const issues: CoherenceIssue[] = [];

    if (!this.patternsService) return issues;

    const patterns = await this.patternsService.queryPatterns({});

    // Look for patterns that reference non-existent entities
    for (const pattern of patterns) {
      // Check for skill-level patterns where the skill no longer exists
      if (pattern.level === 'skill' && pattern.entityId) {
        const skillExists = await this.skillRegistry?.getSkill(pattern.entityId);
        if (!skillExists) {
          issues.push(this.createIssue(
            'memory-consistency',
            'info',
            `Pattern "${pattern.name}" references missing skill`,
            `Pattern belongs to skill "${pattern.entityId}" which no longer exists`,
            [pattern.id],
            [`Parent skill "${pattern.entityId}" not found`],
            `Either remove the pattern or reassign to a different level`
          ));
        }
      }

      // Check for loop-level patterns where the loop no longer exists
      if (pattern.level === 'loop' && pattern.entityId) {
        const loopExists = this.loopComposer?.getLoop(pattern.entityId);
        if (!loopExists) {
          issues.push(this.createIssue(
            'memory-consistency',
            'info',
            `Pattern "${pattern.name}" references missing loop`,
            `Pattern belongs to loop "${pattern.entityId}" which no longer exists`,
            [pattern.id],
            [`Parent loop "${pattern.entityId}" not found`],
            `Either remove the pattern or reassign to a different level`
          ));
        }
      }
    }

    return issues;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a coherence issue
   */
  private createIssue(
    domain: AlignmentDomain,
    severity: IssueSeverity,
    title: string,
    description: string,
    affectedComponents: string[],
    evidence: string[],
    suggestedFix?: string
  ): CoherenceIssue {
    return {
      id: `${domain}-${randomUUID().slice(0, 8)}`,
      domain,
      severity,
      status: 'open',
      title,
      description,
      affectedComponents,
      evidence,
      suggestedFix,
      detectedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate recommendations from issues
   */
  private generateRecommendations(issues: CoherenceIssue[]): CoherenceRecommendation[] {
    const recommendations: CoherenceRecommendation[] = [];

    // Group issues by domain
    const byDomain = new Map<AlignmentDomain, CoherenceIssue[]>();
    for (const issue of issues) {
      const existing = byDomain.get(issue.domain) || [];
      existing.push(issue);
      byDomain.set(issue.domain, existing);
    }

    // Create recommendations for each domain with issues
    for (const [domain, domainIssues] of byDomain.entries()) {
      const criticalCount = domainIssues.filter(i => i.severity === 'critical').length;

      if (criticalCount > 0) {
        recommendations.push({
          id: `rec-${domain}-critical`,
          priority: 10,
          title: `Address ${criticalCount} critical ${domain} issues`,
          description: `Critical coherence issues detected in ${domain} domain`,
          action: `Review and fix: ${domainIssues.filter(i => i.severity === 'critical').map(i => i.title).join(', ')}`,
          relatedIssueIds: domainIssues.filter(i => i.severity === 'critical').map(i => i.id),
        });
      }

      if (domainIssues.length > 3) {
        recommendations.push({
          id: `rec-${domain}-systemic`,
          priority: 7,
          title: `Systemic ${domain} alignment issues`,
          description: `${domainIssues.length} issues suggest systemic misalignment`,
          action: `Review ${domain} domain configuration and dependencies`,
          relatedIssueIds: domainIssues.map(i => i.id),
        });
      }
    }

    // Add graph sync recommendation if needed
    if (byDomain.has('graph-skill')) {
      recommendations.push({
        id: 'rec-rebuild-graph',
        priority: 5,
        title: 'Rebuild knowledge graph',
        description: 'Knowledge graph may be out of sync with skills',
        action: 'Run POST /api/knowledge-graph/build to rebuild',
        relatedIssueIds: (byDomain.get('graph-skill') || []).map(i => i.id),
      });
    }

    // Add MECE sync recommendation if needed
    if (byDomain.has('mece-roadmap')) {
      recommendations.push({
        id: 'rec-run-mece',
        priority: 4,
        title: 'Run MECE analysis',
        description: 'MECE analysis may be stale',
        action: 'Run POST /api/mece/analysis to sync',
        relatedIssueIds: (byDomain.get('mece-roadmap') || []).map(i => i.id),
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Issue Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all issues
   */
  getIssues(filter?: {
    domain?: AlignmentDomain;
    severity?: IssueSeverity;
    status?: IssueStatus;
  }): CoherenceIssue[] {
    let issues = Array.from(this.issues.values());

    if (filter?.domain) {
      issues = issues.filter(i => i.domain === filter.domain);
    }
    if (filter?.severity) {
      issues = issues.filter(i => i.severity === filter.severity);
    }
    if (filter?.status) {
      issues = issues.filter(i => i.status === filter.status);
    }

    return issues;
  }

  /**
   * Get a specific issue
   */
  getIssue(id: string): CoherenceIssue | undefined {
    return this.issues.get(id);
  }

  /**
   * Update issue status
   */
  updateIssueStatus(id: string, status: IssueStatus): CoherenceIssue | undefined {
    const issue = this.issues.get(id);
    if (!issue) return undefined;

    issue.status = status;
    if (status === 'resolved') {
      issue.resolvedAt = new Date().toISOString();
    }

    this.saveState();
    return issue;
  }

  /**
   * Get last report
   */
  getLastReport(): CoherenceReport | undefined {
    return this.lastReport;
  }

  /**
   * Get status summary
   */
  getStatus(): {
    totalIssues: number;
    openIssues: number;
    criticalIssues: number;
    lastValidation?: string;
    overallScore?: number;
  } {
    const issues = Array.from(this.issues.values());
    return {
      totalIssues: issues.length,
      openIssues: issues.filter(i => i.status === 'open').length,
      criticalIssues: issues.filter(i => i.severity === 'critical' && i.status === 'open').length,
      lastValidation: this.lastReport?.timestamp,
      overallScore: this.lastReport?.overallScore,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Persistence
  // ─────────────────────────────────────────────────────────────────────────

  private async saveState(): Promise<void> {
    const state = {
      issues: Array.from(this.issues.entries()),
      lastReport: this.lastReport,
      savedAt: new Date().toISOString(),
    };
    await fs.writeFile(this.dataPath, JSON.stringify(state, null, 2));
  }

  private async loadState(): Promise<void> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const state = JSON.parse(data);

      if (state.issues) this.issues = new Map(state.issues);
      if (state.lastReport) this.lastReport = state.lastReport;
    } catch {
      // No existing state
    }
  }

  /**
   * Generate terminal view
   */
  generateTerminalView(): string {
    const status = this.getStatus();
    const report = this.lastReport;

    const lines: string[] = [
      '╔══════════════════════════════════════════════════════════════════╗',
      '║                    COHERENCE SYSTEM                              ║',
      '╠══════════════════════════════════════════════════════════════════╣',
      `║  Overall Score: ${report?.overallScore ?? 'N/A'}%${report?.overallValid ? ' ✓' : report ? ' ✗' : ''}`,
      `║  Issues: ${status.openIssues} open (${status.criticalIssues} critical)`,
      `║  Last Check: ${status.lastValidation ? new Date(status.lastValidation).toLocaleString() : 'Never'}`,
      '║                                                                  ║',
    ];

    if (report?.domainValidations) {
      lines.push('╠══════════════════════════════════════════════════════════════════╣');
      lines.push('║  DOMAIN SCORES                                                   ║');
      lines.push('╠══════════════════════════════════════════════════════════════════╣');

      for (const dv of report.domainValidations) {
        const bar = '█'.repeat(Math.round(dv.score / 5)) + '░'.repeat(20 - Math.round(dv.score / 5));
        const icon = dv.valid ? '✓' : '✗';
        lines.push(`║  ${dv.domain.padEnd(18)} ${bar} ${dv.score}% ${icon}`);
      }
    }

    if (report?.recommendations && report.recommendations.length > 0) {
      lines.push('║                                                                  ║');
      lines.push('╠══════════════════════════════════════════════════════════════════╣');
      lines.push('║  TOP RECOMMENDATIONS                                             ║');
      lines.push('╠══════════════════════════════════════════════════════════════════╣');

      for (const rec of report.recommendations.slice(0, 3)) {
        lines.push(`║  [${rec.priority}] ${rec.title.slice(0, 50)}`);
      }
    }

    lines.push('║                                                                  ║');
    lines.push('╚══════════════════════════════════════════════════════════════════╝');

    return lines.map(l => l.padEnd(70) + (l.endsWith('║') ? '' : '║')).join('\n');
  }
}
