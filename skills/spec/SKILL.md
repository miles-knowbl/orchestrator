---
name: spec
description: "Compile requirements into production-ready technical specifications. Transforms requirements documents into comprehensive 18-section FeatureSpecs (~2000+ lines) with full code, SQL migrations, UI components, feedback timing, and senior engineer audit. Maintains Process Map as system-of-record. The primary driver of the implementation process."
phase: INIT
category: core
version: "1.0.0"
depends_on: ["architect"]
tags: [planning, specification, requirements]
---

# Spec

Compile requirements into production-ready technical specifications.

## When to Use

- **After requirements are gathered** — Requirements doc is approved, ready for technical spec
- **Before implementation** — Need production-ready specification with full code
- **Complex feature** — Multiple entities, services, UI components
- **Team handoff** — Spec becomes the implementation contract
- When you say: "compile this spec", "write the technical spec", "create a FeatureSpec"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `18-section-template.md` | Defines all required sections and format |
| `capability-format.md` | Structure for each capability definition |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `feedback-framework.md` | For UI-heavy features requiring timing/haptics |
| `process-map-template.md` | When maintaining cross-spec tracking |
| `memory-axioms.md` | For state management patterns |

**Verification:** Ensure your FeatureSpec has all 18 sections before marking complete.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `FEATURESPEC.md` | Project root | Always (1500+ lines minimum) |
| Process Map update | `domain-memory/{domain}/process-map.md` | If Process Map exists |

## Core Concept

Spec compilation answers: **"How exactly do we build this?"**

A compiled FeatureSpec is:
- **Complete** — 18 sections covering all aspects of implementation
- **Production-ready** — Full code, not pseudocode or placeholders
- **Audited** — Senior engineer review with issues resolved
- **Traceable** — Numbered capabilities, entities, and specs

A FeatureSpec is NOT:
- Requirements (that's `requirements`)
- High-level architecture (that's `architect`)
- The actual implementation (that's `implement`)

## The Compilation Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPEC COMPILATION LOOP                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│   │Requirements  │     │  Compiler    │     │FeatureSpec   │   │
│   │v1.0 (PM)     │────▶│  Process     │────▶│ v1.1         │   │
│   │~200-500 lines│     │  (Claude)    │     │ ~2000+ lines │   │
│   └──────────────┘     └──────────────┘     └──────────────┘   │
│                               │                     │           │
│                               │                     │           │
│                               ▼                     ▼           │
│                        ┌─────────────────────────────────┐     │
│                        │         Process Map             │     │
│                        │  • Entities registry            │     │
│                        │  • Coverage tracking            │     │
│                        │  • Compiled specs list          │     │
│                        │  • Architecture diagram         │     │
│                        └─────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Compilation Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  TEMPLATE-BASED COMPILATION                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  INPUT                                                                  │
│  ─────                                                                  │
│  • Requirements document (from `requirements` skill)                    │
│  • This compilation process                                             │
│  • Exemplar specs (previous compilations)                               │
│  • Process Map (current version)                                        │
│                                                                         │
│                          ▼                                              │
│                                                                         │
│  STEP 1: Structure Against Template                                     │
│  ──────────────────────────────────                                     │
│  • Create all 18 sections from template                                 │
│  • Assign Spec ID (SPEC-###)                                            │
│  • Number capabilities (CAP-001, CAP-002, ...)                          │
│  • Fill header with compilation summary table                           │
│  • Reference exemplar specs for format/style                            │
│                                                                         │
│                          ▼                                              │
│                                                                         │
│  STEP 2: Apply Feedback Framework                                       │
│  ────────────────────────────────                                       │
│  • Add Feedback Timing Requirements section                             │
│  • Add feedback block to each capability                                │
│  • Add haptic patterns, timing bands, animations                        │
│  • Implement optimistic UI in all service layer code                    │
│  • Apply Paintbrush Test to every interaction                           │
│                                                                         │
│                          ▼                                              │
│                                                                         │
│  STEP 3: Apply Production Framework                                     │
│  ─────────────────────────────────                                      │
│  • Senior Engineer Audit (document issues found)                        │
│  • Integrate ALL fixes into spec (not comments)                         │
│  • Add observability (metrics, logs, alerts)                            │
│  • Add test scenarios (security, concurrency, failure, load)            │
│  • Add feature flags and rollback plan                                  │
│                                                                         │
│                          ▼                                              │
│                                                                         │
│  STEP 4: Validate Template Compliance                                   │
│  ────────────────────────────────────                                   │
│  • Check all 18 sections present                                        │
│  • Verify minimum 1,500 lines (target 2,000+)                           │
│  • Verify numbered capabilities with feedback                           │
│  • Verify full code (not placeholders)                                  │
│  • Verify complete SQL migrations                                       │
│  • Run compatibility check against Process Map                          │
│                                                                         │
│                          ▼                                              │
│                                                                         │
│  STEP 5: Update Process Map                                             │
│  ──────────────────────────                                             │
│  • Add to Compiled Specs Registry                                       │
│  • Update coverage percentages                                          │
│  • Add new entities to registry                                         │
│  • Increment Process Map version                                        │
│                                                                         │
│  OUTPUT                                                                 │
│  ──────                                                                 │
│  • Compiled FeatureSpec v1.x                                            │
│  • Updated Process Map                                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## The 18 Required Sections

Every compiled spec includes:

| # | Section | Purpose | Minimum Content |
|---|---------|---------|-----------------|
| 1 | **Header** | Identity & summary | Spec ID, version, compilation summary table |
| 2 | **Feature Overview** | Business context | User stories, scope, key principles |
| 3 | **Architecture Overview** | System diagram | Layer descriptions, data flow |
| 4 | **Feedback Timing Requirements** | UX timing | Timing bands, haptic patterns |
| 5 | **Entities** | Database tables | NEW tables + EXTENSIONS with full SQL |
| 6 | **Capabilities** | Numbered features | CAP-### with feedback specs |
| 7 | **Service Layer** | Business logic | Full code with optimistic patterns |
| 8 | **UI Components** | Frontend code | Full components with all states |
| 9 | **Database Migrations** | Schema changes | Complete SQL with indexes, triggers |
| 10 | **API Layer** | Endpoints/functions | Production-ready, not stubs |
| 11 | **Authorization** | Permissions/policies | Granular, role-based |
| 12 | **Observability** | Monitoring | Metrics, logs, alerts with runbooks |
| 13 | **Feature Flags** | Rollout controls | Flags with scope and defaults |
| 14 | **Test Scenarios** | Quality assurance | Security, concurrency, failure, load |
| 15 | **Verification Checklist** | Implementation validation | Checklist for implementers |
| 16 | **Implementation Priority** | Phased delivery | Priority order, dependencies |
| 17 | **Files to Create/Modify** | Directory structure | Full file paths |
| 18 | **Compilation Summary** | Audit results | Senior Engineer issues & resolutions |

→ See `references/18-section-template.md` for detailed section guidance

## Minimum Requirements

```yaml
template_compliance:
  lines: 
    minimum: 1500
    target: 2000+
    exemplar: 3000+
    
  sections:
    required: 18
    all_present: true
    
  capabilities:
    numbered: true  # CAP-001, CAP-002, ...
    feedback_block: true  # Each has timing/haptic/visual/optimistic specs
    
  code:
    service_layer: "Full implementation, not pseudocode"
    ui_components: "Full components, not wireframes"
    migrations: "Complete SQL, not schema descriptions"
    api_layer: "Production-ready, not stubs"
    
  quality:
    spec_id: "SPEC-### assigned"
    compilation_summary: "Senior Engineer audit table with resolutions"
    test_scenarios: "Minimum 3 per category"
```

## Code Completeness Rules

**Never write:**
- `// TODO: implement`
- `... rest of implementation`
- Pseudocode or placeholders
- Truncated functions

**Always write:**
- Full, working implementations
- All edge cases handled
- Error handling included
- TypeScript/language types complete

## Capability Format

Each capability MUST have:

```yaml
capability: capability_name
id: CAP-###
description: What it does
actor: Who triggers it
trigger: What triggers it

input:
  field1: type
  field2: type

output:
  result: type

validation:
  - Rule 1
  - Rule 2

side_effects:
  - Effect 1
  - Effect 2

feedback:
  timing:
    input_acknowledgment: 0ms
    local_render: <50ms
    server_confirm: background
  haptic:
    on_action: light_impact
    on_error: error_pattern
  visual:
    pending: Description
    success: Description
    error: Description
  optimistic:
    strategy: Description
    rollback: Description

error_handling:
  ERROR_CODE_1: "User message"
  ERROR_CODE_2: "User message"
```

→ See `references/capability-format.md` for detailed examples

## Feedback Framework

### The Paintbrush Principle

A paintbrush feels instantaneous because feedback arrives **before you consciously expect it**. The brain takes ~100ms to form "did that work?" — anything under 50ms feels like cause-and-effect.

**Goal:** Every interaction should pass the Paintbrush Test.

### Timing Bands

| Band | Target | Perception | Use For |
|------|--------|------------|---------|
| **0ms** | At input event | Extension of body | Haptic, press state, selection |
| **<16ms** | Every frame | Fluid tracking | Cursor, drag, scroll |
| **<50ms** | Perceived instant | Cause-and-effect | Optimistic UI, count update |
| **<150ms** | Animated | Smooth transition | Dropdown, modal appear |
| **<300ms** | Spring settle | Physics-based | Drop into place, reorder |
| **Background** | Never blocks UI | Invisible | Network calls, sync |

→ See `references/feedback-framework.md` for the Four Gaps and interaction patterns

## Senior Engineer Audit

Every compiled spec includes an audit table:

```markdown
| Issue | Category | Resolution |
|-------|----------|------------|
| No rate limiting | Security | Added 100 req/min limit |
| Race condition on update | Concurrency | Added optimistic locking |
| Missing index | Performance | Added composite index |
```

### Audit Categories

| Category | What to Check |
|----------|---------------|
| **Security** | Input validation, auth checks, rate limiting, injection prevention |
| **Concurrency** | Optimistic locking, idempotency, race conditions, deadlocks |
| **Reliability** | Retry logic, graceful degradation, timeouts, circuit breakers |
| **Scalability** | Batch processing, indexes, N+1 queries, unbounded queries |
| **Observability** | Metrics, structured logging, alerts, runbooks |
| **Data Model** | Constraints, triggers, soft delete, state machines |

→ See `references/senior-engineer-audit.md` for full checklist

## Process Map

The Process Map is the **single source of truth** for:
- All entities and their schemas
- All services/hooks and their purposes
- Coverage percentages per process
- Compiled specs registry

### After Every Compilation

1. Add new entities to Entity Registry
2. Update coverage percentages
3. Add to Compiled Specs Registry
4. Increment version number
5. Add changelog entry

→ See `references/process-map-template.md` for blank template

## Stack Adaptation

Map generic sections to your stack:

| Generic Section | React/Supabase | Django/Postgres | Rails/Postgres |
|-----------------|----------------|-----------------|----------------|
| Service Layer | React Hooks | Services/Managers | Service Objects |
| UI Components | TSX Components | Django Templates | ERB Views |
| API Layer | Edge Functions | Views/Viewsets | Controllers |
| Authorization | RLS Policies | Permissions | Pundit Policies |
| Realtime | Supabase Realtime | Django Channels | ActionCable |

## Output Format

### Header Template

```markdown
# [Feature] FeatureSpec v1.1

| Property | Value |
|----------|-------|
| **Spec ID** | SPEC-### |
| **Version** | 1.1 (Compiled) |
| **Status** | Ready for Implementation |
| **Target Project** | [Project Name] |
| **Compilation Date** | [Date] |
| **Lines** | [Count] |
| **Capabilities** | [Count] |
```

### Compilation Summary Template

```markdown
## Compilation Summary

| Pass | Focus | Key Additions |
|------|-------|---------------|
| 1 | Compatibility Alignment | Entity verification, FK references |
| 2 | Feedback Framework | Timing bands, haptic patterns, optimistic UI |
| 3 | Senior Engineer Review | Security, concurrency, reliability fixes |
| 4 | Process Map Update | Coverage %, entity registry |

### Senior Engineer Audit Results

| Category | Issues Found | Issues Resolved | Status |
|----------|--------------|-----------------|--------|
| Security | X | X | ✅ |
| Concurrency | X | X | ✅ |
| Reliability | X | X | ✅ |
| **Total** | **Y** | **Y** | ✅ |
```

## Quality Checklist

Before presenting a compiled spec:

```markdown
- [ ] Spec ID assigned (SPEC-###)
- [ ] All 18 sections present
- [ ] 1,500+ lines minimum
- [ ] All capabilities numbered (CAP-###)
- [ ] All capabilities have feedback block
- [ ] All code is complete (no TODOs)
- [ ] Senior Engineer audit table filled
- [ ] Test scenarios: 3+ per category
- [ ] Process Map updated
```

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `requirements` | Requirements feed into spec compilation |
| `architect` | Spec includes architecture; architect provides high-level design |
| `frontend-design` | (Frontend systems) UI/UX section becomes DESIGN.md |
| `implement` | Spec is the implementation contract |
| `code-verification` | Verification checks against spec patterns |
| `code-validation` | Validation checks against spec requirements |
| `code-review` | Review verifies spec was implemented correctly |

## Key Principles

**Complete, not partial.** Every section is filled. Every code block works. No placeholders.

**Audited, not assumed.** Senior engineer review catches issues before implementation.

**Traceable, not ad-hoc.** Spec IDs, capability numbers, entity references create audit trail.

**Living document.** Specs version. Updates increment version. Old versions are preserved.

**Process Map is truth.** Always check it first. Always update it after.

## References

- `references/18-section-template.md`: Detailed section-by-section guidance
- `references/feedback-framework.md`: Timing bands, haptics, optimistic UI patterns
- `references/capability-format.md`: How to write capability specifications
- `references/senior-engineer-audit.md`: Full audit checklist by category
- `references/process-map-template.md`: Blank Process Map template
- `references/memory-axioms.md`: Principles for maintaining project memory
