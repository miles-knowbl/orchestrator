# Evaluation Methodology

How to run quality evaluations.

## Content Evaluation Process

### 1. Sampling
Select representative outputs:
- 5-10 samples per content type
- Include variety (different topics, lengths)
- Include edge cases
- Recent outputs preferred

### 2. Blind Evaluation
If possible, evaluate without knowing source:
- Removes bias toward "our" content
- More objective scoring

### 3. Per-Dimension Scoring
For each sample, for each dimension:
1. Read/review the content
2. Apply rubric criteria
3. Assign score 1-5
4. Note specific evidence

### 4. Evidence Documentation
```yaml
sample_id: tweet-001
dimension: voice_fidelity
score: 3
evidence:
  - "Uses correct terminology"
  - "Misses signature humor"
  - "Slightly too formal"
```

### 5. Aggregation
```
Sample Score = Σ(dimension_score × dimension_weight)
Content Type Score = Average(all sample scores)
Category Score = Average(all content type scores)
```

## UX Evaluation Process

### 1. Flow Selection
Identify flows to evaluate:
- Each U-series pipeline
- Critical user journeys
- Recently changed areas

### 2. Walkthrough
For each flow:
1. Start from trigger point
2. Step through entire flow
3. At each step, assess each dimension
4. Note issues encountered

### 3. Dimension Scoring
```yaml
pipeline: U1-Chat-to-Edit
step: 5. SSE stream response
dimensions:
  responsiveness: 4  # Stream starts quickly
  feedback_clarity: 2  # No loading indicator
  error_recovery: 1  # No retry on disconnect
  state_consistency: 3  # Usually shows current
  accessibility: 4  # Keyboard accessible
```

### 4. Overall Scoring
```
Step Score = Lowest dimension score at that step
Pipeline Score = Weighted average of dimensions across steps
Overall UX = Weighted average of all pipelines
```

## Scoring Calibration

### Before Evaluating
- Review rubric definitions
- Look at example scores
- Align on edge cases

### During Evaluation
- Use half-points (3.5) for borderline
- Note uncertainty
- Don't inflate/deflate consistently

### After Evaluation
- Compare scores across evaluators
- Discuss discrepancies
- Calibrate future evaluations

## Evaluation Frequency

| Context | Frequency |
|---------|-----------|
| Initial audit | Once |
| After major changes | Each release |
| Ongoing monitoring | Monthly sample |
| Quality regression | On issue report |

## Reporting Format

```markdown
## Quality Evaluation: [Date]

### Summary
| Category | Score | Target | Status |
|----------|-------|--------|--------|
| Content | 3.4 | 3.5 | ⚠️ Gap |
| UX | 3.8 | 3.5 | ✓ Met |
| Overall | 3.6 | 3.5 | ✓ Met |

### Gaps Identified
1. voice_fidelity: 3.2 (floor 2.5) - Acceptable but needs polish
2. feedback_clarity: 2.8 (floor 3.0) - GAP

### Recommendations
1. Improve voice prompts for more personality
2. Add loading indicators to all async operations
```
