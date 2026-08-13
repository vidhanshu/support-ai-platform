import { redirect } from "next/navigation";

export default async function BuildIndexPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; agentId: string }>;
}) {
  const { workspaceSlug, agentId } = await params;
  redirect(
    `/dashboard/${workspaceSlug}/agents/${agentId}/build/instructions`,
  );
}
