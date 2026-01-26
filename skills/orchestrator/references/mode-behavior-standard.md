# Mode-Specific Behavior Standard

This document defines the standard structure for mode-specific behavior sections across all skills.

## Standard Template

Every skill with mode-specific behavior MUST use this structure:

```markdown
## Mode-Specific Behavior

[Skill name] behavior differs by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | [What this skill operates on] |
| **Approach** | [Full/comprehensive/from-scratch] |
| **Patterns** | [Free choice / establish new] |
| **Deliverables** | [Full artifacts] |
| **Validation** | [Standard validation] |
| **Constraints** | [Minimal constraints] |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | [Gap-specific + integration points] |
| **Approach** | [Gap-focused / extend existing] |
| **Patterns** | [Should match existing patterns] |
| **Deliverables** | [Delta / extension artifacts] |
| **Validation** | [Existing + gap validation] |
| **Constraints** | [Must not break existing] |

**Polish considerations:**
- [Bullet point guidance specific to this skill in polish mode]

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | [Change-specific only] |
| **Approach** | [Surgical / minimal / change-only] |
| **Patterns** | [Must conform exactly to existing] |
| **Deliverables** | [Change documentation only] |
| **Validation** | [Full regression + change validation] |
| **Constraints** | [Requires approval / audit trail] |

**Enterprise constraints:**
- [Bullet point constraints specific to this skill in enterprise mode]
```

## Standard Aspects (Required)

| Aspect | Definition | Greenfield Default | Polish Default | Enterprise Default |
|--------|------------|-------------------|----------------|-------------------|
| **Scope** | What the skill operates on | Full system | Gap-specific | Change-specific |
| **Approach** | How to execute | Comprehensive | Extend existing | Surgical/minimal |
| **Patterns** | Pattern conformance level | Free choice | Should match existing | Must conform exactly |
| **Deliverables** | What artifacts to produce | Full artifacts | Delta artifacts | Change record |
| **Validation** | How to verify correctness | Standard | Existing + new | Full regression |
| **Constraints** | Mode-specific restrictions | Minimal | Don't break existing | Requires approval |

## Terminology Standards

### Pattern Conformance
- **Greenfield:** "Free choice based on requirements"
- **Polish:** "Should match existing patterns"
- **Enterprise:** "Must conform exactly to existing"

### Risk/Tolerance
- **Greenfield:** "Standard"
- **Polish:** "Moderate—existing functionality at risk"
- **Enterprise:** "Minimal—production critical"

### Validation vs Verification
- **Validation:** Semantic correctness (did we build the right thing?)
- **Verification:** Structural correctness (did we build it right?)
- Use "Validation" in mode-specific tables for consistency

### Approval Language
- **Greenfield:** "Standard review"
- **Polish:** "Review required"
- **Enterprise:** "Requires explicit approval"

## Section Structure

### After Tables
- **Greenfield:** No additional section needed (or brief note)
- **Polish:** "**Polish considerations:**" with 3-5 bullet points
- **Enterprise:** "**Enterprise constraints:**" with 3-5 bullet points

### Depth Balance
Each mode section should have approximately equal depth:
- Table: 6 rows (standard aspects)
- Post-table content: 3-5 bullet points or equivalent

## Skills Without Mode-Specific Behavior

The following skills intentionally omit mode-specific behavior:

| Skill | Reason |
|-------|--------|
| `orchestrator` | Determines the mode; runs before mode is known |
| `mode-detector` | Detects the mode; runs before mode is known |

These skills should include this note:
```markdown
> **Note:** This skill does not have mode-specific behavior because it operates before or during mode detection.
```
