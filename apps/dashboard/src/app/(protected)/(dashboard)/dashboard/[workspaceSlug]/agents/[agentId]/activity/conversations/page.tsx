"use client";

import { use } from "react";
import { ConversationsView } from "@/components/dashboard/conversations/conversations-view";

export default function ConversationsPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  return <ConversationsView agentId={agentId} />;
}
