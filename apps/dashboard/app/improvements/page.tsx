'use client';

import { useEffect, useState } from 'react';
import { Lightbulb, Check, X, RefreshCw, ChevronDown, ChevronRight, GitBranch, WifiOff } from 'lucide-react';
import { Prose } from '@/components/Prose';
import { fetchApi } from '@/lib/api';

interface SkillChange {
  type: 'add-section' | 'remove-section' | 'update-section' | 'rewrite';
  section: string;
  reason: string;
  content?: string;
}

interface ProposalEvidence {
  runId: string;
  signal: string;
  timestamp: string;
}

interface UpgradeProposal {
  id: string;
  skill: string;
  currentVersion: string;
  proposedVersion: string;
  createdAt: string;
  changes: SkillChange[];
  evidence: ProposalEvidence[];
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

interface LearningSummary {
  runSignals: number;
  upgradeProposals: {
    pending: number;
    applied: number;
    rejected: number;
  };
  pendingProposals: UpgradeProposal[];
  recentRuns: any[];
}

const changeTypeConfig = {
  'add-section': {
    label: 'Add Section',
    badge: 'bg-green-500/10 text-green-400 border-green-500/20',
    description: 'Add a new section to the skill',
  },
  'remove-section': {
    label: 'Remove Section',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    description: 'Remove an unused section from the skill',
  },
  'update-section': {
    label: 'Update Section',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    description: 'Update an existing section',
  },
  'rewrite': {
    label: 'Rewrite',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    description: 'Major rewrite of the skill',
  },
};

function VersionBadge({ current, proposed }: { current: string; proposed: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-0.5 rounded font-mono">
        v{current}
      </span>
      <span className="text-xs text-gray-600">→</span>
      <span className="text-xs text-orch-400 bg-orch-500/10 px-2 py-0.5 rounded font-mono">
        v{proposed}
      </span>
    </div>
  );
}

function ProposalCard({
  proposal,
  onApprove,
  onReject,
  loading
}: {
  proposal: UpgradeProposal;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  loading: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(proposal.id, rejectReason);
      setShowRejectInput(false);
      setRejectReason('');
    }
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orch-500/10 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-orch-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{proposal.skill}</span>
                <VersionBadge current={proposal.currentVersion} proposed={proposal.proposedVersion} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {proposal.changes.length} change{proposal.changes.length !== 1 ? 's' : ''} •
                {proposal.evidence.length} evidence point{proposal.evidence.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(proposal.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Changes summary */}
        <div className="flex flex-wrap gap-2 mb-3">
          {proposal.changes.map((change, idx) => {
            const config = changeTypeConfig[change.type];
            return (
              <span key={idx} className={`text-xs px-2 py-0.5 rounded border ${config.badge}`}>
                {config.label}: {change.section}
              </span>
            );
          })}
        </div>

        {/* Expand/collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
        >
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#222] p-4 bg-[#0a0a0a]">
          {/* Changes */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-400 mb-2">Proposed Changes</h4>
            <div className="space-y-2">
              {proposal.changes.map((change, idx) => (
                <div key={idx} className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${changeTypeConfig[change.type].badge}`}>
                      {changeTypeConfig[change.type].label}
                    </span>
                    <span className="text-sm text-white">{change.section}</span>
                  </div>
                  <p className="text-xs text-gray-400">{change.reason}</p>
                  {change.content && (
                    <div className="mt-2 bg-[#0a0a0a] border border-[#222] rounded p-2 max-h-40 overflow-y-auto">
                      <Prose size="xs">{change.content}</Prose>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Evidence */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-400 mb-2">Evidence</h4>
            <div className="space-y-1">
              {proposal.evidence.map((ev, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <GitBranch className="w-3 h-3 text-gray-600" />
                  <span className="text-gray-500">{ev.runId}</span>
                  <span className="text-gray-400">{ev.signal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {proposal.status === 'pending' && (
            <div className="flex gap-2">
              {!showRejectInput ? (
                <>
                  <button
                    onClick={() => onApprove(proposal.id)}
                    disabled={loading !== null}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-orch-600 text-white rounded-lg hover:bg-orch-500 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {loading === `approve-${proposal.id}` ? 'Applying...' : 'Approve & Apply'}
                  </button>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={loading !== null}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </>
              ) : (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Rejection reason..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="flex-1 bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white"
                    autoFocus
                  />
                  <button
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || loading !== null}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50"
                  >
                    {loading === `reject-${proposal.id}` ? 'Rejecting...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="px-3 py-2 text-sm text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Status for non-pending */}
          {proposal.status !== 'pending' && (
            <div className={`text-sm ${proposal.status === 'applied' ? 'text-green-400' : 'text-red-400'}`}>
              {proposal.status === 'applied' && (
                <span>Applied{proposal.reviewedAt ? ` on ${new Date(proposal.reviewedAt).toLocaleDateString()}` : ''}</span>
              )}
              {proposal.status === 'rejected' && (
                <span>Rejected: {proposal.rejectionReason || 'No reason given'}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ImprovementsPage() {
  const [summary, setSummary] = useState<LearningSummary | null>(null);
  const [proposals, setProposals] = useState<UpgradeProposal[]>([]);
  const [filter, setFilter] = useState<'pending' | 'applied' | 'rejected' | 'all'>('pending');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch summary
      const summaryRes = await fetchApi('/api/improvements/summary');
      if (!summaryRes.ok) throw new Error('Failed to fetch summary');
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      // Fetch all proposals
      const proposalsRes = await fetchApi('/api/improvements');
      if (!proposalsRes.ok) throw new Error('Failed to fetch proposals');
      const proposalsData = await proposalsRes.json();
      setProposals(proposalsData.proposals || []);

      setOffline(false);
      setError(null);
    } catch {
      setOffline(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    setLoading(`approve-${id}`);
    setError(null);
    try {
      const res = await fetchApi(`/api/improvements/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to approve proposal');
      }

      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setLoading(`reject-${id}`);
    setError(null);
    try {
      const res = await fetchApi(`/api/improvements/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reject proposal');
      }

      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setLoading(null);
    }
  };

  const filteredProposals = proposals.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  if (offline) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-6 h-6 text-orch-400" />
          <h1 className="text-2xl font-bold text-white">Improvements</h1>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <WifiOff className="w-10 h-10 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Improvements requires a running orchestrator server</p>
          <p className="text-gray-600 text-sm">Start the server to view and approve skill upgrade proposals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-orch-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Improvements</h1>
            <p className="text-sm text-gray-500">Skill upgrade proposals from learning signals</p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="p-2 text-gray-400 hover:text-white bg-[#111] border border-[#222] rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <p className="text-2xl font-bold text-yellow-400">{summary.upgradeProposals.pending}</p>
            <p className="text-xs text-gray-500">Pending Review</p>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <p className="text-2xl font-bold text-green-400">{summary.upgradeProposals.applied}</p>
            <p className="text-xs text-gray-500">Applied</p>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <p className="text-2xl font-bold text-red-400">{summary.upgradeProposals.rejected}</p>
            <p className="text-xs text-gray-500">Rejected</p>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-400">{summary.runSignals}</p>
            <p className="text-xs text-gray-500">Run Signals</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['pending', 'applied', 'rejected', 'all'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              filter === status ? 'bg-orch-600 text-white' : 'bg-[#111] text-gray-400 hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'pending' && summary && summary.upgradeProposals.pending > 0 && (
              <span className="ml-1.5 bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full text-xs">
                {summary.upgradeProposals.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No {filter === 'all' ? '' : filter} proposals</p>
          <p className="text-gray-600 text-sm mt-2">
            {filter === 'pending'
              ? 'Run loops to generate learning signals and improvement proposals'
              : 'Proposals will appear here as skills are improved'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onApprove={handleApprove}
              onReject={handleReject}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
