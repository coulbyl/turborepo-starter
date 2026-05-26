import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebApi, IDApi, Signature } from 'smile-identity-core';
import {
  IMAGE_TYPE,
  JOB_TYPE,
  RESULT_CODE,
  resolveJobType,
} from '../smile-id.constants';
import type {
  AmlCheckInput,
  AmlResult,
  DetectDuplicateInput,
  DocumentVerificationInput,
  DuplicateResult,
  EnhancedKycInput,
  EnhancedKycResult,
  IVerificationProvider,
  SubmittedJobResult,
} from '../interfaces/verification-provider.interface';

@Injectable()
export class SmileIdProvider implements IVerificationProvider {
  private readonly logger = new Logger(SmileIdProvider.name);
  private readonly webApi: WebApi;
  private readonly idApi: IDApi;
  private readonly sig: Signature;

  constructor(private readonly config: ConfigService) {
    const partnerId = this.config.get<string>('SMILE_ID_PARTNER_ID', '');
    const apiKey = this.config.get<string>('SMILE_ID_API_KEY', '');
    const env = this.config.get<string>('SMILE_ID_ENV', '0');
    const callbackUrl = this.config.get<string>('SMILE_ID_CALLBACK_URL', '');

    this.webApi = new WebApi(partnerId, callbackUrl, apiKey, env);
    this.idApi = new IDApi(partnerId, apiKey, env);
    this.sig = new Signature(partnerId, apiKey);

    if (!partnerId || !apiKey) {
      this.logger.warn(
        'SMILE_ID_PARTNER_ID ou SMILE_ID_API_KEY non configuré — les vérifications échoueront',
      );
    }
  }

  /**
   * Submit an async document verification job.
   * Selects JT11 (Enhanced DocV + authority) or JT6 (DocV only) based on
   * country + idType. Falls back to JT6 + PASSPORT for international docs.
   * Result is delivered to callbackUrl (webhook).
   */
  async verifyDocument(
    input: DocumentVerificationInput,
  ): Promise<SubmittedJobResult> {
    const { jobType, authorityVerified } = resolveJobType(
      input.country,
      input.idType,
    );

    this.logger.log(
      {
        caseId: input.caseId,
        country: input.country,
        idType: input.idType,
        jobType,
        authorityVerified,
      },
      'Submitting document verification',
    );

    const images: Array<{ image_type_id: number; image: string }> = [
      { image_type_id: IMAGE_TYPE.SELFIE_BASE64, image: input.selfieBase64 },
      { image_type_id: IMAGE_TYPE.ID_FRONT_BASE64, image: input.idFrontBase64 },
    ];

    if (input.idBackBase64) {
      images.push({
        image_type_id: IMAGE_TYPE.ID_BACK_BASE64,
        image: input.idBackBase64,
      });
    }

    const idInfo: Record<string, unknown> = {
      country: input.country.toUpperCase(),
      entered: input.idNumber ? 'true' : 'false',
    };

    // id_type required for JT11, optional for JT6
    if (jobType === JOB_TYPE.ENHANCED_DOCUMENT_VERIFICATION) {
      idInfo['id_type'] = input.idType.toUpperCase();
    }

    if (input.idNumber) {
      idInfo['id_number'] = input.idNumber;
    }

    const response = (await this.webApi.submit_job(
      {
        user_id: input.caseId,
        job_id: input.jobRef,
        job_type: jobType,
      },
      images,
      idInfo,
      {
        optional_callback: input.callbackUrl,
      },
    )) as { success: boolean; smile_job_id: string };

    this.logger.log(
      { caseId: input.caseId, smileJobId: response.smile_job_id, jobType },
      'Document verification submitted',
    );

    return {
      smileJobId: response.smile_job_id,
      jobType,
      authorityVerified,
    };
  }

  /**
   * Synchronous Enhanced KYC — text-only ID authority lookup, no images.
   * Use to pre-validate an ID number before requesting photo upload.
   * Only works for countries with authority partnerships (see JT11_SUPPORT).
   */
  async enhancedKyc(input: EnhancedKycInput): Promise<EnhancedKycResult> {
    this.logger.log(
      { jobRef: input.jobRef, country: input.country, idType: input.idType },
      'Submitting Enhanced KYC',
    );

    const rawResponse = await this.idApi.submit_job(
      {
        user_id: input.jobRef,
        job_id: input.jobRef,
        job_type: JOB_TYPE.ENHANCED_KYC,
      },
      {
        country: input.country.toUpperCase(),
        id_type: input.idType.toUpperCase(),
        id_number: input.idNumber,
        first_name: input.firstName,
        last_name: input.lastName,
        dob: input.dateOfBirth,
        phone_number: input.phoneNumber,
      },
    );
    const result = rawResponse as Record<string, unknown>;

    const verified = result['ResultCode'] === RESULT_CODE.ID_VERIFIED;

    return {
      smileJobId: (result['SmileJobID'] as string) ?? input.jobRef,
      verified,
      fullName: result['FullName'] as string | undefined,
      dateOfBirth: result['DOB'] as string | undefined,
      expirationDate: result['ExpirationDate'] as string | undefined,
      photo: result['Photo'] as string | undefined,
      rawResult: result,
    };
  }

  /**
   * AML screening. Requires AML product enabled on the Smile ID partner account.
   * The AML_CHECK field is surfaced inside Biometric KYC (JT1) results — this
   * method wraps a standalone call if enabled.
   */
  checkAml(input: AmlCheckInput): Promise<AmlResult> {
    this.logger.warn(
      { firstName: input.firstName, country: input.country },
      'AML check called — requires AML product activation on Smile ID account',
    );
    // AML is not a standalone job_type in SDK v3.1.0.
    // It is returned as Actions.AML_CHECK in JT1 responses when enabled.
    // Implement direct REST call to /v3/aml when account is activated.
    return Promise.reject(
      new UnprocessableEntityException(
        'AML Check non activé — contacter Smile ID pour activer ce produit sur le compte partenaire',
      ),
    );
  }

  /**
   * Smile Secure face deduplication — requires Smile Secure activation on account.
   */
  detectDuplicate(input: DetectDuplicateInput): Promise<DuplicateResult> {
    this.logger.warn(
      { workspaceId: input.workspaceId },
      'detectDuplicate called — requires Smile Secure activation on Smile ID account',
    );
    return Promise.reject(
      new UnprocessableEntityException(
        'Smile Secure non activé — contacter Smile ID pour activer ce produit sur le compte partenaire',
      ),
    );
  }

  /**
   * Verify HMAC-SHA256 signature on incoming Smile ID webhook payloads.
   * Always call this before processing webhook data.
   */
  verifyWebhookSignature(timestamp: string, signature: string): boolean {
    try {
      return this.sig.confirm_signature(timestamp, signature);
    } catch {
      return false;
    }
  }
}
