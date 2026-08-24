import { describe, expect, it } from "vitest";
import { GAME_CONFIGS } from "../client/src/pages/game-config";

describe("Luna Social game catalog", () => {
  it("contains the three requested standalone game destinations", () => {
    expect(Object.keys(GAME_CONFIGS)).toEqual(["poxel", "funkin", "wbwwb"]);
    expect(GAME_CONFIGS.poxel.title).toBe("Poxel.io");
    expect(GAME_CONFIGS.funkin.title).toContain("Friday Night Funkin");
    expect(GAME_CONFIGS.wbwwb.title).toBe("We Become What We Behold");
  });

  it("keeps each embed pointed at its original publisher", () => {
    expect(GAME_CONFIGS.poxel.sourceUrl).toBe("https://poxel.io/");
    expect(GAME_CONFIGS.funkin.sourceUrl).toBe("https://ninja-muffin24.itch.io/funkin");
    expect(GAME_CONFIGS.wbwwb.sourceUrl).toBe("https://ncase.itch.io/wbwwb");
  });

  it("uses the uploaded Poxel cover asset", () => {
    expect(GAME_CONFIGS.poxel.coverUrl).toBe("/manus-storage/poxel-cover_3dd5a4bc.webp");
  });
});
