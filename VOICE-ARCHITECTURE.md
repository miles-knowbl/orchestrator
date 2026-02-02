# Voice Module - Architecture

## Feature Overview

The Voice Module adds text-to-speech (TTS) output capabilities to the Orchestrator, enabling hands-free interaction during driving, jogging, or quick capture scenarios. It integrates with the existing ProactiveMessagingService as a new adapter.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ProactiveMessagingService                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────────┐  │
│  │ Terminal    │  │ Slack       │  │ Voice                           │  │
│  │ Adapter     │  │ Adapter     │  │ Adapter                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────────────┘  │
│                                               │                          │
└───────────────────────────────────────────────┼──────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          VoiceOutputService                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐ │
│  │ EventFormatter │  │ SpeechQueue    │  │ QuietHoursManager          │ │
│  │ (text→speech)  │  │ (priority-     │  │ (time-based filtering)     │ │
│  │                │  │  based queue)  │  │                            │ │
│  └────────────────┘  └────────────────┘  └────────────────────────────┘ │
│                              │                                           │
│                              ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      macOS TTS Engine                              │  │
│  │                   child_process.spawn('say')                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Design

### VoiceAdapter

**File**: `src/services/proactive-messaging/adapters/VoiceAdapter.ts`

Implements the `ChannelAdapter` interface to integrate with ProactiveMessagingService.

```typescript
interface VoiceAdapter extends ChannelAdapter {
  name: 'voice';
  initialize(): Promise<void>;
  send(message: FormattedMessage): Promise<string | undefined>;
  getStatus(): ChannelStatus;
  disconnect(): Promise<void>;
}
```

**Responsibilities**:
- Receive formatted messages from ProactiveMessagingService
- Convert messages to speech-friendly text (strip markdown, emojis, formatting)
- Route to VoiceOutputService for queuing and playback

### VoiceOutputService

**File**: `src/services/voice/VoiceOutputService.ts`

Core service managing TTS output.

```typescript
interface VoiceOutputService {
  // Configuration
  configure(config: VoiceConfig): void;
  getConfig(): VoiceConfig;

  // Speech output
  speak(text: string, options?: SpeakOptions): Promise<void>;
  speakNow(text: string, options?: SpeakOptions): Promise<void>; // Interrupts queue

  // Queue management
  getQueue(): SpeechQueueItem[];
  clearQueue(): void;
  pause(): void;
  resume(): void;
  skip(): void;

  // Status
  getStatus(): VoiceStatus;
  isSpeaking(): boolean;
}
```

### SpeechQueue

**File**: `src/services/voice/SpeechQueue.ts`

Priority-based queue for speech output.

```typescript
interface SpeechQueueItem {
  id: string;
  text: string;
  priority: 'normal' | 'urgent';
  eventType?: string;
  createdAt: Date;
}

class SpeechQueue {
  enqueue(item: SpeechQueueItem): void;
  dequeue(): SpeechQueueItem | null;
  peek(): SpeechQueueItem | null;
  clear(): void;
  size(): number;
  isEmpty(): boolean;
}
```

**Priority Handling**:
- `urgent` items are inserted at the front of the queue
- `normal` items are appended to the end
- Gate requests are always `urgent`

### QuietHoursManager

**File**: `src/services/voice/QuietHoursManager.ts`

Manages time-based filtering.

```typescript
interface QuietHoursConfig {
  enabled: boolean;
  start: string;  // "22:00" (24-hour format)
  end: string;    // "07:00"
  urgentBypass: boolean;  // Allow urgent notifications during quiet hours
}

class QuietHoursManager {
  isQuietHours(): boolean;
  shouldSpeak(priority: 'normal' | 'urgent'): boolean;
}
```

### EventFormatter

**File**: `src/services/voice/EventFormatter.ts`

Converts ProactiveMessaging events to speech-friendly text.

```typescript
class EventFormatter {
  // Convert event to spoken text
  formatForSpeech(message: FormattedMessage): string;

  // Event-specific formatters
  formatGateWaiting(event: GateWaitingEvent): string;
  formatLoopComplete(event: LoopCompleteEvent): string;
  formatPhaseStart(event: PhaseStartEvent): string;
  formatSkillComplete(event: SkillCompleteEvent): string;
  formatExecutionStatus(event: ExecutionStatusEvent): string;
}
```

**Formatting Rules**:
- Strip markdown: `**bold**` → `bold`
- Convert emojis: `✅` → `completed`, `⏳` → `waiting`
- Simplify: "Gate SCAFFOLD-gate is waiting for approval" → "Scaffold gate waiting"
- Pronunciation fixes: "INIT" → "init", "TTS" → "T T S"

## Data Models

### VoiceConfig

```typescript
interface VoiceConfig {
  enabled: boolean;

  // macOS say command options
  voice: string;        // "Samantha", "Alex", "Daniel", etc.
  rate: number;         // Words per minute (80-300, default 175)

  // Event filtering
  events: {
    gate_waiting: boolean;
    loop_complete: boolean;
    phase_start: boolean;
    skill_complete: boolean;
    execution_status: boolean;
  };

  // Quiet hours
  quietHours: QuietHoursConfig;
}
```

**Default Config**:
```typescript
const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  enabled: true,
  voice: 'Samantha',
  rate: 175,
  events: {
    gate_waiting: true,
    loop_complete: true,
    phase_start: true,
    skill_complete: false,
    execution_status: false,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
    urgentBypass: true,
  },
};
```

### VoiceStatus

```typescript
interface VoiceStatus {
  enabled: boolean;
  speaking: boolean;
  paused: boolean;
  queueLength: number;
  currentItem?: {
    text: string;
    eventType?: string;
  };
  lastSpokenAt?: Date;
  quietHours: {
    active: boolean;
    until?: Date;
  };
}
```

## macOS TTS Integration

### TTS Engine Wrapper

**File**: `src/services/voice/MacOSTTS.ts`

```typescript
import { spawn, ChildProcess } from 'child_process';

class MacOSTTS {
  private currentProcess: ChildProcess | null = null;
  private voice: string = 'Samantha';
  private rate: number = 175;

  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.currentProcess = spawn('say', [
        '-v', this.voice,
        '-r', String(this.rate),
        text
      ]);

      this.currentProcess.on('close', (code) => {
        this.currentProcess = null;
        if (code === 0) resolve();
        else reject(new Error(`say exited with code ${code}`));
      });

      this.currentProcess.on('error', reject);
    });
  }

  stop(): void {
    if (this.currentProcess) {
      this.currentProcess.kill();
      this.currentProcess = null;
    }
  }

  setVoice(voice: string): void {
    this.voice = voice;
  }

  setRate(rate: number): void {
    this.rate = Math.max(80, Math.min(300, rate));
  }

  static async listVoices(): Promise<string[]> {
    // Parse output of: say -v '?'
  }
}
```

### Latency Optimization

The macOS `say` command provides sub-100ms latency because:
1. No network round-trip (local processing)
2. Pre-loaded voice models
3. Direct CoreAudio integration

**Measured Performance**:
- First word latency: ~50-80ms
- Full phrase synthesis: concurrent with playback (streaming)

## Test Scenarios

### Unit Tests

**VoiceOutputService.test.ts**:
```typescript
describe('VoiceOutputService', () => {
  it('speaks text using macOS say command');
  it('queues multiple messages in order');
  it('prioritizes urgent messages');
  it('respects quiet hours configuration');
  it('bypasses quiet hours for urgent when configured');
  it('pauses and resumes speech queue');
  it('clears queue when requested');
});
```

**EventFormatter.test.ts**:
```typescript
describe('EventFormatter', () => {
  it('strips markdown formatting');
  it('converts emojis to words');
  it('shortens verbose gate names');
  it('handles missing event fields gracefully');
});
```

**QuietHoursManager.test.ts**:
```typescript
describe('QuietHoursManager', () => {
  it('returns true during quiet hours');
  it('returns false outside quiet hours');
  it('handles overnight spans (22:00-07:00)');
  it('respects urgentBypass setting');
});
```

### Integration Tests

**VoiceAdapter.integration.test.ts**:
```typescript
describe('VoiceAdapter Integration', () => {
  it('receives messages from ProactiveMessagingService');
  it('filters events based on configuration');
  it('formats messages for speech before speaking');
});
```

### E2E Tests (Manual)

1. **Gate Notification Flow**:
   - Start execution
   - Reach gate
   - Verify voice announces "Scaffold gate waiting for approval"

2. **Quiet Hours**:
   - Configure quiet hours for current time
   - Trigger notification
   - Verify no speech (unless urgent)

3. **Queue Behavior**:
   - Trigger multiple rapid notifications
   - Verify orderly playback
   - Test skip functionality

## API Endpoints

### GET /api/voice/status

```typescript
// Response
{
  enabled: boolean;
  speaking: boolean;
  paused: boolean;
  queueLength: number;
  currentItem?: { text: string; eventType?: string };
  quietHours: { active: boolean; until?: string };
}
```

### GET /api/voice/config

```typescript
// Response: VoiceConfig
```

### PUT /api/voice/config

```typescript
// Request: Partial<VoiceConfig>
// Response: VoiceConfig
```

### POST /api/voice/test

```typescript
// Request
{ text?: string }

// Response
{ success: boolean; message: string }
```

### GET /api/voice/voices

```typescript
// Response
{ voices: string[] }  // Available macOS voices
```

## MCP Tools

### configure_voice

```typescript
{
  name: 'configure_voice',
  description: 'Configure voice output settings',
  parameters: {
    enabled?: boolean;
    voice?: string;
    rate?: number;
    events?: Partial<VoiceConfig['events']>;
    quietHours?: Partial<QuietHoursConfig>;
  }
}
```

### test_voice

```typescript
{
  name: 'test_voice',
  description: 'Test voice output with optional custom text',
  parameters: {
    text?: string;  // Default: "Voice test successful"
  }
}
```

### get_voice_status

```typescript
{
  name: 'get_voice_status',
  description: 'Get current voice output status',
  parameters: {}
}
```

### list_voices

```typescript
{
  name: 'list_voices',
  description: 'List available macOS voices',
  parameters: {}
}
```

## File Structure

```
src/services/voice/
├── VoiceOutputService.ts    # Main service
├── MacOSTTS.ts              # macOS say wrapper
├── SpeechQueue.ts           # Priority queue
├── QuietHoursManager.ts     # Time-based filtering
├── EventFormatter.ts        # Event→speech conversion
├── types.ts                 # VoiceConfig, VoiceStatus
└── index.ts                 # Exports

src/services/proactive-messaging/adapters/
└── VoiceAdapter.ts          # ChannelAdapter implementation

src/tools/
└── voiceTools.ts            # MCP tool handlers

src/server/routes/
└── voice.ts                 # HTTP API endpoints
```

## Integration with ProactiveMessagingService

### Adapter Registration

In `ProactiveMessagingService.ts`:

```typescript
async initialize(): Promise<void> {
  // ... existing adapters ...

  // Voice adapter
  if (this.config.channels.voice?.enabled) {
    const voiceAdapter = new VoiceAdapter(this.config.channels.voice);
    await voiceAdapter.initialize();
    this.adapters.push(voiceAdapter);
  }
}
```

### Config Extension

```typescript
interface ProactiveMessagingConfig {
  channels: {
    terminal?: TerminalChannelConfig;
    slack?: SlackChannelConfig;
    voice?: VoiceChannelConfig;  // New
  };
}
```

## Error Handling

1. **TTS Command Not Found**: Log warning, disable voice, continue silently
2. **Invalid Voice**: Fall back to default voice
3. **Queue Full**: Drop oldest non-urgent items (max queue size: 10)
4. **Speak Timeout**: Kill process after 30 seconds, log error, continue

## Platform Considerations

- **macOS Only**: The `say` command is macOS-specific
- **Cross-Platform Future**: Could add espeak for Linux, SAPI for Windows
- **Detection**: Check `process.platform === 'darwin'` before enabling

## Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| First word latency | <100ms | Time from speak() call to audio start |
| Queue processing | <10ms | Time to dequeue and start next item |
| Memory footprint | <5MB | VoiceOutputService heap usage |
| CPU during speech | <5% | During active TTS |
