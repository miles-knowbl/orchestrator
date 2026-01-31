'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Target,
  GitBranch,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  WifiOff,
  Zap,
  Brain,
  Gauge,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface AnalyticsSummary {
  runs: {
    total: number;
    completed: number;
    failed: number;
    successRate: number;
  };
  skills: {
    tracked: number;
    healthy: number;
    needsAttention: number;
    avgHealthScore: number;
  };
  calibration: {
    accuracy: number;
    multiplier: number;
    trend: string;
  };
  proposals: {
    pending: number;
    applied: number;
  };
  patterns: {
    total: number;
    decisions: number;
  };
  lastUpdated: string;
}

interface LoopPerformance {
  [loop: string]: {
    count: number;
    successRate: number;
    avgDurationMs?: number;
  };
}

interface SkillHealth {
  skillId: string;
  healthScore: number;
  trend: 'improving' | 'stable' | 'declining';
  executionCount: number;
}

interface TrendData {
  period: string;
  runs: number;
  successRate: number;
  avgDuration?: number;
}

function TrendIcon({ trend }: { trend: string }) {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    case 'declining':
    case 'worsening':
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    default:
      return <Minus className="w-4 h-4 text-gray-400" />;
  }
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
  );
}

function HealthBadge({ score }: { score: number }) {
  const color =
    score >= 0.8
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : score >= 0.6
      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20';

  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${color}`}>
      {Math.round(score * 100)}%
    </span>
  );
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loopPerformance, setLoopPerformance] = useState<LoopPerformance | null>(null);
  const [skillHealth, setSkillHealth] = useState<SkillHealth[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all analytics data in parallel
      const [summaryRes, loopsRes, skillsRes, trendsRes] = await Promise.all([
        fetchApi('/api/analytics/summary'),
        fetchApi('/api/analytics/loops'),
        fetchApi('/api/analytics/skills'),
        fetchApi('/api/analytics/trends?days=30'),
      ]);

      if (!summaryRes.ok) throw new Error('Failed to fetch summary');
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      if (loopsRes.ok) {
        const loopsData = await loopsRes.json();
        setLoopPerformance(loopsData.loops);
      }

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        setSkillHealth(skillsData.skills || []);
      }

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        setTrends(trendsData.trends || []);
      }

      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (offline) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-orch-400" />
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <WifiOff className="w-10 h-10 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Analytics requires a running orchestrator server</p>
          <p className="text-gray-600 text-sm">Start the server to view system analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-orch-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-sm text-gray-500">OBSERVE layer — System performance insights</p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white bg-[#111] border border-[#222] rounded-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {summary && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <MetricCard
              icon={Activity}
              label="Total Runs"
              value={summary.runs.total}
              subValue={`${summary.runs.completed} completed`}
              color="bg-blue-500/10 text-blue-400"
            />
            <MetricCard
              icon={Target}
              label="Success Rate"
              value={`${Math.round(summary.runs.successRate * 100)}%`}
              subValue={`${summary.runs.failed} failed`}
              color="bg-green-500/10 text-green-400"
            />
            <MetricCard
              icon={Zap}
              label="Skills Tracked"
              value={summary.skills.tracked}
              subValue={`${summary.skills.healthy} healthy`}
              color="bg-purple-500/10 text-purple-400"
            />
            <MetricCard
              icon={Gauge}
              label="Calibration"
              value={`${Math.round(summary.calibration.accuracy * 100)}%`}
              subValue={`×${summary.calibration.multiplier.toFixed(2)} multiplier`}
              color="bg-yellow-500/10 text-yellow-400"
            />
            <MetricCard
              icon={Brain}
              label="Patterns"
              value={summary.patterns.total}
              subValue={`${summary.patterns.decisions} decisions`}
              color="bg-indigo-500/10 text-indigo-400"
            />
            <MetricCard
              icon={GitBranch}
              label="Proposals"
              value={summary.proposals.pending}
              subValue={`${summary.proposals.applied} applied`}
              color="bg-orange-500/10 text-orange-400"
            />
          </div>

          {/* Two-column layout */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Loop Performance */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-orch-400" />
                Loop Performance
              </h2>
              {loopPerformance && Object.keys(loopPerformance).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(loopPerformance).map(([loop, data]) => (
                    <div
                      key={loop}
                      className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{loop}</p>
                        <p className="text-xs text-gray-500">
                          {data.count} runs
                          {data.avgDurationMs && ` • avg ${Math.round(data.avgDurationMs / 60000)}m`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {data.successRate >= 0.8 ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : data.successRate >= 0.6 ? (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-sm font-medium text-white">
                          {Math.round(data.successRate * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No loop performance data yet</p>
              )}
            </div>

            {/* Skill Health */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orch-400" />
                Skill Health
              </h2>
              {skillHealth.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {skillHealth.slice(0, 10).map((skill) => (
                    <div
                      key={skill.skillId}
                      className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]"
                    >
                      <div className="flex items-center gap-2">
                        <TrendIcon trend={skill.trend} />
                        <div>
                          <p className="text-sm font-medium text-white">{skill.skillId}</p>
                          <p className="text-xs text-gray-500">{skill.executionCount} executions</p>
                        </div>
                      </div>
                      <HealthBadge score={skill.healthScore} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No skill health data yet</p>
              )}
            </div>
          </div>

          {/* Trends Chart (simple text-based for now) */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orch-400" />
              30-Day Trends
            </h2>
            {trends.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="flex gap-1 min-w-[600px]">
                  {trends.map((day) => {
                    const height = Math.max(10, day.runs * 10);
                    const color =
                      day.successRate >= 0.8
                        ? 'bg-green-500'
                        : day.successRate >= 0.6
                        ? 'bg-yellow-500'
                        : day.successRate > 0
                        ? 'bg-red-500'
                        : 'bg-gray-700';

                    return (
                      <div
                        key={day.period}
                        className="flex-1 flex flex-col items-center gap-1"
                        title={`${day.period}: ${day.runs} runs, ${Math.round(day.successRate * 100)}% success`}
                      >
                        <div
                          className={`w-full ${color} rounded-t`}
                          style={{ height: `${height}px` }}
                        />
                        <span className="text-[8px] text-gray-600 rotate-45 origin-left whitespace-nowrap">
                          {day.period.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4 text-xs text-gray-500">
                  <span>30 days ago</span>
                  <span>Today</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No trend data yet. Run some loops to generate data.</p>
            )}
          </div>

          {/* Calibration Details */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-orch-400" />
              Calibration Status
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                <p className="text-xs text-gray-500 mb-1">Accuracy</p>
                <p className="text-xl font-bold text-white">
                  {Math.round(summary.calibration.accuracy * 100)}%
                </p>
                <p className="text-xs text-gray-600 mt-1">How close estimates are to actual</p>
              </div>
              <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                <p className="text-xs text-gray-500 mb-1">Multiplier</p>
                <p className="text-xl font-bold text-white">
                  ×{summary.calibration.multiplier.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {summary.calibration.multiplier > 1.2
                    ? 'Estimates tend optimistic'
                    : summary.calibration.multiplier < 0.8
                    ? 'Estimates tend conservative'
                    : 'Well calibrated'}
                </p>
              </div>
              <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                <p className="text-xs text-gray-500 mb-1">Trend</p>
                <div className="flex items-center gap-2">
                  <TrendIcon trend={summary.calibration.trend} />
                  <p className="text-xl font-bold text-white capitalize">{summary.calibration.trend}</p>
                </div>
                <p className="text-xs text-gray-600 mt-1">Calibration accuracy direction</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Last Updated */}
      {summary && (
        <p className="text-xs text-gray-600 text-center mt-6">
          Last updated: {new Date(summary.lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  );
}
