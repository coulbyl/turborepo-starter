"use client";

import { clientApiRequest } from "@/lib/api/client-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteCase(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (caseId: string) =>
      clientApiRequest(`/workspaces/${workspaceId}/cases/${caseId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cases", workspaceId] });
    },
  });
}
