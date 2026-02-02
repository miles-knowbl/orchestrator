# Feature Specification: Voice Module

> Comprehensive specification for voice output and integration in orchestrator.

## Feature Overview

The voice module adds text-to-speech output capabilities to the orchestrator, enabling hands-free interaction during driving, jogging, or quick capture scenarios. It integrates with the existing ProactiveMessagingService as a new adapter.

## Goals

| Goal | Priority | Success Indicator |
|------|----------|-------------------|
| Hands-free notification delivery | P0 | All proactive messages can be spoken |
| Sub-100ms latency | P0 | Speech starts within 100ms of event |
| Offline-first | P0 | Works without internet connection |
| Clean integration | P1 | No changes to existing adapters |
| Configurable verbosity | P1 | Per-event and global controls |

## Non-Goals

- Speech-to-text (user has Wispr Flow)
- Cross-platform support (macOS only)
- Cloud TTS integration (latency constraint)
- Voice wake word detection
- Conversational AI interface

## Architecture Overview

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ProactiveMessagingService                           │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  Terminal   │  │    Slack    │  │    Voice    │  │   (future)  │   │
│  │   Adapter   │  │   Adapter   │  │   Adapter   │  │   adapters  │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────────────┘   │
└─────────┼────────────────┼────────────────┼─────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
      Console         Slack API       VoiceOutputService
                                            │
                                            ▼
                                     macOS `say` command
```

### File Structure

```
src/services/proactive-messaging/
├── adapters/
│   ├── TerminalAdapter.ts     (existing)
│   ├── SlackAdapter.ts        (existing)
│   └── VoiceAdapter.ts        (new)
├── VoiceOutputService.ts      (new)
├── types.ts                   (extend with voice config)
└── ProactiveMessagingService.ts (register voice adapter)
```

## Data Models

### VoiceConfig

```typescript
interface VoiceConfig {
  enabled: boolean;
  voice?: string;           // macOS voice name (e.g., "Samantha", "Alex")
  rate?: number;            // Words per minute (default: 200)
  volume?: number;          // 0.0-1.0 (default: 1.0)
  quietHours?: {
    enabled: boolean;
    start: string;          // "23:00"
    end: string;            // "07:00"
  };
  eventFilters?: {
    gate_waiting: boolean;
    loop_complete: boolean;
    error: boolean;
    deck_ready: boolean;
    dream_proposals: boolean;
    executor_blocked: boolean;
    skill_complete: boolean;
    phase_complete: boolean;
  };
  urgentEvents?: string[];  // Events that bypass quiet hours
}
```

### Extended ProactiveMessagingConfig

```typescript
interface ProactiveMessagingConfig {
  channels: {
    terminal: TerminalConfig;
    slack: SlackConfig;
    voice: VoiceConfig;      // New
  };
}
```

### SpeechQueueItem

```typescript
interface SpeechQueueItem {
  id: string;
  text: string;
  priority: 'normal' | 'urgent';
  timestamp: Date;
  eventType: string;
}
```

## API Design

### VoiceOutputService

```typescript
class VoiceOutputService {
  constructor(config: VoiceConfig);

  // Core methods
  speak(text: string, priority?: 'normal' | 'urgent'): Promise<void>;
  stop(): void;
  getQueueLength(): number;

  // Configuration
  updateConfig(config: Partial<VoiceConfig>): void;
  isQuietHours(): boolean;

  // Status
  isSpeaking(): boolean;
  getStatus(): VoiceStatus;
}
```

### VoiceAdapter

```typescript
class VoiceAdapter implements MessageAdapter {
  constructor(service: VoiceOutputService);

  // Adapter interface
  notify(event: NotificationEvent): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getStatus(): AdapterStatus;

  // Voice-specific
  formatForSpeech(event: NotificationEvent): string;
}
```

## Event Formatting

### Format Templates

| Event Type | Spoken Format |
|------------|---------------|
| gate_waiting | "Gate {gateName} waiting for approval on {project}" |
| loop_complete | "{loopName} complete for {project}. Duration: {duration}" |
| error | "Error in {project}: {summary}" |
| deck_ready | "{count} cards ready for review" |
| dream_proposals | "{count} proposals ready for review" |
| executor_blocked | "Execution blocked: {reason}" |
| skill_complete | "Skill {skillName} complete" |
| phase_complete | "Phase {phaseName} complete. Next: {nextPhase}" |

### Formatting Rules

1. **Strip markdown**: Remove `#`, `*`, `` ` ``, etc.
2. **Truncate long text**: Max 200 words for spoken output
3. **Simplify numbers**: "47 tests" not "47/47 passing"
4. **Remove emojis**: They don't speak well
5. **Expand abbreviations**: "PR" → "pull request" (optional)

## Configuration File

Location: `data/proactive-messaging/proactive-messaging-config.json`

```json
{
  "channels": {
    "terminal": { "enabled": true },
    "slack": {
      "enabled": true,
      "botToken": "xoxb-...",
      "channelId": "C0XXXXXXX"
    },
    "voice": {
      "enabled": true,
      "voice": "Samantha",
      "rate": 200,
      "quietHours": {
        "enabled": true,
        "start": "23:00",
        "end": "07:00"
      },
      "eventFilters": {
        "gate_waiting": true,
        "loop_complete": true,
        "error": true,
        "deck_ready": true,
        "dream_proposals": true,
        "executor_blocked": true,
        "skill_complete": false,
        "phase_complete": false
      },
      "urgentEvents": ["error", "executor_blocked"]
    }
  }
}
```

## Implementation Plan

### Phase 1: Core Service (Day 1)
1. Create `VoiceOutputService.ts`
   - `say` command execution via child_process
   - Speech queue with priority
   - Quiet hours checking
2. Add unit tests for VoiceOutputService

### Phase 2: Adapter Integration (Day 1)
3. Create `VoiceAdapter.ts`
   - Implement MessageAdapter interface
   - Event formatting logic
4. Register VoiceAdapter in ProactiveMessagingService
5. Update types.ts with VoiceConfig

### Phase 3: Configuration (Day 1)
6. Update config schema
7. Add voice config to default config
8. Test configuration loading

### Phase 4: Testing (Day 2)
9. Integration tests
10. Manual testing on macOS
11. Edge cases (long text, special characters)

## MCP Tools

### New Tools

| Tool | Purpose |
|------|---------|
| `configure_voice` | Enable/disable and configure voice output |
| `test_voice` | Speak a test message |
| `get_voice_status` | Get voice adapter status |

### Tool Definitions

```typescript
// configure_voice
{
  enabled: boolean;
  voice?: string;
  rate?: number;
  quietHours?: { enabled: boolean; start: string; end: string };
  eventFilters?: Record<string, boolean>;
}

// test_voice
{
  message: string;
  voice?: string;
}

// get_voice_status
{} // No parameters
```

## API Endpoints

### New Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/voice/config` | GET | Get voice configuration |
| `/api/voice/config` | PUT | Update voice configuration |
| `/api/voice/status` | GET | Get voice adapter status |
| `/api/voice/test` | POST | Speak a test message |

## Test Scenarios

### Unit Tests
- VoiceOutputService: queue management, quiet hours, config updates
- VoiceAdapter: event formatting, filter logic

### Integration Tests
- Full flow: event → ProactiveMessagingService → VoiceAdapter → say command
- Configuration persistence and reload

### Manual Tests
- Verify actual speech output on macOS
- Test quiet hours boundary conditions
- Test urgent event bypass

### Security Tests
1. Command injection via text input prevented
2. Configuration file tampering detected
3. No unauthorized speech in shared environments (quiet hours)

### Concurrency Tests
1. Rapid events queued properly (no overlapping speech)
2. Stop command interrupts current speech
3. Queue handles high volume without memory leak

### Failure Mode Tests
1. `say` command not available handled gracefully
2. Invalid voice name defaults to system voice
3. Malformed event data doesn't crash adapter

### Load Tests
1. 100 events queued in rapid succession handled
2. Long-running speech doesn't block event processing
3. Queue depth stays bounded under continuous load

## Security Considerations

| Consideration | Mitigation |
|---------------|------------|
| Command injection via text | Sanitize input, use spawn with array args |
| Audio output in shared spaces | Quiet hours, event filters |
| Configuration tampering | File permissions on config |

## Migration Plan

1. Voice adapter is additive — no migration needed
2. Default config includes voice disabled
3. Users opt-in via configuration

## Rollback Plan

1. Set `voice.enabled = false` in config
2. Adapter gracefully does nothing when disabled
3. No changes to existing adapters

## Metrics & Monitoring

| Metric | Purpose |
|--------|---------|
| Events spoken | Track usage |
| Queue depth | Detect backlog |
| Speech failures | Detect issues with `say` command |
| Quiet hours bypasses | Track urgent event frequency |

## Future Considerations

1. **Alternative TTS engines**: espeak for Linux, SAPI for Windows
2. **Voice profiles**: Different voices for different event types
3. **Audio ducking**: Lower other audio during speech
4. **Speech-to-text integration**: Direct STT without Wispr Flow
5. **AirPods detection**: Auto-enable when AirPods connected

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| child_process | Node.js built-in | Execute `say` command |
| ProactiveMessagingService | Existing | Parent service |
| MessageFormatter | Existing | Text formatting utilities |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `say` command not available | Low | High | Check at startup, graceful disable |
| Speech queue overflow | Low | Medium | Max queue size, drop oldest |
| Quiet hours misconfiguration | Medium | Low | Validate config, sensible defaults |
| Overlapping speech | Medium | Medium | Queue management, stop() method |

## Acceptance Criteria

1. [ ] `VoiceOutputService` speaks text via macOS `say`
2. [ ] `VoiceAdapter` receives all notification events
3. [ ] Event formatting produces natural spoken text
4. [ ] Quiet hours prevents non-urgent speech
5. [ ] Configuration is persisted and reloaded
6. [ ] 3 MCP tools operational (configure_voice, test_voice, get_voice_status)
7. [ ] 4 API endpoints operational
8. [ ] Unit tests pass (>80% coverage)
9. [ ] Integration with ProactiveMessagingService is seamless
