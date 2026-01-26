# MECE Validation

Process for ensuring the skills library remains Mutually Exclusive and Collectively Exhaustive. Run when adding or significantly restructuring a skill.

## What MECE Means for Skills

- **Mutually Exclusive:** Each skill has a distinct scope. No two skills teach the same process or produce the same deliverables. Tag overlap below 40%.
- **Collectively Exhaustive:** The full library covers all phases. No critical capability is missing.

## Overlap Detection

### Tag-Based Jaccard Similarity

```
Jaccard(A, B) = |A intersection B| / |A union B|
```

| Jaccard Score | Interpretation | Action |
|---------------|---------------|--------|
| 0.00 - 0.20 | No meaningful overlap | Proceed |
| 0.21 - 0.40 | Minor overlap | Proceed; verify descriptions are distinct |
| 0.41 - 0.60 | Significant overlap | Compare steps and deliverables manually |
| 0.61 - 1.00 | Likely duplicate | Merge, demote to reference, or redefine scope |

**Example:** Tags `[testing, quality, validation, automation]` vs `[testing, quality, coverage, unit-tests]`. Intersection: 2, Union: 6, Jaccard: 0.33 -- minor overlap, acceptable.

### Description Semantic Similarity

Manual check when Jaccard is 0.21-0.60:

| Check | Question | Red Flag |
|-------|----------|----------|
| Verb overlap | Same starting verb? | Both say "Validate..." |
| Object overlap | Same artifact? | Both mention "code quality" |
| Outcome overlap | Similar deliverables? | Both output a checklist |
| Actor overlap | Same trigger scenario? | Both triggered by "before shipping" |

If 3+ of 4 checks show overlap, merge or redraw boundaries.

### Step Content Overlap

Compare step names side by side. If more than 2 steps overlap in purpose, the skills are too similar. List steps from both skills, identify matches, and investigate any with 2+ shared step purposes.

## Dependency Graph Rules

The `depends_on` relationships must form a Directed Acyclic Graph (DAG).

| Rule | Description |
|------|-------------|
| No self-dependency | A skill cannot list itself in `depends_on` |
| No circular chains | Following dependencies must never revisit a node |
| Depth limit | Chains should not exceed 5 levels |
| Orphans acceptable | No dependencies and no dependents is valid; document justification |

### Cycle Detection
Walk from each skill through its `depends_on` chain. If any path revisits a node, a cycle exists and must be resolved by removing or restructuring a dependency.

## Phase Coverage

All 10 phases should have at least one skill. Current assignments:

| Phase | Skills | Count |
|-------|--------|-------|
| INIT | spec, architect, context-ingestion, context-cultivation, priority-matrix | 5 |
| SCAFFOLD | scaffold, proposal-builder | 2 |
| IMPLEMENT | implement, error-handling | 2 |
| TEST | test-generation | 1 |
| VERIFY | code-verification | 1 |
| VALIDATE | (none) | 0 |
| DOCUMENT | document | 1 |
| REVIEW | code-review | 1 |
| SHIP | deploy | 1 |
| COMPLETE | (none) | 0 |
| META | loop-controller, content-analysis, metadata-extraction | 3 |

**Gaps:** VALIDATE and COMPLETE have no skills. When adding a skill, prefer underrepresented phases unless the skill clearly belongs elsewhere.

## Tag Uniqueness

| Rule | Rationale |
|------|-----------|
| No identical tag sets | Two skills with the same tags are likely redundant |
| No pure subsets | If A's tags are a subset of B's, investigate overlap |
| Limit shared tags | Tags used by 3+ skills should be replaced with more specific terms |
| At least 1 unique tag | Each skill should have a tag no other skill shares |

### Tag Quality

| Good Tag | Bad Tag | Why |
|----------|---------|-----|
| `architecture-decisions` | `design` | Specific vs vague |
| `source-evaluation` | `stuff` | Descriptive vs meaningless |
| `unit-testing` | `testing` | Scoped vs too broad |

## Validation Commands

| MCP Tool | Purpose |
|----------|---------|
| `list_skills` | Get all skills for comparison |
| `get_skill` | Deep comparison of two skills |
| `search_skills` | Find overlaps by keyword |
| `validate_selection` | Verify dependencies are satisfiable |
| `get_phases` | Check phase coverage |

### Manual Review Process
1. `list_skills` to get full roster
2. Compute Jaccard for new skill against all existing tag sets
3. For scores > 0.40, `get_skill` on both and compare
4. `get_phases` to check coverage
5. Verify dependency graph has no cycles
6. Confirm at least 1 unique tag
7. Document findings
