'use client';

import { useEffect, useState } from 'react';
import { Activity, Layers, Zap, Inbox, ChevronRight, Clock } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface DashboardData {
  summary: {
    activeExecutions: number;
    totalExecutions: number;
    totalSkills: number;
    totalLoops: number;
    pendingInbox: number;
  };
  activeExecutions: {
    id: string;
    loopId: string;
    project: string;
    currentPhase: string;
    progress: { phasesCompleted: number; phasesTotal: number; skillsCompleted: number; skillsTotal: number };
    updatedAt: string;
  }[];
  recentExecutions: {
    id: string;
    loopId: string;
    project: string;
    status: string;
    currentPhase: string;
    startedAt: string;
  }[];
  loops: {
    id: string;
    name: string;
    phaseCount: number;
  }[];
}

function StatCard({ icon: Icon, label, value, subtext, color }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-6 hover:border-[#333] transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtext && <p className="text-gray-500 text-xs mt-1">{subtext}</p>}
        </div>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  );
}

function ExecutionCard({ execution }: { execution: DashboardData['activeExecutions'][0] }) {
  const progress = execution.progress;
  const percentage = progress.skillsTotal > 0
    ? Math.round((progress.skillsCompleted / progress.skillsTotal) * 100)
    : 0;

  return (
    <a
      href={`/executions/${execution.id}`}
      className="block bg-[#111] border border-[#222] rounded-xl p-4 hover:border-orch-500/50 transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orch-500 pulse-glow" />
          <span className="text-sm font-medium text-white">{execution.loopId}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
      </div>

      <p className="text-gray-400 text-sm mb-3 truncate">{execution.project}</p>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-orch-400 font-medium px-2 py-0.5 bg-orch-500/10 rounded">
          {execution.currentPhase}
        </span>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orch-500 to-orch-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </a>
  );
}

function RecentExecutionRow({ execution }: { execution: DashboardData['recentExecutions'][0] }) {
  const statusColors: Record<string, string> = {
    active: 'bg-orch-500',
    completed: 'bg-blue-500',
    failed: 'bg-red-500',
    paused: 'bg-yellow-500',
    blocked: 'bg-orange-500',
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <a
      href={`/executions/${execution.id}`}
      className="flex items-center gap-4 py-3 px-4 hover:bg-[#161616] rounded-lg transition-colors group"
    >
      <div className={`w-2 h-2 rounded-full ${statusColors[execution.status] || 'bg-gray-500'}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{execution.loopId}</span>
          <span className="text-xs text-gray-500">/</span>
          <span className="text-sm text-gray-400 truncate">{execution.project}</span>
        </div>
      </div>
      <span className="text-xs text-orch-400 font-medium">{execution.currentPhase}</span>
      <div className="flex items-center gap-1 text-gray-500 text-xs">
        <Clock className="w-3 h-3" />
        {timeAgo(execution.startedAt)}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
    </a>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchApi('/api/dashboard');
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">Failed to connect to Orchestrator API</p>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
          <p className="text-gray-600 text-xs mt-4">Make sure the orchestrator server is running</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-orch-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Activity}
          label="Active Executions"
          value={data.summary.activeExecutions}
          subtext={`${data.summary.totalExecutions} total`}
          color="text-orch-400"
        />
        <StatCard
          icon={Layers}
          label="Loops"
          value={data.summary.totalLoops}
          color="text-blue-400"
        />
        <StatCard
          icon={Zap}
          label="Skills"
          value={data.summary.totalSkills}
          color="text-purple-400"
        />
        <StatCard
          icon={Inbox}
          label="Pending Inbox"
          value={data.summary.pendingInbox}
          color="text-orange-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Executions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Active Executions</h2>
            <a href="/executions" className="text-sm text-orch-400 hover:text-orch-300 transition-colors">
              View all
            </a>
          </div>

          {data.activeExecutions.length === 0 ? (
            <div className="bg-[#111] border border-[#222] rounded-xl p-8 text-center">
              <p className="text-gray-500">No active executions</p>
              <p className="text-gray-600 text-sm mt-2">Start a new loop to see it here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.activeExecutions.map((exec) => (
                <ExecutionCard key={exec.id} execution={exec} />
              ))}
            </div>
          )}
        </div>

        {/* Available Loops */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Available Loops</h2>
            <a href="/loops" className="text-sm text-orch-400 hover:text-orch-300 transition-colors">
              View all
            </a>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-xl divide-y divide-[#222]">
            {data.loops.map((loop) => (
              <a
                key={loop.id}
                href={`/loops/${loop.id}`}
                className="flex items-center justify-between p-4 hover:bg-[#161616] transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-white">{loop.name}</p>
                  <p className="text-xs text-gray-500">{loop.phaseCount} phases</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Executions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="bg-[#111] border border-[#222] rounded-xl">
          {data.recentExecutions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No recent executions</p>
            </div>
          ) : (
            <div className="divide-y divide-[#222]">
              {data.recentExecutions.map((exec) => (
                <RecentExecutionRow key={exec.id} execution={exec} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
