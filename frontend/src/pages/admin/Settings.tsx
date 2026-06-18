import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dropzone } from "@/components/shared/Dropzone";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAdminSettings, useUpdateSettings } from "@/hooks/use-settings";
import { api } from "@/lib/api";
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

async function uploadHeroImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await api.upload<{ path: string }>(
    "/api/admin/settings/hero-image",
    formData,
  );
  return result.path;
}

export function AdminSettingsPage() {
  const settings = useAdminSettings();
  const updateMutation = useUpdateSettings();
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

  const heroImage = resolveImageUrl(settings.data?.heroImagePath);
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

          <div className="space-y-2">
            <Label>Gambar Hero</Label>
            {heroImage && (
              <img
                src={heroImage}
                alt="Pratinjau gambar hero"
                onError={handleImageError}
                className="mb-2 h-40 w-full rounded-lg border border-border object-cover sm:max-w-md"
              />
            )}
            <Dropzone
              label="Unggah gambar (JPG/PNG/WEBP, maks 5MB)"
              accept="image/jpeg,image/png,image/webp"
              maxSize={5 * 1024 * 1024}
              onChange={async (file) => {
                try {
                  await uploadHeroImage(file);
                  await queryClient.invalidateQueries({ queryKey: ["settings"] });
                  toast.success("Gambar hero diperbarui");
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Gagal mengunggah gambar",
                  );
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
