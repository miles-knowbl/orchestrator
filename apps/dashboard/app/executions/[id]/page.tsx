'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Play, Pause, CheckCircle, XCircle, Clock,
  StopCircle, ShieldCheck, ShieldX, ChevronRight, X,
} from 'lucide-react';
import { fetchApi, apiUrl } from '@/lib/api';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: 'phase' | 'skill' | 'gate' | 'system';
  phase?: string;
  skillId?: string;
  gateId?: string;
  message: string;
  details?: Record<string, unknown>;
}

interface Execution {
  id: string;
  loopId: string;
  loopVersion: string;
  project: string;
  mode: string;
  autonomy: string;
  currentPhase: string;
  status: string;
  phases: {
    phase: string;
    status: string;
    startedAt?: string;
    completedAt?: string;
    skills: { skillId: string; status: string }[];
  }[];
  gates: { gateId: string; status: string; approvedBy?: string; approvedAt?: string }[];
  logs: LogEntry[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ---------------------------------------------------------------------------
// PhaseTimeline — now interactive
// ---------------------------------------------------------------------------

function PhaseTimeline({
  phases,
  currentPhase,
  executionStatus,
  onCompletePhase,
  onAdvancePhase,
  onCompleteSkill,
  onSkipSkill,
  actionLoading,
}: {
  phases: Execution['phases'];
  currentPhase: string;
  executionStatus: string;
  onCompletePhase: () => void;
  onAdvancePhase: () => void;
  onCompleteSkill: (skillId: string) => void;
  onSkipSkill: (skillId: string, reason: string) => void;
  actionLoading: string | null;
}) {
  const [skipInputs, setSkipInputs] = useState<Record<string, string>>({});
  const [showSkip, setShowSkip] = useState<string | null>(null);

  const isActive = executionStatus === 'active';

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-orch-500" />;
      case 'in-progress':
        return <Play className="w-4 h-4 text-blue-400" />;
      case 'skipped':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4">
      <h3 className="text-sm font-medium text-white mb-4">Phase Progress</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#222]" />

        <div className="space-y-3">
          {phases.map((phase) => {
            const isCurrent = phase.phase === currentPhase;
            const allSkillsDone = phase.skills.every(
              s => s.status === 'completed' || s.status === 'skipped'
            );

            return (
              <div key={phase.phase} className="relative">
                <div className="flex items-start gap-3">
                  <div className={`relative z-10 w-4 h-4 flex items-center justify-center rounded-full ${
                    phase.status === 'in-progress' ? 'bg-blue-500/20' :
                    phase.status === 'completed' ? 'bg-orch-500/20' : 'bg-[#1a1a1a]'
                  }`}>
                    {getPhaseIcon(phase.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        isCurrent ? 'text-white' : 'text-gray-400'
                      }`}>
                        {phase.phase}
                      </span>
                      {phase.status === 'in-progress' && (
                        <span className="text-xs text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Skills list for current phase */}
                    {isCurrent && isActive ? (
                      <div className="mt-2 space-y-1.5">
                        {phase.skills.map((skill) => {
                          const canAct = skill.status === 'pending' || skill.status === 'in-progress';
                          return (
                            <div key={skill.skillId} className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                skill.status === 'completed' ? 'bg-orch-500' :
                                skill.status === 'in-progress' ? 'bg-blue-400' :
                                skill.status === 'skipped' ? 'bg-gray-500' :
                                skill.status === 'failed' ? 'bg-red-500' : 'bg-gray-600'
                              }`} />
                              <span className="text-xs text-gray-300 flex-1 truncate">{skill.skillId}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                skill.status === 'completed' ? 'bg-orch-500/10 text-orch-400' :
                                skill.status === 'skipped' ? 'bg-gray-500/10 text-gray-400' :
                                'bg-[#1a1a1a] text-gray-500'
                              }`}>
                                {skill.status}
                              </span>
                              {canAct && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => onCompleteSkill(skill.skillId)}
                                    disabled={actionLoading !== null}
                                    className="text-xs px-2 py-0.5 bg-orch-500/20 text-orch-400 hover:bg-orch-500/30 rounded disabled:opacity-50 transition-colors"
                                  >
                                    Complete
                                  </button>
                                  {showSkip === skill.skillId ? (
                                    <div className="flex gap-1">
                                      <input
                                        type="text"
                                        value={skipInputs[skill.skillId] || ''}
                                        onChange={(e) => setSkipInputs(prev => ({ ...prev, [skill.skillId]: e.target.value }))}
                                        placeholder="Reason..."
                                        className="text-xs bg-[#0a0a0a] border border-[#333] rounded px-2 py-0.5 text-white w-28 focus:border-yellow-500 focus:outline-none"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && skipInputs[skill.skillId]?.trim()) {
                                            onSkipSkill(skill.skillId, skipInputs[skill.skillId].trim());
                                            setShowSkip(null);
                                            setSkipInputs(prev => ({ ...prev, [skill.skillId]: '' }));
                                          }
                                          if (e.key === 'Escape') setShowSkip(null);
                                        }}
                                      />
                                      <button
                                        onClick={() => {
                                          if (skipInputs[skill.skillId]?.trim()) {
                                            onSkipSkill(skill.skillId, skipInputs[skill.skillId].trim());
                                            setShowSkip(null);
                                            setSkipInputs(prev => ({ ...prev, [skill.skillId]: '' }));
                                          }
                                        }}
                                        disabled={!skipInputs[skill.skillId]?.trim() || actionLoading !== null}
                                        className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded disabled:opacity-50 transition-colors"
                                      >
                                        Go
                                      </button>
                                      <button
                                        onClick={() => setShowSkip(null)}
                                        className="text-xs px-1 py-0.5 text-gray-500 hover:text-gray-300"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setShowSkip(skill.skillId)}
                                      disabled={actionLoading !== null}
                                      className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded disabled:opacity-50 transition-colors"
                                    >
                                      Skip
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Phase-level actions */}
                        {phase.status === 'in-progress' && allSkillsDone && (
                          <button
                            onClick={onCompletePhase}
                            disabled={actionLoading !== null}
                            className="mt-2 flex items-center gap-1.5 text-xs px-3 py-1.5 bg-orch-500/20 text-orch-400 hover:bg-orch-500/30 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Complete Phase
                          </button>
                        )}
                        {phase.status === 'completed' && (
                          <button
                            onClick={onAdvancePhase}
                            disabled={actionLoading !== null}
                            className="mt-2 flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            <ChevronRight className="w-3 h-3" />
                            Advance to Next Phase
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Compact dot view for non-current phases */
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {phase.skills.map((skill) => (
                            <div
                              key={skill.skillId}
                              className={`w-1.5 h-1.5 rounded-full ${
                                skill.status === 'completed' ? 'bg-orch-500' :
                                skill.status === 'in-progress' ? 'bg-blue-400' :
                                skill.status === 'failed' ? 'bg-red-500' : 'bg-gray-600'
                              }`}
                              title={skill.skillId}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {phase.skills.filter(s => s.status === 'completed').length}/{phase.skills.length} skills
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LogViewer — unchanged
// ---------------------------------------------------------------------------

function LogViewer({ logs, autoScroll }: { logs: LogEntry[]; autoScroll: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-gray-300';
      case 'debug': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'phase': return '📍';
      case 'skill': return '⚡';
      case 'gate': return '🚪';
      case 'system': return '🔧';
      default: return '•';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#0d0d0d] border border-[#222] rounded-xl overflow-hidden"
    >
      <div className="p-3 border-b border-[#222] bg-[#111] flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Execution Logs</h3>
        <span className="text-xs text-gray-500">{logs.length} entries</span>
      </div>
      <div className="h-[400px] overflow-y-auto p-3 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No log entries yet
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 py-1 hover:bg-[#161616] px-2 rounded animate-slide-in"
              >
                <span className="text-gray-600 shrink-0">{formatTime(log.timestamp)}</span>
                <span className="shrink-0">{getCategoryIcon(log.category)}</span>
                <span className={`${getLevelColor(log.level)}`}>
                  {log.message}
                  {log.phase && <span className="text-gray-500 ml-2">[{log.phase}]</span>}
                  {log.skillId && <span className="text-purple-400 ml-2">@{log.skillId}</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GateStatus — now interactive
// ---------------------------------------------------------------------------

function GateStatus({
  gates,
  executionStatus,
  onApprove,
  onReject,
  actionLoading,
}: {
  gates: Execution['gates'];
  executionStatus: string;
  onApprove: (gateId: string) => void;
  onReject: (gateId: string, feedback: string) => void;
  actionLoading: string | null;
}) {
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  if (gates.length === 0) return null;

  const isActive = executionStatus === 'active' || executionStatus === 'blocked';

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4">
      <h3 className="text-sm font-medium text-white mb-3">Gates</h3>
      <div className="space-y-2">
        {gates.map((gate) => (
          <div key={gate.gateId}>
            <div
              className={`flex items-center justify-between p-2 rounded-lg ${
                gate.status === 'approved' ? 'bg-orch-500/10' :
                gate.status === 'rejected' ? 'bg-red-500/10' : 'bg-[#1a1a1a]'
              }`}
            >
              <span className="text-sm text-gray-300">{gate.gateId}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  gate.status === 'approved' ? 'bg-orch-500/20 text-orch-400' :
                  gate.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-600/20 text-gray-400'
                }`}>
                  {gate.status}
                </span>
                {gate.status === 'pending' && isActive && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => onApprove(gate.gateId)}
                      disabled={actionLoading !== null}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 bg-orch-500/20 text-orch-400 hover:bg-orch-500/30 rounded disabled:opacity-50 transition-colors"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectTarget(gate.gateId)}
                      disabled={actionLoading !== null}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded disabled:opacity-50 transition-colors"
                    >
                      <ShieldX className="w-3 h-3" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Reject feedback input */}
            {rejectTarget === gate.gateId && (
              <div className="flex gap-2 mt-2 pl-2">
                <input
                  type="text"
                  value={rejectFeedback}
                  onChange={(e) => setRejectFeedback(e.target.value)}
                  placeholder="Feedback for rejection..."
                  className="flex-1 text-xs bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-1.5 text-white focus:border-red-500 focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && rejectFeedback.trim()) {
                      onReject(gate.gateId, rejectFeedback.trim());
                      setRejectTarget(null);
                      setRejectFeedback('');
                    }
                    if (e.key === 'Escape') {
                      setRejectTarget(null);
                      setRejectFeedback('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (rejectFeedback.trim()) {
                      onReject(gate.gateId, rejectFeedback.trim());
                      setRejectTarget(null);
                      setRejectFeedback('');
                    }
                  }}
                  disabled={!rejectFeedback.trim() || actionLoading !== null}
                  className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Submit
                </button>
                <button
                  onClick={() => { setRejectTarget(null); setRejectFeedback(''); }}
                  className="text-xs px-2 py-1.5 text-gray-500 hover:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExecutionDetail — main page
// ---------------------------------------------------------------------------

export default function ExecutionDetail() {
  const params = useParams();
  const id = params.id as string;

  const [execution, setExecution] = useState<Execution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Fetch execution data
  const fetchExecution = useCallback(async () => {
    try {
      const res = await fetchApi(`/api/executions/${id}`);
      if (!res.ok) throw new Error('Execution not found');
      const data = await res.json();
      setExecution(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [id]);

  useEffect(() => {
    fetchExecution();

    // Set up SSE for live updates
    const eventSource = new EventSource(apiUrl(`/api/executions/${id}/stream`));

    eventSource.addEventListener('log', (event) => {
      const log = JSON.parse(event.data);
      setExecution(prev => {
        if (!prev) return prev;
        return { ...prev, logs: [...prev.logs, log] };
      });
    });

    eventSource.addEventListener('state', (event) => {
      const state = JSON.parse(event.data);
      setExecution(prev => {
        if (!prev) return prev;
        return { ...prev, ...state };
      });
    });

    eventSource.addEventListener('complete', () => {
      eventSource.close();
      fetchExecution();
    });

    eventSource.onerror = () => {
      const interval = setInterval(fetchExecution, 3000);
      return () => clearInterval(interval);
    };

    return () => {
      eventSource.close();
    };
  }, [id, fetchExecution]);

  // Generic action helper
  const performAction = useCallback(async (
    path: string,
    label: string,
    body?: Record<string, unknown>
  ) => {
    setActionLoading(label);
    setActionError(null);
    try {
      const res = await fetchApi(`/api/executions/${id}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${label}`);
      }
      const data = await res.json();
      // abort returns {success:true} — re-fetch instead
      if (data.success && !data.id) {
        await fetchExecution();
      } else {
        setExecution(data);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `Failed to ${label}`);
    } finally {
      setActionLoading(null);
    }
  }, [id, fetchExecution]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <a href="/executions" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Executions
        </a>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-orch-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'bg-orch-500 text-white',
    completed: 'bg-blue-500 text-white',
    failed: 'bg-red-500 text-white',
    paused: 'bg-yellow-500 text-black',
    blocked: 'bg-orange-500 text-white',
  };

  const canPause = execution.status === 'active';
  const canResume = execution.status === 'paused';
  const canAbort = execution.status === 'active' || execution.status === 'paused';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Action Error Banner */}
      {actionError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-red-400">{actionError}</p>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <a href="/executions" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Executions
        </a>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{execution.loopId}</h1>
              <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[execution.status] || 'bg-gray-600 text-white'}`}>
                {execution.status}
              </span>
            </div>
            <p className="text-gray-400">{execution.project}</p>
            <p className="text-xs text-gray-500 mt-1">
              Started {new Date(execution.startedAt).toLocaleString()}
              {execution.completedAt && (
                <span> • Completed {new Date(execution.completedAt).toLocaleString()}</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-1 rounded">
              Mode: {execution.mode}
            </span>
            <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-1 rounded">
              Autonomy: {execution.autonomy}
            </span>

            {/* Execution controls */}
            {canPause && (
              <button
                onClick={() => performAction('/pause', 'pause')}
                disabled={actionLoading !== null}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg disabled:opacity-50 transition-colors"
              >
                <Pause className="w-3 h-3" />
                Pause
              </button>
            )}
            {canResume && (
              <button
                onClick={() => performAction('/resume', 'resume')}
                disabled={actionLoading !== null}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-orch-500/20 text-orch-400 hover:bg-orch-500/30 rounded-lg disabled:opacity-50 transition-colors"
              >
                <Play className="w-3 h-3" />
                Resume
              </button>
            )}
            {canAbort && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to abort this execution?')) {
                    performAction('/abort', 'abort');
                  }
                }}
                disabled={actionLoading !== null}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg disabled:opacity-50 transition-colors"
              >
                <StopCircle className="w-3 h-3" />
                Abort
              </button>
            )}
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
            executionStatus={execution.status}
            onCompletePhase={() => performAction('/complete-phase', 'complete phase')}
            onAdvancePhase={() => performAction('/advance', 'advance phase')}
            onCompleteSkill={(skillId) => performAction(`/skills/${skillId}/complete`, `complete ${skillId}`)}
            onSkipSkill={(skillId, reason) => performAction(`/skills/${skillId}/skip`, `skip ${skillId}`, { reason })}
            actionLoading={actionLoading}
          />
          <GateStatus
            gates={execution.gates}
            executionStatus={execution.status}
            onApprove={(gateId) => performAction(`/gates/${gateId}/approve`, `approve ${gateId}`, { approvedBy: 'dashboard' })}
            onReject={(gateId, feedback) => performAction(`/gates/${gateId}/reject`, `reject ${gateId}`, { feedback })}
            actionLoading={actionLoading}
          />
        </div>

        {/* Right: Logs */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded border-gray-600 bg-transparent"
              />
              Auto-scroll
            </label>
          </div>
          <LogViewer logs={execution.logs || []} autoScroll={autoScroll} />
        </div>
      </div>
    </div>
  );
}
