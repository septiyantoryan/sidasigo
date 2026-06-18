import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  FileText,
  ListChecks,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { InovasiDaerahForm } from "@/components/inovasi-daerah/InovasiDaerahForm";
import { FileUploadField } from "@/components/shared/FileUploadField";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useCreateInovasiDaerah,
  useSaveIndikatorFor,
} from "@/hooks/use-inovasi-daerah";
import { api } from "@/lib/api";
import { formatJenis, formatTanggal } from "@/lib/format";
import {
  docFields,
  docGroups,
  TOTAL_INDIKATOR,
} from "@/lib/indikator-fields";
import { cn } from "@/lib/utils";
import type { InovasiDaerahCreateInput } from "@/validators/inovasi-daerah";

async function uploadSingle(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await api.upload<{ path: string }>(
    "/api/upload/single",
    formData,
  );
  return result.path;
}

const STEPS = [
  { id: 1, title: "Data Inovasi", icon: FileText },
  { id: 2, title: "Upload Dokumen", icon: ListChecks },
  { id: 3, title: "Ringkasan", icon: Check },
] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {STEPS.map((step, index) => {
        const isDone = current > step.id;
        const isActive = current === step.id;
        const Icon = step.icon;
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  isActive &&
                    "border-primary bg-primary text-primary-foreground",
                  isDone && "border-primary bg-primary/10 text-primary",
                  !isActive &&
                    !isDone &&
                    "border-border bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <Check className="size-4" /> : <Icon className="size-4" />}
              </span>
              <div className="hidden flex-col sm:flex">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Langkah {step.id}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive || isDone
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1 transition-colors",
                  current > step.id ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value || "-"}</dd>
    </div>
  );
}

function ReviewNarrative({ title, value }: { title: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
        {value || "-"}
      </p>
    </div>
  );
}

export function CreateInovasiDaerahPage() {
  const navigate = useNavigate();
  const createMutation = useCreateInovasiDaerah();
  const saveIndikator = useSaveIndikatorFor();

  const [step, setStep] = useState(1);
  const [formValues, setFormValues] =
    useState<Partial<InovasiDaerahCreateInput>>();
  const [docValues, setDocValues] = useState<Record<string, string>>({});
  const [docPreviews, setDocPreviews] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  // Local object URLs for previewing freshly-uploaded files. The server only
  // authorizes file access once the file is referenced by a saved record, so
  // during the wizard we preview the in-browser File instead of /api/files
  // (which would return 403 because nothing references the file yet).
  const previewsRef = useRef<Record<string, string>>({});
  useEffect(() => {
    previewsRef.current = docPreviews;
  }, [docPreviews]);
  useEffect(() => {
    return () => {
      Object.values(previewsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      );
    };
  }, []);

  const videoUrl = docValues.kualitasVideo?.trim() ?? "";
  const videoValid = videoUrl.length > 0 && (() => { try { new URL(videoUrl); return true; } catch { return false; } })();

  const filledDocs = useMemo(
    () => docFields.filter((field) => Boolean(docValues[field.key])).length,
    [docValues],
  );
  const filledTotal = filledDocs + (videoUrl ? 1 : 0);
  const percent = Math.round((filledTotal / TOTAL_INDIKATOR) * 100);
  const allDocsFilled =
    docFields.every((field) => Boolean(docValues[field.key])) && videoValid;

  const isFinishing = createMutation.isPending || saveIndikator.isPending;

  async function handleUpload(key: string, file: File) {
    setUploadingKey(key);
    try {
      const path = await uploadSingle(file);
      const objectUrl = URL.createObjectURL(file);
      setDocValues((prev) => ({ ...prev, [key]: path }));
      setDocPreviews((prev) => {
        if (prev[key]) URL.revokeObjectURL(prev[key]);
        return { ...prev, [key]: objectUrl };
      });
      toast.success("Berkas terunggah");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah berkas");
      throw err;
    } finally {
      setUploadingKey(null);
    }
  }

  async function handleFinish() {
    if (!formValues) {
      toast.error("Lengkapi data inovasi terlebih dahulu");
      setStep(1);
      return;
    }

    try {
      const created = await createMutation.mutateAsync(
        formValues as InovasiDaerahCreateInput,
      );
      await saveIndikator.mutateAsync({ id: created.id, values: docValues });
      toast.success("Inovasi daerah berhasil dibuat");
      navigate(`/dashboard/inovasi-daerah/${created.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menyimpan inovasi",
      );
    }
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 self-start"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="size-4" /> Kembali
      </Button>

      <PageHeader
        title="Tambah Inovasi Daerah"
      />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <StepIndicator current={step} />
      </div>

      {/* Step 1 - Data Inovasi */}
      {step === 1 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <InovasiDaerahForm
            defaultValues={formValues}
            submitLabel="Lanjut ke Dokumen"
            onSubmit={(input) => {
              setFormValues(input);
              setStep(2);
            }}
          />
        </div>
      )}

      {/* Step 2 - Upload Dokumen */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Kelengkapan indikator</p>
              <span className="text-sm text-muted-foreground">
                {filledTotal}/{TOTAL_INDIKATOR} terisi
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Seluruh dokumen dan URL video wajib dilengkapi sebelum lanjut ke
              ringkasan.
            </p>
          </div>

          <section className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
            {docGroups.map((group, groupIndex) => (
              <div key={group.title} className="space-y-4">
                {groupIndex > 0 && <Separator />}
                <h2 className="text-base font-semibold tracking-tight">
                  {group.title}
                </h2>
                <div className="flex flex-col gap-3">
                  {group.fields.map((field) => {
                    const value = docValues[field.key] ?? "";
                    return (
                      <FileUploadField
                        key={field.key}
                        label={field.label}
                        value={value || undefined}
                        accept="application/pdf,image/png,image/jpeg,image/webp"
                        disabled={uploadingKey === field.key}
                        href={docPreviews[field.key]}
                        onChange={(file) => handleUpload(field.key, file)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-base font-semibold tracking-tight">
              Video Inovasi
            </h2>
            <div className="space-y-2">
              <Label htmlFor="kualitasVideo">URL Video</Label>
              <Input
                id="kualitasVideo"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(event) =>
                  setDocValues((prev) => ({
                    ...prev,
                    kualitasVideo: event.target.value,
                  }))
                }
              />
              {videoUrl && !videoValid ? (
                <p role="alert" className="text-xs text-destructive">
                  URL video tidak valid.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Tempel tautan video yang mendokumentasikan inovasi.
                </p>
              )}
            </div>
          </section>

          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="size-4" /> Kembali
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={uploadingKey !== null}
            >
              Lanjut ke Ringkasan <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 - Ringkasan */}
      {step === 3 && formValues && (
        <div className="space-y-6">
          <section className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-base font-semibold tracking-tight">
              Data Inovasi
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <ReviewField label="Nama Inovasi" value={formValues.namaInovasi ?? ""} />
              <ReviewField label="Inisiator" value={formValues.inisiator ?? ""} />
              <ReviewField
                label="Jenis Inovasi"
                value={
                  formValues.jenisInovasi
                    ? formatJenis(formValues.jenisInovasi)
                    : ""
                }
              />
              <ReviewField
                label="Bentuk Inovasi"
                value={formValues.bentukInovasi ?? ""}
              />
              <ReviewField
                label="Tanggal Uji Coba"
                value={formatTanggal(formValues.tglUjiCoba)}
              />
              <ReviewField
                label="Tanggal Penerapan"
                value={formatTanggal(formValues.tglPenerapan)}
              />
            </dl>
            <div className="grid gap-5 border-t border-border pt-5">
              <ReviewNarrative
                title="Rancang Bangun"
                value={formValues.rancangBangun ?? ""}
              />
              <ReviewNarrative title="Tujuan" value={formValues.tujuan ?? ""} />
              <ReviewNarrative title="Manfaat" value={formValues.manfaat ?? ""} />
              <ReviewNarrative title="Hasil" value={formValues.hasil ?? ""} />
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold tracking-tight">
                Dokumen Indikator
              </h2>
              <span className="text-sm text-muted-foreground">
                {filledTotal}/{TOTAL_INDIKATOR} terisi
              </span>
            </div>
            {docGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.title}
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {group.fields.map((field) => {
                    const value = docValues[field.key] ?? "";
                    return (
                      <li
                        key={field.key}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-2.5"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FileText className="size-4 shrink-0 text-primary" />
                          <span className="truncate text-sm">{field.label}</span>
                        </span>
                        {value ? (
                          <a
                            href={docPreviews[field.key]}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                          >
                            <ExternalLink className="size-3.5" /> Lihat
                          </a>
                        ) : (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            Belum ada
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <div className="space-y-2 border-t border-border pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Video Inovasi
              </h3>
              {videoValid ? (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-4" /> Buka video
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada video.</p>
              )}
            </div>
          </section>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              disabled={isFinishing}
            >
              <ArrowLeft className="size-4" /> Kembali
            </Button>
            <Button onClick={handleFinish} disabled={isFinishing}>
              {isFinishing ? "Menyimpan..." : "Simpan Inovasi"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
