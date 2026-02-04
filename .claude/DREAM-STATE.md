# System Dream State: orchestrator

> This document defines "done" for the orchestrator system. All modules roll up here.

**Organization:** superorganism
**Location:** ~/workspaces/orchestrator
**Roadmap:** [ROADMAP.md](../ROADMAP.md) — 32 modules across 7 layers

## Vision

A self-improving meta-system where skills are the atomic primitive. Orchestrator manages skills, composes them into loops, executes loops with quality gates, learns from every execution, and maintains context across sessions. The system should enable "show up, say go" workflows where complex engineering tasks are decomposed and executed with rigor.

**Dream State:** Autonomous, coherent, local-first system that compounds leverage through skill-based ontology.

---

## Modules

| Module | Path | Status | Functions | Progress |
|--------|------|--------|-----------|----------|
| skill-registry | src/services/SkillRegistry.ts | complete | 6/6 | 100% |
| loop-composer | src/services/LoopComposer.ts | complete | 5/5 | 100% |
| execution-engine | src/services/ExecutionEngine.ts | complete | 12/12 | 100% |
| memory-service | src/services/MemoryService.ts | complete | 6/6 | 100% |
| learning-service | src/services/LearningService.ts | complete | 12/12 | 100% |
| calibration-service | src/services/CalibrationService.ts | complete | 4/4 | 100% |
| inbox-processor | src/services/InboxProcessor.ts | complete | 5/5 | 100% |
| run-archival | src/services/RunArchivalService.ts | complete | 5/5 | 100% |
| guarantee-service | src/services/GuaranteeService.ts | complete | 8/8 | 100% |
| loop-guarantee-aggregator | src/services/LoopGuaranteeAggregator.ts | complete | 4/4 | 100% |
| deliverable-manager | src/services/DeliverableManager.ts | complete | 5/5 | 100% |
| version-utility | src/version.ts | complete | 1/1 | 100% |
| http-server | src/server/httpServer.ts | complete | 5/5 | 100% |
| loop-commands | commands/*.md | complete | 11/11 | 100% |
| analytics | src/services/analytics/ | complete | 12/12 | 100% |
| learning | src/services/learning/ | complete | 15/15 | 100% |
| roadmapping | src/services/roadmapping/ | complete | 14/14 | 100% |
| knowledge-graph | src/services/knowledge-graph/ | complete | 25/25 | 100% |
| orchestration | src/services/orchestration/ | complete | 30/30 | 100% |
| kanban | apps/dashboard/app/roadmap/ | complete | 8/8 | 100% |
| patterns-roundup | src/services/patterns/ | complete | 10/10 | 100% |
| scoring | src/services/scoring/ | complete | 12/12 | 100% |
| autonomous | src/services/autonomous/ | complete | 15/15 | 100% |
| dreaming | src/services/dreaming/ | complete | 18/18 | 100% |
| multi-agent-worktrees | src/services/multi-agent/ | complete | 22/22 | 100% |
| mece-opportunity-mapping | src/services/mece/ | complete | 16/16 | 100% |
| coherence-system | src/services/coherence/ | complete | 12/12 | 100% |
| loop-sequencing | src/services/loop-sequencing/ | complete | 14/14 | 100% |
| skill-trees | src/services/skill-trees/ | complete | 16/16 | 100% |
| game-design | src/services/game-design/ | complete | 15/15 | 100% |
| spaced-repetition | src/services/spaced-repetition/ | complete | 22/22 | 100% |
| proposing-decks | src/services/proposing-decks/ | complete | 12/12 | 100% |
| proactive-messaging | src/services/proactive-messaging/ | complete | 10/10 | 100% |
| slack-integration | src/services/slack-integration/ | complete | 15/15 | 100% |
| ooda-clocks-visual | src/services/ooda-clock/, apps/dashboard/app/ooda-clock/ | complete | 12/12 | 100% |

---

## Module Checklists

### skill-registry (complete)
- [x] list_skills operational
- [x] get_skill operational
- [x] create_skill operational
- [x] update_skill operational
- [x] search_skills operational
- [x] capture_improvement operational

### loop-composer (complete)
- [x] list_loops operational
- [x] get_loop operational
- [x] create_loop operational
- [x] validate_loop operational
- [x] compose from skills operational

### execution-engine (complete)
- [x] start_execution operational
- [x] get_execution operational
- [x] advance_phase operational
- [x] complete_phase operational
- [x] complete_skill operational
- [x] skip_skill operational
- [x] approve_gate operational
- [x] reject_gate operational
- [x] pause_execution operational
- [x] resume_execution operational

### memory-service (complete)
- [x] get_memory operational
- [x] update_summary operational
- [x] record_decision operational
- [x] record_pattern operational
- [x] create_handoff operational
- [x] load_context operational

### learning-service (complete)
- [x] capture_skill_improvement operational
- [x] list_proposals operational
- [x] apply_proposal operational
- [x] approve_proposal operational
- [x] reject_proposal operational
- [x] get_skill_metrics operational
- [x] get_learning_status operational
- [x] identify_underutilized_skills operational

### calibration-service (complete)
- [x] get_calibrated_estimate operational
- [x] record_estimate_result operational
- [x] get_calibration_report operational
- [x] get_calibration_recommendations operational

### inbox-processor (complete)
- [x] add_to_inbox operational
- [x] add_url_to_inbox operational
- [x] list_inbox operational
- [x] process_inbox_item operational
- [x] approve_extraction operational

### run-archival (complete)
- [x] query_runs operational
- [x] archive_run operational
- [x] get_recent_context operational
- [x] createRunSummary operational
- [x] pruneStateFile operational

### guarantee-service (complete)
- [x] registerSkillGuarantee operational
- [x] getSkillGuarantees operational
- [x] validateGuarantees operational
- [x] enforceGuarantees operational
- [x] getLoopGuaranteeMap operational
- [x] aggregateLoopGuarantees operational
- [x] setAggregator operational
- [x] getRegistryVersion operational

### loop-guarantee-aggregator (complete)
- [x] aggregateForLoop operational
- [x] aggregateAll operational
- [x] getSummary operational
- [x] getLoopGuarantees operational

### deliverable-manager (complete)
- [x] initialize operational
- [x] storeDeliverable operational
- [x] getDeliverable operational
- [x] listDeliverables operational
- [x] getDeliverablePath operational

### version-utility (complete)
- [x] getVersion — reads from package.json at runtime

### loop-commands (complete)
- [x] engineering-loop — v5.0.0 with hierarchy + completion + leverage
- [x] learning-loop — v2.0.0 with hierarchy + completion + leverage
- [x] bugfix-loop — v2.0.0 with hierarchy + completion + leverage
- [x] proposal-loop — v3.0.0 with hierarchy + completion + leverage
- [x] meta-loop — v2.0.0 with hierarchy + completion + leverage
- [x] infra-loop — v2.0.0 with hierarchy + completion + leverage
- [x] distribution-loop — v2.0.0 with version bump + leverage
- [x] audit-loop — v2.0.0 with hierarchy + completion + leverage
- [x] deck-loop — v2.0.0 with hierarchy + completion + leverage
- [x] transpose-loop — v2.0.0 with hierarchy + completion + leverage
- [x] dream-loop — v1.0.0 with tier detection + leverage

### analytics (complete)
- [x] collectRunMetrics — parse run archives
- [x] collectRubricMetrics — aggregate from LearningService
- [x] collectCalibrationMetrics — pull from CalibrationService
- [x] collectGateMetrics — extract from run archives
- [x] collectPatternMetrics — pull from MemoryService
- [x] collectProposalMetrics — pull from LearningService
- [x] computeAggregates — rates, averages, trends
- [x] getAnalyticsSummary — dashboard-ready summary
- [x] getSkillHealth — rankings by rubric dimension
- [x] getLoopPerformance — duration/success metrics
- [x] getCalibrationAccuracy — estimate accuracy trends
- [x] getTrends — time-series data
- [x] API endpoints — /api/analytics/* (11 endpoints)
- [x] Dashboard view — apps/dashboard/app/analytics/page.tsx

### learning (complete)
- [x] processAnalyticsSignals — consume analytics, identify targets
- [x] identifyLowHealthSkills — find skills below threshold
- [x] identifyCalibrationDrift — find poor estimate accuracy
- [x] identifyPatternCandidates — find repeated behaviors
- [x] generateSkillProposal — exists in LearningService
- [x] generateCalibrationAdjustment — ImprovementOrchestrator
- [x] generatePatternProposal — ImprovementOrchestrator
- [x] prioritizeProposals — leverage protocol scoring
- [x] applySkillUpgrade — exists in LearningService
- [x] applyCalibrationAdjustment — ImprovementOrchestrator
- [x] applyPatternRecording — via MemoryService
- [x] bumpSkillVersion — exists in SkillRegistry
- [x] runImprovementCycle — full analyze→propose→apply cycle
- [x] getImprovementQueue — prioritized proposals
- [x] getImprovementHistory — past improvements
- [x] API endpoints — /api/learning/* (10 endpoints)
- [ ] Dashboard enhancements — improvements page updates (optional)

### knowledge-graph (complete)
- [x] build — build/rebuild from skills and run archives
- [x] load/save — persist to JSON
- [x] getGraph — full graph structure
- [x] getNode — single node with edges
- [x] getNodesByPhase — filter by phase
- [x] getNodesByTag — filter by tag
- [x] getEdges — incoming/outgoing for skill
- [x] getEdgesByType — filter by edge type
- [x] getNeighbors — connected skills
- [x] findPath — BFS path between skills
- [x] getClusters — all clusters
- [x] getClusterByTag — specific cluster
- [x] getHighLeverageSkills — top leverage skills
- [x] getIsolatedSkills — unconnected skills
- [x] getUnusedSkills — stale skills
- [x] analyzeGaps — full gap analysis
- [x] getStats — graph statistics
- [x] refreshNode — refresh single node
- [x] removeNode — remove node and edges
- [x] generateTerminalView — terminal visualization
- [x] API endpoints — /api/knowledge-graph/* (17 endpoints)
- [x] MCP tools — 19 tools

### orchestration (complete)
- [x] initializeOrchestrator — create/resume Layer 1 orchestrator
- [x] setDependencies — wire up services
- [x] getOrchestrator — get orchestrator state
- [x] getNextWorkItems — leverage-scored work items
- [x] spawnAgentsForWork — spawn Layer 2 agents
- [x] handleAgentComplete — handle agent completion
- [x] handleAgentFailed — handle escalation
- [x] runAutonomousCycle — full autonomous cycle
- [x] getAgents — list all agents
- [x] getAgent — get specific agent
- [x] getWorkQueue — work queue state
- [x] getEventLog — orchestration events
- [x] getProgressSummary — dashboard summary
- [x] pause/resume/shutdown — orchestrator lifecycle
- [x] generateTerminalView — terminal visualization
- [x] AgentManager — spawn, monitor, coordinate agents
- [x] WorktreeManager — git worktree per module
- [x] Concurrency modes — sequential, parallel-async, parallel-threads
- [x] Failure cascade — retry → reassign → escalate
- [x] API endpoints — /api/orchestration/* (15 endpoints)
- [x] MCP tools — 17 tools

### kanban (complete)
- [x] Dashboard page — apps/dashboard/app/roadmap/page.tsx
- [x] Navigation link — Added to layout.tsx
- [x] Overall progress panel — Aggregate stats with progress bar
- [x] Leverage scoring panel — Top 3 next modules with scores
- [x] Layer sections — Collapsible layer groupings (0-6)
- [x] Module cards — Status, details, expand/collapse
- [x] Status indicators — Color-coded icons per status
- [x] Critical path display — Shows highest-impact modules

### patterns-roundup (complete)
- [x] PatternsService — src/services/patterns/PatternsService.ts
- [x] queryPatterns — Search and filter across all levels
- [x] getPattern — Get single pattern by ID
- [x] generateRoundup — Export formatted summary (summary/full/markdown)
- [x] detectBehavioralPatterns — Detect from run archives (success/failure/skip)
- [x] detectCodebasePatterns — Detect from skills/loops
- [x] identifyPatternGaps — Gap coverage analysis (8 categories)
- [x] formalizePattern — Convert detected to formal pattern
- [x] API endpoints — /api/patterns/* (6 endpoints)
- [x] MCP tools — 6 tools for pattern operations

### scoring (complete)
- [x] ScoringService — src/services/scoring/ScoringService.ts
- [x] scoreModule — comprehensive module score (0-100)
- [x] scoreAllModules — ranked list of all modules
- [x] scoreSystem — system health score with metrics
- [x] getModulesNeedingAttention — low score/blocked modules
- [x] recordHistory — persist score snapshots
- [x] getHistory — retrieve historical scores
- [x] getScoreTrends — trend analysis (improving/stable/declining)
- [x] compareScores — compare two points in time
- [x] generateTerminalView — terminal-friendly scorecard
- [x] API endpoints — /api/scoring/* (8 endpoints)
- [x] MCP tools — 8 tools for scoring operations

### autonomous (complete)
- [x] AutonomousExecutor — src/services/autonomous/AutonomousExecutor.ts
- [x] start/stop/pause/resume — background lifecycle control
- [x] tick — single autonomous processing cycle
- [x] getStatus — current executor state
- [x] configure — update tick interval, max parallel, max retries
- [x] canAutoApprove — check if gate can be auto-approved
- [x] tryAutoApproveGates — auto-approve based on approvalType
- [x] tryCompletePhase — auto-complete when skills done
- [x] tryAdvancePhase — auto-advance when gates approved
- [x] getAutonomousExecutions — list autonomy=full executions
- [x] getEligibleExecutions — list autonomy=full|supervised
- [x] Guarantee validation — validates before auto-approval
- [x] API endpoints — /api/autonomous/* (8 endpoints)
- [x] MCP tools — 9 tools for autonomous control

### dreaming (complete)
- [x] DreamEngine — src/services/dreaming/DreamEngine.ts
- [x] start/stop — background dreaming lifecycle
- [x] triggerDream — manually trigger dream cycle
- [x] getStatus — current engine state (running, idle, isIdle)
- [x] getStats — dreaming statistics
- [x] configure — idleThreshold, dreamInterval, maxProposalsPerCycle
- [x] listProposals — filter by status/type/limit
- [x] getProposal — get specific proposal
- [x] approveProposal — approve for implementation
- [x] rejectProposal — reject with reason
- [x] markImplemented — mark as implemented
- [x] listSessions — dream session history
- [x] generateNewModuleProposals — analyze blocked modules
- [x] generateSkillImprovementProposals — from learning service
- [x] generatePatternCaptureProposals — from pattern gaps
- [x] Idle detection — monitors activity timestamps
- [x] API endpoints — /api/dreaming/* (11 endpoints)
- [x] MCP tools — 12 tools for dreaming control

### multi-agent-worktrees (complete)
- [x] MultiAgentCoordinator — src/services/multi-agent/MultiAgentCoordinator.ts
- [x] registerCollaborator — register human collaborator
- [x] listCollaborators — list all collaborators
- [x] getCollaborator — get collaborator details
- [x] touchCollaborator — update activity timestamp
- [x] disconnectCollaborator — mark as disconnected
- [x] createAgentSet — create agent set for collaborator
- [x] listAgentSets — list agent sets
- [x] getAgentSet — get agent set details
- [x] addAgentToSet — add agent to set
- [x] addWorktreeToSet — add worktree module to set
- [x] pauseAgentSet/resumeAgentSet — lifecycle control
- [x] createReservation — claim module/file/path for exclusive work
- [x] listReservations — list reservations
- [x] releaseReservation — release a claim
- [x] extendReservation — extend reservation duration
- [x] checkResourceBlocked — check if resource is claimed
- [x] requestMerge — request to merge worktree to main
- [x] checkMergeConflicts — check for conflicts
- [x] executeMerge — execute approved merge
- [x] listMergeQueue — list merge queue
- [x] checkCanWork — check if collaborator can work on module
- [x] getAllActiveWork — cross-collaborator visibility
- [x] API endpoints — /api/multi-agent/* (20 endpoints)
- [x] MCP tools — 24 tools for multi-agent coordination

### mece-opportunity-mapping (complete)
- [x] MECEOpportunityService — src/services/mece/MECEOpportunityService.ts
- [x] runAnalysis — full MECE analysis of opportunities
- [x] getTaxonomy — get category taxonomy
- [x] setCategory — add/update categories
- [x] getOpportunities — list opportunities with filtering
- [x] addOpportunity — manually add opportunity
- [x] updateOpportunity — update opportunity status/details
- [x] removeOpportunity — remove opportunity
- [x] getGaps — list coverage gaps
- [x] getOverlaps — list overlapping opportunities
- [x] getStatus — service status summary
- [x] getLastAnalysis — get last analysis results
- [x] generateTerminalView — terminal-friendly coverage view
- [x] Default 9-category taxonomy covering all system aspects
- [x] Automatic classification using keyword matching
- [x] Recommendation generation from gaps and overlaps
- [x] API endpoints — /api/mece/* (10 endpoints)
- [x] MCP tools — 12 tools for MECE operations

### coherence-system (complete)
- [x] CoherenceService — src/services/coherence/CoherenceService.ts
- [x] runValidation — run full coherence validation
- [x] getStatus — current coherence status
- [x] getLastReport — retrieve last validation report
- [x] getIssues — list issues with filtering
- [x] getIssue — get specific issue details
- [x] updateIssueStatus — update issue status
- [x] generateTerminalView — terminal-friendly coherence view
- [x] 10 validation rules across 8 alignment domains
- [x] Domain scoring and overall coherence score
- [x] Recommendation generation from detected issues
- [x] API endpoints — /api/coherence/* (7 endpoints)
- [x] MCP tools — 7 tools for coherence operations

### loop-sequencing (complete)
- [x] LoopSequencingService — src/services/loop-sequencing/LoopSequencingService.ts
- [x] analyzeRunHistory — detect loop co-occurrence patterns from run archives
- [x] getTransitions — list loop-to-loop transitions with statistics
- [x] getTransition — get specific transition details
- [x] getSequences — list multi-loop sequences
- [x] getSequence — get specific sequence details
- [x] generateLine — create multi-move plan with compound leverage
- [x] getLines — list generated lines
- [x] getLine — get specific line details
- [x] getLastAnalysis — retrieve last sequence analysis
- [x] getStatus — current service status
- [x] generateTerminalView — terminal-friendly sequencing view
- [x] API endpoints — /api/sequencing/* (11 endpoints)
- [x] MCP tools — 12 tools for sequencing operations

### skill-trees (complete)
- [x] SkillTreeService — src/services/skill-trees/SkillTreeService.ts
- [x] generateTree — generate skill tree for domain (phase, tag, category, loop)
- [x] getTrees — list all generated trees
- [x] getTree — get specific tree by ID
- [x] getAvailableDomains — list available domains for tree generation
- [x] getProgression — get skill progression status
- [x] updateProgression — update skill progression
- [x] recordSkillOutput — record user saw skill output
- [x] recordSkillUsage — record user used skill in loop
- [x] generateLearningPath — create learning path to target skill
- [x] getLearningPaths — list learning paths
- [x] getLearningPath — get specific learning path
- [x] getStatus — service status
- [x] generateTerminalView — terminal-friendly tree visualization
- [x] API endpoints — /api/skill-trees/* (13 endpoints)
- [x] MCP tools — 13 tools for skill tree operations

### game-design (complete)
- [x] GameDesignService — src/services/game-design/GameDesignService.ts
- [x] createFiniteGame — create finite game for module/system
- [x] startGame — start tracking game progress
- [x] satisfyWinCondition — mark condition as satisfied
- [x] getFiniteGame — get game by ID
- [x] listFiniteGames — list with filtering (scope, status)
- [x] createInfiniteGame — create infinite game for organization
- [x] linkFiniteGame — link finite to infinite game
- [x] updateHealthMetric — update infinite game health metrics
- [x] getInfiniteGame — get infinite game by ID
- [x] listInfiniteGames — list all infinite games
- [x] generateGamesFromRoadmap — auto-generate games from modules
- [x] getGameState — overall game state summary
- [x] getStatus — service status
- [x] generateTerminalView — terminal-friendly game view
- [x] API endpoints — /api/game-design/* (12 endpoints)
- [x] MCP tools — 15 tools for game design operations

### spaced-repetition (complete)
- [x] SpacedRepetitionService — src/services/spaced-repetition/SpacedRepetitionService.ts
- [x] createCard — create SRS card
- [x] getCard — get card by ID
- [x] listCards — list with filtering (type, deck, tag, due, suspended)
- [x] updateCard — update card content/tags/suspended
- [x] deleteCard — remove card
- [x] createDeck — create card deck
- [x] getDeck — get deck by ID
- [x] listDecks — list all decks
- [x] addCardToDeck — add card to deck
- [x] removeCardFromDeck — remove card from deck
- [x] getDueCards — get cards due for review
- [x] startReviewSession — start review session
- [x] recordReview — record response with SM-2 algorithm
- [x] completeSession — complete review session
- [x] getSessions — list review sessions
- [x] getSession — get specific session
- [x] generateCardsFromSkills — auto-generate from knowledge graph
- [x] generateCardsFromPatterns — auto-generate from memory patterns
- [x] getLearningStats — learning statistics
- [x] getStatus — service status
- [x] generateTerminalView — terminal-friendly SRS view
- [x] API endpoints — /api/srs/* (19 endpoints)
- [x] MCP tools — 22 tools for SRS operations

### proposing-decks (complete)
- [x] ProposingDecksService — src/services/proposing-decks/ProposingDecksService.ts
- [x] getDailyReviewSummary — get today's review summary
- [x] generateDailyDeck — generate daily decks (knowledge + proposals)
- [x] listDecks — list review decks with filtering
- [x] getDeck — get specific deck details
- [x] startReview — start reviewing a deck
- [x] completeReview — complete deck review with results
- [x] skipDeck — skip a deck with reason
- [x] getSchedule — get generation schedule
- [x] configureSchedule — configure auto-generation schedule
- [x] getStats — get service statistics (streak, completion rates)
- [x] getHistory — get review history
- [x] DreamEngine integration for proposal decks
- [x] SpacedRepetitionService integration for knowledge cards
- [x] SM-2 algorithm leveraged for card scheduling
- [x] API endpoints — /api/proposing-decks/* (10 endpoints)
- [x] MCP tools — 12 tools for proposing decks operations
- [x] Terminal view for morning review
- [x] Foundation for "wake up to decks ready for review"
- [x] See src/services/proposing-decks/ProposingDecksService.ts

### proactive-messaging (complete)
- [x] ProactiveMessagingService — src/services/proactive-messaging/ProactiveMessagingService.ts
- [x] TerminalAdapter — console + OS notifications
- [x] SlackAdapter — Bolt SDK with Block Kit buttons
- [x] MessageFormatter — terminal-style formatting for all channels
- [x] ConversationState — track pending interactions
- [x] notify — send events to all channels
- [x] notifyGateWaiting — gate approval notifications with buttons
- [x] notifyLoopComplete — loop completion notifications
- [x] notifyDreamProposalsReady — proposal deck notifications
- [x] notifyExecutorBlocked — blocker notifications
- [x] notifyError — error/warning notifications
- [x] notifyDeckReady — deck ready notifications
- [x] configureChannel — enable/disable and configure channels
- [x] getChannelStatus — connection status per channel
- [x] getPendingInteractions — interactions awaiting response
- [x] API endpoints — /api/messaging/* (6 endpoints)
- [x] MCP tools — 10 tools for messaging operations
- [x] Bidirectional Slack interaction via Socket Mode
- [x] Foundation for "work from anywhere" async loops
- [x] See src/services/proactive-messaging/ProactiveMessagingService.ts

### slack-integration (complete)
- [x] SlackIntegrationService — src/services/slack-integration/SlackIntegrationService.ts
- [x] SlackCommandParser — semantic command parsing from text
- [x] SlackThreadManager — thread-per-execution tracking
- [x] SlackMergeWorkflow — merge/rebase coordination
- [x] types — SlackChannelConfig, SemanticCommand, ExecutionThread, EngineerStatus
- [x] handleMessage — route incoming messages to handlers
- [x] handleButtonClick — handle Slack button interactions
- [x] handleStartLoop — start loop from Slack command
- [x] handleApproval — approve gates from Slack
- [x] handleMerge/handleRebase — git operations from Slack
- [x] handleCapture — inbox capture from Slack
- [x] API endpoints — /api/slack/* (8 endpoints)
- [x] MCP tools — 15 tools for Slack integration
- [x] Tests — 55 tests passing (slackIntegration.test.ts)
- [x] See src/services/slack-integration/SlackIntegrationService.ts

### ooda-clocks-visual (complete)
- [x] OODAClockService — src/services/ooda-clock/OODAClockService.ts
- [x] RhythmAnalyzer — src/services/ooda-clock/RhythmAnalyzer.ts
- [x] Types — src/services/ooda-clock/types.ts
- [x] MCP tools — src/tools/oodaClockTools.ts
- [x] Dashboard page — apps/dashboard/app/ooda-clock/page.tsx
- [x] Execution view — apps/dashboard/app/ooda-clock/[executionId]/page.tsx
- [x] OODAClock component — circular visualization container
- [x] ClockFace component — SVG with OODA quadrants
- [x] EventMarker component — individual events on clock
- [x] EventArc component — duration arcs
- [x] PlaybackControls component — replay functionality
- [x] ClockLegend component — color/shape legend
- [x] Navigation link — Added to layout.tsx
- [x] See ARCHITECTURE.md for full design documentation

---

## Completion Algebra

```
System.done = ALL(Module.done)
            = skill-registry.done AND loop-composer.done AND execution-engine.done
              AND memory-service.done AND learning-service.done AND calibration-service.done
              AND inbox-processor.done AND run-archival.done AND guarantee-service.done
              AND loop-guarantee-aggregator.done AND deliverable-manager.done
              AND version-utility.done AND http-server.done AND loop-commands.done
              AND analytics.done AND learning.done AND roadmapping.done
              AND knowledge-graph.done AND orchestration.done AND kanban.done
              AND patterns-roundup.done AND scoring.done AND autonomous.done
              AND dreaming.done AND multi-agent-worktrees.done
              AND mece-opportunity-mapping.done AND coherence-system.done
              AND loop-sequencing.done AND skill-trees.done AND game-design.done
              AND ooda-clocks-visual.done AND slack-integration.done
              AND spaced-repetition.done AND proposing-decks.done
              AND proactive-messaging.done

Current: 34/34 modules complete (100%)
Pending: None
Status: Core operational + autonomy layer + intelligence layer
Version: 1.2.0
```

---

## Active Loops

| Loop | Phase | Scope | Started | Last Update |
|------|-------|-------|---------|-------------|
| (none) | | | | |

---

## Recent Completions

> Last 5 completed loop runs for this system.

| Date | Loop | Scope | Outcome | Key Deliverables |
|------|------|-------|---------|------------------|
| 2026-02-02 | engineering-loop | slack-integration | success | SlackIntegrationService, 8 API endpoints, 15 MCP tools, full bidirectional control |
| 2026-02-01 | engineering-loop | proactive-messaging | success | ProactiveMessagingService, 6 API endpoints, 10 MCP tools, Slack bidirectional |
| 2026-02-01 | engineering-loop | proposing-decks | success | ProposingDecksService, 10 API endpoints, 12 MCP tools, morning review decks |
| 2026-02-01 | engineering-loop | spaced-repetition | success | SpacedRepetitionService, 19 API endpoints, 22 MCP tools, SM-2 algorithm |
| 2026-02-01 | engineering-loop | game-design | success | GameDesignService, 12 API endpoints, 15 MCP tools, finite/infinite game framing |
| 2026-02-01 | engineering-loop | skill-trees | success | SkillTreeService, 13 API endpoints, 13 MCP tools, DAG visualization |
| 2026-02-01 | engineering-loop | loop-sequencing | success | LoopSequencingService, 11 API endpoints, 12 MCP tools, multi-move planning |
| 2026-02-01 | engineering-loop | coherence-system | success | CoherenceService, 7 API endpoints, 7 MCP tools, 10 validation rules across 8 domains |
| 2026-02-01 | engineering-loop | mece-opportunity-mapping | success | MECEOpportunityService, 10 API endpoints, 12 MCP tools, gap/overlap detection |
| 2026-02-01 | engineering-loop | multi-agent-worktrees | success | MultiAgentCoordinator, 20 API endpoints, 24 MCP tools, parallel development coordination |
| 2026-02-01 | engineering-loop | dreaming | success | DreamEngine, 11 API endpoints, 12 MCP tools, idle proposal generation |
| 2026-02-01 | engineering-loop | autonomous | success | AutonomousExecutor, 8 API endpoints, 9 MCP tools, background execution |
| 2026-02-01 | engineering-loop | scoring | success | ScoringService, 8 API endpoints, 8 MCP tools, system scorecard |
| 2026-02-01 | engineering-loop | patterns-roundup | success | PatternsService, 6 API endpoints, 6 MCP tools, pattern detection |
| 2026-02-01 | engineering-loop | kanban | success | Dashboard roadmap page, layer visualization, leverage scoring panel |
| 2026-02-01 | engineering-loop | 2-layer-orchestration | success | OrchestrationService, AgentManager, WorktreeManager, 15 API endpoints, 17 MCP tools |
| 2026-01-31 | engineering-loop | knowledge-graph-ontology | success | KnowledgeGraphService, 17 API endpoints, 19 MCP tools |
| 2026-01-31 | engineering-loop | roadmapping-module | success | RoadmapService, 10 API endpoints, leverage integration |

---

## Dependencies

**Depends on:** None (root system)

**Depended on by:** dashboard, all other projects using orchestrator

---

## Notes

- Architecture v1.0.0 established 2025-01-29
- 54+ MCP tools operational
- 11 loop definitions with unified architecture (Organization → System → Module)
- Run archival system operational
- Deep Context Protocol active across all loops (v1.0.0 - 2025-01-29)
  - Global instructions in ~/.claude/CLAUDE.md
  - Shared protocol in commands/_shared/clarification-protocol.md
  - Per-loop Clarification Protocol sections
  - Terrain Check: uphill/downhill forcing function after every response
- Docs Alignment skill (v1.0.0 - 2025-01-29)
  - MECE documentation taxonomy
  - Automatic alignment after every loop COMPLETE phase
  - Dream State updates, cross-reference validation, indexing
  - See `skills/docs-alignment/SKILL.md`
- Learning System v2 (v2.0.0 - 2026-01-30)
  - Rubric scoring: completeness, quality, friction, relevance
  - Section recommendations for skill improvement
  - Threshold-based upgrade proposal generation
  - complete_run_tracking for learning persistence
  - See ADR-002 in memory/orchestrator.json
- Leverage Protocol (v1.0.0 - 2026-01-30)
  - Value equation: (DSA×0.40 + Unlock×0.25 + Likelihood×0.15) / (Time×0.10 + Effort×0.10)
  - Internal mode after every response (not surfaced)
  - External mode at loop boundaries (always propose next loop)
  - See commands/_shared/leverage-protocol.md
- Version Alignment (v1.0.0 - 2026-01-30)
  - Single source of truth in package.json
  - src/version.ts reads at runtime
  - distribution-loop bumps version during INIT phase
  - See ADR-004 in memory/orchestrator.json
- Guarantee System (v1.0.0 - 2026-01-30)
  - Belt-and-suspenders guarantee enforcement
  - Skill guarantees aggregate to loop guarantees
  - Autonomous mode validation
- Deliverable Organization (v1.0.0 - 2026-01-30)
  - Structured deliverable storage per execution
  - Consistent paths: deliverables/{executionId}/{phase}/{filename}
- Self-Improvement Architecture (v1.0.0 - 2026-01-31)
  - Two-module design: Analytics (observe) + Learning (improve)
  - Analytics reads from all services, surfaces insights
  - Learning processes signals, generates proposals, applies upgrades
  - Feedback loop: Execute → Analytics → Learning → improved skills → Execute
  - See src/services/analytics/DREAM-STATE.md and src/services/learning/DREAM-STATE.md
- Hierarchy Simplification (ADR-006 - 2026-01-31)
  - Simplified from 4-tier (Org→Domain→System→Module) to 3-tier (Org→System→Module)
  - Systems ladder directly to Org dream state
  - Clearer mental model, less confusion around "domain" concept
- Seven-Layer Roadmap Architecture (ADR-007 - 2026-01-31)
  - L0 Foundation, L1 Visualization, L2 Autonomy, L3 Intelligence, L4 Interface, L5 Domain Loops, L6 Meta, L7 Sovereignty
  - 32 new modules planned across 7 layers
  - Dependencies flow upward through layers
  - See ROADMAP.md for full details
- Key Concepts Captured (PAT-011 through PAT-014 - 2026-01-31)
  - ADIR reasoning cycle (Abductive→Deductive→Inductive→Reflexive)
  - Context Delta schema for reflexive phase output
  - Finite/infinite game framing for hierarchy levels
  - Loop sequencing (chess-line multi-move planning)
- Knowledge Graph Ontology (v1.0.0 - 2026-01-31)
  - Skills as only primitive (nodes); everything else is metadata or derived
  - Objective ontology: about skills themselves, not personal proficiency
  - Five edge types: depends_on, tag_cluster, sequence, co_executed, improved_by
  - PageRank-like leverage scoring for centrality
  - Gap analysis: missing dependencies, isolated skills, weak clusters, phase gaps
  - See src/services/knowledge-graph/DREAM-STATE.md
- 2-Layer Orchestration (v1.0.0 - 2026-02-01)
  - Layer 1: System Orchestrator (persistent, human-facing portal)
  - Layer 2: Task Agents (ephemeral, module-scoped workers)
  - Git worktrees per module for isolation and parallel development
  - Concurrency modes: sequential, parallel-async, parallel-threads
  - Failure cascade: retry → reassign → escalate (human as last resort)
  - Leverage-driven work assignment via RoadmapService
  - Foundation for autonomous, dreaming, multi-agent-worktrees
  - See src/services/orchestration/DREAM-STATE.md
- Kanban Visualization (v1.0.0 - 2026-02-01)
  - Linear-style dashboard at /roadmap showing module ladder
  - 7-layer visualization (0-6) with collapsible sections
  - Leverage scoring panel highlighting next highest-value work
  - Module cards with status, dependencies, expand/collapse details
  - Delegation-ready for worktree-based parallel development
  - See skills/kanban/DREAM-STATE.md
- Patterns Roundup (v1.0.0 - 2026-02-01)
  - PatternsService with query, roundup, and detection capabilities
  - Behavioral pattern detection from run archives (success/failure/skip patterns)
  - Codebase pattern detection from skill documentation
  - Gap analysis for 8 pattern categories (security, testing, etc.)
  - Formalization workflow: detect → review → formalize into memory
  - 6 API endpoints at /api/patterns/*
  - 6 MCP tools for pattern operations
  - See skills/patterns-roundup/DREAM-STATE.md
- Scoring Module (v1.0.0 - 2026-02-01)
  - ScoringService unifying metrics from Roadmap, Analytics, Calibration
  - 5-component module scoring: dreamStateAlignment, downstreamImpact, completionValue, executionQuality, strategicPosition
  - System health score with completion, quality, momentum, and risk metrics
  - Historical tracking with trend analysis
  - Terminal-friendly scorecard visualization
  - 8 API endpoints at /api/scoring/*
  - 8 MCP tools for scoring operations
  - See skills/scoring/DREAM-STATE.md
- Autonomous Module (v1.0.0 - 2026-02-01)
  - AutonomousExecutor for background loop execution
  - Auto-approval of gates based on approvalType (auto, conditional)
  - Auto-advancement of phases when skills complete
  - Configurable tick interval, max parallel executions, retry limits
  - Gate auto-approval respects guarantee validation
  - Only autonomy='full' executions are processed automatically
  - 8 API endpoints at /api/autonomous/*
  - 9 MCP tools for autonomous control
  - Foundation for "it works while I sleep" capability
  - See src/services/autonomous/AutonomousExecutor.ts
- Dreaming Module (v1.0.0 - 2026-02-01)
  - DreamEngine for background proposal generation during idle periods
  - Idle detection based on last activity timestamps
  - Three proposal types: new-module, skill-improvement, pattern-capture
  - Analyzes blocked modules from RoadmapService
  - Pulls skill improvement proposals from LearningService
  - Detects pattern gaps from PatternsService
  - Proposal lifecycle: pending → approved/rejected → implemented
  - Configurable idle threshold, dream interval, max proposals per cycle
  - Dream session tracking with timestamps and proposal counts
  - 11 API endpoints at /api/dreaming/*
  - 12 MCP tools for dreaming control
  - Foundation for "wake up to proposals" capability
  - See src/services/dreaming/DreamEngine.ts
- Multi-Agent Worktrees Module (v1.0.0 - 2026-02-01)
  - MultiAgentCoordinator for parallel development across collaborators
  - Collaborator management: register, list, disconnect, track activity
  - Agent sets: group agents by collaborator with lifecycle control
  - Resource reservations: claim modules/files/paths for exclusive work
  - Merge queue: coordinated merging to avoid conflicts
  - Conflict detection: reservation conflicts, merge conflicts, active agent conflicts
  - Cross-collaborator visibility: see what everyone is working on
  - Background tasks: automatic merge checking, reservation cleanup
  - Integrates with AgentManager and WorktreeManager from orchestration module
  - 20 API endpoints at /api/multi-agent/*
  - 24 MCP tools for multi-agent coordination
  - Foundation for team-based parallel development with isolated worktrees
  - See src/services/multi-agent/MultiAgentCoordinator.ts
- MECE Opportunity Mapping Module (v1.0.0 - 2026-02-01)
  - MECEOpportunityService for complete roadmap coverage analysis
  - MECE principle: Mutually Exclusive (no overlaps), Collectively Exhaustive (no gaps)
  - 9-category default taxonomy: Foundation, Execution, Intelligence, Visualization, Autonomy, Interface, Domain, Meta, Sovereignty
  - Opportunity collection from roadmap modules, skills, and patterns
  - Automatic classification using keyword matching
  - Gap detection: missing categories, empty subcategories, stagnant categories
  - Overlap detection: similar titles, same source, circular dependencies
  - Recommendation generation with priority scoring
  - Coverage metrics per category and overall system
  - 10 API endpoints at /api/mece/*
  - 12 MCP tools for MECE operations
  - Foundation for ensuring no blind spots in roadmap planning
  - See src/services/mece/MECEOpportunityService.ts
- Coherence System Module (v1.0.0 - 2026-02-01)
  - CoherenceService validates alignment across all orchestrator components
  - 8 alignment domains: dream-roadmap, skill-loop, pattern-impl, graph-skill, mece-roadmap, dependency-order, memory-consistency, version-sync
  - 10 validation rules detecting orphans, conflicts, misalignments
  - Domain scoring (0-1) aggregates to overall coherence score
  - Issue tracking with severity levels (critical, warning, info) and status workflow
  - Recommendation generation prioritized by severity and impact
  - Terminal-friendly coherence dashboard view
  - 7 API endpoints at /api/coherence/*
  - 7 MCP tools for coherence operations
  - Foundation for "spec-driven organization" where all components stay aligned
  - See src/services/coherence/CoherenceService.ts
- Loop Sequencing Module (v1.0.0 - 2026-02-01)
  - LoopSequencingService for multi-move planning beyond single leverage decisions
  - Chess-inspired "line" thinking: look multiple moves ahead
  - NLP-like pattern detection of loop co-occurrence
  - Transition tracking: which loops commonly follow which
  - Sequence detection: 3-5 loop patterns that recur
  - Line generation: multi-move plans with compound leverage scoring
  - Confidence calculation based on historical transition success rates
  - Risk identification for weak transitions
  - Alternative suggestion for each move
  - 11 API endpoints at /api/sequencing/*
  - 12 MCP tools for sequencing operations
  - Foundation for sophisticated autonomous decision-making
  - See src/services/loop-sequencing/LoopSequencingService.ts
- Skill Trees Module (v1.0.0 - 2026-02-01)
  - SkillTreeService for DAG visualization of skill relationships
  - Interface to the skill-based ontology from knowledge graph
  - Domain filtering: generate trees by phase, tag, category, or loop
  - Tree structure: nodes with depth, parents, children, hub detection
  - Critical path calculation through highest-leverage skills
  - Suggested learning order via topological sort
  - Progression tracking: locked → available → in-progress → familiar → mastered
  - Learning path generation to reach target skills
  - Prerequisite detection and recursive dependency resolution
  - Terminal-friendly tree visualization with depth-based rendering
  - 13 API endpoints at /api/skill-trees/*
  - 13 MCP tools for skill tree operations
  - Foundation for user skill familiarity and learning navigation
  - See src/services/skill-trees/SkillTreeService.ts
- Game Design Module (v1.0.0 - 2026-02-01)
  - GameDesignService for finite/infinite game framing of dream state ladders
  - Finite games for module→system scope with win conditions and checkpoints
  - Infinite games for organization scope with principles and health metrics
  - Three game levels: module (finite), system (finite), organization (infinite)
  - Win condition tracking: metric-based targets with satisfaction evidence
  - Checkpoint milestones with celebration messages
  - Auto-generation of games from roadmap modules
  - Progress calculation blending checkpoints (60%) and final conditions (40%)
  - Health metric tracking with trend analysis (improving/stable/declining)
  - Principle-based play for infinite games (examples and violations)
  - Terminal-friendly game status visualization
  - 12 API endpoints at /api/game-design/*
  - 15 MCP tools for game design operations
  - Foundation for gamified roadmap progression and mission framing
  - See src/services/game-design/GameDesignService.ts
- Spaced Repetition Module (v1.0.0 - 2026-02-01)
  - SpacedRepetitionService for SRS-based skill mastery and knowledge retention
  - SM-2 algorithm implementation for optimal review scheduling
  - Card types: skill, pattern, concept, custom
  - Response quality scale: 0-5 (0-2 fail, 3 hard, 4 good, 5 easy)
  - Ease factor adjustment (min 1.3, default 2.5)
  - Interval progression: 1 day → 4 days → exponential growth
  - Deck management with daily new/review limits
  - Review session tracking with time spent and correctness
  - Streak tracking for consecutive study days
  - Card maturity levels: new → young (<21 days) → mature (≥21 days) → mastered (≥30 days)
  - Auto-generation from knowledge graph skills
  - Auto-generation from memory patterns
  - Terminal-friendly SRS status visualization
  - 19 API endpoints at /api/srs/*
  - 22 MCP tools for SRS operations
  - Foundation for internalized skill knowledge through timed review
  - Unlocks proposing-decks module capability
  - See src/services/spaced-repetition/SpacedRepetitionService.ts
- Slack Integration Module (v1.0.0 - 2026-02-02)
  - SlackIntegrationService for full bidirectional Slack control
  - SlackCommandParser for semantic command parsing
  - SlackThreadManager for thread-per-execution tracking
  - SlackMergeWorkflow for merge/rebase coordination
  - Command types: start_loop, go, approved, reject, merge, rebase, status, show, capture
  - Engineer status tracking with activity timestamps
  - Channel = Engineer = Worktree = Branch model
  - Conflict detection and cross-engineer coordination
  - 8 API endpoints at /api/slack/*
  - 15 MCP tools for Slack integration
  - 55 tests covering all components
  - Foundation for "work from Slack" async orchestration
  - See src/services/slack-integration/SlackIntegrationService.ts

---

## Architecture Evolution v2.0 (2026-02-03)

> Strategic direction for the next phase of orchestrator development.

### Three-Layer Persistence Architecture

The system persistence is organized into three layers with distinct ownership:

```
┌─────────────────────────────────────────────────────────────┐
│                 THREE-LAYER ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1: Orchestrator Core (immutable knowledge)           │
│  ├── skills/*  (skill definitions)                          │
│  ├── loops/*   (loop definitions)                           │
│  ├── commands/*.md (slash commands)                         │
│  └── memory/orchestrator.json (patterns, decisions)         │
│                                                             │
│  LAYER 2: User Context (travels with user)                  │
│  ├── ~/.claude/profile.json (user identity, preferences)    │
│  ├── ~/.claude/calibration/ (estimate accuracy)             │
│  ├── ~/.claude/preferences.json (UI, notification prefs)    │
│  └── ~/.claude/commands/ (user commands)                    │
│                                                             │
│  LAYER 3: Project Context (stays with project)              │
│  ├── {project}/.claude/DREAM-STATE.md                       │
│  ├── {project}/.claude/runs/ (archived executions)          │
│  ├── {project}/.claude/memory.json (project patterns)       │
│  └── {project}/ROADMAP.md (module ladder)                   │
└─────────────────────────────────────────────────────────────┘
```

### Active vs Passive Mode

Mode governs what can mutate when the user is away:

| Mode | Human Presence | Layer 3 | Notification Style |
|------|----------------|---------|-------------------|
| **Active** | Present | Mutable | Interactive prompts |
| **Passive** | Away | Read-only | Queue to inbox |

Active mode: Human-in-loop, executing work, mutable project state.
Passive mode: Autonomous observation, proposals queued to user inbox.

*Note: Mode architecture documented in deferred dreaming module scope (ROADMAP.md).*

### Execution Model Improvements

| Improvement | Description | Task |
|-------------|-------------|------|
| **Per-loop transient state** | Each loop has `{loop-id}-state.json` pattern | #1 |
| **Resolve guarantee** | "I satisfied the guarantee another way" semantic | Done |
| **Retry deliverable** | Explicit retry path for failed deliverables | #3 |
| **Version patch default** | Versions advance 1.0.x by default | #5 |
| **Gate CRUD** | Add/remove/disable gates dynamically | #6 |
| **Clean shutdown** | Registry for server, loops, agents cleanup | #7 |

### Quality & Context Improvements

| Improvement | Description | Task |
|-------------|-------------|------|
| **Taxonomy audit** | Review skill/loop categories and guarantees | #4 |
| **User profile** | Canonical ~/.claude/profile.json structure | #9 |
| **Context cultivation loops** | /gotchas, /guarantee for coherence discovery | #10 |
| **Architecture documentation** | Formalize three-layer model | #11 |

### Key Findings

1. **AGENTS.md vs SKILL.md**: Complementary, not competing. AGENTS.md is cross-tool project context; SKILL.md is structured reusable capabilities. Our system is more sophisticated.

2. **Persistence inventory**: Discovered 5 layers of persistence across memory/, data/, skills/, loops/, ~/.claude/, and project .claude/ directories.

3. **Guarantee resolution**: Implemented new semantic allowing guarantee intent to be acknowledged when formal checks fail but intent is satisfied.

### Next Phase Priority

The highest-leverage tasks for v2.0:

1. **Gate CRUD** (#6) — Enables mobile workflow flexibility
2. **User profile** (#9) — Foundation for Layer 2
3. **Clean shutdown** (#7) — Operational reliability
4. **Context cultivation loops** (#10) — Coherence discovery
