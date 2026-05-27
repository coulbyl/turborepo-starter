import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createLogger } from '@utils/logger';
import type {
  IVerificationProvider,
  DocumentVerificationInput,
  EnhancedKycInput,
  EnhancedKycResult,
  AmlCheckInput,
  AmlResult,
  DetectDuplicateInput,
  DuplicateResult,
  SmileWebhookPayload,
  SubmittedJobResult,
} from '../interfaces/verification-provider.interface';
import { resolveJobType } from '../smile-id.constants';

const logger = createLogger('fake-verification-provider');

type FakeScenario =
  | 'clean-pass'
  | 'review-authority-unavailable'
  | 'face-mismatch'
  | 'expired-document'
  | 'aml-hit'
  | 'duplicate-hit'
  | 'data-mismatch';

const SCENARIOS: FakeScenario[] = [
  'clean-pass',
  'review-authority-unavailable',
  'face-mismatch',
  'expired-document',
  'aml-hit',
  'duplicate-hit',
  'data-mismatch',
];

type ScenarioArtifacts = {
  scenario: FakeScenario;
  verifiedFirstName: string;
  verifiedLastName: string;
  verifiedDateOfBirth?: string;
  verifiedIdNumber?: string;
  expirationDate: string;
  jobSuccess: boolean;
  resultCode: string;
  resultText: string;
  actions: NonNullable<NonNullable<SmileWebhookPayload['result']>['Actions']>;
  scores: NonNullable<NonNullable<SmileWebhookPayload['result']>['Scores']>;
  document: NonNullable<NonNullable<SmileWebhookPayload['result']>['Document']>;
  aml: NonNullable<NonNullable<SmileWebhookPayload['result']>['AML']>;
  duplicate: NonNullable<
    NonNullable<SmileWebhookPayload['result']>['Duplicate']
  >;
  flags: string[];
  failureReasons: string[];
  warnings: string[];
};

@Injectable()
export class FakeVerificationProvider implements IVerificationProvider {
  private readonly configuredScenario: string;

  constructor(config: ConfigService) {
    this.configuredScenario = config.get<string>(
      'FAKE_PROVIDER_SCENARIO',
      'random',
    );
    logger.warn(
      { scenario: this.configuredScenario },
      'FakeVerificationProvider active — do not use in production',
    );
  }

  verifyDocument(
    input: DocumentVerificationInput,
  ): Promise<SubmittedJobResult> {
    const smileJobId = `fake-${randomUUID()}`;
    const { jobType, authorityVerified } = resolveJobType(
      input.country,
      input.idType,
    );
    const scenario = this.resolveScenario(input);

    logger.info(
      { smileJobId, caseId: input.caseId, scenario },
      'Fake submission — webhook scheduled',
    );

    setTimeout(() => {
      void this.postWebhook(smileJobId, input, {
        scenario,
        jobType,
        authorityVerified,
      });
    }, 1800);

    return Promise.resolve({ smileJobId, jobType, authorityVerified });
  }

  enhancedKyc(input: EnhancedKycInput): Promise<EnhancedKycResult> {
    return Promise.resolve({
      smileJobId: `fake-${randomUUID()}`,
      verified: true,
      fullName:
        [input.firstName, input.lastName].filter(Boolean).join(' ') ||
        'Fake User',
      dateOfBirth: input.dateOfBirth,
      expirationDate: this.futureDate(4),
      rawResult: {
        fake: true,
        provider: 'fake-smile',
        result: {
          FullName:
            [input.firstName, input.lastName].filter(Boolean).join(' ') ||
            'Fake User',
          DOB: input.dateOfBirth,
          ExpirationDate: this.futureDate(4),
          IDNumber: input.idNumber,
          Country: input.country,
          IDType: input.idType,
        },
      },
    });
  }

  checkAml(input: AmlCheckInput): Promise<AmlResult> {
    const amlHit = this.hasScenarioHint(
      `${input.firstName} ${input.lastName}`,
      'AML',
    );
    return Promise.resolve({
      match: amlHit,
      matchedLists: amlHit ? ['OFAC', 'PEP'] : [],
      rawResult: {
        fake: true,
        matchedLists: amlHit ? ['OFAC', 'PEP'] : [],
      },
    });
  }

  detectDuplicate(input: DetectDuplicateInput): Promise<DuplicateResult> {
    const duplicateFound = this.hasScenarioHint(input.workspaceId, 'DUPE');
    return Promise.resolve({
      duplicateFound,
      matchedCaseId: duplicateFound ? 'CASE-2026-0003' : undefined,
      rawResult: {
        fake: true,
        score: duplicateFound ? 0.93 : 0.08,
      },
    });
  }

  verifyWebhookSignature(_timestamp: string, _signature: string): boolean {
    return true;
  }

  private resolveScenario(input: DocumentVerificationInput): FakeScenario {
    if (SCENARIOS.includes(this.configuredScenario as FakeScenario)) {
      return this.configuredScenario as FakeScenario;
    }

    const hint = `${input.idNumber ?? ''} ${input.jobRef}`.toUpperCase();
    if (hint.includes('AML')) return 'aml-hit';
    if (hint.includes('DUPE')) return 'duplicate-hit';
    if (hint.includes('EXPIRE')) return 'expired-document';
    if (hint.includes('MISMATCH')) return 'data-mismatch';
    if (hint.includes('REVIEW')) return 'review-authority-unavailable';
    if (hint.includes('FACE') || hint.includes('REJECT'))
      return 'face-mismatch';

    const hash = this.simpleHash(
      `${input.caseId}:${input.country}:${input.idType}:${input.idNumber ?? ''}`,
    );
    const weightedPool: FakeScenario[] = [
      'clean-pass',
      'clean-pass',
      'clean-pass',
      'review-authority-unavailable',
      'aml-hit',
      'duplicate-hit',
      'data-mismatch',
      'expired-document',
      'face-mismatch',
    ];
    return weightedPool[hash % weightedPool.length] ?? 'clean-pass';
  }

  private async postWebhook(
    smileJobId: string,
    input: DocumentVerificationInput,
    options: {
      scenario: FakeScenario;
      jobType: number;
      authorityVerified: boolean;
    },
  ): Promise<void> {
    if (!input.callbackUrl) {
      logger.warn(
        { smileJobId },
        'No callbackUrl configured — skipping fake webhook',
      );
      return;
    }

    const simulated = this.buildScenarioArtifacts(input, options.scenario);
    const timestamp = new Date().toISOString();
    const fullName = `${simulated.verifiedFirstName} ${simulated.verifiedLastName}`;

    const payload: SmileWebhookPayload = {
      job_complete: true,
      job_success: simulated.jobSuccess,
      smile_job_id: smileJobId,
      timestamp,
      signature: 'fake-signature',
      result: {
        ResultCode: simulated.resultCode,
        ResultText: simulated.resultText,
        SmileJobID: smileJobId,
        Actions: simulated.actions,
        FullName: fullName,
        DOB: simulated.verifiedDateOfBirth,
        ExpirationDate: simulated.expirationDate,
        IDNumber: simulated.verifiedIdNumber,
        Country: input.country,
        IDType: input.idType,
        Scores: simulated.scores,
        ExtractedData: {
          fullName,
          firstName: simulated.verifiedFirstName,
          lastName: simulated.verifiedLastName,
          dateOfBirth: simulated.verifiedDateOfBirth,
          idNumber: simulated.verifiedIdNumber,
          country: input.country,
          idType: input.idType,
          expirationDate: simulated.expirationDate,
          nationality: this.countryToNationality(input.country),
        },
        Document: simulated.document,
        AML: simulated.aml,
        Duplicate: simulated.duplicate,
        Flags: simulated.flags,
        FailureReasons: simulated.failureReasons,
        Warnings: simulated.warnings,
        Provider: {
          name: 'fake-smile',
          mode: 'sandbox',
          scenario: options.scenario,
          authorityVerified: options.authorityVerified,
          jobType: options.jobType,
        },
      },
    };

    try {
      const res = await fetch(input.callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      logger.info(
        { smileJobId, status: res.status, scenario: options.scenario },
        'Fake webhook delivered',
      );
    } catch (err) {
      logger.error(
        { smileJobId, callbackUrl: input.callbackUrl, err },
        'Fake webhook delivery failed',
      );
    }
  }

  private buildScenarioArtifacts(
    input: DocumentVerificationInput,
    scenario: FakeScenario,
  ): ScenarioArtifacts {
    const verifiedFirstName = this.titleize(input.firstName || 'Pian');
    const verifiedLastName = this.titleize(input.lastName || 'Nan');
    const verifiedDateOfBirth =
      input.dateOfBirth || this.defaultDateOfBirth(input.idNumber);
    const verifiedIdNumber =
      input.idNumber || `ID-${this.simpleHash(input.caseId)}`;
    const baseExpirationDate = this.futureDate(5);

    switch (scenario) {
      case 'review-authority-unavailable':
        return {
          scenario,
          verifiedFirstName,
          verifiedLastName,
          verifiedDateOfBirth,
          verifiedIdNumber,
          expirationDate: baseExpirationDate,
          jobSuccess: true,
          resultCode: '0811',
          resultText: 'Contrôle manuel requis avant décision',
          actions: {
            Liveness_Check: 'Passed',
            Selfie_To_ID_Card_Compare: 'Passed',
            Verify_ID_Number: 'Under Review',
            Return_Personal_Info: 'Returned',
            AML_CHECK: 'Passed',
            Human_Review_Compare: 'Requested',
            Document_Authenticity: 'Passed',
            Expiration_Check: 'Passed',
          },
          scores: { Liveness: 0.96, FaceMatch: 0.9, Overall: 0.84 },
          document: {
            valid: true,
            reason: 'Autorité indisponible - confirmation différée',
            expiryStatus: 'VALID',
            issuingCountry: input.country,
          },
          aml: {
            match: false,
            matchedLists: [],
            summary: 'Aucune correspondance sur les listes de sanctions',
          },
          duplicate: { found: false, score: 0.07 },
          flags: ['AUTHORITY_CHECK_DELAYED'],
          failureReasons: [],
          warnings: [
            "La source officielle n'a pas répondu dans le délai attendu",
          ],
        };
      case 'face-mismatch':
        return {
          scenario,
          verifiedFirstName,
          verifiedLastName,
          verifiedDateOfBirth,
          verifiedIdNumber,
          expirationDate: baseExpirationDate,
          jobSuccess: false,
          resultCode: '0812',
          resultText: 'Rejeté: le visage ne correspond pas au document',
          actions: {
            Liveness_Check: 'Passed',
            Selfie_To_ID_Card_Compare: 'Failed',
            Verify_ID_Number: 'Verified',
            Return_Personal_Info: 'Returned',
            AML_CHECK: 'Passed',
            Human_Review_Compare: 'Failed',
            Document_Authenticity: 'Passed',
            Expiration_Check: 'Passed',
          },
          scores: { Liveness: 0.94, FaceMatch: 0.31, Overall: 0.41 },
          document: {
            valid: true,
            reason: 'Document authentique mais selfie incohérent',
            expiryStatus: 'VALID',
            issuingCountry: input.country,
          },
          aml: {
            match: false,
            matchedLists: [],
            summary: 'Aucune correspondance sur les listes de sanctions',
          },
          duplicate: { found: false, score: 0.09 },
          flags: ['FACE_MISMATCH'],
          failureReasons: [
            'Le selfie ne correspond pas au portrait du document',
          ],
          warnings: [],
        };
      case 'expired-document':
        return {
          scenario,
          verifiedFirstName,
          verifiedLastName,
          verifiedDateOfBirth,
          verifiedIdNumber,
          expirationDate: this.pastDate(1),
          jobSuccess: false,
          resultCode: '0812',
          resultText: 'Rejeté: document expiré',
          actions: {
            Liveness_Check: 'Passed',
            Selfie_To_ID_Card_Compare: 'Passed',
            Verify_ID_Number: 'Verified',
            Return_Personal_Info: 'Returned',
            AML_CHECK: 'Passed',
            Human_Review_Compare: 'Passed',
            Document_Authenticity: 'Passed',
            Expiration_Check: 'Failed',
          },
          scores: { Liveness: 0.95, FaceMatch: 0.88, Overall: 0.49 },
          document: {
            valid: false,
            reason: 'Document expiré',
            expiryStatus: 'EXPIRED',
            issuingCountry: input.country,
          },
          aml: {
            match: false,
            matchedLists: [],
            summary: 'Aucune correspondance sur les listes de sanctions',
          },
          duplicate: { found: false, score: 0.05 },
          flags: ['DOCUMENT_EXPIRED'],
          failureReasons: ['La date d’expiration du document est dépassée'],
          warnings: [],
        };
      case 'aml-hit':
        return {
          scenario,
          verifiedFirstName,
          verifiedLastName,
          verifiedDateOfBirth,
          verifiedIdNumber,
          expirationDate: baseExpirationDate,
          jobSuccess: true,
          resultCode: '0810',
          resultText: 'Accepté avec points de vigilance',
          actions: {
            Liveness_Check: 'Passed',
            Selfie_To_ID_Card_Compare: 'Passed',
            Verify_ID_Number: 'Verified',
            Return_Personal_Info: 'Returned',
            AML_CHECK: 'Failed',
            Human_Review_Compare: 'Passed',
            Document_Authenticity: 'Passed',
            Expiration_Check: 'Passed',
          },
          scores: { Liveness: 0.97, FaceMatch: 0.92, Overall: 0.78 },
          document: {
            valid: true,
            reason: 'Document valide',
            expiryStatus: 'VALID',
            issuingCountry: input.country,
          },
          aml: {
            match: true,
            matchedLists: ['OFAC', 'PEP'],
            summary: 'Nom proche d’une personne exposée politiquement',
          },
          duplicate: { found: false, score: 0.1 },
          flags: ['AML_HIT', 'REQUIRES_COMPLIANCE_REVIEW'],
          failureReasons: [],
          warnings: ['Correspondance AML à confirmer manuellement'],
        };
      case 'duplicate-hit':
        return {
          scenario,
          verifiedFirstName,
          verifiedLastName,
          verifiedDateOfBirth,
          verifiedIdNumber,
          expirationDate: baseExpirationDate,
          jobSuccess: true,
          resultCode: '0810',
          resultText: 'Accepté avec suspicion de doublon biométrique',
          actions: {
            Liveness_Check: 'Passed',
            Selfie_To_ID_Card_Compare: 'Passed',
            Verify_ID_Number: 'Verified',
            Return_Personal_Info: 'Returned',
            AML_CHECK: 'Passed',
            Human_Review_Compare: 'Duplicate Found',
            Document_Authenticity: 'Passed',
            Expiration_Check: 'Passed',
          },
          scores: {
            Liveness: 0.98,
            FaceMatch: 0.9,
            Overall: 0.8,
            Duplicate: 0.93,
          },
          document: {
            valid: true,
            reason: 'Document valide',
            expiryStatus: 'VALID',
            issuingCountry: input.country,
          },
          aml: {
            match: false,
            matchedLists: [],
            summary: 'Aucune correspondance sur les listes de sanctions',
          },
          duplicate: {
            found: true,
            matchedCaseId: 'CASE-2026-0003',
            score: 0.93,
          },
          flags: ['POSSIBLE_DUPLICATE'],
          failureReasons: [],
          warnings: ['Un selfie très proche existe déjà dans le workspace'],
        };
      case 'data-mismatch':
        return {
          scenario,
          verifiedFirstName,
          verifiedLastName: `${verifiedLastName}h`,
          verifiedDateOfBirth,
          verifiedIdNumber: `${verifiedIdNumber}-A`,
          expirationDate: baseExpirationDate,
          jobSuccess: true,
          resultCode: '0810',
          resultText: 'Accepté avec écart entre la saisie et le document',
          actions: {
            Liveness_Check: 'Passed',
            Selfie_To_ID_Card_Compare: 'Passed',
            Verify_ID_Number: 'Verified',
            Return_Personal_Info: 'Returned',
            AML_CHECK: 'Passed',
            Human_Review_Compare: 'Passed',
            Document_Authenticity: 'Passed',
            Expiration_Check: 'Passed',
          },
          scores: { Liveness: 0.96, FaceMatch: 0.86, Overall: 0.75 },
          document: {
            valid: true,
            reason: 'Document valide',
            expiryStatus: 'VALID',
            issuingCountry: input.country,
          },
          aml: {
            match: false,
            matchedLists: [],
            summary: 'Aucune correspondance sur les listes de sanctions',
          },
          duplicate: { found: false, score: 0.05 },
          flags: ['DECLARED_DATA_MISMATCH'],
          failureReasons: [],
          warnings: [
            'Certaines données saisies diffèrent des informations extraites du document',
          ],
        };
      case 'clean-pass':
      default:
        return {
          scenario: 'clean-pass',
          verifiedFirstName,
          verifiedLastName,
          verifiedDateOfBirth,
          verifiedIdNumber,
          expirationDate: baseExpirationDate,
          jobSuccess: true,
          resultCode: '0810',
          resultText: 'Accepté',
          actions: {
            Liveness_Check: 'Passed',
            Selfie_To_ID_Card_Compare: 'Passed',
            Verify_ID_Number: 'Verified',
            Return_Personal_Info: 'Returned',
            AML_CHECK: 'Passed',
            Human_Review_Compare: 'Passed',
            Document_Authenticity: 'Passed',
            Expiration_Check: 'Passed',
          },
          scores: { Liveness: 0.98, FaceMatch: 0.94, Overall: 0.91 },
          document: {
            valid: true,
            reason: 'Document valide',
            expiryStatus: 'VALID',
            issuingCountry: input.country,
          },
          aml: {
            match: false,
            matchedLists: [],
            summary: 'Aucune correspondance sur les listes de sanctions',
          },
          duplicate: { found: false, score: 0.04 },
          flags: [],
          failureReasons: [],
          warnings: [],
        };
    }
  }

  private titleize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  private simpleHash(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  private futureDate(yearsAhead: number): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + yearsAhead);
    return date.toISOString().slice(0, 10);
  }

  private pastDate(yearsAgo: number): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsAgo);
    return date.toISOString().slice(0, 10);
  }

  private defaultDateOfBirth(idNumber?: string): string | undefined {
    if (idNumber && /\d{8}/.test(idNumber)) {
      const digits = idNumber.replace(/\D/g, '').slice(0, 8);
      const year = Number(digits.slice(0, 4));
      const month = Number(digits.slice(4, 6));
      const day = Number(digits.slice(6, 8));
      if (
        year >= 1940 &&
        year <= 2010 &&
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= 31
      ) {
        return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
      }
    }
    return '1994-08-17';
  }

  private countryToNationality(country: string): string | undefined {
    const map: Record<string, string> = {
      CI: 'Ivoirienne',
      SN: 'Sénégalaise',
      BJ: 'Béninoise',
      BF: 'Burkinabè',
      FR: 'Française',
      CN: 'Chinoise',
    };
    return map[country.toUpperCase()];
  }

  private hasScenarioHint(value: string, hint: string): boolean {
    return value.toUpperCase().includes(hint);
  }
}
