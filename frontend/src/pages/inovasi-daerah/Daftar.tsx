import { Lightbulb, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataPagination } from "@/components/shared/DataPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { JenisBadge } from "@/components/shared/JenisBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { SortableTableHead, useTableSort } from "@/components/shared/SortableTableHead";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useDeleteInovasiDaerah,
  useMyInovasiDaerah,
  useMyInovasiStats,
} from "@/hooks/use-inovasi-daerah";
import { Input } from "@/components/ui/input";
import { formatTanggal } from "@/lib/format";

export function DaftarInovasiPage() {
  const stats = useMyInovasiStats();
  const deleteMutation = useDeleteInovasiDaerah();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { sort, toggleSort } = useTableSort(
    { sortBy: "createdAt", sortDir: "desc" },
    () => setPage(1),
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const list = useMyInovasiDaerah({
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
  const totalDisplayed = stats.data?.total ?? list.data?.total ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Daftar Inovasi"
        actions={
          <Button asChild>
            <Link to="/inovasi-daerah/tambah">
              <Plus className="size-4" /> Tambah Inovasi
            </Link>
          </Button>
        }
      />

      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari inovasi..."
            className="w-full"
          />
        </div>

        {isInitialLoading ? (
          <LoadingSkeleton rows={5} />
        ) : totalDisplayed === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="Belum ada inovasi"
            description="Mulai unggah inovasi daerah untuk OPD Anda."
            action={
              <Button asChild>
                <Link to="/inovasi-daerah/tambah">
                  <Plus className="size-4" /> Tambah Inovasi
                </Link>
              </Button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="Tidak ada hasil"
            description="Coba gunakan kata kunci lain."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <SortableTableHead column="namaInovasi" label="Nama Inovasi" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="jenisInovasi" label="Jenis" sort={sort} onSort={toggleSort} />
                  <SortableTableHead column="tglPenerapan" label="Tanggal Penerapan" sort={sort} onSort={toggleSort} />
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
                    <TableCell className="font-medium">{item.namaInovasi}</TableCell>
                    <TableCell>
                      <JenisBadge jenis={item.jenisInovasi} />
                    </TableCell>
                    <TableCell>{formatTanggal(item.tglPenerapan)}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-start gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/dashboard/inovasi-daerah/${item.id}`}>
                            Detail
                          </Link>
                        </Button>
                        {item.status === "Pending" && (
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/inovasi-daerah/${item.id}/edit`}>Edit</Link>
                          </Button>
                        )}
                        <Button asChild size="sm">
                          <Link to={`/inovasi-daerah/${item.id}/indikator`}>
                            Indikator
                          </Link>
                        </Button>
                        {item.status === "Pending" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setPendingDelete({
                                id: item.id,
                                name: item.namaInovasi,
                              })
                            }
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
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
      </section>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Hapus Inovasi Daerah"
        description={
          pendingDelete
            ? `Inovasi "${pendingDelete.name}" akan dihapus permanen beserta seluruh berkas indikator.`
            : undefined
        }
        confirmLabel="Hapus"
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await deleteMutation.mutateAsync(pendingDelete.id);
            toast.success("Inovasi dihapus");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal menghapus");
          } finally {
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}
