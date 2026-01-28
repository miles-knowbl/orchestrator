'use client';

import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldX,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { getApprovalTypeConfig } from '@/lib/gate-utils';
import type { Execution, GateDefinition } from './types';

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'approved':
      return {
        icon: CheckCircle2,
        label: 'Approved',
        bgClass: 'bg-orch-500/10',
        textClass: 'text-orch-400',
        borderClass: 'border-orch-500/30',
      };
    case 'rejected':
      return {
        icon: XCircle,
        label: 'Rejected',
        bgClass: 'bg-red-500/10',
        textClass: 'text-red-400',
        borderClass: 'border-red-500/30',
      };
    default:
      return {
        icon: Clock,
        label: 'Pending',
        bgClass: 'bg-[#1a1a1a]',
        textClass: 'text-gray-400',
        borderClass: 'border-[#333]',
      };
  }
}

export function GateStatus({
  gates,
  gateDefinitions,
  executionStatus,
  onApprove,
  onReject,
  actionLoading,
}: {
  gates: Execution['gates'];
  gateDefinitions?: GateDefinition[];
  executionStatus: string;
  onApprove: (gateId: string) => void;
  onReject: (gateId: string, feedback: string) => void;
  actionLoading: string | null;
}) {
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const defMap = useMemo(() => {
    const map = new Map<string, GateDefinition>();
    gateDefinitions?.forEach((d) => map.set(d.id, d));
    return map;
  }, [gateDefinitions]);

  if (gates.length === 0) return null;

  const isActive = executionStatus === 'active' || executionStatus === 'blocked';
  const isBlocked = executionStatus === 'blocked';

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4">
      <h3 className="text-sm font-medium text-white mb-3">Gates</h3>
      <div className="space-y-3">
        {gates.map((gate) => {
          const def = defMap.get(gate.gateId);
          const approvalConfig = getApprovalTypeConfig(def?.approvalType);
          const statusConfig = getStatusConfig(gate.status);
          const ApprovalIcon = approvalConfig.icon;
          const StatusIcon = statusConfig.icon;
          const isPendingAndBlocking = gate.status === 'pending' && isBlocked;

          return (
            <div
              key={gate.gateId}
              className={`border rounded-xl overflow-hidden transition-all ${
                gate.status === 'approved'
                  ? 'border-orch-500/20 bg-orch-500/5'
                  : gate.status === 'rejected'
                    ? 'border-red-500/20 bg-red-500/5'
                    : isPendingAndBlocking
                      ? 'border-amber-500/40 bg-amber-500/5 animate-pulse'
                      : 'border-[#222] bg-[#0d0d0d]'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${approvalConfig.bgClass} ${approvalConfig.borderClass}`}
                  >
                    <ApprovalIcon className={`w-4 h-4 ${approvalConfig.iconClass}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">
                      {def?.name || gate.gateId}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${approvalConfig.bgClass} ${approvalConfig.textClass}`}
                      >
                        {approvalConfig.label}
                      </span>
                      {def?.required === true && (
                        <span className="text-xs text-red-400/70">Required</span>
                      )}
                      {def?.required === false && (
                        <span className="text-xs text-gray-500">Optional</span>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 border ${statusConfig.bgClass} ${statusConfig.textClass} ${statusConfig.borderClass}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusConfig.label}
                </div>
              </div>

              {/* Deliverables */}
              {def?.deliverables && def.deliverables.length > 0 && (
                <div className="px-3 pb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {def.deliverables.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 text-xs bg-[#1a1a1a] border border-[#333] px-2 py-1 rounded-lg"
                      >
                        <FileText className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-300">{d}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval metadata */}
              {gate.status === 'approved' && gate.approvedBy && (
                <div className="px-3 pb-3 flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3 h-3 text-orch-500" />
                  <span>
                    Approved by {gate.approvedBy}
                    {gate.approvedAt && <> at {formatTime(gate.approvedAt)}</>}
                  </span>
                </div>
              )}

              {/* Pending actions */}
              {gate.status === 'pending' && isActive && (
                <div className="p-3 border-t border-[#222]">
                  {def?.approvalType === 'auto' ? (
                    <div className="flex items-center gap-2 text-xs text-blue-400">
                      <approvalConfig.icon className="w-3.5 h-3.5" />
                      <span>Automated check runs when phase completes</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove(gate.gateId)}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-orch-500/20 text-orch-400 hover:bg-orch-500/30 border border-orch-500/30 rounded-lg disabled:opacity-50 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(gate.gateId)}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg disabled:opacity-50 transition-colors"
                      >
                        <ShieldX className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Reject feedback input */}
              {rejectTarget === gate.gateId && (
                <div className="px-3 pb-3">
                  <div className="flex gap-2">
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
                      onClick={() => {
                        setRejectTarget(null);
                        setRejectFeedback('');
                      }}
                      className="text-xs px-2 py-1.5 text-gray-500 hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
