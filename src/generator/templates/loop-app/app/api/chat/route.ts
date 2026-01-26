import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { loopConfig } from "@/lib/loop-config";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, currentPhase, loopId } = await req.json();

  // Get current phase skills
  const phaseConfig = loopConfig.phases.find(p => p.name === currentPhase);
  const phaseSkills = phaseConfig?.skills.map(s => s.skillId).join(", ") || "none";

  // Build system prompt
  const systemPrompt = `You are an AI assistant executing the ${loopConfig.name}.

Current Phase: ${currentPhase}
Available Skills: ${phaseSkills}

Loop Description:
${loopConfig.description}

Your role is to help the user work through the ${currentPhase} phase. You should:
1. Understand what needs to be accomplished in this phase
2. Execute the relevant skills when requested
3. Produce high-quality deliverables
4. Indicate when the phase is complete by including [PHASE_COMPLETE] in your response

Be concise but thorough. Focus on practical execution rather than lengthy explanations.
When executing a skill, clearly state what you're doing and produce concrete outputs.`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
