'use client';

import { useEffect, useState } from 'react';
import { Layers, Zap, Inbox, ChevronRight, WifiOff } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface DashboardData {
  summary: {
    totalSkills: number;
    totalLoops: number;
    pendingInbox: number;
  };
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

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchData = async () => {
      try {
        const res = await fetchApi('/api/dashboard');
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const json = await res.json();
        setData({
          summary: {
            totalSkills: json.summary.totalSkills,
            totalLoops: json.summary.totalLoops,
            pendingInbox: json.summary.pendingInbox,
          },
          loops: json.loops,
        });
        setIsStatic(false);
        setError(null);
      } catch {
        // API unavailable — try static fallback
        try {
          const loopsRes = await fetch('/data/loops.json');
          if (loopsRes.ok) {
            const loopsData = await loopsRes.json();
            setData({
              summary: {
                totalSkills: 0,
                totalLoops: loopsData.loops.length,
                pendingInbox: 0,
              },
              loops: loopsData.loops.map((l: { id: string; name: string; phaseCount: number }) => ({
                id: l.id,
                name: l.name,
                phaseCount: l.phaseCount,
              })),
            });
            setIsStatic(true);
            setError(null);
            // Stop polling when in static mode
            if (interval) { clearInterval(interval); interval = null; }
            return;
          }
        } catch { /* static fallback also failed */ }
        setError('Failed to connect to Orchestrator API');
      }
    };

    fetchData();
    interval = setInterval(fetchData, 5000);

    return () => { if (interval) clearInterval(interval); };
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
      {isStatic && (
        <div className="mb-6 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 text-sm text-yellow-400">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Viewing static catalog. Start the orchestrator server to see live data and use all features.</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
  );
}
