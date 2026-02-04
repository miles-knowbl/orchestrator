'use client';

import { useEffect, useState } from 'react';
import { Clock, TrendingUp, Zap, Shield, Activity } from 'lucide-react';
import OODAClock from './OODAClock';
import { fetchApi } from '@/lib/api';

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

interface RhythmPattern {
  id: string;
  name: string;
  events: string[];
  averageDuration: number;
  frequency: number;
  confidence: number;
}

interface RhythmData {
  loopId: string;
  executionCount: number;
  completedCount: number;
  events: ClockEvent[];
  patterns: RhythmPattern[];
  stats: {
    avgDurationMs: number | null;
    avgDurationFormatted: string | null;
    eventsByType: Record<string, number>;
    eventsByQuadrant: Record<string, number>;
    totalEvents: number;
  } | null;
}

interface SignatureRhythmProps {
  loopId: string;
  className?: string;
}

export default function SignatureRhythm({ loopId, className = '' }: SignatureRhythmProps) {
  const [data, setData] = useState<RhythmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRhythm = async () => {
      try {
        setLoading(true);
        const response = await fetchApi(`/api/loops/${loopId}/rhythm`);
        if (!response.ok) {
          throw new Error('Failed to fetch rhythm data');
        }
        const rhythmData = await response.json();
        setData(rhythmData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load rhythm data');
      } finally {
        setLoading(false);
      }
    };

    fetchRhythm();
  }, [loopId]);

  if (loading) {
    return (
      <div className={`bg-[#111] border border-[#222] rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-orch-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`bg-[#111] border border-[#222] rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-5 h-5" />
          <span>No rhythm data available yet. Run this loop to generate patterns.</span>
        </div>
      </div>
    );
  }

  const { executionCount, completedCount, events, patterns, stats } = data;

  // If no completed executions, show placeholder
  if (completedCount === 0) {
    return (
      <div className={`bg-[#111] border border-[#222] rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Signature Rhythm</h3>
            <p className="text-xs text-gray-500">Pattern analysis from past executions</p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No completed executions yet</p>
          <p className="text-xs text-gray-600 mt-1">
            Run this loop to see its signature rhythm emerge
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#111] border border-[#222] rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#222] bg-[#0d0d0d]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Signature Rhythm</h3>
            <p className="text-xs text-gray-500">
              Based on {completedCount} completed run{completedCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-6">
          {/* Clock visualization */}
          <div className="shrink-0">
            <OODAClock
              events={events}
              currentPhase="COMPLETE"
              isLive={false}
              size={200}
            />
          </div>

          {/* Stats */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3">
              {stats?.avgDurationFormatted && (
                <div className="bg-[#0a0a0a] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500">Avg Duration</span>
                  </div>
                  <div className="text-lg font-bold text-white">{stats.avgDurationFormatted}</div>
                </div>
              )}
              <div className="bg-[#0a0a0a] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">Total Events</span>
                </div>
                <div className="text-lg font-bold text-white">{stats?.totalEvents || 0}</div>
              </div>
            </div>

            {/* Event type breakdown */}
            {stats?.eventsByType && (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 mb-2">Event Distribution</div>
                <div className="flex items-center gap-3">
                  {stats.eventsByType.skill && (
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs text-gray-400">{stats.eventsByType.skill} skills</span>
                    </div>
                  )}
                  {stats.eventsByType.gate && (
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-amber-400" />
                      <span className="text-xs text-gray-400">{stats.eventsByType.gate} gates</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quadrant distribution */}
            {stats?.eventsByQuadrant && (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 mb-2">Quadrant Activity</div>
                <div className="grid grid-cols-4 gap-1">
                  {['OBSERVE', 'ORIENT', 'DECIDE', 'ACT'].map(q => (
                    <div key={q} className="text-center">
                      <div className="text-sm font-medium text-white">
                        {stats.eventsByQuadrant[q] || 0}
                      </div>
                      <div className="text-[10px] text-gray-600">{q}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detected patterns */}
        {patterns.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#222]">
            <div className="text-xs text-gray-500 mb-2">Detected Patterns</div>
            <div className="space-y-2">
              {patterns.slice(0, 3).map(pattern => (
                <div
                  key={pattern.id}
                  className="flex items-center justify-between bg-[#0a0a0a] rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: `rgba(139, 92, 246, ${pattern.confidence})` }}
                    />
                    <span className="text-xs text-gray-300">{pattern.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">
                      {pattern.frequency}x
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {Math.round(pattern.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
