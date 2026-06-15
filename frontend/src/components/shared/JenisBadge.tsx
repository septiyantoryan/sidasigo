import { cn } from "@/lib/utils";

type Jenis = "Digital" | "Non_Digital";

const styles: Record<Jenis, string> = {
  Digital:
    "bg-sky-100 text-sky-800 ring-1 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-200 dark:ring-sky-800/40",
  Non_Digital:
    "bg-violet-100 text-violet-800 ring-1 ring-violet-200 dark:bg-violet-900/30 dark:text-violet-200 dark:ring-violet-800/40",
};

const labels: Record<Jenis, string> = {
  Digital: "Digital",
  Non_Digital: "Non Digital",
};

export function JenisBadge({
  jenis,
  className,
}: {
  jenis: Jenis;
  className?: string;
}) {
  return (
    <span
      data-jenis={jenis}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[jenis],
        className,
      )}
    >
      {labels[jenis]}
    </span>
  );
}
