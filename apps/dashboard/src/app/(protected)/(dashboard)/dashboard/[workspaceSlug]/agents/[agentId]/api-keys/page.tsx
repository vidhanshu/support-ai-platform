"use client";

import { use } from "react";
import { AgentApiKeysView } from "@/components/dashboard/api-keys/agent-api-keys-view";

export default function ApiKeysPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  return <AgentApiKeysView agentId={agentId} />;
}
