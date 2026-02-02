'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ExecutionSummary {
  id: string;
  loopId: string;
  project: string;
  status: string;
  currentPhase: string;
  eventCount: number;
  startedAt: string;
  completedAt?: string;
}

export default function OODAClockPage() {
  const [executions, setExecutions] = useState<ExecutionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    async function fetchExecutions() {
      try {
        const res = await fetch('http://localhost:3002/api/executions');
        if (res.ok) {
          const data = await res.json();
          setExecutions(data.executions || []);
        }
      } catch (error) {
        console.error('Failed to fetch executions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExecutions();
    const interval = setInterval(fetchExecutions, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredExecutions = executions.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'active') return e.status === 'active' || e.status === 'paused';
    if (filter === 'completed') return e.status === 'completed';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">OODA Clock</h1>
        <p className="text-gray-400">
          Gamelan-inspired circular visualization of loop execution timing
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Executions grid */}
      {loading ? (
        <div className="text-gray-400">Loading executions...</div>
      ) : filteredExecutions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No executions found</div>
          <p className="text-gray-600 text-sm">
            Start a loop execution to see it visualized here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExecutions.map(exec => (
            <Link
              key={exec.id}
              href={`/ooda-clock/${exec.id}`}
              className="block bg-[#111] border border-[#222] rounded-lg p-6 hover:border-emerald-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium">{exec.loopId}</h3>
                  <p className="text-gray-500 text-sm">{exec.project}</p>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(exec.status)}`}>
                  {exec.status}
                </span>
              </div>

              {/* Mini clock preview */}
              <div className="flex justify-center my-4">
                <MiniClock phase={exec.currentPhase} status={exec.status} />
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Phase: {exec.currentPhase}</span>
                <span>{exec.eventCount} events</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniClock({ phase, status }: { phase: string; status: string }) {
  // Calculate angle based on phase
  const phaseAngles: Record<string, number> = {
    INIT: 315,
    SCAFFOLD: 45,
    IMPLEMENT: 112,
    TEST: 157,
    VERIFY: 190,
    VALIDATE: 210,
    DOCUMENT: 230,
    REVIEW: 247,
    SHIP: 260,
    COMPLETE: 267,
  };

  const angle = phaseAngles[phase] || 0;
  const radians = (angle - 90) * (Math.PI / 180);
  const indicatorX = 40 + 25 * Math.cos(radians);
  const indicatorY = 40 + 25 * Math.sin(radians);

  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      {/* Background */}
      <circle cx="40" cy="40" r="35" fill="#1a1a1a" stroke="#333" strokeWidth="1" />

      {/* Quadrant dividers */}
      <line x1="40" y1="5" x2="40" y2="75" stroke="#333" strokeWidth="0.5" />
      <line x1="5" y1="40" x2="75" y2="40" stroke="#333" strokeWidth="0.5" />

      {/* Phase indicator */}
      <circle
        cx={indicatorX}
        cy={indicatorY}
        r="4"
        fill={status === 'active' ? '#10b981' : status === 'completed' ? '#3b82f6' : '#666'}
      >
        {status === 'active' && (
          <animate
            attributeName="opacity"
            values="1;0.5;1"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Center dot */}
      <circle cx="40" cy="40" r="3" fill="#333" />
    </svg>
  );
}
