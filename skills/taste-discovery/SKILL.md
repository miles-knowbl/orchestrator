---
name: taste-discovery
description: "Find and load project-specific taste evaluations. Discovers eval definitions through manifest, convention, or defaults. Provides the foundation for taste-first auditing by identifying what quality dimensions matter for this specific project."
phase: TASTE
category: engineering
version: "1.0.0"
depends_on: []
tags: [audit, taste, quality, discovery, evals]
---

# Taste Discovery

Find and load project-specific taste evaluations.

## When to Use

- **Starting an audit** — First skill in TASTE phase, runs before any evaluation
- **New project audit** — Discover what quality dimensions the project cares about
- **Custom eval setup** — When project has defined its own quality evals
- When you say: "what quality dimensions matter here?", "find the evals", "discover taste criteria"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `taste-manifest-schema.md` | Understand manifest format if one exists |
| `eval-file-format.md` | Parse *-QUALITY-EVALS.md files correctly |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `minimal-defaults.md` | When no project evals found |

**Verification:** Ensure discovery source is identified and dimensions are parsed.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Discovery report | audit-state.json | Always (taste.eval_source field) |
| Parsed dimensions | audit-state.json | Always (taste.dimensions array) |

## Core Concept

Taste Discovery answers: **"What does 'good' mean for this project?"**

Different projects have different quality criteria:
- A tweet generator cares about voice fidelity and engagement
- A documentation tool cares about clarity and completeness
- A data pipeline cares about accuracy and freshness

This skill finds project-specific definitions rather than imposing generic standards.

## Discovery Order

The skill searches for eval definitions in priority order (first match wins):

```
┌─────────────────────────────────────────────────────────────┐
│                    DISCOVERY ORDER                          │
│                                                             │
│  1. .claude/taste-manifest.json                             │
│     └─→ Explicit manifest with full configuration           │
│                                                             │
│  2. TASTE-EVALS.md                                          │
│     └─→ Single-file eval definition in project root         │
│                                                             │
│  3. *-QUALITY-EVALS.md (glob pattern)                       │
│     └─→ Convention: CONTENT-QUALITY-EVALS.md, etc.          │
│                                                             │
│  4. Minimal Defaults                                        │
│     └─→ 4 UX dimensions if nothing else found               │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Check for Manifest

Look for `.claude/taste-manifest.json`:

```json
{
  "version": "1.0.0",
  "eval_files": [
    "CONTENT-QUALITY-EVALS.md",
    "UX-QUALITY-EVALS.md"
  ],
  "category_weights": {
    "content": 0.6,
    "ux": 0.4
  },
  "quality_gates": {
    "ship": 4.0,
    "polish": 3.0,
    "fix": 2.5
  }
}
```

If found, load referenced eval files and apply weights.

## Step 2: Check for TASTE-EVALS.md

Look for `TASTE-EVALS.md` in project root. This is a single-file format containing all dimensions:

```markdown
# Taste Evaluations

## Dimensions

### voice_fidelity
- **Category:** content
- **Weight:** 40%
- **Floor:** 2.5
- **Description:** Output matches the intended voice/persona

### engagement
- **Category:** content
- **Weight:** 30%
- **Floor:** 2.5
- **Description:** Content is engaging and interesting
```

## Step 3: Check for Convention Files

Glob for `*-QUALITY-EVALS.md` in project root:

| Pattern | Example |
|---------|---------|
| `CONTENT-QUALITY-EVALS.md` | Content generation quality |
| `UX-QUALITY-EVALS.md` | User experience quality |
| `API-QUALITY-EVALS.md` | API design quality |
| `DATA-QUALITY-EVALS.md` | Data pipeline quality |

Parse each file for dimensions and combine into unified dimension list.

## Step 4: Apply Minimal Defaults

If no evals found, apply defaults:

| Dimension | Weight | Floor | Description |
|-----------|--------|-------|-------------|
| Usability | 35% | 2.5 | Can users accomplish their goals? |
| Responsiveness | 25% | 2.5 | Does UI respond quickly? |
| Reliability | 25% | 2.5 | Does it work consistently? |
| Accessibility | 15% | 2.5 | Keyboard nav, screen reader, contrast |

**Inform user:** When defaults are used, show guidance on adding custom evals.

## Output Format

Update `audit-state.json`:

```json
{
  "taste": {
    "eval_source": "convention",
    "eval_files": ["CONTENT-QUALITY-EVALS.md", "UX-QUALITY-EVALS.md"],
    "dimensions": [
      {
        "name": "voice_fidelity",
        "category": "content",
        "weight": 0.40,
        "floor": 2.5,
        "description": "Output matches the intended voice/persona"
      }
    ],
    "category_weights": {
      "content": 0.6,
      "ux": 0.4
    },
    "quality_gates": {
      "ship": 3.5,
      "polish": 2.5,
      "fix": 2.5
    }
  }
}
```

## Discovery Message Templates

**When manifest found:**
```
Taste Discovery: Found .claude/taste-manifest.json
  Loading: 2 eval files, 2 categories
  Dimensions: 6 total (4 content, 2 ux)
```

**When convention files found:**
```
Taste Discovery: Found 2 convention files
  - CONTENT-QUALITY-EVALS.md (4 dimensions)
  - UX-QUALITY-EVALS.md (5 dimensions)
  Dimensions: 9 total
```

**When using defaults:**
```
═══════════════════════════════════════════════════════════════
║  TASTE DISCOVERY                                            ║
║                                                             ║
║  No project-specific taste evals found.                     ║
║  Using minimal defaults (4 UX dimensions).                  ║
║                                                             ║
║  To add custom evals:                                       ║
║                                                             ║
║  Option 1: Convention files                                 ║
║    Create *-QUALITY-EVALS.md in project root                ║
║                                                             ║
║  Option 2: Single eval file                                 ║
║    Create TASTE-EVALS.md in project root                    ║
║                                                             ║
║  Option 3: Explicit manifest                                ║
║    Create .claude/taste-manifest.json                       ║
═══════════════════════════════════════════════════════════════
```

## Validation

Before completing, verify:

- [ ] Discovery source is identified (manifest | taste-evals | convention | defaults)
- [ ] All dimension names are unique
- [ ] All weights sum to 1.0 within each category
- [ ] All floors are between 1.0 and 5.0
- [ ] Quality gates are defined (ship, polish, fix thresholds)

## Common Issues

| Issue | Resolution |
|-------|------------|
| Weights don't sum to 1.0 | Normalize weights within category |
| Missing floor | Default to 2.5 |
| Duplicate dimension names | Prefix with category (content_voice, ux_voice) |
| Empty eval file | Skip file, warn user |
