import { Download as DownloadIcon, FileSearch, FileText, Search } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { DataPagination } from "@/components/shared/DataPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { SortableTableHead, useTableSort } from "@/components/shared/SortableTableHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useDownloadList } from "@/hooks/use-download";
import { resolvePublicUrl } from "@/lib/url";
import { formatTanggal } from "@/lib/format";


export function DownloadListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebouncedValue(search, 300);

  const { sort, toggleSort } = useTableSort(
    { sortBy: "createdAt", sortDir: "desc" },
    () => setPage(1),
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const list = useDownloadList({
    page,
    pageSize,
    search: debouncedSearch,
    sortBy: sort.sortBy,
    sortDir: sort.sortDir,
  });

  const items = list.data?.items ?? [];
  const pageCount = list.data?.pageCount ?? 1;
  const total = list.data?.total ?? 0;
  const isInitialLoading = list.isLoading && !list.data;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:py-14">
        <AnimatedSection direction="up">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-black tracking-tight text-foreground text-center sm:text-5xl">
              Unduhan
            </h1>
          </div>
        </AnimatedSection>

        <div className="sticky top-16 z-20 -mx-4 bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="relative mx-auto max-w-6xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Cari dokumen"
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Cari judul dokumen..."
              className="rounded-full pl-9"
            />
          </div>
        </div>

        {isInitialLoading ? (
          <LoadingSkeleton rows={4} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="Belum ada dokumen"
            description="Belum ada dokumen yang cocok dengan pencarian Anda."
          />
        ) : (
          <AnimatedSection direction="up" className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <SortableTableHead column="judul" label="Judul Dokumen" sort={sort} onSort={toggleSort} />
                    <SortableTableHead column="createdAt" label="Tanggal" sort={sort} onSort={toggleSort} className="hidden sm:table-cell" />
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">
                        {(page - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center gap-2">
                          <FileText className="size-4 shrink-0 text-primary" aria-hidden />
                          {item.judul}
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {formatTanggal(item.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" className="rounded-full">
                          <a
                            href={resolvePublicUrl(item.filePath)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <DownloadIcon className="size-3.5" /> Unduh
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pageCount > 1 && (
              <DataPagination
                page={page}
                pageCount={pageCount}
                total={total}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={setPageSize}
              />
            )}
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
