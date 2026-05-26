import { BadRequestException, Injectable } from '@nestjs/common';
import { TxType, VerifProduct } from '@identis/db';
import { PrismaService } from '@/prisma.service';
import { createLogger } from '@utils/logger';
import {
  VERIFICATION_COST,
  WELCOME_CREDIT_FCFA,
} from '@modules/verification/smile-id.constants';

const logger = createLogger('wallet-service');

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(workspaceId: string): Promise<number> {
    const ws = await this.prisma.client.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: { walletBalance: true },
    });
    return ws.walletBalance;
  }

  async getHistory(workspaceId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.client.walletTransaction.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.client.walletTransaction.count({ where: { workspaceId } }),
    ]);
    return { items, total, page, limit };
  }

  /**
   * Credit the workspace wallet (RECHARGE or INSCRIPTION bonus).
   * Atomically updates balance + creates transaction record.
   */
  async credit(
    workspaceId: string,
    amount: number,
    type: TxType,
    reference?: string,
  ) {
    return this.prisma.client.$transaction(async (tx) => {
      const ws = await tx.workspace.findUniqueOrThrow({
        where: { id: workspaceId },
        select: { walletBalance: true },
      });

      const balanceBefore = ws.walletBalance;
      const balanceAfter = balanceBefore + amount;

      await tx.workspace.update({
        where: { id: workspaceId },
        data: { walletBalance: balanceAfter },
      });

      const record = await tx.walletTransaction.create({
        data: {
          workspaceId,
          type,
          amount,
          balanceBefore,
          balanceAfter,
          reference: reference ?? null,
        },
      });

      logger.info(
        { workspaceId, type, amount, balanceAfter },
        'wallet credited',
      );
      return record;
    });
  }

  /**
   * Deduct the cost of a verification from the workspace wallet.
   * Throws BadRequestException if balance is insufficient.
   */
  async deductVerification(
    workspaceId: string,
    product: VerifProduct,
    caseId: string,
  ) {
    const cost = VERIFICATION_COST[product] ?? VERIFICATION_COST['DOC_VERIFY'];

    return this.prisma.client.$transaction(async (tx) => {
      const ws = await tx.workspace.findUniqueOrThrow({
        where: { id: workspaceId },
        select: { walletBalance: true },
      });

      if (ws.walletBalance < cost) {
        throw new BadRequestException(
          `Solde insuffisant (${ws.walletBalance} FCFA). Rechargez votre wallet pour continuer.`,
        );
      }

      const balanceBefore = ws.walletBalance;
      const balanceAfter = balanceBefore - cost;

      await tx.workspace.update({
        where: { id: workspaceId },
        data: { walletBalance: balanceAfter },
      });

      const record = await tx.walletTransaction.create({
        data: {
          workspaceId,
          type: TxType.DEDUCTION,
          amount: -cost,
          balanceBefore,
          balanceAfter,
          caseId,
          product,
        },
      });

      logger.info(
        { workspaceId, product, cost, balanceAfter, caseId },
        'wallet deducted',
      );
      return record;
    });
  }

  /**
   * Refund a failed verification (e.g. Smile ID unreachable).
   */
  async refund(workspaceId: string, product: VerifProduct, caseId: string) {
    const cost = VERIFICATION_COST[product] ?? VERIFICATION_COST['DOC_VERIFY'];
    return this.credit(workspaceId, cost, TxType.REFUND, caseId);
  }

  /**
   * Credit welcome bonus for new workspaces (10 free verifications).
   * Called once at workspace creation.
   */
  async creditWelcomeBonus(workspaceId: string) {
    return this.credit(workspaceId, WELCOME_CREDIT_FCFA, TxType.INSCRIPTION);
  }
}
