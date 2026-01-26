# loop-state.json Template

This document defines the structure for `loop-state.json`, which tracks orchestrator state across sessions.

---

## Initial Structure

When starting orchestrator, create `loop-state.json` in the project root:

```json
{
  "orchestratorId": "orch-{timestamp}",
  "startedAt": "2026-01-21T10:00:00Z",
  "mode": null,
  "modeDetection": {
    "detected": null,
    "confidence": 0,
    "signals": [],
    "confirmedByUser": false,
    "overridden": false
  },
  "scopeDiscovery": {
    "completedAt": null,
    "gaps": [],
    "systems": [],
    "estimatedLoops": 0,
    "parallelizationFactor": 1
  },
  "currentLoop": 1,
  "currentPhase": "DETECT",
  "subAgents": [],
  "completedSystems": [],
  "gates": {
    "pending": [],
    "approved": [],
    "rejected": []
  },
  "metrics": {
    "loopsCompleted": 0,
    "estimatedHours": 0,
    "actualHours": 0,
    "calibrationFactor": 1.0
  }
}
```

---

## Phase Progression

Update `currentPhase` as you progress through the orchestrator flow:

```
DETECT → DISCOVER → PLAN → EXECUTE → RETROSPECT → (COMPLETE or next loop)
```

| Phase | Description | Next Phase |
|-------|-------------|------------|
| `DETECT` | Gathering signals, classifying mode | `DISCOVER` |
| `DISCOVER` | Running gap analysis, creating SCOPE-DISCOVERY.md | `PLAN` |
| `PLAN` | Decomposing work, identifying parallelization | `EXECUTE` |
| `EXECUTE` | Running engineering loop, spawning agents | `RETROSPECT` |
| `RETROSPECT` | Learning from loop, updating calibration | `COMPLETE` or back to `EXECUTE` |
| `COMPLETE` | All work done, production-quality achieved | — |

---

## Mode Detection

After detecting and confirming mode:

```json
{
  "mode": "brownfield-polish",
  "modeDetection": {
    "detected": "brownfield-polish",
    "confidence": 0.87,
    "signals": [
      { "category": "codebase", "signal": "47 files", "weight": 0.3, "mode": "polish" },
      { "category": "git", "signal": "23 commits", "weight": 0.4, "mode": "polish" },
      { "category": "cicd", "signal": "no CI/CD", "weight": 0.5, "mode": "polish" },
      { "category": "deploy", "signal": "no deploy config", "weight": 0.5, "mode": "polish" }
    ],
    "confirmedByUser": true,
    "overridden": false
  }
}
```

---

## Scope Discovery

After running gap analysis:

```json
{
  "scopeDiscovery": {
    "completedAt": "2026-01-21T10:15:00Z",
    "gaps": [
      { "category": "deployment", "severity": "critical", "description": "No CI/CD pipeline" },
      { "category": "ui", "severity": "high", "description": "No dark mode" },
      { "category": "testing", "severity": "medium", "description": "Missing integration tests" }
    ],
    "systems": [
      { "name": "deployment", "type": "gap-fill", "priority": "critical", "parallelizable": false },
      { "name": "ui-polish", "type": "gap-fill", "priority": "high", "parallelizable": true },
      { "name": "testing", "type": "gap-fill", "priority": "medium", "parallelizable": true }
    ],
    "estimatedLoops": 2,
    "parallelizationFactor": 3
  }
}
```

---

## Sub-Agent Tracking

When spawning agents for parallel work, add to `subAgents`:

```json
{
  "subAgents": [
    {
      "id": "agent-ui-polish",
      "system": "ui-polish",
      "worktree": ".worktrees/ui-polish",
      "branch": "feature/ui-polish",
      "status": "running",
      "currentStage": "IMPLEMENT",
      "progress": "Adding dark mode toggle component",
      "outputFile": "/tmp/agent-ui-polish-output.txt",
      "spawnedAt": "2026-01-21T10:30:00Z",
      "lastHeartbeat": "2026-01-21T10:45:00Z",
      "completedAt": null,
      "metrics": {
        "filesModified": 8,
        "testsAdded": 3,
        "commitsCreated": 2
      }
    }
  ]
}
```

### Agent Status Values

| Status | Description |
|--------|-------------|
| `spawning` | Agent is being initialized |
| `running` | Agent is actively working |
| `waiting-gate` | Agent is paused, waiting for human approval |
| `completed` | Agent finished successfully |
| `failed` | Agent encountered an error |

---

## Stage Gates

When agents request human approval:

```json
{
  "gates": {
    "pending": [
      {
        "id": "gate-001",
        "agent": "agent-ui-polish",
        "type": "visual-review",
        "description": "UI dark mode styling complete",
        "artifacts": ["screenshots/dark-home.png", "screenshots/dark-dashboard.png"],
        "requestedAt": "2026-01-21T11:00:00Z"
      }
    ],
    "approved": [],
    "rejected": []
  }
}
```

After approval:
```json
{
  "gates": {
    "pending": [],
    "approved": [
      {
        "id": "gate-001",
        "agent": "agent-ui-polish",
        "type": "visual-review",
        "approvedAt": "2026-01-21T11:05:00Z",
        "feedback": null
      }
    ],
    "rejected": []
  }
}
```

---

## Metrics & Calibration

Track actual vs estimated for future calibration:

```json
{
  "metrics": {
    "loopsCompleted": 1,
    "estimatedHours": 4,
    "actualHours": 3.5,
    "calibrationFactor": 0.875
  }
}
```

The `calibrationFactor` is `actualHours / estimatedHours`. Use this to adjust future estimates:
- Factor < 1.0 = You're overestimating (work is faster than expected)
- Factor > 1.0 = You're underestimating (work takes longer than expected)

---

## Session Handoff

When ending a session mid-orchestration, update loop-state.json to enable resume:

```json
{
  "currentPhase": "EXECUTE",
  "sessionHandoff": {
    "pausedAt": "2026-01-21T12:00:00Z",
    "reason": "session-end",
    "resumeInstructions": "Continue with agent-testing completion, then merge all worktrees",
    "pendingActions": [
      "Wait for agent-testing to complete",
      "Merge ui-polish branch",
      "Run full test suite"
    ]
  }
}
```

Resume with `/orchestrator --resume` to continue from this state.

---

## Complete Example

Full loop-state.json after one loop completion:

```json
{
  "orchestratorId": "orch-1705834800000",
  "startedAt": "2026-01-21T10:00:00Z",
  "mode": "brownfield-polish",
  "modeDetection": {
    "detected": "brownfield-polish",
    "confidence": 0.87,
    "signals": [
      { "category": "codebase", "signal": "47 files", "weight": 0.3, "mode": "polish" }
    ],
    "confirmedByUser": true,
    "overridden": false
  },
  "scopeDiscovery": {
    "completedAt": "2026-01-21T10:15:00Z",
    "gaps": [
      { "category": "deployment", "severity": "critical", "description": "No CI/CD" }
    ],
    "systems": [
      { "name": "deployment", "type": "gap-fill", "priority": "critical", "parallelizable": false }
    ],
    "estimatedLoops": 2,
    "parallelizationFactor": 1
  },
  "currentLoop": 2,
  "currentPhase": "EXECUTE",
  "subAgents": [],
  "completedSystems": ["deployment", "ui-polish", "data-validation"],
  "gates": {
    "pending": [],
    "approved": [
      { "id": "gate-001", "agent": "agent-ui-polish", "type": "visual-review", "approvedAt": "2026-01-21T11:05:00Z" }
    ],
    "rejected": []
  },
  "metrics": {
    "loopsCompleted": 1,
    "estimatedHours": 4,
    "actualHours": 3.5,
    "calibrationFactor": 0.875
  }
}
```
