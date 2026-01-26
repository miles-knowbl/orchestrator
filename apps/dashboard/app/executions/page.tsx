'use client';

import { useEffect, useState } from 'react';
import { Play, Clock, CheckCircle, XCircle, Pause, AlertCircle, ChevronRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface ExecutionSummary {
  id: string;
  loopId: string;
  project: string;
  status: string;
  currentPhase: string;
  progress: {
    phasesCompleted: number;
    phasesTotal: number;
    skillsCompleted: number;
    skillsTotal: number;
  };
  startedAt: string;
  updatedAt: string;
}

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<ExecutionSummary[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        const res = await fetch(`${API_URL}/api/executions`);
        if (!res.ok) throw new Error('Failed to fetch executions');
        const data = await res.json();
        setExecutions(data.executions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchExecutions();
    const interval = setInterval(fetchExecutions, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-orch-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-400" />;
      case 'blocked':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredExecutions = executions.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Executions</h1>

        <div className="flex items-center gap-2">
          {['all', 'active', 'completed', 'failed', 'paused'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === status
                  ? 'bg-orch-600 text-white'
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredExecutions.length === 0 ? (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <p className="text-gray-500">No executions found</p>
          <p className="text-gray-600 text-sm mt-2">
            Start a loop execution via the MCP tools to see it here
          </p>
        </div>
      ) : (
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Loop</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Project</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Phase</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Progress</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {filteredExecutions.map((exec) => {
                const percentage = exec.progress.skillsTotal > 0
                  ? Math.round((exec.progress.skillsCompleted / exec.progress.skillsTotal) * 100)
                  : 0;

                return (
                  <tr key={exec.id} className="hover:bg-[#161616] transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(exec.status)}
                        <span className="text-sm text-gray-300 capitalize">{exec.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-white">{exec.loopId}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-400">{exec.project}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-orch-400 bg-orch-500/10 px-2 py-1 rounded">
                        {exec.currentPhase}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-[#222] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orch-500 to-orch-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{percentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500">{timeAgo(exec.updatedAt)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={`/executions/${exec.id}`}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
