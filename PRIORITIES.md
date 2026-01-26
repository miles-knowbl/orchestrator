# Priority Rankings

## Executive Summary

| Category | Count | Proposal Focus |
|----------|-------|---------------|
| **Tier 1: Must Include** | 5 capabilities | Core proposal — lead with these |
| **Tier 2: Should Include** | 3 capabilities | Strong value-add — include in phased scope |
| **Tier 3: Could Include** | 2 capabilities | Future roadmap — mention as Phase 3+ |
| **Total Scored** | 10 capabilities | |

---

## Prioritized Recommendations

### Tier 1: Must Include (Score >= 3.90)

These capabilities form the core proposal narrative and must be prominently featured.

#### 1. Engineering Metrics Dashboard (Score: 4.65)
- **Phase:** 1 (deploy in first 2 weeks)
- **Rationale:** The dashboard IS trust and ROI in one deliverable. CTO wants measurable results; NovaSoft taught us metrics must be visible from day 1. This is the first thing TechFlow sees working.
- **Proposal Position:** Feature in executive summary as "accountability built in from day one"
- **Key Metric:** Before/after review cycle, rework rate, deployment frequency
- **Evidence:** PAT-004 (metrics-driven), SRC-008 (NovaSoft lesson)

#### 2. AI-Assisted Code Review (Score: 4.55)
- **Phase:** 1 (core pilot deliverable)
- **Rationale:** The #1 value lever. 2.3-day review cycles → 1.1-day target. This is the capability that justifies the entire engagement. 120 PRs/week × 1.2 days saved = massive velocity gain.
- **Proposal Position:** Lead the solution narrative — "Here's how we solve your biggest bottleneck"
- **Key Metric:** Review cycle time, rework rate, false positive rate
- **Evidence:** PAT-001 (primary bottleneck), REQ-001, NovaSoft 45% reduction

#### 3. Skills-Based Architecture / Transparency (Score: 4.20)
- **Phase:** 1 (inherent to platform — demo on day 1)
- **Rationale:** The differentiator. CTO was burned by black box AI. Our skills-based approach means every suggestion is traceable to a named skill with visible reasoning. This is what wins the deal against competitors.
- **Proposal Position:** Architecture section — "Why we're different: composable, transparent, customizable"
- **Key Metric:** Developer trust score, skill customization adoption
- **Evidence:** PAT-002, PAT-003, PREF-002, SRC-007

#### 4. Team-Specific Calibration (Score: 4.10)
- **Phase:** 1 (begins with pilot, 30-day calibration window)
- **Rationale:** "The system learns YOUR standards" converts skeptics. Dev Lead James Park wants team-pattern learning. This is how we go from generic AI to their AI.
- **Proposal Position:** Differentiation section — "Your team's intelligence, amplified"
- **Key Metric:** False positive rate reduction over 30 days, accept/dismiss ratio
- **Evidence:** PAT-005, REQ-014, PREF-002

#### 5. Deployment Pipeline Automation (Score: 3.95)
- **Phase:** 2 (after code review proves value)
- **Rationale:** Weekly→daily deployment directly addresses velocity goal. 60% of P1 incidents are deployment-related. Automated quality gates reduce incident rate.
- **Proposal Position:** Phase 2 value expansion — "From faster reviews to faster shipping"
- **Key Metric:** Deployment frequency, P1 incident rate
- **Evidence:** REQ-002, SRC-002 (60% of P1s), SRC-001 (weekly→daily target)

---

### Tier 2: Should Include (Score 3.00-3.89)

These capabilities add significant value and should be included in the phased scope.

#### 6. Intelligent PR Routing (Score: 3.75)
- **Phase:** 2
- **Rationale:** VP Engineering's top pain point — engineers reviewing code outside their domain. Routing by expertise and availability reduces context switching and improves review quality.
- **Proposal Position:** Phase 2 operational improvement
- **Key Metric:** Review relevance score, time-to-first-review
- **Evidence:** REQ-011, SRC-004 (VP Eng pain point)

#### 7. Training & Enablement Program (Score: 3.65)
- **Phase:** 1-3 (parallel track)
- **Rationale:** Tools don't adopt themselves. Engineering leads need training to champion the platform. Shows investment in people, not just technology.
- **Proposal Position:** Engagement model section — "Partnership, not just deployment"
- **Key Metric:** Lead confidence score, champion adoption rate
- **Evidence:** PREF-005, SRC-008 (NovaSoft lessons)

#### 8. Flaky Test Detection & Quarantine (Score: 3.55)
- **Phase:** 1 (quick win, first 2 weeks)
- **Rationale:** #2 developer complaint (28%). Quick win that builds goodwill with engineering team while the bigger capabilities calibrate. Low effort, high developer satisfaction impact.
- **Proposal Position:** Phase 1 quick win — "Immediate developer experience improvement"
- **Key Metric:** Flaky test count, false failure rate
- **Evidence:** REQ-007, SRC-002 (28% complaint rate)

---

### Tier 3: Could Include (Score < 3.00)

Mention as future roadmap items; don't lead with these.

#### 9. Code Knowledge Graph / Ownership Mapping (Score: 3.00)
- **Phase:** 2-3
- **Rationale:** Addresses "unclear ownership" complaint but is complex and less differentiated
- **Proposal Position:** Roadmap section

#### 10. Natural Language Engineering Queries (Score: 2.25)
- **Phase:** 3+
- **Rationale:** "Could have" in RFP. Novel but not a priority. Include as future vision.
- **Proposal Position:** Vision section — "Where we're heading"

---

## Phasing Recommendation

```
Phase 1: Prove Value (Weeks 1-8) — 2 Pilot Teams
├── Engineering Metrics Dashboard [Tier 1] — Week 1-2
├── Flaky Test Detection [Tier 2] — Week 1-2 (quick win)
├── AI-Assisted Code Review [Tier 1] — Week 1-8
├── Skills Architecture Demo [Tier 1] — Week 1 (inherent)
├── Team-Specific Calibration [Tier 1] — Week 3-8 (30-day window)
└── Training: Pilot Team Leads [Tier 2] — Week 1-2

GATE: Pilot teams show measurable improvement

Phase 2: Scale Value (Weeks 9-16) — All 8 Teams
├── Deployment Pipeline Automation [Tier 1] — Week 9-14
├── Intelligent PR Routing [Tier 2] — Week 9-12
├── Code Review → All Teams [expansion] — Week 9-11
├── Calibration → All Teams [expansion] — Week 11-16
└── Training: All Team Leads [Tier 2] — Week 9-10

GATE: Organization-wide metrics improving

Phase 3: Optimize & Extend (Weeks 17-24)
├── Code Knowledge Graph [Tier 3] — if demand exists
├── NL Queries [Tier 3] — if budget allows
├── Advanced Calibration Tuning — ongoing
└── Training: Self-service enablement

GATE: ROI targets met, retainer decision
```

---

## Trade-Off Decisions

| Decision | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Lead with review automation vs. deployment | Review | Deployment | Review is #1 complaint, easier to prove, lower integration risk |
| Metrics dashboard in Phase 1 vs. Phase 2 | Phase 1 | Phase 2 | "Metrics from day 1" is a pattern from NovaSoft + CTO demand |
| Phased rollout vs. big-bang | Phased | Big-bang | CTO preference + NovaSoft lesson + trust-building strategy |
| Include training vs. tech-only | Include | Tech-only | PREF-005 + adoption risk mitigation |
| NL queries in scope vs. deferred | Deferred | In scope | Low stakeholder priority, high ambiguity, not differentiated |

---

## Proposal Narrative Strategy

Based on priority rankings, the proposal should follow this narrative arc:

1. **Open with the problem** — 2.3-day reviews, 15% rework, weekly deploys, declining satisfaction
2. **Introduce the solution** — Skills-based AI orchestration (transparency + customization)
3. **Lead with review automation** — The #1 bottleneck, quantified ROI potential
4. **Prove with metrics** — Dashboard from day 1, NovaSoft case study
5. **Build trust with architecture** — Visible skills, explainable decisions, human-in-the-loop
6. **Expand with Phase 2** — Deployment pipeline, PR routing, org-wide rollout
7. **Vision with Phase 3** — Self-improving system, ongoing partnership
8. **Close with ROI** — Before/after targets tied to their own baselines
