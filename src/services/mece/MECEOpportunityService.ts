/**
 * MECE Opportunity Mapping Service
 *
 * Mutually Exclusive, Collectively Exhaustive opportunity analysis
 * at system and module levels. Ensures no blind spots in roadmap coverage.
 *
 * MECE Principle:
 * - Mutually Exclusive: Each opportunity falls into exactly one category
 * - Collectively Exhaustive: All possible opportunities are covered
 *
 * This service:
 * 1. Defines a category taxonomy covering the entire opportunity space
 * 2. Maps existing modules/skills/patterns to categories
 * 3. Identifies gaps (areas not covered)
 * 4. Identifies overlaps (duplicate efforts)
 * 5. Generates recommendations for roadmap completeness
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { RoadmapService, Module, LeverageScore } from '../roadmapping/index.js';
import type { KnowledgeGraphService, SkillNode, GapAnalysis } from '../knowledge-graph/index.js';
import type { PatternsService } from '../patterns/index.js';
import type { AnalyticsService } from '../analytics/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type OpportunitySource = 'roadmap' | 'skill' | 'pattern' | 'analytics' | 'gap-analysis' | 'manual';
export type OpportunityStatus = 'identified' | 'planned' | 'in-progress' | 'complete' | 'rejected';
export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';
export type OverlapResolution = 'merge' | 'differentiate' | 'remove' | 'keep-both';

/**
 * A category in the MECE taxonomy
 */
export interface Category {
  id: string;
  name: string;
  description: string;
  layer: number; // 0-6 corresponding to roadmap layers
  subcategories: Subcategory[];
  keywords: string[]; // For automatic classification
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

/**
 * An opportunity in the system
 */
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  source: OpportunitySource;
  sourceId?: string; // module ID, skill ID, pattern ID
  status: OpportunityStatus;
  leverage: number; // 0-10
  dependencies: string[]; // other opportunity IDs
  blockedBy: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * A gap in coverage
 */
export interface Gap {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  description: string;
  severity: GapSeverity;
  evidence: string[];
  suggestedOpportunity?: {
    title: string;
    description: string;
    estimatedLeverage: number;
  };
}

/**
 * An overlap between opportunities
 */
export interface Overlap {
  id: string;
  opportunityIds: string[];
  description: string;
  overlapType: 'functional' | 'scope' | 'dependency';
  suggestedResolution: OverlapResolution;
  resolutionRationale: string;
}

/**
 * A recommendation from the analysis
 */
export interface Recommendation {
  id: string;
  type: 'add-opportunity' | 'merge-opportunities' | 'refine-category' | 'address-gap' | 'resolve-overlap';
  priority: number; // 1-10
  title: string;
  description: string;
  action: string;
  relatedIds: string[]; // gap IDs, overlap IDs, opportunity IDs
  leverage: number;
}

/**
 * Coverage metrics for a category
 */
export interface CategoryCoverage {
  categoryId: string;
  categoryName: string;
  totalOpportunities: number;
  byStatus: Record<OpportunityStatus, number>;
  bySubcategory: Record<string, number>;
  coverageScore: number; // 0-100
  gaps: Gap[];
  overlaps: Overlap[];
}

/**
 * Full MECE analysis result
 */
export interface MECEAnalysis {
  id: string;
  timestamp: string;
  version: string;
  categories: Category[];
  opportunities: Opportunity[];
  categoryCoverage: CategoryCoverage[];
  overallCoverage: number;
  totalGaps: number;
  totalOverlaps: number;
  gaps: Gap[];
  overlaps: Overlap[];
  recommendations: Recommendation[];
  metadata: {
    modulesAnalyzed: number;
    skillsAnalyzed: number;
    patternsAnalyzed: number;
    analysisTimeMs: number;
  };
}

export interface MECEServiceOptions {
  dataPath: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default MECE Taxonomy
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TAXONOMY: Category[] = [
  {
    id: 'foundation',
    name: 'Foundation',
    description: 'Core infrastructure, data persistence, and base capabilities',
    layer: 0,
    subcategories: [
      { id: 'data-layer', name: 'Data Layer', description: 'Persistence, storage, caching', keywords: ['database', 'storage', 'persist', 'cache'] },
      { id: 'core-services', name: 'Core Services', description: 'Essential runtime services', keywords: ['service', 'registry', 'engine'] },
      { id: 'configuration', name: 'Configuration', description: 'System configuration and settings', keywords: ['config', 'settings', 'environment'] },
    ],
    keywords: ['foundation', 'core', 'infrastructure', 'base'],
  },
  {
    id: 'execution',
    name: 'Execution',
    description: 'Loop execution, skill invocation, and workflow management',
    layer: 0,
    subcategories: [
      { id: 'loop-execution', name: 'Loop Execution', description: 'Running loops through phases', keywords: ['loop', 'phase', 'execution', 'workflow'] },
      { id: 'skill-invocation', name: 'Skill Invocation', description: 'Invoking and managing skills', keywords: ['skill', 'invoke', 'call'] },
      { id: 'gate-management', name: 'Gate Management', description: 'Quality gates and approval flows', keywords: ['gate', 'approval', 'validation'] },
    ],
    keywords: ['execution', 'run', 'workflow', 'process'],
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    description: 'Analysis, pattern detection, learning, and decision making',
    layer: 2,
    subcategories: [
      { id: 'analytics', name: 'Analytics', description: 'Metrics collection and analysis', keywords: ['analytics', 'metrics', 'statistics'] },
      { id: 'pattern-detection', name: 'Pattern Detection', description: 'Identifying patterns and behaviors', keywords: ['pattern', 'detect', 'behavior'] },
      { id: 'learning', name: 'Learning', description: 'Improvement proposals and skill upgrades', keywords: ['learning', 'improvement', 'upgrade'] },
      { id: 'scoring', name: 'Scoring', description: 'Evaluation and ranking', keywords: ['score', 'rank', 'evaluate', 'calibration'] },
      { id: 'opportunity-mapping', name: 'Opportunity Mapping', description: 'MECE analysis and gap detection', keywords: ['mece', 'opportunity', 'gap', 'coverage'] },
    ],
    keywords: ['intelligence', 'analysis', 'learning', 'smart'],
  },
  {
    id: 'visualization',
    name: 'Visualization',
    description: 'UI, dashboards, graphs, and visual representations',
    layer: 1,
    subcategories: [
      { id: 'dashboards', name: 'Dashboards', description: 'Summary views and control panels', keywords: ['dashboard', 'panel', 'summary'] },
      { id: 'graphs', name: 'Graphs', description: 'Network and relationship visualizations', keywords: ['graph', 'network', 'tree', 'dag'] },
      { id: 'progress-tracking', name: 'Progress Tracking', description: 'Roadmap and completion visualization', keywords: ['progress', 'roadmap', 'kanban', 'ladder'] },
      { id: 'temporal', name: 'Temporal', description: 'Time-based visualizations', keywords: ['clock', 'timeline', 'temporal', 'ooda'] },
    ],
    keywords: ['visualization', 'ui', 'display', 'view'],
  },
  {
    id: 'autonomy',
    name: 'Autonomy',
    description: 'Background processing, self-improvement, and autonomous operation',
    layer: 1,
    subcategories: [
      { id: 'background-execution', name: 'Background Execution', description: 'Autonomous loop execution', keywords: ['autonomous', 'background', 'auto'] },
      { id: 'proposal-generation', name: 'Proposal Generation', description: 'Dreaming and proposal creation', keywords: ['dream', 'propose', 'suggest'] },
      { id: 'self-improvement', name: 'Self-Improvement', description: 'Automatic upgrades and learning', keywords: ['self-improve', 'upgrade', 'evolve'] },
      { id: 'coordination', name: 'Coordination', description: 'Multi-agent and worktree coordination', keywords: ['coordinate', 'multi-agent', 'worktree', 'parallel'] },
    ],
    keywords: ['autonomy', 'automatic', 'self', 'background'],
  },
  {
    id: 'interface',
    name: 'Interface',
    description: 'Voice, messaging, external integrations, and user interaction',
    layer: 3,
    subcategories: [
      { id: 'voice', name: 'Voice', description: 'Voice input/output', keywords: ['voice', 'speech', 'audio'] },
      { id: 'messaging', name: 'Messaging', description: 'Proactive messaging and notifications', keywords: ['message', 'notification', 'alert', 'proactive'] },
      { id: 'integrations', name: 'Integrations', description: 'External service integrations', keywords: ['integration', 'slack', 'email', 'webhook'] },
      { id: 'api', name: 'API', description: 'REST and MCP API interfaces', keywords: ['api', 'rest', 'mcp', 'endpoint'] },
    ],
    keywords: ['interface', 'integration', 'external', 'communication'],
  },
  {
    id: 'domain',
    name: 'Domain Loops',
    description: 'Business-specific and domain-specific loop implementations',
    layer: 4,
    subcategories: [
      { id: 'engineering', name: 'Engineering', description: 'Software engineering workflows', keywords: ['engineering', 'code', 'build', 'deploy'] },
      { id: 'business', name: 'Business', description: 'Business process workflows', keywords: ['business', 'sales', 'ops', 'gtm'] },
      { id: 'creative', name: 'Creative', description: 'Creative and content workflows', keywords: ['creative', 'content', 'design'] },
      { id: 'research', name: 'Research', description: 'Research and analysis workflows', keywords: ['research', 'analysis', 'audit'] },
    ],
    keywords: ['domain', 'loop', 'workflow', 'process'],
  },
  {
    id: 'meta',
    name: 'Meta',
    description: 'Self-referential capabilities, sovereignty, and system evolution',
    layer: 5,
    subcategories: [
      { id: 'game-design', name: 'Game Design', description: 'Finite/infinite game framing', keywords: ['game', 'finite', 'infinite', 'win'] },
      { id: 'collaboration', name: 'Collaboration', description: 'Multi-user and co-op capabilities', keywords: ['collaborate', 'co-op', 'team', 'multi-user'] },
      { id: 'knowledge-management', name: 'Knowledge Management', description: 'Spaced repetition, decks, learning', keywords: ['knowledge', 'spaced', 'repetition', 'deck'] },
      { id: 'distribution', name: 'Distribution', description: 'Updates, sharing, publishing', keywords: ['distribute', 'update', 'publish', 'share'] },
    ],
    keywords: ['meta', 'self', 'evolution', 'sovereignty'],
  },
  {
    id: 'sovereignty',
    name: 'Sovereignty',
    description: 'Local-first architecture, privacy, and true ownership',
    layer: 6,
    subcategories: [
      { id: 'local-first', name: 'Local First', description: 'Offline-capable, local storage', keywords: ['local', 'offline', 'privacy'] },
      { id: 'encryption', name: 'Encryption', description: 'Data encryption and security', keywords: ['encrypt', 'security', 'private'] },
      { id: 'sync', name: 'Sync', description: 'Cross-device synchronization', keywords: ['sync', 'replicate', 'cross-device'] },
    ],
    keywords: ['sovereignty', 'local', 'privacy', 'ownership'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MECEOpportunityService
// ─────────────────────────────────────────────────────────────────────────────

export class MECEOpportunityService extends EventEmitter {
  private dataPath: string;
  private taxonomy: Category[] = DEFAULT_TAXONOMY;
  private opportunities: Map<string, Opportunity> = new Map();
  private gaps: Map<string, Gap> = new Map();
  private overlaps: Map<string, Overlap> = new Map();
  private lastAnalysis?: MECEAnalysis;

  // Dependencies
  private roadmapService?: RoadmapService;
  private knowledgeGraphService?: KnowledgeGraphService;
  private patternsService?: PatternsService;
  private analyticsService?: AnalyticsService;

  constructor(options: MECEServiceOptions) {
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
    analyticsService?: AnalyticsService;
  }): void {
    this.roadmapService = deps.roadmapService;
    this.knowledgeGraphService = deps.knowledgeGraphService;
    this.patternsService = deps.patternsService;
    this.analyticsService = deps.analyticsService;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
    await this.loadState();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Analysis
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Run full MECE analysis
   */
  async runAnalysis(): Promise<MECEAnalysis> {
    const startTime = Date.now();

    // Step 1: Collect opportunities from all sources
    await this.collectOpportunitiesFromRoadmap();
    await this.collectOpportunitiesFromSkills();
    await this.collectOpportunitiesFromPatterns();

    // Step 2: Classify opportunities into categories
    this.classifyOpportunities();

    // Step 3: Identify gaps
    this.identifyGaps();

    // Step 4: Identify overlaps
    this.identifyOverlaps();

    // Step 5: Generate recommendations
    const recommendations = this.generateRecommendations();

    // Step 6: Calculate coverage
    const categoryCoverage = this.calculateCategoryCoverage();
    const overallCoverage = this.calculateOverallCoverage(categoryCoverage);

    // Build analysis result
    const analysis: MECEAnalysis = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      categories: this.taxonomy,
      opportunities: Array.from(this.opportunities.values()),
      categoryCoverage,
      overallCoverage,
      totalGaps: this.gaps.size,
      totalOverlaps: this.overlaps.size,
      gaps: Array.from(this.gaps.values()),
      overlaps: Array.from(this.overlaps.values()),
      recommendations,
      metadata: {
        modulesAnalyzed: this.countBySource('roadmap'),
        skillsAnalyzed: this.countBySource('skill'),
        patternsAnalyzed: this.countBySource('pattern'),
        analysisTimeMs: Date.now() - startTime,
      },
    };

    this.lastAnalysis = analysis;
    await this.saveState();

    this.emit('analysis:complete', analysis);
    return analysis;
  }

  /**
   * Collect opportunities from roadmap modules
   */
  private async collectOpportunitiesFromRoadmap(): Promise<void> {
    if (!this.roadmapService) return;

    const progress = this.roadmapService.getProgress();
    const modules = [
      ...progress.layerProgress.flatMap(lp => lp.modules),
    ];

    for (const module of modules) {
      const opportunity = this.moduleToOpportunity(module);
      this.opportunities.set(opportunity.id, opportunity);
    }
  }

  /**
   * Convert a module to an opportunity
   */
  private moduleToOpportunity(module: Module): Opportunity {
    return {
      id: `roadmap-${module.id}`,
      title: module.name,
      description: module.description,
      categoryId: this.classifyByKeywords(module.name + ' ' + module.description),
      source: 'roadmap',
      sourceId: module.id,
      status: this.mapModuleStatus(module.status),
      leverage: this.estimateLeverage(module),
      dependencies: module.dependsOn.map(d => `roadmap-${d}`),
      blockedBy: [],
      tags: [module.id, `layer-${module.layer}`],
      createdAt: module.startedAt || new Date().toISOString(),
      updatedAt: module.completedAt || new Date().toISOString(),
    };
  }

  /**
   * Collect opportunities from skills
   */
  private async collectOpportunitiesFromSkills(): Promise<void> {
    if (!this.knowledgeGraphService) return;

    try {
      const graph = this.knowledgeGraphService.getGraph();
      if (!graph) return;

      for (const node of graph.nodes) {
        // Only create opportunities for skills that suggest improvements
        if (node.averageRubric && node.averageRubric < 70) {
          const opportunity: Opportunity = {
            id: `skill-improve-${node.id}`,
            title: `Improve skill: ${node.name}`,
            description: `Skill ${node.name} has below-average rubric score (${node.averageRubric}). Consider improvements.`,
            categoryId: this.classifyByKeywords(node.name + ' ' + (node.description || '')),
            source: 'skill',
            sourceId: node.id,
            status: 'identified',
            leverage: node.leverageScore || 5,
            dependencies: node.dependsOn.map(d => `skill-${d}`),
            blockedBy: [],
            tags: [...node.tags, node.phase || 'unknown'].filter(Boolean),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.opportunities.set(opportunity.id, opportunity);
        }
      }
    } catch {
      // Graph may not be built yet
    }
  }

  /**
   * Collect opportunities from patterns
   */
  private async collectOpportunitiesFromPatterns(): Promise<void> {
    if (!this.patternsService) return;

    try {
      const detection = await this.patternsService.detectPatterns();

      // Convert pattern gaps to opportunities
      for (const gap of detection.gaps) {
        const opportunity: Opportunity = {
          id: `pattern-gap-${gap.category}`,
          title: `Address pattern gap: ${gap.suggestedName || gap.category}`,
          description: gap.description || `Missing patterns in ${gap.category} category`,
          categoryId: this.classifyByKeywords(gap.category),
          source: 'gap-analysis',
          sourceId: gap.category,
          status: 'identified',
          leverage: gap.priority === 'high' ? 8 : gap.priority === 'medium' ? 5 : 3,
          dependencies: [],
          blockedBy: [],
          tags: [gap.category, 'pattern-gap'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.opportunities.set(opportunity.id, opportunity);
      }
    } catch {
      // Patterns service may not have data
    }
  }

  /**
   * Classify opportunities into categories using keyword matching
   */
  private classifyOpportunities(): void {
    for (const opportunity of this.opportunities.values()) {
      if (!opportunity.categoryId || opportunity.categoryId === 'uncategorized') {
        opportunity.categoryId = this.classifyByKeywords(
          opportunity.title + ' ' + opportunity.description
        );
        opportunity.subcategoryId = this.classifySubcategory(
          opportunity.categoryId,
          opportunity.title + ' ' + opportunity.description
        );
      }
    }
  }

  /**
   * Classify text into a category using keyword matching
   */
  private classifyByKeywords(text: string): string {
    const lowerText = text.toLowerCase();
    let bestMatch = { categoryId: 'uncategorized', score: 0 };

    for (const category of this.taxonomy) {
      let score = 0;
      for (const keyword of category.keywords) {
        if (lowerText.includes(keyword)) {
          score += 2;
        }
      }
      for (const sub of category.subcategories) {
        for (const keyword of sub.keywords) {
          if (lowerText.includes(keyword)) {
            score += 1;
          }
        }
      }
      if (score > bestMatch.score) {
        bestMatch = { categoryId: category.id, score };
      }
    }

    return bestMatch.categoryId;
  }

  /**
   * Classify into subcategory
   */
  private classifySubcategory(categoryId: string, text: string): string | undefined {
    const category = this.taxonomy.find(c => c.id === categoryId);
    if (!category) return undefined;

    const lowerText = text.toLowerCase();
    let bestMatch = { subcategoryId: undefined as string | undefined, score: 0 };

    for (const sub of category.subcategories) {
      let score = 0;
      for (const keyword of sub.keywords) {
        if (lowerText.includes(keyword)) {
          score++;
        }
      }
      if (score > bestMatch.score) {
        bestMatch = { subcategoryId: sub.id, score };
      }
    }

    return bestMatch.subcategoryId;
  }

  /**
   * Identify gaps in coverage
   */
  private identifyGaps(): void {
    this.gaps.clear();

    for (const category of this.taxonomy) {
      const categoryOpps = Array.from(this.opportunities.values())
        .filter(o => o.categoryId === category.id);

      // Check overall category coverage
      if (categoryOpps.length === 0) {
        this.gaps.set(`gap-${category.id}`, {
          id: `gap-${category.id}`,
          categoryId: category.id,
          description: `No opportunities identified in "${category.name}" category`,
          severity: 'high',
          evidence: ['Zero opportunities mapped to this category'],
          suggestedOpportunity: {
            title: `Explore ${category.name} opportunities`,
            description: `Identify and plan work in the ${category.name} area`,
            estimatedLeverage: 5,
          },
        });
      }

      // Check subcategory coverage
      for (const sub of category.subcategories) {
        const subOpps = categoryOpps.filter(o => o.subcategoryId === sub.id);
        if (subOpps.length === 0 && categoryOpps.length > 0) {
          this.gaps.set(`gap-${category.id}-${sub.id}`, {
            id: `gap-${category.id}-${sub.id}`,
            categoryId: category.id,
            subcategoryId: sub.id,
            description: `No opportunities in "${sub.name}" subcategory`,
            severity: 'medium',
            evidence: [`Category "${category.name}" has ${categoryOpps.length} opportunities but none in "${sub.name}"`],
            suggestedOpportunity: {
              title: `Add ${sub.name} capability`,
              description: sub.description,
              estimatedLeverage: 4,
            },
          });
        }
      }

      // Check for categories with only completed opportunities (stagnation)
      const activeOpps = categoryOpps.filter(o => o.status !== 'complete');
      if (categoryOpps.length > 0 && activeOpps.length === 0) {
        this.gaps.set(`gap-stagnant-${category.id}`, {
          id: `gap-stagnant-${category.id}`,
          categoryId: category.id,
          description: `"${category.name}" category has no active opportunities`,
          severity: 'low',
          evidence: [`All ${categoryOpps.length} opportunities are complete`],
          suggestedOpportunity: {
            title: `Identify next-level ${category.name} opportunities`,
            description: `Category is complete at current level; identify advanced opportunities`,
            estimatedLeverage: 3,
          },
        });
      }
    }
  }

  /**
   * Identify overlaps between opportunities
   */
  private identifyOverlaps(): void {
    this.overlaps.clear();
    const opportunities = Array.from(this.opportunities.values());

    for (let i = 0; i < opportunities.length; i++) {
      for (let j = i + 1; j < opportunities.length; j++) {
        const a = opportunities[i];
        const b = opportunities[j];

        // Check for title similarity
        if (this.stringSimilarity(a.title, b.title) > 0.7) {
          this.overlaps.set(`overlap-${a.id}-${b.id}`, {
            id: `overlap-${a.id}-${b.id}`,
            opportunityIds: [a.id, b.id],
            description: `"${a.title}" and "${b.title}" appear similar`,
            overlapType: 'scope',
            suggestedResolution: 'merge',
            resolutionRationale: 'High title similarity suggests overlapping scope',
          });
        }

        // Check for same source
        if (a.sourceId && a.sourceId === b.sourceId && a.source !== b.source) {
          this.overlaps.set(`overlap-source-${a.id}-${b.id}`, {
            id: `overlap-source-${a.id}-${b.id}`,
            opportunityIds: [a.id, b.id],
            description: `Multiple opportunities from same source: ${a.sourceId}`,
            overlapType: 'functional',
            suggestedResolution: 'differentiate',
            resolutionRationale: 'Same underlying item represented differently',
          });
        }

        // Check for circular dependencies
        if (a.dependencies.includes(b.id) && b.dependencies.includes(a.id)) {
          this.overlaps.set(`overlap-circular-${a.id}-${b.id}`, {
            id: `overlap-circular-${a.id}-${b.id}`,
            opportunityIds: [a.id, b.id],
            description: `Circular dependency between "${a.title}" and "${b.title}"`,
            overlapType: 'dependency',
            suggestedResolution: 'differentiate',
            resolutionRationale: 'Break circular dependency by clarifying scope',
          });
        }
      }
    }
  }

  /**
   * Simple string similarity (Jaccard on words)
   */
  private stringSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2));

    const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
    const union = new Set([...wordsA, ...wordsB]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Recommendations from gaps
    for (const gap of this.gaps.values()) {
      if (gap.suggestedOpportunity) {
        recommendations.push({
          id: `rec-${gap.id}`,
          type: 'address-gap',
          priority: gap.severity === 'critical' ? 10 : gap.severity === 'high' ? 8 : gap.severity === 'medium' ? 5 : 3,
          title: `Address gap: ${gap.description}`,
          description: gap.suggestedOpportunity.description,
          action: `Create opportunity: "${gap.suggestedOpportunity.title}"`,
          relatedIds: [gap.id],
          leverage: gap.suggestedOpportunity.estimatedLeverage,
        });
      }
    }

    // Recommendations from overlaps
    for (const overlap of this.overlaps.values()) {
      recommendations.push({
        id: `rec-${overlap.id}`,
        type: 'resolve-overlap',
        priority: overlap.overlapType === 'dependency' ? 7 : 4,
        title: `Resolve overlap: ${overlap.description}`,
        description: overlap.resolutionRationale,
        action: `${overlap.suggestedResolution}: ${overlap.opportunityIds.join(', ')}`,
        relatedIds: [overlap.id, ...overlap.opportunityIds],
        leverage: 4,
      });
    }

    // Recommendations for high-leverage unstarted opportunities
    const unstartedHighLeverage = Array.from(this.opportunities.values())
      .filter(o => o.status === 'identified' && o.leverage >= 7)
      .sort((a, b) => b.leverage - a.leverage)
      .slice(0, 5);

    for (const opp of unstartedHighLeverage) {
      recommendations.push({
        id: `rec-start-${opp.id}`,
        type: 'add-opportunity',
        priority: Math.round(opp.leverage),
        title: `Start high-leverage opportunity: ${opp.title}`,
        description: opp.description,
        action: `Plan and begin work on "${opp.title}"`,
        relatedIds: [opp.id],
        leverage: opp.leverage,
      });
    }

    // Sort by priority
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate coverage for each category
   */
  private calculateCategoryCoverage(): CategoryCoverage[] {
    return this.taxonomy.map(category => {
      const opps = Array.from(this.opportunities.values())
        .filter(o => o.categoryId === category.id);

      const byStatus: Record<OpportunityStatus, number> = {
        identified: 0,
        planned: 0,
        'in-progress': 0,
        complete: 0,
        rejected: 0,
      };
      const bySubcategory: Record<string, number> = {};

      for (const opp of opps) {
        byStatus[opp.status]++;
        if (opp.subcategoryId) {
          bySubcategory[opp.subcategoryId] = (bySubcategory[opp.subcategoryId] || 0) + 1;
        }
      }

      // Calculate coverage score
      const subcategoryCount = category.subcategories.length;
      const coveredSubcategories = Object.keys(bySubcategory).length;
      const subcategoryCoverage = subcategoryCount > 0 ? (coveredSubcategories / subcategoryCount) * 50 : 50;

      const statusScore = (byStatus.complete * 40 + byStatus['in-progress'] * 30 + byStatus.planned * 20 + byStatus.identified * 10) / Math.max(opps.length, 1);
      const coverageScore = Math.min(100, subcategoryCoverage + statusScore);

      const categoryGaps = Array.from(this.gaps.values()).filter(g => g.categoryId === category.id);
      const categoryOverlaps = Array.from(this.overlaps.values()).filter(o =>
        opps.some(opp => o.opportunityIds.includes(opp.id))
      );

      return {
        categoryId: category.id,
        categoryName: category.name,
        totalOpportunities: opps.length,
        byStatus,
        bySubcategory,
        coverageScore,
        gaps: categoryGaps,
        overlaps: categoryOverlaps,
      };
    });
  }

  /**
   * Calculate overall coverage
   */
  private calculateOverallCoverage(categoryCoverage: CategoryCoverage[]): number {
    if (categoryCoverage.length === 0) return 0;

    const total = categoryCoverage.reduce((sum, c) => sum + c.coverageScore, 0);
    return Math.round(total / categoryCoverage.length);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Manual Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Add a manual opportunity
   */
  addOpportunity(opp: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>): Opportunity {
    const opportunity: Opportunity = {
      ...opp,
      id: `manual-${randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.opportunities.set(opportunity.id, opportunity);
    this.saveState();
    return opportunity;
  }

  /**
   * Update an opportunity
   */
  updateOpportunity(id: string, updates: Partial<Opportunity>): Opportunity | undefined {
    const opp = this.opportunities.get(id);
    if (!opp) return undefined;

    const updated = { ...opp, ...updates, updatedAt: new Date().toISOString() };
    this.opportunities.set(id, updated);
    this.saveState();
    return updated;
  }

  /**
   * Remove an opportunity
   */
  removeOpportunity(id: string): boolean {
    const deleted = this.opportunities.delete(id);
    if (deleted) this.saveState();
    return deleted;
  }

  /**
   * Add or update a category
   */
  setCategory(category: Category): void {
    const index = this.taxonomy.findIndex(c => c.id === category.id);
    if (index >= 0) {
      this.taxonomy[index] = category;
    } else {
      this.taxonomy.push(category);
    }
    this.saveState();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Queries
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get taxonomy
   */
  getTaxonomy(): Category[] {
    return this.taxonomy;
  }

  /**
   * Get opportunities
   */
  getOpportunities(filter?: {
    categoryId?: string;
    status?: OpportunityStatus;
    source?: OpportunitySource;
  }): Opportunity[] {
    let opps = Array.from(this.opportunities.values());

    if (filter?.categoryId) {
      opps = opps.filter(o => o.categoryId === filter.categoryId);
    }
    if (filter?.status) {
      opps = opps.filter(o => o.status === filter.status);
    }
    if (filter?.source) {
      opps = opps.filter(o => o.source === filter.source);
    }

    return opps;
  }

  /**
   * Get gaps
   */
  getGaps(filter?: { categoryId?: string; severity?: GapSeverity }): Gap[] {
    let gaps = Array.from(this.gaps.values());

    if (filter?.categoryId) {
      gaps = gaps.filter(g => g.categoryId === filter.categoryId);
    }
    if (filter?.severity) {
      gaps = gaps.filter(g => g.severity === filter.severity);
    }

    return gaps;
  }

  /**
   * Get overlaps
   */
  getOverlaps(): Overlap[] {
    return Array.from(this.overlaps.values());
  }

  /**
   * Get last analysis
   */
  getLastAnalysis(): MECEAnalysis | undefined {
    return this.lastAnalysis;
  }

  /**
   * Get status
   */
  getStatus(): {
    taxonomyCategories: number;
    totalOpportunities: number;
    totalGaps: number;
    totalOverlaps: number;
    lastAnalysis?: string;
  } {
    return {
      taxonomyCategories: this.taxonomy.length,
      totalOpportunities: this.opportunities.size,
      totalGaps: this.gaps.size,
      totalOverlaps: this.overlaps.size,
      lastAnalysis: this.lastAnalysis?.timestamp,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  private mapModuleStatus(status: string): OpportunityStatus {
    switch (status) {
      case 'complete': return 'complete';
      case 'in-progress': return 'in-progress';
      case 'blocked': return 'planned';
      default: return 'identified';
    }
  }

  private estimateLeverage(module: Module): number {
    // Base leverage on layer (higher layers generally more impactful)
    const layerScore = Math.max(1, 7 - module.layer);
    // Boost for modules that unlock many others
    const unlockBoost = Math.min(3, module.unlocks.length);
    return Math.min(10, layerScore + unlockBoost);
  }

  private countBySource(source: OpportunitySource): number {
    return Array.from(this.opportunities.values()).filter(o => o.source === source).length;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Persistence
  // ─────────────────────────────────────────────────────────────────────────

  private async saveState(): Promise<void> {
    const state = {
      taxonomy: this.taxonomy,
      opportunities: Array.from(this.opportunities.entries()),
      gaps: Array.from(this.gaps.entries()),
      overlaps: Array.from(this.overlaps.entries()),
      lastAnalysis: this.lastAnalysis,
      savedAt: new Date().toISOString(),
    };
    await fs.writeFile(this.dataPath, JSON.stringify(state, null, 2));
  }

  private async loadState(): Promise<void> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const state = JSON.parse(data);

      if (state.taxonomy) this.taxonomy = state.taxonomy;
      if (state.opportunities) this.opportunities = new Map(state.opportunities);
      if (state.gaps) this.gaps = new Map(state.gaps);
      if (state.overlaps) this.overlaps = new Map(state.overlaps);
      if (state.lastAnalysis) this.lastAnalysis = state.lastAnalysis;
    } catch {
      // No existing state
    }
  }

  /**
   * Generate terminal view
   */
  generateTerminalView(): string {
    const status = this.getStatus();
    const coverage = this.lastAnalysis?.categoryCoverage || [];

    const lines: string[] = [
      '╔══════════════════════════════════════════════════════════════════╗',
      '║              MECE OPPORTUNITY MAPPING                            ║',
      '╠══════════════════════════════════════════════════════════════════╣',
      `║  Categories: ${status.taxonomyCategories}    Opportunities: ${status.totalOpportunities}`,
      `║  Gaps: ${status.totalGaps}           Overlaps: ${status.totalOverlaps}`,
      `║  Overall Coverage: ${this.lastAnalysis?.overallCoverage ?? 'N/A'}%`,
      '║                                                                  ║',
      '╠══════════════════════════════════════════════════════════════════╣',
      '║  CATEGORY COVERAGE                                               ║',
      '╠══════════════════════════════════════════════════════════════════╣',
    ];

    for (const cat of coverage.slice(0, 8)) {
      const bar = this.progressBar(cat.coverageScore, 20);
      lines.push(`║  ${cat.categoryName.padEnd(15)} ${bar} ${cat.coverageScore}%`);
    }

    if (this.gaps.size > 0) {
      lines.push('║                                                                  ║');
      lines.push('╠══════════════════════════════════════════════════════════════════╣');
      lines.push('║  TOP GAPS                                                        ║');
      lines.push('╠══════════════════════════════════════════════════════════════════╣');

      const topGaps = Array.from(this.gaps.values())
        .sort((a, b) => this.severityScore(b.severity) - this.severityScore(a.severity))
        .slice(0, 3);

      for (const gap of topGaps) {
        const sev = gap.severity.toUpperCase().padEnd(8);
        lines.push(`║  [${sev}] ${gap.description.slice(0, 45)}`);
      }
    }

    lines.push('║                                                                  ║');
    lines.push('╚══════════════════════════════════════════════════════════════════╝');

    return lines.map(l => l.padEnd(70) + (l.endsWith('║') ? '' : '║')).join('\n');
  }

  private progressBar(percent: number, width: number): string {
    const filled = Math.round((percent / 100) * width);
    return '█'.repeat(filled) + '░'.repeat(width - filled);
  }

  private severityScore(severity: GapSeverity): number {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
    }
  }
}
