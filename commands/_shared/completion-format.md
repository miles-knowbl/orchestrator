# Loop Completion Format Protocol

> Standard format for presenting loop completion and next leverage move. Applies to all loops.

## Purpose

When a loop iteration completes, present a consistent, information-rich summary that:
1. Confirms what was accomplished
2. Shows key deliverables
3. Proposes the next highest leverage move with full reasoning
4. Displays available (unblocked) moves only
5. Provides a clear call-to-action

## Format Structure

```
══════════════════════════════════════════════════════════════════════════════════

**`/{loop-name}` → {primitive}: COMPLETE**

╔══════════════════════════════════════════════════════════════════════════════╗
║  /{loop-name} → {primitive}                                                  ║
║  STATUS: COMPLETE                                                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  {2-4 lines of key deliverables}                                             ║
║  {counts: tools, endpoints, files, etc.}                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

---

══════════════════════════════════════════════════════════════════════════════════
  NEXT HIGHEST LEVERAGE MOVE

  Recommended: /{loop-name} → {next-primitive}

  Reasoning:
    • Dream State: {how this advances the dream state}
    • Downstream Unlock: {what this enables}
    • Likelihood: {confidence level + dependency status}

  Value Score: X.X/10

  Alternatives Considered:
    2. /{loop} → {primitive} (V: X.X)
    3. /{loop} → {primitive} (V: X.X)
    4. /{loop} → {primitive} (V: X.X)

══════════════════════════════════════════════════════════════════════════════════
  AVAILABLE MOVES (unblocked)
══════════════════════════════════════════════════════════════════════════════════

  {Category/Layer N}:
    • {item} — {brief description}
    • {item} — {brief description}

  {Category/Layer N+1}:
    • {item} — {brief description}

══════════════════════════════════════════════════════════════════════════════════

  Say 'go' to start /{loop-name} → {recommended-primitive}, or specify a different target.
```

## Loop-Specific Primitives

Each loop operates on a different primitive. The completion format stays the same; only the primitive and menu source change.

| Loop | Primitive | Menu Source | Grouping |
|------|-----------|-------------|----------|
| `/engineering-loop` | module | ROADMAP.md | by layer (0-6) |
| `/bugfix-loop` | bug/issue | open issues, failing tests | by severity/component |
| `/proposal-loop` | proposal | pending proposals | by type |
| `/distribution-loop` | release | pending distributions | by project |
| `/learning-loop` | improvement | skill upgrade queue | by skill/priority |
| `/audit-loop` | audit item | audit findings | by category |
| `/deck-loop` | deck | pending deck reviews | by deck type |
| `/meta-loop` | loop definition | loop ideas | by domain |
| `/infra-loop` | infra component | infra backlog | by layer |
| `/dream-loop` | dream state | tier hierarchy | by tier |

## Leverage Score Calculation

Use the standard Leverage Protocol formula:

```
       (DSA × 0.40) + (Downstream Unlock × 0.25) + (Likelihood × 0.15)
V = ─────────────────────────────────────────────────────────────────────
                    (Time × 0.10) + (Effort × 0.10)
```

See `commands/_shared/leverage-protocol.md` for full details.

## Menu Organization

**Key principle:** Only show unblocked, available moves. Hide completed items and blocked items.

### Filtering Rules

1. **Hide completed items** — No ✓ markers cluttering the menu
2. **Hide blocked items** — Items with unmet dependencies don't appear
3. **Hide deferred items** — Check ROADMAP.md "## Deferred Items" section before presenting moves

**CRITICAL: Before presenting available moves, ALWAYS check:**
- ROADMAP.md `## Deferred Items` section for explicitly deferred modules
- Items marked with `*deferred*` in layer tables
- Any item with "Revisit When" conditions not yet met

Deferred items should NEVER appear in available moves, regardless of their dependency status.

### For Roadmap-Based Loops (engineering-loop, infra-loop)

Group unblocked items by layer (deferred items hidden):
```
  Layer 1:
    • module-a — description
    • module-b — description

  Layer 4:
    • module-c — description
```

### For Issue-Based Loops (bugfix-loop, audit-loop)

Group by severity (unblocked only):
```
  Critical:
    • issue-1 — description

  High:
    • issue-2 — description
```

### For Queue-Based Loops (learning-loop, deck-loop)

Group by priority (unblocked only):
```
  High Priority:
    • item-1 — description

  Medium Priority:
    • item-2 — description
```

## Call-to-Action

End with a clear, actionable prompt:

```
  Say 'go' to start /{loop} → {recommended}, or specify a different target.
```

If multiple loops could apply:
```
  Say 'go' to start /{loop} → {target}, or specify a different loop/target.
```

## Examples

### Engineering Loop Completion (Full Format)

```
**`/engineering-loop` → spaced-repetition-learning: COMPLETE**

╔══════════════════════════════════════════════════════════════════════════════╗
║  /engineering-loop → spaced-repetition-learning                              ║
║  STATUS: COMPLETE                                                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  SpacedRepetitionService with SM-2 algorithm                                 ║
║  22 MCP tools | 19 API endpoints                                             ║
║  Auto-generation from skills and patterns                                    ║
║  Review sessions with streak tracking                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

---

══════════════════════════════════════════════════════════════════════════════════
  NEXT HIGHEST LEVERAGE MOVE

  Recommended: /engineering-loop → proposing-decks

  Reasoning:
    • Dream State: "Wake up to decks ready for review" — key autonomous capability
    • Downstream Unlock: Human review of generated proposals + knowledge decks
    • Likelihood: Very high — dependencies complete (dreaming ✓, spaced-repetition ✓)

  Value Score: 6.05/10

  Alternatives Considered:
    2. /engineering-loop → ooda-clocks-visual (V: 5.60)
    3. /engineering-loop → ladder-of-abstraction-interfaces (V: 5.40)
    4. /engineering-loop → custom-tool-roundup (V: 5.20)

══════════════════════════════════════════════════════════════════════════════════
  AVAILABLE MOVES (unblocked)
══════════════════════════════════════════════════════════════════════════════════

  Layer 1:
    • ooda-clocks-visual — Gamelan-inspired circular visualization
    • ladder-of-abstraction-interfaces — UI at different zoom levels

  Layer 4:
    • sales-loop — MECE sales workflow
    • ops-loop — Operations workflow
    • brownfield-specialization — Brownfield patterns

  Layer 5:
    • proposing-decks — Wake up to decks ready for review
    • custom-tool-roundup — Collecting MCP tools

══════════════════════════════════════════════════════════════════════════════════

  Say 'go' to start /engineering-loop → proposing-decks, or specify a different target.
```

### Bugfix Loop Completion

```
**`/bugfix-loop` → auth-token-expiry: COMPLETE**

╔══════════════════════════════════════════════════════════════════════════════╗
║  /bugfix-loop → auth-token-expiry                                            ║
║  STATUS: COMPLETE                                                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Fixed token refresh race condition                                          ║
║  Added retry logic with exponential backoff                                  ║
║  3 files changed | 2 tests added                                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

---

══════════════════════════════════════════════════════════════════════════════════
  NEXT HIGHEST LEVERAGE MOVE

  Recommended: /bugfix-loop → session-timeout-handling

  Reasoning:
    • Dream State: Eliminates user-reported session drops
    • Downstream Unlock: Stable auth foundation for mobile app
    • Likelihood: High — similar pattern to token fix

  Value Score: 7.2/10

  Alternatives Considered:
    2. /bugfix-loop → rate-limit-bypass (V: 6.8)
    3. /bugfix-loop → cache-invalidation (V: 5.9)

══════════════════════════════════════════════════════════════════════════════════
  AVAILABLE MOVES (unblocked)
══════════════════════════════════════════════════════════════════════════════════

  Critical:
    • session-timeout-handling — Users losing sessions unexpectedly

  High:
    • rate-limit-bypass — API abuse vector
    • cache-invalidation — Stale data in dashboard

══════════════════════════════════════════════════════════════════════════════════

  Say 'go' to start /bugfix-loop → session-timeout-handling, or specify a different target.
```

## Integration

Each loop's command definition should reference this protocol in its "On Completion" section:

```markdown
### On Completion

Follow the **Completion Format Protocol** (`commands/_shared/completion-format.md`):
1. Show completion banner with loop + primitive
2. List key deliverables
3. Present next highest leverage move with full reasoning
4. Show alternatives considered with scores
5. Display available moves (unblocked only) grouped by {grouping strategy}
6. Provide clear call-to-action
```
