# /audit-loop Command

**Single entry point for system audits.** Evaluates backend pipelines, UI pipelines, and cross-cutting concerns using MECE failure mode analysis, content quality evals, and UI interaction validation — produces a prioritized "checklist to done" for shipping.

## Purpose

This command orchestrates a comprehensive system audit: scoping the evaluation, identifying **backend pipelines (P-series)** and **UI pipelines (U-series)**, applying **MECE failure mode taxonomy** to each, running **content quality evals**, validating **UI interactions**, and producing test specifications for unvalidated failure modes. The loop is read-only by design — it observes and documents, never modifies code.

**The flow you want:** point it at a codebase, say `go`, and receive:
1. Infrastructure findings (architecture, security, performance)
2. **Backend pipeline failure modes** with coverage percentages
3. **UI pipeline failure modes** with interaction validation
4. **Content quality evals** for AI-generated outputs
5. **Test specifications** for all unvalidated failure modes
6. A clear "checklist to done" for shipping

## Version History

| Version | Key Changes |
|---------|-------------|
| v1.0.0 | Infrastructure-only audit (arch, security, perf) |
| v2.0.0 | Added pipeline validation (PASS/PARTIAL/FAIL) |
| v3.0.0 | MECE failure modes, coverage %, quality evals, test specs |
| **v3.1.0** | **UI pipelines (U-series), interaction validation, L5/L6 locations** |

## Usage

```
/audit-loop [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing audit-state.json
- `--phase=PHASE`: Start from specific phase (INIT | REVIEW | VALIDATE | DOCUMENT | COMPLETE)

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
  "version": "3.1.0",
  "phase": "INIT",
  "status": "active",
  "phases": {
    "INIT": { "skills": ["requirements", "pipeline-discovery", "ui-pipeline-discovery", "dependency-mapping"] },
    "REVIEW": { "skills": ["architecture-review", "security-audit", "perf-analysis", "failure-mode-analysis", "ui-failure-mode-analysis", "quality-eval-design"] },
    "VALIDATE": { "skills": ["integration-test", "ui-interaction-test", "code-verification", "test-spec-generation"] },
    "DOCUMENT": { "skills": ["document"] },
    "COMPLETE": { "skills": ["retrospective"] }
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
INIT ──────────► REVIEW ──────────► VALIDATE
  │                │
  │ [scope-gate]   │ [findings-gate]
  ▼                ▼
requirements     architecture-review    integration-test
pipeline-discovery security-audit       ui-interaction-test
ui-pipeline-discovery perf-analysis     code-verification
dependency-mapping failure-mode-analysis test-spec-generation
                 ui-failure-mode-analysis
                 quality-eval-design

DOCUMENT ──────────► COMPLETE
  │
  │ [report-gate]
  ▼
document            retrospective
```

**16 skills across 5 phases, 3 human gates**

---

## Skills by Phase

### INIT Phase

| Skill | Output |
|-------|--------|
| requirements | Audit scope definition |
| pipeline-discovery | Backend pipelines (P-series) |
| **ui-pipeline-discovery** | **UI pipelines (U-series)** |
| dependency-mapping | Cross-pipeline failure modes (X-series) |

### REVIEW Phase

| Skill | Output |
|-------|--------|
| architecture-review | ARCHITECTURE-REVIEW.md |
| security-audit | SECURITY-AUDIT.md |
| perf-analysis | PERF-ANALYSIS.md |
| failure-mode-analysis | Backend failure modes |
| **ui-failure-mode-analysis** | **UI failure modes (L5/L6 patterns)** |
| quality-eval-design | Content + UX quality evals |

### VALIDATE Phase

| Skill | Output |
|-------|--------|
| integration-test | Run existing tests |
| **ui-interaction-test** | **Validate UI flows work** |
| code-verification | Verify findings against code |
| test-spec-generation | Specs for all unvalidated modes |

---

## Deliverables

| File | Purpose |
|------|---------|
| `audit-state.json` | Phase, coverage (backend + UI + cross) |
| `AUDIT-SCOPE.md` | P-series + U-series + dependency map |
| `ARCHITECTURE-REVIEW.md` | Architecture findings |
| `SECURITY-AUDIT.md` | Security findings |
| `PERF-ANALYSIS.md` | Performance findings |
| `PIPELINE-FAILURE-MODES.md` | Backend MECE taxonomy |
| `UI-FAILURE-MODES.md` | **UI MECE taxonomy with L5/L6** |
| `PIPELINE-VALIDATION.md` | Backend coverage by pipeline |
| `UI-VALIDATION.md` | **UI coverage by pipeline** |
| `PIPELINE-TEST-SPECS.md` | Backend test specs |
| `UI-TEST-SPECS.md` | **UI test specs (component + E2E)** |
| `CONTENT-QUALITY-EVALS.md` | Content quality framework |
| `UX-QUALITY-EVALS.md` | **UX quality framework** |
| `AUDIT-REPORT.md` | Checklist to done (backend + UI) |
| `RETROSPECTIVE.md` | Loop learnings |

---

## Gate Presentations

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

## Checklist to Done Structure

```markdown
## Checklist to Done

### Critical: Fix Before Launch

| # | Item | Type | Failure Mode | Effort |
|---|------|------|--------------|--------|
| 1 | Fix artifact_id context sync | UI | U1-001 | S |
| 2 | Add cache invalidation after edit | UI | U1-005 | S |
| 3 | Validate content length before publish | Backend | P3-007 | S |

### High Priority: Silent Failures

| # | Item | Type | Failure Mode | Effort |
|---|------|------|--------------|--------|
| 4 | Add change_summary to all edit responses | UI | U1-004 | S |
| 5 | Validate JSON structure before save | Backend | P1-007 | S |

### Medium Priority: UX Polish

| # | Item | Type | Failure Mode | Effort |
|---|------|------|--------------|--------|
| 6 | Add loading indicator during generation | UI | U2-003 | S |
| 7 | Show caption preview before publish | UI | U3-002 | M |

### Coverage Targets

| Type | Current | Target | Gap |
|------|---------|--------|-----|
| Backend | 37% | 70% | 33 tests |
| UI | 18% | 60% | 23 tests |
| Cross | 0% | 50% | 8 tests |
```

---

## Summary of Changes (v3.1.0)

| Area | v3.0.0 | v3.1.0 |
|------|--------|--------|
| Pipeline types | P-series only | **P-series + U-series** |
| Location codes | L1-L4 | **L1-L6** (+Interaction, +Streaming) |
| Type codes | T1-T4 | **T1-T5** (+UX) |
| UI patterns | None | **8 patterns** (Dead Click, Stale Closure, etc.) |
| Skills | 13 | **16** (+ui-pipeline-discovery, +ui-failure-mode-analysis, +ui-interaction-test) |
| Deliverables | 11 | **15** (+UI-FAILURE-MODES.md, +UI-VALIDATION.md, +UI-TEST-SPECS.md, +UX-QUALITY-EVALS.md) |
| Test specs | Backend only | **Backend + UI (component, hook, E2E)** |

**Key insight:** A system can have solid backend pipelines but broken UI flows. Users interact through the UI — if chat-to-edit doesn't work, the backend pipeline quality is irrelevant.

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
