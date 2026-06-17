import { ArrowLeft, Download, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { JenisBadge } from "@/components/shared/JenisBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useDeleteKrenova, useKrenovaDetail } from "@/hooks/use-krenova";
import { fileUrl } from "@/lib/api";
import { formatTanggal } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";
import type { Krenova } from "@/types";

type AttachmentKey = keyof Pick<
  Krenova,
  "dokumenProposal" | "lampiranOriginalitas" | "lampiranIdentitas"
>;

const attachments: Array<{ key: AttachmentKey; label: string }> = [
  { key: "dokumenProposal", label: "Dokumen Proposal" },
  { key: "lampiranOriginalitas", label: "Lampiran Originalitas" },
  { key: "lampiranIdentitas", label: "Lampiran Identitas" },
];

export function KrenovaDetailContent({
  variant = "public",
}: {
  variant?: "public" | "dashboard";
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const detail = useKrenovaDetail(id);
  const deleteMutation = useDeleteKrenova();
  const user = useAuthStore((state) => state.user);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const data = detail.data;
  const showActions = variant === "dashboard";
  const isOwner = Boolean(user?.role === "Masyarakat" && data && data.userId === user.id);
  const isAdmin = user?.role === "Admin";
  const canEdit = showActions && ((isOwner && data?.status !== "Disetujui") || isAdmin);
  const canDelete = showActions && ((isOwner && data?.status !== "Disetujui") || isAdmin);

  const inovatorTeam = [
    data?.namaInovator2,
    data?.namaInovator3,
    data?.namaInovator4,
    data?.namaInovator5,
  ]
    .filter(Boolean)
    .join(", ") || "-";

  const fotoProduk = data?.fotoProduk;
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
                  <JenisBadge jenis={data.jenisInovasi} />
                  <StatusBadge status={data.status} />
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                    {data.statusPelaku}
                  </span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  {data.judulInovasi}
                </h1>
                <p className="text-base leading-7 text-muted-foreground">
                  {data.tahapInovasi} &middot; diunggah {formatTanggal(data.createdAt)}
                </p>

                {(canEdit || canDelete) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {canEdit && (
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link to={`/krenova/${id}/edit`}>
                          <Pencil className="size-3.5" /> Edit
                        </Link>
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full"
                        onClick={() => setConfirmOpen(true)}
                      >
                        <Trash2 className="size-3.5" /> Hapus
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </AnimatedSection>

            {data.status === "Ditolak" && data.alasanPenolakan && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-semibold text-destructive">Alasan penolakan</p>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                  {data.alasanPenolakan}
                </p>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
              <div className="flex flex-col gap-6">
                <Card className="rounded-[1.75rem]">
                  <CardContent className="grid gap-6 p-5 sm:grid-cols-2">
                    <Field label="Inovator Utama" value={data.namaInovator1} />
                    <Field label="Tim Inovator" value={inovatorTeam} />
                    <Field label="Waktu Uji Coba" value={formatTanggal(data.waktuUjiCoba)} />
                    <Field label="Waktu Penerapan" value={formatTanggal(data.waktuPenerapan)} />
                    {isDashboard && <Field label="Alamat" value={data.alamat} />}
                    {isDashboard && <Field label="Nomor HP" value={data.nomorHp} />}
                  </CardContent>
                </Card>

                {data.abstrak && (
                  <Card className="rounded-[1.75rem]">
                    <CardContent className="p-5">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Abstrak
                      </h2>
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-foreground">
                        {data.abstrak}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {fotoProduk && fotoProduk.length > 0 && (
                  <Card className="rounded-[1.75rem]">
                    <CardContent className="p-5">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Foto Produk
                      </h2>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {fotoProduk.map((path, i) => (
                          <div key={i} className="overflow-hidden rounded-lg border border-border">
                            <img
                              src={fileUrl(path)}
                              alt={`Foto produk ${i + 1}`}
                              className="h-48 w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {isDashboard && (
                  <Card className="rounded-[1.75rem]">
                    <CardContent className="flex flex-col gap-4 p-5">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Lampiran
                      </h2>
                      <ul className="grid gap-3 sm:grid-cols-3">
                        {attachments.map((item) => {
                          const value = data[item.key];
                          return (
                            <li
                              key={item.key}
                              className="rounded-2xl border border-border bg-muted/30 p-4"
                            >
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {item.label}
                              </p>
                              {value ? (
                                <a
                                  href={fileUrl(value)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                                >
                                  <Download className="size-3.5" /> Unduh
                                </a>
                              ) : (
                                <p className="mt-2 text-sm text-muted-foreground">-</p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              <aside className="flex flex-col gap-4">
                <Card className="rounded-[1.75rem]">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Metadata</span>
                    <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between gap-2">
                        <span>Status Pelaku</span>
                        <span className="font-medium text-foreground">{data.statusPelaku}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span>Jenis</span>
                        <span className="font-medium text-foreground">{data.jenisInovasi === "Digital" ? "Digital" : "Non Digital"}</span>
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
          title="Hapus Krenova"
          description="Tindakan ini akan menghapus Krenova beserta lampiran secara permanen."
          confirmLabel="Hapus"
          onConfirm={async () => {
            if (!id) return;
            try {
              await deleteMutation.mutateAsync(id);
              toast.success("Krenova dihapus");
              navigate(isAdmin ? "/admin/krenova" : "/dashboard/masyarakat");
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
