'use client';

import { useMemo } from 'react';
import ClockFace from './ClockFace';
import EventMarker from './EventMarker';
import EventArc from './EventArc';

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

interface OODAClockProps {
  events: ClockEvent[];
  currentPhase: string;
  isLive?: boolean;
  selectedEvent?: ClockEvent | null;
  onEventSelect?: (event: ClockEvent | null) => void;
  size?: number;
}

const LAYER_RADII = {
  inner: 0.55,
  middle: 0.70,
  outer: 0.85,
};

export default function OODAClock({
  events,
  currentPhase,
  isLive = false,
  selectedEvent = null,
  onEventSelect,
  size = 400,
}: OODAClockProps) {
  const center = size / 2;
  const baseRadius = size * 0.45;

  // Group events by their position to handle overlapping
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, ClockEvent[]>();

    events.forEach(event => {
      // Round angle to 5-degree increments for grouping
      const angleKey = Math.round(event.startAngle / 5) * 5;
      const key = `${event.radius}-${angleKey}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(event);
    });

    return groups;
  }, [events]);

  // Calculate position for an event, with offset for overlapping events
  const getEventPosition = (event: ClockEvent, groupIndex: number, groupSize: number) => {
    const radius = baseRadius * LAYER_RADII[event.radius];
    const radians = (event.startAngle - 90) * (Math.PI / 180);

    // Offset overlapping events radially
    const radiusOffset = groupSize > 1 ? (groupIndex - (groupSize - 1) / 2) * 8 : 0;
    const adjustedRadius = radius + radiusOffset;

    return {
      x: center + adjustedRadius * Math.cos(radians),
      y: center + adjustedRadius * Math.sin(radians),
    };
  };

  return (
    <div className="relative" style={{ width: size, height: size, margin: '0 auto' }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Clock face background */}
        <ClockFace size={size} currentPhase={currentPhase} />

        {/* Event arcs (for events with duration) */}
        {events
          .filter(e => e.endAngle !== undefined)
          .map(event => (
            <EventArc
              key={`arc-${event.id}`}
              event={event}
              center={center}
              radius={baseRadius * LAYER_RADII[event.radius]}
            />
          ))}

        {/* Event markers */}
        {Array.from(groupedEvents.entries()).map(([key, group]) =>
          group.map((event, i) => {
            const pos = getEventPosition(event, i, group.length);
            return (
              <EventMarker
                key={event.id}
                event={event}
                x={pos.x}
                y={pos.y}
                isSelected={selectedEvent?.id === event.id}
                isNew={isLive && events.indexOf(event) === events.length - 1}
                onClick={() => onEventSelect?.(event)}
              />
            );
          })
        )}

        {/* Live indicator */}
        {isLive && (
          <g>
            <circle
              cx={center}
              cy={center}
              r={12}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
            >
              <animate
                attributeName="r"
                values="12;16;12"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;0.5;1"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <text
              x={center}
              y={center + 4}
              textAnchor="middle"
              className="text-xs fill-emerald-400 font-medium"
            >
              LIVE
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
