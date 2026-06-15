import { UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useAdminGoogleUsers } from "@/hooks/use-dashboard";
import { formatTanggal } from "@/lib/format";

export function AdminGoogleUsersPage() {
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

  const list = useAdminGoogleUsers({
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
        title="Pengguna Google"
      />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full"
          />
        </div>

        {isInitialLoading ? (
          <LoadingSkeleton rows={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="Belum ada pengguna Google"
            description="Belum ada pengguna yang mendaftar melalui Google."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <SortableTableHead column="name" label="Nama" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="email" label="Email" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="createdAt" label="Tanggal Daftar" sort={sort} onSort={toggleSort} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-muted-foreground">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatTanggal(user.createdAt)}</TableCell>
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
