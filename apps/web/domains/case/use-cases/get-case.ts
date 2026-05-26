"use client";

import { clientApiRequest } from "@/lib/api/client-api";
import { useQuery } from "@tanstack/react-query";
import type { CaseDetail } from "../types/case";

export function useCase(workspaceId: string, caseId: string) {
  return useQuery<CaseDetail>({
    queryKey: ["case", workspaceId, caseId],
    queryFn: () =>
      clientApiRequest<CaseDetail>(
        `/workspaces/${workspaceId}/cases/${caseId}`,
      ),
    enabled: !!workspaceId && !!caseId,
    refetchInterval: (query) => {
      // Auto-refresh while verification is pending
      const status = query.state.data?.verification?.status;
      return status === "PENDING" ? 5000 : false;
    },
  });
}
