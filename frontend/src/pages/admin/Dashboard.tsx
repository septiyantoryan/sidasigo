import { Lightbulb, Sparkles, UserCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InovasiPerOpdChart } from "@/components/dashboard/InovasiPerOpdChart";
import { StatusDonutChart } from "@/components/dashboard/StatusDonutChart";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { useAdminDashboard } from "@/hooks/use-dashboard";

export function AdminDashboardPage() {
  const stats = useAdminDashboard();

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" />

      {stats.isLoading ? (
        <LoadingSkeleton rows={3} />
      ) : stats.data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total OPD"
              value={stats.data.totalOpd}
              icon={Users}
              tone="primary"
            />
            <StatCard
              label="Peserta Krenova"
              value={stats.data.totalKrenovaPeserta}
              icon={UserCheck}
            />
            <StatCard
              label="Total Inovasi"
              value={stats.data.totalInovasiDaerah}
              icon={Lightbulb}
            />
            <StatCard
              label="Total Krenova"
              value={stats.data.totalKrenova}
              icon={Sparkles}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Jumlah Inovasi tiap OPD</CardTitle>
              </CardHeader>
              <CardContent>
                <InovasiPerOpdChart data={stats.data.inovasiPerOpd} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusDonutChart
                  pending={stats.data.pendingTotal}
                  approved={stats.data.approvedTotal}
                  rejected={stats.data.rejectedTotal}
                />
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
