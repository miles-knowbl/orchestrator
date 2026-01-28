---
name: loop-to-slash-command
description: "Generate Claude Code slash command .md files from loop definitions. Transforms loop.json into executable CLI commands with state management, gate procedures, and skill integration instructions."
phase: SHIP
category: meta
version: "1.0.0"
depends_on: [loop-composer]
tags: [meta, loops, cli, commands, generation]
---

# Loop to Slash Command

Generate Claude Code slash command `.md` files from loop definitions.

## When to Use

- **A new loop has been composed** --- The loop-composer has produced a `loop.json` and now needs a user-facing CLI entry point
- **An existing loop's phases or gates changed** --- The loop definition evolved and the slash command must be regenerated to match
- **Porting a loop to a new environment** --- The loop exists but lacks a Claude Code slash command for invocation
- **Standardizing command format across loops** --- Multiple loops exist with inconsistent command files and you need uniform structure
- **Auditing command-to-loop alignment** --- Verifying that an existing slash command accurately reflects its loop.json source of truth
- When you say: "generate the slash command", "create the loop command", "make this loop executable", "update the command file", "turn this loop into a CLI command"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `command-template.md` | The canonical slash command template with all standard sections and formatting rules |
| `naming-conventions.md` | Naming rules for commands, flags, state files, and deliverables --- deviations break discoverability |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `state-schema.md` | When generating state file schemas for loops with complex gate or phase structures |
| `gate-prompts.md` | When customizing gate approval prompts beyond the default templates |
| `existing-commands.md` | When checking precedent --- how existing commands handle edge cases like resume, skip, brownfield modes |

**Verification:** The generated `.md` file must pass structural validation: all standard sections present, state schema matches loop.json phases and gates, every phase has skill invocation instructions, and every gate has an approval prompt template.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `{loop-id}.md` | `~/.claude/commands/` | Always --- the primary slash command file |
| `{name}-state.json` schema | Documented within the command `.md` | Always --- the state file structure for the generated loop |
| Generation report | Stdout / conversation | Always --- summary of phases mapped, gates configured, skills integrated |

## Core Concept

Loop to Slash Command answers: **"How do we transform a loop.json definition into an executable Claude Code slash command?"**

Loop to Slash Command is:
- **A code generator for CLI entry points** --- Takes structured loop data and produces a human-readable, machine-parseable markdown command file
- **Template-driven** --- Every generated command follows the same section structure, ensuring consistency across all loops
- **Bidirectionally faithful** --- The generated command is a precise reflection of the loop.json; no phases invented, no gates omitted
- **State-management-aware** --- Generates state file schemas, cold-start detection, and resume flow for every command
- **Gate-integration-complete** --- Every gate gets an approval prompt template, deliverable checklist, and skip-with-reason logic

Loop to Slash Command is NOT:
- Loop composition (that is `loop-composer` --- designing which phases, skills, and gates a loop should have)
- Skill authoring (that is `skill-design` --- creating the SKILL.md files that phases reference)
- Deployment automation (that is `deploy` --- shipping artifacts to production)
- Command execution (the generated command itself runs; this skill generates, not executes)
- Hook configuration (hooks are configured separately in `~/.claude/hooks.json`)
- State file runtime management (that is `loop-controller` --- managing state during execution)

## The Loop to Slash Command Process

```
+-----------------------------------------------------------------------+
|                  LOOP TO SLASH COMMAND PROCESS                          |
|                                                                        |
|  1. LOOP ANALYSIS                                                      |
|     +---> Read loop.json, extract phases/skills/gates/defaults/UI      |
|                                                                        |
|  2. COMMAND NAMING                                                     |
|     +---> Derive command name, state file name, flag set               |
|                                                                        |
|  3. SECTION GENERATION                                                 |
|     +---> Generate all standard sections from extracted data           |
|                                                                        |
|  4. SKILL INTEGRATION                                                  |
|     +---> Per-phase skill load/execute/verify instructions             |
|                                                                        |
|  5. GATE INTEGRATION                                                   |
|     +---> Approval prompts, deliverable checklists, skip logic         |
|                                                                        |
|  6. STATE MANAGEMENT                                                   |
|     +---> State file schema, cold start, resume, phase tracking        |
|                                                                        |
|  7. OUTPUT AND PLACEMENT                                               |
|     +---> Write to ~/.claude/commands/, validate, report               |
|                                                                        |
+-----------------------------------------------------------------------+
```

## Step 1: Loop Analysis

Read the source `loop.json` and extract all structural elements. This step produces a normalized data model that all subsequent steps consume.

### Required Extractions

| Element | Source Path | Used In |
|---------|------------|---------|
| Loop ID | `$.id` | Command naming, state file naming |
| Loop name | `$.name` | Title section, branding text |
| Loop description | `$.description` | Purpose section, tagline |
| Phases array | `$.phases[*]` | Execution flow, per-phase sections |
| Phase skills | `$.phases[*].skills` | Skill integration (Step 4) |
| Phase required flag | `$.phases[*].required` | Skip logic |
| Gates array | `$.gates[*]` | Gate integration (Step 5) |
| Gate afterPhase | `$.gates[*].afterPhase` | Execution flow ordering |
| Gate approvalType | `$.gates[*].approvalType` | Prompt type selection |
| Gate deliverables | `$.gates[*].deliverables` | Deliverable checklists |
| Defaults | `$.defaults` | Mode and autonomy defaults |
| UI branding | `$.ui.branding` | Title and subtitle in prompts |

### Phase-Gate Mapping

Build the relationship table that drives execution flow:

```markdown
| Phase | Skills | Gate After | Gate Name | Gate Required |
|-------|--------|------------|-----------|---------------|
| INIT  | [spec] | spec-gate  | Specification Approval | true |
| SCAFFOLD | [architect, scaffold] | architecture-gate | Architecture Approval | true |
| IMPLEMENT | [implement] | (none) | --- | --- |
```

Phases with no gate after them flow directly to the next phase.

### Analysis Checklist

```markdown
- [ ] loop.json read and parsed successfully
- [ ] All phases extracted with skills and required flags
- [ ] All gates extracted with afterPhase, approvalType, deliverables
- [ ] Phase-gate mapping validated (every gate.afterPhase references a valid phase)
- [ ] Defaults and UI branding extracted
```

## Step 2: Command Naming

Derive all names from the loop ID using consistent conventions. Naming is mechanical, not creative --- deviations break discoverability. See `references/naming-conventions.md` for full rules.

### Naming Rules

| Element | Convention | Example |
|---------|-----------|---------|
| **Command name** | Loop ID directly (e.g., `engineering-loop`) | `proposal-loop` |
| **Command file** | `{loop-id}.md` | `proposal-loop.md` |
| **State file** | `{domain}-state.json` | `proposal-state.json` |
| **H1 title** | `/{loop-id} Command` | `/proposal-loop Command` |

### Flag Derivation

| Flag | Source | Always Present |
|------|--------|---------------|
| `--resume` | Any loop with state file | Yes |
| `--phase=PHASE` | `$.phases[*].name` enum | Yes |
| `--mode=MODE` | `$.defaults.mode` | Only if loop has mode detection |
| `--skip-gate=GATE` | `$.gates[*].id` enum | Only if any gate has `required: false` |

## Step 3: Section Generation

Generate the complete `.md` file with all standard sections. See `references/command-template.md` for the canonical template.

### Standard Section Map

| # | Section | Content Source | Required |
|---|---------|---------------|----------|
| 1 | H1 Title + tagline | Loop name, description | Yes |
| 2 | Purpose | Loop description, phase/gate counts | Yes |
| 3 | Usage | Command name, derived flags | Yes |
| 4 | Execution Flow | Phases, gates, state management | Yes |
| 5 | Gate Enforcement | Gate prompts, deliverable checks | Yes |
| 6 | Commands During Execution | Standard command table | Yes |
| 7 | State Files | State schema, deliverable files | Yes |
| 8 | Example Session | Realistic walkthrough | Yes |
| 9 | Resuming a Session | Resume flow example | Yes |
| 10 | Skill Invocation Sequence | Skill-to-reference mapping | Yes |
| 11 | Hook Integration | Applicable hooks | If hooks exist |
| 12 | References | MCP skill fetch instructions | Yes |

### Tagline Derivation

Take `$.description`, extract the core action, rephrase in imperative voice under 20 words:

| Loop Description | Generated Tagline |
|-----------------|-------------------|
| "Complete engineering loop for building production-quality software..." | "Full engineering loop with phases, gates, and systems." |
| "Create compelling proposals by ingesting context..." | "Orchestrate the full proposal creation loop with enforced gates." |

### Section Templates

**Purpose:**
```markdown
## Purpose
This command is the **single entry point** for the {loop name}. It handles everything:
{key capabilities derived from phases}.

**The flow you want:** {one-sentence user journey}.
```

**Usage:**
```markdown
## Usage
/{command-name} [--resume] [--phase=PHASE] {additional flags}
```

**Commands table (always include these standard commands):**

| Command | Action |
|---------|--------|
| `go` | Continue execution / proceed to next phase |
| `status` | Show current phase, gate status, progress |
| `approved` | Pass current gate |
| `changes: [feedback]` | Request changes at gate |
| `pause` | Stop after current phase |
| `show [deliverable]` | Display a deliverable |

## Step 4: Skill Integration

For each phase, generate instructions for loading and executing skills. Without these, Claude Code cannot execute the phase.

### Per-Phase Skill Block

```markdown
### Phase: {PHASE_NAME}
**Skills:** {skill list}  |  **Required:** {true/false}

1. Load skill: `mcp__skills-library__get_skill(name: "{skill}", includeReferences: true)`
2. Read required references from SKILL.md Reference Requirements table
3. Execute skill following SKILL.md process steps
4. Verify deliverables:
   - [ ] {deliverable 1} exists and has content
   - [ ] {deliverable 2} exists and has content
5. Update state: phases.{PHASE}.status = "complete"
```

### Skill Invocation Sequence

Generate the full skill tree for the Skill Invocation Sequence section:

```
1. {skill-name}
   +-- Read: {reference-1}.md
   +-- Read: {reference-2}.md
   +-- Output: {DELIVERABLE-1}.md, {DELIVERABLE-2}.md

2. {skill-name}
   +-- Read: {reference-1}.md
   +-- Output: {DELIVERABLE}.md
```

### Multi-Skill Phase Handling

| Scenario | Handling |
|----------|---------|
| Phase has 1 skill | Direct execution |
| Phase has 2+ skills | Sequential execution in array order |
| Skills share deliverables | Later skill can read earlier skill's output |
| Skill fails | Phase marked as failed, gate not reached |

## Step 5: Gate Integration

For each gate, generate approval prompt templates, deliverable checklists, and skip logic. See `references/gate-prompts.md` for full templates.

### Gate Prompt Template

```
====================================================================
|  {GATE NAME}                                                      |
|                                                                   |
|  {Deliverable} is ready for review.                               |
|                                                                   |
|  Deliverables:                                                    |
|    {check} {deliverable-1} ({status})                             |
|    {check} {deliverable-2} ({status})                             |
|                                                                   |
|  Commands:                                                        |
|    approved     --- Pass gate, continue to {next phase}           |
|    changes: ... --- Request modifications                         |
|    show {item}  --- Display deliverable                           |
====================================================================
```

### Gate Type Handling

| Approval Type | Behavior | Prompt Style |
|--------------|----------|-------------|
| `human` | Blocks until user says `approved` | Full prompt with commands |
| `conditional` | Blocks only if condition met | Conditional prompt with auto-pass |
| `auto` | Passes automatically after deliverable check | Notification only |

### Skip Logic

```
skip-gate {gate-id} --reason "{justification}"

Rules:
- Required gates: emit warning before allowing skip
- Reason is logged in state file (gates.{id}.skippedReason)
- Skipped gates marked as "skipped" not "passed"
- --reason flag is mandatory (>10 characters)
```

## Step 6: State Management

Generate the state file schema that tracks loop execution. See `references/state-schema.md` for full field definitions.

### State File Schema

```json
{
  "loop": "{loop-id}",
  "version": "{loop-version}",
  "mode": "{default-mode}",
  "phase": "{current-phase}",
  "status": "active",
  "gates": {
    "{gate-id}": {
      "status": "pending",
      "required": true,
      "approvalType": "human",
      "deliverables": ["{FILE}.md"],
      "passedAt": null,
      "skippedReason": null
    }
  },
  "phases": {
    "{PHASE_NAME}": {
      "status": "pending",
      "required": true,
      "skills": ["{skill-names}"],
      "deliverables": [],
      "startedAt": null,
      "completedAt": null
    }
  },
  "metrics": {},
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Cold Start Detection

```
if {state-file} exists:
  -> Read state, show current phase and progress
  -> Show gate status summary
  -> Ask: "Resume from {current-phase}? [Y/n]"
else:
  -> Fresh start, initialize state with all phases pending
  -> Set first phase to "active"
  -> Proceed to first phase
```

### Generation Rules

| Rule | Implementation |
|------|---------------|
| One phase entry per `$.phases[*]` | Iterate phases array, create entry for each |
| One gate entry per `$.gates[*]` | Iterate gates array, create entry for each |
| Phase skills from `$.phases[*].skills` | Copy skill array into phase entry |
| Gate deliverables from `$.gates[*].deliverables` | Copy into gate entry |
| Timestamps | ISO 8601; started_at on creation, last_updated on mutation |

## Step 7: Output and Placement

Write the generated command file, validate structure, and report results.

### Output Location

| Destination | Path | When |
|-------------|------|------|
| **Primary** | `~/.claude/commands/{command-name}.md` | Always |
| **Project override** | `{project}/.claude/commands/{command-name}.md` | When project-specific version needed |

### Structural Validation

```markdown
**Section presence:**
- [ ] H1 title with /{name} Command format
- [ ] Purpose, Usage, Execution Flow sections present
- [ ] Gate Enforcement with prompt templates
- [ ] Commands table, State Files table
- [ ] Example Session and Resume Session
- [ ] Skill Invocation Sequence and References

**Data integrity:**
- [ ] Phase count matches loop.json
- [ ] Gate count matches loop.json
- [ ] All skill names exist in skills library
- [ ] State schema phases/gates match loop.json exactly
- [ ] Flag enum values match loop.json phase names

**Formatting:**
- [ ] Code blocks use triple backticks
- [ ] Tables have header rows
- [ ] ASCII diagrams render in monospace
- [ ] No placeholder text (TODO, TBD)
- [ ] Line count 300-500 (target: 400)
```

### Generation Report

```markdown
**Source:** {loop.json path}
**Output:** ~/.claude/commands/{command-name}.md

Mapped: {phase-count} phases, {gate-count} gates, {skill-count} skills
State file: {state-file-name}
Validation: {PASS / FAIL}
```

## Output Formats

### Quick Format

For simple loops (4 or fewer phases, no complex modes). ~150-200 lines. Includes: title, purpose, usage, execution flow with phase diagram, gate table, commands table, state files, and references.

```markdown
# /{command-name} Command
{Tagline}

## Purpose | ## Usage | ## Execution Flow | ## Commands | ## State Files | ## References
```

### Full Format

For complex loops (5+ phases, multiple modes, conditional gates). ~350-500 lines. Adds: mode-specific behavior, codebase analysis steps, detailed example session, resume example, hook integration, and loop update protocol.

```markdown
# /{command-name} Command
{Tagline}

## Purpose | ## Usage | ## Execution Flow (with mode detection, scope discovery)
## Mode-Specific Behavior | ## Commands | ## State Files
## Example Session | ## Resuming a Session | ## Skill Invocation Sequence
## Hook Integration | ## References | ## Loop Update Protocol
```

## Common Patterns

### Simple Linear Loop

Sequential phases, no mode detection, all-human gates. The proposal-loop command is the canonical example.

**Use when:** Loop has 3-6 phases, all gates are human-approval, single mode. Generate using Quick Format.

### Multi-Mode Engineering Loop

Mode detection, conditional phases, mixed gate types, extensive skill trees. The engineering-loop command is the canonical example.

**Use when:** Loop has 7+ phases, mode detection, conditional gates/phases. Generate using Full Format.

### Regeneration After Loop Change

Loop.json modified and existing command must be updated. Diff old/new loop.json, regenerate changed sections, preserve manual customizations.

**Use when:** Existing command file needs updating. Read existing command first, identify manual additions, regenerate standard sections, re-insert customizations.

### First-Time Loop Bootstrap

Brand-new loop needs everything: command file, state schema, documentation. Full 7-step process with no prior command to reference.

**Use when:** `loop-composer` just produced a new loop.json and no corresponding command exists. Generate Full Format with detailed example session.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `loop-composer` | Upstream: produces the loop.json that this skill consumes; must run first |
| `skill-design` | Parallel: designs SKILL.md files that generated commands reference |
| `loop-controller` | Downstream: manages runtime state that generated commands initialize |
| `deploy` | Adjacent in SHIP phase: deploy ships artifacts, this skill generates commands |
| `scaffold` | Analogous: scaffold creates project structure, this creates command structure |
| `document` | Shared standards: generated commands are documentation artifacts |
| `code-review` | Validates: reviews command files for completeness against loop.json |
| `spec` | Upstream context: feature specs inform loop design which informs commands |

## Key Principles

**The loop.json is the single source of truth.** Every element in the generated command must trace back to loop.json. If it is not in the definition, it does not appear. If it is in the definition, it must appear. No exceptions.

**Naming is mechanical, not creative.** Command names, state files, and flag enums are derived algorithmically. Consistent naming enables discoverability across all loops.

**Every gate gets a prompt.** No gate passes silently. Human gates get full approval prompts. Conditional gates explain their condition. Auto gates notify. Visibility is non-negotiable.

**State schemas are generated, not handcrafted.** The state file structure is a direct projection of the loop.json. Handcrafted schemas drift. Generated schemas stay synchronized.

**Commands are documentation.** A slash command `.md` file is simultaneously an instruction set for Claude Code and documentation for the user. It must be readable by both.

**Regeneration must be safe.** When updating after loop changes, detect and preserve manual customizations. Blindly overwriting destroys user work.

## References

- `references/command-template.md`: The canonical slash command template with all standard sections, formatting rules, and section-by-section authoring guidance
- `references/naming-conventions.md`: Naming rules for commands, flags, state files, and deliverables with derivation algorithms and conflict resolution
- `references/state-schema.md`: State file structure for loop execution: phase tracking, gate statuses, deliverable paths, timestamps, and resume logic
- `references/gate-prompts.md`: Templates for gate approval prompts, deliverable checklists, skip-with-reason logic, and gate type handling
- `references/existing-commands.md`: Analysis of engineering-loop.md and proposal-loop.md as reference implementations with extracted patterns
