# Deduplication Rules

Strategies for identifying duplicate content, merging overlapping sources, resolving contradictions, and maintaining a coherent cross-reference matrix.

## Duplicate Detection

### Exact Duplicates

Two sources are exact duplicates when their extracted content is identical.

| Detection Method | When to Use | Implementation |
|-----------------|-------------|----------------|
| Content hash match | Always (first pass) | Compare `content_hash` fields; SHA-256 match = exact duplicate |
| URL match | Web sources | Normalize URLs then compare; same canonical URL = likely duplicate |
| Title + author match | Documents | Identical title and author with same publication year = likely duplicate |

**Action on exact duplicate:** Keep the source with the higher `relevance_score`. If equal, keep the more recently ingested version. Mark the discarded source as `superseded_by: <kept_source_id>`.

### Near Duplicates

Content that is substantially similar but not identical (e.g., different versions, reformatted, or slightly edited).

| Signal | Threshold | Example |
|--------|-----------|---------|
| Title similarity | > 80% Jaccard on words | "PostgreSQL 16 Guide" vs "Guide to PostgreSQL 16" |
| Content overlap | > 70% shared sentences | Same article reposted on a different site |
| Same URL, different fetch dates | Any | Content updated since last ingestion |
| Same author + topic + similar date | Within 30 days | Author's blog post and their conference talk on the same topic |

**Action on near duplicate:** Flag for review. Possible outcomes:
1. **Merge** if one is a superset of the other
2. **Keep both** if each contains unique information, and link them via `related_sources`
3. **Keep newer** if the older version is fully superseded

## Overlap Analysis

### Identifying Partial Overlaps

Sources that share some content but each has unique material:

```
Source A: [--- shared content ---][--- unique to A ---]
Source B: [--- unique to B ---][--- shared content ---]
```

**Classification of overlaps:**

| Overlap Type | Description | Strategy |
|-------------|-------------|----------|
| Subset | Source B is entirely contained within Source A | Keep A only; mark B as redundant |
| Superset | Source A is entirely contained within Source B | Keep B only; mark A as redundant |
| Partial | Both share some content but each has unique parts | Keep both; link and note overlap |
| Complementary | No content overlap but same topic from different angles | Keep both; link as complementary |
| Contradictory | Overlapping claims but with different conclusions | Keep both; flag contradiction |

### Merge Strategies for Partial Overlaps

When merging is appropriate (one source is a clear superset with minor additions from another):

1. **Select the primary source** - the one with higher authority and more complete coverage
2. **Identify unique content** from the secondary source that is absent from the primary
3. **Append unique content** to the primary extraction with attribution: "Additionally, [secondary source] notes that..."
4. **Update metadata:**
   - `related_sources` includes the secondary source ID
   - `word_count` reflects merged content
   - `content_hash` is recalculated
   - `caveats` notes the merge: "Merged with src_XXXXXXXX_XXXX"
5. **Mark secondary** as `merged_into: <primary_source_id>`

## Handling Contradictory Sources

When two credible sources disagree on facts:

### Contradiction Severity Levels

| Level | Description | Example | Action |
|-------|-------------|---------|--------|
| Minor | Differences in non-critical details | Version numbers, minor stats | Keep higher-authority source; note discrepancy |
| Moderate | Different recommendations for the same problem | "Use approach A" vs "Use approach B" | Keep both; present as alternatives with tradeoffs |
| Major | Fundamental factual disagreement | "Feature X exists" vs "Feature X was removed" | Escalate for verification; check official source |

### Contradiction Resolution Process

1. **Detect:** Flag when two sources with overlapping topic tags make incompatible claims
2. **Classify:** Assign severity level (minor, moderate, major)
3. **Compare authority:** Higher authority source is presumed correct for minor contradictions
4. **Check recency:** For moderate contradictions, the more recent source often reflects current state
5. **Verify independently:** For major contradictions, seek a third source or official documentation
6. **Document:** Record the contradiction, resolution, and rationale in both sources' `caveats` fields

```
caveats: "Contradicts src_20250110_b2c1 on API rate limits.
This source (official docs, 2025-01) is preferred over that
source (blog post, 2024-06). Rate limit is 1000/min, not 500/min."
```

## Cross-Reference Matrix

Maintain a matrix of relationships between ingested sources.

### Relationship Types

| Relationship | Meaning | Directionality |
|-------------|---------|----------------|
| `supplements` | Adds detail to another source | A supplements B |
| `contradicts` | Disagrees with another source | Bidirectional |
| `supersedes` | Replaces an older version | A supersedes B |
| `derived_from` | Extracted or summarized from another | A derived_from B |
| `same_topic` | Covers the same subject independently | Bidirectional |
| `prerequisite` | Understanding A is needed to understand B | A is prerequisite for B |

### Matrix Construction

For each newly ingested source, check against all existing sources:

1. **Tag overlap check:** Sources sharing 2+ tags are candidates for relationship
2. **Topic similarity:** Compare summaries for semantic overlap
3. **Temporal relationship:** Newer source on same topic may supersede older
4. **Author relationship:** Same author may have updated or expanded their work

### Matrix Entry Format

```yaml
cross_references:
  - source_a: "src_20250115_a3f8"
    source_b: "src_20250110_b2c1"
    relationship: "supersedes"
    confidence: "high"
    notes: "Same API docs, newer version"
```

## Deduplication Checklist

Run this checklist for every new source during ingestion:

- [ ] Compute `content_hash` and check for exact match in existing sources
- [ ] Normalize URL and check for URL match in existing sources
- [ ] Check title + author similarity against existing sources with shared tags
- [ ] If near-duplicate found, classify overlap type (subset/superset/partial/complementary/contradictory)
- [ ] Apply appropriate merge strategy or keep-both decision
- [ ] If contradiction found, classify severity and resolve
- [ ] Update cross-reference matrix with any new relationships
- [ ] Verify no orphaned references after any merges or removals
