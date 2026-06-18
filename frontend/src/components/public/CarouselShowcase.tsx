import { ArrowRight, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type CarouselShowcaseProps<T> = {
  title: string;
  items: T[];
  renderCard: (item: T) => ReactNode;
  emptyMessage: string;
  viewAllHref: string;
  viewAllLabel: string;
  isLoading: boolean;
};

export function CarouselShowcase<T>({
  title,
  items,
  renderCard,
  emptyMessage,
  viewAllHref,
  viewAllLabel,
  isLoading,
}: CarouselShowcaseProps<T>) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scrollBy = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * direction, behavior: "smooth" });
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [updateScrollState, isLoading, items]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateScrollState]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Sebelumnya"
            disabled={!canScrollLeft}
            onClick={() => scrollBy(-1)}
            className="rounded-full border-border bg-card text-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Berikutnya"
            disabled={!canScrollRight}
            onClick={() => scrollBy(1)}
            className="rounded-full border-border bg-card text-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-56 shrink-0 basis-full animate-pulse rounded-3xl border border-border bg-card/70 sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)]"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="grid place-items-center gap-4 rounded-3xl border border-border bg-card/80 p-10 text-center">
          <Eye className="size-10 text-muted-foreground/40" aria-hidden />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="relative">
          <div
            ref={scrollerRef}
            onScroll={updateScrollState}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, idx) => (
              <div
                key={idx}
                className="shrink-0 basis-full snap-start sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)]"
              >
                {renderCard(item)}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <Button asChild variant="outline" className="rounded-full">
          <Link to={viewAllHref}>
            {viewAllLabel} <ArrowRight className="size-4 ml-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
