"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Workspace } from "../types/workspace";

type CurrentWorkspaceContextValue = {
  workspace: Workspace;
};

const CurrentWorkspaceContext =
  createContext<CurrentWorkspaceContextValue | null>(null);

export function CurrentWorkspaceProvider({
  workspace,
  children,
}: {
  workspace: Workspace;
  children: ReactNode;
}) {
  return (
    <CurrentWorkspaceContext.Provider value={{ workspace }}>
      {children}
    </CurrentWorkspaceContext.Provider>
  );
}

export function useCurrentWorkspace(): Workspace {
  const ctx = useContext(CurrentWorkspaceContext);
  if (!ctx) {
    throw new Error(
      "useCurrentWorkspace must be used inside CurrentWorkspaceProvider",
    );
  }
  return ctx.workspace;
}
