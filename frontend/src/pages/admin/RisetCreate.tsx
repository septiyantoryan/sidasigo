import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RisetForm } from "@/components/riset/RisetForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCreateRiset } from "@/hooks/use-riset";
import { api } from "@/lib/api";

async function uploadDoc(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await api.upload<{ path: string }>("/api/admin/riset/upload", formData);
  return result.path;
}

export function RisetCreatePage() {
  const navigate = useNavigate();
  const mutation = useCreateRiset();

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
        title="Tambah Riset/Kajian"
      />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <RisetForm
          uploadFile={uploadDoc}
          isSubmitting={mutation.isPending}
          onSubmit={async (input) => {
            await mutation.mutateAsync(input);
            toast.success("Riset/Kajian berhasil ditambahkan");
            navigate("/admin/riset");
          }}
        />
      </div>
    </div>
  );
}
