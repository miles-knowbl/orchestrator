# Checklist Template

Output format for taste-ordered checklist.

## Full Template

```markdown
## Checklist to Done (Taste-Ordered)

### Tier 1: Taste-Critical
*Fixes for critical taste gaps — must complete before ship*

| # | Item | Gap | Failure Mode | Type | Effort |
|---|------|-----|--------------|------|--------|
| 1 | [Action verb] [what to fix] | TG-NNN | XX-NNN | Backend/UI | S/M/L |

**Tier 1 Impact:** Fixing these raises [dimension] from X.X → ~Y.Y

---

### Tier 2: Taste-Significant
*Fixes for significant taste gaps — complete before polish ends*

| # | Item | Gap | Failure Mode | Type | Effort |
|---|------|-----|--------------|------|--------|
| N | [Action verb] [what to fix] | TG-NNN | XX-NNN | Backend/UI | S/M/L |

**Tier 2 Impact:** Fixing these raises [dimension] from X.X → ~Y.Y

---

### Tier 3: Technical-Only
*Technical fixes with no direct taste impact — fix if time allows*

| # | Item | Severity | Failure Mode | Type | Effort |
|---|------|----------|--------------|------|--------|
| N | [Action verb] [what to fix] | SN-Name | XX-NNN | Backend/UI | S/M/L |

**Note:** Ordered by severity (S1 first), then by type.
```

## Column Definitions

### Item
Action-oriented description:
- Start with verb: Add, Fix, Implement, Validate, Remove
- Be specific: "Add loading indicator during generation" not "Fix loading"

### Gap (Tier 1/2)
Reference to taste gap: TG-001, TG-002, etc.

### Severity (Tier 3)
Severity code with label: S1-Silent, S2-Partial, S3-Visible, S4-Blocking

### Failure Mode
Reference to failure mode: P2-007, U1-004, etc.

### Type
- Backend: Server-side code
- UI: Client-side code
- Cross: Integration points

### Effort
| Code | Time | Files | Description |
|------|------|-------|-------------|
| S | <1h | 1-2 | Simple fix |
| M | 1-4h | 2-5 | Moderate change |
| L | 4h+ | 5+ | Significant work |

## Impact Statements

After each tier, summarize impact:

**Good:**
> Fixing these raises engagement from 2.4 → ~2.9, clearing the 2.5 floor

**Bad:**
> These are important fixes

## Numbering

Continuous numbering across all tiers:
- Tier 1: #1, #2, #3
- Tier 2: #4, #5
- Tier 3: #6, #7, #8

This creates a single ordered list for execution.

## Empty Tiers

If a tier is empty, include it with note:

```markdown
### Tier 1: Taste-Critical
*No critical taste gaps identified*

All critical quality dimensions meet their floors.
```

## Summary Section

Always end with coverage summary:

```markdown
## Coverage Summary

| Category | Current | Target | Gap | Priority |
|----------|---------|--------|-----|----------|
| Taste Score | X.XX | X.X | +X.XX | [Action] |
| Backend | XX% | 70% | NN tests | [Action] |
| UI | XX% | 60% | NN tests | [Action] |
| Cross | XX% | 50% | NN tests | [Action] |
```
