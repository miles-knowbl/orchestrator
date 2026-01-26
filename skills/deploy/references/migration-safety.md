# Migration Safety Reference

Database migrations are the highest-risk part of most deployments. This reference covers patterns for safe, zero-downtime schema changes and data migrations.

## Migration Safety Checklist

| Check | Notes |
|-------|-------|
| Migration tested locally | `npm run migrate` on fresh + existing DB |
| Migration tested on staging | Applied against staging with production-like data |
| Backward-compatible with current code | Current code works with new schema |
| Forward-compatible with new code | New code works with old schema (during rollout) |
| Rollback migration written and tested | Down migration verified |
| Large table impact assessed | Tables >1M rows need special handling |
| Lock duration estimated | No long-held exclusive locks |
| Backup taken | Point-in-time recovery available |
| Monitoring dashboards open | DB connections, query latency, error rates |

## Zero-Downtime Migration Patterns

### Pattern 1: Expand and Contract

Never remove or rename in a single step. Use a multi-phase approach.

**Phase 1 - Expand:** Add new column, backfill from old, add sync trigger
```sql
ALTER TABLE users ADD COLUMN email_address VARCHAR(255);
UPDATE users SET email_address = email WHERE email_address IS NULL;
```

**Phase 2 - Migrate Code:** Update application to read/write new column

**Phase 3 - Contract:** Remove old column and trigger after all services updated
```sql
ALTER TABLE users DROP COLUMN email;
```

### Pattern 2: Add Column with Default

```sql
-- PostgreSQL 11+: instant, no table rewrite
ALTER TABLE orders ADD COLUMN status VARCHAR(20) DEFAULT 'pending' NOT NULL;

-- Large tables: add nullable, backfill in batches, then add constraint
ALTER TABLE orders ADD COLUMN status VARCHAR(20);
UPDATE orders SET status = 'pending' WHERE status IS NULL AND id BETWEEN 1 AND 10000;
```

### Pattern 3: Create New Table, Migrate Data

For major structural changes: create new table, dual-write, backfill historical data, switch reads, stop old writes, drop old table after verification.

## Dangerous Operations

| Operation | Risk | Safe Alternative |
|-----------|------|------------------|
| `DROP COLUMN` | Breaks running code | Expand-contract pattern |
| `RENAME COLUMN` | Breaks running code | Add new column, migrate, drop old |
| `ALTER COLUMN TYPE` | Table lock, possible rewrite | Add new column with new type |
| `ADD NOT NULL` without default | Fails on existing rows | Add with default, then add constraint |
| `DROP TABLE` | Data loss | Rename first, drop after verification |
| `CREATE INDEX` | Locks table (non-concurrent) | `CREATE INDEX CONCURRENTLY` |

## Batch Migration for Large Tables

Never update millions of rows in a single transaction.

```sql
DO $$
DECLARE
  batch_size INT := 5000;
  affected INT;
BEGIN
  LOOP
    UPDATE orders SET status = 'active'
    WHERE status IS NULL
      AND id IN (SELECT id FROM orders WHERE status IS NULL LIMIT batch_size FOR UPDATE SKIP LOCKED);
    GET DIAGNOSTICS affected = ROW_COUNT;
    EXIT WHEN affected = 0;
    PERFORM pg_sleep(0.1);
    COMMIT;
  END LOOP;
END $$;
```

## Rollback Strategies

| Scenario | Action | Estimated Time |
|----------|--------|----------------|
| New column causing issues | `ALTER TABLE DROP COLUMN` | Seconds |
| Bad index causing slow queries | `DROP INDEX CONCURRENTLY` | Seconds |
| Data corruption from migration | Restore from point-in-time backup | 15-60 minutes |
| New table not working | Drop table, redeploy old code | Minutes |
| Column rename broke queries | Deploy code fix (old name still exists) | Minutes |

## Testing Migrations

```bash
# Local: reset and test from scratch
npm run db:reset && npm run db:migrate

# Staging: test on production-like data
pg_dump production_db | psql test_db
npm run db:migrate

# Dry run: preview changes without committing
BEGIN;
-- Run migration SQL
SELECT COUNT(*) FROM affected_table;
ROLLBACK;
```

## Migration Monitoring

| Metric | Warning | Critical |
|--------|---------|----------|
| Active DB connections | >80% pool | >95% pool |
| Query latency (p99) | >2x baseline | >5x baseline |
| Lock wait time | >5 seconds | >30 seconds |
| Error rate | >0.1% | >1% |
| Replication lag | >10 seconds | >60 seconds |

## Emergency Procedures

1. **Assess** (30 seconds): Is the issue from schema or code change?
2. **Code issue**: Rollback application only (fast)
3. **Schema issue**: Apply pre-tested rollback migration
4. **Data corruption**: Stop writes, restore from backup, notify stakeholders
5. **Document**: Update migration testing process with lessons learned
