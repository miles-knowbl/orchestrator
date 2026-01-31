'use client';

import { useEffect, useState } from 'react';
import {
  Target,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Layers,
  FolderCode,
  Component,
  WifiOff
} from 'lucide-react';

interface Module {
  name: string;
  path: string;
  status: 'complete' | 'in-progress' | 'pending';
  functions: { done: number; total: number };
  progress: number;
}

interface System {
  name: string;
  path: string;
  status: 'complete' | 'in-progress' | 'pending';
  modules: Module[];
  progress: number;
  version?: string;
}

interface DreamState {
  organization: {
    name: string;
    vision: string;
    systems: System[];
    progress: number;
  };
  patterns: string[];
  recentCompletions: {
    date: string;
    system: string;
    loop: string;
    outcome: string;
  }[];
}

// Static fallback data
const STATIC_DREAM_STATE: DreamState = {
  organization: {
    name: 'superorganism',
    vision: 'A self-improving AI-assisted development environment where loops orchestrate work across systems.',
    systems: [
      {
        name: 'orchestrator',
        path: '~/workspaces/orchestrator',
        status: 'complete',
        progress: 100,
        version: '0.7.0',
        modules: [
          { name: 'skill-registry', path: 'src/services/SkillRegistry.ts', status: 'complete', functions: { done: 6, total: 6 }, progress: 100 },
          { name: 'loop-composer', path: 'src/services/LoopComposer.ts', status: 'complete', functions: { done: 5, total: 5 }, progress: 100 },
          { name: 'execution-engine', path: 'src/services/ExecutionEngine.ts', status: 'complete', functions: { done: 12, total: 12 }, progress: 100 },
          { name: 'memory-service', path: 'src/services/MemoryService.ts', status: 'complete', functions: { done: 6, total: 6 }, progress: 100 },
          { name: 'learning-service', path: 'src/services/LearningService.ts', status: 'complete', functions: { done: 12, total: 12 }, progress: 100 },
          { name: 'calibration-service', path: 'src/services/CalibrationService.ts', status: 'complete', functions: { done: 4, total: 4 }, progress: 100 },
          { name: 'inbox-processor', path: 'src/services/InboxProcessor.ts', status: 'complete', functions: { done: 5, total: 5 }, progress: 100 },
          { name: 'run-archival', path: 'src/services/RunArchivalService.ts', status: 'complete', functions: { done: 5, total: 5 }, progress: 100 },
          { name: 'guarantee-service', path: 'src/services/GuaranteeService.ts', status: 'complete', functions: { done: 8, total: 8 }, progress: 100 },
          { name: 'loop-guarantee-aggregator', path: 'src/services/LoopGuaranteeAggregator.ts', status: 'complete', functions: { done: 4, total: 4 }, progress: 100 },
          { name: 'deliverable-manager', path: 'src/services/DeliverableManager.ts', status: 'complete', functions: { done: 5, total: 5 }, progress: 100 },
          { name: 'version-utility', path: 'src/version.ts', status: 'complete', functions: { done: 1, total: 1 }, progress: 100 },
          { name: 'http-server', path: 'src/server/httpServer.ts', status: 'complete', functions: { done: 5, total: 5 }, progress: 100 },
          { name: 'loop-commands', path: 'commands/*.md', status: 'complete', functions: { done: 11, total: 11 }, progress: 100 },
        ],
      },
      {
        name: 'dashboard',
        path: '~/workspaces/orchestrator/apps/dashboard',
        status: 'in-progress',
        progress: 70,
        modules: [
          { name: 'loops-view', path: 'app/page.tsx', status: 'complete', functions: { done: 1, total: 1 }, progress: 100 },
          { name: 'skills-view', path: 'app/skills/page.tsx', status: 'complete', functions: { done: 1, total: 1 }, progress: 100 },
          { name: 'inbox-view', path: 'app/inbox/page.tsx', status: 'complete', functions: { done: 1, total: 1 }, progress: 100 },
          { name: 'improvements-view', path: 'app/improvements/page.tsx', status: 'complete', functions: { done: 1, total: 1 }, progress: 100 },
          { name: 'distribute-view', path: 'app/distribute/page.tsx', status: 'complete', functions: { done: 1, total: 1 }, progress: 100 },
          { name: 'run-history-view', path: 'app/runs/page.tsx', status: 'pending', functions: { done: 0, total: 1 }, progress: 0 },
          { name: 'dream-state-view', path: 'app/dream-state/page.tsx', status: 'in-progress', functions: { done: 1, total: 1 }, progress: 100 },
        ],
      },
    ],
    progress: 85,
  },
  patterns: [
    'hierarchy-context-loading',
    'completion-archival',
    'dream-state-rollup',
    'deep-context-protocol',
    'terrain-check',
    'leverage-protocol',
    'version-alignment-architecture',
  ],
  recentCompletions: [
    { date: '2026-01-30', system: 'orchestrator', loop: 'dream-loop', outcome: 'success' },
    { date: '2026-01-30', system: 'orchestrator', loop: 'learning-loop', outcome: 'success' },
    { date: '2026-01-30', system: 'orchestrator', loop: 'distribution-loop', outcome: 'success' },
  ],
};

function ProgressBar({ progress, size = 'md' }: { progress: number; size?: 'sm' | 'md' }) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2';
  return (
    <div className={`w-full bg-[#222] rounded-full ${height} overflow-hidden`}>
      <div
        className={`${height} rounded-full transition-all duration-500 ${
          progress === 100 ? 'bg-orch-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-600'
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function StatusIcon({ status }: { status: 'complete' | 'in-progress' | 'pending' }) {
  if (status === 'complete') {
    return <CheckCircle2 className="w-4 h-4 text-orch-400" />;
  }
  if (status === 'in-progress') {
    return <Circle className="w-4 h-4 text-blue-400 animate-pulse" />;
  }
  return <Circle className="w-4 h-4 text-gray-500" />;
}

function ModuleCard({ module }: { module: Module }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 hover:border-[#333] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusIcon status={module.status} />
          <span className="text-sm font-medium text-white">{module.name}</span>
        </div>
        <span className="text-xs text-gray-500">
          {module.functions.done}/{module.functions.total}
        </span>
      </div>
      <ProgressBar progress={module.progress} size="sm" />
      <p className="text-xs text-gray-600 mt-1.5 font-mono truncate">{module.path}</p>
    </div>
  );
}

function SystemCard({ system, isExpanded, onToggle }: {
  system: System;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const completedModules = system.modules.filter(m => m.status === 'complete').length;

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-3">
          <FolderCode className="w-5 h-5 text-blue-400" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{system.name}</h3>
              {system.version && (
                <span className="text-xs text-gray-500 bg-[#222] px-1.5 py-0.5 rounded">
                  v{system.version}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono">{system.path}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-white">{system.progress}%</p>
            <p className="text-xs text-gray-500">
              {completedModules}/{system.modules.length} modules
            </p>
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
          <div className="mb-3">
            <ProgressBar progress={system.progress} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {system.modules.map((module) => (
              <ModuleCard key={module.name} module={module} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DreamStatePage() {
  const [dreamState, setDreamState] = useState<DreamState>(STATIC_DREAM_STATE);
  const [isStatic, setIsStatic] = useState(true);
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(new Set(['orchestrator']));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to fetch from API, fall back to static
    const fetchDreamState = async () => {
      try {
        const res = await fetch('/api/dream-state');
        if (res.ok) {
          const data = await res.json();
          setDreamState(data);
          setIsStatic(false);
        }
      } catch {
        // Use static data
        setIsStatic(true);
      }
    };

    fetchDreamState();
  }, []);

  const toggleSystem = (name: string) => {
    setExpandedSystems(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
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

  const { organization } = dreamState;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {isStatic && (
        <div className="mb-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 text-sm text-yellow-400">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Viewing static dream state. Start the orchestrator server for live data.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-orch-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Dream State</h1>
          <p className="text-sm text-gray-500">Organization → Systems → Modules</p>
        </div>
      </div>

      {/* Systems */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Systems</h2>
        </div>
        <div className="space-y-4">
          {organization.systems.map((system) => (
            <SystemCard
              key={system.name}
              system={system}
              isExpanded={expandedSystems.has(system.name)}
              onToggle={() => toggleSystem(system.name)}
            />
          ))}
        </div>
      </div>

      {/* Patterns */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Component className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Active Patterns</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {dreamState.patterns.map((pattern) => (
            <span
              key={pattern}
              className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-lg border border-purple-500/20"
            >
              {pattern}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
