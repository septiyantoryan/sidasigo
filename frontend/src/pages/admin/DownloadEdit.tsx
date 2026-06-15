import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DownloadForm } from "@/components/download/DownloadForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDownloadDetail, useUpdateDownload } from "@/hooks/use-download";
import { api } from "@/lib/api";

async function uploadDoc(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await api.upload<{ path: string }>("/api/admin/download/upload", formData);
  return result.path;
}

export function DownloadEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ?? "";
  const detail = useDownloadDetail(id);
  const mutation = useUpdateDownload(id);

  if (detail.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Dokumen" />
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (!detail.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Dokumen" />
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

      <PageHeader title="Edit Dokumen" />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <DownloadForm
          defaultValues={{
            judul: detail.data.judul,
            filePath: detail.data.filePath,
          }}
          uploadFile={uploadDoc}
          isSubmitting={mutation.isPending}
          submitLabel="Perbarui Dokumen"
          onSubmit={async (input) => {
            await mutation.mutateAsync(input);
            toast.success("Dokumen diperbarui");
            navigate("/admin/download");
          }}
        />
      </div>
    </div>
  );
}
