---
name: bug-reproducer
description: "Create minimal, reliable reproduction of reported bugs from issues, logs, and user reports. Produces step-by-step reproduction cases with expected vs actual behavior."
phase: INIT
category: core
version: "1.0.0"
depends_on: []
tags: [debugging, reproduction, bugs, triage]
---

# Bug Reproducer

Create minimal, reliable reproduction cases from bug reports, failing tests, user-reported issues, and production error logs. The goal is to distill a noisy bug report into a precise, repeatable set of steps that any engineer can follow to observe the defect.

## When to Use

- A user or QA submits a bug report with incomplete reproduction steps
- A test is failing intermittently and the cause is unclear
- Production logs show errors that need local reproduction
- A reported issue needs verification before prioritization
- You need to confirm a bug still exists before investing in a fix

## Process

1. **Read the bug report or issue** - Gather all available information: user description, screenshots, error messages, stack traces, logs, and environment details.
2. **Identify symptoms and environment** - Catalog the observable symptoms (error messages, incorrect behavior, crashes) and the environment where they occur (OS, browser, runtime version, configuration).
3. **Create minimal reproduction steps** - Strip away everything unnecessary. Find the shortest path from a clean state to observing the bug. Each step should be a concrete, unambiguous action.
4. **Verify reproduction is reliable** - Run the reproduction steps at least 3 times. If the bug is intermittent, document the success rate (e.g., "reproduces 2 out of 5 attempts") and any timing or ordering sensitivities.
5. **Document expected vs actual behavior** - State clearly what should happen at each critical step and what actually happens instead. Include exact error messages, return values, or visual artifacts.
6. **Identify related code paths** - Trace the reproduction steps to the relevant source files, functions, and lines. This primes the next phase (root cause analysis) with starting points.

## Deliverables

| Deliverable | Format | Purpose |
|-------------|--------|---------|
| BUG-REPRODUCTION.md | Markdown | Complete reproduction case with all details below |

### BUG-REPRODUCTION.md Contents

- **Summary**: One-sentence description of the defect
- **Environment**: OS, runtime, versions, configuration, dependencies
- **Steps to Reproduce**: Numbered, concrete steps from clean state to bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens (with error output)
- **Error Output**: Full stack traces, logs, or screenshots
- **Related Code Paths**: Source files, functions, and lines involved
- **Frequency/Reliability**: How often the bug reproduces (e.g., 3/3, 2/5)
- **Workarounds**: Any known workarounds, if applicable

## Quality Criteria

- Reproduction is reliable: reproduces at least 3 out of 3 attempts (or intermittent rate is documented)
- Reproduction is minimal: uses the fewest steps possible to trigger the bug
- Environment details are specific: exact versions, not ranges or "latest"
- Steps are unambiguous: another engineer can follow them without clarification
- Expected vs actual behavior is clearly separated
- Error output is complete (not truncated)
- Related code paths are identified (at least one file/function)
