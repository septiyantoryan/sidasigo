import { FileSearch, Newspaper, Search } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { BeritaCard } from "@/components/berita/BeritaCard";
import { DataPagination } from "@/components/shared/DataPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useBeritaList } from "@/hooks/use-berita";

export function BeritaListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebouncedValue(search, 300);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const list = useBeritaList({ page, pageSize, search: debouncedSearch });

  const items = list.data?.items ?? [];
  const pageCount = list.data?.pageCount ?? 1;
  const total = list.data?.total ?? 0;
  const isInitialLoading = list.isLoading && !list.data;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:py-14">
        <AnimatedSection direction="up">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-black tracking-tight text-foreground text-center sm:text-5xl">
              Berita
            </h1>
          </div>
        </AnimatedSection>

        <div className="sticky top-16 z-20 -mx-4 bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="relative mx-auto max-w-6xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Cari berita"
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Cari caption berita..."
              className="rounded-full pl-9"
            />
          </div>
        </div>

        {isInitialLoading ? (
          <LoadingSkeleton rows={4} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="Belum ada berita"
            description="Belum ada berita yang cocok dengan pencarian Anda."
          />
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, idx) => (
                <li key={item.id}>
                  <AnimatedSection direction="up" delay={idx * 0.05} className="h-full">
                    <BeritaCard item={item} />
                  </AnimatedSection>
                </li>
              ))}
            </ul>

            {pageCount > 1 && (
              <DataPagination
                page={page}
                pageCount={pageCount}
                total={total}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[9, 18, 36, 72]}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
