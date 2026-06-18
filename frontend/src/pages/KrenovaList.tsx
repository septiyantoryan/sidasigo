import { FileSearch, Rocket, Search } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { AnimatedSection } from "@/components/public/AnimatedSection";
import { PublicShowcaseCard } from "@/components/public/PublicShowcaseCard";
import { DataPagination } from "@/components/shared/DataPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useKrenovaList } from "@/hooks/use-krenova";

export function KrenovaListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState("all");

  const debouncedSearch = useDebouncedValue(search, 300);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, jenis, pageSize]);

  const list = useKrenovaList({
    page,
    pageSize,
    search: debouncedSearch,
    jenis: jenis === "all" ? undefined : (jenis as "Digital" | "Non_Digital"),
    sortBy: "waktuPenerapan",
    sortDir: "desc",
  });

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
              Krenova
            </h1>
          </div>
        </AnimatedSection>

        <div className="sticky top-16 z-20 -mx-4 bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Cari Krenova"
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="Cari judul Krenova..."
                className="rounded-full pl-9"
              />
            </div>
            <Select value={jenis} onValueChange={setJenis}>
              <SelectTrigger className="w-full rounded-full sm:w-40" aria-label="Filter jenis inovasi">
                <SelectValue placeholder="Semua jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua jenis</SelectItem>
                <SelectItem value="Digital">Digital</SelectItem>
                <SelectItem value="Non_Digital">Non Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isInitialLoading ? (
          <LoadingSkeleton rows={4} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="Belum ada Krenova"
            description="Belum ada Krenova publik yang cocok dengan pencarian Anda."
          />
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2">
              {items.map((item, idx) => (
                <li key={item.id}>
                  <AnimatedSection direction="up" delay={idx * 0.05} className="h-full">
                    <PublicShowcaseCard variant="krenova" item={item} />
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
    </div>
  );
}
