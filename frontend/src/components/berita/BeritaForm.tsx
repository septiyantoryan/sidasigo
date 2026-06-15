import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dropzone } from "@/components/shared/Dropzone";
import { resolvePublicUrl } from "@/lib/url";
import { handleImageError } from "@/lib/image";
import { beritaCreateSchema, type BeritaCreateInput } from "@/validators/berita";


type BeritaFormProps = {
  defaultValues?: Partial<BeritaCreateInput>;
  onSubmit: (input: BeritaCreateInput) => Promise<unknown> | unknown;
  uploadFile: (file: File) => Promise<string>;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export function BeritaForm({
  defaultValues,
  onSubmit,
  uploadFile,
  isSubmitting,
  submitLabel = "Simpan Berita",
}: BeritaFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<BeritaCreateInput>({
    resolver: zodResolver(beritaCreateSchema),
    defaultValues: {
      posterPath: "",
      caption: "",
      ...defaultValues,
    },
  });

  const posterPath = watch("posterPath");
  const [isUploading, setIsUploading] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="space-y-2">
        <Label>Poster</Label>
        {posterPath && (
          <img
            src={resolvePublicUrl(posterPath)}
            alt="Pratinjau poster"
            onError={handleImageError}
            className="mb-2 max-h-64 w-full rounded-xl border border-border object-contain"
          />
        )}
        <Dropzone
          label="Unggah poster (JPG/PNG/WEBP, maks 5MB)"
          accept="image/jpeg,image/png,image/webp"
          maxSize={5 * 1024 * 1024}
          value={posterPath || undefined}
          onUploadingChange={setIsUploading}
          onChange={async (file) => {
            try {
              const path = await uploadFile(file);
              setValue("posterPath", path, { shouldValidate: true });
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Gagal mengunggah poster");
              throw err;
            }
          }}
        />
        {errors.posterPath && (
          <p role="alert" className="text-xs text-destructive">
            {errors.posterPath.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          rows={6}
          placeholder="Masukkan Caption"
          {...register("caption")}
        />
        {errors.caption && (
          <p role="alert" className="text-xs text-destructive">
            {errors.caption.message}
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
