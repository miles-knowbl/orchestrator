/**
 * MCP Tools for ScoringService
 *
 * Provides module scoring, system scoring, and trend analysis.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { ScoringService } from '../services/scoring/index.js';

export const scoringTools: Tool[] = [
  {
    name: 'score_module',
    description: 'Scoring module — computes comprehensive health score',
    inputSchema: {
      type: 'object',
      properties: {
        moduleId: {
          type: 'string',
          description: 'Module ID to score',
        },
      },
      required: ['moduleId'],
    },
  },
  {
    name: 'score_all_modules',
    description: 'Scoring all modules — ranks by comprehensive health score',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of modules to return',
        },
      },
    },
  },
  {
    name: 'score_system',
    description: 'Checking system health — computes comprehensive system score',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_modules_needing_attention',
    description: 'Finding at-risk modules — identifies low scores and issues',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_score_history',
    description: 'Loading score history — retrieves historical scoring data',
    inputSchema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days of history (default: 30)',
        },
      },
    },
  },
  {
    name: 'get_score_trends',
    description: 'Analyzing score trends — computes trend direction and velocity',
    inputSchema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days to analyze (default: 30)',
        },
      },
    },
  },
  {
    name: 'record_score_history',
    description: 'Recording scores — snapshots current scores to history',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'render_scorecard',
    description: 'Visualizing scorecard — generates terminal-friendly display',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export function createScoringToolHandlers(scoringService: ScoringService) {
  return {
    score_module: async (params: unknown) => {
      const args = params as { moduleId: string };
      if (!args?.moduleId) {
        return [{ type: 'text', text: 'Error: moduleId is required' }];
      }

      const score = await scoringService.scoreModule(args.moduleId);
      if (!score) {
        return [{ type: 'text', text: `Module not found: ${args.moduleId}` }];
      }

      const lines: string[] = [];
      lines.push(`# Module Score: ${score.moduleName}\n`);
      lines.push(`**Overall Score:** ${score.overallScore}/100`);
      lines.push(`**Layer:** ${score.layer}`);
      lines.push(`**Status:** ${score.status}`);
      lines.push(`**Critical Path:** ${score.isCriticalPath ? 'Yes' : 'No'}`);
      lines.push('');
      lines.push('## Component Scores\n');
      lines.push(`- Dream State Alignment: ${score.components.dreamStateAlignment}/100`);
      lines.push(`- Downstream Impact: ${score.components.downstreamImpact}/100`);
      lines.push(`- Completion Value: ${score.components.completionValue}/100`);
      lines.push(`- Execution Quality: ${score.components.executionQuality}/100`);
      lines.push(`- Strategic Position: ${score.components.strategicPosition}/100`);
      lines.push('');
      lines.push('## Dependencies\n');
      lines.push(`- Blocked By: ${score.blockedByCount} modules`);
      lines.push(`- Unlocks: ${score.unlocksCount} modules`);

      if (score.leverage) {
        lines.push('');
        lines.push('## Leverage Score\n');
        lines.push(`- Overall: ${score.leverage.score}`);
        lines.push(`- DSA: ${score.leverage.reasoning.dreamStateAlignment}`);
        lines.push(`- Unlock: ${score.leverage.reasoning.downstreamUnlock}`);
        lines.push(`- Likelihood: ${score.leverage.reasoning.likelihood}`);
      }

      return [{ type: 'text', text: lines.join('\n') }];
    },

    score_all_modules: async (params: unknown) => {
      const args = (params || {}) as { limit?: number };
      const scores = await scoringService.scoreAllModules();
      const limited = args.limit ? scores.slice(0, args.limit) : scores;

      const lines: string[] = [];
      lines.push(`# All Module Scores\n`);
      lines.push(`Total: ${scores.length} modules\n`);
      lines.push('| Rank | Module | Score | Layer | Status |');
      lines.push('|------|--------|-------|-------|--------|');

      limited.forEach((s, i) => {
        const status = s.isComplete ? '✓' : s.status === 'in-progress' ? '◉' : '○';
        lines.push(`| ${i + 1} | ${s.moduleName} | ${s.overallScore}/100 | L${s.layer} | ${status} |`);
      });

      return [{ type: 'text', text: lines.join('\n') }];
    },

    score_system: async (_params: unknown) => {
      const score = await scoringService.scoreSystem();

      const lines: string[] = [];
      lines.push(`# System Score: ${score.systemId}\n`);
      lines.push(`**Overall Health:** ${score.overallHealth}/100`);
      lines.push('');

      lines.push('## Completion\n');
      lines.push(`- Progress: ${score.completion.percentage}%`);
      lines.push(`- Modules: ${score.completion.modulesComplete}/${score.completion.modulesTotal}`);
      lines.push(`- Layers: ${score.completion.layersComplete}/${score.completion.layersTotal}`);
      lines.push('');

      lines.push('## Quality\n');
      lines.push(`- Avg Module Score: ${score.quality.avgModuleScore}/100`);
      lines.push(`- Execution Quality: ${score.quality.avgExecutionQuality}/100`);
      lines.push(`- Calibration Accuracy: ${score.quality.calibrationAccuracy}%`);
      lines.push(`- Pattern Coverage: ${score.quality.patternCoverage}%`);
      lines.push('');

      lines.push('## Momentum\n');
      lines.push(`- Recent Completions (7d): ${score.momentum.recentCompletions}`);
      lines.push(`- Velocity Trend: ${score.momentum.velocityTrend}`);
      lines.push(`- Next Leverage Score: ${score.momentum.nextHighestLeverageScore}/100`);
      lines.push('');

      lines.push('## Risk\n');
      lines.push(`- Blocked Modules: ${score.risk.blockedModules}`);
      lines.push(`- Critical Path Length: ${score.risk.criticalPathLength}`);
      lines.push(`- Estimation Drift: ${score.risk.estimationDrift}%`);

      return [{ type: 'text', text: lines.join('\n') }];
    },

    get_modules_needing_attention: async (_params: unknown) => {
      const modules = await scoringService.getModulesNeedingAttention();

      if (modules.length === 0) {
        return [{ type: 'text', text: 'No modules currently need attention.' }];
      }

      const lines: string[] = [];
      lines.push(`# Modules Needing Attention\n`);
      lines.push(`Found ${modules.length} module(s):\n`);

      for (const m of modules) {
        lines.push(`## ${m.moduleName}`);
        lines.push(`- **Score:** ${m.overallScore}/100`);
        lines.push(`- **Status:** ${m.status}`);
        lines.push(`- **Issues:**`);
        if (m.overallScore < 50) lines.push(`  - Low overall score`);
        if (m.status === 'blocked') lines.push(`  - Currently blocked`);
        if (m.components.executionQuality < 50) lines.push(`  - Low execution quality`);
        lines.push('');
      }

      return [{ type: 'text', text: lines.join('\n') }];
    },

    get_score_history: async (params: unknown) => {
      const args = (params || {}) as { days?: number };
      const days = args.days || 30;
      const history = scoringService.getHistory(days);

      if (history.length === 0) {
        return [{ type: 'text', text: 'No score history available. Use `record_score_history` to start tracking.' }];
      }

      const lines: string[] = [];
      lines.push(`# Score History (${days} days)\n`);
      lines.push(`${history.length} entries\n`);
      lines.push('| Date | System Score | Completion |');
      lines.push('|------|--------------|------------|');

      for (const entry of history.slice(-10)) {
        const date = entry.timestamp.split('T')[0];
        lines.push(`| ${date} | ${entry.systemScore}/100 | ${entry.completionPercentage}% |`);
      }

      return [{ type: 'text', text: lines.join('\n') }];
    },

    get_score_trends: async (params: unknown) => {
      const args = (params || {}) as { days?: number };
      const days = args.days || 30;
      const trends = scoringService.getScoreTrends(days);

      const lines: string[] = [];
      lines.push(`# Score Trends (${days} days)\n`);
      lines.push(`**System Trend:** ${trends.systemTrend}`);
      lines.push(`**Completion Trend:** ${trends.completionTrend}`);
      lines.push(`**Avg Daily Progress:** +${trends.avgDailyProgress}%`);

      return [{ type: 'text', text: lines.join('\n') }];
    },

    record_score_history: async (_params: unknown) => {
      await scoringService.recordHistory();
      return [{ type: 'text', text: 'Score history recorded successfully.' }];
    },

    render_scorecard: async (_params: unknown) => {
      const terminal = await scoringService.generateTerminalView();
      return [{ type: 'text', text: terminal }];
    },
  };
}
