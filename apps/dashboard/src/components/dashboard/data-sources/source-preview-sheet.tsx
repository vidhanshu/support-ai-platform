"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileText, Loader2, Type } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { documentsApi, type KnowledgeSource } from "@/lib/api";
import { PDF_MIME, formatBytes } from "@/lib/knowledge/constants";
import { toastApiError } from "@/lib/toast";
import { cn } from "@repo/ui/lib/utils";

type SourcePreviewSheetProps = {
  source: KnowledgeSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function sourceTitle(source: KnowledgeSource) {
  return (
    source.document?.originalFilename ||
    source.website?.rootUrl ||
    source.textSnippet?.title ||
    source.name
  );
}

export function SourcePreviewSheet({
  source,
  open,
  onOpenChange,
}: SourcePreviewSheetProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const isDocument = source?.type === "DOCUMENT";
  const isText = source?.type === "TEXT_SNIPPET";
  const isPdf = isDocument && source.document?.mimeType === PDF_MIME;
  const documentId = source?.document?.id;

  useEffect(() => {
    if (!open || !isDocument || !documentId) {
      setDownloadUrl(null);
      setUrlError(null);
      setIsLoadingUrl(false);
      return;
    }

    let cancelled = false;
    setIsLoadingUrl(true);
    setUrlError(null);
    setDownloadUrl(null);

    void documentsApi
      .getDownloadUrl(documentId)
      .then((payload) => {
        if (cancelled) return;
        setDownloadUrl(payload.downloadUrl);
      })
      .catch((error) => {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Unable to load document.";
        setUrlError(message);
        toastApiError(error, "Unable to load document preview.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingUrl(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, isDocument, documentId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 sm:max-w-2xl data-[side=right]:sm:max-w-2xl"
      >
        <SheetHeader className="border-b">
          <SheetTitle className="truncate pr-8">
            {source ? sourceTitle(source) : "Preview"}
          </SheetTitle>
          <SheetDescription>
            {isText
              ? "Read-only preview of this text snippet."
              : isDocument
                ? "Read-only document preview."
                : "Source preview"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {!source ? null : isText ? (
            <TextSnippetPreview source={source} />
          ) : isDocument ? (
            <DocumentPreview
              source={source}
              isPdf={Boolean(isPdf)}
              downloadUrl={downloadUrl}
              isLoadingUrl={isLoadingUrl}
              urlError={urlError}
            />
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              Preview is not available for this source type.
            </p>
          )}
        </div>

        <SheetFooter className="border-t">
          {isDocument && downloadUrl ? (
            <Button
              type="button"
              variant="outline"
              nativeButton={false}
              render={
                <a href={downloadUrl} target="_blank" rel="noreferrer" />
              }
            >
              <ExternalLink className="size-4" />
              Open file
            </Button>
          ) : null}
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function TextSnippetPreview({ source }: { source: KnowledgeSource }) {
  const html = source.textSnippet?.contentHtml?.trim();
  if (!html) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        This text snippet has no content.
      </p>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Type className="size-3.5" />
        {source.textSnippet
          ? formatBytes(source.textSnippet.contentBytes)
          : null}
      </div>
      <div
        className={cn(
          "rounded-lg border bg-background p-4 text-sm leading-relaxed",
          "[&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-xl [&_h1]:font-bold",
          "[&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold",
          "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_p]:my-1",
          "[&_a]:text-primary [&_a]:underline",
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function DocumentPreview({
  source,
  isPdf,
  downloadUrl,
  isLoadingUrl,
  urlError,
}: {
  source: KnowledgeSource;
  isPdf: boolean;
  downloadUrl: string | null;
  isLoadingUrl: boolean;
  urlError: string | null;
}) {
  if (isLoadingUrl) {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading preview…
      </div>
    );
  }

  if (urlError) {
    return (
      <p className="p-4 text-sm text-destructive">{urlError}</p>
    );
  }

  if (!downloadUrl) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Document preview is unavailable.
      </p>
    );
  }

  if (isPdf) {
    return (
      <iframe
        title={source.document?.originalFilename ?? "PDF preview"}
        src={downloadUrl}
        className="min-h-0 w-full flex-1 border-0 bg-muted/20"
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-3 p-6">
      <span className="flex size-12 items-center justify-center rounded-xl border bg-background">
        <FileText className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">
          {source.document?.originalFilename ?? "Document"}
        </p>
        <p className="text-sm text-muted-foreground">
          In-app preview is available for PDFs. Other formats (DOCX, etc.) are
          coming soon — open the file instead.
        </p>
        {source.document ? (
          <p className="text-xs text-muted-foreground">
            {source.document.mimeType} · {formatBytes(source.document.size)}
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        variant="outline"
        nativeButton={false}
        render={<a href={downloadUrl} target="_blank" rel="noreferrer" />}
      >
        <ExternalLink className="size-4" />
        Open file
      </Button>
    </div>
  );
}
