import { ArrowRight, CalendarDays, UserRound, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { JenisBadge } from "@/components/shared/JenisBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatTanggal } from "@/lib/format";
import type { InovasiDaerah, Krenova } from "@/types";

type PublicShowcaseCardProps =
  | { variant: "inovasi"; item: InovasiDaerah }
  | { variant: "krenova"; item: Krenova };

export function PublicShowcaseCard(props: PublicShowcaseCardProps) {
  if (props.variant === "inovasi") {
    const item = props.item;

    return (
      <Link to={`/inovasi-daerah/${item.id}`} className="block h-full">
        <Card className="group h-full rounded-[1.75rem] border-border bg-card text-foreground transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <Badge variant="secondary">OPD</Badge>
              <JenisBadge jenis={item.jenisInovasi} />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="line-clamp-2 text-lg font-semibold leading-tight tracking-tight">
                {item.namaInovasi}
              </h3>
              <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                {item.tujuan}
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 pt-1">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="size-3.5" aria-hidden />
                  {item.inisiator}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {formatTanggal(item.tglPenerapan)}
                </span>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-transform group-hover:translate-x-1">
                Detail <ArrowRight className="size-3.5" />
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  const item = props.item;

  return (
    <Link to={`/krenova/${item.id}`} className="block h-full">
      <Card className="group h-full rounded-[1.75rem] border-border bg-card text-foreground transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <Badge variant="outline">{item.statusPelaku}</Badge>
            <JenisBadge jenis={item.jenisInovasi} />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight tracking-tight">
              {item.judulInovasi}
            </h3>
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {item.tahapInovasi}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <UsersRound className="size-3.5" aria-hidden />
                {item.namaInovator1}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" aria-hidden />
                {formatTanggal(item.waktuPenerapan)}
              </span>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-transform group-hover:translate-x-1">
              Detail <ArrowRight className="size-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
