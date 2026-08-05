"use client";

import { use } from "react";
import { PlaygroundView } from "@/components/dashboard/playground/playground-view";

export default function PlaygroundPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  return <PlaygroundView agentId={agentId} />;
}
