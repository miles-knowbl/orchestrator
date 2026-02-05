'use client';

import { useEffect, useState } from 'react';
import {
  Zap,
  Search,
  ChevronRight,
  ChevronDown,
  Tag,
  WifiOff,
  Inbox,
  Lightbulb
} from 'lucide-react';
import { fetchWithFallback, fetchApi } from '@/lib/api';

interface Skill {
  id: string;
  name: string;
  version: string;
  description: string;
  phase?: string;
  category: string;
}

interface InboxItem {
  id: string;
  source: { type: string; name: string };
  status: 'pending' | 'processing' | 'extracted' | 'rejected';
  createdAt: string;
  extractedSkillsCount: number;
  contentPreview: string;
}

interface InboxStats {
  total: number;
  pending: number;
  extracted: number;
}

interface UpgradeProposal {
  id: string;
  skill: string;
  currentVersion: string;
  proposedVersion: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  changes: { type: string; section: string; reason: string }[];
}

interface ImprovementStats {
  pending: number;
  applied: number;
  rejected: number;
}

const phaseColors: Record<string, string> = {
  INIT: 'bg-purple-500/10 text-purple-400',
  SCAFFOLD: 'bg-blue-500/10 text-blue-400',
  IMPLEMENT: 'bg-orch-500/10 text-orch-400',
  TEST: 'bg-yellow-500/10 text-yellow-400',
  VERIFY: 'bg-orange-500/10 text-orange-400',
  VALIDATE: 'bg-pink-500/10 text-pink-400',
  DOCUMENT: 'bg-cyan-500/10 text-cyan-400',
  REVIEW: 'bg-indigo-500/10 text-indigo-400',
  SHIP: 'bg-red-500/10 text-red-400',
  COMPLETE: 'bg-gray-500/10 text-gray-400',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  processing: 'bg-blue-500/10 text-blue-400',
  extracted: 'bg-orch-500/10 text-orch-400',
  rejected: 'bg-red-500/10 text-red-400',
  applied: 'bg-green-500/10 text-green-400',
};

function InboxRow({ item }: { item: InboxItem }) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#111] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white truncate">{item.source.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${statusColors[item.status]}`}>
            {item.status}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">{item.contentPreview}</p>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {item.extractedSkillsCount > 0 && (
          <span className="text-xs text-orch-400">{item.extractedSkillsCount} skills</span>
        )}
        <span className="text-xs text-gray-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function ImprovementRow({ proposal }: { proposal: UpgradeProposal }) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#111] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">{proposal.skill}</span>
          <span className="text-xs text-gray-500">v{proposal.currentVersion}</span>
          <span className="text-xs text-gray-600">→</span>
          <span className="text-xs text-orch-400">v{proposal.proposedVersion}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${statusColors[proposal.status]}`}>
            {proposal.status}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {proposal.changes.length} change{proposal.changes.length !== 1 ? 's' : ''} proposed
        </p>
      </div>
      <span className="text-xs text-gray-500 ml-4">
        {new Date(proposal.createdAt).toLocaleDateString()}
      </span>
    </div>
  );
}

export default function SkillsPage() {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isStatic, setIsStatic] = useState(false);

  // Inbox state
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [inboxStats, setInboxStats] = useState<InboxStats | null>(null);
  const [inboxExpanded, setInboxExpanded] = useState(false);
  const [inboxOffline, setInboxOffline] = useState(false);

  // Improvements state
  const [proposals, setProposals] = useState<UpgradeProposal[]>([]);
  const [improvementStats, setImprovementStats] = useState<ImprovementStats | null>(null);
  const [improvementsExpanded, setImprovementsExpanded] = useState(false);
  const [improvementsOffline, setImprovementsOffline] = useState(false);

  // Initial load
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, isStatic: staticMode } = await fetchWithFallback('/api/skills');
        const list = data.skills || [];
        setAllSkills(list);
        setSkills(list);
        setIsStatic(staticMode);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    const fetchInbox = async () => {
      try {
        const itemsRes = await fetchApi('/api/inbox');
        if (itemsRes.ok) {
          const data = await itemsRes.json();
          setInboxItems(data.items || []);
        }

        const statsRes = await fetchApi('/api/inbox/stats');
        if (statsRes.ok) {
          const data = await statsRes.json();
          setInboxStats(data);
        }
        setInboxOffline(false);
      } catch {
        setInboxOffline(true);
      }
    };

    const fetchImprovements = async () => {
      try {
        const summaryRes = await fetchApi('/api/improvements/summary');
        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setImprovementStats(data.upgradeProposals);
        }

        const proposalsRes = await fetchApi('/api/improvements');
        if (proposalsRes.ok) {
          const data = await proposalsRes.json();
          setProposals(data.proposals || []);
        }
        setImprovementsOffline(false);
      } catch {
        setImprovementsOffline(true);
      }
    };

    fetchSkills();
    fetchInbox();
    fetchImprovements();
  }, []);

  // Client-side filtering
  useEffect(() => {
    let filtered = allSkills;
    if (phaseFilter) {
      filtered = filtered.filter(s => s.phase === phaseFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    setSkills(filtered);
  }, [search, phaseFilter, allSkills]);

  const phases = ['INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY', 'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'];

  const pendingInboxCount = inboxStats?.pending ?? inboxItems.filter(i => i.status === 'pending').length;
  const pendingImprovementsCount = improvementStats?.pending ?? proposals.filter(p => p.status === 'pending').length;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {isStatic && (
        <div className="mb-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 text-sm text-yellow-400">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Viewing static skill catalog. Start the orchestrator server for live features.</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Skills</h1>
            <p className="text-sm text-gray-500">{skills.length} skills available</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-orch-500 focus:outline-none"
          />
        </div>

        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          className="bg-[#111] border border-[#222] rounded-lg px-4 py-2 text-sm text-white focus:border-orch-500 focus:outline-none"
        >
          <option value="">All Phases</option>
          {phases.map((phase) => (
            <option key={phase} value={phase}>{phase}</option>
          ))}
        </select>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <a
            key={skill.id}
            href={`/skills/${skill.id}`}
            className="block bg-[#111] border border-[#222] rounded-xl p-4 hover:border-purple-500/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium text-white">{skill.name}</span>
                <span className="text-xs text-gray-500">v{skill.version}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </div>

            <p className="text-sm text-gray-400 line-clamp-2 mb-3">{skill.description}</p>

            <div className="flex items-center gap-2">
              {skill.phase && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${phaseColors[skill.phase] || 'bg-gray-500/10 text-gray-400'}`}>
                  {skill.phase}
                </span>
              )}
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {skill.category}
              </span>
            </div>
          </a>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <p className="text-gray-500">No skills found</p>
        </div>
      )}

      {/* Collapsible Sections */}
      <div className="mt-8 border-t border-[#222] pt-6 space-y-3">
        {/* Inbox Section */}
        <div>
          <button
            onClick={() => setInboxExpanded(!inboxExpanded)}
            className="w-full flex items-center justify-between p-3 bg-[#111] border border-[#222] rounded-lg hover:border-[#333] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-gray-300">Inbox</span>
              {pendingInboxCount > 0 && (
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                  {pendingInboxCount} pending
                </span>
              )}
              {pendingInboxCount === 0 && (
                <span className="text-xs bg-[#222] text-gray-400 px-2 py-0.5 rounded-full">
                  {inboxItems.length}
                </span>
              )}
            </div>
            {inboxExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {inboxExpanded && (
            <div className="mt-3 space-y-2">
              {inboxOffline ? (
                <div className="p-4 bg-[#0a0a0a] rounded-lg text-center">
                  <WifiOff className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Server offline</p>
                </div>
              ) : inboxItems.length === 0 ? (
                <div className="p-4 bg-[#0a0a0a] rounded-lg text-center">
                  <Inbox className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No inbox items</p>
                </div>
              ) : (
                <>
                  {inboxItems.slice(0, 3).map((item) => (
                    <InboxRow key={item.id} item={item} />
                  ))}
                  {inboxItems.length > 3 && (
                    <a
                      href="/inbox"
                      className="block text-center text-xs text-gray-500 hover:text-gray-300 py-2"
                    >
                      View all {inboxItems.length} items →
                    </a>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Improvements Section */}
        <div>
          <button
            onClick={() => setImprovementsExpanded(!improvementsExpanded)}
            className="w-full flex items-center justify-between p-3 bg-[#111] border border-[#222] rounded-lg hover:border-[#333] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-orch-400" />
              <span className="text-sm font-medium text-gray-300">Improvements</span>
              {pendingImprovementsCount > 0 && (
                <span className="text-xs bg-orch-500/20 text-orch-400 px-2 py-0.5 rounded-full">
                  {pendingImprovementsCount} pending
                </span>
              )}
              {pendingImprovementsCount === 0 && (
                <span className="text-xs bg-[#222] text-gray-400 px-2 py-0.5 rounded-full">
                  {proposals.length}
                </span>
              )}
            </div>
            {improvementsExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {improvementsExpanded && (
            <div className="mt-3 space-y-2">
              {improvementsOffline ? (
                <div className="p-4 bg-[#0a0a0a] rounded-lg text-center">
                  <WifiOff className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Server offline</p>
                </div>
              ) : proposals.length === 0 ? (
                <div className="p-4 bg-[#0a0a0a] rounded-lg text-center">
                  <Lightbulb className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No improvement proposals</p>
                </div>
              ) : (
                <>
                  {proposals.filter(p => p.status === 'pending').slice(0, 3).map((proposal) => (
                    <ImprovementRow key={proposal.id} proposal={proposal} />
                  ))}
                  {proposals.length > 3 && (
                    <a
                      href="/improvements"
                      className="block text-center text-xs text-gray-500 hover:text-gray-300 py-2"
                    >
                      View all {proposals.length} proposals →
                    </a>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
