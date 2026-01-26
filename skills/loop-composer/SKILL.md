---
name: loop-composer
description: "Design and compose loops from requirements. Handles skill selection, phase sequencing, gate placement, dependency validation, and loop.json generation. The architectural counterpart to loop-controller's runtime execution."
phase: SCAFFOLD
category: meta
version: "1.0.0"
depends_on: [skill-design]
tags: [meta, loops, composition, design, orchestration]
---

# Loop Composer

Design and compose loops from requirements. Transform domain intent into executable loop definitions.

## When to Use

- **Building a new loop from scratch** -- You have a domain (engineering, proposal, analysis) and need a structured multi-phase workflow
- **Customizing an existing loop** -- An existing loop is close but needs phases added, removed, or reordered for a different use case
- **Composing a lightweight loop** -- You need a minimal 3-4 phase loop for a focused task rather than the full engineering gauntlet
- **Validating loop correctness** -- You have a loop.json and need to verify skill coverage, dependency satisfaction, and gate placement
- **Designing domain-specific workflows** -- A new domain (security audit, data pipeline, content creation) needs its own loop pattern
- When you say: "create a loop for...", "design a workflow that...", "compose a new loop", "what skills do I need for..."

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `loop-schema.md` | Complete loop.json schema -- every field you can set |
| `phase-sequencing.md` | Phase ordering rules, required vs optional, valid transitions |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `gate-design.md` | When placing human-in-the-loop gates or configuring approval types |
| `skill-selection.md` | When querying the registry to find skills for a domain |
| `composition-patterns.md` | When following a known pattern (engineering, proposal, lightweight) |

**Verification:** Ensure the composed loop.json passes schema validation and all referenced skills exist in the registry.

## Required Deliverables

| Deliverable | Condition | Purpose |
|-------------|-----------|---------|
| `loop.json` | Always | The executable loop definition consumed by loop-controller |
| `LOOP.md` | Always | Human-readable description of the loop's purpose and flow |
| `COMPOSITION-NOTES.md` | When design decisions are non-obvious | Documents why skills were selected, phases ordered, and gates placed |

## Core Concept

This skill answers: **"Given a domain and desired outcome, what is the optimal sequence of skills, phases, and gates to achieve it?"**

Loop composition IS:
- Selecting the right skills from the registry for a domain
- Sequencing phases in valid order with correct dependencies
- Placing gates at decision points where human review adds value
- Generating a valid loop.json that loop-controller can execute
- Configuring UI, metadata, and defaults for the loop's context

Loop composition IS NOT:
- Executing the loop (that is `loop-controller`)
- Creating new skills (that is `skill-design`)
- Defining requirements (that is `requirements` or `spec`)
- Runtime orchestration (that is `orchestrator`)
- Modifying skill behavior (skills are atomic units, compose them, don't change them)

## Process Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                     LOOP COMPOSITION PROCESS                        │
│                                                                     │
│  1. REQUIREMENTS GATHERING                                          │
│     └─→ Domain, outcome, constraints, autonomy level                │
│                                                                     │
│  2. SKILL DISCOVERY                                                 │
│     └─→ Query registry, filter by domain/phase, check coverage      │
│                                                                     │
│  3. PHASE MAPPING                                                   │
│     └─→ Assign skills to phases, enforce ordering rules             │
│                                                                     │
│  4. GATE PLACEMENT                                                  │
│     └─→ Insert human checkpoints at decision boundaries             │
│                                                                     │
│  5. DEPENDENCY VALIDATION                                           │
│     └─→ Verify skill deps satisfied, no circular references         │
│                                                                     │
│  6. CONFIGURATION                                                   │
│     └─→ Set defaults, UI theme, skillUI entries, metadata           │
│                                                                     │
│  7. COMPOSITION                                                     │
│     └─→ Assemble loop.json, validate against schema                 │
│                                                                     │
│  8. TESTING                                                         │
│     └─→ Dry-run validation, verify skills exist, check integrity    │
│                                                                     │
│  Output: loop.json + LOOP.md + (optional) COMPOSITION-NOTES.md      │
└──────────────────────────────────────────────────────────────────────┘
```

## Step 1: Requirements Gathering

Before composing a loop, capture the design inputs. Every loop starts with understanding what it needs to accomplish.

### Requirements Interview

| Question | Purpose | Example Answer |
|----------|---------|----------------|
| What domain is this loop for? | Determines skill pool | "Engineering", "Proposal", "Security Audit" |
| What is the desired outcome? | Shapes phase selection | "Production-deployed feature", "Approved proposal" |
| What quality level is needed? | Controls phase depth | "Full rigor" vs "Quick iteration" |
| Who are the stakeholders? | Determines gate placement | "Engineering lead reviews architecture" |
| What autonomy level? | Sets supervision model | "supervised", "semi-autonomous", "autonomous" |
| Are there constraints? | Limits skill/phase choices | "No deployment phase", "Must include security" |
| Greenfield or brownfield? | Sets mode defaults | Affects skill behavior within the loop |

### Requirements Template

```markdown
## Loop Requirements

### Domain
[Engineering | Proposal | Analysis | Security | Content | Custom: ___]

### Desired Outcome
[What does a successful loop execution produce?]

### Quality Level
- [ ] Lightweight (3-4 phases, minimal gates)
- [ ] Standard (5-7 phases, key gates)
- [ ] Full rigor (8-10 phases, comprehensive gates)

### Stakeholders & Review Points
- [Role]: Reviews at [phase]
- [Role]: Approves at [phase]

### Autonomy
- [ ] Supervised (human approves every gate)
- [ ] Semi-autonomous (human approves critical gates only)
- [ ] Autonomous (automated gates, human notified)

### Constraints
- Must include: [skills/phases]
- Must exclude: [skills/phases]
- Mode: [greenfield | brownfield]
```

### Requirement Validation Checklist

```markdown
- [ ] Domain is identified
- [ ] Outcome is concrete and measurable
- [ ] Quality level is chosen
- [ ] At least one stakeholder role is defined
- [ ] Autonomy level is set
- [ ] Hard constraints are documented
```

## Step 2: Skill Discovery

Query the skill registry to find candidate skills for the loop. The registry contains all available skills with their phase assignments, categories, dependencies, and descriptions.

### Discovery Process

1. **List all skills** -- Get the full registry inventory
2. **Filter by relevance** -- Match skills to the domain and outcome
3. **Check phase coverage** -- Ensure at least one skill per required phase
4. **Identify gaps** -- Find phases with no skill coverage
5. **Resolve dependencies** -- Pull in skills required by selected skills

### Skill Query Strategy

| Strategy | When to Use | How |
|----------|-------------|-----|
| **Phase-based** | Building a standard loop | Query skills grouped by phase, pick best per phase |
| **Domain-based** | Domain-specific loop | Filter by tags matching the domain |
| **Category-based** | Infrastructure loop | Filter by category (core, infra, specialized, meta) |
| **Dependency-based** | Extending a skill | Start from a skill, pull in all its dependencies |

### Coverage Analysis Table

Build this table during discovery to track coverage:

```markdown
| Phase | Available Skills | Selected | Reason |
|-------|-----------------|----------|--------|
| INIT | spec, entry-portal, document, ... | spec | Core requirements capture |
| SCAFFOLD | architect, scaffold | architect, scaffold | Design + file generation |
| IMPLEMENT | implement, error-handling | implement | Core implementation |
| TEST | test-generation | test-generation | Test suite generation |
| VERIFY | code-verification | code-verification | Structural checks |
| VALIDATE | perf-analysis | -- | Not needed for MVP |
| DOCUMENT | document | document | API docs generation |
| REVIEW | code-review | code-review | PR review |
| SHIP | deploy | deploy | Production deployment |
| COMPLETE | loop-controller | loop-controller | Loop finalization |
```

### Skill Selection Criteria

For each candidate skill, evaluate:

| Criterion | Weight | Question |
|-----------|--------|----------|
| Domain fit | High | Does this skill serve the loop's domain? |
| Phase fit | High | Is it assigned to a phase we need? |
| Dependency cost | Medium | How many additional skills does it pull in? |
| Category match | Medium | Does its category match our loop type? |
| Optionality | Low | Can we skip it without breaking the loop? |

See `references/skill-selection.md` for detailed selection algorithms.

## Step 3: Phase Mapping

Assign selected skills to phases following the canonical phase order. Every loop uses a subset of the 10 standard phases.

### Canonical Phase Order

```
INIT → SCAFFOLD → IMPLEMENT → TEST → VERIFY → VALIDATE → DOCUMENT → REVIEW → SHIP → COMPLETE
```

Plus `META` for meta-skills that operate outside the standard flow.

### Phase Mapping Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **Order preservation** | Phases must appear in canonical order | Hard -- loop.json is rejected otherwise |
| **INIT required** | Every loop must start with an INIT phase | Hard -- no valid loop without initialization |
| **COMPLETE required** | Every loop must end with COMPLETE | Hard -- loop-controller must finalize |
| **No empty phases** | Every listed phase must have at least one skill | Hard -- empty phases are invalid |
| **Multi-skill phases** | A phase can have multiple skills (executed in order) | Allowed -- e.g., SCAFFOLD: [architect, scaffold] |
| **Phase skipping** | Phases can be omitted entirely | Allowed -- e.g., skip VALIDATE for lightweight loops |
| **Required flag** | Each phase has a `required` boolean | Soft -- optional phases can be skipped at runtime |

### Phase Assignment Table

Use this template to assign skills to phases:

```markdown
| Phase | Skills (ordered) | Required | Rationale |
|-------|-----------------|----------|-----------|
| INIT | [skill-a] | true | [why] |
| SCAFFOLD | [skill-b, skill-c] | true | [why] |
| IMPLEMENT | [skill-d] | true | [why] |
| ... | ... | ... | ... |
| COMPLETE | [loop-controller] | true | Always required |
```

### Phase Required vs Optional Decision

| Mark Required When | Mark Optional When |
|--------------------|--------------------|
| Loop cannot succeed without this phase | Phase adds value but is not essential |
| Downstream phases depend on its output | Stakeholder may choose to skip |
| Phase contains critical quality gate | Phase is domain-specific, not universal |
| Phase is INIT or COMPLETE | Phase is DOCUMENT, SHIP, or VALIDATE |

See `references/phase-sequencing.md` for detailed ordering rules and valid transitions.

## Step 4: Gate Placement

Gates are human-in-the-loop checkpoints between phases. They pause execution until a human approves, providing oversight at critical decision boundaries.

### Gate Placement Rules

| Rule | Description |
|------|-------------|
| **After, not before** | Gates are placed `afterPhase`, blocking the next phase |
| **Decision boundaries** | Place gates where a wrong decision is expensive to reverse |
| **Deliverable-backed** | Every gate should reference deliverables the human reviews |
| **Diminishing returns** | More gates slow execution -- place only where review adds value |
| **Required matches phase** | If the phase is optional, the gate should be optional too |

### Gate Types

| Type | `approvalType` | When to Use |
|------|----------------|-------------|
| **Human** | `"human"` | Critical decisions: architecture, spec, final review |
| **Conditional** | `"conditional"` | Only needed if a condition is met (e.g., deploy only if SHIP phase runs) |
| **Automated** | `"automated"` | Programmatic checks: tests pass, linting clean, coverage threshold |

### Standard Gate Patterns

| Gate | After Phase | Type | Deliverables | When to Include |
|------|-------------|------|-------------|-----------------|
| Spec Gate | INIT | human | FEATURESPEC.md | Always for engineering loops |
| Architecture Gate | SCAFFOLD | human | ARCHITECTURE.md | When architecture decisions are made |
| Test Gate | TEST | automated | test-results.json | When automated test validation is needed |
| Verification Gate | VERIFY | automated | verification-report.md | When structural checks must pass |
| Review Gate | REVIEW | human | CODE-REVIEW.md | Always for production-bound code |
| Deploy Gate | SHIP | conditional | -- | Only when deployment is included |
| Context Gate | INIT | human | CONTEXT-SOURCES.md | For research/proposal loops |
| Final Gate | COMPLETE | human | [final deliverable] | When final human sign-off is needed |

### Gate Template

```json
{
  "id": "[phase]-gate",
  "name": "[Human-Readable Gate Name]",
  "afterPhase": "[PHASE]",
  "required": true,
  "approvalType": "human",
  "deliverables": ["DELIVERABLE.md"]
}
```

### Autonomy Level Affects Gates

| Autonomy | Gate Behavior |
|----------|---------------|
| **supervised** | All gates are human-approved |
| **semi-autonomous** | Critical gates human, others automated |
| **autonomous** | All gates automated, human notified post-facto |

See `references/gate-design.md` for detailed gate design guidance.

## Step 5: Dependency Validation

Before finalizing the loop, validate that all skill dependencies are satisfied within the composed phase sequence.

### Dependency Rules

| Rule | Description | Action on Violation |
|------|-------------|---------------------|
| **Forward dependency** | A skill's dependencies must appear in earlier or same phases | Add missing skill to an earlier phase |
| **No circular deps** | Skill A depends on B, B must not depend on A (transitively) | Reject -- restructure skill selection |
| **Cross-phase deps** | Dependencies can span phases | Valid as long as ordering is preserved |
| **Registry existence** | Every skill ID must exist in the registry | Reject -- cannot compose with missing skills |

### Validation Algorithm

```
For each phase P in order:
  For each skill S in P.skills:
    For each dependency D of S:
      Assert D appears in phase P or an earlier phase
      Assert no circular path from D back to S

If any assertion fails:
  Report missing dependency and suggest fix
```

### Dependency Resolution Checklist

```markdown
- [ ] All skill IDs exist in the registry
- [ ] All skill dependencies are satisfied by earlier phases
- [ ] No circular dependency chains detected
- [ ] No duplicate skills across phases (unless intentional)
- [ ] Meta skills (loop-controller) are in COMPLETE phase
- [ ] Required infrastructure skills are included if needed
```

### Common Dependency Issues

| Issue | Symptom | Resolution |
|-------|---------|------------|
| Missing prerequisite | Skill X needs Y, Y not in loop | Add Y to an earlier phase |
| Wrong phase order | Dependency in later phase | Move dependency skill to earlier phase |
| Circular chain | A needs B, B needs A | Remove one, or restructure into separate loops |
| Orphan skill | Skill has no consumers | Remove if not needed, or note as intentionally terminal |

## Step 6: Configuration

Configure the non-structural aspects of the loop: defaults, UI settings, skill display, and metadata.

### Defaults Configuration

```json
{
  "defaults": {
    "mode": "greenfield | brownfield",
    "autonomy": "supervised | semi-autonomous | autonomous"
  }
}
```

| Field | Options | Guidance |
|-------|---------|----------|
| `mode` | `greenfield`, `brownfield` | Greenfield for new projects, brownfield for existing codebases |
| `autonomy` | `supervised`, `semi-autonomous`, `autonomous` | Start with supervised, relax as trust builds |

### UI Configuration

```json
{
  "ui": {
    "theme": "[domain-name]",
    "layout": "chat-focused | dashboard",
    "features": {
      "skillBrowser": true,
      "deliverableViewer": true,
      "gateApprovalUI": true,
      "progressTimeline": true,
      "metricsPanel": false
    },
    "branding": {
      "title": "[Loop Display Title]",
      "subtitle": "[One-line description]"
    }
  }
}
```

| Feature | Enable When |
|---------|-------------|
| `skillBrowser` | Loop has many skills, users may want to explore |
| `deliverableViewer` | Loop produces markdown deliverables for review |
| `gateApprovalUI` | Loop has human gates requiring approval interface |
| `progressTimeline` | Loop has 5+ phases, visual progress is helpful |
| `metricsPanel` | Loop collects performance/quality metrics |

### Skill UI Configuration

For each skill in the loop, define how it appears in the UI:

```json
{
  "skillUI": {
    "[skill-id]": {
      "displayName": "[Human-Readable Name]",
      "icon": "[icon-name]",
      "outputDisplay": "markdown | code | diff | table"
    }
  }
}
```

| `outputDisplay` | Use For |
|-----------------|---------|
| `markdown` | Documentation, specs, reviews, proposals |
| `code` | Test generation, scaffolding output |
| `diff` | Implementation changes, refactoring |
| `table` | Matrix output, comparison data |

### Metadata Configuration

```json
{
  "metadata": {
    "author": "Orchestrator",
    "tags": ["domain-tag", "scope-tag", "purpose-tag"]
  }
}
```

Tags should include:
- **Domain tag**: engineering, proposal, security, content, analysis
- **Scope tag**: full-loop, lightweight, focused, custom
- **Purpose tag**: production, prototype, audit, research

## Step 7: Composition

Assemble all components into the final loop.json structure.

### Assembly Order

1. Set top-level identifiers: `id`, `name`, `version`, `description`
2. Build `phases` array from Step 3 mapping
3. Build `gates` array from Step 4 placement
4. Set `defaults` from Step 6
5. Set `ui` configuration from Step 6
6. Set `skillUI` entries for each skill from Step 6
7. Set `metadata` from Step 6

### Loop ID Convention

```
[domain]-loop          # Primary domain loop: engineering-loop, proposal-loop
[domain]-[variant]     # Variant loop: engineering-lite, proposal-quick
custom-loop-[timestamp] # Auto-generated: custom-loop-1706000000000
```

### Schema Validation Checklist

```markdown
- [ ] `id` is kebab-case, unique across all loops
- [ ] `name` is human-readable title case
- [ ] `version` follows semver (major.minor.patch)
- [ ] `description` is one sentence summarizing the loop
- [ ] `phases` is non-empty array in canonical order
- [ ] Each phase has `name`, `skills` (non-empty), `required` (boolean)
- [ ] `gates` reference valid phase names via `afterPhase`
- [ ] Each gate has `id`, `name`, `afterPhase`, `required`, `approvalType`
- [ ] `defaults.mode` is valid mode string
- [ ] `defaults.autonomy` is valid autonomy level
- [ ] `ui` has `theme`, `layout`, `features`, `branding`
- [ ] `skillUI` has entry for each unique skill in the loop
- [ ] `metadata` has `author` and `tags`
```

### Composition Template

```json
{
  "id": "[domain]-loop",
  "name": "[Domain] Loop",
  "version": "1.0.0",
  "description": "[One sentence describing what this loop does]",

  "phases": [
    { "name": "INIT", "skills": ["[skill]"], "required": true },
    { "name": "[PHASE]", "skills": ["[skill]"], "required": true },
    { "name": "COMPLETE", "skills": ["loop-controller"], "required": true }
  ],

  "gates": [
    {
      "id": "[phase]-gate",
      "name": "[Gate Name]",
      "afterPhase": "[PHASE]",
      "required": true,
      "approvalType": "human",
      "deliverables": ["[DELIVERABLE.md]"]
    }
  ],

  "defaults": {
    "mode": "greenfield",
    "autonomy": "supervised"
  },

  "ui": {
    "theme": "[domain]",
    "layout": "chat-focused",
    "features": {
      "skillBrowser": true,
      "deliverableViewer": true,
      "gateApprovalUI": true,
      "progressTimeline": true,
      "metricsPanel": false
    },
    "branding": {
      "title": "[Loop Title]",
      "subtitle": "[Subtitle]"
    }
  },

  "skillUI": {
    "[skill-id]": {
      "displayName": "[Display Name]",
      "icon": "[icon]",
      "outputDisplay": "markdown"
    }
  },

  "metadata": {
    "author": "Orchestrator",
    "tags": ["[tag1]", "[tag2]", "[tag3]"]
  }
}
```

See `references/loop-schema.md` for the complete field reference.

## Step 8: Testing

Validate the composed loop before saving it. A broken loop.json will cause runtime failures in loop-controller.

### Validation Levels

| Level | What It Checks | When to Run |
|-------|---------------|-------------|
| **Schema** | JSON structure, required fields, types | Always |
| **Referential** | Skills exist, phases valid, gates reference valid phases | Always |
| **Dependency** | Skill dependencies satisfied across phases | Always |
| **Semantic** | Reasonable phase ordering, sensible gate placement | On review |
| **Dry-run** | Simulate loop execution without side effects | Before deployment |

### Schema Validation

```markdown
- [ ] Valid JSON (parseable)
- [ ] All required top-level fields present
- [ ] `phases` array has valid entries
- [ ] `gates` array has valid entries (or is empty)
- [ ] `defaults` has valid mode and autonomy
- [ ] No unknown fields at top level
```

### Referential Validation

```markdown
- [ ] Every skill ID in phases exists in the skill registry
- [ ] Every `afterPhase` in gates matches a phase name in the phases array
- [ ] No duplicate phase names
- [ ] No duplicate gate IDs
- [ ] Phase names are from the valid set (INIT, SCAFFOLD, ..., COMPLETE, META)
```

### Dependency Validation

```markdown
- [ ] Every skill's `depends_on` skills appear in the same or earlier phase
- [ ] No circular dependency chains
- [ ] No skill appears in multiple phases (unless intentional and documented)
```

### Semantic Validation

```markdown
- [ ] INIT is the first phase
- [ ] COMPLETE is the last phase
- [ ] Required phases have at least one required gate after them (for supervised loops)
- [ ] Optional phases do not have required gates
- [ ] Gate deliverables match expected skill outputs
- [ ] Autonomy level is consistent with gate types
```

### Dry-Run Procedure

1. Load the loop.json into LoopComposer
2. Call `validateLoop(config)` to check errors and warnings
3. Walk the phase sequence, verifying each skill can be loaded
4. Confirm gate deliverables are producible by preceding skills
5. Report any issues before saving

### Testing Checklist

```markdown
- [ ] Schema validation passes
- [ ] Referential validation passes
- [ ] Dependency validation passes
- [ ] Semantic validation passes (or warnings documented)
- [ ] Dry-run completes without errors
- [ ] loop.json saved to loops/[loop-id]/loop.json
- [ ] LOOP.md saved to loops/[loop-id]/LOOP.md
- [ ] COMPOSITION-NOTES.md saved (if non-obvious decisions were made)
```

## Output Formats

### Quick Composition (Lightweight Loop)

```markdown
## Loop: [Domain] Loop

### Summary
[One paragraph describing the loop]

### Phases
| # | Phase | Skills | Required |
|---|-------|--------|----------|
| 1 | INIT | [skill] | Yes |
| 2 | IMPLEMENT | [skill] | Yes |
| 3 | COMPLETE | loop-controller | Yes |

### Gates
| Gate | After | Type |
|------|-------|------|
| [gate-name] | [phase] | human |

### Files Generated
- `loops/[id]/loop.json`
- `loops/[id]/LOOP.md`
```

### Full Composition (Production Loop)

```markdown
## Loop: [Domain] Loop

### Summary
[Detailed paragraph describing the loop, its domain, and intended use]

### Requirements Captured
- Domain: [domain]
- Outcome: [outcome]
- Quality: [level]
- Autonomy: [level]

### Skill Selection
| Phase | Skill | Reason Selected | Dependencies |
|-------|-------|-----------------|--------------|
| INIT | [skill] | [reason] | [deps] |
| ... | ... | ... | ... |

### Phase Sequence
| # | Phase | Skills | Required | Rationale |
|---|-------|--------|----------|-----------|
| 1 | INIT | [skills] | Yes | [why] |
| ... | ... | ... | ... | ... |

### Gate Configuration
| Gate ID | Name | After | Type | Required | Deliverables |
|---------|------|-------|------|----------|--------------|
| [id] | [name] | [phase] | [type] | [bool] | [files] |

### Configuration
- Mode: [greenfield/brownfield]
- Autonomy: [level]
- Theme: [theme]
- Layout: [layout]

### Validation Results
- Schema: PASS
- Referential: PASS
- Dependency: PASS
- Semantic: PASS (N warnings)

### Files Generated
- `loops/[id]/loop.json`
- `loops/[id]/LOOP.md`
- `loops/[id]/COMPOSITION-NOTES.md`
```

## Common Patterns

### Engineering Loop Pattern
Full software development lifecycle with all quality gates. 9 phases, 4 gates, supervised autonomy.
**Use when:** Building production software with full rigor and human oversight at every decision boundary.

### Proposal Loop Pattern
Research-to-document pipeline with context gathering and synthesis. 4 phases, 4 gates, supervised autonomy.
**Use when:** Creating proposals, reports, or analysis documents from raw context and requirements.

### Lightweight Loop Pattern
Minimal viable loop with only INIT, IMPLEMENT, and COMPLETE. 3 phases, 1 gate, semi-autonomous.
**Use when:** Quick prototyping, small features, or tasks where full rigor is overhead.

### Infrastructure Loop Pattern
Setup-focused loop with infrastructure skills: scaffold, database, docker, services. 5 phases, 2 gates.
**Use when:** Standing up new project infrastructure, configuring environments, or setting up deployment pipelines.

See `references/composition-patterns.md` for complete examples of each pattern.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `loop-controller` | Composer produces loop.json that controller executes at runtime |
| `skill-design` | Dependency -- composer needs skills to exist before composing them into loops |
| `architect` | Analogous -- architect designs system structure, composer designs loop structure |
| `scaffold` | Analogous -- scaffold generates project files, composer generates loop files |
| `orchestrator` | Orchestrator selects which loop to run; composer designs the loops it selects from |
| `skill-verifier` | Verifier can validate that composed loops reference skills correctly |
| `retrospective` | Retrospective output may suggest loop composition changes |
| `spec` | Spec defines what to build; composer defines how the build process flows |

## Key Principles

**Compose, don't create.** Loops are compositions of existing skills. If a skill doesn't exist, use `skill-design` to create it first, then compose.

**Canonical order is law.** Phases must follow INIT through COMPLETE ordering. There are no exceptions. Skipping phases is fine; reordering them is not.

**Gates at decision boundaries.** Place gates where the cost of a wrong decision multiplied by the probability of error is highest. Not after every phase -- after consequential ones.

**Dependencies flow forward.** A skill in phase N can depend on skills in phases 1 through N, never on phases N+1 and beyond. This is the fundamental constraint of sequential composition.

**Start supervised, relax later.** New loops should default to supervised autonomy with human gates. As the loop proves reliable, gates can be changed to conditional or automated.

**Every loop needs a controller.** The COMPLETE phase with loop-controller is non-negotiable. It handles finalization, metrics, and state cleanup that every loop requires.

## References

- `references/loop-schema.md`: Complete loop.json schema with all fields documented
- `references/phase-sequencing.md`: Phase ordering rules, valid transitions, required vs optional
- `references/gate-design.md`: Gate types, placement rules, autonomy interaction
- `references/skill-selection.md`: Querying the registry, coverage analysis, dependency resolution
- `references/composition-patterns.md`: Concrete examples -- engineering, proposal, lightweight, custom
