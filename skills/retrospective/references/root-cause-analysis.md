# Root Cause Analysis

Methods for identifying the true cause of problems.

---

## The 5 Whys Method

The simplest and most widely used technique. Ask "why" repeatedly until you reach a root cause that can be addressed.

### When to Use

- After a failure or partial success
- When a problem keeps recurring
- When surface-level fixes haven't worked
- To understand systemic issues

### How to Apply

1. **State the problem clearly**
   - Be specific
   - Use observable evidence
   - Avoid blame

2. **Ask "Why?" and answer**
   - Answer with facts, not assumptions
   - If unsure, investigate before continuing

3. **Repeat until root cause found**
   - Usually 5 iterations, but can be fewer or more
   - Stop when you reach something you can control/change
   - Stop when further "why" leads to organizational/philosophical issues

4. **Verify the root cause**
   - Does addressing it prevent the problem?
   - Is it actionable?

### Example

**Problem:** Architecture review was done late (in COMPLETE stage instead of SCAFFOLD)

1. **Why** was architecture review late?
   → It wasn't triggered during SCAFFOLD stage

2. **Why** wasn't it triggered?
   → loop-controller doesn't mandate architecture-review

3. **Why** doesn't loop-controller mandate it?
   → Architecture-review is marked optional in the skill

4. **Why** is it marked optional?
   → No clear criteria for when it's required vs optional

5. **Why** aren't there clear criteria?
   → **Skill was designed assuming human judgment would determine need**

**Root Cause:** Skills designed for human judgment don't work well in agentic execution where explicit criteria are needed.

**Remediation:** Add decision tree for when architecture-review is required.

---

## Common Root Cause Categories

### Process Issues
- Missing steps in workflow
- Steps in wrong order
- Unclear handoffs
- No verification gates

### Skill Gaps
- Missing skill for this need
- Skill incomplete or incorrect
- Skill assumes context that doesn't exist
- References not consulted

### Tool/Automation Issues
- Tool doesn't enforce process
- Automation has bugs
- Integration gaps
- Missing monitoring

### Data/Information Issues
- Required data not available
- Data in wrong format
- Stale or incorrect data
- No feedback loop

### Organizational Issues
- Incentives misaligned
- Communication gaps
- Resource constraints
- Unclear ownership

---

## Fishbone Diagram (Ishikawa)

For complex problems with multiple potential causes.

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
    Process ────────┤                                         │
                    │                                         │
    Skills ─────────┤                Problem                  │
                    │              Statement                  │
    Tools ──────────┤                                         │
                    │                                         │
    Data ───────────┤                                         │
                    │                                         │
    People ─────────┤                                         │
                    │                                         │
                    └─────────────────────────────────────────┘
```

### How to Use

1. State problem on the right
2. Draw main branches for categories
3. Brainstorm causes in each category
4. Identify most likely root causes
5. Verify with evidence

---

## Verification Checklist

Before accepting a root cause:

- [ ] Is it specific and concrete?
- [ ] Is it based on evidence, not assumption?
- [ ] Is it within our control to change?
- [ ] Does fixing it prevent the problem?
- [ ] Is it a cause, not a symptom?
- [ ] Have we gone deep enough?

---

## Anti-Patterns

### Stopping Too Early

❌ "We didn't do architecture review because we forgot"
✅ Dig deeper: Why did we forget? What system should have reminded us?

### Blaming People

❌ "Engineer didn't follow the process"
✅ Ask: Why didn't they follow it? Was it unclear? Hard to do? Not enforced?

### Accepting Vague Causes

❌ "Communication was poor"
✅ Be specific: What communication? Between whom? About what?

### Circular Reasoning

❌ "We didn't test because we didn't have time" → "We didn't have time because we didn't estimate testing"
✅ Break the loop: Why didn't we estimate testing? Is testing not in our standard process?

---

## When 5 Whys Isn't Enough

### Use These Instead

**For complex systems:** Fishbone diagram + 5 Whys on each branch
**For recurring problems:** Pattern analysis across multiple incidents
**For safety-critical:** Fault tree analysis
**For unknown causes:** Hypothesis testing

### Signs You Need Different Approach

- Multiple independent causes
- Causes interact in complex ways
- Root cause is outside your system
- Problem is emergent, not caused by single thing

---

## Documentation Template

```markdown
## Root Cause Analysis: [Problem]

**Date:** [Date]
**Analyst:** [Who]
**Problem:** [Clear statement]

### Evidence
- [Evidence 1]
- [Evidence 2]

### 5 Whys

1. Why [problem]?
   → [Cause 1]

2. Why [cause 1]?
   → [Cause 2]

3. Why [cause 2]?
   → [Cause 3]

4. Why [cause 3]?
   → [Cause 4]

5. Why [cause 4]?
   → **[ROOT CAUSE]**

### Verification
- [ ] Root cause is specific and concrete
- [ ] Based on evidence
- [ ] Within our control
- [ ] Fixing it prevents problem
- [ ] It's a cause, not symptom

### Remediation
[What will be done to address root cause]

### Follow-up
[How we'll verify the fix worked]
```

---

*Use root cause analysis for any non-trivial failure or gap.*
