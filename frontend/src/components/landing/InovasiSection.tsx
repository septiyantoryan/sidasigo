import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { CarouselShowcase } from "@/components/public/CarouselShowcase";
import { JenisBadge } from "@/components/shared/JenisBadge";
import { useInovasiDaerahList } from "@/hooks/use-inovasi-daerah";
import { formatTanggal } from "@/lib/format";
import type { InovasiDaerah } from "@/types";

export function InovasiSection() {
  const inovasi = useInovasiDaerahList({
    sort: "newest",
    pageSize: 6,
    status: "Disetujui",
  });

  const latestInovasi = inovasi.data?.items ?? [];

  return (
    <AnimatedSection className="pt-0" direction="up" delay={0.2}>
      <CarouselShowcase
        eyebrow="Etalase terbaru"
        title="Inovasi Daerah"
        items={latestInovasi}
        isLoading={inovasi.isLoading}
        emptyMessage="Belum ada inovasi daerah yang disetujui."
        viewAllHref="/inovasi-daerah"
        viewAllLabel="Lihat Semua Inovasi"
        renderCard={(item: InovasiDaerah) => (
          <Link to={`/inovasi-daerah/${item.id}`} className="block h-full">
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
                  {item.namaInovasi}
                </h3>
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {item.tujuan}
                </p>
                <span className="mt-auto rounded-2xl border border-border bg-background/70 p-3 text-xs text-muted-foreground">
                  {item.inisiator} · {formatTanggal(item.tglPenerapan)}
                </span>
              </CardContent>
            </Card>
          </Link>
        )}
      />
    </AnimatedSection>
  );
}
