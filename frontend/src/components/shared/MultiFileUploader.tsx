import { ExternalLink, Plus, UploadCloud, X } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FileEntry = {
  /** Stored path returned by the server. */
  path: string;
  /** Display name (the original filename from the File object). */
  name: string;
  /** Blob URL for in-browser preview (used during create wizard). */
  previewUrl?: string;
};

type MultiFileUploaderProps = {
  label: string;
  files?: FileEntry[];
  onChange: (files: File[]) => Promise<void> | void;
  onRemove?: (index: number) => Promise<void> | void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  uploading?: boolean;
  className?: string;
};

const DEFAULT_MAX_SIZE = 25 * 1024 * 1024;
const DEFAULT_ACCEPT = "application/pdf,image/png,image/jpeg,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${+(bytes / 1024 / 1024).toFixed(1)}MB`
    : `${Math.round(bytes / 1024)}KB`;
}

function matchesAccept(file: File, accept: string): boolean {
  const tokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  if (tokens.length === 0) return true;

  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return mime.startsWith(token.slice(0, -1));
    return mime === token;
  });
}

export function MultiFileUploader({
  label,
  files = [],
  onChange,
  onRemove,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
  uploading = false,
  className,
}: MultiFileUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!matchesAccept(file, accept)) {
      setError("Tipe file tidak didukung");
      return;
    }
    if (file.size > maxSize) {
      setError(`Ukuran file maksimal ${formatSize(maxSize)}`);
      return;
    }

    setError(null);
    try {
      await onChange([file]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah file");
    }
  }

  function openDialog() {
    if (disabled || uploading) return;
    inputRef.current?.click();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDialog();
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>

        <input
          id={inputId}
          ref={inputRef}
          data-testid="file-uploader-input"
          type="file"
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploading}
          onClick={openDialog}
          onKeyDown={handleKeyDown}
        >
          <UploadCloud className="size-4" />
          {uploading ? "Mengunggah..." : "Tambah File"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">{error}</p>
      )}

      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-1.5"
            >
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {file.name}
              </span>
              <div className="flex shrink-0 items-center gap-1.5">
                {(file.previewUrl || file.path) && (
                  <a
                    href={file.previewUrl ?? file.path}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="size-3" /> Lihat
                  </a>
                )}
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="inline-flex rounded p-0.5 text-muted-foreground hover:text-destructive"
                    aria-label="Hapus file"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
