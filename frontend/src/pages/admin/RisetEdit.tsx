import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RisetForm } from "@/components/riset/RisetForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRisetDetail, useUpdateRiset } from "@/hooks/use-riset";
import { api } from "@/lib/api";

async function uploadDoc(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await api.upload<{ path: string }>("/api/admin/riset/upload", formData);
  return result.path;
}

export function RisetEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ?? "";
  const detail = useRisetDetail(id);
  const mutation = useUpdateRiset(id);

  if (detail.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Riset/Kajian" />
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (!detail.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Riset/Kajian" />
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

      <PageHeader title="Edit Riset/Kajian" />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <RisetForm
          defaultValues={{
            judulKajian: detail.data.judulKajian,
            timPeneliti: detail.data.timPeneliti,
            tahunPublikasi: detail.data.tahunPublikasi,
            abstrak: detail.data.abstrak,
            filePath: detail.data.filePath,
            jenis: detail.data.jenis,
          }}
          uploadFile={uploadDoc}
          isSubmitting={mutation.isPending}
          submitLabel="Perbarui Riset/Kajian"
          onSubmit={async (input) => {
            await mutation.mutateAsync(input);
            toast.success("Riset/Kajian diperbarui");
            navigate(`/admin/riset/${id}`);
          }}
        />
      </div>
    </div>
  );
}
