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
import { skillToolDefinitions, createSkillToolHandlers } from './tools/skillTools.js';
import { loopToolDefinitions, createLoopToolHandlers } from './tools/loopTools.js';
import { executionToolDefinitions, createExecutionToolHandlers } from './tools/executionTools.js';
import { memoryToolDefinitions, createMemoryToolHandlers } from './tools/memoryTools.js';
import { inboxToolDefinitions, createInboxToolHandlers } from './tools/inboxTools.js';
import { runToolDefinitions, createRunToolHandlers } from './tools/runTools.js';
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
  } catch (err) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: 'Roadmap service not available (no ROADMAP.md found)',
    }));
  }

  // Create tool handlers
  const skillHandlers = createSkillToolHandlers(skillRegistry, learningService);
  const loopHandlers = createLoopToolHandlers(loopComposer);
  const executionHandlers = createExecutionToolHandlers(executionEngine, learningService);
  const memoryHandlers = createMemoryToolHandlers(memoryService, learningService, calibrationService);
  const inboxHandlers = createInboxToolHandlers(inboxProcessor);
  const runHandlers = createRunToolHandlers(runArchivalService);

  // Combine all handlers
  const allHandlers = {
    ...skillHandlers,
    ...loopHandlers,
    ...executionHandlers,
    ...memoryHandlers,
    ...inboxHandlers,
    ...runHandlers,
  };

  // Combine all tool definitions
  const allToolDefinitions = [
    ...skillToolDefinitions,
    ...loopToolDefinitions,
    ...executionToolDefinitions,
    ...memoryToolDefinitions,
    ...inboxToolDefinitions,
    ...runToolDefinitions,
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
