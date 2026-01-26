# Handoff Template

Complete template for session handoff documents.

## Template

```markdown
# Session Handoff: [YYYY-MM-DD] - [System/Task Name]

## Session Metadata

| Property | Value |
|----------|-------|
| **Date** | YYYY-MM-DD |
| **Time** | HH:MM - HH:MM (timezone) |
| **Duration** | X hours |
| **Domain** | [domain-name] |
| **System** | [system-name] (sys-XXX) |
| **GitHub Issue** | #[number] |
| **Agent/Engineer** | [identifier] |
| **Branch** | feature/[name] |
| **Worktree** | .worktrees/[name] |
| **Last Commit** | [short-hash] - [message] |

---

## Executive Summary

[2-3 sentences: What was this session about? What's the current state?]

---

## Completed This Session

### Tasks Completed
- [x] [Task 1 - brief description]
- [x] [Task 2 - brief description]
- [x] [Task 3 - brief description]

### Commits Made

| Commit | Type | Description |
|--------|------|-------------|
| `abc1234` | feat | [What it implemented] |
| `def5678` | test | [What tests were added] |
| `ghi9012` | fix | [What was fixed] |

### Tests Added/Updated
- [test file 1]: [what it tests]
- [test file 2]: [what it tests]

### Documentation Updated
- [doc 1]: [what changed]
- [doc 2]: [what changed]

---

## Current State

### Active Work Item
**Currently working on:** [Specific task or feature]

**Progress:** [X]% complete

**State:** [Description of where things left off]

### Code State

| Check | Status | Notes |
|-------|--------|-------|
| Build | ✅ Pass / ❌ Fail | [details if failing] |
| Lint | ✅ Pass / ❌ Fail | [details if failing] |
| Types | ✅ Pass / ❌ Fail | [details if failing] |
| Unit Tests | ✅ Pass / ❌ Fail | [X/Y passing, details if failing] |
| Integration Tests | ✅ Pass / ❌ Fail | [details if failing] |

### Uncommitted Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/file1.ts` | Modified | [What was changed] |
| `src/file2.ts` | Added | [What it contains] |

**Stashed changes:** [Yes/No - if yes, describe]

---

## Decisions Made

### This Session

| Decision | Choice | Rationale |
|----------|--------|-----------|
| [Decision 1] | [What was chosen] | [Why] |
| [Decision 2] | [What was chosen] | [Why] |

### ADRs Created/Updated
- ADR-[NNN]: [Title] - [New/Updated]

---

## Blockers & Issues

### Current Blockers

| Blocker | Impact | Needed Resolution |
|---------|--------|-------------------|
| [Blocker 1] | [What it blocks] | [Who/what needed] |
| [Blocker 2] | [What it blocks] | [Who/what needed] |

### Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| [Issue 1] | Low/Med/High | [Investigating/Workaround/Deferred] |
| [Issue 2] | Low/Med/High | [Status] |

### Technical Debt Identified
- [Debt item 1] - [Impact]
- [Debt item 2] - [Impact]

---

## Next Steps

### Immediate (Start of Next Session)

1. **[First task]**
   - [Specific action to take]
   - [Expected outcome]

2. **[Second task]**
   - [Specific action to take]
   - [Expected outcome]

3. **[Third task]**
   - [Specific action to take]
   - [Expected outcome]

### Remaining for This System

- [ ] [Remaining task 1]
- [ ] [Remaining task 2]
- [ ] [Remaining task 3]

### Estimated Remaining Effort
[X hours/days] to complete current system

---

## Open Questions

| Question | Context | Who Can Answer |
|----------|---------|----------------|
| [Question 1] | [Why it matters] | [Person/Team] |
| [Question 2] | [Why it matters] | [Person/Team] |

---

## Dependencies & Integration

### Waiting On
- [Dependency 1]: [Status/ETA]
- [Dependency 2]: [Status/ETA]

### Interface Changes Made
- [API/Event change]: [Description]

### Coordination Needed
- [Team/Person]: [What's needed]

---

## Artifacts & References

### Files to Review (Next Session)
| File | Reason |
|------|--------|
| `src/[path]` | [Why to review] |
| `tests/[path]` | [Why to review] |

### Documentation
- FeatureSpec: [link to issue]
- API Docs: [link]
- Architecture: [link]

### External References
- [Reference 1]: [link]
- [Reference 2]: [link]

---

## Environment & Setup

### Commands to Run First
```bash
# Navigate to worktree
cd /path/to/repo/.worktrees/[system-name]

# Verify state
git status
git log --oneline -5

# Run checks
npm test
npm run lint
```

### Environment Variables Needed
```bash
export VAR_NAME=value
```

### Services Required
- [Service 1]: [How to start]
- [Service 2]: [How to start]

---

## Session Log Highlights

### Key Discoveries
- [Discovery 1]: [Implication]
- [Discovery 2]: [Implication]

### Approaches Tried & Abandoned
| Approach | Why Abandoned |
|----------|---------------|
| [Approach 1] | [Reason] |
| [Approach 2] | [Reason] |

### Performance Notes
- [Any performance observations]

---

## Handoff Notes

### For Human Engineers
[Any specific context a human would need]

### For AI Agents
[Any specific context an AI agent would need]

### Warnings
- ⚠️ [Warning 1]
- ⚠️ [Warning 2]

---

*Handoff created: [timestamp]*
*Previous handoff: [link to previous session file]*
```

## Minimal Handoff Template

For quick handoffs when time is limited:

```markdown
# Quick Handoff: [Date] - [System]

**Branch:** feature/[name]
**Last Commit:** [hash] - [message]
**Tests:** ✅ All passing / ❌ [X] failing

## Done
- [x] [Item 1]
- [x] [Item 2]

## In Progress
[What was being worked on]

## Next
1. [Immediate next step]
2. [Following step]

## Blockers
- [Any blockers]

## Notes
[Anything critical to know]
```

## Handoff Best Practices

### Do
- Write handoff BEFORE ending session
- Be specific about next steps
- Include commands to run
- Note anything surprising or non-obvious
- Reference files by path

### Don't
- Leave handoff until memory is fuzzy
- Use vague descriptions ("fix the thing")
- Assume context will be remembered
- Skip the verification steps
- Forget uncommitted changes

### Timing
- Start handoff 15-30 min before session end
- Leave time to verify completeness
- Commit handoff file to repo if appropriate

## File Naming Convention

```
sessions/
├── 2024-01-15-auth-service-initial.md
├── 2024-01-16-auth-service-complete.md
├── 2024-01-17-order-service-part1.md
├── 2024-01-18-order-service-part2.md
└── 2024-01-19-order-service-complete.md
```

Format: `YYYY-MM-DD-{system-name}-{descriptor}.md`

Descriptors:
- `initial` - First session on system
- `part1`, `part2`, etc. - Multi-session work
- `complete` - Final session for system
- `hotfix` - Urgent fix session
- `review` - Review/refactor session
