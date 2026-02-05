/**
 * HTTP Server for MCP transport and REST API
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { OrchestratorConfig } from '../config.js';
import type { ExecutionEngine } from '../services/ExecutionEngine.js';
import type { SkillRegistry } from '../services/SkillRegistry.js';
import type { LoopComposer } from '../services/LoopComposer.js';
import type { InboxProcessor } from '../services/InboxProcessor.js';
import type { LearningService } from '../services/LearningService.js';
import type { AnalyticsService } from '../services/analytics/index.js';
import type { ImprovementOrchestrator } from '../services/learning/index.js';
import type { RoadmapService } from '../services/roadmapping/index.js';
import type { KnowledgeGraphService } from '../services/knowledge-graph/index.js';
import type { PatternsService } from '../services/patterns/index.js';
import type { ScoringService } from '../services/scoring/index.js';
import type { AutonomousExecutor } from '../services/autonomous/index.js';
import type { DreamEngine } from '../services/dreaming/index.js';
import type { MultiAgentCoordinator } from '../services/multi-agent/index.js';
import type { MECEOpportunityService } from '../services/mece/index.js';
import type { CoherenceService } from '../services/coherence/index.js';
import type { LoopSequencingService } from '../services/loop-sequencing/index.js';
import type { SkillTreeService } from '../services/skill-trees/index.js';
import type { GameDesignService } from '../services/game-design/index.js';
import type { SpacedRepetitionService } from '../services/spaced-repetition/index.js';
import type { ProposingDecksService } from '../services/proposing-decks/index.js';
import type { ProactiveMessagingService } from '../services/proactive-messaging/index.js';
import type { KnoPilotService } from '../services/knopilot/KnoPilotService.js';
import type { OODAClockService } from '../services/ooda-clock/index.js';
import { createApiRoutes } from './apiRoutes.js';
import { getVersion } from '../version.js';

export interface HttpServerOptions {
  config: OrchestratorConfig;
  createServer: () => Server;
  services?: {
    executionEngine: ExecutionEngine;
    skillRegistry: SkillRegistry;
    loopComposer: LoopComposer;
    inboxProcessor: InboxProcessor;
    learningService?: LearningService;
    analyticsService?: AnalyticsService;
    improvementOrchestrator?: ImprovementOrchestrator;
    roadmapService?: RoadmapService;
    knowledgeGraphService?: KnowledgeGraphService;
    patternsService?: PatternsService;
    scoringService?: ScoringService;
    autonomousExecutor?: AutonomousExecutor;
    dreamEngine?: DreamEngine;
    multiAgentCoordinator?: MultiAgentCoordinator;
    meceService?: MECEOpportunityService;
    coherenceService?: CoherenceService;
    loopSequencingService?: LoopSequencingService;
    skillTreeService?: SkillTreeService;
    gameDesignService?: GameDesignService;
    spacedRepetitionService?: SpacedRepetitionService;
    proposingDecksService?: ProposingDecksService;
    proactiveMessagingService?: ProactiveMessagingService;
    knopilotService?: KnoPilotService;
    oodaClockService?: OODAClockService;
  };
}

export function createHttpServer(options: HttpServerOptions): Express {
  const { config, createServer } = options;
  const app = express();

  app.use(express.json());

  // CORS middleware — restrict to allowed origins
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    const allowed = config.allowedOrigins;

    if (allowed.includes('*')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (origin && allowed.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  });

  // API Key authentication middleware — protects /mcp and /api
  if (config.apiKey) {
    const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers['x-api-key'] || req.headers['authorization'];
      const providedKey = typeof authHeader === 'string'
        ? authHeader.replace('Bearer ', '')
        : undefined;

      if (providedKey !== config.apiKey) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      next();
    };

    app.use('/mcp', authMiddleware);
    app.use('/api', authMiddleware);
  }

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: getVersion(),
    });
  });

  // REST API routes (if services are provided)
  if (options.services) {
    const apiRoutes = createApiRoutes(options.services);
    app.use('/api', apiRoutes);
  }

  // MCP endpoint using Streamable HTTP transport
  const mcpTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode
  });

  // Create and connect MCP server
  const mcpServer = createServer();
  mcpServer.connect(mcpTransport).catch(err => {
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', message: 'Failed to connect MCP server', error: String(err) }));
  });

  // Handle MCP requests
  app.post('/mcp', async (req: Request, res: Response) => {
    try {
      await mcpTransport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', message: 'MCP request error', error: String(error) }));
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Handle SSE for notifications (GET /mcp)
  app.get('/mcp', async (req: Request, res: Response) => {
    try {
      await mcpTransport.handleRequest(req, res);
    } catch (error) {
      console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', message: 'MCP SSE error', error: String(error) }));
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Handle session termination (DELETE /mcp)
  app.delete('/mcp', async (req: Request, res: Response) => {
    try {
      await mcpTransport.handleRequest(req, res);
    } catch (error) {
      console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', message: 'MCP delete error', error: String(error) }));
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return app;
}

import type { Server as HttpServer } from 'http';

export interface HttpServerResult {
  server: HttpServer;
  close: () => Promise<void>;
}

export function startHttpServer(
  app: Express,
  config: OrchestratorConfig
): Promise<HttpServerResult> {
  return new Promise((resolve, reject) => {
    const server = app.listen(config.port, config.host, () => {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Orchestrator MCP server listening on http://${config.host}:${config.port}`,
        endpoints: {
          mcp: `http://${config.host}:${config.port}/mcp`,
          health: `http://${config.host}:${config.port}/health`,
          dashboard: `http://${config.host}:${config.port}/api/dashboard`,
          executions: `http://${config.host}:${config.port}/api/executions`,
          skills: `http://${config.host}:${config.port}/api/skills`,
          loops: `http://${config.host}:${config.port}/api/loops`,
          improvements: `http://${config.host}:${config.port}/api/improvements`,
          analytics: `http://${config.host}:${config.port}/api/analytics`,
          learning: `http://${config.host}:${config.port}/api/learning`,
          roadmap: `http://${config.host}:${config.port}/api/roadmap`,
          knowledgeGraph: `http://${config.host}:${config.port}/api/knowledge-graph`,
          scoring: `http://${config.host}:${config.port}/api/scoring`,
          autonomous: `http://${config.host}:${config.port}/api/autonomous`,
          dreaming: `http://${config.host}:${config.port}/api/dreaming`,
        },
      }));

      // Return server and close function for ShutdownManager
      resolve({
        server,
        close: () => new Promise<void>((resolveClose) => {
          server.close(() => resolveClose());
        }),
      });
    });

    server.on('error', reject);
  });
}
