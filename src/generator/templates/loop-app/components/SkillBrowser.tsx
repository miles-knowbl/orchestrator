"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Phase {
  name: string;
  order: number;
  skills: { skillId: string; required: boolean }[];
}

interface SkillBrowserProps {
  phases: Phase[];
  currentPhase: string;
  onClose: () => void;
}

export function SkillBrowser({ phases, currentPhase, onClose }: SkillBrowserProps) {
  const [selectedPhase, setSelectedPhase] = useState(currentPhase);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedPhaseConfig = phases.find(p => p.name === selectedPhase);
  const skills = selectedPhaseConfig?.skills || [];

  const filteredSkills = skills.filter(skill =>
    skill.skillId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Skills</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-1 p-2 overflow-x-auto border-b border-gray-800">
        {phases.map((phase) => (
          <button
            key={phase.name}
            onClick={() => setSelectedPhase(phase.name)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
              selectedPhase === phase.name
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            {phase.name}
          </button>
        ))}
      </div>

      {/* Skills list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredSkills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? "No skills match your search" : "No skills in this phase"}
          </div>
        ) : (
          filteredSkills.map((skill) => (
            <div
              key={skill.skillId}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-white">{skill.skillId}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {getSkillDescription(skill.skillId)}
                  </p>
                </div>
                {skill.required && (
                  <span className="px-2 py-0.5 bg-amber-600/20 text-amber-400 rounded text-xs">
                    Required
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
                  Execute
                </button>
                <button className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getSkillDescription(skillId: string): string {
  const descriptions: Record<string, string> = {
    "architect": "Design system architecture and technical approach",
    "spec": "Create detailed specifications from requirements",
    "scaffold": "Set up project structure and boilerplate",
    "implement": "Write the core implementation code",
    "test-generation": "Generate test cases and test files",
    "code-verification": "Verify code quality and correctness",
    "document": "Create documentation and comments",
    "code-review": "Review code for quality and best practices",
    "deploy": "Deploy the application to production",
    "loop-controller": "Manage loop execution and transitions",
    "context-ingestion": "Ingest and understand project context",
    "context-cultivation": "Cultivate and refine context understanding",
    "priority-matrix": "Prioritize work items and decisions",
    "proposal-builder": "Build structured proposals and recommendations",
  };
  return descriptions[skillId] || "Execute this skill";
}
