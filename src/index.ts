#!/usr/bin/env node
/**
 * Orchestrator - MCP Server Entry Point
 *
 * A self-improving meta-system for composing AI-driven workflows.
 * Skills are the atomic primitive.
 */

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { join } from 'path';
import { loadConfig, validateConfig } from './config.js';
import { SkillRegistry } from './services/SkillRegistry.js';
import { LoopComposer } from './services/LoopComposer.js';
import { ExecutionEngine } from './services/ExecutionEngine.js';
import { MemoryService } from './services/MemoryService.js';
import { LearningService } from './services/LearningService.js';
import { CalibrationService } from './services/CalibrationService.js';
import { InboxProcessor } from './services/InboxProcessor.js';
import { RunArchivalService } from './services/RunArchivalService.js';
import { GuaranteeService } from './services/GuaranteeService.js';
import { LoopGuaranteeAggregator } from './services/LoopGuaranteeAggregator.js';
import { DeliverableManager } from './services/DeliverableManager.js';
import { AnalyticsService } from './services/analytics/index.js';
import { ImprovementOrchestrator } from './services/learning/index.js';
import { RoadmapService } from './services/roadmapping/index.js';
import { KnowledgeGraphService } from './services/knowledge-graph/index.js';
import { PatternsService } from './services/patterns/index.js';
import { ScoringService } from './services/scoring/index.js';
import { AutonomousExecutor } from './services/autonomous/index.js';
import { DreamEngine } from './services/dreaming/index.js';
import { MultiAgentCoordinator } from './services/multi-agent/index.js';
import { MECEOpportunityService } from './services/mece/index.js';
import { CoherenceService } from './services/coherence/index.js';
import { LoopSequencingService } from './services/loop-sequencing/index.js';
import { SkillTreeService } from './services/skill-trees/index.js';
import { GameDesignService } from './services/game-design/index.js';
import { SpacedRepetitionService } from './services/spaced-repetition/index.js';
import { ProposingDecksService } from './services/proposing-decks/index.js';
import { ProactiveMessagingService } from './services/proactive-messaging/index.js';
import { SlackIntegrationService } from './services/slack-integration/index.js';
import { InstallStateService } from './services/InstallStateService.js';
import { skillToolDefinitions, createSkillToolHandlers } from './tools/skillTools.js';
import { loopToolDefinitions, createLoopToolHandlers } from './tools/loopTools.js';
import { executionToolDefinitions, createExecutionToolHandlers } from './tools/executionTools.js';
import { memoryToolDefinitions, createMemoryToolHandlers } from './tools/memoryTools.js';
import { inboxToolDefinitions, createInboxToolHandlers } from './tools/inboxTools.js';
import { runToolDefinitions, createRunToolHandlers } from './tools/runTools.js';
import { patternsTools, createPatternsToolHandlers } from './tools/patternsTools.js';
import { scoringTools, createScoringToolHandlers } from './tools/scoringTools.js';
import { autonomousTools, createAutonomousToolHandlers } from './tools/autonomousTools.js';
import { dreamingTools, createDreamingToolHandlers } from './tools/dreamingTools.js';
import { multiAgentTools, createMultiAgentToolHandlers } from './tools/multiAgentTools.js';
import { meceTools, createMECEToolHandlers } from './tools/meceTools.js';
import { coherenceTools, createCoherenceToolHandlers } from './tools/coherenceTools.js';
import { loopSequencingTools, createLoopSequencingToolHandlers } from './tools/loopSequencingTools.js';
import { skillTreeTools, createSkillTreeToolHandlers } from './tools/skillTreeTools.js';
import { gameDesignTools, createGameDesignToolHandlers } from './tools/gameDesignTools.js';
import { spacedRepetitionTools, createSpacedRepetitionToolHandlers } from './tools/spacedRepetitionTools.js';
import { proposingDecksTools, createProposingDecksToolHandlers } from './tools/proposingDecksTools.js';
import { proactiveMessagingTools, createProactiveMessagingToolHandlers } from './tools/proactiveMessagingTools.js';
import { slackIntegrationTools, createSlackIntegrationToolHandlers } from './tools/slackIntegrationTools.js';
import { knopilotToolDefinitions, createKnoPilotToolHandlers } from './tools/knopilotTools.js';
import { getKnoPilotService } from './services/knopilot/KnoPilotService.js';
import { createHttpServer, startHttpServer } from './server/httpServer.js';
import { getVersion } from './version.js';

async function main() {
  // Load and validate configuration
  const config = loadConfig();
  validateConfig(config);

  // Warn about missing optional config
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: 'ANTHROPIC_API_KEY not set — AI features (inbox processing) will be unavailable',
    }));
  }

  // Initialize skill registry
  const skillRegistry = new SkillRegistry({
    skillsPath: config.skillsPath,
    repoPath: config.repoPath,
    watchEnabled: config.watchEnabled,
  });

  await skillRegistry.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `Skill registry initialized with ${skillRegistry.skillCount} skills`,
  }));

  // Initialize loop composer
  const loopsPath = join(config.repoPath, 'loops');
  const loopComposer = new LoopComposer(
    { loopsPath, watchEnabled: config.watchEnabled },
    skillRegistry
  );

  await loopComposer.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `Loop composer initialized with ${loopComposer.loopCount} loops`,
  }));

  // Initialize execution engine
  const dataPath = join(config.repoPath, 'data', 'executions');
  const executionEngine = new ExecutionEngine(
    { dataPath },
    loopComposer,
    skillRegistry
  );

  await executionEngine.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Execution engine initialized',
  }));

  // Initialize memory service
  const memoryPath = join(config.repoPath, 'memory');
  const memoryService = new MemoryService({ memoryPath });
  await memoryService.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Memory service initialized',
  }));

  // Initialize learning service
  const learningDataPath = join(config.repoPath, 'data', 'learning');
  const learningService = new LearningService(
    { dataPath: learningDataPath },
    skillRegistry,
    memoryService
  );
  await learningService.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Learning service initialized',
  }));

  // Initialize calibration service
  const calibrationDataPath = join(config.repoPath, 'data', 'calibration');
  const calibrationService = new CalibrationService(
    { dataPath: calibrationDataPath },
    memoryService
  );
  await calibrationService.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Calibration service initialized',
  }));

  // Initialize guarantee service
  const guaranteeRegistryPath = join(config.repoPath, 'config', 'guarantees.json');
  const guaranteeService = new GuaranteeService({
    registryPath: guaranteeRegistryPath,
    dataPath,  // Same as execution data path
  });
  await guaranteeService.initialize();

  // Initialize loop guarantee aggregator
  // This provides belt-and-suspenders guarantee enforcement:
  // - Aggregates skill guarantees into loop-level guarantee maps
  // - Re-aggregates when skills or loops change
  // - Enables comprehensive autonomous mode validation
  const guaranteeAggregator = new LoopGuaranteeAggregator(guaranteeService, {
    requireSkillGuarantees: false,  // Don't fail if some skills have no guarantees
    includeOptional: true,  // Include non-required guarantees (will be warnings)
  });

  // Wire up the guarantee system
  // 1. Aggregator gets skill guarantees from GuaranteeService
  // 2. GuaranteeService uses aggregator for comprehensive validation
  // 3. LoopComposer triggers re-aggregation on loop changes
  // 4. ExecutionEngine uses GuaranteeService for enforcement
  guaranteeService.setAggregator(guaranteeAggregator);
  loopComposer.setGuaranteeAggregator(guaranteeAggregator);
  executionEngine.setGuaranteeService(guaranteeService);

  // Log aggregation summary
  const aggSummary = guaranteeAggregator.getSummary();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `Guarantee service initialized (registry v${guaranteeService.getRegistryVersion()}, ${aggSummary.totalGuarantees} guarantees aggregated for ${aggSummary.loopCount} loops)`,
  }));

  // Initialize inbox processor (second brain)
  const inboxPath = join(config.repoPath, 'inbox');
  const inboxDataPath = join(config.repoPath, 'data', 'inbox');
  const inboxProcessor = new InboxProcessor(
    { inboxPath, dataPath: inboxDataPath },
    skillRegistry
  );
  await inboxProcessor.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Inbox processor initialized',
  }));

  // Initialize run archival service
  const runArchivalService = new RunArchivalService();
  await runArchivalService.ensureRunsDir();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Run archival service initialized',
  }));

  // Initialize deliverable manager for organized deliverable storage
  const deliverableManager = new DeliverableManager({
    projectPath: config.repoPath,
  });
  await deliverableManager.initialize();

  // Wire deliverable manager to services
  guaranteeService.setDeliverableManager(deliverableManager);
  executionEngine.setDeliverableManager(deliverableManager);

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Deliverable manager initialized',
  }));

  // Initialize analytics service (OBSERVE layer for self-improvement)
  const analyticsService = new AnalyticsService(
    { runsPath: runArchivalService.getRunsPath() },
    learningService,
    calibrationService,
    memoryService
  );

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Analytics service initialized',
  }));

  // Initialize improvement orchestrator (ACT layer for self-improvement)
  const improvementDataPath = join(config.repoPath, 'data', 'improvements');
  const improvementOrchestrator = new ImprovementOrchestrator(
    { dataPath: improvementDataPath },
    analyticsService,
    learningService,
    calibrationService,
    memoryService,
    skillRegistry
  );
  await improvementOrchestrator.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Improvement orchestrator initialized',
  }));

  // Initialize roadmap service (system-level visibility into module progress)
  const roadmapService = new RoadmapService({
    roadmapPath: join(config.repoPath, 'ROADMAP.md'),
    statePath: join(config.repoPath, 'data', 'roadmap-state.json'),
  });

  // Try to load roadmap (optional - may not exist in all projects)
  try {
    await roadmapService.load();
    const progress = roadmapService.getProgress();
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Roadmap service initialized (${progress.completeModules}/${progress.totalModules} modules complete)`,
    }));
    // Wire roadmap service to execution engine for pre-loop context
    executionEngine.setRoadmapService(roadmapService);
  } catch (err) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: 'Roadmap service not available (no ROADMAP.md found)',
    }));
  }

  // Initialize knowledge graph service (skill-based ontology for compound leverage)
  const knowledgeGraphService = new KnowledgeGraphService({
    skillRegistry,
    loopComposer,
    graphPath: join(config.repoPath, 'data', 'knowledge-graph.json'),
    runArchivePath: runArchivalService.getRunsPath(),
  });

  // Try to load existing graph (optional - may not exist yet)
  try {
    await knowledgeGraphService.load();
    const stats = knowledgeGraphService.getStats();
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Knowledge graph service initialized (${stats.nodeCount} nodes, ${stats.edgeCount} edges)`,
    }));
  } catch (err) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Knowledge graph service initialized (no existing graph, build with POST /api/knowledge-graph/build)',
    }));
  }

  // Initialize patterns service (roundup and automatic detection)
  const patternsService = new PatternsService({
    memoryPath,
    skillsPath: config.skillsPath,
    runsPath: runArchivalService.getRunsPath(),
  });
  patternsService.setDependencies({
    memoryService,
    analyticsService,
  });

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Patterns service initialized',
  }));

  // Initialize scoring service (system-level module evaluation)
  const scoringService = new ScoringService({
    dataPath: join(config.repoPath, 'data', 'scoring'),
  });
  scoringService.setDependencies({
    roadmapService,
    analyticsService,
    calibrationService,
  });
  await scoringService.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Scoring service initialized',
  }));

  // Initialize autonomous executor (background loop execution)
  const autonomousExecutor = new AutonomousExecutor({
    tickInterval: 5000,
    maxParallelExecutions: 3,
    maxSkillRetries: 3,
    autoStart: false,  // Must be explicitly started
  });
  autonomousExecutor.setDependencies({
    executionEngine,
    loopComposer,
    learningService,
  });
  await autonomousExecutor.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Autonomous executor initialized (not running - use start_autonomous to begin)',
  }));

  // Initialize dream engine (background proposal generation)
  const dreamEngine = new DreamEngine({
    dataPath: join(config.repoPath, 'data', 'dreaming', 'state.json'),
    idleThreshold: 60000,      // 1 minute idle before dreaming
    dreamInterval: 300000,     // 5 minutes between dream cycles
    maxProposalsPerCycle: 5,
    autoStart: false,
  });
  dreamEngine.setDependencies({
    roadmapService,
    scoringService,
    patternsService,
    improvementOrchestrator,
    autonomousExecutor,
  });
  await dreamEngine.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Dream engine initialized (not running - use start_dreaming to begin)',
  }));

  // Initialize multi-agent coordinator (worktree-based parallel development)
  const multiAgentCoordinator = new MultiAgentCoordinator({
    dataPath: join(config.repoPath, 'data', 'multi-agent', 'state.json'),
    systemPath: config.repoPath,
    reservationTimeoutMs: 3600000,   // 1 hour default reservation
    mergeCheckIntervalMs: 30000,      // Check merge queue every 30 seconds
  });
  // Note: AgentManager and WorktreeManager can be wired up via setDependencies()
  // when using the orchestration module's services
  await multiAgentCoordinator.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Multi-agent coordinator initialized',
  }));

  // Initialize MECE opportunity mapping service
  const meceService = new MECEOpportunityService({
    dataPath: join(config.repoPath, 'data', 'mece', 'state.json'),
  });
  meceService.setDependencies({
    roadmapService,
    knowledgeGraphService,
    patternsService,
    analyticsService,
  });
  await meceService.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'MECE opportunity mapping service initialized',
  }));

  // Initialize coherence service (system alignment validation)
  const coherenceService = new CoherenceService({
    dataPath: join(config.repoPath, 'data', 'coherence', 'state.json'),
  });
  coherenceService.setDependencies({
    roadmapService,
    knowledgeGraphService,
    patternsService,
    meceService,
    skillRegistry,
    loopComposer,
    memoryService,
  });
  await coherenceService.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Coherence service initialized',
  }));

  // Initialize loop sequencing service
  const loopSequencingService = new LoopSequencingService({
    dataPath: join(config.repoPath, 'data', 'sequencing', 'state.json'),
  });
  loopSequencingService.setDependencies({
    runArchivalService,
    roadmapService,
    loopComposer,
  });
  await loopSequencingService.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Loop sequencing service initialized',
  }));

  // Initialize skill tree service
  const skillTreeService = new SkillTreeService({
    dataPath: join(config.repoPath, 'data', 'skill-trees', 'state.json'),
  });
  skillTreeService.setDependencies({
    knowledgeGraphService,
    loopComposer,
  });
  await skillTreeService.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Skill tree service initialized',
  }));

  // Initialize game design service (finite/infinite game framing)
  const gameDesignService = new GameDesignService({
    dataPath: join(config.repoPath, 'data', 'game-design', 'state.json'),
  });
  gameDesignService.setDependencies({
    roadmapService,
    coherenceService,
  });
  await gameDesignService.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Game design service initialized',
  }));

  // Initialize spaced repetition service (SRS for skill mastery)
  const spacedRepetitionService = new SpacedRepetitionService({
    dataPath: join(config.repoPath, 'data', 'spaced-repetition', 'state.json'),
  });
  spacedRepetitionService.setDependencies({
    knowledgeGraphService,
    skillRegistry,
    memoryService,
  });
  await spacedRepetitionService.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Spaced repetition service initialized',
  }));

  // DEFERRED: proposing-decks module depends on dreaming module
  // Re-enable when dreaming is un-deferred. See ROADMAP.md deferred items.
  // const proposingDecksService = new ProposingDecksService({
  //   dataPath: join(config.repoPath, 'data', 'proposing-decks', 'state.json'),
  // });
  // proposingDecksService.setDependencies({
  //   dreamEngine,
  //   spacedRepetitionService,
  //   knowledgeGraphService,
  //   skillRegistry,
  // });
  // await proposingDecksService.initialize();
  const proposingDecksService = undefined; // Deferred - service disabled

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Proposing decks service DEFERRED (depends on dreaming module)',
  }));

  // Initialize proactive messaging service (multi-channel notifications)
  const proactiveMessagingService = new ProactiveMessagingService({
    dataDir: join(config.repoPath, 'data', 'proactive-messaging'),
    executionEngine,
    dreamEngine,
  });
  await proactiveMessagingService.initialize();

  // Wire up bidirectional connection (execution engine can send notifications)
  executionEngine.setMessagingService(proactiveMessagingService);

  // Wire up autonomous executor to messaging service for auto-approve notifications
  autonomousExecutor.setMessagingService(proactiveMessagingService);

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Proactive messaging service initialized',
  }));

  // Initialize Slack integration service (full bidirectional control)
  const slackIntegrationService = new SlackIntegrationService({
    dataPath: join(config.repoPath, 'data', 'slack-integration'),
  });
  await slackIntegrationService.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Slack integration service initialized',
  }));

  // Initialize install state service (tracks daily interactions)
  const installStateService = new InstallStateService({
    dataPath: join(config.repoPath, 'data'),
    currentVersion: getVersion(),
    installPath: config.repoPath,
  });
  await installStateService.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Install state service initialized',
  }));

  // Initialize KnoPilot service (sales intelligence)
  const knopilotService = getKnoPilotService(config.repoPath);
  await knopilotService.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'KnoPilot service initialized',
  }));

  // Create tool handlers
  const skillHandlers = createSkillToolHandlers(skillRegistry, learningService);
  const loopHandlers = createLoopToolHandlers(loopComposer);
  const executionHandlers = createExecutionToolHandlers(executionEngine, learningService);
  const memoryHandlers = createMemoryToolHandlers(memoryService, learningService, calibrationService);
  const inboxHandlers = createInboxToolHandlers(inboxProcessor);
  const runHandlers = createRunToolHandlers(runArchivalService);
  const patternsHandlers = createPatternsToolHandlers(patternsService);
  const scoringHandlers = createScoringToolHandlers(scoringService);
  const autonomousHandlers = createAutonomousToolHandlers(autonomousExecutor);
  const dreamingHandlers = createDreamingToolHandlers(dreamEngine);
  const multiAgentHandlers = createMultiAgentToolHandlers(multiAgentCoordinator);
  const meceHandlers = createMECEToolHandlers(meceService);
  const coherenceHandlers = createCoherenceToolHandlers(coherenceService);
  const loopSequencingHandlers = createLoopSequencingToolHandlers(loopSequencingService);
  const skillTreeHandlers = createSkillTreeToolHandlers(skillTreeService);
  const gameDesignHandlers = createGameDesignToolHandlers(gameDesignService);
  const spacedRepetitionHandlers = createSpacedRepetitionToolHandlers(spacedRepetitionService);
  // DEFERRED: proposing-decks tools disabled while module is deferred
  const proposingDecksHandlers = {}; // Empty handlers while deferred
  // const proposingDecksHandlers = createProposingDecksToolHandlers(proposingDecksService);
  const proactiveMessagingHandlers = createProactiveMessagingToolHandlers(
    proactiveMessagingService,
    installStateService,
    dreamEngine,
    config.repoPath,
    roadmapService
  );
  const slackIntegrationHandlers = createSlackIntegrationToolHandlers(slackIntegrationService);
  const knopilotHandlers = createKnoPilotToolHandlers(knopilotService);

  // Combine all handlers
  const allHandlers = {
    ...skillHandlers,
    ...loopHandlers,
    ...executionHandlers,
    ...memoryHandlers,
    ...inboxHandlers,
    ...runHandlers,
    ...patternsHandlers,
    ...scoringHandlers,
    ...autonomousHandlers,
    ...dreamingHandlers,
    ...multiAgentHandlers,
    ...meceHandlers,
    ...coherenceHandlers,
    ...loopSequencingHandlers,
    ...skillTreeHandlers,
    ...gameDesignHandlers,
    ...spacedRepetitionHandlers,
    ...proposingDecksHandlers,
    ...proactiveMessagingHandlers,
    ...slackIntegrationHandlers,
    ...knopilotHandlers,
  };

  // Combine all tool definitions
  const allToolDefinitions = [
    ...skillToolDefinitions,
    ...loopToolDefinitions,
    ...executionToolDefinitions,
    ...memoryToolDefinitions,
    ...inboxToolDefinitions,
    ...runToolDefinitions,
    ...patternsTools,
    ...scoringTools,
    ...autonomousTools,
    ...dreamingTools,
    ...multiAgentTools,
    ...meceTools,
    ...coherenceTools,
    ...loopSequencingTools,
    ...skillTreeTools,
    ...gameDesignTools,
    ...spacedRepetitionTools,
    // DEFERRED: proposingDecksTools disabled while module is deferred
    // ...proposingDecksTools,
    ...proactiveMessagingTools,
    ...slackIntegrationTools,
    ...knopilotToolDefinitions,
  ];

  // Create MCP server factory
  const createServer = () => {
    const server = new Server(
      {
        name: 'orchestrator',
        version: getVersion(),
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Register tool list handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: allToolDefinitions };
    });

    // Register tool call handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const handler = allHandlers[name as keyof typeof allHandlers];
        if (!handler) {
          throw new Error(`Unknown tool: ${name}`);
        }

        const result = await handler(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: message }),
            },
          ],
          isError: true,
        };
      }
    });

    return server;
  };

  // Create and start HTTP server with services for REST API
  const app = createHttpServer({
    config,
    createServer,
    services: {
      executionEngine,
      skillRegistry,
      loopComposer,
      inboxProcessor,
      learningService,
      analyticsService,
      improvementOrchestrator,
      roadmapService,
      knowledgeGraphService,
      patternsService,
      scoringService,
      autonomousExecutor,
      dreamEngine,
      multiAgentCoordinator,
      meceService,
      coherenceService,
      loopSequencingService,
      skillTreeService,
      gameDesignService,
      spacedRepetitionService,
      proposingDecksService,
      proactiveMessagingService,
      slackIntegrationService,
      knopilotService,
    },
  });
  await startHttpServer(app, config);

  // Startup banner
  const baseUrl = `http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`;
  console.error([
    '',
    `  Orchestrator v${getVersion()}`,
    `  API:       ${baseUrl}`,
    `  MCP:       ${baseUrl}/mcp`,
    `  Health:    ${baseUrl}/health`,
    `  Auth:      ${config.apiKey ? 'enabled' : 'disabled'}`,
    `  AI:        ${process.env.ANTHROPIC_API_KEY ? 'enabled' : 'disabled'}`,
    `  Skills:    ${skillRegistry.skillCount} loaded`,
    `  Loops:     ${loopComposer.loopCount} loaded`,
    '',
  ].join('\n'));

  // Send startup welcome message (shows recommended next moves)
  const availableLoops = loopComposer.listLoops().map(l => l.id);
  await proactiveMessagingService.sendStartupWelcome({
    version: getVersion(),
    skillCount: skillRegistry.skillCount,
    loopCount: loopComposer.loopCount,
    repoPath: config.repoPath,
    availableLoops,
  });

  // Handle graceful shutdown
  const shutdown = () => {
    skillRegistry.destroy();
    loopComposer.destroy();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    message: 'Fatal error',
    error: error instanceof Error ? error.message : String(error),
  }));
  process.exit(1);
});
