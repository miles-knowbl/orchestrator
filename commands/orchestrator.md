# /orchestrator

Unified development orchestration. Detects project mode, performs scope discovery, and coordinates execution.

## Execution

1. **Load skill** (without references to avoid size limits):
   ```
   mcp__skills-library__get_skill(name: "orchestrator", includeReferences: false)
   ```

2. **Load references on-demand** as needed during execution:
   - `mode-detection.md` - When detecting mode
   - `scope-discovery.md` - When analyzing gaps
   - `parallel-agents.md` - When spawning sub-agents

3. **Follow the 6-step flow**:
   - Step 1: Detect mode (greenfield | brownfield-polish | brownfield-enterprise)
   - Step 2: Discover scope (gap analysis)
   - Step 3: Plan execution (parallel vs sequential)
   - Step 4: Spawn sub-agents (if parallel work)
   - Step 5: Execute loop (mode-aware skills)
   - Step 6: Retrospect (learn, calibrate)

## Arguments

- `$ARGUMENTS`
- `--mode=greenfield|polish|enterprise` - Force mode
- `--resume` - Resume from loop-state.json
- `status` - Show current state

## Quick Reference

### Mode Signals

| Mode | Signals |
|------|---------|
| Greenfield | No package manifest, no src/, no git |
| Brownfield-Polish | <10k LOC, 1-2 contributors, no CI/CD, no deploy |
| Brownfield-Enterprise | CODEOWNERS, PR templates, ADRs, CI/CD, team |

### Stage Gates

- `spec` - After FEATURESPEC.md
- `architecture` - After ARCHITECTURE.md
- `deploy` - Before shipping
