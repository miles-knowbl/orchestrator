"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import type { LoopConfig } from "@/lib/loop-config";
import { cn } from "@/lib/utils";

interface ChatProps {
  currentPhase: string;
  loopConfig: LoopConfig;
  onPhaseComplete: (phase: string) => void;
}

export function Chat({ currentPhase, loopConfig, onPhaseComplete }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isExecutingSkill, setIsExecutingSkill] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/chat",
    body: {
      currentPhase,
      loopId: loopConfig.id,
    },
    onFinish: (message) => {
      // Check for phase completion signals in the response
      if (message.content.includes("[PHASE_COMPLETE]")) {
        onPhaseComplete(currentPhase);
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentPhaseConfig = loopConfig.phases.find(p => p.name === currentPhase);
  const phaseSkills = currentPhaseConfig?.skills || [];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">
              {currentPhase} Phase
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {getPhaseDescription(currentPhase)}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {phaseSkills.map((skill) => (
                <button
                  key={skill.skillId}
                  onClick={() => append({ role: "user", content: `Execute skill: ${skill.skillId}` })}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  {skill.skillId}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-100"
              )}
            >
              <div className="prose prose-invert prose-sm max-w-none">
                <MessageContent content={message.content} />
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-gray-400 text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4 bg-gray-900">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder={`Message ${loopConfig.name}...`}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-medium transition-colors"
          >
            Send
          </button>
        </form>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span>Current Phase: {currentPhase}</span>
          <span>•</span>
          <span>{phaseSkills.length} skills available</span>
          <button
            onClick={() => onPhaseComplete(currentPhase)}
            className="ml-auto text-blue-400 hover:text-blue-300"
          >
            Mark Phase Complete →
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering
  const lines = content.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) {
          return <h1 key={i} className="text-xl font-bold">{line.slice(2)}</h1>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={i} className="text-lg font-semibold">{line.slice(3)}</h2>;
        }
        if (line.startsWith("- ")) {
          return <li key={i} className="ml-4">{line.slice(2)}</li>;
        }
        if (line.startsWith("```")) {
          return null; // Handle code blocks differently if needed
        }
        if (line.trim() === "") {
          return <br key={i} />;
        }
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

function getPhaseDescription(phase: string): string {
  const descriptions: Record<string, string> = {
    INIT: "Initialize the project context and understand requirements",
    SCAFFOLD: "Set up the project structure and dependencies",
    IMPLEMENT: "Write the core functionality and features",
    TEST: "Create tests to verify the implementation",
    VERIFY: "Run automated checks and validations",
    VALIDATE: "Ensure quality and correctness",
    DOCUMENT: "Add documentation and comments",
    REVIEW: "Review code and get feedback",
    SHIP: "Prepare for deployment",
    COMPLETE: "Finalize and close the loop",
  };
  return descriptions[phase] || "Execute this phase of the loop";
}
