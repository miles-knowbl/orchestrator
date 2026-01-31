'use client';

import { useEffect, useState } from 'react';
import {
  History,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Filter,
  Calendar,
  WifiOff,
  Layers,
  Target
} from 'lucide-react';

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

// Static fallback data
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
    loop: 'dream-loop',
    version: '1.0.0',
    system: 'orchestrator',
    status: 'completed',
    startedAt: '2026-01-30T15:30:00Z',
    completedAt: '2026-01-30T15:50:00Z',
    duration: '20m',
    phases: [
      { name: 'DISCOVER', status: 'completed', skills: ['observe', 'context-ingestion'] },
      { name: 'DEFINE', status: 'completed', skills: ['define-dream-state'] },
      { name: 'VALIDATE', status: 'completed', skills: ['skill-verifier'] },
      { name: 'COMPLETE', status: 'completed', skills: ['retrospective'] },
    ],
    gatesPassed: 1,
    gatesTotal: 1,
    outcome: 'System dream state updated to v0.7.0',
  },
  {
    id: 'run-005',
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

const LOOP_TYPES = [
  { key: 'all', label: 'All Loops' },
  { key: 'engineering-loop', label: 'Engineering' },
  { key: 'distribution-loop', label: 'Distribution' },
  { key: 'learning-loop', label: 'Learning' },
  { key: 'bugfix-loop', label: 'Bugfix' },
  { key: 'dream-loop', label: 'Dream' },
];

function StatusBadge({ status }: { status: Run['status'] }) {
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

function PhaseTimeline({ phases }: { phases: RunPhase[] }) {
  return (
    <div className="flex items-center gap-1">
      {phases.map((phase, i) => (
        <div key={phase.name} className="flex items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              phase.status === 'completed'
                ? 'bg-orch-500/20 text-orch-400'
                : phase.status === 'in_progress'
                ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                : 'bg-[#222] text-gray-500'
            }`}
            title={phase.name}
          >
            {i + 1}
          </div>
          {i < phases.length - 1 && (
            <div
              className={`w-4 h-0.5 ${
                phase.status === 'completed' ? 'bg-orch-500/40' : 'bg-[#222]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function RunCard({ run, isExpanded, onToggle }: {
  run: Run;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const completedPhases = run.phases.filter(p => p.status === 'completed').length;

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white">{run.loop}</h3>
              <span className="text-xs text-gray-500">v{run.version}</span>
              <StatusBadge status={run.status} />
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
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
          <PhaseTimeline phases={run.phases} />
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {completedPhases}/{run.phases.length}
            </p>
            <p className="text-xs text-gray-500">phases</p>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-[#222]">
          {run.outcome && (
            <div className="mb-4 p-3 bg-[#0a0a0a] rounded-lg">
              <p className="text-sm text-gray-300">
                <span className="text-gray-500">Outcome:</span> {run.outcome}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {run.phases.map((phase) => (
              <div
                key={phase.name}
                className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {phase.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-orch-400" />
                  ) : phase.status === 'in_progress' ? (
                    <Play className="w-4 h-4 text-blue-400 animate-pulse" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm font-medium text-white">{phase.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {phase.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-[#1a1a1a] text-gray-400 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>Gates: {run.gatesPassed}/{run.gatesTotal} passed</span>
            <span>
              {run.completedAt
                ? `Completed ${new Date(run.completedAt).toLocaleString()}`
                : `Started ${new Date(run.startedAt).toLocaleString()}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RunsPage() {
  const [runs, setRuns] = useState<Run[]>(STATIC_RUNS);
  const [isStatic, setIsStatic] = useState(true);
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());
  const [loopFilter, setLoopFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const res = await fetch('/api/runs');
        if (res.ok) {
          const data = await res.json();
          setRuns(data.runs);
          setIsStatic(false);
        }
      } catch {
        setIsStatic(true);
      }
    };

    fetchRuns();
  }, []);

  const toggleRun = (id: string) => {
    setExpandedRuns(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredRuns = loopFilter === 'all'
    ? runs
    : runs.filter(r => r.loop === loopFilter);

  const stats = {
    total: runs.length,
    completed: runs.filter(r => r.status === 'completed').length,
    active: runs.filter(r => r.status === 'active').length,
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
      {isStatic && (
        <div className="mb-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 text-sm text-yellow-400">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Viewing sample run history. Start the orchestrator server for live data.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Run History</h1>
            <p className="text-sm text-gray-500">
              {stats.total} runs · {stats.completed} completed · {stats.active} active
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-500" />
        {LOOP_TYPES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLoopFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              loopFilter === key
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-[#111] text-gray-400 border border-[#222] hover:border-[#333] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Runs List */}
      <div className="space-y-4">
        {filteredRuns.map((run) => (
          <RunCard
            key={run.id}
            run={run}
            isExpanded={expandedRuns.has(run.id)}
            onToggle={() => toggleRun(run.id)}
          />
        ))}
      </div>

      {filteredRuns.length === 0 && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No runs found</p>
          <p className="text-gray-600 text-sm mt-2">
            {loopFilter !== 'all'
              ? `No ${loopFilter} runs in history`
              : 'Run a loop to see history here'}
          </p>
        </div>
      )}
    </div>
  );
}
