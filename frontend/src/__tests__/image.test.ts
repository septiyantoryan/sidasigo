import { describe, expect, it } from "vitest";
import { FALLBACK_IMAGE, handleImageError } from "../lib/image";

function makeEvent(img: { src: string }) {
  return { currentTarget: img } as unknown as Parameters<typeof handleImageError>[0];
}

describe("handleImageError", () => {
  it("FALLBACK_IMAGE points to /image.jpg", () => {
    expect(FALLBACK_IMAGE).toBe("/image.jpg");
  });

  it("sets src to the fallback image on error", () => {
    const img = { src: "/api/public-files/x.jpg" };
    handleImageError(makeEvent(img));
    expect(img.src).toBe(FALLBACK_IMAGE);
  });

  it("does not reapply when src already ends with the fallback (anti-loop)", () => {
    const img = { src: `https://example.test${FALLBACK_IMAGE}` };
    handleImageError(makeEvent(img));
    // unchanged because it already ends with the fallback path
    expect(img.src).toBe(`https://example.test${FALLBACK_IMAGE}`);
  });
});
