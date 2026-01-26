# Context Patterns

## High-Confidence Patterns

### PAT-001: Review Pipeline is the Primary Bottleneck
- **Evidence:** SRC-001 (2.3-day cycle), SRC-002 (top complaint at 34%), SRC-005 (largest team has slowest reviews)
- **Frequency:** 3 sources, 6 mentions
- **Signal:** Code review is where the most velocity is lost. Not code writing, not deployment, not testing — review.
- **Action:** Position AI-assisted review as the lead value proposition. Quantify: 2.3 days → 1.1 days = 1.2 days saved per PR x 120 PRs/week = 144 engineer-days/week recovered.

### PAT-002: Trust Deficit from Prior AI Experience
- **Evidence:** SRC-003 (CTO bad experience), SRC-005 (judgment replacement concern), SRC-006 (61% industry distrust)
- **Frequency:** 3 sources, 5 mentions
- **Signal:** TechFlow is not a naive buyer. They've tried AI tools and been disappointed. Every claim must be backed by evidence.
- **Action:** Lead with case studies, not capabilities. Offer pilot before commitment. Emphasize explainability as architectural principle, not feature.

### PAT-003: Transparency as Non-Negotiable
- **Evidence:** SRC-003 (CTO values explainability), SRC-005 (human-in-the-loop required), SRC-003 (wants to see skills)
- **Frequency:** 3 sources, 5 mentions
- **Signal:** "How does it work?" will be asked before "What does it do?" Skills-based approach is the direct answer.
- **Action:** Architecture section must explain skills, loops, and decision tracing. Include screenshot/demo of skill inspection.

### PAT-004: Metrics-Driven Decision Making
- **Evidence:** SRC-003 (ROI within 6 months), SRC-008 (NovaSoft — metrics from day 1), SRC-001 (engineering assessment with baseline data)
- **Frequency:** 3 sources, 4 mentions
- **Signal:** TechFlow has baseline metrics and expects measurable improvement. They've already benchmarked themselves (6.2 satisfaction, 2.3-day reviews, 15% rework).
- **Action:** Include before/after targets tied to their own baselines. Dashboard is Phase 1, not Phase 2.

### PAT-005: Developer Experience Trumps Feature Count
- **Evidence:** SRC-004 (must feel native), SRC-005 (Copilot criticism), SRC-002 (satisfaction below average)
- **Frequency:** 3 sources, 4 mentions
- **Signal:** Engineers will reject good technology with bad UX. Adoption depends on friction reduction, not feature addition.
- **Action:** Emphasize GitHub-native integration. Zero new tools to learn. Platform works inside their existing workflow.

### PAT-006: Champion Team Strategy Works
- **Evidence:** SRC-003 (CTO prefers 2 pilot teams), SRC-008 (NovaSoft champion teams critical)
- **Frequency:** 2 sources, 3 mentions
- **Signal:** Both client preference and prior experience align on phased pilot. This is the only viable adoption strategy.
- **Action:** Propose specific pilot team selection criteria. Reference NovaSoft pilot success.

---

## Medium-Confidence Patterns

### PAT-007: Operational Toil is a Hidden Cost
- **Evidence:** SRC-004 (VP Eng spends 30% on operational tasks), SRC-002 (unclear ownership at 22% complaints)
- **Frequency:** 2 sources, 3 mentions
- **Signal:** Beyond review automation, there's significant value in automating operational coordination — ownership routing, standup summaries, blocker detection.
- **Action:** Position operational automation as Phase 2 value. Quick wins that compound leadership trust.

### PAT-008: Monorepo Creates Both Constraint and Opportunity
- **Evidence:** SRC-002 (2.1M LOC monorepo), CON-005 (must be preserved)
- **Frequency:** 2 sources, 2 mentions
- **Signal:** Monorepo is non-negotiable architecture. But it also means the code knowledge graph is contained — easier to build expertise mapping.
- **Action:** Frame monorepo as advantage for AI: "single source of truth means better analysis." Address scale challenges honestly.

### PAT-009: Retainer Appetite Exists
- **Evidence:** SRC-003 (CTO open to ongoing retainer), Theme 5 (customization desire)
- **Frequency:** 2 sources, 2 mentions
- **Signal:** TechFlow sees this as a partnership, not a one-time project. The self-improving nature of the platform supports ongoing engagement.
- **Action:** Include retainer option in pricing. Position as "continuous improvement partnership."

---

## Low-Confidence Patterns

### PAT-010: Budget Flexibility Beyond Stated Range
- **Evidence:** SRC-003 (CTO "could go higher for the right solution")
- **Frequency:** 1 source, 1 mention
- **Signal:** Possible budget upside, but single-source and informal.
- **Action:** Stay within $500K-$800K range. Include optional premium tier that could push higher if value is demonstrated.

---

## Pattern Relationships

| Pattern A | Relationship | Pattern B |
|-----------|-------------|-----------|
| PAT-001 (Review Bottleneck) | **drives** | PAT-004 (Metrics-Driven) |
| PAT-002 (Trust Deficit) | **requires** | PAT-003 (Transparency) |
| PAT-003 (Transparency) | **satisfied by** | PAT-006 (Champion Strategy) |
| PAT-004 (Metrics-Driven) | **reinforces** | PAT-006 (Champion Strategy) |
| PAT-005 (Dev Experience) | **constrains** | PAT-001 (Review Bottleneck solution) |
| PAT-007 (Operational Toil) | **extends** | PAT-001 (Review Bottleneck) |
| PAT-008 (Monorepo) | **enables** | PAT-001 (Review Bottleneck solution) |
| PAT-009 (Retainer) | **depends on** | PAT-004 (Metrics-Driven ROI proof) |

---

## Absence Patterns (What's NOT Mentioned)

| Expected Topic | Status | Interpretation |
|---------------|--------|----------------|
| Competitive alternatives being evaluated | Absent | Either sole-source or they don't want to reveal |
| Change management plan | Absent | Likely not considered — we should include it |
| AI model fine-tuning expectations | Absent | May assume off-the-shelf; our skills approach is different |
| Data residency requirements | Absent | SOC 2 mentioned but not data location — clarify |
| Long-term platform ownership | Absent | Open question: do they want to eventually run it themselves? |
