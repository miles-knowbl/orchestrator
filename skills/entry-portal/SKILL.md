---
name: entry-portal
description: "Converts fuzzy requirements into structured FeatureSpecs and GitHub issues. Manages the system queue for a domain's journey toward its dream state. The entry point for all new systems and features entering the engineering loop."
phase: INIT
category: operations
version: "1.0.0"
depends_on: []
tags: [meta, initialization, discovery, setup, queue]
---

# Entry Portal

Transform fuzzy ideas into actionable specifications.

## When to Use

- **New domain** — Defining a dream state and initial systems
- **New system** — Adding a system to an existing domain
- **New feature** — Adding capability to an existing system
- **Fuzzy input** — User has an idea but not a clear spec
- When you say: "I want to build...", "we need a system that...", "let's add..."

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `clarifying-questions.md` | Essential patterns for requirement gathering |
| `dream-state-template.md` | Template for vision document |
| `system-decomposition.md` | How to break large initiatives into systems |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `queue-operations.md` | When managing existing queue |
| `github-issue-format.md` | When publishing to GitHub |

**Verification:** Before proceeding, confirm you have read and can apply guidance from required references.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `dream-state.md` | `../{domain}/` | New domain only (sibling to loop command) |
| `config.json` | `../{domain}/` | New domain (autonomy config) |
| `system-queue.json` | `../{domain}/` | Always (create or update) |
| `loop-state.json` | `../{domain}/` | Always (tracks loop state) |
| `FEATURESPEC.md` | `../{domain}/systems/{system}/` | Per system (invokes spec skill) |
| `ESTIMATE.md` | `../{domain}/systems/{system}/` | Per system (invokes estimation skill) |

## Entry-Portal vs Spec Skill

Both skills produce FeatureSpecs, but they serve different purposes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WHEN TO USE WHICH SKILL                                   │
│                                                                             │
│  ENTRY-PORTAL                           SPEC                                │
│  ────────────                           ────                                │
│  • New domain (dream state)             • Clear requirements exist          │
│  • Multiple systems to decompose        • Single feature/system             │
│  • Fuzzy/unclear input                  • Adding to existing system         │
│  • Need clarification dialogue          • Technical refinement              │
│  • Creates GitHub issues                • Just need the spec document       │
│  • Manages system queue                 • Mid-loop spec refinement          │
│                                                                             │
│  "I want to build a field              "Add a notification feature          │
│   service platform..."                  when orders are assigned"           │
│         ↓                                       ↓                           │
│    Entry-Portal                              Spec                           │
│         ↓                                       ↓                           │
│  [Dream State]                          [FeatureSpec document]              │
│  [System Queue]                                                             │
│  [GitHub Issues]                                                            │
│  [FeatureSpecs]                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Decision Guide

| Situation | Use Entry-Portal | Use Spec |
|-----------|------------------|----------|
| Starting greenfield project | ✅ | |
| Breaking down large initiative | ✅ | |
| Input is vague or incomplete | ✅ | |
| Need to create GitHub issues | ✅ | |
| Requirements are already clear | | ✅ |
| Adding feature to existing system | | ✅ |
| Refining spec during implementation | | ✅ |
| Just need spec document, no queue | | ✅ |

**Note:** Entry-portal *invokes* both the spec skill and estimation skill internally. If you use entry-portal, you don't need to separately use spec or estimation — the FeatureSpec and ESTIMATE.md are generated as part of the entry flow.

## Core Concept

Entry Portal is the **front door** to the engineering loop. It takes natural language input and produces GitHub issues with complete FeatureSpecs that the engineering loop can execute.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTRY PORTAL                                       │
│                                                                             │
│  "I need a system for          ┌──────────────┐      GitHub Issue #123      │
│   managing field service   ───▶│ Entry Portal │───▶  with FeatureSpec       │
│   operations..."               └──────────────┘      ready for execution    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## The Entry Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENTRY PORTAL FLOW                                    │
│                                                                             │
│  1. RECEIVE                                                                 │
│     └─→ Accept fuzzy input (natural language description)                   │
│                                                                             │
│  2. CLARIFY                                                                 │
│     └─→ Ask targeted questions until requirements are clear                 │
│     └─→ Use requirements skill patterns                                     │
│                                                                             │
│  3. CLASSIFY                                                                │
│     └─→ New domain? New system? New feature?                                │
│     └─→ Determine scope and context                                         │
│                                                                             │
│  4. DECOMPOSE (if needed)                                                   │
│     └─→ Break into discrete systems                                         │
│     └─→ Identify dependencies between systems                               │
│     └─→ Order by dependency graph                                           │
│                                                                             │
│  5. SPECIFY                                                                 │
│     └─→ Generate FeatureSpec for each system                                │
│     └─→ Use spec skill with 18-section template                             │
│                                                                             │
│  6. ESTIMATE                                                                │
│     └─→ Invoke estimation skill for each system                             │
│     └─→ Produce ESTIMATE.md with effort breakdown                           │
│     └─→ Apply calibration adjustments if available                          │
│                                                                             │
│  7. CONFIGURE                                                               │
│     └─→ Set or confirm autonomy mode (autonomous/supervised/hybrid)         │
│     └─→ Configure gates (specification, architecture, security, deploy)     │
│     └─→ Create/update config.json at domain level                           │
│     └─→ Apply per-system overrides if needed                                │
│                                                                             │
│  8. QUEUE                                                                   │
│     └─→ Add to domain's system queue                                        │
│     └─→ Update queue state (JSON file)                                      │
│                                                                             │
│  9. PUBLISH                                                                 │
│     └─→ Create GitHub issue per system                                      │
│     └─→ Attach FeatureSpec to issue                                         │
│     └─→ Add appropriate labels                                              │
│     └─→ Link dependencies between issues                                    │
│                                                                             │
│  OUTPUT: GitHub issues ready for engineering loop                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Step 1: Receive Input

Accept any form of input:
- Natural language description
- Rough feature list
- Problem statement
- Existing documentation
- Competitor reference
- Wireframes/mockups

Document the raw input before processing.

## Step 2: Clarify Requirements

Use the clarifying questions framework to fill gaps:

### Question Categories (ask in order)

| Category | Questions |
|----------|-----------|
| **Users** | Who will use this? What are their roles? Technical level? |
| **Goals** | What are they trying to accomplish? What's the primary job-to-be-done? |
| **Current State** | How do they do it today? What tools exist? |
| **Pain Points** | What's broken? What's slow? What's frustrating? |
| **Constraints** | Technology requirements? Timeline? Budget? Team size? |
| **Integration** | What existing systems must it work with? |
| **Scale** | How many users? How much data? Growth expectations? |
| **Success** | How will we know it's working? What metrics matter? |

### Clarification Signals

Stop clarifying when:
- [ ] Users and their goals are clearly defined
- [ ] Core functionality is enumerable
- [ ] Constraints are documented
- [ ] Success criteria are measurable
- [ ] Integration points are identified

→ See `references/clarifying-questions.md`

## Step 3: Classify Input

Determine the scope:

| Classification | Characteristics | Next Step |
|----------------|-----------------|-----------|
| **New Domain** | No existing systems, greenfield | Define dream state, decompose into systems |
| **New System** | Adding to existing domain | Fit into existing queue, check dependencies |
| **New Feature** | Adding to existing system | Single FeatureSpec, add to system's backlog |
| **Enhancement** | Improving existing feature | May not need entry portal, go direct to spec |

## Step 4: Define Dream State (New Domains)

For new domains, establish the vision:

```markdown
# Dream State: [Domain Name]

## Vision
[2-3 sentences describing the end state when fully realized]

## Key Capabilities
When complete, the domain will:
- [ ] [Capability 1]
- [ ] [Capability 2]
- [ ] [Capability 3]
- [ ] ...

## Constraints
| Constraint | Value |
|------------|-------|
| Technology Stack | [e.g., Django/Elm, React/Node] |
| Timeline | [e.g., MVP in 3 months] |
| Budget | [e.g., $50k infrastructure] |
| Team | [e.g., 2 engineers + 1 designer] |
| Integration | [e.g., Must work with SAP] |

## Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| [Metric 1] | [Target] | [How measured] |
| [Metric 2] | [Target] | [How measured] |

## Anti-Goals (What We Won't Build)
- [Explicitly out of scope item 1]
- [Explicitly out of scope item 2]
```

→ See `references/dream-state-template.md`

## Step 5: Decompose into Systems

Break the dream state into implementable systems:

### System Identification

Ask:
- What are the natural boundaries? (user-facing vs backend, real-time vs batch)
- What can be deployed independently?
- What has different scaling requirements?
- What has different team ownership?

### Dependency Mapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SYSTEM DEPENDENCY GRAPH                                 │
│                                                                             │
│  ┌─────────────┐                                                            │
│  │   Auth      │◀─────────────────────────────────────┐                     │
│  │  Service    │                                      │                     │
│  └──────┬──────┘                                      │                     │
│         │                                             │                     │
│         ▼                                             │                     │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                 │
│  │    Core     │─────▶│   Routing   │─────▶│   Mobile    │                 │
│  │   Service   │      │   Service   │      │    App      │                 │
│  └──────┬──────┘      └─────────────┘      └─────────────┘                 │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────┐                                                            │
│  │  Analytics  │                                                            │
│  │  Dashboard  │                                                            │
│  └─────────────┘                                                            │
│                                                                             │
│  Build Order: Auth → Core → Routing → Mobile                                │
│               Auth → Core → Analytics (parallel with Routing)               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### System Definition Template

```markdown
## System: [Name]

### Purpose
[One sentence: what this system does]

### Inputs
- [What data/events it receives]
- [From which systems/users]

### Outputs
- [What data/events it produces]
- [To which systems/users]

### Dependencies
- [System names this depends on]
- [External services required]

### Priority
P[1-5] where P1 is highest (build first)

### Estimated Complexity
- [ ] Small (< 1 week)
- [ ] Medium (1-4 weeks)
- [ ] Large (1-3 months)
- [ ] XL (> 3 months, consider further decomposition)
```

→ See `references/system-decomposition.md`

## Step 6: Generate FeatureSpecs

For each system, create a complete FeatureSpec:

1. **Invoke the spec skill**
   ```
   Read /mnt/skills/user/engineering/spec/SKILL.md
   ```

2. **Use the 18-section template**
   ```
   Read /mnt/skills/user/engineering/spec/references/18-section-template.md
   ```

3. **Generate spec for this system's scope**

4. **Validate with senior engineer audit**
   ```
   Read /mnt/skills/user/engineering/spec/references/senior-engineer-audit.md
   ```

## Step 7: Configure Autonomy

Before queuing systems for execution, configure how much human oversight is needed:

### Autonomy Modes

| Mode | Description | Use When |
|------|-------------|----------|
| **Autonomous** | Run to completion, pause only on failure | Small systems, high confidence, personal projects |
| **Supervised** | Pause at all configured gates | Large systems, enterprise, security-critical |
| **Hybrid** | Autonomous with gates at critical points | Standard projects (default) |

### Gate Configuration

Decide which gates require human approval:

| Gate | Stage | Recommended For |
|------|-------|-----------------|
| `specification` | After SPEC | Major initiatives, unclear requirements |
| `architecture` | After SCAFFOLD | Systems with complex architecture decisions |
| `security` | After VALIDATE | Any system handling sensitive data |
| `deploy` | Before SHIP | Production deployments |

### Domain-Level Config

Create `config.json` at domain root:

```json
{
  "domain": "velocity-tracker",
  "organization": "my-org",

  "autonomy": {
    "defaultMode": "supervised",
    "failureRetries": 3,

    "gates": {
      "specification": { "required": true },
      "architecture": { "required": true },
      "security": { "required": false },
      "deploy": { "required": true }
    },

    "reason": "Why this mode was chosen"
  }
}
```

### Per-System Override

In `system-queue.json`, add autonomy overrides for specific systems:

```json
{
  "id": "sys-001",
  "name": "Auth Service",
  "autonomy": {
    "mode": "supervised",
    "gates": {
      "specification": { "required": true },
      "architecture": { "required": true },
      "security": { "required": true },
      "database": { "required": true },
      "deploy": { "required": true }
    },
    "reason": "Security-critical system requires full oversight"
  }
}
```

### Configuration Checklist

Before starting any system:

- [ ] Autonomy mode selected (autonomous/supervised/hybrid)
- [ ] Gates configured for risk level
- [ ] config.json created at domain level
- [ ] Per-system overrides added if needed
- [ ] loop-controller/references/autonomy-configuration.md read

→ See `loop-controller/references/autonomy-configuration.md` for full details

## Step 8: Manage System Queue

### Queue Data Structure

Store in `domain-memory/{domain}/system-queue.json`:

```json
{
  "domain": "azure-standard-ops",
  "repository": "org/azure-standard",
  "dreamState": "Fully integrated field service management platform",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-16T14:30:00Z",
  "systems": [
    {
      "id": "sys-001",
      "name": "Auth Service",
      "description": "Authentication and authorization",
      "githubIssue": 100,
      "status": "complete",
      "dependencies": [],
      "priority": 1,
      "completedAt": "2024-01-10T16:00:00Z"
    },
    {
      "id": "sys-002",
      "name": "ServiceGrid Core",
      "description": "Core work order management",
      "githubIssue": 123,
      "status": "in-progress",
      "dependencies": ["sys-001"],
      "priority": 1,
      "startedAt": "2024-01-11T09:00:00Z"
    },
    {
      "id": "sys-003",
      "name": "Route Optimization",
      "description": "Intelligent route planning",
      "githubIssue": 124,
      "status": "specified",
      "dependencies": ["sys-002"],
      "priority": 2
    },
    {
      "id": "sys-004",
      "name": "Analytics Dashboard",
      "description": "Operational analytics and reporting",
      "githubIssue": null,
      "status": "discovered",
      "dependencies": ["sys-002"],
      "priority": 3
    }
  ]
}
```

### Queue Status Values

| Status | Meaning |
|--------|---------|
| `discovered` | Identified but not yet specified |
| `specified` | FeatureSpec complete, GitHub issue created |
| `ready` | Dependencies met, can start implementation |
| `in-progress` | Currently being built |
| `review` | Implementation complete, in PR review |
| `complete` | Merged and deployed |
| `blocked` | Cannot proceed (document reason) |

### Queue Operations

**Add system:**
```json
// Append to systems array
{
  "id": "sys-005",
  "name": "New System",
  "status": "discovered",
  "dependencies": ["sys-002"],
  "priority": 4
}
```

**Update status:**
```json
// Find by id, update status
"status": "in-progress",
"startedAt": "2024-01-16T09:00:00Z"
```

**Get next ready:**
```javascript
// Find first system where:
// - status === 'specified' or 'ready'
// - all dependencies have status === 'complete'
// - ordered by priority (lowest number first)
```

→ See `references/queue-operations.md`

## Step 8: Publish to GitHub

### Issue Creation

Use GitHub CLI or API:

```bash
# Create issue with FeatureSpec
gh issue create \
  --repo "org/repo" \
  --title "🎯 System: ServiceGrid Core" \
  --body-file FEATURESPEC.md \
  --label "domain:azure-standard" \
  --label "system:servicegrid" \
  --label "status:specified" \
  --label "priority:p1"
```

### Issue Body Template

```markdown
## 🎯 System: [Name]

**Domain:** [Domain name]
**Priority:** P[1-5]
**Dependencies:** #[issue numbers] or None
**Estimated Complexity:** [Small/Medium/Large/XL]

---

### Overview

[Brief 2-3 sentence description]

---

### FeatureSpec

<details>
<summary>Click to expand full specification</summary>

[Full 18-section FeatureSpec here]

</details>

---

### Acceptance Criteria

- [ ] [Criterion 1 from spec]
- [ ] [Criterion 2 from spec]
- [ ] [Criterion 3 from spec]
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Security audit passed
- [ ] Performance targets met

---

### Labels

- `domain:[name]` — Which domain this belongs to
- `system:[name]` — System identifier
- `status:specified` — Ready for implementation
- `priority:p[1-5]` — Build order priority
```

### Linking Dependencies

After creating issues, link them:

```bash
# Add dependency note to issue body
gh issue edit 124 --body "... **Dependencies:** #123 ..."

# Or use GitHub Projects for visual dependency tracking
```

→ See `references/github-issue-format.md`

## Outputs

Entry Portal produces:

| Output | Location | Purpose |
|--------|----------|---------|
| Dream State | `domain-memory/{domain}/dream-state.md` | Vision document |
| System Queue | `domain-memory/{domain}/system-queue.json` | Tracking state |
| FeatureSpecs | GitHub issues | Implementation specs |
| Dependency Graph | Documented in queue | Build order |

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `requirements` | Entry portal uses requirements patterns for clarification |
| `spec` | Entry portal invokes spec to generate FeatureSpecs |
| `engineering` (loop) | Entry portal produces inputs for the engineering loop |

## Key Principles

**Clarify before specifying.** Don't generate a spec from ambiguous input.

**Decompose thoughtfully.** Too many small systems = coordination overhead. Too few large systems = complexity and risk.

**Dependencies matter.** Build order is determined by dependencies, not preferences.

**One issue, one system.** Each GitHub issue represents exactly one deployable system.

**Queue is source of truth.** The JSON queue file tracks all state.

## Mode-Specific Behavior

Entry portal behavior differs by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Fuzzy requirements, vision statements |
| **Approach** | Full discovery with extensive clarification |
| **Patterns** | Free choice—establishing new patterns |
| **Deliverables** | Dream state + FeatureSpecs + system queue |
| **Validation** | Vision captured, systems decomposed |
| **Constraints** | Minimal—full creative freedom |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Existing codebase + gap analysis |
| **Approach** | Gap discovery—codebase defines scope |
| **Patterns** | Should match existing codebase patterns |
| **Deliverables** | Gap list + polish queue items |
| **Validation** | All gaps identified and categorized |
| **Constraints** | Must not alter existing functionality |

**Polish considerations:**
- Analyze codebase before defining work items
- Group gaps by category (deploy, UI, data, tests)
- Queue polish items, not full systems
- Prioritize by impact/effort ratio

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change request + pattern discovery |
| **Approach** | Surgical—single focused change |
| **Patterns** | Must conform exactly to existing |
| **Deliverables** | Minimal change spec only |
| **Validation** | Patterns identified, scope minimized |
| **Constraints** | Requires approval workflow |

**Enterprise constraints:**
- Match existing coding patterns exactly
- Respect existing architecture decisions
- Identify and follow approval workflows
- Plan for multi-team coordination

---

## References

- `references/clarifying-questions.md`: Question framework for requirements
- `references/dream-state-template.md`: Template for domain vision
- `references/system-decomposition.md`: Breaking down into systems
- `references/queue-operations.md`: Managing the system queue
- `references/github-issue-format.md`: Issue templates and labels
