"use client";

import { clientApiRequest } from "@/lib/api/client-api";
import { useQuery } from "@tanstack/react-query";
import type { CaseStatus, CasesPage } from "../types/case";

type CasesQuery = {
  workspaceId: string;
  status?: CaseStatus;
  search?: string;
  page?: number;
  limit?: number;
};

export function useCases(query: CasesQuery) {
  const { workspaceId, ...params } = query;
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set("status", params.status);
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const qs = searchParams.toString();
  const path = `/workspaces/${workspaceId}/cases${qs ? `?${qs}` : ""}`;

  return useQuery<CasesPage>({
    queryKey: ["cases", workspaceId, params],
    queryFn: () => clientApiRequest<CasesPage>(path),
    enabled: !!workspaceId,
  });
}
