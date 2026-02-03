# Requirements: Voice Module

> Voice input/output for piloting the orchestrator hands-free. Completes Layer 3 interface capabilities.

## Problem Statement

Users need to interact with the orchestrator in hands-free contexts (driving, jogging, quick capture) where they cannot use a keyboard or look at a screen. Currently, the orchestrator requires visual interaction via terminal or Slack text.

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Speech latency** | <100ms to start speaking | Time from event trigger to first audio |
| **Event coverage** | 100% of proactive messages | All notification types can be spoken |
| **Offline capability** | Works without internet | TTS functions when disconnected |
| **Integration** | Zero changes to existing adapters | Voice is additive, not intrusive |
| **Configuration** | Per-event and global controls | Users can customize verbosity |

## Functional Requirements

### FR-1: Voice Output Service
- **FR-1.1**: Speak text using macOS `say` command
- **FR-1.2**: Configurable voice (default: system default)
- **FR-1.3**: Configurable speech rate (default: 200 words/min)
- **FR-1.4**: Queue management to prevent overlapping speech
- **FR-1.5**: Format messages for spoken delivery (strip markdown, simplify)

### FR-2: Voice Adapter for ProactiveMessagingService
- **FR-2.1**: Implement Adapter interface (notify, connect, disconnect, getStatus)
- **FR-2.2**: Receive all notification events from ProactiveMessagingService
- **FR-2.3**: Format events into speakable text
- **FR-2.4**: Route to VoiceOutputService for TTS

### FR-3: Voice Configuration
- **FR-3.1**: Global enable/disable for voice output
- **FR-3.2**: Per-event-type enable/disable (gate_waiting, loop_complete, error, etc.)
- **FR-3.3**: Quiet hours configuration (e.g., 11pm-7am)
- **FR-3.4**: Urgent events bypass quiet hours
- **FR-3.5**: Configuration persisted to proactive-messaging-config.json

### FR-4: Event Formatting
- **FR-4.1**: Gate waiting: "Gate [name] waiting for approval on [project]"
- **FR-4.2**: Loop complete: "[loop] complete for [project]"
- **FR-4.3**: Error: "Error in [project]: [summary]"
- **FR-4.4**: Deck ready: "[count] cards ready for review"
- **FR-4.5**: Generic: Truncate long messages, summarize key points

### FR-5: Natural Language Command Enhancement (Optional)
- **FR-5.1**: Extend SlackCommandParser for voice-friendly phrasing
- **FR-5.2**: Support: "approve the gate", "what's the status", "start the next loop"
- **FR-5.3**: Fuzzy matching for common variations

## Non-Functional Requirements

### NFR-1: Performance
- Speech must start within 100ms of event trigger
- No blocking of main event loop during speech
- Speech queue should not grow unbounded

### NFR-2: Reliability
- Graceful degradation if `say` command unavailable
- No crashes on malformed input
- Works on macOS only (acceptable constraint)

### NFR-3: Privacy
- All TTS is local (macOS `say`)
- No audio data leaves the machine
- No cloud TTS APIs required

### NFR-4: Maintainability
- Follows existing adapter pattern in ProactiveMessagingService
- Type-safe with full TypeScript types
- Test coverage for core functionality

## Constraints

| Constraint | Rationale |
|------------|-----------|
| macOS only | `say` command is macOS-specific; acceptable for personal use |
| No cloud TTS | Latency requirement (<100ms) cannot be met with cloud TTS |
| Wispr Flow for input | User already has STT; we focus on output + integration |

## Out of Scope

- Speech-to-text (handled by Wispr Flow)
- Cross-platform TTS (Windows/Linux)
- Voice wake word detection
- Real-time conversation mode
- Multi-language TTS

## Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| ProactiveMessagingService | Parent service for adapters | Complete |
| MessageFormatter | Message formatting utilities | Complete |
| macOS `say` command | TTS engine | System built-in |

## Acceptance Criteria

1. [ ] VoiceOutputService can speak any text string
2. [ ] VoiceAdapter receives and speaks all proactive notification types
3. [ ] Configuration allows per-event-type control
4. [ ] Quiet hours prevent non-urgent speech
5. [ ] Speech queue prevents overlapping audio
6. [ ] All tests pass
7. [ ] Integration with existing ProactiveMessagingService is seamless
