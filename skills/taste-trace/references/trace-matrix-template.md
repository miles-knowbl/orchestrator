# Trace Matrix Template

Output format for taste-to-failure-mode traces.

## Summary Matrix

```markdown
## Trace Summary

| Gap ID | Dimension | Score | Direct Causes | Contributing | Untraced |
|--------|-----------|-------|---------------|--------------|----------|
| TG-001 | engagement | 2.4 | P2-007 | P2-003 | - |
| TG-002 | feedback_clarity | 2.8 | U2-003, U1-004 | - | - |
| TG-003 | brand_voice | 2.6 | - | - | No tech cause |
```

## Detailed Trace Entry

```markdown
### TG-001: engagement (CRITICAL)

**Gap Details:**
| Attribute | Value |
|-----------|-------|
| Category | content |
| Dimension | engagement |
| Score | 2.4 |
| Floor | 2.5 |
| Delta | -0.1 |

**Evidence:**
- Content lacks compelling hooks
- Structure becomes repetitive after 3 generations
- Limited variety in openings

**Traced Failure Modes:**

| ID | Description | Relationship | Confidence | Est. Impact |
|----|-------------|--------------|------------|-------------|
| P2-007 | Limited template pool (3) | Direct | High | +0.3 |
| P2-003 | Static hook patterns | Contributing | Medium | +0.2 |

**Trace Reasoning:**

**P2-007 → TG-001:**
The template_select() function in generate.ts:142 uses a hardcoded array of 3 templates. With high generation volume, users see repetition within 4-5 outputs. Expanding the template pool would directly reduce repetition.

**P2-003 → TG-001:**
Hook generation in hooks.ts:78 uses 5 static patterns. While not the primary cause of low engagement, more dynamic hooks would improve the "lacks compelling hooks" symptom.

**Projected Impact:**
- Current score: 2.4
- After P2-007 fix: ~2.7
- After both fixes: ~2.9
- Target (floor): 2.5 ✓
```

## Reverse Trace (Failure Mode → Gaps)

Also useful for understanding failure mode priority:

```markdown
## Failure Mode Impact Summary

| Failure Mode | Gaps Affected | Total Impact |
|--------------|---------------|--------------|
| P2-007 | TG-001 (direct) | High priority |
| U2-003 | TG-002 (direct) | High priority |
| P2-003 | TG-001 (contrib) | Medium priority |
| U1-005 | None | Low priority (Tier 3) |
```

## Untraced Sections

```markdown
## Gaps Without Technical Cause

| Gap ID | Dimension | Reason |
|--------|-----------|--------|
| TG-003 | brand_voice | Content issue, not technical |

## Failure Modes Without Taste Impact

| ID | Description | Note |
|----|-------------|------|
| U1-005 | Cache invalidation | Silent failure, internal only |
| P1-007 | JSON validation | Data quality, not user-facing |

These go to Tier 3 in the final checklist (technical-only).
```
