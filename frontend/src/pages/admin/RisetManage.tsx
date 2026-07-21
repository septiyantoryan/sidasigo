import { BookOpen, Eye, Plus } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { DataPagination } from "@/components/shared/DataPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { SortableTableHead, useTableSort } from "@/components/shared/SortableTableHead";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAdminRisetList } from "@/hooks/use-riset";
import { formatTanggal, formatJenisRiset } from "@/lib/format";

type JenisFilter = "All" | "RisetKajian" | "Penelitian" | "PolicyBrief";

export function AdminRisetManagePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState<JenisFilter>("All");

  const debouncedSearch = useDebouncedValue(search, 300);

  const { sort, toggleSort } = useTableSort(
    { sortBy: "createdAt", sortDir: "desc" },
    () => setPage(1),
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, jenis, pageSize]);

  const list = useAdminRisetList({
    page,
    pageSize,
    search: debouncedSearch,
    jenis: jenis === "All" ? undefined : jenis,
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
        title="Riset/Kajian"
        actions={
          <Button asChild>
            <Link to="/admin/riset/tambah">
              <Plus className="size-4" /> Tambah
            </Link>
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari judul atau peneliti..."
            className="w-full sm:flex-1"
          />
          <Select value={jenis} onValueChange={(value) => setJenis(value as JenisFilter)}>
            <SelectTrigger className="shrink-0 sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Semua jenis</SelectItem>
              <SelectItem value="RisetKajian">Riset/Kajian</SelectItem>
              <SelectItem value="Penelitian">Penelitian</SelectItem>
              <SelectItem value="PolicyBrief">Policy Brief</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isInitialLoading ? (
          <LoadingSkeleton rows={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Belum ada riset/kajian"
            description="Tambahkan dokumen riset atau kajian untuk ditampilkan ke publik."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <SortableTableHead column="judulKajian" label="Judul" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="timPeneliti" label="Tim Peneliti" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="jenis" label="Jenis" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="tahunPublikasi" label="Tahun" sort={sort} onSort={toggleSort} />
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
                    <TableCell className="max-w-[12rem] truncate font-medium">{item.judulKajian}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.timPeneliti}</TableCell>
                    <TableCell>
                      <Badge variant={item.jenis === "PolicyBrief" ? "outline" : item.jenis === "RisetKajian" ? "default" : "secondary"}>
                        {formatJenisRiset(item.jenis)}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.tahunPublikasi}</TableCell>
                    <TableCell>{formatTanggal(item.createdAt)}</TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/riset/${item.id}`}>
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
