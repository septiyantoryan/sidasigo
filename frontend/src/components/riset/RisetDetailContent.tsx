import { ArrowLeft, Download, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useDeleteRiset, useRisetDetail } from "@/hooks/use-riset";
import { resolvePublicUrl } from "@/lib/url";
import { formatTanggal, formatJenisRiset } from "@/lib/format";


export function RisetDetailContent({
  variant = "public",
}: {
  variant?: "public" | "admin";
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const detail = useRisetDetail(id);
  const deleteMutation = useDeleteRiset();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const data = detail.data;
  const isAdmin = variant === "admin";
  const isDashboard = variant !== "public";
  const shellClass = isDashboard ? "" : "min-h-screen bg-background text-foreground";
  const innerClass = isDashboard
    ? "flex w-full flex-col gap-8"
    : "mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:py-14";

  return (
    <div className={shellClass}>
      <div className={innerClass}>
        <Button
          variant="ghost"
          size="sm"
          className={isDashboard ? "-ml-2 w-fit" : "w-fit rounded-full"}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="size-4" /> Kembali
        </Button>

        {detail.isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : data ? (
          <>
            <AnimatedSection direction="up">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={data.jenis === "RisetKajian" ? "default" : "secondary"}>
                    {formatJenisRiset(data.jenis)}
                  </Badge>
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                    {data.tahunPublikasi}
                  </span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  {data.judulKajian}
                </h1>
                <p className="text-base leading-7 text-muted-foreground">
                  {data.timPeneliti}
                </p>

                {isAdmin && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link to={`/admin/riset/${id}/edit`}>
                        <Pencil className="size-3.5" /> Edit
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-full"
                      onClick={() => setConfirmOpen(true)}
                    >
                      <Trash2 className="size-3.5" /> Hapus
                    </Button>
                  </div>
                )}
              </div>
            </AnimatedSection>

            <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
              <Card className="rounded-[1.75rem]">
                <CardContent className="flex flex-col gap-4 p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Abstrak
                  </h2>
                  <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                    {data.abstrak}
                  </p>
                </CardContent>
              </Card>

              <aside className="flex flex-col gap-4">
                <Card className="rounded-[1.75rem]">
                  <CardContent className="flex flex-col gap-4 p-5">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Dokumen
                    </span>
                    {data.filePath ? (
                      <a
                        href={resolvePublicUrl(data.filePath)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <Download className="size-4" /> Unduh / Baca PDF
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">-</p>
                    )}

                    <div className="flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between gap-2">
                        <span>Jenis</span>
                        <span className="font-medium text-foreground">{formatJenisRiset(data.jenis)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span>Tahun</span>
                        <span className="font-medium text-foreground">{data.tahunPublikasi}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span>Diperbarui</span>
                        <span className="font-medium text-foreground">{formatTanggal(data.updatedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Data tidak ditemukan.</p>
        )}

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Hapus Riset/Kajian"
          description="Tindakan ini akan menghapus data beserta dokumen secara permanen."
          confirmLabel="Hapus"
          onConfirm={async () => {
            if (!id) return;
            try {
              await deleteMutation.mutateAsync(id);
              toast.success("Riset/Kajian dihapus");
              navigate("/admin/riset");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Gagal menghapus");
            } finally {
              setConfirmOpen(false);
            }
          }}
        />
      </div>
    </div>
  );
}
