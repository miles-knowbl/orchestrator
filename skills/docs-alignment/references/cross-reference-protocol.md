# Cross-Reference Protocol

> How to link documents across tiers and categories.

## Reference Types

### 1. Intra-Tier References

References within the same tier (e.g., system to system).

```markdown
# In {repo}/.claude/DREAM-STATE.md
See [Architecture](../ARCHITECTURE.md) for design details.
See [memory/patterns.json](./memory/patterns.json) for learned patterns.
```

**Use relative paths** within the same tier.

### 2. Inter-Tier References

References across tiers (e.g., system referencing organization).

```markdown
# In {repo}/.claude/DREAM-STATE.md
This system follows the [Organization Dream State](~/.claude/DREAM-STATE.md).
Loop definition: [engineering-loop](~/.claude/commands/engineering-loop.md)
```

**Use absolute paths** (with `~`) for cross-tier references.

### 3. External References

References to resources outside the documentation system.

```markdown
# In {repo}/ARCHITECTURE.md
GitHub Issue: [#123](https://github.com/org/repo/issues/123)
API Docs: [OpenAPI Spec](https://api.example.com/docs)
```

**Use full URLs** for external references.

## Reference Syntax

### Standard Markdown Links

```markdown
[Display Text](./path/to/document.md)
[Display Text](./path/to/document.md#section-anchor)
```

### Reference with Context

When a reference needs explanation:

```markdown
For implementation details, see [ARCHITECTURE.md](./ARCHITECTURE.md)
(specifically the [Data Flow section](./ARCHITECTURE.md#data-flow)).
```

### Bidirectional References

When two documents reference each other, ensure both links exist:

```markdown
# In DREAM-STATE.md
Modules defined in [modules.json](./modules.json).

# In modules.json (as comment or separate doc)
// Tracked in DREAM-STATE.md
```

## Reference Maintenance

### On Document Creation

1. Identify related documents
2. Add forward references to new document
3. Add backward references from related documents
4. Update indexes

### On Document Move

1. Identify all documents referencing the moved file
2. Update all references to new path
3. Verify no broken links remain

```bash
# Find references to a file
grep -r "old-path.md" ~/.claude/ {repo}/.claude/

# After move, update all references
# (docs-alignment skill does this automatically)
```

### On Document Deletion

1. Identify all documents referencing the deleted file
2. Remove or update references
3. Consider if references should point to archive

## Reference Patterns

### Dream State → Module Checklists

```markdown
# System DREAM-STATE.md

## Module Checklists

### skill-registry ([details](./modules/skill-registry/.claude/DREAM-STATE.md))
- [x] list_skills operational
- [x] get_skill operational
```

### Architecture → Decisions

```markdown
# ARCHITECTURE.md

## Key Decisions

| Decision | ADR | Rationale |
|----------|-----|-----------|
| PostgreSQL | [ADR-001](./memory/decisions/ADR-001-database.md) | ACID compliance |
| JWT Auth | [ADR-002](./memory/decisions/ADR-002-auth.md) | Stateless scaling |
```

### Run Archive → Deliverables

```markdown
# In run archive JSON
{
  "deliverables": {
    "spec": "{repo}/FEATURESPEC.md",
    "architecture": "{repo}/ARCHITECTURE.md",
    "audit": "{repo}/.claude/docs/audits/2025-01-29-security.md"
  }
}
```

### Loop Definition → Skills

```markdown
# engineering-loop.md

## Phase Skills

| Phase | Skills |
|-------|--------|
| INIT | [entry-portal](mcp://skills-library/entry-portal), [spec](mcp://skills-library/spec) |
| IMPLEMENT | [implement](mcp://skills-library/implement) |
```

## Broken Reference Detection

### Detection Criteria

A reference is broken if:
- Target file does not exist
- Target section anchor does not exist
- External URL returns 404
- Path syntax is invalid

### Repair Strategies

| Scenario | Repair |
|----------|--------|
| File moved | Update path to new location |
| File deleted | Remove reference or point to archive |
| Section renamed | Update anchor |
| External 404 | Archive.org link or remove |

### Automated Detection

The docs-alignment skill scans for broken references:

```
1. Parse all markdown files for links
2. Resolve each link path
3. Check file existence
4. Report broken links
5. Suggest repairs
```

## Reference Index

Maintain a reference map for fast lookup:

```json
{
  "references": {
    "~/.claude/DREAM-STATE.md": {
      "referenced_by": [
        "{repo}/.claude/DREAM-STATE.md",
        "~/.claude/commands/engineering-loop.md"
      ],
      "references": [
        "{repo1}/.claude/DREAM-STATE.md",
        "{repo2}/.claude/DREAM-STATE.md"
      ]
    }
  }
}
```

## Best Practices

### DO

- Use relative paths within a tier
- Use absolute paths across tiers
- Include anchor links for large documents
- Update references when moving files
- Maintain bidirectional references for important links

### DON'T

- Use bare URLs without context
- Create circular reference chains
- Reference draft documents from active ones
- Leave placeholder references (`TODO: add link`)
- Create references to volatile paths

## Reference Validation Checklist

```markdown
## Reference Audit

- [ ] All internal links resolve to existing files
- [ ] All section anchors exist in target documents
- [ ] External links return 2xx status
- [ ] Cross-tier references use absolute paths
- [ ] Intra-tier references use relative paths
- [ ] Bidirectional references are symmetric
- [ ] No orphaned documents (unreferenced and not indexed)
```
