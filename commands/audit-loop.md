# /audit-loop Command

**Single entry point for system audits.** Evaluates **taste** (subjective quality), backend pipelines, UI pipelines, and cross-cutting concerns using MECE failure mode analysis plus a **module × gap-dimension matrix** — produces a **taste-ordered** "checklist to done" for shipping.

## Purpose

This command orchestrates a comprehensive system audit: **evaluating taste first**, then enumerating **modules (M-series)**, scoping **backend pipelines (P-series)** and **UI pipelines (U-series)**, applying **MECE failure mode taxonomy** to each, annotating every finding with a **gap category (G-series)**, running content quality evals, validating UI interactions, and producing test specifications for unvalidated failure modes. The loop is read-only by design — it observes and documents, never modifies code.

**Key Principle:** Taste gates technical readiness. If it doesn't feel right, coverage percentages don't matter.

**The flow you want:** point it at a codebase, say `go`, and receive:
1. **Taste evaluation** with dimension scores and gap analysis
2. **Module map** — all modules enumerated with their files, routes, components
3. Infrastructure findings (architecture, security, performance)
4. **Backend pipeline failure modes** with coverage percentages
5. **UI pipeline failure modes** with interaction validation
6. **Gap matrix** — 20 modules × 28 gap dimensions (`PRESENT | PARTIAL | MISSING`)
7. **Content quality evals** for AI-generated outputs
8. **Test specifications** for all unvalidated failure modes
9. A **taste-ordered** "checklist to done" for shipping

## Version History

| Version | Key Changes |
|---------|-------------|
| v1.0.0 | Infrastructure-only audit (arch, security, perf) |
| v2.0.0 | Added pipeline validation (PASS/PARTIAL/FAIL) |
| v3.0.0 | MECE failure modes, coverage %, quality evals, test specs |
| v3.1.0 | UI pipelines (U-series), interaction validation, L5/L6 locations |
| v4.0.0 | TASTE phase as entry point, taste-ordered checklist, eval discovery |
| v4.0.1 | Added Prerequisites section: server health check before loop start |
| v4.0.2 | Fixed: Don't manually start server — hook auto-opens Terminal window |
| **v5.0.0** | **Module-Gap Matrix: M-series modules, G-series gap taxonomy (28 dimensions), GAP-MATRIX.md, module-enumeration + gap-matrix-analysis skills** |

## Usage

```
/audit-loop [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing audit-state.json
- `--phase=PHASE`: Start from specific phase (TASTE | INIT | REVIEW | VALIDATE | DOCUMENT | COMPLETE)

---

## Prerequisites (MUST DO FIRST)

**Before starting the audit, ensure the orchestrator server is running.**

### Step 1: Check Server Health

```bash
curl -s http://localhost:3002/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"...","version":"..."}
```

### Step 2: If Server Not Running

If the health check fails, **DO NOT manually start the server**. The `ensure-orchestrator.sh` hook will automatically:

1. Open a new Terminal/iTerm window
2. Start the server there (with visible logs)
3. Wait for it to become healthy

**Just proceed to call an MCP tool** (like `start_execution`) — the hook triggers on any `mcp__orchestrator__*` call and handles server startup automatically.

**NEVER run `npm start &` in background.** The server needs its own Terminal window for persistent operation and log visibility.

---

## Phase Structure

```
TASTE ──► INIT ──► REVIEW ──► VALIDATE ──► DOCUMENT ──► COMPLETE
  │         │         │
  │taste    │scope    │findings
  │gate     │gate     │gate
```

**6 phases, 20 skills, 4 human gates**

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

| Dimension | Weight | Floor | Description |
|-----------|--------|-------|-------------|
| Business Completeness | 25% | 4.0 | All core workflows built and connected — do modules compose? Can a user accomplish their full goal without dead ends or workarounds? |
| Customer Journey Quality | 25% | 4.0 | Every user-facing touchpoint is complete, professional, and self-sufficient |
| Automation Depth | 25% | 4.0 | How much does the system handle automatically vs. requiring manual steps? |
| Feedback Compression | 25% | 4.0 | Every action acknowledged; every async operation surfaces its outcome; cross-user state changes propagate in real-time |

**Quality gates:** Ship (≥4.0, all dimensions ≥ floor), Polish (3.0–4.0), Fix (<3.0 or any dimension below floor)

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

## Module Decomposition (M-series)

**Modules are the outermost decomposition.** Before pipeline discovery, enumerate every logical module in the system. Each module gets an M-code. Every failure mode and gap finding references its module.

### Module Discovery

During INIT (`module-enumeration` skill), identify modules by:
- Route groups / page directories (e.g., `src/app/(auth)/`, `src/app/customers/`)
- Feature directories with co-located components, hooks, and API calls
- Edge function groups (e.g., `supabase/functions/stripe-*`)
- Shared infrastructure modules (notifications, realtime, public pages)

### Module Entry Format

```markdown
### M-01: Customers

| Attribute | Value |
|-----------|-------|
| **ID** | M-01 |
| **Name** | Customers |
| **Routes** | /customers, /customers/[id] |
| **Components** | CustomerList, CustomerDetail, CustomerForm |
| **Hooks** | useCustomers, useCustomer, useCreateCustomer |
| **Edge Functions** | None |
| **DB Tables** | customers, customer_contacts |
| **Pipelines** | P-Cust-01: Create customer, P-Cust-02: Update customer |
```

### Standard Module List

When auditing a service business application, default module enumeration:

| ID | Module | Scope |
|----|--------|-------|
| M-01 | Auth | Login, signup, password reset, session management |
| M-02 | Dashboard | Overview stats, activity feed, quick actions |
| M-03 | Customers | Customer CRUD, contacts, history |
| M-04 | Jobs/Dispatch | Job creation, scheduling, dispatch, status |
| M-05 | Quotes | Quote creation, line items, approval, send |
| M-06 | Invoices | Invoice generation, payment tracking, reminders |
| M-07 | Subscriptions | Recurring billing, plan management, Stripe integration |
| M-08 | Routes | Route planning, optimization, driver assignment |
| M-09 | Messaging | In-app messaging, SMS, conversation threads |
| M-10 | Email Marketing | Campaigns, templates, send, analytics |
| M-11 | Reviews | Review requests, collection, display |
| M-12 | Gallery/Photos | Photo upload, albums, before/after |
| M-13 | Reports | Analytics, exports, scheduled reports |
| M-14 | Team/HR | Staff management, roles, time tracking |
| M-15 | Settings | Company settings, integrations, preferences |
| M-16 | Portal | Customer-facing portal pages |
| M-17 | Notifications | In-app notification center, preferences |
| M-18 | Public Pages | Marketing/landing pages, SEO |
| M-19 | Edge Functions | Serverless functions, webhooks, background jobs |
| M-20 | Shared/Core | Auth guards, layouts, global hooks, design system |

---

## Gap Taxonomy (G-series)

**Gap categories provide a product-level classification** of what kind of gap exists, complementing the MECE technical classification. Every failure mode finding gets both a MECE code (L×T×S) and a G-code.

A fully annotated finding looks like:
```
M-03-005 | L1-Input · T1-Data · S1-Silent | G2-R3 | Customer email not validated server-side
```

### G-series Taxonomy (28 dimensions)

#### G1: Functional

| Code | Dimension | Description |
|------|-----------|-------------|
| G1-F1 | Feature completeness | Planned/implied features that aren't built |
| G1-F2 | Workflow completeness | User can't complete a full end-to-end journey without hitting a dead end |
| G1-F3 | Edge case handling | Happy path works, but boundary conditions (empty, max, concurrent) are unhandled |
| G1-F4 | Integration composition | Modules exist in isolation but don't compose — data or actions don't flow across them |

#### G2: Data & Reliability

| Code | Dimension | Description |
|------|-----------|-------------|
| G2-R1 | Data integrity | Missing DB constraints, cascades, orphan records, no uniqueness enforcement |
| G2-R2 | Error handling | Silent failures, swallowed exceptions, no retry logic, missing error boundaries |
| G2-R3 | Validation | Inputs validated on client but not server (or vice versa), inconsistent rules |
| G2-R4 | Recovery | What happens when a background job fails, a webhook is dropped, a payment times out |

#### G3: Access Control

| Code | Dimension | Description |
|------|-----------|-------------|
| G3-A1 | Permission / RBAC | Actions reachable by wrong role, owner scoping missing, viewer can write |
| G3-A2 | Audit trail | Sensitive actions with no log — who deleted what, when |

#### G4: Performance

| Code | Dimension | Description |
|------|-----------|-------------|
| G4-P1 | Query performance | N+1s, unbounded selects, missing indexes, no pagination |
| G4-P2 | Caching | Expensive reads happening on every render with no memoization or server cache |
| G4-P3 | Bundle / load | Heavy pages with no code splitting, no skeleton states |

#### G5: Observability

| Code | Dimension | Description |
|------|-----------|-------------|
| G5-O1 | Monitoring | No alerting on edge function failures, background job errors, payment failures |
| G5-O2 | Logging | Insufficient context in logs to debug production issues |
| G5-O3 | Analytics | User actions that should be tracked but aren't |

#### G6: Coverage

| Code | Dimension | Description |
|------|-----------|-------------|
| G6-C1 | Email coverage | Events that warrant a notification email but don't have one |
| G6-C2 | In-app notifications | Events tracked but not surfaced in the notification center |
| G6-C3 | Realtime | Data that should live-update but requires a manual refresh |

#### G7: Accessibility

| Code | Dimension | Description |
|------|-----------|-------------|
| G7-X1 | a11y | Missing ARIA labels, keyboard navigation, color contrast, focus management, screen reader support |

#### G8: Mobile / Responsive

| Code | Dimension | Description |
|------|-----------|-------------|
| G8-M1 | Responsive | Components that break at small viewports |
| G8-M2 | Touch | Tap targets too small, hover-only interactions, no swipe support |

#### G9: Compliance & Privacy

| Code | Dimension | Description |
|------|-----------|-------------|
| G9-V1 | GDPR / Compliance | No data export, no right-to-delete, missing consent flows |
| G9-V2 | Data retention | No cleanup policy for old sessions, logs, uploads |

#### G10: Developer Experience

| Code | Dimension | Description |
|------|-----------|-------------|
| G10-D1 | Consistency | Same problem solved three different ways across modules |
| G10-D2 | Dead code | Unused routes, hooks, DB columns that add confusion |
| G10-D3 | Migrations | Schema changes that need backfills not yet written |
| G10-D4 | Configuration | Missing env vars, feature flags, undocumented settings |

### G-code to MECE Mapping

Common G-code → MECE type pairings (not exhaustive — any combination is valid):

| G-code | Typical L | Typical T | Typical S |
|--------|-----------|-----------|-----------|
| G1-F1 | L2 | T4 | S2-S4 |
| G1-F2 | L4 | T5 | S4 |
| G1-F3 | L1 | T2 | S1-S2 |
| G1-F4 | L4 | T2 | S1-S2 |
| G2-R1 | L3 | T1 | S1 |
| G2-R2 | L2/L3 | T3 | S1 |
| G2-R3 | L1 | T1 | S1-S3 |
| G2-R4 | L2/L3 | T3 | S1 |
| G3-A1 | L2 | T3 | S1 |
| G3-A2 | L3 | T1 | S1 |
| G4-P1 | L2 | T3 | S2-S3 |
| G4-P2 | L2 | T3 | S2-S3 |
| G4-P3 | L6 | T5 | S3 |
| G5-O1 | L3 | T3 | S1 |
| G5-O2 | L2/L3 | T3 | S1 |
| G5-O3 | L3 | T5 | S2 |
| G6-C1 | L3 | T5 | S2 |
| G6-C2 | L3 | T5 | S2 |
| G6-C3 | L6 | T1 | S2 |
| G7-X1 | L5 | T5 | S3-S4 |
| G8-M1 | L5 | T5 | S3 |
| G8-M2 | L5 | T5 | S3 |
| G9-V1 | L2/L3 | T3 | S1 |
| G9-V2 | L3 | T3 | S1 |
| G10-D1 | L2 | T2 | S2 |
| G10-D2 | L2 | T2 | S2 |
| G10-D3 | L3 | T1 | S1 |
| G10-D4 | L1 | T3 | S1-S4 |

---

## Pipeline Types

### Backend Pipelines (P-series)

Server-side data flows triggered by user actions or system events. Scoped to their module (e.g., P-Inv-01 = Invoices module, pipeline 01):

| ID Format | Example | Trigger | Outcome |
|-----------|---------|---------|---------|
| P-[Mod]-NN | P-Quo-01: Create quote | Save button | Quote record created |
| P-[Mod]-NN | P-Pay-01: Process payment | Pay button | Stripe charge + invoice updated |
| P-[Mod]-NN | P-Job-01: Dispatch job | Dispatch button | Job assigned, notification sent |

### UI Pipelines (U-series)

Client-side interaction flows involving state, context, and visual feedback:

| ID Format | Example | Trigger | Outcome |
|-----------|---------|---------|---------|
| U-[Mod]-NN | U-Quo-01: Edit quote line items | Inline edit | Line item updated, total recalculated |
| U-Job-01 | U-Job-01: Reassign job from map | Drag on map | Job reassigned, calendar updated |

### Cross-Pipeline (X-series)

Failure modes at boundaries between pipelines:

| ID | Example | Boundary | Impact |
|----|---------|----------|--------|
| X-001 | Invoice not created after job completion | P-Job→P-Inv | Missing revenue |
| X-002 | Notification not sent after quote approval | P-Quo→P-Notif | Customer not informed |

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
| **Stale Closure** | L5-T1 | Callback uses outdated state | Edit uses wrong record id |
| **State Desync** | L3-T1 | UI shows stale data | Record doesn't refresh after save |
| **Missing Feedback** | L3-T5 | No loading/error indicator | Save starts, no spinner |
| **Context Loss** | L4-T1 | Navigation loses selection | Selection cleared on tab change |
| **Race Condition** | L5-T2 | Fast clicks cause wrong state | Double-submit creates duplicates |
| **Stream Disconnect** | L6-T3 | SSE connection drops mid-response | Partial content shown |
| **Callback Leak** | L5-T3 | Unregistered callbacks accumulate | Memory grows, slowdown |

### Full Finding Format (v5.0.0)

Every finding carries module, MECE classification, and G-code:

```
[ID] | [Location] · [Type] · [Severity] | [G-code] | [Description]

Example:
M03-P-Cust-01-005 | L1-Input · T1-Data · S1-Silent | G2-R3 | Customer email not validated server-side
M04-U-Job-01-003  | L5-Interaction · T2-Logic · S4-Blocking | G1-F3 | Dispatch fails silently when no driver assigned
```

### Coverage Calculation

```markdown
## Summary

| Module | Pipeline | Failure Modes | Validated | Coverage |
|--------|----------|---------------|-----------|----------|
| M-05 Quotes | P-Quo-01 | 8 | 3 | 38% |
| M-06 Invoices | P-Inv-01 | 7 | 2 | 29% |
| M-04 Jobs | U-Job-01 | 10 | 2 | 20% |
| Cross | X-* | 6 | 0 | 0% |
| **Total** | | **31** | **7** | **23%** |
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

### State Management Flows
- Context providers and consumers
- Selection state (what's selected → what's in context)
- Navigation state (current view → context.current_view)
- Real-time subscriptions (Supabase channels)

### User Interaction Patterns
- Modal flows (open → configure → submit → result)
- Inline editing (click → edit → save)
- Drag-and-drop
- Keyboard shortcuts

### Chat/Agent Interactions (if present)
- Chat components, tool handlers
- SSE/streaming response parsing
- Context synchronization

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

---

## Execution Flow

### Initialize State

```json
{
  "loop": "audit-loop",
  "version": "5.0.0",
  "phase": "TASTE",
  "status": "active",
  "phases": {
    "TASTE": { "skills": ["taste-discovery", "taste-eval"] },
    "INIT": { "skills": ["requirements", "module-enumeration", "pipeline-discovery", "ui-pipeline-discovery", "dependency-mapping"] },
    "REVIEW": { "skills": ["architecture-review", "security-audit", "perf-analysis", "failure-mode-analysis", "ui-failure-mode-analysis", "gap-matrix-analysis", "quality-eval-design", "taste-trace"] },
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
  "modules": [],
  "gap_matrix": {
    "dimensions": ["G1-F1","G1-F2","G1-F3","G1-F4","G2-R1","G2-R2","G2-R3","G2-R4","G3-A1","G3-A2","G4-P1","G4-P2","G4-P3","G5-O1","G5-O2","G5-O3","G6-C1","G6-C2","G6-C3","G7-X1","G8-M1","G8-M2","G9-V1","G9-V2","G10-D1","G10-D2","G10-D3","G10-D4"],
    "entries": []
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
TASTE ─────────► INIT ──────────────► REVIEW ─────────────────► VALIDATE
  │                │                     │
  │ [taste-gate]   │ [scope-gate]        │ [findings-gate]
  ▼                ▼                     ▼
taste-discovery  requirements          architecture-review    integration-test
taste-eval       module-enumeration    security-audit         ui-interaction-test
                 pipeline-disc         perf-analysis          code-verification
                 ui-pipeline-disc      failure-mode-analysis  test-spec-generation
                 dependency-map        ui-failure-mode-analysis
                                       gap-matrix-analysis
                                       quality-eval-design
                                       taste-trace

DOCUMENT ──────────► COMPLETE
  │
  │ [report-gate]
  ▼
document            retrospective
taste-report
```

**20 skills across 6 phases, 4 human gates**

---

## Skills by Phase

### TASTE Phase

| Skill | Output |
|-------|--------|
| **taste-discovery** | Find project evals (manifest/convention/defaults) |
| **taste-eval** | TASTE-EVAL.md, TASTE-GAPS.md |

### INIT Phase

| Skill | Output |
|-------|--------|
| requirements | Audit scope definition |
| **module-enumeration** | **MODULE-MAP.md — all modules with routes, components, hooks, DB tables** |
| pipeline-discovery | Backend pipelines (P-series), scoped to modules |
| ui-pipeline-discovery | UI pipelines (U-series), scoped to modules |
| dependency-mapping | Cross-pipeline failure modes (X-series) |

### REVIEW Phase

| Skill | Output |
|-------|--------|
| architecture-review | ARCHITECTURE-REVIEW.md |
| security-audit | SECURITY-AUDIT.md |
| perf-analysis | PERF-ANALYSIS.md |
| failure-mode-analysis | Backend failure modes with G-codes |
| ui-failure-mode-analysis | UI failure modes (L5/L6 patterns) with G-codes |
| **gap-matrix-analysis** | **GAP-MATRIX.md — module × 28 gap dimensions** |
| quality-eval-design | Content + UX quality evals |
| **taste-trace** | TASTE-TRACE.md (gap-to-failure-mode mapping) |

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
| **taste-report** | Taste-ordered checklist |

---

## Deliverables

| File | Phase | Purpose |
|------|-------|---------|
| `audit-state.json` | All | Phase, taste scores, modules, gap matrix, coverage |
| `TASTE-EVAL.md` | TASTE | Full dimension scores with evidence |
| `TASTE-GAPS.md` | TASTE | Identified taste gaps with evidence |
| `TASTE-TRACE.md` | REVIEW | Gap-to-failure-mode mapping |
| `AUDIT-SCOPE.md` | INIT | P-series + U-series + dependency map |
| **`MODULE-MAP.md`** | **INIT** | **All modules: routes, components, hooks, DB tables** |
| `ARCHITECTURE-REVIEW.md` | REVIEW | Architecture findings |
| `SECURITY-AUDIT.md` | REVIEW | Security findings |
| `PERF-ANALYSIS.md` | REVIEW | Performance findings |
| `PIPELINE-FAILURE-MODES.md` | REVIEW | Backend MECE taxonomy with G-codes |
| `UI-FAILURE-MODES.md` | REVIEW | UI MECE taxonomy with L5/L6 and G-codes |
| **`GAP-MATRIX.md`** | **REVIEW** | **Module × 28 gap dimensions: PRESENT / PARTIAL / MISSING** |
| `PIPELINE-VALIDATION.md` | VALIDATE | Backend coverage by pipeline |
| `UI-VALIDATION.md` | VALIDATE | UI coverage by pipeline |
| `PIPELINE-TEST-SPECS.md` | VALIDATE | Backend test specs |
| `UI-TEST-SPECS.md` | VALIDATE | UI test specs (component + E2E) |
| `CONTENT-QUALITY-EVALS.md` | REVIEW | Content quality framework |
| `UX-QUALITY-EVALS.md` | REVIEW | UX quality framework |
| `AUDIT-REPORT.md` | DOCUMENT | Taste-ordered checklist to done |
| `RETROSPECTIVE.md` | COMPLETE | Loop learnings |

**20 deliverables across 6 phases**

---

## Gate Presentations

### taste-gate

```
═══════════════════════════════════════════════════════════════
║  TASTE GATE                                    [HUMAN]      ║
║                                                             ║
║  Eval Source: [manifest | TASTE-EVALS.md | defaults]        ║
║                                                             ║
║  Dimension Scores:                                          ║
║    usability:       3.8  [floor: 2.5] ✓                    ║
║    responsiveness:  3.2  [floor: 2.5] ✓                    ║
║    reliability:     2.6  [floor: 2.5] ✓                    ║
║    accessibility:   2.1  [floor: 2.5] ✗ GAP                ║
║                                                             ║
║  Taste Gaps:                                                ║
║    TG-001 [ux] accessibility: 2.1 < 2.5 (CRITICAL)         ║
║                                                             ║
║  Weighted Score: 3.1                                        ║
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

### scope-gate

```
═══════════════════════════════════════════════════════════════
║  SCOPE GATE                                    [HUMAN]      ║
║                                                             ║
║  Modules Enumerated: 20                                     ║
║    M-01 Auth         M-11 Reviews                           ║
║    M-02 Dashboard    M-12 Gallery/Photos                    ║
║    M-03 Customers    M-13 Reports                           ║
║    M-04 Jobs         M-14 Team/HR                           ║
║    M-05 Quotes       M-15 Settings                          ║
║    M-06 Invoices     M-16 Portal                            ║
║    M-07 Subscriptions M-17 Notifications                    ║
║    M-08 Routes       M-18 Public Pages                      ║
║    M-09 Messaging    M-19 Edge Functions                    ║
║    M-10 Email Mktg   M-20 Shared/Core                      ║
║                                                             ║
║  Pipelines Discovered:                                      ║
║    Backend (P-series): 38 across 20 modules                 ║
║    UI (U-series): 22 across 14 modules                      ║
║    Cross (X-series): 11 boundaries                          ║
║                                                             ║
║  Gap Dimensions: 28 (G1-F1 → G10-D4)                       ║
║  Matrix cells to fill: 20 × 28 = 560                        ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to REVIEW            ║
║    changes: ...  — Add/remove modules or dimensions         ║
═══════════════════════════════════════════════════════════════
```

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
║    X-series: 11 modes | 0 validated | 0%                    ║
║                                                             ║
║  Overall: 91 modes | 24 validated | 26%                     ║
║                                                             ║
║  Gap Matrix Summary:                                        ║
║    MISSING cells: 147/560 (26%)                             ║
║    PARTIAL cells: 213/560 (38%)                             ║
║    PRESENT cells: 200/560 (36%)                             ║
║                                                             ║
║  Top gap dimensions by MISSING count:                       ║
║    G5-O1 Monitoring: 16/20 modules missing                  ║
║    G2-R4 Recovery:   14/20 modules missing                  ║
║    G9-V1 GDPR:       13/20 modules missing                  ║
║                                                             ║
║  Risk Heat Map:                                             ║
║    S1-Silent: 31 (HIGHEST RISK)                             ║
║    L5-Interaction: 14 (UI-specific)                         ║
║    G3-A1 RBAC: 8 modules (SECURITY)                         ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to VALIDATE          ║
║    changes: ...  — Request deeper analysis                  ║
║    show matrix   — Full GAP-MATRIX.md contents              ║
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

**Within Tier 3, secondary ordering:** G3-A1 (security) > G2-R (reliability) > G1-F (functional) > all others.

### Example Output

```markdown
## Checklist to Done (Taste-Ordered)

### Tier 1: Taste-Critical
*Linked to critical taste gaps (below floor)*

| # | Module | Item | Taste Gap | Failure Mode | G-code | Effort |
|---|--------|------|-----------|--------------|--------|--------|
| 1 | M-07 Subscriptions | Fix payment failure leaving invoice unpaid | TG-001 | P-Sub-01-003 (S1) | G2-R4 | M |
| 2 | M-04 Jobs | Show dispatch error when no driver available | TG-001 | U-Job-01-003 (S4) | G1-F3 | S |

### Tier 2: Taste-Significant
*Linked to significant taste gaps*

| # | Module | Item | Taste Gap | Failure Mode | G-code | Effort |
|---|--------|------|-----------|--------------|--------|--------|
| 3 | M-17 Notifications | Surface job-completed notification in center | TG-002 | P-Job-02-005 (S2) | G6-C2 | S |
| 4 | M-05 Quotes | Show loading state during quote send | TG-002 | U-Quo-01-004 (S3) | G4-P3 | S |

### Tier 3: Technical-Only
*No taste link, ordered by: security > reliability > functional > all others*

| # | Module | Item | Type | Failure Mode | G-code | Effort |
|---|--------|------|------|--------------|--------|--------|
| 5 | M-03 Customers | Add server-side email validation | Backend | P-Cust-01-005 (S1) | G2-R3 | S |
| 6 | M-06 Invoices | Add RLS policy for viewer role | Backend | P-Inv-01-002 (S1) | G3-A1 | S |
| 7 | M-19 Edge Fns | Alert on payment webhook failures | Backend | P-Pay-01-007 (S1) | G5-O1 | M |

### Gap Matrix Summary

| G-code | Dimension | Missing | Partial | Present |
|--------|-----------|---------|---------|---------|
| G5-O1 | Monitoring | 16 | 3 | 1 |
| G2-R4 | Recovery | 14 | 4 | 2 |
| G9-V1 | GDPR | 13 | 2 | 5 |
| G3-A2 | Audit trail | 11 | 5 | 4 |
| G6-C3 | Realtime | 10 | 6 | 4 |

### Coverage Summary

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| **Taste Score** | **3.1** | **3.5** | **+0.4** |
| Backend Coverage | 37% | 70% | 33 tests |
| UI Coverage | 18% | 60% | 23 tests |
| Cross Coverage | 0% | 50% | 11 tests |
| Gap Matrix (PRESENT) | 36% | 70% | ~190 gaps |
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
    "requiredDeliverables": [...],
    "skillGuarantees": [...],
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

**DO NOT proceed to TASTE phase until you have loaded this context.**

### During Execution

**After completing each skill**, call:
```
mcp__orchestrator__complete_skill({
  executionId: "[stored executionId]",
  skillId: "[skill name]",
  deliverables: ["GAP-MATRIX.md", "MODULE-MAP.md"]  // optional
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

### Server Resilience (CRITICAL)

**If any MCP tool call fails with a connection error, DO NOT exit the loop.** Follow the retry protocol in `commands/_shared/server-resilience-protocol.md`:

1. Tell the user the server connection was lost
2. Wait 5 seconds, then retry the same call (the PreToolUse hook will restart the server)
3. If 3 retries fail, ask the user whether to wait, skip, or stop
4. Your executionId survives server restarts — do NOT create a new execution
5. Continue the loop from where you left off

---

## On Completion

When this loop reaches COMPLETE phase:

### 1. Archive Run (Full Artifacts)

**Location:** `~/.claude/runs/{year-month}/{project}-audit-loop-{timestamp}/`

```bash
ARCHIVE_DIR=~/.claude/runs/$(date +%Y-%m)/${PROJECT}-audit-loop-$(date +%Y%m%d-%H%M)
mkdir -p "$ARCHIVE_DIR"

# Archive all audit artifacts
mv audit-state.json "$ARCHIVE_DIR/" 2>/dev/null || true
cp TASTE-EVAL.md TASTE-GAPS.md TASTE-TRACE.md \
   MODULE-MAP.md GAP-MATRIX.md \
   AUDIT-REPORT.md AUDIT-SCOPE.md \
   ARCHITECTURE-REVIEW.md SECURITY-AUDIT.md PERF-ANALYSIS.md \
   PIPELINE-FAILURE-MODES.md UI-FAILURE-MODES.md \
   PIPELINE-VALIDATION.md UI-VALIDATION.md \
   PIPELINE-TEST-SPECS.md UI-TEST-SPECS.md \
   CONTENT-QUALITY-EVALS.md UX-QUALITY-EVALS.md \
   RETROSPECTIVE.md \
   "$ARCHIVE_DIR/" 2>/dev/null || true
```

### 2. Commit Audit Report

```bash
git add -A
git diff --cached --quiet || git commit -m "Audit complete: [system] [coverage]%

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 3. Clean Project Directory

```bash
rm -f TASTE-EVAL.md TASTE-GAPS.md TASTE-TRACE.md \
      MODULE-MAP.md GAP-MATRIX.md \
      AUDIT-REPORT.md AUDIT-SCOPE.md \
      ARCHITECTURE-REVIEW.md SECURITY-AUDIT.md PERF-ANALYSIS.md \
      PIPELINE-FAILURE-MODES.md UI-FAILURE-MODES.md \
      PIPELINE-VALIDATION.md UI-VALIDATION.md \
      PIPELINE-TEST-SPECS.md UI-TEST-SPECS.md \
      CONTENT-QUALITY-EVALS.md UX-QUALITY-EVALS.md \
      RETROSPECTIVE.md audit-state.json 2>/dev/null || true
```

### 4. Leverage Proposal (REQUIRED)

Before showing completion, evaluate and propose the next highest leverage move.

---

## Summary of Changes

### v5.0.0 (current)

| Area | v4.0.2 | v5.0.0 |
|------|--------|--------|
| **Module decomposition** | None | **M-series: 20 modules, explicit enumeration** |
| **Gap taxonomy** | None | **G-series: 28 dimensions across 10 categories** |
| **New skills** | 18 | **20 (+module-enumeration, +gap-matrix-analysis)** |
| **New deliverables** | 18 | **20 (+MODULE-MAP.md, +GAP-MATRIX.md)** |
| **Finding format** | `L×T×S` | **`Module · L×T×S · G-code`** |
| **Scope gate** | Pipelines only | **Pipelines + module list** |
| **Findings gate** | Coverage only | **Coverage + gap matrix summary** |
| **Checklist Tier 3 order** | S1→S4 | **Security > Reliability > Functional > others** |
| **Phases** | 6 | 6 (unchanged) |
| **Human gates** | 4 | 4 (unchanged) |

**Key insight:** The gap taxonomy is a *product-layer annotation* on the MECE technical classification. They answer different questions — MECE answers "what failed and where?", G-series answers "what kind of gap is this?" A single finding carries both.

### What Stays the Same

All v4.x rigor preserved:
- TASTE phase as entry point with taste-ordered checklist
- MECE failure mode taxonomy (L1-L6, T1-T5, S1-S4)
- Pipeline discovery (P-series, U-series, X-series)
- Coverage tracking and percentages
- Test spec generation
- Security, architecture, performance audits
- All 4 human gates

---

## Appendix: MODULE-MAP.md Template

```markdown
# Module Map

**Project:** [project-name]
**Timestamp:** [ISO 8601]
**Modules:** 20

## M-01: Auth

| Attribute | Value |
|-----------|-------|
| **Routes** | /login, /signup, /forgot-password, /reset-password |
| **Components** | LoginForm, SignupForm, PasswordResetForm |
| **Hooks** | useAuth, useSession, useSignOut |
| **Edge Functions** | auth-callback, resend-verification |
| **DB Tables** | auth.users (Supabase managed) |
| **Pipelines** | P-Auth-01: Sign in, P-Auth-02: Sign up, P-Auth-03: Password reset |

...

## M-05: Quotes

| Attribute | Value |
|-----------|-------|
| **Routes** | /quotes, /quotes/new, /quotes/[id], /quotes/[id]/edit |
| **Components** | QuoteList, QuoteDetail, QuoteForm, LineItemEditor, QuoteSummary |
| **Hooks** | useQuotes, useQuote, useCreateQuote, useUpdateQuote, useSendQuote |
| **Edge Functions** | send-quote-email, generate-quote-pdf |
| **DB Tables** | quotes, quote_line_items, quote_attachments |
| **Pipelines** | P-Quo-01: Create quote, P-Quo-02: Send quote, P-Quo-03: Approve quote |
```

---

## Appendix: GAP-MATRIX.md Template

```markdown
# Gap Matrix

**Project:** [project-name]
**Timestamp:** [ISO 8601]
**Modules:** 20 | **Dimensions:** 28 | **Total cells:** 560

## Legend
- ✓ PRESENT — Gap addressed, handling exists
- ⚠ PARTIAL — Some handling, incomplete
- ✗ MISSING — No handling found
- — N/A — Not applicable to this module

## Matrix

| Module | G1-F1 | G1-F2 | G1-F3 | G1-F4 | G2-R1 | G2-R2 | G2-R3 | G2-R4 | G3-A1 | G3-A2 | G4-P1 | G4-P2 | G4-P3 | G5-O1 | G5-O2 | G5-O3 | G6-C1 | G6-C2 | G6-C3 | G7-X1 | G8-M1 | G8-M2 | G9-V1 | G9-V2 | G10-D1 | G10-D2 | G10-D3 | G10-D4 |
|--------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|--------|--------|--------|--------|
| M-01 Auth | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-02 Dashboard | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-03 Customers | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-04 Jobs | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-05 Quotes | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-06 Invoices | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-07 Subscriptions | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-08 Routes | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-09 Messaging | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-10 Email Mktg | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-11 Reviews | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-12 Gallery | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-13 Reports | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-14 Team/HR | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-15 Settings | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-16 Portal | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-17 Notifications | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-18 Public Pages | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-19 Edge Functions | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| M-20 Shared/Core | | | | | | | | | | | | | | | | | | | | | | | | | | | | |

## Summary by Dimension

| G-code | Dimension | PRESENT | PARTIAL | MISSING | N/A |
|--------|-----------|---------|---------|---------|-----|
| G1-F1 | Feature completeness | | | | |
| G1-F2 | Workflow completeness | | | | |
| G1-F3 | Edge case handling | | | | |
| G1-F4 | Integration composition | | | | |
| G2-R1 | Data integrity | | | | |
| G2-R2 | Error handling | | | | |
| G2-R3 | Validation | | | | |
| G2-R4 | Recovery | | | | |
| G3-A1 | Permission/RBAC | | | | |
| G3-A2 | Audit trail | | | | |
| G4-P1 | Query performance | | | | |
| G4-P2 | Caching | | | | |
| G4-P3 | Bundle/load | | | | |
| G5-O1 | Monitoring | | | | |
| G5-O2 | Logging | | | | |
| G5-O3 | Analytics | | | | |
| G6-C1 | Email coverage | | | | |
| G6-C2 | In-app notifications | | | | |
| G6-C3 | Realtime | | | | |
| G7-X1 | Accessibility | | | | |
| G8-M1 | Responsive | | | | |
| G8-M2 | Touch | | | | |
| G9-V1 | GDPR/Compliance | | | | |
| G9-V2 | Data retention | | | | |
| G10-D1 | Consistency | | | | |
| G10-D2 | Dead code | | | | |
| G10-D3 | Migrations | | | | |
| G10-D4 | Configuration | | | | |

## Top Gaps

Dimensions with the most MISSING cells (ordered):

| Rank | G-code | Dimension | Missing | Key modules affected |
|------|--------|-----------|---------|---------------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
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
