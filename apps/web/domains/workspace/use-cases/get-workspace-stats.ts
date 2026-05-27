import { serverApiRequest } from "@/lib/api/server-api";
import type { Case } from "@/domains/case/types/case";

export type WorkspaceStats = {
  totalCases: number;
  casesThisMonth: number;
  pendingCases: number;
  approvalRate: number | null;
  walletBalance: number;
  recentCases: Pick<
    Case,
    "id" | "reference" | "status" | "formData" | "createdAt" | "verification"
  >[];
};

export async function getWorkspaceStats(
  workspaceId: string,
): Promise<WorkspaceStats> {
  return serverApiRequest<WorkspaceStats>(
    `/workspaces/${workspaceId}/cases/stats`,
  );
}
