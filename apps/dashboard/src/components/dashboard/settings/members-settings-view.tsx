"use client";

import { useMemo, useState } from "react";
import {
  Crown,
  Headphones,
  MoreHorizontal,
  RefreshCw,
  Shield,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useConfirmDialog } from "@/components/common/confirm-dialog";
import {
  useCancelInvitation,
  useInvitations,
  useMembers,
  useMe,
  useRemoveMember,
  useResendInvitation,
} from "@/hooks/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";
import type {
  WorkspaceInvitation,
  WorkspaceMember,
  WorkspaceRole,
} from "@/lib/api";
import { formatShortDate } from "@/lib/format";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { InviteMembersSheet } from "./invite-members-sheet";

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

type RoleCard = {
  role: WorkspaceRole;
  title: string;
  description: string;
  icon: typeof Crown;
  iconClassName: string;
  permissions: string[];
};

const ROLE_CARDS: RoleCard[] = [
  {
    role: "OWNER",
    title: "Owner",
    description:
      "Full access to all resources and settings, including billing and team management.",
    icon: Crown,
    iconClassName: "bg-amber-100 text-amber-700",
    permissions: ["Everything · Full access"],
  },
  {
    role: "ADMIN",
    title: "Admin",
    description:
      "Manage workspace resources, agents, and members. Cannot delete the workspace or change ownership.",
    icon: Shield,
    iconClassName: "bg-sky-100 text-sky-700",
    permissions: [
      "Agents · Full access",
      "Sources · Full access",
      "Members · Manage",
      "API keys · Full access",
      "Billing · View",
    ],
  },
  {
    role: "MEMBER",
    title: "Member",
    description:
      "Access to core features and resources, but cannot manage team or billing settings.",
    icon: UserRound,
    iconClassName: "bg-blue-100 text-blue-700",
    permissions: [
      "Agents · Full access",
      "Sources · Full access",
      "Chatlogs · Full access",
      "Members · View",
      "Billing · View",
    ],
  },
];

function roleLabel(role: WorkspaceRole | string) {
  return ROLE_LABELS[role as WorkspaceRole] ?? role;
}

export function MembersSettingsView() {
  const { workspace } = useActiveWorkspace();
  const meQuery = useMe();
  const membersQuery = useMembers();
  const invitationsQuery = useInvitations();
  const removeMember = useRemoveMember();
  const resendInvitation = useResendInvitation();
  const cancelInvitation = useCancelInvitation();
  const { confirm, confirmationDialog } = useConfirmDialog();
  const [inviteOpen, setInviteOpen] = useState(false);

  const canManage =
    workspace?.role === "OWNER" || workspace?.role === "ADMIN";
  const members = membersQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];
  const currentUserId = meQuery.data?.id;

  const roleCounts = useMemo(() => {
    const counts: Record<WorkspaceRole, number> = {
      OWNER: 0,
      ADMIN: 0,
      MEMBER: 0,
    };
    for (const member of members) {
      counts[member.role] += 1;
    }
    return counts;
  }, [members]);

  async function handleRemoveMember(member: WorkspaceMember) {
    const confirmed = await confirm({
      title: "Remove member?",
      description: `Remove ${member.user.email} from this workspace?`,
      confirmLabel: "Remove",
      loadingLabel: "Removing…",
      variant: "destructive",
      action: async () => {
        await removeMember.mutateAsync(member.id);
      },
    });
    if (confirmed) toastSuccess("Member removed");
  }

  async function handleCancelInvite(invitation: WorkspaceInvitation) {
    const confirmed = await confirm({
      title: "Cancel invitation?",
      description: `Cancel the pending invite for ${invitation.email}?`,
      confirmLabel: "Cancel invite",
      loadingLabel: "Cancelling…",
      variant: "destructive",
      action: async () => {
        await cancelInvitation.mutateAsync(invitation.id);
      },
    });
    if (confirmed) toastSuccess("Invitation cancelled");
  }

  function handleResend(invitation: WorkspaceInvitation) {
    resendInvitation.mutate(invitation.id, {
      onSuccess: () => toastSuccess("Invitation resent"),
      onError: (error) => toastApiError(error, "Unable to resend invitation."),
    });
  }

  const isLoading = membersQuery.isLoading || (canManage && invitationsQuery.isLoading);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Members</h1>

      <section className="rounded-xl border bg-card">
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <h2 className="text-base font-semibold">Manage</h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {members.length}
            {canManage && invitations.length > 0
              ? ` · ${invitations.length} pending`
              : null}
          </span>
        </div>

        <div className="overflow-x-auto border-t">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Member since</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-4 py-4" />
                  </tr>
                ))
              ) : (
                <>
                  {members.map((member) => {
                    const canRemove =
                      canManage &&
                      member.role !== "OWNER" &&
                      member.userId !== currentUserId &&
                      !(
                        member.role === "ADMIN" &&
                        workspace?.role !== "OWNER"
                      );

                    return (
                      <tr
                        key={member.id}
                        className="border-b last:border-0"
                      >
                        <td className="px-6 py-4 font-medium">
                          {member.user.email}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatShortDate(member.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          {roleLabel(member.role)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {canRemove ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button variant="ghost" size="icon-sm" />
                                }
                              >
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Member actions</span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => void handleRemoveMember(member)}
                                >
                                  <Trash2 className="size-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}

                  {canManage
                    ? invitations.map((invitation) => (
                        <tr
                          key={invitation.id}
                          className="border-b last:border-0"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium">
                              {invitation.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Pending invite
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            —
                          </td>
                          <td className="px-6 py-4">
                            {roleLabel(invitation.role)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button variant="ghost" size="icon-sm" />
                                }
                              >
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">
                                  Invitation actions
                                </span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleResend(invitation)}
                                  disabled={resendInvitation.isPending}
                                >
                                  <RefreshCw className="size-4" />
                                  Resend invite
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() =>
                                    void handleCancelInvite(invitation)
                                  }
                                >
                                  <Trash2 className="size-4" />
                                  Cancel invite
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    : null}

                  {!members.length && !invitations.length ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-muted-foreground"
                      >
                        No members yet.
                      </td>
                    </tr>
                  ) : null}
                </>
              )}
            </tbody>
          </table>
        </div>

        {canManage ? (
          <div className="flex justify-end border-t px-6 py-4">
            <Button type="button" onClick={() => setInviteOpen(true)}>
              Invite members
            </Button>
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold">Roles and permissions</h2>

        <div className="space-y-6">
          {ROLE_CARDS.map((card) => {
            const Icon = card.icon;
            const count = roleCounts[card.role];

            return (
              <div key={card.role} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full",
                      card.iconClassName,
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{card.title}</span>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {count} {count === 1 ? "member" : "members"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {card.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="space-y-3 opacity-70">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Headphones className="size-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">Support Associate</span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    Coming soon
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Helpdesk support agent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InviteMembersSheet open={inviteOpen} onOpenChange={setInviteOpen} />
      {confirmationDialog}
    </div>
  );
}
