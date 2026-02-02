'use client';

interface ClockEvent {
  id: string;
  type: 'skill' | 'pattern' | 'gate' | 'phase';
  name: string;
  color: string;
  status: 'pending' | 'active' | 'complete' | 'failed';
}

interface EventMarkerProps {
  event: ClockEvent;
  x: number;
  y: number;
  isSelected?: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

export default function EventMarker({
  event,
  x,
  y,
  isSelected = false,
  isNew = false,
  onClick,
}: EventMarkerProps) {
  const size = event.type === 'gate' ? 10 : event.type === 'phase' ? 8 : 6;

  // Different shapes for different event types
  const renderShape = () => {
    switch (event.type) {
      case 'gate':
        // Diamond shape for gates
        return (
          <polygon
            points={`${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`}
            fill={event.color}
            stroke={isSelected ? '#fff' : 'none'}
            strokeWidth={isSelected ? 2 : 0}
          />
        );
      case 'phase':
        // Square for phases
        return (
          <rect
            x={x - size / 2}
            y={y - size / 2}
            width={size}
            height={size}
            fill={event.color}
            stroke={isSelected ? '#fff' : 'none'}
            strokeWidth={isSelected ? 2 : 0}
            rx={2}
          />
        );
      default:
        // Circle for skills and patterns
        return (
          <circle
            cx={x}
            cy={y}
            r={size}
            fill={event.color}
            stroke={isSelected ? '#fff' : 'none'}
            strokeWidth={isSelected ? 2 : 0}
          />
        );
    }
  };

  return (
    <g
      className="cursor-pointer"
      onClick={onClick}
      style={{
        animation: isNew ? 'event-appear 200ms ease-out' : undefined,
      }}
    >
      {/* Glow effect for active events */}
      {event.status === 'active' && (
        <circle cx={x} cy={y} r={size + 4} fill={event.color} opacity={0.3}>
          <animate
            attributeName="r"
            values={`${size + 4};${size + 8};${size + 4}`}
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.1;0.3"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Selection ring */}
      {isSelected && (
        <circle
          cx={x}
          cy={y}
          r={size + 6}
          fill="none"
          stroke="#fff"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
      )}

      {/* Main shape */}
      {renderShape()}

      {/* Failed indicator */}
      {event.status === 'failed' && (
        <g>
          <line
            x1={x - size + 2}
            y1={y - size + 2}
            x2={x + size - 2}
            y2={y + size - 2}
            stroke="#fff"
            strokeWidth={2}
          />
          <line
            x1={x + size - 2}
            y1={y - size + 2}
            x2={x - size + 2}
            y2={y + size - 2}
            stroke="#fff"
            strokeWidth={2}
          />
        </g>
      )}

      {/* Tooltip trigger (invisible larger hit area) */}
      <circle cx={x} cy={y} r={size + 8} fill="transparent" />

      <style jsx global>{`
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
      `}</style>
    </g>
  );
}
