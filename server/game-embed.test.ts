import { describe, expect, it } from "vitest";
import { isKnownBlockedEmbedUrl } from "../client/src/pages/game-embed";

describe("game embed safety", () => {
  it("identifies known publisher frame blockers", () => {
    expect(isKnownBlockedEmbedUrl("https://poki.com/en/g/drift-boss")).toBe(true);
    expect(isKnownBlockedEmbedUrl("https://www.crazygames.com/game/moto-x3m")).toBe(true);
  });

  it("does not classify safe or malformed URLs as known blockers", () => {
    expect(isKnownBlockedEmbedUrl("https://poxel.io/")).toBe(false);
    expect(isKnownBlockedEmbedUrl("not-a-url")).toBe(false);
  });
});
