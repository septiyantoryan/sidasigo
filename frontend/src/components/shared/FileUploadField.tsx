import { Check, ExternalLink, UploadCloud } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FileUploadFieldProps = {
  label: string;
  /** Stored value (filename or relative path) used to detect an existing file. */
  value?: string | null;
  onChange: (file: File) => void | Promise<void>;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  /** Optional URL to preview/open the uploaded or saved file. */
  href?: string;
  /** Label shown for an already-saved file whose original name is unknown. */
  savedLabel?: string;
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

/**
 * Compact single-row file uploader:
 *
 *   <label>            [ Pilih File ]  ✓ dokumen.pdf · Lihat
 *
 * Freshly uploaded files show their original filename; already-saved files
 * (whose original name is unknown) show `savedLabel`.
 */
export function FileUploadField({
  label,
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
  href,
  savedLabel = "Berkas tersimpan",
  className,
}: FileUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const hasValue = Boolean(value);
  const displayName = fileName ?? (hasValue ? savedLabel : null);

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
    setIsUploading(true);
    try {
      await onChange(file);
      setFileName(file.name);
    } catch (err) {
      // Keep selection cleared on failure so the user knows it did not upload.
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
      setError(err instanceof Error ? err.message : "Gagal mengunggah file");
    } finally {
      setIsUploading(false);
    }
  }

  function openDialog() {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDialog();
    }
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="grid grid-cols-[1fr_1.5fr] items-center gap-3">
        <span className="text-sm font-medium text-foreground">
          {label}
        </span>

        <div className="flex min-w-0 items-center gap-3">
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
            className="shrink-0"
            disabled={disabled || isUploading}
            onClick={openDialog}
            onKeyDown={handleKeyDown}
          >
            <UploadCloud className="size-4" />
            {isUploading ? "Mengunggah..." : "Pilih File"}
          </Button>

          {!isUploading && displayName && (
            <span className="flex min-w-0 flex-1 items-center gap-1.5 text-xs">
              <Check className="size-3.5 shrink-0 text-emerald-600" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {displayName}
              </span>
              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" /> Lihat
                </a>
              )}
            </span>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
