/**
 * Orchestrator - MCP Server Entry Point
 *
 * A self-improving meta-system for composing AI-driven workflows.
 * Skills are the atomic primitive.
 */

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
import { skillToolDefinitions, createSkillToolHandlers } from './tools/skillTools.js';
import { loopToolDefinitions, createLoopToolHandlers } from './tools/loopTools.js';
import { executionToolDefinitions, createExecutionToolHandlers } from './tools/executionTools.js';
import { createHttpServer, startHttpServer } from './server/httpServer.js';

async function main() {
  // Load and validate configuration
  const config = loadConfig();
  validateConfig(config);

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Starting Orchestrator',
    config: {
      skillsPath: config.skillsPath,
      port: config.port,
      watchEnabled: config.watchEnabled,
    },
  }));

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

  // Create tool handlers
  const skillHandlers = createSkillToolHandlers(skillRegistry);
  const loopHandlers = createLoopToolHandlers(loopComposer);
  const executionHandlers = createExecutionToolHandlers(executionEngine);

  // Combine all handlers
  const allHandlers = {
    ...skillHandlers,
    ...loopHandlers,
    ...executionHandlers,
  };

  // Combine all tool definitions
  const allToolDefinitions = [
    ...skillToolDefinitions,
    ...loopToolDefinitions,
    ...executionToolDefinitions,
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

  // Create and start HTTP server
  const app = createHttpServer({ config, createServer });
  await startHttpServer(app, config);

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
