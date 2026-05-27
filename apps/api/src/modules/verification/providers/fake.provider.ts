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

const logger = createLogger('fake-verification-provider');

type Outcome = 'approve' | 'reject' | 'random';

@Injectable()
export class FakeVerificationProvider implements IVerificationProvider {
  private readonly outcome: Outcome;

  constructor(config: ConfigService) {
    this.outcome = (config.get<string>('FAKE_PROVIDER_OUTCOME', 'approve') as Outcome);
    logger.warn(
      { outcome: this.outcome },
      'FakeVerificationProvider active — do not use in production',
    );
  }

  async verifyDocument(input: DocumentVerificationInput): Promise<SubmittedJobResult> {
    const smileJobId = `fake-${randomUUID()}`;
    logger.info({ smileJobId, caseId: input.caseId }, 'Fake submission — webhook in 2s');

    // Simulate async Smile ID callback after 2 seconds
    setTimeout(() => {
      void this.postWebhook(smileJobId, input.callbackUrl);
    }, 2000);

    return { smileJobId, jobType: 11, authorityVerified: true };
  }

  async enhancedKyc(input: EnhancedKycInput): Promise<EnhancedKycResult> {
    return {
      smileJobId: `fake-${randomUUID()}`,
      verified: true,
      fullName: [input.firstName, input.lastName].filter(Boolean).join(' ') || 'Fake User',
      dateOfBirth: input.dateOfBirth,
      rawResult: { fake: true },
    };
  }

  checkAml(_input: AmlCheckInput): Promise<AmlResult> {
    return Promise.resolve({ match: false, matchedLists: [], rawResult: { fake: true } });
  }

  detectDuplicate(_input: DetectDuplicateInput): Promise<DuplicateResult> {
    return Promise.resolve({ duplicateFound: false, rawResult: { fake: true } });
  }

  verifyWebhookSignature(_timestamp: string, _signature: string): boolean {
    return true; // fake provider trusts all incoming webhooks
  }

  private resolveOutcome(): 'approve' | 'reject' {
    if (this.outcome === 'random') return Math.random() > 0.3 ? 'approve' : 'reject';
    return this.outcome === 'reject' ? 'reject' : 'approve';
  }

  private async postWebhook(smileJobId: string, callbackUrl: string): Promise<void> {
    if (!callbackUrl) {
      logger.warn({ smileJobId }, 'No callbackUrl configured — skipping fake webhook');
      return;
    }

    const approved = this.resolveOutcome() === 'approve';
    const timestamp = new Date().toISOString();

    const payload: SmileWebhookPayload = {
      job_complete: true,
      job_success: approved,
      smile_job_id: smileJobId,
      timestamp,
      signature: 'fake-signature',
      result: {
        ResultCode: approved ? '0810' : '0811',
        ResultText: approved ? 'Approved' : 'Rejected',
        SmileJobID: smileJobId,
        Actions: {
          Liveness_Check: approved ? 'Passed' : 'Failed',
          Selfie_To_ID_Card_Compare: approved ? 'Passed' : 'Failed',
          Verify_ID_Number: approved ? 'Passed' : 'Not Applicable',
        },
      },
    };

    try {
      const res = await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      logger.info({ smileJobId, status: res.status, approved }, 'Fake webhook delivered');
    } catch (err) {
      logger.error({ smileJobId, callbackUrl, err }, 'Fake webhook delivery failed');
    }
  }
}
