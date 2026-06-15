import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InovasiDaerahForm } from "@/components/inovasi-daerah/InovasiDaerahForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  useInovasiDaerahDetail,
  useUpdateInovasiDaerah,
} from "@/hooks/use-inovasi-daerah";

export function EditInovasiDaerahPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ?? "";
  const detail = useInovasiDaerahDetail(id);
  const mutation = useUpdateInovasiDaerah(id);

  if (detail.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Inovasi Daerah" />
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (!detail.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Inovasi Daerah" />
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
        title="Edit Inovasi Daerah"
      />

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <InovasiDaerahForm
          defaultValues={{
            namaInovasi: detail.data.namaInovasi,
            inisiator: detail.data.inisiator,
            jenisInovasi: detail.data.jenisInovasi,
            bentukInovasi: detail.data.bentukInovasi,
            tglUjiCoba: detail.data.tglUjiCoba.slice(0, 10),
            tglPenerapan: detail.data.tglPenerapan.slice(0, 10),
            rancangBangun: detail.data.rancangBangun,
            tujuan: detail.data.tujuan,
            manfaat: detail.data.manfaat,
            hasil: detail.data.hasil,
          }}
          isSubmitting={mutation.isPending}
          submitLabel="Perbarui Inovasi"
          onSubmit={async (input) => {
            await mutation.mutateAsync(input);
            toast.success("Inovasi daerah diperbarui");
            navigate(`/dashboard/inovasi-daerah/${id}`);
          }}
        />
      </div>
    </div>
  );
}
