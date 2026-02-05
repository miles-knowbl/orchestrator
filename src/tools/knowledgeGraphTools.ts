/**
 * MCP Tool definitions for knowledge graph operations
 */

import { z } from 'zod';
import type { KnowledgeGraphService, EdgeType } from '../services/knowledge-graph/index.js';

// Zod schemas
const EdgeTypeSchema = z.enum(['depends_on', 'tag_cluster', 'sequence', 'co_executed', 'improved_by']);

const BuildGraphSchema = z.object({});
const GetGraphSchema = z.object({});
const GetNodeSchema = z.object({ skillId: z.string().min(1) });
const GetNodesByPhaseSchema = z.object({ phase: z.string().min(1) });
const GetNodesByTagSchema = z.object({ tag: z.string().min(1) });
const GetEdgesSchema = z.object({ skillId: z.string().min(1) });
const GetEdgesByTypeSchema = z.object({ type: EdgeTypeSchema });
const GetNeighborsSchema = z.object({ skillId: z.string().min(1) });
const FindPathSchema = z.object({ from: z.string().min(1), to: z.string().min(1) });
const GetClustersSchema = z.object({});
const GetClusterByTagSchema = z.object({ tag: z.string().min(1) });
const GetHighLeverageSchema = z.object({ limit: z.number().positive().optional() });
const GetIsolatedSchema = z.object({});
const GetUnusedSchema = z.object({ days: z.number().positive().optional() });
const AnalyzeGapsSchema = z.object({});
const GetStatsSchema = z.object({});
const RefreshNodeSchema = z.object({ skillId: z.string().min(1) });
const RemoveNodeSchema = z.object({ skillId: z.string().min(1) });
const GetTerminalViewSchema = z.object({});

export interface KnowledgeGraphToolsOptions {
  knowledgeGraphService: KnowledgeGraphService;
}

export function createKnowledgeGraphTools(options: KnowledgeGraphToolsOptions) {
  const { knowledgeGraphService } = options;

  return {
    tools: [
      {
        name: 'build_knowledge_graph',
        description: 'Building knowledge graph — rebuilds from skill registry and run archives',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'get_knowledge_graph',
        description: 'Loading knowledge graph — retrieves nodes, edges, clusters, and statistics',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'get_graph_node',
        description: 'Loading skill node — retrieves metrics and relationships from graph',
        inputSchema: {
          type: 'object' as const,
          properties: { skillId: { type: 'string', description: 'The skill ID' } },
          required: ['skillId'],
        },
      },
      {
        name: 'get_graph_nodes_by_phase',
        description: 'Filtering skills by phase — retrieves skill nodes for a specific phase',
        inputSchema: {
          type: 'object' as const,
          properties: { phase: { type: 'string', description: 'The phase name' } },
          required: ['phase'],
        },
      },
      {
        name: 'get_graph_nodes_by_tag',
        description: 'Filtering skills by tag — retrieves skill nodes with a specific tag',
        inputSchema: {
          type: 'object' as const,
          properties: { tag: { type: 'string', description: 'The tag to filter by' } },
          required: ['tag'],
        },
      },
      {
        name: 'get_graph_edges',
        description: 'Checking skill edges — retrieves incoming and outgoing connections',
        inputSchema: {
          type: 'object' as const,
          properties: { skillId: { type: 'string', description: 'The skill ID' } },
          required: ['skillId'],
        },
      },
      {
        name: 'get_graph_edges_by_type',
        description: 'Filtering edges by type — retrieves edges of a specific relationship type',
        inputSchema: {
          type: 'object' as const,
          properties: { type: { type: 'string', enum: ['depends_on', 'tag_cluster', 'sequence', 'co_executed', 'improved_by'] } },
          required: ['type'],
        },
      },
      {
        name: 'get_graph_neighbors',
        description: 'Finding connected skills — retrieves directly connected neighbors',
        inputSchema: {
          type: 'object' as const,
          properties: { skillId: { type: 'string', description: 'The skill ID' } },
          required: ['skillId'],
        },
      },
      {
        name: 'find_graph_path',
        description: 'Finding skill path — traces shortest connection between two skills',
        inputSchema: {
          type: 'object' as const,
          properties: {
            from: { type: 'string', description: 'Source skill ID' },
            to: { type: 'string', description: 'Target skill ID' },
          },
          required: ['from', 'to'],
        },
      },
      {
        name: 'get_graph_clusters',
        description: 'Listing skill clusters — retrieves groups of related skills',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'get_graph_cluster_by_tag',
        description: 'Loading skill cluster — retrieves cluster details by tag',
        inputSchema: {
          type: 'object' as const,
          properties: { tag: { type: 'string', description: 'The cluster tag' } },
          required: ['tag'],
        },
      },
      {
        name: 'get_high_leverage_skills',
        description: 'Finding high-leverage skills — ranks by connections and impact score',
        inputSchema: {
          type: 'object' as const,
          properties: { limit: { type: 'number', description: 'Max skills to return (default 10)' } },
          required: [],
        },
      },
      {
        name: 'get_isolated_skills',
        description: 'Finding isolated skills — identifies unconnected potential gaps or orphans',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'get_unused_skills',
        description: 'Finding stale skills — identifies skills not recently used',
        inputSchema: {
          type: 'object' as const,
          properties: { days: { type: 'number', description: 'Days since last use (default 30)' } },
          required: [],
        },
      },
      {
        name: 'analyze_graph_gaps',
        description: 'Analyzing graph gaps — checks for missing dependencies, isolated skills, weak clusters',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'get_graph_stats',
        description: 'Checking graph statistics — retrieves node count, edge count, density',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'refresh_graph_node',
        description: 'Refreshing skill node — updates graph after skill edit or versioning',
        inputSchema: {
          type: 'object' as const,
          properties: { skillId: { type: 'string', description: 'The skill ID to refresh' } },
          required: ['skillId'],
        },
      },
      {
        name: 'remove_graph_node',
        description: 'Removing skill node — prunes node from knowledge graph',
        inputSchema: {
          type: 'object' as const,
          properties: { skillId: { type: 'string', description: 'The skill ID to remove' } },
          required: ['skillId'],
        },
      },
      {
        name: 'render_graph_terminal',
        description: 'Visualizing knowledge graph — generates terminal-friendly display',
        inputSchema: { type: 'object' as const, properties: {}, required: [] },
      },
    ],

    async handleTool(name: string, args: unknown): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
      try {
        switch (name) {
          case 'build_knowledge_graph': {
            BuildGraphSchema.parse(args);
            const graph = await knowledgeGraphService.build();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: 'Knowledge graph built successfully',
                  stats: graph.stats,
                  builtAt: graph.builtAt,
                }, null, 2),
              }],
            };
          }

          case 'get_knowledge_graph': {
            GetGraphSchema.parse(args);
            const graph = knowledgeGraphService.getGraph();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  version: graph.version,
                  stats: graph.stats,
                  nodeCount: graph.nodes.length,
                  edgeCount: graph.edges.length,
                  clusterCount: graph.clusters.length,
                  builtAt: graph.builtAt,
                  updatedAt: graph.updatedAt,
                  nodes: graph.nodes.map(n => ({
                    id: n.id,
                    name: n.name,
                    phase: n.phase,
                    leverageScore: n.leverageScore,
                    inDegree: n.inDegree,
                    outDegree: n.outDegree,
                  })),
                }, null, 2),
              }],
            };
          }

          case 'get_graph_node': {
            const { skillId } = GetNodeSchema.parse(args);
            const node = knowledgeGraphService.getNode(skillId);
            if (!node) {
              return { content: [{ type: 'text', text: `Node not found: ${skillId}` }] };
            }
            const edges = knowledgeGraphService.getEdges(skillId);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ node, edges }, null, 2),
              }],
            };
          }

          case 'get_graph_nodes_by_phase': {
            const { phase } = GetNodesByPhaseSchema.parse(args);
            const nodes = knowledgeGraphService.getNodesByPhase(phase);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ phase, count: nodes.length, nodes }, null, 2),
              }],
            };
          }

          case 'get_graph_nodes_by_tag': {
            const { tag } = GetNodesByTagSchema.parse(args);
            const nodes = knowledgeGraphService.getNodesByTag(tag);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ tag, count: nodes.length, nodes }, null, 2),
              }],
            };
          }

          case 'get_graph_edges': {
            const { skillId } = GetEdgesSchema.parse(args);
            const edges = knowledgeGraphService.getEdges(skillId);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  skillId,
                  incoming: edges.incoming,
                  outgoing: edges.outgoing,
                }, null, 2),
              }],
            };
          }

          case 'get_graph_edges_by_type': {
            const { type } = GetEdgesByTypeSchema.parse(args);
            const edges = knowledgeGraphService.getEdgesByType(type as EdgeType);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ type, count: edges.length, edges }, null, 2),
              }],
            };
          }

          case 'get_graph_neighbors': {
            const { skillId } = GetNeighborsSchema.parse(args);
            const neighbors = knowledgeGraphService.getNeighbors(skillId);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  skillId,
                  count: neighbors.length,
                  neighbors: neighbors.map(n => ({
                    id: n.id,
                    name: n.name,
                    phase: n.phase,
                    leverageScore: n.leverageScore,
                  })),
                }, null, 2),
              }],
            };
          }

          case 'find_graph_path': {
            const { from, to } = FindPathSchema.parse(args);
            const path = knowledgeGraphService.findPath(from, to);
            if (!path) {
              return { content: [{ type: 'text', text: `No path found from ${from} to ${to}` }] };
            }
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(path, null, 2),
              }],
            };
          }

          case 'get_graph_clusters': {
            GetClustersSchema.parse(args);
            const clusters = knowledgeGraphService.getClusters();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ count: clusters.length, clusters }, null, 2),
              }],
            };
          }

          case 'get_graph_cluster_by_tag': {
            const { tag } = GetClusterByTagSchema.parse(args);
            const cluster = knowledgeGraphService.getClusterByTag(tag);
            if (!cluster) {
              return { content: [{ type: 'text', text: `Cluster not found for tag: ${tag}` }] };
            }
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(cluster, null, 2),
              }],
            };
          }

          case 'get_high_leverage_skills': {
            const { limit } = GetHighLeverageSchema.parse(args);
            const skills = knowledgeGraphService.getHighLeverageSkills(limit || 10);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  count: skills.length,
                  skills: skills.map(s => ({
                    id: s.id,
                    name: s.name,
                    leverageScore: s.leverageScore,
                    inDegree: s.inDegree,
                    outDegree: s.outDegree,
                    tags: s.tags,
                  })),
                }, null, 2),
              }],
            };
          }

          case 'get_isolated_skills': {
            GetIsolatedSchema.parse(args);
            const isolated = knowledgeGraphService.getIsolatedSkills();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  count: isolated.length,
                  skills: isolated.map(s => ({
                    id: s.id,
                    name: s.name,
                    phase: s.phase,
                    tags: s.tags,
                  })),
                }, null, 2),
              }],
            };
          }

          case 'get_unused_skills': {
            const { days } = GetUnusedSchema.parse(args);
            const unused = knowledgeGraphService.getUnusedSkills(days || 30);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  daysSinceLastUse: days || 30,
                  count: unused.length,
                  skills: unused.map(s => ({
                    id: s.id,
                    name: s.name,
                    lastUsed: s.lastUsed,
                    usageCount: s.usageCount,
                  })),
                }, null, 2),
              }],
            };
          }

          case 'analyze_graph_gaps': {
            AnalyzeGapsSchema.parse(args);
            const gaps = knowledgeGraphService.analyzeGaps();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(gaps, null, 2),
              }],
            };
          }

          case 'get_graph_stats': {
            GetStatsSchema.parse(args);
            const stats = knowledgeGraphService.getStats();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(stats, null, 2),
              }],
            };
          }

          case 'refresh_graph_node': {
            const { skillId } = RefreshNodeSchema.parse(args);
            const node = await knowledgeGraphService.refreshNode(skillId);
            if (!node) {
              return { content: [{ type: 'text', text: `Failed to refresh node: ${skillId}` }] };
            }
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ success: true, node }, null, 2),
              }],
            };
          }

          case 'remove_graph_node': {
            const { skillId } = RemoveNodeSchema.parse(args);
            const success = await knowledgeGraphService.removeNode(skillId);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ success, skillId }, null, 2),
              }],
            };
          }

          case 'render_graph_terminal': {
            GetTerminalViewSchema.parse(args);
            const terminal = knowledgeGraphService.generateTerminalView();
            return { content: [{ type: 'text', text: terminal }] };
          }

          default:
            return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          }],
        };
      }
    },
  };
}
