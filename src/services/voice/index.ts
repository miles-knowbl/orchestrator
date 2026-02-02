/**
 * Voice Module Exports
 */

export { VoiceOutputService } from './VoiceOutputService.js';
export { MacOSTTS } from './MacOSTTS.js';
export { SpeechQueue } from './SpeechQueue.js';
export { QuietHoursManager } from './QuietHoursManager.js';
export { EventFormatter } from './EventFormatter.js';

export type {
  VoiceChannelConfig,
  VoiceStatus,
  SpeakOptions,
  SpeechQueueItem,
  QuietHoursConfig,
} from './types.js';

export { DEFAULT_VOICE_CONFIG } from './types.js';
