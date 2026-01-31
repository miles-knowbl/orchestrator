# Knowledge Graph Module Dream State

> Skill-based knowledge graph where compound leverage accumulates

## Overview

The knowledge graph represents skills as nodes and relationships as edges. It enables discovery of high-leverage skills, gap analysis, and understanding skill dependencies. The ontology is "objective" - it's about the skills themselves (versioning, collection, pruning), not personal proficiency.

## Status: Complete

**Version**: 1.0.0
**Completion**: 25/25 functions (100%)

## Functions

### Core Operations
- [x] `build()` - Build/rebuild graph from skills and run archives
- [x] `load()` - Load graph from JSON
- [x] `save()` - Persist graph to JSON
- [x] `getGraph()` - Get full graph structure

### Node Operations
- [x] `getNode(skillId)` - Get single node
- [x] `getNodes()` - Get all nodes
- [x] `getNodesByPhase(phase)` - Filter by phase
- [x] `getNodesByTag(tag)` - Filter by tag
- [x] `refreshNode(skillId)` - Refresh single node
- [x] `removeNode(skillId)` - Remove node and edges

### Edge Operations
- [x] `getEdges(skillId)` - Get incoming/outgoing edges
- [x] `getEdgesByType(type)` - Filter by edge type

### Traversal
- [x] `getNeighbors(skillId)` - Get connected skills
- [x] `findPath(from, to)` - BFS path finding

### Cluster Operations
- [x] `getClusters()` - Get all clusters
- [x] `getClusterByTag(tag)` - Get specific cluster

### Analysis
- [x] `getHighLeverageSkills(limit)` - Top leverage skills
- [x] `getIsolatedSkills()` - Unconnected skills
- [x] `getUnusedSkills(days)` - Stale skills
- [x] `analyzeGaps()` - Full gap analysis
- [x] `getStats()` - Graph statistics

### Visualization
- [x] `generateTerminalView()` - Terminal-friendly display

### API Endpoints (17 endpoints)
- [x] POST `/api/knowledge-graph/build`
- [x] GET `/api/knowledge-graph`
- [x] GET `/api/knowledge-graph/stats`
- [x] GET `/api/knowledge-graph/nodes/:skillId`
- [x] GET `/api/knowledge-graph/nodes/:skillId/neighbors`
- [x] POST `/api/knowledge-graph/nodes/:skillId/refresh`
- [x] DELETE `/api/knowledge-graph/nodes/:skillId`
- [x] GET `/api/knowledge-graph/phases/:phase/nodes`
- [x] GET `/api/knowledge-graph/tags/:tag/nodes`
- [x] GET `/api/knowledge-graph/edges/:type`
- [x] GET `/api/knowledge-graph/path`
- [x] GET `/api/knowledge-graph/clusters`
- [x] GET `/api/knowledge-graph/clusters/:tag`
- [x] GET `/api/knowledge-graph/high-leverage`
- [x] GET `/api/knowledge-graph/isolated`
- [x] GET `/api/knowledge-graph/unused`
- [x] GET `/api/knowledge-graph/gaps`
- [x] GET `/api/knowledge-graph/terminal`

### MCP Tools (19 tools)
- [x] `build_knowledge_graph`
- [x] `get_knowledge_graph`
- [x] `get_graph_node`
- [x] `get_graph_nodes_by_phase`
- [x] `get_graph_nodes_by_tag`
- [x] `get_graph_edges`
- [x] `get_graph_edges_by_type`
- [x] `get_graph_neighbors`
- [x] `find_graph_path`
- [x] `get_graph_clusters`
- [x] `get_graph_cluster_by_tag`
- [x] `get_high_leverage_skills`
- [x] `get_isolated_skills`
- [x] `get_unused_skills`
- [x] `analyze_graph_gaps`
- [x] `get_graph_stats`
- [x] `refresh_graph_node`
- [x] `remove_graph_node`
- [x] `render_graph_terminal`

## Key Design Decisions

1. **Skills as Only Primitive**: Nodes are skills only. Patterns, loops, and learnings are metadata or derived.

2. **Objective Ontology**: Graph is about skills themselves (versioning, collection, pruning), not personal proficiency.

3. **PageRank-like Leverage**: Centrality calculation identifies "force multiplier" skills.

4. **Five Edge Types**:
   - `depends_on` - Explicit dependencies
   - `tag_cluster` - Shared tags
   - `sequence` - Common execution order
   - `co_executed` - Frequently run together
   - `improved_by` - Improvement relationships

5. **Gap Analysis**: Finds missing dependencies, isolated skills, weak clusters, phase gaps.

## Data Location

```
memory/knowledge-graph.json
```

## Integration

- Reads from: SkillRegistry, RunArchivalService
- Consumed by: Analytics, Learning, Coherence (planned)

## Unlocks

- skill-trees (Layer 1)
- tech-trees (Layer 1)
- mece-opportunity-mapping (Layer 2)
- co-op-skill-acquisition (Layer 5)
- spaced-repetition-learning (Layer 5)
