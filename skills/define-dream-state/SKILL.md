---
name: define-dream-state
description: "Systematically define a dream state at any tier of the hierarchy"
phase: INIT
category: strategy
version: "1.0.0"
depends_on: []
tags: [dream-state, vision, planning, spec, definition, hierarchy]
---

# Define Dream State

Walk through a structured process to define what "done" looks like at any tier of the hierarchy.

## When to Use

- **New organization** — Defining the org-level vision and domain structure
- **New domain** — Defining a domain's purpose and constituent systems
- **New system** — Defining what the system does and its modules
- **New module** — Defining what the module provides and its functions
- **Refining existing** — Revisiting a dream state that's become stale or unclear

## Reference Requirements

| Reference | Purpose | When Needed |
|-----------|---------|-------------|
| [discovery-questions.md](references/discovery-questions.md) | Questions for each tier | Always |
| [templates/](../../commands/_shared/templates/) | Dream state templates | For file generation |

---

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| DREAM-STATE.md | Tier-appropriate location | Always |
| Parent update | Parent tier's dream state | When creating child tier |
| Decision record | Memory ADR | When significant choices made |

---

## Process

### Step 1: Determine Tier

```
What are we defining?
├── Organization → ~/workspaces/{org}/.claude/DREAM-STATE.md
├── Domain       → ~/workspaces/{org}/.claude/domains/{domain}/DREAM-STATE.md
├── System       → {project}/.claude/DREAM-STATE.md
└── Module       → {project}/src/{module}/DREAM-STATE.md
```

**Tier Detection Questions:**
- Is this a new organization (multiple domains/systems)?
- Is this a grouping of related systems (domain)?
- Is this a single repository/application (system)?
- Is this a concern within a system (module)?

### Step 2: Gather Context

Before defining, understand the environment:

**For Organization:**
- What is the purpose of this organization?
- What domains naturally emerge?
- What is the relationship between systems?

**For Domain:**
- What parent organization does this belong to?
- What capability does this domain provide?
- What systems compose this domain?

**For System:**
- What organization and domain does this belong to?
- What problem does this system solve?
- What are the major modules/concerns?

**For Module:**
- What system does this belong to?
- What responsibility does this module have?
- What functions must it provide?

### Step 3: Vision Discovery

Ask the defining question for the tier:

| Tier | Core Question |
|------|---------------|
| Organization | "What does success look like across all your work?" |
| Domain | "What capability does this domain provide when complete?" |
| System | "What problem is solved when this system is done?" |
| Module | "What is this module's single responsibility?" |

**Vision should be:**
- Concrete (not abstract platitudes)
- Measurable (you can tell when it's achieved)
- Inspiring (worth pursuing)
- Unique (different from siblings at same tier)

### Step 4: Decomposition

Break the vision into constituent parts:

| Tier | Decompose Into |
|------|----------------|
| Organization | Domains |
| Domain | Systems |
| System | Modules |
| Module | Functions |

**Decomposition Questions:**
- What are the natural groupings?
- What are the dependencies between parts?
- What is the critical path?
- What can be parallelized?

### Step 5: Completion Criteria

Define what "done" means:

**The Completion Algebra:**
```
Tier.done = ALL(Child.done)
```

**For each child, specify:**
- Name and purpose
- Status (pending/in-progress/complete)
- Required functions/capabilities
- Dependencies

### Step 6: Success Metrics

How will you measure progress?

| Metric Type | Example |
|-------------|---------|
| Completion % | "5/8 modules complete" |
| Capability | "Can process 1000 requests/sec" |
| Quality | "All tests passing, 80% coverage" |
| User value | "10 active users" |

### Step 7: Constraints & Anti-Goals

**Constraints:**
- Technology constraints (must use X)
- Business constraints (budget, timeline)
- Compliance constraints (security, privacy)

**Anti-Goals (explicitly out of scope):**
- What are we NOT trying to do?
- What would be scope creep?
- What should be a separate system/module?

### Step 8: Generate Dream State

Use the appropriate template:
- `DREAM-STATE-organization.md`
- `DREAM-STATE-domain.md`
- `DREAM-STATE-system.md`
- `DREAM-STATE-module.md`

**Write to the correct location based on tier.**

### Step 9: Update Parent

If creating a child tier, update the parent:

| Child Created | Update Parent |
|---------------|---------------|
| Domain | Add to organization's domain list |
| System | Add to domain's system list |
| Module | Add to system's module list |

### Step 10: Validate

Check the dream state:

- [ ] Vision is clear and measurable
- [ ] All children are listed
- [ ] Completion algebra is valid
- [ ] Constraints are documented
- [ ] Anti-goals are specified
- [ ] Parent tier is updated (if applicable)

---

## Discovery Questions by Tier

### Organization

1. What is the overarching purpose of this organization?
2. What domains naturally emerge from your work?
3. How do domains relate to each other?
4. What are organization-wide constraints?
5. What would make this organization "complete"?
6. What patterns should apply across all domains?

### Domain

1. What capability does this domain provide?
2. What systems compose this domain?
3. How do systems in this domain integrate?
4. What are domain-specific patterns?
5. What cross-system concerns exist?
6. When is this domain "done"?

### System

1. What problem does this system solve?
2. Who uses this system?
3. What are the major modules/concerns?
4. What are the key interfaces/APIs?
5. What are the quality requirements?
6. When is this system "done"?

### Module

1. What is this module's single responsibility?
2. What functions must it provide?
3. What are its inputs and outputs?
4. What does it depend on?
5. What depends on it?
6. When is this module "done"?

---

## Output

After running this skill:

1. **DREAM-STATE.md created** at the appropriate tier location
2. **Parent updated** with reference to new child (if applicable)
3. **ADR created** if significant decisions were made during definition

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Instead |
|--------------|----------------|---------|
| Vague vision | "Make it good" tells you nothing | Be specific and measurable |
| Too many children | 20 modules is unmanageable | Group into sub-modules or split system |
| No anti-goals | Scope creeps indefinitely | Explicitly exclude things |
| Orphaned tier | Dream state with no parent reference | Always link to parent |
| Perfect upfront | Spending weeks on dream state | Define enough to start, refine as you learn |

---

## Example Session

```
User: I want to define a dream state for orchestrator

Claude: Let me walk through the dream state definition process.

1. TIER DETECTION
   Orchestrator is a repository/application → System tier
   Location: ~/workspaces/orchestrator/.claude/DREAM-STATE.md

2. CONTEXT GATHERING
   - Organization: superorganism
   - Domain: {to be defined}
   - Problem: Managing skills, loops, and meta-learning

3. VISION DISCOVERY
   "What problem is solved when orchestrator is done?"
   → Self-improving meta-system where skills are the atomic primitive

4. DECOMPOSITION
   Modules: skill-registry, loop-composer, execution-engine,
            memory-service, learning-service, calibration-service,
            inbox-processor, run-archival, http-server, loop-commands

5. COMPLETION CRITERIA
   System.done = ALL(Module.done)
   Each module has defined functions that must be operational

6. SUCCESS METRICS
   - 54+ MCP tools operational
   - All 10 modules at 100%
   - Deep Context Protocol active

7. CONSTRAINTS
   - TypeScript codebase
   - MCP server architecture
   - Must integrate with Claude Code

8. ANTI-GOALS
   - Not a general-purpose automation platform
   - Not handling non-skill workflows

9. GENERATE
   → Write to ~/workspaces/orchestrator/.claude/DREAM-STATE.md

10. UPDATE PARENT
    → Add orchestrator to superorganism's system list
```

---

## Relationship to Other Skills

- **entry-portal:** Uses define-dream-state for initial system setup
- **observe:** References dream states defined by this skill
- **retrospective:** May trigger dream state refinement
- **docs-alignment:** Maintains dream state consistency
