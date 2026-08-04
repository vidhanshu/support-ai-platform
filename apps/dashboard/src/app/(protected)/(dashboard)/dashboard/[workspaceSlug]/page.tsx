import { PlaceholderPage } from "@/components/common/placeholder-page";

export default async function WorkspaceHomePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  return (
    <PlaceholderPage
      title="Agents"
      description={`Workspace “${workspaceSlug}” — agent list placeholder.`}
    />
  );
}
