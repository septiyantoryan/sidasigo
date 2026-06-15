import { describe, expect, it } from "vitest";
import { resolvePublicUrl } from "../lib/url";
import { api } from "../lib/api";

describe("resolvePublicUrl", () => {
  it("returns empty string for null/undefined/empty", () => {
    expect(resolvePublicUrl(null)).toBe("");
    expect(resolvePublicUrl(undefined)).toBe("");
    expect(resolvePublicUrl("")).toBe("");
  });

  it("passes through absolute http(s) URLs", () => {
    expect(resolvePublicUrl("https://cdn.example.com/x.pdf")).toBe(
      "https://cdn.example.com/x.pdf",
    );
    expect(resolvePublicUrl("http://x.test/y.jpg")).toBe("http://x.test/y.jpg");
  });

  it("prefixes relative paths with api.baseUrl", () => {
    expect(resolvePublicUrl("/api/public-files/x.pdf")).toBe(
      `${api.baseUrl}/api/public-files/x.pdf`,
    );
  });
});
