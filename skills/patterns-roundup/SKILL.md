---
name: patterns-roundup
description: "Round up existing patterns and automatic pattern detection from observed behaviors. Query, filter, and formalize patterns from the memory hierarchy."
phase: COMPLETE
category: operations
version: "1.0.0"
depends_on: []
tags: [patterns, learning, detection, memory]
---

# Patterns Roundup Skill

> Round up existing patterns and automatic pattern detection from observed behaviors

## Overview

The patterns-roundup module provides two core functions:
1. **Pattern Query & Roundup**: Search, filter, and export patterns from the memory hierarchy
2. **Automatic Pattern Detection**: Detect patterns from run behaviors and codebase analysis

## Architecture

### PatternsService

Located at `src/services/patterns/PatternsService.ts`, the service:

- Queries patterns across all memory levels (orchestrator, loop, skill)
- Generates formatted roundup summaries
- Detects behavioral patterns from run archives
- Identifies patterns in codebase (skills, loops)
- Analyzes pattern gaps and coverage
- Formalizes detected patterns into memory

### Data Flow

```
MemoryService → Pattern Storage (orchestrator.json, loops/*.json, skills/*.json)
     ↓
PatternsService → Query, Roundup, Detection
     ↓
API Endpoints / MCP Tools
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `query_patterns` | Search and filter patterns across all levels |
| `get_pattern` | Get a single pattern by ID |
| `generate_pattern_roundup` | Generate formatted summary of patterns |
| `detect_patterns` | Run automatic pattern detection |
| `get_pattern_gaps` | Analyze gaps in pattern coverage |
| `formalize_pattern` | Convert detected pattern to formal pattern |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patterns` | GET | Query patterns with filtering |
| `/api/patterns/:id` | GET | Get single pattern |
| `/api/patterns/roundup/:level` | GET | Generate roundup for level |
| `/api/patterns/detect` | POST | Run pattern detection |
| `/api/patterns/gaps` | GET | Get pattern gaps |
| `/api/patterns/formalize` | POST | Formalize detected pattern |

## Pattern Detection Types

### Behavioral Patterns
Detected from run archives:
- **Success patterns**: Loops with >90% success rate
- **Failure patterns**: Loops with <50% success rate
- **Skip patterns**: Frequently skipped phases

### Codebase Patterns
Detected from skill files:
- Pattern sections in SKILL.md files
- "When to Use" documentation
- Repeated structural patterns

### Gap Analysis
Identifies missing pattern categories:
- Error handling, testing, deployment
- Security, performance, documentation
- Refactoring, debugging

## Query Options

| Option | Description |
|--------|-------------|
| `level` | Filter by orchestrator, loop, or skill |
| `entityId` | Filter by specific loop or skill ID |
| `confidence` | Filter by low, medium, or high |
| `minUses` | Minimum usage count |
| `search` | Search in name, context, solution |

## Roundup Formats

| Format | Output |
|--------|--------|
| `summary` | Stats and counts |
| `full` | Stats + pattern lists |
| `markdown` | Complete markdown document |

## Integration

- **MemoryService**: Pattern storage and retrieval
- **AnalyticsService**: Run archive access for detection
- **LearningService**: Pattern proposals (via ImprovementOrchestrator)

## Example Usage

### Query all high-confidence patterns
```typescript
query_patterns({ confidence: 'high' })
```

### Generate full roundup
```typescript
generate_pattern_roundup({ level: 'orchestrator', format: 'full' })
```

### Run detection and formalize
```typescript
detect_patterns({ includeGaps: true })
// Review detected patterns...
formalize_pattern({ detectedPatternId: 'detected-success-engineering-loop' })
```

## Version

- v1.0.0 - Initial implementation with query, roundup, detection, and gap analysis
