import { serverApiRequest } from "@/lib/api/server-api";
import type { Member } from "../types/workspace";

export async function getMembers(workspaceId: string): Promise<Member[]> {
  return serverApiRequest<Member[]>(`/workspaces/${workspaceId}/members`);
}
