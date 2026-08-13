"use client";

import { use } from "react";
import { AgentDataSourcesView } from "@/components/dashboard/data-sources/agent-data-sources-view";

export default function AgentDataSourcesPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  return <AgentDataSourcesView agentId={agentId} />;
}
