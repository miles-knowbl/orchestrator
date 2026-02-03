# Orchestrator Roadmap

> Modules that ladder up to system completion. Each module advances the dream state.

---

## Overview

**System**: Orchestrator — Self-improving meta-system where skills are the atomic primitive
**Dream State**: Autonomous, coherent, local-first system that compounds leverage through skill-based ontology
**Progress**: 19/32 modules complete (59%) + 11 deferred
**Remaining**: sales-loop, ops-loop

---

## The Seven Layers

```
Layer 6  ───────────────────────────────────────────────────────────────────────
         local-first (deferred)

Layer 5  ───────────────────────────────────────────────────────────────────────
         game-design ✓, co-op (deferred), proposing-decks ✓, spaced-repetition ✓, auto-updating ✓, ecosystem-roundup (deferred)

Layer 4  ───────────────────────────────────────────────────────────────────────
         sales-loop, ops-loop, business-model-loop (deferred), go-to-market-loop (deferred), brownfield-specialization (deferred)

Layer 3  ───────────────────────────────────────────────────────────────────────
         proactive-messaging ✓, slack-integration ✓, natural-conversation (deferred), multiplayer (deferred)

Layer 2  ───────────────────────────────────────────────────────────────────────
         patterns-roundup ✓, scoring ✓, mece-opportunity-mapping ✓, coherence-system ✓

Layer 1  ───────────────────────────────────────────────────────────────────────
         autonomous ✓, dreaming (deferred), multi-agent-worktrees ✓, loop-sequencing ✓, kanban ✓, ooda-clocks ✓, skill-trees ✓, tech-trees (deferred), ladder-of-abstraction (deferred)

Layer 0  ───────────────────────────────────────────────────────────────────────
         roadmapping ✓, 2-layer-orchestration ✓, knowledge-graph-ontology ✓
```

---

## Layer 0

| Module | Description | Unlocks |
|--------|-------------|---------|
| **roadmapping** ✓ | System-level visibility into module progress, dependencies, and completion status. The spine that makes everything else trackable. | kanban, coherence-system |
| **2-layer-orchestration** ✓ | Orchestrator that spawns and manages sub-agents. One orchestrator per system, capable of spinning up/down any number of agents running any combination of loops to advance toward dream state. | autonomous, dreaming, multi-agent-worktrees |
| **knowledge-graph-ontology** ✓ | The skill-based knowledge graph where compound leverage accumulates. Skills, patterns, loops, and learnings form nodes; relationships form edges. This is the second brain's actual structure. | skill-trees, tech-trees, co-op-skill-acquisition, mece-opportunity-mapping, spaced-repetition |

---

## Layer 1

| Module | Description | Depends On |
|--------|-------------|------------|
| **kanban** ✓ | Linear-style visualization of the module ladder to system completion. Human-readable checklist showing scope completion, delegation-ready for worktrees. | roadmapping |
| **ooda-clocks-visual** ✓ | Gamelan-inspired circular visualization showing when patterns, hooks, and skills fire during loop execution. Temporal awareness of the orchestration rhythm. | — |
| **skill-trees** ✓ | DAG-like domain-specific sequences of skills. Simultaneously illustrates skill relationships to LLMs while helping users gain familiarity by seeing each skill produce output before using it in a loop. Interface to the skill-based ontology. | knowledge-graph-ontology |
| **tech-trees** | Macroscopic technology progressions that cultures/orgs pursue. Predictive capabilities (potentially RL-based like AlphaGo with Markov decision trees) that inspire MECE opportunity mapping at system and module levels. | knowledge-graph-ontology, mece-opportunity-mapping | *deferred* |
| **ladder-of-abstraction-interfaces** | UI showing the same loop at different zoom levels (module/system/org). Music-gear-like looping interfaces for piloting, co-piloting, or playing co-op PvE with the orchestrator. | kanban | *deferred*
| **autonomous** ✓ | Full loop execution without human gates + background continuous operation. "It works while I sleep." The orchestrator advances dream state while you're away. | 2-layer-orchestration, proactive-messaging |
| **dreaming** | Sleep/background processing mode for proposing new modules→system and systems→org. The system "dreams up" new work while idle, ready for review when you return. Needs roadmap state sync before useful. | autonomous | *deferred* |
| **multi-agent-worktrees** ✓ | Multiple sets of parallel agents across two hierarchy levels and multiple humans. Thoughtful coordination when collaborators each have their own agent sets working on isolated git worktrees. | 2-layer-orchestration |
| **loop-sequencing** ✓ | Developing intuition for which loops commonly run together (like NLP pattern detection) and using that to look multiple moves ahead in the "line" (chess-inspired). Beyond single-move leverage protocol to multi-move planning. | leverage-protocol (exists) |

---

## Layer 2

| Module | Description | Depends On |
|--------|-------------|------------|
| **patterns-roundup** ✓ | Two functions: (1) Round up existing patterns not yet formalized into memory/patterns, (2) Automatic pattern detection and proposal from observed behaviors. | analytics (exists) |
| **scoring** ✓ | System-level evaluation around module-specific value. Quantifies how much each module contributes to dream state advancement. | analytics (exists) |
| **mece-opportunity-mapping** ✓ | Mutually Exclusive, Collectively Exhaustive opportunity analysis at system and module levels. Ensures no blind spots in roadmap coverage. | knowledge-graph-ontology |
| **coherence-system** ✓ | Alignment of all orchestrator components. Skill-based ontology + dream state + roadmapping form the spine of a "spec-driven organization." Ensures modules don't drift or conflict. | roadmapping, knowledge-graph-ontology |

---

## Layer 3

| Module | Description | Depends On |
|--------|-------------|------------|
| **proactive-messaging** ✓ | System reaches out across channels: terminal, Slack, email, text. Alerts you to completions, proposals, blockers. | — |
| **slack-integration** ✓ | Bidirectional: receive commands and capture to inbox, plus send proactive messages. | proactive-messaging |
| **natural-conversation** | Voice input and output for piloting the orchestrator. Naturalistic speech for contexts where you can't hold long documents in your head (driving, jogging). Dictate requirements, hear status. | — | *deferred* |
| **multiplayer** | Multi-engineer loop coordination. Transform the single-player loops experience into multiplayer: command parsing across engineers, thread management per engineer, merge/rebase workflows, engineer status tracking, and cross-worktree coordination. Currently exists as `src/services/slack-integration/` — needs consolidation with `proactive-messaging/adapters/SlackAdapter.ts`. | slack-integration, multi-agent-worktrees | *deferred* |

---

## Layer 4

| Module | Description | Depends On |
|--------|-------------|------------|
| **sales-loop** | MECE loop for sales workflows. Structured process from lead to close with artifacts at each phase. | — |
| **ops-loop** | MECE loop for operations workflows. Structured process for operational excellence with tracking artifacts. | — |
| **business-model-loop** | Full loop for creating business model artifacts. Structured exploration of value proposition, revenue streams, cost structure, channels. | — | *deferred* |
| **go-to-market-loop** | Full loop for GTM strategy artifacts. Market analysis, positioning, launch planning, channel strategy. | — | *deferred* |
| **brownfield-specialization** | Special patterns and loops for brownfield contexts. Making orchestrator as good at brownfield as it is at greenfield — essential for getting systems to "completion" for launch or checkpoint. | — | *deferred*

---

## Layer 5

| Module | Description | Depends On |
|--------|-------------|------------|
| **game-design** ✓ | Framing the dream state ladder at each of the two levels (module→system, system→org) as finite games with clear win conditions. Understanding the infinite game the org plays in a cosmic, mission sense. | coherence-system |
| **co-op-skill-acquisition** | Collaborative ontology building across multiple users, multiple AI agents, and user+AI combinations. Creating multiple ontologies with different participant combinations. | knowledge-graph-ontology, multi-agent-worktrees | *deferred* |
| **proposing-decks** ✓ | Wake up to decks ready for review: (1) Knowledge decks for spaced repetition learning, (2) Project/module/system proposal decks. Learn from them and approve scopes for autonomous execution. | dreaming, spaced-repetition-learning |
| **spaced-repetition-learning** ✓ | SRS for skill mastery and knowledge retention. The orchestrator helps you internalize patterns and skills through timed review. | knowledge-graph-ontology |
| **auto-updating** ✓ | Other users receive updates without manually downloading from docs site. Push-based distribution of improvements via daily welcome notification. | — |
| **ecosystem-roundup** | Collecting and organizing tools, patterns, frameworks, skills, and loops across the ecosystem. Ensuring nothing useful is orphaned. | — | *deferred*

---

## Layer 6

| Module | Description | Depends On |
|--------|-------------|------------|
| **local-first** | Architecture ensuring orchestrator works without internet. Encryption, sync protocols, and security for the journey from local to public apps. The foundation for true ownership. Affects all external integrations. | — | *deferred*

---

## Updates to Existing Modules

| Target | Update | Priority | Status |
|--------|--------|----------|--------|
| **distribution-loop** | Guarantee that all commits are rounded up and pushed. No orphaned local commits after distribution completes. | High | ✓ Complete |
| **InboxProcessor** | Finish the second brain inbox implementation. Complete the skill harvesting pipeline. | Medium | ✓ Complete |

---

## Deferred Items

> Modules explicitly deferred. Check this section before presenting available moves.

| Module | Reason | Revisit When |
|--------|--------|--------------|
| tech-trees | Complex RL/prediction scope | After core system stable |
| business-model-loop | Domain loop, not core | When domain loops prioritized |
| go-to-market-loop | Domain loop, not core | When domain loops prioritized |
| co-op-skill-acquisition | Multi-user complexity | After local-first architecture |
| local-first | Significant architecture scope | When external integrations need offline support |
| ladder-of-abstraction-interfaces | UI complexity, requires stable core | After core visualization (ooda-clocks) |
| ecosystem-roundup | Broad scope across all primitives | When ecosystem has more content to round up |
| brownfield-specialization | Patterns exist, needs formalization | When brownfield work increases |
| natural-conversation | Voice I/O not immediately needed | When mobile-first usage increases |
| multiplayer | Multi-engineer coordination exists but needs consolidation | When team usage begins; consolidate slack-integration service into proactive-messaging |
| dreaming | Needs roadmap state sync; will integrate ADIR-reasoning-cycle | After roadmap integration fixed |
| behavior-guarantees | System for enforcing/guaranteeing LLM behavior; explicit-rules-enforcement pattern will live here | When behavior enforcement patterns mature |

---

## Brainstorm (Not Yet Scoped)

| Idea | Notes |
|------|-------|
| **audit loops for missing skills** | Systematic audit to find gaps in skill coverage |

---

## Module Count Summary

| Layer | Complete | Total | Modules |
|-------|----------|-------|---------|
| 0 | 3 | 3 | roadmapping ✓, 2-layer-orchestration ✓, knowledge-graph-ontology ✓ |
| 1 | 6 | 9 | kanban ✓, ooda-clocks ✓, skill-trees ✓, tech-trees (deferred), ladder-of-abstraction (deferred), autonomous ✓, dreaming (deferred), multi-agent-worktrees ✓, loop-sequencing ✓ |
| 2 | 4 | 4 | patterns-roundup ✓, scoring ✓, mece-opportunity-mapping ✓, coherence-system ✓ |
| 3 | 2 | 4 | proactive-messaging ✓, slack-integration ✓, natural-conversation (deferred), multiplayer (deferred) |
| 4 | 0 | 5 | sales-loop, ops-loop, business-model-loop (deferred), go-to-market-loop (deferred), brownfield-specialization (deferred) |
| 5 | 4 | 6 | game-design ✓, co-op-skill-acquisition (deferred), proposing-decks ✓, spaced-repetition ✓, auto-updating ✓, ecosystem-roundup (deferred) |
| 6 | 0 | 1 | local-first (deferred) |
| **Complete** | **19** | **32** | **59%** |
| Updates | 2 | 2 | distribution-loop ✓, InboxProcessor ✓ |

---

## Dependency Graph

```
                                    ┌─────────────────┐
                                    │   DREAM STATE   │
                                    │   (System Done) │
                                    └────────┬────────┘
                                             │
            ┌────────────────────────────────┼────────────────────────────────┐
            │                                │                                │
            ▼                                ▼                                ▼
    ┌───────────────┐              ┌─────────────────┐              ┌─────────────────┐
    │ 2-LAYER ORCH  │              │ KNOWLEDGE GRAPH │              │  LOCAL-FIRST    │
    └───────┬───────┘              └────────┬────────┘              └────────┬────────┘
            │                                │                                │
            ├──► autonomous                  ├──► skill-trees                 ├──► proactive-messaging
            ├──► dreaming (deferred)         ├──► tech-trees                  ├──► slack-integration
            └──► multi-agent-worktrees       ├──► mece-opportunity-mapping    ├──► auto-updating
                                             ├──► co-op-skill-acquisition     └──► multiplayer (deferred)
                                             └──► spaced-repetition

    ┌───────────────┐              ┌─────────────────┐
    │  ROADMAPPING  │              │    ANALYTICS    │
    └───────┬───────┘              └────────┬────────┘
            │                                │
            ├──► kanban                      ├──► patterns-roundup
            └──► coherence-system            └──► scoring
                      │
                      └──► game-design
```

---

## Suggested Build Order

Based on dependencies and leverage:

```
Phase 1: Foundation ✓ COMPLETE
  1. roadmapping ✓
  2. knowledge-graph-ontology ✓
  3. 2-layer-orchestration ✓

Phase 2: Core Capabilities ✓ COMPLETE
  4. kanban ✓
  5. patterns-roundup ✓
  6. scoring ✓
  7. autonomous ✓

Phase 3: Intelligence ✓ COMPLETE
  8. mece-opportunity-mapping ✓
  9. coherence-system ✓
  10. loop-sequencing ✓

Phase 4: Layer 1 Continuation (partial)
  11. dreaming (deferred)
  12. multi-agent-worktrees ✓

Phase 5: Visualization ✓ COMPLETE
  13. ooda-clocks-visual ✓
  14. skill-trees ✓
  15. ladder-of-abstraction-interfaces (deferred)

Phase 6: Meta & Interface ✓ COMPLETE
  16. game-design ✓
  17. spaced-repetition-learning ✓
  18. proposing-decks ✓
  19. proactive-messaging ✓
  20. slack-integration ✓

Phase 7: Remaining Modules ◄── YOU ARE HERE
  21. sales-loop (Layer 4)
  22. ops-loop (Layer 4)

Deferred:
  - tech-trees (Layer 1)
  - ladder-of-abstraction-interfaces (Layer 1)
  - dreaming (Layer 1) — needs roadmap state sync
  - natural-conversation (Layer 3) — voice I/O
  - multiplayer (Layer 3) — multi-engineer coordination
  - brownfield-specialization (Layer 4)
  - business-model-loop (Layer 4)
  - go-to-market-loop (Layer 4)
  - co-op-skill-acquisition (Layer 5)
  - ecosystem-roundup (Layer 5)
  - local-first (Layer 6)
```

---

## Key Concepts

### ADIR Loop (Abductive → Deductive → Inductive → Reflexive) — Pattern PAT-012

> **Note**: ADIR is a reasoning pattern (PAT-012), not a standalone module. It synergizes with other patterns.

| Phase | Output | Core Question |
|-------|--------|---------------|
| Abductive | Hypotheses + candidate explanations | "What might be true?" |
| Deductive | Predictions + testable implications | "If that's true, what should we observe?" |
| Inductive | Updated belief weights + generalized takeaways | "Given results, what's likely true in general?" |
| Reflexive | Frame audit + constraint update + next-loop rewrite | "Was our way of thinking the right one?" |

**Context Delta** (Reflexive output):
- `keep`: stable truths that survived
- `discard`: assumptions invalidated
- `add`: newly discovered constraints/opportunities
- `reweight`: belief updates with confidence
- `next_tests`: 1-3 highest-leverage experiments
- `guardrails`: failure modes to avoid

### Skill Trees vs Tech Trees

| Concept | Scope | Purpose |
|---------|-------|---------|
| **Skill Trees** | Internal capabilities | DAG of Skill.md skills showing relationships; user gains familiarity by seeing each skill produce output |
| **Tech Trees** | External/macro technology | Predictive progressions that cultures/orgs pursue; inspires MECE opportunity mapping |

### Loop Sequencing vs Leverage Protocol

| Concept | Scope | Mechanism |
|---------|-------|-----------|
| **Leverage Protocol** | Single move | Value equation scoring for next best action |
| **Loop Sequencing** | Multiple moves | Pattern detection of loop co-occurrence; chess-line thinking |

### Game Design Framing

| Level | Game Type | Framing |
|-------|-----------|---------|
| Module → System | Finite | Clear win condition, checkpoints, "done" |
| System → Org | Finite | Clear win condition, launch criteria |
| Org (mission) | Infinite | Cosmic purpose, continuous play |

---

## Next Action

**Progress**: 19/32 modules complete (59%) + 11 deferred
**Available Modules** (unblocked, not deferred):
- Layer 4: sales-loop, ops-loop

**Recommended**: sales-loop (domain loop with clear structure)

**Note**: ADIR is now captured as pattern PAT-012 in memory/orchestrator.json rather than a standalone module. It synergizes with Deep Context Protocol, Leverage Protocol, MECE Opportunity Mapping, and Terrain Check.
