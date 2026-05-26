export type CaseStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";
export type VerifStatus = "PENDING" | "APPROVED" | "REJECTED" | "UNKNOWN";

export type CaseVerification = {
  status: VerifStatus;
  livenessScore: number | null;
  documentValid: boolean | null;
  faceMatch: boolean | null;
  amlMatch: boolean | null;
  duplicateFound: boolean | null;
};

export type CaseFormData = {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  country: string;
  idType: string;
  idNumber?: string;
};

export type Case = {
  id: string;
  reference: string;
  status: CaseStatus;
  initiatedBy: "AGENT" | "SELF_SERVICE";
  formData: CaseFormData | null;
  createdAt: string;
  updatedAt: string;
  verification: CaseVerification | null;
};

export type CaseDetail = Case & {
  stepHistory: StepHistoryEntry[];
};

export type StepHistoryEntry = {
  id: string;
  action: string;
  comment: string | null;
  createdAt: string;
  actor: { id: string; fullName: string; avatarUrl: string | null } | null;
};

export type CasesPage = {
  items: Case[];
  total: number;
  page: number;
  limit: number;
};

export type CreateCaseInput = {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  country: string;
  idType: string;
  idNumber?: string;
  selfie: File;
  idFront: File;
  idBack?: File;
};

export type CreatedCase = {
  id: string;
  reference: string;
  status: CaseStatus;
  smileJobId: string;
  authorityVerified: boolean;
  createdAt: string;
};

export const STATUS_LABEL: Record<CaseStatus, string> = {
  PENDING: "En attente",
  IN_REVIEW: "En révision",
  APPROVED: "Approuvé",
  REJECTED: "Refusé",
  EXPIRED: "Expiré",
};

export const STATUS_COLOR: Record<CaseStatus, string> = {
  PENDING: "text-amber-600 bg-amber-50 border-amber-200",
  IN_REVIEW: "text-blue-600 bg-blue-50 border-blue-200",
  APPROVED: "text-emerald-600 bg-emerald-50 border-emerald-200",
  REJECTED: "text-red-600 bg-red-50 border-red-200",
  EXPIRED: "text-muted-foreground bg-muted border-border",
};
