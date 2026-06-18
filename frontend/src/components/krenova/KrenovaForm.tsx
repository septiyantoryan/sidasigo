import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { KrenovaDataFields } from "@/components/krenova/KrenovaDataFields";
import { MultiFileUploader } from "@/components/shared/MultiFileUploader";
import {
  krenovaCreateSchema,
  type KrenovaCreateInput,
} from "@/validators/krenova";

type KrenovaFormProps = {
  defaultValues?: Partial<KrenovaCreateInput>;
  onSubmit: (input: KrenovaCreateInput & { attachments?: { field: string; path: string }[] }) => Promise<unknown> | unknown;
  uploadFile: (file: File) => Promise<string>;
  isSubmitting?: boolean;
  submitLabel?: string;
  existingAttachments?: { field: string; path: string }[];
};

const docFields = [
  { key: "dokumenProposal", label: "Dokumen Proposal (PDF)" },
  { key: "lampiranOriginalitas", label: "Lampiran Originalitas (PDF)" },
  { key: "lampiranIdentitas", label: "Lampiran Identitas (KTP / Pelajar)" },
] as const;

type FileEntry = { path: string; name: string; previewUrl?: string };

export function KrenovaForm({
  defaultValues,
  onSubmit,
  uploadFile,
  isSubmitting,
  submitLabel = "Simpan Krenova",
  existingAttachments,
}: KrenovaFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<KrenovaCreateInput>({
    resolver: zodResolver(krenovaCreateSchema),
    defaultValues: {
      jenisInovasi: "Digital",
      statusPelaku: "Umum",
      ...defaultValues,
    },
  });

  const [uploadingCount, setUploadingCount] = useState(0);
  const isUploading = uploadingCount > 0;

  // Track new attachment uploads for submission.
  const [newAttachments, setNewAttachments] = useState<{ field: string; path: string }[]>([]);
  const [fotoFiles, setFotoFiles] = useState<FileEntry[]>(() =>
    (existingAttachments ?? [])
      .filter((a) => a.field === "fotoProduk")
      .map((a) => ({ path: a.path, name: a.path.split(/[\\/]/).pop() ?? a.path })),
  );
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  async function uploadTo(
    field: "dokumenProposal" | "lampiranOriginalitas" | "lampiranIdentitas",
    file: File,
  ) {
    setUploadingCount((count) => count + 1);
    try {
      const path = await uploadFile(file);
      setValue(field, path, { shouldValidate: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah file");
      throw err;
    } finally {
      setUploadingCount((count) => Math.max(0, count - 1));
    }
  }

  async function handleAddAttachment(key: string, files: File[]) {
    setUploadingKey(key);
    try {
      for (const file of files) {
        const path = await uploadFile(file);
        setNewAttachments((prev) => [...prev, { field: key, path }]);
        if (key === "fotoProduk") {
          setFotoFiles((prev) => [...prev, { path, name: file.name, previewUrl: URL.createObjectURL(file) }]);
        }
      }
      toast.success("Berkas terunggah");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah berkas");
    } finally {
      setUploadingKey(null);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        const payload = { ...values, attachments: newAttachments.length > 0 ? newAttachments : undefined };
        await onSubmit(payload);
      })}
      noValidate
      className="space-y-6"
    >
      <KrenovaDataFields
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
      />

      <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
        {docFields.map((field) => {
          const value = watch(field.key);
          return (
            <div key={field.key} className="space-y-2">
              <MultiFileUploader
                label={field.label}
                files={value ? [{ path: value, name: value.split(/[\\/]/).pop() ?? value }] : []}
                disabled={isUploading}
                onChange={(files) => uploadTo(field.key, files[0])}
                accept="application/pdf,image/png,image/jpeg,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
              {errors[field.key] && (
                <p role="alert" className="text-xs text-destructive">{errors[field.key]?.message}</p>
              )}
            </div>
          );
        })}

        <MultiFileUploader
          label="Foto Produk"
          files={fotoFiles}
          disabled={uploadingKey !== null}
          uploading={uploadingKey === "fotoProduk"}
          onChange={(files) => handleAddAttachment("fotoProduk", files)}
          onRemove={(index) => {
            setFotoFiles((prev) => prev.filter((_, i) => i !== index));
            setNewAttachments((prev) => {
              const atts = [...prev];
              const idx = atts.findIndex((a, i) => a.field === "fotoProduk" && i === index);
              if (idx >= 0) atts.splice(idx, 1);
              return atts;
            });
          }}
          accept="image/png,image/jpeg,image/webp"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || formSubmitting || isUploading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
