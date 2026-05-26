import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AmlCheckInput,
  AmlResult,
  BasicKycInput,
  DetectDuplicateInput,
  DocumentResult,
  DocumentVerificationInput,
  DuplicateResult,
  IVerificationProvider,
  KycResult,
} from '../interfaces/verification-provider.interface';

/**
 * Smile ID implementation of IVerificationProvider.
 * Credentials: SMILE_ID_PARTNER_ID, SMILE_ID_API_KEY, SMILE_ID_ENV (0=sandbox, 1=production)
 *
 * TODO Sprint 1: replace stub bodies with actual Smile ID SDK calls.
 * SDK: https://github.com/smileidentity/smile-identity-core-js
 */
@Injectable()
export class SmileIdProvider implements IVerificationProvider {
  private readonly logger = new Logger(SmileIdProvider.name);

  constructor(private readonly config: ConfigService) {}

  async basicKyc(input: BasicKycInput): Promise<KycResult> {
    this.logger.debug({ idNumber: input.idNumber }, 'basicKyc called [stub]');
    // TODO: integrate Smile ID Basic KYC
    throw new Error('SmileIdProvider.basicKyc not yet implemented');
  }

  async verifyDocument(
    input: DocumentVerificationInput,
  ): Promise<DocumentResult> {
    this.logger.debug(
      { country: input.country, idType: input.idType },
      'verifyDocument called [stub]',
    );
    // TODO: integrate Smile ID Document Verification + Selfie Liveness
    throw new Error('SmileIdProvider.verifyDocument not yet implemented');
  }

  async checkAml(input: AmlCheckInput): Promise<AmlResult> {
    this.logger.debug(
      { firstName: input.firstName, lastName: input.lastName },
      'checkAml called [stub]',
    );
    // TODO: integrate Smile ID AML Check
    throw new Error('SmileIdProvider.checkAml not yet implemented');
  }

  async detectDuplicate(input: DetectDuplicateInput): Promise<DuplicateResult> {
    this.logger.debug(
      { workspaceId: input.workspaceId },
      'detectDuplicate called [stub]',
    );
    // TODO: integrate Smile ID Smile Secure (face deduplication)
    throw new Error('SmileIdProvider.detectDuplicate not yet implemented');
  }

  private get partnerId(): string {
    return this.config.getOrThrow<string>('SMILE_ID_PARTNER_ID');
  }

  private get apiKey(): string {
    return this.config.getOrThrow<string>('SMILE_ID_API_KEY');
  }

  private get isSandbox(): boolean {
    return this.config.get<string>('SMILE_ID_ENV', '0') === '0';
  }
}
