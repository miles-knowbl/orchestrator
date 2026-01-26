# Source Evaluation Criteria

Standards for assessing reliability, relevance, and value of context sources before ingestion.

## Evaluation Dimensions

Every source is scored across four dimensions before inclusion:

| Dimension | Weight | Question Answered |
|-----------|--------|-------------------|
| Authority | 30% | Is the source credible and authoritative? |
| Recency | 25% | Is the information current enough for the task? |
| Specificity | 25% | Does it directly address the topic at hand? |
| Accessibility | 20% | Can the content be reliably extracted and referenced? |

## Authority Scoring

| Score | Criteria | Examples |
|-------|----------|----------|
| 5 - Definitive | Primary source, official documentation | RFC specs, official API docs, court rulings |
| 4 - Strong | Recognized expert or institution | Peer-reviewed papers, vendor engineering blogs |
| 3 - Credible | Known practitioner, reputable outlet | Conference talks, established tech publications |
| 2 - Informal | Community-generated, unverified | Stack Overflow answers, forum posts, tutorials |
| 1 - Weak | Anonymous, unattributed, or AI-generated | Uncited blog posts, scraped aggregator content |

## Recency Scoring

| Score | Age of Content | Acceptable When |
|-------|---------------|-----------------|
| 5 | < 3 months | Always preferred |
| 4 | 3-12 months | Topic is not rapidly evolving |
| 3 | 1-2 years | Foundational concepts, stable APIs |
| 2 | 2-5 years | Historical context, mature standards |
| 1 | > 5 years | Only if no newer source exists and content is canonical |

**Override rule:** Recency is irrelevant for mathematical proofs, RFCs, and language specifications. Score these as 5 regardless of age.

## Specificity Scoring

| Score | Criteria |
|-------|----------|
| 5 | Directly answers the exact question or covers the precise topic |
| 4 | Covers the topic with minor tangential content |
| 3 | Covers a broader area that includes the topic |
| 2 | Adjacent topic that requires inference to apply |
| 1 | Only loosely related; requires significant interpretation |

## Quality Red Flags

Downgrade or exclude sources exhibiting these indicators:

| Red Flag | Action | Reason |
|----------|--------|--------|
| No author attribution | Downgrade authority by 2 | Accountability matters |
| No publication date | Downgrade recency to 2 max | Cannot verify currency |
| Broken external links | Downgrade authority by 1 | Poor maintenance signal |
| Contradicts 3+ other sources | Flag for manual review | Likely outdated or incorrect |
| Marketing language dominates | Downgrade specificity by 2 | Promotional bias |
| Content behind login wall | Downgrade accessibility to 1 | Cannot reliably re-fetch |
| AI-generated without review | Downgrade authority to 1 | Hallucination risk |

## Quality Positive Indicators

Upgrade sources exhibiting these signals:

| Indicator | Action |
|-----------|--------|
| Includes working code examples | Upgrade specificity by 1 |
| Cites its own sources | Upgrade authority by 1 |
| Has a changelog or revision history | Upgrade recency confidence |
| Peer-reviewed or editor-reviewed | Upgrade authority by 1 |
| Maintained in version control | Upgrade recency confidence |

## Inclusion/Exclusion Decision Matrix

Calculate the weighted score: `(Authority * 0.3) + (Recency * 0.25) + (Specificity * 0.25) + (Accessibility * 0.2)`

| Weighted Score | Decision | Action |
|----------------|----------|--------|
| 4.0 - 5.0 | Include | Ingest as primary source |
| 3.0 - 3.9 | Include with caveat | Ingest, note limitations in metadata |
| 2.0 - 2.9 | Conditional | Include only if no better source exists for the topic |
| 1.0 - 1.9 | Exclude | Do not ingest; document why if it was considered |

## Conflict Resolution

When two sources disagree on facts:

1. **Higher authority wins** - Official docs override blog posts
2. **More recent wins** (if authority is equal) - Newer content reflects current state
3. **More specific wins** (if authority and recency are equal) - Targeted content is more reliable
4. **Flag for human review** if all dimensions are comparable - Do not silently pick one

## Source Evaluation Checklist

Before ingesting any source, confirm:

- [ ] Authority score assigned (1-5)
- [ ] Recency score assigned (1-5) with publication date recorded
- [ ] Specificity score assigned (1-5) relative to the current task
- [ ] Accessibility confirmed (content can be extracted and re-accessed)
- [ ] Red flags checked and documented if present
- [ ] Weighted score meets inclusion threshold (>= 2.0)
- [ ] Conflicts with existing sources identified and resolved
