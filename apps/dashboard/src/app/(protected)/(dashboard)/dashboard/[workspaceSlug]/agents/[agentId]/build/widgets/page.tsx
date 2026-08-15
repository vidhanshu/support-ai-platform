"use client";

import { use } from "react";
import { AgentWidgetsView } from "@/components/dashboard/widgets/agent-widgets-view";

export default function Page({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  return <AgentWidgetsView agentId={agentId} />;
}
