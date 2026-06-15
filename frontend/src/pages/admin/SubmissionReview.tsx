import { ArrowLeft, CheckCircle2, Download, XCircle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { IndikatorViewer } from "@/components/inovasi-daerah/IndikatorViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { JenisBadge } from "@/components/shared/JenisBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useApproveSubmission,
  useRejectSubmission,
} from "@/hooks/use-dashboard";
import { useInovasiDaerahDetail } from "@/hooks/use-inovasi-daerah";
import { useKrenovaDetail } from "@/hooks/use-krenova";
import { fileUrl } from "@/lib/api";
import { formatTanggal } from "@/lib/format";
import type { Indikator, Krenova } from "@/types";

export function AdminSubmissionReviewPage() {
  const params = useParams();
  const navigate = useNavigate();
  const type = (params.type as "InovasiDaerah" | "Krenova") ?? "InovasiDaerah";
  const id = params.id ?? "";

  const inovasiDetail = useInovasiDaerahDetail(type === "InovasiDaerah" ? id : undefined);
  const krenovaDetail = useKrenovaDetail(type === "Krenova" ? id : undefined);
  const approve = useApproveSubmission();
  const reject = useRejectSubmission();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const isLoading =
    type === "InovasiDaerah" ? inovasiDetail.isLoading : krenovaDetail.isLoading;
  const data = type === "InovasiDaerah" ? inovasiDetail.data : krenovaDetail.data;
  const listUrl =
    type === "Krenova"
      ? "/admin/approval/krenova"
      : "/admin/approval/inovasi-daerah";

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to={listUrl}>
          <ArrowLeft className="size-4" /> Kembali ke antrian
        </Link>
      </Button>

      <PageHeader
        title={
          type === "InovasiDaerah"
            ? "Review Inovasi Daerah"
            : "Review Krenova"
        }
        actions={
          data ? (
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  await approve.mutateAsync({ type, id });
                  toast.success("Submission disetujui");
                  navigate(listUrl);
                }}
                disabled={approve.isPending}
              >
                <CheckCircle2 className="size-4" /> Setujui
              </Button>
              <Button
                variant="outline"
                onClick={() => setRejectOpen(true)}
                disabled={reject.isPending}
              >
                <XCircle className="size-4" /> Tolak
              </Button>
            </div>
          ) : null
        }
      />

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : !data ? (
        <p className="text-sm text-muted-foreground">Data tidak ditemukan.</p>
      ) : type === "InovasiDaerah" ? (
        <>
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <JenisBadge jenis={(data as never as { jenisInovasi: "Digital" | "Non_Digital" }).jenisInovasi} />
                <StatusBadge status={(data as never as { status: never }).status} />
                <span className="text-xs text-muted-foreground">
                  Diunggah {formatTanggal((data as never as { createdAt: string }).createdAt)}
                </span>
              </div>
              <h2 className="text-2xl font-semibold">
                {(data as never as { namaInovasi: string }).namaInovasi}
              </h2>
              <p className="text-sm text-muted-foreground">
                Inisiator: {(data as never as { inisiator: string }).inisiator}
              </p>
              <Detail label="Bentuk Inovasi" value={(data as never as { bentukInovasi: string }).bentukInovasi} />
              <DetailLong label="Tujuan" value={(data as never as { tujuan: string }).tujuan} />
              <DetailLong label="Manfaat" value={(data as never as { manfaat: string }).manfaat} />
              <DetailLong label="Hasil" value={(data as never as { hasil: string }).hasil} />
              <DetailLong
                label="Rancang Bangun"
                value={(data as never as { rancangBangun: string }).rancangBangun}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h3 className="text-lg font-semibold tracking-tight">
                Dokumen Indikator
              </h3>
              <IndikatorViewer
                indikator={
                  (data as never as { indikator?: Indikator | null }).indikator
                }
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <JenisBadge jenis={(data as never as { jenisInovasi: "Digital" | "Non_Digital" }).jenisInovasi} />
                <StatusBadge status={(data as never as { status: never }).status} />
              </div>
              <h2 className="text-2xl font-semibold">
                {(data as never as { judulInovasi: string }).judulInovasi}
              </h2>
              <Detail label="Tahap Inovasi" value={(data as never as { tahapInovasi: string }).tahapInovasi} />
              <Detail label="Status Pelaku" value={(data as never as { statusPelaku: string }).statusPelaku} />
              <Detail label="Inovator" value={(data as never as { namaInovator1: string }).namaInovator1} />
              <Detail label="Alamat" value={(data as never as { alamat: string }).alamat} />
              <Detail label="Nomor HP" value={(data as never as { nomorHp: string }).nomorHp} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h3 className="text-lg font-semibold tracking-tight">Lampiran</h3>
              <ul className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    { key: "dokumenProposal", label: "Dokumen Proposal" },
                    { key: "lampiranOriginalitas", label: "Lampiran Originalitas" },
                    { key: "lampiranIdentitas", label: "Lampiran Identitas" },
                  ] as Array<{
                    key: keyof Pick<
                      Krenova,
                      "dokumenProposal" | "lampiranOriginalitas" | "lampiranIdentitas"
                    >;
                    label: string;
                  }>
                ).map((item) => {
                  const value = (data as never as Krenova)[item.key];
                  return (
                    <li
                      key={item.key}
                      className="rounded-xl border border-border bg-muted/30 p-4"
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
        </>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak submission</DialogTitle>
            <DialogDescription>
              Berikan alasan agar pengaju dapat melakukan perbaikan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Alasan penolakan</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Contoh: dokumen pendukung belum lengkap"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={reject.isPending}
              onClick={async () => {
                await reject.mutateAsync({ type, id, reason });
                toast.success("Submission ditolak");
                setRejectOpen(false);
                setReason("");
                navigate(listUrl);
              }}
            >
              Tolak Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function DetailLong({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="whitespace-pre-line text-sm leading-relaxed">{value}</p>
    </div>
  );
}
