import { serverApiRequest } from "@/lib/api/server-api";
import type { Workspace } from "../types/workspace";

export async function getWorkspaces(): Promise<Workspace[]> {
  try {
    return await serverApiRequest<Workspace[]>("/workspaces");
  } catch {
    return [];
  }
}
