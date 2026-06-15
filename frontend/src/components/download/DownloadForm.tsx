import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/shared/Dropzone";
import { downloadCreateSchema, type DownloadCreateInput } from "@/validators/download";

type DownloadFormProps = {
  defaultValues?: Partial<DownloadCreateInput>;
  onSubmit: (input: DownloadCreateInput) => Promise<unknown> | unknown;
  uploadFile: (file: File) => Promise<string>;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export function DownloadForm({
  defaultValues,
  onSubmit,
  uploadFile,
  isSubmitting,
  submitLabel = "Simpan Dokumen",
}: DownloadFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<DownloadCreateInput>({
    resolver: zodResolver(downloadCreateSchema),
    defaultValues: {
      judul: "",
      filePath: "",
      ...defaultValues,
    },
  });

  const filePath = watch("filePath");
  const [isUploading, setIsUploading] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="judul">Judul</Label>
        <Input id="judul" placeholder="Masukkan Judul" {...register("judul")} />
        {errors.judul && (
          <p role="alert" className="text-xs text-destructive">
            {errors.judul.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Dokumen (PDF)</Label>
        <Dropzone
          label="Unggah dokumen PDF (maks 10MB)"
          accept="application/pdf"
          maxSize={10 * 1024 * 1024}
          value={filePath || undefined}
          onUploadingChange={setIsUploading}
          onChange={async (file) => {
            try {
              const path = await uploadFile(file);
              setValue("filePath", path, { shouldValidate: true });
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Gagal mengunggah dokumen");
              throw err;
            }
          }}
        />
        {errors.filePath && (
          <p role="alert" className="text-xs text-destructive">
            {errors.filePath.message}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || formSubmitting || isUploading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
