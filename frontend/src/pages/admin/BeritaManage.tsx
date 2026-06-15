import { Eye, Newspaper, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { DataPagination } from "@/components/shared/DataPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { SortableTableHead, useTableSort } from "@/components/shared/SortableTableHead";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAdminBeritaList } from "@/hooks/use-berita";
import { resolvePublicUrl } from "@/lib/url";
import { formatTanggal } from "@/lib/format";
import { handleImageError } from "@/lib/image";


export function AdminBeritaManagePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebouncedValue(search, 300);

  const { sort, toggleSort } = useTableSort(
    { sortBy: "createdAt", sortDir: "desc" },
    () => setPage(1),
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const list = useAdminBeritaList({
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
    <div className="space-y-6">
      <PageHeader
        title="Berita"

        actions={
          <Button asChild>
            <Link to="/admin/berita/tambah">
              <Plus className="size-4" /> Tambah
            </Link>
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari caption berita..."
            className="w-full"
          />
        </div>

        {isInitialLoading ? (
          <LoadingSkeleton rows={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="Belum ada berita"
            description="Tambahkan berita untuk ditampilkan ke publik."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Poster</TableHead>
                  <SortableTableHead column="caption" label="Caption" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="createdAt" label="Dibuat" sort={sort} onSort={toggleSort} />
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell>
                      <img
                        src={resolvePublicUrl(item.posterPath)}
                        alt="Poster"
                        onError={handleImageError}
                        className="h-12 w-16 rounded-md border border-border object-cover"
                      />
                    </TableCell>
                    <TableCell className="max-w-md">
                      <span className="line-clamp-2 text-sm">{item.caption}</span>
                    </TableCell>
                    <TableCell>{formatTanggal(item.createdAt)}</TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/berita/${item.id}`}>
                          <Eye className="size-3.5" /> Detail
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4">
              <DataPagination
                page={page}
                pageCount={pageCount}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
