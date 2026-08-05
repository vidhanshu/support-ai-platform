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
  agentId: string;
};

export function AddFileSheet({
  open,
  onOpenChange,
  agentId,
}: AddFileSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const upload = useUploadDocument(agentId);

  const canSubmit = Boolean(file) && !upload.isPending;

  function reset() {
    setFile(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  function pickFile(next: File | null) {
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
  }

  function onSubmit() {
    if (!file) return;
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
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-xl data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Add file</SheetTitle>
          <SheetDescription>
            Upload a PDF to train this agent. Other formats are coming soon.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              pickFile(event.dataTransfer.files?.[0] ?? null);
            }}
            className={cn(
              "flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors hover:bg-muted/40",
              file && "border-primary/40 bg-muted/20",
            )}
          >
            <span className="flex size-12 items-center justify-center rounded-full border bg-background">
              <FileUp className="size-5" />
            </span>
            <div>
              <p className="font-medium">
                {file ? "File ready to upload" : "Click here or drag files to upload"}
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
            {upload.isPending ? (
              <p className="text-sm text-muted-foreground">
                Uploading… {progress}%
              </p>
            ) : null}
          </button>

          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            Ensure PDF text is selectable when uploading. Markdown, TXT, and
            DOCX support is coming soon.
          </p>
        </div>

        <SheetFooter className="border-t sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            disabled={upload.isPending || !file}
          >
            Reset
          </Button>
          <Button type="button" onClick={onSubmit} disabled={!canSubmit}>
            {upload.isPending ? "Uploading…" : "Add file source"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
