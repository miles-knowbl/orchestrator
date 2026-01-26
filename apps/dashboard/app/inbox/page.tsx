'use client';

import { useEffect, useState } from 'react';
import { Inbox, Plus, Sparkles, Check, X, RefreshCw, ChevronDown, ChevronRight, FileText, Puzzle, BookOpen } from 'lucide-react';
import { Prose } from '@/components/Prose';
import { fetchApi } from '@/lib/api';

interface InboxItem {
  id: string;
  source: { type: string; name: string };
  url?: string;
  status: 'pending' | 'processing' | 'extracted' | 'rejected';
  createdAt: string;
  processedAt?: string;
  extractedSkillsCount: number;
  extractedPatternsCount: number;
  contentPreview: string;
}

interface ClassifiedExtractionItem {
  index: number;
  type: 'standalone_skill' | 'skill_enhancement' | 'reference_doc';
  confidence: number;
  reasoning: string;
  skill?: {
    name: string;
    description: string;
    phase?: string;
    confidence: number;
    contentPreview: string;
    contentLength: number;
  };
  targetSkill?: string;
  enhancement?: {
    section: string;
    description: string;
    contentPreview: string;
    contentLength: number;
  };
  parentSkill?: string;
  reference?: {
    name: string;
    description: string;
    contentPreview: string;
    contentLength: number;
  };
}

interface InboxItemDetail {
  id: string;
  source: { type: string; name: string };
  url?: string;
  status: string;
  content: string;
  classifiedExtractions?: ClassifiedExtractionItem[];
  extractedSkills?: {
    index: number;
    name: string;
    description: string;
    phase?: string;
    confidence: number;
    needsReview: boolean;
  }[];
  extractedPatterns?: {
    id: string;
    name: string;
    context: string;
  }[];
}

interface Stats {
  total: number;
  pending: number;
  processing: number;
  extracted: number;
  rejected: number;
  skillsExtracted: number;
  patternsExtracted: number;
}

function AddItemModal({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState<'paste' | 'url'>('paste');
  const [sourceName, setSourceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const body = sourceType === 'url'
        ? { url: content }
        : { content, sourceType: 'paste', sourceName: sourceName || 'manual-paste' };

      const res = await fetchApi(`/api/inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add item');
      }

      onAdd();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#111] border border-[#333] rounded-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-white mb-4">Add to Inbox</h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSourceType('paste')}
            className={`px-3 py-1.5 text-sm rounded-lg ${sourceType === 'paste' ? 'bg-orch-600 text-white' : 'bg-[#222] text-gray-400'}`}
          >
            Paste Content
          </button>
          <button
            onClick={() => setSourceType('url')}
            className={`px-3 py-1.5 text-sm rounded-lg ${sourceType === 'url' ? 'bg-orch-600 text-white' : 'bg-[#222] text-gray-400'}`}
          >
            URL
          </button>
        </div>

        {sourceType === 'paste' && (
          <input
            type="text"
            placeholder="Source name (optional)"
            value={sourceName}
            onChange={e => setSourceName(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white mb-3"
          />
        )}

        <textarea
          placeholder={sourceType === 'url' ? 'https://example.com/docs' : 'Paste content here...'}
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={sourceType === 'url' ? 2 : 8}
          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white font-mono resize-none mb-4"
        />

        {error && (
          <div className="text-red-400 text-sm mb-4">{error}</div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            className="px-4 py-2 text-sm bg-orch-600 text-white rounded-lg hover:bg-orch-500 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add to Inbox'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-[#222] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500">{pct}%</span>
    </div>
  );
}

const extractionTypeConfig = {
  standalone_skill: {
    label: 'New Skill',
    badge: 'bg-green-500/10 text-green-400 border-green-500/20',
    icon: Puzzle,
    actionLabel: 'Create Skill',
    actionColor: 'bg-green-600 hover:bg-green-500',
  },
  skill_enhancement: {
    label: 'Enhancement',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Sparkles,
    actionLabel: 'Apply Enhancement',
    actionColor: 'bg-blue-600 hover:bg-blue-500',
  },
  reference_doc: {
    label: 'Reference',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: BookOpen,
    actionLabel: 'Add Reference',
    actionColor: 'bg-purple-600 hover:bg-purple-500',
  },
};

function ExtractionCard({ extraction, itemId, actionLoading, onApprove, onReject }: {
  extraction: ClassifiedExtractionItem;
  itemId: string;
  actionLoading: string | null;
  onApprove: (index: number) => void;
  onReject: (index: number) => void;
}) {
  const [showReasoning, setShowReasoning] = useState(false);
  const config = extractionTypeConfig[extraction.type];
  const Icon = config.icon;

  return (
    <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3">
      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-400" />
          <span className={`text-xs px-2 py-0.5 rounded border ${config.badge}`}>
            {config.label}
          </span>
        </div>
        <ConfidenceMeter value={extraction.confidence} />
      </div>

      {/* Type-specific content */}
      {extraction.type === 'standalone_skill' && extraction.skill && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">{extraction.skill.name}</span>
            {extraction.skill.phase && (
              <span className="text-xs text-orch-400 bg-orch-500/10 px-1.5 py-0.5 rounded">
                {extraction.skill.phase}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">{extraction.skill.description}</p>
          <p className="text-xs text-gray-600 mt-1">
            {Math.round(extraction.skill.contentLength / 1024 * 10) / 10}KB content
          </p>
        </div>
      )}

      {extraction.type === 'skill_enhancement' && extraction.enhancement && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">
              Enhance: <span className="text-blue-400">{extraction.targetSkill}</span>
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Section: <span className="text-gray-300">{extraction.enhancement.section}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">{extraction.enhancement.description}</p>
          <p className="text-xs text-gray-600 mt-1">
            {Math.round(extraction.enhancement.contentLength / 1024 * 10) / 10}KB content
          </p>
        </div>
      )}

      {extraction.type === 'reference_doc' && extraction.reference && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-sm font-medium text-white">{extraction.reference.name}</span>
          </div>
          <p className="text-xs text-gray-400">
            Parent: <span className="text-purple-400">{extraction.parentSkill}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">{extraction.reference.description}</p>
          <p className="text-xs text-gray-600 mt-1">
            {Math.round(extraction.reference.contentLength / 1024 * 10) / 10}KB content
          </p>
        </div>
      )}

      {/* Collapsible reasoning */}
      <button
        onClick={() => setShowReasoning(!showReasoning)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-2"
      >
        {showReasoning ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        AI Reasoning
      </button>
      {showReasoning && (
        <div className="bg-[#111] border border-[#1a1a1a] rounded p-2 mb-3 text-xs text-gray-400 italic">
          {extraction.reasoning}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(extraction.index)}
          disabled={actionLoading !== null}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs text-white rounded ${config.actionColor} disabled:opacity-50`}
        >
          <Check className="w-3 h-3" />
          {actionLoading === `approve-${extraction.index}` ? 'Applying...' : config.actionLabel}
        </button>
        <button
          onClick={() => onReject(extraction.index)}
          disabled={actionLoading !== null}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 disabled:opacity-50"
        >
          <X className="w-3 h-3" />
          {actionLoading === `reject-${extraction.index}` ? 'Rejecting...' : 'Reject'}
        </button>
      </div>
    </div>
  );
}

function ItemDetailModal({ item, onClose, onAction }: {
  item: InboxItemDetail;
  onClose: () => void;
  onAction: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processItem = async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetchApi(`/api/inbox/${item.id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to process item');
      }

      onAction();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process');
    } finally {
      setProcessing(false);
    }
  };

  const approveExtraction = async (index: number) => {
    setActionLoading(`approve-${index}`);
    setError(null);
    try {
      const res = await fetchApi(`/api/inbox/${item.id}/extractions/${index}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to approve extraction');
      }

      onAction();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectExtraction = async (index: number) => {
    setActionLoading(`reject-${index}`);
    setError(null);
    try {
      const res = await fetchApi(`/api/inbox/${item.id}/extractions/${index}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reject extraction');
      }

      onAction();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const hasClassified = item.classifiedExtractions && item.classifiedExtractions.length > 0;
  const hasLegacySkills = !hasClassified && item.extractedSkills && item.extractedSkills.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#111] border border-[#333] rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[#222] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{item.source.name}</h2>
            <p className="text-xs text-gray-500">{item.source.type} • {item.status}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Content Preview */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Content</h3>
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 max-h-64 overflow-y-auto">
              <Prose size="xs">{item.content}</Prose>
            </div>
          </div>

          {/* Process Button */}
          {item.status === 'pending' && (
            <button
              onClick={processItem}
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {processing ? 'Classifying with AI...' : 'Classify & Extract'}
            </button>
          )}

          {/* Classified Extractions (new pipeline) */}
          {hasClassified && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Classified Extractions
                <span className="ml-2 text-xs text-gray-600">
                  ({item.classifiedExtractions!.length} items)
                </span>
              </h3>
              <div className="space-y-2">
                {item.classifiedExtractions!.map((extraction) => (
                  <ExtractionCard
                    key={extraction.index}
                    extraction={extraction}
                    itemId={item.id}
                    actionLoading={actionLoading}
                    onApprove={approveExtraction}
                    onReject={rejectExtraction}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Legacy Extracted Skills (backward compat for items processed before migration) */}
          {hasLegacySkills && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Extracted Skills</h3>
              <div className="space-y-2">
                {item.extractedSkills!.map((skill) => (
                  <div key={skill.index} className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-white">{skill.name}</span>
                        {skill.phase && (
                          <span className="ml-2 text-xs text-orch-400 bg-orch-500/10 px-1.5 py-0.5 rounded">
                            {skill.phase}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{Math.round(skill.confidence * 100)}% confidence</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{skill.description}</p>
                    {skill.needsReview && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveExtraction(skill.index)}
                          disabled={actionLoading !== null}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-orch-600 text-white rounded hover:bg-orch-500 disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" />
                          {actionLoading === `approve-${skill.index}` ? 'Creating...' : 'Create Skill'}
                        </button>
                        <button
                          onClick={() => rejectExtraction(skill.index)}
                          disabled={actionLoading !== null}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Patterns */}
          {item.extractedPatterns && item.extractedPatterns.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Extracted Patterns</h3>
              <div className="space-y-2">
                {item.extractedPatterns.map((pattern) => (
                  <div key={pattern.id} className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3">
                    <span className="text-sm font-medium text-white">{pattern.name}</span>
                    <p className="text-xs text-gray-400 mt-1">{pattern.context}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedItem, setSelectedItem] = useState<InboxItemDetail | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Fetch items
      const itemsRes = await fetchApi(`/api/inbox`);
      if (!itemsRes.ok) throw new Error('Failed to fetch inbox');
      const itemsData = await itemsRes.json();
      setItems(itemsData.items || []);

      // Fetch stats
      const statsRes = await fetchApi(`/api/inbox/stats`);
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchItemDetail = async (id: string) => {
    try {
      const res = await fetchApi(`/api/inbox/${id}`);
      if (!res.ok) throw new Error('Failed to fetch item');
      const data = await res.json();
      setSelectedItem(data);
    } catch (err) {
      console.error('Failed to fetch item:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    processing: 'bg-blue-500/10 text-blue-400',
    extracted: 'bg-orch-500/10 text-orch-400',
    rejected: 'bg-red-500/10 text-red-400',
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 text-sm bg-[#222] text-white rounded-lg hover:bg-[#333]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
            <Inbox className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Inbox</h1>
            <p className="text-sm text-gray-500">Second brain for skill harvesting</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 text-gray-400 hover:text-white bg-[#111] border border-[#222] rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orch-600 text-white rounded-lg hover:bg-orch-500"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{stats.extracted}</p>
            <p className="text-xs text-gray-500">Processed</p>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <p className="text-2xl font-bold text-orch-400">{stats.skillsExtracted}</p>
            <p className="text-xs text-gray-500">Skills Extracted</p>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <p className="text-2xl font-bold text-purple-400">{stats.patternsExtracted}</p>
            <p className="text-xs text-gray-500">Patterns Found</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'extracted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              filter === status ? 'bg-orch-600 text-white' : 'bg-[#111] text-gray-400 hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No inbox items</p>
          <p className="text-gray-600 text-sm mt-2">Add content, URLs, or conversations to extract skills</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => fetchItemDetail(item.id)}
              className="bg-[#111] border border-[#222] rounded-xl p-4 hover:border-[#333] cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{item.source.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-gray-400 line-clamp-2 mb-2">{item.contentPreview}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{item.source.type}</span>
                {item.extractedSkillsCount > 0 && (
                  <span className="text-orch-400">{item.extractedSkillsCount} skills</span>
                )}
                {item.extractedPatternsCount > 0 && (
                  <span className="text-purple-400">{item.extractedPatternsCount} patterns</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddItemModal onClose={() => setShowAddModal(false)} onAdd={fetchData} />
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAction={() => {
            fetchData();
            fetchItemDetail(selectedItem.id);
          }}
        />
      )}
    </div>
  );
}
