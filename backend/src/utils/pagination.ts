export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export function toSkipTake(page: number, pageSize: number) {
  return {
    skip: Math.max(0, (page - 1) * pageSize),
    take: pageSize,
  };
}

export type SortDirection = "asc" | "desc";

/**
 * Resolve the effective sort direction from an explicit `sortDir` (per-column
 * sorting) falling back to the legacy `sort` ("newest"/"oldest") flag.
 */
export function resolveSortDir(
  sortDir: SortDirection | undefined,
  sort: "newest" | "oldest",
): SortDirection {
  if (sortDir) return sortDir;
  return sort === "oldest" ? "asc" : "desc";
}

/**
 * Build a Prisma `orderBy` from an allowlist map. `sortBy` is validated against
 * the map keys by zod at the schema layer; unknown/missing keys fall back to
 * `createdAt`. The map values are functions that take a direction and return a
 * Prisma orderBy fragment (supports relation ordering like { user: { name } }).
 */
export function resolveOrderBy<TOrderBy>(
  map: Record<string, (dir: SortDirection) => TOrderBy>,
  sortBy: string | undefined,
  dir: SortDirection,
  fallback: (dir: SortDirection) => TOrderBy,
): TOrderBy {
  if (sortBy && map[sortBy]) return map[sortBy](dir);
  return fallback(dir);
}

export function buildPaginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const pageCount = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  return {
    items,
    total,
    page,
    pageSize,
    pageCount,
  };
}
