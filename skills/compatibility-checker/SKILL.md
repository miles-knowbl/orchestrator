---
name: compatibility-checker
description: "Verify API, schema, and interface compatibility between old and new versions during migrations. Tests backward compatibility, data format changes, and integration contracts."
phase: SCAFFOLD
category: core
version: "1.0.0"
depends_on: [migration-planner]
tags: [migration, compatibility, testing, contracts]
---

# Compatibility Checker

Verify that changes maintain compatibility where required and that breaking changes are explicitly documented with migration paths. Checks APIs, schemas, data formats, configuration files, and integration contracts between old and new versions.

## When to Use

- During a migration, after the migration plan is defined
- After any API changes (new endpoints, modified signatures, removed fields)
- When updating database schemas that have existing data
- After modifying interfaces consumed by external systems or other services
- Before releasing a new version that must maintain backward compatibility

## Process

1. **Catalog all public interfaces** - List every API endpoint, exported function, database schema, configuration format, event schema, and CLI interface that external consumers depend on. Include version information.
2. **Compare old vs new signatures** - For each interface, diff the old and new definitions. Check parameter types, return types, required vs optional fields, default values, and ordering.
3. **Check data format compatibility** - Verify that existing data (database rows, cached values, serialized objects, config files) can be read by the new version without transformation. Test with real production data samples where possible.
4. **Verify integration contracts** - For each external integration (upstream API, downstream consumer, third-party service), confirm the contract is still satisfied. Check request/response formats, authentication, rate limits, and error handling.
5. **Test backward compatibility** - Run old clients against new servers (and vice versa if relevant). Verify that existing workflows continue to function without modification.
6. **Document breaking changes with migration paths** - For every incompatibility found, document: what broke, who is affected, and the specific steps consumers must take to migrate. Provide code examples where helpful.

## Deliverables

| Deliverable | Format | Purpose |
|-------------|--------|---------|
| COMPATIBILITY-REPORT.md | Markdown | Full compatibility assessment |

### COMPATIBILITY-REPORT.md Contents

- **Interfaces Checked**: Complete list of interfaces evaluated
- **Compatible (Pass)**: Interfaces that maintain full backward compatibility
- **Breaking (Fail)**: Interfaces with incompatibilities, each including:
  - What changed
  - Who is affected (list consumers)
  - Migration path (step-by-step instructions for consumers)
  - Code examples (before and after)
- **Data Format Changes**: Compatibility of stored/serialized data with new code
- **Integration Contract Status**: Pass/fail for each external integration
- **Summary**: Overall compatibility verdict (safe to proceed / blocking issues)

## Quality Criteria

- 100% of public interfaces are checked (none skipped or overlooked)
- Every breaking change has a concrete migration path with code examples
- Data format compatibility is tested with representative production data, not just test fixtures
- Integration contracts are verified against actual contract definitions (not assumptions)
- Backward compatibility tests exercise real client scenarios, not just unit-level checks
- Report clearly distinguishes between intentional breaking changes (with migration paths) and unintentional regressions (bugs to fix)
