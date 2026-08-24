import { describe, expect, it } from "vitest";
import { GAME_CONFIGS, HUB_GAMES } from "../client/src/pages/game-config";

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

  it("lists every requested hub game and preserves publisher links", () => {
    expect(HUB_GAMES).toHaveLength(7);
    expect(HUB_GAMES.map(game => game.title)).toEqual(["Shell Shockers", "Drift Hunters", "Moto X3M", "ZombsRoyale.io", "Robbery Bob 2", "We Become What We Behold", "Poxel.io"]);
    expect(HUB_GAMES.filter(game => game.mode === "external")).toHaveLength(5);
    expect(HUB_GAMES.find(game => game.slug === "zombsroyale")?.sourceUrl).toBe("https://zombsroyale.io/");
  });
});
