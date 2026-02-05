---
name: migration-planner
description: "Plan technology migrations with dependency mapping, risk assessment, rollback strategy, and phased execution timeline. Handles framework upgrades, database changes, and architecture shifts."
phase: INIT
category: engineering
version: "1.0.0"
depends_on: []
tags: [migration, planning, upgrade, strategy]
---

# Migration Planner

Plan technology migrations end-to-end: from current state assessment through phased execution to rollback contingency. Handles framework upgrades, database schema changes, API versioning, dependency updates, and architecture shifts.

## When to Use

- Upgrading a framework or runtime to a new major version
- Migrating database schemas with production data
- Introducing API versioning or deprecating old API versions
- Shifting architecture (monolith to services, REST to GraphQL, etc.)
- Updating dependencies with breaking changes across the codebase
- Moving between infrastructure platforms or providers

## Process

1. **Map current state** - Document the current technology stack: frameworks, runtime versions, database schemas, external integrations, and deployment topology. Identify all consumers of the thing being migrated.
2. **Define target state** - Describe the desired end state precisely. Include versions, schemas, interfaces, and configurations. Define what "done" looks like.
3. **Identify breaking changes** - Compare current to target. Catalog every incompatibility: API signature changes, removed features, behavior changes, schema differences, configuration format changes.
4. **Map the dependency graph** - Identify which components depend on the thing being migrated. Determine the order in which things must change. Flag circular dependencies.
5. **Design migration phases** - Break the migration into discrete, independently deployable phases. Each phase should be small enough to reason about and should leave the system in a working state. Define the sequence and estimated duration.
6. **Define rollback strategy per phase** - For each phase, document how to undo it. Include data migration reversibility, schema downgrade scripts, and service rollback procedures. Estimate rollback time.
7. **Estimate risk per phase** - Rate each phase by likelihood of failure and impact of failure. Identify the highest-risk phase and plan extra mitigation for it.

## Deliverables

| Deliverable | Format | Purpose |
|-------------|--------|---------|
| MIGRATION-PLAN.md | Markdown | Complete migration plan with all sections below |

### MIGRATION-PLAN.md Contents

- **Current State**: Technologies, versions, schemas, integrations in use today
- **Target State**: The desired end state with specific versions and configurations
- **Breaking Changes**: Every incompatibility cataloged with severity
- **Dependency Map**: Which components are affected and in what order
- **Phased Plan**: Ordered phases with scope, duration estimate, and success criteria per phase
- **Rollback Strategy**: How to undo each phase, including data reversibility
- **Risk Matrix**: Likelihood x impact for each phase, with mitigation plans for high-risk items
- **Success Criteria**: How to verify the migration is complete and correct

## Quality Criteria

- Every breaking change between current and target state is documented
- A rollback path is defined for each migration phase
- No orphaned dependencies (nothing left pointing at removed interfaces)
- Each phase leaves the system in a functional state (no "big bang" switchover)
- Dependency order is correct (no phase depends on a later phase)
- Risk matrix covers all phases, with specific mitigation for high-risk items
- Timeline includes buffer for unexpected issues (at least 20% contingency)
