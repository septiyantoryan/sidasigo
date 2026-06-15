import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number | string;
  description?: string;
  icon?: LucideIcon;
  tone?: "default" | "amber" | "emerald" | "rose" | "primary";
  className?: string;
};

const tones: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  amber: "text-amber-700",
  emerald: "text-emerald-700",
  rose: "text-rose-700",
  primary: "text-primary",
};

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={cn("text-3xl font-semibold leading-tight", tones[tone])}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Icon className="size-5" aria-hidden />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
