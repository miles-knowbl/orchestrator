# Orchestrator Roadmap

> Modules that ladder up to system completion.

## Overview

**Active modules:** 29/29 complete (100%)
**Deferred modules:** 30 across layers 1-6
**Total scope:** 59 modules across 7 layers (0-6)

---

## The Seven Layers

```
Layer 0 ── Foundation ──────────────────────────────────────────────────────
  [x] skill-registry          [x] loop-composer           [x] execution-engine
  [x] memory-service           [x] learning-service        [x] calibration-service
  [x] inbox-processor          [x] run-archival            [x] guarantee-service
  [x] deliverable-manager      [x] analytics               [x] dream-state-service
  [x] 2-layer-orchestration    [x] knowledge-graph-ontology
  [x] roadmapping

Layer 1 ── Composition ─────────────────────────────────────────────────────
  [x] autonomous               [x] kanban                  [x] loop-sequencing
  [x] multi-agent-worktrees    [x] ooda-clocks-visual      [x] skill-trees
  [ ] ladder-of-abstraction-interfaces (deferred)
  [ ] tech-trees (deferred)
  [ ] context-answering-tool (deferred)
  [ ] context-queuing (deferred)
  [ ] prompt-logging (deferred)

Layer 2 ── Intelligence ────────────────────────────────────────────────────
  [x] coherence-system         [x] mece-opportunity-mapping
  [x] patterns-roundup         [x] scoring
  [ ] behavior-guarantees (deferred)       [ ] black-box-surfacing (deferred)
  [ ] constitutional-ai (deferred)         [ ] remix-loops (deferred)
  [ ] loop-plugins-effects (deferred)      [ ] adoption-loop (deferred)
  [ ] framework-library (deferred)         [ ] dynamic-context-bundle (deferred)
  [ ] transient-file-config (deferred)     [ ] secret-manager (deferred)

Layer 3 ── Communication ───────────────────────────────────────────────────
  [x] proactive-messaging      [x] slack-integration       [x] voice
  [ ] multiplayer (deferred)               [ ] natural-conversation (deferred)
  [ ] multi-agent-heartbeat (deferred)     [ ] generative-interfaces (deferred)
  [ ] skill-mastery (deferred)

Layer 4 ── Domain ──────────────────────────────────────────────────────────
  [x] knopilot
  [ ] brownfield-specialization (deferred)   [ ] business-model-loop (deferred)
  [ ] go-to-market-loop (deferred)           [ ] marketing-loop (deferred)
  [ ] runtime-contexts (deferred)            [ ] documentation-recipe-book (deferred)

Layer 5 ── Ecosystem ───────────────────────────────────────────────────────
  [ ] co-op-skill-acquisition (deferred)
  [ ] ecosystem-roundup (deferred)
  [ ] moat-designer (deferred)

Layer 6 ── Sovereignty ─────────────────────────────────────────────────────
  [ ] local-first (deferred)
```

---

## Layer 0 -- Foundation

The bedrock services. Everything else depends on these.

| Module | Description | Dependencies | Status |
|--------|-------------|--------------|--------|
| skill-registry | Core service for skill CRUD operations, search, and improvement capture. | -- | complete |
| loop-composer | Compose loops from skills, validate loop definitions, manage loop lifecycle. | skill-registry | complete |
| execution-engine | Execute loops with phase management, skill completion tracking, and gate enforcement. | loop-composer | complete |
| memory-service | Context persistence, pattern recording, decision tracking, and handoff creation. | -- | complete |
| learning-service | Skill improvement proposals, metrics tracking, proposal lifecycle management. | memory-service, analytics | complete |
| calibration-service | Effort estimation calibration, accuracy tracking, calibration recommendations. | -- | complete |
| inbox-processor | Second brain inbox for capturing content, URL fetching, skill extraction. | skill-registry | complete |
| run-archival | Archive completed loop runs, query historical runs, generate run summaries. | execution-engine | complete |
| guarantee-service | Register and validate skill guarantees, aggregate loop guarantees, enforce at gates. | execution-engine | complete |
| deliverable-manager | Store and retrieve execution deliverables, manage deliverable paths. | execution-engine | complete |
| analytics | Collect and aggregate metrics from runs, skills, calibration, gates, patterns. | run-archival | complete |
| dream-state-service | Manage dream state JSON, sync from roadmap, render markdown views. | roadmapping | complete |
| 2-layer-orchestration | Orchestrator that spawns and manages sub-agents. One orchestrator per system, capable of spinning up/down any number of agents running any combination of loops to advance toward dream state. | execution-engine | complete |
| knowledge-graph-ontology | The skill-based knowledge graph where compound leverage accumulates. Skills, patterns, loops, and learnings form nodes; relationships form edges. | skill-registry | complete |
| roadmapping | System-level visibility into module progress, dependencies, and completion status. The spine that makes everything else trackable. | -- | complete |

---

## Layer 1 -- Composition

Composing foundation primitives into higher-order capabilities.

| Module | Description | Dependencies | Status |
|--------|-------------|--------------|--------|
| autonomous | Full loop execution without human gates + background continuous operation. The orchestrator advances dream state while you're away. | 2-layer-orchestration, proactive-messaging | complete |
| kanban | Linear-style visualization of the module ladder to system completion. Human-readable checklist showing scope completion. | roadmapping | complete |
| loop-sequencing | Developing intuition for which loops commonly run together and using that to look multiple moves ahead in the line. | -- | complete |
| multi-agent-worktrees | Multiple sets of parallel agents across two hierarchy levels. Coordination when collaborators each have their own agent sets working on isolated git worktrees. | 2-layer-orchestration | complete |
| ooda-clocks-visual | Gamelan-inspired circular visualization showing when patterns, hooks, and skills fire during loop execution. | -- | complete |
| skill-trees | DAG-like domain-specific sequences of skills. Interface to the skill-based ontology with progression tracking. | knowledge-graph-ontology | complete |
| ladder-of-abstraction-interfaces | UI showing the same loop at different zoom levels (module/system/org). Music-gear-like looping interfaces for piloting, co-piloting, or playing co-op PvE with the orchestrator. | kanban | *deferred* |
| tech-trees | Macroscopic technology progressions that cultures/orgs pursue. Predictive capabilities (potentially RL-based like AlphaGo with Markov decision trees) that inspire MECE opportunity mapping at system and module levels. | knowledge-graph-ontology, mece-opportunity-mapping | *deferred* |
| context-answering-tool | Deep context gathering tool (slow but thorough). | -- | *deferred* |
| context-queuing | Print context questions for multiple roadmap modules simultaneously. | roadmapping | *deferred* |
| prompt-logging | Log and analyze prompts across the system. | analytics | *deferred* |

---

## Layer 2 -- Intelligence

Self-awareness, alignment, and adaptive behavior.

| Module | Description | Dependencies | Status |
|--------|-------------|--------------|--------|
| coherence-system | Alignment of all orchestrator components. Ensures modules don't drift or conflict. | roadmapping, knowledge-graph-ontology | complete |
| mece-opportunity-mapping | Mutually Exclusive, Collectively Exhaustive opportunity analysis. Ensures no blind spots in roadmap coverage. | knowledge-graph-ontology | complete |
| patterns-roundup | Round up existing patterns not yet formalized, plus automatic pattern detection from observed behaviors. | analytics | complete |
| scoring | System-level evaluation around module-specific value. Quantifies how much each module contributes to dream state advancement. | analytics | complete |
| behavior-guarantees | System for enforcing/guaranteeing LLM behavior. AGENT.md files define agent personalities, constraints, and behavioral rules. | coherence-system | *deferred* |
| black-box-surfacing | Click into each skill to see its step-by-step process, chat with it, see relevant docs. | skill-registry | *deferred* |
| constitutional-ai | Behavior guardrails and value alignment for agent actions. | behavior-guarantees, coherence-system | *deferred* |
| remix-loops | Ability to remix/fork existing loops with modifications. | loop-composer | *deferred* |
| loop-plugins-effects | Plugins and effects that affect just that specific loop instance. | loop-composer, execution-engine | *deferred* |
| adoption-loop | Loop for user adoption workflows and onboarding sequences. | loop-composer | *deferred* |
| framework-library | Theory of constraints, More/Better/New, MoSCoW, and other decision frameworks. | -- | *deferred* |
| dynamic-context-bundle | Serialization format and service for passing execution context between agents. Bundles current execution state, relevant memory, active patterns, and calibration data into a portable package that Layer 2 agents can load to resume work seamlessly. | 2-layer-orchestration, multi-agent-worktrees | *deferred* |
| transient-file-config | Per-loop and per-phase transient file configuration. Allows loops to declare file retention policies, deliverable vs transient intent, phase-level cleanup strategies, and skill file declarations. | -- | *deferred* |
| secret-manager | Secure credential and API key management. Environment-aware secret storage, rotation policies, secure injection into loops/skills, and git-safe patterns to prevent accidental commits. | -- | *deferred* |

---

## Layer 3 -- Communication

Channels for human-system interaction.

| Module | Description | Dependencies | Status |
|--------|-------------|--------------|--------|
| proactive-messaging | System reaches out across channels: terminal, Slack, notifications. Alerts you to completions, proposals, blockers. | -- | complete |
| slack-integration | Bidirectional Slack: receive commands and capture to inbox, plus send proactive messages with buttons. | proactive-messaging | complete |
| voice | Text-to-speech output for status updates. MacOS TTS integration with event formatting and quiet hours. | proactive-messaging | complete |
| multiplayer | Multi-engineer loop coordination. Transform the single-player loops experience into multiplayer: command parsing across engineers, thread management per engineer, merge/rebase workflows, engineer status tracking, and cross-worktree coordination. | slack-integration, multi-agent-worktrees | *deferred* |
| natural-conversation | Voice input and output for piloting the orchestrator. Naturalistic speech for contexts where you can't hold long documents in your head (driving, jogging). Dictate requirements, hear status. | -- | *deferred* |
| multi-agent-heartbeat | Org-level event task queue, roundtable council through single portal. | multi-agent-worktrees, 2-layer-orchestration | *deferred* |
| generative-interfaces | Generative UI/UX for dynamic interface generation. | kanban | *deferred* |
| skill-mastery | Integration layer braiding together skill-trees, inbox-processor, and knowledge-graph-ontology. Unified skill acquisition pipeline: capture knowledge from inbox, map relationships in graph, track progression through trees, recommend learning paths based on graph clusters, surface gaps between captured content and mastered skills. | skill-trees, inbox-processor, knowledge-graph-ontology, spaced-repetition-learning | *deferred* |

---

## Layer 4 -- Domain

Domain-specific loops, runtime contexts, and vertical capabilities.

| Module | Description | Dependencies | Status |
|--------|-------------|--------------|--------|
| knopilot | Sales CRM runtime context. Deal management, stakeholder tracking, NBA engine, pipeline intelligence. | -- | complete |
| brownfield-specialization | Special patterns and loops for brownfield contexts. Making orchestrator as good at brownfield as it is at greenfield. | -- | *deferred* |
| business-model-loop | Full loop for creating business model artifacts. Structured exploration of value proposition, revenue streams, cost structure, channels. | -- | *deferred* |
| go-to-market-loop | Full loop for GTM strategy artifacts. Market analysis, positioning, launch planning, channel strategy. | -- | *deferred* |
| marketing-loop | Domain loop for marketing workflows. Content creation, campaign management, audience development, analytics. | -- | *deferred* |
| runtime-contexts | Constructed environments providing domain ontology (vocabulary, entities, operations, workflows, shared concepts). KnoPilot is reference implementation. | knopilot | *deferred* |
| documentation-recipe-book | Recipes for common documentation patterns. | -- | *deferred* |

---

## Layer 5 -- Ecosystem

Cross-system collaboration and ecosystem-level capabilities.

| Module | Description | Dependencies | Status |
|--------|-------------|--------------|--------|
| co-op-skill-acquisition | Collaborative ontology building across multiple users, multiple AI agents, and user+AI combinations. Includes skill merging and load-your-own-skills. | knowledge-graph-ontology, multi-agent-worktrees | *deferred* |
| ecosystem-roundup | Collecting and organizing tools, patterns, frameworks, skills, and loops across the ecosystem. Ensuring nothing useful is orphaned. | -- | *deferred* |
| moat-designer | Design and analyze competitive moats and defensibility strategies. Framework for identifying, evaluating, and strengthening business moats. | -- | *deferred* |

---

## Layer 6 -- Sovereignty

Full ownership and independence from external dependencies.

| Module | Description | Dependencies | Status |
|--------|-------------|--------------|--------|
| local-first | Architecture ensuring orchestrator works without internet. Encryption, sync protocols, and security for the journey from local to public apps. The foundation for true ownership. | -- | *deferred* |

---

## Updates

| Update | Target | Description | Status |
|--------|--------|-------------|--------|
| update-distribution-loop | distribution-loop | Guarantee that all commits are rounded up and pushed. No orphaned local commits after distribution completes. | complete |
| update-inboxprocessor | inbox-processor | Finish the second brain inbox implementation. Complete the skill harvesting pipeline. | complete |

---

## Brainstorm

| Idea | Notes |
|------|-------|
| Audit loops for missing skills | Systematic audit to find gaps in skill coverage |

---

## Module Count Summary

| Layer | Name | Active (Complete) | Deferred | Total |
|-------|------|:-----------------:|:--------:|:-----:|
| 0 | Foundation | 15 | 0 | 15 |
| 1 | Composition | 6 | 5 | 11 |
| 2 | Intelligence | 4 | 10 | 14 |
| 3 | Communication | 3 | 5 | 8 |
| 4 | Domain | 1 | 6 | 7 |
| 5 | Ecosystem | 0 | 3 | 3 |
| 6 | Sovereignty | 0 | 1 | 1 |
| **Total** | | **29** | **30** | **59** |

---

## Next Action

All 29 active modules are complete. The system is fully operational at its current scope. Future work draws from the 30 deferred modules, prioritized by layer and dependency readiness. Layer 1 and Layer 2 deferred modules are closest to activation since their dependencies are already satisfied.

---

*Generated 2026-02-05*
