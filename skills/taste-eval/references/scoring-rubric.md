# Scoring Rubric

Consistent methodology for scoring taste dimensions.

## The 5-Point Scale

| Score | Label | General Definition |
|-------|-------|---------------------|
| 5 | Excellent | Exceeds expectations; delightful; would showcase |
| 4 | Good | Meets expectations; works well; minor polish needed |
| 3 | Acceptable | Functional; has rough edges; gets the job done |
| 2 | Poor | Below expectations; frustrating; needs work |
| 1 | Failed | Does not meet basic requirements; broken |

## Scoring Principles

### 1. Evidence-Based
Every score must have observable evidence:
- Code behavior
- Output samples
- User flow observations
- Error scenarios tested

**Bad:** "Voice feels off" (no specifics)
**Good:** "Generated tweets use formal language when casual is expected; 'utilize' instead of 'use'"

### 2. Relative to Floor
Scores are absolute (1-5), but gaps are relative to floor:
- Score 3.0 with floor 2.5 = Acceptable
- Score 3.0 with floor 3.5 = Gap

### 3. Half-Point Precision
Use 0.5 increments for nuance:
- 4.5 = Between good and excellent
- 2.5 = Between poor and acceptable

### 4. Dimension-Specific
Apply the dimension's specific rubric if defined, otherwise use general scale.

## Scoring Process

```
1. Gather evidence (3-5 observations minimum)
2. Map observations to rubric levels
3. Determine predominant level
4. Adjust ±0.5 based on balance of evidence
5. Document score with key evidence
```

## Example: Scoring voice_fidelity

**Evidence gathered:**
- Tweet samples show 70% tone match
- Formal words appear occasionally
- Emoji usage matches target persona
- Hashtag style is inconsistent
- Opening hooks are strong

**Mapping:**
- 70% tone match → 3-4 range
- Occasional formal words → -0.5
- Emoji match → +0.5
- Inconsistent hashtags → -0.5
- Strong hooks → +0.5

**Score:** 3.5 (acceptable-to-good, weighted toward acceptable)

## Handling Edge Cases

### Can't Evaluate
If dimension cannot be evaluated:
```yaml
dimension: brand_consistency
score: null
status: N/A
reason: "No brand guidelines available for comparison"
```

### Insufficient Evidence
If less than 3 observations:
```yaml
dimension: accessibility
score: 3.0
confidence: low
note: "Limited testing; score based on 2 observations"
```

### Conflicting Evidence
If evidence points different directions:
```yaml
dimension: engagement
score: 3.0
note: "Mixed evidence: hooks are strong (4) but body is weak (2)"
```
