import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BeritaForm } from "@/components/berita/BeritaForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCreateBerita } from "@/hooks/use-berita";
import { api } from "@/lib/api";

async function uploadPoster(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await api.upload<{ path: string }>("/api/admin/berita/upload", formData);
  return result.path;
}

export function BeritaCreatePage() {
  const navigate = useNavigate();
  const mutation = useCreateBerita();

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
        title="Tambah Berita"
      />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <BeritaForm
          uploadFile={uploadPoster}
          isSubmitting={mutation.isPending}
          onSubmit={async (input) => {
            await mutation.mutateAsync(input);
            toast.success("Berita berhasil ditambahkan");
            navigate("/admin/berita");
          }}
        />
      </div>
    </div>
  );
}
