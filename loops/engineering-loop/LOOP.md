# Engineering Loop

Complete engineering loop for building production-quality software.

## Overview

The engineering loop takes requirements through the full software development lifecycle:

1. **INIT** - Compile requirements into a comprehensive FeatureSpec
2. **SCAFFOLD** - Design architecture and set up project structure
3. **IMPLEMENT** - Build the features according to spec
4. **TEST** - Generate comprehensive test coverage
5. **VERIFY** - Verify code quality and correctness
6. **DOCUMENT** - Create documentation
7. **REVIEW** - Code review and refinement
8. **SHIP** - Deploy to production
9. **COMPLETE** - Handoff and retrospective

## Gates

| Gate | After Phase | Required | Deliverable |
|------|-------------|----------|-------------|
| Specification | INIT | Yes | FEATURESPEC.md |
| Architecture | SCAFFOLD | Yes | ARCHITECTURE.md |
| Code Review | REVIEW | Yes | CODE-REVIEW.md |
| Deployment | SHIP | No | - |

## When to Use

- New feature development
- Greenfield projects
- Major refactoring efforts
- Any work requiring full engineering rigor

## Mode Support

- **Greenfield**: Full loop, all phases required
- **Brownfield-Polish**: May skip SCAFFOLD, focus on IMPLEMENT → VERIFY
- **Brownfield-Enterprise**: Minimal changes, extensive review gates
