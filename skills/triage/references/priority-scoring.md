# Priority Scoring Worksheets

Standardized scoring templates for prioritizing work items in the system queue.

## Purpose

This reference provides:
- Scoring worksheets for multiple prioritization frameworks
- Calibration guidance for consistent scoring
- Examples and edge cases
- Decision matrices for framework selection

Use these worksheets when triaging work to ensure consistent, defensible prioritization decisions.

---

## Framework Selection Guide

Before scoring, choose the right framework:

| Situation | Recommended Framework | Why |
|-----------|----------------------|-----|
| New domain, many systems | Dependency-First + WSJF | Build foundations, then value |
| Fixed deadline MVP | MoSCoW | Clear must/should boundaries |
| Ongoing backlog | RICE | Quantitative comparison |
| Mixed urgent/important | Eisenhower | Clear action categories |
| Capacity-constrained | WSJF | Maximize value per effort |
| Risk-heavy project | Risk-Adjusted WSJF | Factor uncertainty |

---

## WSJF (Weighted Shortest Job First) Worksheet

### The Formula

```
WSJF Score = (Business Value + Time Criticality + Risk Reduction) / Effort
```

Higher scores = higher priority.

### Scoring Scale Definitions

#### Business Value (1-10)

| Score | Meaning | Examples |
|-------|---------|----------|
| 1-2 | Minimal value | Minor convenience, nice-to-have |
| 3-4 | Low value | Small efficiency gain, limited users |
| 5-6 | Medium value | Meaningful improvement, moderate impact |
| 7-8 | High value | Significant revenue/savings, many users |
| 9-10 | Critical value | Core business function, strategic imperative |

**Calibration questions:**
- How much revenue does this generate or protect?
- How many users benefit?
- How strategic is this for the business?
- What's the cost of NOT doing this?

#### Time Criticality (1-10)

| Score | Meaning | Examples |
|-------|---------|----------|
| 1-2 | No urgency | Can wait indefinitely |
| 3-4 | Low urgency | Would be nice soon |
| 5-6 | Medium urgency | Should do this quarter |
| 7-8 | High urgency | External deadline approaching |
| 9-10 | Critical urgency | Must complete by specific date |

**Calibration questions:**
- Is there a hard deadline?
- Is there a market window closing?
- Are competitors moving?
- Does delay compound problems?

#### Risk Reduction / Opportunity Enablement (1-10)

| Score | Meaning | Examples |
|-------|---------|----------|
| 1-2 | No risk reduction | Doesn't address uncertainty |
| 3-4 | Minor risk reduction | Slightly reduces unknowns |
| 5-6 | Moderate risk reduction | Validates assumptions |
| 7-8 | Significant risk reduction | Proves/disproves key hypothesis |
| 9-10 | Critical risk reduction | Eliminates existential risk |

**Calibration questions:**
- Does this reduce technical uncertainty?
- Does this validate market/user assumptions?
- Does this unlock future decisions?
- Does this prevent future rework?

#### Effort (1-10)

| Score | Meaning | Duration | Team Size |
|-------|---------|----------|-----------|
| 1-2 | Minimal | Hours to 1 day | 1 person |
| 3-4 | Small | 2-5 days | 1 person |
| 5-6 | Medium | 1-2 weeks | 1-2 people |
| 7-8 | Large | 3-4 weeks | 2-3 people |
| 9-10 | XL | 1+ months | Team effort |

**Calibration questions:**
- How many person-days of work?
- How many people needed?
- What's the coordination overhead?
- What unknowns affect estimate?

### WSJF Scoring Template

```markdown
## WSJF Scoring: [Project/Sprint Name]

Date: YYYY-MM-DD
Scorer: [Name]

### Items to Score

| ID | Item | Value | Time | Risk | Effort | WSJF | Rank |
|----|------|-------|------|------|--------|------|------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

### Scoring Notes

#### [Item 1]
- Value rationale:
- Time rationale:
- Risk rationale:
- Effort rationale:

#### [Item 2]
- Value rationale:
- Time rationale:
- Risk rationale:
- Effort rationale:

### Final Priority Order

1. [Item] (WSJF: X.XX)
2. [Item] (WSJF: X.XX)
3. [Item] (WSJF: X.XX)

### Decisions / Discussion Notes

[Notes from scoring session]
```

### WSJF Example: Field Service Systems

| ID | System | Value | Time | Risk | Effort | WSJF | Rank |
|----|--------|-------|------|------|--------|------|------|
| 1 | Auth Service | 8 | 7 | 9 | 5 | 4.8 | 1 |
| 2 | Work Orders | 9 | 6 | 6 | 7 | 3.0 | 3 |
| 3 | Mobile App | 8 | 5 | 4 | 9 | 1.9 | 5 |
| 4 | Route Optimization | 7 | 4 | 5 | 8 | 2.0 | 4 |
| 5 | Reporting Dashboard | 5 | 3 | 3 | 4 | 2.75 | 2 |

**Analysis:**
- Auth Service scores highest due to critical risk reduction (enables everything else)
- Reporting Dashboard second due to low effort (quick win)
- Mobile App last despite high value due to large effort

---

## RICE Scoring Worksheet

### The Formula

```
RICE Score = (Reach x Impact x Confidence) / Effort
```

Higher scores = higher priority.

### Scoring Scale Definitions

#### Reach (number per time period)

Estimate the number of users/customers affected in a defined time period (typically per quarter):

| Scale | Description |
|-------|-------------|
| Actual numbers | Use real data: 100, 500, 1000, 5000 users |
| Orders of magnitude | When uncertain: 10, 100, 1000 |

**Calibration questions:**
- How many users will this touch per quarter?
- Is reach limited or universal?
- Does reach grow over time?

#### Impact (0.25 to 3)

| Score | Meaning | User Reaction |
|-------|---------|---------------|
| 3 | Massive | "This changes everything" |
| 2 | High | "This is a significant improvement" |
| 1 | Medium | "This is nice to have" |
| 0.5 | Low | "Meh, I barely notice" |
| 0.25 | Minimal | "Did something change?" |

**Calibration questions:**
- How much does this improve the user's life?
- Does this solve a real pain point?
- How often will users benefit?

#### Confidence (0-100%)

| Score | Meaning | Evidence |
|-------|---------|----------|
| 100% | Certain | Hard data, proven pattern |
| 80% | High | Strong evidence, similar examples |
| 50% | Medium | Some evidence, reasonable assumptions |
| 20% | Low | Speculation, gut feel |

**Calibration questions:**
- How certain are the reach estimates?
- How proven is the impact hypothesis?
- What evidence supports this score?

#### Effort (person-months)

| Score | Description |
|-------|-------------|
| 0.5 | A few days |
| 1 | About a month |
| 2 | Two months |
| 3+ | Quarter or more |

Use actual person-month estimates, not abstract scales.

### RICE Scoring Template

```markdown
## RICE Scoring: [Project/Sprint Name]

Date: YYYY-MM-DD
Scorer: [Name]
Time Period: [Quarter/Month for Reach]

### Items to Score

| ID | Item | Reach | Impact | Confidence | Effort | RICE | Rank |
|----|------|-------|--------|------------|--------|------|------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

### Scoring Rationale

#### [Item 1]
- Reach: [Number] users/[period] because [reason]
- Impact: [0.25-3] because [reason]
- Confidence: [%] because [evidence]
- Effort: [person-months] because [breakdown]

#### [Item 2]
- Reach:
- Impact:
- Confidence:
- Effort:

### Final Priority Order

1. [Item] (RICE: XXXX)
2. [Item] (RICE: XXXX)
3. [Item] (RICE: XXXX)

### Assumptions & Risks

[Document key assumptions that affect scores]
```

### RICE Example: Product Features

| ID | Feature | Reach | Impact | Confidence | Effort | RICE | Rank |
|----|---------|-------|--------|------------|--------|------|------|
| 1 | Dark mode | 5000 | 1 | 80% | 1 | 4000 | 2 |
| 2 | Export to CSV | 2000 | 2 | 90% | 0.5 | 7200 | 1 |
| 3 | AI suggestions | 1000 | 3 | 30% | 3 | 300 | 4 |
| 4 | Mobile app | 3000 | 2 | 60% | 4 | 900 | 3 |

**Analysis:**
- CSV Export wins due to high confidence and low effort
- AI suggestions scores poorly due to low confidence despite high impact
- Mobile app moderate score despite high reach due to large effort

---

## MoSCoW Worksheet

### Category Definitions

| Category | Definition | Rule |
|----------|------------|------|
| **Must** | Without this, the release fails | Non-negotiable |
| **Should** | Important, but release can happen without | High priority |
| **Could** | Nice to have if time permits | Opportunistic |
| **Won't** | Explicitly not in this release | Documented defer |

### MoSCoW Decision Guide

Ask these questions in order:

```
1. "If we ship without this, is the release a failure?"
   YES → Must Have
   NO → Continue to 2

2. "Would important users be significantly disappointed without this?"
   YES → Should Have
   NO → Continue to 3

3. "Would this be a pleasant surprise for users?"
   YES → Could Have
   NO → Won't Have (or remove from list)
```

### MoSCoW Scoring Template

```markdown
## MoSCoW Classification: [Release Name]

Date: YYYY-MM-DD
Release Target: YYYY-MM-DD
Classifier: [Name]

### Must Have (Non-Negotiable)

| Item | Why Must Have | Risk if Missing |
|------|--------------|-----------------|
| | | |
| | | |

### Should Have (Important)

| Item | Why Should Have | Trade-off Notes |
|------|-----------------|-----------------|
| | | |
| | | |

### Could Have (Nice to Have)

| Item | Value if Included | Effort |
|------|-------------------|--------|
| | | |
| | | |

### Won't Have (This Release)

| Item | Why Deferred | Target Release |
|------|--------------|----------------|
| | | |
| | | |

### Capacity Check

- Estimated capacity: [X person-days]
- Must Have total: [X person-days] (should be < 60% of capacity)
- Should Have total: [X person-days]
- Could Have total: [X person-days]

### Risk Assessment

- What if Must Haves take longer than expected?
- Which Should Haves drop first?
- Any dependencies between categories?
```

### MoSCoW Example: MVP Release

**Must Have:**
| Item | Why Must Have | Risk if Missing |
|------|--------------|-----------------|
| User authentication | No access without it | Complete failure |
| Work order CRUD | Core value proposition | No product |
| Basic assignment | Primary use case | Unusable |

**Should Have:**
| Item | Why Should Have | Trade-off Notes |
|------|-----------------|-----------------|
| Email notifications | Users expect updates | Manual check workaround |
| Status history | Audit trail important | Can add post-launch |
| Search functionality | Usability at scale | Filter workaround |

**Could Have:**
| Item | Value if Included | Effort |
|------|-------------------|--------|
| Dark mode | User preference | 2 days |
| Export to PDF | Convenience | 3 days |
| Keyboard shortcuts | Power users | 1 day |

**Won't Have:**
| Item | Why Deferred | Target Release |
|------|--------------|----------------|
| Mobile app | Large effort | v2.0 |
| Route optimization | Complex, uncertain | v2.0 |
| Third-party integrations | Requires partnerships | v1.5 |

---

## Eisenhower Matrix Worksheet

### Quadrant Definitions

| Quadrant | Urgent | Important | Action |
|----------|--------|-----------|--------|
| Q1 | Yes | Yes | Do First |
| Q2 | No | Yes | Schedule |
| Q3 | Yes | No | Delegate/Quick |
| Q4 | No | No | Eliminate |

### Classification Questions

**Is it Urgent?**
- Is there a deadline in the next week?
- Is someone blocked waiting for this?
- Will delay cause cascading problems?
- Is there external pressure?

**Is it Important?**
- Does this move us toward our goals?
- Does this affect many users or key users?
- Does this have lasting impact?
- Would a senior leader care about this?

### Eisenhower Scoring Template

```markdown
## Eisenhower Classification: [Sprint/Week]

Date: YYYY-MM-DD
Classifier: [Name]

### Q1: Do First (Urgent + Important)

| Item | Why Urgent | Why Important | Target |
|------|------------|---------------|--------|
| | | | |
| | | | |

### Q2: Schedule (Not Urgent + Important)

| Item | Why Important | Scheduled For |
|------|---------------|---------------|
| | | |
| | | |

### Q3: Delegate/Quick (Urgent + Not Important)

| Item | Why Urgent | Who/What |
|------|------------|----------|
| | | |
| | | |

### Q4: Eliminate (Not Urgent + Not Important)

| Item | Why Listed | Decision |
|------|------------|----------|
| | | |
| | | |

### Visual Matrix

```
                URGENT                    NOT URGENT
         ┌─────────────────────┬─────────────────────┐
         │                     │                     │
         │  Q1: DO FIRST       │  Q2: SCHEDULE       │
IMPORTANT│                     │                     │
         │  [Items]            │  [Items]            │
         │                     │                     │
         ├─────────────────────┼─────────────────────┤
         │                     │                     │
    NOT  │  Q3: DELEGATE       │  Q4: ELIMINATE      │
IMPORTANT│                     │                     │
         │  [Items]            │  [Items]            │
         │                     │                     │
         └─────────────────────┴─────────────────────┘
```

### Execution Plan

1. Complete all Q1 items this week
2. Schedule time for Q2 items
3. Delegate/batch Q3 items
4. Remove Q4 from consideration
```

---

## Dependency-First Scoring

### Dependency Graph Template

```markdown
## Dependency Analysis: [Domain]

Date: YYYY-MM-DD
Analyzer: [Name]

### Systems List

| ID | System | Dependencies | Depth |
|----|--------|--------------|-------|
| | | | |
| | | | |

### Dependency Graph

```
[Draw or describe the graph]

Level 0 (No dependencies):
  └── [System A]
  └── [System B]

Level 1 (Depends on Level 0):
  └── [System C] ─depends on─▶ [A]
  └── [System D] ─depends on─▶ [A, B]

Level 2 (Depends on Level 1):
  └── [System E] ─depends on─▶ [C]

Level 3 (Depends on Level 2):
  └── [System F] ─depends on─▶ [D, E]
```

### Build Order

| Order | System | Why This Position | Blockers |
|-------|--------|-------------------|----------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

### Parallel Opportunities

| Group | Systems | Can Run In Parallel Because |
|-------|---------|----------------------------|
| | | |
| | | |

### Critical Path

The longest dependency chain: [System A] → [System C] → [System E] → [System F]
Critical path duration: [X weeks]
```

### Depth Calculation

```javascript
function calculateDepth(system, allSystems) {
  if (system.dependencies.length === 0) {
    return 0;
  }

  const depDepths = system.dependencies.map(depId => {
    const dep = allSystems.find(s => s.id === depId);
    return calculateDepth(dep, allSystems);
  });

  return Math.max(...depDepths) + 1;
}
```

---

## Combined Scoring Approach

For complex projects, combine frameworks:

### Phase 1: Dependency-First for Build Order

First, establish what CAN be built based on dependencies.

### Phase 2: WSJF Within Dependency Levels

Within each dependency level, use WSJF to order by value.

### Combined Template

```markdown
## Combined Priority Scoring: [Domain]

### Dependency Levels

**Level 0 (Build First):**
| System | Value | Time | Risk | Effort | WSJF | Order |
|--------|-------|------|------|--------|------|-------|
| | | | | | | |

**Level 1 (After Level 0):**
| System | Value | Time | Risk | Effort | WSJF | Order |
|--------|-------|------|------|--------|------|-------|
| | | | | | | |

**Level 2 (After Level 1):**
| System | Value | Time | Risk | Effort | WSJF | Order |
|--------|-------|------|------|--------|------|-------|
| | | | | | | |

### Final Build Order

| Order | System | Level | WSJF | Rationale |
|-------|--------|-------|------|-----------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
```

---

## Calibration Tips

### Avoiding Common Biases

| Bias | Description | Mitigation |
|------|-------------|------------|
| Recency | Recent requests seem more important | Review full backlog before scoring |
| Loudest voice | Whoever complains most gets priority | Use objective criteria |
| Sunk cost | "We already started" artificially raises priority | Score based on remaining value |
| Familiarity | Known items score higher | Include unfamiliar scorers |
| Anchoring | First score influences others | Score independently first |

### Calibration Session Format

1. **Individual scoring** (10 min) - Each person scores independently
2. **Reveal scores** (5 min) - Show all scores simultaneously
3. **Discuss outliers** (15 min) - Focus on items with large disagreement
4. **Align on criteria** (10 min) - Agree on what each score level means
5. **Re-score if needed** (5 min) - Adjust based on alignment
6. **Final ranking** (5 min) - Order by consensus score

### Reference Points

Establish reference items for each score level:

```markdown
## Value Score Reference Points

- Score 10: [Example item that's clearly a 10]
- Score 7: [Example item that's clearly a 7]
- Score 4: [Example item that's clearly a 4]
- Score 1: [Example item that's clearly a 1]

When scoring new items, compare to these references.
```

---

## Quick Reference Card

### When to Use Which Framework

```
Starting new project?           → Dependency-First
Fixed deadline?                 → MoSCoW
Maximizing value?               → WSJF
Many similar items?             → RICE
Mixed urgent/important?         → Eisenhower
Need quantitative comparison?   → RICE
Need qualitative buckets?       → MoSCoW
```

### Score Cheat Sheet

**WSJF:** (Value + Time + Risk) / Effort → Higher = First

**RICE:** (Reach x Impact x Confidence) / Effort → Higher = First

**MoSCoW:** Must > Should > Could > Won't

**Eisenhower:** Q1 (now) > Q2 (schedule) > Q3 (delegate) > Q4 (drop)

**Dependency:** Lower depth number = build first

---

## See Also

- `prioritization-frameworks.md` - Detailed framework descriptions
- `triage-triggers.md` - When to re-prioritize
- `queue-reorder-template.md` - Documenting priority changes
