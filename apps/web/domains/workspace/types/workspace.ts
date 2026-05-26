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

export type MemberRole =
  | "ADMIN"
  | "AGENT"
  | "REVIEWER"
  | "COMPLIANCE"
  | "DEVELOPER";

export const MEMBER_ROLE_LABEL: Record<MemberRole, string> = {
  ADMIN: "Administrateur",
  AGENT: "Agent",
  REVIEWER: "Réviseur",
  COMPLIANCE: "Conformité",
  DEVELOPER: "Développeur",
};

export type Member = {
  id: string;
  role: MemberRole;
  createdAt: string;
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
};

export type CreateWorkspaceInput = {
  name: string;
  slug: string;
  welcomeMessage?: string;
};
