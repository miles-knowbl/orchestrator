'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Play, Pause,
  StopCircle, X, WifiOff,
} from 'lucide-react';
import { fetchApi, apiUrl } from '@/lib/api';
import type { Execution } from '@/components/execution/types';
import { PhaseTimeline } from '@/components/execution/PhaseTimeline';
import { GateStatus } from '@/components/execution/GateStatus';
import { LogViewer } from '@/components/execution/LogViewer';

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
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;

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
      // Fall back to polling if SSE fails, but only create one interval
      if (!fallbackInterval) {
        fallbackInterval = setInterval(fetchExecution, 3000);
      }
    };

    return () => {
      eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
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
      const options: RequestInit = { method: 'PUT' };
      if (body) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(body);
      }
      const res = await fetchApi(`/api/executions/${id}${path}`, options);
      if (!res.ok) {
        let message = `Failed to ${label}`;
        try {
          const data = await res.json();
          message = data.error || message;
        } catch { /* response wasn't JSON */ }
        throw new Error(message);
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
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <WifiOff className="w-10 h-10 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Cannot load execution details</p>
          <p className="text-gray-600 text-sm">This feature requires a running orchestrator server.</p>
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
