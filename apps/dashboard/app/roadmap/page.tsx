'use client';

import { useEffect, useState } from 'react';
import {
  LayoutGrid,
  CheckCircle2,
  Circle,
  PlayCircle,
  XCircle,
  RefreshCw,
  WifiOff,
  ArrowRight,
  Zap,
  Layers,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface Module {
  id: string;
  name: string;
  description: string;
  layer: number;
  status: 'pending' | 'in-progress' | 'complete' | 'blocked';
  dependsOn: string[];
  unlocks: string[];
  startedAt?: string;
  completedAt?: string;
}

interface LayerProgress {
  layer: number;
  total: number;
  complete: number;
  inProgress: number;
  pending: number;
  blocked: number;
  percentage: number;
  modules: Module[];
}

interface LeverageScore {
  moduleId: string;
  moduleName: string;
  score: number;
  reasoning: {
    dreamStateAlignment: number;
    downstreamUnlock: number;
    likelihood: number;
    time: number;
    effort: number;
  };
}

interface RoadmapProgress {
  totalModules: number;
  completeModules: number;
  inProgressModules: number;
  pendingModules: number;
  blockedModules: number;
  overallPercentage: number;
  layerProgress: LayerProgress[];
  currentModule: Module | null;
  nextModules: Module[];
  criticalPath: Module[];
}

const LAYER_NAMES: Record<number, string> = {
  0: 'Foundation',
  1: 'Core Capabilities',
  2: 'Intelligence',
  3: 'Interface',
  4: 'Domain Loops',
  5: 'Meta & Collaboration',
  6: 'Sovereignty',
};

function StatusIcon({ status }: { status: Module['status'] }) {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case 'in-progress':
      return <PlayCircle className="w-4 h-4 text-yellow-400" />;
    case 'blocked':
      return <XCircle className="w-4 h-4 text-red-400" />;
    default:
      return <Circle className="w-4 h-4 text-gray-500" />;
  }
}

function StatusBadge({ status }: { status: Module['status'] }) {
  const styles: Record<Module['status'], string> = {
    complete: 'bg-green-500/10 text-green-400 border-green-500/20',
    'in-progress': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    blocked: 'bg-red-500/10 text-red-400 border-red-500/20',
    pending: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${styles[status]}`}>
      {status}
    </span>
  );
}

function ProgressBar({ percentage, size = 'default' }: { percentage: number; size?: 'small' | 'default' }) {
  const height = size === 'small' ? 'h-1' : 'h-2';
  return (
    <div className={`w-full bg-[#222] rounded-full ${height}`}>
      <div
        className={`bg-gradient-to-r from-orch-500 to-orch-400 ${height} rounded-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function ModuleCard({
  module,
  isCurrent,
  isNextAvailable,
  leverageScore,
}: {
  module: Module;
  isCurrent: boolean;
  isNextAvailable: boolean;
  leverageScore?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-[#0a0a0a] border rounded-lg p-3 transition-all ${
        isCurrent
          ? 'border-yellow-500/50 ring-1 ring-yellow-500/20'
          : isNextAvailable
          ? 'border-orch-500/30 hover:border-orch-500/50'
          : 'border-[#1a1a1a] hover:border-[#333]'
      }`}
    >
      <div className="flex items-start gap-3">
        <StatusIcon status={module.status} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">{module.name}</span>
            {isCurrent && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                CURRENT
              </span>
            )}
            {isNextAvailable && !isCurrent && leverageScore !== undefined && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orch-500/10 text-orch-400 border border-orch-500/20 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" />
                {leverageScore.toFixed(1)}
              </span>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-400 mt-1"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {expanded ? 'Hide details' : 'Show details'}
          </button>
          {expanded && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-gray-400">{module.description}</p>
              {module.dependsOn.length > 0 && module.dependsOn[0] !== '—' && (
                <div>
                  <span className="text-[10px] text-gray-500">Depends on: </span>
                  <span className="text-[10px] text-gray-400">
                    {module.dependsOn.join(', ')}
                  </span>
                </div>
              )}
              {module.unlocks.length > 0 && (
                <div>
                  <span className="text-[10px] text-gray-500">Unlocks: </span>
                  <span className="text-[10px] text-gray-400">
                    {module.unlocks.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <StatusBadge status={module.status} />
      </div>
    </div>
  );
}

function LayerSection({
  layer,
  currentModuleId,
  nextModuleIds,
  leverageScores,
}: {
  layer: LayerProgress;
  currentModuleId: string | null;
  nextModuleIds: Set<string>;
  leverageScores: Map<string, number>;
}) {
  const [collapsed, setCollapsed] = useState(layer.percentage === 100);

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
      {/* Layer Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full p-4 flex items-center justify-between hover:bg-[#151515] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orch-500/10 rounded-lg flex items-center justify-center text-orch-400 font-bold text-sm">
            {layer.layer}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white">
              Layer {layer.layer}: {LAYER_NAMES[layer.layer]}
            </h3>
            <p className="text-xs text-gray-500">
              {layer.complete}/{layer.total} complete
              {layer.inProgress > 0 && ` • ${layer.inProgress} in progress`}
              {layer.blocked > 0 && ` • ${layer.blocked} blocked`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32">
            <ProgressBar percentage={layer.percentage} size="small" />
          </div>
          <span className="text-sm font-medium text-white w-10 text-right">
            {layer.percentage}%
          </span>
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Layer Modules */}
      {!collapsed && (
        <div className="p-4 pt-0 space-y-2">
          {layer.modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              isCurrent={module.id === currentModuleId}
              isNextAvailable={nextModuleIds.has(module.id)}
              leverageScore={leverageScores.get(module.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  const [progress, setProgress] = useState<RoadmapProgress | null>(null);
  const [leverageScores, setLeverageScores] = useState<LeverageScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [progressRes, leverageRes] = await Promise.all([
        fetchApi('/api/roadmap/progress'),
        fetchApi('/api/roadmap/leverage'),
      ]);

      if (!progressRes.ok) throw new Error('Failed to fetch progress');
      const progressData = await progressRes.json();
      setProgress(progressData);

      if (leverageRes.ok) {
        const leverageData = await leverageRes.json();
        setLeverageScores(leverageData.scores || []);
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

  // Build lookup maps
  const currentModuleId = progress?.currentModule?.id || null;
  const nextModuleIds = new Set(progress?.nextModules.map((m) => m.id) || []);
  const leverageScoreMap = new Map(
    leverageScores.map((s) => [s.moduleId, s.score])
  );

  if (offline) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <LayoutGrid className="w-6 h-6 text-orch-400" />
          <h1 className="text-2xl font-bold text-white">Roadmap</h1>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <WifiOff className="w-10 h-10 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Roadmap requires a running orchestrator server</p>
          <p className="text-gray-600 text-sm">Start the server to view module progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-6 h-6 text-orch-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Roadmap</h1>
            <p className="text-sm text-gray-500">Module ladder to system completion</p>
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

      {progress && (
        <>
          {/* Overall Progress */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-orch-400" />
                <span className="text-lg font-semibold text-white">Overall Progress</span>
              </div>
              <span className="text-2xl font-bold text-white">
                {progress.overallPercentage}%
              </span>
            </div>
            <ProgressBar percentage={progress.overallPercentage} />
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <p className="text-xl font-bold text-green-400">{progress.completeModules}</p>
                <p className="text-xs text-gray-500">Complete</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-yellow-400">{progress.inProgressModules}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-400">{progress.pendingModules}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-400">{progress.blockedModules}</p>
                <p className="text-xs text-gray-500">Blocked</p>
              </div>
            </div>
          </div>

          {/* Next Highest Leverage */}
          {leverageScores.length > 0 && (
            <div className="bg-[#111] border border-orch-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-orch-400" />
                <span className="text-lg font-semibold text-white">Next Highest Leverage</span>
              </div>
              <div className="space-y-3">
                {leverageScores.slice(0, 3).map((score, index) => (
                  <div
                    key={score.moduleId}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      index === 0
                        ? 'bg-orch-500/10 border border-orch-500/20'
                        : 'bg-[#0a0a0a] border border-[#1a1a1a]'
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-white">{score.moduleName}</span>
                      <div className="flex gap-4 mt-1 text-[10px] text-gray-500">
                        <span>DSA: {score.reasoning.dreamStateAlignment.toFixed(1)}</span>
                        <span>Unlock: {score.reasoning.downstreamUnlock.toFixed(1)}</span>
                        <span>Likelihood: {score.reasoning.likelihood.toFixed(1)}</span>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${index === 0 ? 'text-orch-400' : 'text-gray-400'}`}>
                      {score.score.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layer Sections */}
          <div className="space-y-4">
            {progress.layerProgress
              .sort((a, b) => a.layer - b.layer)
              .map((layer) => (
                <LayerSection
                  key={layer.layer}
                  layer={layer}
                  currentModuleId={currentModuleId}
                  nextModuleIds={nextModuleIds}
                  leverageScores={leverageScoreMap}
                />
              ))}
          </div>

          {/* Critical Path */}
          {progress.criticalPath.length > 0 && (
            <div className="bg-[#111] border border-[#222] rounded-xl p-6 mt-6">
              <h3 className="text-sm font-semibold text-white mb-3">Critical Path</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {progress.criticalPath.map((module, index) => (
                  <div key={module.id} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 bg-[#1a1a1a] px-2 py-1 rounded">
                      {module.name}
                    </span>
                    {index < progress.criticalPath.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
