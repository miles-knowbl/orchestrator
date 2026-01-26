"use client";

import { useState } from "react";
import { Chat } from "@/components/Chat";
import { PhaseTimeline } from "@/components/PhaseTimeline";
import { GateApproval } from "@/components/GateApproval";
import { SkillBrowser } from "@/components/SkillBrowser";
import { loopConfig } from "@/lib/loop-config";

export default function Home() {
  const [currentPhase, setCurrentPhase] = useState(loopConfig.phases[0]?.name || "INIT");
  const [showSkillBrowser, setShowSkillBrowser] = useState(false);
  const [pendingGate, setPendingGate] = useState<string | null>(null);

  return (
    <div className="flex h-screen">
      {/* Sidebar - Phase Timeline */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900 p-4 flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">{loopConfig.name}</h1>
          <p className="text-sm text-gray-400 mt-1">{loopConfig.description.slice(0, 100)}...</p>
        </div>

        <PhaseTimeline
          phases={loopConfig.phases}
          currentPhase={currentPhase}
          onPhaseClick={(phase) => setCurrentPhase(phase)}
        />

        <div className="mt-auto pt-4 border-t border-gray-800">
          <button
            onClick={() => setShowSkillBrowser(!showSkillBrowser)}
            className="w-full px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {showSkillBrowser ? "Hide Skills" : "Browse Skills"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-gray-800 px-6 flex items-center justify-between bg-gray-900">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium phase-${currentPhase.toLowerCase()}`}
                  style={{ backgroundColor: 'var(--phase-color)', color: 'white' }}>
              {currentPhase}
            </span>
            <span className="text-sm text-gray-400">
              Phase {loopConfig.phases.findIndex(p => p.name === currentPhase) + 1} of {loopConfig.phases.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Powered by Orchestrator</span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          {pendingGate ? (
            <GateApproval
              gate={loopConfig.gates.find(g => g.id === pendingGate)!}
              onApprove={() => setPendingGate(null)}
              onReject={(feedback) => {
                console.log("Gate rejected:", feedback);
                setPendingGate(null);
              }}
            />
          ) : (
            <Chat
              currentPhase={currentPhase}
              loopConfig={loopConfig}
              onPhaseComplete={(phase) => {
                const gate = loopConfig.gates.find(g => g.afterPhase === phase);
                if (gate) {
                  setPendingGate(gate.id);
                } else {
                  // Advance to next phase
                  const idx = loopConfig.phases.findIndex(p => p.name === phase);
                  if (idx < loopConfig.phases.length - 1) {
                    setCurrentPhase(loopConfig.phases[idx + 1].name);
                  }
                }
              }}
            />
          )}
        </div>
      </main>

      {/* Skills Panel */}
      {showSkillBrowser && (
        <aside className="w-80 border-l border-gray-800 bg-gray-900 overflow-y-auto">
          <SkillBrowser
            phases={loopConfig.phases}
            currentPhase={currentPhase}
            onClose={() => setShowSkillBrowser(false)}
          />
        </aside>
      )}
    </div>
  );
}
