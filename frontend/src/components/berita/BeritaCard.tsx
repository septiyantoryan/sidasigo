import { ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { resolvePublicUrl } from "@/lib/url";
import { formatTanggal } from "@/lib/format";
import { handleImageError } from "@/lib/image";
import type { Berita } from "@/types";


export function BeritaCard({ item }: { item: Berita }) {
  return (
    <Link to={`/berita/${item.id}`} className="block h-full">
      <Card className="group h-full overflow-hidden rounded-[1.75rem] border-border bg-card text-foreground transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img
            src={resolvePublicUrl(item.posterPath)}
            alt={item.caption.slice(0, 80)}
            loading="lazy"
            onError={handleImageError}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="flex flex-col gap-3 p-5">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden />
            {formatTanggal(item.createdAt)}
          </span>
          <p className="line-clamp-3 text-sm leading-6 text-foreground">
            {item.caption}
          </p>
          <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium text-primary transition-transform group-hover:translate-x-1">
            Baca selengkapnya <ArrowRight className="size-3.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
