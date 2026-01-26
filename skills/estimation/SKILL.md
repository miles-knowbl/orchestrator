---
name: estimation
description: "Estimate effort, complexity, and duration for systems and features. Provides frameworks for sizing work, accounting for risk, and calibrating estimates over time. Supports planning and expectation setting throughout the engineering loop."
phase: INIT
category: core
version: "1.0.0"
depends_on: []
tags: [planning, estimation, sizing, effort]
---

# Estimation

Predict effort before you build.

## When to Use

- **New system** — Estimate before starting implementation
- **Feature planning** — Size work for prioritization
- **Sprint planning** — Break down into time-boxed chunks
- **Stakeholder communication** — Set realistic expectations
- **Resource allocation** — Plan team capacity
- **Trade-off decisions** — Compare build vs buy, now vs later

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `estimation-methods.md` | Different estimation approaches |
| `estimate-template.md` | Format for estimate documentation |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `complexity-factors.md` | When assessing complexity |

**Verification:** Check calibration data before finalizing estimate.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `ESTIMATE.md` | Project root | Always |

## Core Concept

Estimation answers: **"How much effort will this take?"**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ESTIMATION                                           │
│                                                                             │
│  INPUT                           OUTPUT                                     │
│  ─────                           ──────                                     │
│  FeatureSpec ──────────────────▶ Complexity: Large                          │
│  Context     ──────────────────▶ Effort: 40-60 hours                        │
│  Constraints ──────────────────▶ Duration: 2-3 weeks                        │
│                                  Risk: Medium (1.5x buffer)                 │
│                                  Confidence: Medium                         │
│                                                                             │
│  Estimation is NOT a commitment — it's a forecast with uncertainty          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Estimation Dimensions

| Dimension | What It Measures | Units |
|-----------|------------------|-------|
| **Complexity** | How hard is this? | S / M / L / XL |
| **Effort** | How much work? | Person-hours or person-days |
| **Duration** | How long on calendar? | Days or weeks |
| **Risk** | How uncertain? | Multiplier (1.2x - 3x) |
| **Confidence** | How sure are we? | High / Medium / Low |

### Complexity vs Effort vs Duration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  COMPLEXITY ≠ EFFORT ≠ DURATION                                             │
│                                                                             │
│  Example: Database migration                                                │
│                                                                             │
│  Complexity: Small (straightforward script)                                 │
│  Effort: 4 hours (write, test, document)                                    │
│  Duration: 2 weeks (needs DBA review, maintenance window)                   │
│                                                                             │
│  Example: New microservice                                                  │
│                                                                             │
│  Complexity: Large (many moving parts)                                      │
│  Effort: 80 hours                                                           │
│  Duration: 2 weeks (if 1 person) or 1 week (if 2 people)                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## The Estimation Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ESTIMATION PROCESS                                      │
│                                                                             │
│  1. UNDERSTAND SCOPE                                                        │
│     └─→ Read FeatureSpec thoroughly                                         │
│     └─→ Identify all capabilities                                           │
│     └─→ Note interfaces and integrations                                    │
│     └─→ List unknowns and assumptions                                       │
│                                                                             │
│  2. BREAK DOWN                                                              │
│     └─→ Decompose into estimable chunks                                     │
│     └─→ Each chunk should be < 1 day of work                                │
│     └─→ Identify dependencies between chunks                                │
│                                                                             │
│  3. SIZE EACH CHUNK                                                         │
│     └─→ Apply estimation method                                             │
│     └─→ Note complexity factors                                             │
│     └─→ Record assumptions                                                  │
│                                                                             │
│  4. ACCOUNT FOR RISK                                                        │
│     └─→ Identify uncertainties                                              │
│     └─→ Apply risk multiplier                                               │
│     └─→ Consider worst-case scenarios                                       │
│                                                                             │
│  5. AGGREGATE                                                               │
│     └─→ Sum effort estimates                                                │
│     └─→ Calculate duration (accounting for parallelism)                     │
│     └─→ State confidence level                                              │
│                                                                             │
│  6. COMMUNICATE                                                             │
│     └─→ Present as range, not point                                         │
│     └─→ Explain assumptions and risks                                       │
│     └─→ Update as you learn more                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Applying Calibration Data

**IMPORTANT:** Before finalizing any estimate, check for historical calibration data.

### Step 1.5: Load Calibration

After understanding scope (Step 1), load calibration data:

```
1. Check for calibration file:
   Path: learning/calibration.json

2. If found, extract relevant multipliers:
   - adjustments.global.agenticMultiplier (if agentic execution)
   - adjustments.byComplexity[SIZE] (S/M/L/XL)
   - adjustments.byPhase[PHASE] (per-phase adjustments)
   - adjustments.byCategory[CATEGORY] (domain-specific)

3. Check confidence levels:
   - < 3 samples: Do NOT apply (flag for future tracking)
   - 3-5 samples: Apply cautiously with ±30% range note
   - 6+ samples: Apply with confidence
```

### Applying Phase Multipliers

When using Skill-Phase Estimation, apply historical adjustments:

```markdown
## Calibrated Skill-Phase Estimate

| Phase | Base Hours | Multiplier (samples) | Adjusted | Confidence |
|-------|-----------|----------------------|----------|------------|
| spec | 0.5h | 1.15 (8) | 0.58h | Good |
| architect | 1h | 1.25 (8) | 1.25h | Good |
| implement | 6h | 0.75 (12) | 4.5h | Good |
| test | 2h | 0.80 (10) | 1.6h | Good |
| verify | 0.5h | 1.0 (3) | 0.5h | Low |
| **Total** | **12.5h** | | **10.3h** | |

Calibration impact: -18% from historical data
```

### Document Calibration in ESTIMATE.md

Add a calibration section to every estimate:

```markdown
## Calibration Applied

| Adjustment | Multiplier | Samples | Confidence | Applied |
|------------|------------|---------|------------|---------|
| Global agentic | 0.3x | 6 | Good | Yes |
| Complexity (M) | 0.85x | 4 | Low | Yes (±30%) |
| Phase: IMPLEMENT | 0.75x | 12 | Good | Yes |
| Phase: TEST | 0.80x | 10 | Good | Yes |
| Category: MCP | 1.1x | 2 | None | No (n<3) |

### Unadjusted Estimate
- Total: 12.5 hours

### Calibrated Estimate
- Total: 10.3 hours
- Adjustments applied: 4
- Adjustments skipped (low confidence): 1
- Overall confidence: Medium-High
```

### Confidence Rules

| Samples | Confidence | Action |
|---------|------------|--------|
| 0 | None | Use 1.0x (no adjustment) |
| 1-2 | Very Low | Do NOT apply, flag for tracking |
| 3-5 | Low | Apply with ±30% range note |
| 6-10 | Medium | Apply with ±20% range |
| 10+ | High | Apply with confidence |

### No Calibration Data

If `learning/calibration.json` doesn't exist or has no relevant data:

```markdown
## Calibration Applied

No historical calibration data available for this domain.

Using base estimates. After completion:
- Actual hours will be recorded
- Calibration multipliers will be calculated
- Future estimates will benefit from this data

This estimate contributes to: First calibration baseline
```

## Estimation Methods

### 1. T-Shirt Sizing

Quick relative sizing for early planning.

| Size | Relative Effort | Typical Duration | Example |
|------|-----------------|------------------|---------|
| **S** | 1x | < 1 day | Add a field, fix a bug |
| **M** | 2-3x | 1-3 days | New endpoint, simple feature |
| **L** | 5-8x | 1-2 weeks | New service, complex feature |
| **XL** | 13-20x | 2-4 weeks | Major system, many integrations |

**When to use:** Initial scoping, backlog grooming, rough planning.

### 2. Analogous Estimation

Compare to similar past work.

```markdown
## Analogous Estimate

**Item:** User notification service
**Similar to:** Email service (completed 3 months ago)

| Aspect | Email Service | Notification Service | Adjustment |
|--------|---------------|---------------------|------------|
| Core logic | 20 hours | Similar | 20 hours |
| Integrations | 2 (SMTP, templates) | 4 (push, SMS, email, in-app) | 40 hours (+20) |
| Testing | 8 hours | More channels | 16 hours |
| **Total** | **40 hours** | | **76 hours** |

**Confidence:** Medium (similar but more integrations)
```

**When to use:** You've done similar work before.

### 3. Parametric Estimation

Calculate based on countable units.

```markdown
## Parametric Estimate

**Item:** REST API for Order Service

| Component | Count | Hours Each | Total |
|-----------|-------|------------|-------|
| Endpoints | 8 | 3 | 24 |
| Database models | 4 | 2 | 8 |
| Integration tests | 8 | 1.5 | 12 |
| Documentation | 8 | 0.5 | 4 |
| **Subtotal** | | | **48** |
| Setup/config | | | 8 |
| **Total** | | | **56 hours** |

**Basis:** Historical average of 3 hours per endpoint (including tests)
```

**When to use:** Repetitive, well-understood work.

### 4. Three-Point Estimation

Account for uncertainty with optimistic/likely/pessimistic.

```markdown
## Three-Point Estimate

**Item:** Payment integration

| Scenario | Estimate | Notes |
|----------|----------|-------|
| Optimistic (O) | 24 hours | Clean API, good docs, no issues |
| Most Likely (M) | 40 hours | Typical integration challenges |
| Pessimistic (P) | 80 hours | Poor API, compliance issues, rework |

**PERT Estimate:** (O + 4M + P) / 6 = (24 + 160 + 80) / 6 = **44 hours**
**Standard Deviation:** (P - O) / 6 = 9.3 hours

**Range:** 35-53 hours (±1 SD)
**Confidence:** Medium
```

**When to use:** Significant uncertainty, need to communicate risk.

### 5. Bottom-Up Estimation

Sum detailed task estimates.

```markdown
## Bottom-Up Estimate

**Item:** Work Order Service

### Capability 1: Work Order CRUD
| Task | Hours |
|------|-------|
| Database schema | 2 |
| Model and repository | 3 |
| Create endpoint | 2 |
| Read endpoints (list, detail) | 3 |
| Update endpoint | 2 |
| Delete endpoint | 1 |
| Unit tests | 4 |
| Integration tests | 3 |
| **Subtotal** | **20** |

### Capability 2: Assignment
| Task | Hours |
|------|-------|
| Assignment logic | 4 |
| Availability check | 3 |
| Notification trigger | 2 |
| Tests | 4 |
| **Subtotal** | **13** |

[... more capabilities ...]

### Summary
| Capability | Hours |
|------------|-------|
| CRUD | 20 |
| Assignment | 13 |
| Status transitions | 10 |
| Completion flow | 12 |
| **Implementation total** | **55** |
| Scaffolding | 4 |
| Documentation | 6 |
| Code review / fixes | 8 |
| **Grand total** | **73 hours** |
```

**When to use:** Detailed planning, accurate forecasts, sprint commitment.

### 6. Skill-Phase Estimation

Estimate by engineering skill/phase for calibration accuracy.

```markdown
## Skill-Phase Estimate

**Item:** Work Order Service

### Phase Breakdown

| Phase | Skill | Estimated | Notes |
|-------|-------|-----------|-------|
| Specification | spec | 0.5h | FEATURESPEC.md |
| Specification | estimation | 0.25h | This document |
| Architecture | architect | 1h | ARCHITECTURE.md |
| Setup | scaffold | 0.5h | Project structure |
| Implementation | implement | 6h | 4 capabilities |
| Testing | test-generation | 2h | Unit + integration |
| Verification | code-verification | 0.5h | Lint, types, tests |
| Validation | code-validation | 0.5h | Full system check |
| Documentation | document | 0.5h | README, API docs |
| Review | code-review | 0.5h | Self-review, PR |
| Ship | deploy | 0.25h | PR, merge |
| **Total** | | **12.5h** | |

### Per-Capability Breakdown

For skills called multiple times (implement, test-generation, code-verification):

| ID | Capability | Implement | Test | Verify | Total |
|----|------------|-----------|------|--------|-------|
| C1 | Work Order CRUD | 90m | 30m | 10m | 130m |
| C2 | Assignment | 60m | 20m | 5m | 85m |
| C3 | Status transitions | 45m | 15m | 5m | 65m |
| C4 | Completion flow | 60m | 20m | 5m | 85m |
| **Total** | | 4.25h | 1.4h | 0.4h | 6.1h |
```

**Why use this:** 
- Maps directly to skillsLog for calibration
- Calibration compares estimate vs actual per-skill
- Identifies which phases we systematically over/under-estimate

**When to use:** All agentic execution. This is the primary estimation format.

→ See `references/estimation-methods.md`

## Complexity Factors

Apply multipliers for conditions that increase difficulty:

| Factor | Impact | Multiplier |
|--------|--------|------------|
| **New technology** | Learning curve, unknowns | +50-200% |
| **Integration complexity** | Each external system | +20-40% per integration |
| **Security requirements** | Auth, encryption, audit | +30-50% |
| **Performance requirements** | Optimization, caching | +20-40% |
| **Regulatory/compliance** | Documentation, controls | +50-100% |
| **UI complexity** | Complex interactions, polish | +20-50% |
| **Data migration** | ETL, validation, rollback | +30-100% |
| **Legacy code** | Understanding, compatibility | +30-50% |
| **Distributed system** | Coordination, consistency | +40-80% |
| **Real-time requirements** | WebSockets, streaming | +30-50% |

### Applying Factors

```markdown
## Complexity-Adjusted Estimate

**Base estimate:** 40 hours

**Applicable factors:**
- New technology (learning Kafka): +50% → +20 hours
- 2 integrations (Auth, Inventory): +30% each → +24 hours
- Security (handles PII): +30% → +12 hours

**Adjusted estimate:** 40 + 20 + 24 + 12 = **96 hours**

Note: Factors may overlap; apply judgment to avoid double-counting.
```

→ See `references/complexity-factors.md`

## Risk and Uncertainty

### Risk Categories

| Category | Examples | Impact |
|----------|----------|--------|
| **Technical** | New tech, complex algorithms, performance | High variance |
| **Integration** | Third-party APIs, legacy systems | Dependencies |
| **Requirements** | Unclear scope, changing needs | Rework |
| **Resource** | Key person unavailable, skill gaps | Delays |
| **External** | Vendor delays, regulatory changes | Blockers |

### Risk Multipliers

| Confidence | Risk Level | Multiplier | When to Apply |
|------------|------------|------------|---------------|
| High | Low | 1.0-1.2x | Well-understood, done before |
| Medium | Medium | 1.3-1.5x | Some unknowns, new elements |
| Low | High | 1.5-2.0x | Many unknowns, new territory |
| Very Low | Very High | 2.0-3.0x | Unprecedented, research-like |

### Communicating Uncertainty

Always present estimates as ranges:

```
❌ "It will take 40 hours"
✅ "I estimate 30-50 hours, most likely around 40"

❌ "We'll be done in 2 weeks"  
✅ "Target is 2 weeks; risk factors could push to 3 weeks"
```

## Estimate Output Format

```markdown
# Estimate: [System/Feature Name]

## Summary

| Dimension | Value |
|-----------|-------|
| Complexity | [S/M/L/XL] |
| Effort | [X-Y hours] |
| Duration | [X-Y days/weeks] |
| Confidence | [High/Medium/Low] |
| Risk Multiplier | [1.Xx] |

## Scope

[What's included]
- Capability 1
- Capability 2
- [...]

[What's NOT included]
- Out of scope item 1
- [...]

## Breakdown

| Component | Base Hours | Factors | Adjusted |
|-----------|------------|---------|----------|
| [Component 1] | X | [factors] | Y |
| [Component 2] | X | [factors] | Y |
| **Total** | | | **Z** |

## Assumptions

- [Assumption 1]
- [Assumption 2]

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| [Risk 1] | [H/M/L] | [H/M/L] | [Action] |

## Dependencies

- Requires [X] to be complete
- Blocked by [Y] until [date]

## Historical Comparison

[Similar past work and how this compares]

---
*Estimated by: [Agent/Person]*
*Date: [Date]*
*Valid until: [Date or "requirements change"]*
```

→ See `references/estimate-template.md`

## Calibration

Track estimates vs actuals to improve over time.

### Tracking Template

```markdown
## Estimate Retrospective

**System:** Work Order Service
**Estimated:** 73 hours
**Actual:** 92 hours
**Variance:** +26%

### What Was Different?

| Component | Estimated | Actual | Variance | Why |
|-----------|-----------|--------|----------|-----|
| CRUD | 20 | 18 | -10% | Went smoothly |
| Assignment | 13 | 24 | +85% | Availability logic more complex |
| Status | 10 | 14 | +40% | Edge cases discovered |
| Completion | 12 | 15 | +25% | Signature handling tricky |
| Other | 18 | 21 | +17% | Normal variance |

### Lessons Learned

1. Assignment logic always more complex than expected → increase multiplier
2. Need to account for edge case discovery → add 20% buffer
3. Integration tests took longer than unit tests → adjust ratio

### Adjustment for Future

- Assignment/scheduling features: apply 1.5x multiplier
- Add 15% buffer for edge case discovery
```

### Calibration Metrics

| Metric | Calculation | Target |
|--------|-------------|--------|
| **Accuracy** | Actual / Estimated | 0.9 - 1.1 |
| **Precision** | Std dev of (Actual / Estimated) | < 0.3 |
| **Bias** | Average (Actual - Estimated) | ~0 |

```
Consistent underestimate → Increase base estimates
Consistent overestimate → Decrease base estimates
High variance → Break down further, reduce unknowns
```

→ See `references/calibration-guide.md`

## Common Estimation Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| **Forgetting overhead** | Only count coding time | Add 20-30% for meetings, reviews, context switching |
| **Optimism bias** | Assume best case | Use three-point or add buffer |
| **Anchoring** | First number sticks | Estimate independently, then compare |
| **Scope creep** | Requirements grow | Document assumptions, re-estimate on change |
| **Hero estimates** | "I could do it in X" | Estimate for average developer |
| **Ignoring dependencies** | Assume parallel work | Map dependencies, account for handoffs |
| **Not updating** | Stale estimates | Re-estimate as you learn |

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `spec` | Provides scope to estimate |
| `triage` | Uses estimates for prioritization |
| `entry-portal` | Estimates feed into queue planning |
| `loop-controller` | Estimates inform session planning |

## Key Principles

**Estimate in ranges.** Point estimates are false precision.

**Break it down.** Smaller pieces are easier to estimate.

**Document assumptions.** They're as important as the number.

**Track and learn.** Calibrate based on actuals.

**Update when things change.** Estimates have a shelf life.

**Communicate uncertainty.** Stakeholders need to understand risk.

## Mode-Specific Behavior

Estimation approach differs by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full system—all capabilities and layers |
| **Approach** | Comprehensive—bottom-up + skill-phase |
| **Patterns** | Free choice—establish estimation baselines |
| **Deliverables** | Full estimate with risk factors |
| **Validation** | Historical comparison from similar projects |
| **Constraints** | Minimal—medium to high uncertainty expected |

**Greenfield estimation:**
- Estimate all layers (data, service, API, UI)
- Include scaffolding and setup time
- Account for learning curve on new patterns
- Plan for comprehensive test coverage
- Include documentation time

**Greenfield risk factors:**
```
Base estimate: X hours
+ New technology learning: +30-50%
+ Architecture decisions: +20-30%
+ Comprehensive testing: +20-30%
+ Documentation: +10-15%
= Adjusted estimate: 1.8x - 2.2x base
```

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-specific—missing capabilities only |
| **Approach** | Extend existing—gap-based estimation |
| **Patterns** | Should match existing velocity patterns |
| **Deliverables** | Gap-based estimate with compatibility buffer |
| **Validation** | Velocity in this codebase |
| **Constraints** | Low to medium uncertainty—known territory |

**Polish estimation:**
- Estimate only what's missing
- Include time to understand existing code
- Account for maintaining compatibility
- Reduced testing (fill gaps only)
- Minimal documentation updates

**Polish estimation formula:**
```
For each gap:
  Understanding time: 0.5-2 hours (existing code review)
  Implementation time: Based on gap complexity
  Testing time: Match existing coverage
  Integration time: Ensure compatibility

Total = Sum of gaps × 1.2 (compatibility buffer)
```

**Polish-specific factors:**
| Factor | Impact |
|--------|--------|
| Code quality | Low quality = +30-50% |
| Test coverage | Low coverage = +20-40% |
| Documentation | Poor docs = +20-30% |
| Coupling | High coupling = +20-40% |

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change-specific—single change only |
| **Approach** | Surgical—change-impact analysis |
| **Patterns** | Must conform exactly to team velocity |
| **Deliverables** | Change estimate with review cycles |
| **Validation** | Team velocity in this system |
| **Constraints** | Low uncertainty—constrained scope |

**Enterprise estimation:**
- Estimate the specific change
- Include impact analysis time
- Account for review cycles
- Plan for comprehensive testing (regression)
- Include CI/CD pipeline time

**Enterprise estimation formula:**
```
Impact analysis: 1-4 hours
Implementation: Based on change size
Regression testing: Proportional to risk
Review cycles: 2-4 hours per cycle
CI/CD: Fixed (pipeline duration)
Buffer for process: +20%
```

**Enterprise constraints:**
- Fixed time for security review
- Fixed time for compliance checks
- Multiple approval stages
- Scheduled deployment windows

### Mode Comparison

| Aspect | Greenfield | Polish | Enterprise |
|--------|------------|--------|------------|
| **Typical multiplier** | 1.8x - 2.2x | 1.2x - 1.5x | 1.1x - 1.3x |
| **Biggest uncertainty** | Architecture | Compatibility | Process |
| **Estimation unit** | Capabilities | Gaps | Changes |
| **Calibration source** | Similar projects | This codebase | This system |

### Estimation Output by Mode

**Greenfield estimate structure:**
```markdown
## Estimate: [System Name]
Complexity: L (new system)
Base effort: 80 hours
Risk multiplier: 1.8x
Adjusted: 120-160 hours
Confidence: Medium
```

**Polish estimate structure:**
```markdown
## Estimate: [Gap Fill]
Gaps identified: 5
Base effort: 24 hours
Compatibility buffer: 1.2x
Adjusted: 28-32 hours
Confidence: Medium-High
```

**Enterprise estimate structure:**
```markdown
## Estimate: [Change Request]
Change scope: Minimal (2 files)
Implementation: 8 hours
Review/process: 6 hours
Total: 14-16 hours
Confidence: High
```

## References

- `references/estimation-methods.md`: Detailed method explanations
- `references/complexity-factors.md`: Factor catalog with examples
- `references/estimate-template.md`: Standard estimate document
- `references/calibration-guide.md`: Improving estimates over time
