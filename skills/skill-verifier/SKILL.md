---
name: skill-verifier
description: "Verifies that skills were applied correctly. Self-audit mechanism that checks process compliance and outcome quality. Ensures required deliverables exist, checklists were completed, and reference documents were consulted. Produces verification report with gaps and remediation actions."
phase: VERIFY
category: meta
version: "1.0.0"
depends_on: []
tags: [meta, verification, quality, audit]
---

# Skill Verifier

Verify skills were applied correctly.

## When to Use

- **After applying any skill** — Verify before proceeding
- **At stage gates** — Verify all skills in stage
- **During retrospective** — Audit full journey
- **On suspicion of gaps** — When something feels incomplete

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `verification-checklists.md` | Skill-specific verification checklists |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| The specific skill's SKILL.md | When verifying that skill's application |
| The specific skill's references | To verify reference utilization |

**Verification:** Produce verification record with PASS/PARTIAL/FAIL status.

## Hook Integration

Verification hooks automate deliverable checking and phase gate validation:

| Hook | Trigger | What it does |
|------|---------|--------------|
| `deliverable-checker` | PostToolUse (Skill) | Warns if expected deliverables missing |
| `phase-gate-check` | PostToolUse (Write/Edit on loop-state.json) | Blocks phase transitions if mandatory skills incomplete |

**Note:** Hooks provide quick automated warnings. This skill performs comprehensive verification with full checklists.

See `.claude/hooks/deliverable-checker.sh`, `.claude/hooks/phase-gate-check.sh`, and `HOOKS.md` for details.

## Core Concept

Skill Verifier answers: **"Was this skill applied correctly?"**

Correctness has two dimensions:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CORRECTNESS DIMENSIONS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PROCESS COMPLIANCE                    OUTCOME QUALITY                      │
│  ──────────────────                    ───────────────                      │
│  • Did I follow all steps?             • Did the output achieve its goal?   │
│  • Did I read required references?     • Is the output complete?            │
│  • Did I produce required deliverable? • Is the output high quality?        │
│  • Did I complete the checklist?       • Would a senior approve this?       │
│                                                                             │
│  Verification checks BOTH dimensions                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## The Verification Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SKILL VERIFICATION PROCESS                              │
│                                                                             │
│  1. IDENTIFY SKILL                                                          │
│     └─→ Which skill was applied?                                            │
│     └─→ Load skill requirements                                             │
│                                                                             │
│  2. CHECK PROCESS COMPLIANCE                                                │
│     └─→ Were all steps followed?                                            │
│     └─→ Were required references read?                                      │
│     └─→ Was required deliverable produced?                                  │
│     └─→ Was checklist completed?                                            │
│                                                                             │
│  3. CHECK OUTCOME QUALITY                                                   │
│     └─→ Does deliverable meet minimum requirements?                         │
│     └─→ Is it complete (no TODOs, no gaps)?                                 │
│     └─→ Would it pass review?                                               │
│                                                                             │
│  4. IDENTIFY GAPS                                                           │
│     └─→ What was missed?                                                    │
│     └─→ What was incomplete?                                                │
│     └─→ What needs remediation?                                             │
│                                                                             │
│  5. PRODUCE REPORT                                                          │
│     └─→ Verification status (PASS/PARTIAL/FAIL)                             │
│     └─→ Gaps identified                                                     │
│     └─→ Remediation actions                                                 │
│                                                                             │
│  6. REMEDIATE (if needed)                                                   │
│     └─→ Address gaps                                                        │
│     └─→ Re-verify                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Required Deliverables Registry

Every skill MUST produce a named deliverable. This registry defines what each skill produces:

| Skill | Required Deliverable | Location |
|-------|---------------------|----------|
| entry-portal | `dream-state.md`, `system-queue.json` | `domain-memory/{domain}/` |
| memory-manager | Handoff: `sessions/{date}-{system}.md` | `domain-memory/{domain}/sessions/` |
| spec | `FEATURESPEC.md` | Project root or `specs/` |
| estimation | `ESTIMATE.md` | Project root |
| triage | Updated `system-queue.json` | `domain-memory/{domain}/` |
| git-workflow | Branch created, commits made | Git repository |
| architect | `ARCHITECTURE.md` or ADRs | Project root or `decisions/` |
| architecture-review | `ARCHITECTURE-REVIEW.md` | Project root |
| **infra-database** | `schema.ts`, `db/index.ts`, `repositories/`, `drizzle.config.ts` | `src/lib/server/db/` |
| **infra-services** | `services/index.ts` with lazy singletons | `src/lib/server/` |
| **infra-docker** | `Dockerfile`, `docker-compose.yml` (optional) | Project root |
| **infra-devenv** | `scripts/dev.sh` or `.devcontainer/` | Project root |
| **infra-monorepo** | `turbo.json` or `pnpm-workspace.yaml` | Monorepo root |
| scaffold | Project structure created | Project directory |
| implement | Source code files | `src/` |
| test-generation | Test files | `tests/` |
| code-verification | `VERIFICATION.md` | Project root |
| debug-assist | Bug fix committed | Git repository |
| code-validation | `VALIDATION.md` | Project root |
| integration-test | Integration test files | `tests/integration/` |
| security-audit | Security section in `VALIDATION.md` | Project root |
| perf-analysis | Performance section in `VALIDATION.md` | Project root |
| document | `README.md`, API docs | Project root |
| code-review | `CODE-REVIEW.md` | Project root |
| refactor | Refactored code + passing tests | `src/` |
| deploy | `DEPLOY.md` | Project root |
| journey-tracer | `JOURNEY.md` | Project root |
| retrospective | `RETROSPECTIVE.md` | `domain-memory/{domain}/` |

## Required References by Skill

Each skill has references that MUST be consulted for proper application:

### entry-portal
| Reference | When Required |
|-----------|---------------|
| `clarifying-questions.md` | Always — guides requirement gathering |
| `system-decomposition.md` | When breaking down large systems |
| `dream-state-template.md` | Always — template for vision document |
| `queue-operations.md` | When managing system queue |

### spec
| Reference | When Required |
|-----------|---------------|
| `18-section-template.md` | Always — defines required sections |
| `capability-format.md` | Always — defines capability structure |
| `feedback-framework.md` | For UI-heavy features |

### architect
| Reference | When Required |
|-----------|---------------|
| `architecture-patterns.md` | When selecting patterns |
| `architectural-drivers.md` | When identifying drivers |
| `adr-template.md` | When documenting decisions |

### architecture-review
| Reference | When Required |
|-----------|---------------|
| `assessment-template.md` | Always — defines review structure |
| `evaluation-dimensions.md` | When scoring against drivers |
| `common-architecture-issues.md` | When identifying issues |
| `red-flags-checklist.md` | Always — quick issue scan |

### implement
| Reference | When Required |
|-----------|---------------|
| `service-layer-patterns.md` | When writing services |
| `error-handling-patterns.md` | Always — error handling required |
| `testing-patterns.md` | When writing tests alongside |

### test-generation
| Reference | When Required |
|-----------|---------------|
| `unit-test-patterns.md` | For unit tests |
| `integration-test-patterns.md` | For integration tests |
| `mocking-patterns.md` | When using mocks |

### security-audit
| Reference | When Required |
|-----------|---------------|
| `owasp-top-10.md` | Always — comprehensive scan |
| `vulnerability-patterns.md` | Always — pattern detection |
| `remediation-patterns.md` | When fixing issues |

### code-review
| Reference | When Required |
|-----------|---------------|
| `maintainability-checklist.md` | Always — quality check |
| `diff-analysis.md` | For PR reviews |
| `feedback-formatting.md` | When writing feedback |

## Verification Checklist Template

```markdown
# Skill Verification: [Skill Name]

**Date:** [Date]
**System:** [System Name]
**Verifier:** [Self/Peer]

## Process Compliance

### Steps Completed
- [ ] Step 1: [Description]
- [ ] Step 2: [Description]
- [ ] Step 3: [Description]
...

### References Consulted
- [ ] [reference-1.md] — [What I learned/applied]
- [ ] [reference-2.md] — [What I learned/applied]
...

### Deliverable Produced
- [ ] [Deliverable name] exists at [location]
- [ ] Deliverable is complete (no TODOs)
- [ ] Deliverable follows template/format

## Outcome Quality

### Completeness
- [ ] All required sections present
- [ ] No placeholder content
- [ ] All edge cases addressed

### Quality
- [ ] Would pass senior review
- [ ] Follows best practices from references
- [ ] No obvious gaps or issues

## Verification Result

| Dimension | Status | Notes |
|-----------|--------|-------|
| Process Compliance | ✅/⚠️/❌ | |
| Outcome Quality | ✅/⚠️/❌ | |
| **Overall** | **PASS/PARTIAL/FAIL** | |

## Gaps Identified

| Gap | Severity | Remediation |
|-----|----------|-------------|
| | | |

## Remediation Actions

1. [ ] [Action 1]
2. [ ] [Action 2]
```

## Verification Triggers

| Trigger | Action |
|---------|--------|
| Skill application complete | Self-verify before proceeding |
| Stage gate reached | Verify all skills in stage |
| Doubt about completeness | Spot verification |
| Retrospective | Full journey verification |

---

## Gate Verification Integration

Skill Verifier is **mandatory** at phase transitions and gates. Verification BLOCKS progress if it fails.

### Automatic Verification Points

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VERIFICATION ENFORCEMENT                                  │
│                                                                             │
│  1. AFTER EACH SKILL                                                        │
│     Run: verify [skill]                                                     │
│     Check: Deliverable exists and is non-empty                              │
│     Action: Log to journey-log.jsonl                                        │
│                                                                             │
│  2. AT PHASE BOUNDARIES                                                     │
│     Run: verify --phase [current-phase]                                     │
│     Check: All required skills completed or skipped                         │
│     Check: All deliverables exist                                           │
│     Action: Block if any verification fails                                 │
│                                                                             │
│  3. AT GATES (spec, architecture, deploy)                                   │
│     Run: verify --gate [gate-name]                                          │
│     Check: Phase verification passes                                        │
│     Check: Gate-specific quality checks                                     │
│     Action: Block transition until all checks pass                          │
│                                                                             │
│  4. AT SYSTEM COMPLETION                                                    │
│     Run: verify --full                                                      │
│     Check: All phases verified                                              │
│     Check: All deliverables present                                         │
│     Check: Journey-log complete                                             │
│     Action: Block completion if gaps found                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Blocking Behavior

When verification fails:

```
⚠️ Verification Failed: [skill/phase/gate]

Status: BLOCKED
Reason: [specific failure reason]

Gaps Found:
  - [gap 1]
  - [gap 2]

Remediation Required:
  1. [action to fix gap 1]
  2. [action to fix gap 2]

Commands:
  - Fix issues, then run: verify
  - To override (not recommended): skip-verify --reason "..."
```

### Phase-Specific Verification

| Phase | Verification Checks |
|-------|---------------------|
| INIT | dream-state.md exists, FEATURESPEC.md exists, ESTIMATE.md exists |
| SCAFFOLD | ARCHITECTURE.md exists, package.json exists, src/ directory exists, **infrastructure checks (if applicable)** |
| IMPLEMENT | Source files created for current capability |
| TEST | Test files created for current capability |
| VERIFY | Build passes, tests pass, no lint errors |
| VALIDATE | All tests pass, security audit complete, perf analyzed |
| DOCUMENT | README.md exists and is non-empty |
| REVIEW | Code review notes exist or PR ready |
| SHIP | Deployment confirmed or deploy target configured |
| COMPLETE | RETROSPECTIVE.md exists, calibration.json updated, HANDOFF.md exists |

### Infrastructure Verification (SCAFFOLD Phase)

For backend/fullstack/api systems, SCAFFOLD phase also verifies:

| Check | What's Verified |
|-------|-----------------|
| Database | `schema.ts`, `db/index.ts`, `drizzle.config.ts`, `repositories/` exist |
| Services | `services/index.ts` exists with lazy singleton pattern |
| Dependencies | `drizzle-orm`, `better-sqlite3` in package.json |
| Scripts | `db:push`, `db:generate` scripts defined |
| Data | `data/` directory exists, `.gitignore` excludes it |

Run `verify-infra` or `.claude/hooks/verify-infrastructure.sh` for comprehensive check.

### Gate-Specific Verification

| Gate | Required Verifications | Quality Checks |
|------|------------------------|----------------|
| spec | FEATURESPEC.md exists | Has capabilities section, not empty |
| architecture | ARCHITECTURE.md exists | Has components section, has decisions |
| infrastructure | Database schema, repositories, services | (backend/fullstack/api only) |
| deploy | All prior phases verified | All tests pass, no security criticals |

### Verification Commands

```bash
# Verify single skill
verify [skill-name]

# Verify current phase
verify --phase

# Verify specific gate
verify --gate [spec|architecture|infrastructure|deploy]

# Verify infrastructure specifically
verify-infra
.claude/hooks/verify-infrastructure.sh [system-dir] [--verbose]

# Full system verification
verify --full

# Show verification status
check-phase

# Skip verification with reason (use sparingly)
skip-verify [skill] --reason "explanation"
skip-infra --reason "explanation"
```

### Verification Report Format

```json
{
  "timestamp": "2026-01-18T12:00:00Z",
  "type": "phase",
  "phase": "INIT",
  "status": "pass|partial|fail",
  "skills": {
    "entry-portal": { "status": "pass", "deliverable": "dream-state.md" },
    "requirements": { "status": "pass", "deliverable": "FEATURESPEC.md" },
    "spec": { "status": "pass", "deliverable": "FEATURESPEC.md" },
    "estimation": { "status": "fail", "reason": "ESTIMATE.md not found" },
    "triage": { "status": "skipped", "reason": "Single system, no prioritization needed" },
    "memory-manager": { "status": "pass", "deliverable": "loop-state.json loaded" }
  },
  "gaps": [
    { "skill": "estimation", "gap": "Missing ESTIMATE.md", "severity": "medium" }
  ],
  "blocking": true,
  "message": "Cannot proceed to SCAFFOLD: estimation skill not completed"
}
```

## Integration with Journey Tracer

Skill Verifier produces verification records that feed into the journey tracer:

```json
{
  "skill": "architect",
  "timestamp": "2025-01-17T10:30:00Z",
  "verification": {
    "processCompliance": "pass",
    "outcomeQuality": "partial",
    "overall": "partial"
  },
  "referencesRead": [
    "architecture-patterns.md",
    "adr-template.md"
  ],
  "deliverableProduced": "ARCHITECTURE.md",
  "gaps": [
    {
      "description": "No formal ADR created",
      "severity": "medium",
      "remediated": true
    }
  ]
}
```

## Self-Audit Questions

When verifying your own skill application, ask:

### Process Questions
1. Did I read the SKILL.md completely before starting?
2. Did I consult the required references?
3. Did I follow all steps in order?
4. Did I produce the required deliverable?
5. Did I complete any checklists in the skill?

### Outcome Questions
1. Is the deliverable complete?
2. Would a senior engineer approve this?
3. Does it match the quality of examples in references?
4. Are there any obvious gaps?
5. Would I be confident defending this in review?

### Honesty Check
1. Did I skip anything to save time/tokens?
2. Am I claiming completion without verification?
3. Are there parts I'm uncertain about?

## Reference Emphasis Mechanism

To ensure references are consulted:

### Before Starting a Skill
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔍 REFERENCE CHECK                                                          │
│                                                                             │
│  Before applying [skill], you MUST read:                                    │
│                                                                             │
│  □ [reference-1.md] — [Why it's essential]                                  │
│  □ [reference-2.md] — [Why it's essential]                                  │
│                                                                             │
│  Skipping references leads to:                                              │
│  • Incomplete application                                                   │
│  • Missing best practices                                                   │
│  • Rework during verification                                               │
│                                                                             │
│  Time investment: ~2-5 minutes reading                                      │
│  Value: Correct application, no rework                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Reference Reading Protocol

1. **Scan first** — Read headers and key points (30 seconds)
2. **Deep read relevant sections** — Based on current context (1-2 minutes)
3. **Extract actionable guidance** — Note what applies to current task
4. **Apply during skill execution** — Reference while working
5. **Verify against reference** — Check output matches guidance

## Common Verification Failures

| Failure | Cause | Prevention |
|---------|-------|------------|
| Missing deliverable | Forgot to create file | Check registry before marking complete |
| Incomplete deliverable | Rushed, skipped sections | Use template, check all sections |
| Skipped references | Token saving | Read references first, always |
| Skipped steps | Assumed not needed | Follow all steps, note if N/A |
| Low quality output | No self-review | Apply outcome quality questions |

## Verification Cadence

| Context | When to Verify |
|---------|----------------|
| **Tight loop** | After each skill (quick check) |
| **Standard** | At stage boundaries |
| **Review mode** | Full verification of all skills |
| **Retrospective** | Complete journey audit |

## Mode-Specific Behavior

Verification requirements differ by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full—complete verification at each stage |
| **Approach** | Comprehensive—full process compliance and outcome quality checks |
| **Patterns** | Free choice—establish verification patterns |
| **Deliverables** | Full—all required deliverables must exist |
| **Validation** | Standard—all required references must be consulted |
| **Constraints** | Minimal—block stage transitions on any verification failure |

**Greenfield verification:**
- Full process compliance check
- Full outcome quality check
- All deliverables required
- Block stage transitions on failure

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-specific—focused on gaps and new/modified deliverables |
| **Approach** | Extend existing—verify compatibility with existing artifacts |
| **Patterns** | Should match—follow existing verification patterns |
| **Deliverables** | Delta—verify new/modified deliverables only |
| **Validation** | Existing + new—relevant references for gaps |
| **Constraints** | Don't break—block only on critical gaps |

**Polish verification:**
- Verify gap remediation complete
- Check new deliverables only
- Verify compatibility with existing
- Focus on "did we make it better?"

**Polish considerations:**
```markdown
- [ ] Gaps identified in triage addressed
- [ ] New deliverables follow existing patterns
- [ ] Existing functionality not broken
- [ ] Tests pass (existing + new)
```

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change-specific—verify only what changed |
| **Approach** | Surgical—minimal verification footprint |
| **Patterns** | Must conform exactly—strict compliance with existing verification |
| **Deliverables** | Change record—only change-related deliverables |
| **Validation** | Full regression—CI/CD pipeline must pass |
| **Constraints** | Requires approval—block on any CI/CD failure |

**Enterprise verification:**
- Verify specific change implemented
- Verify no regressions
- Verify CI/CD pipeline passes
- Verify documentation updated

**Enterprise verification checklist:**
```markdown
- [ ] Change implemented as specified
- [ ] Existing tests still pass
- [ ] New tests for changed code
- [ ] CI/CD pipeline green
- [ ] No regressions in affected areas
- [ ] Documentation reflects change
```

### Verification Strictness by Mode

| Aspect | Greenfield | Polish | Enterprise |
|--------|------------|--------|------------|
| **Blocking failures** | All | Critical only | CI/CD failures |
| **Required deliverables** | Full set | Gaps only | Change-related |
| **Reference checking** | Mandatory | Recommended | Optional |
| **Quality bar** | High | Match existing | Zero regression |

→ See `references/verification-checklists.md` for skill-specific checklists
