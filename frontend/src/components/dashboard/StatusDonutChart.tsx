import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type StatusDonutChartProps = {
  pending: number;
  approved: number;
  rejected: number;
};

const SEGMENTS = [
  { key: "approved", label: "Disetujui", color: "#059669" },
  { key: "pending", label: "Pending", color: "#d97706" },
  { key: "rejected", label: "Ditolak", color: "#e11d48" },
] as const;

export function StatusDonutChart({
  pending,
  approved,
  rejected,
}: StatusDonutChartProps) {
  const values: Record<(typeof SEGMENTS)[number]["key"], number> = {
    approved,
    pending,
    rejected,
  };

  const data = SEGMENTS.map((segment) => ({
    name: segment.label,
    value: values[segment.key],
    color: segment.color,
  }));

  const total = pending + approved + rejected;

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Belum ada data status submission.
      </div>
    );
  }

  return (
    <div className="relative h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--card)",
              fontSize: 12,
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={32}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-[40%] flex -translate-y-1/2 flex-col items-center">
        <span className="text-2xl font-semibold leading-none text-foreground">
          {total}
        </span>
        <span className="text-xs text-muted-foreground">Total</span>
      </div>
    </div>
  );
}
