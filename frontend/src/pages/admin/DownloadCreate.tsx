import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DownloadForm } from "@/components/download/DownloadForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCreateDownload } from "@/hooks/use-download";
import { api } from "@/lib/api";

async function uploadDoc(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await api.upload<{ path: string }>("/api/admin/download/upload", formData);
  return result.path;
}

export function DownloadCreatePage() {
  const navigate = useNavigate();
  const mutation = useCreateDownload();

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
        title="Tambah Dokumen"
      />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <DownloadForm
          uploadFile={uploadDoc}
          isSubmitting={mutation.isPending}
          onSubmit={async (input) => {
            await mutation.mutateAsync(input);
            toast.success("Dokumen berhasil ditambahkan");
            navigate("/admin/download");
          }}
        />
      </div>
    </div>
  );
}
