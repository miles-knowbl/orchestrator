'use client';

import { useEffect, useState, useMemo } from 'react';
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
import OODAClock from '@/components/ooda-clock/OODAClock';

// ---------------------------------------------------------------------------
// Clock event transformation
// ---------------------------------------------------------------------------

interface ClockEvent {
  id: string;
  type: 'skill' | 'pattern' | 'gate' | 'phase';
  name: string;
  startAngle: number;
  endAngle?: number;
  radius: 'inner' | 'middle' | 'outer';
  color: string;
  timestamp: string;
  duration?: number;
  status: 'pending' | 'active' | 'complete' | 'failed';
}

const PHASE_ANGLES: Record<string, { start: number; end: number }> = {
  INIT: { start: 270, end: 315 },
  SCAFFOLD: { start: 315, end: 360 },
  IMPLEMENT: { start: 0, end: 45 },
  TEST: { start: 45, end: 90 },
  VERIFY: { start: 90, end: 120 },
  VALIDATE: { start: 120, end: 150 },
  DOCUMENT: { start: 150, end: 180 },
  REVIEW: { start: 180, end: 210 },
  SHIP: { start: 210, end: 240 },
  COMPLETE: { start: 240, end: 270 },
};

const CLOCK_COLORS = {
  skill: '#10b981',
  gate: '#f59e0b',
  pattern: '#0ea5e9',
  phase: '#8b5cf6',
};

function transformLogsToClockEvents(logs: Array<{
  id: string;
  timestamp: string;
  level: string;
  category: string;
  message: string;
  phase?: string;
  skillId?: string;
  gateId?: string;
  durationMs?: number;
}>): ClockEvent[] {
  return logs
    .filter(log => ['skill', 'gate', 'phase'].includes(log.category))
    .map(log => {
      const type: ClockEvent['type'] = log.category === 'skill' ? 'skill' :
                   log.category === 'gate' ? 'gate' :
                   log.category === 'pattern' ? 'pattern' : 'phase';
      const phase = log.phase || 'INIT';
      const phaseAngles = PHASE_ANGLES[phase] || PHASE_ANGLES.INIT;
      const angle = (phaseAngles.start + phaseAngles.end) / 2;

      const name = log.skillId || log.gateId || log.phase || log.message.substring(0, 20);

      const msg = log.message.toLowerCase();
      let status: ClockEvent['status'] = 'pending';
      if (log.level === 'error') status = 'failed';
      else if (msg.includes('complete') || msg.includes('passed') || msg.includes('approved')) status = 'complete';
      else if (msg.includes('start') || msg.includes('begin') || msg.includes('running')) status = 'active';

      const radius: ClockEvent['radius'] = type === 'gate' ? 'outer' : type === 'pattern' ? 'middle' : 'inner';

      return {
        id: log.id,
        type,
        name,
        startAngle: angle,
        endAngle: log.durationMs ? angle + (log.durationMs / 60000) * 360 : undefined,
        radius,
        color: log.level === 'error' ? '#ef4444' : CLOCK_COLORS[type],
        timestamp: log.timestamp,
        duration: log.durationMs,
        status,
      };
    });
}

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

  // Transform logs to clock events
  const clockEvents = useMemo(() => {
    return transformLogsToClockEvents(execution.logs);
  }, [execution.logs]);

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

      {/* Hero: OODA Clock */}
      <div className="mb-6 bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-start gap-8">
          {/* Clock visualization */}
          <div className="shrink-0">
            <OODAClock
              events={clockEvents}
              currentPhase={execution.currentPhase}
              isLive={execution.status === 'active' && isPlaying}
              size={280}
            />
          </div>

          {/* Clock stats */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-400 mb-4">OODA Rhythm</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a0a0a] rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{clockEvents.length}</div>
                <div className="text-xs text-gray-500">Events</div>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-3">
                <div className="text-2xl font-bold text-emerald-400">
                  {clockEvents.filter(e => e.type === 'skill').length}
                </div>
                <div className="text-xs text-gray-500">Skills</div>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-400">
                  {clockEvents.filter(e => e.type === 'gate').length}
                </div>
                <div className="text-xs text-gray-500">Gates</div>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-3">
                <div className="text-2xl font-bold text-violet-400">
                  {clockEvents.filter(e => e.type === 'phase').length}
                </div>
                <div className="text-xs text-gray-500">Phases</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Current quadrant: <span className="text-white font-medium">{
                execution.currentPhase === 'INIT' || execution.currentPhase === 'SCAFFOLD' ? 'OBSERVE → ORIENT' :
                execution.currentPhase === 'IMPLEMENT' || execution.currentPhase === 'TEST' ? 'ORIENT → DECIDE' :
                execution.currentPhase === 'VERIFY' || execution.currentPhase === 'VALIDATE' || execution.currentPhase === 'DOCUMENT' ? 'DECIDE → ACT' :
                'ACT → COMPLETE'
              }</span>
            </div>
          </div>
        </div>
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
