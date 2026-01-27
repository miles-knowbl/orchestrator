'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldX } from 'lucide-react';
import type { Execution } from './types';

export function GateStatus({
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
