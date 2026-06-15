import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dropzone } from "@/components/shared/Dropzone";
import { risetCreateSchema, type RisetCreateInput } from "@/validators/riset";

type RisetFormProps = {
  defaultValues?: Partial<RisetCreateInput>;
  onSubmit: (input: RisetCreateInput) => Promise<unknown> | unknown;
  uploadFile: (file: File) => Promise<string>;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export function RisetForm({
  defaultValues,
  onSubmit,
  uploadFile,
  isSubmitting,
  submitLabel = "Simpan Riset/Kajian",
}: RisetFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<RisetCreateInput>({
    resolver: zodResolver(risetCreateSchema),
    defaultValues: {
      jenis: "RisetKajian",
      judulKajian: "",
      timPeneliti: "",
      abstrak: "",
      filePath: "",
      ...defaultValues,
    },
  });

  const jenis = watch("jenis");
  const filePath = watch("filePath");
  const [isUploading, setIsUploading] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="judulKajian">Judul Kajian</Label>
          <Input id="judulKajian" placeholder="Masukkan Judul Kajian" {...register("judulKajian")} />
          {errors.judulKajian && (
            <p role="alert" className="text-xs text-destructive">
              {errors.judulKajian.message}
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="timPeneliti">Tim Peneliti</Label>
          <Input
            id="timPeneliti"
            placeholder="Masukkan Tim Peneliti"
            {...register("timPeneliti")}
          />
          {errors.timPeneliti && (
            <p role="alert" className="text-xs text-destructive">
              {errors.timPeneliti.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jenis">Jenis</Label>
          <Select
            value={jenis}
            onValueChange={(value) =>
              setValue("jenis", value as RisetCreateInput["jenis"], { shouldValidate: true })
            }
          >
            <SelectTrigger id="jenis" className="w-full">
              <SelectValue placeholder="Pilih jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RisetKajian">Riset/Kajian</SelectItem>
              <SelectItem value="Penelitian">Penelitian</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tahunPublikasi">Tahun Publikasi</Label>
          <Input
            id="tahunPublikasi"
            type="number"
            placeholder="Masukkan Tahun Publikasi"
            {...register("tahunPublikasi", { valueAsNumber: true })}
          />
          {errors.tahunPublikasi && (
            <p role="alert" className="text-xs text-destructive">
              {errors.tahunPublikasi.message}
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="abstrak">Abstrak</Label>
          <Textarea
            id="abstrak"
            rows={6}
            placeholder="Masukkan Abstrak"
            {...register("abstrak")}
          />
          {errors.abstrak && (
            <p role="alert" className="text-xs text-destructive">
              {errors.abstrak.message}
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Dokumen (PDF)</Label>
          <Dropzone
            label="Unggah dokumen PDF"
            accept="application/pdf"
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
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || formSubmitting || isUploading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
