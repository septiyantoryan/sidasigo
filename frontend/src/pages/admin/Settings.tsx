import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, UploadCloud } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  useAdminSettings,
  useAdminHeroImages,
  useDeleteHeroImage,
  useUpdateSettings,
  useUploadHeroImages,
} from "@/hooks/use-settings";
import { handleImageError, resolveImageUrl } from "@/lib/image";

const settingSchema = z.object({
  siteTitle: z.string().min(1, "Judul situs wajib diisi"),
  siteSubtitle: z.string().optional(),
  heroWelcomeText: z.string().min(1, "Teks sambutan wajib diisi"),
  journalUrl: z
    .string()
    .url("Format URL tidak valid")
    .optional()
    .or(z.literal("")),
  contactAddress: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  mapsEmbedUrl: z.string().optional(),
});

type SettingFormInput = z.infer<typeof settingSchema>;

export function AdminSettingsPage() {
  const settings = useAdminSettings();
  const updateMutation = useUpdateSettings();
  const heroImagesQuery = useAdminHeroImages();
  const uploadHeroImages = useUploadHeroImages();
  const deleteHeroImage = useDeleteHeroImage();
  const queryClient = useQueryClient();

  const form = useForm<SettingFormInput>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      siteTitle: "",
      siteSubtitle: "",
      heroWelcomeText: "",
      journalUrl: "",
      contactAddress: "",
      contactPhone: "",
      contactEmail: "",
      mapsEmbedUrl: "",
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (settings.data) {
      reset({
        siteTitle: settings.data.siteTitle ?? "",
        siteSubtitle: settings.data.siteSubtitle ?? "",
        heroWelcomeText: settings.data.heroWelcomeText ?? "",
        journalUrl: settings.data.journalUrl ?? "",
        contactAddress: settings.data.contactAddress ?? "",
        contactPhone: settings.data.contactPhone ?? "",
        contactEmail: settings.data.contactEmail ?? "",
        mapsEmbedUrl: settings.data.mapsEmbedUrl ?? "",
      });
    }
  }, [settings.data, reset]);

  const heroImages = heroImagesQuery.data ?? [];
  const { errors } = form.formState;

  if (settings.isLoading && !settings.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pengaturan" />
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
      />

      <form
        className="space-y-8"
        noValidate
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await updateMutation.mutateAsync(values);
            toast.success("Pengaturan disimpan");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal menyimpan pengaturan");
          }
        })}
      >
        {/* Identitas Situs */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">Identitas Situs</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteTitle">Judul Situs</Label>
              <Input id="siteTitle" placeholder="Masukkan Judul Situs" {...form.register("siteTitle")} />
              {errors.siteTitle && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.siteTitle.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteSubtitle">Subjudul</Label>
              <Input id="siteSubtitle" placeholder="Masukkan Subjudul" {...form.register("siteSubtitle")} />
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">Hero Beranda</h2>
          <div className="space-y-2">
            <Label htmlFor="heroWelcomeText">Teks Sambutan</Label>
            <Textarea
              id="heroWelcomeText"
              rows={2}
              placeholder="Masukkan Teks Sambutan"
              {...form.register("heroWelcomeText")}
            />
            {errors.heroWelcomeText && (
              <p role="alert" className="text-xs text-destructive">
                {errors.heroWelcomeText.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Gambar Hero</Label>
            {heroImages.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {heroImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative overflow-hidden rounded-lg border border-border"
                  >
                    <img
                      src={resolveImageUrl(img.path) ?? undefined}
                      alt="Hero"
                      onError={handleImageError}
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await deleteHeroImage.mutateAsync(img.id);
                          toast.success("Gambar dihapus");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Gagal menghapus");
                        }
                      }}
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Hapus gambar"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <HeroImageDropzone
              disabled={uploadHeroImages.isPending}
              onUpload={async (files) => {
                try {
                  await uploadHeroImages.mutateAsync(files);
                  await queryClient.invalidateQueries({ queryKey: ["hero-images"] });
                  toast.success("Gambar hero ditambahkan");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Gagal mengunggah gambar");
                  throw err;
                }
              }}
            />
          </div>
        </section>

        {/* Tautan */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">Tautan</h2>
          <div className="space-y-2">
            <Label htmlFor="journalUrl">URL Jurnal Paradigma</Label>
            <Input
              id="journalUrl"
              placeholder="https://..."
              {...form.register("journalUrl")}
            />
            {errors.journalUrl && (
              <p role="alert" className="text-xs text-destructive">
                {errors.journalUrl.message}
              </p>
            )}
          </div>
        </section>

        {/* Kontak & Lokasi */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">Kontak &amp; Lokasi</h2>
          <div className="space-y-2">
            <Label htmlFor="contactAddress">Alamat</Label>
            <Textarea
              id="contactAddress"
              rows={2}
              placeholder="Masukkan Alamat"
              {...form.register("contactAddress")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Telepon</Label>
              <Input id="contactPhone" placeholder="Masukkan Telepon" {...form.register("contactPhone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="Masukkan Email"
                {...form.register("contactEmail")}
              />
              {errors.contactEmail && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.contactEmail.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mapsEmbedUrl">URL Embed Google Maps</Label>
            <Input
              id="mapsEmbedUrl"
              placeholder="https://www.google.com/maps/embed?..."
              {...form.register("mapsEmbedUrl")}
            />
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
}

function HeroImageDropzone({
  disabled,
  onUpload,
}: {
  disabled?: boolean;
  onUpload: (files: File[]) => Promise<void>;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const valid = Array.from(files).filter(
      (f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type) && f.size <= 5 * 1024 * 1024,
    );
    if (valid.length === 0) {
      toast.error("Format tidak didukung atau ukuran melebihi 5MB");
      return;
    }
    setIsUploading(true);
    try {
      await onUpload(valid);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Unggah gambar hero"
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
        disabled ? "cursor-not-allowed opacity-60 border-border bg-muted/30"
        : isDragging ? "border-primary bg-primary/5 cursor-pointer"
        : "border-border bg-muted/30 cursor-pointer hover:border-primary/50 hover:bg-muted/50"
      }`}
    >
      <input
        id={inputId}
        ref={inputRef}
        data-testid="file-uploader-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={disabled}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <UploadCloud className="size-7 text-muted-foreground" aria-hidden />
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">
          {isUploading ? "Mengunggah..." : "Unggah gambar hero"}
        </p>
        <p className="text-xs text-muted-foreground">
          JPG/PNG/WEBP · Maks 5MB · Bisa pilih multiple
        </p>
      </div>
    </div>
  );
}
