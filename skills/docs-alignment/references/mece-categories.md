# MECE Documentation Categories

> Mutually Exclusive, Collectively Exhaustive taxonomy for all documentation.

## The MECE Principle

**Mutually Exclusive:** No document belongs to multiple categories.
**Collectively Exhaustive:** Every document belongs to exactly one category.

## Category Definitions

### 1. Instructions

**Scope:** How Claude should behave
**Files:** `CLAUDE.md` at any tier
**Location:** Root of tier directory

| Tier | Path | Purpose |
|------|------|---------|
| Organization | `~/.claude/CLAUDE.md` | Global instructions for all projects |
| System | `{repo}/CLAUDE.md` or `{repo}/.claude/CLAUDE.md` | Project-specific instructions |
| Module | `{repo}/{module}/.claude/CLAUDE.md` | Module-specific instructions (rare) |

**Includes:**
- Behavior rules
- Workflow defaults
- Tool preferences
- Anti-patterns to avoid

**Does NOT include:**
- Progress tracking (→ Dream State)
- Learned patterns (→ Memory)
- Feature requirements (→ Spec)

### 2. Dream States

**Scope:** What "done" looks like + current progress
**Files:** `DREAM-STATE.md` at any tier
**Location:** `.claude/` directory at each tier

| Tier | Path | Purpose |
|------|------|---------|
| Organization | `~/.claude/DREAM-STATE.md` | Org-wide vision, system list, master checklist |
| System | `{repo}/.claude/DREAM-STATE.md` | System vision, module list, module checklists |
| Module | `{repo}/{module}/.claude/DREAM-STATE.md` | Function checklists, dependencies |

**Includes:**
- Vision statements
- Progress checklists
- Module/function completion status
- Recent completions
- Active loops

**Does NOT include:**
- How to build it (→ Architecture)
- What to build (→ Spec)
- How Claude should behave (→ Instructions)

### 3. Memory

**Scope:** Learned knowledge from execution
**Files:** `patterns.json`, `calibration.json`, `decisions/*.md`
**Location:** `memory/` subdirectory at each tier

| Tier | Path | Purpose |
|------|------|---------|
| Organization | `~/.claude/memory/` | Cross-system patterns, global calibration |
| System | `{repo}/.claude/memory/` | System-specific patterns, decisions |
| Module | `{repo}/{module}/.claude/memory/` | Module-specific learnings |

**Includes:**
- Patterns (reusable solutions)
- Decisions (ADRs)
- Calibration data (estimation accuracy)
- Handoffs (session context)

**Does NOT include:**
- Current progress (→ Dream State)
- Feature requirements (→ Spec)
- Design diagrams (→ Architecture)

### 4. Loop Definitions

**Scope:** Workflow process definitions
**Files:** `*-loop.md`, `loop.json`
**Location:** `commands/` at organization tier

| Tier | Path | Purpose |
|------|------|---------|
| Organization | `~/.claude/commands/*.md` | Loop command definitions |
| System | N/A | Loops are defined at org level only |

**Includes:**
- Phase definitions
- Gate configurations
- Skill assignments
- State schemas

**Does NOT include:**
- Execution state (→ Run Archives)
- Skills themselves (→ separate skills directory)

### 5. Specs & Requirements

**Scope:** What to build
**Files:** `REQUIREMENTS.md`, `FEATURESPEC.md`, `SPEC*.md`
**Location:** System root or `.claude/docs/specs/`

| Tier | Path | Purpose |
|------|------|---------|
| System | `{repo}/REQUIREMENTS.md` | High-level requirements |
| System | `{repo}/FEATURESPEC.md` | Detailed feature specification |
| System | `{repo}/.claude/docs/specs/*.md` | Archived or supplementary specs |

**Includes:**
- User stories
- Acceptance criteria
- Feature specifications
- API contracts (what, not how)

**Does NOT include:**
- Design decisions (→ Architecture)
- Progress tracking (→ Dream State)
- Quality results (→ Audit)

### 6. Architecture

**Scope:** How to build it
**Files:** `ARCHITECTURE.md`, `ADR-*.md`, design docs
**Location:** System root or `.claude/docs/` or `memory/decisions/`

| Tier | Path | Purpose |
|------|------|---------|
| System | `{repo}/ARCHITECTURE.md` | System architecture overview |
| System | `{repo}/.claude/memory/decisions/` | Architectural Decision Records |
| System | `{repo}/.claude/docs/architecture/` | Design documents |

**Includes:**
- System diagrams
- Component relationships
- Technology choices
- Design decisions (ADRs)
- Trade-off analysis

**Does NOT include:**
- What to build (→ Spec)
- Quality validation (→ Audit)
- Current progress (→ Dream State)

### 7. Audits & Reviews

**Scope:** Quality and security artifacts
**Files:** `*-AUDIT.md`, `CODE-REVIEW.md`, `VALIDATION.md`, `VERIFICATION.md`
**Location:** System root (active) or `.claude/docs/audits/` (archived)

| Tier | Path | Purpose |
|------|------|---------|
| System | `{repo}/SECURITY-AUDIT.md` | Active security audit |
| System | `{repo}/CODE-REVIEW.md` | Active code review |
| System | `{repo}/.claude/docs/audits/` | Archived audit artifacts |
| System | `{repo}/.claude/docs/reviews/` | Archived review artifacts |

**Includes:**
- Security audit results
- Code review findings
- Validation reports
- Verification results
- Performance analysis

**Does NOT include:**
- How to build (→ Architecture)
- What to build (→ Spec)
- Progress tracking (→ Dream State)

### 8. Run Archives

**Scope:** Historical loop execution data
**Files:** `{system}-{loop}-{timestamp}.json`
**Location:** `~/.claude/runs/{year-month}/`

| Tier | Path | Purpose |
|------|------|---------|
| Organization | `~/.claude/runs/` | All archived loop runs |

**Includes:**
- Loop state at completion
- Phase summaries
- Gate results
- Deliverable references
- Timing data

**Does NOT include:**
- Active loop state (→ working directory)
- Pattern extraction (→ Memory)

## Classification Decision Tree

```
Is it about HOW Claude should behave?
  └─ YES → Instructions (CLAUDE.md)
  └─ NO ↓

Is it about WHAT "done" looks like or current progress?
  └─ YES → Dream State
  └─ NO ↓

Is it learned knowledge (patterns, decisions, calibration)?
  └─ YES → Memory
  └─ NO ↓

Is it a workflow/loop definition?
  └─ YES → Loop Definition
  └─ NO ↓

Is it about WHAT to build (requirements, features)?
  └─ YES → Spec
  └─ NO ↓

Is it about HOW to build (design, architecture)?
  └─ YES → Architecture
  └─ NO ↓

Is it about quality (audits, reviews, validation)?
  └─ YES → Audit
  └─ NO ↓

Is it historical execution data?
  └─ YES → Run Archive
  └─ NO → Uncategorized (needs categorization!)
```

## Common Misclassifications

| Document | Wrong Category | Correct Category | Why |
|----------|---------------|------------------|-----|
| Progress checklist | Instructions | Dream State | Progress ≠ behavior rules |
| Pattern learned | Dream State | Memory | Patterns are learned, not progress |
| API contract | Architecture | Spec | Contract is what, not how |
| ADR | Spec | Architecture | Decisions are design, not requirements |
| Code review | Spec | Audit | Review is quality, not requirements |

## Tier Boundaries

### Organization Tier Only
- Loop definitions (`commands/*.md`)
- Run archives (`runs/`)
- Cross-system patterns

### System Tier Only
- Specs and requirements
- Architecture documents
- Audits and reviews
- System-specific patterns

### Module Tier (Optional)
- Module Dream State
- Module-specific patterns
- Module-specific instructions (rare)

## Validation Rules

1. **No duplicates:** Same content should not exist in multiple categories
2. **No hybrids:** A document should not mix categories (split if needed)
3. **Complete coverage:** Every documentation file must have a category
4. **Tier appropriate:** Documents live at the correct tier for their scope
