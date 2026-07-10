import { FileText, UploadCloud, X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

type DropzoneProps = {
  value?: string | null;
  onChange: (file: File) => void | Promise<void>;
  onUploadingChange?: (uploading: boolean) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  disabled?: boolean;
};

const DEFAULT_MAX_SIZE = 25 * 1024 * 1024;
const DEFAULT_ACCEPT = "application/pdf,image/png,image/jpeg,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const ACCEPT_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/webp": "WEBP",
};

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${+(bytes / 1024 / 1024).toFixed(1)}MB`
    : `${Math.round(bytes / 1024)}KB`;
}

function formatAccept(accept: string): string {
  const labels = accept
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .map(
      (token) =>
        ACCEPT_LABELS[token.toLowerCase()] ??
        token.replace(/^\./, "").replace(/\/\*$/, "").toUpperCase(),
    );
  return Array.from(new Set(labels)).join(", ");
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

export function Dropzone({
  value,
  onChange,
  onUploadingChange,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  label = "Pilih file",
  disabled = false,
}: DropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
    setFileName(file.name);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
      setIsImage(true);
    } else {
      setPreviewUrl(null);
      setIsImage(false);
    }

    setIsUploading(true);
    onUploadingChange?.(true);
    try {
      await onChange(file);
    } catch (err) {
      // Upload failed: clear the optimistic selection and surface the error so
      // the user does not believe the file was uploaded.
      setFileName(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setIsImage(false);
      if (inputRef.current) inputRef.current.value = "";
      setError(err instanceof Error ? err.message : "Gagal mengunggah file");
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  }

  function openDialog() {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDialog();
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFile(event.dataTransfer.files?.[0]);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function clearSelection(event: React.MouseEvent) {
    event.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setIsImage(false);
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const hasSelection = Boolean(fileName);
  const displayValue = !hasSelection && value ? value : null;

  return (
    <div className="space-y-1.5">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-disabled={disabled}
        onClick={openDialog}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors",
          !disabled && "cursor-pointer hover:border-primary/50 hover:bg-muted/50",
          isDragging && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
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

        {isImage && previewUrl ? (
          <img
            src={previewUrl}
            alt="Pratinjau file"
            className="max-h-32 rounded-lg border border-border object-contain"
          />
        ) : hasSelection ? (
          <FileText className="size-7 text-primary" aria-hidden />
        ) : (
          <UploadCloud className="size-7 text-muted-foreground" aria-hidden />
        )}

        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {hasSelection ? (
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <span className="max-w-[16rem] truncate">{fileName}</span>
              <button
                type="button"
                onClick={clearSelection}
                aria-label="Hapus file"
                className="inline-flex rounded p-0.5 hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </p>
          ) : displayValue ? (
            <p className="max-w-[18rem] truncate text-xs text-muted-foreground">
              {displayValue}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Seret &amp; lepas file ke sini, atau klik untuk memilih
            </p>
          )}
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : isUploading ? (
        <p className="text-[11px] text-primary">Mengunggah file...</p>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          {formatAccept(accept)} · Maks {formatSize(maxSize)}
        </p>
      )}
    </div>
  );
}
