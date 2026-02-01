# Eval File Format

Quality eval files (`*-QUALITY-EVALS.md`) define dimensions for taste evaluation.

## File Structure

```markdown
# [Category] Quality Evaluations

Brief description of what this category measures.

## Dimensions

### dimension_name
- **Weight:** NN%
- **Floor:** N.N
- **Description:** What this dimension measures

#### Scoring Rubric
| Score | Label | Definition |
|-------|-------|------------|
| 5 | Excellent | ... |
| 4 | Good | ... |
| 3 | Acceptable | ... |
| 2 | Poor | ... |
| 1 | Failed | ... |

#### Evidence Examples
- Score 5: "Example of excellent..."
- Score 3: "Example of acceptable..."
- Score 1: "Example of failed..."
```

## Required Fields

### dimension_name (heading)
Unique identifier, lowercase with underscores. Example: `voice_fidelity`

### Weight
Percentage weight within this category. All weights in a file should sum to 100%.

### Floor
Minimum acceptable score (1.0-5.0). Below floor = gap.

### Description
One sentence explaining what this dimension measures.

## Optional Fields

### Scoring Rubric
5-point scale with definitions. If omitted, generic rubric applies.

### Evidence Examples
Concrete examples of what each score level looks like.

## Example: CONTENT-QUALITY-EVALS.md

```markdown
# Content Quality Evaluations

Measures the quality of AI-generated content outputs.

## Dimensions

### voice_fidelity
- **Weight:** 40%
- **Floor:** 2.5
- **Description:** Generated content matches the intended voice and persona

#### Scoring Rubric
| Score | Label | Definition |
|-------|-------|------------|
| 5 | Excellent | Indistinguishable from human-written content in target voice |
| 4 | Good | Clearly in target voice with minor inconsistencies |
| 3 | Acceptable | Generally correct voice but occasionally generic |
| 2 | Poor | Voice is inconsistent or often wrong |
| 1 | Failed | No resemblance to target voice |

### topic_relevance
- **Weight:** 35%
- **Floor:** 3.0
- **Description:** Content addresses the intended topic accurately

### engagement
- **Weight:** 25%
- **Floor:** 2.5
- **Description:** Content is interesting and holds attention
```

## Example: UX-QUALITY-EVALS.md

```markdown
# UX Quality Evaluations

Measures the user experience of the application.

## Dimensions

### responsiveness
- **Weight:** 25%
- **Floor:** 3.0
- **Description:** UI responds quickly to user actions

### feedback_clarity
- **Weight:** 25%
- **Floor:** 3.0
- **Description:** Loading, success, and error states are clear

### error_recovery
- **Weight:** 20%
- **Floor:** 2.5
- **Description:** Users can recover from errors easily

### state_consistency
- **Weight:** 20%
- **Floor:** 2.5
- **Description:** UI always shows current state

### accessibility
- **Weight:** 10%
- **Floor:** 3.0
- **Description:** Keyboard nav, screen reader, contrast
```

## Parsing Rules

1. Dimension names: Extract from `### name` headings under `## Dimensions`
2. Weight: Parse percentage from `**Weight:** NN%`
3. Floor: Parse float from `**Floor:** N.N`
4. Description: First line after `**Description:**`
5. Category: Derive from filename (CONTENT-QUALITY → content)
