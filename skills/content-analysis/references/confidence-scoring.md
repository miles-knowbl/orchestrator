# Confidence Scoring Reference

Detailed rubrics for assigning confidence scores to every extracted element.
Every extraction must carry a score. This reference ensures scores are calibrated, justified, and comparable.

## Scoring Dimensions

Each confidence score is a weighted composite of three dimensions.

### Dimension 1: Evidence Strength (Weight: 40%)

How directly does the source content support this extraction?

| Score | Label | Criteria | Example |
|-------|-------|----------|---------|
| 1.0 | Verbatim | Direct quote or formal definition present | Source says: "The timeout is 30 seconds" |
| 0.8 | Explicit | Clearly stated, minor paraphrasing needed | Source explains the concept in a full paragraph |
| 0.6 | Implied | Logically follows from stated content | Source describes behavior that implies a design principle |
| 0.4 | Inferred | Requires connecting multiple passages | Two sections together suggest a pattern |
| 0.2 | Analogized | Based on similarity to stated content | Source discusses X; extraction generalizes to Y |
| 0.0 | Absent | No supporting evidence in source | Pure speculation |

### Dimension 2: Specificity (Weight: 35%)

How precise and unambiguous is the extracted knowledge?

| Score | Label | Criteria | Example |
|-------|-------|----------|---------|
| 1.0 | Exact | Precise values, names, or definitions | "Use port 8080 with TLS 1.3" |
| 0.8 | Specific | Clear scope with minor ambiguity | "Configure the database connection pool" |
| 0.6 | Scoped | General topic with bounded applicability | "Caching improves read-heavy workloads" |
| 0.4 | Broad | Applies to a wide domain, limited precision | "Performance matters for user experience" |
| 0.2 | Vague | Unclear scope, multiple interpretations possible | "Consider the architecture carefully" |
| 0.0 | Undefined | No discernible specific meaning | Content too ambiguous to extract |

### Dimension 3: Actionability (Weight: 25%)

Can someone act on this extraction without additional research?

| Score | Label | Criteria | Example |
|-------|-------|----------|---------|
| 1.0 | Executable | Complete steps, ready to follow | Full procedure with all parameters specified |
| 0.8 | Near-complete | Minor details need filling in | Procedure with project-specific values as placeholders |
| 0.6 | Directional | Points toward action, needs elaboration | "Use a queue between the services" (which queue? what config?) |
| 0.4 | Suggestive | Hints at an approach without specifics | "Consider asynchronous processing" |
| 0.2 | Awareness | Informs thinking but not action | "Distributed systems have consistency tradeoffs" |
| 0.0 | Inert | No actionable content | Pure background context |

## Composite Score Calculation

```
confidence = (evidence_strength * 0.40) + (specificity * 0.35) + (actionability * 0.25)
```

Round to two decimal places. Always report the composite and the three sub-scores.

**Format:** `0.72 (evidence: 0.8 / specificity: 0.6 / actionability: 0.8)`

## Calibration Examples

### Score 0.95 --- Definitive
**Extraction:** "The API rate limit is 100 requests per minute per API key."
**Scoring:** evidence=1.0 (verbatim quote), specificity=1.0 (exact values), actionability=0.8 (actionable with API key)
**Composite:** (1.0 * 0.4) + (1.0 * 0.35) + (0.8 * 0.25) = 0.95

### Score 0.78 --- Strong
**Extraction:** "Use retry with exponential backoff when calling external services."
**Scoring:** evidence=0.8 (explicit recommendation), specificity=0.8 (clear technique), actionability=0.6 (needs implementation details)
**Composite:** (0.8 * 0.4) + (0.8 * 0.35) + (0.6 * 0.25) = 0.78

### Score 0.61 --- Moderate
**Extraction:** "The team prefers event-driven architecture for new services."
**Scoring:** evidence=0.6 (implied from multiple examples), specificity=0.6 (scoped to new services), actionability=0.6 (directional)
**Composite:** (0.6 * 0.4) + (0.6 * 0.35) + (0.6 * 0.25) = 0.60

### Score 0.44 --- Tentative
**Extraction:** "Performance testing should happen before major releases."
**Scoring:** evidence=0.4 (inferred from a postmortem), specificity=0.6 (scoped to releases), actionability=0.4 (suggestive only)
**Composite:** (0.4 * 0.4) + (0.6 * 0.35) + (0.4 * 0.25) = 0.47

### Score 0.25 --- Weak
**Extraction:** "The system may benefit from a service mesh."
**Scoring:** evidence=0.2 (analogized from a different context), specificity=0.4 (broad), actionability=0.2 (awareness only)
**Composite:** (0.2 * 0.4) + (0.4 * 0.35) + (0.2 * 0.25) = 0.27

## Score Adjustments

Apply these after computing the raw composite. Document every adjustment.

| Adjustment | Condition | Effect | Justification Required |
|------------|-----------|--------|----------------------|
| Corroboration boost | Same finding in 2+ independent sections | +0.10 | Cite both sections |
| Repetition boost | Same finding stated 3+ times | +0.05 | Cite occurrences (weaker than corroboration; repetition may reflect emphasis, not independence) |
| Contradiction penalty | Source content contradicts this extraction elsewhere | -0.15 | Cite the contradicting passage |
| Ambiguity penalty | Source uses hedging language ("might", "could", "sometimes") | -0.10 | Quote the hedging phrase |
| Authority boost | Source is an authoritative reference for this domain | +0.05 | State the authority basis |
| Staleness penalty | Content is dated and domain evolves rapidly | -0.10 | State the content age and domain volatility |
| Incomplete context penalty | Extraction requires context not present in source | -0.10 | Describe the missing context |

**Adjustment cap:** Final score must remain in [0.0, 1.0]. Adjustments never push past these bounds.

## Edge Case Rules

### When evidence is strong but actionability is zero
Score the composite normally. An informational extraction (e.g., a historical fact) can have high confidence even if there is nothing to "do" with it. The actionability dimension simply receives a low sub-score.

### When the source contradicts itself
Extract both positions. Each gets a contradiction penalty (-0.15). Add a cross-reference noting the conflict. Neither extraction should exceed 0.7 unless one position has substantially more evidence.

### When content is opinion from an authority
Classify as opinion in the taxonomy. Score evidence normally (the opinion IS the content). Add a note: "Scored as stated opinion, not verified claim." Do not apply authority boost to opinion content.

### When a single source states something definitively but it is domain-controversial
Cap at 0.85. Add note: "Single-source definitive statement in contested domain. Corroboration from independent sources would raise confidence."

### When extraction combines multiple source passages
Score evidence based on the weakest passage required for the extraction to hold. If removing any one passage would invalidate the extraction, that passage's evidence level is the ceiling.

## Reporting Format

Every scored extraction must include:

```markdown
**Confidence:** 0.XX (evidence: X.X / specificity: X.X / actionability: X.X)
**Adjustments:** [+/-0.XX reason] or "None"
**Evidence:** [source location]: "[brief excerpt]"
```
