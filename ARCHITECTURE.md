# Orchestrator - Architecture

## System Overview

This document covers the architectural design for various Orchestrator modules.

## Components

The Orchestrator consists of several key modules:
- **OODA Clocks**: Gamelan-inspired circular visualization for loop execution timing
- **Voice Module**: Text-to-speech output for hands-free notifications
- **ProactiveMessaging**: Multi-channel notification system (Terminal, Slack, Voice)

---

# OODA Clocks Module

## Overview

The OODA Clocks module provides a Gamelan-inspired circular visualization for loop execution timing. It consists of a backend service for event processing and frontend React components for rendering.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Dashboard (Next.js)                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    /ooda-clock page                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │
│  │  │ OODAClock   │  │ ClockFace   │  │ PlaybackControls│  │    │
│  │  │ (container) │──│ (SVG)       │  │                 │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │    │
│  │         │              │                    │            │    │
│  │         ▼              ▼                    ▼            │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │
│  │  │EventMarker[]│  │ EventArc[]  │  │  ClockLegend    │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ fetch / SSE                       │
│                              ▼                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                     Orchestrator Server                          │
│                              │                                   │
│  ┌───────────────────────────┼───────────────────────────────┐  │
│  │                  HTTP Server                               │  │
│  │  GET /api/ooda-clock/executions                           │  │
│  │  GET /api/ooda-clock/executions/:id/events                │  │
│  │  GET /api/executions/:id/stream (SSE)                     │  │
│  └───────────────────────────┼───────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┼───────────────────────────────┐  │
│  │               OODAClockService                             │  │
│  │  ┌─────────────────┐  ┌─────────────────┐                 │  │
│  │  │ processLogs()   │  │ RhythmAnalyzer  │                 │  │
│  │  │ mapToQuadrant() │  │ detectPatterns()│                 │  │
│  │  └─────────────────┘  └─────────────────┘                 │  │
│  └───────────────────────────┼───────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┼───────────────────────────────┐  │
│  │              ExecutionEngine                               │  │
│  │  - logs: ExecutionLogEntry[]                              │  │
│  │  - SSE stream                                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Component Design

### Backend: OODAClockService

**Responsibility**: Transform execution logs into clock-renderable events.

```typescript
// Core types
interface ClockEvent {
  id: string;
  type: 'skill' | 'pattern' | 'gate' | 'phase';
  name: string;
  startAngle: number;      // 0-360 degrees
  endAngle?: number;       // For duration arcs
  radius: 'inner' | 'middle' | 'outer';
  color: string;
  timestamp: Date;
  duration?: number;
  status: 'pending' | 'active' | 'complete' | 'failed';
}

// Phase to quadrant mapping
const PHASE_QUADRANTS: Record<Phase, { start: number; end: number }> = {
  INIT: { start: 0, end: 90 },
  SCAFFOLD: { start: 90, end: 135 },
  IMPLEMENT: { start: 135, end: 180 },
  TEST: { start: 180, end: 210 },
  VERIFY: { start: 210, end: 240 },
  VALIDATE: { start: 240, end: 270 },
  DOCUMENT: { start: 270, end: 300 },
  REVIEW: { start: 300, end: 330 },
  SHIP: { start: 330, end: 350 },
  COMPLETE: { start: 350, end: 360 },
};
```

### Backend: RhythmAnalyzer

**Responsibility**: Detect recurring patterns in event sequences.

```typescript
interface RhythmPattern {
  name: string;
  events: string[];        // Sequence of event types
  averageDuration: number;
  frequency: number;       // Times observed
  confidence: number;      // 0-1
}
```

### Frontend: ClockFace (SVG)

**Responsibility**: Render the circular clock face with quadrant divisions.

**SVG Structure**:
```svg
<svg viewBox="0 0 400 400">
  <!-- Background circle -->
  <circle cx="200" cy="200" r="180" class="clock-bg" />

  <!-- Quadrant dividers -->
  <line x1="200" y1="20" x2="200" y2="380" class="divider" />
  <line x1="20" y1="200" x2="380" y2="200" class="divider" />

  <!-- Phase labels -->
  <text x="300" y="100">OBSERVE</text>
  <text x="300" y="300">ORIENT</text>
  <text x="100" y="300">DECIDE</text>
  <text x="100" y="100">ACT</text>

  <!-- Event layer groups -->
  <g id="gate-layer" />    <!-- r=170 -->
  <g id="pattern-layer" /> <!-- r=140 -->
  <g id="skill-layer" />   <!-- r=110 -->

  <!-- Center phase indicator -->
  <text x="200" y="200" class="current-phase" />
</svg>
```

### Frontend: EventMarker

**Responsibility**: Render individual events at their angular position.

**Positioning Math**:
```typescript
function getPosition(angle: number, radius: number, center: number) {
  // Convert to radians, offset by -90° so 0° is at top
  const radians = (angle - 90) * (Math.PI / 180);
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  };
}
```

### Frontend: EventArc

**Responsibility**: Render duration arcs for events with timing.

**SVG Arc Path**:
```typescript
function arcPath(startAngle: number, endAngle: number, radius: number) {
  const start = getPosition(startAngle, radius, 200);
  const end = getPosition(endAngle, radius, 200);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}
```

## Data Flow

### Live Mode

```
1. User opens /ooda-clock/[executionId]
2. Component connects to SSE: /api/executions/:id/stream
3. Each SSE event:
   a. Parse ExecutionLogEntry
   b. Call OODAClockService.processLog()
   c. Receive ClockEvent
   d. Add to React state
   e. Render new EventMarker with animation
```

### Playback Mode

```
1. User clicks "Playback" on completed execution
2. Fetch all logs: GET /api/ooda-clock/executions/:id/events
3. Sort by timestamp
4. Start requestAnimationFrame loop:
   a. Calculate elapsed time × playback speed
   b. Filter events up to current time
   c. Update clock angle indicator
   d. Render visible events
```

## State Management

```typescript
// React state in OODAClock component
interface ClockState {
  // Data
  events: ClockEvent[];
  execution: LoopExecution | null;

  // View state
  currentAngle: number;
  selectedEvent: ClockEvent | null;

  // Mode
  isLive: boolean;
  isPlaying: boolean;
  playbackSpeed: number;
  playbackPosition: number; // 0-1
}

// Actions
type ClockAction =
  | { type: 'ADD_EVENT'; event: ClockEvent }
  | { type: 'SET_EVENTS'; events: ClockEvent[] }
  | { type: 'SELECT_EVENT'; event: ClockEvent | null }
  | { type: 'SET_PLAYBACK_SPEED'; speed: number }
  | { type: 'SEEK'; position: number }
  | { type: 'TOGGLE_PLAY' };
```

## API Endpoints

### GET /api/ooda-clock/executions

List active executions suitable for clock display.

```typescript
// Response
{
  executions: Array<{
    id: string;
    loopId: string;
    project: string;
    status: ExecutionStatus;
    currentPhase: Phase;
    eventCount: number;
    startedAt: string;
  }>;
}
```

### GET /api/ooda-clock/executions/:id/events

Get all clock events for an execution.

```typescript
// Response
{
  execution: {
    id: string;
    loopId: string;
    startedAt: string;
    completedAt?: string;
  };
  events: ClockEvent[];
  rhythmPatterns: RhythmPattern[];
}
```

## Animation Strategy

### New Event Animation

```css
@keyframes event-appear {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.event-marker.new {
  animation: event-appear 200ms ease-out;
}
```

### Active Event Pulse

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

.event-marker.active {
  animation: pulse 1s infinite;
}
```

### Arc Growth

```typescript
// Animate stroke-dashoffset for growing arc
function animateArc(element: SVGPathElement, duration: number) {
  const length = element.getTotalLength();
  element.style.strokeDasharray = `${length}`;
  element.style.strokeDashoffset = `${length}`;

  element.animate(
    [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
    { duration, easing: 'linear', fill: 'forwards' }
  );
}
```

## Performance Considerations

1. **Event Virtualization**: Only render events within viewport time window
2. **Canvas Fallback**: Switch to canvas for >200 events
3. **Debounced Updates**: Batch rapid SSE events (16ms window)
4. **Memoization**: Memoize position calculations
5. **CSS Transforms**: Use transform for positioning (GPU accelerated)

## Accessibility

1. **Keyboard Navigation**: Arrow keys to select events, Enter for details
2. **Screen Reader**: Announce new events, current phase
3. **High Contrast**: Support forced-colors media query
4. **Reduced Motion**: Respect prefers-reduced-motion

## File Structure

```
src/services/ooda-clock/
├── OODAClockService.ts     # Main service
├── RhythmAnalyzer.ts       # Pattern detection
├── types.ts                # ClockEvent, RhythmPattern
└── index.ts                # Exports

src/tools/
└── oodaClockTools.ts       # MCP tools

apps/dashboard/
├── app/ooda-clock/
│   ├── page.tsx            # Execution list
│   └── [executionId]/
│       └── page.tsx        # Single clock view
└── components/ooda-clock/
    ├── OODAClock.tsx       # Container
    ├── ClockFace.tsx       # SVG base
    ├── EventMarker.tsx     # Event dot
    ├── EventArc.tsx        # Duration arc
    ├── PhaseQuadrant.tsx   # Quadrant overlay
    ├── PlaybackControls.tsx# Replay UI
    └── ClockLegend.tsx     # Legend
```

## Integration Points

| Component | Integration |
|-----------|-------------|
| ExecutionEngine | Source of logs, SSE stream |
| HTTP Server | New API endpoints |
| Dashboard Layout | Nav link to /ooda-clock |
| MCP Tools | get_clock_events, get_rhythm_patterns |

---

# Voice Module

## Overview

The Voice Module adds text-to-speech (TTS) output capabilities to the Orchestrator, enabling hands-free interaction during driving, jogging, or quick capture scenarios.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ProactiveMessagingService                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────────┐  │
│  │ Terminal    │  │ Slack       │  │ Voice                           │  │
│  │ Adapter     │  │ Adapter     │  │ Adapter                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          VoiceOutputService                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐ │
│  │ EventFormatter │  │ SpeechQueue    │  │ QuietHoursManager          │ │
│  └────────────────┘  └────────────────┘  └────────────────────────────┘ │
│                              │                                           │
│                              ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      macOS TTS Engine                              │  │
│  │                   child_process.spawn('say')                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Components

| Component | Responsibility |
|-----------|----------------|
| VoiceAdapter | Implements ChannelAdapter, routes messages to VoiceOutputService |
| VoiceOutputService | Core service managing TTS output and queue |
| SpeechQueue | Priority-based queue (urgent messages go first) |
| QuietHoursManager | Time-based filtering with urgent bypass |
| EventFormatter | Converts notifications to speech-friendly text |
| MacOSTTS | Wrapper around macOS `say` command |

## Design Decisions

See `docs/adr/ADR-001-voice-output-macos-tts.md` for the decision to use macOS native TTS.

Key trade-offs:
- **macOS only**: Acceptable for local-first development tool
- **Sub-100ms latency**: Native CoreAudio integration
- **No cloud dependency**: Works offline, no API keys

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
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/voice/status | GET | Current voice status |
| /api/voice/config | GET/PUT | Voice configuration |
| /api/voice/test | POST | Test voice output |
| /api/voice/voices | GET | Available macOS voices |

## MCP Tools

| Tool | Purpose |
|------|---------|
| configure_voice | Set voice, rate, event filtering |
| test_voice | Test TTS with custom text |
| get_voice_status | Get queue length, speaking state |
| list_voices | Available system voices |
