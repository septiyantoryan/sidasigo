import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { KrenovaDataFields } from "@/components/krenova/KrenovaDataFields";
import { FileUploadField } from "@/components/shared/FileUploadField";
import { fileUrl } from "@/lib/api";
import {
  krenovaCreateSchema,
  type KrenovaCreateInput,
} from "@/validators/krenova";

type KrenovaFormProps = {
  defaultValues?: Partial<KrenovaCreateInput>;
  onSubmit: (input: KrenovaCreateInput) => Promise<unknown> | unknown;
  uploadFile: (file: File) => Promise<string>;
  isSubmitting?: boolean;
  submitLabel?: string;
};

const docFields = [
  { key: "dokumenProposal", label: "Dokumen Proposal (PDF)" },
  { key: "lampiranOriginalitas", label: "Lampiran Originalitas (PDF)" },
  { key: "lampiranIdentitas", label: "Lampiran Identitas (KTP / Pelajar)" },
] as const;

export function KrenovaForm({
  defaultValues,
  onSubmit,
  uploadFile,
  isSubmitting,
  submitLabel = "Simpan Krenova",
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
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
              <FileUploadField
                label={field.label}
                value={value || undefined}
                href={value ? fileUrl(value) : undefined}
                onChange={(file) => uploadTo(field.key, file)}
              />
              {errors[field.key] && (
                <p role="alert" className="text-xs text-destructive">
                  {errors[field.key]?.message}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || formSubmitting || isUploading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
