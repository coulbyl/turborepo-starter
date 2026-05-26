export type Workspace = {
  id: string;
  name: string;
  slug: string;
  deploymentType: "CLOUD" | "DEDICATED";
  logoUrl: string | null;
  primaryColor: string | null;
  welcomeMessage: string | null;
  walletBalance: number;
  createdAt: string;
  updatedAt: string;
  memberRole?: "ADMIN" | "AGENT" | "REVIEWER" | "COMPLIANCE" | "DEVELOPER";
};

export type CreateWorkspaceInput = {
  name: string;
  slug: string;
  welcomeMessage?: string;
};
