import { describe, expect, it } from "vitest";
import { buildAgentMessages, LUNA_AGENT_SYSTEM_PROMPT } from "./ai-agent";

describe("Luna Agent message contract", () => {
  it("adds the product safety prompt and member context before history", () => {
    const messages = buildAgentMessages("Ahmad", [{ role: "user", content: "Recommend a game" }]);
    expect(messages[0]).toEqual({ role: "system", content: LUNA_AGENT_SYSTEM_PROMPT });
    expect(messages[1]).toEqual({ role: "user", content: "The signed-in Luna Social member is Ahmad." });
    expect(messages[2]).toEqual({ role: "user", content: "Recommend a game" });
  });

  it("preserves multi-turn order and uses a safe fallback member label", () => {
    const messages = buildAgentMessages("", [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
    ]);
    expect(messages[1].content).toBe("The signed-in Luna Social member is a member.");
    expect(messages.slice(2)).toEqual([
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
    ]);
  });
});
