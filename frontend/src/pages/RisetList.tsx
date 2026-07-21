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
import { formatJenisRiset } from "@/lib/format";
import type { JenisRiset } from "@/types";

function RisetTabPanel({ jenis }: { jenis: JenisRiset }) {
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

  const list = useRisetList({ page, pageSize, search: debouncedSearch, jenis, sortBy: "tahunPublikasi", sortDir: "desc" });

  const items = list.data?.items ?? [];
  const pageCount = list.data?.pageCount ?? 1;
  const total = list.data?.total ?? 0;
  const isInitialLoading = list.isLoading && !list.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-16 z-20 -mx-4 bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="relative mx-auto max-w-6xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label={`Cari ${formatJenisRiset(jenis)}`}
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder={`Cari judul atau peneliti ${formatJenisRiset(jenis).toLowerCase()}...`}
            className="rounded-full pl-9"
          />
        </div>
      </div>

      {isInitialLoading ? (
        <LoadingSkeleton rows={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title={`Belum ada ${formatJenisRiset(jenis).toLowerCase()}`}
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
            <h1 className="text-4xl font-black tracking-tight text-foreground text-center sm:text-5xl">
              Riset &amp; Kajian
            </h1>
          </div>
        </AnimatedSection>

        <Tabs defaultValue="RisetKajian" className="w-full">
          <TabsList className="rounded-full">
            <TabsTrigger value="RisetKajian" className="rounded-full">Riset/Kajian</TabsTrigger>
            <TabsTrigger value="Penelitian" className="rounded-full">Penelitian</TabsTrigger>
            <TabsTrigger value="PolicyBrief" className="rounded-full">Policy Brief</TabsTrigger>
          </TabsList>

          <TabsContent value="RisetKajian" className="mt-6">
            <RisetTabPanel jenis="RisetKajian" />
          </TabsContent>
          <TabsContent value="Penelitian" className="mt-6">
            <RisetTabPanel jenis="Penelitian" />
          </TabsContent>
          <TabsContent value="PolicyBrief" className="mt-6">
            <RisetTabPanel jenis="PolicyBrief" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
