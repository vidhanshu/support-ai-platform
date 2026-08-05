"use client";

import {
  FileText,
  Globe,
  HelpCircle,
  LayoutTemplate,
  Ticket,
  Type,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import {
  SOURCE_CARDS,
  type SourceCardId,
} from "@/lib/knowledge/constants";

const ICONS: Record<SourceCardId, React.ComponentType<{ className?: string }>> =
  {
    files: FileText,
    website: Globe,
    text: Type,
    qa: HelpCircle,
    notion: LayoutTemplate,
    tickets: Ticket,
  };

type AddSourceCardsProps = {
  onSelect: (id: Extract<SourceCardId, "files" | "website">) => void;
};

export function AddSourceCards({ onSelect }: AddSourceCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {SOURCE_CARDS.map((card) => {
        const Icon = ICONS[card.id];

        return (
          <button
            key={card.id}
            type="button"
            disabled={!card.enabled}
            title={card.enabled ? undefined : "Coming soon"}
            onClick={() => {
              if (card.id === "files" || card.id === "website") {
                onSelect(card.id);
              }
            }}
            className={cn(
              "relative flex flex-col items-start justify-between rounded-xl border bg-card p-4 text-left transition-colors",
              card.enabled
                ? "hover:bg-muted/50"
                : "cursor-not-allowed opacity-55",
            )}
          >
            {!card.enabled ? (
              <span className="absolute top-3 right-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Coming soon
              </span>
            ) : null}
            <span className="flex size-10 items-center justify-center rounded-lg border bg-background">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-medium">{card.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {card.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
