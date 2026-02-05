/**
 * MCP Tools for MECE Opportunity Mapping
 *
 * Provides control over MECE analysis and opportunity management.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type {
  MECEOpportunityService,
  OpportunitySource,
  OpportunityStatus,
  GapSeverity,
} from '../services/mece/index.js';

export const meceTools: Tool[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Analysis
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'run_mece_analysis',
    description: 'Running MECE analysis — identifies opportunities, gaps, and overlaps',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_mece_status',
    description: 'Checking MECE status — retrieves opportunity mapping state',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_last_analysis',
    description: 'Loading MECE results — retrieves last analysis findings',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Taxonomy
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_mece_taxonomy',
    description: 'Loading MECE taxonomy — retrieves category structure',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'set_mece_category',
    description: 'Updating MECE taxonomy — adds or modifies a category',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Category ID' },
        name: { type: 'string', description: 'Category name' },
        description: { type: 'string', description: 'Category description' },
        layer: { type: 'number', description: 'Layer number (0-6)' },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Keywords for automatic classification',
        },
        subcategories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              keywords: { type: 'array', items: { type: 'string' } },
            },
          },
          description: 'Subcategories',
        },
      },
      required: ['id', 'name', 'description', 'layer'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Opportunities
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'list_opportunities',
    description: 'Listing opportunities — filters by category, priority, or status',
    inputSchema: {
      type: 'object',
      properties: {
        categoryId: { type: 'string', description: 'Filter by category' },
        status: {
          type: 'string',
          enum: ['identified', 'planned', 'in-progress', 'complete', 'rejected'],
          description: 'Filter by status',
        },
        source: {
          type: 'string',
          enum: ['roadmap', 'skill', 'pattern', 'analytics', 'gap-analysis', 'manual'],
          description: 'Filter by source',
        },
      },
    },
  },
  {
    name: 'add_opportunity',
    description: 'Adding opportunity — creates new manually-identified opportunity',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Opportunity title' },
        description: { type: 'string', description: 'Opportunity description' },
        categoryId: { type: 'string', description: 'Category ID' },
        subcategoryId: { type: 'string', description: 'Subcategory ID (optional)' },
        leverage: { type: 'number', description: 'Leverage score (0-10)' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags',
        },
        dependencies: {
          type: 'array',
          items: { type: 'string' },
          description: 'Dependent opportunity IDs',
        },
      },
      required: ['title', 'description', 'categoryId'],
    },
  },
  {
    name: 'update_opportunity',
    description: 'Updating opportunity — modifies existing opportunity details',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Opportunity ID' },
        title: { type: 'string' },
        description: { type: 'string' },
        categoryId: { type: 'string' },
        subcategoryId: { type: 'string' },
        status: {
          type: 'string',
          enum: ['identified', 'planned', 'in-progress', 'complete', 'rejected'],
        },
        leverage: { type: 'number' },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['id'],
    },
  },
  {
    name: 'remove_opportunity',
    description: 'Removing opportunity — deletes from analysis',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Opportunity ID' },
      },
      required: ['id'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Gaps & Overlaps
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'list_gaps',
    description: 'Listing coverage gaps — identifies unaddressed areas',
    inputSchema: {
      type: 'object',
      properties: {
        categoryId: { type: 'string', description: 'Filter by category' },
        severity: {
          type: 'string',
          enum: ['critical', 'high', 'medium', 'low'],
          description: 'Filter by severity',
        },
      },
    },
  },
  {
    name: 'list_overlaps',
    description: 'Listing overlaps — shows duplicated effort between opportunities',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Terminal View
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'get_mece_terminal_view',
    description: 'Visualizing MECE analysis — generates terminal-friendly display',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export function createMECEToolHandlers(meceService: MECEOpportunityService) {
  return {
    run_mece_analysis: async (_params: unknown) => {
      const analysis = await meceService.runAnalysis();
      return {
        success: true,
        analysis: {
          id: analysis.id,
          timestamp: analysis.timestamp,
          overallCoverage: analysis.overallCoverage,
          totalOpportunities: analysis.opportunities.length,
          totalGaps: analysis.totalGaps,
          totalOverlaps: analysis.totalOverlaps,
          recommendationCount: analysis.recommendations.length,
          topRecommendations: analysis.recommendations.slice(0, 5),
          metadata: analysis.metadata,
        },
      };
    },

    get_mece_status: async (_params: unknown) => {
      return meceService.getStatus();
    },

    get_last_analysis: async (_params: unknown) => {
      const analysis = meceService.getLastAnalysis();
      if (!analysis) {
        return { error: 'No analysis has been run yet. Use run_mece_analysis first.' };
      }
      return analysis;
    },

    get_mece_taxonomy: async (_params: unknown) => {
      const taxonomy = meceService.getTaxonomy();
      return { count: taxonomy.length, categories: taxonomy };
    },

    set_mece_category: async (params: unknown) => {
      const args = params as {
        id: string;
        name: string;
        description: string;
        layer: number;
        keywords?: string[];
        subcategories?: Array<{
          id: string;
          name: string;
          description: string;
          keywords?: string[];
        }>;
      };
      if (!args?.id || !args?.name || !args?.description || args?.layer === undefined) {
        return { error: 'id, name, description, and layer are required' };
      }
      meceService.setCategory({
        id: args.id,
        name: args.name,
        description: args.description,
        layer: args.layer,
        keywords: args.keywords || [],
        subcategories: (args.subcategories || []).map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          keywords: s.keywords || [],
        })),
      });
      return { success: true, message: `Category ${args.id} saved` };
    },

    list_opportunities: async (params: unknown) => {
      const args = (params || {}) as {
        categoryId?: string;
        status?: OpportunityStatus;
        source?: OpportunitySource;
      };
      const opportunities = meceService.getOpportunities(args);
      return { count: opportunities.length, opportunities };
    },

    add_opportunity: async (params: unknown) => {
      const args = params as {
        title: string;
        description: string;
        categoryId: string;
        subcategoryId?: string;
        leverage?: number;
        tags?: string[];
        dependencies?: string[];
      };
      if (!args?.title || !args?.description || !args?.categoryId) {
        return { error: 'title, description, and categoryId are required' };
      }
      const opportunity = meceService.addOpportunity({
        title: args.title,
        description: args.description,
        categoryId: args.categoryId,
        subcategoryId: args.subcategoryId,
        source: 'manual',
        status: 'identified',
        leverage: args.leverage ?? 5,
        dependencies: args.dependencies || [],
        blockedBy: [],
        tags: args.tags || [],
      });
      return { success: true, opportunity };
    },

    update_opportunity: async (params: unknown) => {
      const args = params as {
        id: string;
        title?: string;
        description?: string;
        categoryId?: string;
        subcategoryId?: string;
        status?: OpportunityStatus;
        leverage?: number;
        tags?: string[];
      };
      if (!args?.id) {
        return { error: 'id is required' };
      }
      const opportunity = meceService.updateOpportunity(args.id, args);
      if (!opportunity) {
        return { error: `Opportunity not found: ${args.id}` };
      }
      return { success: true, opportunity };
    },

    remove_opportunity: async (params: unknown) => {
      const args = params as { id: string };
      if (!args?.id) {
        return { error: 'id is required' };
      }
      const removed = meceService.removeOpportunity(args.id);
      return { success: removed, message: removed ? 'Opportunity removed' : 'Opportunity not found' };
    },

    list_gaps: async (params: unknown) => {
      const args = (params || {}) as {
        categoryId?: string;
        severity?: GapSeverity;
      };
      const gaps = meceService.getGaps(args);
      return { count: gaps.length, gaps };
    },

    list_overlaps: async (_params: unknown) => {
      const overlaps = meceService.getOverlaps();
      return { count: overlaps.length, overlaps };
    },

    get_mece_terminal_view: async (_params: unknown) => {
      return { view: meceService.generateTerminalView() };
    },
  };
}
