'use client';

const LEGEND_ITEMS = [
  {
    type: 'skill',
    label: 'Skill',
    color: '#10b981',
    shape: 'circle',
  },
  {
    type: 'pattern',
    label: 'Pattern',
    color: '#0ea5e9',
    shape: 'circle',
  },
  {
    type: 'gate',
    label: 'Gate',
    color: '#f59e0b',
    shape: 'diamond',
  },
  {
    type: 'phase',
    label: 'Phase',
    color: '#8b5cf6',
    shape: 'square',
  },
];

const STATUS_ITEMS = [
  { status: 'active', label: 'Active', description: 'Currently executing' },
  { status: 'complete', label: 'Complete', description: 'Finished successfully' },
  { status: 'failed', label: 'Failed', description: 'Error occurred' },
];

export default function ClockLegend() {
  return (
    <div className="space-y-4">
      {/* Event types */}
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Event Types</h4>
        <div className="space-y-2">
          {LEGEND_ITEMS.map(item => (
            <div key={item.type} className="flex items-center gap-3">
              <LegendShape shape={item.shape} color={item.color} />
              <span className="text-sm text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event status */}
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Status</h4>
        <div className="space-y-2">
          {STATUS_ITEMS.map(item => (
            <div key={item.status} className="flex items-center gap-3">
              <StatusIndicator status={item.status} />
              <div>
                <span className="text-sm text-gray-300">{item.label}</span>
                <span className="text-xs text-gray-500 ml-2">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layers */}
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Layers</h4>
        <div className="space-y-1 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Inner ring</span>
            <span className="text-gray-500">Skills</span>
          </div>
          <div className="flex justify-between">
            <span>Middle ring</span>
            <span className="text-gray-500">Patterns</span>
          </div>
          <div className="flex justify-between">
            <span>Outer ring</span>
            <span className="text-gray-500">Gates</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendShape({ shape, color }: { shape: string; color: string }) {
  const size = 12;

  return (
    <svg width={size + 4} height={size + 4} viewBox={`0 0 ${size + 4} ${size + 4}`}>
      {shape === 'circle' && (
        <circle cx={(size + 4) / 2} cy={(size + 4) / 2} r={size / 2} fill={color} />
      )}
      {shape === 'diamond' && (
        <polygon
          points={`${(size + 4) / 2},2 ${size + 2},${(size + 4) / 2} ${(size + 4) / 2},${size + 2} 2,${(size + 4) / 2}`}
          fill={color}
        />
      )}
      {shape === 'square' && (
        <rect x={2} y={2} width={size} height={size} fill={color} rx={2} />
      )}
    </svg>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const baseClass = 'w-4 h-4 rounded-full';

  switch (status) {
    case 'active':
      return (
        <div className="relative">
          <div className={`${baseClass} bg-emerald-500`} />
          <div className={`${baseClass} bg-emerald-500 absolute top-0 left-0 animate-ping opacity-75`} />
        </div>
      );
    case 'complete':
      return <div className={`${baseClass} bg-blue-500`} />;
    case 'failed':
      return (
        <div className={`${baseClass} bg-red-500 flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">×</span>
        </div>
      );
    default:
      return <div className={`${baseClass} bg-gray-500`} />;
  }
}
