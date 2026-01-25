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
import { loadConfig, validateConfig } from './config.js';
import { SkillRegistry } from './services/SkillRegistry.js';
import { skillToolDefinitions, createSkillToolHandlers } from './tools/skillTools.js';
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
  const registry = new SkillRegistry({
    skillsPath: config.skillsPath,
    repoPath: config.repoPath,
    watchEnabled: config.watchEnabled,
  });

  await registry.initialize();

  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `Skill registry initialized with ${registry.skillCount} skills`,
  }));

  // Create tool handlers
  const skillHandlers = createSkillToolHandlers(registry);

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
      return { tools: skillToolDefinitions };
    });

    // Register tool call handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const handler = skillHandlers[name as keyof typeof skillHandlers];
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
  process.on('SIGTERM', () => {
    registry.destroy();
  });

  process.on('SIGINT', () => {
    registry.destroy();
  });
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
