import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { KrenovaForm } from "@/components/krenova/KrenovaForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { useKrenovaDetail, useUpdateKrenova } from "@/hooks/use-krenova";
import { api } from "@/lib/api";

async function uploadSingle(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await api.upload<{ path: string }>("/api/upload/single", formData);
  return result.path;
}

export function EditKrenovaPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ?? "";
  const detail = useKrenovaDetail(id);
  const mutation = useUpdateKrenova(id);

  if (detail.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Krenova" />
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (!detail.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Krenova" />
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

      <PageHeader
        title="Edit Krenova"
      />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <KrenovaForm
          defaultValues={{
            judulInovasi: detail.data.judulInovasi,
            jenisInovasi: detail.data.jenisInovasi,
            waktuUjiCoba: detail.data.waktuUjiCoba.slice(0, 10),
            waktuPenerapan: detail.data.waktuPenerapan.slice(0, 10),
            tahapInovasi: detail.data.tahapInovasi,
            statusPelaku: detail.data.statusPelaku,
            namaInovator1: detail.data.namaInovator1,
            namaInovator2: detail.data.namaInovator2 ?? "",
            namaInovator3: detail.data.namaInovator3 ?? "",
            namaInovator4: detail.data.namaInovator4 ?? "",
            namaInovator5: detail.data.namaInovator5 ?? "",
            alamat: detail.data.alamat,
            nomorHp: detail.data.nomorHp,
            abstrak: detail.data.abstrak ?? "",
            dokumenProposal: detail.data.dokumenProposal ?? "",
            lampiranOriginalitas: detail.data.lampiranOriginalitas ?? "",
            lampiranIdentitas: detail.data.lampiranIdentitas ?? "",
          }}
          uploadFile={uploadSingle}
          isSubmitting={mutation.isPending}
          submitLabel="Perbarui Krenova"
          existingAttachments={detail.data.attachments ?? []}
          onSubmit={async (input) => {
            await mutation.mutateAsync(input);
            toast.success("Krenova diperbarui");
            navigate(`/dashboard/krenova/${id}`);
          }}
        />
      </div>
    </div>
  );
}
