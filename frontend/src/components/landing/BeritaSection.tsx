import { ArrowRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { useBeritaList } from "@/hooks/use-berita";
import { formatTanggal } from "@/lib/format";
import { resolvePublicUrl } from "@/lib/url";
import { handleImageError } from "@/lib/image";
import type { Berita } from "@/types";

export function BeritaSection() {
  const berita = useBeritaList({
    sort: "newest",
    pageSize: 4,
  });

  const latestBerita = berita.data?.items ?? [];

  return (
    <AnimatedSection direction="up" delay={0.4}>
      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Berita
          </h2>
        </div>

        {berita.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-64 w-full rounded-[1.75rem]" />
            ))}
          </div>
        ) : latestBerita.length === 0 ? (
          <div className="grid place-items-center gap-4 rounded-3xl border border-border bg-card/80 p-10 text-center">
            <Eye className="size-10 text-muted-foreground/40" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Belum ada berita yang dipublikasikan.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestBerita.map((item: Berita) => (
              <li key={item.id}>
                <Link to={`/berita/${item.id}`} className="block h-full">
                  <Card className="group h-full overflow-hidden rounded-[1.75rem] border-border bg-card text-foreground transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-accent hover:shadow-xl hover:shadow-primary/10">
                    <div className="aspect-4/3 w-full overflow-hidden bg-muted">
                      <img
                        src={resolvePublicUrl(item.posterPath)}
                        alt={item.caption.slice(0, 80)}
                        loading="lazy"
                        onError={handleImageError}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="flex flex-col gap-2 p-4">
                      <span className="text-xs text-muted-foreground">
                        {formatTanggal(item.createdAt)}
                      </span>
                      <p className="line-clamp-3 text-sm leading-6 text-foreground">
                        {item.caption}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/berita">
              Lihat Semua Berita <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
      </section>
    </AnimatedSection>
  );
}
