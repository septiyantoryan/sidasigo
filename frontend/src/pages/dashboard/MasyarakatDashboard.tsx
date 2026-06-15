import { CheckCircle2, Clock, Sparkles, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { useMyKrenovaStats } from "@/hooks/use-krenova";

export function MasyarakatDashboardPage() {
  const stats = useMyKrenovaStats();

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard Masyarakat" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Krenova"
          value={stats.data?.total ?? "-"}
          tone="primary"
          icon={Sparkles}
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
