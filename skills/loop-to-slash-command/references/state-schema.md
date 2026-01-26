# State Schema

Complete state file structure for loop execution. The state file is the runtime source of truth for loop progress, gate status, and deliverable tracking. Generated from loop.json, not handcrafted.

## Full Schema

```json
{
  "loop": "{loop-id}",
  "version": "{loop-version}",
  "mode": "{default-mode or detected-mode}",
  "phase": "{current-phase-name}",
  "status": "{loop-status}",
  "gates": {
    "{gate-id}": {
      "status": "{gate-status}",
      "required": true,
      "approvalType": "{approval-type}",
      "deliverables": ["{FILE}.md"],
      "passedAt": null,
      "skippedReason": null
    }
  },
  "phases": {
    "{PHASE_NAME}": {
      "status": "{phase-status}",
      "required": true,
      "skills": ["{skill-name}"],
      "deliverables": [],
      "startedAt": null,
      "completedAt": null
    }
  },
  "metrics": {},
  "started_at": "{ISO-8601}",
  "last_updated": "{ISO-8601}"
}
```

## Field Definitions

### Top-Level Fields

| Field | Type | Values | Source |
|-------|------|--------|--------|
| `loop` | string | Loop ID | `$.id` |
| `version` | string | Semver | `$.version` |
| `mode` | string | Default or detected mode | `$.defaults.mode` |
| `phase` | string | Current active phase name | Runtime |
| `status` | enum | `active`, `paused`, `complete`, `failed` | Runtime |
| `started_at` | string | ISO 8601 timestamp | Set on creation |
| `last_updated` | string | ISO 8601 timestamp | Set on every mutation |

### Loop Status Transitions

```
active ----> paused    (user says "pause")
active ----> complete  (all phases done, final gate passed)
active ----> failed    (unrecoverable error)
paused ----> active    (user resumes with --resume)
```

### Gate Fields

| Field | Type | Values | Source |
|-------|------|--------|--------|
| `status` | enum | `pending`, `passed`, `skipped`, `failed` | Runtime |
| `required` | boolean | true/false | `$.gates[*].required` |
| `approvalType` | enum | `human`, `conditional`, `auto` | `$.gates[*].approvalType` |
| `deliverables` | string[] | File names | `$.gates[*].deliverables` |
| `passedAt` | string/null | ISO 8601 or null | Set when gate passes |
| `skippedReason` | string/null | Reason text or null | Set when gate is skipped |

### Gate Status Transitions

```
pending ----> passed   (user says "approved" or auto-check passes)
pending ----> skipped  (user says "skip-gate {id} --reason ...")
pending ----> failed   (deliverable check fails, user must fix)
failed  ----> pending  (user fixes deliverable, retries)
failed  ----> skipped  (user explicitly skips after failure)
```

### Phase Fields

| Field | Type | Values | Source |
|-------|------|--------|--------|
| `status` | enum | `pending`, `active`, `complete`, `skipped` | Runtime |
| `required` | boolean | true/false | `$.phases[*].required` |
| `skills` | string[] | Skill names | `$.phases[*].skills` |
| `deliverables` | string[] | Produced file names | Runtime (populated during execution) |
| `startedAt` | string/null | ISO 8601 or null | Set when phase begins |
| `completedAt` | string/null | ISO 8601 or null | Set when phase completes |

### Phase Status Transitions

```
pending  ----> active    (previous phase + gate complete)
active   ----> complete  (all skills executed, deliverables verified)
pending  ----> skipped   (phase not required, user or auto skips)
active   ----> pending   (phase reset after failure)
```

## Generation Algorithm

Transform loop.json into state schema:

```
INPUT: loop.json
OUTPUT: {state-file}.json

1. Set top-level fields:
   loop     = $.id
   version  = $.version
   mode     = $.defaults.mode
   phase    = $.phases[0].name  (first phase)
   status   = "active"

2. For each gate in $.gates:
   gates[gate.id] = {
     status: "pending",
     required: gate.required,
     approvalType: gate.approvalType,
     deliverables: gate.deliverables,
     passedAt: null,
     skippedReason: null
   }

3. For each phase in $.phases:
   phases[phase.name] = {
     status: "pending",
     required: phase.required,
     skills: phase.skills,
     deliverables: [],
     startedAt: null,
     completedAt: null
   }

4. Set first phase status to "active"

5. Set timestamps:
   started_at = now()
   last_updated = now()
```

## Metrics Object

The metrics object is domain-specific. It is empty by default and populated during execution based on the loop's domain.

### Engineering Loop Metrics

```json
"metrics": {
  "systems_built": 0,
  "tests_written": 0,
  "coverage_percent": 0,
  "lint_errors": 0,
  "type_errors": 0
}
```

### Proposal Loop Metrics

```json
"metrics": {
  "sources_processed": 0,
  "requirements_extracted": 0,
  "patterns_identified": 0,
  "gaps_found": 0,
  "priorities_ranked": 0,
  "claims_with_evidence": 0
}
```

### Custom Loop Metrics

For new loops, the metrics object starts empty. Skills populate it during execution:

```json
"metrics": {}
```

## Resume Logic

When reading an existing state file to resume:

```
1. Read {state-file}.json
2. Check status:
   - "complete" -> Inform user, ask if they want to restart
   - "failed"   -> Show error, ask if they want to retry from failed phase
   - "paused"   -> Resume from current phase
   - "active"   -> Resume from current phase (session interrupted)
3. Find current phase: first phase with status "active" or first "pending"
4. Check gate before current phase:
   - If gate "pending" and "required" -> Present gate prompt
   - If gate "passed" or "skipped"   -> Continue to phase
   - If no gate before this phase    -> Continue to phase
5. Update last_updated timestamp
```

## Validation Rules

```markdown
- [ ] Every phase in loop.json appears in state phases object
- [ ] Every gate in loop.json appears in state gates object
- [ ] Phase names in state match loop.json exactly (case-sensitive)
- [ ] Gate IDs in state match loop.json exactly (case-sensitive)
- [ ] All gate deliverable arrays match loop.json
- [ ] All phase skill arrays match loop.json
- [ ] Timestamps are ISO 8601 format
- [ ] Initial status is "active"
- [ ] Initial phase is first phase name
- [ ] All gate statuses start as "pending"
- [ ] All phase statuses start as "pending" except first ("active")
```
