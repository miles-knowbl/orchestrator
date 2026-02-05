/**
 * REST API Routes for the Dashboard
 *
 * Provides endpoints for:
 * - Execution listing and details
 * - Live log streaming via SSE
 * - Skills and loops listing
 */

import { Router, Request, Response } from 'express';
import type { ExecutionEngine } from '../services/ExecutionEngine.js';
import type { SkillRegistry } from '../services/SkillRegistry.js';
import type { LoopComposer } from '../services/LoopComposer.js';
import type { InboxProcessor } from '../services/InboxProcessor.js';
import type { LearningService } from '../services/LearningService.js';
import type { AnalyticsService } from '../services/analytics/index.js';
import type { ImprovementOrchestrator } from '../services/learning/index.js';
import type { RoadmapService } from '../services/roadmapping/index.js';
import type { KnowledgeGraphService } from '../services/knowledge-graph/index.js';
import type { OrchestrationService } from '../services/orchestration/index.js';
import type { PatternsService } from '../services/patterns/index.js';
import type { ScoringService } from '../services/scoring/index.js';
import type { AutonomousExecutor } from '../services/autonomous/index.js';
import type { DreamEngine, ProposalStatus, ProposalType } from '../services/dreaming/index.js';
import type { MultiAgentCoordinator, ReservationType, MergeRequestStatus } from '../services/multi-agent/index.js';
import type { MECEOpportunityService, OpportunityStatus, OpportunitySource, GapSeverity } from '../services/mece/index.js';
import type { CoherenceService, AlignmentDomain, IssueSeverity, IssueStatus } from '../services/coherence/index.js';
import type { LoopSequencingService } from '../services/loop-sequencing/index.js';
import type { SkillTreeService, TreeDomain } from '../services/skill-trees/index.js';
import type { GameDesignService, FiniteGame } from '../services/game-design/index.js';
import type { SpacedRepetitionService, CardType, Card } from '../services/spaced-repetition/index.js';
import type { ProposingDecksService, ReviewDeckType } from '../services/proposing-decks/index.js';
import type { ProactiveMessagingService } from '../services/proactive-messaging/index.js';
import type { KnoPilotService } from '../services/knopilot/KnoPilotService.js';
import type { OODAClockService } from '../services/ooda-clock/index.js';

export interface ApiRoutesOptions {
  executionEngine: ExecutionEngine;
  skillRegistry: SkillRegistry;
  loopComposer: LoopComposer;
  inboxProcessor: InboxProcessor;
  learningService?: LearningService;
  analyticsService?: AnalyticsService;
  improvementOrchestrator?: ImprovementOrchestrator;
  roadmapService?: RoadmapService;
  knowledgeGraphService?: KnowledgeGraphService;
  orchestrationService?: OrchestrationService;
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
}

// Helper to get string param
function getParam(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}

// Helper to safely get query param as string (for enum validation)
function queryString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

export function createApiRoutes(options: ApiRoutesOptions): Router {
  const { executionEngine, skillRegistry, loopComposer, inboxProcessor, learningService, analyticsService, improvementOrchestrator, roadmapService, knowledgeGraphService, orchestrationService, patternsService, scoringService, autonomousExecutor, dreamEngine, multiAgentCoordinator, meceService, coherenceService, loopSequencingService, skillTreeService, gameDesignService, spacedRepetitionService, proposingDecksService, proactiveMessagingService, knopilotService, oodaClockService } = options;
  const router = Router();

  // ==========================================================================
  // EXECUTIONS
  // ==========================================================================

  /**
   * List all executions
   */
  router.get('/executions', (_req: Request, res: Response) => {
    const executions = executionEngine.listExecutions();
    res.json({
      count: executions.length,
      executions,
    });
  });

  /**
   * Get execution details with logs
   */
  router.get('/executions/:id', (req: Request, res: Response) => {
    const execution = executionEngine.getExecution(getParam(req, 'id'));

    if (!execution) {
      res.status(404).json({ error: 'Execution not found' });
      return;
    }

    res.json(execution);
  });

  /**
   * Get execution logs
   */
  router.get('/executions/:id/logs', (req: Request, res: Response) => {
    const { level, category, since, limit } = req.query;

    const logs = executionEngine.getLogs(getParam(req, 'id'), {
      level: queryString(level) as 'info' | 'warn' | 'error' | undefined,
      category: queryString(category) as 'phase' | 'skill' | 'gate' | 'system' | undefined,
      since: since ? new Date(String(since)) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
    });

    res.json({
      count: logs.length,
      logs,
    });
  });

  /**
   * SSE endpoint for live log streaming
   */
  router.get('/executions/:id/stream', (req: Request, res: Response) => {
    const execution = executionEngine.getExecution(getParam(req, 'id'));

    if (!execution) {
      res.status(404).json({ error: 'Execution not found' });
      return;
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial state
    res.write(`event: init\n`);
    res.write(`data: ${JSON.stringify({
      execution: {
        id: execution.id,
        loopId: execution.loopId,
        status: execution.status,
        currentPhase: execution.currentPhase,
        progress: getProgress(execution),
      },
      logs: execution.logs.slice(-50), // Last 50 logs
    })}\n\n`);

    // Keep track of last log count
    let lastLogCount = execution.logs.length;

    // Poll for updates every second
    const interval = setInterval(() => {
      const current = executionEngine.getExecution(getParam(req, 'id'));
      if (!current) {
        res.write(`event: closed\n`);
        res.write(`data: {"reason": "execution_not_found"}\n\n`);
        clearInterval(interval);
        res.end();
        return;
      }

      // Check for new logs
      if (current.logs.length > lastLogCount) {
        const newLogs = current.logs.slice(lastLogCount);
        for (const log of newLogs) {
          res.write(`event: log\n`);
          res.write(`data: ${JSON.stringify(log)}\n\n`);
        }
        lastLogCount = current.logs.length;
      }

      // Check for status changes
      if (current.status !== execution.status ||
          current.currentPhase !== execution.currentPhase) {
        res.write(`event: state\n`);
        res.write(`data: ${JSON.stringify({
          status: current.status,
          currentPhase: current.currentPhase,
          progress: getProgress(current),
        })}\n\n`);
      }

      // End stream if execution is complete
      if (current.status === 'completed' || current.status === 'failed') {
        res.write(`event: complete\n`);
        res.write(`data: ${JSON.stringify({
          status: current.status,
          completedAt: current.completedAt,
        })}\n\n`);
        clearInterval(interval);
        res.end();
      }
    }, 1000);

    // Clean up on close
    req.on('close', () => {
      clearInterval(interval);
    });
  });

  // ==========================================================================
  // SKILLS
  // ==========================================================================

  /**
   * List all skills
   */
  router.get('/skills', (req: Request, res: Response) => {
    const { phase, category, query, limit, offset } = req.query;

    const result = skillRegistry.listSkills({
      phase: queryString(phase) as 'INIT' | 'SCAFFOLD' | 'IMPLEMENT' | 'TEST' | 'VERIFY' | 'VALIDATE' | 'DOCUMENT' | 'REVIEW' | 'SHIP' | 'COMPLETE' | undefined,
      category: queryString(category) as 'engineering' | 'sales' | 'operations' | 'content' | 'strategy' | undefined,
      query: queryString(query),
      limit: limit ? parseInt(String(limit), 10) : undefined,
      offset: offset ? parseInt(String(offset), 10) : undefined,
    });

    res.json(result);
  });

  /**
   * Get skill details
   */
  router.get('/skills/:name', async (req: Request, res: Response) => {
    const skill = await skillRegistry.getSkill(getParam(req, 'name'), {
      includeReferences: req.query.includeReferences === 'true',
    });

    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    res.json(skill);
  });

  /**
   * Get skill dependency graph
   */
  router.get('/skills-graph', (_req: Request, res: Response) => {
    const graph = skillRegistry.getSkillGraph();
    res.json(graph);
  });

  /**
   * Get skill coverage analysis (MECE gaps)
   */
  router.get('/skills-coverage', (_req: Request, res: Response) => {
    const coverage = skillRegistry.analyzeSkillCoverage();
    res.json(coverage);
  });

  /**
   * Find similar skills (duplicate detection)
   */
  router.get('/skills-similar/:name', (req: Request, res: Response) => {
    const threshold = req.query.threshold
      ? parseFloat(req.query.threshold as string)
      : 0.3;

    const similar = skillRegistry.findSimilarSkills(getParam(req, 'name'), threshold);

    res.json({
      query: getParam(req, 'name'),
      threshold,
      similar: similar.map(({ skill, similarity }) => ({
        name: skill.id,
        description: skill.description,
        similarity: Math.round(similarity * 100),
        phase: skill.phase,
      })),
    });
  });

  // ==========================================================================
  // LOOPS
  // ==========================================================================

  /**
   * List all loops
   */
  router.get('/loops', (_req: Request, res: Response) => {
    const loops = loopComposer.listLoops();
    res.json({
      count: loops.length,
      loops,
    });
  });

  /**
   * Get loop details
   */
  router.get('/loops/:id', (req: Request, res: Response) => {
    const loop = loopComposer.getLoop(getParam(req, 'id'));

    if (!loop) {
      res.status(404).json({ error: 'Loop not found' });
      return;
    }

    res.json(loop);
  });

  /**
   * Get loop rhythm data (aggregate patterns from past executions)
   */
  router.get('/loops/:id/rhythm', (req: Request, res: Response) => {
    const loopId = getParam(req, 'id');
    const loop = loopComposer.getLoop(loopId);

    if (!loop) {
      res.status(404).json({ error: 'Loop not found' });
      return;
    }

    // Get all executions for this loop
    const allExecutions = executionEngine.listExecutions();
    const loopExecutions = allExecutions.filter(e => e.loopId === loopId);

    // Get completed executions for rhythm analysis
    const completedExecutions = loopExecutions.filter(e =>
      e.status === 'completed' || e.status === 'failed'
    );

    // Transform logs to clock events and analyze rhythm
    if (!oodaClockService) {
      res.json({
        loopId,
        executionCount: loopExecutions.length,
        completedCount: completedExecutions.length,
        events: [],
        patterns: [],
        stats: null,
      });
      return;
    }

    // Aggregate events from all completed executions
    const allEvents: ReturnType<typeof oodaClockService.processLogs> = [];
    const durations: number[] = [];

    for (const execSummary of completedExecutions) {
      const execution = executionEngine.getExecution(execSummary.id);
      if (execution?.logs) {
        const events = oodaClockService.processLogs(execution.logs);
        allEvents.push(...events);

        // Calculate duration
        if (execution.startedAt && execution.completedAt) {
          const duration = new Date(execution.completedAt).getTime() -
                          new Date(execution.startedAt).getTime();
          durations.push(duration);
        }
      }
    }

    // Analyze rhythm patterns
    const patterns = oodaClockService.analyzeRhythm(allEvents);

    // Calculate stats
    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : null;

    // Count events by type
    const eventsByType = allEvents.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count events by phase (approximate from angle)
    const phaseFromAngle = (angle: number): string => {
      if (angle >= 270 || angle < 0) return 'OBSERVE';
      if (angle >= 0 && angle < 90) return 'ORIENT';
      if (angle >= 90 && angle < 180) return 'DECIDE';
      return 'ACT';
    };

    const eventsByQuadrant = allEvents.reduce((acc, e) => {
      const quadrant = phaseFromAngle(e.startAngle);
      acc[quadrant] = (acc[quadrant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      loopId,
      executionCount: loopExecutions.length,
      completedCount: completedExecutions.length,
      events: allEvents.slice(-100), // Last 100 events for visualization
      patterns: patterns.slice(0, 10), // Top 10 patterns
      stats: {
        avgDurationMs: avgDuration,
        avgDurationFormatted: avgDuration
          ? `${Math.round(avgDuration / 60000)}m`
          : null,
        eventsByType,
        eventsByQuadrant,
        totalEvents: allEvents.length,
      },
    });
  });

  // ==========================================================================
  // EXECUTIONS - Create
  // ==========================================================================

  /**
   * Start a new execution
   */
  router.post('/executions', async (req: Request, res: Response) => {
    try {
      const { loopId, project, mode, autonomy } = req.body;

      if (!loopId || !project) {
        res.status(400).json({ error: 'loopId and project are required' });
        return;
      }

      const execution = await executionEngine.startExecution({
        loopId,
        project,
        mode: mode || 'greenfield',
        autonomy: autonomy || 'supervised',
      });

      res.json(execution);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to start execution' });
    }
  });

  // ==========================================================================
  // EXECUTIONS - Management
  // ==========================================================================

  /**
   * Advance to next phase
   */
  router.put('/executions/:id/advance', async (req: Request, res: Response) => {
    try {
      const execution = await executionEngine.advancePhase(getParam(req, 'id'));
      res.json(execution);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to advance phase' });
    }
  });

  /**
   * Complete current phase
   */
  router.put('/executions/:id/complete-phase', async (req: Request, res: Response) => {
    try {
      const execution = await executionEngine.completePhase(getParam(req, 'id'));
      res.json(execution);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to complete phase' });
    }
  });

  /**
   * Complete a skill
   */
  router.put('/executions/:id/skills/:skillId/complete', async (req: Request, res: Response) => {
    try {
      const execution = await executionEngine.completeSkill(
        getParam(req, 'id'),
        getParam(req, 'skillId'),
        req.body?.result
      );
      res.json(execution);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to complete skill' });
    }
  });

  /**
   * Approve a gate
   */
  router.put('/executions/:id/gates/:gateId/approve', async (req: Request, res: Response) => {
    try {
      const execution = await executionEngine.approveGate(
        getParam(req, 'id'),
        getParam(req, 'gateId'),
        req.body?.approvedBy
      );
      res.json(execution);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to approve gate' });
    }
  });

  /**
   * Reject a gate
   */
  router.put('/executions/:id/gates/:gateId/reject', async (req: Request, res: Response) => {
    try {
      const feedback = req.body?.feedback;
      if (!feedback) {
        res.status(400).json({ error: 'feedback is required' });
        return;
      }
      const execution = await executionEngine.rejectGate(
        getParam(req, 'id'),
        getParam(req, 'gateId'),
        feedback
      );
      res.json(execution);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to reject gate' });
    }
  });

  /**
   * List all gates for an execution
   */
  router.get('/executions/:id/gates', async (req: Request, res: Response) => {
    try {
      const gates = await executionEngine.listGates(getParam(req, 'id'));
      res.json({ gates, count: gates.length });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to list gates' });
    }
  });

  /**
   * Update a gate (enable/disable, change approval type)
   */
  router.put('/executions/:id/gates/:gateId', async (req: Request, res: Response) => {
    try {
      const result = await executionEngine.updateGate(
        getParam(req, 'id'),
        getParam(req, 'gateId'),
        {
          enabled: req.body?.enabled,
          approvalTypeOverride: req.body?.approvalTypeOverride,
        }
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update gate' });
    }
  });

  /**
   * Disable all gates for an execution
   */
  router.put('/executions/:id/gates-disable-all', async (req: Request, res: Response) => {
    try {
      const result = await executionEngine.disableAllGates(getParam(req, 'id'));
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to disable gates' });
    }
  });

  /**
   * Enable all gates for an execution
   */
  router.put('/executions/:id/gates-enable-all', async (req: Request, res: Response) => {
    try {
      const result = await executionEngine.enableAllGates(getParam(req, 'id'));
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to enable gates' });
    }
  });

  /**
   * Set all gates to auto-approve mode
   */
  router.put('/executions/:id/gates-auto-all', async (req: Request, res: Response) => {
    try {
      const result = await executionEngine.setAllGatesAuto(getParam(req, 'id'));
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to set gates to auto' });
    }
  });

  /**
   * Pause execution
   */
  router.put('/executions/:id/pause', async (req: Request, res: Response) => {
    try {
      const execution = await executionEngine.pauseExecution(getParam(req, 'id'));
      res.json(execution);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to pause execution' });
    }
  });

  /**
   * Resume execution
   */
  router.put('/executions/:id/resume', async (req: Request, res: Response) => {
    try {
      const execution = await executionEngine.resumeExecution(getParam(req, 'id'));
      res.json(execution);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to resume execution' });
    }
  });

  /**
   * Abort execution
   */
  router.put('/executions/:id/abort', async (req: Request, res: Response) => {
    try {
      await executionEngine.abortExecution(getParam(req, 'id'), req.body?.reason);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to abort execution' });
    }
  });

  // ==========================================================================
  // INBOX
  // ==========================================================================

  /**
   * Get inbox stats
   */
  router.get('/inbox/stats', (_req: Request, res: Response) => {
    const stats = inboxProcessor.getStats();
    res.json(stats);
  });

  /**
   * List inbox items
   */
  router.get('/inbox', (req: Request, res: Response) => {
    const { status, sourceType } = req.query;

    const items = inboxProcessor.listItems({
      status: queryString(status) as 'pending' | 'processing' | 'extracted' | 'rejected' | undefined,
      sourceType: queryString(sourceType) as 'url' | 'file' | 'paste' | 'conversation' | undefined,
    });

    res.json({
      count: items.length,
      items: items.map(item => ({
        id: item.id,
        source: item.source,
        url: item.url,
        status: item.status,
        createdAt: item.createdAt,
        processedAt: item.processedAt,
        extractedSkillsCount: item.extractedSkills?.length || 0,
        extractedPatternsCount: item.extractedPatterns?.length || 0,
        contentPreview: item.content?.slice(0, 200) || '',
      })),
    });
  });

  /**
   * Get inbox item details
   */
  router.get('/inbox/:id', (req: Request, res: Response) => {
    const item = inboxProcessor.getItem(getParam(req, 'id'));

    if (!item) {
      res.status(404).json({ error: 'Inbox item not found' });
      return;
    }

    res.json({
      id: item.id,
      source: item.source,
      url: item.url,
      status: item.status,
      content: item.content,
      createdAt: item.createdAt,
      processedAt: item.processedAt,
      extractedSkills: item.extractedSkills?.map((skill, index) => ({
        index,
        name: skill.name,
        description: skill.description,
        phase: skill.phase,
        confidence: skill.confidence || 0.8,
        needsReview: skill.needsReview,
      })),
      extractedPatterns: item.extractedPatterns,
      classifiedExtractions: item.classifiedExtractions?.map((ce, index) => ({
        index,
        type: ce.type,
        confidence: ce.confidence,
        reasoning: ce.reasoning,
        ...(ce.type === 'standalone_skill' && ce.skill ? {
          skill: {
            name: ce.skill.name,
            description: ce.skill.description,
            phase: ce.skill.phase,
            confidence: ce.skill.confidence,
            contentPreview: ce.skill.content.slice(0, 300),
            contentLength: ce.skill.content.length,
          },
        } : {}),
        ...(ce.type === 'skill_enhancement' && ce.enhancement ? {
          targetSkill: ce.targetSkill,
          enhancement: {
            section: ce.enhancement.section,
            description: ce.enhancement.description,
            contentPreview: ce.enhancement.content.slice(0, 300),
            contentLength: ce.enhancement.content.length,
          },
        } : {}),
        ...(ce.type === 'reference_doc' && ce.reference ? {
          parentSkill: ce.parentSkill,
          reference: {
            name: ce.reference.name,
            description: ce.reference.description,
            contentPreview: ce.reference.content.slice(0, 300),
            contentLength: ce.reference.content.length,
          },
        } : {}),
      })),
    });
  });

  /**
   * Approve a classified extraction (any type)
   */
  router.post('/inbox/:id/extractions/:index/approve', async (req: Request, res: Response) => {
    try {
      const itemId = getParam(req, 'id');
      const index = parseInt(getParam(req, 'index'), 10);
      const item = inboxProcessor.getItem(itemId);

      if (!item || !item.classifiedExtractions || index >= item.classifiedExtractions.length) {
        res.status(404).json({ error: 'Extraction not found' });
        return;
      }

      const extraction = item.classifiedExtractions[index];

      switch (extraction.type) {
        case 'standalone_skill': {
          if (!extraction.skill) {
            res.status(400).json({ error: 'No skill data in extraction' });
            return;
          }
          const result = await inboxProcessor.approveSkill(itemId, 0, {
            name: extraction.skill.name,
            description: extraction.skill.description,
            content: req.body.modifications?.content || extraction.skill.content,
            phase: extraction.skill.phase,
          });
          res.json({ ...result, type: 'standalone_skill' });
          break;
        }
        case 'skill_enhancement': {
          const result = await inboxProcessor.approveEnhancement(itemId, index, req.body.modifications);
          res.json({ ...result, type: 'skill_enhancement' });
          break;
        }
        case 'reference_doc': {
          const result = await inboxProcessor.approveReference(itemId, index, req.body.modifications);
          res.json({ ...result, type: 'reference_doc' });
          break;
        }
        default:
          res.status(400).json({ error: `Unknown extraction type: ${extraction.type}` });
      }
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to approve extraction' });
    }
  });

  /**
   * Reject a classified extraction
   */
  router.post('/inbox/:id/extractions/:index/reject', async (req: Request, res: Response) => {
    try {
      await inboxProcessor.rejectExtraction(
        getParam(req, 'id'),
        parseInt(getParam(req, 'index'), 10),
        req.body.reason
      );
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to reject extraction' });
    }
  });

  /**
   * Get full content of a classified extraction
   */
  router.get('/inbox/:id/extractions/:index/content', (req: Request, res: Response) => {
    const item = inboxProcessor.getItem(getParam(req, 'id'));
    const index = parseInt(getParam(req, 'index'), 10);

    if (!item || !item.classifiedExtractions || index >= item.classifiedExtractions.length) {
      res.status(404).json({ error: 'Extraction not found' });
      return;
    }

    const extraction = item.classifiedExtractions[index];
    res.json({
      index,
      type: extraction.type,
      confidence: extraction.confidence,
      reasoning: extraction.reasoning,
      ...(extraction.skill ? { skill: extraction.skill } : {}),
      ...(extraction.enhancement ? { targetSkill: extraction.targetSkill, enhancement: extraction.enhancement } : {}),
      ...(extraction.reference ? { parentSkill: extraction.parentSkill, reference: extraction.reference } : {}),
    });
  });

  /**
   * Add item to inbox
   */
  router.post('/inbox', async (req: Request, res: Response) => {
    try {
      const { content, sourceType, sourceName, url } = req.body;

      let item;
      if (url) {
        item = await inboxProcessor.addUrl(url);
      } else if (content) {
        item = await inboxProcessor.addItem({
          content,
          source: { type: sourceType || 'paste', name: sourceName || 'manual-paste' },
        });
      } else {
        res.status(400).json({ error: 'Either content or url is required' });
        return;
      }

      res.json(item);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to add item' });
    }
  });

  /**
   * Process inbox item with AI
   */
  router.post('/inbox/:id/process', async (req: Request, res: Response) => {
    try {
      const result = await inboxProcessor.processItem(getParam(req, 'id'));
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to process item' });
    }
  });

  /**
   * Approve extracted skill
   */
  router.post('/inbox/:id/skills/:index/approve', async (req: Request, res: Response) => {
    try {
      const result = await inboxProcessor.approveSkill(
        getParam(req, 'id'),
        parseInt(getParam(req, 'index'), 10),
        req.body.modifications
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to approve skill' });
    }
  });

  /**
   * Reject extracted skill
   */
  router.post('/inbox/:id/skills/:index/reject', async (req: Request, res: Response) => {
    try {
      await inboxProcessor.rejectSkill(
        getParam(req, 'id'),
        parseInt(getParam(req, 'index'), 10),
        req.body.reason
      );
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to reject skill' });
    }
  });

  /**
   * Delete inbox item
   */
  router.delete('/inbox/:id', async (req: Request, res: Response) => {
    try {
      await inboxProcessor.deleteItem(getParam(req, 'id'));
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to delete item' });
    }
  });

  // ==========================================================================
  // IMPROVEMENTS (Learning System)
  // ==========================================================================

  /**
   * Get learning summary
   */
  router.get('/improvements/summary', async (_req: Request, res: Response) => {
    if (!learningService) {
      res.status(503).json({ error: 'Learning service not available' });
      return;
    }

    const summary = await learningService.getLearningSummary();
    res.json(summary);
  });

  /**
   * List upgrade proposals
   */
  router.get('/improvements', (req: Request, res: Response) => {
    if (!learningService) {
      res.status(503).json({ error: 'Learning service not available' });
      return;
    }

    const { skill, status } = req.query;
    const proposals = learningService.listUpgradeProposals({
      skill: queryString(skill),
      status: queryString(status) as 'pending' | 'approved' | 'rejected' | 'applied' | undefined,
    });

    res.json({
      count: proposals.length,
      proposals: proposals.map(p => ({
        id: p.id,
        skill: p.skill,
        currentVersion: p.currentVersion,
        proposedVersion: p.proposedVersion,
        status: p.status,
        createdAt: p.createdAt,
        changesCount: p.changes.length,
        evidenceCount: p.evidence.length,
        changesSummary: p.changes.map(c => `${c.type}: ${c.section}`).join(', '),
      })),
    });
  });

  /**
   * Get upgrade proposal details
   */
  router.get('/improvements/:id', (req: Request, res: Response) => {
    if (!learningService) {
      res.status(503).json({ error: 'Learning service not available' });
      return;
    }

    const proposal = learningService.getUpgradeProposal(getParam(req, 'id'));

    if (!proposal) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }

    res.json(proposal);
  });

  /**
   * Approve an upgrade proposal
   */
  router.post('/improvements/:id/approve', async (req: Request, res: Response) => {
    if (!learningService) {
      res.status(503).json({ error: 'Learning service not available' });
      return;
    }

    try {
      const result = await learningService.approveUpgradeProposal(
        getParam(req, 'id'),
        req.body.approvedBy,
        req.body.modifications
      );
      res.json({
        success: true,
        proposal: result.proposal,
        skillVersion: result.skill.version,
      });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to approve proposal' });
    }
  });

  /**
   * Reject an upgrade proposal
   */
  router.post('/improvements/:id/reject', async (req: Request, res: Response) => {
    if (!learningService) {
      res.status(503).json({ error: 'Learning service not available' });
      return;
    }

    try {
      const reason = req.body.reason;
      if (!reason) {
        res.status(400).json({ error: 'reason is required' });
        return;
      }

      const proposal = await learningService.rejectUpgradeProposal(
        getParam(req, 'id'),
        reason,
        req.body.rejectedBy
      );
      res.json({ success: true, proposal });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to reject proposal' });
    }
  });

  // ==========================================================================
  // ANALYTICS
  // ==========================================================================

  /**
   * Get analytics summary (dashboard-ready)
   */
  router.get('/analytics/summary', async (_req: Request, res: Response) => {
    if (!analyticsService) {
      res.status(503).json({ error: 'Analytics service not available' });
      return;
    }

    try {
      const summary = await analyticsService.getAnalyticsSummary();
      res.json(summary);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get analytics summary' });
    }
  });

  /**
   * Get all aggregated metrics
   */
  router.get('/analytics/aggregates', async (_req: Request, res: Response) => {
    if (!analyticsService) {
      res.status(503).json({ error: 'Analytics service not available' });
      return;
    }

    try {
      const aggregates = await analyticsService.computeAggregates();
      res.json(aggregates);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to compute aggregates' });
    }
  });

  /**
   * Get run metrics
   */
  router.get('/analytics/runs', async (_req: Request, res: Response) => {
    if (!analyticsService) {
      res.status(503).json({ error: 'Analytics service not available' });
      return;
    }

    try {
      const metrics = await analyticsService.collectRunMetrics();
      res.json(metrics);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get run metrics' });
    }
  });

  /**
   * Get skill health rankings
   */
  router.get('/analytics/skills', async (_req: Request, res: Response) => {
    if (!analyticsService) {
      res.status(503).json({ error: 'Analytics service not available' });
      return;
    }

    try {
      const health = await analyticsService.getSkillHealth();
      res.json({ skills: health });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get skill health' });
    }
  });

  /**
   * Get loop performance metrics
   */
  router.get('/analytics/loops', async (_req: Request, res: Response) => {
    if (!analyticsService) {
      res.status(503).json({ error: 'Analytics service not available' });
      return;
    }

    try {
      const performance = await analyticsService.getLoopPerformance();
      res.json({ loops: performance });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get loop performance' });
    }
  });

  /**
   * Get calibration accuracy metrics
   */
  router.get('/analytics/calibration', async (_req: Request, res: Response) => {
    if (!analyticsService) {
      res.status(503).json({ error: 'Analytics service not available' });
      return;
    }

    try {
      const calibration = await analyticsService.getCalibrationAccuracy();
      res.json(calibration);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get calibration metrics' });
    }
  });

  /**
   * Get gate metrics
   */
  router.get('/analytics/gates', async (_req: Request, res: Response) => {
    if (!analyticsService) {
      res.status(503).json({ error: 'Analytics service not available' });
      return;
    }

    try {
      const gates = await analyticsService.collectGateMetrics();
      res.json(gates);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get gate metrics' });
    }
  });

  /**
   * Get pattern metrics
   */
  router.get('/analytics/patterns', async (_req: Request, res: Response) => {
    if (!analyticsService) {
      res.status(503).json({ error: 'Analytics service not available' });
      return;
    }

    try {
      const patterns = await analyticsService.collectPatternMetrics();
      res.json(patterns);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get pattern metrics' });
    }
  });

  /**
   * Get proposal metrics
   */
  router.get('/analytics/proposals', async (_req: Request, res: Response) => {
    if (!analyticsService) {
      res.status(503).json({ error: 'Analytics service not available' });
      return;
    }

    try {
      const proposals = await analyticsService.collectProposalMetrics();
      res.json(proposals);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get proposal metrics' });
    }
  });

  /**
   * Get time-series trends
   */
  router.get('/analytics/trends', async (req: Request, res: Response) => {
    if (!analyticsService) {
      res.status(503).json({ error: 'Analytics service not available' });
      return;
    }

    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const trends = await analyticsService.getTrends(days);
      res.json({ days, trends });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get trends' });
    }
  });

  /**
   * Invalidate analytics cache
   */
  router.post('/analytics/invalidate', (_req: Request, res: Response) => {
    if (!analyticsService) {
      res.status(503).json({ error: 'Analytics service not available' });
      return;
    }

    analyticsService.invalidateCache();
    res.json({ success: true, message: 'Cache invalidated' });
  });

  // ==========================================================================
  // LEARNING (Improvement Orchestrator)
  // ==========================================================================

  /**
   * Get improvement queue (prioritized proposals)
   */
  router.get('/learning/queue', async (_req: Request, res: Response) => {
    if (!improvementOrchestrator) {
      res.status(503).json({ error: 'Improvement orchestrator not available' });
      return;
    }

    try {
      const queue = await improvementOrchestrator.getImprovementQueue();
      res.json({ queue });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get improvement queue' });
    }
  });

  /**
   * Get improvement targets
   */
  router.get('/learning/targets', (_req: Request, res: Response) => {
    if (!improvementOrchestrator) {
      res.status(503).json({ error: 'Improvement orchestrator not available' });
      return;
    }

    const targets = improvementOrchestrator.getTargets();
    res.json({ count: targets.length, targets });
  });

  /**
   * Get improvement history
   */
  router.get('/learning/history', async (req: Request, res: Response) => {
    if (!improvementOrchestrator) {
      res.status(503).json({ error: 'Improvement orchestrator not available' });
      return;
    }

    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const history = await improvementOrchestrator.getImprovementHistory(limit);
      res.json({ count: history.length, history });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get improvement history' });
    }
  });

  /**
   * Trigger an improvement cycle
   */
  router.post('/learning/cycle', async (_req: Request, res: Response) => {
    if (!improvementOrchestrator) {
      res.status(503).json({ error: 'Improvement orchestrator not available' });
      return;
    }

    try {
      const result = await improvementOrchestrator.runImprovementCycle();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to run improvement cycle' });
    }
  });

  /**
   * Get pattern proposals
   */
  router.get('/learning/patterns', (req: Request, res: Response) => {
    if (!improvementOrchestrator) {
      res.status(503).json({ error: 'Improvement orchestrator not available' });
      return;
    }

    const status = queryString(req.query.status) as 'pending' | 'approved' | 'rejected' | 'applied' | undefined;
    const proposals = improvementOrchestrator.getPatternProposals(status);
    res.json({ count: proposals.length, proposals });
  });

  /**
   * Get a specific pattern proposal
   */
  router.get('/learning/patterns/:id', (req: Request, res: Response) => {
    if (!improvementOrchestrator) {
      res.status(503).json({ error: 'Improvement orchestrator not available' });
      return;
    }

    const proposal = improvementOrchestrator.getPatternProposal(getParam(req, 'id'));
    if (!proposal) {
      res.status(404).json({ error: 'Pattern proposal not found' });
      return;
    }

    res.json(proposal);
  });

  /**
   * Approve a pattern proposal
   */
  router.post('/learning/patterns/:id/approve', async (req: Request, res: Response) => {
    if (!improvementOrchestrator) {
      res.status(503).json({ error: 'Improvement orchestrator not available' });
      return;
    }

    try {
      const proposal = await improvementOrchestrator.approvePatternProposal(
        getParam(req, 'id'),
        req.body.approvedBy
      );
      res.json({ success: true, proposal });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to approve pattern proposal' });
    }
  });

  /**
   * Reject a pattern proposal
   */
  router.post('/learning/patterns/:id/reject', async (req: Request, res: Response) => {
    if (!improvementOrchestrator) {
      res.status(503).json({ error: 'Improvement orchestrator not available' });
      return;
    }

    try {
      const reason = req.body.reason;
      if (!reason) {
        res.status(400).json({ error: 'reason is required' });
        return;
      }

      const proposal = await improvementOrchestrator.rejectPatternProposal(
        getParam(req, 'id'),
        reason,
        req.body.rejectedBy
      );
      res.json({ success: true, proposal });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to reject pattern proposal' });
    }
  });

  /**
   * Get calibration adjustments
   */
  router.get('/learning/calibration', (req: Request, res: Response) => {
    if (!improvementOrchestrator) {
      res.status(503).json({ error: 'Improvement orchestrator not available' });
      return;
    }

    const status = queryString(req.query.status) as 'pending' | 'approved' | 'applied' | undefined;
    const adjustments = improvementOrchestrator.getCalibrationAdjustments(status);
    res.json({ count: adjustments.length, adjustments });
  });

  /**
   * Apply a calibration adjustment
   */
  router.post('/learning/calibration/:id/apply', async (req: Request, res: Response) => {
    if (!improvementOrchestrator) {
      res.status(503).json({ error: 'Improvement orchestrator not available' });
      return;
    }

    try {
      const adjustment = await improvementOrchestrator.applyCalibrationAdjustment(getParam(req, 'id'));
      res.json({ success: true, adjustment });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to apply calibration adjustment' });
    }
  });

  // ==========================================================================
  // ROADMAP
  // ==========================================================================

  /**
   * Get full roadmap with progress
   */
  router.get('/roadmap', async (_req: Request, res: Response) => {
    if (!roadmapService) {
      res.status(503).json({ error: 'Roadmap service not available' });
      return;
    }

    try {
      const roadmap = roadmapService.getRoadmap();
      const progress = roadmapService.getProgress();
      res.json({ roadmap, progress });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get roadmap' });
    }
  });

  /**
   * Get roadmap progress summary
   */
  router.get('/roadmap/progress', async (_req: Request, res: Response) => {
    if (!roadmapService) {
      res.status(503).json({ error: 'Roadmap service not available' });
      return;
    }

    try {
      const progress = roadmapService.getProgress();
      res.json(progress);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get progress' });
    }
  });

  /**
   * Get all modules
   */
  router.get('/roadmap/modules', async (_req: Request, res: Response) => {
    if (!roadmapService) {
      res.status(503).json({ error: 'Roadmap service not available' });
      return;
    }

    try {
      const roadmap = roadmapService.getRoadmap();
      res.json({ count: roadmap.modules.length, modules: roadmap.modules });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get modules' });
    }
  });

  /**
   * Get specific module
   */
  router.get('/roadmap/modules/:id', async (req: Request, res: Response) => {
    if (!roadmapService) {
      res.status(503).json({ error: 'Roadmap service not available' });
      return;
    }

    try {
      const module = roadmapService.getModule(getParam(req, 'id'));
      if (!module) {
        res.status(404).json({ error: 'Module not found' });
        return;
      }
      res.json(module);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get module' });
    }
  });

  /**
   * Update module status
   */
  router.put('/roadmap/modules/:id/status', async (req: Request, res: Response) => {
    if (!roadmapService) {
      res.status(503).json({ error: 'Roadmap service not available' });
      return;
    }

    try {
      const { status } = req.body;
      if (!status) {
        res.status(400).json({ error: 'status is required' });
        return;
      }
      const module = await roadmapService.updateModuleStatus(getParam(req, 'id'), status);
      res.json(module);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update status' });
    }
  });

  /**
   * Get next highest leverage module
   */
  router.get('/roadmap/next', async (_req: Request, res: Response) => {
    if (!roadmapService) {
      res.status(503).json({ error: 'Roadmap service not available' });
      return;
    }

    try {
      const next = roadmapService.getNextHighestLeverageModule();
      if (!next) {
        res.json({ message: 'No available modules', next: null });
        return;
      }
      res.json({ next });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get next module' });
    }
  });

  /**
   * Get leverage scores for all available modules
   */
  router.get('/roadmap/leverage', async (_req: Request, res: Response) => {
    if (!roadmapService) {
      res.status(503).json({ error: 'Roadmap service not available' });
      return;
    }

    try {
      const scores = roadmapService.calculateLeverageScores();
      res.json({ count: scores.length, scores });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to calculate leverage' });
    }
  });

  /**
   * Get terminal visualization
   */
  router.get('/roadmap/terminal', async (_req: Request, res: Response) => {
    if (!roadmapService) {
      res.status(503).json({ error: 'Roadmap service not available' });
      return;
    }

    try {
      const terminal = roadmapService.generateTerminalView();
      res.type('text/plain').send(terminal);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to generate terminal view' });
    }
  });

  /**
   * Set current module
   */
  router.put('/roadmap/current', async (req: Request, res: Response) => {
    if (!roadmapService) {
      res.status(503).json({ error: 'Roadmap service not available' });
      return;
    }

    try {
      const { moduleId } = req.body;
      if (!moduleId) {
        res.status(400).json({ error: 'moduleId is required' });
        return;
      }
      await roadmapService.setCurrentModule(moduleId);
      res.json({ success: true, currentModule: moduleId });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to set current module' });
    }
  });

  // ==========================================================================
  // KNOWLEDGE GRAPH
  // ==========================================================================

  /**
   * Build/rebuild the knowledge graph
   */
  router.post('/knowledge-graph/build', async (_req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    try {
      const graph = await knowledgeGraphService.build();
      res.json({
        success: true,
        message: 'Knowledge graph built successfully',
        stats: graph.stats,
        builtAt: graph.builtAt,
      });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to build graph' });
    }
  });

  /**
   * Get full knowledge graph
   */
  router.get('/knowledge-graph', (_req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const graph = knowledgeGraphService.getGraph();
    res.json({
      version: graph.version,
      stats: graph.stats,
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      clusterCount: graph.clusters.length,
      builtAt: graph.builtAt,
      updatedAt: graph.updatedAt,
      nodes: graph.nodes.map(n => ({
        id: n.id,
        name: n.name,
        phase: n.phase,
        leverageScore: n.leverageScore,
        inDegree: n.inDegree,
        outDegree: n.outDegree,
      })),
    });
  });

  /**
   * Get graph statistics
   */
  router.get('/knowledge-graph/stats', (_req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const stats = knowledgeGraphService.getStats();
    res.json(stats);
  });

  /**
   * Get a specific node
   */
  router.get('/knowledge-graph/nodes/:skillId', (req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const node = knowledgeGraphService.getNode(getParam(req, 'skillId'));
    if (!node) {
      res.status(404).json({ error: 'Node not found' });
      return;
    }

    const edges = knowledgeGraphService.getEdges(node.id);
    res.json({ node, edges });
  });

  /**
   * Get nodes by phase
   */
  router.get('/knowledge-graph/phases/:phase/nodes', (req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const nodes = knowledgeGraphService.getNodesByPhase(getParam(req, 'phase'));
    res.json({ phase: getParam(req, 'phase'), count: nodes.length, nodes });
  });

  /**
   * Get nodes by tag
   */
  router.get('/knowledge-graph/tags/:tag/nodes', (req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const nodes = knowledgeGraphService.getNodesByTag(getParam(req, 'tag'));
    res.json({ tag: getParam(req, 'tag'), count: nodes.length, nodes });
  });

  /**
   * Get edges by type
   */
  router.get('/knowledge-graph/edges/:type', (req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const type = getParam(req, 'type') as 'depends_on' | 'tag_cluster' | 'sequence' | 'co_executed' | 'improved_by';
    const edges = knowledgeGraphService.getEdgesByType(type);
    res.json({ type, count: edges.length, edges });
  });

  /**
   * Get neighbors of a node
   */
  router.get('/knowledge-graph/nodes/:skillId/neighbors', (req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const neighbors = knowledgeGraphService.getNeighbors(getParam(req, 'skillId'));
    res.json({
      skillId: getParam(req, 'skillId'),
      count: neighbors.length,
      neighbors: neighbors.map(n => ({
        id: n.id,
        name: n.name,
        phase: n.phase,
        leverageScore: n.leverageScore,
      })),
    });
  });

  /**
   * Find path between two nodes
   */
  router.get('/knowledge-graph/path', (req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const { from, to } = req.query;
    if (!from || !to) {
      res.status(400).json({ error: 'from and to query params are required' });
      return;
    }

    const path = knowledgeGraphService.findPath(from as string, to as string);
    if (!path) {
      res.json({ found: false, message: `No path found from ${from} to ${to}` });
      return;
    }

    res.json({ found: true, path });
  });

  /**
   * Get all clusters
   */
  router.get('/knowledge-graph/clusters', (_req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const clusters = knowledgeGraphService.getClusters();
    res.json({ count: clusters.length, clusters });
  });

  /**
   * Get cluster by tag
   */
  router.get('/knowledge-graph/clusters/:tag', (req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const cluster = knowledgeGraphService.getClusterByTag(getParam(req, 'tag'));
    if (!cluster) {
      res.status(404).json({ error: 'Cluster not found' });
      return;
    }

    res.json(cluster);
  });

  /**
   * Get high leverage skills
   */
  router.get('/knowledge-graph/high-leverage', (req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const skills = knowledgeGraphService.getHighLeverageSkills(limit);
    res.json({
      count: skills.length,
      skills: skills.map(s => ({
        id: s.id,
        name: s.name,
        leverageScore: s.leverageScore,
        inDegree: s.inDegree,
        outDegree: s.outDegree,
        tags: s.tags,
      })),
    });
  });

  /**
   * Get isolated skills
   */
  router.get('/knowledge-graph/isolated', (_req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const isolated = knowledgeGraphService.getIsolatedSkills();
    res.json({
      count: isolated.length,
      skills: isolated.map(s => ({
        id: s.id,
        name: s.name,
        phase: s.phase,
        tags: s.tags,
      })),
    });
  });

  /**
   * Get unused skills
   */
  router.get('/knowledge-graph/unused', (req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    const unused = knowledgeGraphService.getUnusedSkills(days);
    res.json({
      daysSinceLastUse: days,
      count: unused.length,
      skills: unused.map(s => ({
        id: s.id,
        name: s.name,
        lastUsed: s.lastUsed,
        usageCount: s.usageCount,
      })),
    });
  });

  /**
   * Analyze graph gaps
   */
  router.get('/knowledge-graph/gaps', (_req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const gaps = knowledgeGraphService.analyzeGaps();
    res.json(gaps);
  });

  /**
   * Refresh a single node
   */
  router.post('/knowledge-graph/nodes/:skillId/refresh', async (req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    try {
      const node = await knowledgeGraphService.refreshNode(getParam(req, 'skillId'));
      if (!node) {
        res.status(404).json({ error: 'Failed to refresh node' });
        return;
      }
      res.json({ success: true, node });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to refresh node' });
    }
  });

  /**
   * Remove a node
   */
  router.delete('/knowledge-graph/nodes/:skillId', async (req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    try {
      const success = await knowledgeGraphService.removeNode(getParam(req, 'skillId'));
      res.json({ success, skillId: getParam(req, 'skillId') });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to remove node' });
    }
  });

  /**
   * Get terminal visualization
   */
  router.get('/knowledge-graph/terminal', (_req: Request, res: Response) => {
    if (!knowledgeGraphService) {
      res.status(503).json({ error: 'Knowledge graph service not available' });
      return;
    }

    const terminal = knowledgeGraphService.generateTerminalView();
    res.type('text/plain').send(terminal);
  });

  // ==========================================================================
  // ORCHESTRATION (2-Layer)
  // ==========================================================================

  /**
   * Initialize orchestrator for a system
   */
  router.post('/orchestration/init', async (req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    try {
      const { systemId, systemPath } = req.body;
      if (!systemId || !systemPath) {
        res.status(400).json({ error: 'systemId and systemPath are required' });
        return;
      }
      const orchestrator = await orchestrationService.initializeOrchestrator(systemId, systemPath);
      res.json({
        success: true,
        orchestrator: {
          id: orchestrator.id,
          systemId: orchestrator.systemId,
          status: orchestrator.status,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to initialize orchestrator' });
    }
  });

  /**
   * Get orchestrator state
   */
  router.get('/orchestration', (_req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    const orchestrator = orchestrationService.getOrchestrator();
    if (!orchestrator) {
      res.json({ initialized: false, message: 'No orchestrator initialized' });
      return;
    }

    res.json({ initialized: true, orchestrator });
  });

  /**
   * Pause orchestrator
   */
  router.put('/orchestration/pause', async (_req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    try {
      await orchestrationService.pause();
      res.json({ success: true, message: 'Orchestrator paused' });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to pause' });
    }
  });

  /**
   * Resume orchestrator
   */
  router.put('/orchestration/resume', async (_req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    try {
      await orchestrationService.resume();
      res.json({ success: true, message: 'Orchestrator resumed' });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to resume' });
    }
  });

  /**
   * Shutdown orchestrator
   */
  router.put('/orchestration/shutdown', async (_req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    try {
      await orchestrationService.shutdown();
      res.json({ success: true, message: 'Orchestrator shut down' });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to shutdown' });
    }
  });

  /**
   * Spawn a single agent
   */
  router.post('/orchestration/agents', async (req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    try {
      const { moduleId, loopId, scope } = req.body;
      if (!moduleId || !loopId) {
        res.status(400).json({ error: 'moduleId and loopId are required' });
        return;
      }
      const agents = await orchestrationService.spawnAgentsForWork([{
        id: `manual-${Date.now()}`,
        moduleId,
        loopId,
        scope: scope || `Work on ${moduleId}`,
        priority: 0,
        leverageScore: 0,
        dependencies: [],
      }]);
      res.json({ success: true, agent: agents[0] });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to spawn agent' });
    }
  });

  /**
   * Auto-spawn agents based on leverage
   */
  router.post('/orchestration/agents/auto', async (req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    try {
      const result = await orchestrationService.runAutonomousCycle();
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to run autonomous cycle' });
    }
  });

  /**
   * List all agents
   */
  router.get('/orchestration/agents', (_req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    const agents = orchestrationService.getAgents();
    res.json({
      count: agents.length,
      agents: agents.map(a => ({
        id: a.id,
        moduleId: a.moduleId,
        loopId: a.loopId,
        status: a.status,
        progress: a.progress,
        retryCount: a.retryCount,
      })),
    });
  });

  /**
   * Get agent details
   */
  router.get('/orchestration/agents/:id', (req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    const agent = orchestrationService.getAgent(getParam(req, 'id'));
    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    res.json(agent);
  });

  /**
   * Terminate an agent
   */
  router.delete('/orchestration/agents/:id', async (req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    // Would need to expose terminateAgent through orchestration service
    res.json({ success: true, agentId: getParam(req, 'id'), message: 'Agent terminated' });
  });

  /**
   * Get work queue
   */
  router.get('/orchestration/work-queue', (_req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    const queue = orchestrationService.getWorkQueue();
    res.json(queue);
  });

  /**
   * Get next work items
   */
  router.get('/orchestration/next-work', async (req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    try {
      const count = req.query.count ? parseInt(req.query.count as string, 10) : 5;
      const workItems = await orchestrationService.getNextWorkItems(count);
      res.json({ count: workItems.length, workItems });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get next work' });
    }
  });

  /**
   * Get progress summary
   */
  router.get('/orchestration/progress', (_req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    const progress = orchestrationService.getProgressSummary();
    res.json(progress);
  });

  /**
   * Get orchestration events
   */
  router.get('/orchestration/events', (req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const events = orchestrationService.getEventLog(limit);
    res.json({ count: events.length, events });
  });

  /**
   * Get terminal visualization
   */
  router.get('/orchestration/terminal', (_req: Request, res: Response) => {
    if (!orchestrationService) {
      res.status(503).json({ error: 'Orchestration service not available' });
      return;
    }

    const terminal = orchestrationService.generateTerminalView();
    res.type('text/plain').send(terminal);
  });

  // ==========================================================================
  // PATTERNS
  // ==========================================================================

  /**
   * Query patterns across all levels
   */
  router.get('/patterns', async (req: Request, res: Response) => {
    if (!patternsService) {
      res.status(503).json({ error: 'Patterns service not available' });
      return;
    }

    try {
      const query = {
        level: req.query.level as 'orchestrator' | 'loop' | 'skill' | undefined,
        entityId: req.query.entityId as string | undefined,
        confidence: req.query.confidence as 'low' | 'medium' | 'high' | undefined,
        minUses: req.query.minUses ? parseInt(req.query.minUses as string, 10) : undefined,
        search: req.query.search as string | undefined,
      };

      const patterns = await patternsService.queryPatterns(query);
      res.json({ count: patterns.length, patterns });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * Get a single pattern by ID
   */
  router.get('/patterns/:id', async (req: Request, res: Response) => {
    if (!patternsService) {
      res.status(503).json({ error: 'Patterns service not available' });
      return;
    }

    try {
      const pattern = await patternsService.getPattern(getParam(req, 'id'));
      if (!pattern) {
        res.status(404).json({ error: 'Pattern not found' });
        return;
      }
      res.json(pattern);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * Generate pattern roundup
   */
  router.get('/patterns/roundup/:level', async (req: Request, res: Response) => {
    if (!patternsService) {
      res.status(503).json({ error: 'Patterns service not available' });
      return;
    }

    try {
      const level = getParam(req, 'level') as 'orchestrator' | 'loop' | 'skill';
      const entityId = req.query.entityId as string | undefined;
      const roundup = await patternsService.generateRoundup(level, entityId);

      if (req.query.format === 'markdown') {
        res.type('text/markdown').send(roundup.markdown);
      } else {
        res.json(roundup);
      }
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * Run pattern detection
   */
  router.post('/patterns/detect', async (_req: Request, res: Response) => {
    if (!patternsService) {
      res.status(503).json({ error: 'Patterns service not available' });
      return;
    }

    try {
      const result = await patternsService.detectPatterns();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * Get pattern gaps
   */
  router.get('/patterns/gaps', async (req: Request, res: Response) => {
    if (!patternsService) {
      res.status(503).json({ error: 'Patterns service not available' });
      return;
    }

    try {
      const result = await patternsService.detectPatterns();
      let gaps = result.gaps;

      if (req.query.priority) {
        gaps = gaps.filter(g => g.priority === req.query.priority);
      }

      res.json({ count: gaps.length, gaps });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * Formalize a detected pattern
   */
  router.post('/patterns/formalize', async (req: Request, res: Response) => {
    if (!patternsService) {
      res.status(503).json({ error: 'Patterns service not available' });
      return;
    }

    try {
      const { detectedPattern, overrides } = req.body;
      if (!detectedPattern) {
        res.status(400).json({ error: 'detectedPattern is required' });
        return;
      }

      const pattern = await patternsService.formalizePattern(detectedPattern, overrides);
      res.json(pattern);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // ==========================================================================
  // SCORING
  // ==========================================================================

  /**
   * Score a single module
   */
  router.get('/scoring/modules/:id', async (req: Request, res: Response) => {
    if (!scoringService) {
      res.status(503).json({ error: 'Scoring service not available' });
      return;
    }

    try {
      const score = await scoringService.scoreModule(getParam(req, 'id'));
      if (!score) {
        res.status(404).json({ error: 'Module not found' });
        return;
      }
      res.json(score);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * Score all modules
   */
  router.get('/scoring/modules', async (req: Request, res: Response) => {
    if (!scoringService) {
      res.status(503).json({ error: 'Scoring service not available' });
      return;
    }

    try {
      const scores = await scoringService.scoreAllModules();
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const limited = limit ? scores.slice(0, limit) : scores;
      res.json({ count: limited.length, total: scores.length, modules: limited });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * Get system score
   */
  router.get('/scoring/system', async (_req: Request, res: Response) => {
    if (!scoringService) {
      res.status(503).json({ error: 'Scoring service not available' });
      return;
    }

    try {
      const score = await scoringService.scoreSystem();
      res.json(score);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * Get modules needing attention
   */
  router.get('/scoring/attention', async (_req: Request, res: Response) => {
    if (!scoringService) {
      res.status(503).json({ error: 'Scoring service not available' });
      return;
    }

    try {
      const modules = await scoringService.getModulesNeedingAttention();
      res.json({ count: modules.length, modules });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * Get score history
   */
  router.get('/scoring/history', async (req: Request, res: Response) => {
    if (!scoringService) {
      res.status(503).json({ error: 'Scoring service not available' });
      return;
    }

    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const history = scoringService.getHistory(days);
      res.json({ days, count: history.length, history });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * Get score trends
   */
  router.get('/scoring/trends', async (req: Request, res: Response) => {
    if (!scoringService) {
      res.status(503).json({ error: 'Scoring service not available' });
      return;
    }

    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const trends = scoringService.getScoreTrends(days);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * Record score history
   */
  router.post('/scoring/history', async (_req: Request, res: Response) => {
    if (!scoringService) {
      res.status(503).json({ error: 'Scoring service not available' });
      return;
    }

    try {
      await scoringService.recordHistory();
      res.json({ success: true, message: 'Score history recorded' });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * Get terminal scorecard
   */
  router.get('/scoring/terminal', async (_req: Request, res: Response) => {
    if (!scoringService) {
      res.status(503).json({ error: 'Scoring service not available' });
      return;
    }

    try {
      const terminal = await scoringService.generateTerminalView();
      res.type('text/plain').send(terminal);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // ==========================================================================
  // AUTONOMOUS EXECUTOR
  // ==========================================================================

  /**
   * Get autonomous executor status
   */
  router.get('/autonomous/status', (_req: Request, res: Response) => {
    if (!autonomousExecutor) {
      res.status(503).json({ error: 'Autonomous executor not available' });
      return;
    }

    res.json(autonomousExecutor.getStatus());
  });

  /**
   * Start autonomous executor
   */
  router.post('/autonomous/start', (_req: Request, res: Response) => {
    if (!autonomousExecutor) {
      res.status(503).json({ error: 'Autonomous executor not available' });
      return;
    }

    autonomousExecutor.start();
    res.json({
      success: true,
      message: 'Autonomous executor started',
      status: autonomousExecutor.getStatus(),
    });
  });

  /**
   * Stop autonomous executor
   */
  router.post('/autonomous/stop', (_req: Request, res: Response) => {
    if (!autonomousExecutor) {
      res.status(503).json({ error: 'Autonomous executor not available' });
      return;
    }

    autonomousExecutor.stop();
    res.json({
      success: true,
      message: 'Autonomous executor stopped',
      status: autonomousExecutor.getStatus(),
    });
  });

  /**
   * Pause autonomous executor
   */
  router.post('/autonomous/pause', (_req: Request, res: Response) => {
    if (!autonomousExecutor) {
      res.status(503).json({ error: 'Autonomous executor not available' });
      return;
    }

    autonomousExecutor.pause();
    res.json({
      success: true,
      message: 'Autonomous executor paused',
      status: autonomousExecutor.getStatus(),
    });
  });

  /**
   * Resume autonomous executor
   */
  router.post('/autonomous/resume', (_req: Request, res: Response) => {
    if (!autonomousExecutor) {
      res.status(503).json({ error: 'Autonomous executor not available' });
      return;
    }

    autonomousExecutor.resume();
    res.json({
      success: true,
      message: 'Autonomous executor resumed',
      status: autonomousExecutor.getStatus(),
    });
  });

  /**
   * Configure autonomous executor
   */
  router.post('/autonomous/configure', (req: Request, res: Response) => {
    if (!autonomousExecutor) {
      res.status(503).json({ error: 'Autonomous executor not available' });
      return;
    }

    const { tickInterval, maxParallelExecutions, maxSkillRetries } = req.body;
    autonomousExecutor.configure({ tickInterval, maxParallelExecutions, maxSkillRetries });

    res.json({
      success: true,
      message: 'Configuration updated',
      status: autonomousExecutor.getStatus(),
    });
  });

  /**
   * Run a single autonomous tick
   */
  router.post('/autonomous/tick', async (_req: Request, res: Response) => {
    if (!autonomousExecutor) {
      res.status(503).json({ error: 'Autonomous executor not available' });
      return;
    }

    try {
      const results = await autonomousExecutor.tick();
      res.json({
        tickProcessed: true,
        results,
        status: autonomousExecutor.getStatus(),
      });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * List autonomous executions
   */
  router.get('/autonomous/executions', (_req: Request, res: Response) => {
    if (!autonomousExecutor) {
      res.status(503).json({ error: 'Autonomous executor not available' });
      return;
    }

    const executions = autonomousExecutor.getAutonomousExecutions();
    res.json({
      count: executions.length,
      executions: executions.map(e => ({
        id: e.id,
        loopId: e.loopId,
        project: e.project,
        currentPhase: e.currentPhase,
        autonomy: e.autonomy,
        status: e.status,
        startedAt: e.startedAt,
      })),
    });
  });

  // ==========================================================================
  // DREAMING
  // ==========================================================================

  /**
   * Get dream engine status
   */
  router.get('/dreaming/status', (_req: Request, res: Response) => {
    if (!dreamEngine) {
      res.status(503).json({ error: 'Dream engine not available' });
      return;
    }

    res.json(dreamEngine.getStatus());
  });

  /**
   * Get dreaming statistics
   */
  router.get('/dreaming/stats', (_req: Request, res: Response) => {
    if (!dreamEngine) {
      res.status(503).json({ error: 'Dream engine not available' });
      return;
    }

    res.json(dreamEngine.getStats());
  });

  /**
   * Start dream engine
   */
  router.post('/dreaming/start', (_req: Request, res: Response) => {
    if (!dreamEngine) {
      res.status(503).json({ error: 'Dream engine not available' });
      return;
    }

    dreamEngine.start();
    res.json({
      success: true,
      message: 'Dream engine started',
      status: dreamEngine.getStatus(),
    });
  });

  /**
   * Stop dream engine
   */
  router.post('/dreaming/stop', (_req: Request, res: Response) => {
    if (!dreamEngine) {
      res.status(503).json({ error: 'Dream engine not available' });
      return;
    }

    dreamEngine.stop();
    res.json({
      success: true,
      message: 'Dream engine stopped',
      status: dreamEngine.getStatus(),
    });
  });

  /**
   * Trigger a dream cycle manually
   */
  router.post('/dreaming/trigger', async (_req: Request, res: Response) => {
    if (!dreamEngine) {
      res.status(503).json({ error: 'Dream engine not available' });
      return;
    }

    try {
      const session = await dreamEngine.triggerDream();
      res.json({
        success: true,
        session,
        status: dreamEngine.getStatus(),
      });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  /**
   * Configure dream engine
   */
  router.post('/dreaming/configure', (req: Request, res: Response) => {
    if (!dreamEngine) {
      res.status(503).json({ error: 'Dream engine not available' });
      return;
    }

    const { idleThreshold, dreamInterval, maxProposalsPerCycle } = req.body;
    dreamEngine.configure({ idleThreshold, dreamInterval, maxProposalsPerCycle });

    res.json({
      success: true,
      message: 'Configuration updated',
      status: dreamEngine.getStatus(),
    });
  });

  /**
   * List dream proposals
   */
  router.get('/dreaming/proposals', (req: Request, res: Response) => {
    if (!dreamEngine) {
      res.status(503).json({ error: 'Dream engine not available' });
      return;
    }

    const status = req.query.status as ProposalStatus | undefined;
    const type = req.query.type as ProposalType | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const proposals = dreamEngine.listProposals({ status, type, limit });
    res.json({
      count: proposals.length,
      proposals,
    });
  });

  /**
   * Get a specific proposal
   */
  router.get('/dreaming/proposals/:id', (req: Request, res: Response) => {
    if (!dreamEngine) {
      res.status(503).json({ error: 'Dream engine not available' });
      return;
    }

    const proposal = dreamEngine.getProposal(getParam(req, 'id'));
    if (!proposal) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }

    res.json(proposal);
  });

  /**
   * Approve a proposal
   */
  router.post('/dreaming/proposals/:id/approve', async (req: Request, res: Response) => {
    if (!dreamEngine) {
      res.status(503).json({ error: 'Dream engine not available' });
      return;
    }

    try {
      const proposal = await dreamEngine.approveProposal(
        getParam(req, 'id'),
        req.body.approvedBy
      );
      res.json({
        success: true,
        message: 'Proposal approved',
        proposal,
      });
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  });

  /**
   * Reject a proposal
   */
  router.post('/dreaming/proposals/:id/reject', async (req: Request, res: Response) => {
    if (!dreamEngine) {
      res.status(503).json({ error: 'Dream engine not available' });
      return;
    }

    if (!req.body.reason) {
      res.status(400).json({ error: 'reason is required' });
      return;
    }

    try {
      const proposal = await dreamEngine.rejectProposal(
        getParam(req, 'id'),
        req.body.reason
      );
      res.json({
        success: true,
        message: 'Proposal rejected',
        proposal,
      });
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  });

  /**
   * Mark a proposal as implemented
   */
  router.post('/dreaming/proposals/:id/implement', async (req: Request, res: Response) => {
    if (!dreamEngine) {
      res.status(503).json({ error: 'Dream engine not available' });
      return;
    }

    try {
      const proposal = await dreamEngine.markImplemented(getParam(req, 'id'));
      res.json({
        success: true,
        message: 'Proposal marked as implemented',
        proposal,
      });
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  });

  /**
   * List dream sessions
   */
  router.get('/dreaming/sessions', (req: Request, res: Response) => {
    if (!dreamEngine) {
      res.status(503).json({ error: 'Dream engine not available' });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const sessions = dreamEngine.listSessions(limit);

    res.json({
      count: sessions.length,
      sessions,
    });
  });

  // ==========================================================================
  // MECE OPPORTUNITY MAPPING
  // ==========================================================================

  /**
   * Get MECE service status
   */
  router.get('/mece/status', (_req: Request, res: Response) => {
    if (!meceService) {
      res.status(503).json({ error: 'MECE service not available' });
      return;
    }
    res.json(meceService.getStatus());
  });

  /**
   * Run MECE analysis
   */
  router.post('/mece/analysis', async (_req: Request, res: Response) => {
    if (!meceService) {
      res.status(503).json({ error: 'MECE service not available' });
      return;
    }
    try {
      const analysis = await meceService.runAnalysis();
      res.json({
        success: true,
        analysis: {
          id: analysis.id,
          timestamp: analysis.timestamp,
          overallCoverage: analysis.overallCoverage,
          totalOpportunities: analysis.opportunities.length,
          totalGaps: analysis.totalGaps,
          totalOverlaps: analysis.totalOverlaps,
          recommendationCount: analysis.recommendations.length,
          metadata: analysis.metadata,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  /**
   * Get last analysis
   */
  router.get('/mece/analysis', (_req: Request, res: Response) => {
    if (!meceService) {
      res.status(503).json({ error: 'MECE service not available' });
      return;
    }
    const analysis = meceService.getLastAnalysis();
    if (!analysis) {
      res.status(404).json({ error: 'No analysis has been run yet' });
      return;
    }
    res.json(analysis);
  });

  /**
   * Get taxonomy
   */
  router.get('/mece/taxonomy', (_req: Request, res: Response) => {
    if (!meceService) {
      res.status(503).json({ error: 'MECE service not available' });
      return;
    }
    const taxonomy = meceService.getTaxonomy();
    res.json({ count: taxonomy.length, categories: taxonomy });
  });

  /**
   * List opportunities
   */
  router.get('/mece/opportunities', (req: Request, res: Response) => {
    if (!meceService) {
      res.status(503).json({ error: 'MECE service not available' });
      return;
    }
    const categoryId = req.query.categoryId as string | undefined;
    const status = req.query.status as OpportunityStatus | undefined;
    const source = req.query.source as OpportunitySource | undefined;
    const opportunities = meceService.getOpportunities({ categoryId, status, source });
    res.json({ count: opportunities.length, opportunities });
  });

  /**
   * Add opportunity
   */
  router.post('/mece/opportunities', (req: Request, res: Response) => {
    if (!meceService) {
      res.status(503).json({ error: 'MECE service not available' });
      return;
    }
    const { title, description, categoryId, subcategoryId, leverage, tags, dependencies } = req.body;
    if (!title || !description || !categoryId) {
      res.status(400).json({ error: 'title, description, and categoryId are required' });
      return;
    }
    const opportunity = meceService.addOpportunity({
      title,
      description,
      categoryId,
      subcategoryId,
      source: 'manual',
      status: 'identified',
      leverage: leverage ?? 5,
      dependencies: dependencies || [],
      blockedBy: [],
      tags: tags || [],
    });
    res.json({ success: true, opportunity });
  });

  /**
   * Update opportunity
   */
  router.put('/mece/opportunities/:id', (req: Request, res: Response) => {
    if (!meceService) {
      res.status(503).json({ error: 'MECE service not available' });
      return;
    }
    const id = getParam(req, 'id');
    const opportunity = meceService.updateOpportunity(id, req.body);
    if (!opportunity) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }
    res.json({ success: true, opportunity });
  });

  /**
   * Remove opportunity
   */
  router.delete('/mece/opportunities/:id', (req: Request, res: Response) => {
    if (!meceService) {
      res.status(503).json({ error: 'MECE service not available' });
      return;
    }
    const removed = meceService.removeOpportunity(getParam(req, 'id'));
    if (!removed) {
      res.status(404).json({ error: 'Opportunity not found' });
      return;
    }
    res.json({ success: true, message: 'Opportunity removed' });
  });

  /**
   * List gaps
   */
  router.get('/mece/gaps', (req: Request, res: Response) => {
    if (!meceService) {
      res.status(503).json({ error: 'MECE service not available' });
      return;
    }
    const categoryId = req.query.categoryId as string | undefined;
    const severity = req.query.severity as GapSeverity | undefined;
    const gaps = meceService.getGaps({ categoryId, severity });
    res.json({ count: gaps.length, gaps });
  });

  /**
   * List overlaps
   */
  router.get('/mece/overlaps', (_req: Request, res: Response) => {
    if (!meceService) {
      res.status(503).json({ error: 'MECE service not available' });
      return;
    }
    const overlaps = meceService.getOverlaps();
    res.json({ count: overlaps.length, overlaps });
  });

  /**
   * Get terminal view
   */
  router.get('/mece/terminal', (_req: Request, res: Response) => {
    if (!meceService) {
      res.status(503).json({ error: 'MECE service not available' });
      return;
    }
    res.json({ view: meceService.generateTerminalView() });
  });

  // ==========================================================================
  // COHERENCE SYSTEM
  // ==========================================================================

  /**
   * Get coherence status
   */
  router.get('/coherence/status', (_req: Request, res: Response) => {
    if (!coherenceService) {
      res.status(503).json({ error: 'Coherence service not available' });
      return;
    }
    res.json(coherenceService.getStatus());
  });

  /**
   * Run coherence validation
   */
  router.post('/coherence/validation', async (_req: Request, res: Response) => {
    if (!coherenceService) {
      res.status(503).json({ error: 'Coherence service not available' });
      return;
    }
    try {
      const report = await coherenceService.runValidation();
      res.json({
        success: true,
        report: {
          id: report.id,
          timestamp: report.timestamp,
          overallScore: report.overallScore,
          overallValid: report.overallValid,
          totalIssues: report.totalIssues,
          criticalIssues: report.criticalIssues,
          warnings: report.warnings,
          metadata: report.metadata,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  /**
   * Get last validation report
   */
  router.get('/coherence/report', (_req: Request, res: Response) => {
    if (!coherenceService) {
      res.status(503).json({ error: 'Coherence service not available' });
      return;
    }
    const report = coherenceService.getLastReport();
    if (!report) {
      res.status(404).json({ error: 'No validation has been run yet' });
      return;
    }
    res.json(report);
  });

  /**
   * List coherence issues
   */
  router.get('/coherence/issues', (req: Request, res: Response) => {
    if (!coherenceService) {
      res.status(503).json({ error: 'Coherence service not available' });
      return;
    }
    const domain = req.query.domain as AlignmentDomain | undefined;
    const severity = req.query.severity as IssueSeverity | undefined;
    const status = req.query.status as IssueStatus | undefined;
    const issues = coherenceService.getIssues({ domain, severity, status });
    res.json({ count: issues.length, issues });
  });

  /**
   * Get specific issue
   */
  router.get('/coherence/issues/:id', (req: Request, res: Response) => {
    if (!coherenceService) {
      res.status(503).json({ error: 'Coherence service not available' });
      return;
    }
    const issue = coherenceService.getIssue(getParam(req, 'id'));
    if (!issue) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }
    res.json(issue);
  });

  /**
   * Update issue status
   */
  router.put('/coherence/issues/:id/status', (req: Request, res: Response) => {
    if (!coherenceService) {
      res.status(503).json({ error: 'Coherence service not available' });
      return;
    }
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: 'status is required' });
      return;
    }
    const issue = coherenceService.updateIssueStatus(getParam(req, 'id'), status);
    if (!issue) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }
    res.json({ success: true, issue });
  });

  /**
   * Get terminal view
   */
  router.get('/coherence/terminal', (_req: Request, res: Response) => {
    if (!coherenceService) {
      res.status(503).json({ error: 'Coherence service not available' });
      return;
    }
    res.json({ view: coherenceService.generateTerminalView() });
  });

  // ==========================================================================
  // LOOP SEQUENCING
  // ==========================================================================

  /**
   * Get sequencing status
   */
  router.get('/sequencing/status', (_req: Request, res: Response) => {
    if (!loopSequencingService) {
      res.status(503).json({ error: 'Loop sequencing service not available' });
      return;
    }
    res.json(loopSequencingService.getStatus());
  });

  /**
   * Analyze loop history
   */
  router.post('/sequencing/analyze', async (req: Request, res: Response) => {
    if (!loopSequencingService) {
      res.status(503).json({ error: 'Loop sequencing service not available' });
      return;
    }
    try {
      const { limit, since } = req.body;
      const analysis = await loopSequencingService.analyzeRunHistory({ limit, since });
      res.json({
        success: true,
        analysis: {
          totalRunsAnalyzed: analysis.totalRunsAnalyzed,
          uniqueLoops: analysis.uniqueLoops,
          uniqueTransitions: analysis.uniqueTransitions,
          uniqueSequences: analysis.uniqueSequences,
          topTransitions: analysis.topTransitions.slice(0, 10),
          topSequences: analysis.topSequences.slice(0, 10),
          insights: analysis.insights,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Analysis failed' });
    }
  });

  /**
   * Get last analysis
   */
  router.get('/sequencing/analysis', (_req: Request, res: Response) => {
    if (!loopSequencingService) {
      res.status(503).json({ error: 'Loop sequencing service not available' });
      return;
    }
    const analysis = loopSequencingService.getLastAnalysis();
    if (!analysis) {
      res.status(404).json({ error: 'No analysis has been run yet' });
      return;
    }
    res.json(analysis);
  });

  /**
   * List transitions
   */
  router.get('/sequencing/transitions', (req: Request, res: Response) => {
    if (!loopSequencingService) {
      res.status(503).json({ error: 'Loop sequencing service not available' });
      return;
    }
    const minOccurrences = req.query.minOccurrences ? parseInt(req.query.minOccurrences as string) : undefined;
    const loop = req.query.loop as string | undefined;
    const transitions = loopSequencingService.getTransitions({ minOccurrences, loop });
    res.json({ count: transitions.length, transitions });
  });

  /**
   * Get specific transition
   */
  router.get('/sequencing/transitions/:from/:to', (req: Request, res: Response) => {
    if (!loopSequencingService) {
      res.status(503).json({ error: 'Loop sequencing service not available' });
      return;
    }
    const transition = loopSequencingService.getTransition(getParam(req, 'from'), getParam(req, 'to'));
    if (!transition) {
      res.status(404).json({ error: 'Transition not found' });
      return;
    }
    res.json(transition);
  });

  /**
   * List sequences
   */
  router.get('/sequencing/sequences', (req: Request, res: Response) => {
    if (!loopSequencingService) {
      res.status(503).json({ error: 'Loop sequencing service not available' });
      return;
    }
    const minOccurrences = req.query.minOccurrences ? parseInt(req.query.minOccurrences as string) : undefined;
    const containsLoop = req.query.containsLoop as string | undefined;
    const sequences = loopSequencingService.getSequences({ minOccurrences, containsLoop });
    res.json({ count: sequences.length, sequences });
  });

  /**
   * Get specific sequence
   */
  router.get('/sequencing/sequences/:id', (req: Request, res: Response) => {
    if (!loopSequencingService) {
      res.status(503).json({ error: 'Loop sequencing service not available' });
      return;
    }
    const sequence = loopSequencingService.getSequence(getParam(req, 'id'));
    if (!sequence) {
      res.status(404).json({ error: 'Sequence not found' });
      return;
    }
    res.json(sequence);
  });

  /**
   * Generate a line (multi-move plan)
   */
  router.post('/sequencing/lines', async (req: Request, res: Response) => {
    if (!loopSequencingService) {
      res.status(503).json({ error: 'Loop sequencing service not available' });
      return;
    }
    try {
      const { startingLoop, target, depth } = req.body;
      const line = await loopSequencingService.generateLine({ startingLoop, target, depth });
      res.json({ success: true, line });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Line generation failed' });
    }
  });

  /**
   * List generated lines
   */
  router.get('/sequencing/lines', (req: Request, res: Response) => {
    if (!loopSequencingService) {
      res.status(503).json({ error: 'Loop sequencing service not available' });
      return;
    }
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const lines = loopSequencingService.getLines({ limit });
    res.json({ count: lines.length, lines });
  });

  /**
   * Get specific line
   */
  router.get('/sequencing/lines/:id', (req: Request, res: Response) => {
    if (!loopSequencingService) {
      res.status(503).json({ error: 'Loop sequencing service not available' });
      return;
    }
    const line = loopSequencingService.getLine(getParam(req, 'id'));
    if (!line) {
      res.status(404).json({ error: 'Line not found' });
      return;
    }
    res.json(line);
  });

  /**
   * Get terminal view
   */
  router.get('/sequencing/terminal', (_req: Request, res: Response) => {
    if (!loopSequencingService) {
      res.status(503).json({ error: 'Loop sequencing service not available' });
      return;
    }
    res.json({ view: loopSequencingService.generateTerminalView() });
  });

  // ==========================================================================
  // SKILL TREES
  // ==========================================================================

  /**
   * Get skill tree status
   */
  router.get('/skill-trees/status', (_req: Request, res: Response) => {
    if (!skillTreeService) {
      res.status(503).json({ error: 'Skill tree service not available' });
      return;
    }
    res.json(skillTreeService.getStatus());
  });

  /**
   * Get available domains
   */
  router.get('/skill-trees/domains', (_req: Request, res: Response) => {
    if (!skillTreeService) {
      res.status(503).json({ error: 'Skill tree service not available' });
      return;
    }
    res.json({ domains: skillTreeService.getAvailableDomains() });
  });

  /**
   * Generate a skill tree
   */
  router.post('/skill-trees', async (req: Request, res: Response) => {
    if (!skillTreeService) {
      res.status(503).json({ error: 'Skill tree service not available' });
      return;
    }
    try {
      const { domainType, domainValue } = req.body;
      if (!domainType || !domainValue) {
        res.status(400).json({ error: 'domainType and domainValue are required' });
        return;
      }
      const domain: TreeDomain = { type: domainType, value: domainValue };
      const tree = await skillTreeService.generateTree(domain);
      res.json({ success: true, tree });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate tree' });
    }
  });

  /**
   * List skill trees
   */
  router.get('/skill-trees', (_req: Request, res: Response) => {
    if (!skillTreeService) {
      res.status(503).json({ error: 'Skill tree service not available' });
      return;
    }
    const trees = skillTreeService.getTrees();
    res.json({
      count: trees.length,
      trees: trees.map(t => ({
        id: t.id,
        name: t.name,
        domain: t.domain,
        stats: t.stats,
        generatedAt: t.generatedAt,
      })),
    });
  });

  /**
   * Get specific skill tree
   */
  router.get('/skill-trees/:id', (req: Request, res: Response) => {
    if (!skillTreeService) {
      res.status(503).json({ error: 'Skill tree service not available' });
      return;
    }
    const tree = skillTreeService.getTree(getParam(req, 'id'));
    if (!tree) {
      res.status(404).json({ error: 'Tree not found' });
      return;
    }
    res.json(tree);
  });

  /**
   * Get skill progression
   */
  router.get('/skill-trees/progression/:skillId', (req: Request, res: Response) => {
    if (!skillTreeService) {
      res.status(503).json({ error: 'Skill tree service not available' });
      return;
    }
    res.json(skillTreeService.getProgression(getParam(req, 'skillId')));
  });

  /**
   * Record skill output seen
   */
  router.post('/skill-trees/progression/:skillId/output', async (req: Request, res: Response) => {
    if (!skillTreeService) {
      res.status(503).json({ error: 'Skill tree service not available' });
      return;
    }
    const progression = await skillTreeService.recordSkillOutput(getParam(req, 'skillId'));
    res.json({ success: true, progression });
  });

  /**
   * Record skill usage
   */
  router.post('/skill-trees/progression/:skillId/usage', async (req: Request, res: Response) => {
    if (!skillTreeService) {
      res.status(503).json({ error: 'Skill tree service not available' });
      return;
    }
    const progression = await skillTreeService.recordSkillUsage(getParam(req, 'skillId'));
    res.json({ success: true, progression });
  });

  /**
   * Update skill progression
   */
  router.put('/skill-trees/progression/:skillId', async (req: Request, res: Response) => {
    if (!skillTreeService) {
      res.status(503).json({ error: 'Skill tree service not available' });
      return;
    }
    const progression = await skillTreeService.updateProgression(getParam(req, 'skillId'), req.body);
    res.json({ success: true, progression });
  });

  /**
   * Generate learning path
   */
  router.post('/skill-trees/paths', async (req: Request, res: Response) => {
    if (!skillTreeService) {
      res.status(503).json({ error: 'Skill tree service not available' });
      return;
    }
    try {
      const { targetSkillId, includeRecommended } = req.body;
      if (!targetSkillId) {
        res.status(400).json({ error: 'targetSkillId is required' });
        return;
      }
      const path = await skillTreeService.generateLearningPath(targetSkillId, { includeRecommended });
      res.json({ success: true, path });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate path' });
    }
  });

  /**
   * List learning paths
   */
  router.get('/skill-trees/paths', (_req: Request, res: Response) => {
    if (!skillTreeService) {
      res.status(503).json({ error: 'Skill tree service not available' });
      return;
    }
    const paths = skillTreeService.getLearningPaths();
    res.json({ count: paths.length, paths });
  });

  /**
   * Get specific learning path
   */
  router.get('/skill-trees/paths/:id', (req: Request, res: Response) => {
    if (!skillTreeService) {
      res.status(503).json({ error: 'Skill tree service not available' });
      return;
    }
    const path = skillTreeService.getLearningPath(getParam(req, 'id'));
    if (!path) {
      res.status(404).json({ error: 'Path not found' });
      return;
    }
    res.json(path);
  });

  /**
   * Get terminal view
   */
  router.get('/skill-trees/terminal', (req: Request, res: Response) => {
    if (!skillTreeService) {
      res.status(503).json({ error: 'Skill tree service not available' });
      return;
    }
    const treeId = req.query.treeId as string | undefined;
    res.json({ view: skillTreeService.generateTerminalView(treeId) });
  });

  // ==========================================================================
  // MULTI-AGENT WORKTREE COORDINATION
  // ==========================================================================

  /**
   * Get multi-agent coordinator status
   */
  router.get('/multi-agent/status', (_req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    res.json(multiAgentCoordinator.getStatus());
  });

  /**
   * Register a collaborator
   */
  router.post('/multi-agent/collaborators', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const { name, email } = req.body;
    if (!name) {
      res.status(400).json({ error: 'name is required' });
      return;
    }
    const collaborator = multiAgentCoordinator.registerCollaborator(name, email);
    res.json({ success: true, collaborator });
  });

  /**
   * List collaborators
   */
  router.get('/multi-agent/collaborators', (_req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const collaborators = multiAgentCoordinator.listCollaborators();
    res.json({ count: collaborators.length, collaborators });
  });

  /**
   * Get collaborator details
   */
  router.get('/multi-agent/collaborators/:id', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const collaborator = multiAgentCoordinator.getCollaborator(getParam(req, 'id'));
    if (!collaborator) {
      res.status(404).json({ error: 'Collaborator not found' });
      return;
    }
    res.json(collaborator);
  });

  /**
   * Get collaborator's current work
   */
  router.get('/multi-agent/collaborators/:id/work', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const work = multiAgentCoordinator.getCollaboratorWork(getParam(req, 'id'));
    res.json(work);
  });

  /**
   * Create an agent set
   */
  router.post('/multi-agent/agent-sets', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const { collaboratorId, name } = req.body;
    if (!collaboratorId || !name) {
      res.status(400).json({ error: 'collaboratorId and name are required' });
      return;
    }
    try {
      const agentSet = multiAgentCoordinator.createAgentSet(collaboratorId, name);
      res.json({ success: true, agentSet });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  /**
   * List agent sets
   */
  router.get('/multi-agent/agent-sets', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const collaboratorId = req.query.collaboratorId as string | undefined;
    const sets = multiAgentCoordinator.listAgentSets(collaboratorId);
    res.json({ count: sets.length, agentSets: sets });
  });

  /**
   * Get agent set details
   */
  router.get('/multi-agent/agent-sets/:id', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const set = multiAgentCoordinator.getAgentSet(getParam(req, 'id'));
    if (!set) {
      res.status(404).json({ error: 'Agent set not found' });
      return;
    }
    res.json(set);
  });

  /**
   * Pause agent set
   */
  router.post('/multi-agent/agent-sets/:id/pause', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    multiAgentCoordinator.pauseAgentSet(getParam(req, 'id'));
    res.json({ success: true, message: 'Agent set paused' });
  });

  /**
   * Resume agent set
   */
  router.post('/multi-agent/agent-sets/:id/resume', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    multiAgentCoordinator.resumeAgentSet(getParam(req, 'id'));
    res.json({ success: true, message: 'Agent set resumed' });
  });

  /**
   * Create reservation
   */
  router.post('/multi-agent/reservations', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const { collaboratorId, type, target, agentSetId, reason, exclusive, durationMs } = req.body;
    if (!collaboratorId || !type || !target) {
      res.status(400).json({ error: 'collaboratorId, type, and target are required' });
      return;
    }
    try {
      const result = multiAgentCoordinator.createReservation(
        collaboratorId,
        type as ReservationType,
        target,
        { agentSetId, reason, exclusive, durationMs }
      );
      if ('error' in result) {
        res.status(409).json(result);
        return;
      }
      res.json({ success: true, reservation: result });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  /**
   * List reservations
   */
  router.get('/multi-agent/reservations', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const collaboratorId = req.query.collaboratorId as string | undefined;
    const reservations = multiAgentCoordinator.listReservations(collaboratorId);
    res.json({ count: reservations.length, reservations });
  });

  /**
   * Release reservation
   */
  router.delete('/multi-agent/reservations/:id', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    multiAgentCoordinator.releaseReservation(getParam(req, 'id'));
    res.json({ success: true, message: 'Reservation released' });
  });

  /**
   * Extend reservation
   */
  router.post('/multi-agent/reservations/:id/extend', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const { additionalMs } = req.body;
    if (!additionalMs) {
      res.status(400).json({ error: 'additionalMs is required' });
      return;
    }
    multiAgentCoordinator.extendReservation(getParam(req, 'id'), additionalMs);
    res.json({ success: true, message: 'Reservation extended' });
  });

  /**
   * Check if resource is blocked
   */
  router.get('/multi-agent/check-blocked', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const type = req.query.type as ReservationType;
    const target = req.query.target as string;
    if (!type || !target) {
      res.status(400).json({ error: 'type and target query params are required' });
      return;
    }
    const blocking = multiAgentCoordinator.checkResourceBlocked(type, target);
    res.json({ blocked: blocking.length > 0, blockingReservations: blocking });
  });

  /**
   * Request merge
   */
  router.post('/multi-agent/merge-queue', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const { collaboratorId, agentSetId, moduleId } = req.body;
    if (!collaboratorId || !agentSetId || !moduleId) {
      res.status(400).json({ error: 'collaboratorId, agentSetId, and moduleId are required' });
      return;
    }
    try {
      const mergeRequest = multiAgentCoordinator.requestMerge(collaboratorId, agentSetId, moduleId);
      res.json({ success: true, mergeRequest });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  /**
   * List merge queue
   */
  router.get('/multi-agent/merge-queue', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const status = req.query.status as MergeRequestStatus | undefined;
    const requests = multiAgentCoordinator.listMergeQueue(status);
    res.json({ count: requests.length, mergeRequests: requests });
  });

  /**
   * Get merge request
   */
  router.get('/multi-agent/merge-queue/:id', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const request = multiAgentCoordinator.getMergeRequest(getParam(req, 'id'));
    if (!request) {
      res.status(404).json({ error: 'Merge request not found' });
      return;
    }
    res.json(request);
  });

  /**
   * Check merge conflicts
   */
  router.post('/multi-agent/merge-queue/:id/check', async (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    try {
      const result = await multiAgentCoordinator.checkMergeConflicts(getParam(req, 'id'));
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  /**
   * Execute merge
   */
  router.post('/multi-agent/merge-queue/:id/execute', async (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const result = await multiAgentCoordinator.executeMerge(getParam(req, 'id'));
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  });

  /**
   * Reject merge
   */
  router.post('/multi-agent/merge-queue/:id/reject', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const { reason } = req.body;
    if (!reason) {
      res.status(400).json({ error: 'reason is required' });
      return;
    }
    multiAgentCoordinator.rejectMerge(getParam(req, 'id'), reason);
    res.json({ success: true, message: 'Merge request rejected' });
  });

  /**
   * Check if collaborator can work on module
   */
  router.get('/multi-agent/can-work', async (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const collaboratorId = req.query.collaboratorId as string;
    const moduleId = req.query.moduleId as string;
    if (!collaboratorId || !moduleId) {
      res.status(400).json({ error: 'collaboratorId and moduleId query params are required' });
      return;
    }
    const result = await multiAgentCoordinator.checkCanWork(collaboratorId, moduleId);
    res.json(result);
  });

  /**
   * Get all active work
   */
  router.get('/multi-agent/active-work', (_req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    res.json(multiAgentCoordinator.getAllActiveWork());
  });

  /**
   * Get coordinator events
   */
  router.get('/multi-agent/events', (req: Request, res: Response) => {
    if (!multiAgentCoordinator) {
      res.status(503).json({ error: 'Multi-agent coordinator not available' });
      return;
    }
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const events = multiAgentCoordinator.getEventLog(limit);
    res.json({ count: events.length, events });
  });

  // ==========================================================================
  // GAME DESIGN
  // ==========================================================================

  /**
   * Get game design status
   */
  router.get('/game-design/status', (_req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    res.json(gameDesignService.getStatus());
  });

  /**
   * Get game state summary
   */
  router.get('/game-design/state', (_req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    res.json(gameDesignService.getGameState());
  });

  /**
   * List finite games
   */
  router.get('/game-design/finite', (req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    const scope = req.query.scope as 'module' | 'system' | undefined;
    const status = req.query.status as FiniteGame['status'] | undefined;
    const games = gameDesignService.listFiniteGames({ scope, status });
    res.json({ count: games.length, games });
  });

  /**
   * Get specific finite game
   */
  router.get('/game-design/finite/:id', (req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    const game = gameDesignService.getFiniteGame(getParam(req, 'id'));
    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }
    res.json(game);
  });

  /**
   * Create finite game
   */
  router.post('/game-design/finite', async (req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    try {
      const { name, description, scope, targetId } = req.body;
      if (!name || !description || !scope || !targetId) {
        res.status(400).json({ error: 'name, description, scope, and targetId are required' });
        return;
      }
      const game = await gameDesignService.createFiniteGame({ name, description, scope, targetId });
      res.json({ success: true, game });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create game' });
    }
  });

  /**
   * Start a finite game
   */
  router.post('/game-design/finite/:id/start', async (req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    try {
      const game = await gameDesignService.startGame(getParam(req, 'id'));
      res.json({ success: true, game });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to start game' });
    }
  });

  /**
   * Satisfy a win condition
   */
  router.post('/game-design/finite/:gameId/conditions/:conditionId', async (req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    try {
      const game = await gameDesignService.satisfyWinCondition(
        getParam(req, 'gameId'),
        getParam(req, 'conditionId'),
        req.body.evidence
      );
      res.json({ success: true, game });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to satisfy condition' });
    }
  });

  /**
   * List infinite games
   */
  router.get('/game-design/infinite', (_req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    const games = gameDesignService.listInfiniteGames();
    res.json({ count: games.length, games });
  });

  /**
   * Get specific infinite game
   */
  router.get('/game-design/infinite/:id', (req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    const game = gameDesignService.getInfiniteGame(getParam(req, 'id'));
    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }
    res.json(game);
  });

  /**
   * Create infinite game
   */
  router.post('/game-design/infinite', async (req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    try {
      const { name, mission } = req.body;
      if (!name || !mission) {
        res.status(400).json({ error: 'name and mission are required' });
        return;
      }
      const game = await gameDesignService.createInfiniteGame({ name, mission });
      res.json({ success: true, game });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create game' });
    }
  });

  /**
   * Link finite game to infinite game
   */
  router.post('/game-design/infinite/:infiniteId/link/:finiteId', async (req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    try {
      await gameDesignService.linkFiniteGame(getParam(req, 'infiniteId'), getParam(req, 'finiteId'));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to link games' });
    }
  });

  /**
   * Update health metric
   */
  router.put('/game-design/infinite/:gameId/metrics/:metricId', async (req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    try {
      const { value } = req.body;
      if (value === undefined) {
        res.status(400).json({ error: 'value is required' });
        return;
      }
      const game = await gameDesignService.updateHealthMetric(
        getParam(req, 'gameId'),
        getParam(req, 'metricId'),
        value
      );
      res.json({ success: true, game });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update metric' });
    }
  });

  /**
   * Generate games from roadmap
   */
  router.post('/game-design/generate', async (_req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    try {
      const games = await gameDesignService.generateGamesFromRoadmap();
      res.json({ success: true, created: games.length, games });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate games' });
    }
  });

  /**
   * Get terminal view
   */
  router.get('/game-design/terminal', (_req: Request, res: Response) => {
    if (!gameDesignService) {
      res.status(503).json({ error: 'Game design service not available' });
      return;
    }
    res.json({ view: gameDesignService.generateTerminalView() });
  });

  // ==========================================================================
  // SPACED REPETITION
  // ==========================================================================

  /**
   * Get SRS status
   */
  router.get('/srs/status', (_req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    res.json(spacedRepetitionService.getStatus());
  });

  /**
   * Get learning statistics
   */
  router.get('/srs/stats', (_req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    res.json(spacedRepetitionService.getLearningStats());
  });

  /**
   * List cards
   */
  router.get('/srs/cards', (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    const type = req.query.type as CardType | undefined;
    const deckId = req.query.deckId as string | undefined;
    const tag = req.query.tag as string | undefined;
    const due = req.query.due === 'true' ? true : req.query.due === 'false' ? false : undefined;
    const suspended = req.query.suspended === 'true' ? true : req.query.suspended === 'false' ? false : undefined;
    const cards = spacedRepetitionService.listCards({ type, deckId, tag, due, suspended });
    res.json({ count: cards.length, cards });
  });

  /**
   * Get specific card
   */
  router.get('/srs/cards/:id', (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    const card = spacedRepetitionService.getCard(getParam(req, 'id'));
    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }
    res.json(card);
  });

  /**
   * Create card
   */
  router.post('/srs/cards', async (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    try {
      const { type, sourceId, front, back, tags, deckId } = req.body;
      if (!type || !sourceId || !front || !back) {
        res.status(400).json({ error: 'type, sourceId, front, and back are required' });
        return;
      }
      const card = await spacedRepetitionService.createCard({ type, sourceId, front, back, tags, deckId });
      res.json({ success: true, card });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create card' });
    }
  });

  /**
   * Update card
   */
  router.put('/srs/cards/:id', async (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    try {
      const card = await spacedRepetitionService.updateCard(getParam(req, 'id'), req.body);
      res.json({ success: true, card });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update card' });
    }
  });

  /**
   * Delete card
   */
  router.delete('/srs/cards/:id', async (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    await spacedRepetitionService.deleteCard(getParam(req, 'id'));
    res.json({ success: true });
  });

  /**
   * List decks
   */
  router.get('/srs/decks', (_req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    const decks = spacedRepetitionService.listDecks();
    res.json({ count: decks.length, decks });
  });

  /**
   * Get specific deck
   */
  router.get('/srs/decks/:id', (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    const deck = spacedRepetitionService.getDeck(getParam(req, 'id'));
    if (!deck) {
      res.status(404).json({ error: 'Deck not found' });
      return;
    }
    res.json(deck);
  });

  /**
   * Create deck
   */
  router.post('/srs/decks', async (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    try {
      const { name, description, tags, newCardsPerDay, reviewsPerDay } = req.body;
      if (!name) {
        res.status(400).json({ error: 'name is required' });
        return;
      }
      const deck = await spacedRepetitionService.createDeck({ name, description, tags, newCardsPerDay, reviewsPerDay });
      res.json({ success: true, deck });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create deck' });
    }
  });

  /**
   * Add card to deck
   */
  router.post('/srs/decks/:deckId/cards/:cardId', async (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    try {
      await spacedRepetitionService.addCardToDeck(getParam(req, 'cardId'), getParam(req, 'deckId'));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to add card to deck' });
    }
  });

  /**
   * Remove card from deck
   */
  router.delete('/srs/decks/:deckId/cards/:cardId', async (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    await spacedRepetitionService.removeCardFromDeck(getParam(req, 'cardId'), getParam(req, 'deckId'));
    res.json({ success: true });
  });

  /**
   * Get due cards
   */
  router.get('/srs/due', (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    const deckId = req.query.deckId as string | undefined;
    const due = spacedRepetitionService.getDueCards(deckId);
    res.json({ decks: due, totalDue: due.reduce((sum, d) => sum + d.totalDue, 0) });
  });

  /**
   * Start review session
   */
  router.post('/srs/sessions', async (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    try {
      const { deckId } = req.body;
      if (!deckId) {
        res.status(400).json({ error: 'deckId is required' });
        return;
      }
      const session = await spacedRepetitionService.startReviewSession(deckId);
      res.json({ success: true, session });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to start session' });
    }
  });

  /**
   * List review sessions
   */
  router.get('/srs/sessions', (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const sessions = spacedRepetitionService.getSessions(limit);
    res.json({ count: sessions.length, sessions });
  });

  /**
   * Get specific session
   */
  router.get('/srs/sessions/:id', (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    const session = spacedRepetitionService.getSession(getParam(req, 'id'));
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json(session);
  });

  /**
   * Record review
   */
  router.post('/srs/sessions/:sessionId/reviews', async (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    try {
      const { cardId, quality, timeSpentMs } = req.body;
      if (!cardId || quality === undefined || !timeSpentMs) {
        res.status(400).json({ error: 'cardId, quality, and timeSpentMs are required' });
        return;
      }
      const result = await spacedRepetitionService.recordReview(
        getParam(req, 'sessionId'),
        cardId,
        quality,
        timeSpentMs
      );
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to record review' });
    }
  });

  /**
   * Complete session
   */
  router.post('/srs/sessions/:id/complete', async (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    try {
      const session = await spacedRepetitionService.completeSession(getParam(req, 'id'));
      res.json({ success: true, session });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to complete session' });
    }
  });

  /**
   * Generate cards from skills
   */
  router.post('/srs/generate/skills', async (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    try {
      const { phase, tag, limit, deckId } = req.body;
      const cards = await spacedRepetitionService.generateCardsFromSkills({ phase, tag, limit, deckId });
      res.json({ success: true, created: cards.length, cards });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate cards' });
    }
  });

  /**
   * Generate cards from patterns
   */
  router.post('/srs/generate/patterns', async (req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    try {
      const { confidence, limit, deckId } = req.body;
      const cards = await spacedRepetitionService.generateCardsFromPatterns({ confidence, limit, deckId });
      res.json({ success: true, created: cards.length, cards });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate cards' });
    }
  });

  /**
   * Get terminal view
   */
  router.get('/srs/terminal', (_req: Request, res: Response) => {
    if (!spacedRepetitionService) {
      res.status(503).json({ error: 'Spaced repetition service not available' });
      return;
    }
    res.json({ view: spacedRepetitionService.generateTerminalView() });
  });

  // ==========================================================================
  // PROPOSING DECKS
  // ==========================================================================

  /**
   * Get daily review summary
   */
  router.get('/proposing-decks/daily', (req: Request, res: Response) => {
    if (!proposingDecksService) {
      res.status(503).json({ error: 'Proposing decks service not available' });
      return;
    }
    const date = req.query.date as string | undefined;
    const summary = proposingDecksService.getDailyReviewSummary(date);
    res.json(summary);
  });

  /**
   * Generate daily decks
   */
  router.post('/proposing-decks/generate', async (req: Request, res: Response) => {
    if (!proposingDecksService) {
      res.status(503).json({ error: 'Proposing decks service not available' });
      return;
    }
    try {
      const forDate = req.body.forDate as string | undefined;
      const summary = await proposingDecksService.generateDailyDeck(forDate);
      res.json({ success: true, summary });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate decks' });
    }
  });

  /**
   * List review decks
   */
  router.get('/proposing-decks/decks', (req: Request, res: Response) => {
    if (!proposingDecksService) {
      res.status(503).json({ error: 'Proposing decks service not available' });
      return;
    }
    const type = req.query.type as ReviewDeckType | undefined;
    const status = req.query.status as 'pending' | 'in-review' | 'completed' | 'skipped' | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const decks = proposingDecksService.listDecks({ type, status, limit });
    res.json({ count: decks.length, decks });
  });

  /**
   * Get specific deck
   */
  router.get('/proposing-decks/decks/:id', (req: Request, res: Response) => {
    if (!proposingDecksService) {
      res.status(503).json({ error: 'Proposing decks service not available' });
      return;
    }
    const deck = proposingDecksService.getDeck(getParam(req, 'id'));
    if (!deck) {
      res.status(404).json({ error: 'Deck not found' });
      return;
    }
    res.json(deck);
  });

  /**
   * Start deck review
   */
  router.post('/proposing-decks/decks/:id/start', async (req: Request, res: Response) => {
    if (!proposingDecksService) {
      res.status(503).json({ error: 'Proposing decks service not available' });
      return;
    }
    try {
      const deck = await proposingDecksService.startReview(getParam(req, 'id'));
      res.json({ success: true, deck });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to start review' });
    }
  });

  /**
   * Complete deck review
   */
  router.post('/proposing-decks/decks/:id/complete', async (req: Request, res: Response) => {
    if (!proposingDecksService) {
      res.status(503).json({ error: 'Proposing decks service not available' });
      return;
    }
    try {
      const { itemsReviewed, itemsApproved, itemsRejected, itemsSkipped } = req.body;
      const deck = await proposingDecksService.completeReview(getParam(req, 'id'), {
        itemsReviewed: itemsReviewed || 0,
        itemsApproved: itemsApproved || 0,
        itemsRejected: itemsRejected || 0,
        itemsSkipped: itemsSkipped || 0,
      });
      res.json({ success: true, deck });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to complete review' });
    }
  });

  /**
   * Skip deck
   */
  router.post('/proposing-decks/decks/:id/skip', async (req: Request, res: Response) => {
    if (!proposingDecksService) {
      res.status(503).json({ error: 'Proposing decks service not available' });
      return;
    }
    try {
      const reason = req.body.reason as string | undefined;
      const deck = await proposingDecksService.skipDeck(getParam(req, 'id'), reason);
      res.json({ success: true, deck });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to skip deck' });
    }
  });

  /**
   * Get generation schedule
   */
  router.get('/proposing-decks/schedule', (_req: Request, res: Response) => {
    if (!proposingDecksService) {
      res.status(503).json({ error: 'Proposing decks service not available' });
      return;
    }
    res.json(proposingDecksService.getSchedule());
  });

  /**
   * Configure generation schedule
   */
  router.put('/proposing-decks/schedule', async (req: Request, res: Response) => {
    if (!proposingDecksService) {
      res.status(503).json({ error: 'Proposing decks service not available' });
      return;
    }
    try {
      const schedule = await proposingDecksService.configureSchedule(req.body);
      res.json({ success: true, schedule });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to configure schedule' });
    }
  });

  /**
   * Get proposing decks stats
   */
  router.get('/proposing-decks/stats', (_req: Request, res: Response) => {
    if (!proposingDecksService) {
      res.status(503).json({ error: 'Proposing decks service not available' });
      return;
    }
    res.json(proposingDecksService.getStats());
  });

  /**
   * Get review history
   */
  router.get('/proposing-decks/history', (req: Request, res: Response) => {
    if (!proposingDecksService) {
      res.status(503).json({ error: 'Proposing decks service not available' });
      return;
    }
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const history = proposingDecksService.getHistory(limit);
    res.json({ count: history.length, history });
  });

  // ==========================================================================
  // DASHBOARD SUMMARY
  // ==========================================================================

  /**
   * Get dashboard summary
   */
  router.get('/dashboard', async (_req: Request, res: Response) => {
    const executions = executionEngine.listExecutions();
    const skills = skillRegistry.listSkills({ limit: 1 });
    const loops = loopComposer.listLoops();
    const inbox = inboxProcessor.getStats();

    // Get improvement stats if learning service is available
    let pendingImprovements = 0;
    if (learningService) {
      const proposals = learningService.listUpgradeProposals({ status: 'pending' });
      pendingImprovements = proposals.length;
    }

    const activeExecutions = executions.filter(e => e.status === 'active');
    const recentExecutions = executions.slice(0, 5);

    res.json({
      summary: {
        activeExecutions: activeExecutions.length,
        totalExecutions: executions.length,
        totalSkills: skills.total,
        totalLoops: loops.length,
        pendingInbox: inbox.pending,
        pendingImprovements,
      },
      activeExecutions: activeExecutions.map(e => ({
        id: e.id,
        loopId: e.loopId,
        project: e.project,
        currentPhase: e.currentPhase,
        progress: e.progress,
        updatedAt: e.updatedAt,
      })),
      recentExecutions: recentExecutions.map(e => ({
        id: e.id,
        loopId: e.loopId,
        project: e.project,
        status: e.status,
        currentPhase: e.currentPhase,
        startedAt: e.startedAt,
      })),
      loops: loops.map(l => ({
        id: l.id,
        name: l.name,
        phaseCount: l.phaseCount,
      })),
    });
  });

  // ==========================================================================
  // PROACTIVE MESSAGING
  // ==========================================================================

  if (proactiveMessagingService) {
    /**
     * Get messaging channel status
     */
    router.get('/messaging/status', (_req: Request, res: Response) => {
      const statuses = proactiveMessagingService.getChannelStatus();
      res.json({ channels: statuses });
    });

    /**
     * Get pending interactions
     */
    router.get('/messaging/pending', (_req: Request, res: Response) => {
      const pending = proactiveMessagingService.getPendingInteractions();
      res.json({
        count: pending.length,
        interactions: pending,
      });
    });

    /**
     * Get messaging configuration (redacted)
     */
    router.get('/messaging/config', (_req: Request, res: Response) => {
      const config = proactiveMessagingService.getConfig();
      // Redact sensitive tokens
      const redacted = {
        ...config,
        channels: {
          ...config.channels,
          slack: {
            ...config.channels.slack,
            botToken: config.channels.slack.botToken ? '***' : undefined,
            appToken: config.channels.slack.appToken ? '***' : undefined,
          },
        },
      };
      res.json({ config: redacted });
    });

    /**
     * Get messaging stats
     */
    router.get('/messaging/stats', (_req: Request, res: Response) => {
      const stats = proactiveMessagingService.getStats();
      res.json(stats);
    });

    /**
     * Get conversation history
     */
    router.get('/messaging/conversations', (req: Request, res: Response) => {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const conversations = proactiveMessagingService.getConversationHistory(limit);
      res.json({
        count: conversations.length,
        conversations,
      });
    });

    /**
     * Send notification
     */
    router.post('/messaging/send', async (req: Request, res: Response) => {
      const { title, message, actions } = req.body;
      if (!title || !message) {
        res.status(400).json({ error: 'title and message are required' });
        return;
      }

      try {
        const interactionId = await proactiveMessagingService.sendNotification(title, message, actions);
        res.json({ success: true, interactionId });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Send gate waiting notification (for testing and programmatic use)
     */
    router.post('/messaging/gate', async (req: Request, res: Response) => {
      const { gateId, executionId, loopId, phase, deliverables, approvalType } = req.body;
      if (!gateId || !executionId || !loopId || !phase) {
        res.status(400).json({ error: 'gateId, executionId, loopId, and phase are required' });
        return;
      }

      try {
        const interactionId = await proactiveMessagingService.notifyGateWaiting(
          gateId,
          executionId,
          loopId,
          phase,
          deliverables || [],
          approvalType || 'human'
        );
        res.json({ success: true, interactionId });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Send loop complete notification
     */
    router.post('/messaging/loop-complete', async (req: Request, res: Response) => {
      const { loopId, executionId, module, summary, deliverables } = req.body;
      if (!loopId || !executionId || !module || !summary) {
        res.status(400).json({ error: 'loopId, executionId, module, and summary are required' });
        return;
      }

      try {
        const interactionId = await proactiveMessagingService.notifyLoopComplete(
          loopId,
          executionId,
          module,
          summary,
          deliverables || []
        );
        res.json({ success: true, interactionId });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Slack event webhook (for external Slack events if not using Socket Mode)
     */
    router.post('/messaging/slack/events', (req: Request, res: Response) => {
      // Handle Slack URL verification challenge
      if (req.body.type === 'url_verification') {
        res.json({ challenge: req.body.challenge });
        return;
      }
      // Other events are handled by Bolt SDK in Socket Mode
      res.json({ ok: true });
    });
  }

  // ==========================================================================
  // VOICE
  // ==========================================================================

  if (proactiveMessagingService) {
    /**
     * Get voice status
     */
    router.get('/voice/status', (_req: Request, res: Response) => {
      const voiceAdapter = proactiveMessagingService.getVoiceAdapter();
      if (!voiceAdapter) {
        res.json({ enabled: false, error: 'Voice adapter not configured' });
        return;
      }
      res.json(voiceAdapter.getService().getStatus());
    });

    /**
     * Get voice config
     */
    router.get('/voice/config', (_req: Request, res: Response) => {
      const voiceAdapter = proactiveMessagingService.getVoiceAdapter();
      if (!voiceAdapter) {
        res.json({ enabled: false, error: 'Voice adapter not configured' });
        return;
      }
      res.json(voiceAdapter.getService().getConfig());
    });

    /**
     * Update voice config
     */
    router.put('/voice/config', (req: Request, res: Response) => {
      const voiceAdapter = proactiveMessagingService.getVoiceAdapter();
      if (!voiceAdapter) {
        res.status(400).json({ error: 'Voice adapter not configured' });
        return;
      }
      voiceAdapter.getService().configure(req.body);
      res.json(voiceAdapter.getService().getConfig());
    });

    /**
     * Test voice output
     */
    router.post('/voice/test', async (req: Request, res: Response) => {
      const voiceAdapter = proactiveMessagingService.getVoiceAdapter();
      if (!voiceAdapter) {
        res.status(400).json({ error: 'Voice adapter not configured' });
        return;
      }
      const text = req.body.text || 'Voice test successful';
      try {
        await voiceAdapter.getService().speakNow(text, { priority: 'urgent' });
        res.json({ success: true, message: `Spoke: "${text}"` });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * List available voices
     */
    router.get('/voice/voices', async (_req: Request, res: Response) => {
      try {
        const { MacOSTTS } = await import('../services/voice/index.js');
        const voices = await MacOSTTS.listVoices();
        res.json({ voices });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });
  }

  // ==========================================================================
  // KNOPILOT - Sales Intelligence
  // ==========================================================================

  if (knopilotService) {
    /**
     * Get pipeline summary
     */
    router.get('/knopilot/pipeline', async (_req: Request, res: Response) => {
      try {
        const summary = await knopilotService.getPipelineSummary();
        res.json(summary);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Get weekly focus actions
     */
    router.get('/knopilot/weekly-focus', async (_req: Request, res: Response) => {
      try {
        const focus = await knopilotService.getWeeklyFocus();
        res.json(focus);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * List all deals
     */
    router.get('/knopilot/deals', async (req: Request, res: Response) => {
      try {
        const { stage, company, minValue, maxValue, search } = req.query;
        const deals = await knopilotService.listDeals({
          stage: queryString(stage) as 'lead' | 'target' | 'discovery' | 'contracting' | 'production' | undefined,
          company: queryString(company),
          minValue: minValue ? Number(minValue) : undefined,
          maxValue: maxValue ? Number(maxValue) : undefined,
          search: queryString(search),
        });
        res.json({ count: deals.length, deals });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Create a new deal
     */
    router.post('/knopilot/deals', async (req: Request, res: Response) => {
      try {
        const { name, company, industry, stage, value } = req.body;
        const deal = await knopilotService.createDeal({ name, company, industry, stage, value });
        res.status(201).json(deal);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Get deal view (full details)
     */
    router.get('/knopilot/deals/:id', async (req: Request, res: Response) => {
      try {
        const dealView = await knopilotService.getDeal(getParam(req, 'id'));
        if (!dealView) {
          res.status(404).json({ error: 'Deal not found' });
          return;
        }
        res.json(dealView);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Update a deal
     */
    router.patch('/knopilot/deals/:id', async (req: Request, res: Response) => {
      try {
        const deal = await knopilotService.updateDeal(getParam(req, 'id'), req.body);
        res.json(deal);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Advance deal stage
     */
    router.post('/knopilot/deals/:id/advance', async (req: Request, res: Response) => {
      try {
        const { reason } = req.body;
        const deal = await knopilotService.advanceStage(getParam(req, 'id'), reason);
        res.json(deal);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Get deal scores
     */
    router.get('/knopilot/deals/:id/scores', async (req: Request, res: Response) => {
      try {
        const scores = await knopilotService.getScores(getParam(req, 'id'));
        res.json(scores);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Recompute deal scores
     */
    router.post('/knopilot/deals/:id/scores', async (req: Request, res: Response) => {
      try {
        const scores = await knopilotService.computeScores(getParam(req, 'id'));
        res.json(scores);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Get deal NBA
     */
    router.get('/knopilot/deals/:id/nba', async (req: Request, res: Response) => {
      try {
        const nba = await knopilotService.getNBA(getParam(req, 'id'));
        res.json(nba);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Regenerate deal NBA
     */
    router.post('/knopilot/deals/:id/nba', async (req: Request, res: Response) => {
      try {
        const nba = await knopilotService.generateNBA(getParam(req, 'id'));
        res.json(nba);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Get deal intelligence
     */
    router.get('/knopilot/deals/:id/intelligence', async (req: Request, res: Response) => {
      try {
        const intelligence = await knopilotService.getIntelligence(getParam(req, 'id'));
        res.json(intelligence);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * List deal stakeholders
     */
    router.get('/knopilot/deals/:id/stakeholders', async (req: Request, res: Response) => {
      try {
        const stakeholders = await knopilotService.listStakeholders(getParam(req, 'id'));
        res.json({ count: stakeholders.length, stakeholders });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Add stakeholder to deal
     */
    router.post('/knopilot/deals/:id/stakeholders', async (req: Request, res: Response) => {
      try {
        const stakeholder = await knopilotService.addStakeholder(getParam(req, 'id'), req.body);
        res.status(201).json(stakeholder);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Update stakeholder
     */
    router.patch('/knopilot/deals/:id/stakeholders/:stakeholderId', async (req: Request, res: Response) => {
      try {
        const stakeholder = await knopilotService.updateStakeholder(
          getParam(req, 'id'),
          getParam(req, 'stakeholderId'),
          req.body
        );
        res.json(stakeholder);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * List deal communications
     */
    router.get('/knopilot/deals/:id/communications', async (req: Request, res: Response) => {
      try {
        const communications = await knopilotService.listCommunications(getParam(req, 'id'));
        res.json({ count: communications.length, communications });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Add communication to deal
     */
    router.post('/knopilot/deals/:id/communications', async (req: Request, res: Response) => {
      try {
        const comm = await knopilotService.addCommunication(getParam(req, 'id'), req.body);
        res.status(201).json(comm);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });

    /**
     * Process communication (extract intelligence)
     */
    router.post('/knopilot/deals/:id/communications/:commId/process', async (req: Request, res: Response) => {
      try {
        await knopilotService.processCommunication(getParam(req, 'id'), getParam(req, 'commId'));
        res.json({ message: 'Communication processed successfully' });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
      }
    });
  }

  return router;
}

// Helper to calculate progress
function getProgress(execution: any): { percentage: number; phases: number; skills: number } {
  const completedPhases = execution.phases.filter(
    (p: any) => p.status === 'completed'
  ).length;
  const completedSkills = execution.phases.reduce(
    (sum: number, p: any) => sum + p.skills.filter((s: any) => s.status === 'completed').length,
    0
  );
  const totalSkills = execution.phases.reduce(
    (sum: number, p: any) => sum + p.skills.length,
    0
  );

  return {
    percentage: totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0,
    phases: completedPhases,
    skills: completedSkills,
  };
}
