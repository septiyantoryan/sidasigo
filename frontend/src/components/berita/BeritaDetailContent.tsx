import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useDeleteBerita, useBeritaDetail } from "@/hooks/use-berita";
import { resolvePublicUrl } from "@/lib/url";
import { formatTanggal } from "@/lib/format";
import { handleImageError } from "@/lib/image";


export function BeritaDetailContent({
  variant = "public",
}: {
  variant?: "public" | "admin";
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const detail = useBeritaDetail(id);
  const deleteMutation = useDeleteBerita();
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">
                    {formatTanggal(data.createdAt)}
                  </span>
                  {isAdmin && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link to={`/admin/berita/${id}/edit`}>
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

                <div className="overflow-hidden rounded-[1.75rem] border border-border bg-muted">
                  <img
                    src={resolvePublicUrl(data.posterPath)}
                    alt="Poster berita"
                    onError={handleImageError}
                    className="w-full object-contain"
                  />
                </div>

                <Card className="rounded-[1.75rem]">
                  <CardContent className="p-6">
                    <p className="whitespace-pre-line text-base leading-7 text-foreground">
                      {data.caption}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Berita tidak ditemukan.</p>
        )}

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Hapus Berita"
          description="Tindakan ini akan menghapus berita beserta poster secara permanen."
          confirmLabel="Hapus"
          onConfirm={async () => {
            if (!id) return;
            try {
              await deleteMutation.mutateAsync(id);
              toast.success("Berita dihapus");
              navigate("/admin/berita");
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
