import { CalendarDays, Download, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resolvePublicUrl } from "@/lib/url";
import { formatJenisRiset } from "@/lib/format";
import type { Riset } from "@/types";


export function RisetCard({ item }: { item: Riset }) {
  return (
    <Card className="group h-full rounded-[1.75rem] border-border bg-card text-foreground transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
            <Badge variant={item.jenis === "RisetKajian" ? "default" : "secondary"}>
              {formatJenisRiset(item.jenis)}
            </Badge>
          <span className="text-xs text-muted-foreground">{item.tahunPublikasi}</span>
        </div>

        <h3 className="line-clamp-2 text-lg font-semibold leading-tight tracking-tight">
          {item.judulKajian}
        </h3>

        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {item.abstrak}
        </p>

        <div className="mt-auto flex flex-col gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden />
              <span className="line-clamp-1">{item.timPeneliti}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden />
              {item.tahunPublikasi}
            </span>
          </div>
          <Button asChild variant="outline" className="w-full rounded-full">
            <a href={resolvePublicUrl(item.filePath)} target="_blank" rel="noreferrer">
              <Download className="size-4" /> Unduh Dokumen
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
