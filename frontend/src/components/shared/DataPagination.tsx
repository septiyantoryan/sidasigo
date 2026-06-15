import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPageNumbers } from "@/lib/pagination";

type DataPaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function DataPagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}: DataPaginationProps) {
  const pages = getPageNumbers(page, pageCount);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= pageCount;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
    >
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-sm text-muted-foreground">
          Menampilkan {from}–{to} dari {total}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Baris per halaman</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger size="sm" className="w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={prevDisabled}
              data-disabled={prevDisabled || undefined}
              className={prevDisabled ? "pointer-events-none opacity-50" : undefined}
              onClick={(event) => {
                event.preventDefault();
                if (prevDisabled) return;
                onPageChange(page - 1);
              }}
            />
          </PaginationItem>

          {pages.map((entry, index) =>
            entry === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={entry}>
                <PaginationLink
                  href="#"
                  isActive={entry === page}
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(entry);
                  }}
                >
                  {entry}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={nextDisabled}
              data-disabled={nextDisabled || undefined}
              className={nextDisabled ? "pointer-events-none opacity-50" : undefined}
              onClick={(event) => {
                event.preventDefault();
                if (nextDisabled) return;
                onPageChange(page + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
