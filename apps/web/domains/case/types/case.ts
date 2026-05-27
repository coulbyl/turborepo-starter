export type CaseStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "FAILED";
export type VerifStatus = "PENDING" | "APPROVED" | "REJECTED" | "UNKNOWN";

export type VerificationActions = {
  Liveness_Check?: string;
  Selfie_To_ID_Card_Compare?: string;
  Verify_ID_Number?: string;
  Return_Personal_Info?: string;
  AML_CHECK?: string;
  Human_Review_Compare?: string;
  Document_Authenticity?: string;
  Expiration_Check?: string;
};

export type VerificationScores = {
  Liveness?: number;
  FaceMatch?: number;
  Overall?: number;
  Duplicate?: number;
};

export type VerificationExtractedData = {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  idNumber?: string;
  country?: string;
  idType?: string;
  expirationDate?: string;
  nationality?: string;
  sex?: string;
};

export type VerificationDocument = {
  valid?: boolean;
  reason?: string;
  expiryStatus?: string;
  issuingCountry?: string;
};

export type VerificationAml = {
  match?: boolean;
  matchedLists?: string[];
  summary?: string;
};

export type VerificationDuplicate = {
  found?: boolean;
  matchedCaseId?: string;
  score?: number;
};

export type VerificationProvider = {
  name?: string;
  mode?: string;
  scenario?: string;
  authorityVerified?: boolean;
  jobType?: number;
};

export type VerificationResultPayload = {
  ResultCode?: string;
  ResultText?: string;
  SmileJobID?: string;
  FullName?: string;
  DOB?: string;
  ExpirationDate?: string;
  IDNumber?: string;
  Country?: string;
  IDType?: string;
  Photo?: string;
  Actions?: VerificationActions;
  Scores?: VerificationScores;
  ExtractedData?: VerificationExtractedData;
  Document?: VerificationDocument;
  AML?: VerificationAml;
  Duplicate?: VerificationDuplicate;
  Flags?: string[];
  FailureReasons?: string[];
  Warnings?: string[];
  Provider?: VerificationProvider;
};

export type VerificationRawResult = {
  jobType?: number;
  authorityVerified?: boolean;
  submittedAt?: string;
  timestamp?: string;
  job_complete?: boolean;
  job_success?: boolean;
  smile_job_id?: string;
  result?: VerificationResultPayload;
};

export type CaseVerification = {
  status: VerifStatus;
  livenessScore: number | null;
  documentValid: boolean | null;
  faceMatch: boolean | null;
  amlMatch: boolean | null;
  duplicateFound: boolean | null;
  smileJobId?: string;
  product?: string;
  rawResult?: VerificationRawResult;
  cniPhotoUrl?: string | null;
  selfiePhotoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  FAILED: "Échoué",
};

export const STATUS_COLOR: Record<CaseStatus, string> = {
  PENDING: "text-amber-600 bg-amber-50 border-amber-200",
  IN_REVIEW: "text-blue-600 bg-blue-50 border-blue-200",
  APPROVED: "text-emerald-600 bg-emerald-50 border-emerald-200",
  REJECTED: "text-red-600 bg-red-50 border-red-200",
  EXPIRED: "text-muted-foreground bg-muted border-border",
  FAILED: "text-red-700 bg-red-50 border-red-300",
};
