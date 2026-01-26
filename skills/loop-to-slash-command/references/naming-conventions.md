# Naming Conventions

Rules and algorithms for deriving command names, file names, flags, and identifiers from loop definitions. Consistency in naming enables discoverability and prevents collisions.

## Command Name Derivation

The command name is derived mechanically from the loop ID:

```
Algorithm:
1. Take $.id from loop.json (e.g., "engineering-loop")
2. Strip the "-loop" suffix if present (e.g., "engineering")
3. Map domain to harness name (e.g., "agentic-harness")
4. If no "-loop" suffix, use full ID + "-harness"
```

### Derivation Table

| Loop ID | Strip Suffix | Domain | Command Name |
|---------|-------------|--------|-------------|
| `engineering-loop` | `engineering` | `agentic`* | `agentic-harness` |
| `proposal-loop` | `proposal` | `proposal` | `proposal-harness` |
| `content-pipeline` | (no suffix) | `content-pipeline` | `content-pipeline-harness` |
| `review-loop` | `review` | `review` | `review-harness` |
| `sales` | (no suffix) | `sales` | `sales-harness` |

*Note: `engineering` maps to `agentic` by convention. This is the only non-mechanical mapping. All other loops use direct domain mapping.

### Domain Override

If `$.ui.branding.title` exists and differs from the mechanical name, use it for display purposes only. The file name always follows the mechanical convention:

| Branding Title | File Name | Display Name |
|---------------|-----------|-------------|
| "Engineering Harness" | `agentic-harness.md` | "Agentic Harness" |
| "Proposal Builder" | `proposal-harness.md` | "Proposal Builder" |
| "Sales Pipeline" | `sales-harness.md` | "Sales Pipeline" |

## File Name Conventions

| File Type | Convention | Example |
|-----------|-----------|---------|
| Command file | `{command-name}.md` | `proposal-harness.md` |
| State file | `{domain}-state.json` | `proposal-state.json` |
| Deliverable | `UPPER-CASE.md` | `FEATURESPEC.md` |
| Config | `lowercase-kebab.json` | `loop-state.json` |
| Log | `lowercase-kebab.jsonl` | `journey-log.jsonl` |

### State File Naming

The state file name uses the domain (not the command name):

```
Algorithm:
1. Take the domain from command name derivation
2. Append "-state.json"
3. Special case: engineering-loop uses "loop-state.json" (legacy)
```

| Loop ID | Domain | State File |
|---------|--------|------------|
| `engineering-loop` | `agentic` | `loop-state.json`* |
| `proposal-loop` | `proposal` | `proposal-state.json` |
| `review-loop` | `review` | `review-state.json` |

*Legacy convention. New loops should use `{domain}-state.json`.

## Flag Conventions

### Standard Flags (always present)

| Flag | Format | Values |
|------|--------|--------|
| `--resume` | Boolean (no value) | Present or absent |
| `--phase` | `--phase=VALUE` | Phase names from loop.json, UPPER_CASE |

### Conditional Flags

| Flag | Present When | Format |
|------|-------------|--------|
| `--mode` | Loop has `$.defaults.mode` and mode detection | `--mode=VALUE` |
| `--skip-analysis` | Loop has a codebase analysis step | Boolean |
| `--skip-gate` | Any gate has `required: false` | `--skip-gate=GATE_ID` |

### Flag Value Enums

Phase flag values are derived from `$.phases[*].name`:

```
Loop phases: [INIT, SCAFFOLD, IMPLEMENT, TEST, VERIFY]
Flag usage: --phase=INIT | --phase=SCAFFOLD | --phase=IMPLEMENT | ...
```

Gate skip values are derived from `$.gates[*].id`:

```
Loop gates: [spec-gate, architecture-gate, deploy-gate]
Flag usage: --skip-gate=spec-gate | --skip-gate=architecture-gate | ...
```

## Identifier Conventions

| Identifier Type | Convention | Example |
|----------------|-----------|---------|
| Phase name | UPPER_CASE | `INIT`, `SCAFFOLD`, `IMPLEMENT` |
| Gate ID | lowercase-kebab | `spec-gate`, `architecture-gate` |
| Skill name | lowercase-kebab | `context-ingestion`, `code-review` |
| Deliverable name | UPPER-KEBAB.md | `FEATURESPEC.md`, `CODE-REVIEW.md` |
| State field | camelCase | `passedAt`, `skippedReason`, `startedAt` |
| JSON key (top-level) | snake_case | `started_at`, `last_updated` |

## Conflict Resolution

When a derived command name conflicts with an existing command:

| Conflict Type | Resolution |
|--------------|-----------|
| Same name, different loop | Append loop version: `review-v2-harness` |
| Same name, same loop (update) | Overwrite with confirmation |
| Name too long (>30 chars) | Use abbreviation: `content-pipeline-harness` -> `cp-harness` |
| Reserved name collision | Prefix with `custom-`: `custom-review-harness` |

### Checking for Conflicts

```bash
# List existing commands
ls ~/.claude/commands/*.md

# Check for name collision
ls ~/.claude/commands/{proposed-name}.md 2>/dev/null && echo "CONFLICT" || echo "AVAILABLE"
```

## Quick Reference

```markdown
Command name:  {loop-id minus "-loop"}-harness
Command file:  ~/.claude/commands/{command-name}.md
State file:    {domain}-state.json
H1 title:      /{command-name} Command
Phase values:  UPPER_CASE from $.phases[*].name
Gate IDs:      lowercase-kebab from $.gates[*].id
Deliverables:  UPPER-CASE.md from $.gates[*].deliverables
```
