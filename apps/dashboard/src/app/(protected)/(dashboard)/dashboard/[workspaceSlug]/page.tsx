import { redirect, RedirectType } from "next/navigation";

export default async function WorkspaceHomePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  return redirect(`/dashboard/${workspaceSlug}/agents`, RedirectType.replace);
}
