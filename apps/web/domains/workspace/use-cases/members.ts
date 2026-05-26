"use client";

import { clientApiRequest } from "@/lib/api/client-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Member, MemberRole } from "../types/workspace";

export function useInviteMember(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role: MemberRole }) =>
      clientApiRequest<Member>(`/workspaces/${workspaceId}/members`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", workspaceId] }),
  });
}

export function useUpdateMemberRole(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: MemberRole }) =>
      clientApiRequest<Member>(
        `/workspaces/${workspaceId}/members/${memberId}`,
        { method: "PATCH", body: JSON.stringify({ role }) },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", workspaceId] }),
  });
}

export function useRemoveMember(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      clientApiRequest(`/workspaces/${workspaceId}/members/${memberId}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", workspaceId] }),
  });
}
