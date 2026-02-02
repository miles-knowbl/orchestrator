# /dream-loop Command

**Define what "done" looks like.** Walk through structured discovery to create dream states for organizations, domains, systems, or modules.

## Purpose

This command guides you through defining a dream state at any tier of the hierarchy. It answers four questions:

1. **Where are we at?** — Current state assessment
2. **Where are we going?** — Vision and end state
3. **How do we get there?** — Decomposition into children (domains/systems/modules)
4. **What does done mean?** — Completion criteria and success metrics

**The flow you want:** specify the tier, answer discovery questions, get a complete DREAM-STATE.md.

## Usage

```
/dream-loop [--tier=TIER] [--resume] [--phase=PHASE]
```

**Options:**
- `--tier=TIER`: Target tier (organization | domain | system | module). Auto-detected if not specified.
- `--resume`: Resume from existing dream-state.json
- `--phase=PHASE`: Start from specific phase (DISCOVER | DEFINE | VALIDATE | COMPLETE)

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

```
if dream-state.json exists:
  -> Show current phase, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, detect tier
```

### Step 2: Initialize State

Create `dream-state.json`:

```json
{
  "loop": "dream-loop",
  "version": "1.0.0",
  "phase": "DISCOVER",
  "status": "active",

  "context": {
    "tier": "system",
    "organization": "superorganism",
    "domain": null,
    "system": "orchestrator",
    "module": null,
    "grounding_complete": false
  },

  "target": {
    "tier": "system",
    "name": "orchestrator",
    "location": "~/workspaces/orchestrator/.claude/DREAM-STATE.md"
  },

  "gates": {
    "definition-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "DISCOVER": { "status": "pending", "skills": ["observe", "context-ingestion"] },
    "DEFINE": { "status": "pending", "skills": ["define-dream-state"] },
    "VALIDATE": { "status": "pending", "skills": ["skill-verifier"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

```
DISCOVER ──────────► DEFINE ──────────► VALIDATE ──────────► COMPLETE
                        │
                        │ [definition-gate]
                        │  human
                        ▼
observe              define-dream-state    skill-verifier      retrospective
context-ingestion
```

**4 skills across 4 phases, 1 human gate**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `definition-gate` | DEFINE | human | User says `approved` | DREAM-STATE.md |

**Gate presentation:**
```
═══════════════════════════════════════════════════════════════
║  DEFINITION GATE                                  [HUMAN]  ║
║                                                             ║
║  Tier: {tier}                                               ║
║  Location: {dream-state-location}                           ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Vision defined                                         ║
║    ✓ Children enumerated: {count}                           ║
║    ✓ Completion algebra specified                           ║
║    ✓ Success metrics defined                                ║
║                                                             ║
║  Commands:                                                  ║
║    approved  — Accept dream state, proceed to validation    ║
║    revise    — Return to DEFINE with feedback               ║
║                                                             ║
═══════════════════════════════════════════════════════════════
```

---

## Context Hierarchy

{{Include from: commands/_shared/hierarchy-context.md}}

---

## Phases

### DISCOVER (Situational Awareness)

**Skills:** observe, context-ingestion

**Actions:**
1. Run observe-grounding hook (automatic)
2. Determine target tier:
   - Organization: new org or refining existing
   - Domain: grouping related systems
   - System: single repository/application
   - Module: concern within a system
3. Load existing context:
   - Parent dream states (if any)
   - Sibling dream states (for patterns)
   - Memory patterns

**Output:**
```markdown
## Discover: Context Summary

**Target Tier:** {tier}
**Location:** {dream-state-location}

### Existing Context
{What dream states already exist at parent/sibling tiers}

### Detected Patterns
{Patterns from memory that might apply}

### Discovery Questions
{Questions to answer in DEFINE phase}
```

### DEFINE (Dream State Creation)

**Skills:** define-dream-state

**Actions:**
1. Walk through vision discovery
2. Decompose into children (domains/systems/modules/functions)
3. Define completion algebra
4. Specify success metrics
5. Document constraints and anti-goals
6. Generate DREAM-STATE.md

**Deliverables:**
- `DREAM-STATE.md` at tier-appropriate location

### VALIDATE (Review)

**Skills:** skill-verifier

**Actions:**
1. Validate dream state structure
2. Check completion algebra is valid
3. Verify parent tier is updated (if applicable)
4. Confirm no orphaned references

**Checklist:**
- [ ] Vision is clear and measurable
- [ ] All children are listed
- [ ] Completion algebra is valid
- [ ] Constraints are documented
- [ ] Anti-goals are specified
- [ ] Parent tier updated (if child)

### COMPLETE (Finalization)

**Skills:** retrospective

**Actions:**
1. Update parent dream state with new child reference
2. Record any patterns discovered
3. Archive run
4. Clean up state file

---

## Tier-Specific Behavior

### Organization Tier

**Location:** `~/workspaces/{org}/.claude/DREAM-STATE.md`

**Focus:**
- Org-wide vision
- Domain decomposition
- Cross-domain patterns

**Creates:** domains/ directory structure

### Domain Tier

**Location:** `~/workspaces/{org}/.claude/domains/{domain}/DREAM-STATE.md`

**Focus:**
- Domain capability
- System decomposition
- Cross-system integration points

**Updates:** Organization dream state with new domain

### System Tier

**Location:** `{project}/.claude/DREAM-STATE.md`

**Focus:**
- System problem/solution
- Module decomposition
- Key interfaces

**Updates:** Domain dream state with new system (if domain specified)

### Module Tier

**Location:** `{project}/src/{module}/DREAM-STATE.md`

**Focus:**
- Single responsibility
- Function specifications
- Dependencies

**Updates:** System dream state with new module

---

## On Completion

When this loop reaches completion:

### 1. Archive Run (Full Artifacts)

**Location:** `~/.claude/runs/{year-month}/{tier}-dream-loop-{timestamp}/`

Create a directory containing ALL loop artifacts:

```bash
ARCHIVE_DIR=~/.claude/runs/$(date +%Y-%m)/${TIER}-dream-loop-$(date +%Y%m%d-%H%M)
mkdir -p "$ARCHIVE_DIR"

mv dream-state.json "$ARCHIVE_DIR/" 2>/dev/null || true
cp RETROSPECTIVE.md "$ARCHIVE_DIR/" 2>/dev/null || true
```

**Artifact organization:**
| Category | Location | Files |
|----------|----------|-------|
| **Permanent** | Tier-appropriate location | `DREAM-STATE.md` |
| **Transient** | `~/.claude/runs/` | `dream-state.json`, `RETROSPECTIVE.md` |

### 2. Commit All Artifacts

**Principle:** A completed loop leaves no orphaned files.

```bash
git add -A
git diff --cached --quiet || git commit -m "Dream state defined: [tier] [description]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Note:** This step commits but does NOT push. Use `/distribution-loop` to push to remote and trigger CI/CD.

### 3. Clean Project Directory

Remove transient artifacts that have been archived:

```bash
rm -f RETROSPECTIVE.md dream-state.json 2>/dev/null || true
```

**Note:** The `DREAM-STATE.md` file is a permanent artifact at the tier-appropriate location and is NOT removed.

**Result:** Next `/dream-loop` invocation starts fresh with context gathering.

### 4. Leverage Proposal (REQUIRED)

Before showing completion, evaluate and propose the next highest leverage move.

---

## Examples

### Define a new organization

```
User: /dream-loop --tier=organization

Claude: Starting dream-loop for organization tier.

DISCOVER phase...
No existing organization dream state found.

What is the name of this organization?
> servicegrid

Creating: ~/workspaces/servicegrid/.claude/DREAM-STATE.md

[Proceeds through discovery questions]
```

### Define a system within an org

```
User: /dream-loop

Claude: Starting dream-loop.

DISCOVER phase...
Detected: git repository at ~/workspaces/my-app
Inferred tier: system

Organization context:
  superorganism (.claude/DREAM-STATE.md exists)

Domain context:
  Not specified. Which domain does this system belong to?
  1. infrastructure
  2. knowledge
  3. [Create new domain]
  4. [Skip domain assignment]

> 1

[Proceeds with system dream state definition]
```

---

## MCP Execution Protocol (REQUIRED for Slack Notifications)

**CRITICAL: All loop executions MUST be tracked through the MCP server to enable Slack thread notifications and execution history.**

### On Loop Start

When the loop begins, call:

```
mcp__orchestrator__start_execution({
  loopId: "dream-loop",
  project: "[tier:name, e.g., 'system:orchestrator']"
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
      { "phase": "VISION", "skill": "dream-capture", "deliverables": ["DREAM-STATE.md"] }
    ],
    "skillGuarantees": [
      { "skill": "dream-capture", "guaranteeCount": 3, "guaranteeNames": ["..."] }
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

**DO NOT proceed to VISION phase until you have loaded this context.** Skipping this step causes poor loop execution (missing deliverables, no completion proposal, etc.).

### During Execution

**After completing each skill**, call:
```
mcp__orchestrator__complete_skill({
  executionId: "[stored executionId]",
  skillId: "[skill name]",
  deliverables: ["DREAM-STATE.md"]  // optional
})
```

**After completing all skills in a phase**, call:
```
mcp__orchestrator__complete_phase({ executionId: "[stored executionId]" })
```

### At Gates

**When user approves a gate**, call:
```
mcp__orchestrator__approve_gate({
  executionId: "[stored executionId]",
  gateId: "[gate name]",
  approvedBy: "user"
})
```

### Phase Transitions

**To advance to the next phase**, call:
```
mcp__orchestrator__advance_phase({ executionId: "[stored executionId]" })
```

### Why This Matters

Without MCP execution tracking:
- No Slack notifications (thread-per-execution)
- No execution history
- No calibration data collection

---

## Clarification Protocol

{{Include from: commands/_shared/clarification-protocol.md}}

---

## Notes

- Dream states are living documents — they evolve as you learn
- Start with "good enough" rather than perfect
- Revisit dream states periodically via `/dream-loop --resume`
- Child tiers inherit constraints from parents
