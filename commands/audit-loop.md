# /audit-loop Command

**Single entry point for system audits.** Evaluates **taste** (subjective quality), backend pipelines, UI pipelines, and cross-cutting concerns using MECE failure mode analysis, content quality evals, and UI interaction validation — produces a **taste-ordered** "checklist to done" for shipping.

## Purpose

This command orchestrates a comprehensive system audit: **evaluating taste first**, then scoping the evaluation, identifying **backend pipelines (P-series)** and **UI pipelines (U-series)**, applying **MECE failure mode taxonomy** to each, running **content quality evals**, validating **UI interactions**, and producing test specifications for unvalidated failure modes. The loop is read-only by design — it observes and documents, never modifies code.

**Key Principle:** Taste gates technical readiness. If it doesn't feel right, coverage percentages don't matter.

**The flow you want:** point it at a codebase, say `go`, and receive:
1. **Taste evaluation** with dimension scores and gap analysis
2. Infrastructure findings (architecture, security, performance)
3. **Backend pipeline failure modes** with coverage percentages
4. **UI pipeline failure modes** with interaction validation
5. **Content quality evals** for AI-generated outputs
6. **Test specifications** for all unvalidated failure modes
7. A **taste-ordered** "checklist to done" for shipping

## Version History

| Version | Key Changes |
|---------|-------------|
| v1.0.0 | Infrastructure-only audit (arch, security, perf) |
| v2.0.0 | Added pipeline validation (PASS/PARTIAL/FAIL) |
| v3.0.0 | MECE failure modes, coverage %, quality evals, test specs |
| v3.1.0 | UI pipelines (U-series), interaction validation, L5/L6 locations |
| **v4.0.0** | **TASTE phase as entry point, taste-ordered checklist, eval discovery** |

## Usage

```
/audit-loop [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing audit-state.json
- `--phase=PHASE`: Start from specific phase (TASTE | INIT | REVIEW | VALIDATE | DOCUMENT | COMPLETE)

---

## Phase Structure

```
TASTE ──► INIT ──► REVIEW ──► VALIDATE ──► DOCUMENT ──► COMPLETE
  │         │         │
  │taste    │scope    │findings
  │gate     │gate     │gate
```

**6 phases, 18 skills, 4 human gates**

---

## TASTE Phase (Entry Point)

**Taste gates everything.** Before analyzing pipelines or failure modes, evaluate whether the system *feels* right.

### Eval Discovery Order

The TASTE phase discovers project-specific quality evaluations (first match wins):

| Priority | Location | Description |
|----------|----------|-------------|
| 1 | `.claude/taste-manifest.json` | Explicit manifest with dimension weights |
| 2 | `TASTE-EVALS.md` | Single-file eval definition |
| 3 | `*-QUALITY-EVALS.md` | Convention (e.g., CONTENT-QUALITY-EVALS.md, UX-QUALITY-EVALS.md) |
| 4 | Minimal defaults | 4 UX dimensions if nothing found |

### Minimal Defaults (no custom evals found)

When no project-specific evals exist:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Usability | 35% | Can users accomplish their goals? |
| Responsiveness | 25% | Does UI respond quickly? |
| Reliability | 25% | Does it work consistently? |
| Accessibility | 15% | Keyboard nav, screen reader, contrast |

**Quality gates:** Ship (≥3.5), Polish (2.5-3.5), Fix (<2.5)

### Taste Gap Format

```yaml
id: TG-001
category: content | ux | brand | custom
dimension: voice_fidelity
score: 2.8
floor: 2.5
status: gap | acceptable | exceeds
pipeline: P2
evidence:
  - "Generated tweets sound generic"
traced_failure_modes: []  # Populated in REVIEW
```

### Ship Decision Matrix

| Taste Score | Technical Coverage | Decision |
|-------------|-------------------|----------|
| ≥ 4.0 | ≥ 70% | Ship |
| ≥ 4.0 | < 70% | Fix coverage, ship |
| 3.0 - 4.0 | ≥ 70% | Polish then ship |
| 3.0 - 4.0 | < 70% | Fix both, ship |
| < 3.0 | Any | **Fix taste first** |

**Taste < 3.0 always blocks ship.**

---

## Pipeline Types

### Backend Pipelines (P-series)

Server-side data flows triggered by user actions or system events:

| ID | Example | Trigger | Outcome |
|----|---------|---------|---------|
| P1 | Source Ingestion | File upload | source_schema populated |
| P2 | Content Generation | Generate button | Artifact created |
| P3 | Publishing | Publish button | Post live on platform |

### UI Pipelines (U-series)

Client-side interaction flows involving state, context, and visual feedback:

| ID | Example | Trigger | Outcome |
|----|---------|---------|---------|
| U1 | Chat-to-Edit | User describes edit | Artifact updated, change summary shown |
| U2 | Chat-to-Generate | User requests in chat | Job created, artifact appears |
| U3 | Chat-to-Post | User requests publish | Post live, link in chat |

### Cross-Pipeline (X-series)

Failure modes at boundaries between pipelines:

| ID | Example | Boundary | Impact |
|----|---------|----------|--------|
| X-001 | Empty source_schema | P1→P2 | Lower quality generation |
| X-002 | Context not synced | U1→P3 | Wrong artifact published |

---

## MECE Failure Mode Framework

### The Three Dimensions

Every failure mode is classified across three MECE dimensions:

#### Dimension 1: Location (WHERE)

| Code | Location | Description | Applies To |
|------|----------|-------------|------------|
| L1 | **Input** | Data entering the pipeline is invalid/missing | P, U |
| L2 | **Processing** | Transformation logic fails or produces wrong output | P, U |
| L3 | **Output** | Storage or delivery of result fails | P, U |
| L4 | **Integration** | Cross-pipeline handoff fails | P, U, X |
| L5 | **Interaction** | Tool execution, callback registration, user action handling | U |
| L6 | **Streaming** | SSE parsing, incremental updates, real-time sync | U |

#### Dimension 2: Type (WHAT)

| Code | Type | Description |
|------|------|-------------|
| T1 | **Data** | Missing, malformed, stale, or wrong data |
| T2 | **Logic** | Algorithm error, edge case, wrong branch taken |
| T3 | **Infrastructure** | Auth, network, timeout, rate limit, resource |
| T4 | **Quality** | Technically succeeds but output doesn't meet bar |
| T5 | **UX** | Technically works but user experience is broken |

#### Dimension 3: Severity (HOW BAD)

| Code | Severity | Description |
|------|----------|-------------|
| S1 | **Silent** | Fails without error, bad data persists |
| S2 | **Partial** | Some data correct, some wrong/missing |
| S3 | **Visible** | Error surfaced but unclear to user |
| S4 | **Blocking** | Operation cannot complete, user stuck |

### UI-Specific Failure Patterns

Common failure patterns in UI pipelines:

| Pattern | Code | Description | Example |
|---------|------|-------------|---------|
| **Dead Click** | L5-T2 | User action produces no response | Button does nothing |
| **Stale Closure** | L5-T1 | Callback uses outdated state | Edit uses wrong artifact_id |
| **State Desync** | L3-T1 | UI shows stale data | Artifact doesn't refresh |
| **Missing Feedback** | L3-T5 | No loading/error indicator | Generation starts, no spinner |
| **Context Loss** | L4-T1 | Navigation loses selection | Sources deselected on view change |
| **Race Condition** | L5-T2 | Fast clicks cause wrong state | Double-submit creates duplicates |
| **Stream Disconnect** | L6-T3 | SSE connection drops mid-response | Partial content shown |
| **Callback Leak** | L5-T3 | Unregistered callbacks accumulate | Memory grows, slowdown |

### Coverage Calculation

```markdown
## Summary

| Type | Pipeline | Failure Modes | Validated | Coverage |
|------|----------|---------------|-----------|----------|
| Backend | P1: Source Ingestion | 9 | 4 | 44% |
| Backend | P2: Content Generation | 10 | 4 | 40% |
| **UI** | **U1: Chat-to-Edit** | **8** | **2** | **25%** |
| **UI** | **U2: Chat-to-Generate** | **10** | **3** | **30%** |
| Cross | X-* | 6 | 0 | 0% |
| **Total** | | **43** | **13** | **30%** |
```

A failure mode is "Validated" only if:
1. Explicit handling code exists (error throw, validation, retry), OR
2. Test coverage exists for that failure mode

### Risk Priority

**Priority order for addressing failure modes:**

1. **S1 (Silent)** — Highest risk: fail without alerting anyone
2. **Cross-pipeline (X-*)** — High risk: often 0% validated
3. **UI Interaction (L5/L6)** — High risk: directly affects user experience
4. **S2 (Partial)** — Medium risk: data corruption
5. **S3 (Visible)** — Lower risk: at least user knows
6. **S4 (Blocking)** — Usually already handled

---

## UI Pipeline Discovery

During INIT, identify UI pipelines by looking for:

### Chat/Agent Interactions
- Chat components (ChatPanel, ChatInput)
- Tool handlers that respond to chat commands
- SSE/streaming response parsing
- Context synchronization

### State Management Flows
- Context providers and consumers
- Selection state (what's selected → what's in context)
- Navigation state (current view → context.current_view)
- Real-time subscriptions

### User Interaction Patterns
- Modal flows (open → configure → submit → result)
- Inline editing (click → edit → save)
- Drag-and-drop
- Keyboard shortcuts

### Example UI Pipeline Definition

```markdown
### U1: Chat-to-Edit

**Trigger:** User types edit instruction in chat while artifact is open
**Context Required:** artifact_id must be set in ChatContext

**Steps:**
1. User opens artifact in artifact-editor view
2. Canvas.tsx sets context.artifact_id (L120-122)
3. ChatPanel displays "Editing: [artifact title]"
4. User types edit instruction and submits
5. ChatContext.sendMessage() initiates SSE stream to agent
6. Agent invokes edit_artifact tool
7. toolHandlers.ts:edit_artifact calls Supabase function
8. Function returns { success, version, change_summary }
9. React Query cache invalidated for artifact refresh
10. ToolCallBubble displays change_summary
11. Artifact re-renders with new content

**Failure Modes:**
| ID | Location | Type | Severity | Failure |
|----|----------|------|----------|---------|
| U1-001 | L5-Interaction | T1-Data | S4-Blocking | artifact_id not in context |
| U1-002 | L6-Streaming | T3-Infra | S3-Visible | SSE stream timeout |
| U1-003 | L2-Processing | T2-Logic | S1-Silent | Tool returns success but edit failed |
| U1-004 | L3-Output | T5-UX | S2-Partial | Change summary missing |
| U1-005 | L3-Output | T1-Data | S1-Silent | Cache not invalidated, stale UI |
| U1-006 | L5-Interaction | T2-Logic | S1-Silent | ToolCallBubble shows wrong status |
| U1-007 | L4-Integration | T1-Data | S1-Silent | Version not incremented |
| U1-008 | L6-Streaming | T3-Infra | S3-Visible | Stream disconnects mid-response |
```

---

## UI Quality Evaluation

### UX Eval Dimensions

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Responsiveness | 25% | Does UI respond quickly to user actions? |
| Feedback Clarity | 25% | Are loading/success/error states clear? |
| Error Recovery | 20% | Can user recover from errors easily? |
| State Consistency | 20% | Does UI always show current state? |
| Accessibility | 10% | Keyboard nav, screen reader, contrast |

### UX Scoring Rubric

| Score | Label | Definition |
|-------|-------|------------|
| 5 | Excellent | Delightful, intuitive, no friction |
| 4 | Good | Works well, minor polish needed |
| 3 | Acceptable | Functional but rough edges |
| 2 | Poor | Confusing or frustrating |
| 1 | Failed | Broken or unusable |

### UX Quality Gates

| Weighted Score | Status |
|----------------|--------|
| >= 4.0 | Ship |
| 3.0 - 4.0 | Polish then ship |
| < 3.0 | Fix before ship |

---

## Test Specification Generation

### Backend Test Types

| Test Type | When to Use |
|-----------|-------------|
| Unit | Individual function validation, schema checks |
| Integration | Cross-function, database interactions |
| E2E | Full user flows, cross-pipeline handoffs |

### UI Test Types

| Test Type | When to Use | Tool |
|-----------|-------------|------|
| Component | Individual component rendering, props | Vitest + RTL |
| Hook | Custom hook behavior, state changes | Vitest |
| Integration | Multi-component flows, context | Vitest + RTL |
| E2E | Full user interactions, visual | Playwright |

### UI Test Spec Example

```markdown
### TEST-U1-005: Cache not invalidated after edit

**Failure Mode:** U1-005 (L3-Output, T1-Data, S1-Silent)
**Test Type:** Integration (Vitest + RTL)

**Setup:**
- Render ArtifactEditor with mock artifact
- Mock ChatContext with sendMessage that resolves success
- Mock React Query cache

**Steps:**
1. Trigger edit via ChatPanel
2. Wait for tool completion
3. Check queryClient.invalidateQueries was called with ['artifact', artifact_id]

**Pass Criteria:**
- invalidateQueries called with correct key
- Artifact re-renders with updated content

**Fail Criteria:**
- invalidateQueries not called
- UI shows stale artifact content
```

### E2E Test Spec Example (Playwright)

```markdown
### TEST-U2-E2E-001: Chat-to-Generate full flow

**Failure Mode:** U2-* (full pipeline)
**Test Type:** E2E (Playwright)

**Setup:**
- Seed database with test sources
- Authenticate test user

**Steps:**
1. Navigate to sources view
2. Select 2 sources by clicking checkboxes
3. Open chat panel
4. Type "generate a twitter thread about these sources"
5. Wait for generation job to complete
6. Navigate to artifacts view

**Pass Criteria:**
- New artifact appears in grid
- Artifact type is "article" with subtype "twitter_thread"
- Toast notification shows success

**Fail Criteria:**
- No artifact created
- Error toast shown
- Stuck in loading state
```

---

## Execution Flow

### Initialize State

```json
{
  "loop": "audit-loop",
  "version": "4.0.0",
  "phase": "TASTE",
  "status": "active",
  "phases": {
    "TASTE": { "skills": ["taste-discovery", "taste-eval"] },
    "INIT": { "skills": ["requirements", "pipeline-discovery", "ui-pipeline-discovery", "dependency-mapping"] },
    "REVIEW": { "skills": ["architecture-review", "security-audit", "perf-analysis", "failure-mode-analysis", "ui-failure-mode-analysis", "quality-eval-design", "taste-trace"] },
    "VALIDATE": { "skills": ["integration-test", "ui-interaction-test", "code-verification", "test-spec-generation"] },
    "DOCUMENT": { "skills": ["document", "taste-report"] },
    "COMPLETE": { "skills": ["retrospective"] }
  },
  "taste": {
    "eval_source": null,
    "dimensions": [],
    "weighted_score": 0,
    "gaps": [],
    "ship_status": "unknown"
  },
  "backend_pipelines": [],
  "ui_pipelines": [],
  "failure_mode_coverage": {
    "backend": { "total": 0, "validated": 0 },
    "ui": { "total": 0, "validated": 0 },
    "cross": { "total": 0, "validated": 0 },
    "overall_percentage": 0
  }
}
```

### Phase Flow

```
TASTE ─────────► INIT ──────────► REVIEW ──────────► VALIDATE
  │                │                │
  │ [taste-gate]   │ [scope-gate]   │ [findings-gate]
  ▼                ▼                ▼
taste-discovery  requirements     architecture-review    integration-test
taste-eval       pipeline-disc    security-audit         ui-interaction-test
                 ui-pipeline-disc perf-analysis          code-verification
                 dependency-map   failure-mode-analysis  test-spec-generation
                                  ui-failure-mode-analysis
                                  quality-eval-design
                                  taste-trace

DOCUMENT ──────────► COMPLETE
  │
  │ [report-gate]
  ▼
document            retrospective
taste-report
```

**18 skills across 6 phases, 4 human gates**

---

## Skills by Phase

### TASTE Phase (NEW)

| Skill | Output |
|-------|--------|
| **taste-discovery** | **Find project evals (manifest/convention/defaults)** |
| **taste-eval** | **TASTE-EVAL.md, TASTE-GAPS.md** |

### INIT Phase

| Skill | Output |
|-------|--------|
| requirements | Audit scope definition |
| pipeline-discovery | Backend pipelines (P-series) |
| ui-pipeline-discovery | UI pipelines (U-series) |
| dependency-mapping | Cross-pipeline failure modes (X-series) |

### REVIEW Phase

| Skill | Output |
|-------|--------|
| architecture-review | ARCHITECTURE-REVIEW.md |
| security-audit | SECURITY-AUDIT.md |
| perf-analysis | PERF-ANALYSIS.md |
| failure-mode-analysis | Backend failure modes |
| ui-failure-mode-analysis | UI failure modes (L5/L6 patterns) |
| quality-eval-design | Content + UX quality evals |
| **taste-trace** | **TASTE-TRACE.md (gap-to-failure-mode mapping)** |

### VALIDATE Phase

| Skill | Output |
|-------|--------|
| integration-test | Run existing tests |
| ui-interaction-test | Validate UI flows work |
| code-verification | Verify findings against code |
| test-spec-generation | Specs for all unvalidated modes |

### DOCUMENT Phase

| Skill | Output |
|-------|--------|
| document | AUDIT-REPORT.md |
| **taste-report** | **Taste-ordered checklist** |

---

## Deliverables

| File | Phase | Purpose |
|------|-------|---------|
| `audit-state.json` | All | Phase, taste scores, coverage (backend + UI + cross) |
| **`TASTE-EVAL.md`** | **TASTE** | **Full dimension scores with evidence** |
| **`TASTE-GAPS.md`** | **TASTE** | **Identified taste gaps with evidence** |
| **`TASTE-TRACE.md`** | **REVIEW** | **Gap-to-failure-mode mapping** |
| `AUDIT-SCOPE.md` | INIT | P-series + U-series + dependency map |
| `ARCHITECTURE-REVIEW.md` | REVIEW | Architecture findings |
| `SECURITY-AUDIT.md` | REVIEW | Security findings |
| `PERF-ANALYSIS.md` | REVIEW | Performance findings |
| `PIPELINE-FAILURE-MODES.md` | REVIEW | Backend MECE taxonomy |
| `UI-FAILURE-MODES.md` | REVIEW | UI MECE taxonomy with L5/L6 |
| `PIPELINE-VALIDATION.md` | VALIDATE | Backend coverage by pipeline |
| `UI-VALIDATION.md` | VALIDATE | UI coverage by pipeline |
| `PIPELINE-TEST-SPECS.md` | VALIDATE | Backend test specs |
| `UI-TEST-SPECS.md` | VALIDATE | UI test specs (component + E2E) |
| `CONTENT-QUALITY-EVALS.md` | REVIEW | Content quality framework |
| `UX-QUALITY-EVALS.md` | REVIEW | UX quality framework |
| `AUDIT-REPORT.md` | DOCUMENT | **Taste-ordered** checklist to done |
| `RETROSPECTIVE.md` | COMPLETE | Loop learnings |

---

## Gate Presentations

### taste-gate (NEW)

```
═══════════════════════════════════════════════════════════════
║  TASTE GATE                                    [HUMAN]      ║
║                                                             ║
║  Eval Source: CONTENT-QUALITY-EVALS.md + UX-QUALITY-EVALS.md║
║                                                             ║
║  Dimension Scores:                                          ║
║    voice_fidelity:     3.2  [floor: 2.5] ✓                  ║
║    topic_relevance:    4.1  [floor: 3.0] ✓                  ║
║    engagement:         2.4  [floor: 2.5] ✗ GAP              ║
║    responsiveness:     4.0  [floor: 3.0] ✓                  ║
║    feedback_clarity:   2.8  [floor: 3.0] ✗ GAP              ║
║                                                             ║
║  Taste Gaps:                                                ║
║    TG-001 [content] engagement: 2.4 < 2.5 (CRITICAL)        ║
║    TG-002 [ux] feedback_clarity: 2.8 < 3.0 (SIGNIFICANT)    ║
║                                                             ║
║  Weighted Score: 3.3                                        ║
║  Ship Status: POLISH_THEN_SHIP                              ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to INIT              ║
║    changes: ...  — Request re-evaluation                    ║
║    show gaps     — Full gap details with evidence           ║
═══════════════════════════════════════════════════════════════
```

**Gate logic:**
- If Taste Score < 3.0: **BLOCKED** — must fix taste before continuing
- If any CRITICAL gaps (below floor): Show warning, recommend addressing first
- If POLISH_THEN_SHIP: Can proceed, but taste issues tracked in final checklist

---

### findings-gate

```
═══════════════════════════════════════════════════════════════
║  FINDINGS GATE                                 [HUMAN]      ║
║                                                             ║
║  Backend Coverage:                                          ║
║    P-series: 52 modes | 19 validated | 37%                  ║
║                                                             ║
║  UI Coverage:                                               ║
║    U-series: 28 modes | 5 validated | 18%                   ║
║                                                             ║
║  Cross-Pipeline:                                            ║
║    X-series: 8 modes | 0 validated | 0%                     ║
║                                                             ║
║  Overall: 88 modes | 24 validated | 27%                     ║
║                                                             ║
║  Risk Heat Map:                                             ║
║    S1-Silent: 22 (HIGHEST RISK)                             ║
║    L5-Interaction: 12 (UI-specific)                         ║
║    L6-Streaming: 6 (UI-specific)                            ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to VALIDATE          ║
║    changes: ...  — Request deeper analysis                  ║
═══════════════════════════════════════════════════════════════
```

---

## Checklist to Done Structure (Taste-Ordered)

The checklist is ordered by **taste impact**, not pure technical severity:

### Tier Algorithm

```
Tier 1: Taste-Critical (failure modes linked to critical taste gaps)
Tier 2: Taste-Significant (failure modes linked to significant gaps)
Tier 3: Technical-Only (no taste link, ordered by S1→S4)
```

**Rationale:** A technically perfect system that doesn't feel right won't ship. Taste-linked failures directly impact user perception.

### Example Output

```markdown
## Checklist to Done (Taste-Ordered)

### Tier 1: Taste-Critical
*Linked to critical taste gaps (below floor)*

| # | Item | Taste Gap | Failure Mode | Effort |
|---|------|-----------|--------------|--------|
| 1 | Improve generated content engagement | TG-001 | P2-003 | M |
| 2 | Add variety to tweet templates | TG-001 | P2-007 | S |

### Tier 2: Taste-Significant
*Linked to significant taste gaps*

| # | Item | Taste Gap | Failure Mode | Effort |
|---|------|-----------|--------------|--------|
| 3 | Show clear loading states during gen | TG-002 | U2-003 | S |
| 4 | Add change summary to edit responses | TG-002 | U1-004 | S |

### Tier 3: Technical-Only
*No taste link, ordered by severity (S1 first)*

| # | Item | Type | Failure Mode | Effort |
|---|------|------|--------------|--------|
| 5 | Fix silent cache invalidation | UI | U1-005 (S1) | S |
| 6 | Validate JSON before save | Backend | P1-007 (S1) | S |
| 7 | Add retry for SSE timeout | UI | U2-002 (S3) | M |

### Coverage Summary

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| **Taste Score** | **3.3** | **3.5** | **+0.2** |
| Backend Coverage | 37% | 70% | 33 tests |
| UI Coverage | 18% | 60% | 23 tests |
| Cross Coverage | 0% | 50% | 8 tests |
```

---

## MCP Execution Protocol (REQUIRED for Slack Notifications)

**CRITICAL: All loop executions MUST be tracked through the MCP server to enable Slack thread notifications and execution history.**

### On Loop Start

When the loop begins, call:

```
mcp__orchestrator__start_execution({
  loopId: "audit-loop",
  project: "[system being audited]"
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
      { "phase": "DISCOVER", "skill": "taste-eval", "deliverables": ["TASTE-EVAL.md"] }
    ],
    "skillGuarantees": [
      { "skill": "taste-eval", "guaranteeCount": 3, "guaranteeNames": ["..."] }
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

**DO NOT proceed to DISCOVER phase until you have loaded this context.** Skipping this step causes poor loop execution (missing deliverables, no completion proposal, etc.).

### During Execution

**After completing each skill**, call:
```
mcp__orchestrator__complete_skill({
  executionId: "[stored executionId]",
  skillId: "[skill name]",
  deliverables: ["TASTE-EVAL.md", "AUDIT-REPORT.md"]  // optional
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

## On Completion

When this loop reaches COMPLETE phase:

### 1. Archive Run (Full Artifacts)

**Location:** `~/.claude/runs/{year-month}/{project}-audit-loop-{timestamp}/`

```bash
ARCHIVE_DIR=~/.claude/runs/$(date +%Y-%m)/${PROJECT}-audit-loop-$(date +%Y%m%d-%H%M)
mkdir -p "$ARCHIVE_DIR"

# Archive all audit artifacts (including taste files)
mv audit-state.json "$ARCHIVE_DIR/" 2>/dev/null || true
cp TASTE-EVAL.md TASTE-GAPS.md TASTE-TRACE.md \
   AUDIT-REPORT.md AUDIT-SCOPE.md UI-FAILURE-MODES.md UI-VALIDATION.md \
   UI-TEST-SPECS.md UX-QUALITY-EVALS.md RETROSPECTIVE.md \
   "$ARCHIVE_DIR/" 2>/dev/null || true
```

**Artifact organization:**
| Category | Location | Files |
|----------|----------|-------|
| **Permanent** | Project root | None (audit is read-only) |
| **Transient** | `~/.claude/runs/` | All audit reports and state |

### 2. Commit Audit Report

**Principle:** A completed loop leaves no orphaned files.

```bash
git add -A
git diff --cached --quiet || git commit -m "Audit complete: [system] [coverage]%

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Note:** Commits before archiving. Use `/distribution-loop` to push.

### 3. Clean Project Directory

Remove transient artifacts (already archived):

```bash
rm -f TASTE-EVAL.md TASTE-GAPS.md TASTE-TRACE.md \
      AUDIT-REPORT.md AUDIT-SCOPE.md UI-FAILURE-MODES.md UI-VALIDATION.md \
      UI-TEST-SPECS.md UX-QUALITY-EVALS.md RETROSPECTIVE.md \
      audit-state.json 2>/dev/null || true
```

**Result:** Project stays clean; audit history in `~/.claude/runs/`

### 4. Leverage Proposal (REQUIRED)

Before showing completion, evaluate and propose the next highest leverage move.

---

## Summary of Changes (v4.0.0)

| Area | v3.1.0 | v4.0.0 |
|------|--------|--------|
| **Entry point** | INIT | **TASTE** |
| **Phases** | 5 | **6** (+TASTE) |
| **Skills** | 16 | **18** (+taste-discovery, +taste-eval, +taste-trace, +taste-report) |
| **Deliverables** | 15 | **18** (+TASTE-EVAL.md, +TASTE-GAPS.md, +TASTE-TRACE.md) |
| **Human gates** | 3 | **4** (+taste-gate) |
| **Checklist ordering** | Severity (S1→S4) | **Taste-weighted (Tier 1/2/3)** |
| **Eval discovery** | None | **Manifest → Convention → Defaults** |
| **Ship decision** | Coverage-only | **Taste + Coverage matrix** |

**Key insight:** Taste gates technical readiness. If it doesn't feel right, coverage percentages don't matter. A system with 95% test coverage that produces generic content won't ship.

### What Stays the Same

All existing technical rigor preserved:
- MECE failure mode taxonomy (L1-L6, T1-T5, S1-S4)
- Pipeline discovery (P-series, U-series, X-series)
- Coverage tracking and percentages
- Test spec generation
- Security, architecture, performance audits
- Existing gates (scope, findings, report)

The technical layer becomes **ordered by taste impact**, not replaced.

---

## Appendix: UI Failure Mode Entry Example

```markdown
### U1-005: Cache not invalidated after edit

| Attribute | Value |
|-----------|-------|
| **ID** | U1-005 |
| **Pipeline** | U1: Chat-to-Edit |
| **Location** | L3-Output |
| **Type** | T1-Data |
| **Severity** | S1-Silent |
| **Pattern** | State Desync |
| **Description** | Edit succeeds but React Query cache not invalidated |
| **Impact** | User sees stale artifact content until manual refresh |
| **Detection** | None (silent) |
| **Status** | UNVALIDATED |
| **Test Spec** | TEST-U1-005 |
| **Fix** | Add queryClient.invalidateQueries(['artifact', id]) |
| **Effort** | S |
```

---

## Appendix: UX Eval Template

```yaml
pipeline: U1-Chat-to-Edit
evaluator: human
timestamp: 2026-01-29T12:00:00Z

scores:
  responsiveness:
    score: 4
    evidence: "Edit completes in <2s, immediate feedback"
  feedback_clarity:
    score: 3
    evidence: "Loading shown but change_summary often missing"
  error_recovery:
    score: 2
    evidence: "No retry button, must re-type instruction"
  state_consistency:
    score: 3
    evidence: "Sometimes shows stale content"
  accessibility:
    score: 4
    evidence: "Keyboard accessible, good contrast"

weighted_score: 3.2
recommendation: polish_then_ship
notes: "Fix change_summary and cache invalidation before launch"
```

---

## Appendix: UI Pipeline Discovery Checklist

When discovering UI pipelines, look for:

- [ ] Chat/agent interaction patterns
- [ ] Context providers (ChatContext, SelectionContext, etc.)
- [ ] Tool handlers and their UI feedback
- [ ] SSE/streaming response handling
- [ ] Modal flows (open → configure → submit → result)
- [ ] Inline editing patterns
- [ ] Real-time subscriptions (Supabase channels)
- [ ] Navigation state synchronization
- [ ] Selection state → context sync
- [ ] Callback registration and cleanup

---

## Appendix: TASTE-EVAL.md Template

```markdown
# Taste Evaluation

**Project:** [project-name]
**Eval Source:** [manifest | convention | defaults]
**Timestamp:** [ISO 8601]

## Discovered Evals

| Source File | Category | Dimensions |
|-------------|----------|------------|
| CONTENT-QUALITY-EVALS.md | content | voice_fidelity, topic_relevance, engagement |
| UX-QUALITY-EVALS.md | ux | responsiveness, feedback_clarity, error_recovery |

## Dimension Scores

### Content Quality

| Dimension | Weight | Score | Floor | Status |
|-----------|--------|-------|-------|--------|
| voice_fidelity | 40% | 3.2 | 2.5 | ✓ Acceptable |
| topic_relevance | 35% | 4.1 | 3.0 | ✓ Exceeds |
| engagement | 25% | 2.4 | 2.5 | ✗ Gap |

**Category Score:** 3.2 (weighted)

### UX Quality

| Dimension | Weight | Score | Floor | Status |
|-----------|--------|-------|-------|--------|
| responsiveness | 30% | 4.0 | 3.0 | ✓ Exceeds |
| feedback_clarity | 30% | 2.8 | 3.0 | ✗ Gap |
| error_recovery | 20% | 3.5 | 2.5 | ✓ Acceptable |
| accessibility | 20% | 4.2 | 3.0 | ✓ Exceeds |

**Category Score:** 3.6 (weighted)

## Overall

| Metric | Value |
|--------|-------|
| **Weighted Score** | **3.3** |
| **Ship Status** | POLISH_THEN_SHIP |
| **Gaps Found** | 2 |
| **Critical Gaps** | 1 |
```

---

## Appendix: TASTE-TRACE.md Template

```markdown
# Taste-to-Failure-Mode Trace

**Project:** [project-name]
**Timestamp:** [ISO 8601]

## Traced Gaps

### TG-001: engagement (CRITICAL)

| Attribute | Value |
|-----------|-------|
| **Category** | content |
| **Score** | 2.4 |
| **Floor** | 2.5 |
| **Pipeline** | P2: Content Generation |

**Evidence:**
- Generated tweets sound generic
- Lack of personality markers in output
- Templates feel repetitive

**Linked Failure Modes:**

| ID | Location | Description | Impact on Taste |
|----|----------|-------------|-----------------|
| P2-003 | L2-Processing | Template selection too narrow | Direct cause of repetition |
| P2-007 | L2-Processing | No personality injection | Generic voice output |

---

### TG-002: feedback_clarity (SIGNIFICANT)

| Attribute | Value |
|-----------|-------|
| **Category** | ux |
| **Score** | 2.8 |
| **Floor** | 3.0 |
| **Pipeline** | U2: Chat-to-Generate |

**Evidence:**
- Loading states unclear during generation
- Change summaries often missing

**Linked Failure Modes:**

| ID | Location | Description | Impact on Taste |
|----|----------|-------------|-----------------|
| U2-003 | L3-Output | Missing loading indicator | User confusion |
| U1-004 | L3-Output | Change summary not returned | No feedback on edit |

## Untraced Failure Modes

Failure modes not linked to taste gaps (Tier 3 in checklist):

| ID | Location | Type | Severity |
|----|----------|------|----------|
| U1-005 | L3-Output | T1-Data | S1-Silent |
| P1-007 | L2-Processing | T1-Data | S1-Silent |
```

---

## Appendix: Taste Manifest Schema

Projects can define `.claude/taste-manifest.json` for explicit eval configuration:

```json
{
  "version": "1.0.0",
  "eval_files": [
    "CONTENT-QUALITY-EVALS.md",
    "UX-QUALITY-EVALS.md"
  ],
  "category_weights": {
    "content": 0.6,
    "ux": 0.4
  },
  "quality_gates": {
    "ship": 4.0,
    "polish": 3.0,
    "fix": 2.5
  },
  "custom_dimensions": [
    {
      "name": "brand_consistency",
      "category": "brand",
      "weight": 0.3,
      "floor": 3.0,
      "description": "Output matches brand voice guidelines"
    }
  ]
}
```

**Discovery priority:** manifest > convention > defaults

---

## Appendix: Adding Project Taste Evals

If no taste evals exist and minimal defaults are used, inform the user:

```
═══════════════════════════════════════════════════════════════
║  TASTE DISCOVERY                                            ║
║                                                             ║
║  No project-specific taste evals found.                     ║
║  Using minimal defaults (4 UX dimensions).                  ║
║                                                             ║
║  To add custom evals:                                       ║
║                                                             ║
║  Option 1: Convention files                                 ║
║    Create *-QUALITY-EVALS.md in project root                ║
║    Example: CONTENT-QUALITY-EVALS.md                        ║
║                                                             ║
║  Option 2: Single eval file                                 ║
║    Create TASTE-EVALS.md in project root                    ║
║                                                             ║
║  Option 3: Explicit manifest                                ║
║    Create .claude/taste-manifest.json                       ║
║                                                             ║
║  See appendix for templates.                                ║
═══════════════════════════════════════════════════════════════
```
