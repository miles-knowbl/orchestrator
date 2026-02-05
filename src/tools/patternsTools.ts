/**
 * MCP Tools for PatternsService
 *
 * Provides pattern query, roundup generation, detection, and gap analysis.
 */

import type { Tool, TextContent } from '@modelcontextprotocol/sdk/types.js';
import type { PatternsService, PatternQuery, DetectedPattern } from '../services/patterns/index.js';
import type { MemoryLevel } from '../types.js';

export const patternsTools: Tool[] = [
  {
    name: 'query_patterns',
    description: 'Search and filter patterns across all memory levels',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['orchestrator', 'loop', 'skill'],
          description: 'Filter by memory level',
        },
        entityId: {
          type: 'string',
          description: 'Filter by loop or skill ID',
        },
        confidence: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Filter by confidence level',
        },
        minUses: {
          type: 'number',
          description: 'Minimum usage count',
        },
        search: {
          type: 'string',
          description: 'Search in name, context, and solution',
        },
      },
    },
  },
  {
    name: 'get_pattern',
    description: 'Get a single pattern by ID',
    inputSchema: {
      type: 'object',
      properties: {
        patternId: {
          type: 'string',
          description: 'Pattern ID (e.g., PAT-001)',
        },
      },
      required: ['patternId'],
    },
  },
  {
    name: 'generate_pattern_roundup',
    description: 'Generate a formatted summary of patterns at a level',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['orchestrator', 'loop', 'skill'],
          description: 'Memory level to summarize',
          default: 'orchestrator',
        },
        entityId: {
          type: 'string',
          description: 'Loop or skill ID (required for loop/skill level)',
        },
        format: {
          type: 'string',
          enum: ['summary', 'full', 'markdown'],
          description: 'Output format',
          default: 'summary',
        },
      },
    },
  },
  {
    name: 'detect_patterns',
    description: 'Run automatic pattern detection from behaviors and codebase',
    inputSchema: {
      type: 'object',
      properties: {
        includeGaps: {
          type: 'boolean',
          description: 'Include pattern gap analysis',
          default: true,
        },
      },
    },
  },
  {
    name: 'get_pattern_gaps',
    description: 'Analyze gaps in pattern coverage',
    inputSchema: {
      type: 'object',
      properties: {
        priorityFilter: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Filter by priority',
        },
      },
    },
  },
  {
    name: 'formalize_pattern',
    description: 'Convert a detected pattern into a formal pattern in memory',
    inputSchema: {
      type: 'object',
      properties: {
        detectedPatternId: {
          type: 'string',
          description: 'ID of the detected pattern to formalize',
        },
        name: {
          type: 'string',
          description: 'Override the pattern name',
        },
        context: {
          type: 'string',
          description: 'Override the context',
        },
        solution: {
          type: 'string',
          description: 'Override the solution',
        },
        example: {
          type: 'string',
          description: 'Add an example',
        },
        level: {
          type: 'string',
          enum: ['orchestrator', 'loop', 'skill'],
          description: 'Override the suggested level',
        },
      },
      required: ['detectedPatternId'],
    },
  },
];

export function createPatternsToolHandlers(patternsService: PatternsService) {
  // Store detected patterns for formalization
  let lastDetectionResult: { patterns: DetectedPattern[] } | null = null;

  return {
    query_patterns: async (params: unknown) => {
      const args = (params || {}) as PatternQuery;
      const patterns = await patternsService.queryPatterns(args);

      if (patterns.length === 0) {
        return [{ type: 'text', text: 'No patterns found matching the query.' }];
      }

      const lines: string[] = [];
      lines.push(`Found ${patterns.length} pattern(s):\n`);

      for (const pattern of patterns) {
        const levelLabel = pattern.entityId
          ? `${pattern.level}/${pattern.entityId}`
          : pattern.level;
        lines.push(`**${pattern.id}** - ${pattern.name}`);
        lines.push(`  Level: ${levelLabel} | Uses: ${pattern.uses} | Confidence: ${pattern.confidence}`);
        lines.push(`  Context: ${pattern.context.slice(0, 100)}${pattern.context.length > 100 ? '...' : ''}`);
        lines.push('');
      }

      return [{ type: 'text', text: lines.join('\n') }];
    },

    get_pattern: async (params: unknown) => {
      const args = params as { patternId: string };
      if (!args?.patternId) {
        return [{ type: 'text', text: 'Error: patternId is required' }];
      }

      const pattern = await patternsService.getPattern(args.patternId);

      if (!pattern) {
        return [{ type: 'text', text: `Pattern not found: ${args.patternId}` }];
      }

      const levelLabel = pattern.entityId
        ? `${pattern.level}/${pattern.entityId}`
        : pattern.level;

      const lines: string[] = [];
      lines.push(`# ${pattern.name}\n`);
      lines.push(`**ID:** ${pattern.id}`);
      lines.push(`**Level:** ${levelLabel}`);
      lines.push(`**Uses:** ${pattern.uses}`);
      lines.push(`**Confidence:** ${pattern.confidence}`);
      lines.push(`**Created:** ${new Date(pattern.createdAt).toISOString().split('T')[0]}`);
      if (pattern.lastUsed) {
        lines.push(`**Last Used:** ${new Date(pattern.lastUsed).toISOString().split('T')[0]}`);
      }
      lines.push('');
      lines.push('## Context\n');
      lines.push(pattern.context);
      lines.push('');
      lines.push('## Solution\n');
      lines.push(pattern.solution);
      if (pattern.example) {
        lines.push('');
        lines.push('## Example\n');
        lines.push('```');
        lines.push(pattern.example);
        lines.push('```');
      }

      return [{ type: 'text', text: lines.join('\n') }];
    },

    generate_pattern_roundup: async (params: unknown) => {
      const args = (params || {}) as {
        level?: MemoryLevel;
        entityId?: string;
        format?: 'summary' | 'full' | 'markdown';
      };
      const level = args.level || 'orchestrator';
      const roundup = await patternsService.generateRoundup(level, args.entityId);
      const format = args.format || 'summary';

      if (format === 'markdown') {
        return [{ type: 'text', text: roundup.markdown }];
      }

      const lines: string[] = [];
      lines.push(`# Pattern Roundup: ${level}${args.entityId ? `/${args.entityId}` : ''}\n`);
      lines.push(`Generated: ${roundup.generatedAt}\n`);
      lines.push('## Summary\n');
      lines.push(`- **Total Patterns:** ${roundup.summary.total}`);
      lines.push(`- **High Confidence:** ${roundup.summary.byConfidence.high}`);
      lines.push(`- **Medium Confidence:** ${roundup.summary.byConfidence.medium}`);
      lines.push(`- **Low Confidence:** ${roundup.summary.byConfidence.low}`);
      lines.push(`- **Average Uses:** ${roundup.summary.avgUses}`);

      if (format === 'full') {
        lines.push('\n## Most Used\n');
        for (const p of roundup.summary.mostUsed) {
          lines.push(`- ${p.name} (${p.uses} uses, ${p.confidence})`);
        }

        lines.push('\n## Recently Added\n');
        for (const p of roundup.summary.recentlyAdded) {
          const date = new Date(p.createdAt).toISOString().split('T')[0];
          lines.push(`- ${p.name} (${date})`);
        }

        lines.push('\n## All Patterns\n');
        for (const p of roundup.patterns) {
          lines.push(`- **${p.id}** ${p.name} [${p.confidence}]`);
        }
      }

      return [{ type: 'text', text: lines.join('\n') }];
    },

    detect_patterns: async (params: unknown) => {
      const args = (params || {}) as { includeGaps?: boolean };
      const result = await patternsService.detectPatterns();
      lastDetectionResult = result;
      const includeGaps = args.includeGaps !== false;

      const lines: string[] = [];
      lines.push(`# Pattern Detection Results\n`);
      lines.push(`Detected at: ${result.detectedAt}\n`);

      lines.push('## Summary\n');
      lines.push(`- **Total Detected:** ${result.summary.totalDetected}`);
      for (const [type, count] of Object.entries(result.summary.byType)) {
        lines.push(`  - ${type}: ${count}`);
      }
      if (includeGaps) {
        lines.push(`- **Pattern Gaps:** ${result.summary.totalGaps}`);
        lines.push(`- **High Priority Gaps:** ${result.summary.highPriorityGaps}`);
      }

      if (result.patterns.length > 0) {
        lines.push('\n## Detected Patterns\n');
        for (const p of result.patterns) {
          lines.push(`### ${p.name}`);
          lines.push(`- **ID:** ${p.id}`);
          lines.push(`- **Type:** ${p.type}`);
          lines.push(`- **Confidence:** ${Math.round(p.confidence * 100)}%`);
          lines.push(`- **Occurrences:** ${p.occurrences}`);
          lines.push(`- **Suggested Level:** ${p.suggestedLevel}`);
          lines.push(`- **Context:** ${p.context}`);
          lines.push('');
        }
      }

      if (includeGaps && result.gaps.length > 0) {
        lines.push('\n## Pattern Gaps\n');
        for (const g of result.gaps) {
          lines.push(`### ${g.category} [${g.priority}]`);
          lines.push(`- **Description:** ${g.description}`);
          lines.push(`- **Suggested Name:** ${g.suggestedName}`);
          lines.push(`- **Reasoning:** ${g.reasoning}`);
          lines.push('');
        }
      }

      lines.push('\n---');
      lines.push('Use `formalize_pattern` with a detected pattern ID to add it to memory.');

      return [{ type: 'text', text: lines.join('\n') }];
    },

    get_pattern_gaps: async (params: unknown) => {
      const args = (params || {}) as { priorityFilter?: 'low' | 'medium' | 'high' };
      const result = await patternsService.detectPatterns();
      let gaps = result.gaps;

      if (args.priorityFilter) {
        gaps = gaps.filter(g => g.priority === args.priorityFilter);
      }

      if (gaps.length === 0) {
        return [{ type: 'text', text: 'No pattern gaps identified.' }];
      }

      const lines: string[] = [];
      lines.push(`# Pattern Gaps\n`);
      lines.push(`Found ${gaps.length} gap(s):\n`);

      for (const gap of gaps) {
        lines.push(`## ${gap.category}`);
        lines.push(`**Priority:** ${gap.priority}`);
        lines.push(`**Description:** ${gap.description}`);
        lines.push(`**Suggested Name:** ${gap.suggestedName}`);
        lines.push(`**Suggested Context:** ${gap.suggestedContext}`);
        lines.push(`**Reasoning:** ${gap.reasoning}`);
        lines.push('');
      }

      return [{ type: 'text', text: lines.join('\n') }];
    },

    formalize_pattern: async (params: unknown) => {
      const args = params as {
        detectedPatternId: string;
        name?: string;
        context?: string;
        solution?: string;
        example?: string;
        level?: MemoryLevel;
      };

      if (!args?.detectedPatternId) {
        return [{ type: 'text', text: 'Error: detectedPatternId is required' }];
      }

      if (!lastDetectionResult) {
        return [{ type: 'text', text: 'No detection results available. Run `detect_patterns` first.' }];
      }

      const detected = lastDetectionResult.patterns.find(p => p.id === args.detectedPatternId);
      if (!detected) {
        return [{ type: 'text', text: `Detected pattern not found: ${args.detectedPatternId}` }];
      }

      // Override suggested level if provided
      if (args.level) {
        detected.suggestedLevel = args.level;
      }

      const pattern = await patternsService.formalizePattern(detected, {
        name: args.name,
        context: args.context,
        solution: args.solution,
        example: args.example,
      });

      return [{
        type: 'text',
        text: `Pattern formalized successfully!\n\n**ID:** ${pattern.id}\n**Name:** ${pattern.name}\n**Confidence:** ${pattern.confidence}\n**Uses:** ${pattern.uses}`,
      }];
    },
  };
}
