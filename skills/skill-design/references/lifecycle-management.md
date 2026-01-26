# Lifecycle Management

How skills move through creation, active use, improvement, deprecation, and archival.

## Lifecycle Stages

```
CREATE --> ACTIVE --> IMPROVE --> DEPRECATE --> ARCHIVE
                       |              |
                       +-- (new ver) -+---> DEMOTE (to reference)
```

| Stage | Entry Condition | Exit Condition |
|-------|-----------------|----------------|
| **CREATE** | Need identified (extraction, request, gap) | Quality checklist passes |
| **ACTIVE** | Quality checklist passed | Improvement feedback accumulated |
| **IMPROVE** | Feedback captured via `capture_improvement` | New version published |
| **DEPRECATE** | Skill is redundant, outdated, or superseded | Decision: archive or demote |
| **DEMOTE** | Skill is too narrow for standalone status | Content moved to parent reference |
| **ARCHIVE** | Skill is no longer relevant to any workflow | Directory removed or moved |

## Versioning Rules (Semver)

### Patch (X.Y.Z -> X.Y.Z+1)

| Allowed | Examples |
|---------|----------|
| Typo fixes | Correcting spelling in a step |
| Clarifications | Rewording an ambiguous sentence |
| Formatting | Fixing a broken table |
| Minor additions | Adding one bullet to a checklist |

**Does NOT require:** MECE re-validation or quality re-review.

### Minor (X.Y.Z -> X.Y+1.0)

| Allowed | Examples |
|---------|----------|
| New sections | Adding a Common Pattern |
| Significant expansion | Doubling a step's depth |
| New reference files | Adding a 5th reference |
| New optional deliverables | Conditional output file |

**Requires:** Quality re-run on changed sections. MECE re-validation if tags or description changed.

### Major (X.Y.Z -> X+1.0.0)

| Allowed | Examples |
|---------|----------|
| Step restructuring | Reordering or merging steps |
| Scope change | Broadening or narrowing coverage |
| Breaking deliverable changes | Renaming or removing outputs |
| Phase reassignment | Moving from INIT to IMPLEMENT |

**Requires:** Full quality checklist. Full MECE re-validation. VERSION.json update.

## Improvement Capture

### Using capture_improvement

```
mcp__skills-library__capture_improvement({
  feedback: "Step 3 assumes context-ingestion has run but does not state this.",
  source: "my-project IMPLEMENT phase",
  category: "clarification",
  skill: "architect"
})
```

### Categories

| Category | When to Use | Typical Resolution |
|----------|-------------|-------------------|
| `bug` | Skill produces incorrect guidance | Patch fix |
| `enhancement` | Skill works but could be better | Minor improvement |
| `clarification` | Ambiguous or confusing content | Patch or minor |
| `new-feature` | Missing a needed capability | Minor or major |

### IMPROVEMENTS.md Entry Format

```markdown
### IMP-001: Architect Missing Prerequisite
- **Date:** 2026-01-25
- **Source:** my-project IMPLEMENT phase
- **Category:** clarification
- **Status:** pending
- **Skill:** architect
- **Feedback:** Step 3 assumes context-ingestion has run.
- **Action:** [To be determined / Applied in vX.Y.Z]
```

### Processing Workflow
1. Review pending improvements weekly (or when 5+ accumulate)
2. Group by skill and category
3. Determine version impact (patch, minor, major)
4. Apply changes, update frontmatter version
5. Mark improvement as `applied` with version reference

## When to Deprecate

| Condition | Example |
|-----------|---------|
| **Superseded** | New skill covers same scope more effectively |
| **Redundant** | Two skills evolved to cover the same ground |
| **Outdated** | Process is no longer relevant |
| **Never used** | No workflow references the skill after 3+ months |
| **Absorbed** | Broader skill now includes entire process |

### Deprecation Process
1. Add `deprecated: true` to YAML frontmatter
2. Add notice: `> **DEPRECATED:** Superseded by [replacement].`
3. Update loops/workflows that reference the skill
4. Keep as redirect for 30 days, then archive or demote

## When to Demote to Reference

| Condition | Example |
|-----------|---------|
| **Too narrow** | Sub-topic that belongs under a parent skill |
| **Under 200 lines** | Cannot meet depth requirements |
| **Single-pattern** | One pattern that fits as a reference |
| **Low standalone value** | Only useful in another skill's context |

### Demotion Process
1. Identify the parent skill to absorb content
2. Copy SKILL.md body to `parent/references/demoted-name.md`
3. Edit to reference format (80-150 lines, focused)
4. Add reference to parent's Reference Requirements and References
5. Delete the demoted skill directory
6. Update VERSION.json

## Archive Process
1. Verify no skill depends on this one
2. Verify no loop or workflow references it
3. Move directory to `skills/_archive/skill-name/`
4. Update VERSION.json
5. Log archival in IMPROVEMENTS.md with rationale

**Prefer archive over delete.** Disk space is cheap; institutional knowledge is not.
