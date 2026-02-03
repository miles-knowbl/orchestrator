# Personalization Reference

How to tailor assets to deal context.

## Personalization Levels

### Level 1: Basic (Minimum)

| Element | What to Customize |
|---------|-------------------|
| Company name | Replace [Company] |
| Industry | Mention their industry |
| Contact names | Use real names |
| Logo | Their logo if appropriate |

**Time:** 5-10 minutes
**Impact:** Modest

### Level 2: Contextual (Recommended)

| Element | What to Customize |
|---------|-------------------|
| Pain points | Their specific challenges |
| Numbers | Their actual metrics |
| Timeline | Their deadlines |
| Competitors | Their alternatives |
| Stakeholders | Their decision-makers |

**Time:** 30-60 minutes
**Impact:** Significant

### Level 3: Deep (High-stakes)

| Element | What to Customize |
|---------|-------------------|
| Business context | Their strategic priorities |
| Organizational dynamics | Their internal politics |
| Language | Their terminology |
| Visuals | Match their brand |
| Scenarios | Their specific use cases |

**Time:** 2-4 hours
**Impact:** Maximum

---

## Data Sources for Personalization

### Deal Intelligence

| Source | Data |
|--------|------|
| deal.json | Scores, stage, metrics |
| pain-points.json | Challenges, severity, quotes |
| budget-timeline.json | Budget range, deadlines |
| stakeholders.json | Names, roles, sentiments |
| competitive-intel.json | Competitors, preferences |

### Communications

| Source | Data |
|--------|------|
| Meeting notes | Quotes, concerns, language |
| Emails | Tone, priorities |
| Transcripts | Exact wording |

### External

| Source | Data |
|--------|------|
| Company website | Mission, values, messaging |
| Annual report | Priorities, metrics |
| News | Recent events |
| LinkedIn | Stakeholder backgrounds |

---

## Personalization by Asset Type

### ROI Model

**Must personalize:**
- Ticket/interaction volume
- Current cost per interaction
- Current headcount
- Target metrics
- Timeline

**Data source:**
```
pain-points.json → volume metrics
budget-timeline.json → targets
communications → specific numbers mentioned
```

### Executive One-Pager

**Must personalize:**
- Top pain point (their words)
- Key metric (their number)
- Timeline (their deadline)
- Next step (specific to stage)

**Data source:**
```
pain-points.json → highest severity pain
budget-timeline.json → deadline
deal.json → stage-appropriate next step
```

### Objection Responses

**Must personalize:**
- Exact objection wording
- Relevant proof points
- Their context

**Data source:**
```
communications → exact quotes
competitive-intel.json → relevant comparisons
similar deals → proof points
```

---

## Personalization Templates

### Pain Point Reference

**Generic:**
> "Companies struggle with high support volume"

**Personalized:**
> "Your team has seen a 300% increase in support tickets, with Sarah
> describing it as 'drowning in tickets'"

**Source:** `pain-points.json → quote, speaker, quantified impact`

### Number Reference

**Generic:**
> "ROI of 100-200%"

**Personalized:**
> "Based on your 15,000 monthly tickets at $12 each, projected ROI
> of 162% with payback in 4.5 months"

**Source:** `communications → mentioned metrics`

### Timeline Reference

**Generic:**
> "Implement in Q2"

**Personalized:**
> "Live by your June 30 deadline, well ahead of your peak season"

**Source:** `budget-timeline.json → deadline, driver`

### Stakeholder Reference

**Generic:**
> "Executive sponsor"

**Personalized:**
> "Sarah has offered to present this to Lisa (CFO) with the business case"

**Source:** `stakeholders.json → names, roles, relationships`

---

## Personalization Checklist

### Before Creating

- [ ] Reviewed pain-points.json
- [ ] Reviewed budget-timeline.json
- [ ] Reviewed stakeholders.json
- [ ] Checked recent communications for quotes
- [ ] Identified key numbers mentioned

### During Creation

- [ ] Used their company name (not generic)
- [ ] Included their specific pain points
- [ ] Used their actual numbers
- [ ] Referenced their timeline/deadline
- [ ] Named relevant stakeholders
- [ ] Used their language/terminology

### Before Delivery

- [ ] Verified numbers are accurate
- [ ] Confirmed names are spelled correctly
- [ ] Checked for any [placeholder] text
- [ ] Ensured formatting is clean
- [ ] Appropriate for audience

---

## Common Mistakes

### Mistake: Using Industry Averages

**Problem:** "Industry average is $15/ticket"
**Better:** "Your $12/ticket cost" (their actual number)

### Mistake: Generic Pain Points

**Problem:** "High ticket volume"
**Better:** "300% increase in tickets since last year" (their situation)

### Mistake: Wrong Audience Level

**Problem:** Technical details for CFO
**Better:** Financial impact for CFO

### Mistake: Missing Context

**Problem:** "ROI of 150%"
**Better:** "ROI of 162% — enough to fund two additional hires"

### Mistake: Placeholder Text

**Problem:** "[Company Name]" left in document
**Better:** Always search for brackets before delivery

---

## Audience Adaptation

### For Finance (CFO, FP&A)

**Emphasize:**
- ROI and payback
- Cost reduction
- Budget impact
- Risk mitigation

**Use:**
- Tables and numbers
- Conservative estimates
- Comparison to alternatives

### For Technical (CTO, IT)

**Emphasize:**
- Architecture
- Integration
- Security
- Scalability

**Use:**
- Diagrams
- Technical specifics
- Documentation references

### For Operations (VP Ops, Director)

**Emphasize:**
- Process improvement
- Efficiency gains
- Team impact
- Implementation

**Use:**
- Before/after
- Timeline
- Resource requirements

### For Executive (CEO, VP)

**Emphasize:**
- Strategic value
- Competitive advantage
- Business outcomes
- Summary-level

**Use:**
- One-pagers
- Key metrics
- Visual summaries
