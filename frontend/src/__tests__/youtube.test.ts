import { describe, expect, it } from "vitest";
import { getYouTubeEmbedUrl } from "../lib/youtube";

describe("getYouTubeEmbedUrl", () => {
  it("converts watch URL to embed", () => {
    expect(getYouTubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("converts youtu.be short URL to embed", () => {
    expect(getYouTubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("converts shorts URL to embed", () => {
    expect(getYouTubeEmbedUrl("https://www.youtube.com/shorts/abc123")).toBe(
      "https://www.youtube.com/embed/abc123",
    );
  });

  it("returns null for non-youtube URL", () => {
    expect(getYouTubeEmbedUrl("https://vimeo.com/12345")).toBeNull();
  });

  it("returns null for invalid input", () => {
    expect(getYouTubeEmbedUrl("not-a-url")).toBeNull();
    expect(getYouTubeEmbedUrl("")).toBeNull();
  });
});
