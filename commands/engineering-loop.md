# /engineering-loop Command

**Recommended default for implementation tasks.** Full engineering loop with dream state planning, system decomposition, and iterative execution. Show up. Say go.

## Purpose

This command is the **single entry point** for the engineering loop. It starts by understanding your **dream state** (end vision), then decomposes it into **systems** that ladder up to that vision. Each pass through the loop completes one system.

**The flow you want:** arrive in any directory, invoke `/engineering-loop`, describe your dream state, and watch the loop build each system until the vision is realized.

Works for all project types:
- **Greenfield** — Empty directory, build from scratch
- **Brownfield-polish** — Existing code with gaps to fill
- **Brownfield-enterprise** — Large codebase, surgical changes

## Usage

```
/engineering-loop [--mode=MODE] [--resume] [--phase=PHASE] [--skip-analysis]
```

**Options:**
- `--mode=MODE`: Override detected mode (greenfield | brownfield-polish | brownfield-enterprise)
- `--resume`: Resume from existing loop-state.json
- `--phase=PHASE`: Start from specific phase (INIT | SCAFFOLD | IMPLEMENT | etc.)
- `--skip-analysis`: Skip codebase analysis (use existing CODEBASE-ANALYSIS.md)

---

## Prerequisites (MUST DO FIRST)

**Before starting the loop, ensure the orchestrator server is running.**

### Step 1: Check Server Health

```bash
curl -s http://localhost:3002/health
```

**Expected response:** `{"status":"ok","timestamp":"...","version":"..."}`

### Step 2: If Server Not Running

If the health check fails, **DO NOT manually start the server**. The `ensure-orchestrator.sh` hook will automatically:

1. Open a new Terminal/iTerm window
2. Start the server there (with visible logs)
3. Wait for it to become healthy

**Just proceed to call an MCP tool** (like `start_execution`) — the hook triggers on any `mcp__orchestrator__*` call and handles server startup automatically.

**NEVER run `npm start &` in background.** The server needs its own Terminal window for persistent operation and log visibility.

---

## Execution Flow

### Step 1: Cold Start Detection

When invoked, immediately check for existing state:

```
if system-queue.json exists:
  → Show dream state summary, systems completed/remaining
  → Show current system and phase
  → Ask: "Resume {current-system} from {phase}? [Y/n]"
elif loop-state.json exists:
  → Show current phase, pending gates, progress
  → Ask: "Resume from {phase}? [Y/n]"
else:
  → Fresh start
  → Display roadmap status (if ROADMAP.md exists)
  → Proceed to dream state discovery OR select from available moves
```

### Step 1.5: Roadmap Status Display (Fresh Start)

**CRITICAL: On fresh start, ALWAYS display roadmap status before proceeding.**

Call `mcp__orchestrator__start_execution` to get `preLoopContext.roadmapStatus`, then display:

```
═══════════════════════════════════════════════════════════════════════════
  ORCHESTRATOR ROADMAP — AVAILABLE MOVES
═══════════════════════════════════════════════════════════════════════════

  Dream State: {completeModules}/{totalModules} modules ({percentage}%)

  ─────────────────────────────────────────────────────────────────────────
  LAYER PROGRESS
  ─────────────────────────────────────────────────────────────────────────
  [For each layer in layerSummary]:
    Layer {layer}: {complete}/{total} complete

  ─────────────────────────────────────────────────────────────────────────
  AVAILABLE MOVES (Top 5 by leverage)
  ─────────────────────────────────────────────────────────────────────────
  [For each move in availableMoves]:
    {moduleName} (Layer {layer})           Score: {score}
      {description}

  ─────────────────────────────────────────────────────────────────────────
  NEXT HIGHEST LEVERAGE MOVE
  ─────────────────────────────────────────────────────────────────────────

  Recommended: /engineering-loop → {availableMoves[0].moduleName}
  Value Score: {availableMoves[0].score}/10

  Say 'go' to start, or specify a different target.
═══════════════════════════════════════════════════════════════════════════
```

**If roadmapStatus is null** (no ROADMAP.md), proceed directly to dream state discovery.

**If all modules complete** (percentage === 100), display:
```
  Dream State: ACHIEVED ✓ ({totalModules}/{totalModules} modules)

  All roadmap modules are complete. Options:
    1. Start a new project in a different directory
    2. Add new modules to ROADMAP.md
    3. Work on deferred items ({deferredCount} deferred)
```

### Step 2: Dream State Discovery (New Domains)

For fresh starts without an existing system-queue.json, invoke the **entry-portal** skill:

1. **Ask for dream state**: "What's your end vision? What are you trying to build?"

2. **Deep Context Gathering** (CRITICAL — do not rush this):
   - Ask 5-10+ clarifying questions across all dimensions
   - Probe: Problem space, constraints, success criteria, risks, stakeholders
   - Keep asking until user signals "that's everything"
   - Surface and verify all assumptions
   - Batch questions (3-5 at a time) for efficiency

   Example questions:
   ```
   Problem Space:
   - What problem does this solve? Why now?
   - What happens if we don't build this?
   - Has this been tried before? What happened?

   Constraints:
   - Hard constraints (time, money, tech)?
   - Soft preferences (style, approach)?
   - Existing patterns to follow?

   Success Criteria:
   - How will we know this worked?
   - What does "exceptional" look like vs. "acceptable"?

   Risks:
   - What could go wrong?
   - Security/compliance considerations?
   ```

3. **Summarize understanding** back to user before proceeding:
   ```
   Here's my understanding:
   - Problem: [X]
   - Constraints: [Y]
   - Success criteria: [Z]

   Does this capture it? Anything I'm missing?
   ```

4. **Decompose into systems**: Break the dream state into implementable systems
5. **Create dependency graph**: Order systems by dependencies
6. **Generate system queue**: `system-queue.json` with all systems and build order

**Output:**
- `dream-state.md` — Vision document
- `system-queue.json` — Systems to build, ordered by dependencies
- `config.json` — Autonomy configuration

**First system**: The queue's first ready system becomes the current system for this loop pass.

→ See `skills/entry-portal/SKILL.md` for full entry-portal skill details.

### Step 3: Mode Detection

Analyze the directory to classify the project:

| Mode | Signals | Behavior |
|------|---------|----------|
| **greenfield** | No src/, no package.json, empty or minimal | Full creation from scratch |
| **brownfield-polish** | Existing code, <10k LOC, missing deployment/docs | Extend patterns, fill gaps |
| **brownfield-enterprise** | Large codebase (>10k LOC), team artifacts, CI/CD | Surgical changes, full gates |

**Detection algorithm:**
```
Is directory empty/minimal? → greenfield
Has >10k LOC or CI/CD configured? → brownfield-enterprise
Otherwise → brownfield-polish
```

### Step 4: Scope Discovery (Brownfield Only)

For brownfield modes, discover what needs to be built:

**Gap categories:**
1. **Feature gaps** — Missing functionality
2. **Deployment gaps** — No CI/CD, no Docker
3. **Documentation gaps** — Incomplete README, no API docs
4. **Testing gaps** — Low coverage, no integration tests
5. **Security gaps** — Vulnerabilities, no auth
6. **Performance gaps** — Large bundles, slow queries
7. **Tech debt gaps** — Lint errors, TODOs

**Output: `SCOPE-DISCOVERY.md`** with prioritized systems to build.

### Step 5: Codebase Analysis (Brownfield Only)

For brownfield modes, create `CODEBASE-ANALYSIS.md`:
- Tech stack, frameworks, dependencies
- Architecture patterns, directory structure
- Testing framework, lint rules, type system
- Existing conventions to follow

### Step 6: Initialize Loop State

Create `loop-state.json`:

```json
{
  "loop": "engineering-loop",
  "version": "5.1.0",
  "mode": "brownfield-polish",
  "phase": "INIT",
  "status": "active",

  "context": {
    "tier": "system",
    "organization": "personal",
    "system": "orchestrator",
    "module": null
  },

  "dreamState": {
    "path": "./dream-state.md",
    "vision": "Brief summary of the end vision"
  },
  "systemQueue": {
    "path": "./system-queue.json",
    "currentSystem": "sys-002",
    "systemsCompleted": ["sys-001"],
    "systemsRemaining": ["sys-003", "sys-004"],
    "totalSystems": 4
  },

  "gates": {
    "spec-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "architecture-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "verification-gate": { "status": "pending", "required": true, "approvalType": "auto" },
    "validation-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "review-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "deploy-gate": { "status": "pending", "required": false, "approvalType": "conditional" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["entry-portal", "requirements", "spec"] },
    "SCAFFOLD": { "status": "pending", "skills": ["architect", "scaffold"] },
    "IMPLEMENT": { "status": "pending", "skills": ["implement"] },
    "TEST": { "status": "pending", "skills": ["test-generation"] },
    "VERIFY": { "status": "pending", "skills": ["code-verification"] },
    "VALIDATE": { "status": "pending", "skills": ["code-validation", "security-audit"] },
    "DOCUMENT": { "status": "pending", "skills": ["document"] },
    "REVIEW": { "status": "pending", "skills": ["code-review"] },
    "SHIP": { "status": "pending", "skills": ["deploy", "distribute"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

**Note:** On subsequent systems (after first), `entry-portal` is skipped since the system queue already exists.

### Step 7: Execute Phases

Run through all 10 phases. Each phase invokes its assigned skills:

```
INIT ──────────► SCAFFOLD ──────────► IMPLEMENT ──────────► TEST
  │                │                                          │
  │ [spec-gate]    │ [architecture-gate]                      │
  │  human         │  human                                   │
  ▼                ▼                                          ▼
entry-portal*    architect              implement         test-generation
requirements     scaffold               (per feature)     (per feature)
spec

*entry-portal runs only on first system; skipped on subsequent systems

  ▼                ▼                      ▼                   ▼

VERIFY ──────────► VALIDATE ──────────► DOCUMENT ──────────► REVIEW
  │                  │                                         │
  │ [verification]   │ [validation-gate]                       │ [review-gate]
  │  auto            │  human                                  │  human
  ▼                  ▼                                         ▼
code-verification  code-validation       document           code-review
                   security-audit

  ▼                   ▼

SHIP ──────────► COMPLETE
  │
  │ [deploy-gate]
  │  conditional
  ▼
deploy            retrospective
distribute
```

**14 skills across 10 phases, 6 gates (4 human, 1 auto, 1 conditional)**

*entry-portal is conditional — runs only on first system when no system-queue.json exists*

### Distribute Skill (MCP)

The `distribute` skill manages CI/CD automation:
- **Source**: MCP skills-library
- **Deliverable**: `.github/workflows/distribute.yml`
- **Trigger**: Automatically runs when git-workflow merges to main

Flow: deploy → distribute (setup CI/CD) → git-workflow (merge) → distribute.yml (auto-triggered)

### Step 8: Gate Enforcement

Six gates control progression:

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `spec-gate` | INIT | human | User says `approved` | REQUIREMENTS.md, FEATURESPEC.md |
| `architecture-gate` | SCAFFOLD | human | User says `approved` | ARCHITECTURE.md |
| `verification-gate` | VERIFY | auto | Build passes, tests pass, lint clean | VERIFICATION.md |
| `validation-gate` | VALIDATE | human | User says `approved` | VALIDATION.md, SECURITY-AUDIT.md |
| `review-gate` | REVIEW | human | User says `approved` | CODE-REVIEW.md |
| `deploy-gate` | SHIP | conditional | Auto-passes if no deploy target | Deploy artifacts |

**Gate types:**
- **human**: Blocks execution until user explicitly approves. Presents deliverables for review.
- **auto**: Programmatic pass/fail. Runs build, tests, lint — passes if all green, fails with report.
- **conditional**: Auto-passes if the condition isn't met (e.g., no deploy target configured). Otherwise requires approval.

**Gate presentation (human):**
```
═══════════════════════════════════════════════════════════════
║  SPEC GATE                                     [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 REQUIREMENTS.md — Structured requirements             ║
║    📄 FEATURESPEC.md — 18-section feature specification     ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Requirements: 14 extracted, 6 success metrics          ║
║    ✓ Spec: 18 sections, 3 capabilities defined              ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to SCAFFOLD          ║
║    changes: ...  — Request modifications                    ║
║    show spec     — Display FEATURESPEC.md                   ║
║    show reqs     — Display REQUIREMENTS.md                  ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (auto — verification-gate):**
```
═══════════════════════════════════════════════════════════════
║  VERIFICATION GATE                              [AUTO]     ║
║                                                             ║
║  Running checks...                                          ║
║    ✓ Build: clean compile                                   ║
║    ✓ Tests: 47/47 passing                                   ║
║    ✓ Lint: 0 errors, 0 warnings                             ║
║    ✓ Types: no errors                                       ║
║                                                             ║
║  All checks passed. Continuing to VALIDATE.                 ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (auto — verification FAILED):**
```
═══════════════════════════════════════════════════════════════
║  VERIFICATION GATE                      [AUTO] — FAILED    ║
║                                                             ║
║    ✓ Build: clean compile                                   ║
║    ✗ Tests: 45/47 passing (2 failures)                      ║
║    ✓ Lint: 0 errors                                         ║
║                                                             ║
║  VERIFICATION.md written with failure details.              ║
║  Fix failures and re-run VERIFY phase.                      ║
║                                                             ║
║  Commands:                                                  ║
║    go           — Re-run verification checks                ║
║    show verify  — Show VERIFICATION.md                      ║
═══════════════════════════════════════════════════════════════
```

### Step 9: System Completion & Iteration

After COMPLETE phase for the current system:

1. Run retrospective skill → RETROSPECTIVE.md
2. Update calibration metrics
3. Mark current system as `complete` in system-queue.json
4. **Check for next system**:

```
if systemsRemaining > 0:
  → Find next ready system (dependencies met)
  → Update currentSystem in loop-state.json
  → Reset phases to pending (except entry-portal which stays complete)
  → Show: "System {name} complete. Next: {next-system}. Say 'go' to continue."
else:
  → All systems complete
  → Show: "DREAM STATE ACHIEVED 🎯"
  → Present full summary across all systems
```

**Iteration flow:**
```
┌─────────────────────────────────────────────────────────────────┐
│                     ENGINEERING LOOP ITERATION                   │
│                                                                 │
│  System 1          System 2          System 3          Dream    │
│  ┌──────┐          ┌──────┐          ┌──────┐          State    │
│  │ INIT │ ──────►  │ INIT │ ──────►  │ INIT │ ──────►  ✓       │
│  │ ...  │          │ ...  │          │ ...  │                   │
│  │ SHIP │          │ SHIP │          │ SHIP │                   │
│  └──────┘          └──────┘          └──────┘                   │
│     │                 │                 │                       │
│     ▼                 ▼                 ▼                       │
│  complete          complete          complete                   │
│  in queue          in queue          in queue                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Commands During Execution

| Command | Action |
|---------|--------|
| `go` | Continue execution / proceed to next phase |
| `status` | Show current phase, gate status, progress |
| `approved` | Pass current human gate |
| `changes: [feedback]` | Request changes at gate |
| `pause` | Stop after current skill |
| `skip [skill]` | Skip a skill (requires reason) |
| `skip-gate [gate]` | Skip a gate (requires reason) |
| `show [deliverable]` | Display a deliverable |
| `phase [name]` | Jump to specific phase |

## Mode-Specific Behavior

### Greenfield Mode
- **Analysis**: Minimal (nothing to analyze)
- **Gates**: All required
- **Skills**: Full set, no conditionals skipped
- **Approach**: Create everything from scratch

### Brownfield-Polish Mode
- **Analysis**: Full codebase analysis
- **Gates**: All human gates required; deploy-gate conditional
- **Skills**: Skip scaffold if structure exists
- **Approach**: Extend existing patterns exactly

### Brownfield-Enterprise Mode
- **Analysis**: Change-scoped only
- **Gates**: All required, stricter approval
- **Skills**: Minimal set for change
- **Approach**: Surgical, no collateral changes

## Brownfield Phase Adaptations

| Phase | Adaptation |
|-------|------------|
| INIT | Requirements scoped to change; spec references existing system |
| SCAFFOLD | Extend existing structure, don't create parallel |
| IMPLEMENT | Follow discovered patterns exactly |
| TEST | Use existing test framework, match style |
| VERIFY | Run existing lint/type checks + build |
| VALIDATE | Semantic validation + security audit scoped to changes |
| DOCUMENT | Update existing docs, don't duplicate |
| REVIEW | Check for pattern violations against CODEBASE-ANALYSIS.md |
| SHIP | Use existing deploy process |
| COMPLETE | Retrospective scoped to this loop iteration |

### Brownfield Quality Checklist

At each gate, verify:
- [ ] New code follows existing patterns
- [ ] No regressions in existing tests
- [ ] Lint/type checks pass
- [ ] Documentation updated (not duplicated)
- [ ] No breaking changes to existing APIs

## State Files & Artifact Organization

### Permanent Project Files (stay in repo)

| File | Location | Purpose |
|------|----------|---------|
| `ARCHITECTURE.md` | Project root | Architecture decisions |
| `DREAM-STATE.md` | `.claude/` | Vision document — the end goal |
| `system-queue.json` | `.claude/` | Systems/modules to build, progress tracking |

### Transient Loop Artifacts (archived to `~/.claude/runs/`)

| File | Purpose | Archived On |
|------|---------|-------------|
| `loop-state.json` | Current phase, gate status | Completion |
| `REQUIREMENTS.md` | Structured requirements | Completion |
| `FEATURESPEC.md` | Feature specification | Completion |
| `SCOPE-DISCOVERY.md` | Gap analysis (brownfield) | Completion |
| `CODEBASE-ANALYSIS.md` | Discovered patterns | Completion |
| `VERIFICATION.md` | Build/test/lint results | Completion |
| `VALIDATION.md` | Semantic validation findings | Completion |
| `SECURITY-AUDIT.md` | Security audit results | Completion |
| `CODE-REVIEW.md` | Code review findings | Completion |
| `RETROSPECTIVE.md` | Loop retrospective | Completion |

### Archive Structure

```
~/.claude/runs/
└── {year-month}/
    └── {project}-engineering-loop-{timestamp}/
        ├── summary.json           # Metadata
        ├── loop-state.json        # Final state
        ├── REQUIREMENTS.md
        ├── FEATURESPEC.md
        ├── VERIFICATION.md
        └── RETROSPECTIVE.md
```

**Principle:** Project stays clean; loop history lives in `~/.claude/runs/`

## Example Session

```
User: /engineering-loop

Engineering Loop v3.0.0: Scanning directory...

  No existing loop state found.

  Mode Detection:
    Detected: brownfield-polish (92% confidence)

    Signals:
      ✓ 34 files in src/
      ✓ package.json with SvelteKit
      ✓ Existing test suite (vitest)
      ✗ No deployment configuration

  Confirm mode? [Y/n]:

User: y

Engineering Loop: Discovering scope...

  Gap Analysis:
    ❌ Deployment (critical) — No CI/CD, no Docker
    ⚠️  Documentation (medium) — README incomplete
    ⚠️  Testing (medium) — 67% coverage

  ✓ SCOPE-DISCOVERY.md created (3 systems, 2 loops estimated)

Engineering Loop: Analyzing codebase...

  ✓ CODEBASE-ANALYSIS.md created
    Tech: SvelteKit + TypeScript + SQLite
    Testing: Vitest, 67% coverage
    Patterns: Repository pattern, service layer

  Initializing loop state...

  ═══════════════════════════════════════════════════════
  ║  READY — Engineering Loop v3.0.0                    ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Mode: brownfield-polish                            ║
  ║  Phases: 10                                         ║
  ║  Gates: spec → architecture → verification(auto)    ║
  ║         → validation → review → deploy(conditional) ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

══════════════════════════════════════
  INIT                          [1/10]
══════════════════════════════════════

  ┌─ requirements
  │  Analyzing project requirements...
  │  Extracting success metrics...
  │
  │  Output:
  │    📄 REQUIREMENTS.md — 14 requirements, 6 success metrics
  └─ ✓ requirements complete

  ┌─ spec
  │  Reading: REQUIREMENTS.md
  │  Generating feature specification...
  │  Compiling 18 sections...
  │
  │  Output:
  │    📄 FEATURESPEC.md — 18 sections, 3 capabilities
  └─ ✓ spec complete

  ✓ INIT complete (2 skills, 2 deliverables)

  ═══════════════════════════════════════════════════════════════
  ║  SPEC GATE                                     [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 REQUIREMENTS.md — Structured requirements             ║
  ║    📄 FEATURESPEC.md — 18-section feature specification     ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Requirements: 14 extracted, 6 success metrics          ║
  ║    ✓ Spec: 18 sections, 3 capabilities defined              ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to SCAFFOLD          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show spec     — Display FEATURESPEC.md                   ║
  ║    show reqs     — Display REQUIREMENTS.md                  ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: spec-gate ✓

══════════════════════════════════════
  SCAFFOLD                      [2/10]
══════════════════════════════════════

  ┌─ architect
  │  Designing system architecture...
  │  Documenting decisions and trade-offs...
  │
  │  Output:
  │    📄 ARCHITECTURE.md — Architecture decisions
  └─ ✓ architect complete

  ┌─ scaffold
  │  Creating project structure...
  │  Generating boilerplate files...
  │
  │  Output:
  │    📄 Project files scaffolded
  └─ ✓ scaffold complete

  ✓ SCAFFOLD complete (2 skills, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  ARCHITECTURE GATE                               [HUMAN]   ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 ARCHITECTURE.md — Architecture decisions              ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Architecture documented with trade-offs                ║
  ║    ✓ Project structure scaffolded                           ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to IMPLEMENT         ║
  ║    changes: ...  — Request modifications                    ║
  ║    show arch     — Display ARCHITECTURE.md                  ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: architecture-gate ✓

══════════════════════════════════════
  IMPLEMENT                     [3/10]
══════════════════════════════════════

  ┌─ implement
  │  Implementing capability: review-automation...
  │  Implementing capability: dashboard-views...
  │  Implementing capability: deploy-pipeline...
  │
  │  Output:
  │    📄 3 capabilities implemented
  └─ ✓ implement complete

  ✓ IMPLEMENT complete (1 skill, 3 capabilities)

══════════════════════════════════════
  TEST                          [4/10]
══════════════════════════════════════

  ┌─ test-generation
  │  Generating unit tests...
  │  Generating integration tests...
  │
  │  Output:
  │    📄 47 tests generated across 3 capabilities
  └─ ✓ test-generation complete

  ✓ TEST complete (1 skill, 47 tests)

══════════════════════════════════════
  VERIFY                        [5/10]
══════════════════════════════════════

  ┌─ code-verification
  │  Running build...
  │  Running test suite...
  │  Running linter...
  │  Running type checker...
  └─ ✓ code-verification complete

  ═══════════════════════════════════════════════════════════════
  ║  VERIFICATION GATE                              [AUTO]     ║
  ║                                                             ║
  ║  Running checks...                                          ║
  ║    ✓ Build: clean compile                                   ║
  ║    ✓ Tests: 47/47 passing                                   ║
  ║    ✓ Lint: 0 errors                                         ║
  ║    ✓ Types: no errors                                       ║
  ║                                                             ║
  ║  All checks passed. Continuing to VALIDATE.                 ║
  ═══════════════════════════════════════════════════════════════

══════════════════════════════════════
  VALIDATE                      [6/10]
══════════════════════════════════════

  ┌─ code-validation
  │  Running semantic validation...
  │  Checking requirement coverage...
  │
  │  Output:
  │    📄 VALIDATION.md — 3 findings, 0 blockers
  └─ ✓ code-validation complete

  ┌─ security-audit
  │  Running security analysis...
  │  Scanning dependencies...
  │
  │  Output:
  │    📄 SECURITY-AUDIT.md — 0 critical, 1 medium, 2 low
  └─ ✓ security-audit complete

  ✓ VALIDATE complete (2 skills, 2 deliverables)

  ═══════════════════════════════════════════════════════════════
  ║  VALIDATION GATE                                 [HUMAN]   ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 VALIDATION.md — Semantic validation findings          ║
  ║    📄 SECURITY-AUDIT.md — Security audit results            ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Validation: 3 findings, 0 blockers                    ║
  ║    ✓ Security: 0 critical, 1 medium, 2 low                 ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to DOCUMENT          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show validate — Display VALIDATION.md                    ║
  ║    show security — Display SECURITY-AUDIT.md                ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: validation-gate ✓

══════════════════════════════════════
  DOCUMENT                      [7/10]
══════════════════════════════════════

  ┌─ document
  │  Generating documentation...
  │  Updating README...
  └─ ✓ Documentation complete

  ✓ DOCUMENT complete (1 skill)

══════════════════════════════════════
  REVIEW                        [8/10]
══════════════════════════════════════

  ┌─ code-review
  │  Reviewing implementation against spec...
  │  Checking pattern compliance...
  │
  │  Output:
  │    📄 CODE-REVIEW.md — Review findings
  └─ ✓ code-review complete

  ✓ REVIEW complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  REVIEW GATE                                     [HUMAN]   ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 CODE-REVIEW.md — Code review findings                 ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ All patterns followed, no violations                   ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to SHIP              ║
  ║    changes: ...  — Request modifications                    ║
  ║    show review   — Display CODE-REVIEW.md                   ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: review-gate ✓

══════════════════════════════════════
  SHIP                          [9/10]
══════════════════════════════════════

  ┌─ deploy
  │  Checking deploy target...
  └─ ✓ No deploy target configured

  ═══════════════════════════════════════════════════════════════
  ║  DEPLOY GATE                              [CONDITIONAL]    ║
  ║                                                             ║
  ║  Condition: Auto-passes if no deploy target configured.     ║
  ║  Status: No deploy target found.                            ║
  ║                                                             ║
  ║  Condition met. Gate passed automatically.                  ║
  ═══════════════════════════════════════════════════════════════

  ┌─ distribute
  │  Setting up CI/CD workflow...
  └─ ✓ .github/workflows/distribute.yml

  ✓ SHIP complete (2 skills)

══════════════════════════════════════
  COMPLETE                     [10/10]
══════════════════════════════════════

  ┌─ retrospective
  │  Reviewing loop execution...
  └─ ✓ RETROSPECTIVE.md

  ✓ COMPLETE (1 skill, 1 deliverable)

╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   ENGINEERING LOOP COMPLETE                                         ║
║                                                                     ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   PHASES                                                            ║
║   ──────                                                            ║
║   ✓ INIT        Requirements and specification compiled             ║
║   ✓ SCAFFOLD    Architecture designed, project scaffolded           ║
║   ✓ IMPLEMENT   Features built per spec                             ║
║   ✓ TEST        47 tests generated                                  ║
║   ✓ VERIFY      Build, tests, lint all passing                      ║
║   ✓ VALIDATE    Semantic validation + security audit passed         ║
║   ✓ DOCUMENT    Documentation complete                              ║
║   ✓ REVIEW      Code review approved                                ║
║   ✓ SHIP        Deployed and distributed                            ║
║   ✓ COMPLETE    Retrospective captured                              ║
║                                                                     ║
║   GATES PASSED                                                      ║
║   ────────────                                                      ║
║   ✓ Specification Approval [HUMAN]                                  ║
║   ✓ Architecture Approval [HUMAN]                                   ║
║   ✓ Verification Check [AUTO]                                       ║
║   ✓ Validation Approval [HUMAN]                                     ║
║   ✓ Code Review Approval [HUMAN]                                    ║
║   ✓ Deployment Approval [CONDITIONAL]                               ║
║                                                                     ║
║   DELIVERABLES                                                      ║
║   ────────────                                                      ║
║   📄 REQUIREMENTS.md      Structured requirements                   ║
║   📄 FEATURESPEC.md       Feature specification                     ║
║   📄 ARCHITECTURE.md      Architecture decisions                    ║
║   📄 VERIFICATION.md      Build/test/lint results                   ║
║   📄 VALIDATION.md        Semantic validation findings              ║
║   📄 SECURITY-AUDIT.md    Security audit results                    ║
║   📄 CODE-REVIEW.md       Code review findings                      ║
║   📄 RETROSPECTIVE.md     Loop retrospective                        ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
```

## Resuming a Session

```
User: /engineering-loop

Engineering Loop v3.0.0: Found existing loop state.

  Mode: brownfield-polish
  Phase: IMPLEMENT (in progress)

  Completed:
    ✓ INIT
    ✓ SCAFFOLD

  Gates:
    ✓ spec-gate [HUMAN] (approved)
    ✓ architecture-gate [HUMAN] (approved)
    ○ verification-gate [AUTO] (pending)
    ○ validation-gate [HUMAN] (pending)
    ○ review-gate [HUMAN] (pending)
    ○ deploy-gate [CONDITIONAL] (pending)

  Progress: 3/8 capabilities implemented

  Resume? [Y/n]:

User: go

Engineering Loop: Resuming IMPLEMENT phase...
  [4/8] Implementing capability: asset-management...
```

## Clarification Protocol

This loop follows the **Deep Context Protocol**. Before proceeding past INIT:

1. **Probe relentlessly** — Ask 5-10+ clarifying questions across all dimensions
2. **Surface assumptions** — State what you're assuming and verify
3. **Batch questions** — Group related questions (3-5 at a time)
4. **Don't stop early** — Keep asking until the user signals "that's everything"

At every phase transition and gate, pause to ask:
- "Does this match your expectations?"
- "Anything I'm missing?"
- "Any concerns before proceeding?"

See `commands/_shared/clarification-protocol.md` for detailed guidance.

---

## Context Hierarchy

This loop operates within the **Organization → System → Module** hierarchy:

| Tier | Scope | Dream State Location |
|------|-------|---------------------|
| **Organization** | All systems across workspace | `~/.claude/DREAM-STATE.md` |
| **System** | This repository/application | `{repo}/.claude/DREAM-STATE.md` |
| **Module** | Specific concern within system | `{repo}/{path}/.claude/DREAM-STATE.md` or inline |

### Context Loading (Automatic on Init)

When this loop initializes, it automatically loads:

```
1. Organization Dream State (~/.claude/DREAM-STATE.md)
   └── Org-wide vision, active systems, master checklist

2. System Dream State ({repo}/.claude/DREAM-STATE.md)
   └── System vision, modules, progress checklist

3. Recent Runs (auto-injected via query_runs)
   └── Last 3-5 relevant runs for context continuity

4. Memory (patterns, calibration)
   └── Learned patterns from all applicable tiers
```

### Completion Algebra

The engineering-loop builds **modules** that roll up to **systems** that roll up to the **organization**:

```
Organization.done = ALL(System.done)
System.done       = ALL(Module.done)
Module.done       = ALL(Function.operational)
```

Each system in the `system-queue.json` represents a **module** within the current repository/system context.

---

## On Completion

When this loop reaches COMPLETE phase and finishes ALL systems in the queue:

### 1. Archive Run (Full Artifacts)

**Location:** `~/.claude/runs/{year-month}/{project}-engineering-loop-{timestamp}/`

Create a directory containing ALL loop artifacts (not just a JSON summary):

```bash
# Create archive directory
ARCHIVE_DIR=~/.claude/runs/$(date +%Y-%m)/${PROJECT}-engineering-loop-$(date +%Y%m%d-%H%M)
mkdir -p "$ARCHIVE_DIR"

# Archive loop artifacts (transient docs that don't belong in project permanently)
mv loop-state.json "$ARCHIVE_DIR/" 2>/dev/null || true
cp REQUIREMENTS.md FEATURESPEC.md VERIFICATION.md VALIDATION.md \
   SECURITY-AUDIT.md CODE-REVIEW.md RETROSPECTIVE.md \
   SCOPE-DISCOVERY.md CODEBASE-ANALYSIS.md \
   "$ARCHIVE_DIR/" 2>/dev/null || true

# Create summary.json with metadata
cat > "$ARCHIVE_DIR/summary.json" << EOF
{
  "loop": "engineering-loop",
  "project": "${PROJECT}",
  "completed_at": "$(date -Iseconds)",
  "systems_completed": [...],
  "gates_passed": [...],
  "artifacts": [list of files]
}
EOF
```

**Artifact categories:**

| Category | Location | Examples |
|----------|----------|----------|
| **Permanent project docs** | Project root | `ARCHITECTURE.md`, `README.md` |
| **Vision docs** | `{project}/.claude/` | `DREAM-STATE.md`, `system-queue.json` |
| **Loop artifacts** | `~/.claude/runs/` | `RETROSPECTIVE.md`, `VERIFICATION.md`, `*-state.json` |

### 2. Update Dream State

At the System level (`{repo}/.claude/DREAM-STATE.md`):
- Mark completed modules in checklist
- Update system progress percentage
- Append to "Recent Completions"

At the Organization level (`~/.claude/DREAM-STATE.md`):
- Update system status
- Roll up progress

### 3. Commit All Artifacts

**Principle:** A completed loop leaves no orphaned files.

Before archiving, commit permanent project artifacts:

```bash
# Stage permanent project artifacts only
git add ARCHITECTURE.md README.md .claude/ 2>/dev/null || true

# Commit if there are staged changes
git diff --cached --quiet || git commit -m "Loop [N] complete: [system-name]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Note:** This step commits but does NOT push. Use `/distribution-loop` to push to remote and trigger CI/CD.

### 4. Clean Project Directory

Remove transient loop artifacts from project root (they're now in the archive):

```bash
# Remove transient artifacts (already archived)
rm -f REQUIREMENTS.md FEATURESPEC.md VERIFICATION.md VALIDATION.md \
      SECURITY-AUDIT.md CODE-REVIEW.md RETROSPECTIVE.md \
      SCOPE-DISCOVERY.md CODEBASE-ANALYSIS.md \
      loop-state.json 2>/dev/null || true
```

**Keep in project:**
- `ARCHITECTURE.md` - permanent project documentation
- `.claude/DREAM-STATE.md` - vision document
- `.claude/system-queue.json` - module tracking (if modules remain)

**Result:** Project stays clean; all loop history is in `~/.claude/runs/`

### 5. Completion Format (REQUIRED)

Follow the **Completion Format Protocol** (`commands/_shared/completion-format.md`).

**For engineering-loop, this means:**
1. Show completion banner: `/engineering-loop` → `{module}`: COMPLETE
2. List key deliverables (service, tools, endpoints, etc.)
3. Present next highest leverage move with full reasoning (Dream State, Downstream Unlock, Likelihood)
4. Show top 3-4 alternatives considered with scores
5. Display **available moves (unblocked only)** grouped by ROADMAP layer
6. Deferred items go to Layer 7 (not a separate section)
7. Clear call-to-action: "Say 'go' to start /engineering-loop → {recommended}, or specify a different target."

**Leverage scoring** uses the standard formula:
```
       (DSA × 0.40) + (Downstream Unlock × 0.25) + (Likelihood × 0.15)
V = ─────────────────────────────────────────────────────────────────────
                    (Time × 0.10) + (Effort × 0.10)
```

See `commands/_shared/leverage-protocol.md` for scoring details.
See `commands/_shared/completion-format.md` for full format specification.

### 5. Completion Message

```
══════════════════════════════════════════════════════════════
  DREAM STATE ACHIEVED 🎯

  Run archived: ~/.claude/runs/2025-01/orchestrator-engineering-loop-29T14-30.json
  Dream State updated: .claude/DREAM-STATE.md

  Next invocation will start fresh.
══════════════════════════════════════════════════════════════
```

---

## References

This command uses the **skills-library MCP server** for reference materials. When detailed guidance is needed, fetch via:

```
mcp__orchestrator__get_skill(name: "skill-name", includeReferences: true)
```

Available references (8 total):

| Reference | Purpose |
|-----------|---------|
| mode-detection.md | Mode classification signals |
| scope-discovery.md | Gap analysis methodology |
| loop-phases.md | Full phase documentation |
| codebase-analysis.md | Pattern discovery checklist |
| gate-enforcement.md | Gate rules and enforcement |
| pattern-matching.md | Pattern identification guide |
| brownfield-spec-template.md | 18-section brownfield template |
| parallel-agents.md | Multi-agent coordination |

---

## MCP Execution Protocol (REQUIRED for Slack Notifications)

**CRITICAL: All loop executions MUST be tracked through the MCP server to enable Slack thread notifications and execution history.**

### On Loop Start

When the loop begins (after mode detection, before INIT phase), call:

```
mcp__orchestrator__start_execution({
  loopId: "engineering-loop",
  project: "[current project/module name]",
  mode: "[greenfield|brownfield-polish|brownfield-enterprise]"
})
```

**Store the returned `executionId`** — you'll need it for all subsequent calls.

### Pre-Loop Context Loading (MANDATORY)

**CRITICAL: Before proceeding with any phase, you MUST process the `preLoopContext` returned by start_execution.**

The response includes:
```json
{
  "executionId": "...",
  "preLoopContext": {
    "requiredDeliverables": [
      { "phase": "INIT", "skill": "requirements", "deliverables": ["REQUIREMENTS.md"] },
      { "phase": "INIT", "skill": "spec", "deliverables": ["FEATURESPEC.md"] }
    ],
    "skillGuarantees": [
      { "skill": "requirements", "guaranteeCount": 3, "guaranteeNames": ["..."] }
    ],
    "dreamStatePath": ".claude/DREAM-STATE.md",
    "roadmapPath": "ROADMAP.md"
  }
}
```

**You MUST:**
1. **Read the Dream State** (if `dreamStatePath` provided) — understand the vision and checklist
2. **Read the ROADMAP** (if `roadmapPath` provided) — see available next moves for completion proposal
3. **Note all required deliverables** — know what each skill must produce
4. **Note guarantee counts** — understand what will be validated

**DO NOT proceed to INIT phase until you have loaded this context.** Skipping this step causes poor loop execution (missing deliverables, no completion proposal, etc.).

### During Phase Execution

**After completing each skill**, call:
```
mcp__orchestrator__complete_skill({
  executionId: "[stored executionId]",
  skillId: "[skill name, e.g., 'requirements', 'spec', 'implement']",
  deliverables: ["REQUIREMENTS.md", "FEATURESPEC.md"]  // optional
})
```

**After completing all skills in a phase**, call:
```
mcp__orchestrator__complete_phase({
  executionId: "[stored executionId]"
})
```

### At Gates

**When user approves a gate**, call:
```
mcp__orchestrator__approve_gate({
  executionId: "[stored executionId]",
  gateId: "[gate name, e.g., 'spec-gate', 'architecture-gate']",
  approvedBy: "user"
})
```

**When auto-gate passes**, call:
```
mcp__orchestrator__approve_gate({
  executionId: "[stored executionId]",
  gateId: "verification-gate",
  approvedBy: "auto"
})
```

### Phase Transitions

**To advance to the next phase**, call:
```
mcp__orchestrator__advance_phase({
  executionId: "[stored executionId]"
})
```

### Full Execution Flow Example

```
1. Loop invoked: /engineering-loop ooda-clocks
   → start_execution(loopId="engineering-loop", project="ooda-clocks")
   → Store executionId="exec-abc123"
   → Slack: New thread opened "🔄 engineering-loop started: ooda-clocks"

2. INIT phase begins
   → complete_skill(executionId, "entry-portal")
   → complete_skill(executionId, "requirements", deliverables=["REQUIREMENTS.md"])
   → complete_skill(executionId, "spec", deliverables=["FEATURESPEC.md"])
   → complete_phase(executionId)
   → Slack: "✅ INIT complete"

3. Spec gate approval
   → User says "approved"
   → approve_gate(executionId, "spec-gate", approvedBy="user")
   → advance_phase(executionId)
   → Slack: "🚦 spec-gate approved"

4. SCAFFOLD phase...
   [repeat pattern]

5. Loop completion
   → Slack: "🎉 engineering-loop complete: ooda-clocks (42m)"
```

### Why This Matters

Without MCP execution tracking:
- No Slack notifications
- No execution history
- No calibration data collection
- No cross-loop analytics

With MCP execution tracking:
- Thread-per-execution in Slack (all updates in one thread)
- Full execution history and replay
- Calibration metrics for estimates
- Dream state progress tracking

---

## Loop Update Protocol

**CRITICAL: The engineering loop is configured at the USER LEVEL, not project level.**

### Architecture Tiers

```
~/.claude/                          ← USER LEVEL (canonical)
├── CLAUDE.md                       ← Global instructions
├── commands/engineering-loop.md     ← This file (loop definition)
├── hooks.json                      ← User-level hooks config
└── hooks/*.sh                      ← User-level hook scripts

{project}/.claude/                  ← PROJECT LEVEL (overrides)
├── hooks.json                      ← Project-specific hooks (merged)
└── hooks/*.sh                      ← Project-specific scripts

skills-library-mcp/                 ← SKILL DEFINITIONS
└── skills/*/SKILL.md               ← Individual skill definitions
```

### Where to Make Changes

| Change Type | Location | Reason |
|-------------|----------|--------|
| Hook logic | `~/.claude/hooks/` | Applies to ALL projects |
| Hook registration | `~/.claude/hooks.json` | User-level config |
| Loop behavior | `~/.claude/commands/engineering-loop.md` | Single source of truth |
| Skill definitions | `skills-library-mcp/skills/` | MCP-served |
| Project overrides | `{project}/.claude/` | That project only |

### Anti-Pattern

Making loop improvements in `{project}/.claude/` without also updating `~/.claude/`. Changes made only at project level:
- Won't propagate to other projects
- Will be lost when starting new projects
- Create version drift between projects

### Current User-Level Hooks (v1.7.0)

| Hook | Purpose |
|------|---------|
| `gate-status-sync` | Sync gates with skillExecution phase verification |

### Adding New Hooks

1. Create script in `~/.claude/hooks/`
2. Register in `~/.claude/hooks.json`
3. Test in a project
4. Document in this file
5. Run `improve: [description]` to log the change
