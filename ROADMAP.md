# Orchestrator Roadmap

> Modules that ladder up to system completion. Each module advances the dream state.

---

## Overview

**System**: Orchestrator — Autonomous, coherent, local-first system that compounds leverage through skill-based ontology
**Dream State**: Autonomous, coherent, local-first system that compounds leverage through skill-based ontology
**Progress**: 21/21 modules complete (100%) + 14 deferred
**Remaining**: None (all active modules complete)

---

## The Seven Layers

```
Layer 6  ──────────────────────────────────────────────────────────────────
         local-first (deferred)

Layer 5  ──────────────────────────────────────────────────────────────────
         auto-updating ✓, co-op-skill-acquisition (deferred), ecosystem-roundup (deferred), game-design ✓, proposing-decks ✓, spaced-repetition-learning ✓

Layer 4  ──────────────────────────────────────────────────────────────────
         brownfield-specialization (deferred), business-model-loop (deferred), go-to-market-loop (deferred), marketing-loop (deferred), ops-loop (deferred), runtime-contexts (deferred), sales-loop ✓

Layer 3  ──────────────────────────────────────────────────────────────────
         multiplayer (deferred), natural-conversation (deferred), proactive-messaging ✓, slack-integration ✓

Layer 2  ──────────────────────────────────────────────────────────────────
         behavior-guarantees (deferred), coherence-system ✓, mece-opportunity-mapping ✓, patterns-roundup ✓, scoring ✓

Layer 1  ──────────────────────────────────────────────────────────────────
         autonomous ✓, dreaming ✓, kanban ✓, ladder-of-abstraction-interfaces (deferred), loop-sequencing ✓, multi-agent-worktrees ✓, ooda-clocks-visual ✓, skill-trees ✓, tech-trees (deferred)

Layer 0  ──────────────────────────────────────────────────────────────────
         2-layer-orchestration ✓, knowledge-graph-ontology ✓, roadmapping ✓

```

---

## Layer 0

| Module | Description | Unlocks |
|--------|-------------|---------|
| **2-layer-orchestration** ✓ | Orchestrator that spawns and manages sub-agents. One orchestrator per system, capable of spinning up/down any number of agents running any combination of loops to advance toward dream state. | autonomous, dreaming, multi-agent-worktrees |
| **knowledge-graph-ontology** ✓ | The skill-based knowledge graph where compound leverage accumulates. Skills, patterns, loops, and learnings form nodes; relationships form edges. This is the second brain's actual structure. | skill-trees, tech-trees, co-op-skill-acquisition, mece-opportunity-mapping, spaced-repetition |
| **roadmapping** ✓ | System-level visibility into module progress, dependencies, and completion status. The spine that makes everything else trackable. | kanban, coherence-system |

---

## Layer 1

| Module | Description | Depends On |
|--------|-------------|------------|
| **autonomous** ✓ | Full loop execution without human gates + background continuous operation. "It works while I sleep." The orchestrator advances dream state while you're away. | 2-layer-orchestration, proactive-messaging |
| **dreaming** ✓ | Sleep/background processing mode for proposing new modules→system and systems→org. The system "dreams up" new work while idle, ready for review when you return. Needs roadmap state sync before useful. | autonomous |
| **kanban** ✓ | Linear-style visualization of the module ladder to system completion. Human-readable checklist showing scope completion, delegation-ready for worktrees. | roadmapping |
| **ladder-of-abstraction-interfaces** | UI showing the same loop at different zoom levels (module/system/org). Music-gear-like looping interfaces for piloting, co-piloting, or playing co-op PvE with the orchestrator. | kanban | *deferred* |
| **loop-sequencing** ✓ | Developing intuition for which loops commonly run together (like NLP pattern detection) and using that to look multiple moves ahead in the "line" (chess-inspired). Beyond single-move leverage protocol to multi-move planning. | leverage-protocol (exists) |
| **multi-agent-worktrees** ✓ | Multiple sets of parallel agents across two hierarchy levels and multiple humans. Thoughtful coordination when collaborators each have their own agent sets working on isolated git worktrees. | 2-layer-orchestration |
| **ooda-clocks-visual** ✓ | Gamelan-inspired circular visualization showing when patterns, hooks, and skills fire during loop execution. Temporal awareness of the orchestration rhythm. | — |
| **skill-trees** ✓ | DAG-like domain-specific sequences of skills. Simultaneously illustrates skill relationships to LLMs while helping users gain familiarity by seeing each skill produce output before using it in a loop. Interface to the skill-based ontology. | knowledge-graph-ontology |
| **tech-trees** | Macroscopic technology progressions that cultures/orgs pursue. Predictive capabilities (potentially RL-based like AlphaGo with Markov decision trees) that inspire MECE opportunity mapping at system and module levels. | knowledge-graph-ontology, mece-opportunity-mapping | *deferred* |

---

## Layer 2

| Module | Description | Depends On |
|--------|-------------|------------|
| **behavior-guarantees** | System for enforcing/guaranteeing LLM behavior. Explicit rules enforcement patterns for ensuring consistent agent behavior. | coherence-system | *deferred* |
| **coherence-system** ✓ | Alignment of all orchestrator components. Skill-based ontology + dream state + roadmapping form the spine of a "spec-driven organization." Ensures modules don't drift or conflict. | roadmapping, knowledge-graph-ontology |
| **mece-opportunity-mapping** ✓ | Mutually Exclusive, Collectively Exhaustive opportunity analysis at system and module levels. Ensures no blind spots in roadmap coverage. | knowledge-graph-ontology |
| **patterns-roundup** ✓ | Two functions: (1) Round up existing patterns not yet formalized into memory/patterns, (2) Automatic pattern detection and proposal from observed behaviors. | analytics (exists) |
| **scoring** ✓ | System-level evaluation around module-specific value. Quantifies how much each module contributes to dream state advancement. | analytics (exists) |

---

## Layer 3

| Module | Description | Depends On |
|--------|-------------|------------|
| **multiplayer** | Multi-engineer loop coordination. Transform the single-player loops experience into multiplayer: command parsing across engineers, thread management per engineer, merge/rebase workflows, engineer status tracking, and cross-worktree coordination. Currently exists as `src/services/slack-integration/` — needs consolidation with `proactive-messaging/adapters/SlackAdapter.ts`. | slack-integration, multi-agent-worktrees | *deferred* |
| **natural-conversation** | Voice input and output for piloting the orchestrator. Naturalistic speech for contexts where you can't hold long documents in your head (driving, jogging). Dictate requirements, hear status. | — | *deferred* |
| **proactive-messaging** ✓ | System reaches out across channels: terminal, Slack, email, text. Alerts you to completions, proposals, blockers. | — |
| **slack-integration** ✓ | Bidirectional: receive commands and capture to inbox, plus send proactive messages. | proactive-messaging |

---

## Layer 4

| Module | Description | Depends On |
|--------|-------------|------------|
| **brownfield-specialization** | Special patterns and loops for brownfield contexts. Making orchestrator as good at brownfield as it is at greenfield — essential for getting systems to "completion" for launch or checkpoint. | — | *deferred* |
| **business-model-loop** | Full loop for creating business model artifacts. Structured exploration of value proposition, revenue streams, cost structure, channels. | — | *deferred* |
| **go-to-market-loop** | Full loop for GTM strategy artifacts. Market analysis, positioning, launch planning, channel strategy. | — | *deferred* |
| **marketing-loop** | Domain loop for marketing workflows. Content creation, campaign management, audience development, analytics. | — | *deferred* |
| **ops-loop** | MECE loop for operations workflows. Structured process for operational excellence with tracking artifacts. | — | *deferred* |
| **runtime-contexts** | Constructed environments providing domain ontology (vocabulary, entities, operations, workflows, shared concepts). KnoPilot is reference implementation. | sales-loop | *deferred* |
| **sales-loop** ✓ | MECE loop for sales workflows. Structured process from lead to close with artifacts at each phase. | — |

---

## Layer 5

| Module | Description | Depends On |
|--------|-------------|------------|
| **auto-updating** ✓ | Other users receive updates without manually downloading from docs site. Push-based distribution of improvements via daily welcome notification. | — |
| **co-op-skill-acquisition** | Collaborative ontology building across multiple users, multiple AI agents, and user+AI combinations. Creating multiple ontologies with different participant combinations. | knowledge-graph-ontology, multi-agent-worktrees | *deferred* |
| **ecosystem-roundup** | Collecting and organizing tools, patterns, frameworks, skills, and loops across the ecosystem. Ensuring nothing useful is orphaned. | — | *deferred* |
| **game-design** ✓ | Framing the dream state ladder at each of the two levels (module→system, system→org) as finite games with clear win conditions. Understanding the infinite game the org plays in a cosmic, mission sense. | coherence-system |
| **proposing-decks** ✓ | Wake up to decks ready for review: (1) Knowledge decks for spaced repetition learning, (2) Project/module/system proposal decks. Learn from them and approve scopes for autonomous execution. | dreaming, spaced-repetition-learning |
| **spaced-repetition-learning** ✓ | SRS for skill mastery and knowledge retention. The orchestrator helps you internalize patterns and skills through timed review. | knowledge-graph-ontology |

---

## Layer 6

| Module | Description | Depends On |
|--------|-------------|------------|
| **local-first** | Architecture ensuring orchestrator works without internet. Encryption, sync protocols, and security for the journey from local to public apps. The foundation for true ownership. Affects all external integrations. | — | *deferred* |

---

## Updates to Existing Modules

| Target | Update | Priority | Status |
|--------|--------|----------|--------|
| **distribution-loop** | Guarantee that all commits are rounded up and pushed. No orphaned local commits after distribution completes. | High | pending |
| **InboxProcessor** | Finish the second brain inbox implementation. Complete the skill harvesting pipeline. | Medium | pending |

---

## Brainstorm (Not Yet Scoped)

| Idea | Notes |
|------|-------|
| **audit loops for missing skills** | Systematic audit to find gaps in skill coverage |

---

## Module Count Summary

| Layer | Complete | Total | Modules |
|-------|----------|-------|---------|
| 0 | 3 | 3 | 2-layer-orchestration ✓, knowledge-graph-ontology ✓, roadmapping ✓ |
| 1 | 7 | 9 | autonomous ✓, dreaming ✓, kanban ✓, ladder-of-abstraction-interfaces, loop-sequencing ✓, multi-agent-worktrees ✓, ooda-clocks-visual ✓, skill-trees ✓, tech-trees |
| 2 | 4 | 5 | behavior-guarantees, coherence-system ✓, mece-opportunity-mapping ✓, patterns-roundup ✓, scoring ✓ |
| 3 | 2 | 4 | multiplayer, natural-conversation, proactive-messaging ✓, slack-integration ✓ |
| 4 | 1 | 7 | brownfield-specialization, business-model-loop, go-to-market-loop, marketing-loop, ops-loop, runtime-contexts, sales-loop ✓ |
| 5 | 4 | 6 | auto-updating ✓, co-op-skill-acquisition, ecosystem-roundup, game-design ✓, proposing-decks ✓, spaced-repetition-learning ✓ |
| 6 | 0 | 1 | local-first |
| **Complete** | **21** | **35** | **60%** |

---

## Next Action

**Progress**: 21/35 modules complete (60%)
**Available Modules** (unblocked): None

---

*Generated from .claude/roadmap.json on 2026-02-04*