// ─────────────────────────────────────────────────────────────────────────────
// Smile ID — country / id_type support matrix
//
// JT11_SUPPORT: countries + id_types where Enhanced DocV + authority lookup
//   is available (job_type 11). Provides strongest verification signal.
//
// JT6_SUPPORT: countries + id_types where DocV-only is available
//   (job_type 6 — OCR + face match, no government authority cross-check).
//
// Fallback rules (applied in order):
//   1. country + idType in JT11_SUPPORT → use JT11
//   2. country + idType in JT6_SUPPORT  → use JT6
//   3. idType === 'PASSPORT'            → use JT6 (ICAO MRZ universal)
//   4. otherwise                        → throw UnsupportedDocumentException
//
// Sources: Smile ID portal + docs.usesmileid.com (verified 2026-05)
// Update this map when new country/product activations are confirmed via portal.
// ─────────────────────────────────────────────────────────────────────────────

export const JT11_SUPPORT: Record<string, string[]> = {
  // BCEAO zone
  CI: [
    'NATIONAL_ID',
    'DRIVERS_LICENSE',
    'PASSPORT',
    'HEALTH_INSURANCE_ID',
    'ATTESTATION_CARD',
    'RESIDENT_CARD',
  ],
  SN: ['NATIONAL_ID', 'PASSPORT', 'ECOWAS_ID'],
  BJ: ['NATIONAL_ID', 'RESIDENT_CARD', 'PASSPORT'],
  GH: ['NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'VOTER_ID', 'SSNIT'],
  NG: ['NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'BVN', 'VOTER_ID'],
  KE: ['NATIONAL_ID', 'PASSPORT', 'ALIEN_CARD'],
  ZA: ['NATIONAL_ID', 'PASSPORT'],
  TZ: ['NATIONAL_ID', 'PASSPORT'],
  UG: ['NATIONAL_ID', 'PASSPORT'],
  RW: ['NATIONAL_ID', 'PASSPORT'],
  ET: ['NATIONAL_ID', 'PASSPORT'],
  CM: ['NATIONAL_ID', 'PASSPORT'],
};

export const JT6_SUPPORT: Record<string, string[]> = {
  // Countries with DocV-only (no authority cross-check)
  BF: ['NATIONAL_ID', 'PASSPORT'],
  ML: ['PASSPORT'],
  TG: ['RESIDENT_CARD', 'PASSPORT'],
  MR: ['NATIONAL_ID', 'PASSPORT'],
  NE: ['NATIONAL_ID', 'PASSPORT'],
  GN: ['NATIONAL_ID', 'PASSPORT'],
  // International — passports from non-African countries (ICAO MRZ)
  // Most country passports can be scanned via DocV even if not listed here —
  // the PASSPORT universal fallback in resolveJobType() handles this.
  FR: ['PASSPORT', 'NATIONAL_ID'],
  US: ['PASSPORT', 'DRIVERS_LICENSE'],
  GB: ['PASSPORT'],
  DE: ['PASSPORT', 'NATIONAL_ID'],
  LB: ['PASSPORT', 'NATIONAL_ID'],
  CN: ['PASSPORT'],
  MA: ['NATIONAL_ID', 'PASSPORT'],
  DZ: ['NATIONAL_ID', 'PASSPORT'],
  TN: ['NATIONAL_ID', 'PASSPORT'],
  EG: ['NATIONAL_ID', 'PASSPORT'],
};

// Smile ID job_type constants
export const JOB_TYPE = {
  SMART_SELFIE_REGISTRATION: 4,
  ENHANCED_KYC: 5,
  DOCUMENT_VERIFICATION: 6,
  ENHANCED_DOCUMENT_VERIFICATION: 11,
} as const;

// Smile ID image_type constants
export const IMAGE_TYPE = {
  SELFIE_FILE: 0,
  ID_FRONT_FILE: 1,
  SELFIE_BASE64: 2,
  ID_FRONT_BASE64: 3,
  LIVENESS_FILE: 4,
  ID_BACK_FILE: 5,
  LIVENESS_BASE64: 6,
  ID_BACK_BASE64: 7,
} as const;

// Smile ID result codes
export const RESULT_CODE = {
  PASS: '0810',
  PROVISIONAL: '0811', // manual review needed
  FAIL: '0812',
  ID_VERIFIED: '1012',
  ID_NOT_FOUND: '1013',
} as const;

// Verification costs in FCFA per product
export const VERIFICATION_COST: Record<string, number> = {
  DOC_VERIFY: 1000,
  DOC_VERIFY_AML: 1500,
  SMILE_SECURE: 1800,
  BASIC_KYC: 500,
};

// Welcome credit given to new workspaces (10 free DocV verifications)
export const WELCOME_CREDIT_FCFA = 10_000;

/**
 * Resolve the optimal Smile ID job_type for a given country + id_type.
 * Returns { jobType, authorityVerified }.
 */
export function resolveJobType(
  country: string,
  idType: string,
): { jobType: number; authorityVerified: boolean } {
  const upper = country.toUpperCase();
  const upperType = idType.toUpperCase();

  if (JT11_SUPPORT[upper]?.includes(upperType)) {
    return {
      jobType: JOB_TYPE.ENHANCED_DOCUMENT_VERIFICATION,
      authorityVerified: true,
    };
  }

  if (JT6_SUPPORT[upper]?.includes(upperType)) {
    return {
      jobType: JOB_TYPE.DOCUMENT_VERIFICATION,
      authorityVerified: false,
    };
  }

  // Universal PASSPORT fallback: ICAO MRZ readable on most passports worldwide
  if (upperType === 'PASSPORT') {
    return {
      jobType: JOB_TYPE.DOCUMENT_VERIFICATION,
      authorityVerified: false,
    };
  }

  throw new Error(
    `Document non supporté: ${country}/${idType}. Types supportés: PASSPORT (universel), ` +
      `ou consultez la matrice dans smile-id.constants.ts`,
  );
}
