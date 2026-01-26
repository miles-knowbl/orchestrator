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
import { skillToolDefinitions, createSkillToolHandlers } from './tools/skillTools.js';
import { loopToolDefinitions, createLoopToolHandlers } from './tools/loopTools.js';
import { executionToolDefinitions, createExecutionToolHandlers } from './tools/executionTools.js';
import { memoryToolDefinitions, createMemoryToolHandlers } from './tools/memoryTools.js';
import { inboxToolDefinitions, createInboxToolHandlers } from './tools/inboxTools.js';
import { createHttpServer, startHttpServer } from './server/httpServer.js';

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

  // Create tool handlers
  const skillHandlers = createSkillToolHandlers(skillRegistry, learningService);
  const loopHandlers = createLoopToolHandlers(loopComposer);
  const executionHandlers = createExecutionToolHandlers(executionEngine);
  const memoryHandlers = createMemoryToolHandlers(memoryService, learningService, calibrationService);
  const inboxHandlers = createInboxToolHandlers(inboxProcessor);

  // Combine all handlers
  const allHandlers = {
    ...skillHandlers,
    ...loopHandlers,
    ...executionHandlers,
    ...memoryHandlers,
    ...inboxHandlers,
  };

  // Combine all tool definitions
  const allToolDefinitions = [
    ...skillToolDefinitions,
    ...loopToolDefinitions,
    ...executionToolDefinitions,
    ...memoryToolDefinitions,
    ...inboxToolDefinitions,
  ];

  // Create MCP server factory
  const createServer = () => {
    const server = new Server(
      {
        name: 'orchestrator',
        version: '0.1.0',
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
    },
  });
  await startHttpServer(app, config);

  // Startup banner
  const baseUrl = `http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`;
  console.error([
    '',
    `  Orchestrator v${process.env.npm_package_version || '0.1.0'}`,
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
