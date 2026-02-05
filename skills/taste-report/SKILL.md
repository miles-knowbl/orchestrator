---
name: taste-report
description: "Generate taste-ordered checklist for shipping. Uses trace data to prioritize failure modes by taste impact: Tier 1 (taste-critical), Tier 2 (taste-significant), Tier 3 (technical-only). Updates AUDIT-REPORT.md with taste-weighted prioritization."
phase: DOCUMENT
category: engineering
version: "1.0.0"
depends_on: [taste-trace]
tags: [audit, taste, report, checklist, prioritization]
---

# Taste Report

Generate taste-ordered checklist for shipping.

## When to Use

- **Final phase of audit** — Runs in DOCUMENT phase after all analysis complete
- **Generating prioritized checklist** — Order fixes by taste impact, not just severity
- **Ship decision documentation** — Summarize what needs fixing and why
- When you say: "generate the checklist", "what do we fix first?", "taste-ordered report"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `tier-algorithm.md` | How to order items by taste impact |
| `checklist-template.md` | Output format for checklist |

**Verification:** Checklist items are ordered by taste impact, not just technical severity.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated `AUDIT-REPORT.md` | Project root | Always (taste-ordered sections) |

## Core Concept

Taste Report answers: **"What should we fix first to ship with quality?"**

Traditional prioritization: Severity (S1 > S2 > S3 > S4)
Taste prioritization: User impact (Taste-Critical > Taste-Significant > Technical-Only)

**Why taste-first?**
- A technically perfect system that feels wrong won't ship
- Users experience taste gaps directly
- Technical-only issues are invisible to users

## The Tier Algorithm

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER ALGORITHM                           │
│                                                             │
│  TIER 1: TASTE-CRITICAL                                     │
│    Failure modes traced to CRITICAL taste gaps              │
│    (gaps where floor >= 3.0)                                │
│    → Fix these first, they block ship                       │
│                                                             │
│  TIER 2: TASTE-SIGNIFICANT                                  │
│    Failure modes traced to SIGNIFICANT taste gaps           │
│    (gaps where floor < 3.0)                                 │
│    → Fix these before polish phase ends                     │
│                                                             │
│  TIER 3: TECHNICAL-ONLY                                     │
│    Failure modes with no taste trace                        │
│    Ordered by severity: S1 > S2 > S3 > S4                   │
│    → Fix if time allows, not blocking                       │
└─────────────────────────────────────────────────────────────┘
```

## Input Processing

### From TASTE-TRACE.md

Extract failure modes linked to gaps:

```yaml
TG-001 (critical):
  - P2-007 (direct)
  - P2-003 (contributing)

TG-002 (significant):
  - U2-003 (direct)
  - U1-004 (direct)
```

### From Failure Mode Files

Get all failure modes:
- PIPELINE-FAILURE-MODES.md
- UI-FAILURE-MODES.md

### Categorization

```
Tier 1: [P2-007, P2-003]        # Linked to TG-001 (critical)
Tier 2: [U2-003, U1-004]        # Linked to TG-002 (significant)
Tier 3: [U1-005, P1-007, ...]   # No taste trace
```

## Output Format

### AUDIT-REPORT.md Structure

```markdown
# Audit Report

**Project:** [name]
**Date:** [timestamp]
**Status:** POLISH_THEN_SHIP

## Ship Decision

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Taste Score | 3.38 | 3.5 | ⚠️ Below target |
| Backend Coverage | 37% | 70% | ⚠️ Below target |
| UI Coverage | 18% | 60% | ⚠️ Below target |
| Critical Gaps | 1 | 0 | ⚠️ Blocking |

## Checklist to Done (Taste-Ordered)

### Tier 1: Taste-Critical
*Fixes for critical taste gaps — must complete before ship*

| # | Item | Gap | Failure Mode | Type | Effort |
|---|------|-----|--------------|------|--------|
| 1 | Expand template pool | TG-001 | P2-007 | Backend | M |
| 2 | Add dynamic hooks | TG-001 | P2-003 | Backend | S |

**Tier 1 Impact:** Fixing these raises engagement from 2.4 → ~2.9

---

### Tier 2: Taste-Significant
*Fixes for significant taste gaps — complete before polish ends*

| # | Item | Gap | Failure Mode | Type | Effort |
|---|------|-----|--------------|------|--------|
| 3 | Add loading indicator | TG-002 | U2-003 | UI | S |
| 4 | Include change summary | TG-002 | U1-004 | UI | S |

**Tier 2 Impact:** Fixing these raises feedback_clarity from 2.8 → ~3.2

---

### Tier 3: Technical-Only
*Technical fixes with no direct taste impact — fix if time allows*

| # | Item | Severity | Failure Mode | Type | Effort |
|---|------|----------|--------------|------|--------|
| 5 | Fix cache invalidation | S1-Silent | U1-005 | UI | S |
| 6 | Validate JSON structure | S1-Silent | P1-007 | Backend | S |
| 7 | Add SSE retry | S3-Visible | U2-002 | UI | M |

**Note:** Ordered by severity (S1 first), then by type.

---

## Coverage Summary

| Category | Current | Target | Gap | Priority |
|----------|---------|--------|-----|----------|
| Taste Score | 3.38 | 3.5 | +0.12 | Address Tier 1 |
| Backend | 37% | 70% | 33 tests | Write test specs |
| UI | 18% | 60% | 23 tests | Write test specs |
| Cross | 0% | 50% | 8 tests | Write test specs |

## Recommendations

1. **Immediate:** Complete Tier 1 items (engagement gap)
2. **Before ship:** Complete Tier 2 items (feedback gap)
3. **Post-ship:** Address Tier 3 based on priority
4. **Ongoing:** Write tests per generated specs to reach coverage targets
```

## Effort Estimation

| Code | Meaning | Typical Scope |
|------|---------|---------------|
| S | Small | < 1 hour, single file |
| M | Medium | 1-4 hours, 2-5 files |
| L | Large | 4+ hours, multiple components |

## Tier Ordering Rules

### Within Tier 1
Order by:
1. Gap severity (lower score = higher priority)
2. Relationship (direct before contributing)
3. Confidence (high before medium)

### Within Tier 2
Same as Tier 1

### Within Tier 3
Order by:
1. Severity code (S1 > S2 > S3 > S4)
2. Type (Backend before UI, typically)
3. Effort (S before M before L)

## Validation

Before completing, verify:

- [ ] All traced failure modes appear in Tier 1 or 2
- [ ] All untraced failure modes appear in Tier 3
- [ ] No failure mode appears in multiple tiers
- [ ] Tier ordering follows algorithm
- [ ] Impact estimates are included for Tier 1/2
- [ ] Coverage summary is accurate
- [ ] Recommendations are actionable
