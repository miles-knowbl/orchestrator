# /agentic-harness Command

**Recommended default for implementation tasks.** Full engineering loop with phases, gates, and systems. Show up. Say go.

## Purpose

This command is the **single entry point** for the engineering loop. It handles everything: mode detection, scope discovery, and execution of all 10 phases with enforced quality gates.

**The flow you want:** arrive in any directory, invoke `/agentic-harness`, say `go`, and watch the loop execute.

Works for all project types:
- **Greenfield** — Empty directory, build from scratch
- **Brownfield-polish** — Existing code with gaps to fill
- **Brownfield-enterprise** — Large codebase, surgical changes

## Usage

```
/agentic-harness [--mode=MODE] [--resume] [--phase=PHASE] [--skip-analysis]
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
