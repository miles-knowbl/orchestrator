'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import OODAClock from '../../../components/ooda-clock/OODAClock';
import PlaybackControls from '../../../components/ooda-clock/PlaybackControls';
import ClockLegend from '../../../components/ooda-clock/ClockLegend';

interface ClockEvent {
  id: string;
  type: 'skill' | 'pattern' | 'gate' | 'phase';
  name: string;
  startAngle: number;
  endAngle?: number;
  radius: 'inner' | 'middle' | 'outer';
  color: string;
  timestamp: string;
  duration?: number;
  status: 'pending' | 'active' | 'complete' | 'failed';
}

interface ExecutionData {
  id: string;
  loopId: string;
  project: string;
  status: string;
  currentPhase: string;
  startedAt: string;
  completedAt?: string;
}

interface RhythmPattern {
  id: string;
  name: string;
  events: string[];
  averageDuration: number;
  frequency: number;
  confidence: number;
}

export default function ExecutionClockPage() {
  const params = useParams();
  const executionId = params.executionId as string;

  const [execution, setExecution] = useState<ExecutionData | null>(null);
  const [events, setEvents] = useState<ClockEvent[]>([]);
  const [patterns, setPatterns] = useState<RhythmPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Playback state
  const [isLive, setIsLive] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<ClockEvent | null>(null);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:3002/api/executions/${executionId}`);
        if (!res.ok) {
          throw new Error('Execution not found');
        }
        const data = await res.json();

        setExecution({
          id: data.id,
          loopId: data.loopId,
          project: data.project,
          status: data.status,
          currentPhase: data.currentPhase,
          startedAt: data.startedAt,
          completedAt: data.completedAt,
        });

        // Transform logs to clock events
        const clockEvents = transformLogsToEvents(data.logs || []);
        setEvents(clockEvents);

        // Analyze patterns
        const detectedPatterns = analyzePatterns(clockEvents);
        setPatterns(detectedPatterns);

        // If completed, disable live mode
        if (data.status === 'completed' || data.status === 'failed') {
          setIsLive(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load execution');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [executionId]);

  // SSE connection for live updates
  useEffect(() => {
    if (!isLive || !execution || execution.status !== 'active') {
      return;
    }

    const eventSource = new EventSource(
      `http://localhost:3002/api/executions/${executionId}/stream`
    );

    eventSource.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data);
        const clockEvent = transformLogToEvent(log);
        if (clockEvent) {
          setEvents(prev => [...prev, clockEvent]);
        }
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [executionId, isLive, execution]);

  const handleSeek = useCallback((position: number) => {
    setPlaybackPosition(position);
    setIsLive(false);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
    if (isLive) setIsLive(false);
  }, [isLive]);

  const handleGoLive = useCallback(() => {
    setIsLive(true);
    setIsPlaying(false);
    setPlaybackPosition(1);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-gray-400">Loading execution...</div>
      </div>
    );
  }

  if (error || !execution) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-red-400 mb-4">{error || 'Execution not found'}</div>
        <Link href="/ooda-clock" className="text-emerald-400 hover:underline">
          ← Back to executions
        </Link>
      </div>
    );
  }

  // Filter events based on playback position
  const visibleEvents = isLive
    ? events
    : events.filter((_, i) => i < Math.ceil(events.length * playbackPosition));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/ooda-clock" className="text-gray-400 hover:text-white text-sm mb-2 inline-block">
          ← Back to executions
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{execution.loopId}</h1>
            <p className="text-gray-400">{execution.project}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              execution.status === 'active' ? 'bg-green-900/50 text-green-400' :
              execution.status === 'completed' ? 'bg-blue-900/50 text-blue-400' :
              execution.status === 'failed' ? 'bg-red-900/50 text-red-400' :
              'bg-gray-800 text-gray-400'
            }`}>
              {execution.status}
            </span>
            {execution.status === 'active' && !isLive && (
              <button
                onClick={handleGoLive}
                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
              >
                Go Live
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Clock visualization */}
        <div className="lg:col-span-2">
          <div className="bg-[#111] border border-[#222] rounded-lg p-6">
            <OODAClock
              events={visibleEvents}
              currentPhase={execution.currentPhase}
              isLive={isLive}
              selectedEvent={selectedEvent}
              onEventSelect={setSelectedEvent}
            />

            {/* Playback controls */}
            {events.length > 0 && (
              <PlaybackControls
                isPlaying={isPlaying}
                isLive={isLive}
                speed={playbackSpeed}
                position={playbackPosition}
                totalEvents={events.length}
                onPlayPause={handlePlayPause}
                onSeek={handleSeek}
                onSpeedChange={handleSpeedChange}
                onGoLive={handleGoLive}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Legend */}
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Legend</h3>
            <ClockLegend />
          </div>

          {/* Selected event details */}
          {selectedEvent && (
            <div className="bg-[#111] border border-[#222] rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Event Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="text-white">{selectedEvent.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Name</dt>
                  <dd className="text-white">{selectedEvent.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Status</dt>
                  <dd className="text-white">{selectedEvent.status}</dd>
                </div>
                {selectedEvent.duration && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Duration</dt>
                    <dd className="text-white">{(selectedEvent.duration / 1000).toFixed(1)}s</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Time</dt>
                  <dd className="text-white">
                    {new Date(selectedEvent.timestamp).toLocaleTimeString()}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Rhythm patterns */}
          {patterns.length > 0 && (
            <div className="bg-[#111] border border-[#222] rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Detected Patterns</h3>
              <ul className="space-y-2">
                {patterns.slice(0, 5).map(pattern => (
                  <li key={pattern.id} className="text-sm">
                    <div className="text-gray-300">{pattern.name}</div>
                    <div className="text-gray-500 text-xs">
                      {pattern.frequency}x, {(pattern.confidence * 100).toFixed(0)}% confidence
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stats */}
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Statistics</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Total Events</dt>
                <dd className="text-white">{events.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Skills</dt>
                <dd className="text-white">{events.filter(e => e.type === 'skill').length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Gates</dt>
                <dd className="text-white">{events.filter(e => e.type === 'gate').length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Current Phase</dt>
                <dd className="text-white">{execution.currentPhase}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions

function transformLogsToEvents(logs: any[]): ClockEvent[] {
  return logs
    .filter(log => ['skill', 'gate', 'phase'].includes(log.category))
    .map(log => transformLogToEvent(log))
    .filter((e): e is ClockEvent => e !== null);
}

function transformLogToEvent(log: any): ClockEvent | null {
  if (!['skill', 'gate', 'phase'].includes(log.category)) {
    return null;
  }

  const phaseAngles: Record<string, { start: number; end: number }> = {
    INIT: { start: 270, end: 360 },
    SCAFFOLD: { start: 0, end: 90 },
    IMPLEMENT: { start: 90, end: 135 },
    TEST: { start: 135, end: 180 },
    VERIFY: { start: 180, end: 200 },
    VALIDATE: { start: 200, end: 220 },
    DOCUMENT: { start: 220, end: 240 },
    REVIEW: { start: 240, end: 255 },
    SHIP: { start: 255, end: 265 },
    COMPLETE: { start: 265, end: 270 },
  };

  const phase = log.phase || 'INIT';
  const angles = phaseAngles[phase] || { start: 0, end: 90 };
  const angle = (angles.start + angles.end) / 2;

  const colors: Record<string, string> = {
    skill: '#10b981',
    gate: '#f59e0b',
    phase: '#8b5cf6',
    pattern: '#0ea5e9',
  };

  return {
    id: log.id || Math.random().toString(36).slice(2),
    type: log.category as ClockEvent['type'],
    name: log.skillId || log.gateId || log.phase || log.message?.substring(0, 30),
    startAngle: normalizeAngle(angle),
    radius: log.category === 'gate' ? 'outer' : log.category === 'phase' ? 'middle' : 'inner',
    color: log.level === 'error' ? '#ef4444' : colors[log.category] || '#10b981',
    timestamp: log.timestamp,
    duration: log.durationMs,
    status: getEventStatus(log),
  };
}

function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

function getEventStatus(log: any): ClockEvent['status'] {
  if (log.level === 'error') return 'failed';
  const msg = (log.message || '').toLowerCase();
  if (msg.includes('complete') || msg.includes('passed') || msg.includes('approved')) {
    return 'complete';
  }
  if (msg.includes('start') || msg.includes('begin') || msg.includes('running')) {
    return 'active';
  }
  return 'pending';
}

function analyzePatterns(events: ClockEvent[]): RhythmPattern[] {
  if (events.length < 3) return [];

  const patterns: RhythmPattern[] = [];
  const typeSeq = events.map(e => e.type);

  // Simple pattern detection: look for repeating pairs
  const pairCounts = new Map<string, number>();
  for (let i = 0; i < typeSeq.length - 1; i++) {
    const pair = `${typeSeq[i]}→${typeSeq[i + 1]}`;
    pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
  }

  for (const [pair, count] of pairCounts) {
    if (count >= 2) {
      patterns.push({
        id: Math.random().toString(36).slice(2),
        name: `Sequence: ${pair}`,
        events: pair.split('→'),
        averageDuration: 0,
        frequency: count,
        confidence: Math.min(count / events.length, 1),
      });
    }
  }

  return patterns.sort((a, b) => b.frequency - a.frequency).slice(0, 5);
}
