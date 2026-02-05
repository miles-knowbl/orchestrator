---
name: observe
description: "Strategic orientation at loop start — grounding in reality, mapping opportunities for leverage"
phase: INIT
category: operations
version: "1.0.0"
depends_on: []
tags: [orientation, context, leverage, opportunity, strategic, 100x]
---

# Observe

Establish situational awareness and surface high-leverage opportunities before any loop begins.

## When to Use

**Always** — this skill (or its grounding hook) runs at the start of every loop execution. It answers four questions:

1. **Where are we at?** — Current state across all dimensions
2. **Where are we going?** — Dream state at the appropriate tier
3. **How do we get there faster?** — Progress assessment and acceleration paths
4. **Are there any secret exits?** — 100x leverage moves, paradigm shifts, compression opportunities

## Two Modes

### Mode 1: Grounding (Pre-Execution Hook)

Runs automatically before any loop starts. Surfaces:
- Current reality (git state, memory, previous executions)
- Relevant dream states (org → domain → system → module)
- Progress toward dream state
- Active blockers or dependencies

**Output:** Brief situational summary displayed to user and available to loop

### Mode 2: Opportunity Mapping (This Skill)

Runs as first skill in INIT phase. Actively searches for:
- Case-based reasoning matches (similar past situations)
- Bundling opportunities (solve N problems with 1 system)
- Reframing candidates (different perspective compresses timeline)
- Paradigm shifts (100x leverage moves)

**Output:** Opportunity assessment (may be "nothing significant" — that's valid)

---

## Reference Requirements

| Reference | Purpose | When Needed |
|-----------|---------|-------------|
| [opportunity-types.md](references/opportunity-types.md) | Taxonomy of leverage opportunities | Always |
| [case-matching.md](references/case-matching.md) | How to match current situation to past patterns | When memory has patterns |

---

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Situational Summary | Loop state context | Always |
| Opportunity Assessment | Loop state context | Always (even if "none found") |
| Decision Record | Memory ADR | When significant opportunity identified |

---

## Grounding Protocol

### 1. Load Context Hierarchy

Load dream states in order, stopping at the tier relevant to this loop:

```
1. Organization: ~/workspaces/{org}/.claude/DREAM-STATE.md
2. Domain:       ~/workspaces/{org}/.claude/domains/{domain}/DREAM-STATE.md
3. System:       {project}/.claude/DREAM-STATE.md
4. Module:       {project}/src/{module}/DREAM-STATE.md (if module-scoped)
```

Each tier provides:
- Vision (where we're going)
- Checklists (what remains)
- Progress (how far we've come)
- Patterns (what we've learned)

### 2. Assess Current State

```
┌─────────────────────────────────────────────────────────────┐
│ CURRENT STATE ASSESSMENT                                     │
├─────────────────────────────────────────────────────────────┤
│ Git State                                                    │
│   Branch: {current branch}                                   │
│   Uncommitted: {Y/N} ({file count} files)                   │
│   Last commit: {message} ({time ago})                       │
│                                                              │
│ Previous Execution                                           │
│   Last loop: {loop name} @ {phase}                          │
│   Outcome: {success/incomplete/failed}                      │
│   Time since: {duration}                                    │
│                                                              │
│ Memory State                                                 │
│   Patterns: {count} ({recent count} recent)                 │
│   Decisions: {count}                                        │
│   Calibration: {adjustment summary}                         │
│                                                              │
│ Dream State Progress                                         │
│   {tier}: {done}/{total} ({percentage}%)                    │
│   Next milestone: {description}                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Surface Blockers

Check for:
- Incomplete previous executions (should resume or abandon?)
- Uncommitted work (should commit first?)
- Failed gates from previous runs (unresolved issues?)
- Dependency gaps (missing prerequisites?)

---

## Opportunity Mapping Protocol

### 1. Case-Based Reasoning

Query memory for similar situations:

```
MATCH current context against:
  - Previous loop executions with similar goals
  - Patterns tagged with relevant categories
  - Decisions made in similar contexts

IF match found:
  - What worked? What didn't?
  - Can we skip steps based on prior learning?
  - Are there known pitfalls to avoid?
```

### 2. Bundling Detection

Aggregate all checklists-to-done across relevant tiers:

```
COLLECT from:
  - Current system's module checklists
  - Sibling systems in same domain (if domain-scoped)
  - Related domains (if org-scoped)

ANALYZE for:
  - Repeated patterns (same issue across modules)
  - Shared root causes (one fix, multiple benefits)
  - Integration opportunities (solve at boundary, not in each system)
```

**Bundling Signal:** "If we built X, it would close items in Y, Z, and W simultaneously."

### 3. Reframing Candidates

Question the current frame:

```
INSTEAD OF: "{stated goal}"
WHAT IF:    "{alternative framing}"
RESULT:     "{compressed timeline or effort}"
```

Reframing questions:
- Is this the right level of abstraction?
- Are we solving a symptom instead of root cause?
- Is there a platform/primitive that would make this trivial?
- Are we optimizing a local maximum?

### 4. Paradigm Shift Detection

Look for 100x leverage moves:

```
SIGNALS:
  - Emerging technology that obsoletes current approach
  - Architectural insight that simplifies everything
  - External system that could replace custom build
  - Composition of existing pieces that achieves goal

CRITERIA for surfacing:
  - Must be concrete, not speculative
  - Must have clear path to validation
  - Must be relevant to current context
  - Impact must be genuinely transformative
```

**Important:** Do NOT force paradigm shifts. "Nothing significant found" is a valid and common outcome. Only surface genuine opportunities.

---

## Output Format

### Situational Summary (Always Produced)

```markdown
## Observe: Situational Summary

**Loop:** {loop name}
**Scope:** {org/domain/system/module}
**Target:** {what we're trying to achieve}

### Where We Are
{2-3 sentences on current state}

### Where We're Going
{Reference to dream state, specific milestone}

### Progress
{Percentage, key completed items, key remaining items}

### Blockers
{Any blockers, or "None identified"}
```

### Opportunity Assessment (Always Produced)

```markdown
## Observe: Opportunity Assessment

### Case Matches
{Relevant patterns from memory, or "No relevant matches"}

### Bundling Opportunities
{Multi-solve opportunities, or "None identified"}

### Reframing Candidates
{Alternative perspectives worth considering, or "Current frame appears optimal"}

### Paradigm Shifts
{100x opportunities, or "Nothing significant — proceed with current approach"}

### Recommendation
{One of:}
- "Proceed as planned"
- "Consider reframing: {suggestion}"
- "High-leverage opportunity identified: {description}"
- "Blocker requires resolution: {description}"
```

### Decision Record (When Opportunity Identified)

If a significant opportunity is identified (bundling, reframe, or paradigm shift), create an ADR:

```markdown
# ADR-{NNN}: {Opportunity Title}

## Status
Proposed

## Context
{What observation led to this opportunity}

## Opportunity
{What the opportunity is}

## Expected Impact
{Why this is high-leverage}

## Options
1. Pursue opportunity (reframe current goal)
2. Note for future (continue current approach)
3. Investigate further before deciding

## Decision
{User chooses}
```

---

## Integration with Loop Execution

### Pre-Loop (Hook)

```
observe-grounding hook fires
  → Load context hierarchy
  → Assess current state
  → Surface blockers
  → Store situational summary in loop context
```

### INIT Phase (Skill)

```
observe skill executes
  → Run opportunity mapping protocol
  → Produce opportunity assessment
  → If significant opportunity: present to user, await decision
  → If no significant opportunity: proceed with "nothing significant" note
  → Store assessment in loop context
```

### Available to All Subsequent Phases

The situational summary and opportunity assessment remain available throughout loop execution, enabling:
- Context-aware decisions
- Reference back to "why we're doing this"
- Validation against original assessment

---

## Key Principles

1. **Reality First** — Ground in actual state before imagining possibilities
2. **Dream State Oriented** — Always reference where we're trying to go
3. **Opportunity, Not Obligation** — 100x moves are rare; don't manufacture them
4. **User Agency** — Surface opportunities, let user decide
5. **Minimal Ceremony** — Quick for "nothing significant" cases, deeper for genuine opportunities
6. **Cumulative Learning** — Each observation feeds future case-based reasoning

---

## Relationship to Other Skills

- **context-ingestion:** Observe focuses on strategic orientation; context-ingestion handles detailed codebase understanding
- **requirements:** Observe may surface reframing that changes requirements
- **retrospective:** Observe feeds patterns that retrospective consolidates
- **calibration-tracker:** Observe uses calibration data; tracker updates it

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Instead |
|--------------|----------------|---------|
| Forcing opportunities | Creates noise, wastes effort | Accept "nothing significant" as valid |
| Skipping grounding | Leads to misaligned work | Always load context first |
| Ignoring blockers | Accumulates technical debt | Surface and address blockers |
| Over-analyzing | Paralysis by analysis | Time-box opportunity mapping |
| Ignoring dream state | Work becomes disconnected | Always reference the destination |
