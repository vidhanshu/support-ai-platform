"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  MessageSquareText,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Label } from "@repo/ui/components/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useConfirmDialog } from "@/components/common/confirm-dialog";
import { MarkdownContent } from "@/components/common/markdown-content";
import {
  useBulkDeleteConversations,
  useConversation,
  useConversations,
} from "@/hooks/api";
import type { ConversationListItem } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import { toastApiError, toastSuccess } from "@/lib/toast";

type ConversationsViewProps = {
  agentId: string;
};

function previewText(
  value: string | null | undefined,
  fallback = "No messages",
) {
  const text = value?.replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

export function ConversationsView({ agentId }: ConversationsViewProps) {
  const listQuery = useConversations(agentId);
  const deleteMany = useBulkDeleteConversations(agentId);
  const { confirm, confirmationDialog } = useConfirmDialog();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const conversations = listQuery.data ?? [];
  const allIds = useMemo(
    () => conversations.map((item) => item.id),
    [conversations],
  );
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  useEffect(() => {
    if (!conversations.length) {
      setActiveId(null);
      return;
    }
    if (!activeId || !conversations.some((item) => item.id === activeId)) {
      setActiveId(conversations[0]!.id);
    }
  }, [conversations, activeId]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => allIds.includes(id)));
  }, [allIds]);

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds([]);
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : allIds);
  }

  async function handleDeleteSelected() {
    if (!selectedIds.length) return;

    const count = selectedIds.length;
    const confirmed = await confirm({
      title:
        count === 1
          ? "Delete conversation?"
          : `Delete ${count} conversations?`,
      description:
        count === 1
          ? "This permanently removes the conversation and its messages."
          : "This permanently removes the selected conversations and their messages.",
      confirmLabel: "Delete",
      loadingLabel: "Deleting…",
      variant: "destructive",
      action: async () => {
        try {
          await deleteMany.mutateAsync(selectedIds);
        } catch (error) {
          toastApiError(error, "Unable to delete conversations.");
          throw error;
        }
      },
    });

    if (!confirmed) return;

    if (activeId && selectedIds.includes(activeId)) {
      setActiveId(null);
    }
    exitSelectionMode();
    toastSuccess(
      count === 1 ? "Conversation deleted" : `${count} conversations deleted`,
    );
  }

  return (
    <div className="flex h-[calc(100svh-5rem)] min-h-0 flex-col gap-3 overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight">Conversations</h1>
        <p className="text-sm text-muted-foreground">
          Review past playground and chat sessions for this agent.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-xl border lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
        <section className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Chat logs</h2>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => void listQuery.refetch()}
                disabled={listQuery.isFetching}
                aria-label="Refresh conversations"
              >
                <RefreshCw
                  className={cn(
                    "size-4",
                    listQuery.isFetching && "animate-spin",
                  )}
                />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-sm" />}
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Chat log actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={!conversations.length}
                    onClick={() => {
                      setSelectionMode(true);
                      setSelectedIds([]);
                    }}
                  >
                    <CheckCircle2 />
                    Select
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {selectionMode && conversations.length > 0 ? (
            <div className="flex shrink-0 items-center gap-2 border-b px-4 py-2">
              <Label className="flex cursor-pointer items-center gap-2 font-normal">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => toggleSelectAll()}
                />
                <span className="text-sm">Select all</span>
              </Label>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {listQuery.isLoading ? (
              <div className="space-y-2 p-3">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : listQuery.isError ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Unable to load conversations.
              </p>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <MessageSquareText className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs text-muted-foreground">
                  Chat in the Playground to create the first log.
                </p>
              </div>
            ) : (
              <ul className="p-2">
                {conversations.map((item) => (
                  <ConversationListRow
                    key={item.id}
                    item={item}
                    active={item.id === activeId}
                    selectionMode={selectionMode}
                    checked={selectedIds.includes(item.id)}
                    onOpen={() => setActiveId(item.id)}
                    onToggle={() => toggleSelected(item.id)}
                  />
                ))}
              </ul>
            )}
          </div>

          {selectionMode ? (
            <div className="flex shrink-0 items-center justify-between gap-3 border-t px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={exitSelectionMode}
                  aria-label="Cancel selection"
                >
                  <X className="size-4" />
                </Button>
                <p className="truncate text-sm text-muted-foreground">
                  {selectedIds.length} conversation
                  {selectedIds.length === 1 ? "" : "s"} selected
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                disabled={!selectedIds.length || deleteMany.isPending}
                onClick={() => void handleDeleteSelected()}
                aria-label="Delete selected conversations"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ) : null}
        </section>

        <ConversationDetailPanel
          conversationId={activeId}
          empty={conversations.length === 0 && !listQuery.isLoading}
        />
      </div>

      {confirmationDialog}
    </div>
  );
}

function ConversationListRow({
  item,
  active,
  selectionMode,
  checked,
  onOpen,
  onToggle,
}: {
  item: ConversationListItem;
  active: boolean;
  selectionMode: boolean;
  checked: boolean;
  onOpen: () => void;
  onToggle: () => void;
}) {
  const title = previewText(item.title, "Untitled conversation");
  const snippet = previewText(item.lastMessage?.content, "No messages yet");

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (selectionMode) onToggle();
          else onOpen();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          if (selectionMode) onToggle();
          else onOpen();
        }}
        className={cn(
          "flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
          selectionMode
            ? checked
              ? "bg-muted"
              : "hover:bg-muted/60"
            : active
              ? "bg-muted"
              : "hover:bg-muted/60",
        )}
      >
        {selectionMode ? (
          <Checkbox
            checked={checked}
            onCheckedChange={() => onToggle()}
            onClick={(event) => event.stopPropagation()}
            className="mt-0.5"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-medium">{title}</p>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatRelativeTime(item.updatedAt)}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{snippet}</p>
        </div>
      </div>
    </li>
  );
}

function ConversationDetailPanel({
  conversationId,
  empty,
}: {
  conversationId: string | null;
  empty: boolean;
}) {
  const detailQuery = useConversation(conversationId);

  const messages = useMemo(
    () => detailQuery.data?.messages ?? [],
    [detailQuery.data?.messages],
  );

  if (empty) {
    return (
      <div className="flex min-h-0 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
        <MessageSquareText className="size-8" />
        <p className="text-sm">Conversation details will appear here.</p>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex min-h-0 items-center justify-center p-8 text-sm text-muted-foreground">
        Select a conversation to view the thread.
      </div>
    );
  }

  return (
    <section className="flex min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">
            {previewText(detailQuery.data?.title, "Conversation")}
          </h2>
          {detailQuery.data ? (
            <p className="text-xs text-muted-foreground">
              {messages.length} message{messages.length === 1 ? "" : "s"} ·{" "}
              {formatRelativeTime(detailQuery.data.updatedAt)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Loading…</p>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {detailQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="ml-auto h-12 w-2/3 rounded-2xl" />
            <Skeleton className="h-24 w-3/4 rounded-2xl" />
            <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
          </div>
        ) : detailQuery.isError ? (
          <p className="text-center text-sm text-muted-foreground">
            Unable to load this conversation.
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No messages in this conversation.
          </p>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {messages.map((message) => {
              const isUser = message.role === "USER";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
                    isUser
                      ? "ml-auto whitespace-pre-wrap bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {isUser ? (
                    message.content
                  ) : message.role === "ASSISTANT" ? (
                    <MarkdownContent content={message.content} />
                  ) : (
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                  <p
                    className={cn(
                      "mt-1.5 text-[11px]",
                      isUser
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatRelativeTime(message.createdAt)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
