---
name: retrospective
description: "Analyzes completed journeys to extract learning and propose improvements. Identifies what worked, what didn't, and why. Generates skill amendment proposals, calibration adjustments, and pattern candidates. Feeds improvements back into the skills library to make future journeys more effective."
phase: COMPLETE
category: meta
version: "1.0.0"
depends_on: []
tags: [learning, improvement, metrics, feedback, core-workflow]
---

# Retrospective

Learn from completed journeys.

## When to Use

- **After system completion** — Analyze the full journey
- **After significant milestone** — Mid-journey learning
- **After failure** — Understand what went wrong
- **Periodically** — Aggregate learning across domains

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `retrospective-templates.md` | Templates for retrospective documents |
| `root-cause-analysis.md` | 5 Whys methodology |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `amendment-process.md` | When proposing skill changes |

**Verification:** Ensure RETROSPECTIVE.md is produced with root causes identified.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `RETROSPECTIVE.md` | Project root | Always |

## Core Concept

Retrospective answers: **"What should we do differently next time?"**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RETROSPECTIVE                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INPUT                              OUTPUT                                  │
│  ─────                              ──────                                  │
│                                                                             │
│  Journey Data ─────────────────────▶ What worked well                       │
│  Verification Results ─────────────▶ What didn't work                       │
│  Metrics ──────────────────────────▶ Why (root causes)                      │
│  Team Feedback ────────────────────▶ Skill amendments                       │
│                                      Calibration adjustments                │
│                                      New patterns                           │
│                                      Process changes                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## The Retrospective Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RETROSPECTIVE PROCESS                                   │
│                                                                             │
│  1. GATHER DATA                                                             │
│     └─→ Load journey summary (from journey-tracer)                          │
│     └─→ Load verification results                                           │
│     └─→ Load metrics (estimate vs actual)                                   │
│     └─→ Collect any human feedback                                          │
│                                                                             │
│  2. ANALYZE WHAT WORKED                                                     │
│     └─→ Skills with good verification                                       │
│     └─→ Estimates that were accurate                                        │
│     └─→ Patterns that succeeded                                             │
│     └─→ References that provided value                                      │
│                                                                             │
│  3. ANALYZE WHAT DIDN'T WORK                                                │
│     └─→ Skills with partial/failed verification                             │
│     └─→ Estimates that were off                                             │
│     └─→ Gaps in skill application                                           │
│     └─→ References that were skipped                                        │
│                                                                             │
│  4. ROOT CAUSE ANALYSIS                                                     │
│     └─→ Why did things work/not work?                                       │
│     └─→ 5 Whys for significant issues                                       │
│     └─→ Contributing factors                                                │
│                                                                             │
│  5. GENERATE IMPROVEMENTS                                                   │
│     └─→ Skill amendment proposals                                           │
│     └─→ Calibration adjustments                                             │
│     └─→ New pattern candidates                                              │
│     └─→ Process change recommendations                                      │
│                                                                             │
│  6. PRIORITIZE                                                              │
│     └─→ Impact vs effort                                                    │
│     └─→ Frequency of issue                                                  │
│     └─→ Risk of not addressing                                              │
│                                                                             │
│  7. DOCUMENT & INTEGRATE                                                    │
│     └─→ Produce RETROSPECTIVE.md                                            │
│     └─→ Create amendment PRs                                                │
│     └─→ Update calibration data                                             │
│     └─→ Archive patterns                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Retrospective Document (RETROSPECTIVE.md)

### Template

```markdown
# Retrospective: [System Name]

**Domain:** [Domain Name]
**Date:** [Date]
**Journey Duration:** [X hours]
**Facilitator:** [Agent/Human]

---

## Summary

| Metric | Value |
|--------|-------|
| Skills Applied | [N] |
| Verification Pass Rate | [X%] |
| Estimation Accuracy | [X%] |
| Reference Utilization | [X%] |
| Rework Cycles | [N] |

**One-line summary:** [What happened in this journey]

---

## What Worked Well

### Skills
| Skill | Why It Worked | Pattern to Keep |
|-------|---------------|-----------------|
| | | |

### Processes
| Process | Outcome | Keep Because |
|---------|---------|--------------|
| | | |

### References
| Reference | Value Provided | Usage Rate |
|-----------|----------------|------------|
| | | |

---

## What Didn't Work

### Skills
| Skill | Issue | Impact | Frequency |
|-------|-------|--------|-----------|
| | | | |

### Gaps
| Gap | Where | Impact |
|-----|-------|--------|
| | | |

### Skipped Steps
| Skill | Step Skipped | Why | Impact |
|-------|--------------|-----|--------|
| | | | |

---

## Root Cause Analysis

### Issue 1: [Issue Title]

**Symptom:** [What was observed]

**5 Whys:**
1. Why? [First level]
2. Why? [Second level]
3. Why? [Third level]
4. Why? [Fourth level]
5. Why? [Root cause]

**Contributing Factors:**
- [Factor 1]
- [Factor 2]

**Category:** [Skill gap | Process gap | Knowledge gap | Tool gap]

---

### Issue 2: [Issue Title]

[Repeat analysis...]

---

## Improvement Proposals

### Skill Amendments

| Skill | Amendment | Rationale | Priority |
|-------|-----------|-----------|----------|
| architecture-review | Require ARCHITECTURE-REVIEW.md deliverable | Skill was skipped without explicit artifact | P0 |
| spec | Add non-web system guidance | Template assumes web app | P1 |
| test-generation | Add minimum coverage requirement | Easy to skip integration tests | P1 |
| entry-portal | Make GitHub publish optional | Not all projects use GitHub | P2 |

#### Amendment Detail: [Skill Name]

**Current State:**
[What the skill currently says/does]

**Proposed Change:**
[What should be added/modified]

**Rationale:**
[Why this change improves outcomes]

**Implementation:**
- [ ] Update SKILL.md section [X]
- [ ] Add reference document [Y]
- [ ] Update verification checklist

---

### Calibration Adjustments

| Category | Previous Multiplier | New Multiplier | Based On |
|----------|---------------------|----------------|----------|
| MCP Server | N/A | 0.3x | This journey (26h estimated, 4.5h actual) |
| TypeScript | 1.0x | 0.8x | [Evidence] |

**Note:** These are per-domain calibrations. Cross-domain patterns require more data.

---

### New Patterns Identified

| Pattern | Context | Template Candidate? |
|---------|---------|---------------------|
| Service + Tool architecture for MCP | MCP servers | Yes |
| Layered validation (Schema → Service → Tool) | Data-heavy systems | Yes |

#### Pattern Detail: [Pattern Name]

**Context:** [When this pattern applies]

**Solution:** [What the pattern is]

**Example:** [Brief example from this journey]

**Codify as:** [Reference doc | Template | Skill section]

---

### Process Changes

| Change | Current | Proposed | Benefit |
|--------|---------|----------|---------|
| Reference check | Optional | Required before skill | Higher quality |
| Build verification | Optional | Required in scaffold | Catch errors early |

---

## Action Items

### Immediate (This Session)

| Action | Owner | Status |
|--------|-------|--------|
| Create skill amendment for architecture-review | Agent | [ ] |
| Update calibration data | Agent | [ ] |
| Archive service-tool pattern | Agent | [ ] |

### Next Journey

| Action | When | Verification |
|--------|------|--------------|
| Read all required references | Before each skill | Check in journey log |
| Create ADRs for decisions | During architect | Check in verification |
| Run build after scaffold | After scaffold | Check in verification |

### Backlog

| Action | Priority | Effort |
|--------|----------|--------|
| Add MCP project template | P2 | Medium |
| Multi-language support for implement | P3 | High |

---

## Learning Integration

### Exported to Calibration Tracker
- [ ] Estimate vs actual: 26h → 4.5h
- [ ] Skill-level timing data

### Pattern Candidates for Extraction
- [ ] Service-tool MCP architecture
- [ ] Layered validation pattern

### Skill Amendments Queued
- [ ] architecture-review: require deliverable
- [ ] spec: non-web guidance
- [ ] test-generation: minimum coverage

---

## Retrospective Meta

**What worked about this retrospective:**
- [Observation]

**What could improve:**
- [Observation]

---

*Retrospective completed by retrospective skill*
```

## Learning Data Management

### Per-Domain Learning

Each domain maintains its own learning data:

```
domain-memory/{domain}/
├── learning/
│   ├── retrospectives/
│   │   ├── 2025-01-17-system-1.md
│   │   └── 2025-01-20-system-2.md
│   ├── calibration.json
│   └── patterns.json
```

### Calibration Data Format

```json
{
  "domain": "skills-library-mcp",
  "estimates": [
    {
      "system": "Skills Library MCP",
      "date": "2025-01-17",
      "estimated": {
        "hours": 26,
        "complexity": "M",
        "confidence": "high"
      },
      "actual": {
        "hours": 4.5,
        "complexity": "M"
      },
      "ratio": 0.17,
      "notes": "Agentic execution much faster than estimated"
    }
  ],
  "adjustments": {
    "agenticMultiplier": 0.3,
    "complexityFactors": {
      "mcp": 0.8,
      "typescript": 0.9
    }
  }
}
```

### Pattern Archive Format

```json
{
  "domain": "skills-library-mcp",
  "patterns": [
    {
      "name": "Service-Tool MCP Architecture",
      "context": "Building MCP servers with multiple tools",
      "solution": "Layer: Tools → Services → FileService → Filesystem",
      "example": "skills-library-mcp",
      "confidence": "medium",
      "uses": 1,
      "templateCandidate": true
    }
  ]
}
```

## Improvement Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      IMPROVEMENT LIFECYCLE                                   │
│                                                                             │
│  1. IDENTIFY (Retrospective)                                                │
│     └─→ Gap or issue discovered                                             │
│     └─→ Documented in retrospective                                         │
│                                                                             │
│  2. PROPOSE (Amendment)                                                     │
│     └─→ Specific change proposed                                            │
│     └─→ Rationale documented                                                │
│     └─→ Priority assigned                                                   │
│                                                                             │
│  3. REVIEW                                                                  │
│     └─→ Human reviews proposal                                              │
│     └─→ Approve / Modify / Reject                                           │
│                                                                             │
│  4. IMPLEMENT                                                               │
│     └─→ Update skill SKILL.md                                               │
│     └─→ Update references if needed                                         │
│     └─→ Update verification checklist                                       │
│                                                                             │
│  5. VERIFY                                                                  │
│     └─→ Next journey uses updated skill                                     │
│     └─→ Check if improvement achieved                                       │
│     └─→ Adjust if needed                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Anti-Patterns

### What NOT to do

| Anti-Pattern | Problem | Instead |
|--------------|---------|---------|
| Change everything | Introduces instability | Small, targeted changes |
| Skip root cause | Treats symptoms | Always do 5 Whys |
| No verification | Don't know if it worked | Plan verification in next journey |
| Over-optimize | Diminishing returns | Focus on high-impact issues |
| Blame | Not constructive | Focus on process, not individuals |

## Integration with Other Skills

| Skill | Integration |
|-------|-------------|
| journey-tracer | Provides input data |
| calibration-tracker | Receives calibration adjustments |
| skill-verifier | Uses updated verification criteria |
| loop-controller | Uses updated process recommendations |

## Retrospective Verification Checklist

```markdown
## retrospective Verification

### Process
- [ ] Journey data gathered
- [ ] What worked analyzed
- [ ] What didn't work analyzed
- [ ] Root cause analysis for major issues
- [ ] Improvement proposals generated
- [ ] Priorities assigned
- [ ] Action items identified

### Deliverables
- [ ] RETROSPECTIVE.md exists
- [ ] All sections complete
- [ ] Improvements are actionable
- [ ] Calibration data updated

### Quality
- [ ] Root causes identified (not symptoms)
- [ ] Improvements are specific
- [ ] Priorities are justified
- [ ] Integration points documented
```

→ See `references/retrospective-templates.md` for additional templates
→ See `references/root-cause-analysis.md` for 5 Whys methodology

## Mode-Specific Behavior

Retrospective scope and improvement proposals differ by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full system journey analysis |
| **Approach** | Comprehensive improvement identification |
| **Patterns** | Free choice of retrospective format |
| **Deliverables** | Full RETROSPECTIVE.md + improvement proposals |
| **Validation** | Standard retrospective verification |
| **Constraints** | Minimal - full learning extraction |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-filling journey analysis |
| **Approach** | Extend learning with integration focus |
| **Patterns** | Should match existing documentation style |
| **Deliverables** | Delta retrospective with gap focus |
| **Validation** | Gap-specific learning verified |
| **Constraints** | Don't restructure existing learnings |

**Polish considerations:**
- What worked in integrating with existing code
- Gaps in understanding existing system
- Reference utilization for brownfield
- Pattern conformance issues

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change-specific post-mortem only |
| **Approach** | Surgical compliance-focused analysis |
| **Patterns** | Must conform exactly to audit requirements |
| **Deliverables** | Change post-mortem (audit trail) |
| **Validation** | Full compliance verification |
| **Constraints** | Requires approval for any improvement proposals |

**Enterprise retrospective constraints:**
- Focus on process compliance, not improvement
- Amendments require change board approval
- Primary goal is audit trail, not optimization
- Pattern changes are out of scope

**Enterprise retrospective format:**
```markdown
# Post-Implementation Review: [CR-12345]

## Compliance Summary
| Requirement | Met | Evidence |
|-------------|-----|----------|
| Change approval | ✅ | CR-12345 |
| Testing complete | ✅ | Test report |
| Rollback tested | ✅ | Staging test |

## Observations (Non-Binding)
- [Observation for future reference]
```
