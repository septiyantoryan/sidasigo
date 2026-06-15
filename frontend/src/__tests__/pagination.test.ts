import { describe, expect, it } from "vitest";
import { toQueryString, getPageNumbers } from "../lib/pagination";

describe("toQueryString", () => {
  it("returns empty string when no params", () => {
    expect(toQueryString({})).toBe("");
  });

  it("skips undefined, null, and empty-string values", () => {
    expect(toQueryString({ a: undefined, b: null, c: "" })).toBe("");
  });

  it("builds a query string from defined values", () => {
    expect(toQueryString({ page: 2, search: "padi" })).toBe("?page=2&search=padi");
  });

  it("includes boolean and number values", () => {
    expect(toQueryString({ active: true, page: 1 })).toBe("?active=true&page=1");
  });

  it("keeps zero values", () => {
    expect(toQueryString({ page: 0 })).toBe("?page=0");
  });
});

describe("getPageNumbers", () => {
  it("returns [1] when pageCount <= 1", () => {
    expect(getPageNumbers(1, 1)).toEqual([1]);
    expect(getPageNumbers(1, 0)).toEqual([1]);
  });

  it("returns all pages without ellipsis for small ranges", () => {
    expect(getPageNumbers(1, 3)).toEqual([1, 2, 3]);
  });

  it("inserts ellipsis between gaps", () => {
    expect(getPageNumbers(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
  });

  it("does not duplicate first/last when adjacent", () => {
    expect(getPageNumbers(2, 4)).toEqual([1, 2, 3, 4]);
  });
});
