# Pruning Rules

> When and how to remove or archive documentation.

## Pruning vs. Archiving

| Action | Outcome | Reversibility | When to Use |
|--------|---------|---------------|-------------|
| **Prune** | Delete permanently | Git history only | Duplicates, abandoned drafts |
| **Archive** | Move to archive location | Easily reversible | Completed work, superseded docs |

## Never Prune

These documents should NEVER be deleted:

| Category | Reason |
|----------|--------|
| `CLAUDE.md` (any tier) | Instructions are configuration |
| `DREAM-STATE.md` (any tier) | Vision documents are living |
| `ADR-*.md` | Architectural decisions are historical record |
| `patterns.json` | Learned patterns have value |
| Run archives | Historical execution data |
| Memory decisions | ADRs and decisions |

**Exception:** May prune if truly duplicated (exact copy exists elsewhere).

## Prune Candidates

### 1. Abandoned Drafts

**Criteria:**
- Document has `state: draft` or no content
- Older than 14 days
- Not referenced by any active document
- Not associated with an active loop

**Action:** Delete after confirmation.

### 2. Duplicates

**Criteria:**
- Content is 90%+ identical to another document
- Both documents have same purpose
- One is clearly the "canonical" version

**Action:**
1. Merge any unique content to canonical version
2. Update references to point to canonical
3. Delete duplicate

### 3. Superseded Specs

**Criteria:**
- Feature has shipped
- Spec content is captured in run archive
- No ongoing reference need

**Action:** Archive to `docs/specs/archived/` or delete if in run archive.

### 4. Stale Audits

**Criteria:**
- Audit is for a completed loop
- Results captured in run archive
- Older than 90 days

**Action:** Archive to `docs/audits/archived/` with date prefix.

### 5. Placeholder Documents

**Criteria:**
- Contains only "TODO" or placeholder text
- Created > 7 days ago
- No actual content added

**Action:** Delete.

## Prune Decision Tree

```
Is this a protected document type?
  └─ YES → DO NOT PRUNE
  └─ NO ↓

Is this an exact duplicate?
  └─ YES → Merge unique content, then PRUNE duplicate
  └─ NO ↓

Is this a draft older than 14 days with no content?
  └─ YES → PRUNE (abandoned)
  └─ NO ↓

Is this content captured elsewhere (run archive)?
  └─ YES → ARCHIVE (not prune)
  └─ NO ↓

Does any document reference this?
  └─ YES → Update references first, then decide
  └─ NO ↓

Is this actively used?
  └─ YES → DO NOT PRUNE
  └─ NO → Consider ARCHIVE or PRUNE based on age
```

## Archive Rules

### When to Archive

| Document Type | Archive Trigger | Archive Location |
|---------------|-----------------|------------------|
| Loop deliverables | Loop completes | Run archive JSON |
| Feature specs | Feature ships | `docs/specs/archived/` |
| Audits | Loop completes | `docs/audits/archived/` |
| Old Dream State | Major vision change | Append `.bak` with date |

### Archive Naming Convention

```
{original-name}-{date}.{ext}

Examples:
- FEATURESPEC-2025-01-15.md
- SECURITY-AUDIT-2025-01-29.md
- ARCHITECTURE-v1-2025-01-01.md
```

### Archive Location Hierarchy

```
{repo}/.claude/docs/
├── specs/
│   ├── FEATURESPEC.md          ← Active
│   └── archived/
│       └── FEATURESPEC-2025-01.md
├── audits/
│   ├── SECURITY-AUDIT.md       ← Active
│   └── archived/
│       └── SECURITY-AUDIT-2025-01.md
└── reviews/
    └── archived/
        └── CODE-REVIEW-2025-01.md
```

## Pruning Process

### 1. Identify Candidates

```bash
# Find old drafts
find {repo}/.claude -name "*.md" -mtime +14 -exec grep -l "TODO\|DRAFT" {} \;

# Find potential duplicates (by size similarity)
# Manual review required

# Find unreferenced documents
# Cross-reference with index and grep for links
```

### 2. Verify Safety

Before pruning, check:

```markdown
## Prune Safety Checklist

- [ ] Not a protected document type
- [ ] Not referenced by any active document
- [ ] Not associated with an active loop
- [ ] Content is captured elsewhere (if valuable)
- [ ] No unique information that would be lost
```

### 3. Execute Prune

```bash
# For archival
mv {source} {repo}/.claude/docs/{category}/archived/{name}-{date}.md

# For deletion (ensure git tracks)
git rm {file}
git commit -m "prune: remove {reason}"
```

### 4. Clean Up References

After pruning:
- Update any documents that referenced pruned file
- Update indexes to remove entry
- Log in alignment report

## Batch Pruning

For periodic maintenance:

```markdown
## Batch Prune Report

### Candidates Identified
| File | Reason | Age | Action |
|------|--------|-----|--------|
| old-spec.md | Superseded | 45 days | Archive |
| draft-2.md | Abandoned | 21 days | Prune |
| duplicate.md | Duplicate of X | 10 days | Prune |

### Actions Taken
- Archived: 3 documents
- Pruned: 2 documents
- Skipped: 1 document (referenced)

### References Updated
- DREAM-STATE.md line 45
- INDEX.md (removed 2 entries)
```

## Retention Policies

### By Category

| Category | Active Retention | Archive Retention |
|----------|------------------|-------------------|
| Instructions | Forever | Forever |
| Dream States | Forever | Forever |
| Memory | Forever | Forever |
| Loop Definitions | Forever | Forever |
| Specs | Until shipped | 1 year |
| Architecture | Until superseded | Forever (as ADR) |
| Audits | Until loop complete | 90 days |
| Run Archives | Forever | Forever |

### By Age

| Age | Review Action |
|-----|---------------|
| 0-7 days | No action (too new) |
| 7-14 days | Check for abandoned drafts |
| 14-30 days | Check for stale content |
| 30-90 days | Consider archival |
| 90+ days | Must justify keeping active |

## Automation Integration

The docs-alignment skill automates pruning detection:

```json
{
  "prune_candidates": [
    {
      "path": "docs/old-spec.md",
      "reason": "superseded",
      "age_days": 45,
      "recommended_action": "archive",
      "references": []
    }
  ],
  "auto_prune_enabled": false,
  "require_confirmation": true
}
```

**Note:** Auto-pruning is disabled by default. All prune actions require confirmation.
