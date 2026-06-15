import { BookOpen, FileSearch, Search } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { RisetCard } from "@/components/riset/RisetCard";
import { DataPagination } from "@/components/shared/DataPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useRisetList } from "@/hooks/use-riset";

function RisetTabPanel({ jenis }: { jenis: "RisetKajian" | "Penelitian" }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebouncedValue(search, 300);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const list = useRisetList({ page, pageSize, search: debouncedSearch, jenis });

  const items = list.data?.items ?? [];
  const pageCount = list.data?.pageCount ?? 1;
  const total = list.data?.total ?? 0;
  const isInitialLoading = list.isLoading && !list.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label={`Cari ${jenis}`}
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder={`Cari judul atau peneliti ${jenis.toLowerCase()}...`}
          className="rounded-full pl-9"
        />
      </div>

      {isInitialLoading ? (
        <LoadingSkeleton rows={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title={`Belum ada ${jenis.toLowerCase()}`}
          description="Belum ada dokumen yang cocok dengan pencarian Anda."
        />
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2">
            {items.map((item, idx) => (
              <li key={item.id}>
                <AnimatedSection direction="up" delay={idx * 0.05} className="h-full">
                  <RisetCard item={item} />
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
              pageSizeOptions={[8, 16, 32, 64]}
            />
          )}
        </>
      )}
    </div>
  );
}

export function RisetListPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:py-14">
        <AnimatedSection direction="up">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary shadow-sm">
              <BookOpen className="size-3.5" />
              Pustaka Ilmiah
            </span>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              Riset &amp; Kajian
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Kumpulan riset dan kajian ilmiah seputar pembangunan dan inovasi daerah Kabupaten Grobogan.
            </p>
          </div>
        </AnimatedSection>

        <Tabs defaultValue="RisetKajian" className="w-full">
          <TabsList className="rounded-full">
            <TabsTrigger value="RisetKajian" className="rounded-full">Riset/Kajian</TabsTrigger>
            <TabsTrigger value="Penelitian" className="rounded-full">Penelitian</TabsTrigger>
          </TabsList>

          <TabsContent value="RisetKajian" className="mt-6">
            <RisetTabPanel jenis="RisetKajian" />
          </TabsContent>
          <TabsContent value="Penelitian" className="mt-6">
            <RisetTabPanel jenis="Penelitian" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
