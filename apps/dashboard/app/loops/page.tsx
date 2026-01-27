'use client';

import { useEffect, useState } from 'react';
import { Layers, ChevronRight, Play, Zap, WifiOff } from 'lucide-react';
import { fetchWithFallback } from '@/lib/api';

interface Loop {
  id: string;
  name: string;
  version: string;
  description: string;
  phaseCount: number;
  skillCount: number;
}

export default function LoopsPage() {
  const [loops, setLoops] = useState<Loop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    const fetchLoops = async () => {
      try {
        const { data, isStatic: staticMode } = await fetchWithFallback('/api/loops');
        setLoops(data.loops);
        setIsStatic(staticMode);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchLoops();
  }, []);

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
      {isStatic && (
        <div className="mb-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 text-sm text-yellow-400">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Viewing static loop catalog. Start the orchestrator server to execute loops.</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Loops</h1>
            <p className="text-sm text-gray-500">{loops.length} loops available</p>
          </div>
        </div>
      </div>

      {/* Loops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loops.map((loop) => (
          <a
            key={loop.id}
            href={`/loops/${loop.id}`}
            className="block bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">{loop.name}</h2>
                  <span className="text-xs text-gray-500">v{loop.version}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              </div>

              <p className="text-sm text-gray-400 mb-6">{loop.description}</p>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-orch-400" />
                  <div>
                    <p className="text-lg font-semibold text-white">{loop.phaseCount}</p>
                    <p className="text-xs text-gray-500">Phases</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-lg font-semibold text-white">{loop.skillCount}</p>
                    <p className="text-xs text-gray-500">Skills</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#0a0a0a] border-t border-[#222] flex items-center justify-between">
              <span className="text-xs text-gray-500">Click to view details</span>
              <span className="text-xs text-orch-400 font-medium">View Loop</span>
            </div>
          </a>
        ))}
      </div>

      {loops.length === 0 && !error && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <p className="text-gray-500">No loops found</p>
          <p className="text-gray-600 text-sm mt-2">
            Create a loop definition in the loops/ directory
          </p>
        </div>
      )}
    </div>
  );
}
