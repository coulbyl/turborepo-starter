export type BasicKycInput = {
  idNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  country?: string;
};

export type DocumentVerificationInput = {
  documentFrontBase64: string;
  documentBackBase64?: string;
  selfieBase64: string;
  country: string;
  idType: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENSE';
};

export type AmlCheckInput = {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  country?: string;
};

export type DetectDuplicateInput = {
  selfieBase64: string;
  workspaceId: string;
};

export type KycResult = {
  jobId: string;
  status: 'APPROVED' | 'REJECTED' | 'UNKNOWN';
  documentValid: boolean;
  rawResult: Record<string, unknown>;
};

export type DocumentResult = {
  jobId: string;
  status: 'APPROVED' | 'REJECTED' | 'UNKNOWN';
  documentValid: boolean;
  livenessScore: number;
  faceMatch: boolean;
  cniPhotoKey?: string; // R2 storage key
  selfiePhotoKey?: string;
  rawResult: Record<string, unknown>;
};

export type AmlResult = {
  match: boolean;
  matchedLists: string[];
  rawResult: Record<string, unknown>;
};

export type DuplicateResult = {
  duplicateFound: boolean;
  matchedCaseId?: string;
  rawResult: Record<string, unknown>;
};

export const VERIFICATION_PROVIDER = Symbol('VERIFICATION_PROVIDER');

export interface IVerificationProvider {
  basicKyc(input: BasicKycInput): Promise<KycResult>;
  verifyDocument(input: DocumentVerificationInput): Promise<DocumentResult>;
  checkAml(input: AmlCheckInput): Promise<AmlResult>;
  detectDuplicate(input: DetectDuplicateInput): Promise<DuplicateResult>;
}
