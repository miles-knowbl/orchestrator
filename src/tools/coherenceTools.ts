/**
 * MCP Tools for Coherence System
 *
 * Provides control over coherence validation and issue management.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type {
  CoherenceService,
  AlignmentDomain,
  IssueSeverity,
  IssueStatus,
} from '../services/coherence/index.js';

export const coherenceTools: Tool[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'run_coherence_validation',
    description: 'Run full coherence validation across all system components.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_coherence_status',
    description: 'Get current status of the coherence system.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_coherence_report',
    description: 'Get the last coherence validation report.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Issues
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'list_coherence_issues',
    description: 'List coherence issues with optional filtering.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          enum: [
            'dream-roadmap',
            'skill-loop',
            'pattern-impl',
            'graph-skill',
            'mece-roadmap',
            'dependency-order',
            'memory-consistency',
            'version-sync',
          ],
          description: 'Filter by alignment domain',
        },
        severity: {
          type: 'string',
          enum: ['critical', 'warning', 'info'],
          description: 'Filter by severity',
        },
        status: {
          type: 'string',
          enum: ['open', 'acknowledged', 'resolved', 'wont-fix'],
          description: 'Filter by status',
        },
      },
    },
  },
  {
    name: 'get_coherence_issue',
    description: 'Get details of a specific coherence issue.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Issue ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'update_issue_status',
    description: 'Update the status of a coherence issue.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Issue ID',
        },
        status: {
          type: 'string',
          enum: ['open', 'acknowledged', 'resolved', 'wont-fix'],
          description: 'New status',
        },
      },
      required: ['id', 'status'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Terminal View
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_coherence_terminal_view',
    description: 'Get a terminal-friendly view of the coherence status.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export function createCoherenceToolHandlers(coherenceService: CoherenceService) {
  return {
    run_coherence_validation: async (_params: unknown) => {
      const report = await coherenceService.runValidation();
      return {
        success: true,
        report: {
          id: report.id,
          timestamp: report.timestamp,
          overallScore: report.overallScore,
          overallValid: report.overallValid,
          totalIssues: report.totalIssues,
          criticalIssues: report.criticalIssues,
          warnings: report.warnings,
          domainScores: report.domainValidations.map(dv => ({
            domain: dv.domain,
            score: dv.score,
            valid: dv.valid,
            issueCount: dv.issueCount,
          })),
          topRecommendations: report.recommendations.slice(0, 5),
          metadata: report.metadata,
        },
      };
    },

    get_coherence_status: async (_params: unknown) => {
      return coherenceService.getStatus();
    },

    get_coherence_report: async (_params: unknown) => {
      const report = coherenceService.getLastReport();
      if (!report) {
        return { error: 'No validation has been run yet. Use run_coherence_validation first.' };
      }
      return report;
    },

    list_coherence_issues: async (params: unknown) => {
      const args = (params || {}) as {
        domain?: AlignmentDomain;
        severity?: IssueSeverity;
        status?: IssueStatus;
      };
      const issues = coherenceService.getIssues(args);
      return { count: issues.length, issues };
    },

    get_coherence_issue: async (params: unknown) => {
      const args = params as { id: string };
      if (!args?.id) {
        return { error: 'id is required' };
      }
      const issue = coherenceService.getIssue(args.id);
      if (!issue) {
        return { error: `Issue not found: ${args.id}` };
      }
      return issue;
    },

    update_issue_status: async (params: unknown) => {
      const args = params as { id: string; status: IssueStatus };
      if (!args?.id || !args?.status) {
        return { error: 'id and status are required' };
      }
      const issue = coherenceService.updateIssueStatus(args.id, args.status);
      if (!issue) {
        return { error: `Issue not found: ${args.id}` };
      }
      return { success: true, issue };
    },

    get_coherence_terminal_view: async (_params: unknown) => {
      return { view: coherenceService.generateTerminalView() };
    },
  };
}
