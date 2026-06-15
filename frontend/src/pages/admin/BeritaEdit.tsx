import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BeritaForm } from "@/components/berita/BeritaForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { useBeritaDetail, useUpdateBerita } from "@/hooks/use-berita";
import { api } from "@/lib/api";

async function uploadPoster(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await api.upload<{ path: string }>("/api/admin/berita/upload", formData);
  return result.path;
}

export function BeritaEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ?? "";
  const detail = useBeritaDetail(id);
  const mutation = useUpdateBerita(id);

  if (detail.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Berita" />
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (!detail.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Berita" />
        <p className="text-sm text-muted-foreground">Data tidak ditemukan.</p>
      </div>
    );
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

      <PageHeader title="Edit Berita" />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <BeritaForm
          defaultValues={{
            posterPath: detail.data.posterPath,
            caption: detail.data.caption,
          }}
          uploadFile={uploadPoster}
          isSubmitting={mutation.isPending}
          submitLabel="Perbarui Berita"
          onSubmit={async (input) => {
            await mutation.mutateAsync(input);
            toast.success("Berita diperbarui");
            navigate(`/admin/berita/${id}`);
          }}
        />
      </div>
    </div>
  );
}
