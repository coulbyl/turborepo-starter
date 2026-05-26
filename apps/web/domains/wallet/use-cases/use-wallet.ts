"use client";

import { clientApiRequest } from "@/lib/api/client-api";
import { useQuery } from "@tanstack/react-query";
import type { WalletHistory } from "../types/wallet";

export function useWalletBalance(workspaceId: string) {
  return useQuery<number>({
    queryKey: ["wallet-balance", workspaceId],
    queryFn: () =>
      clientApiRequest<number>(`/workspaces/${workspaceId}/wallet`),
    enabled: !!workspaceId,
    staleTime: 30_000,
  });
}

export function useWalletHistory(workspaceId: string, page = 1) {
  return useQuery<WalletHistory>({
    queryKey: ["wallet-history", workspaceId, page],
    queryFn: () =>
      clientApiRequest<WalletHistory>(
        `/workspaces/${workspaceId}/wallet/history?page=${page}`,
      ),
    enabled: !!workspaceId,
  });
}
