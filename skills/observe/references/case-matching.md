# Case-Based Matching

How to match the current situation against historical patterns and decisions.

## Overview

Case-based reasoning finds relevant past experiences to inform current work. This reference describes how to query, match, and apply historical context.

---

## Memory Sources

### 1. Orchestrator Memory (`memory/orchestrator.json`)

Global patterns and decisions that apply across all systems.

```json
{
  "patterns": [
    {
      "id": "PAT-001",
      "name": "pattern-name",
      "description": "what it is",
      "context": "when it applies",
      "tags": ["tag1", "tag2"]
    }
  ],
  "decisions": [
    {
      "id": "ADR-001",
      "title": "decision title",
      "status": "accepted",
      "context": "why we needed to decide",
      "decision": "what we decided"
    }
  ]
}
```

### 2. System Memory (`{project}/memory/`)

System-specific patterns, calibration, and execution history.

### 3. Archived Runs (`~/.claude/runs/`)

Historical loop executions with context, outcomes, and lessons.

```
~/.claude/runs/
  2026-01/
    orchestrator-engineering-2026-01-15T10-30.json
    deck-forge-audit-2026-01-18T14-22.json
```

### 4. Dream State History

Progression through dream state milestones over time.

---

## Matching Algorithm

### Step 1: Extract Current Context

```
current_context = {
  organization: "superorganism",
  domain: "{domain-if-known}",
  system: "orchestrator",
  module: "{module-if-scoped}",
  loop: "engineering-loop",
  goal: "{stated goal}",
  tags: [extracted from goal and context]
}
```

### Step 2: Query Memory

```
For each memory source:
  matches = query(
    tags: current_context.tags,
    system: current_context.system (or null for global),
    loop: current_context.loop (if relevant),
    recency: prefer recent (last 30 days weighted higher)
  )
```

### Step 3: Score Matches

```
score(match) =
  tag_overlap * 0.4 +
  system_match * 0.2 +
  loop_match * 0.2 +
  recency_weight * 0.1 +
  outcome_quality * 0.1
```

- **tag_overlap:** % of current tags that match pattern tags
- **system_match:** 1.0 if same system, 0.5 if same domain, 0.2 otherwise
- **loop_match:** 1.0 if same loop type, 0.5 if related phase
- **recency_weight:** 1.0 for last week, decays to 0.3 over 30 days
- **outcome_quality:** 1.0 for successful patterns, 0.5 for mixed, 0.0 for failed

### Step 4: Filter and Rank

```
relevant_matches = matches
  .filter(score > 0.5)
  .sort_by(score, descending)
  .take(top 5)
```

---

## Match Types

### Exact Match
Same system, same goal, same loop type.
→ Strong signal: apply lessons directly

### Analogical Match
Different system, similar goal structure.
→ Medium signal: adapt lessons to current context

### Anti-Pattern Match
Similar situation that had bad outcome.
→ Warning signal: avoid the pitfall

### Calibration Match
Previous execution had calibration adjustment.
→ Adjustment signal: apply calibration upfront

---

## Applying Matches

### For Case-Based Shortcuts

```markdown
### Case Match: {pattern/decision ID}

**Similarity:** {score as percentage}
**Source:** {system/loop/date}

**What happened:** {brief description}
**Lesson:** {what to apply}
**Shortcut:** {what step(s) we can skip or modify}
```

### For Anti-Patterns

```markdown
### Anti-Pattern Warning: {pattern ID}

**Similarity:** {score as percentage}
**Source:** {system/loop/date}

**What happened:** {what went wrong}
**Root cause:** {why it failed}
**Avoidance:** {what to do differently}
```

### For Calibration

```markdown
### Calibration Adjustment: {calibration ID}

**Source:** {previous execution}
**Original estimate:** {what we thought}
**Actual:** {what happened}
**Adjustment:** {how to calibrate this time}
```

---

## Building the Case Base

Every loop completion should contribute to future matching:

### On Success

```json
{
  "type": "pattern",
  "source": "{system}-{loop}-{date}",
  "context": {
    "goal": "what we were doing",
    "approach": "how we did it",
    "environment": "relevant context"
  },
  "outcome": {
    "success": true,
    "duration": "how long it took",
    "lessons": ["what worked well"]
  },
  "tags": ["derived", "from", "context"]
}
```

### On Partial Success

```json
{
  "type": "pattern",
  "outcome": {
    "success": "partial",
    "what_worked": ["things that went well"],
    "what_didnt": ["things that need improvement"],
    "adjustments": ["for next time"]
  }
}
```

### On Failure

```json
{
  "type": "anti-pattern",
  "outcome": {
    "success": false,
    "failure_mode": "what went wrong",
    "root_cause": "why it happened",
    "prevention": "how to avoid"
  }
}
```

---

## Query Examples

### "I'm about to scaffold a new Next.js project"

```
Query:
  tags: [nextjs, scaffold, new-project]
  loop: engineering-loop
  phase: SCAFFOLD

Expected matches:
  - Previous Next.js scaffolds (exact)
  - Other frontend scaffolds (analogical)
  - Known scaffolding anti-patterns (warning)
```

### "I'm debugging a state management issue"

```
Query:
  tags: [debug, state, react, redux/zustand/etc]
  loop: bugfix-loop
  phase: IMPLEMENT

Expected matches:
  - Previous state bugs in same system (exact)
  - State bugs in other systems (analogical)
  - Common state debugging patterns (general)
```

### "I'm deploying to production"

```
Query:
  tags: [deploy, production, release]
  loop: distribution-loop
  phase: SHIP

Expected matches:
  - Previous deploys for this system (exact)
  - Deploy incidents (anti-pattern)
  - Calibration on deploy duration (calibration)
```

---

## Cold Start

When memory is empty or sparse:

1. **Don't block** — Observe still produces value via grounding
2. **Note the gap** — "No historical matches available"
3. **Build from first run** — This execution becomes first case
4. **Bootstrap from templates** — Use skill reference patterns as initial cases

The case base grows with use. Early runs have less matching; later runs benefit from history.

---

## Privacy and Scope

- **Organization memory** stays within org boundaries
- **System memory** stays within system
- **User memory** (~/.claude/) is personal
- **Patterns can be promoted** from system → org if generally applicable
- **Sensitive patterns** should be tagged and filtered appropriately
