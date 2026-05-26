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
import { CaseStatus, VerifStatus } from '@identis/db';
import { PrismaService } from '@/prisma.service';
import {
  VERIFICATION_PROVIDER,
  type IVerificationProvider,
  type SmileWebhookPayload,
} from '@modules/verification/interfaces/verification-provider.interface';
import { RESULT_CODE } from '@modules/verification/smile-id.constants';

// ── Result code → Identis statuses ───────────────────────────────────────────

function resolveStatuses(payload: SmileWebhookPayload): {
  verifStatus: VerifStatus;
  caseStatus: CaseStatus;
  livenessScore: number | null;
  documentValid: boolean | null;
  faceMatch: boolean | null;
} {
  if (!payload.job_complete) {
    return {
      verifStatus: VerifStatus.PENDING,
      caseStatus: CaseStatus.PENDING,
      livenessScore: null,
      documentValid: null,
      faceMatch: null,
    };
  }

  const code = payload.result?.ResultCode ?? '';
  const actions = payload.result?.Actions ?? {};
  const livenessOk = actions.Liveness_Check === 'Passed';
  const faceMatchOk = actions.Selfie_To_ID_Card_Compare === 'Passed';
  const documentValid =
    actions.Verify_ID_Number === 'Verified' || faceMatchOk;

  if (code === RESULT_CODE.PASS && livenessOk) {
    return {
      verifStatus: VerifStatus.APPROVED,
      caseStatus: CaseStatus.APPROVED,
      livenessScore: null, // raw score not exposed by Smile ID in this field
      documentValid,
      faceMatch: faceMatchOk,
    };
  }

  // 0811 = provisional — needs human review
  if (code === RESULT_CODE.PROVISIONAL) {
    return {
      verifStatus: VerifStatus.PENDING,
      caseStatus: CaseStatus.IN_REVIEW,
      livenessScore: null,
      documentValid,
      faceMatch: faceMatchOk,
    };
  }

  // Enhanced KYC pass (text-only, no face match)
  if (code === RESULT_CODE.ID_VERIFIED) {
    return {
      verifStatus: VerifStatus.APPROVED,
      caseStatus: CaseStatus.APPROVED,
      livenessScore: null,
      documentValid: true,
      faceMatch: null,
    };
  }

  // 0812, 1013, or any other failure
  return {
    verifStatus: VerifStatus.REJECTED,
    caseStatus: CaseStatus.REJECTED,
    livenessScore: null,
    documentValid: false,
    faceMatch: false,
  };
}

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
    if (!this.verificationProvider.verifyWebhookSignature(payload.timestamp, payload.signature)) {
      this.logger.warn({ smileJobId: payload.smile_job_id }, 'Invalid Smile ID webhook signature');
      throw new UnauthorizedException('Signature invalide');
    }

    const { smile_job_id: smileJobId } = payload;

    const verification = await this.prisma.client.verification.findFirst({
      where: { smileJobId },
      select: { id: true, caseId: true, status: true },
    });

    if (!verification) {
      // Could be a retried webhook for an already-processed job — log and ack
      this.logger.warn({ smileJobId }, 'Webhook received for unknown smileJobId — ignored');
      return { received: true };
    }

    // Already processed (Smile ID sometimes sends duplicates)
    if (verification.status !== VerifStatus.PENDING) {
      this.logger.log({ smileJobId }, 'Webhook already processed — skipped');
      return { received: true };
    }

    const { verifStatus, caseStatus, livenessScore, documentValid, faceMatch } =
      resolveStatuses(payload);

    // 2. Update Verification + Case atomically
    await this.prisma.client.$transaction([
      this.prisma.client.verification.update({
        where: { id: verification.id },
        data: {
          status: verifStatus,
          livenessScore,
          documentValid,
          faceMatch,
          rawResult: payload as unknown as Record<string, unknown>,
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
