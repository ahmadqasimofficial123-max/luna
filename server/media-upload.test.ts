import { describe, expect, it } from "vitest";
import { ForbiddenError } from "@shared/_core/errors";
import { mediaUploadErrorResponse, normalizeUploadFilename, validateMediaUpload } from "./media-upload";

describe("binary media upload contract", () => {
  it("accepts image and video bodies and rejects empty or unsupported payloads", () => {
    expect(validateMediaUpload(Buffer.from("image"), "image/png")).toEqual({ ok: true, contentType: "image/png" });
    expect(validateMediaUpload(Buffer.from("video"), "video/mp4; charset=binary")).toEqual({ ok: true, contentType: "video/mp4" });
    expect(validateMediaUpload(Buffer.alloc(0), "image/png").statusCode).toBe(400);
    expect(validateMediaUpload(Buffer.from("text"), "text/plain").statusCode).toBe(415);
  });

  it("normalizes filenames and rejects malformed encoding", () => {
    expect(normalizeUploadFilename(encodeURIComponent("my photo!.png"))).toBe("my_photo_.png");
    expect(() => normalizeUploadFilename("%E0%A4%A")).toThrow("Invalid media filename");
  });

  it("preserves protected auth status as JSON-friendly 403 response metadata", () => {
    expect(mediaUploadErrorResponse(ForbiddenError("Invalid session cookie"))).toEqual({ statusCode: 403, error: "Invalid session cookie" });
  });

  it("maps unexpected storage failures to a JSON-friendly 500 response", () => {
    expect(mediaUploadErrorResponse(new Error("storage unavailable"))).toEqual({ statusCode: 500, error: "Could not upload media" });
  });
});
