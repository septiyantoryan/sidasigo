import { Eye, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { JenisBadge } from "@/components/shared/JenisBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { SortableTableHead, useTableSort } from "@/components/shared/SortableTableHead";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAdminKrenova } from "@/hooks/use-dashboard";
import { formatTanggal } from "@/lib/format";

type StatusFilter = "All" | "Pending" | "Disetujui" | "Ditolak";
type JenisFilter = "All" | "Digital" | "Non_Digital";
type StatusPelakuFilter = "All" | "Umum" | "Pelajar";

export function AdminKrenovaManagePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [jenis, setJenis] = useState<JenisFilter>("All");
  const [statusPelaku, setStatusPelaku] = useState<StatusPelakuFilter>("All");

  const debouncedSearch = useDebouncedValue(search, 300);

  const { sort, toggleSort } = useTableSort(
    { sortBy: "createdAt", sortDir: "desc" },
    () => setPage(1),
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, jenis, statusPelaku, pageSize]);

  const list = useAdminKrenova({
    page,
    pageSize,
    search: debouncedSearch,
    status: status === "All" ? undefined : status,
    jenis: jenis === "All" ? undefined : jenis,
    statusPelaku: statusPelaku === "All" ? undefined : statusPelaku,
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
        title="Krenova"
      />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari judul atau inovator..."
            className="w-full sm:flex-1"
          />
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Semua status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Disetujui">Disetujui</SelectItem>
                <SelectItem value="Ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jenis} onValueChange={(value) => setJenis(value as JenisFilter)}>
              <SelectTrigger className="sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Semua jenis</SelectItem>
                <SelectItem value="Digital">Digital</SelectItem>
                <SelectItem value="Non_Digital">Non Digital</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusPelaku}
              onValueChange={(value) => setStatusPelaku(value as StatusPelakuFilter)}
            >
              <SelectTrigger className="sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Semua pelaku</SelectItem>
                <SelectItem value="Umum">Umum</SelectItem>
                <SelectItem value="Pelajar">Pelajar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isInitialLoading ? (
          <LoadingSkeleton rows={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Belum ada Krenova"
            description="Tidak ada Krenova yang cocok dengan filter Anda."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <SortableTableHead column="judulInovasi" label="Judul" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="namaInovator1" label="Inovator" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="jenisInovasi" label="Jenis" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="statusPelaku" label="Pelaku" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="waktuPenerapan" label="Tanggal Penerapan" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="status" label="Status" sort={sort} onSort={toggleSort} />
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{item.judulInovasi}</TableCell>
                    <TableCell>{item.namaInovator1}</TableCell>
                    <TableCell>
                      <JenisBadge jenis={item.jenisInovasi} />
                    </TableCell>
                    <TableCell>{item.statusPelaku}</TableCell>
                    <TableCell>{formatTanggal(item.waktuPenerapan)}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/krenova/${item.id}`}>
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
