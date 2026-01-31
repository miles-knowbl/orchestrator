# Knowledge Graph Skill

> Build and query the skill-based knowledge graph ontology

## Overview

The knowledge graph represents skills as nodes and their relationships as edges. It enables discovery of high-leverage skills, gap analysis, and understanding skill dependencies. Skills are the only primitive; everything else (patterns, loops, learnings) is metadata or derived from skills.

## Graph Structure

### Nodes (Skills)
Each skill becomes a node with:
- **id**: Unique skill identifier
- **name**: Human-readable name
- **description**: What the skill does
- **phase**: Which loop phase (INIT, IMPLEMENT, TEST, etc.)
- **tags**: Categories for clustering
- **version**: Current skill version
- **usageCount**: Times used in executions
- **lastUsed**: Most recent execution timestamp
- **leverageScore**: PageRank-like centrality score
- **inDegree/outDegree**: Connection counts

### Edge Types
| Type | Meaning |
|------|---------|
| `depends_on` | Skill A requires skill B |
| `tag_cluster` | Skills share the same tag |
| `sequence` | Skill A commonly follows skill B |
| `co_executed` | Skills frequently run together |
| `improved_by` | Skill upgraded based on another's execution |

### Clusters
Skills grouped by shared tags, with computed cohesion scores.

## API Endpoints

### Core Operations
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/knowledge-graph/build` | POST | Build/rebuild graph from skills and archives |
| `/api/knowledge-graph` | GET | Get full graph structure |
| `/api/knowledge-graph/stats` | GET | Graph statistics (nodes, edges, density) |
| `/api/knowledge-graph/terminal` | GET | Terminal-friendly visualization |

### Node Operations
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/knowledge-graph/nodes/:skillId` | GET | Get node with edges |
| `/api/knowledge-graph/nodes/:skillId/neighbors` | GET | Get connected skills |
| `/api/knowledge-graph/nodes/:skillId/refresh` | POST | Refresh single node |
| `/api/knowledge-graph/nodes/:skillId` | DELETE | Remove node from graph |

### Query Operations
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/knowledge-graph/phases/:phase/nodes` | GET | Nodes by phase |
| `/api/knowledge-graph/tags/:tag/nodes` | GET | Nodes by tag |
| `/api/knowledge-graph/edges/:type` | GET | Edges by type |
| `/api/knowledge-graph/path?from=&to=` | GET | Find path between skills |

### Analysis Operations
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/knowledge-graph/high-leverage` | GET | Top leverage skills |
| `/api/knowledge-graph/isolated` | GET | Skills with no connections |
| `/api/knowledge-graph/unused?days=30` | GET | Skills not recently used |
| `/api/knowledge-graph/gaps` | GET | Gap analysis |
| `/api/knowledge-graph/clusters` | GET | All clusters |
| `/api/knowledge-graph/clusters/:tag` | GET | Specific cluster |

## MCP Tools

### Building
| Tool | Description |
|------|-------------|
| `build_knowledge_graph` | Build/rebuild the graph |
| `refresh_graph_node` | Refresh a single node |
| `remove_graph_node` | Remove a node |

### Querying
| Tool | Description |
|------|-------------|
| `get_knowledge_graph` | Get full graph |
| `get_graph_node` | Get specific node |
| `get_graph_nodes_by_phase` | Filter by phase |
| `get_graph_nodes_by_tag` | Filter by tag |
| `get_graph_edges` | Get edges for a skill |
| `get_graph_edges_by_type` | Filter edges by type |
| `get_graph_neighbors` | Get connected skills |
| `find_graph_path` | Find path between skills |

### Analysis
| Tool | Description |
|------|-------------|
| `get_graph_clusters` | Get all clusters |
| `get_graph_cluster_by_tag` | Get specific cluster |
| `get_high_leverage_skills` | Top leverage skills |
| `get_isolated_skills` | Unconnected skills |
| `get_unused_skills` | Stale skills |
| `analyze_graph_gaps` | Full gap analysis |
| `get_graph_stats` | Statistics |
| `render_graph_terminal` | Terminal view |

## Leverage Score Calculation

Uses PageRank-like algorithm:
1. Initialize all nodes with score 1.0
2. For each iteration:
   - Distribute score to neighbors proportionally
   - Apply damping factor (0.85)
   - Add base score (0.15)
3. Normalize final scores

High leverage skills are "force multipliers" that unlock or improve many others.

## Gap Analysis

Identifies:
- **Missing Dependencies**: Referenced skills that don't exist
- **Isolated Skills**: No connections (potential orphans)
- **Weak Clusters**: Low cohesion (< 0.3)
- **Phase Gaps**: Phases with few or no skills

## Process

### Building the Graph
1. Load all skills from registry
2. Parse run archives for execution data
3. Create nodes from skills
4. Infer edges from:
   - Explicit dependencies
   - Tag co-occurrence
   - Execution sequences
   - Co-execution patterns
5. Compute leverage scores
6. Build clusters
7. Save to knowledge-graph.json

### Querying
1. Load graph from JSON
2. Apply filters/traversals
3. Return results with computed metrics

### Maintenance
- Refresh after skill updates
- Rebuild periodically for execution data
- Prune removed skills

## Data Location

```
memory/knowledge-graph.json
```

## Integration Points

- **SkillRegistry**: Source of skill definitions
- **RunArchivalService**: Source of execution history
- **LearningService**: Improved_by edge source
- **Analytics**: Leverage scores feed analytics

## Example Usage

```typescript
// Build the graph
await knowledgeGraphService.build();

// Find high-leverage skills
const top = knowledgeGraphService.getHighLeverageSkills(5);

// Analyze gaps
const gaps = knowledgeGraphService.analyzeGaps();

// Find path between skills
const path = knowledgeGraphService.findPath('implement', 'deploy');
```
