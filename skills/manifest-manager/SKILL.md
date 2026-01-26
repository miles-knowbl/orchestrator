---
name: manifest-manager
description: "Generate and maintain execution manifests that specify what should run, in what order, with what constraints and expected outputs."
phase: SHIP
category: meta
version: "1.0.0"
depends_on: ["deploy"]
tags: [meta, manifests, orchestration, deployment, specifications]
---

# Manifest Manager

Generate and maintain execution manifests for reproducible runs.

## When to Use

- **Before deployment** — Create a manifest of what will be deployed
- **Reproducible execution** — Document the exact configuration for a loop run
- **Audit trail** — Record what was executed and with what parameters
- When you say: "create manifest", "execution record", "deployment manifest"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Execution manifest | `render-manifest.json` | Always |

## Core Concept

Manifest management answers: **"What exactly is being executed or deployed, and how can we reproduce it?"**

```
Loop Definition + Configuration + Environment → Manifest → Execution/Deployment
```

A manifest is a complete, self-contained record of what should happen (or what did happen).

## Manifest Schema

```json
{
  "version": "1.0.0",
  "created": "2026-01-26T12:00:00Z",
  "loop": {
    "id": "engineering-loop",
    "version": "3.1.0"
  },
  "project": {
    "name": "my-project",
    "version": "1.0.0",
    "commit": "abc1234"
  },
  "phases": [
    {
      "name": "IMPLEMENT",
      "skills": ["implement"],
      "status": "completed",
      "outputs": ["src/index.ts", "src/services/auth.ts"]
    }
  ],
  "gates": [
    {
      "id": "spec-gate",
      "status": "approved",
      "approvedBy": "human",
      "timestamp": "2026-01-26T12:30:00Z"
    }
  ],
  "artifacts": [
    { "type": "tarball", "path": "project-v1.0.0.tar.gz", "checksum": "sha256:..." }
  ]
}
```

## Manifest Types

| Type | Purpose | When |
|------|---------|------|
| **Execution manifest** | Records what the loop produced | After loop completion |
| **Deployment manifest** | Specifies what to deploy | Before deployment |
| **Render manifest** | Specifies assets to generate | Before generation |

## Validation

Manifests should be validated before use:

```typescript
// Verify all referenced files exist
// Verify all checksums match
// Verify all dependencies are met
// Verify version compatibility
```

## Checklist

- [ ] Manifest includes all phases, skills, and gates
- [ ] All artifacts have checksums
- [ ] Project version and commit recorded
- [ ] Loop version recorded
- [ ] Manifest is valid JSON and parseable

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `deploy` | Deployment manifest feeds into deploy |
| `distribute` | Distribution artifacts recorded in manifest |
| `journey-tracer` | Journey data feeds manifest creation |
| `retrospective` | Manifest is input for retrospective analysis |

## Key Principles

**Complete and self-contained.** A manifest has everything needed to understand or reproduce an execution.

**Checksums on artifacts.** Every file referenced by a manifest should be verifiable.

**Version everything.** Loop version, project version, skill versions — all recorded.

**Immutable after creation.** Manifests are a record; never modify a published manifest.
