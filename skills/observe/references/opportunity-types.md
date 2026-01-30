# Opportunity Types

A taxonomy of leverage opportunities the Observe skill looks for.

## Overview

Not all opportunities are equal. This reference categorizes opportunity types by their nature and expected impact.

---

## Type 1: Case-Based Shortcuts

**What:** Applying lessons from similar past situations to skip steps or avoid pitfalls.

**Impact:** 1.5-3x speedup (incremental, not transformative)

**Examples:**
- "Last time we added auth, we hit rate limiting issues. Let's configure that upfront."
- "This is the third time we've scaffolded a Next.js app. Use the established pattern."
- "Previous audit found this category of issues. Check for them early."

**Detection:**
- Query memory for patterns with matching tags
- Look for previous executions with similar goals
- Check calibration adjustments for relevant warnings

**Action:** Apply learning, note shortcut taken.

---

## Type 2: Bundling

**What:** Solving multiple problems with a single solution.

**Impact:** 3-10x efficiency (doing N things for the cost of 1)

**Examples:**
- "Three systems need user preferences. Build one preferences service."
- "Five modules have similar validation. Extract a shared validator."
- "Auth, logging, and metrics all need middleware. Build a plugin system."

**Detection:**
- Aggregate checklists-to-done across systems/modules
- Look for repeated items or similar descriptions
- Identify shared root causes

**Bundling Signals:**
```
- Same issue appears in multiple checklists
- Multiple items share a dependency
- Pattern of "add X to module Y" repeated across modules
- Integration points that would benefit from standardization
```

**Action:** Propose bundled solution, estimate combined impact, get user decision.

---

## Type 3: Reframing

**What:** Changing perspective to compress the problem.

**Impact:** 5-20x compression (problem becomes smaller or disappears)

**Examples:**
- "Instead of building custom search, use Algolia." (buy vs build)
- "Instead of optimizing the query, cache the result." (different solution space)
- "Instead of fixing the UI, remove the feature." (scope reduction)
- "Instead of per-module config, use convention over configuration." (abstraction shift)

**Detection:**
- Question stated goals: "Why do we need X?"
- Look for assumed constraints that may not exist
- Check if problem is symptom vs root cause
- Consider different solution categories (build/buy/borrow/bypass)

**Reframing Questions:**
```
1. Is this solving a symptom or root cause?
2. Is there a higher abstraction that trivializes this?
3. What would we do with unlimited resources? Limited resources?
4. Can we solve this with convention instead of code?
5. What would our competitors do?
6. Is this actually needed, or just assumed to be needed?
```

**Action:** Present reframed problem, show impact comparison, let user choose frame.

---

## Type 4: Paradigm Shift

**What:** A fundamentally different approach that obsoletes current work.

**Impact:** 100x+ (transforms the landscape)

**Examples:**
- "What if we used an LLM instead of rule-based parsing?"
- "What if this was a static site instead of a server?"
- "What if we made this a library instead of a service?"
- "What if we contributed to the open-source tool instead of building a wrapper?"

**Detection:**
- Monitor for emerging capabilities that change assumptions
- Look for architectural insights from adjacent domains
- Consider composing existing systems differently
- Question whether custom code is needed at all

**Paradigm Shift Signals:**
```
- New technology makes hard things easy
- Architectural pattern simplifies multiple concerns
- External system does 80% of what we need
- Composition of existing pieces achieves goal
- Industry is moving in a different direction
```

**Criteria for Surfacing:**
1. **Concrete** — Not speculative; has clear implementation path
2. **Validated** — Evidence it works (others have done it, technology is mature)
3. **Relevant** — Applies to current context, not just interesting
4. **Transformative** — Impact is genuinely 10x+, not incremental

**Action:** Create decision record, present to user with options, await explicit decision before proceeding.

---

## Type 5: Anticipatory Layers

**What:** Doing work now that multiplies future work.

**Impact:** Force multiplier (enables future 10x moves)

**Examples:**
- "If we add plugin architecture now, future features become plugins."
- "If we define a clear API boundary, systems can evolve independently."
- "If we instrument observability now, debugging becomes trivial."
- "If we write the spec thoroughly, implementation becomes mechanical."

**Detection:**
- Look at roadmap/dream state for upcoming work
- Identify patterns in planned features
- Find extension points that would benefit multiple futures
- Consider "what would make the next 5 tasks easier?"

**Anticipatory Signals:**
```
- Multiple future items share a dependency we don't have
- Current architecture will fight future requirements
- Other successful systems have a capability we lack
- We're about to build something that should be pluggable
```

**Action:** Propose the layer, estimate investment vs payoff, note it enables future work.

---

## Opportunity Matrix

| Type | Detection Effort | Impact | Frequency |
|------|------------------|--------|-----------|
| Case-Based Shortcuts | Low | 1.5-3x | Common |
| Bundling | Medium | 3-10x | Occasional |
| Reframing | Medium | 5-20x | Occasional |
| Paradigm Shift | High | 100x+ | Rare |
| Anticipatory Layers | Medium | Force multiplier | Occasional |

---

## "Nothing Significant" is Valid

Most loop executions will find:
- A few case-based shortcuts (apply them silently)
- No bundling opportunities (scope is focused)
- Current frame is appropriate
- No paradigm shifts available

This is fine. Document "nothing significant" and proceed. The value of Observe is in the rare cases where opportunities exist, not in manufacturing them.

---

## Recording Opportunities

When an opportunity is identified:

1. **Create ADR** for Type 3-5 opportunities (reframe, paradigm, anticipatory)
2. **Update patterns** for Type 1-2 (case-based, bundling) after execution
3. **Tag with opportunity type** for future case-based matching

```json
{
  "type": "opportunity",
  "category": "bundling|reframe|paradigm|anticipatory",
  "context": "what we were doing",
  "opportunity": "what we found",
  "decision": "pursued|deferred|rejected",
  "outcome": "result if pursued"
}
```

This feeds future case-based reasoning.
