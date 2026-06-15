import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingSkeletonProps = {
  rows?: number;
  className?: string;
};

export function LoadingSkeleton({ rows = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton key={idx} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}
