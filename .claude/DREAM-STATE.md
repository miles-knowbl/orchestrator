# System Dream State: orchestrator

> Autonomous, coherent, local-first system that compounds leverage through skill-based ontology.

| Field | Value |
|-------|-------|
| **Organization** | superorganism |
| **Location** | ~/workspaces/orchestrator |
| **Roadmap** | ./roadmap.json (29 active + 30 deferred = 59 total modules) |

---

## Vision

A self-improving meta-system where skills are the atomic primitive. Orchestrator manages skills, composes them into loops, executes loops with quality gates, learns from every execution, and maintains context across sessions. The system should enable "show up, say go" workflows where complex engineering tasks are decomposed and executed with rigor.

## Dream Statement

Autonomous, coherent, local-first system that compounds leverage through skill-based ontology.

---

## Modules

| Module | Path | Status | Functions | Progress |
|--------|------|--------|-----------|----------|
| skill-registry | src/services/SkillRegistry.ts | complete | 6/6 | 100% |
| loop-composer | src/services/LoopComposer.ts | complete | 5/5 | 100% |
| execution-engine | src/services/ExecutionEngine.ts | complete | 10/10 | 100% |
| memory-service | src/services/MemoryService.ts | complete | 6/6 | 100% |
| learning-service | src/services/learning/ | complete | 15/15 | 100% |
| calibration-service | src/services/CalibrationService.ts | complete | 4/4 | 100% |
| inbox-processor | src/services/InboxProcessor.ts | complete | 5/5 | 100% |
| run-archival | src/services/RunArchivalService.ts | complete | 5/5 | 100% |
| guarantee-service | src/services/GuaranteeService.ts | complete | 12/12 | 100% |
| deliverable-manager | src/services/DeliverableManager.ts | complete | 5/5 | 100% |
| analytics | src/services/analytics/ | complete | 14/14 | 100% |
| dream-state-service | src/services/dream-state/ | complete | 12/12 | 100% |
| 2-layer-orchestration | src/services/orchestration/ | complete | 21/21 | 100% |
| knowledge-graph-ontology | src/services/knowledge-graph/ | complete | 22/22 | 100% |
| roadmapping | src/services/roadmapping/ | complete | 10/10 | 100% |
| autonomous | src/services/autonomous/ | complete | 14/14 | 100% |
| kanban | apps/dashboard/app/roadmap/ | complete | 8/8 | 100% |
| loop-sequencing | src/services/loop-sequencing/ | complete | 14/14 | 100% |
| multi-agent-worktrees | src/services/multi-agent/ | complete | 21/21 | 100% |
| ooda-clocks-visual | src/services/ooda-clock/ | complete | 9/9 | 100% |
| skill-trees | src/services/skill-trees/ | complete | 16/16 | 100% |
| coherence-system | src/services/coherence/ | complete | 13/13 | 100% |
| mece-opportunity-mapping | src/services/mece/ | complete | 15/15 | 100% |
| patterns-roundup | src/services/patterns/ | complete | 9/9 | 100% |
| scoring | src/services/scoring/ | complete | 11/11 | 100% |
| proactive-messaging | src/services/proactive-messaging/ | complete | 18/18 | 100% |
| slack-integration | src/services/slack/ | complete | 5/5 | 100% |
| voice | src/services/voice/ | complete | 14/14 | 100% |
| knopilot | src/services/knopilot/ | complete | 22/22 | 100% |

---

## Module Checklists

### skill-registry (complete)

- [x] list_skills -- filter by phase/category/query
- [x] get_skill -- full content with references
- [x] create_skill -- draft new skill
- [x] update_skill -- edit with version bump
- [x] search_skills -- keyword search
- [x] capture_improvement -- log feedback for skill

### loop-composer (complete)

- [x] list_loops -- available loops
- [x] get_loop -- definition with skills
- [x] create_loop -- compose from skills
- [x] validate_loop -- check composition
- [x] compose_from_skills -- create loop from skill list

### execution-engine (complete)

- [x] start_execution -- begin loop run
- [x] get_execution -- current state
- [x] advance_phase -- move to next phase
- [x] complete_phase -- mark current phase complete
- [x] complete_skill -- mark skill complete
- [x] skip_skill -- skip with reason
- [x] approve_gate -- pass quality gate
- [x] reject_gate -- block at gate with feedback
- [x] pause_execution -- pause execution
- [x] resume_execution -- resume execution

### memory-service (complete)

- [x] get_memory -- read at any level
- [x] update_summary -- write memory summary
- [x] record_decision -- add ADR
- [x] record_pattern -- add learned pattern
- [x] create_handoff -- session summary
- [x] load_context -- cold boot context

### learning-service (complete)

- [x] capture_skill_improvement -- log improvement
- [x] list_proposals -- pending proposals
- [x] apply_proposal -- apply approved proposal
- [x] approve_proposal -- approve for application
- [x] reject_proposal -- reject with reason
- [x] get_skill_metrics -- metrics by skill
- [x] get_learning_status -- overall status
- [x] identify_underutilized_skills -- find unused skills
- [x] processAnalyticsSignals -- consume analytics
- [x] identifyLowHealthSkills -- find below threshold
- [x] generateSkillProposal -- create improvement proposal
- [x] prioritizeProposals -- leverage scoring
- [x] runImprovementCycle -- full analyze/propose/apply
- [x] getImprovementQueue -- prioritized queue
- [x] getImprovementHistory -- past improvements

### calibration-service (complete)

- [x] get_calibrated_estimate -- calibrated effort estimate
- [x] record_estimate_result -- record actual vs estimate
- [x] get_calibration_report -- accuracy report
- [x] get_calibration_recommendations -- improvement suggestions

### inbox-processor (complete)

- [x] add_to_inbox -- add paste/conversation
- [x] add_url_to_inbox -- fetch URL content
- [x] list_inbox -- list items
- [x] process_inbox_item -- extract skills via AI
- [x] approve_extraction -- create skill from extraction

### run-archival (complete)

- [x] query_runs -- search historical runs
- [x] archive_run -- archive completed run
- [x] get_recent_context -- recent context for cold boot
- [x] createRunSummary -- generate run summary
- [x] pruneStateFile -- clean up state file

### guarantee-service (complete)

- [x] registerSkillGuarantee -- register guarantee
- [x] getSkillGuarantees -- get guarantees for skill
- [x] validateGuarantees -- validate at gate
- [x] enforceGuarantees -- block if failed
- [x] getLoopGuaranteeMap -- map for loop
- [x] aggregateLoopGuarantees -- aggregate all
- [x] setAggregator -- set aggregation strategy
- [x] getRegistryVersion -- registry version
- [x] aggregateForLoop -- aggregate for specific loop
- [x] aggregateAll -- aggregate all loops
- [x] getSummary -- aggregation summary
- [x] getLoopGuarantees -- guarantees by loop

### deliverable-manager (complete)

- [x] initialize -- setup deliverables dir
- [x] storeDeliverable -- store deliverable
- [x] getDeliverable -- retrieve deliverable
- [x] listDeliverables -- list for execution
- [x] getDeliverablePath -- get path for deliverable

### analytics (complete)

- [x] collectRunMetrics -- parse run archives
- [x] collectRubricMetrics -- aggregate from LearningService
- [x] collectCalibrationMetrics -- pull from CalibrationService
- [x] collectGateMetrics -- extract from run archives
- [x] collectPatternMetrics -- pull from MemoryService
- [x] collectProposalMetrics -- pull from LearningService
- [x] computeAggregates -- rates, averages, trends
- [x] getAnalyticsSummary -- dashboard-ready summary
- [x] getSkillHealth -- rankings by rubric dimension
- [x] getLoopPerformance -- duration/success metrics
- [x] getCalibrationAccuracy -- estimate accuracy trends
- [x] getTrends -- time-series data
- [x] API endpoints -- /api/analytics/* (11 endpoints)
- [x] Dashboard view -- apps/dashboard/app/analytics/page.tsx

### dream-state-service (complete)

- [x] load -- load dream state from JSON
- [x] save -- persist dream state
- [x] getDreamState -- get current state
- [x] getCompletionAlgebra -- calculate module/function counts
- [x] getModule -- get specific module
- [x] updateModuleStatus -- update module status
- [x] updateFunction -- update function completion
- [x] addModule -- add new module
- [x] syncFromRoadmap -- sync status from roadmap
- [x] recordCompletion -- record loop completion
- [x] setActiveLoops -- set currently active loops
- [x] renderMarkdown -- generate markdown view

### 2-layer-orchestration (complete)

- [x] initializeOrchestrator -- create/resume Layer 1 orchestrator
- [x] setDependencies -- wire up services
- [x] getOrchestrator -- get orchestrator state
- [x] getNextWorkItems -- leverage-scored work items
- [x] spawnAgentsForWork -- spawn Layer 2 agents
- [x] handleAgentComplete -- handle agent completion
- [x] handleAgentFailed -- handle escalation
- [x] runAutonomousCycle -- full autonomous cycle
- [x] getAgents -- list all agents
- [x] getAgent -- get specific agent
- [x] getWorkQueue -- work queue state
- [x] getEventLog -- orchestration events
- [x] getProgressSummary -- dashboard summary
- [x] pause/resume/shutdown -- orchestrator lifecycle
- [x] generateTerminalView -- terminal visualization
- [x] AgentManager -- spawn, monitor, coordinate agents
- [x] WorktreeManager -- git worktree per module
- [x] Concurrency modes -- sequential, parallel-async, parallel-threads
- [x] Failure cascade -- retry/reassign/escalate
- [x] API endpoints -- /api/orchestration/* (15 endpoints)
- [x] MCP tools -- 17 tools

### knowledge-graph-ontology (complete)

- [x] build -- build/rebuild from skills and run archives
- [x] load/save -- persist to JSON
- [x] getGraph -- full graph structure
- [x] getNode -- single node with edges
- [x] getNodesByPhase -- filter by phase
- [x] getNodesByTag -- filter by tag
- [x] getEdges -- incoming/outgoing for skill
- [x] getEdgesByType -- filter by edge type
- [x] getNeighbors -- connected skills
- [x] findPath -- BFS path between skills
- [x] getClusters -- all clusters
- [x] getClusterByTag -- specific cluster
- [x] getHighLeverageSkills -- top leverage skills
- [x] getIsolatedSkills -- unconnected skills
- [x] getUnusedSkills -- stale skills
- [x] analyzeGaps -- full gap analysis
- [x] getStats -- graph statistics
- [x] refreshNode -- refresh single node
- [x] removeNode -- remove node and edges
- [x] generateTerminalView -- terminal visualization
- [x] API endpoints -- /api/knowledge-graph/* (17 endpoints)
- [x] MCP tools -- 19 tools

### roadmapping (complete)

- [x] load -- load roadmap from JSON
- [x] save -- persist roadmap
- [x] getRoadmap -- get current roadmap
- [x] getModule -- get specific module
- [x] updateModuleStatus -- update status
- [x] getProgress -- calculate progress
- [x] getNextModule -- get next recommended module
- [x] getLeverageScores -- calculate leverage scores
- [x] onSave -- register save callbacks
- [x] isLoaded -- check if loaded

### autonomous (complete)

- [x] AutonomousExecutor -- src/services/autonomous/AutonomousExecutor.ts
- [x] start/stop/pause/resume -- background lifecycle control
- [x] tick -- single autonomous processing cycle
- [x] getStatus -- current executor state
- [x] configure -- update tick interval, max parallel, max retries
- [x] canAutoApprove -- check if gate can be auto-approved
- [x] tryAutoApproveGates -- auto-approve based on approvalType
- [x] tryCompletePhase -- auto-complete when skills done
- [x] tryAdvancePhase -- auto-advance when gates approved
- [x] getAutonomousExecutions -- list autonomy=full executions
- [x] getEligibleExecutions -- list autonomy=full|supervised
- [x] Guarantee validation -- validates before auto-approval
- [x] API endpoints -- /api/autonomous/* (8 endpoints)
- [x] MCP tools -- 9 tools for autonomous control

### kanban (complete)

- [x] Dashboard page -- apps/dashboard/app/roadmap/page.tsx
- [x] Navigation link -- Added to layout.tsx
- [x] Overall progress panel -- Aggregate stats with progress bar
- [x] Leverage scoring panel -- Top 3 next modules with scores
- [x] Layer sections -- Collapsible layer groupings (0-6)
- [x] Module cards -- Status, details, expand/collapse
- [x] Status indicators -- Color-coded icons per status
- [x] Critical path display -- Shows highest-impact modules

### loop-sequencing (complete)

- [x] LoopSequencingService -- src/services/loop-sequencing/LoopSequencingService.ts
- [x] analyzeRunHistory -- detect loop co-occurrence patterns
- [x] getTransitions -- list loop-to-loop transitions
- [x] getTransition -- get specific transition details
- [x] getSequences -- list multi-loop sequences
- [x] getSequence -- get specific sequence details
- [x] generateLine -- create multi-move plan
- [x] getLines -- list generated lines
- [x] getLine -- get specific line details
- [x] getLastAnalysis -- retrieve last analysis
- [x] getStatus -- current service status
- [x] generateTerminalView -- terminal-friendly view
- [x] API endpoints -- /api/sequencing/* (11 endpoints)
- [x] MCP tools -- 12 tools for sequencing operations

### multi-agent-worktrees (complete)

- [x] MultiAgentCoordinator -- src/services/multi-agent/MultiAgentCoordinator.ts
- [x] registerCollaborator -- register human collaborator
- [x] listCollaborators -- list all collaborators
- [x] getCollaborator -- get collaborator details
- [x] createAgentSet -- create agent set for collaborator
- [x] listAgentSets -- list agent sets
- [x] getAgentSet -- get agent set details
- [x] pauseAgentSet/resumeAgentSet -- lifecycle control
- [x] createReservation -- claim module/file/path
- [x] listReservations -- list reservations
- [x] releaseReservation -- release a claim
- [x] extendReservation -- extend duration
- [x] checkResourceBlocked -- check if resource is claimed
- [x] requestMerge -- request to merge worktree to main
- [x] checkMergeConflicts -- check for conflicts
- [x] executeMerge -- execute approved merge
- [x] listMergeQueue -- list merge queue
- [x] checkCanWork -- check if collaborator can work
- [x] getAllActiveWork -- cross-collaborator visibility
- [x] API endpoints -- /api/multi-agent/* (20 endpoints)
- [x] MCP tools -- 24 tools for multi-agent coordination

### ooda-clocks-visual (complete)

- [x] OODAClockService -- src/services/ooda-clock/OODAClockService.ts
- [x] RhythmAnalyzer -- src/services/ooda-clock/RhythmAnalyzer.ts
- [x] Dashboard page -- apps/dashboard/app/ooda-clock/page.tsx
- [x] Execution view -- apps/dashboard/app/ooda-clock/[executionId]/page.tsx
- [x] OODAClock component -- circular visualization container
- [x] ClockFace component -- SVG with OODA quadrants
- [x] EventMarker component -- individual events on clock
- [x] PlaybackControls component -- replay functionality
- [x] MCP tools -- src/tools/oodaClockTools.ts

### skill-trees (complete)

- [x] SkillTreeService -- src/services/skill-trees/SkillTreeService.ts
- [x] generateTree -- generate skill tree for domain
- [x] getTrees -- list all generated trees
- [x] getTree -- get specific tree by ID
- [x] getAvailableDomains -- list available domains
- [x] getProgression -- get skill progression status
- [x] updateProgression -- update skill progression
- [x] recordSkillOutput -- record user saw skill output
- [x] recordSkillUsage -- record user used skill in loop
- [x] generateLearningPath -- create learning path
- [x] getLearningPaths -- list learning paths
- [x] getLearningPath -- get specific learning path
- [x] getStatus -- service status
- [x] generateTerminalView -- terminal-friendly visualization
- [x] API endpoints -- /api/skill-trees/* (13 endpoints)
- [x] MCP tools -- 13 tools for skill tree operations

### coherence-system (complete)

- [x] CoherenceService -- src/services/coherence/CoherenceService.ts
- [x] runValidation -- run full coherence validation
- [x] getStatus -- current coherence status
- [x] getLastReport -- retrieve last validation report
- [x] getIssues -- list issues with filtering
- [x] getIssue -- get specific issue details
- [x] updateIssueStatus -- update issue status
- [x] generateTerminalView -- terminal-friendly coherence view
- [x] 10 validation rules across 8 alignment domains
- [x] Domain scoring and overall coherence score
- [x] Recommendation generation from detected issues
- [x] API endpoints -- /api/coherence/* (7 endpoints)
- [x] MCP tools -- 7 tools for coherence operations

### mece-opportunity-mapping (complete)

- [x] MECEOpportunityService -- src/services/mece/MECEOpportunityService.ts
- [x] runAnalysis -- full MECE analysis of opportunities
- [x] getTaxonomy -- get category taxonomy
- [x] setCategory -- add/update categories
- [x] getOpportunities -- list opportunities with filtering
- [x] addOpportunity -- manually add opportunity
- [x] updateOpportunity -- update opportunity status/details
- [x] removeOpportunity -- remove opportunity
- [x] getGaps -- list coverage gaps
- [x] getOverlaps -- list overlapping opportunities
- [x] getStatus -- service status summary
- [x] getLastAnalysis -- get last analysis results
- [x] generateTerminalView -- terminal-friendly coverage view
- [x] API endpoints -- /api/mece/* (10 endpoints)
- [x] MCP tools -- 12 tools for MECE operations

### patterns-roundup (complete)

- [x] PatternsService -- src/services/patterns/PatternsService.ts
- [x] queryPatterns -- Search and filter across all levels
- [x] getPattern -- Get single pattern by ID
- [x] generateRoundup -- Export formatted summary
- [x] detectBehavioralPatterns -- Detect from run archives
- [x] detectCodebasePatterns -- Detect from skills/loops
- [x] identifyPatternGaps -- Gap coverage analysis
- [x] formalizePattern -- Convert detected to formal pattern
- [x] API endpoints -- /api/patterns/* (6 endpoints)
- [x] MCP tools -- 6 tools for pattern operations

### scoring (complete)

- [x] ScoringService -- src/services/scoring/ScoringService.ts
- [x] scoreModule -- comprehensive module score (0-100)
- [x] scoreAllModules -- ranked list of all modules
- [x] scoreSystem -- system health score with metrics
- [x] getModulesNeedingAttention -- low score/blocked modules
- [x] recordHistory -- persist score snapshots
- [x] getHistory -- retrieve historical scores
- [x] getScoreTrends -- trend analysis
- [x] compareScores -- compare two points in time
- [x] generateTerminalView -- terminal-friendly scorecard
- [x] API endpoints -- /api/scoring/* (8 endpoints)
- [x] MCP tools -- 8 tools for scoring operations

### proactive-messaging (complete)

- [x] ProactiveMessagingService -- src/services/proactive-messaging/ProactiveMessagingService.ts
- [x] TerminalAdapter -- console + OS notifications
- [x] SlackAdapter -- Bolt SDK with Block Kit buttons
- [x] MessageFormatter -- terminal-style formatting
- [x] ConversationState -- track pending interactions
- [x] notify -- send events to all channels
- [x] notifyGateWaiting -- gate approval notifications
- [x] notifyLoopComplete -- loop completion notifications
- [x] notifyDreamProposalsReady -- proposal deck notifications
- [x] notifyExecutorBlocked -- blocker notifications
- [x] notifyError -- error/warning notifications
- [x] notifyDeckReady -- deck ready notifications
- [x] configureChannel -- enable/disable and configure channels
- [x] getChannelStatus -- connection status per channel
- [x] getPendingInteractions -- interactions awaiting response
- [x] sendStartupWelcome -- daily welcome with dream state progress
- [x] API endpoints -- /api/messaging/* (6 endpoints)
- [x] MCP tools -- 10 tools for messaging operations

### slack-integration (complete)

- [x] UnifiedSlackService -- src/services/slack/UnifiedSlackService.ts
- [x] CommandParser -- semantic command parsing
- [x] ThreadManager -- thread-per-execution tracking
- [x] MessageComposer -- Block Kit message composition
- [x] SlackAdapter -- proactive messaging delivery

### voice (complete)

- [x] VoiceOutputService -- src/services/voice/VoiceOutputService.ts
- [x] MacOSTTS -- macOS say command integration
- [x] SpeechQueue -- queued speech with priorities
- [x] QuietHoursManager -- time-based speech control
- [x] EventFormatter -- format events for speech
- [x] initialize -- setup TTS engine
- [x] configure -- update voice settings
- [x] speak -- queue speech
- [x] speakNow -- immediate speech (skip queue)
- [x] getQueue -- get speech queue
- [x] clearQueue -- clear pending speech
- [x] pause/resume -- speech control
- [x] getStatus -- current voice status
- [x] shouldSpeakEvent -- check if event should speak

### knopilot (complete)

- [x] KnoPilotService -- src/services/knopilot/KnoPilotService.ts
- [x] DealManager -- deal lifecycle management
- [x] ScoringEngine -- deal scoring and confidence
- [x] NBAEngine -- next best action recommendations
- [x] createDeal -- create new deal
- [x] getDeal -- get deal with intelligence
- [x] listDeals -- list with filtering
- [x] updateDeal -- update deal fields
- [x] advanceStage -- advance deal stage
- [x] addCommunication -- add communication record
- [x] processCommunication -- extract insights from communication
- [x] addStakeholder -- add stakeholder to deal
- [x] listStakeholders -- list deal stakeholders
- [x] getIntelligence -- get deal intelligence
- [x] getScores -- get deal scores
- [x] computeScores -- recalculate deal scores
- [x] getNBA -- get next best actions
- [x] generateNBA -- generate fresh NBA
- [x] getPipelineSummary -- pipeline overview
- [x] getWeeklyFocus -- weekly priorities
- [x] API endpoints -- /api/knopilot/* (20 endpoints)
- [x] MCP tools -- 18 KnoPilot tools

---

## Completion Algebra

```
System.done = ALL(Module.done)
Current: 29/29 active modules complete (100%) + 30 deferred
Pending: None
Status: 343/343 functions (100%)
Version: 1.9.4
```

---

## Active Loops

| Loop | Scope | Started | Phase |
|------|-------|---------|-------|
| *(none)* | | | |

---

## Recent Completions

| Date | Loop | Scope | Outcome | Deliverables |
|------|------|-------|---------|--------------|
| 2026-02-04 | restructure | dream-state-architecture | success | Decomposed core-infrastructure into 11 modules, added knopilot/voice/dream-state-service, moved deferred to separate file |
| 2026-02-04 | cleanup | slack-consolidation | success | Consolidated Slack services into UnifiedSlackService + SlackAdapter |
| 2026-02-01 | engineering-loop | proactive-messaging | success | ProactiveMessagingService, 6 API endpoints, 10 MCP tools |

---

## Dependencies

| Direction | Systems |
|-----------|---------|
| Depends on | *(none)* |
| Depended on by | dashboard, all other projects using orchestrator |

---

*Generated 2026-02-05 | orchestrator v1.9.4 | 29 active modules, 343 functions, 30 deferred modules*
