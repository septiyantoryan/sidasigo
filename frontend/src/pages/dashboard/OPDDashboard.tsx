import { CheckCircle2, Clock, Lightbulb, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { useMyInovasiStats } from "@/hooks/use-inovasi-daerah";

export function OPDDashboardPage() {
  const stats = useMyInovasiStats();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard OPD"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Inovasi"
          value={stats.data?.total ?? "-"}
          tone="primary"
          icon={Lightbulb}
        />
        <StatCard
          label="Pending"
          value={stats.data?.pending ?? "-"}
          tone="amber"
          icon={Clock}
        />
        <StatCard
          label="Disetujui"
          value={stats.data?.disetujui ?? "-"}
          tone="emerald"
          icon={CheckCircle2}
        />
        <StatCard
          label="Ditolak"
          value={stats.data?.ditolak ?? "-"}
          tone="rose"
          icon={XCircle}
        />
      </div>
    </div>
  );
}
