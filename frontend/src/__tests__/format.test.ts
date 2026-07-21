import { describe, expect, it } from "vitest";
import { formatTanggal, formatJenis, formatJenisRiset } from "../lib/format";

describe("formatTanggal", () => {
  it("returns '-' for null/undefined/empty", () => {
    expect(formatTanggal(null)).toBe("-");
    expect(formatTanggal(undefined)).toBe("-");
    expect(formatTanggal("")).toBe("-");
  });

  it("returns '-' for invalid date", () => {
    expect(formatTanggal("bukan-tanggal")).toBe("-");
  });

  it("formats a valid ISO date in id-ID short format", () => {
    const result = formatTanggal("2024-03-15T00:00:00.000Z");
    expect(result).toMatch(/2024/);
    expect(result).not.toBe("-");
  });

  it("accepts a Date object", () => {
    const result = formatTanggal(new Date("2023-01-20T00:00:00.000Z"));
    expect(result).toMatch(/2023/);
  });
});

describe("formatJenis", () => {
  it("maps Digital", () => {
    expect(formatJenis("Digital")).toBe("Digital");
  });

  it("maps Non_Digital to 'Non Digital'", () => {
    expect(formatJenis("Non_Digital")).toBe("Non Digital");
  });
});

describe("formatJenisRiset", () => {
  it("maps RisetKajian to 'Riset/Kajian'", () => {
    expect(formatJenisRiset("RisetKajian")).toBe("Riset/Kajian");
  });

  it("maps Penelitian", () => {
    expect(formatJenisRiset("Penelitian")).toBe("Penelitian");
  });

  it("maps PolicyBrief to 'Policy Brief'", () => {
    expect(formatJenisRiset("PolicyBrief")).toBe("Policy Brief");
  });
});
