# Skill Selection Reference

How to query, filter, evaluate, and select skills from the registry for loop composition. Skill selection is the most consequential step in composition -- the wrong skills produce the wrong loop.

## The Skill Registry

The skill registry is served by the skills-library-mcp service. It exposes:

| Operation | Description | Use In Composition |
|-----------|-------------|-------------------|
| `list_skills` | List all skills with optional phase/category filter | Initial discovery |
| `get_skill` | Get full skill definition including SKILL.md content | Detailed evaluation |
| `search_skills` | Search by keyword in name and description | Domain-specific discovery |
| `validate_selection` | Validate a set of skills for loop composition | Pre-composition check |
| `get_phases` | List all phases with their associated skills | Phase coverage analysis |

## Discovery Strategies

### Strategy 1: Phase-First (Recommended for Standard Loops)

Start with the phases you need, then find skills for each:

```
1. Determine required phases (e.g., INIT, SCAFFOLD, IMPLEMENT, TEST, REVIEW, COMPLETE)
2. For each phase, query: list_skills(phase: "[PHASE]")
3. From each result set, select the best-fitting skill(s)
4. Fill gaps where no skill matches
```

**Best for:** Engineering loops, standard workflows where phase structure is clear.

### Strategy 2: Domain-First (Recommended for Custom Loops)

Start with the domain, find relevant skills, then map to phases:

```
1. Search: search_skills(query: "[domain keyword]")
2. Filter results by relevance to the loop's purpose
3. Group selected skills by their assigned phase
4. Fill phase gaps with core skills
```

**Best for:** Proposal loops, analysis pipelines, domain-specific workflows.

### Strategy 3: Dependency-First (Recommended for Extension Loops)

Start with a must-have skill, pull in its dependency tree:

```
1. Identify the essential skill(s) for the loop
2. Get full definition: get_skill(name: "[skill]", includeReferences: true)
3. Read depends_on field for each skill
4. Recursively resolve dependencies
5. Map the full set to phases
```

**Best for:** Loops built around a specific capability (e.g., security audit loop built around security-audit skill).

### Strategy 4: Template-First (Recommended for Quick Composition)

Start with a known pattern, customize:

```
1. Pick a composition pattern (engineering, proposal, lightweight)
2. Use the template's skill set as starting point
3. Add/remove/swap skills for the specific use case
4. Re-validate phase coverage
```

**Best for:** Loops that are variants of existing patterns.

## Skill Evaluation Criteria

When multiple skills could fill a phase, evaluate:

| Criterion | Weight | Question | How to Assess |
|-----------|--------|----------|---------------|
| Domain fit | Critical | Does this skill serve the loop's domain? | Read skill description and tags |
| Phase alignment | Critical | Is the skill designed for this phase? | Check skill's `phase` field |
| Dependency cost | High | How many additional skills does it require? | Check `depends_on` field |
| Category match | Medium | Core? Specialized? Infrastructure? | Match to loop type |
| Output compatibility | Medium | Does its output feed the next phase's input? | Read deliverable descriptions |
| Maturity | Low | Does it have references? Is it well-documented? | Check `referenceCount` |

### Decision Matrix Example

Choosing an INIT skill for a security-focused loop:

| Criterion | Weight | `spec` | `entry-portal` | `requirements` |
|-----------|--------|--------|-----------------|----------------|
| Domain fit | 5 | 3 (15) | 2 (10) | 4 (20) |
| Phase alignment | 5 | 5 (25) | 5 (25) | 5 (25) |
| Dependency cost | 3 | 1 (3) | 2 (6) | 1 (3) |
| Output compatibility | 4 | 4 (16) | 3 (12) | 4 (16) |
| **Total** | | **59** | **53** | **64** |

Result: `requirements` wins for a security-focused loop because its output (requirements document) feeds security-audit better than a feature spec.

## Coverage Analysis

After selecting skills, verify coverage across all required phases:

```markdown
### Coverage Report

| Phase | Required | Skills Selected | Coverage |
|-------|----------|----------------|----------|
| INIT | Yes | spec | COVERED |
| SCAFFOLD | Yes | architect, scaffold | COVERED |
| IMPLEMENT | Yes | implement | COVERED |
| TEST | Yes | test-generation | COVERED |
| VERIFY | Yes | code-verification | COVERED |
| VALIDATE | No | -- | SKIPPED (optional) |
| DOCUMENT | No | document | COVERED |
| REVIEW | Yes | code-review | COVERED |
| SHIP | No | deploy | COVERED |
| COMPLETE | Yes | loop-controller | COVERED |

Status: ALL REQUIRED PHASES COVERED
Gaps: None
```

### Gap Resolution

If a required phase has no skill:

| Situation | Resolution |
|-----------|------------|
| No skill exists for the phase | Create a new skill using `skill-design`, then compose |
| Skill exists but wrong category | Assess whether it can serve the purpose anyway |
| Multiple skills, none ideal | Compose multiple partial-fit skills in the phase |
| Phase is not actually needed | Remove phase from requirements, mark as optional |

## Dependency Resolution

### Forward Dependency Rule

If skill A in phase N depends on skill B, then B must appear in phase N or an earlier phase.

```
Phase 1 (INIT):      [spec]           -- no dependencies
Phase 2 (SCAFFOLD):  [architect]      -- depends_on: [] (OK)
Phase 3 (IMPLEMENT): [implement]      -- depends_on: [spec] (OK, spec is in phase 1)
```

### Dependency Resolution Algorithm

```
selected_skills = skills chosen for the loop
resolved = empty set

For each skill S in selected_skills (in phase order):
  For each dependency D in S.depends_on:
    If D not in resolved AND D not in selected_skills:
      Find D in registry
      Add D to the earliest valid phase
      Add D to selected_skills
    Add S to resolved

Return updated selected_skills
```

### Circular Dependency Detection

```
For each skill S:
  Walk dependency chain: S → D1 → D2 → ...
  If S appears in the chain: CIRCULAR DEPENDENCY
  Report: "Skill [S] has circular dependency through [chain]"
  Resolution: Remove one skill, restructure, or file a bug
```

## Skill Categories and Loop Types

| Loop Type | Primary Categories | Secondary Categories |
|-----------|--------------------|---------------------|
| Engineering | core | infra, specialized |
| Proposal | custom | core |
| Security | core (security-audit, code-verification) | specialized |
| Infrastructure | infra | core |
| Content | custom, specialized | core |
| Meta/Process | meta | core |

## Common Skill Combinations

These skill groups frequently appear together:

| Combination | Phase Spread | Purpose |
|-------------|-------------|---------|
| spec + architect + scaffold | INIT + SCAFFOLD | Full design pipeline |
| implement + error-handling | IMPLEMENT | Robust implementation |
| test-generation + integration-test | TEST | Comprehensive testing |
| code-verification + code-validation | VERIFY + VALIDATE | Full quality check |
| code-review + security-audit | REVIEW | Thorough review |
| deploy + distribute | SHIP | Full deployment |
| context-ingestion + context-cultivation | INIT + SCAFFOLD | Research pipeline |
| priority-matrix + proposal-builder | IMPLEMENT + COMPLETE | Analysis to output |

## Validation Before Composition

Before proceeding to phase mapping, run:

```
validate_selection(skills: [list of selected skill IDs])
```

This checks:
- All skill IDs exist in the registry
- Dependencies between selected skills are satisfiable
- No circular dependencies
- Skills can be assigned to valid phases

Fix any validation errors before proceeding to Step 3 (Phase Mapping).
