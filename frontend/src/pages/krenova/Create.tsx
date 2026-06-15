import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  FileText,
  ListChecks,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { KrenovaDataFields } from "@/components/krenova/KrenovaDataFields";
import { FileUploadField } from "@/components/shared/FileUploadField";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useCreateKrenova } from "@/hooks/use-krenova";
import { api } from "@/lib/api";
import { formatJenis, formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  krenovaBaseSchema,
  penerapanSetelahUjiCoba,
  penerapanSetelahUjiCobaError,
  type KrenovaCreateInput,
} from "@/validators/krenova";

async function uploadSingle(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await api.upload<{ path: string }>(
    "/api/upload/single",
    formData,
  );
  return result.path;
}

// Step 1 validates only the data fields; the documents are handled in step 2.
const krenovaStep1Schema = krenovaBaseSchema
  .omit({
    dokumenProposal: true,
    lampiranOriginalitas: true,
    lampiranIdentitas: true,
  })
  .refine(penerapanSetelahUjiCoba, penerapanSetelahUjiCobaError);

type DocKey =
  | "dokumenProposal"
  | "lampiranOriginalitas"
  | "lampiranIdentitas";

const KRENOVA_DOCS: Array<{ key: DocKey; label: string }> = [
  { key: "dokumenProposal", label: "Dokumen Proposal" },
  { key: "lampiranOriginalitas", label: "Lampiran Originalitas" },
  { key: "lampiranIdentitas", label: "Lampiran Identitas" },
];

const STEPS = [
  { id: 1, title: "Data Krenova", icon: FileText },
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

export function CreateKrenovaPage() {
  const navigate = useNavigate();
  const createMutation = useCreateKrenova();

  const [step, setStep] = useState(1);
  const [dataValues, setDataValues] = useState<KrenovaCreateInput>();
  const [docValues, setDocValues] = useState<Record<string, string>>({});
  const [docPreviews, setDocPreviews] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const form = useForm<KrenovaCreateInput>({
    resolver: zodResolver(
      krenovaStep1Schema,
    ) as unknown as Resolver<KrenovaCreateInput>,
    defaultValues: {
      jenisInovasi: "Digital",
      statusPelaku: "Umum",
    },
  });

  // Object URLs to preview freshly-uploaded files in-browser (the server only
  // authorizes file access once the file is referenced by a saved record).
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

  const allDocsFilled = KRENOVA_DOCS.every((d) => Boolean(docValues[d.key]));
  const filledDocs = KRENOVA_DOCS.filter((d) => Boolean(docValues[d.key])).length;

  async function handleUpload(key: DocKey, file: File) {
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
    if (!dataValues) {
      toast.error("Lengkapi data krenova terlebih dahulu");
      setStep(1);
      return;
    }
    if (!allDocsFilled) {
      toast.error("Semua dokumen wajib dilengkapi");
      setStep(2);
      return;
    }

    try {
      const created = await createMutation.mutateAsync({
        ...dataValues,
        dokumenProposal: docValues.dokumenProposal,
        lampiranOriginalitas: docValues.lampiranOriginalitas,
        lampiranIdentitas: docValues.lampiranIdentitas,
      });
      toast.success("Krenova berhasil dikirim, menunggu verifikasi admin.");
      navigate(`/dashboard/krenova/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan krenova");
    }
  }

  const inovatorTeam =
    [
      dataValues?.namaInovator2,
      dataValues?.namaInovator3,
      dataValues?.namaInovator4,
      dataValues?.namaInovator5,
    ]
      .filter(Boolean)
      .join(", ") || "-";

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

      <PageHeader title="Tambah Krenova" />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <StepIndicator current={step} />
      </div>

      {/* Step 1 - Data Krenova */}
      <div className={cn("space-y-6", step !== 1 && "hidden")}>
        <form
          noValidate
          className="rounded-xl border border-border bg-card p-4 sm:p-6"
          onSubmit={form.handleSubmit((values) => {
            setDataValues(values);
            setStep(2);
          })}
        >
          <KrenovaDataFields
            register={form.register}
            watch={form.watch}
            setValue={form.setValue}
            errors={form.formState.errors}
          />
          <div className="mt-6 flex justify-end">
            <Button type="submit">
              Lanjut ke Dokumen <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Step 2 - Upload Dokumen */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Kelengkapan dokumen</p>
              <span className="text-sm text-muted-foreground">
                {filledDocs}/{KRENOVA_DOCS.length} terunggah
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Seluruh dokumen wajib dilengkapi sebelum lanjut ke ringkasan.
            </p>
          </div>

          <section className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-6">
            {KRENOVA_DOCS.map((doc) => {
              const value = docValues[doc.key] ?? "";
              return (
                <FileUploadField
                  key={doc.key}
                  label={doc.label}
                  value={value || undefined}
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  disabled={uploadingKey === doc.key}
                  href={docPreviews[doc.key]}
                  onChange={(file) => handleUpload(doc.key, file)}
                />
              );
            })}
          </section>

          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="size-4" /> Kembali
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!allDocsFilled || uploadingKey !== null}
            >
              Lanjut ke Ringkasan <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 - Ringkasan */}
      {step === 3 && dataValues && (
        <div className="space-y-6">
          <section className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-base font-semibold tracking-tight">
              Data Krenova
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <ReviewField label="Judul Inovasi" value={dataValues.judulInovasi} />
              <ReviewField
                label="Jenis Inovasi"
                value={formatJenis(dataValues.jenisInovasi)}
              />
              <ReviewField label="Status Pelaku" value={dataValues.statusPelaku} />
              <ReviewField label="Tahap Inovasi" value={dataValues.tahapInovasi} />
              <ReviewField
                label="Waktu Uji Coba"
                value={formatTanggal(dataValues.waktuUjiCoba)}
              />
              <ReviewField
                label="Waktu Penerapan"
                value={formatTanggal(dataValues.waktuPenerapan)}
              />
              <ReviewField
                label="Inovator Utama"
                value={dataValues.namaInovator1}
              />
              <ReviewField label="Tim Inovator" value={inovatorTeam} />
              <ReviewField label="Alamat" value={dataValues.alamat} />
              <ReviewField label="Nomor HP" value={dataValues.nomorHp} />
            </dl>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-base font-semibold tracking-tight">Dokumen</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {KRENOVA_DOCS.map((doc) => {
                const value = docValues[doc.key] ?? "";
                return (
                  <li
                    key={doc.key}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-2.5"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="size-4 shrink-0 text-primary" />
                      <span className="truncate text-sm">{doc.label}</span>
                    </span>
                    {value ? (
                      <a
                        href={docPreviews[doc.key]}
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
          </section>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              disabled={createMutation.isPending}
            >
              <ArrowLeft className="size-4" /> Kembali
            </Button>
            <Button onClick={handleFinish} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Menyimpan..." : "Simpan Krenova"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
