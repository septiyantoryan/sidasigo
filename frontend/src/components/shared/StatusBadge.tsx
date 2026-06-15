import { cn } from "@/lib/utils";

type StatusValue = "Pending" | "Disetujui" | "Ditolak";

const styles: Record<StatusValue, string> = {
  Pending:
    "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800/40",
  Disetujui:
    "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800/40",
  Ditolak:
    "bg-rose-100 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-800/40",
};

export function StatusBadge({
  status,
  className,
}: {
  status: StatusValue;
  className?: string;
}) {
  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
