# Existing Commands

Analysis of the two existing slash commands --- `engineering-harness.md` and `proposal-harness.md` --- as reference implementations. These are the canonical examples of what loop-to-slash-command generates.

## Command Inventory

| Command | Loop Source | Phases | Gates | Lines | State File |
|---------|-----------|--------|-------|-------|------------|
| `engineering-harness` | `engineering-loop` | 9 (INIT through COMPLETE) | 4 (spec, architecture, review, deploy) | ~489 | `loop-state.json` |
| `proposal-harness` | `proposal-loop` | 4 (INIT through COMPLETE) | 4 (references, synthesis, alignment, final) | ~432 | `proposal-state.json` |

## Structural Comparison

### Section Presence

| Section | engineering-harness | proposal-harness | Standard |
|---------|----------------|-----------------|----------|
| H1 Title + tagline | Yes | Yes | Required |
| Purpose | Yes | Yes | Required |
| Usage | Yes | Yes | Required |
| Execution Flow | Yes (9 steps) | Yes (7 steps) | Required |
| Gate Enforcement | Yes (table + prompts) | Yes (table + prompts) | Required |
| Commands Table | Yes (12 commands) | Yes (10 commands) | Required |
| State Files | Yes (8 files) | Yes (9 files) | Required |
| Example Session | Yes (full walkthrough) | Yes (full walkthrough) | Required |
| Resuming a Session | Yes | Yes | Required |
| Skill Invocation | Implicit in flow | Yes (explicit tree) | Required |
| Hook Integration | No (in CLAUDE.md) | Yes (3 hooks) | Optional |
| References | Yes (MCP + table) | Yes (MCP calls) | Required |
| Update Protocol | Yes | No | Optional |
| Mode-Specific Behavior | Yes (3 modes) | No | If applicable |
| Brownfield Adaptations | Yes | No | If applicable |

### Key Differences

| Aspect | engineering-harness | proposal-harness |
|--------|----------------|-----------------|
| **Modes** | 3 (greenfield, brownfield-polish, brownfield-enterprise) | 1 (proposal) |
| **Mode detection** | Yes (directory analysis) | No |
| **Scope discovery** | Yes (gap analysis) | No |
| **Codebase analysis** | Yes | No |
| **Phase diagram style** | Multi-row ASCII with skill lists | Single-row ASCII with deliverables |
| **Gate prompts** | Box-drawing characters | Box-drawing characters |
| **Completion display** | Standard summary | Large ASCII art banner |
| **Hook documentation** | Deferred to CLAUDE.md | Inline (3 hooks) |
| **Skill references** | MCP table with 8 references | MCP call list for 4 skills |

## Extracted Patterns

### Pattern 1: Cold Start Detection

Both commands use identical cold start logic:

```
if {state-file} exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, proceed to initialization
```

**Rule:** Always generate cold start detection as Step 1 of Execution Flow.

### Pattern 2: Gate Prompt Format

Both commands use the same box-drawing prompt format:

```
====================================================================
|  {GATE NAME}                                                      |
|                                                                   |
|  {Context}                                                        |
|                                                                   |
|  Commands:                                                        |
|    approved     --- Pass gate, continue to {next phase}           |
|    changes: ... --- Request modifications                         |
|    show {item}  --- Display deliverable                           |
====================================================================
```

**Rule:** All generated gate prompts must follow this visual format.

### Pattern 3: State Schema Structure

Both commands use the same state schema pattern:

```json
{
  "mode": "{mode}",
  "phase": "{current-phase}",
  "status": "active",
  "gates": { "{gate-id}": { "status": "pending", "required": true } },
  "phases": { "{PHASE}": { "status": "pending" } },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

Differences:
- Engineering adds `systems` arrays to phases
- Proposal adds `deliverables` arrays to phases and a `metrics` object

**Rule:** Generate base schema from pattern, add domain-specific extensions.

### Pattern 4: Standard Command Table

Both commands include these standard commands:

| Command | Present In Both |
|---------|----------------|
| `go` | Yes |
| `status` | Yes |
| `approved` | Yes |
| `changes: [feedback]` | Yes |
| `pause` | Yes |
| `show [deliverable]` | Yes |

Additional commands vary:
- Engineering: `skip [system]`, `skip-gate [gate]`, `handoff`, `phase [name]`
- Proposal: `skip-gate [gate] --reason`, `show metrics`, `improve: [feedback]`

**Rule:** Always include the 6 standard commands. Add domain-specific commands below.

### Pattern 5: Example Session Depth

Both commands include:
1. Initial invocation showing fresh start
2. State detection or initialization
3. First phase execution with progress indicators
4. First gate prompt with deliverable summary
5. Gate approval and transition to next phase

**Rule:** Example sessions must cover at least these 5 beats.

### Pattern 6: Resume Example

Both commands show:
1. Invocation finding existing state
2. Progress summary (completed phases, gate status)
3. Resume prompt
4. Continuation message

**Rule:** Resume examples must show all 4 elements.

## Section Length Analysis

| Section | engineering-harness | proposal-harness | Recommended |
|---------|----------------|-----------------|-------------|
| Title + tagline | 3 lines | 3 lines | 3 lines |
| Purpose | 15 lines | 10 lines | 10-15 lines |
| Usage | 10 lines | 8 lines | 8-12 lines |
| Execution Flow | 180 lines | 120 lines | Scale with phases |
| Gate Enforcement | 50 lines | 30 lines | Scale with gates |
| Commands Table | 15 lines | 15 lines | 12-18 lines |
| State Files | 12 lines | 12 lines | 10-15 lines |
| Example Session | 80 lines | 70 lines | 60-100 lines |
| Resume Example | 30 lines | 30 lines | 25-35 lines |
| References | 20 lines | 15 lines | 15-25 lines |

## Anti-Patterns Found

| Anti-Pattern | Where Found | Correction |
|-------------|------------|-----------|
| Phase list in execution flow does not match loop.json | engineering-harness lists 10 phases, loop.json has 9 | Always derive from loop.json |
| Implicit skill invocation | engineering-harness embeds skills in phase diagram | Always provide explicit skill invocation sequence |
| Missing hook documentation | engineering-harness defers to CLAUDE.md | Include hook section if hooks exist |
| Inconsistent state schema | Engineering uses `systems`, Proposal uses `deliverables` | Standardize on `deliverables` in phase entries |

## Generation Implications

When generating a new command, use these implementations as templates:

| Loop Complexity | Reference Command | Format |
|----------------|------------------|--------|
| Simple (3-6 phases, no modes) | `proposal-harness` | Quick Format |
| Complex (7+ phases, modes, conditional) | `engineering-harness` | Full Format |
| Domain-specific (non-engineering) | `proposal-harness` | Quick Format + domain sections |

## Quick Reference

```markdown
Structural requirements extracted from existing commands:
- Cold start detection as Step 1 (always)
- Box-drawing gate prompts (always)
- Standard 6-command table (always)
- Example session covering 5 beats (always)
- Resume example with 4 elements (always)
- Mode sections (only if multi-mode)
- Hook documentation (only if hooks configured)
- ASCII phase diagram (always, complexity varies)
- MCP skill fetch instructions in References (always)
```
