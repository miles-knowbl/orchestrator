'use client';

interface ClockEvent {
  id: string;
  startAngle: number;
  endAngle?: number;
  color: string;
  status: 'pending' | 'active' | 'complete' | 'failed';
}

interface EventArcProps {
  event: ClockEvent;
  center: number;
  radius: number;
}

export default function EventArc({ event, center, radius }: EventArcProps) {
  if (event.endAngle === undefined) {
    return null;
  }

  const startAngle = event.startAngle;
  const endAngle = event.endAngle;

  // Calculate arc path
  const start = polarToCartesian(center, center, radius, startAngle - 90);
  const end = polarToCartesian(center, center, radius, endAngle - 90);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  const sweep = endAngle > startAngle ? 1 : 0;

  const d = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;

  // Calculate arc length for animation
  const arcLength = Math.abs(endAngle - startAngle) * (Math.PI / 180) * radius;

  return (
    <g>
      {/* Background arc (faded) */}
      <path
        d={d}
        fill="none"
        stroke={event.color}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.2}
      />

      {/* Animated arc */}
      <path
        d={d}
        fill="none"
        stroke={event.color}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={event.status === 'complete' ? 0.8 : event.status === 'active' ? 1 : 0.5}
        strokeDasharray={arcLength}
        strokeDashoffset={event.status === 'pending' ? arcLength : 0}
        style={{
          transition: 'stroke-dashoffset 0.5s ease-out',
        }}
      >
        {event.status === 'active' && (
          <animate
            attributeName="opacity"
            values="1;0.6;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Start cap */}
      <circle
        cx={start.x}
        cy={start.y}
        r={3}
        fill={event.color}
      />

      {/* End cap (only if complete or active) */}
      {event.status !== 'pending' && (
        <circle
          cx={end.x}
          cy={end.y}
          r={3}
          fill={event.color}
        />
      )}
    </g>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = angleDeg * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}
