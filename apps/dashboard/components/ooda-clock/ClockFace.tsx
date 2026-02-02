'use client';

interface ClockFaceProps {
  size: number;
  currentPhase: string;
}

const QUADRANTS = [
  { name: 'OBSERVE', startAngle: 270, endAngle: 360, color: '#1e3a5f' },
  { name: 'ORIENT', startAngle: 0, endAngle: 90, color: '#1e3a5f' },
  { name: 'DECIDE', startAngle: 90, endAngle: 180, color: '#1e3a5f' },
  { name: 'ACT', startAngle: 180, endAngle: 270, color: '#1e3a5f' },
];

export default function ClockFace({ size, currentPhase }: ClockFaceProps) {
  const center = size / 2;
  const radius = size * 0.45;

  // Map phase to quadrant for highlighting
  const phaseQuadrant: Record<string, string> = {
    INIT: 'OBSERVE',
    SCAFFOLD: 'ORIENT',
    IMPLEMENT: 'DECIDE',
    TEST: 'DECIDE',
    VERIFY: 'ACT',
    VALIDATE: 'ACT',
    DOCUMENT: 'ACT',
    REVIEW: 'ACT',
    SHIP: 'ACT',
    COMPLETE: 'ACT',
  };

  const activeQuadrant = phaseQuadrant[currentPhase] || 'OBSERVE';

  // Create arc path for quadrant
  const createArcPath = (startAngle: number, endAngle: number, r: number) => {
    const start = polarToCartesian(center, center, r, startAngle - 90);
    const end = polarToCartesian(center, center, r, endAngle - 90);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  return (
    <g>
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="#0d0d0d"
        stroke="#222"
        strokeWidth="2"
      />

      {/* Quadrant fills */}
      {QUADRANTS.map(q => (
        <path
          key={q.name}
          d={createArcPath(q.startAngle, q.endAngle, radius)}
          fill={q.name === activeQuadrant ? '#1a3a2f' : 'transparent'}
          stroke="none"
          opacity={0.3}
        />
      ))}

      {/* Concentric rings for layers */}
      {[0.55, 0.70, 0.85].map((ratio, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={radius * ratio}
          fill="none"
          stroke="#222"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
      ))}

      {/* Quadrant dividers */}
      <line
        x1={center}
        y1={center - radius}
        x2={center}
        y2={center + radius}
        stroke="#333"
        strokeWidth="1"
      />
      <line
        x1={center - radius}
        y1={center}
        x2={center + radius}
        y2={center}
        stroke="#333"
        strokeWidth="1"
      />

      {/* Quadrant labels */}
      <text
        x={center + radius * 0.5}
        y={center - radius * 0.7}
        textAnchor="middle"
        className="text-xs fill-gray-500 font-medium"
      >
        ORIENT
      </text>
      <text
        x={center + radius * 0.5}
        y={center + radius * 0.8}
        textAnchor="middle"
        className="text-xs fill-gray-500 font-medium"
      >
        DECIDE
      </text>
      <text
        x={center - radius * 0.5}
        y={center + radius * 0.8}
        textAnchor="middle"
        className="text-xs fill-gray-500 font-medium"
      >
        ACT
      </text>
      <text
        x={center - radius * 0.5}
        y={center - radius * 0.7}
        textAnchor="middle"
        className="text-xs fill-gray-500 font-medium"
      >
        OBSERVE
      </text>

      {/* Center current phase display */}
      <circle
        cx={center}
        cy={center}
        r={30}
        fill="#111"
        stroke="#333"
        strokeWidth="1"
      />
      <text
        x={center}
        y={center - 4}
        textAnchor="middle"
        className="text-xs fill-gray-400"
      >
        Phase
      </text>
      <text
        x={center}
        y={center + 10}
        textAnchor="middle"
        className="text-xs fill-white font-medium"
      >
        {currentPhase}
      </text>

      {/* Tick marks around edge */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30;
        const innerRadius = radius - 5;
        const outerRadius = radius;
        const start = polarToCartesian(center, center, innerRadius, angle - 90);
        const end = polarToCartesian(center, center, outerRadius, angle - 90);

        return (
          <line
            key={i}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="#444"
            strokeWidth={i % 3 === 0 ? 2 : 1}
          />
        );
      })}
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
