---
name: root-cause-analysis
description: "Systematic root cause identification using 5-whys, git bisect, hypothesis testing, and fault tree analysis. Traces symptoms to their origin."
phase: SCAFFOLD
category: engineering
version: "1.0.0"
depends_on: [bug-reproducer]
tags: [debugging, analysis, root-cause, diagnosis]
---

# Root Cause Analysis

Systematically identify the root cause of a defect using structured analysis techniques. Move beyond symptoms to find the underlying flaw in code, process, or architecture that allowed the bug to exist.

## When to Use

- After a bug has been reliably reproduced (bug-reproducer output available)
- When the cause of a failure is not immediately obvious from the symptoms
- For intermittent failures that resist simple debugging
- When identifying whether a bug is a regression (was it working before?)
- When multiple symptoms might share a single root cause

## Process

1. **Review the reproduction** - Read the BUG-REPRODUCTION.md. Understand the symptoms, environment, and related code paths identified.
2. **Form hypotheses** - Generate at least 3 candidate explanations for the observed behavior. Rank them by likelihood based on the evidence available.
3. **Apply 5-whys analysis** - For each plausible hypothesis, ask "why?" iteratively until you reach a root cause that, if fixed, would prevent the symptom from recurring. Stop when you hit a cause that is within the team's control to change.
4. **Use git bisect if regression** - If the bug worked before, use `git bisect` (or manual equivalent) to identify the exact commit that introduced the regression. Document the commit hash and its changes.
5. **Test hypotheses with targeted experiments** - For each hypothesis, design a small experiment (add logging, change a parameter, comment out a code path) that would confirm or refute it. Execute and record results.
6. **Identify the root cause** - Based on evidence from experiments and analysis, select the root cause. Ensure it explains ALL observed symptoms, not just some of them.
7. **Determine fix approach** - Propose how to fix the root cause. Identify whether the fix is a code change, configuration change, architecture change, or process change. Note any risks the fix introduces.

## Deliverables

| Deliverable | Format | Purpose |
|-------------|--------|---------|
| ROOT-CAUSE.md | Markdown | Complete analysis with findings and recommendations |

### ROOT-CAUSE.md Contents

- **Symptom Summary**: Brief restatement of what was observed
- **Hypotheses Tested**: Each hypothesis, the experiment performed, and the result (confirmed/refuted)
- **5-Whys Chain**: The chain of "why?" questions leading from symptom to root cause
- **Root Cause Identified**: Clear statement of the root cause
- **Bisect Result**: If regression, the commit that introduced it
- **Contributing Factors**: Secondary factors that made the bug possible or harder to detect
- **Fix Recommendations**: Proposed fix with approach, risks, and estimated effort
- **Prevention Measures**: What could prevent this class of bug in the future (tests, linting rules, architectural guardrails)

## Quality Criteria

- Root cause explains ALL observed symptoms, not a subset
- At least 3 hypotheses were considered (avoids confirmation bias)
- Each hypothesis was tested with evidence, not just reasoned about
- 5-whys chain reaches a cause within the team's control
- Fix recommendation addresses the root cause, not just the symptom
- Prevention measures address the systemic issue (not one-off patches)
- If a regression, the exact introducing commit is identified
