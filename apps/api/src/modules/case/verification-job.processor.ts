import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { createLogger } from '@utils/logger';
import {
  VERIFICATION_PROVIDER,
  type IVerificationProvider,
  type DocumentVerificationInput,
} from '@modules/verification/interfaces/verification-provider.interface';
import { PrismaService } from '@/prisma.service';
import { WalletService } from '@modules/wallet/wallet.service';
import { VerifProduct } from '@identis/db';

export const VERIFICATION_QUEUE = 'verification';

export type VerificationJobData = {
  caseId: string;
  workspaceId: string;
  input: DocumentVerificationInput;
};

const logger = createLogger('verification-processor');

const SMILE_TIMEOUT_MS = 30_000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Smile ID timeout after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

@Processor(VERIFICATION_QUEUE)
export class VerificationJobProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    @Inject(VERIFICATION_PROVIDER)
    private readonly verificationProvider: IVerificationProvider,
  ) {
    super();
  }

  async process(job: Job<VerificationJobData>) {
    const { caseId, workspaceId, input } = job.data;
    logger.info({ caseId, attempt: job.attemptsMade }, 'Processing verification job');

    const result = await withTimeout(
      this.verificationProvider.verifyDocument(input),
      SMILE_TIMEOUT_MS,
    );

    await this.prisma.client.verification.create({
      data: {
        caseId,
        smileJobId: result.smileJobId,
        product: VerifProduct.DOC_VERIFY,
        status: 'PENDING',
        rawResult: {
          jobType: result.jobType,
          authorityVerified: result.authorityVerified,
          submittedAt: new Date().toISOString(),
        },
      },
    });

    await this.walletService.deductVerification(workspaceId, VerifProduct.DOC_VERIFY, caseId);

    logger.info({ caseId, smileJobId: result.smileJobId }, 'Verification submitted via queue');
    return result;
  }
}
