import { CaseStatus, VerifStatus } from '@identis/db';
import type { SmileWebhookPayload } from './interfaces/verification-provider.interface';
import { RESULT_CODE } from './smile-id.constants';

export type VerificationWebhookState = {
  verifStatus: VerifStatus;
  caseStatus: CaseStatus;
  livenessScore: number | null;
  documentValid: boolean | null;
  faceMatch: boolean | null;
  amlMatch: boolean | null;
  duplicateFound: boolean | null;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function clampScore(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function resolveCheckStatus(value: string | undefined): boolean | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === 'passed' || normalized === 'verified') return true;
  if (
    normalized === 'failed' ||
    normalized === 'not verified' ||
    normalized === 'rejected'
  ) {
    return false;
  }
  return null;
}

export function mapWebhookToVerificationState(
  payload: SmileWebhookPayload,
): VerificationWebhookState {
  if (!payload.job_complete) {
    return {
      verifStatus: VerifStatus.PENDING,
      caseStatus: CaseStatus.PENDING,
      livenessScore: null,
      documentValid: null,
      faceMatch: null,
      amlMatch: null,
      duplicateFound: null,
    };
  }

  const result = payload.result;
  const actions = result?.Actions;

  const livenessScore = isFiniteNumber(result?.Scores?.Liveness)
    ? clampScore(result.Scores.Liveness)
    : actions?.Liveness_Check === 'Passed'
      ? 0.98
      : actions?.Liveness_Check === 'Failed'
        ? 0.22
        : null;

  const faceMatch = isFiniteNumber(result?.Scores?.FaceMatch)
    ? result.Scores.FaceMatch >= 0.7
    : resolveCheckStatus(actions?.Selfie_To_ID_Card_Compare);

  const documentValid =
    typeof result?.Document?.valid === 'boolean'
      ? result.Document.valid
      : (resolveCheckStatus(actions?.Verify_ID_Number) ??
        resolveCheckStatus(actions?.Document_Authenticity) ??
        null);

  const amlMatch =
    typeof result?.AML?.match === 'boolean'
      ? result.AML.match
      : actions?.AML_CHECK === 'Failed'
        ? true
        : actions?.AML_CHECK === 'Passed'
          ? false
          : null;

  const duplicateFound =
    typeof result?.Duplicate?.found === 'boolean'
      ? result.Duplicate.found
      : actions?.Human_Review_Compare === 'Duplicate Found'
        ? true
        : null;

  const code = result?.ResultCode ?? '';

  if (code === RESULT_CODE.PROVISIONAL) {
    return {
      verifStatus: VerifStatus.PENDING,
      caseStatus: CaseStatus.IN_REVIEW,
      livenessScore,
      documentValid,
      faceMatch,
      amlMatch,
      duplicateFound,
    };
  }

  if (code === RESULT_CODE.PASS || code === RESULT_CODE.ID_VERIFIED) {
    return {
      verifStatus: VerifStatus.APPROVED,
      caseStatus: CaseStatus.IN_REVIEW,
      livenessScore,
      documentValid,
      faceMatch,
      amlMatch,
      duplicateFound,
    };
  }

  return {
    verifStatus: VerifStatus.REJECTED,
    caseStatus: CaseStatus.REJECTED,
    livenessScore,
    documentValid,
    faceMatch,
    amlMatch,
    duplicateFound,
  };
}
