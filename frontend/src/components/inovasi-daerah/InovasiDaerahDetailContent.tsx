import {
  ArrowLeft,
  CalendarCheck,
  CalendarClock,
  FileSearch,
  Pencil,
  RefreshCw,
  Settings2,
  Trash2,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndikatorViewer } from "@/components/inovasi-daerah/IndikatorViewer";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { JenisBadge } from "@/components/shared/JenisBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useDeleteInovasiDaerah,
  useInovasiDaerahDetail,
} from "@/hooks/use-inovasi-daerah";
import { formatTanggal } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function NarrativeBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
        {title}
      </h3>
      <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
        {value || "-"}
      </p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

export function InovasiDaerahDetailContent({
  variant = "public",
}: {
  variant?: "public" | "dashboard";
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const detail = useInovasiDaerahDetail(id);
  const deleteMutation = useDeleteInovasiDaerah();
  const user = useAuthStore((state) => state.user);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const data = detail.data;
  const showActions = variant === "dashboard";
  const isOwner = Boolean(user?.role === "OPD" && data && data.userId === user.id);
  const isAdmin = user?.role === "Admin";
  const canEdit = showActions && isOwner && data?.status === "Pending";
  const canDelete = showActions && ((isOwner && data?.status === "Pending") || isAdmin);
  const canManageIndikator = showActions && isOwner;
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
          <DetailSkeleton />
        ) : data ? (
          <>
            <AnimatedSection direction="up">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-2">
                  <JenisBadge jenis={data.jenisInovasi} />
                  <StatusBadge status={data.status} />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  {data.namaInovasi}
                </h1>
                <p className="text-base leading-7 text-muted-foreground">
                  {data.bentukInovasi}
                </p>

                {(canEdit || canManageIndikator || canDelete) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {canEdit && (
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link to={`/inovasi-daerah/${id}/edit`}>
                          <Pencil className="size-3.5" /> Edit
                        </Link>
                      </Button>
                    )}
                    {canManageIndikator && (
                      <Button asChild size="sm" className="rounded-full">
                        <Link to={`/inovasi-daerah/${id}/indikator`}>
                          <Settings2 className="size-3.5" /> Kelola Indikator
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
              <Tabs defaultValue="profil" className="w-full">
                <Card className="rounded-[1.75rem]">
                  <CardHeader>
                    <TabsList className="gap-2 rounded-full w-fit">
                      <TabsTrigger value="profil" className="rounded-full">Profil Inovasi</TabsTrigger>
                      <TabsTrigger value="indikator" className="rounded-full">Indikator</TabsTrigger>
                    </TabsList>
                  </CardHeader>

                  <TabsContent value="profil">
                    <CardContent className="flex flex-col gap-6">
                      <NarrativeBlock title="Rancang Bangun" value={data.rancangBangun} />
                      <Separator />
                      <NarrativeBlock title="Tujuan" value={data.tujuan} />
                      <Separator />
                      <NarrativeBlock title="Manfaat" value={data.manfaat} />
                      <Separator />
                      <NarrativeBlock title="Hasil" value={data.hasil} />
                    </CardContent>
                  </TabsContent>

                  <TabsContent value="indikator">
                    <CardContent>
                      <IndikatorViewer indikator={data.indikator} />
                    </CardContent>
                  </TabsContent>
                </Card>
              </Tabs>

              <aside className="flex flex-col gap-4">
                <Card className="rounded-[1.75rem]">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Metadata</span>
                    <div className="flex flex-col gap-3">
                      <MetaRow icon={User} label="Inisiator" value={data.inisiator} />
                      <MetaRow icon={CalendarClock} label="Uji Coba" value={formatTanggal(data.tglUjiCoba)} />
                      <MetaRow icon={CalendarCheck} label="Penerapan" value={formatTanggal(data.tglPenerapan)} />
                      <MetaRow icon={RefreshCw} label="Diperbarui" value={formatTanggal(data.updatedAt)} />
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </>
        ) : (
          <EmptyState
            icon={FileSearch}
            title="Data tidak ditemukan"
            description="Inovasi daerah yang Anda cari tidak tersedia atau telah dihapus."
            action={
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate(-1)}>
                <ArrowLeft className="size-4" /> Kembali
              </Button>
            }
          />
        )}

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Hapus Inovasi Daerah"
          description="Tindakan ini akan menghapus inovasi beserta seluruh berkas indikator secara permanen."
          confirmLabel="Hapus"
          onConfirm={async () => {
            if (!id) return;
            try {
              await deleteMutation.mutateAsync(id);
              toast.success("Inovasi dihapus");
              navigate(isAdmin ? "/admin/inovasi-daerah" : "/dashboard/opd");
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
