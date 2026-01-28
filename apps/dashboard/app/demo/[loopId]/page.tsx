'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Play, Pause, RotateCcw, FlaskConical, Shield,
} from 'lucide-react';
import { fetchWithFallback } from '@/lib/api';
import { useDemoExecution } from '@/lib/demo-engine';
import type { LoopForDemo, DemoConfig } from '@/lib/demo-engine';
import { PhaseTimeline } from '@/components/execution/PhaseTimeline';
import { GateStatus } from '@/components/execution/GateStatus';
import type { GateDefinition } from '@/components/execution/types';
import { LogViewer } from '@/components/execution/LogViewer';

// ---------------------------------------------------------------------------
// Launch form (shown before demo starts)
// ---------------------------------------------------------------------------

function DemoLaunchForm({
  loop,
  onStart,
}: {
  loop: LoopForDemo;
  onStart: (config: DemoConfig) => void;
}) {
  const [project, setProject] = useState('my-feature');
  const [mode, setMode] = useState('greenfield');
  const [autonomy, setAutonomy] = useState<'supervised' | 'autonomous'>('autonomous');

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#222] bg-[#0d0d0d]">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Demo: {loop.name}</h2>
              <p className="text-sm text-gray-500">Configure and launch a simulated execution</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Project Name</label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="my-feature"
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-orch-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:border-orch-500 focus:outline-none"
            >
              <option value="greenfield">Greenfield (new project)</option>
              <option value="brownfield-major">Brownfield Major (big feature)</option>
              <option value="brownfield-minor">Brownfield Minor (small change)</option>
              <option value="brownfield-patch">Brownfield Patch (bug fix)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Autonomy Level</label>
            <select
              value={autonomy}
              onChange={(e) => setAutonomy(e.target.value as 'supervised' | 'autonomous')}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:border-orch-500 focus:outline-none"
            >
              <option value="autonomous">Autonomous (auto-approve gates)</option>
              <option value="supervised">Supervised (pause at gates for approval)</option>
            </select>
          </div>

          <button
            onClick={() => onStart({ project: project.trim() || 'my-feature', mode, autonomy })}
            className="w-full mt-2 px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-400 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Demo
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Speed presets
// ---------------------------------------------------------------------------

const SPEED_PRESETS = [
  { label: 'Slow', ms: 1500 },
  { label: 'Normal', ms: 800 },
  { label: 'Fast', ms: 300 },
] as const;

// ---------------------------------------------------------------------------
// Demo execution view
// ---------------------------------------------------------------------------

function DemoExecutionView({
  loop,
  config,
}: {
  loop: LoopForDemo;
  config: DemoConfig;
}) {
  const {
    execution,
    isPlaying,
    speed,
    waitingForGate,
    play,
    pause,
    setSpeed,
    completeSkill,
    skipSkill,
    completePhase,
    advancePhase,
    approveGate,
    rejectGate,
    reset,
  } = useDemoExecution(loop, config);

  const totalSkills = execution.phases.reduce((sum, p) => sum + p.skills.length, 0);
  const completedSkills = execution.phases.reduce(
    (sum, p) => sum + p.skills.filter(s => s.status === 'completed' || s.status === 'skipped').length, 0,
  );
  const progressPercent = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

  const statusColors: Record<string, string> = {
    active: 'bg-orch-500 text-white',
    completed: 'bg-blue-500 text-white',
    failed: 'bg-red-500 text-white',
  };

  return (
    <>
      {/* Demo banner */}
      <div className="mb-4 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 text-sm text-amber-400">
        <FlaskConical className="w-4 h-4 shrink-0" />
        <span>Demo Mode &mdash; This is a simulated execution, not connected to a real backend.</span>
      </div>

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{loop.name}</h1>
              <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[execution.status] || 'bg-gray-600 text-white'}`}>
                {execution.status}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                DEMO
              </span>
            </div>
            <p className="text-gray-400 text-sm">{execution.project}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 bg-[#1a1a1a] px-2 py-1 rounded">
              Mode: {execution.mode}
            </span>
            <span className="text-gray-500 bg-[#1a1a1a] px-2 py-1 rounded">
              Autonomy: {execution.autonomy}
            </span>
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="mb-6 flex items-center gap-4 bg-[#111] border border-[#222] rounded-xl px-4 py-3">
        {/* Play / Pause */}
        {execution.status === 'active' ? (
          <button
            onClick={isPlaying ? pause : play}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-lg text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        ) : (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-lg text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        )}

        {/* Speed selector */}
        <div className="flex items-center gap-1 bg-[#0a0a0a] rounded-lg p-0.5">
          {SPEED_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setSpeed(preset.ms)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                speed === preset.ms
                  ? 'bg-orch-500/20 text-orch-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 flex-1 ml-2">
          <div className="w-32 h-1.5 bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orch-500 to-orch-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{completedSkills}/{totalSkills} skills ({progressPercent}%)</span>
        </div>

        {/* Gate waiting indicator */}
        {waitingForGate && (
          <div className="flex items-center gap-2 text-xs text-amber-400 animate-pulse">
            <Shield className="w-3.5 h-3.5" />
            <span>Waiting: {waitingForGate}</span>
          </div>
        )}

        {/* Reset */}
        {execution.status === 'active' && (
          <button
            onClick={reset}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            title="Reset demo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Phase Timeline & Gates */}
        <div className="space-y-4">
          <PhaseTimeline
            phases={execution.phases}
            currentPhase={execution.currentPhase}
            executionStatus={waitingForGate ? 'blocked' : execution.status}
            onCompletePhase={completePhase}
            onAdvancePhase={advancePhase}
            onCompleteSkill={completeSkill}
            onSkipSkill={skipSkill}
            actionLoading={null}
          />
          <GateStatus
            gates={execution.gates}
            gateDefinitions={loop.gates as GateDefinition[]}
            executionStatus={waitingForGate ? 'blocked' : execution.status}
            onApprove={approveGate}
            onReject={rejectGate}
            actionLoading={null}
          />
        </div>

        {/* Right: Logs */}
        <div className="lg:col-span-2">
          <LogViewer logs={execution.logs} autoScroll={true} />
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main demo page
// ---------------------------------------------------------------------------

export default function DemoPage() {
  const params = useParams();
  const loopId = params.loopId as string;

  const [loop, setLoop] = useState<LoopForDemo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoConfig, setDemoConfig] = useState<DemoConfig | null>(null);

  useEffect(() => {
    const fetchLoop = async () => {
      try {
        const { data } = await fetchWithFallback(`/api/loops/${loopId}`);
        setLoop(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load loop data');
      }
    };
    fetchLoop();
  }, [loopId]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <a href="/loops" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Loops
        </a>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!loop) {
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
      <a href={`/loops/${loopId}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to {loop.name}
      </a>

      {demoConfig ? (
        <DemoExecutionView loop={loop} config={demoConfig} />
      ) : (
        <DemoLaunchForm loop={loop} onStart={setDemoConfig} />
      )}
    </div>
  );
}
