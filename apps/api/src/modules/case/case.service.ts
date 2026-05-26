import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VerifProduct } from '@identis/db';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma.service';
import { createLogger } from '@utils/logger';
import {
  VERIFICATION_PROVIDER,
  type IVerificationProvider,
} from '@modules/verification/interfaces/verification-provider.interface';
import { WalletService } from '@modules/wallet/wallet.service';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly config: ConfigService,
    @Inject(VERIFICATION_PROVIDER)
    private readonly verificationProvider: IVerificationProvider,
  ) {}

  async create(
    workspaceId: string,
    initiatorId: string,
    dto: CreateCaseDto,
    files: {
      selfie: Express.Multer.File;
      idFront: Express.Multer.File;
      idBack?: Express.Multer.File;
    },
  ) {
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

    const callbackUrl = this.config.getOrThrow<string>('SMILE_ID_CALLBACK_URL');
    const jobRef = `${newCase.id}-${Date.now()}`;

    try {
      // 5. Submit to Smile ID (async — result via webhook)
      const result = await this.verificationProvider.verifyDocument({
        caseId: newCase.id,
        jobRef,
        country: dto.country,
        idType: dto.idType,
        idNumber: dto.idNumber,
        selfieBase64,
        idFrontBase64,
        idBackBase64,
        callbackUrl,
      });

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
      // If Smile ID submission fails, soft-delete the case and re-throw
      await this.prisma.client.case.update({
        where: { id: newCase.id },
        data: { status: 'EXPIRED' },
      });
      logger.error(
        { caseId: newCase.id, error },
        'Smile ID submission failed — case invalidated',
      );
      throw error;
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

  async findOne(workspaceId: string, caseId: string) {
    const found = await this.prisma.client.case.findFirst({
      where: { id: caseId, workspaceId },
      include: {
        verification: true,
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
