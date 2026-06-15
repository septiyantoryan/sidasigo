import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileUploadField } from "@/components/shared/FileUploadField";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  useInovasiDaerahDetail,
  useSaveIndikator,
} from "@/hooks/use-inovasi-daerah";
import { api, fileUrl } from "@/lib/api";
import { docFields, docGroups, TOTAL_INDIKATOR } from "@/lib/indikator-fields";

async function uploadSingle(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await api.upload<{ path: string }>(
    "/api/upload/single",
    formData,
  );
  return result.path;
}

export function IndikatorPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ?? "";
  const detail = useInovasiDaerahDetail(id);
  const saveMutation = useSaveIndikator(id);

  const [values, setValues] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const indikator = detail.data?.indikator ?? null;

  const merged = (key: string): string => {
    if (key in values) return values[key];
    const raw = indikator?.[key as keyof typeof indikator];
    return typeof raw === "string" ? raw : "";
  };

  const filledCount = useMemo(() => {
    return [...docFields.map((f) => f.key), "kualitasVideo"].filter((key) =>
      Boolean(merged(key)),
    ).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, indikator]);

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

  async function handleUpload(key: string, file: File) {
    setUploadingKey(key);
    try {
      const path = await uploadSingle(file);
      setValues((prev) => ({ ...prev, [key]: path }));
      toast.success("Berkas terunggah");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah berkas");
    } finally {
      setUploadingKey(null);
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
        title="Indikator Inovasi Daerah"
      />

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
      </div>

      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();

          if (Object.keys(values).length === 0) {
            toast.info("Tidak ada perubahan untuk disimpan");
            return;
          }

          const video = values.kualitasVideo?.trim();
          if (video) {
            try {
              new URL(video);
            } catch {
              toast.error("URL video tidak valid");
              return;
            }
          }

          try {
            await saveMutation.mutateAsync(values);
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
                  const value = merged(field.key);
                  return (
                    <FileUploadField
                      key={field.key}
                      label={field.label}
                      value={value || undefined}
                      accept="application/pdf,image/png,image/jpeg,image/webp"
                      disabled={uploadingKey === field.key}
                      href={value ? fileUrl(value) : undefined}
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
            <Label htmlFor="kualitasVideo">URL Video (YouTube)</Label>
            <Input
              id="kualitasVideo"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={merged("kualitasVideo")}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  kualitasVideo: event.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Tempel tautan video YouTube yang mendokumentasikan inovasi.
            </p>
          </div>
        </section>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={
              saveMutation.isPending ||
              uploadingKey !== null ||
              Object.keys(values).length === 0
            }
          >
            Simpan Indikator
          </Button>
        </div>
      </form>
    </div>
  );
}
