import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { usePublicSettings } from "@/hooks/use-settings";
import { api } from "@/lib/api";
import { resolveImageUrl } from "@/lib/image";

export function HeroSection() {
  const settings = usePublicSettings();

  // Hero carousel images
  const heroImagesQuery = useQuery({
    queryKey: ["hero-images", "public"],
    queryFn: () => api.get<{ id: string; path: string }[]>("/api/settings/hero-images"),
    staleTime: 5 * 60_000,
  });
  const heroImages = heroImagesQuery.data ?? [];

  // Embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
  const [emblaIndex, setEmblaIndex] = useState(0);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const onSelect = useCallback((api: NonNullable<typeof emblaApi>) => {
    setEmblaIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    // Autoplay
    const timer = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => { clearInterval(timer); emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const siteSubtitle = settings.data?.siteSubtitle ?? "";
  const heroWelcomeText = settings.data?.heroWelcomeText ?? "Selamat datang di SIDASIGO";
  const heroImageUrl = resolveImageUrl(settings.data?.heroImagePath);

  // If no carousel images, fall back to heroImagePath
  const slides = heroImages.length > 0 ? heroImages : (heroImageUrl ? [{ id: "legacy", path: heroImageUrl }] : []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pb-24">
      {slides.length > 0 ? (
        <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((slide) => (
              <div key={slide.id} className="relative min-w-0 flex-[0_0_100%]">
                <img
                  src={resolveImageUrl(slide.path) ?? undefined}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
            ))}
          </div>
          {slides.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur transition-colors hover:bg-black/40"
                aria-label="Previous"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur transition-colors hover:bg-black/40"
                aria-label="Next"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute bottom-32 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    className={`size-2 rounded-full transition-all ${
                      i === emblaIndex ? "w-6 bg-white" : "bg-white/50"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
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
  );
}
