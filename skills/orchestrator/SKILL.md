---
name: orchestrator
description: "Unified development orchestration across greenfield and brownfield modes. Detects project mode, performs pre-loop scope discovery, spawns parallel sub-agents, and coordinates execution to minimize loops needed to reach production-quality."
phase: META
category: meta
version: "1.0.0"
depends_on: []
tags: [meta, orchestration, coordination, modes]
---

# Orchestrator

The unified entry point for autonomous development.

## When to Use

- **Any development work** — Orchestrator detects the right mode automatically
- **Fresh directory** — Greenfield mode: get 80% of the way to working app
- **Near-complete app** — Brownfield-polish mode: deploy, UI/UX, data integrity
- **Enterprise codebase** — Brownfield-enterprise mode: surgical, pattern-conforming
- **Parallel systems** — Spawn 6-7 sub-agents on independent work
- **Slash command** — User invokes `/orchestrator` to start

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `mode-detection.md` | Signal taxonomy for mode classification |
| `scope-discovery.md` | Pre-loop gap analysis |
| `parallel-agents.md` | Sub-agent coordination patterns |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `../loop-controller/references/loop-phases.md` | When executing engineering loop phases |
| `loop-state-template.md` | When initializing or resuming orchestration |
| `failure-taxonomy.md` | When handling failures systematically |
| `ui-ux-verification.md` | When in brownfield-polish mode |
| `data-verification.md` | When verifying data integrity |

**Verification:** Ensure mode is detected and confirmed before execution.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Mode detection | `loop-state.json` | Always |
| Scope discovery | `SCOPE-DISCOVERY.md` | Always |
| Estimate | `ESTIMATE.md` | Always |
| Codebase analysis | `CODEBASE-ANALYSIS.md` | Brownfield modes |
| Feature spec | `FEATURESPEC.md` | If creating new system |

## Core Concept

Orchestrator answers: **"What mode should I use, what needs to be done, and how do I minimize loops to get there?"**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR FLOW                                    │
│                                                                             │
│  User invokes /orchestrator                                                 │
│       │                                                                     │
│       ▼                                                                     │
│  ┌──────────────────┐                                                       │
│  │ 1. DETECT MODE   │  Analyze signals, classify project                    │
│  │                  │  → greenfield | brownfield-polish | brownfield-enterprise
│  └────────┬─────────┘  → confirm with user                                  │
│           │                                                                 │
│           ▼                                                                 │
│  ┌──────────────────┐                                                       │
│  │ 2. DISCOVER      │  Pre-loop scope analysis                              │
│  │    SCOPE         │  → gaps, systems, estimated loops                     │
│  └────────┬─────────┘  → "everything that needs to be done"                 │
│           │                                                                 │
│           ▼                                                                 │
│  ┌──────────────────┐                                                       │
│  │ 3. PLAN          │  Decompose into independent systems                   │
│  │    EXECUTION     │  → identify parallelizable work                       │
│  └────────┬─────────┘  → sequence dependent work                            │
│           │                                                                 │
│           ▼                                                                 │
│  ┌──────────────────┐                                                       │
│  │ 4. SPAWN         │  Create sub-agents for parallel work                  │
│  │    SUB-AGENTS    │  → each in own worktree                               │
│  └────────┬─────────┘  → coordinate via shared state                        │
│           │                                                                 │
│           ▼                                                                 │
│  ┌──────────────────┐                                                       │
│  │ 5. EXECUTE       │  Run loop with mode-aware skills                      │
│  │    LOOP          │  → stage gates queue for human                        │
│  └────────┬─────────┘  → calibration feeds future loops                     │
│           │                                                                 │
│           ▼                                                                 │
│  ┌──────────────────┐                                                       │
│  │ 6. RETROSPECT    │  Learn from this loop                                 │
│  │    & ITERATE     │  → update scope if more loops needed                  │
│  └────────┬─────────┘  → fewer loops = more success                         │
│           │                                                                 │
│           ▼                                                                 │
│  Done: Production-quality result                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Quick Start: Execution Checklist

When `/orchestrator` is invoked, execute these steps in order:

### Phase 1: Detect Mode
- [ ] Gather signals (files, git, CI/CD, tests, docs, process artifacts)
- [ ] Weight and score each mode
- [ ] Present detection to user with confidence %
- [ ] Get user confirmation or override
- [ ] Write mode to `loop-state.json`

### Phase 2: Discover Scope
- [ ] Run mode-specific gap analysis
- [ ] Create `SCOPE-DISCOVERY.md` with gaps by severity
- [ ] Identify parallelizable work
- [ ] Estimate loops to completion
- [ ] Get user approval on scope

### Phase 3: Plan Execution
- [ ] Decompose into independent systems
- [ ] Identify sequential dependencies
- [ ] Plan worktree strategy for parallel work
- [ ] Document execution plan

### Phase 4: Execute Loop
- [ ] For each system (parallel or sequential):
  - [ ] Create worktree if parallel
  - [ ] Run: SCAFFOLD → IMPLEMENT → TEST → VERIFY → VALIDATE → DOCUMENT → REVIEW
  - [ ] Request stage gates at checkpoints
  - [ ] Update coordination files
- [ ] Merge completed work
- [ ] Run full test suite

### Phase 5: Ship & Retrospect
- [ ] Final validation
- [ ] Deploy (if polish/enterprise mode)
- [ ] Run retrospective
- [ ] Update calibration data
- [ ] Decide if another loop needed

→ See `references/loop-state-template.md` for initial loop-state.json structure

## The Three Modes

### Greenfield Mode

**Trigger:** Fresh directory, no existing code

**Goal:** Get 80% of the way to a working app in one loop

**Behavior:**
- Full system creation from scratch
- Uses entry-portal for vision capture
- Generates complete feature spec
- Scaffolds entire project structure
- Implements core capabilities
- Defers deployment (user can skip)
- Produces working app skeleton

**Success criteria:**
- App runs locally
- Core features work
- Tests pass
- Ready for polish loop

### Brownfield-Polish Mode

**Trigger:** Small/medium codebase, near completion signals

**Goal:** Ship a production-ready, polished app

**Behavior:**
- Auto-discovers what's missing
- Focuses on deployment setup
- Ensures UI/UX is beautiful (dark mode, responsive)
- Validates all data flows correctly
- Fills documentation gaps
- Runs security/perf checks

**Success criteria:**
- Deployed to production
- UI/UX is polished
- All data flows verified
- Documentation complete
- Security audit passed

### Brownfield-Enterprise Mode

**Trigger:** Large codebase, team signals, process artifacts

**Goal:** Surgical integration matching existing quality

**Behavior:**
- Thorough codebase analysis first
- Follows existing patterns exactly
- Coordinates with other engineers/agents
- Highest-leverage work prioritized
- Surgical changes, no collateral impact
- Full quality gauntlet

**Success criteria:**
- PR matches codebase quality
- No pattern violations
- No regressions
- Coordinated merge

## Step 1: Mode Detection

Invoke the `mode-detector` skill to classify the project.

### Detection Algorithm

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MODE DETECTION ALGORITHM                               │
│                                                                             │
│  1. GATHER SIGNALS                                                          │
│     • File count, LOC                                                       │
│     • Git history depth, contributors                                       │
│     • CI/CD presence                                                        │
│     • Test coverage                                                         │
│     • Documentation state                                                   │
│     • Process artifacts (CODEOWNERS, PR templates, ADRs)                    │
│                                                                             │
│  2. WEIGHT SIGNALS                                                          │
│     • Each signal has a weight and mode indicator                           │
│     • Sum weights per mode                                                  │
│                                                                             │
│  3. CLASSIFY                                                                │
│     • Highest weighted mode wins                                            │
│     • Calculate confidence (margin between top two)                         │
│                                                                             │
│  4. CONFIRM                                                                 │
│     • Present detection to user                                             │
│     • Allow override                                                        │
│     • Store in loop-state.json                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Output Format

```
Mode Detection Results:

  Detected: brownfield-polish
  Confidence: 87%

  Signals:
    [greenfield]  (0 points)
    [polish]      47 files, <10k LOC         (+0.3)
                  23 commits, 1 contributor  (+0.4)
                  No CI/CD configuration     (+0.5)
                  No deployment scripts      (+0.5)
                  Basic tests present        (+0.3)
                  ─────────────────────────
                  Total: 2.0

    [enterprise]  (0.4 points)
                  Has README                 (+0.2)
                  Has package.json           (+0.2)

  Confirm mode? [Y/n/change]:
```

→ See `references/mode-detection.md` for full signal taxonomy

## Step 2: Scope Discovery

Analyze the codebase to identify everything that needs to be done.

### Discovery Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SCOPE DISCOVERY PROCESS                                │
│                                                                             │
│  GREENFIELD:                                                                │
│  • Capture vision (entry-portal)                                            │
│  • Generate system list                                                     │
│  • Create feature specs                                                     │
│  • Estimate scope                                                           │
│                                                                             │
│  BROWNFIELD-POLISH:                                                         │
│  • Scan for deployment gaps                                                 │
│  • Analyze UI/UX state                                                      │
│  • Check data flow completeness                                             │
│  • Find documentation gaps                                                  │
│  • Identify security/perf issues                                            │
│                                                                             │
│  BROWNFIELD-ENTERPRISE:                                                     │
│  • Deep codebase analysis                                                   │
│  • Pattern extraction                                                       │
│  • Dependency mapping                                                       │
│  • Integration point identification                                         │
│  • Roadmap generation                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Gap Categories (MECE)

| Category | What to Check |
|----------|---------------|
| **Deployment** | CI/CD, hosting, env vars, secrets |
| **UI/UX** | Dark mode, responsive, accessibility, polish |
| **Data** | Schema complete, CRUD works, validation |
| **Testing** | Unit, integration, E2E coverage |
| **Documentation** | README, API docs, architecture |
| **Security** | Auth, input validation, secrets handling |

### Output: SCOPE-DISCOVERY.md

```markdown
# Scope Discovery: {project}

## Mode
brownfield-polish (confirmed)

## Gaps Found

### Critical
- [ ] No deployment configuration
- [ ] Database not initialized in production

### High
- [ ] UI needs dark mode styling
- [ ] Data validation incomplete on 3 forms

### Medium
- [ ] Missing integration tests for API
- [ ] README needs usage examples

### Low
- [ ] No API documentation
- [ ] Console warnings in dev mode

## Systems to Build/Fix

| System | Type | Priority | Parallelizable |
|--------|------|----------|----------------|
| Deployment | Gap-fill | Critical | No (sequential) |
| UI Polish | Gap-fill | High | Yes |
| Data Validation | Gap-fill | High | Yes |
| Testing | Gap-fill | Medium | Yes |
| Documentation | Gap-fill | Low | Yes |

## Estimated Loops
2 loops to completion

## Recommended Approach
1. Loop 1: Deployment + UI + Data (parallel where possible)
2. Loop 2: Testing + Documentation + Final polish
```

→ See `references/scope-discovery.md` for detailed analysis patterns

## Step 3: Plan Execution

Decompose work into parallelizable units.

### Parallelization Rules

1. **Independent systems** can run in parallel
2. **Dependent systems** must be sequenced
3. **Shared resources** require locking
4. **Max 7 sub-agents** recommended (resource limit)

### Execution Plan Format

```
Execution Plan:

  Loop 1:
    Sequential:
      [1] Deployment setup (blocks everything else in prod)

    Parallel (after deployment):
      [2a] UI Polish        → Agent 1, worktree: .worktrees/ui-polish
      [2b] Data Validation  → Agent 2, worktree: .worktrees/data-validation
      [2c] API Tests        → Agent 3, worktree: .worktrees/api-tests

  Loop 2 (if needed):
    Parallel:
      [3a] Documentation    → Agent 1
      [3b] Final polish     → Agent 2

  Stage Gates:
    • After deployment: verify prod access
    • After UI: visual review
    • After each agent: merge coordination
```

## Step 4: Spawn Sub-Agents

For parallel work, spawn sub-agents via the Task tool.

### Sub-Agent Spawn Protocol

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SUB-AGENT SPAWN PROTOCOL                               │
│                                                                             │
│  1. CREATE WORKTREE                                                         │
│     git worktree add .worktrees/{system-name} -b feature/{system-name}      │
│                                                                             │
│  2. PREPARE CONTEXT                                                         │
│     • System-specific feature spec                                          │
│     • Mode context (from orchestrator)                                      │
│     • Coordination file paths                                               │
│                                                                             │
│  3. SPAWN VIA TASK TOOL                                                     │
│     Task(                                                                   │
│       subagent_type: "general-purpose",                                     │
│       run_in_background: true,                                              │
│       prompt: [system spec + coordination instructions]                     │
│     )                                                                       │
│                                                                             │
│  4. TRACK IN LOOP-STATE                                                     │
│     • Agent ID                                                              │
│     • Output file path                                                      │
│     • Status: spawning → running → waiting-gate → completed                 │
│                                                                             │
│  5. MONITOR                                                                 │
│     • Check output files periodically                                       │
│     • Watch for gate requests                                               │
│     • Coordinate merges                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Sub-Agent Prompt Template

```markdown
You are a sub-agent of the orchestrator working on: {system-name}

## Mode
{mode} (inherited from orchestrator)

## Your Worktree
{worktree-path}

## Your Task
{system-specific-feature-spec}

## Coordination
- Update progress in: {coordination-path}/agents/{agent-id}.json
- Request gates by writing to: {coordination-path}/gates-pending.json
- Check locks before modifying shared files: {coordination-path}/locks.json

## Rules
1. Stay in your worktree
2. Follow mode-specific patterns
3. Request gate approval at checkpoints
4. Update your status file on completion

Begin execution.
```

→ See `references/parallel-agents.md` for detailed coordination patterns

## Step 5: Execute Loop

Run the engineering loop with mode-aware behavior.

→ See `../loop-controller/references/loop-phases.md` for detailed phase guidance (SCAFFOLD → IMPLEMENT → TEST → VERIFY → VALIDATE → DOCUMENT → REVIEW → SHIP), including rework patterns, phase checklists, and brownfield adaptations.

### Mode-Aware Skill Invocation

| Skill | Greenfield | Polish | Enterprise |
|-------|------------|--------|------------|
| `entry-portal` | Full vision capture | Skip | Skip |
| `spec` | Full 18-section | Gap-focused | Surgical scope |
| `scaffold` | Full structure | Extend only | Minimal touch |
| `implement` | Build everything | Fix gaps | Pattern-match |
| `frontend-design` | Basic styling | Dark mode + polish | Match existing |
| `test-generation` | Core tests | Gap coverage | Match existing |
| `code-verification` | Standard | Standard | Strict pattern check |
| `security-audit` | Basic | Full | Full + compliance |
| `deploy` | Optional/skip | Required | Use existing |

### Stage Gates

At each gate, sub-agents pause and queue for human review:

```json
// coordination/gates-pending.json
{
  "gates": [
    {
      "id": "gate-001",
      "agent": "agent-ui-polish",
      "type": "visual-review",
      "description": "UI styling complete, ready for visual review",
      "artifacts": ["screenshots/home.png", "screenshots/dashboard.png"],
      "requestedAt": "2026-01-20T15:30:00Z",
      "status": "pending"
    }
  ]
}
```

Human reviews and approves:
```bash
# Orchestrator prompts user with queued gates
Gate pending: UI visual review (agent-ui-polish)
  Artifacts: screenshots/home.png, screenshots/dashboard.png

  Approve? [Y/n/feedback]:
```

## Step 6: Retrospect & Iterate

After each loop, run retrospective and calibration.

### Post-Loop Actions

1. **Retrospective** — What worked, what didn't
2. **Calibration** — Record actual vs estimated
3. **Scope update** — What remains for next loop
4. **Decision** — Another loop needed?

### Loop Completion Check

```
Loop 1 Complete:

  Completed:
    [x] Deployment configuration
    [x] UI dark mode styling
    [x] Data validation

  Remaining:
    [ ] Integration tests (medium priority)
    [ ] Documentation (low priority)

  Metrics:
    • Estimated: 4 hours
    • Actual: 3.5 hours
    • Calibration: 0.875x (slightly overestimated)

  Recommendation: Run Loop 2 for remaining items

  Proceed with Loop 2? [Y/n/done]:
```

## Skills Invoked

The orchestrator coordinates these skills based on mode:

```
orchestrator
├── mode-detector (always first)
├── entry-portal (greenfield only)
├── spec
├── estimation
├── architect (if needed)
├── scaffold
├── implement
├── frontend-design (polish mode)
├── test-generation
├── code-verification
├── code-validation
├── integration-test
├── security-audit
├── perf-analysis
├── document
├── code-review
├── deploy (required for polish)
├── retrospective
└── calibration-tracker
```

## Invoking the Orchestrator

### Basic Invocation

```
User: /orchestrator

Orchestrator: Analyzing project...

Mode Detection:
  Detected: brownfield-polish (87% confidence)
  Confirm? [Y/n/change]: y

Scope Discovery:
  Found 6 gaps across 4 categories
  Estimated: 2 loops

Execution Plan:
  Loop 1: Deployment + UI + Data (3 parallel agents)
  Loop 2: Testing + Docs

Proceed? [Y/n]: y

Spawning agents...
  [1/3] agent-deployment started
  [2/3] agent-ui-polish started
  [3/3] agent-data-validation started

Monitoring... (Ctrl+C to pause)
```

### With Mode Override

```
User: /orchestrator --mode=greenfield

Orchestrator: Mode override: greenfield
  Skipping detection, proceeding with greenfield flow...
```

### Resume After Interruption

```
User: /orchestrator --resume

Orchestrator: Resuming from loop-state.json...
  Mode: brownfield-polish
  Loop: 1
  Progress: 2/3 agents complete

  Continuing...
```

## Key Principles

**Detect before assuming.** Let signals guide mode selection, but always confirm.

**Discover before executing.** Pre-loop scope discovery minimizes surprises.

**Parallelize when safe.** Independent work should run concurrently.

**Gate for quality.** Human checkpoints ensure nothing slips through.

**Learn from each loop.** Calibration and retrospectives improve future runs.

**Minimize loops.** The fewer loops to "done", the better the orchestrator is working.

## Design Note: No Mode-Specific Behavior Section

This skill intentionally does not have a "Mode-Specific Behavior" section like other skills in the library. The orchestrator is the **source** of mode-awareness—it detects the mode and then instructs other skills how to behave. The orchestrator's behavior is the same regardless of mode: detect → configure → execute → verify → complete.

The mode-specific behavior logic is contained in this skill's core documentation and references, which define how other skills should adapt based on the detected mode. See `references/mode-detection.md` for the mode detection algorithm and `references/scope-discovery.md` for mode-specific scope handling.

## References

- `references/mode-detection.md`: Signal taxonomy and detection algorithm
- `references/scope-discovery.md`: Gap analysis by mode
- `references/parallel-agents.md`: Sub-agent coordination patterns
- `references/failure-taxonomy.md`: MECE failure classification
- `references/ui-ux-verification.md`: UI/UX quality checks
- `references/data-verification.md`: Data integrity verification
- `references/mode-behavior-standard.md`: Standardized 6-aspect mode behavior template
