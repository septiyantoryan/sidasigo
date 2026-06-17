import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { CarouselShowcase } from "@/components/public/CarouselShowcase";
import { JenisBadge } from "@/components/shared/JenisBadge";
import { useKrenovaList } from "@/hooks/use-krenova";
import { formatTanggal } from "@/lib/format";
import type { Krenova } from "@/types";

export function KrenovaSection() {
  const krenova = useKrenovaList({
    sort: "newest",
    pageSize: 6,
    status: "Disetujui",
  });

  const latestKrenova = krenova.data?.items ?? [];

  return (
    <AnimatedSection direction="up" delay={0.35}>
      <CarouselShowcase
        eyebrow="Etalase terbaru"
        title="Krenova"
        items={latestKrenova}
        isLoading={krenova.isLoading}
        emptyMessage="Belum ada krenova yang disetujui."
        viewAllHref="/krenova"
        viewAllLabel="Lihat Semua Krenova"
        renderCard={(item: Krenova) => (
          <Link to={`/krenova/${item.id}`} className="block h-full">
            <Card className="group relative h-full overflow-hidden rounded-[1.75rem] border-border bg-card text-foreground transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-accent hover:shadow-xl hover:shadow-primary/10">
              <JenisBadge
                jenis={item.jenisInovasi}
                className="absolute right-3 top-3 z-10 px-1.5 py-0 text-[10px]"
              />
              <CardContent className="flex min-h-56 flex-col gap-4 p-5 pt-8">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Entri Etalase
                </span>
                <h3 className="line-clamp-2 pr-14 text-base font-semibold tracking-tight text-foreground">
                  {item.judulInovasi}
                </h3>
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {item.tahapInovasi}
                </p>
                <span className="mt-auto rounded-2xl border border-border bg-background/70 p-3 text-xs text-muted-foreground">
                  {item.namaInovator1} · {formatTanggal(item.waktuPenerapan)}
                </span>
              </CardContent>
            </Card>
          </Link>
        )}
      />
    </AnimatedSection>
  );
}
