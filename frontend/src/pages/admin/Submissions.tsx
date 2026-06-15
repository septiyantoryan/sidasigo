import { ClipboardList, Eye } from "lucide-react";
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
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAdminSubmissions } from "@/hooks/use-dashboard";
import { formatTanggal } from "@/lib/format";

type ApprovalType = "InovasiDaerah" | "Krenova";

const TITLES: Record<ApprovalType, string> = {
  InovasiDaerah: "Approval Inovasi Daerah",
  Krenova: "Approval Krenova",
};

const SEARCH_PLACEHOLDERS: Record<ApprovalType, string> = {
  InovasiDaerah: "Cari nama inovasi atau pengaju...",
  Krenova: "Cari judul krenova atau pengaju...",
};

export function AdminSubmissionsPage({ type }: { type: ApprovalType }) {
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
  }, [debouncedSearch, type, pageSize]);

  const submissions = useAdminSubmissions({
    page,
    pageSize,
    search: debouncedSearch,
    type,
    sortBy: sort.sortBy,
    sortDir: sort.sortDir,
  });

  const items = submissions.data?.items ?? [];
  const pageCount = submissions.data?.pageCount ?? 1;
  const total = submissions.data?.total ?? 0;
  const isInitialLoading = submissions.isLoading && !submissions.data;

  return (
    <div className="space-y-6">
      <PageHeader title={TITLES[type]} />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={SEARCH_PLACEHOLDERS[type]}
            className="w-full"
          />
        </div>

        {isInitialLoading ? (
          <LoadingSkeleton rows={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Antrian kosong"
            description="Tidak ada submission yang menunggu review saat ini."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <SortableTableHead column="title" label="Judul" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="submitter" label="Pengaju" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="createdAt" label="Tanggal" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="status" label="Status" sort={sort} onSort={toggleSort} />
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={`${item.type}-${item.id}`}>
                    <TableCell className="text-muted-foreground">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.submitter}</TableCell>
                    <TableCell>{formatTanggal(item.createdAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status as never} />
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/approval/${item.type}/${item.id}`}>
                          <Eye className="size-3.5" /> Review
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
