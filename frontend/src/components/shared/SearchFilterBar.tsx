import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SearchFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  jenis: string;
  onJenisChange: (value: string) => void;
  searchPlaceholder?: string;
  eyebrow?: string;
  description?: string;
  variant?: "plain" | "panel";
};

export function SearchFilterBar({
  search,
  onSearchChange,
  jenis,
  onJenisChange,
  searchPlaceholder = "Cari nama inovasi...",
  eyebrow,
  description,
  variant = "plain",
}: SearchFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        variant === "panel" &&
          "rounded-[1.75rem] border border-border bg-card/90 p-4 shadow-sm backdrop-blur sm:p-5",
      )}
    >
      {(eyebrow || description) && (
        <div className="flex flex-col gap-1">
          {eyebrow && (
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </span>
          )}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-[1fr_12rem] md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Cari inovasi"
            value={search}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onSearchChange(event.target.value)
            }
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        <Select value={jenis} onValueChange={onJenisChange}>
          <SelectTrigger aria-label="Filter jenis inovasi">
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
  );
}
