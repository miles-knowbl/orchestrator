'use client';

import { useEffect, useState } from 'react';
import {
  Layers,
  ChevronRight,
  ChevronDown,
  Play,
  Zap,
  WifiOff,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Target
} from 'lucide-react';
import { fetchWithFallback, fetchApi } from '@/lib/api';

interface Loop {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  phaseCount: number;
  skillCount: number;
}

interface RunPhase {
  name: string;
  status: 'completed' | 'in_progress' | 'pending' | 'skipped';
  skills: string[];
}

interface Run {
  id: string;
  loop: string;
  version: string;
  system: string;
  status: 'completed' | 'active' | 'failed' | 'aborted';
  startedAt: string;
  completedAt?: string;
  duration?: string;
  phases: RunPhase[];
  gatesPassed: number;
  gatesTotal: number;
  outcome?: string;
}

// Static fallback data for runs
const STATIC_RUNS: Run[] = [
  {
    id: 'run-001',
    loop: 'engineering-loop',
    version: '5.1.0',
    system: 'orchestrator',
    status: 'completed',
    startedAt: '2026-01-30T18:00:00Z',
    completedAt: '2026-01-30T19:30:00Z',
    duration: '1h 30m',
    phases: [
      { name: 'INIT', status: 'completed', skills: ['requirements', 'spec'] },
      { name: 'SCAFFOLD', status: 'completed', skills: ['architect', 'scaffold'] },
      { name: 'IMPLEMENT', status: 'completed', skills: ['implement'] },
      { name: 'TEST', status: 'completed', skills: ['test-generation'] },
      { name: 'VERIFY', status: 'completed', skills: ['code-verification'] },
      { name: 'VALIDATE', status: 'completed', skills: ['code-validation'] },
      { name: 'DOCUMENT', status: 'completed', skills: ['document'] },
      { name: 'REVIEW', status: 'completed', skills: ['code-review'] },
      { name: 'SHIP', status: 'completed', skills: ['deploy', 'distribute'] },
      { name: 'COMPLETE', status: 'completed', skills: ['retrospective'] },
    ],
    gatesPassed: 6,
    gatesTotal: 6,
    outcome: 'Dream state visualization shipped',
  },
  {
    id: 'run-002',
    loop: 'distribution-loop',
    version: '2.0.0',
    system: 'orchestrator',
    status: 'completed',
    startedAt: '2026-01-30T17:15:00Z',
    completedAt: '2026-01-30T17:20:00Z',
    duration: '5m',
    phases: [
      { name: 'INIT', status: 'completed', skills: ['release-planner'] },
      { name: 'VERIFY', status: 'completed', skills: ['code-verification'] },
      { name: 'SHIP', status: 'completed', skills: ['git-workflow', 'deploy', 'distribute'] },
      { name: 'COMPLETE', status: 'completed', skills: ['retrospective'] },
    ],
    gatesPassed: 2,
    gatesTotal: 2,
    outcome: 'v0.7.0 shipped to all targets',
  },
  {
    id: 'run-003',
    loop: 'learning-loop',
    version: '2.0.0',
    system: 'orchestrator',
    status: 'completed',
    startedAt: '2026-01-30T16:00:00Z',
    completedAt: '2026-01-30T16:45:00Z',
    duration: '45m',
    phases: [
      { name: 'INIT', status: 'completed', skills: ['requirements'] },
      { name: 'ANALYZE', status: 'completed', skills: ['retrospective', 'skill-verifier'] },
      { name: 'IMPROVE', status: 'completed', skills: ['skill-design', 'calibration-tracker'] },
      { name: 'VALIDATE', status: 'completed', skills: ['memory-manager'] },
      { name: 'COMPLETE', status: 'completed', skills: ['retrospective'] },
    ],
    gatesPassed: 2,
    gatesTotal: 2,
    outcome: 'ADR-004 and PAT-008 recorded',
  },
  {
    id: 'run-004',
    loop: 'bugfix-loop',
    version: '2.0.0',
    system: 'taste-mixer',
    status: 'completed',
    startedAt: '2026-01-30T08:20:00Z',
    completedAt: '2026-01-30T08:35:00Z',
    duration: '15m',
    phases: [
      { name: 'INIT', status: 'completed', skills: ['requirements'] },
      { name: 'DIAGNOSE', status: 'completed', skills: ['diagnose'] },
      { name: 'FIX', status: 'completed', skills: ['implement'] },
      { name: 'VERIFY', status: 'completed', skills: ['code-verification'] },
      { name: 'COMPLETE', status: 'completed', skills: ['retrospective'] },
    ],
    gatesPassed: 2,
    gatesTotal: 2,
    outcome: 'Canvas rendering bug fixed',
  },
];

const CATEGORIES = [
  { key: 'general', label: 'General' },
  { key: 'sales', label: 'Sales' },
  { key: 'meta', label: 'Meta' },
] as const;

function RunStatusBadge({ status }: { status: Run['status'] }) {
  const styles = {
    completed: 'bg-orch-500/10 text-orch-400 border-orch-500/20',
    active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    aborted: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  const icons = {
    completed: <CheckCircle2 className="w-3 h-3" />,
    active: <Play className="w-3 h-3" />,
    failed: <XCircle className="w-3 h-3" />,
    aborted: <XCircle className="w-3 h-3" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
}

function MiniPhaseTimeline({ phases }: { phases: RunPhase[] }) {
  return (
    <div className="flex items-center gap-0.5">
      {phases.slice(0, 6).map((phase, i) => (
        <div
          key={phase.name}
          className={`w-2 h-2 rounded-full ${
            phase.status === 'completed'
              ? 'bg-orch-400'
              : phase.status === 'in_progress'
              ? 'bg-blue-400 animate-pulse'
              : 'bg-gray-600'
          }`}
          title={phase.name}
        />
      ))}
      {phases.length > 6 && (
        <span className="text-xs text-gray-500 ml-1">+{phases.length - 6}</span>
      )}
    </div>
  );
}

function RunRow({ run }: { run: Run }) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#111] transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
          <Layers className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{run.loop}</span>
            <span className="text-xs text-gray-500">v{run.version}</span>
            <RunStatusBadge status={run.status} />
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {run.system}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(run.startedAt).toLocaleDateString()}
            </span>
            {run.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {run.duration}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <MiniPhaseTimeline phases={run.phases} />
        <span className="text-xs text-gray-500">
          {run.phases.filter(p => p.status === 'completed').length}/{run.phases.length}
        </span>
      </div>
    </div>
  );
}

export default function LoopsPage() {
  const [loops, setLoops] = useState<Loop[]>([]);
  const [runs, setRuns] = useState<Run[]>(STATIC_RUNS);
  const [error, setError] = useState<string | null>(null);
  const [isStatic, setIsStatic] = useState(false);
  const [activeCategory, setActiveCategory] = useState('general');
  const [runsExpanded, setRunsExpanded] = useState(false);

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

    const fetchRuns = async () => {
      try {
        const res = await fetchApi('/api/runs');
        if (res.ok) {
          const data = await res.json();
          setRuns(data.runs || STATIC_RUNS);
        }
      } catch {
        // Use static data
      }
    };

    fetchLoops();
    fetchRuns();
  }, []);

  const filtered = loops.filter(l => l.category === activeCategory);

  const categoryCounts = loops.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1;
    return acc;
  }, {});

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
          <span>Viewing static loop catalog. Start the orchestrator server for live data.</span>
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

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-6">
        {CATEGORIES.map(({ key, label }) => {
          const count = categoryCounts[key] || 0;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === key
                  ? 'bg-orch-500/20 text-orch-400 border border-orch-500/30'
                  : 'bg-[#111] text-gray-400 border border-[#222] hover:border-[#333] hover:text-white'
              }`}
            >
              {label}
              <span className="ml-1.5 text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Loops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((loop) => (
          <a
            key={loop.id}
            href={`/loops/${loop.id}`}
            className="block bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">{loop.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">v{loop.version}</span>
                    <span className="text-xs text-gray-600 bg-[#1a1a1a] px-1.5 py-0.5 rounded capitalize">
                      {loop.category}
                    </span>
                  </div>
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

      {filtered.length === 0 && loops.length > 0 && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <p className="text-gray-500">No loops in this category</p>
        </div>
      )}

      {loops.length === 0 && !error && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <p className="text-gray-500">No loops found</p>
          <p className="text-gray-600 text-sm mt-2">
            Create a loop definition in the loops/ directory
          </p>
        </div>
      )}

      {/* Recent Runs Section - Collapsible */}
      <div className="mt-8 border-t border-[#222] pt-6">
        <button
          onClick={() => setRunsExpanded(!runsExpanded)}
          className="w-full flex items-center justify-between p-3 bg-[#111] border border-[#222] rounded-lg hover:border-[#333] transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Recent Runs</span>
            <span className="text-xs bg-[#222] text-gray-400 px-2 py-0.5 rounded-full">
              {runs.length}
            </span>
          </div>
          {runsExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {runsExpanded && (
          <div className="mt-3 space-y-2">
            {runs.slice(0, 5).map((run) => (
              <RunRow key={run.id} run={run} />
            ))}
            {runs.length > 5 && (
              <a
                href="/runs"
                className="block text-center text-xs text-gray-500 hover:text-gray-300 py-2"
              >
                View all {runs.length} runs →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
