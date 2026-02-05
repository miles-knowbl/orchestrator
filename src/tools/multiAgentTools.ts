/**
 * MCP Tools for Multi-Agent Worktree Coordination
 *
 * Provides control over multi-collaborator parallel development.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type {
  MultiAgentCoordinator,
  ReservationType,
  MergeRequestStatus,
} from '../services/multi-agent/index.js';

export const multiAgentTools: Tool[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Collaborator Management
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'register_collaborator',
    description: 'Register a new collaborator who can spawn agent sets.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Collaborator name',
        },
        email: {
          type: 'string',
          description: 'Collaborator email (optional)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_collaborators',
    description: 'List all registered collaborators.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_collaborator',
    description: 'Get details about a specific collaborator.',
    inputSchema: {
      type: 'object',
      properties: {
        collaboratorId: {
          type: 'string',
          description: 'Collaborator ID',
        },
      },
      required: ['collaboratorId'],
    },
  },
  {
    name: 'get_collaborator_work',
    description: 'Get what a collaborator is currently working on.',
    inputSchema: {
      type: 'object',
      properties: {
        collaboratorId: {
          type: 'string',
          description: 'Collaborator ID',
        },
      },
      required: ['collaboratorId'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Agent Set Management
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'create_agent_set',
    description: 'Create a new agent set for a collaborator.',
    inputSchema: {
      type: 'object',
      properties: {
        collaboratorId: {
          type: 'string',
          description: 'Collaborator ID',
        },
        name: {
          type: 'string',
          description: 'Name for the agent set',
        },
      },
      required: ['collaboratorId', 'name'],
    },
  },
  {
    name: 'list_agent_sets',
    description: 'List agent sets, optionally filtered by collaborator.',
    inputSchema: {
      type: 'object',
      properties: {
        collaboratorId: {
          type: 'string',
          description: 'Filter by collaborator ID (optional)',
        },
      },
    },
  },
  {
    name: 'get_agent_set',
    description: 'Get details about an agent set.',
    inputSchema: {
      type: 'object',
      properties: {
        agentSetId: {
          type: 'string',
          description: 'Agent set ID',
        },
      },
      required: ['agentSetId'],
    },
  },
  {
    name: 'pause_agent_set',
    description: 'Pause an agent set.',
    inputSchema: {
      type: 'object',
      properties: {
        agentSetId: {
          type: 'string',
          description: 'Agent set ID',
        },
      },
      required: ['agentSetId'],
    },
  },
  {
    name: 'resume_agent_set',
    description: 'Resume a paused agent set.',
    inputSchema: {
      type: 'object',
      properties: {
        agentSetId: {
          type: 'string',
          description: 'Agent set ID',
        },
      },
      required: ['agentSetId'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Reservation Management
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'create_reservation',
    description: 'Create a reservation to claim a module, file, or path pattern.',
    inputSchema: {
      type: 'object',
      properties: {
        collaboratorId: {
          type: 'string',
          description: 'Collaborator ID',
        },
        type: {
          type: 'string',
          enum: ['module', 'file', 'path-pattern'],
          description: 'Type of resource to reserve',
        },
        target: {
          type: 'string',
          description: 'Module ID, file path, or glob pattern',
        },
        agentSetId: {
          type: 'string',
          description: 'Agent set ID (optional)',
        },
        reason: {
          type: 'string',
          description: 'Reason for reservation',
        },
        exclusive: {
          type: 'boolean',
          description: 'Whether the reservation is exclusive (default: true)',
        },
        durationMs: {
          type: 'number',
          description: 'Duration in milliseconds (default: 1 hour)',
        },
      },
      required: ['collaboratorId', 'type', 'target'],
    },
  },
  {
    name: 'list_reservations',
    description: 'List reservations, optionally filtered by collaborator.',
    inputSchema: {
      type: 'object',
      properties: {
        collaboratorId: {
          type: 'string',
          description: 'Filter by collaborator ID (optional)',
        },
      },
    },
  },
  {
    name: 'release_reservation',
    description: 'Release a reservation.',
    inputSchema: {
      type: 'object',
      properties: {
        reservationId: {
          type: 'string',
          description: 'Reservation ID',
        },
      },
      required: ['reservationId'],
    },
  },
  {
    name: 'extend_reservation',
    description: 'Extend a reservation duration.',
    inputSchema: {
      type: 'object',
      properties: {
        reservationId: {
          type: 'string',
          description: 'Reservation ID',
        },
        additionalMs: {
          type: 'number',
          description: 'Additional time in milliseconds',
        },
      },
      required: ['reservationId', 'additionalMs'],
    },
  },
  {
    name: 'check_resource_blocked',
    description: 'Check if a resource is blocked by reservations.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['module', 'file', 'path-pattern'],
          description: 'Type of resource',
        },
        target: {
          type: 'string',
          description: 'Module ID, file path, or glob pattern',
        },
      },
      required: ['type', 'target'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Merge Queue Management
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'request_merge',
    description: 'Request to merge a worktree branch to main.',
    inputSchema: {
      type: 'object',
      properties: {
        collaboratorId: {
          type: 'string',
          description: 'Collaborator ID',
        },
        agentSetId: {
          type: 'string',
          description: 'Agent set ID',
        },
        moduleId: {
          type: 'string',
          description: 'Module ID with the worktree to merge',
        },
      },
      required: ['collaboratorId', 'agentSetId', 'moduleId'],
    },
  },
  {
    name: 'check_merge_conflicts',
    description: 'Check a merge request for conflicts.',
    inputSchema: {
      type: 'object',
      properties: {
        mergeRequestId: {
          type: 'string',
          description: 'Merge request ID',
        },
      },
      required: ['mergeRequestId'],
    },
  },
  {
    name: 'execute_merge',
    description: 'Execute an approved merge request.',
    inputSchema: {
      type: 'object',
      properties: {
        mergeRequestId: {
          type: 'string',
          description: 'Merge request ID',
        },
      },
      required: ['mergeRequestId'],
    },
  },
  {
    name: 'reject_merge',
    description: 'Reject a merge request.',
    inputSchema: {
      type: 'object',
      properties: {
        mergeRequestId: {
          type: 'string',
          description: 'Merge request ID',
        },
        reason: {
          type: 'string',
          description: 'Reason for rejection',
        },
      },
      required: ['mergeRequestId', 'reason'],
    },
  },
  {
    name: 'list_merge_queue',
    description: 'List the merge queue.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'checking', 'approved', 'merging', 'merged', 'conflict', 'rejected'],
          description: 'Filter by status (optional)',
        },
      },
    },
  },
  {
    name: 'get_merge_request',
    description: 'Get details of a merge request.',
    inputSchema: {
      type: 'object',
      properties: {
        mergeRequestId: {
          type: 'string',
          description: 'Merge request ID',
        },
      },
      required: ['mergeRequestId'],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Coordination
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'check_can_work',
    description: 'Check if a collaborator can start work on a module.',
    inputSchema: {
      type: 'object',
      properties: {
        collaboratorId: {
          type: 'string',
          description: 'Collaborator ID',
        },
        moduleId: {
          type: 'string',
          description: 'Module ID to check',
        },
      },
      required: ['collaboratorId', 'moduleId'],
    },
  },
  {
    name: 'get_all_active_work',
    description: 'Get all active work across all collaborators.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_coordinator_status',
    description: 'Get the overall status of the multi-agent coordinator.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_coordinator_events',
    description: 'Get recent coordinator events.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum events to return',
        },
      },
    },
  },
];

export function createMultiAgentToolHandlers(coordinator: MultiAgentCoordinator) {
  return {
    // Collaborator Management
    register_collaborator: async (params: unknown) => {
      const args = params as { name: string; email?: string };
      if (!args?.name) {
        return { error: 'name is required' };
      }
      const collaborator = coordinator.registerCollaborator(args.name, args.email);
      return { success: true, collaborator };
    },

    list_collaborators: async (_params: unknown) => {
      const collaborators = coordinator.listCollaborators();
      return { count: collaborators.length, collaborators };
    },

    get_collaborator: async (params: unknown) => {
      const args = params as { collaboratorId: string };
      if (!args?.collaboratorId) {
        return { error: 'collaboratorId is required' };
      }
      const collaborator = coordinator.getCollaborator(args.collaboratorId);
      if (!collaborator) {
        return { error: `Collaborator not found: ${args.collaboratorId}` };
      }
      return collaborator;
    },

    get_collaborator_work: async (params: unknown) => {
      const args = params as { collaboratorId: string };
      if (!args?.collaboratorId) {
        return { error: 'collaboratorId is required' };
      }
      return coordinator.getCollaboratorWork(args.collaboratorId);
    },

    // Agent Set Management
    create_agent_set: async (params: unknown) => {
      const args = params as { collaboratorId: string; name: string };
      if (!args?.collaboratorId || !args?.name) {
        return { error: 'collaboratorId and name are required' };
      }
      try {
        const agentSet = coordinator.createAgentSet(args.collaboratorId, args.name);
        return { success: true, agentSet };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    list_agent_sets: async (params: unknown) => {
      const args = (params || {}) as { collaboratorId?: string };
      const sets = coordinator.listAgentSets(args.collaboratorId);
      return { count: sets.length, agentSets: sets };
    },

    get_agent_set: async (params: unknown) => {
      const args = params as { agentSetId: string };
      if (!args?.agentSetId) {
        return { error: 'agentSetId is required' };
      }
      const set = coordinator.getAgentSet(args.agentSetId);
      if (!set) {
        return { error: `Agent set not found: ${args.agentSetId}` };
      }
      return set;
    },

    pause_agent_set: async (params: unknown) => {
      const args = params as { agentSetId: string };
      if (!args?.agentSetId) {
        return { error: 'agentSetId is required' };
      }
      coordinator.pauseAgentSet(args.agentSetId);
      return { success: true, message: `Agent set ${args.agentSetId} paused` };
    },

    resume_agent_set: async (params: unknown) => {
      const args = params as { agentSetId: string };
      if (!args?.agentSetId) {
        return { error: 'agentSetId is required' };
      }
      coordinator.resumeAgentSet(args.agentSetId);
      return { success: true, message: `Agent set ${args.agentSetId} resumed` };
    },

    // Reservation Management
    create_reservation: async (params: unknown) => {
      const args = params as {
        collaboratorId: string;
        type: ReservationType;
        target: string;
        agentSetId?: string;
        reason?: string;
        exclusive?: boolean;
        durationMs?: number;
      };
      if (!args?.collaboratorId || !args?.type || !args?.target) {
        return { error: 'collaboratorId, type, and target are required' };
      }
      try {
        const result = coordinator.createReservation(args.collaboratorId, args.type, args.target, {
          agentSetId: args.agentSetId,
          reason: args.reason,
          exclusive: args.exclusive,
          durationMs: args.durationMs,
        });
        if ('error' in result) {
          return result;
        }
        return { success: true, reservation: result };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    list_reservations: async (params: unknown) => {
      const args = (params || {}) as { collaboratorId?: string };
      const reservations = coordinator.listReservations(args.collaboratorId);
      return { count: reservations.length, reservations };
    },

    release_reservation: async (params: unknown) => {
      const args = params as { reservationId: string };
      if (!args?.reservationId) {
        return { error: 'reservationId is required' };
      }
      coordinator.releaseReservation(args.reservationId);
      return { success: true, message: `Reservation ${args.reservationId} released` };
    },

    extend_reservation: async (params: unknown) => {
      const args = params as { reservationId: string; additionalMs: number };
      if (!args?.reservationId || !args?.additionalMs) {
        return { error: 'reservationId and additionalMs are required' };
      }
      coordinator.extendReservation(args.reservationId, args.additionalMs);
      return { success: true, message: `Reservation ${args.reservationId} extended` };
    },

    check_resource_blocked: async (params: unknown) => {
      const args = params as { type: ReservationType; target: string };
      if (!args?.type || !args?.target) {
        return { error: 'type and target are required' };
      }
      const blocking = coordinator.checkResourceBlocked(args.type, args.target);
      return {
        blocked: blocking.length > 0,
        blockingReservations: blocking,
      };
    },

    // Merge Queue Management
    request_merge: async (params: unknown) => {
      const args = params as { collaboratorId: string; agentSetId: string; moduleId: string };
      if (!args?.collaboratorId || !args?.agentSetId || !args?.moduleId) {
        return { error: 'collaboratorId, agentSetId, and moduleId are required' };
      }
      try {
        const mergeRequest = coordinator.requestMerge(
          args.collaboratorId,
          args.agentSetId,
          args.moduleId
        );
        return { success: true, mergeRequest };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    check_merge_conflicts: async (params: unknown) => {
      const args = params as { mergeRequestId: string };
      if (!args?.mergeRequestId) {
        return { error: 'mergeRequestId is required' };
      }
      try {
        const result = await coordinator.checkMergeConflicts(args.mergeRequestId);
        return result;
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    execute_merge: async (params: unknown) => {
      const args = params as { mergeRequestId: string };
      if (!args?.mergeRequestId) {
        return { error: 'mergeRequestId is required' };
      }
      const result = await coordinator.executeMerge(args.mergeRequestId);
      return result;
    },

    reject_merge: async (params: unknown) => {
      const args = params as { mergeRequestId: string; reason: string };
      if (!args?.mergeRequestId || !args?.reason) {
        return { error: 'mergeRequestId and reason are required' };
      }
      coordinator.rejectMerge(args.mergeRequestId, args.reason);
      return { success: true, message: `Merge request ${args.mergeRequestId} rejected` };
    },

    list_merge_queue: async (params: unknown) => {
      const args = (params || {}) as { status?: MergeRequestStatus };
      const requests = coordinator.listMergeQueue(args.status);
      return { count: requests.length, mergeRequests: requests };
    },

    get_merge_request: async (params: unknown) => {
      const args = params as { mergeRequestId: string };
      if (!args?.mergeRequestId) {
        return { error: 'mergeRequestId is required' };
      }
      const request = coordinator.getMergeRequest(args.mergeRequestId);
      if (!request) {
        return { error: `Merge request not found: ${args.mergeRequestId}` };
      }
      return request;
    },

    // Coordination
    check_can_work: async (params: unknown) => {
      const args = params as { collaboratorId: string; moduleId: string };
      if (!args?.collaboratorId || !args?.moduleId) {
        return { error: 'collaboratorId and moduleId are required' };
      }
      const result = await coordinator.checkCanWork(args.collaboratorId, args.moduleId);
      return result;
    },

    get_all_active_work: async (_params: unknown) => {
      return coordinator.getAllActiveWork();
    },

    get_coordinator_status: async (_params: unknown) => {
      return coordinator.getStatus();
    },

    get_coordinator_events: async (params: unknown) => {
      const args = (params || {}) as { limit?: number };
      const events = coordinator.getEventLog(args.limit);
      return { count: events.length, events };
    },
  };
}
