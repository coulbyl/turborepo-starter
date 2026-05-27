import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { VerifProduct } from '@identis/db';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma.service';
import { createLogger } from '@utils/logger';
import {
  VERIFICATION_PROVIDER,
  type IVerificationProvider,
  type SmileWebhookPayload,
} from '@modules/verification/interfaces/verification-provider.interface';
import { WalletService } from '@modules/wallet/wallet.service';
import { translateSmileError } from '@modules/verification/smile-id.constants';
import type { CreateCaseDto } from './dto/create-case.dto';
import type { ListCasesQueryDto } from './dto/list-cases-query.dto';

const logger = createLogger('case-service');

// Atomic counter suffix stored in Redis or approximated via DB sequence
// For Sprint 1 we derive the reference from the count — good enough until S3.
async function generateReference(
  prisma: PrismaService,
  workspaceId: string,
): Promise<string> {
  const count = await prisma.client.case.count({ where: { workspaceId } });
  const year = new Date().getFullYear();
  const seq = String(count + 1).padStart(4, '0');
  return `CASE-${year}-${seq}`;
}

@Injectable()
export class CaseService {
  // eslint-disable-next-line max-params
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly config: ConfigService,
    @Inject(VERIFICATION_PROVIDER)
    private readonly verificationProvider: IVerificationProvider,
  ) {}

  async create(
    workspaceId: string,
    options: {
      initiatorId: string;
      dto: CreateCaseDto;
      files: {
        selfie: Express.Multer.File;
        idFront: Express.Multer.File;
        idBack?: Express.Multer.File;
      };
    },
  ) {
    const { initiatorId, dto, files } = options;

    // 1. Validate wallet balance before doing anything
    const balance = await this.walletService.getBalance(workspaceId);
    const requiredBalance = 1000; // DOC_VERIFY cost
    if (balance < requiredBalance) {
      throw new BadRequestException(
        `Solde insuffisant (${balance} FCFA). Minimum requis: ${requiredBalance} FCFA.`,
      );
    }

    // 2. Generate unique reference
    const reference = await generateReference(this.prisma, workspaceId);

    // 3. Convert uploaded files to base64 for Smile ID
    const selfieBase64 = files.selfie.buffer.toString('base64');
    const idFrontBase64 = files.idFront.buffer.toString('base64');
    const idBackBase64 = files.idBack?.buffer.toString('base64');

    // 4. Create Case record
    const newCase = await this.prisma.client.case.create({
      data: {
        workspaceId,
        reference,
        initiatedBy: 'AGENT',
        initiatorId,
        status: 'PENDING',
        formData: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          dateOfBirth: dto.dateOfBirth,
          country: dto.country,
          idType: dto.idType,
          idNumber: dto.idNumber,
        },
      },
      select: { id: true, reference: true, status: true, createdAt: true },
    });

    const callbackUrl = this.config.get<string>('SMILE_ID_CALLBACK_URL', '');
    const jobRef = `${newCase.id}-${Date.now()}`;

    const withTimeout = async <T>(promise: Promise<T>): Promise<T> => {
      let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(
          () => reject(new Error('Smile ID timeout — job will be retried via queue')),
          30_000,
        );
      });
      try {
        return await Promise.race([promise, timeout]);
      } finally {
        clearTimeout(timeoutHandle);
      }
    };

    try {
      // 5. Submit to Smile ID with 30s timeout (async — result via webhook)
      const result = await withTimeout(
        this.verificationProvider.verifyDocument({
          caseId: newCase.id,
          jobRef,
          country: dto.country,
          idType: dto.idType,
          idNumber: dto.idNumber,
          selfieBase64,
          idFrontBase64,
          idBackBase64,
          callbackUrl,
        }),
      );

      // 6. Create Verification record
      await this.prisma.client.verification.create({
        data: {
          caseId: newCase.id,
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

      // 7. Deduct wallet only after successful submission
      await this.walletService.deductVerification(
        workspaceId,
        VerifProduct.DOC_VERIFY,
        newCase.id,
      );

      logger.info(
        { caseId: newCase.id, reference, smileJobId: result.smileJobId },
        'Case created and verification submitted',
      );

      return {
        id: newCase.id,
        reference: newCase.reference,
        status: newCase.status,
        smileJobId: result.smileJobId,
        authorityVerified: result.authorityVerified,
        createdAt: newCase.createdAt,
      };
    } catch (error) {
      await this.prisma.client.case.update({
        where: { id: newCase.id },
        data: { status: 'FAILED' },
      });

      // Extract Smile ID response body when available (AxiosError)
      const axiosData =
        error != null &&
        typeof error === 'object' &&
        'response' in error &&
        error.response != null &&
        typeof error.response === 'object' &&
        'data' in error.response
          ? (error.response as { data: unknown }).data
          : undefined;

      logger.error(
        { caseId: newCase.id, smileIdResponse: axiosData, error },
        'Smile ID submission failed — case invalidated',
      );

      if (error instanceof HttpException) throw error;

      const rawSmileMessage =
        axiosData != null &&
        typeof axiosData === 'object' &&
        'error' in axiosData &&
        typeof (axiosData as Record<string, unknown>).error === 'string'
          ? ((axiosData as Record<string, unknown>).error as string)
          : null;

      throw new UnprocessableEntityException(
        translateSmileError(rawSmileMessage) ??
          (error instanceof Error
            ? error.message
            : 'Erreur lors de la soumission de la vérification.'),
      );
    }
  }

  async findAll(workspaceId: string, query: ListCasesQueryDto) {
    const { status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      workspaceId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { reference: { contains: search, mode: 'insensitive' as const } },
              {
                formData: {
                  path: ['firstName'],
                  string_contains: search,
                },
              },
              {
                formData: {
                  path: ['lastName'],
                  string_contains: search,
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.client.case.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          reference: true,
          status: true,
          initiatedBy: true,
          formData: true,
          createdAt: true,
          updatedAt: true,
          verification: {
            select: {
              status: true,
              livenessScore: true,
              documentValid: true,
              faceMatch: true,
              amlMatch: true,
              duplicateFound: true,
            },
          },
        },
      }),
      this.prisma.client.case.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getStats(workspaceId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCases,
      casesThisMonth,
      pendingCases,
      approvedTotal,
      rejectedTotal,
      walletBalance,
      recentCases,
    ] = await Promise.all([
      this.prisma.client.case.count({ where: { workspaceId } }),
      this.prisma.client.case.count({
        where: { workspaceId, createdAt: { gte: monthStart } },
      }),
      this.prisma.client.case.count({
        where: { workspaceId, status: { in: ['PENDING', 'IN_REVIEW'] } },
      }),
      this.prisma.client.case.count({
        where: { workspaceId, status: 'APPROVED' },
      }),
      this.prisma.client.case.count({
        where: { workspaceId, status: 'REJECTED' },
      }),
      this.walletService.getBalance(workspaceId),
      this.prisma.client.case.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          reference: true,
          status: true,
          formData: true,
          createdAt: true,
          verification: { select: { status: true } },
        },
      }),
    ]);

    const decided = approvedTotal + rejectedTotal;
    const approvalRate =
      decided > 0 ? Math.round((approvedTotal / decided) * 100) : null;

    return {
      totalCases,
      casesThisMonth,
      pendingCases,
      approvalRate,
      walletBalance,
      recentCases,
    };
  }

  async remove(workspaceId: string, caseId: string) {
    const found = await this.prisma.client.case.findFirst({
      where: { id: caseId, workspaceId },
      select: { id: true },
    });
    if (!found) throw new NotFoundException('Dossier introuvable');

    // TODO: delete photos from R2 before removing DB record (not yet implemented)
    await this.prisma.client.case.delete({ where: { id: caseId } });
    logger.info({ caseId }, 'Case deleted');
  }

  async handleWebhook(payload: SmileWebhookPayload) {
    if (!payload.job_complete) return;

    const verification = await this.prisma.client.verification.findFirst({
      where: { smileJobId: payload.smile_job_id },
    });

    if (!verification) {
      logger.warn({ smileJobId: payload.smile_job_id }, 'Webhook: verification not found');
      return;
    }

    const actions = payload.result?.Actions ?? {};
    const resultCode = payload.result?.ResultCode;
    const approved = payload.job_success && (resultCode === '0810' || resultCode === '0812');

    const verifStatus = approved ? 'APPROVED' : 'REJECTED';
    // Approved → IN_REVIEW: an agent still validates before final approval
    const caseStatus = approved ? 'IN_REVIEW' : 'REJECTED';

    await this.prisma.client.verification.update({
      where: { id: verification.id },
      data: {
        status: verifStatus,
        livenessScore: actions.Liveness_Check === 'Passed' ? 0.95 : 0.1,
        documentValid: payload.job_success,
        faceMatch: actions.Selfie_To_ID_Card_Compare === 'Passed',
        amlMatch: false,
        duplicateFound: false,
        rawResult: payload as object,
      },
    });

    await this.prisma.client.case.update({
      where: { id: verification.caseId },
      data: { status: caseStatus },
    });

    logger.info(
      { smileJobId: payload.smile_job_id, caseId: verification.caseId, caseStatus },
      'Webhook processed',
    );
  }

  async findOne(workspaceId: string, caseId: string) {
    const found = await this.prisma.client.case.findFirst({
      where: { id: caseId, workspaceId },
      include: {
        verification: true,
        workspace: { select: { name: true, logoUrl: true } },
        stepHistory: {
          orderBy: { createdAt: 'asc' },
          include: {
            actor: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!found) throw new NotFoundException('Dossier introuvable');
    return found;
  }
}
