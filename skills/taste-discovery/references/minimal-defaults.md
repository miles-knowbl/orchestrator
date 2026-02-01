# Minimal Defaults

When no project-specific taste evaluations are found, apply these minimal defaults.

## Default Dimensions

| Dimension | Category | Weight | Floor | Description |
|-----------|----------|--------|-------|-------------|
| usability | ux | 35% | 2.5 | Can users accomplish their goals? |
| responsiveness | ux | 25% | 2.5 | Does UI respond quickly to actions? |
| reliability | ux | 25% | 2.5 | Does the system work consistently? |
| accessibility | ux | 15% | 2.5 | Keyboard nav, screen reader support, contrast |

## Default Quality Gates

| Gate | Threshold | Meaning |
|------|-----------|---------|
| Ship | ≥ 3.5 | Ready to ship |
| Polish | 2.5 - 3.5 | Polish then ship |
| Fix | < 2.5 | Fix before ship |

## Scoring Rubric (Generic)

| Score | Label | Definition |
|-------|-------|------------|
| 5 | Excellent | Exceeds expectations, delightful |
| 4 | Good | Meets expectations with minor issues |
| 3 | Acceptable | Functional but has rough edges |
| 2 | Poor | Frustrating or confusing |
| 1 | Failed | Broken or unusable |

## When to Use Defaults

Defaults apply when:
1. No `.claude/taste-manifest.json` exists
2. No `TASTE-EVALS.md` exists
3. No `*-QUALITY-EVALS.md` files exist

## Limitations

Defaults are intentionally minimal:
- Only cover UX basics
- Don't include content quality
- Don't include domain-specific criteria

**Recommendation:** Always create project-specific evals for meaningful audits.

## Upgrade Path

To upgrade from defaults:

1. **Quick start:** Create `TASTE-EVALS.md` with custom dimensions
2. **Organized:** Create separate `*-QUALITY-EVALS.md` files per category
3. **Full control:** Create `.claude/taste-manifest.json` with explicit configuration
