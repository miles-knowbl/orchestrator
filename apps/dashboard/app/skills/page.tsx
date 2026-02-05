'use client';

import { useEffect, useState } from 'react';
import {
  Zap,
  Search,
  ChevronRight,
  Tag,
  WifiOff,
} from 'lucide-react';
import { fetchWithFallback } from '@/lib/api';

interface Skill {
  id: string;
  name: string;
  version: string;
  description: string;
  phase?: string;
  category: string;
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

const CATEGORIES = [
  { key: 'engineering', label: 'Engineering' },
  { key: 'operations', label: 'Operations' },
  { key: 'sales', label: 'Sales' },
  { key: 'content', label: 'Content' },
  { key: 'strategy', label: 'Strategy' },
] as const;

export default function SkillsPage() {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isStatic, setIsStatic] = useState(false);

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

    fetchSkills();
  }, []);

  // Client-side filtering
  useEffect(() => {
    let filtered = allSkills;
    if (categoryFilter) {
      filtered = filtered.filter(s => s.category === categoryFilter);
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
  }, [search, categoryFilter, allSkills]);

  const categoryCounts = allSkills.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

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

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setCategoryFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            categoryFilter === ''
              ? 'bg-orch-500/20 text-orch-400 border border-orch-500/30'
              : 'bg-[#111] text-gray-400 border border-[#222] hover:border-[#333] hover:text-white'
          }`}
        >
          All
          <span className="ml-1.5 text-xs opacity-60">{allSkills.length}</span>
        </button>
        {CATEGORIES.map(({ key, label }) => {
          const count = categoryCounts[key] || 0;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === key
                  ? 'bg-orch-500/20 text-orch-400 border border-orch-500/30'
                  : 'bg-[#111] text-gray-400 border border-[#222] hover:border-[#333] hover:text-white'
              }`}
            >
              {label}
              <span className="ml-1.5 text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-[#222] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-orch-500 focus:outline-none"
        />
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
    </div>
  );
}
