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

export interface ApiRoutesOptions {
  executionEngine: ExecutionEngine;
  skillRegistry: SkillRegistry;
  loopComposer: LoopComposer;
  inboxProcessor: InboxProcessor;
}

// Helper to get string param
function getParam(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}

export function createApiRoutes(options: ApiRoutesOptions): Router {
  const { executionEngine, skillRegistry, loopComposer, inboxProcessor } = options;
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
      level: level as any,
      category: category as any,
      since: since ? new Date(since as string) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
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
      phase: phase as any,
      category: category as any,
      query: query as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
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
      status: status as any,
      sourceType: sourceType as any,
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
  // DASHBOARD SUMMARY
  // ==========================================================================

  /**
   * Get dashboard summary
   */
  router.get('/dashboard', (_req: Request, res: Response) => {
    const executions = executionEngine.listExecutions();
    const skills = skillRegistry.listSkills({ limit: 1 });
    const loops = loopComposer.listLoops();
    const inbox = inboxProcessor.getStats();

    const activeExecutions = executions.filter(e => e.status === 'active');
    const recentExecutions = executions.slice(0, 5);

    res.json({
      summary: {
        activeExecutions: activeExecutions.length,
        totalExecutions: executions.length,
        totalSkills: skills.total,
        totalLoops: loops.length,
        pendingInbox: inbox.pending,
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
