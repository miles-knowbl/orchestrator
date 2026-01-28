# Command Template

The canonical template for Claude Code slash command `.md` files. Every generated command must follow this structure. Sections must appear in the order listed below.

## Template Structure

The following sections are required for every slash command file. Optional sections are marked.

```
# /{command-name} Command                    <- Section 1: Title
{tagline}                                    <- One-line summary

## Purpose                                   <- Section 2: Purpose
## Usage                                     <- Section 3: Usage
## Execution Flow                            <- Section 4: Flow
  ### Step 1: Cold Start Detection
  ### Step 2: Mode Detection (optional)
  ### Step 3: Initialize Loop State
  ### Step 4: Execute Phases
  ### Step 5: Gate Enforcement
  ### Step 6: Loop Completion
## Commands During Execution                 <- Section 5: Commands
## State Files                               <- Section 6: State
## Example Session                           <- Section 7: Example
## Resuming a Session                        <- Section 8: Resume
## Skill Invocation Sequence                 <- Section 9: Skills
## Hook Integration (optional)               <- Section 10: Hooks
## References                                <- Section 11: References
## Loop Update Protocol (optional)             <- Section 12: Updates
```

## Section 1: Title and Tagline

```markdown
# /{command-name} Command

{Tagline: imperative voice, under 20 words, summarizes the loop's purpose.}
```

Rules:
- H1 heading must start with `/` prefix
- Command name uses kebab-case
- Tagline must not start with "This command..."
- Tagline should convey value, not mechanics

## Section 2: Purpose

```markdown
## Purpose

This command is the **single entry point** for the {loop name}. It handles
everything: {2-3 key capabilities}.

**The flow you want:** {one-sentence user journey from invocation to result}.

Works for:
- **{Use case 1}** --- {description}
- **{Use case 2}** --- {description}
```

Rules:
- Always include "single entry point" phrasing for consistency
- Bold the user flow sentence start
- List 2-4 use cases with bold labels and em-dash descriptions

## Section 3: Usage

```markdown
## Usage

\```
/{command-name} [--resume] [--phase=PHASE] [--additional-flags]
\```

**Options:**
- `--resume`: Resume from existing {state-file-name}
- `--phase=PHASE`: Start from specific phase ({PHASE_1} | {PHASE_2} | ...)
- `--{flag}`: {description}
```

Rules:
- Usage block must be in a code fence (no language hint)
- Every flag must have a description
- Phase enum must list all valid phase names from loop.json
- Optional flags use `[brackets]`

## Section 4: Execution Flow

This is the largest section. It contains numbered sub-steps as H3 headings.

### Cold Start Detection (always present)

```markdown
### Step 1: Cold Start Detection

\```
if {state-file} exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, proceed to initialization
\```
```

### Phase Execution Diagram (always present)

Use ASCII art to show the phase flow with gates:

```
PHASE_1 ---------> PHASE_2 ---------> PHASE_3
   |                  |                  |
   | [gate-1]         |                  | [gate-2]
   v                  v                  v
skill-a            skill-b            skill-c
   |                  |                  |
   v                  v                  v
DELIVERABLE.md     DELIVERABLE.md     DELIVERABLE.md
```

Rules:
- Arrows show flow direction (left to right, top to bottom)
- Gates appear between phases in [brackets]
- Skills appear below their phase
- Deliverables appear below their skill

### Gate Enforcement Table (always present)

```markdown
| Gate | Triggers After | Blocks Until | Deliverable Required |
|------|----------------|--------------|---------------------|
| `{gate-id}` | {phase} complete | User says `approved` | {FILE}.md |
```

## Section 5: Commands During Execution

Standard command table that every command must include:

```markdown
## Commands During Execution

| Command | Action |
|---------|--------|
| `go` | Continue execution / proceed to next phase |
| `status` | Show current phase, gate status, progress |
| `approved` | Pass current gate |
| `changes: [feedback]` | Request changes at gate |
| `pause` | Stop after current phase |
| `skip [system]` | Skip a system (requires reason) |
| `skip-gate [gate]` | Skip a gate (requires reason) |
| `show [deliverable]` | Display a deliverable |
```

Add domain-specific commands below the standard set.

## Section 6: State Files

```markdown
## State Files

| File | Purpose |
|------|---------|
| `{state-file}` | Current phase, gate status, progress |
| `{DELIVERABLE}.md` | {description} |
```

## Section 7: Example Session

Must show a realistic invocation walkthrough covering at minimum:
- Initial invocation
- State detection (fresh start)
- First phase execution
- First gate prompt
- Gate approval
- Next phase starting

Use code fences for the entire session. Include `User:` and `{Loop}:` labels.

## Section 8: Resuming a Session

Must show:
- Invocation with existing state
- State summary display
- Resume prompt
- Continuation from mid-loop

## Section 9: Skill Invocation Sequence

```markdown
## Skill Invocation Sequence

\```
1. {skill-name}
   +-- Read: {reference-1}.md
   +-- Read: {reference-2}.md
   +-- Output: {DELIVERABLE-1}.md

2. {skill-name}
   +-- Read: {reference-1}.md
   +-- Output: {DELIVERABLE}.md
\```
```

## Section 10: References

```markdown
## References

This command uses the **skills-library MCP server** for skill definitions:

\```
mcp__skills-library__get_skill(name: "{skill-name}", includeReferences: true)
\```
```

## Quick Reference Checklist

```markdown
- [ ] H1 title with / prefix
- [ ] Tagline under 20 words, imperative voice
- [ ] Purpose with "single entry point" and use case list
- [ ] Usage block with all flags documented
- [ ] Execution flow with cold start, phase diagram, gate table
- [ ] Standard commands table
- [ ] State files table
- [ ] Example session (fresh start through first gate)
- [ ] Resume session example
- [ ] Skill invocation sequence tree
- [ ] References with MCP fetch instructions
- [ ] No placeholder text (TODO, TBD, [fill in])
- [ ] Line count 300-500
```
