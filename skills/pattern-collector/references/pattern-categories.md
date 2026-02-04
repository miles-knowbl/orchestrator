# Pattern Categories

Taxonomy for categorizing patterns during collection.

## Primary Categories

### Execution Patterns

Patterns about how loops execute.

| Pattern | Description | Example |
|---------|-------------|---------|
| `phase-duration` | Typical time per phase | "IMPLEMENT averages 45 min" |
| `gate-behavior` | How gates are handled | "code-review-gate usually passes first try" |
| `skill-sequence` | Common skill orderings | "scaffold always before implement" |
| `error-recovery` | How errors are handled | "test failures → fix → retry" |

### Technical Patterns

Implementation guidance.

| Pattern | Description | Example |
|---------|-------------|---------|
| `code-style` | Coding conventions | "Use Zod for validation" |
| `architecture` | Structural patterns | "Services in src/services/" |
| `testing` | Test patterns | "Integration tests for API endpoints" |
| `documentation` | Doc patterns | "SKILL.md with references/" |

### Strategic Patterns

Decision-making frameworks.

| Pattern | Description | Example |
|---------|-------------|---------|
| `prioritization` | How to order work | "High leverage first" |
| `scoping` | How to size work | "One module per loop" |
| `deferral` | When to defer | "Defer if unclear requirements" |
| `escalation` | When to escalate | "3 failures → human review" |

### Anti-Patterns (Avoid)

What not to do.

| Pattern | Description | Example |
|---------|-------------|---------|
| `skip-validation` | Skipping quality checks | "Never skip VALIDATE" |
| `big-bang` | Large changes at once | "Incremental commits preferred" |
| `assumption` | Unverified assumptions | "Always verify requirements" |

## Relevance Scoring

### Factors

| Factor | Weight | Description |
|--------|--------|-------------|
| Recency | 2 | Pattern detected in last 7 days |
| Frequency | 1 | Pattern occurred 3+ times |
| Category match | 3 | Matches available work types |
| Severity | 2 | Anti-pattern (avoid) patterns |

### Thresholds

| Score | Classification |
|-------|----------------|
| 5+ | High relevance |
| 3-4 | Medium relevance |
| 1-2 | Low relevance |
| 0 | Not relevant |

## Usage in Async Context

High-relevance patterns are:
1. Surfaced in queue planning
2. Used to inform duration estimates
3. Referenced in decision points
4. Applied as constraints during execution
