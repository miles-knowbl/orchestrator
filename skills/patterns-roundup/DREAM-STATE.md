# Module Dream State: patterns-roundup

> Round up existing patterns + automatic pattern detection from observed behaviors

**System:** orchestrator
**Location:** src/services/patterns/
**Status:** complete

## Vision

Systematically identify, organize, and formalize patterns from the codebase and execution history. Enable pattern discovery that would otherwise require manual observation.

## Functions

| Function | Status | Description |
|----------|--------|-------------|
| PatternsService | complete | Core service at src/services/patterns/PatternsService.ts |
| queryPatterns | complete | Search and filter across all levels |
| getPattern | complete | Get single pattern by ID |
| generateRoundup | complete | Export formatted summary |
| detectBehavioralPatterns | complete | Detect from run archives |
| detectCodebasePatterns | complete | Detect from skills/loops |
| identifyPatternGaps | complete | Gap coverage analysis |
| formalizePattern | complete | Convert detected to formal |
| API endpoints | complete | 6 endpoints at /api/patterns/* |
| MCP tools | complete | 6 tools for pattern operations |

## Completion Algebra

```
patterns-roundup.done = PatternsService.operational
                      AND queryPatterns.operational
                      AND detectPatterns.operational
                      AND generateRoundup.operational
                      AND formalizePattern.operational
                      AND api_endpoints.operational
                      AND mcp_tools.operational

Current: 10/10 functions complete (100%)
Status: Complete
Version: 1.0.0
```

## Dependencies

**Depends on:**
- analytics (provides run archive access)
- MemoryService (pattern storage)

**Depended on by:**
- ADIR-loop (pattern detection for reflexive phase)
- coherence-system (pattern alignment)

## Notes

- Implemented 2026-02-01
- Detects behavioral patterns from last 50 runs
- Scans skills directory for undocumented patterns
- Gap analysis checks 8 expected pattern categories
- Formalization preserves detected confidence as initial level
