import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc";

export type SortState = {
  sortBy: string;
  sortDir: SortDir;
};

/**
 * Manage single-column sort state for a datatable.
 *
 * - Clicking an inactive column activates it ascending.
 * - Clicking the active column flips its direction.
 *
 * `onChange` is invoked after each toggle (e.g. to reset pagination to page 1).
 */
export function useTableSort(
  initial: SortState = { sortBy: "createdAt", sortDir: "desc" },
  onChange?: () => void,
) {
  const [sort, setSort] = useState<SortState>(initial);

  function toggleSort(column: string) {
    setSort((prev) =>
      prev.sortBy === column
        ? { sortBy: column, sortDir: prev.sortDir === "asc" ? "desc" : "asc" }
        : { sortBy: column, sortDir: "asc" },
    );
    onChange?.();
  }

  return { sort, toggleSort };
}

type SortableTableHeadProps = {
  /** Column key sent to the API (must match the server's allowed sortBy enum). */
  column: string;
  label: string;
  sort: SortState;
  onSort: (column: string) => void;
  className?: string;
};

export function SortableTableHead({
  column,
  label,
  sort,
  onSort,
  className,
}: SortableTableHeadProps) {
  const active = sort.sortBy === column;
  const ariaSort: React.AriaAttributes["aria-sort"] = active
    ? sort.sortDir === "asc"
      ? "ascending"
      : "descending"
    : "none";

  return (
    <TableHead aria-sort={ariaSort} className={className}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <span>{label}</span>
        {active ? (
          sort.sortDir === "asc" ? (
            <ArrowUp className="size-3.5" aria-hidden />
          ) : (
            <ArrowDown className="size-3.5" aria-hidden />
          )
        ) : (
          <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden />
        )}
      </button>
    </TableHead>
  );
}
