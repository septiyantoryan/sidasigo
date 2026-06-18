import { Download, FileText, Video } from "lucide-react";
import type { Indikator } from "@/types";
import { fileUrl } from "@/lib/api";
import { docFields, docGroups as groups, TOTAL_INDIKATOR } from "@/lib/indikator-fields";
import { cn } from "@/lib/utils";

function getValue(indikator: Indikator, key: keyof Indikator): string {
  const raw = indikator[key];
  return typeof raw === "string" ? raw : "";
}

function DocItem({
  label,
  value,
  attPaths,
}: {
  label: string;
  value: string;
  attPaths?: string[];
}) {
  const allFiles = value ? [value, ...(attPaths ?? [])] : (attPaths ?? []);
  const hasFiles = allFiles.length > 0;
  return (
    <li
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors",
        hasFiles
          ? "border-border bg-card"
          : "border-dashed border-border/70 bg-muted/30",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            hasFiles
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          <FileText className="size-4" />
        </span>
        <span className="truncate text-sm font-medium">{label}</span>
      </div>
      {hasFiles ? (
        <div className="flex flex-col gap-1">
          {allFiles.map((p, i) => (
            <a
              key={i}
              href={fileUrl(p)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Download className="size-3.5" /> Unduh {allFiles.length > 1 ? i + 1 : ""}
            </a>
          ))}
        </div>
      ) : (
        <span className="shrink-0 text-xs text-muted-foreground">Belum ada</span>
      )}
    </li>
  );
}

export function IndikatorViewer({
  indikator,
  attachments,
}: {
  indikator?: Indikator | null;
  attachments?: { field: string; path: string }[];
}) {
  if (!indikator) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileText className="size-6" />
        </span>
        <div>
          <p className="text-sm font-medium">Belum ada indikator</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Indikator pendukung inovasi ini belum diunggah.
          </p>
        </div>
      </div>
    );
  }

  // Build a map of field → attachment paths
  const attMap = new Map<string, string[]>();
  if (attachments) {
    for (const att of attachments) {
      const list = attMap.get(att.field) ?? [];
      list.push(att.path);
      attMap.set(att.field, list);
    }
  }

  const filledDocs = docFields.filter(
    (field) => {
      const attPaths = attMap.get(field.key);
      return (attPaths && attPaths.length > 0) || getValue(indikator, field.key) !== "";
    },
  ).length;
  const videoUrl = getValue(indikator, "kualitasVideo");
  const filledTotal = filledDocs + (videoUrl ? 1 : 0);
  const percent = Math.round((filledTotal / TOTAL_INDIKATOR) * 100);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Kelengkapan indikator</p>
          <span className="text-sm text-muted-foreground">
            {filledTotal}/{TOTAL_INDIKATOR} terisi
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.title} className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.title}
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.fields.map((field) => (
              <DocItem
                key={field.key}
                label={field.label}
                value={getValue(indikator, field.key)}
                attPaths={attMap.get(field.key)}
              />
            ))}
          </ul>
        </section>
      ))}

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Video Inovasi
        </h3>
        {videoUrl ? (
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Video className="size-4" /> Buka video
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada video.</p>
        )}
      </section>
    </div>
  );
}
