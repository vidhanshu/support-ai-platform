"use client";

import { use } from "react";
import { AgentInstructionsForm } from "@/components/dashboard/agent-instructions-form";

export default function InstructionsPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);

  return <AgentInstructionsForm agentId={agentId} />;
}
