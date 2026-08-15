/**
 * Central query-key factory. Keep domain keys nested so invalidation stays precise.
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all })
 * queryClient.invalidateQueries({ queryKey: queryKeys.agents.list(workspaceId) })
 */
export const queryKeys = {
  health: ["health"] as const,

  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },

  workspaces: {
    all: ["workspaces"] as const,
    list: () => [...queryKeys.workspaces.all, "list"] as const,
    detail: (id: string) => [...queryKeys.workspaces.all, "detail", id] as const,
  },

  members: {
    all: (workspaceId: string) => ["members", workspaceId] as const,
    list: (workspaceId: string) =>
      [...queryKeys.members.all(workspaceId), "list"] as const,
  },

  invitations: {
    all: (workspaceId: string) => ["invitations", workspaceId] as const,
    list: (workspaceId: string) =>
      [...queryKeys.invitations.all(workspaceId), "list"] as const,
  },

  agents: {
    all: (workspaceId: string) => ["agents", workspaceId] as const,
    list: (workspaceId: string) =>
      [...queryKeys.agents.all(workspaceId), "list"] as const,
    detail: (workspaceId: string, id: string) =>
      [...queryKeys.agents.all(workspaceId), "detail", id] as const,
    apiKeys: (workspaceId: string, agentId: string) =>
      [...queryKeys.agents.all(workspaceId), "api-keys", agentId] as const,
  },

  knowledge: {
    all: (workspaceId: string) => ["knowledge", workspaceId] as const,
    list: (workspaceId: string) =>
      [...queryKeys.knowledge.all(workspaceId), "list"] as const,
    detail: (workspaceId: string, id: string) =>
      [...queryKeys.knowledge.all(workspaceId), "detail", id] as const,
  },

  documents: {
    all: (workspaceId: string) => ["documents", workspaceId] as const,
    list: (workspaceId: string) =>
      [...queryKeys.documents.all(workspaceId), "list"] as const,
  },

  conversations: {
    all: (workspaceId: string) => ["conversations", workspaceId] as const,
    listByAgent: (workspaceId: string, agentId: string) =>
      [
        ...queryKeys.conversations.all(workspaceId),
        "list",
        agentId,
      ] as const,
    detail: (workspaceId: string, id: string) =>
      [...queryKeys.conversations.all(workspaceId), "detail", id] as const,
  },

  billing: {
    all: (workspaceId: string) => ["billing", workspaceId] as const,
    status: (workspaceId: string) =>
      [...queryKeys.billing.all(workspaceId), "status"] as const,
  },
} as const;
