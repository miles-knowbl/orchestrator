---
name: rollback-validator
description: "Validate that rollback paths work correctly during migrations. Tests downgrade procedures, data reversibility, and state recovery to ensure safe retreat from failed migrations."
phase: VALIDATE
category: engineering
version: "1.0.0"
depends_on: [migration-planner, compatibility-checker]
tags: [migration, rollback, safety, validation]
---

# Rollback Validator

Validate that every rollback path defined in the migration plan actually works. Test downgrade procedures, verify data reversibility, measure rollback time, and confirm that the system returns to a fully functional pre-migration state. This is the safety net that must be proven before any migration reaches production.

## When to Use

- Before deploying any migration phase to production
- After the compatibility checker has run and breaking changes are cataloged
- Before a production cutover or feature flag flip
- When the migration plan includes data transformations that must be reversible
- As a gate check: no migration proceeds without validated rollback

## Process

1. **Identify rollback triggers** - Define the specific conditions that would require a rollback: error rate threshold, latency spike, data corruption signal, failed health checks, or manual decision criteria. These must be measurable and unambiguous.
2. **Test data reversibility** - Apply the forward migration to a copy of production data, then apply the rollback. Compare the result to the original. Verify no data loss, no corruption, and no orphaned records. Pay special attention to auto-incremented IDs, timestamps, and generated values.
3. **Verify schema downgrade** - Run the schema downgrade scripts against a migrated database. Confirm the schema matches the pre-migration state exactly. Test that the old application code runs correctly against the downgraded schema.
4. **Test service rollback procedure** - Execute the full rollback procedure as documented: redeploy old version, revert configuration, re-enable old feature flags, restore old routes. Verify the procedure is complete (no missing steps).
5. **Measure rollback time** - Time the full rollback procedure end-to-end. Compare against the SLA or acceptable downtime window. If rollback takes too long, identify optimizations or consider a different migration strategy.
6. **Verify no data loss on rollback** - After rollback, run data integrity checks. Compare record counts, checksums, and critical business data against pre-migration baselines. Any discrepancy is a blocking issue.

## Deliverables

| Deliverable | Format | Purpose |
|-------------|--------|---------|
| ROLLBACK-REPORT.md | Markdown | Rollback validation results |

### ROLLBACK-REPORT.md Contents

- **Rollback Triggers**: The conditions that would activate a rollback, with thresholds
- **Data Reversibility Results**: Before/after comparison, record counts, checksums
- **Schema Downgrade Results**: Schema diff confirming match to pre-migration state
- **Service Rollback Results**: Step-by-step execution log with pass/fail per step
- **Rollback Time**: Measured duration vs SLA target
- **Data Integrity Verification**: Record counts, checksums, spot-check results
- **Verdict**: Ready to proceed / blocking issues found
- **Blocking Issues**: Any failures that must be resolved before migration proceeds

## Quality Criteria

- Rollback is tested end-to-end, not just individual steps in isolation
- Data loss is confirmed zero: record counts and checksums match pre-migration baselines
- Rollback time is measured and within the acceptable window (documented SLA)
- Schema downgrade produces an exact match to the pre-migration schema
- Old application code runs correctly against the rolled-back state
- Rollback triggers are specific and measurable (no vague criteria like "if things look bad")
- All blocking issues are resolved before the migration proceeds to production
