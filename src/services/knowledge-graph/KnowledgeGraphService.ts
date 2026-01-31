/**
 * KnowledgeGraphService - The skill-based knowledge graph where compound leverage accumulates
 *
 * Core philosophy:
 * - Skills are the only primitive (nodes)
 * - Relationships are derived (edges)
 * - The graph is objective (about skills, not user proficiency)
 * - Growth happens through versioning, collection, and pruning
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import type { SkillRegistry } from '../SkillRegistry.js';
import type { LoopComposer } from '../LoopComposer.js';

// ============================================================================
// Types
// ============================================================================

export const EdgeTypeSchema = z.enum([
  'depends_on',      // Explicit: from SKILL.md frontmatter
  'tag_cluster',     // Explicit: skills sharing tags
  'sequence',        // Implicit: skill order in loop definitions
  'co_executed',     // Implicit: skills run together in same execution
  'improved_by',     // Implicit: skill improved after another was added
]);
export type EdgeType = z.infer<typeof EdgeTypeSchema>;

export const SkillNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  phase: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  dependsOn: z.array(z.string()).default([]),
  // Computed metrics
  inDegree: z.number().default(0),      // How many skills depend on this
  outDegree: z.number().default(0),     // How many skills this depends on
  usageCount: z.number().default(0),    // Execution count from run archives
  lastUsed: z.string().datetime().optional(),
  averageRubric: z.number().optional(), // Average rubric score
  leverageScore: z.number().default(0), // Computed centrality
});
export type SkillNode = z.infer<typeof SkillNodeSchema>;

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: EdgeTypeSchema,
  weight: z.number().default(1),        // Strength of relationship
  metadata: z.record(z.unknown()).optional(),
});
export type Edge = z.infer<typeof EdgeSchema>;

export const ClusterSchema = z.object({
  id: z.string(),
  name: z.string(),
  tag: z.string().optional(),           // Tag-based cluster
  skills: z.array(z.string()),
  cohesion: z.number().default(0),      // How tightly connected
});
export type Cluster = z.infer<typeof ClusterSchema>;

export const KnowledgeGraphSchema = z.object({
  version: z.string(),
  nodes: z.array(SkillNodeSchema),
  edges: z.array(EdgeSchema),
  clusters: z.array(ClusterSchema),
  stats: z.object({
    nodeCount: z.number(),
    edgeCount: z.number(),
    clusterCount: z.number(),
    averageDegree: z.number(),
    density: z.number(),               // edges / possible edges
  }),
  builtAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type KnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>;

export interface GraphPath {
  nodes: string[];
  edges: Edge[];
  length: number;
}

export interface GapAnalysis {
  missingDependencies: Array<{ skill: string; missing: string[] }>;
  isolatedSkills: string[];            // Skills with no connections
  weakClusters: Cluster[];             // Clusters with low cohesion
  phaseGaps: Array<{ phase: string; count: number; expected: number }>;
}

export interface KnowledgeGraphServiceOptions {
  skillRegistry: SkillRegistry;
  loopComposer?: LoopComposer;
  graphPath?: string;
  runArchivePath?: string;
}

// ============================================================================
// Service
// ============================================================================

export class KnowledgeGraphService {
  private skillRegistry: SkillRegistry;
  private loopComposer?: LoopComposer;
  private graphPath: string;
  private runArchivePath: string;
  private graph: KnowledgeGraph | null = null;

  constructor(options: KnowledgeGraphServiceOptions) {
    this.skillRegistry = options.skillRegistry;
    this.loopComposer = options.loopComposer;
    this.graphPath = options.graphPath || path.join(process.cwd(), 'knowledge-graph.json');
    this.runArchivePath = options.runArchivePath || path.join(
      process.env.HOME || '~',
      '.claude',
      'runs'
    );
  }

  // --------------------------------------------------------------------------
  // Core Operations
  // --------------------------------------------------------------------------

  /**
   * Build the knowledge graph from skill registry and run archives
   */
  async build(): Promise<KnowledgeGraph> {
    const nodes: SkillNode[] = [];
    const edges: Edge[] = [];
    const tagMap = new Map<string, string[]>(); // tag -> skill ids

    // 1. Build nodes from skills
    const skillList = this.skillRegistry.listSkills({ limit: 1000 });
    for (const skillSummary of skillList.skills) {
      const skill = await this.skillRegistry.getSkill(skillSummary.id);
      if (!skill) continue;

      const node: SkillNode = {
        id: skill.id,
        name: skill.id,
        description: skill.description || '',
        version: skill.version || '1.0.0',
        phase: skill.phase,
        category: skill.category,
        tags: skill.tags || [],
        dependsOn: skill.dependsOn || [],
        inDegree: 0,
        outDegree: skill.dependsOn?.length || 0,
        usageCount: 0,
        leverageScore: 0,
      };

      nodes.push(node);

      // Track tags for clustering
      for (const tag of node.tags) {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)!.push(node.id);
      }
    }

    // 2. Build explicit edges from depends_on
    for (const node of nodes) {
      for (const dep of node.dependsOn) {
        edges.push({
          id: `${node.id}-depends_on-${dep}`,
          source: node.id,
          target: dep,
          type: 'depends_on',
          weight: 1,
        });

        // Update inDegree for target
        const targetNode = nodes.find(n => n.id === dep);
        if (targetNode) {
          targetNode.inDegree++;
        }
      }
    }

    // 3. Build tag cluster edges
    for (const [tag, skillIds] of tagMap) {
      if (skillIds.length > 1) {
        // Create edges between all skills sharing this tag (weighted by cluster size)
        const weight = 1 / skillIds.length; // Smaller clusters = stronger bonds
        for (let i = 0; i < skillIds.length; i++) {
          for (let j = i + 1; j < skillIds.length; j++) {
            edges.push({
              id: `${skillIds[i]}-tag_cluster-${skillIds[j]}-${tag}`,
              source: skillIds[i],
              target: skillIds[j],
              type: 'tag_cluster',
              weight,
              metadata: { tag },
            });
          }
        }
      }
    }

    // 4. Build sequence edges from loop definitions
    if (this.loopComposer) {
      const loops = this.loopComposer.listLoops();
      for (const loopSummary of loops) {
        const loop = this.loopComposer.getLoop(loopSummary.id);
        if (!loop) continue;

        // Extract skill sequence from phases
        const skillSequence: string[] = [];
        for (const phase of loop.phases || []) {
          if (phase.skills) {
            skillSequence.push(...phase.skills.map(s => s.skillId));
          }
        }

        // Create sequence edges
        for (let i = 0; i < skillSequence.length - 1; i++) {
          const source = skillSequence[i];
          const target = skillSequence[i + 1];

          // Check if edge already exists
          const existingEdge = edges.find(
            e => e.source === source && e.target === target && e.type === 'sequence'
          );

          if (existingEdge) {
            existingEdge.weight++;
          } else {
            edges.push({
              id: `${source}-sequence-${target}`,
              source,
              target,
              type: 'sequence',
              weight: 1,
              metadata: { loop: loop.id },
            });
          }
        }
      }
    }

    // 5. Build co-execution edges from run archives
    const coExecutionCounts = await this.analyzeRunArchives();
    for (const [pair, count] of coExecutionCounts) {
      const [skill1, skill2] = pair.split('|');
      edges.push({
        id: `${skill1}-co_executed-${skill2}`,
        source: skill1,
        target: skill2,
        type: 'co_executed',
        weight: count,
      });
    }

    // 6. Build clusters from tags
    const clusters: Cluster[] = [];
    for (const [tag, skillIds] of tagMap) {
      if (skillIds.length >= 2) {
        // Calculate cohesion: ratio of actual edges to possible edges within cluster
        const possibleEdges = (skillIds.length * (skillIds.length - 1)) / 2;
        const actualEdges = edges.filter(
          e => skillIds.includes(e.source) && skillIds.includes(e.target)
        ).length;
        const cohesion = possibleEdges > 0 ? actualEdges / possibleEdges : 0;

        clusters.push({
          id: `cluster-${tag}`,
          name: tag.charAt(0).toUpperCase() + tag.slice(1),
          tag,
          skills: skillIds,
          cohesion,
        });
      }
    }

    // 7. Calculate leverage scores (PageRank-like centrality)
    this.calculateLeverageScores(nodes, edges);

    // 8. Calculate graph stats
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const possibleEdges = (nodeCount * (nodeCount - 1)) / 2;
    const density = possibleEdges > 0 ? edgeCount / possibleEdges : 0;
    const totalDegree = nodes.reduce((sum, n) => sum + n.inDegree + n.outDegree, 0);
    const averageDegree = nodeCount > 0 ? totalDegree / nodeCount : 0;

    this.graph = {
      version: '1.0.0',
      nodes,
      edges,
      clusters,
      stats: {
        nodeCount,
        edgeCount,
        clusterCount: clusters.length,
        averageDegree,
        density,
      },
      builtAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to disk
    await this.save();

    return this.graph;
  }

  /**
   * Load graph from disk or rebuild if not exists
   */
  async load(): Promise<KnowledgeGraph> {
    if (fs.existsSync(this.graphPath)) {
      const content = fs.readFileSync(this.graphPath, 'utf-8');
      this.graph = KnowledgeGraphSchema.parse(JSON.parse(content));
      return this.graph;
    }
    return this.build();
  }

  /**
   * Save graph to disk
   */
  async save(): Promise<void> {
    if (!this.graph) {
      throw new Error('No graph to save');
    }
    this.graph.updatedAt = new Date().toISOString();
    fs.writeFileSync(this.graphPath, JSON.stringify(this.graph, null, 2));
  }

  /**
   * Get the current graph
   */
  getGraph(): KnowledgeGraph {
    if (!this.graph) {
      throw new Error('Graph not loaded. Call load() or build() first.');
    }
    return this.graph;
  }

  // --------------------------------------------------------------------------
  // Node Operations
  // --------------------------------------------------------------------------

  /**
   * Get a skill node by ID
   */
  getNode(skillId: string): SkillNode | null {
    if (!this.graph) return null;
    return this.graph.nodes.find(n => n.id === skillId) || null;
  }

  /**
   * Get all nodes
   */
  getNodes(): SkillNode[] {
    return this.graph?.nodes || [];
  }

  /**
   * Get nodes by phase
   */
  getNodesByPhase(phase: string): SkillNode[] {
    if (!this.graph) return [];
    return this.graph.nodes.filter(n => n.phase === phase);
  }

  /**
   * Get nodes by tag
   */
  getNodesByTag(tag: string): SkillNode[] {
    if (!this.graph) return [];
    return this.graph.nodes.filter(n => n.tags.includes(tag));
  }

  // --------------------------------------------------------------------------
  // Edge Operations
  // --------------------------------------------------------------------------

  /**
   * Get all edges for a skill (in and out)
   */
  getEdges(skillId: string): { incoming: Edge[]; outgoing: Edge[] } {
    if (!this.graph) return { incoming: [], outgoing: [] };

    return {
      incoming: this.graph.edges.filter(e => e.target === skillId),
      outgoing: this.graph.edges.filter(e => e.source === skillId),
    };
  }

  /**
   * Get edges by type
   */
  getEdgesByType(type: EdgeType): Edge[] {
    if (!this.graph) return [];
    return this.graph.edges.filter(e => e.type === type);
  }

  /**
   * Get neighbors (directly connected skills)
   */
  getNeighbors(skillId: string): SkillNode[] {
    if (!this.graph) return [];

    const neighborIds = new Set<string>();
    for (const edge of this.graph.edges) {
      if (edge.source === skillId) {
        neighborIds.add(edge.target);
      } else if (edge.target === skillId) {
        neighborIds.add(edge.source);
      }
    }

    return this.graph.nodes.filter(n => neighborIds.has(n.id));
  }

  // --------------------------------------------------------------------------
  // Path Finding
  // --------------------------------------------------------------------------

  /**
   * Find shortest path between two skills using BFS
   */
  findPath(fromSkillId: string, toSkillId: string): GraphPath | null {
    if (!this.graph) return null;
    if (fromSkillId === toSkillId) {
      return { nodes: [fromSkillId], edges: [], length: 0 };
    }

    // Build adjacency map
    const adjacency = new Map<string, Array<{ neighbor: string; edge: Edge }>>();
    for (const node of this.graph.nodes) {
      adjacency.set(node.id, []);
    }
    for (const edge of this.graph.edges) {
      adjacency.get(edge.source)?.push({ neighbor: edge.target, edge });
      adjacency.get(edge.target)?.push({ neighbor: edge.source, edge });
    }

    // BFS
    const visited = new Set<string>();
    const queue: Array<{ node: string; path: string[]; edges: Edge[] }> = [
      { node: fromSkillId, path: [fromSkillId], edges: [] }
    ];

    while (queue.length > 0) {
      const { node, path, edges } = queue.shift()!;

      if (node === toSkillId) {
        return { nodes: path, edges, length: path.length - 1 };
      }

      if (visited.has(node)) continue;
      visited.add(node);

      const neighbors = adjacency.get(node) || [];
      for (const { neighbor, edge } of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({
            node: neighbor,
            path: [...path, neighbor],
            edges: [...edges, edge],
          });
        }
      }
    }

    return null; // No path found
  }

  // --------------------------------------------------------------------------
  // Cluster Operations
  // --------------------------------------------------------------------------

  /**
   * Get all clusters
   */
  getClusters(): Cluster[] {
    return this.graph?.clusters || [];
  }

  /**
   * Get cluster by tag
   */
  getClusterByTag(tag: string): Cluster | null {
    if (!this.graph) return null;
    return this.graph.clusters.find(c => c.tag === tag) || null;
  }

  // --------------------------------------------------------------------------
  // Analysis Operations
  // --------------------------------------------------------------------------

  /**
   * Get high-leverage skills (most connected and impactful)
   */
  getHighLeverageSkills(limit: number = 10): SkillNode[] {
    if (!this.graph) return [];

    return [...this.graph.nodes]
      .sort((a, b) => b.leverageScore - a.leverageScore)
      .slice(0, limit);
  }

  /**
   * Get isolated skills (no or few connections)
   */
  getIsolatedSkills(): SkillNode[] {
    if (!this.graph) return [];

    return this.graph.nodes.filter(
      n => n.inDegree + n.outDegree === 0
    );
  }

  /**
   * Get skills that haven't been used recently
   */
  getUnusedSkills(daysSinceLastUse: number = 30): SkillNode[] {
    if (!this.graph) return [];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysSinceLastUse);
    const cutoffStr = cutoff.toISOString();

    return this.graph.nodes.filter(n => {
      if (!n.lastUsed) return true;
      return n.lastUsed < cutoffStr;
    });
  }

  /**
   * Analyze gaps in the skill graph (MECE analysis)
   */
  analyzeGaps(): GapAnalysis {
    if (!this.graph) {
      return {
        missingDependencies: [],
        isolatedSkills: [],
        weakClusters: [],
        phaseGaps: [],
      };
    }

    // Find missing dependencies (skills that depend on non-existent skills)
    const nodeIds = new Set(this.graph.nodes.map(n => n.id));
    const missingDependencies: Array<{ skill: string; missing: string[] }> = [];

    for (const node of this.graph.nodes) {
      const missing = node.dependsOn.filter(d => !nodeIds.has(d));
      if (missing.length > 0) {
        missingDependencies.push({ skill: node.id, missing });
      }
    }

    // Find isolated skills
    const isolatedSkills = this.getIsolatedSkills().map(n => n.id);

    // Find weak clusters (low cohesion)
    const weakClusters = this.graph.clusters.filter(c => c.cohesion < 0.3);

    // Analyze phase coverage
    const phases = ['INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY', 'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'];
    const expectedPerPhase = Math.ceil(this.graph.nodes.length / phases.length);

    const phaseCounts = new Map<string, number>();
    for (const node of this.graph.nodes) {
      if (node.phase) {
        phaseCounts.set(node.phase, (phaseCounts.get(node.phase) || 0) + 1);
      }
    }

    const phaseGaps = phases.map(phase => ({
      phase,
      count: phaseCounts.get(phase) || 0,
      expected: expectedPerPhase,
    })).filter(p => p.count < p.expected * 0.5); // Less than 50% of expected

    return {
      missingDependencies,
      isolatedSkills,
      weakClusters,
      phaseGaps,
    };
  }

  /**
   * Get graph statistics
   */
  getStats() {
    return this.graph?.stats || {
      nodeCount: 0,
      edgeCount: 0,
      clusterCount: 0,
      averageDegree: 0,
      density: 0,
    };
  }

  // --------------------------------------------------------------------------
  // Lifecycle Operations (for growth through versioning, collection, pruning)
  // --------------------------------------------------------------------------

  /**
   * Refresh a single skill node (after version bump or update)
   */
  async refreshNode(skillId: string): Promise<SkillNode | null> {
    if (!this.graph) return null;

    const skill = await this.skillRegistry.getSkill(skillId);
    if (!skill) return null;

    // Find or create node
    let node = this.graph.nodes.find(n => n.id === skillId);

    if (node) {
      // Update existing node
      node.name = skill.id;
      node.description = skill.description || '';
      node.version = skill.version || '1.0.0';
      node.phase = skill.phase;
      node.category = skill.category;
      node.tags = skill.tags || [];
      node.dependsOn = skill.dependsOn || [];
    } else {
      // Create new node
      node = {
        id: skill.id,
        name: skill.id,
        description: skill.description || '',
        version: skill.version || '1.0.0',
        phase: skill.phase,
        category: skill.category,
        tags: skill.tags || [],
        dependsOn: skill.dependsOn || [],
        inDegree: 0,
        outDegree: skill.dependsOn?.length || 0,
        usageCount: 0,
        leverageScore: 0,
      };
      this.graph.nodes.push(node);
    }

    // Recalculate edges and scores
    await this.rebuildEdgesForNode(skillId);
    this.calculateLeverageScores(this.graph.nodes, this.graph.edges);

    await this.save();
    return node;
  }

  /**
   * Remove a skill node (pruning)
   */
  async removeNode(skillId: string): Promise<boolean> {
    if (!this.graph) return false;

    const nodeIndex = this.graph.nodes.findIndex(n => n.id === skillId);
    if (nodeIndex === -1) return false;

    // Remove node
    this.graph.nodes.splice(nodeIndex, 1);

    // Remove all edges involving this node
    this.graph.edges = this.graph.edges.filter(
      e => e.source !== skillId && e.target !== skillId
    );

    // Remove from clusters
    for (const cluster of this.graph.clusters) {
      cluster.skills = cluster.skills.filter(s => s !== skillId);
    }
    // Remove empty clusters
    this.graph.clusters = this.graph.clusters.filter(c => c.skills.length >= 2);

    // Recalculate stats
    this.recalculateStats();

    await this.save();
    return true;
  }

  // --------------------------------------------------------------------------
  // Terminal Visualization
  // --------------------------------------------------------------------------

  /**
   * Generate terminal-friendly visualization
   */
  generateTerminalView(): string {
    if (!this.graph) {
      return 'No graph loaded';
    }

    const lines: string[] = [];
    const stats = this.graph.stats;

    lines.push('╔══════════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                        KNOWLEDGE GRAPH ONTOLOGY                                  ║');
    lines.push('╠══════════════════════════════════════════════════════════════════════════════════╣');
    lines.push(`║  Nodes: ${stats.nodeCount.toString().padEnd(6)} Edges: ${stats.edgeCount.toString().padEnd(6)} Clusters: ${stats.clusterCount.toString().padEnd(6)} Density: ${(stats.density * 100).toFixed(1)}%`.padEnd(83) + '║');
    lines.push('╠══════════════════════════════════════════════════════════════════════════════════╣');
    lines.push('║  HIGH LEVERAGE SKILLS                                                            ║');

    const topSkills = this.getHighLeverageSkills(5);
    for (const skill of topSkills) {
      const line = `║    ${skill.leverageScore.toFixed(1).padStart(4)} │ ${skill.name}`;
      lines.push(line.padEnd(83) + '║');
    }

    lines.push('╠══════════════════════════════════════════════════════════════════════════════════╣');
    lines.push('║  CLUSTERS                                                                        ║');

    const topClusters = [...this.graph.clusters]
      .sort((a, b) => b.skills.length - a.skills.length)
      .slice(0, 5);

    for (const cluster of topClusters) {
      const cohesionBar = '█'.repeat(Math.round(cluster.cohesion * 10)) + '░'.repeat(10 - Math.round(cluster.cohesion * 10));
      const line = `║    ${cluster.skills.length.toString().padStart(2)} skills │ ${cluster.name.padEnd(20)} ${cohesionBar}`;
      lines.push(line.padEnd(83) + '║');
    }

    // Gap analysis
    const gaps = this.analyzeGaps();
    if (gaps.isolatedSkills.length > 0 || gaps.missingDependencies.length > 0) {
      lines.push('╠══════════════════════════════════════════════════════════════════════════════════╣');
      lines.push('║  GAPS                                                                            ║');

      if (gaps.isolatedSkills.length > 0) {
        lines.push(`║    ⚠ ${gaps.isolatedSkills.length} isolated skills (no connections)`.padEnd(83) + '║');
      }
      if (gaps.missingDependencies.length > 0) {
        lines.push(`║    ⚠ ${gaps.missingDependencies.length} skills with missing dependencies`.padEnd(83) + '║');
      }
    }

    lines.push('╚══════════════════════════════════════════════════════════════════════════════════╝');

    return lines.join('\n');
  }

  // --------------------------------------------------------------------------
  // Private Helpers
  // --------------------------------------------------------------------------

  /**
   * Analyze run archives for co-execution patterns
   */
  private async analyzeRunArchives(): Promise<Map<string, number>> {
    const coExecutionCounts = new Map<string, number>();

    if (!fs.existsSync(this.runArchivePath)) {
      return coExecutionCounts;
    }

    try {
      // Scan run archive directories
      const yearMonths = fs.readdirSync(this.runArchivePath);

      for (const yearMonth of yearMonths.slice(-3)) { // Last 3 months
        const monthPath = path.join(this.runArchivePath, yearMonth);
        if (!fs.statSync(monthPath).isDirectory()) continue;

        const files = fs.readdirSync(monthPath).filter(f => f.endsWith('.json'));

        for (const file of files) {
          try {
            const content = fs.readFileSync(path.join(monthPath, file), 'utf-8');
            const run = JSON.parse(content);

            // Extract skills from run
            const skillsInRun: string[] = [];
            if (run.phases) {
              for (const phase of run.phases) {
                if (phase.skills) {
                  for (const skill of phase.skills) {
                    if (skill.status === 'completed') {
                      skillsInRun.push(skill.id || skill.name);
                    }
                  }
                }
              }
            }

            // Count co-occurrences
            for (let i = 0; i < skillsInRun.length; i++) {
              for (let j = i + 1; j < skillsInRun.length; j++) {
                const pair = [skillsInRun[i], skillsInRun[j]].sort().join('|');
                coExecutionCounts.set(pair, (coExecutionCounts.get(pair) || 0) + 1);
              }
            }
          } catch {
            // Skip malformed files
          }
        }
      }
    } catch {
      // Run archive not accessible
    }

    return coExecutionCounts;
  }

  /**
   * Calculate leverage scores using simplified PageRank
   */
  private calculateLeverageScores(nodes: SkillNode[], edges: Edge[]): void {
    const damping = 0.85;
    const iterations = 20;

    // Initialize scores
    const scores = new Map<string, number>();
    const baseScore = 1 / nodes.length;
    for (const node of nodes) {
      scores.set(node.id, baseScore);
    }

    // Build adjacency (incoming edges)
    const incoming = new Map<string, string[]>();
    const outDegree = new Map<string, number>();

    for (const node of nodes) {
      incoming.set(node.id, []);
      outDegree.set(node.id, 0);
    }

    for (const edge of edges) {
      incoming.get(edge.target)?.push(edge.source);
      outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1);
    }

    // Iterate
    for (let iter = 0; iter < iterations; iter++) {
      const newScores = new Map<string, number>();

      for (const node of nodes) {
        let sum = 0;
        const incomingNodes = incoming.get(node.id) || [];

        for (const source of incomingNodes) {
          const sourceOutDegree = outDegree.get(source) || 1;
          sum += (scores.get(source) || 0) / sourceOutDegree;
        }

        newScores.set(node.id, (1 - damping) / nodes.length + damping * sum);
      }

      // Update scores
      for (const [id, score] of newScores) {
        scores.set(id, score);
      }
    }

    // Normalize to 0-10 scale and assign
    const maxScore = Math.max(...scores.values());
    for (const node of nodes) {
      const rawScore = scores.get(node.id) || 0;
      node.leverageScore = maxScore > 0 ? (rawScore / maxScore) * 10 : 0;
    }
  }

  /**
   * Rebuild edges for a specific node
   */
  private async rebuildEdgesForNode(skillId: string): Promise<void> {
    if (!this.graph) return;

    const node = this.graph.nodes.find(n => n.id === skillId);
    if (!node) return;

    // Remove old depends_on edges from this node
    this.graph.edges = this.graph.edges.filter(
      e => !(e.source === skillId && e.type === 'depends_on')
    );

    // Add new depends_on edges
    for (const dep of node.dependsOn) {
      this.graph.edges.push({
        id: `${skillId}-depends_on-${dep}`,
        source: skillId,
        target: dep,
        type: 'depends_on',
        weight: 1,
      });
    }

    // Recalculate degrees
    this.recalculateDegrees();
  }

  /**
   * Recalculate in/out degrees for all nodes
   */
  private recalculateDegrees(): void {
    if (!this.graph) return;

    // Reset degrees
    for (const node of this.graph.nodes) {
      node.inDegree = 0;
      node.outDegree = 0;
    }

    // Count edges
    for (const edge of this.graph.edges) {
      const sourceNode = this.graph.nodes.find(n => n.id === edge.source);
      const targetNode = this.graph.nodes.find(n => n.id === edge.target);

      if (sourceNode) sourceNode.outDegree++;
      if (targetNode) targetNode.inDegree++;
    }
  }

  /**
   * Recalculate graph statistics
   */
  private recalculateStats(): void {
    if (!this.graph) return;

    const nodeCount = this.graph.nodes.length;
    const edgeCount = this.graph.edges.length;
    const possibleEdges = (nodeCount * (nodeCount - 1)) / 2;
    const density = possibleEdges > 0 ? edgeCount / possibleEdges : 0;

    this.recalculateDegrees();
    const totalDegree = this.graph.nodes.reduce((sum, n) => sum + n.inDegree + n.outDegree, 0);
    const averageDegree = nodeCount > 0 ? totalDegree / nodeCount : 0;

    this.graph.stats = {
      nodeCount,
      edgeCount,
      clusterCount: this.graph.clusters.length,
      averageDegree,
      density,
    };
  }
}
