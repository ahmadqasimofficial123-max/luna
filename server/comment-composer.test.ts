import { describe, expect, it } from "vitest";
import { clearCommentDraft, nextCommentInputKey } from "../client/src/pages/comment-composer";

describe("comment composer reset contract", () => {
  it("clears only the submitted post draft", () => {
    expect(clearCommentDraft({ 1: "First comment", 2: "Keep this draft" }, 1)).toEqual({ 1: "", 2: "Keep this draft" });
  });

  it("creates a fresh input key after each submit", () => {
    expect(nextCommentInputKey(1, 0)).not.toBe(nextCommentInputKey(1, 1));
  });
});

