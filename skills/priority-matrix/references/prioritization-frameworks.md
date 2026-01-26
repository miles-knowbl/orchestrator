# Prioritization Frameworks Reference

Detailed framework implementations for the Priority Matrix skill. Select the framework that fits your context, then apply its specific formulas and scoring approach.

## Framework Comparison Matrix

| Framework | Inputs Required | Precision | Speed | Best Team Size | Quantitative? |
|-----------|----------------|-----------|-------|----------------|---------------|
| **Weighted Scoring** | Custom dimensions + weights | High | Slow | Any | Yes |
| **RICE** | Reach, impact, confidence, effort | High | Medium | Product teams | Yes |
| **ICE** | Impact, confidence, ease | Medium | Fast | Small teams | Yes |
| **MoSCoW** | Bucket classification | Low | Fast | Any | No |
| **Eisenhower** | Urgency + importance classification | Low | Very fast | Individual/small | No |
| **Cost of Delay** | Value rate, time criticality, risk | Very high | Slow | Strategic teams | Yes |

## Framework Details

### Weighted Scoring

**Formula:** `Score = SUM(dimension_score * dimension_weight)`

Setup: Define 3-6 dimensions, assign weights summing to 100%, create 1-10 rubrics, score all options.

**Example:**

| Option | Impact (30%) | Effort (25%) | Urgency (25%) | Alignment (20%) | Final |
|--------|-------------|-------------|---------------|-----------------|-------|
| Auth overhaul | 9 * 0.30 = 2.70 | 4 * 0.25 = 1.00 | 7 * 0.25 = 1.75 | 8 * 0.20 = 1.60 | **7.05** |
| Search feature | 7 * 0.30 = 2.10 | 8 * 0.25 = 2.00 | 5 * 0.25 = 1.25 | 9 * 0.20 = 1.80 | **7.15** |

**Strengths:** Fully customizable, transparent, stakeholder-friendly.
**Weaknesses:** Weight selection is subjective, slower for large option sets.

### RICE

**Formula:** `RICE Score = (Reach * Impact * Confidence) / Effort`

| Dimension | How to Measure | Scale |
|-----------|---------------|-------|
| Reach | Users or events affected per quarter | Raw number (100, 1000, 10000) |
| Impact | Degree of effect per person | 0.25 = minimal, 0.5 = low, 1 = medium, 2 = high, 3 = massive |
| Confidence | Certainty in estimates | 50% = speculative, 80% = reasonable, 100% = data-backed |
| Effort | Person-months to complete | Raw number (0.5, 1, 3, 6) |

**Example calculation:**

| Option | Reach | Impact | Confidence | Effort | RICE Score |
|--------|-------|--------|------------|--------|------------|
| Onboarding flow | 3000 | 2 | 80% | 2 | **2400** |
| Dashboard redesign | 5000 | 1 | 100% | 4 | **1250** |
| API v2 | 800 | 3 | 50% | 3 | **400** |

**Strengths:** Forces quantitative thinking, separates confidence from impact.
**Weaknesses:** Requires reach data, less useful for internal/infrastructure work.

### ICE

**Formula:** `ICE Score = Impact * Confidence * Ease` (each on 1-10 scale)

**Example calculation:**

| Option | Impact | Confidence | Ease | ICE Score |
|--------|--------|------------|------|-----------|
| Quick win A | 6 | 9 | 9 | **486** |
| Big bet B | 10 | 4 | 3 | **120** |
| Safe bet C | 5 | 8 | 7 | **280** |

**Strengths:** Fast to apply, easy to explain, good for rapid first-pass.
**Weaknesses:** Multiplicative formula amplifies scoring inconsistencies.

### MoSCoW

**Categories (not scores):**

| Category | Definition | Decision Rule |
|----------|-----------|---------------|
| **Must** | Non-negotiable for this release/milestone | Without it, the release fails or is pointless |
| **Should** | Important but the release still works without it | Painful to omit but not fatal |
| **Could** | Desirable, include if resources permit | Nice to have, no material impact if omitted |
| **Won't** | Explicitly out of scope for this cycle | Acknowledged and deferred, not forgotten |

**Application rule:** Musts should not exceed 60% of capacity. If they do, scope is too large.

**Strengths:** Simple, great for scope negotiation, non-technical stakeholders understand it.
**Weaknesses:** No granularity within categories, no ranking within Must.

### Eisenhower Matrix

**Two dimensions, four quadrants:**

|  | **Urgent** | **Not Urgent** |
|--|-----------|----------------|
| **Important** | Q1: Do immediately | Q2: Schedule deliberately |
| **Not Important** | Q3: Delegate or timebox | Q4: Eliminate |

**Application:** Classify each option into one quadrant, then work Q1 first, invest in Q2, minimize Q3, eliminate Q4.

**Strengths:** Cuts noise fast, forces importance vs. urgency distinction.
**Weaknesses:** Binary classification loses nuance, no ranking within quadrants.

### Cost of Delay

**Formula:** `CD3 Score = Cost of Delay / Duration`

Cost of Delay is composed of three elements:

| Element | Question | Scale |
|---------|----------|-------|
| **User/Business Value** | How much value does this deliver? | 1-10 |
| **Time Criticality** | How much does value decay with delay? | 1-10 |
| **Risk Reduction** | How much risk does this retire? | 1-10 |

`Cost of Delay = User Value + Time Criticality + Risk Reduction`
`CD3 = Cost of Delay / Duration (in weeks)`

**Example:**

| Option | Value | Time Crit. | Risk Red. | CoD | Duration | CD3 |
|--------|-------|-----------|-----------|-----|----------|-----|
| Compliance fix | 4 | 10 | 9 | 23 | 2 weeks | **11.5** |
| New feature | 9 | 3 | 1 | 13 | 6 weeks | **2.2** |
| Infra upgrade | 6 | 5 | 7 | 18 | 4 weeks | **4.5** |

**Strengths:** Captures time sensitivity, optimal for sequencing decisions.
**Weaknesses:** Requires duration estimates, harder to explain to non-technical stakeholders.

## Framework Selection Decision Tree

Answer these questions in order to select a framework:

1. **Do you need a quick triage?** (under 30 minutes, fewer than 8 options)
   - Yes, and options are tasks/work items --> **Eisenhower**
   - Yes, and options are features/initiatives --> **ICE**

2. **Are you negotiating scope for a fixed deadline?**
   - Yes --> **MoSCoW**

3. **Do you have user reach data and a product team?**
   - Yes --> **RICE**

4. **Are options time-sensitive with varying urgency?**
   - Yes --> **Cost of Delay (CD3)**

5. **None of the above, or mixed option types?**
   - --> **Weighted Scoring** (customize dimensions to fit)

## Combining Frameworks

For complex prioritization, use a two-pass approach: MoSCoW or Eisenhower first to eliminate non-starters, then RICE, Weighted Scoring, or Cost of Delay to rank within the "Must" / "Do" categories. This avoids wasting detailed scoring effort on options that are clearly out of scope.
