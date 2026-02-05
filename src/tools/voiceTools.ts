/**
 * Voice MCP Tools
 *
 * MCP tool handlers for voice output configuration and control.
 */

import { z } from 'zod';
import { MacOSTTS, type VoiceChannelConfig } from '../services/voice/index.js';
import type { VoiceAdapter } from '../services/proactive-messaging/adapters/VoiceAdapter.js';

// Tool schemas
export const configureVoiceSchema = z.object({
  enabled: z.boolean().optional(),
  voice: z.string().optional(),
  rate: z.number().min(80).max(300).optional(),
  events: z
    .object({
      gate_waiting: z.boolean().optional(),
      loop_complete: z.boolean().optional(),
      phase_start: z.boolean().optional(),
      skill_complete: z.boolean().optional(),
      execution_status: z.boolean().optional(),
    })
    .optional(),
  quietHours: z
    .object({
      enabled: z.boolean().optional(),
      start: z.string().optional(),
      end: z.string().optional(),
      urgentBypass: z.boolean().optional(),
    })
    .optional(),
});

export const testVoiceSchema = z.object({
  text: z.string().optional(),
});

export const getVoiceStatusSchema = z.object({});

export const listVoicesSchema = z.object({});

// Tool definitions
export const voiceToolDefinitions = [
  {
    name: 'configure_voice',
    description: 'Configuring voice — updates output settings',
    inputSchema: {
      type: 'object' as const,
      properties: {
        enabled: { type: 'boolean', description: 'Enable or disable voice output' },
        voice: { type: 'string', description: 'Voice name (e.g., "Samantha", "Alex", "Daniel")' },
        rate: { type: 'number', description: 'Speech rate in words per minute (80-300)' },
        events: {
          type: 'object',
          description: 'Event types to speak',
          properties: {
            gate_waiting: { type: 'boolean' },
            loop_complete: { type: 'boolean' },
            phase_start: { type: 'boolean' },
            skill_complete: { type: 'boolean' },
            execution_status: { type: 'boolean' },
          },
        },
        quietHours: {
          type: 'object',
          description: 'Quiet hours configuration',
          properties: {
            enabled: { type: 'boolean' },
            start: { type: 'string', description: 'Start time in HH:MM format' },
            end: { type: 'string', description: 'End time in HH:MM format' },
            urgentBypass: { type: 'boolean', description: 'Allow urgent notifications during quiet hours' },
          },
        },
      },
    },
  },
  {
    name: 'test_voice',
    description: 'Testing voice — plays sample with optional custom text',
    inputSchema: {
      type: 'object' as const,
      properties: {
        text: { type: 'string', description: 'Text to speak (default: "Voice test successful")' },
      },
    },
  },
  {
    name: 'get_voice_status',
    description: 'Checking voice status — retrieves current output settings',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_voices',
    description: 'Listing voices — retrieves available macOS voice options',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
];

// Tool handlers
export function createVoiceToolHandlers(getVoiceAdapter: () => VoiceAdapter | null) {
  return {
    configure_voice: async (args: unknown) => {
      const validated = configureVoiceSchema.parse(args || {});
      const adapter = getVoiceAdapter();
      if (!adapter) {
        return { error: 'Voice adapter not configured' };
      }

      const service = adapter.getService();
      service.configure(validated as Partial<VoiceChannelConfig>);

      return {
        success: true,
        config: service.getConfig(),
      };
    },

    test_voice: async (args: unknown) => {
      const validated = testVoiceSchema.parse(args || {});
      const adapter = getVoiceAdapter();
      if (!adapter) {
        return { error: 'Voice adapter not configured' };
      }

      const text = validated.text || 'Voice test successful';
      const service = adapter.getService();

      try {
        await service.speakNow(text, { priority: 'urgent' });
        return { success: true, message: `Spoke: "${text}"` };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },

    get_voice_status: async () => {
      const adapter = getVoiceAdapter();
      if (!adapter) {
        return { error: 'Voice adapter not configured' };
      }

      return adapter.getService().getStatus();
    },

    list_voices: async () => {
      try {
        const voices = await MacOSTTS.listVoices();
        return { voices };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
      }
    },
  };
}
