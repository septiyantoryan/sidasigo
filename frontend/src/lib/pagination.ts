export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type PaginationParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "newest" | "oldest";
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export function toQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    usp.set(key, String(value));
  }
  const result = usp.toString();
  return result ? `?${result}` : "";
}

export function getPageNumbers(page: number, pageCount: number): Array<number | "ellipsis"> {
  if (pageCount <= 1) return [1];

  const result: Array<number | "ellipsis"> = [];
  const window = new Set<number>();
  window.add(1);
  window.add(pageCount);
  for (let p = page - 1; p <= page + 1; p += 1) {
    if (p >= 1 && p <= pageCount) {
      window.add(p);
    }
  }

  const sorted = Array.from(window).sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push("ellipsis");
    }
    result.push(sorted[i]);
  }
  return result;
}
