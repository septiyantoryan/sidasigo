import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  CircleCheck,
  Download,
  Lightbulb,
  Newspaper,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { CarouselShowcase } from "@/components/public/CarouselShowcase";
import { JenisBadge } from "@/components/shared/JenisBadge";
import { useInovasiDaerahList } from "@/hooks/use-inovasi-daerah";
import { useKrenovaList } from "@/hooks/use-krenova";
import { usePublicSettings } from "@/hooks/use-settings";
import { api } from "@/lib/api";
import { formatTanggal } from "@/lib/format";
import { handleImageError } from "@/lib/image";
import type { InovasiDaerah, Krenova } from "@/types";

function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${api.baseUrl}${path}`;
}

export function LandingPage() {
  const settings = usePublicSettings();
  const inovasi = useInovasiDaerahList({ sort: "newest", pageSize: 6, status: "Disetujui" });
  const krenova = useKrenovaList({ sort: "newest", pageSize: 6, status: "Disetujui" });

  const siteSubtitle = settings.data?.siteSubtitle ?? "";
  const heroWelcomeText =
    settings.data?.heroWelcomeText ?? "Selamat datang di SIDASIGO";
  const rawJournal = settings.data?.journalUrl?.trim() || "";
  const journalUrl = rawJournal && !/^https?:\/\//.test(rawJournal) ? `https://${rawJournal}` : rawJournal;
  const heroImageUrl = resolveImageUrl(settings.data?.heroImagePath);

  const latestInovasi = inovasi.data?.items ?? [];
  const latestKrenova = krenova.data?.items ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* ===== HERO SECTION ===== */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt=""
            onError={handleImageError}
            className="absolute inset-0 size-full object-cover"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background: heroImageUrl
              ? "linear-gradient(to bottom, rgb(0 0 0 / 0.7), rgb(0 0 0 / 0.5), var(--background))"
              : "radial-gradient(circle at 12% 16%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 32%), radial-gradient(circle at 84% 12%, color-mix(in oklch, var(--accent) 70%, transparent), transparent 30%), linear-gradient(180deg, color-mix(in oklch, var(--muted) 70%, transparent), transparent)",
          }}
        />

        <AnimatedSection className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6" direction="up" delay={0.2}>
          <h1 className="max-w-4xl text-balance text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {heroWelcomeText}
          </h1>

          <p className="max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            {siteSubtitle || "Baca katalog inovasi daerah, temukan karya Krenova, dan masuk ke ruang kerja pengajuan dalam satu portal publik."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/inovasi-daerah">
                Jelajahi Inovasi Daerah <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white">
              <Link to="/krenova">Lihat Krenova</Link>
            </Button>
          </div>
        </AnimatedSection>

        <div className="absolute bottom-8 z-10 animate-bounce text-white/60">
          <ChevronDown className="size-6" aria-hidden />
        </div>
      </section>

      {/* ===== CONTENT BELOW HERO ===== */}
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 sm:px-6 lg:gap-6 lg:pb-24">
        {/* ===== LINK SECTION ===== */}
        <AnimatedSection className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6" direction="up">
          <AnimatedSection direction="up" delay={0}>
            <ServiceCard
              to="/inovasi-daerah"
              icon={Lightbulb}
              title="Inovasi Daerah"
            />
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.15}>
            <ServiceCard
              to="/krenova"
              icon={Users}
              title="Krenova"
            />
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.3}>
            <ServiceCard
              to="/riset"
              icon={BookOpen}
              title="Riset/Kajian"
            />
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.45}>
            <ServiceCard
              to="/berita"
              icon={Newspaper}
              title="Berita"
            />
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.6}>
            <ServiceCard
              to="/download"
              icon={Download}
              title="Unduhan"
            />
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.75}>
            {journalUrl ? (
              <ServiceCard
                href={journalUrl}
                icon={BookOpen}
                title="Jurnal Paradigma"
              />
            ) : (
              <ServiceCard
                to="/login"
                icon={CircleCheck}
                title="Ruang Pengajuan"
              />
            )}
          </AnimatedSection>
        </AnimatedSection>

        {/* ===== INOVASI DAERAH CAROUSEL ===== */}
        <AnimatedSection direction="up" delay={0.2}>
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
                    Showcase Entry
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

        {/* ===== KRENOVA CAROUSEL ===== */}
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
                    Showcase Entry
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
      </div>
    </div>
  );
}

function ServiceCard({
  to,
  href,
  icon: Icon,
  title,
}: {
  to?: string;
  href?: string;
  icon: typeof Users;
  title: string;
}) {
  const inner = (
    <div className="group flex flex-col items-center gap-3 rounded-[2rem] border border-border bg-card p-6 text-foreground shadow-xl shadow-primary/5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-accent hover:shadow-2xl hover:shadow-primary/10">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-background/70 text-primary transition-transform group-hover:rotate-3 group-hover:scale-105">
        <Icon aria-hidden className="size-6" />
      </div>
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }

  return (
    <Link to={to ?? "#"} className="block">
      {inner}
    </Link>
  );
}
