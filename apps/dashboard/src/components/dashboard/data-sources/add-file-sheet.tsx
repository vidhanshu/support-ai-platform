"use client";

import { useMemo, useRef, useState } from "react";
import { FileUp, Info } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { cn } from "@repo/ui/lib/utils";
import { useUploadDocument } from "@/hooks/api";
import {
  FILE_FORMAT_BADGES,
  MAX_UPLOAD_BYTES,
  PDF_MIME,
  formatBytes,
} from "@/lib/knowledge/constants";
import { toastApiError, toastSuccess } from "@/lib/toast";

type AddFileSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, newly uploaded sources are also attached to this agent. */
  agentId?: string;
};

function CircularProgress({
  value,
  size = 36,
  strokeWidth = 3,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label="Upload progress"
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-primary transition-[stroke-dashoffset] duration-150 ease-out"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[10px] font-medium tabular-nums">
        {clamped}%
      </span>
    </div>
  );
}

export function AddFileSheet({
  open,
  onOpenChange,
  agentId,
}: AddFileSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const upload = useUploadDocument(agentId);
  const isUploading = upload.isPending;

  const canSubmit = Boolean(file) && !isUploading;

  function reset() {
    setFile(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    if (!next && isUploading) return;
    if (!next) reset();
    onOpenChange(next);
  }

  function pickFile(next: File | null) {
    if (isUploading) return;
    if (!next) {
      setFile(null);
      return;
    }
    if (next.type !== PDF_MIME && !next.name.toLowerCase().endsWith(".pdf")) {
      toastApiError(
        new Error("Only PDF files are supported right now."),
        "Only PDF files are supported right now.",
      );
      return;
    }
    if (next.size > MAX_UPLOAD_BYTES) {
      toastApiError(
        new Error("File must be 20 MB or smaller."),
        "File must be 20 MB or smaller.",
      );
      return;
    }
    setFile(next);
    setProgress(0);
  }

  function onSubmit() {
    if (!file || isUploading) return;
    setProgress(0);
    upload.mutate(
      {
        file,
        onUploadProgress: (p) => setProgress(p.percent),
      },
      {
        onSuccess: () => {
          toastSuccess("File source added");
          reset();
          onOpenChange(false);
        },
        onError: (error) => {
          toastApiError(error, "Unable to upload file.");
          setProgress(0);
        },
      },
    );
  }

  const helper = useMemo(() => {
    if (!file) return "Up to 20 MB supported";
    return `${file.name} · ${formatBytes(file.size)}`;
  }, [file]);

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
      disablePointerDismissal={isUploading}
    >
      <SheetContent
        side="right"
        showCloseButton={!isUploading}
        className="w-full gap-0 sm:max-w-xl data-[side=right]:sm:max-w-xl"
        onKeyDown={(event) => {
          if (isUploading && event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        <SheetHeader className="border-b">
          <SheetTitle>Add file</SheetTitle>
          <SheetDescription>
            Upload a PDF to the workspace knowledge library. Other formats are
            coming soon.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            disabled={isUploading}
            onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (isUploading) return;
              pickFile(event.dataTransfer.files?.[0] ?? null);
            }}
            className={cn(
              "flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors hover:bg-muted/40 disabled:pointer-events-none disabled:opacity-60",
              file && "border-primary/40 bg-muted/20",
            )}
          >
            <span className="flex size-12 items-center justify-center rounded-full border bg-background">
              <FileUp className="size-5" />
            </span>
            <div>
              <p className="font-medium">
                {file
                  ? "File ready to upload"
                  : "Click here or drag files to upload"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {FILE_FORMAT_BADGES.map((badge) => (
                <span
                  key={badge.ext}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs",
                    badge.enabled
                      ? "bg-background"
                      : "text-muted-foreground line-through opacity-60",
                  )}
                  title={badge.enabled ? undefined : "Coming soon"}
                >
                  {badge.ext}
                  {!badge.enabled ? " · soon" : null}
                </span>
              ))}
            </div>
          </button>

          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            Ensure PDF text is selectable when uploading. Markdown, TXT, and
            DOCX support is coming soon.
          </p>
        </div>

        <SheetFooter className="border-t sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-h-9 items-center gap-3">
            {isUploading ? (
              <>
                <CircularProgress value={progress} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">Uploading…</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {file?.name ?? "Preparing upload"}
                  </p>
                </div>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={reset}
                disabled={!file}
              >
                Reset
              </Button>
            )}
          </div>
          <Button type="button" onClick={onSubmit} disabled={!canSubmit}>
            {isUploading ? "Uploading…" : "Add file source"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
