import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VerifStatus } from '@identis/db';
import { PrismaService } from '@/prisma.service';
import {
  VERIFICATION_PROVIDER,
  type IVerificationProvider,
  type SmileWebhookPayload,
} from '@modules/verification/interfaces/verification-provider.interface';
import { mapWebhookToVerificationState } from '@modules/verification/verification-webhook.mapper';

// ─────────────────────────────────────────────────────────────────────────────

@ApiTags('webhooks')
@Controller('webhooks')
export class SmileIdWebhookController {
  private readonly logger = new Logger(SmileIdWebhookController.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(VERIFICATION_PROVIDER)
    private readonly verificationProvider: IVerificationProvider,
  ) {}

  @Post('smile-id')
  @HttpCode(200)
  async handleSmileIdCallback(@Body() payload: SmileWebhookPayload) {
    // 1. Verify HMAC signature — reject silently if invalid
    if (
      !this.verificationProvider.verifyWebhookSignature(
        payload.timestamp,
        payload.signature,
      )
    ) {
      this.logger.warn(
        { smileJobId: payload.smile_job_id },
        'Invalid Smile ID webhook signature',
      );
      throw new UnauthorizedException('Signature invalide');
    }

    const { smile_job_id: smileJobId } = payload;

    const verification = await this.prisma.client.verification.findFirst({
      where: { smileJobId },
      select: { id: true, caseId: true, status: true, rawResult: true },
    });

    if (!verification) {
      // Could be a retried webhook for an already-processed job — log and ack
      this.logger.warn(
        { smileJobId },
        'Webhook received for unknown smileJobId — ignored',
      );
      return { received: true };
    }

    // Already processed (Smile ID sometimes sends duplicates)
    if (verification.status !== VerifStatus.PENDING) {
      this.logger.log({ smileJobId }, 'Webhook already processed — skipped');
      return { received: true };
    }

    const {
      verifStatus,
      caseStatus,
      livenessScore,
      documentValid,
      faceMatch,
      amlMatch,
      duplicateFound,
    } = mapWebhookToVerificationState(payload);

    const previousRawResult =
      verification.rawResult &&
      typeof verification.rawResult === 'object' &&
      !Array.isArray(verification.rawResult)
        ? (verification.rawResult as Record<string, unknown>)
        : {};

    // 2. Update Verification + Case atomically
    await this.prisma.client.$transaction([
      this.prisma.client.verification.update({
        where: { id: verification.id },
        data: {
          status: verifStatus,
          livenessScore,
          documentValid,
          faceMatch,
          amlMatch,
          duplicateFound,
          rawResult: {
            ...previousRawResult,
            ...payload,
          },
          updatedAt: new Date(),
        },
      }),
      this.prisma.client.case.update({
        where: { id: verification.caseId },
        data: { status: caseStatus },
      }),
    ]);

    this.logger.log(
      { smileJobId, caseId: verification.caseId, verifStatus, caseStatus },
      'Smile ID webhook processed',
    );

    // TODO Sprint 2: WebSocket push to dashboard
    // TODO Sprint 3: trigger Rule Engine scoring

    return { received: true };
  }
}
