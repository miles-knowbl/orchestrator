# Loop Schema Reference

Complete field-by-field documentation of the `loop.json` schema. This is the authoritative reference for every field a loop definition can contain.

## Top-Level Structure

```json
{
  "id": "string (required)",
  "name": "string (required)",
  "version": "string (required)",
  "description": "string (required)",
  "phases": "Phase[] (required)",
  "gates": "Gate[] (optional, default: [])",
  "defaults": "Defaults (optional)",
  "ui": "UIConfig (optional)",
  "skillUI": "Record<string, SkillUIConfig> (optional)",
  "metadata": "Metadata (optional)"
}
```

## Field Reference

### `id` (string, required)

Unique identifier for the loop. Used as the directory name under `loops/` and as the key in the loop registry.

- **Format:** kebab-case, lowercase, alphanumeric with hyphens
- **Convention:** `[domain]-loop` for primary loops, `[domain]-[variant]` for variants
- **Examples:** `engineering-loop`, `proposal-loop`, `security-audit`, `engineering-lite`
- **Constraint:** Must be unique across all loops in the system

### `name` (string, required)

Human-readable display name for the loop.

- **Format:** Title Case
- **Examples:** `"Engineering Loop"`, `"Proposal Loop"`, `"Security Audit Loop"`

### `version` (string, required)

Semantic version of the loop definition.

- **Format:** `major.minor.patch` (semver)
- **Increment major:** Breaking changes to phase structure or gates
- **Increment minor:** New skills added, optional phases added
- **Increment patch:** Description changes, UI tweaks, metadata updates

### `description` (string, required)

One-sentence summary of the loop's purpose. Displayed in loop listings and selection UIs.

- **Max length:** 200 characters (truncated in list views)
- **Should answer:** "What does this loop do from start to finish?"

## Phase Object

```json
{
  "name": "Phase (required)",
  "skills": "string[] (required, non-empty)",
  "required": "boolean (required)"
}
```

### `name` (Phase enum, required)

Must be one of the canonical phases:

| Phase | Position | Typical Purpose |
|-------|----------|-----------------|
| `INIT` | First | Requirements, spec, context gathering |
| `SCAFFOLD` | Early | Architecture, project structure, design |
| `IMPLEMENT` | Middle | Core implementation, coding |
| `TEST` | Middle | Test generation, test execution |
| `VERIFY` | Middle | Structural verification, lint, type checks |
| `VALIDATE` | Middle | Semantic validation, performance, correctness |
| `DOCUMENT` | Late | Documentation generation |
| `REVIEW` | Late | Code review, architecture review |
| `SHIP` | Late | Deployment, release |
| `COMPLETE` | Last | Loop finalization, metrics, cleanup |
| `META` | Any | Meta-operations (rarely used in loop definitions) |

### `skills` (string[], required)

Array of skill IDs to execute during this phase, in order.

- **Non-empty:** At least one skill per phase
- **Ordered:** Skills execute sequentially within a phase
- **Valid:** Each skill ID must exist in the skill registry

### `required` (boolean, required)

Whether this phase must execute for the loop to complete.

- `true`: Phase cannot be skipped, loop fails if phase fails
- `false`: Phase can be skipped by user or automation

## Gate Object

```json
{
  "id": "string (required)",
  "name": "string (required)",
  "afterPhase": "Phase (required)",
  "required": "boolean (required)",
  "approvalType": "ApprovalType (required)",
  "deliverables": "string[] (required, can be empty)"
}
```

### `id` (string, required)

Unique identifier for the gate within this loop.

- **Format:** kebab-case
- **Convention:** `[phase-or-purpose]-gate`
- **Examples:** `spec-gate`, `architecture-gate`, `review-gate`, `deploy-gate`

### `name` (string, required)

Human-readable name displayed in the gate approval UI.

- **Examples:** `"Specification Approval"`, `"Architecture Review"`, `"Deployment Approval"`

### `afterPhase` (Phase, required)

The phase after which this gate is placed. Execution pauses here until the gate is cleared.

- **Must reference** a phase that exists in the loop's `phases` array
- Gate blocks execution of the next phase in sequence

### `required` (boolean, required)

Whether the gate must be cleared for the loop to proceed.

- `true`: Loop cannot continue past this gate without approval
- `false`: Gate can be auto-cleared or skipped

### `approvalType` (enum, required)

How the gate is cleared:

| Type | Behavior | Use When |
|------|----------|----------|
| `"human"` | Human must explicitly approve | Critical decisions, spec/architecture/review |
| `"conditional"` | Auto-clears if condition is met, else blocks | Deployment (only if SHIP ran) |
| `"automated"` | Programmatic check, no human needed | Test pass/fail, lint results |

### `deliverables` (string[], required)

Files the human should review before approving the gate.

- Can be empty array `[]` for automated or conditional gates
- Files are relative to the execution directory
- **Examples:** `["FEATURESPEC.md"]`, `["ARCHITECTURE.md", "docs/adr/ADR-001.md"]`

## Defaults Object

```json
{
  "mode": "LoopMode (optional, default: 'greenfield')",
  "autonomy": "AutonomyLevel (optional, default: 'supervised')"
}
```

### `mode` (LoopMode enum)

| Value | Meaning |
|-------|---------|
| `"greenfield"` | New project, no existing code constraints |
| `"brownfield"` | Existing codebase, must respect existing patterns |

### `autonomy` (AutonomyLevel enum)

| Value | Meaning |
|-------|---------|
| `"supervised"` | Human approves every gate |
| `"semi-autonomous"` | Human approves critical gates, others automated |
| `"autonomous"` | All gates automated, human notified |

## UI Configuration Object

```json
{
  "theme": "string",
  "layout": "string",
  "features": {
    "skillBrowser": "boolean",
    "deliverableViewer": "boolean",
    "gateApprovalUI": "boolean",
    "progressTimeline": "boolean",
    "metricsPanel": "boolean"
  },
  "branding": {
    "title": "string",
    "subtitle": "string"
  }
}
```

### `theme` (string)

Visual theme identifier. Typically matches the domain: `"engineering"`, `"proposal"`, `"security"`.

### `layout` (string)

UI layout mode:
- `"chat-focused"`: Primary chat interface with side panels
- `"dashboard"`: Multi-panel dashboard layout

### `features` (object)

Toggle individual UI features on/off based on the loop's needs.

### `branding` (object)

Display title and subtitle shown in the loop UI header.

## Skill UI Configuration

```json
{
  "[skill-id]": {
    "displayName": "string",
    "icon": "string",
    "outputDisplay": "string"
  }
}
```

One entry per unique skill used in the loop. Controls how each skill appears in the UI.

### `outputDisplay` options

| Value | Renders As |
|-------|-----------|
| `"markdown"` | Rendered markdown document |
| `"code"` | Syntax-highlighted code block |
| `"diff"` | Side-by-side or unified diff view |
| `"table"` | Structured table display |

## Metadata Object

```json
{
  "author": "string",
  "tags": "string[]"
}
```

### `author` (string)

Creator of the loop definition. Typically `"Orchestrator"` for system-generated loops.

### `tags` (string[])

Searchable tags for loop discovery. Include domain, scope, and purpose tags.

## Complete Example

See the engineering-loop (`loops/engineering-loop/loop.json`) and proposal-loop (`loops/proposal-loop/loop.json`) for production examples.
