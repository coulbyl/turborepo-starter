// ─────────────────────────────────────────────────────────────────────────────
// Verification provider abstraction — Smile ID is the first implementation.
// Adding a second provider (e.g. Verichap) requires only a new class + swap
// in verification.module.ts, no changes to CaseModule.
// ─────────────────────────────────────────────────────────────────────────────

// ── Inputs ───────────────────────────────────────────────────────────────────

export type DocumentVerificationInput = {
  caseId: string;          // Identis case UUID — used as Smile ID user_id
  jobRef: string;          // Unique submission ref — used as Smile ID job_id
  country: string;         // ISO 3166-1 alpha-2 (CI, SN, FR, US, ...)
  idType: string;          // NATIONAL_ID | PASSPORT | DRIVERS_LICENSE | ...
  idNumber?: string;       // Optional — pre-fills id_info for authority lookup
  selfieBase64: string;
  idFrontBase64: string;
  idBackBase64?: string;
  callbackUrl: string;     // Webhook URL Smile ID will POST results to
};

export type EnhancedKycInput = {
  jobRef: string;
  country: string;
  idType: string;
  idNumber: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;    // 'yyyy-mm-dd'
  phoneNumber?: string;
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

// ── Outputs ──────────────────────────────────────────────────────────────────

export type SubmittedJobResult = {
  smileJobId: string;      // Smile ID global job identifier
  jobType: number;         // JT used: 6 = DocV, 11 = Enhanced DocV
  authorityVerified: boolean; // true only when JT11 was used
};

export type EnhancedKycResult = {
  smileJobId: string;
  verified: boolean;       // ResultCode 1012
  fullName?: string;
  dateOfBirth?: string;
  expirationDate?: string;
  photo?: string;          // base64, 'Not Available' for CI
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

// ── Webhook payload (from Smile ID callback) ─────────────────────────────────

export type SmileWebhookPayload = {
  job_complete: boolean;
  job_success: boolean;
  smile_job_id: string;
  timestamp: string;
  signature: string;
  result?: {
    ResultCode: string;
    ResultText: string;
    SmileJobID?: string;
    Actions?: {
      Liveness_Check?: string;
      Selfie_To_ID_Card_Compare?: string;
      Verify_ID_Number?: string;
      Return_Personal_Info?: string;
      AML_CHECK?: string;
      Human_Review_Compare?: string;
    };
    FullName?: string;
    DOB?: string;
    ExpirationDate?: string;
    IDNumber?: string;
    Country?: string;
    IDType?: string;
    Photo?: string;
  };
};

// ── Interface ─────────────────────────────────────────────────────────────────

export const VERIFICATION_PROVIDER = Symbol('VERIFICATION_PROVIDER');

export interface IVerificationProvider {
  /**
   * Submit a document verification job (async — result via webhook).
   * Selects JT11 (Enhanced DocV + authority) or JT6 (DocV only) based on
   * country + idType support matrix.
   */
  verifyDocument(input: DocumentVerificationInput): Promise<SubmittedJobResult>;

  /**
   * Synchronous text-only ID authority lookup (no images).
   * Used to pre-validate an ID number before photo upload.
   */
  enhancedKyc(input: EnhancedKycInput): Promise<EnhancedKycResult>;

  /**
   * AML screening — activated at partner account level.
   * Returns match status against sanctions/PEP lists.
   */
  checkAml(input: AmlCheckInput): Promise<AmlResult>;

  /**
   * Smile Secure face deduplication — activated at partner account level.
   */
  detectDuplicate(input: DetectDuplicateInput): Promise<DuplicateResult>;

  /**
   * Verify the HMAC-SHA256 signature on every incoming Smile ID webhook.
   * Must be called before processing any webhook payload.
   */
  verifyWebhookSignature(timestamp: string, signature: string): boolean;
}
