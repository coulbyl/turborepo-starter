"use client";

import { clientApiRequest } from "@/lib/api/client-api";
import type { CreateWorkspaceInput, Workspace } from "../types/workspace";

export async function createWorkspace(
  input: CreateWorkspaceInput,
): Promise<Workspace> {
  return clientApiRequest<Workspace>("/workspaces", {
    method: "POST",
    body: input,
  });
}
