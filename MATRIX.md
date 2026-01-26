# Prioritization Matrix

## Scoring Methodology

### What We're Prioritizing
The **capabilities and value propositions** to include in TechFlow's proposal, ranked by strategic importance to the client and feasibility for delivery.

### Criteria & Weights

| ID | Criterion | Weight | Rationale | Source |
|----|-----------|--------|-----------|--------|
| C1 | Stakeholder Impact | 30% | CTO: "2x productive without hiring" — outcome is king | PAT-001, PAT-004 |
| C2 | Trust Building | 25% | Trust deficit is the #1 barrier to winning | PAT-002, PAT-003 |
| C3 | Technical Feasibility | 20% | Must be deliverable within constraints | CON-002, CON-005 |
| C4 | Timeline Fit | 15% | Q3 2026 deadline, phased rollout structure | PAT-006, CON-002 |
| C5 | ROI Demonstrability | 10% | CTO wants measurable ROI within 6 months | PAT-004, REQ-010 |
| | **Total** | **100%** | | |

### Weight Derivation
Derived from pattern analysis: PAT-001 (velocity is the goal, 30%), PAT-002/003 (trust is the barrier, 25%), remaining split across delivery confidence (20%), timeline (15%), and measurability (10%).

### Scoring Scale

| Score | Meaning | Evidence Required |
|-------|---------|-------------------|
| 5 | Exceptional fit | Multi-source evidence, directly addresses top pattern |
| 4 | Strong fit | Clear evidence, addresses identified need |
| 3 | Moderate fit | Some evidence, indirect alignment |
| 2 | Weak fit | Limited evidence, minor alignment |
| 1 | Poor fit | No evidence, tangential or risky |

---

## Scoring Matrix

| # | Capability | C1 (30%) | C2 (25%) | C3 (20%) | C4 (15%) | C5 (10%) | **Weighted** |
|---|-----------|----------|----------|----------|----------|----------|-------------|
| 1 | AI-Assisted Code Review | 5 | 4 | 4 | 5 | 5 | **4.55** |
| 2 | Engineering Metrics Dashboard | 4 | 5 | 5 | 5 | 5 | **4.65** |
| 3 | Skills-Based Architecture (Transparency) | 3 | 5 | 5 | 5 | 3 | **4.20** |
| 4 | Deployment Pipeline Automation | 5 | 3 | 3 | 4 | 5 | **3.95** |
| 5 | Team-Specific Calibration | 4 | 5 | 4 | 3 | 4 | **4.10** |
| 6 | Intelligent PR Routing | 4 | 3 | 4 | 4 | 4 | **3.75** |
| 7 | Flaky Test Detection | 3 | 2 | 5 | 5 | 4 | **3.55** |
| 8 | Code Knowledge Graph / Ownership | 3 | 3 | 3 | 3 | 3 | **3.00** |
| 9 | Training & Enablement Program | 3 | 4 | 5 | 4 | 2 | **3.65** |
| 10 | NL Engineering Queries | 2 | 2 | 3 | 2 | 2 | **2.25** |

---

## Score Justifications

### 1. AI-Assisted Code Review (4.55)

| Criterion | Score | Justification |
|-----------|-------|---------------|
| Stakeholder Impact | 5 | Directly addresses #1 complaint (34%) and CTO's "2x productivity" vision |
| Trust Building | 4 | Explainable suggestions build trust; but AI review is also where trust is most fragile |
| Technical Feasibility | 4 | Proven in NovaSoft (45% reduction); monorepo adds complexity but is manageable |
| Timeline Fit | 5 | Core Phase 1 deliverable; 8-week estimate fits pilot timeline |
| ROI Demonstrability | 5 | Review cycle time is already measured (2.3 days) — easiest before/after metric |

### 2. Engineering Metrics Dashboard (4.65)

| Criterion | Score | Justification |
|-----------|-------|---------------|
| Stakeholder Impact | 4 | Enables visibility but doesn't directly reduce cycle time |
| Trust Building | 5 | "Metrics from day 1" proves we're accountable; shows what the AI is actually doing |
| Technical Feasibility | 5 | Standard dashboard tech; data sources well-understood |
| Timeline Fit | 5 | Can ship in first 2 weeks alongside code review |
| ROI Demonstrability | 5 | The dashboard IS the ROI measurement tool |

### 3. Skills-Based Architecture — Transparency (4.20)

| Criterion | Score | Justification |
|-----------|-------|---------------|
| Stakeholder Impact | 3 | Architecture is an enabler, not a direct outcome |
| Trust Building | 5 | Directly addresses CTO's "black box" concern and PREF-002 (see/customize skills) |
| Technical Feasibility | 5 | Already built — our platform, 38 skills, MCP-based |
| Timeline Fit | 5 | Not an implementation task — it's our architecture; demo on day 1 |
| ROI Demonstrability | 3 | Hard to measure transparency directly; manifests through adoption |

### 4. Deployment Pipeline Automation (3.95)

| Criterion | Score | Justification |
|-----------|-------|---------------|
| Stakeholder Impact | 5 | Weekly→daily deployment directly addresses velocity goal; 60% of P1s are deployment-related |
| Trust Building | 3 | Pipeline automation is less trust-sensitive than code review |
| Technical Feasibility | 3 | Jenkins legacy + CircleCI partial migration adds complexity |
| Timeline Fit | 4 | Phase 2 deliverable; depends on Phase 1 code review foundation |
| ROI Demonstrability | 5 | Deployment frequency and P1 incident rate are already tracked |

### 5. Team-Specific Calibration (4.10)

| Criterion | Score | Justification |
|-----------|-------|---------------|
| Stakeholder Impact | 4 | Makes AI suggestions relevant to each team's patterns (REQ-014) |
| Trust Building | 5 | "The system learns YOUR standards" directly counters generic AI skepticism |
| Technical Feasibility | 4 | Calibration system exists; team-specific tuning is straightforward |
| Timeline Fit | 3 | Requires 30-day calibration period — Phase 1 but trailing |
| ROI Demonstrability | 4 | False positive rate tracking shows calibration improvement over time |

### 6. Intelligent PR Routing (3.75)

| Criterion | Score | Justification |
|-----------|-------|---------------|
| Stakeholder Impact | 4 | VP Eng's top pain — context switching from wrong-domain reviews |
| Trust Building | 3 | Routing is less trust-sensitive; people generally accept suggestions |
| Technical Feasibility | 4 | Code knowledge graph from monorepo enables this |
| Timeline Fit | 4 | Phase 2 deliverable; builds on Phase 1 code analysis |
| ROI Demonstrability | 4 | Can measure review relevance and time-to-first-review |

### 7. Flaky Test Detection (3.55)

| Criterion | Score | Justification |
|-----------|-------|---------------|
| Stakeholder Impact | 3 | #2 complaint (28%) but less strategic than review automation |
| Trust Building | 2 | Low trust sensitivity — test tooling is well-understood territory |
| Technical Feasibility | 5 | Well-solved problem; pattern detection on test history |
| Timeline Fit | 5 | Quick win — can deploy in first 2 weeks |
| ROI Demonstrability | 4 | Flaky test count is measurable; developer satisfaction impact |

### 8. Code Knowledge Graph / Ownership (3.00)

| Criterion | Score | Justification |
|-----------|-------|---------------|
| Stakeholder Impact | 3 | Addresses "unclear ownership" (22% complaint) |
| Trust Building | 3 | Neutral — informational tool, not AI judgment |
| Technical Feasibility | 3 | Monorepo analysis is complex but doable |
| Timeline Fit | 3 | Phase 2-3; depends on code analysis infrastructure |
| ROI Demonstrability | 3 | Hard to measure ownership clarity directly |

### 9. Training & Enablement Program (3.65)

| Criterion | Score | Justification |
|-----------|-------|---------------|
| Stakeholder Impact | 3 | Supports adoption but isn't a product capability |
| Trust Building | 4 | Shows investment in their team, not just technology |
| Technical Feasibility | 5 | Well-understood delivery — workshops, docs, office hours |
| Timeline Fit | 4 | Runs parallel to all phases |
| ROI Demonstrability | 2 | Hard to isolate training impact from platform impact |

### 10. Natural Language Engineering Queries (2.25)

| Criterion | Score | Justification |
|-----------|-------|---------------|
| Stakeholder Impact | 2 | "Could have" in RFP — not a priority |
| Trust Building | 2 | Novel but not trust-building — could seem like a gimmick |
| Technical Feasibility | 3 | LLM integration is feasible but scope is ambiguous |
| Timeline Fit | 2 | Phase 3 at earliest; unclear requirements |
| ROI Demonstrability | 2 | Hard to measure value of ad-hoc queries |

---

## Sensitivity Analysis

### What-If: Trust weight increased to 35% (from 25%), Impact reduced to 20%

| Capability | Original Rank | Adjusted Rank | Change |
|------------|---------------|---------------|--------|
| Metrics Dashboard | 1 | 1 | — |
| AI Code Review | 2 | 3 | -1 |
| Skills Architecture | 3 | 2 | +1 |
| Team Calibration | 4 | 3 | — |
| Deployment Pipeline | 5 | 6 | -1 |

**Conclusion:** If trust is even more important than estimated, the proposal should lead with transparency/architecture before capabilities. Rankings are relatively stable — top 5 stays top 5.

### What-If: Timeline weight increased to 25% (from 15%), Trust reduced to 15%

| Capability | Original Rank | Adjusted Rank | Change |
|------------|---------------|---------------|--------|
| Metrics Dashboard | 1 | 1 | — |
| AI Code Review | 2 | 1 | +1 |
| Flaky Test Detection | 7 | 4 | +3 |
| Deployment Pipeline | 5 | 5 | — |

**Conclusion:** If timeline urgency dominates, quick wins (flaky tests, dashboard) rise. Core rankings remain stable.
