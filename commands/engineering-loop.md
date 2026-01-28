# /engineering-loop Command

**Recommended default for implementation tasks.** Full engineering loop with phases, gates, and systems. Show up. Say go.

## Purpose

This command is the **single entry point** for the engineering loop. It handles everything: mode detection, scope discovery, and execution of all 10 phases with enforced quality gates.

**The flow you want:** arrive in any directory, invoke `/engineering-loop`, say `go`, and watch the loop execute.

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

## Execution Flow

### Step 1: Cold Start Detection

When invoked, immediately check for existing state:

```
if loop-state.json exists:
  → Show current phase, pending gates, progress
  → Ask: "Resume from {phase}? [Y/n]"
else:
  → Fresh start, proceed to mode detection
```

### Step 2: Mode Detection

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

### Step 3: Scope Discovery (Brownfield Only)

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

### Step 4: Codebase Analysis (Brownfield Only)

For brownfield modes, create `CODEBASE-ANALYSIS.md`:
- Tech stack, frameworks, dependencies
- Architecture patterns, directory structure
- Testing framework, lint rules, type system
- Existing conventions to follow

### Step 5: Initialize Loop State

Create `loop-state.json`:

```json
{
  "loop": "engineering-loop",
  "version": "3.0.0",
  "mode": "brownfield-polish",
  "phase": "INIT",
  "status": "active",
  "gates": {
    "spec-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "architecture-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "verification-gate": { "status": "pending", "required": true, "approvalType": "auto" },
    "validation-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "review-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "deploy-gate": { "status": "pending", "required": false, "approvalType": "conditional" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["requirements", "spec"] },
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

### Step 6: Execute Phases

Run through all 10 phases. Each phase invokes its assigned skills:

```
INIT ──────────► SCAFFOLD ──────────► IMPLEMENT ──────────► TEST
  │                │                                          │
  │ [spec-gate]    │ [architecture-gate]                      │
  │  human         │  human                                   │
  ▼                ▼                                          ▼
requirements     architect              implement         test-generation
spec             scaffold               (per feature)     (per feature)

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

**13 skills across 10 phases, 6 gates (4 human, 1 auto, 1 conditional)**

### Distribute Skill (MCP)

The `distribute` skill manages CI/CD automation:
- **Source**: MCP skills-library
- **Deliverable**: `.github/workflows/distribute.yml`
- **Trigger**: Automatically runs when git-workflow merges to main

Flow: deploy → distribute (setup CI/CD) → git-workflow (merge) → distribute.yml (auto-triggered)

### Step 7: Gate Enforcement

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

### Step 8: Loop Completion

After COMPLETE phase:
1. Run retrospective skill → RETROSPECTIVE.md
2. Update calibration metrics
3. Present summary with deliverables produced, gates passed, and key metrics
4. Check if scope requires additional loops

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

## State Files

| File | Purpose |
|------|---------|
| `loop-state.json` | Current phase, gate status, progress |
| `SCOPE-DISCOVERY.md` | Gap analysis and system queue (brownfield) |
| `CODEBASE-ANALYSIS.md` | Discovered patterns (brownfield) |
| `REQUIREMENTS.md` | Structured requirements |
| `FEATURESPEC.md` | Feature specification |
| `ARCHITECTURE.md` | Architecture decisions |
| `VERIFICATION.md` | Build/test/lint results |
| `VALIDATION.md` | Semantic validation findings |
| `SECURITY-AUDIT.md` | Security audit results |
| `CODE-REVIEW.md` | Code review findings |
| `RETROSPECTIVE.md` | Loop retrospective and learnings |

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

## References

This command uses the **skills-library MCP server** for reference materials. When detailed guidance is needed, fetch via:

```
mcp__skills-library__get_skill(name: "skill-name", includeReferences: true)
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
