"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useWorkspaces } from "@/hooks/api/use-workspaces";
import { clearWorkspaceId, setWorkspaceId } from "@/lib/auth/tokens";
import type { Workspace } from "@/lib/api";

/**
 * Resolves the active workspace from the URL slug + workspaces list,
 * and keeps localStorage in sync for the Axios `x-workspace-id` header.
 *
 * Important: queries that need a workspace must use `isReady` / `workspaceId`
 * from this hook — do not read `getWorkspaceId()` alone (it is not reactive
 * and can be cleared while workspaces are still loading).
 */
export function useActiveWorkspace() {
  const params = useParams<{ workspaceSlug?: string }>();
  const workspaceSlug =
    typeof params.workspaceSlug === "string" ? params.workspaceSlug : undefined;

  const workspacesQuery = useWorkspaces();

  const workspace = useMemo((): Workspace | null => {
    if (!workspaceSlug || !workspacesQuery.data?.length) return null;
    return (
      workspacesQuery.data.find((item) => item.slug === workspaceSlug) ?? null
    );
  }, [workspaceSlug, workspacesQuery.data]);

  const workspaceId = workspace?.id ?? null;

  // Sync before paint / before workspace-scoped queries' effects run.
  useLayoutEffect(() => {
    if (workspaceId) {
      setWorkspaceId(workspaceId);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceSlug) return;
    // Wait until the list has loaded before treating a missing slug as invalid.
    if (workspacesQuery.isPending) return;
    if (workspaceId) return;
    if (workspacesQuery.isSuccess) {
      clearWorkspaceId();
    }
  }, [
    workspaceSlug,
    workspaceId,
    workspacesQuery.isPending,
    workspacesQuery.isSuccess,
  ]);

  return {
    workspace,
    workspaceId,
    workspaceSlug,
    /** True when slug is present and mapped to a workspace id. */
    isReady: Boolean(workspaceId),
    isLoading: Boolean(workspaceSlug) && workspacesQuery.isPending,
    isError: workspacesQuery.isError,
    workspaces: workspacesQuery.data ?? [],
  };
}
