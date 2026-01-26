"use client";

import { useState } from "react";

interface Gate {
  id: string;
  name: string;
  afterPhase: string;
  required: boolean;
  deliverables: string[];
  ui?: {
    title: string;
    approvalPrompt: string;
    feedbackRequired: boolean;
  };
}

interface GateApprovalProps {
  gate: Gate;
  onApprove: () => void;
  onReject: (feedback: string) => void;
}

export function GateApproval({ gate, onApprove, onReject }: GateApprovalProps) {
  const [feedback, setFeedback] = useState("");
  const [mode, setMode] = useState<"review" | "reject">("review");

  const title = gate.ui?.title || `${gate.name} Gate`;
  const prompt = gate.ui?.approvalPrompt || `Review the ${gate.afterPhase} phase deliverables before proceeding.`;

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="max-w-2xl w-full bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-white/80 text-sm">After {gate.afterPhase} phase</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-6">{prompt}</p>

          {/* Deliverables checklist */}
          {gate.deliverables.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Required Deliverables
              </h3>
              <ul className="space-y-2">
                {gate.deliverables.map((deliverable, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      defaultChecked
                    />
                    <span>{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rejection feedback */}
          {mode === "reject" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Feedback (required)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Explain what needs to be addressed..."
                className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-800/50 flex items-center gap-4">
          {mode === "review" ? (
            <>
              <button
                onClick={onApprove}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve & Continue
              </button>
              <button
                onClick={() => setMode("reject")}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors"
              >
                Request Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setMode("review")}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onReject(feedback)}
                disabled={!feedback.trim()}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-medium transition-colors"
              >
                Submit Feedback
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
