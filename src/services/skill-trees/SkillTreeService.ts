/**
 * SkillTreeService - DAG visualization of skill relationships
 *
 * Provides skill tree structures that illustrate skill relationships to LLMs
 * and help users gain familiarity by seeing each skill produce output before
 * using it in a loop. Interface to the skill-based ontology.
 *
 * Part of the skill-trees module (Layer 1 - Visualization).
 */

import { EventEmitter } from 'events';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import type { KnowledgeGraphService, SkillNode, Edge } from '../knowledge-graph/index.js';
import type { LoopComposer } from '../LoopComposer.js';

// ============================================================================
// Types
// ============================================================================

export interface SkillTreeServiceOptions {
  dataPath: string;
}

/**
 * A node in the skill tree with hierarchy information
 */
export interface TreeNode {
  id: string;
  name: string;
  description: string;
  phase?: string;
  category?: string;
  tags: string[];

  // Tree structure
  depth: number;                    // Distance from root(s)
  parents: string[];                // Direct prerequisites
  children: string[];               // Skills that depend on this

  // Metrics
  leverageScore: number;
  usageCount: number;
  inDegree: number;
  outDegree: number;

  // Progression
  progression: SkillProgression;

  // UI hints
  isRoot: boolean;                  // No prerequisites
  isLeaf: boolean;                  // No dependents
  isHub: boolean;                   // High connectivity (in + out >= 5)
  criticalPath: boolean;            // On critical learning path
}

/**
 * User's progression through a skill
 */
export interface SkillProgression {
  status: 'locked' | 'available' | 'in-progress' | 'familiar' | 'mastered';
  prerequisitesMet: boolean;
  outputsSeen: number;              // Times seen output from this skill
  usedInLoop: number;               // Times used this skill in a loop
  lastInteraction?: string;
  notes?: string;
}

/**
 * A complete skill tree for a domain
 */
export interface SkillTree {
  id: string;
  name: string;
  description: string;
  domain: TreeDomain;

  // Structure
  nodes: TreeNode[];
  edges: TreeEdge[];
  roots: string[];                  // Entry point skills
  leaves: string[];                 // Terminal skills

  // Statistics
  stats: {
    totalNodes: number;
    totalEdges: number;
    maxDepth: number;
    avgBranching: number;
    rootCount: number;
    leafCount: number;
    hubCount: number;
  };

  // Learning path
  suggestedOrder: string[];         // Topologically sorted learning order
  criticalPath: string[];           // Most important sequence

  // Metadata
  generatedAt: string;
  basedOnGraph: string;             // Knowledge graph version/timestamp
}

/**
 * Edge in the skill tree
 */
export interface TreeEdge {
  id: string;
  source: string;
  target: string;
  type: 'prerequisite' | 'recommended' | 'related';
  weight: number;
}

/**
 * Domain filter for generating trees
 */
export interface TreeDomain {
  type: 'phase' | 'tag' | 'category' | 'loop' | 'custom';
  value: string;
  filter?: (node: SkillNode) => boolean;
}

/**
 * Learning path through skills
 */
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  skills: string[];
  estimatedEffort: string;          // e.g., "2-3 sessions"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];          // Skills you should know first
  outcomes: string[];               // What you'll be able to do
}

/**
 * Persisted state
 */
interface SkillTreeState {
  trees: SkillTree[];
  progressions: Record<string, SkillProgression>;
  learningPaths: LearningPath[];
  lastUpdated: string;
}

// ============================================================================
// Service Implementation
// ============================================================================

export class SkillTreeService extends EventEmitter {
  private options: SkillTreeServiceOptions;
  private trees: Map<string, SkillTree> = new Map();
  private progressions: Map<string, SkillProgression> = new Map();
  private learningPaths: Map<string, LearningPath> = new Map();

  // Dependencies
  private knowledgeGraphService?: KnowledgeGraphService;
  private loopComposer?: LoopComposer;

  constructor(options: SkillTreeServiceOptions) {
    super();
    this.options = options;
  }

  /**
   * Set service dependencies
   */
  setDependencies(deps: {
    knowledgeGraphService?: KnowledgeGraphService;
    loopComposer?: LoopComposer;
  }): void {
    this.knowledgeGraphService = deps.knowledgeGraphService;
    this.loopComposer = deps.loopComposer;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    await this.loadState();
    this.emit('initialized');
  }

  private async loadState(): Promise<void> {
    try {
      const content = await readFile(this.options.dataPath, 'utf-8');
      const state: SkillTreeState = JSON.parse(content);

      this.trees.clear();
      for (const tree of state.trees) {
        this.trees.set(tree.id, tree);
      }

      this.progressions.clear();
      for (const [skillId, prog] of Object.entries(state.progressions)) {
        this.progressions.set(skillId, prog);
      }

      this.learningPaths.clear();
      for (const path of state.learningPaths) {
        this.learningPaths.set(path.id, path);
      }
    } catch {
      // No existing state, start fresh
    }
  }

  private async saveState(): Promise<void> {
    const state: SkillTreeState = {
      trees: Array.from(this.trees.values()),
      progressions: Object.fromEntries(this.progressions),
      learningPaths: Array.from(this.learningPaths.values()),
      lastUpdated: new Date().toISOString(),
    };

    await mkdir(dirname(this.options.dataPath), { recursive: true });
    await writeFile(this.options.dataPath, JSON.stringify(state, null, 2));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Tree Generation
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Generate a skill tree for a specific domain
   */
  async generateTree(domain: TreeDomain): Promise<SkillTree> {
    if (!this.knowledgeGraphService) {
      throw new Error('KnowledgeGraphService not set. Call setDependencies first.');
    }

    const graph = this.knowledgeGraphService.getGraph();
    const graphNodes = this.knowledgeGraphService.getNodes();

    // Filter nodes based on domain
    const filteredNodes = this.filterNodesByDomain(graphNodes, domain);

    if (filteredNodes.length === 0) {
      throw new Error(`No skills found for domain: ${domain.type}=${domain.value}`);
    }

    // Build tree structure
    const treeNodes: TreeNode[] = [];
    const treeEdges: TreeEdge[] = [];
    const nodeIds = new Set(filteredNodes.map(n => n.id));

    // Create tree nodes
    for (const node of filteredNodes) {
      // Find parents (skills this depends on) within the filtered set
      const parents = node.dependsOn.filter(id => nodeIds.has(id));

      // Find children (skills that depend on this) within the filtered set
      const children = filteredNodes
        .filter(n => n.dependsOn.includes(node.id))
        .map(n => n.id);

      const treeNode: TreeNode = {
        id: node.id,
        name: node.name,
        description: node.description,
        phase: node.phase,
        category: node.category,
        tags: node.tags,
        depth: 0, // Will be calculated
        parents,
        children,
        leverageScore: node.leverageScore,
        usageCount: node.usageCount,
        inDegree: node.inDegree,
        outDegree: node.outDegree,
        progression: this.getProgression(node.id),
        isRoot: parents.length === 0,
        isLeaf: children.length === 0,
        isHub: (node.inDegree + node.outDegree) >= 5,
        criticalPath: false, // Will be calculated
      };

      treeNodes.push(treeNode);
    }

    // Build edges from depends_on relationships
    for (const node of filteredNodes) {
      for (const depId of node.dependsOn) {
        if (nodeIds.has(depId)) {
          treeEdges.push({
            id: `${depId}->${node.id}`,
            source: depId,
            target: node.id,
            type: 'prerequisite',
            weight: 1,
          });
        }
      }
    }

    // Calculate depths using BFS from roots
    const roots = treeNodes.filter(n => n.isRoot).map(n => n.id);
    this.calculateDepths(treeNodes, roots);

    // Calculate critical path
    const criticalPath = this.calculateCriticalPath(treeNodes, treeEdges);
    for (const nodeId of criticalPath) {
      const node = treeNodes.find(n => n.id === nodeId);
      if (node) node.criticalPath = true;
    }

    // Generate suggested learning order (topological sort)
    const suggestedOrder = this.topologicalSort(treeNodes);

    // Calculate statistics
    const leaves = treeNodes.filter(n => n.isLeaf).map(n => n.id);
    const maxDepth = Math.max(...treeNodes.map(n => n.depth), 0);
    const totalChildren = treeNodes.reduce((sum, n) => sum + n.children.length, 0);
    const nonLeafCount = treeNodes.filter(n => !n.isLeaf).length || 1;

    const tree: SkillTree = {
      id: `tree-${domain.type}-${domain.value}-${Date.now()}`,
      name: `${domain.type}: ${domain.value}`,
      description: `Skill tree for ${domain.type} "${domain.value}"`,
      domain,
      nodes: treeNodes,
      edges: treeEdges,
      roots,
      leaves,
      stats: {
        totalNodes: treeNodes.length,
        totalEdges: treeEdges.length,
        maxDepth,
        avgBranching: totalChildren / nonLeafCount,
        rootCount: roots.length,
        leafCount: leaves.length,
        hubCount: treeNodes.filter(n => n.isHub).length,
      },
      suggestedOrder,
      criticalPath,
      generatedAt: new Date().toISOString(),
      basedOnGraph: graph.updatedAt || 'unknown',
    };

    this.trees.set(tree.id, tree);
    await this.saveState();

    this.emit('tree-generated', tree);
    return tree;
  }

  private filterNodesByDomain(nodes: SkillNode[], domain: TreeDomain): SkillNode[] {
    switch (domain.type) {
      case 'phase':
        return nodes.filter(n => n.phase === domain.value);

      case 'tag':
        return nodes.filter(n => n.tags.includes(domain.value));

      case 'category':
        return nodes.filter(n => n.category === domain.value);

      case 'loop':
        return this.getSkillsForLoop(nodes, domain.value);

      case 'custom':
        return domain.filter ? nodes.filter(domain.filter) : nodes;

      default:
        return nodes;
    }
  }

  private getSkillsForLoop(nodes: SkillNode[], loopId: string): SkillNode[] {
    if (!this.loopComposer) return [];

    const loop = this.loopComposer.getLoop(loopId);
    if (!loop) return [];

    const skillIds = new Set<string>();
    for (const phase of loop.phases) {
      for (const skill of phase.skills) {
        skillIds.add(skill.skillId);
      }
    }

    return nodes.filter(n => skillIds.has(n.id));
  }

  private calculateDepths(nodes: TreeNode[], roots: string[]): void {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [];

    // Start BFS from roots
    for (const rootId of roots) {
      queue.push({ id: rootId, depth: 0 });
    }

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;

      if (visited.has(id)) continue;
      visited.add(id);

      const node = nodeMap.get(id);
      if (node) {
        node.depth = depth;

        // Add children to queue
        for (const childId of node.children) {
          if (!visited.has(childId)) {
            queue.push({ id: childId, depth: depth + 1 });
          }
        }
      }
    }

    // Handle disconnected nodes
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        node.depth = 0;
      }
    }
  }

  private calculateCriticalPath(nodes: TreeNode[], edges: TreeEdge[]): string[] {
    // Find the path through highest-leverage skills
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Start from root with highest leverage
    const roots = nodes.filter(n => n.isRoot);
    if (roots.length === 0) return [];

    roots.sort((a, b) => b.leverageScore - a.leverageScore);
    const path: string[] = [roots[0].id];

    let current = roots[0];
    const visited = new Set<string>([current.id]);

    // Greedily follow highest-leverage children
    while (current.children.length > 0) {
      const children = current.children
        .map(id => nodeMap.get(id))
        .filter((n): n is TreeNode => n !== undefined && !visited.has(n.id));

      if (children.length === 0) break;

      children.sort((a, b) => b.leverageScore - a.leverageScore);
      current = children[0];
      path.push(current.id);
      visited.add(current.id);
    }

    return path;
  }

  private topologicalSort(nodes: TreeNode[]): string[] {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const inDegree = new Map<string, number>();
    const result: string[] = [];

    // Initialize in-degrees
    for (const node of nodes) {
      inDegree.set(node.id, node.parents.length);
    }

    // Find all nodes with no prerequisites (in-degree 0)
    const queue: string[] = [];
    for (const node of nodes) {
      if (inDegree.get(node.id) === 0) {
        queue.push(node.id);
      }
    }

    // Process nodes in topological order
    while (queue.length > 0) {
      // Sort by leverage to prioritize high-value skills
      queue.sort((a, b) => {
        const nodeA = nodeMap.get(a);
        const nodeB = nodeMap.get(b);
        return (nodeB?.leverageScore ?? 0) - (nodeA?.leverageScore ?? 0);
      });

      const nodeId = queue.shift()!;
      result.push(nodeId);

      const node = nodeMap.get(nodeId);
      if (node) {
        for (const childId of node.children) {
          const degree = inDegree.get(childId) ?? 0;
          inDegree.set(childId, degree - 1);

          if (inDegree.get(childId) === 0) {
            queue.push(childId);
          }
        }
      }
    }

    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Progression Tracking
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get progression for a skill
   */
  getProgression(skillId: string): SkillProgression {
    return this.progressions.get(skillId) ?? {
      status: 'locked',
      prerequisitesMet: false,
      outputsSeen: 0,
      usedInLoop: 0,
    };
  }

  /**
   * Update progression for a skill
   */
  async updateProgression(
    skillId: string,
    update: Partial<SkillProgression>
  ): Promise<SkillProgression> {
    const current = this.getProgression(skillId);
    const updated: SkillProgression = {
      ...current,
      ...update,
      lastInteraction: new Date().toISOString(),
    };

    // Auto-calculate status based on interaction
    if (updated.usedInLoop >= 5 && updated.outputsSeen >= 10) {
      updated.status = 'mastered';
    } else if (updated.usedInLoop >= 2 || updated.outputsSeen >= 5) {
      updated.status = 'familiar';
    } else if (updated.outputsSeen >= 1) {
      updated.status = 'in-progress';
    } else if (updated.prerequisitesMet) {
      updated.status = 'available';
    }

    this.progressions.set(skillId, updated);
    await this.saveState();

    this.emit('progression-updated', { skillId, progression: updated });
    return updated;
  }

  /**
   * Record that user saw output from a skill
   */
  async recordSkillOutput(skillId: string): Promise<SkillProgression> {
    const current = this.getProgression(skillId);
    return this.updateProgression(skillId, {
      outputsSeen: current.outputsSeen + 1,
      prerequisitesMet: true,
    });
  }

  /**
   * Record that user used skill in a loop
   */
  async recordSkillUsage(skillId: string): Promise<SkillProgression> {
    const current = this.getProgression(skillId);
    return this.updateProgression(skillId, {
      usedInLoop: current.usedInLoop + 1,
      prerequisitesMet: true,
    });
  }

  /**
   * Check and update prerequisites for all skills in a tree
   */
  async updatePrerequisites(treeId: string): Promise<void> {
    const tree = this.trees.get(treeId);
    if (!tree) return;

    for (const node of tree.nodes) {
      // Check if all parents are at least 'familiar'
      const parentsMet = node.parents.every(parentId => {
        const prog = this.getProgression(parentId);
        return prog.status === 'familiar' || prog.status === 'mastered';
      });

      if (parentsMet) {
        const current = this.getProgression(node.id);
        if (!current.prerequisitesMet) {
          await this.updateProgression(node.id, { prerequisitesMet: true });
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Learning Paths
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Generate a learning path for a target skill
   */
  async generateLearningPath(
    targetSkillId: string,
    options: { includeRecommended?: boolean } = {}
  ): Promise<LearningPath> {
    if (!this.knowledgeGraphService) {
      throw new Error('KnowledgeGraphService not set');
    }

    const path = this.knowledgeGraphService.findPath(targetSkillId, targetSkillId);
    const targetNode = this.knowledgeGraphService.getNode(targetSkillId);

    if (!targetNode) {
      throw new Error(`Skill not found: ${targetSkillId}`);
    }

    // Get all prerequisites recursively
    const prerequisites = this.getAllPrerequisites(targetSkillId);

    // Filter to only include unfamiliar skills
    const toLearn = prerequisites.filter(id => {
      const prog = this.getProgression(id);
      return prog.status !== 'familiar' && prog.status !== 'mastered';
    });

    // Add target if not familiar
    const targetProg = this.getProgression(targetSkillId);
    if (targetProg.status !== 'familiar' && targetProg.status !== 'mastered') {
      toLearn.push(targetSkillId);
    }

    // Sort in learning order (prerequisites first)
    const orderedSkills = this.orderForLearning(toLearn);

    // Estimate difficulty
    let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (orderedSkills.length > 5) difficulty = 'intermediate';
    if (orderedSkills.length > 10) difficulty = 'advanced';

    const learningPath: LearningPath = {
      id: `path-to-${targetSkillId}-${Date.now()}`,
      name: `Path to ${targetNode.name}`,
      description: `Learn ${targetNode.name} and its prerequisites`,
      skills: orderedSkills,
      estimatedEffort: `${Math.ceil(orderedSkills.length / 3)} sessions`,
      difficulty,
      prerequisites: prerequisites.filter(id => !toLearn.includes(id)),
      outcomes: [`Understand and use ${targetNode.name}`, ...targetNode.tags.map(t => `Familiarity with ${t} skills`)],
    };

    this.learningPaths.set(learningPath.id, learningPath);
    await this.saveState();

    this.emit('path-generated', learningPath);
    return learningPath;
  }

  private getAllPrerequisites(skillId: string, visited = new Set<string>()): string[] {
    if (!this.knowledgeGraphService) return [];
    if (visited.has(skillId)) return [];

    visited.add(skillId);
    const node = this.knowledgeGraphService.getNode(skillId);
    if (!node) return [];

    const prerequisites: string[] = [];
    for (const depId of node.dependsOn) {
      prerequisites.push(depId);
      prerequisites.push(...this.getAllPrerequisites(depId, visited));
    }

    return [...new Set(prerequisites)];
  }

  private orderForLearning(skillIds: string[]): string[] {
    if (!this.knowledgeGraphService) return skillIds;

    const nodeMap = new Map<string, SkillNode>();
    for (const id of skillIds) {
      const node = this.knowledgeGraphService.getNode(id);
      if (node) nodeMap.set(id, node);
    }

    // Topological sort within the skill set
    const inDegree = new Map<string, number>();
    const result: string[] = [];

    // Initialize
    for (const id of skillIds) {
      const node = nodeMap.get(id);
      const deps = node?.dependsOn.filter(d => skillIds.includes(d)) || [];
      inDegree.set(id, deps.length);
    }

    // Process
    const queue = skillIds.filter(id => inDegree.get(id) === 0);

    while (queue.length > 0) {
      const id = queue.shift()!;
      result.push(id);

      // Find skills that depend on this one
      for (const otherId of skillIds) {
        const otherNode = nodeMap.get(otherId);
        if (otherNode?.dependsOn.includes(id)) {
          const degree = inDegree.get(otherId) ?? 0;
          inDegree.set(otherId, degree - 1);
          if (inDegree.get(otherId) === 0 && !result.includes(otherId)) {
            queue.push(otherId);
          }
        }
      }
    }

    // Add any remaining (cycles or disconnected)
    for (const id of skillIds) {
      if (!result.includes(id)) {
        result.push(id);
      }
    }

    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Query Operations
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all generated trees
   */
  getTrees(): SkillTree[] {
    return Array.from(this.trees.values());
  }

  /**
   * Get a specific tree
   */
  getTree(id: string): SkillTree | null {
    return this.trees.get(id) ?? null;
  }

  /**
   * Get all learning paths
   */
  getLearningPaths(): LearningPath[] {
    return Array.from(this.learningPaths.values());
  }

  /**
   * Get a specific learning path
   */
  getLearningPath(id: string): LearningPath | null {
    return this.learningPaths.get(id) ?? null;
  }

  /**
   * Get available domains for tree generation
   */
  getAvailableDomains(): Array<{ type: string; values: string[] }> {
    if (!this.knowledgeGraphService) {
      return [];
    }

    const nodes = this.knowledgeGraphService.getNodes();

    // Collect unique phases, tags, categories
    const phases = new Set<string>();
    const tags = new Set<string>();
    const categories = new Set<string>();

    for (const node of nodes) {
      if (node.phase) phases.add(node.phase);
      if (node.category) categories.add(node.category);
      for (const tag of node.tags) tags.add(tag);
    }

    // Get loops
    const loops = this.loopComposer?.listLoops().map(l => l.id) ?? [];

    return [
      { type: 'phase', values: Array.from(phases).sort() },
      { type: 'tag', values: Array.from(tags).sort() },
      { type: 'category', values: Array.from(categories).sort() },
      { type: 'loop', values: loops },
    ];
  }

  /**
   * Get service status
   */
  getStatus(): {
    treeCount: number;
    pathCount: number;
    progressionCount: number;
    availableDomains: number;
  } {
    const domains = this.getAvailableDomains();
    const totalDomainValues = domains.reduce((sum, d) => sum + d.values.length, 0);

    return {
      treeCount: this.trees.size,
      pathCount: this.learningPaths.size,
      progressionCount: this.progressions.size,
      availableDomains: totalDomainValues,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Terminal View
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Generate terminal-friendly view of a skill tree
   */
  generateTerminalView(treeId?: string): string {
    const lines: string[] = [];

    lines.push('╔══════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                           SKILL TREE VIEWER                                  ║');
    lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');

    if (treeId) {
      const tree = this.trees.get(treeId);
      if (tree) {
        lines.push(`║  Tree: ${tree.name.padEnd(66)}  ║`);
        lines.push(`║  Domain: ${tree.domain.type}=${tree.domain.value}`.padEnd(77) + '║');
        lines.push('║                                                                              ║');
        lines.push(`║  Nodes: ${tree.stats.totalNodes}  Edges: ${tree.stats.totalEdges}  Depth: ${tree.stats.maxDepth}  Hubs: ${tree.stats.hubCount}`.padEnd(77) + '║');
        lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
        lines.push('║  STRUCTURE                                                                   ║');
        lines.push('║  ─────────────────────────────────────────────────────────────────────────── ║');

        // Show tree structure
        const rendered = this.renderTreeStructure(tree);
        for (const line of rendered.slice(0, 15)) {
          const padded = `║  ${line}`.padEnd(77) + '║';
          lines.push(padded);
        }

        if (rendered.length > 15) {
          lines.push(`║    ... and ${rendered.length - 15} more nodes`.padEnd(77) + '║');
        }

        lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
        lines.push('║  CRITICAL PATH                                                               ║');
        lines.push('║  ─────────────────────────────────────────────────────────────────────────── ║');

        const pathStr = tree.criticalPath.join(' → ');
        const truncatedPath = pathStr.length > 70 ? pathStr.substring(0, 67) + '...' : pathStr;
        lines.push(`║    ${truncatedPath}`.padEnd(77) + '║');
      } else {
        lines.push(`║  Tree not found: ${treeId}`.padEnd(77) + '║');
      }
    } else {
      // Show summary
      const status = this.getStatus();
      lines.push(`║  Trees: ${String(status.treeCount).padEnd(8)} Paths: ${String(status.pathCount).padEnd(8)} Progressions: ${String(status.progressionCount).padEnd(5)}   ║`);
      lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
      lines.push('║  AVAILABLE DOMAINS                                                           ║');
      lines.push('║  ─────────────────────────────────────────────────────────────────────────── ║');

      const domains = this.getAvailableDomains();
      for (const domain of domains.slice(0, 4)) {
        const valuesStr = domain.values.slice(0, 5).join(', ');
        const truncated = valuesStr.length > 50 ? valuesStr.substring(0, 47) + '...' : valuesStr;
        lines.push(`║    ${domain.type.padEnd(10)}: ${truncated}`.padEnd(77) + '║');
      }

      if (this.trees.size > 0) {
        lines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
        lines.push('║  GENERATED TREES                                                             ║');
        lines.push('║  ─────────────────────────────────────────────────────────────────────────── ║');

        for (const tree of Array.from(this.trees.values()).slice(0, 5)) {
          lines.push(`║    ${tree.name.substring(0, 40).padEnd(40)} (${tree.stats.totalNodes} nodes)`.padEnd(77) + '║');
        }
      }
    }

    lines.push('╚══════════════════════════════════════════════════════════════════════════════╝');
    return lines.join('\n');
  }

  private renderTreeStructure(tree: SkillTree): string[] {
    const lines: string[] = [];
    const nodeMap = new Map(tree.nodes.map(n => [n.id, n]));

    // Group by depth
    const byDepth = new Map<number, TreeNode[]>();
    for (const node of tree.nodes) {
      if (!byDepth.has(node.depth)) {
        byDepth.set(node.depth, []);
      }
      byDepth.get(node.depth)!.push(node);
    }

    // Render each depth level
    for (let depth = 0; depth <= tree.stats.maxDepth; depth++) {
      const nodes = byDepth.get(depth) || [];
      const indent = '  '.repeat(depth);
      const marker = depth === 0 ? '◉' : '├─';

      for (const node of nodes.slice(0, 5)) {
        const status = this.getProgressionIcon(node.progression.status);
        const hub = node.isHub ? ' [HUB]' : '';
        const crit = node.criticalPath ? ' *' : '';
        lines.push(`${indent}${marker} ${status} ${node.name}${hub}${crit}`);
      }

      if (nodes.length > 5) {
        lines.push(`${indent}   ... and ${nodes.length - 5} more at depth ${depth}`);
      }
    }

    return lines;
  }

  private getProgressionIcon(status: SkillProgression['status']): string {
    switch (status) {
      case 'mastered': return '★';
      case 'familiar': return '●';
      case 'in-progress': return '◐';
      case 'available': return '○';
      case 'locked': return '◌';
      default: return '?';
    }
  }
}
