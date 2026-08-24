import { describe, expect, it } from "vitest";
import { resolvePublishedPostId, resolvePublishedPostMediaUrl } from "../client/src/pages/post-media";

describe("published post media contract", () => {
  it("keeps the exact uploaded URL instead of a fallback image", () => {
    expect(resolvePublishedPostMediaUrl("https://cdn.example.com/my-selected-photo.jpg", "https://cdn.example.com/demo.jpg")).toBe("https://cdn.example.com/my-selected-photo.jpg");
  });

  it("uses the fallback only when no uploaded URL exists", () => {
    expect(resolvePublishedPostMediaUrl("  ", "https://cdn.example.com/demo.jpg")).toBe("https://cdn.example.com/demo.jpg");
  });

  it("prefers the persisted post ID over a temporary optimistic ID", () => {
    expect(resolvePublishedPostId(42, 999)).toBe(42);
    expect(resolvePublishedPostId(undefined, 999)).toBe(999);
  });
});

