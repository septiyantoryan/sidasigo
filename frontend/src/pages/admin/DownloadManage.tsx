import { Download as DownloadIcon, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataPagination } from "@/components/shared/DataPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { SortableTableHead, useTableSort } from "@/components/shared/SortableTableHead";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAdminDownloadList, useDeleteDownload } from "@/hooks/use-download";
import { resolvePublicUrl } from "@/lib/url";
import { formatTanggal } from "@/lib/format";


export function AdminDownloadManagePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const deleteMutation = useDeleteDownload();

  const { sort, toggleSort } = useTableSort(
    { sortBy: "createdAt", sortDir: "desc" },
    () => setPage(1),
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const list = useAdminDownloadList({
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
        title="Unduhan"

        actions={
          <Button asChild>
            <Link to="/admin/download/tambah">
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
            placeholder="Cari judul dokumen..."
            className="w-full"
          />
        </div>

        {isInitialLoading ? (
          <LoadingSkeleton rows={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={DownloadIcon}
            title="Belum ada dokumen"
            description="Tambahkan dokumen untuk diunduh publik."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <SortableTableHead column="judul" label="Judul" sort={sort} onSort={toggleSort} />
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
                    <TableCell className="font-medium">{item.judul}</TableCell>
                    <TableCell>{formatTanggal(item.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Button asChild size="sm" variant="outline">
                          <a href={resolvePublicUrl(item.filePath)} target="_blank" rel="noreferrer">
                            <FileText className="size-3.5" /> Lihat
                          </a>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/admin/download/${item.id}/edit`}>
                            <Pencil className="size-3.5" /> Edit
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="size-3.5" /> Hapus
                        </Button>
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
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Dokumen"
        description="Tindakan ini akan menghapus dokumen beserta filenya secara permanen."
        confirmLabel="Hapus"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await deleteMutation.mutateAsync(deleteId);
            toast.success("Dokumen dihapus");
            // Re-clamp page if we just deleted the last item on a non-first page.
            if (items.length === 1 && page > 1) {
              setPage(page - 1);
            }
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal menghapus");
          } finally {
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
