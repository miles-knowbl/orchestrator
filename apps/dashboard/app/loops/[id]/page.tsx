'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Layers, Play, Zap, Shield, ChevronRight, Settings, X, BookOpen } from 'lucide-react';
import { Prose } from '@/components/Prose';
import { fetchApi } from '@/lib/api';

const phaseColors: Record<string, string> = {
  INIT: 'bg-purple-500',
  SCAFFOLD: 'bg-blue-500',
  IMPLEMENT: 'bg-orch-500',
  TEST: 'bg-yellow-500',
  VERIFY: 'bg-orange-500',
  VALIDATE: 'bg-pink-500',
  DOCUMENT: 'bg-cyan-500',
  REVIEW: 'bg-indigo-500',
  SHIP: 'bg-red-500',
  COMPLETE: 'bg-gray-500',
};

interface LoopPhase {
  name: string;
  order: number;
  skills: { skillId: string; required: boolean }[];
  required: boolean;
}

interface LoopGate {
  id: string;
  name: string;
  afterPhase: string;
  required: boolean;
  approvalType: string;
  deliverables?: string[];
}

interface LoopDetail {
  id: string;
  name: string;
  version: string;
  description: string;
  content?: string;
  phases: LoopPhase[];
  gates: LoopGate[];
  defaultMode?: string;
  defaultAutonomy?: string;
  skillCount: number;
  phaseCount: number;
  createdAt?: string;
  updatedAt?: string;
  author?: string;
}

function PhaseTimeline({ phases, gates }: { phases: LoopPhase[]; gates: LoopGate[] }) {
  // Create a map of gates by afterPhase
  const gatesByPhase: Record<string, LoopGate[]> = {};
  gates.forEach(gate => {
    if (!gatesByPhase[gate.afterPhase]) {
      gatesByPhase[gate.afterPhase] = [];
    }
    gatesByPhase[gate.afterPhase].push(gate);
  });

  return (
    <div className="space-y-2">
      {phases.map((phase, idx) => (
        <div key={phase.name}>
          {/* Phase */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${phaseColors[phase.name] || 'bg-gray-500'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{phase.name}</span>
                    {!phase.required && (
                      <span className="text-xs text-gray-500 bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                        Optional
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{phase.skills.length} skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {phase.skills.map((skill) => (
                    <a
                      key={skill.skillId}
                      href={`/skills/${skill.skillId}`}
                      className="inline-flex items-center gap-1 text-xs bg-[#1a1a1a] hover:bg-[#222] px-2 py-1 rounded transition-colors"
                    >
                      <Zap className="w-3 h-3 text-purple-400" />
                      <span className="text-gray-300">{skill.skillId}</span>
                      {!skill.required && (
                        <span className="text-gray-600">?</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Gates after this phase */}
          {gatesByPhase[phase.name]?.map((gate) => (
            <div key={gate.id} className="flex items-center gap-2 py-2 px-4">
              <div className="flex-1 border-t border-dashed border-[#333]" />
              <div className="flex items-center gap-2 bg-[#161616] border border-[#333] rounded-lg px-3 py-1.5">
                <Shield className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-gray-400">{gate.name}</span>
                {gate.deliverables && gate.deliverables.length > 0 && (
                  <span className="text-xs text-gray-600">
                    ({gate.deliverables.length} deliverables)
                  </span>
                )}
              </div>
              <div className="flex-1 border-t border-dashed border-[#333]" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function StartExecutionModal({
  loop,
  onClose,
  onStart
}: {
  loop: LoopDetail;
  onClose: () => void;
  onStart: (config: { project: string; mode: string; autonomy: string }) => void;
}) {
  const [project, setProject] = useState('');
  const [mode, setMode] = useState(loop.defaultMode || 'greenfield');
  const [autonomy, setAutonomy] = useState(loop.defaultAutonomy || 'supervised');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.trim()) return;

    setLoading(true);
    await onStart({ project: project.trim(), mode, autonomy });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#111] border border-[#222] rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[#222]">
          <h2 className="text-lg font-semibold text-white">Start Execution</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Project Name</label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="my-feature"
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-orch-500 focus:outline-none"
              autoFocus
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
              onChange={(e) => setAutonomy(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:border-orch-500 focus:outline-none"
            >
              <option value="supervised">Supervised (requires approval at gates)</option>
              <option value="autonomous">Autonomous (auto-advance through gates)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#222] rounded-lg text-gray-400 hover:text-white hover:border-[#333] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!project.trim() || loading}
              className="flex-1 px-4 py-2 bg-orch-500 hover:bg-orch-600 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loop, setLoop] = useState<LoopDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);

  useEffect(() => {
    const fetchLoop = async () => {
      try {
        const res = await fetchApi(`/api/loops/${id}`);
        if (!res.ok) throw new Error('Loop not found');
        const data = await res.json();
        setLoop(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchLoop();
  }, [id]);

  const handleStartExecution = async (config: { project: string; mode: string; autonomy: string }) => {
    try {
      const res = await fetchApi('/api/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loopId: loop!.id,
          ...config,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start execution');
      }

      const execution = await res.json();
      router.push(`/executions/${execution.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start execution');
      setShowStartModal(false);
    }
  };

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
      {/* Header */}
      <div className="mb-6">
        <a href="/loops" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Loops
        </a>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Layers className="w-7 h-7 text-blue-400 shrink-0" />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{loop.name}</h1>
                <span className="text-sm text-gray-500 bg-[#1a1a1a] px-2 py-0.5 rounded">
                  v{loop.version}
                </span>
              </div>
              <p className="text-gray-400">{loop.description}</p>
            </div>
          </div>

          <button
            onClick={() => setShowStartModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orch-500 hover:bg-orch-600 rounded-lg text-white font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Execution
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Play className="w-4 h-4 text-orch-400" />
            <span className="text-xs text-gray-500">Phases</span>
          </div>
          <p className="text-2xl font-bold text-white">{loop.phaseCount}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-500">Skills</span>
          </div>
          <p className="text-2xl font-bold text-white">{loop.skillCount}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-500">Gates</span>
          </div>
          <p className="text-2xl font-bold text-white">{loop.gates.length}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-500">Default Mode</span>
          </div>
          <p className="text-sm font-medium text-white">{loop.defaultMode || 'greenfield'}</p>
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Phase Timeline</h2>
        <PhaseTimeline phases={loop.phases} gates={loop.gates} />
      </div>

      {/* LOOP.md Content */}
      {loop.content && (
        <div className="mb-6">
          <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#222] bg-[#0d0d0d] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-white">LOOP.md</span>
            </div>
            <div className="p-6">
              <Prose>{loop.content}</Prose>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      {(loop.author || loop.createdAt || loop.updatedAt) && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-3">Metadata</h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            {loop.author && (
              <div>
                <span className="text-gray-500">Author</span>
                <p className="text-gray-400 mt-1">{loop.author}</p>
              </div>
            )}
            {loop.createdAt && (
              <div>
                <span className="text-gray-500">Created</span>
                <p className="text-gray-400 mt-1">{new Date(loop.createdAt).toLocaleDateString()}</p>
              </div>
            )}
            {loop.updatedAt && (
              <div>
                <span className="text-gray-500">Updated</span>
                <p className="text-gray-400 mt-1">{new Date(loop.updatedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start Execution Modal */}
      {showStartModal && (
        <StartExecutionModal
          loop={loop}
          onClose={() => setShowStartModal(false)}
          onStart={handleStartExecution}
        />
      )}
    </div>
  );
}
