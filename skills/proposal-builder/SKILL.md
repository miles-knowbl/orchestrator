---
name: proposal-builder
description: "Generate polished proposal documents from cultivated context and priorities. Transform insights, patterns, and ranked opportunities into compelling narratives with clear value propositions, scope definitions, pricing strategies, and calls to action. The final output skill of the proposal loop."
phase: COMPLETE
category: specialized
version: "2.0.0"
depends_on: ["priority-matrix"]
tags: [planning, proposal, documentation, persuasion, sales]
---

# Proposal Builder

Generate polished proposal documents from cultivated context and priorities.

## When to Use

- **Priorities are established and ranked** -- PRIORITIES.md and MATRIX.md exist with scored options
- **Context is fully cultivated** -- CULTIVATED-CONTEXT.md and PATTERNS.md provide deep insight
- **Client-ready document needed** -- Stakeholders expect a professional, formatted proposal
- **Engagement scoping complete** -- Scope, timeline, and investment parameters are understood
- **Competitive situation** -- Need to differentiate against alternatives with a compelling narrative
- When you say: "create the proposal", "generate the document", "write this up", "build the proposal"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `CULTIVATED-CONTEXT.md` | Synthesized insights, themes, and evidence to support claims |
| `PRIORITIES.md` | Ranked priorities determine what to emphasize and propose |
| `MATRIX.md` | Scoring rationale informs value proposition framing |
| `PATTERNS.md` | Identified patterns shape the problem statement narrative |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `GAPS.md` | When gaps inform risk mitigation or phased approach |
| `RAW-CONTEXT.md` | When specific quotes or data points are needed |
| `CONTEXT-SOURCES.md` | When citing sources strengthens credibility |
| `brand-guidelines.md` | When client or firm brand standards apply |

**Verification:** Every claim in the proposal must trace to evidence in CULTIVATED-CONTEXT.md or PATTERNS.md. No unsupported assertions.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `PROPOSAL.md` | Project root | Always |
| `PROPOSAL-BRIEF.md` | Project root | When Brief template selected |
| `PROPOSAL-TECHNICAL.md` | Project root | When Technical template selected |

## Core Concept

Proposal Builder answers: **"How do we present this opportunity in a way that compels action?"**

A great proposal is:
- **Evidence-based** -- Every claim traces to cultivated context, not conjecture
- **Value-centric** -- Frames everything around outcomes and ROI, not activities
- **Structurally sound** -- Follows a persuasive arc from problem to solution to action
- **Appropriately scoped** -- Clear boundaries prevent scope creep and set expectations
- **Actionable** -- Ends with a specific, low-friction next step

A proposal is NOT:
- A requirements document (that is upstream context)
- A project plan (that follows after acceptance)
- A technical specification (that is `spec`)
- A contract or legal agreement (that requires legal review)
- A generic brochure (proposals are tailored to the specific engagement)

## The Proposal Building Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROPOSAL BUILDING PROCESS                     │
│                                                                  │
│  1. INPUT REVIEW                                                 │
│     └──> Absorb cultivated context, priorities, and patterns     │
│                                                                  │
│  2. TEMPLATE SELECTION                                           │
│     └──> Choose Standard, Brief, or Technical template           │
│                                                                  │
│  3. VALUE PROPOSITION DESIGN                                     │
│     └──> Define the core value story and differentiation         │
│                                                                  │
│  4. EXECUTIVE SUMMARY                                            │
│     └──> Write the hook — the single most important section      │
│                                                                  │
│  5. PROBLEM-SOLUTION NARRATIVE                                   │
│     └──> Demonstrate understanding, then present the approach    │
│                                                                  │
│  6. SCOPE, TIMELINE & INVESTMENT                                 │
│     └──> Define boundaries, phases, and pricing                  │
│                                                                  │
│  7. CREDIBILITY & CALL TO ACTION                                 │
│     └──> Build trust and make the next step obvious              │
│                                                                  │
│  8. REVIEW & POLISH                                              │
│     └──> Evidence audit, tone check, formatting pass             │
└─────────────────────────────────────────────────────────────────┘
```

## Step 1: Input Review

Before writing, fully absorb all upstream deliverables.

| Input | Extract |
|-------|---------|
| **CULTIVATED-CONTEXT.md** | Key insights, themes, client language, pain points |
| **PATTERNS.md** | Recurring issues, systemic problems, opportunity areas |
| **PRIORITIES.md** | Top-ranked items to feature prominently |
| **MATRIX.md** | Scoring rationale for prioritization framing |
| **GAPS.md** | Areas of uncertainty that may need phased discovery |

### Input Review Checklist

```markdown
- [ ] All upstream deliverables read in full
- [ ] Client's own language and terminology noted
- [ ] Top 3 pain points identified from cultivated context
- [ ] Top 3 priorities confirmed from PRIORITIES.md
- [ ] Key patterns documented for problem statement
- [ ] Decision-maker and audience identified
- [ ] Budget range or constraints understood (if available)
```

### Audience Analysis

| Factor | Questions | Impact on Proposal |
|--------|-----------|-------------------|
| **Decision-maker** | Who signs off? What do they care about? | Executive summary tone and emphasis |
| **Evaluators** | Who reviews in detail? Technical? Business? | Depth of technical vs business content |
| **Champions** | Who is advocating internally? | Language they can reuse internally |
| **Blockers** | Who might object? What concerns? | Preemptive objection handling |

## Step 2: Template Selection

| Template | Sections | Length | Best For |
|----------|----------|--------|----------|
| **Standard** | All 9 sections | 8-15 pages | Full engagements, new client relationships |
| **Brief** | Exec Summary + Scope + Investment + Next Steps | 2-4 pages | Follow-ups, small projects, existing relationships |
| **Technical** | All sections + deep technical approach | 10-20 pages | Technical evaluators, complex implementations |

### Selection Criteria

- Engagement value > $50K or new relationship --> Standard
- Existing relationship + clear scope < $50K --> Brief
- Technical evaluators are primary audience --> Technical
- RFP response with format requirements --> Custom (adapt closest template)

### Tone Calibration

| Audience | Tone | Language |
|----------|------|----------|
| **C-Suite** | Strategic, outcome-focused, concise | ROI, growth, competitive advantage, risk mitigation |
| **Directors / Managers** | Practical, process-oriented | Efficiency, timeline, milestones, team impact |
| **Technical Leads** | Precise, evidence-based, detailed | Architecture, approach, standards, methodology |
| **Mixed** | Layered — exec summary for leaders, appendices for detail | Start broad, enable drill-down |

## Step 3: Value Proposition Design

The value proposition is the backbone of the entire proposal. Design it before writing.

### Value Proposition Framework

| Component | Question | Example |
|-----------|----------|---------|
| **Target** | Who is this for? | "For mid-market SaaS companies..." |
| **Problem** | What pain do they have? | "...struggling with customer churn above 8%..." |
| **Solution** | What do we offer? | "...we provide a data-driven retention program..." |
| **Outcome** | What result do they get? | "...that reduces churn by 30-50% within 6 months..." |
| **Differentiator** | Why us over alternatives? | "...using our proprietary engagement scoring model." |

### Value Proposition Statement

```markdown
For [TARGET], who [PROBLEM/NEED],
our [SOLUTION/ENGAGEMENT] provides [KEY OUTCOME].

Unlike [ALTERNATIVE/STATUS QUO], our approach [DIFFERENTIATOR],
resulting in [QUANTIFIED BENEFIT] within [TIMEFRAME].
```

### Differentiation Strategies

| Strategy | Description | Evidence Required |
|----------|-------------|-------------------|
| **Methodology** | Proprietary or proven process | Case studies, documentation |
| **Expertise** | Domain-specific knowledge | Team bios, relevant experience |
| **Results** | Track record of outcomes | Metrics, testimonials |
| **Speed** | Faster time to value | Timeline comparison, accelerators |
| **Risk reduction** | Lower risk than alternatives | Guarantees, phased approach, pilots |
| **Partnership** | Long-term relationship mindset | Support model, knowledge transfer |

## Step 4: Executive Summary

The most important section. Many decision-makers read only this. Keep to 250-400 words.

### Structure

| Element | Purpose | Length |
|---------|---------|--------|
| **Opening hook** | Capture attention with a relevant insight | 1-2 sentences |
| **Problem acknowledgment** | Show you understand their situation | 2-3 sentences |
| **Solution overview** | What you propose at a high level | 2-3 sentences |
| **Key outcomes** | Quantified results they can expect | 2-3 bullet points |
| **Investment range** | Ballpark so they know the scale | 1 sentence |
| **Call to action** | What happens next | 1 sentence |

### Anti-patterns

| Anti-pattern | Problem | Fix |
|--------------|---------|-----|
| **Starting with "We are..."** | Self-focused, not client-focused | Start with their challenge |
| **Vague outcomes** | "Improve efficiency" means nothing | Quantify: "Reduce processing time by 40%" |
| **Feature listing** | Reads like a brochure | Frame features as outcomes |
| **Too long** | Executives stop reading | Keep under one page |
| **No specifics** | Generic signals generic thinking | Reference their context directly |

### Template

```markdown
## Executive Summary

[INSIGHT or CHALLENGE relevant to their situation].

[COMPANY] faces [SPECIFIC CHALLENGE]. This manifests as [CONCRETE SYMPTOMS
from patterns analysis], impacting [BUSINESS METRIC].

We propose [HIGH-LEVEL SOLUTION] delivered across [NUMBER] phases over
[TIMEFRAME], directly addressing [TOP PRIORITY] while building the
foundation for [SECONDARY PRIORITIES].

**Expected outcomes:**
- [QUANTIFIED OUTCOME 1 tied to top priority]
- [QUANTIFIED OUTCOME 2 tied to secondary priority]
- [STRATEGIC OUTCOME tied to longer-term value]

Total investment: [RANGE]. First phase begins within [TIMEFRAME] of approval.
To proceed, [SPECIFIC NEXT STEP with date].
```

## Step 5: Problem-Solution Narrative

The problem statement proves you understand; the solution shows you can deliver.

### Problem Statement Principles

| Principle | Description |
|-----------|-------------|
| **Use their language** | Mirror terminology from CULTIVATED-CONTEXT.md |
| **Show systemic understanding** | Connect symptoms to root causes using PATTERNS.md |
| **Quantify the cost of inaction** | What happens if they do nothing? |
| **Validate, don't lecture** | Confirm their experience, not teach them |
| **Cite evidence** | Every claim references cultivated context |

### Problem Structure

Write four subsections: **Current Situation** (their state in their language), **Impact** (quantified: revenue at risk, efficiency loss, competitive position, team impact), **Root Causes** (connect symptoms to underlying causes from PATTERNS.md), **Cost of Inaction** (what happens in 6-12 months if nothing changes).

### Solution Presentation

| Element | Purpose |
|---------|---------|
| **Approach overview** | High-level methodology -- how, not just what |
| **Phase breakdown** | Logical progression that reduces risk |
| **Key activities** | What happens in each phase |
| **Deliverables per phase** | Tangible outputs at each checkpoint |
| **Why this approach** | Connect to their specific root causes and risks |

## Step 6: Scope, Timeline, and Investment

### Scope Definition

| Category | Include |
|----------|---------|
| **In Scope** | Specific activities, deliverables, and responsibilities |
| **Out of Scope** | Items explicitly excluded (3-5 common assumptions) |
| **Assumptions** | Conditions that must hold for scope validity |
| **Dependencies** | What you need from the client |
| **Change Process** | How scope changes are requested and priced |

**Scope anti-patterns:** Vague deliverables (name specific artifacts), no exclusions (everything is implicitly included), missing assumptions (disputes when conditions change), no change process (ad-hoc scope creep).

### Timeline Design

| Principle | Description |
|-----------|-------------|
| **Phase with checkpoints** | Never present a single monolithic timeline |
| **Buffer realistically** | Add 15-20%; over-delivery beats under-delivery |
| **Show dependencies** | What needs to happen before what |
| **Include client milestones** | Reviews, approvals, input they must provide |
| **Highlight early value** | Show when first tangible results appear |

Format as a table: Phase | Duration | Key Milestone | Output. Include milestone detail with decision gates and a start date commitment.

### Pricing Strategy

| Strategy | When to Use | Format |
|----------|-------------|--------|
| **Fixed price** | Well-defined scope, predictable work | Total per phase |
| **Time & materials** | Uncertain scope, discovery-heavy | Rate card with range |
| **Value-based** | Clear ROI, measurable outcomes | Price anchored to value |
| **Retainer** | Ongoing relationship, variable demand | Monthly capacity fee |
| **Phased with options** | Client wants flexibility, large scope | Fixed Phase 1, options after |

### Investment Framing

| Principle | Why It Matters |
|-----------|---------------|
| **Lead with value, not cost** | Anchor on outcomes before revealing price |
| **Show ROI math** | Investment feels small relative to return |
| **Offer tiers or phases** | Give client agency, reduce commitment anxiety |
| **Separate one-time from ongoing** | Clarity on recurring vs single costs |
| **Include what is in the price** | Prevent "is that extra?" questions |

**Pricing anti-patterns:** Single lump sum (sticker shock), price without context (feels expensive in vacuum), hidden costs (erodes trust), no payment terms (uncertainty), eager discounting (signals inflated price -- offer scope adjustments instead).

## Step 7: Credibility and Call to Action

### Credibility Elements

| Element | Strength | When to Use |
|---------|----------|-------------|
| **Case studies** | High | Similar industry or challenge exists |
| **Metrics and results** | High | Quantified outcomes available |
| **Testimonials** | Medium-High | Specific and recent |
| **Team bios** | Medium | Senior expertise is a differentiator |
| **Client list** | Medium | Recognizable brands in portfolio |
| **Methodology description** | Medium | Process rigor is valued |

Format as: "Why [Firm Name]" with subsections for unique approach (benefits THEM, not why you are proud), relevant experience (Challenge > Approach > Result format), and team table (Role, Person, Experience).

### Call to Action Principles

| Principle | Description |
|-----------|-------------|
| **Single, specific action** | One clear thing to do next, not a menu |
| **Low friction** | A meeting, not a signed contract |
| **Time-bound** | Suggested date or response window |
| **Named contact** | Who to reach out to, with full contact info |
| **Forward momentum** | Frame as starting something, not a decision gate |

**CTA anti-patterns:** "Let us know" (no urgency), multiple equal options (decision paralysis), contract as next step (too big a jump), no deadline (infinite delay is free), no contact info (friction to respond).

### CTA Template

```markdown
## Next Steps

1. **Schedule a review call** — [NAME] is available [DATE RANGE].
   Contact: [EMAIL] | [PHONE]
2. **Confirm scope alignment** — Refine details based on feedback.
3. **Begin Phase 1** — Within [NUMBER] business days of agreement.

This proposal is valid for [NUMBER] days from [DATE].
```

## Step 8: Review and Polish

### Evidence Audit

```markdown
- [ ] Every claim traces to CULTIVATED-CONTEXT.md or PATTERNS.md
- [ ] No unsupported superlatives ("best", "leading", "unmatched")
- [ ] Quantified outcomes are realistic and defensible
- [ ] Client's own language used (not generic consulting jargon)
- [ ] All priorities from PRIORITIES.md addressed
```

### Tone and Formatting Check

```markdown
- [ ] Client-focused: "you/your" outnumber "we/our"
- [ ] Active voice throughout
- [ ] Jargon-free or jargon-explained for audience
- [ ] Executive summary fits one page
- [ ] All placeholder text replaced
- [ ] Dates, timeline, and investment figures consistent throughout
- [ ] Contact information complete and correct
```

## Output Formats

### Quick Format (Brief Template)

```markdown
# Proposal: [Engagement Name]
**Prepared for:** [Client] | **Date:** [Date] | **By:** [Firm]

## Executive Summary
## Scope & Deliverables / Not Included
## Investment
## Next Steps
```

### Full Format (Standard Template)

```markdown
# Proposal: [Engagement Name]
**Prepared for:** [Client] | **Date:** [Date] | **Valid until:** [+30 days]

## Executive Summary
## Understanding Your Challenge (Situation, Impact, Root Causes, Cost of Inaction)
## Proposed Solution (Approach, Phase Overview, Why This Approach)
## Scope & Deliverables (Included, Excluded, Assumptions, Client Responsibilities)
## Timeline (Phases, Milestones, Dependencies)
## Investment (Value Context, Pricing, Terms, Inclusions, Add-ons)
## Why [Firm Name] (Differentiation, Experience, Team)
## Next Steps
## Appendix (Technical Detail, Bios, Case Studies, Terms)
```

### Technical Format

Extends Standard with: **Technical Assessment** (current architecture, debt, performance), **Expanded Solution** (architecture, technology choices, integration, data model, security), **Implementation Approach** (methodology, per-phase activities and acceptance criteria), **Quality Assurance** (testing, benchmarks, security review), **Expanded Appendix** (diagrams, tech comparison, risk register, glossary).

## Common Patterns

### The Phased Engagement

Present a large engagement as smaller, independently valuable phases. Phase 1 is always low-risk discovery. Each subsequent phase builds on the prior.

**Use when:** Large scope, new client relationship, budget uncertainty, risk-averse buyer.

### The Pilot-to-Scale

Propose a bounded pilot with clear success metrics. Define expansion criteria upfront so the path from pilot to full engagement is predefined, not renegotiated.

**Use when:** Skeptical stakeholders, unproven approach, competing against an incumbent.

### The Options Menu

Present two to three tiers (Essential / Recommended / Comprehensive). Anchor on the recommended tier. Essential gives a fallback; comprehensive makes recommended feel reasonable.

**Use when:** Budget flexibility unknown, client values agency, need to accommodate different paths.

### The Diagnostic First

Propose a paid diagnostic as a standalone engagement. The diagnostic produces a roadmap that becomes the basis for the implementation proposal.

**Use when:** Scope unclear, client needs to see thinking before committing, complex legacy environment.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `context-ingestion` | Provides raw source material consumed during proposal writing |
| `context-cultivation` | Provides cultivated insights, themes, and evidence base |
| `priority-matrix` | Provides ranked priorities that determine proposal emphasis |
| `architect` | Technical proposals may reference architectural patterns |
| `spec` | Scope definitions may evolve into specifications post-acceptance |
| `document` | Proposal formatting aligns with documentation standards |

## Key Principles

**Evidence over assertion.** Every claim must trace to cultivated context. If you cannot cite evidence, remove the claim or flag it as an assumption.

**Value over features.** Clients buy outcomes, not activities. "Reduce churn by 30%" beats "Implement retention analytics platform."

**Clarity over cleverness.** Simple, direct language. A proposal that requires re-reading has failed.

**Specificity over generality.** Generic proposals signal generic thinking. Reference their company, challenges, and language.

**Structure over length.** A well-structured 5-page proposal outperforms a meandering 20-page one.

**Action over information.** Every section should move the reader toward yes. If it does not advance the decision, cut it or move it to an appendix.

## References

- `references/proposal-templates.md`: Full templates for Standard, Brief, and Technical proposals
- `references/value-proposition-guide.md`: Crafting value propositions and differentiation
- `references/pricing-strategies.md`: Pricing models, anchoring techniques, and ROI frameworks
- `references/executive-summary-examples.md`: Annotated examples of strong executive summaries
- `references/scope-definition-guide.md`: Patterns for clear scope with boundary management
- `references/persuasion-principles.md`: Evidence-based principles for compelling business writing
