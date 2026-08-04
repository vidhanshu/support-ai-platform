"use client";

import { useWorkspaces } from "@/hooks/api";
import { redirect } from "next/navigation";

const page = () => {
  const { data: workspaces, isFetching } = useWorkspaces();

  if (isFetching && !workspaces) return <div>Loading...</div>;
  if (workspaces?.[0]?.slug)
    return redirect(`/dashboard/${workspaces?.[0].slug}`);
  return redirect("/dashboard/create");
};

export default page;
