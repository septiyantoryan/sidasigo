import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { MultiFileUploader } from "@/components/shared/MultiFileUploader";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  useInovasiDaerahDetail,
  useSaveIndikator,
} from "@/hooks/use-inovasi-daerah";
import { api } from "@/lib/api";
import { docFields, docGroups, TOTAL_INDIKATOR } from "@/lib/indikator-fields";
import type { Indikator, IndikatorAttachment } from "@/types";

async function uploadSingle(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await api.upload<{ path: string }>(
    "/api/upload/single",
    formData,
  );
  return result.path;
}

type AttachmentEntry = {
  path: string;
  name: string;
  previewUrl?: string;
};

export function IndikatorPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ?? "";
  const detail = useInovasiDaerahDetail(id);
  const saveMutation = useSaveIndikator(id);

  const [values, setValues] = useState<Record<string, string>>({});
  const [attachmentEntries, setAttachmentEntries] = useState<
    Record<string, AttachmentEntry[]>
  >({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const previewsRef = useRef<Record<string, string>>({});
  const [newAttachments, setNewAttachments] = useState<
    { field: string; path: string }[]
  >([]);

  useEffect(() => {
    previewsRef.current = {};
  }, []);

  const indikator = detail.data?.indikator ?? null;
  const attachments = detail.data?.attachments as IndikatorAttachment[] | undefined;

  // Initialize attachment entries from server data.
  useEffect(() => {
    if (!attachments) return;
    const entries: Record<string, AttachmentEntry[]> = {};
    for (const att of attachments) {
      if (!entries[att.field]) entries[att.field] = [];
      entries[att.field].push({
        path: att.path,
        name: att.path.split(/[\\/]/).pop() ?? att.path,
      });
    }
    setAttachmentEntries(entries);
  }, [attachments]);

  const merged = (key: string): string => {
    if (key in values) return values[key];
    const raw = indikator?.[key as keyof typeof indikator];
    return typeof raw === "string" ? raw : "";
  };

  const filledCount = useMemo(() => {
    const docWithAttachments = docFields.filter((f) => {
      const entries = attachmentEntries[f.key];
      return (entries && entries.length > 0) || Boolean(merged(f.key));
    }).length;
    const hasVideo = Boolean(merged("kualitasVideo"));
    return docWithAttachments + (hasVideo ? 1 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, indikator, attachmentEntries]);

  const percent = Math.round((filledCount / TOTAL_INDIKATOR) * 100);

  if (detail.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Indikator Inovasi Daerah" />
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (!detail.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Indikator Inovasi Daerah" />
        <p className="text-sm text-muted-foreground">Data tidak ditemukan.</p>
      </div>
    );
  }

  async function handleAddFiles(key: string, files: File[]) {
    setUploadingKey(key);
    try {
      const newEntries: AttachmentEntry[] = [];
      const newAtts: { field: string; path: string }[] = [];
      for (const file of files) {
        const path = await uploadSingle(file);
        const objectUrl = URL.createObjectURL(file);
        newEntries.push({ path, name: file.name, previewUrl: objectUrl });
        newAtts.push({ field: key, path });
      }
      setAttachmentEntries((prev) => ({
        ...prev,
        [key]: [...(prev[key] ?? []), ...newEntries],
      }));
      setNewAttachments((prev) => [...prev, ...newAtts]);
      toast.success("Berkas terunggah");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah berkas");
    } finally {
      setUploadingKey(null);
    }
  }

  async function handleRemoveFile(key: string, index: number) {
    setAttachmentEntries((prev) => {
      const list = [...(prev[key] ?? [])];
      list.splice(index, 1);
      return { ...prev, [key]: list };
    });
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

      <PageHeader title="Indikator Inovasi Daerah" />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Kelengkapan indikator</p>
          <span className="text-sm text-muted-foreground">
            {filledCount}/{TOTAL_INDIKATOR} terisi
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Format didukung: PDF, JPG, PNG, WEBP, DOC, DOCX. Maks 25 MB per file.
        </p>
      </div>

      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();

          const video = values.kualitasVideo?.trim();
          if (video) {
            try {
              new URL(video);
            } catch {
              toast.error("URL video tidak valid");
              return;
            }
          }

          // Build payload: existing values + new attachments
          const payload: Record<string, string | null> = { ...values, kualitasVideo: values.kualitasVideo ?? "" };

          const attachmentsPayload = [...newAttachments];

          if (Object.keys(values).length === 0 && attachmentsPayload.length === 0) {
            toast.info("Tidak ada perubahan untuk disimpan");
            return;
          }

          try {
            await saveMutation.mutateAsync({
              ...payload,
              attachments: attachmentsPayload,
            } as never);
            toast.success("Indikator tersimpan");
            navigate(`/dashboard/inovasi-daerah/${id}`);
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Gagal menyimpan indikator",
            );
          }
        }}
      >
        <section className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          {docGroups.map((group, groupIndex) => (
            <div key={group.title} className="space-y-4">
              {groupIndex > 0 && <Separator />}
              <h2 className="text-base font-semibold tracking-tight">
                {group.title}
              </h2>
              <div className="flex flex-col gap-3">
                {group.fields.map((field) => {
                  const files = attachmentEntries[field.key] ?? [];
                  return (
                    <MultiFileUploader
                      key={field.key}
                      label={field.label}
                      files={files}
                      disabled={uploadingKey !== null && uploadingKey !== field.key}
                      uploading={uploadingKey === field.key}
                      onChange={(fileList) => handleAddFiles(field.key, fileList)}
                      onRemove={(index) => handleRemoveFile(field.key, index)}
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
              placeholder="Masukkan URL video"
              value={merged("kualitasVideo")}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  kualitasVideo: event.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Tempel tautan video yang mendokumentasikan inovasi.
            </p>
          </div>
        </section>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={
              saveMutation.isPending ||
              uploadingKey !== null
            }
          >
            Simpan Indikator
          </Button>
        </div>
      </form>
    </div>
  );
}
