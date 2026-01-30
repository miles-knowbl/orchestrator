---
name: collect-bugs
description: "Round up minor UI/UX/data bugs into a prioritized backlog"
phase: INIT
category: operations
version: "1.0.0"
depends_on: []
tags: [bugs, triage, ui, ux, data, quality, batch]
---

# Collect Bugs

Systematically sweep through an application to gather, categorize, and prioritize minor bugs that are too small for a full engineering loop but important for overall quality.

## When to Use

- **Before a bugfix sprint** — Round up all known issues into one prioritized list
- **After a major feature lands** — Catch UI/UX regressions from new code
- **Quality audit** — Systematic sweep when "something feels off"
- **User feedback processing** — Convert vague reports into actionable bugs

**Skip this skill when:** You have a single, well-defined bug to fix (go directly to `bug-reproducer`).

## Reference Requirements

| Reference | Purpose | When Needed |
|-----------|---------|-------------|
| `bug-categories.md` | Category definitions and severity levels | Always |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `BUG-BACKLOG.md` | Project root | Always |

## Core Concept

Collect-bugs answers: **"What minor issues exist across the application right now?"**

Unlike `bug-reproducer` which focuses on one bug deeply, this skill performs a **breadth-first sweep** to gather many issues quickly, then prioritizes them for systematic fixing.

## Collection Sources

### 1. Console & Network
- Browser console errors and warnings
- Network request failures (4xx, 5xx)
- Unhandled promise rejections
- TypeScript/runtime type mismatches
- Deprecation warnings

### 2. Visual Inspection
- Layout shifts and alignment issues
- Responsive breakpoint problems
- Missing loading states
- Incorrect colors or typography
- Z-index stacking issues
- Scroll behavior problems

### 3. UX Flows
- Confusing navigation paths
- Missing feedback on actions
- Poor error messages
- Accessibility issues (focus, contrast, labels)
- Inconsistent interaction patterns

### 4. Data Display
- Incorrect or stale data shown
- Missing fields or null rendering
- Wrong date/number formatting
- Truncation without indication
- Empty states not handled

### 5. User Reports
- Support tickets mentioning bugs
- Feedback forms
- Session recordings (if available)
- Verbal reports from stakeholders

## Bug Categories

| Category | Code | Description |
|----------|------|-------------|
| UI | `UI-###` | Visual glitches, layout, styling |
| UX | `UX-###` | Flow, feedback, interaction |
| Data | `DATA-###` | Incorrect display, missing fields |
| Console | `CON-###` | Errors, warnings, type issues |
| Performance | `PERF-###` | Slow renders, memory leaks |

## Severity Levels

| Level | Label | Criteria |
|-------|-------|----------|
| P0 | Blocking | Prevents core functionality, crashes app |
| P1 | High | Major feature broken, poor user experience |
| P2 | Medium | Noticeable issue, workaround exists |
| P3 | Low | Cosmetic, minor inconvenience |

## Process

### Step 1: Prepare Environment
```bash
# Start app in development mode
npm run dev

# Open browser with DevTools console visible
# Enable "Preserve log" to catch transient errors
```

### Step 2: Console Sweep
1. Clear console
2. Navigate through each major route
3. Perform common actions (create, edit, delete)
4. Note any errors, warnings, or failed requests
5. Check Network tab for failed requests

### Step 3: Visual Sweep
For each screen:
1. Check at desktop (1920px), tablet (768px), mobile (375px)
2. Look for alignment, overflow, truncation issues
3. Verify loading states and empty states
4. Test dark mode if applicable

### Step 4: UX Flow Sweep
For each critical path:
1. Complete the happy path
2. Note any confusing steps or missing feedback
3. Trigger error states intentionally
4. Verify error messages are helpful

### Step 5: Data Sweep
1. Check data display against source of truth
2. Look for null/undefined rendering issues
3. Verify date/number/currency formatting
4. Test with edge cases (empty, very long, special chars)

### Step 6: Compile Backlog
Create `BUG-BACKLOG.md` with:
1. Summary table by category
2. Bugs organized by priority (P0 first)
3. Each bug includes: ID, title, location, repro steps, impact

## Output Format

```markdown
# Bug Backlog

**Collected:** YYYY-MM-DD
**Source:** [project-name]
**Total Bugs:** N

## Summary by Category

| Category | Count | P0 | P1 | P2 | P3 |
|----------|-------|----|----|----|----|
| UI       | X     | -  | -  | -  | -  |
| UX       | X     | -  | -  | -  | -  |
| Data     | X     | -  | -  | -  | -  |
| Console  | X     | -  | -  | -  | -  |
| Perf     | X     | -  | -  | -  | -  |

---

## P0 — Blocking

### [CAT-001] Bug title
- **Location:** file.tsx:123 or "Settings > Profile"
- **Repro:** 1. Do X  2. Click Y  3. See error
- **Expected:** What should happen
- **Actual:** What actually happens
- **Impact:** Why this matters

---

## P1 — High
...

## P2 — Medium
...

## P3 — Low (Cosmetic)
...
```

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `bug-reproducer` | Takes individual bugs from backlog for deep reproduction |
| `root-cause-analysis` | Uses backlog to identify patterns across bugs |
| `test-generation` | Generates regression tests for fixed bugs |

## Key Principles

1. **Breadth over depth** — Collect many, detail later
2. **Consistent categorization** — Use standard codes and severity levels
3. **Actionable entries** — Every bug needs location and repro steps
4. **Priority drives order** — P0s at top, fix first
5. **Don't fix while collecting** — Note it and move on

## References

- [Bug Categories](references/bug-categories.md) — Detailed category definitions with examples
