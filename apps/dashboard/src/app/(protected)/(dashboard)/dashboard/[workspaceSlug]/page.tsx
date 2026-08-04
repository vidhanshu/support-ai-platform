import React from "react";

const Agents = async ({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) => {
  const { workspaceSlug } = await params;

  return <div>Agents: {workspaceSlug}</div>;
};

export default Agents;
