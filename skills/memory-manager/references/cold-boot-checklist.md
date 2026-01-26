# Cold Boot Checklist

Step-by-step procedure for resuming work on a domain.

## Overview

Cold boot is the process of loading context when starting a new session. It ensures continuity and prevents lost work or duplicated effort.

## Full Cold Boot Procedure

### Phase 1: Domain Context

```markdown
## 1. Load Domain Context

### 1.1 Read Dream State
- [ ] Open `domain-memory/{domain}/dream-state.md`
- [ ] Understand the overall vision
- [ ] Note key capabilities and constraints
- [ ] Understand success metrics

**Quick check:** Can I explain the domain's purpose in one sentence?

### 1.2 Read Glossary
- [ ] Open `domain-memory/{domain}/glossary.md`
- [ ] Review business terms
- [ ] Review technical terms
- [ ] Note any abbreviations

**Quick check:** Do I understand domain-specific terminology?

### 1.3 Check System Queue
- [ ] Open `domain-memory/{domain}/system-queue.json`
- [ ] Identify current system (status: in-progress)
- [ ] Note dependencies and blockers
- [ ] Understand priority order

**Quick check:** Do I know which system to work on?
```

### Phase 2: System Context

```markdown
## 2. Load System Context

### 2.1 Read GitHub Issue
- [ ] Open issue #[number] for current system
- [ ] Read the overview and acceptance criteria
- [ ] Check comments for updates or discussions
- [ ] Note any linked PRs or related issues

**Quick check:** Do I know what this system should do?

### 2.2 Read FeatureSpec
- [ ] Expand FeatureSpec in issue (or open linked doc)
- [ ] Review all 18 sections
- [ ] Pay attention to:
  - Capabilities (what to build)
  - Validation criteria (how to verify)
  - Technical requirements (constraints)
  - Edge cases (what could go wrong)

**Quick check:** Do I know the detailed requirements?

### 2.3 Read Interface Contracts
- [ ] Check `domain-memory/{domain}/interfaces/api/`
- [ ] Check `domain-memory/{domain}/interfaces/events/`
- [ ] Identify APIs this system:
  - Exposes (we define)
  - Consumes (others define)

**Quick check:** Do I know the integration points?
```

### Phase 3: Session History

```markdown
## 3. Load Session History

### 3.1 Find Latest Handoff
- [ ] Open `domain-memory/{domain}/sessions/`
- [ ] Find most recent handoff for this system
- [ ] Read the complete handoff document

### 3.2 Understand Completed Work
- [ ] Review "Completed This Session" section
- [ ] Review commits listed
- [ ] Understand what's already done

### 3.3 Understand Current State
- [ ] Read "Current State" section
- [ ] Note code state (tests passing/failing)
- [ ] Note any uncommitted changes
- [ ] Note any stashed work

### 3.4 Understand Next Steps
- [ ] Read "Next Steps" section
- [ ] Understand immediate tasks
- [ ] Note any blockers or issues

### 3.5 Check Previous Sessions (if needed)
- [ ] Read 1-2 previous handoffs if context unclear
- [ ] Understand progression of work

**Quick check:** Do I know exactly where we left off?
```

### Phase 4: Decisions

```markdown
## 4. Load Decisions

### 4.1 Identify Relevant ADRs
- [ ] Check `domain-memory/{domain}/decisions/`
- [ ] Identify ADRs relevant to current system
- [ ] Typically relevant:
  - Technology stack decisions
  - Architectural patterns
  - Security approaches
  - Integration decisions

### 4.2 Read Relevant ADRs
- [ ] Read each relevant ADR
- [ ] Understand the decision and rationale
- [ ] Note any constraints this imposes

**Quick check:** Do I know the architectural constraints?
```

### Phase 5: Code State

```markdown
## 5. Verify Code State

### 5.1 Navigate to Worktree
```bash
cd /path/to/repo/.worktrees/{system-name}
pwd  # Verify location
```

### 5.2 Check Git Status
```bash
git status
git branch --show-current  # Verify branch
git log --oneline -5       # Verify recent commits
```

### 5.3 Check for Uncommitted Work
```bash
git diff                   # Modified files
git diff --staged          # Staged files
git stash list             # Stashed changes
```

### 5.4 Verify Build/Tests
```bash
npm install                # Or equivalent
npm run build              # Verify build
npm test                   # Verify tests
npm run lint               # Verify lint
```

### 5.5 Reconcile with Handoff
- [ ] Code state matches handoff description
- [ ] Any discrepancies investigated and understood

**Quick check:** Is the code in the expected state?
```

### Phase 6: Confirm Understanding

```markdown
## 6. Confirm Understanding

### 6.1 Self-Check
Answer these questions:

1. **What domain am I working in?**
   [Answer]

2. **What system am I building?**
   [Answer]

3. **What was completed last session?**
   [Answer]

4. **What is the immediate next task?**
   [Answer]

5. **What are the current blockers?**
   [Answer]

6. **What architectural constraints apply?**
   [Answer]

### 6.2 Summarize Context (Optional)
If working with human, summarize understanding:

"I'm working on [system] for [domain]. Last session completed [X, Y, Z].
The immediate next step is [task]. Current blockers are [blockers].
Tests are [passing/failing]. Ready to continue with [specific action]."

**Quick check:** Could I explain the context to someone else?
```

## Quick Cold Boot

For shorter sessions or familiar context:

```markdown
## Quick Cold Boot Checklist

- [ ] Read last session handoff
- [ ] Check system-queue.json for current system
- [ ] Navigate to worktree
- [ ] Run `git status` and `npm test`
- [ ] Confirm next steps from handoff
- [ ] Begin work
```

## Cold Boot by Scenario

### Scenario: Continuing Yesterday's Work

```markdown
1. Read yesterday's handoff
2. Go to worktree
3. Check git status
4. Run tests
5. Continue from "Next Steps"
```

### Scenario: New System (First Session)

```markdown
1. Read dream-state.md
2. Read glossary.md
3. Read system-queue.json
4. Read GitHub issue with FeatureSpec
5. Read relevant ADRs
6. Create worktree
7. Begin scaffold
```

### Scenario: Picking Up After Another Agent

```markdown
1. Read ALL handoffs for this system
2. Read GitHub issue comments
3. Check PR if one exists
4. Go to worktree
5. Review ALL uncommitted changes
6. Run full test suite
7. Reconcile any confusion before proceeding
```

### Scenario: Resuming After Long Break

```markdown
1. Full cold boot (all phases)
2. Read last 3-5 handoffs
3. Check for any GitHub activity
4. Check if dependencies changed
5. Update dependencies
6. Run full test suite
7. Consider reviewing recent commits in detail
```

## Troubleshooting

### Handoff Missing or Incomplete

```markdown
Options:
1. Check git log for commits since last known state
2. Check GitHub issue comments
3. Review code changes to infer progress
4. Ask human engineer for context
5. Document gaps and proceed carefully
```

### Code State Doesn't Match Handoff

```markdown
Options:
1. Check for uncommitted changes
2. Check git stash
3. Check other branches
4. Compare commit hashes
5. May need to investigate with git reflog
```

### Tests Failing Unexpectedly

```markdown
Options:
1. Check if handoff mentioned failing tests
2. Check if dependencies changed
3. Check if environment differs
4. Run tests in isolation
5. May be regression - investigate before continuing
```

### Can't Find Worktree

```markdown
Commands:
git worktree list  # Find all worktrees
git branch -a      # Find all branches

Recovery:
git worktree add .worktrees/{name} {branch-name}
```

## Cold Boot Timing

| Scenario | Expected Time |
|----------|---------------|
| Quick boot (familiar context) | 5-10 min |
| Standard boot | 15-20 min |
| Full boot (new system) | 30-45 min |
| Boot after long break | 45-60 min |

Invest the time upfront - it saves debugging later.
