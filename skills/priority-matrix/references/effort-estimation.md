# Effort Estimation Reference

Techniques for estimating effort accurately enough to score the effort/ease dimension in a priority matrix. The goal is not project-planning precision -- it is enough fidelity to differentiate options and produce a fair ranking.

## Estimation Approaches

| Approach | Speed | Precision | Best For |
|----------|-------|-----------|----------|
| **T-shirt sizing** | Very fast | Low | Quick triage, early-stage options, non-technical audiences |
| **Story points** | Medium | Medium | Teams with established velocity, sprint-level planning |
| **Time-based** | Slow | High | Well-defined scope, contractual commitments |
| **Reference class** | Medium | Medium-High | Options similar to completed past work |

Choose the approach that matches the precision needed for your prioritization framework. For ICE or MoSCoW, T-shirt sizing is sufficient. For Weighted Scoring or Cost of Delay, story points or reference class estimates add value.

## T-Shirt Sizing

### The Scale

| Size | Definition | Typical Range | Effort Score (1-10) |
|------|-----------|---------------|-------------------|
| **XS** | One person, under a day | < 1 day | 10 |
| **S** | One person, a few days | 1-3 days | 8 |
| **M** | One person-week or small team, short sprint | 1-2 weeks | 6 |
| **L** | Multi-person, multi-week effort | 3-6 weeks | 4 |
| **XL** | Large team, multi-month initiative | 2-6 months | 2 |
| **XXL** | Program-level, quarter+ | 6+ months | 1 |

**Mapping to effort score:** The effort dimension in a priority matrix is typically inverse -- low effort = high score (easier = better). The table above reflects this inversion.

### How to T-Shirt Size

1. Start with one option that the team knows well and assign it a size
2. For each subsequent option, ask: "Is this bigger or smaller than [reference]?"
3. Place it in the appropriate bucket
4. If an option sits between two sizes, round up (overestimate effort)
5. Do not debate exact sizes for more than 2 minutes per option

### When T-Shirt Sizing Breaks Down

- Options vary by more than 100x in effort (XS and XXL in the same matrix)
- Multiple options land in the same T-shirt size, and effort differentiation matters
- Stakeholders need time/cost estimates, not relative sizes

In these cases, decompose large options or switch to a more precise method.

## Story Points

### Fibonacci Scale

| Points | Meaning | Rough Time Equivalent (team-dependent) |
|--------|---------|---------------------------------------|
| 1 | Trivial, well-understood | Hours |
| 2 | Small, straightforward | 1-2 days |
| 3 | Small with minor complexity | 2-3 days |
| 5 | Medium, some unknowns | 1 week |
| 8 | Medium-large, multiple components | 1-2 weeks |
| 13 | Large, significant complexity | 2-3 weeks |
| 21 | Very large, should probably be decomposed | 3-5 weeks |

**Key principle:** Story points measure complexity and uncertainty, not just time. An 8-point story is not "8 hours" -- it is roughly 3x the complexity of a 3-point story.

### Converting Story Points to Effort Scores

If your team has established story point baselines:

| Story Points | Effort Score (1-10 inverse) |
|-------------|---------------------------|
| 1-2 | 9-10 |
| 3-5 | 7-8 |
| 8 | 5-6 |
| 13 | 3-4 |
| 21+ | 1-2 |

### Story Points vs. Hours

| Aspect | Story Points | Hours |
|--------|-------------|-------|
| What they measure | Complexity + uncertainty | Calendar time |
| Anchoring risk | Lower (abstract scale) | Higher (people think in hours) |
| Useful for prioritization | Yes -- relative comparison | Overkill unless Cost of Delay |
| Common failure mode | Point inflation over time | Optimism bias |

**For priority matrices:** Prefer story points or T-shirt sizes over hours. The matrix needs relative comparison, not schedules.

## Estimation Techniques

### Planning Poker

Best for: team estimation sessions with 3-8 people and up to 15 options.

**Process:**
1. Each estimator independently selects a Fibonacci card (1, 2, 3, 5, 8, 13, 21)
2. All cards revealed simultaneously
3. If estimates converge (within one step), take the higher value
4. If divergent (2+ steps apart), highest and lowest explain reasoning, then re-estimate once
5. Take the median of round-2 estimates

**Ground rules:** No sharing before reveal. Option proposer estimates last. Time-box to 3 minutes per option.

### Affinity Mapping

Best for: quickly sizing 15+ options without detailed discussion. Speed: 20 options in 15-20 minutes.

**Process:**
1. Write each option on a card
2. Place the first option in center; for each subsequent, place left (smaller) or right (larger) silently
3. After all placed, draw T-shirt size boundaries and review edge cases together

### Three-Point Estimation

Best for: options with high uncertainty where a single estimate is misleading.

**Formula:** `Expected = (Optimistic + 4*MostLikely + Pessimistic) / 6` | `Uncertainty = (P - O) / 6`

| Option | Optimistic | Most Likely | Pessimistic | Expected | Uncertainty |
|--------|-----------|-------------|-------------|----------|-------------|
| Auth overhaul | 2 weeks | 4 weeks | 10 weeks | 4.7 weeks | 1.3 weeks |
| Search feature | 1 week | 2 weeks | 4 weeks | 2.2 weeks | 0.5 weeks |

Flag options where uncertainty exceeds 50% of expected value for further investigation.

## Accounting for Uncertainty and Risk

### Uncertainty Multipliers

When converting raw effort estimates to effort scores, apply multipliers for uncertainty factors:

| Factor | Multiplier | When to Apply |
|--------|-----------|---------------|
| **New technology** | 1.5x | Team has not used this tech before |
| **Unclear requirements** | 1.5x | Scope is loosely defined |
| **External dependency** | 1.3x | Depends on a third party or another team |
| **Integration complexity** | 1.3x | Touches 3+ existing systems |
| **Regulatory/compliance** | 1.5x | Subject to review processes outside the team |
| **First-of-kind** | 2.0x | Nothing like this has been done before in the org |

**Application:** Multiply the base effort estimate by all applicable factors, then convert to an effort score. Multiple factors compound.

**Example:** Base estimate is M (1-2 weeks), but involves new technology (1.5x) and unclear requirements (1.5x). Adjusted estimate: 1.5 * 1.5 * M = 2.25 * M, which pushes it to L territory. Effort score drops from 6 to 4.

### Risk-Adjusted Effort Scoring

Build risk into the effort score directly: well-understood work keeps its standard score; known approach with unknowns gets a 1-point discount; novel approach gets a 2-point discount; uncharted territory is treated as L or XL regardless of raw size.

### When to Decompose Instead of Estimate

If estimated at XL+ or pessimistic-to-optimistic ratio exceeds 5x, decompose into sub-options before scoring. **Test:** Can you identify 2-4 independently deliverable pieces? If not, flag with a placeholder effort score of 2 `(?)`.
