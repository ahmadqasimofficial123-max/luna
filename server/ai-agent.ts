export type AgentMessage = { role: "user" | "assistant"; content: string };

export const LUNA_AGENT_SYSTEM_PROMPT = "You are Luna Agent, the helpful AI assistant inside Luna Social. Answer directly and conversationally. Help with games, navigating Luna Social, coding, troubleshooting, recommendations, and general questions. Never claim an action was completed unless the app confirms it. If current information is requested, say that web lookup is needed rather than inventing facts.";

export function buildAgentMessages(memberName: string, messages: AgentMessage[]) {
  return [
    { role: "system" as const, content: LUNA_AGENT_SYSTEM_PROMPT },
    { role: "user" as const, content: `The signed-in Luna Social member is ${memberName || "a member"}.` },
    ...messages,
  ];
}
