import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberRole } from '@identis/db';
import { PrismaService } from '@/prisma.service';
import { createLogger } from '@utils/logger';
import { WalletService } from '@modules/wallet/wallet.service';
import { SectorService } from '@modules/sector/sector.service';
import type { CreateWorkspaceDto } from './dto/create-workspace.dto';
import type { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import type { InviteMemberDto } from './dto/invite-member.dto';

const logger = createLogger('workspace-service');

const WORKSPACE_SELECT = {
  id: true,
  name: true,
  slug: true,
  sector: { select: { id: true, label: true, builtIn: true } },
  deploymentType: true,
  logoUrl: true,
  primaryColor: true,
  welcomeMessage: true,
  walletBalance: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly sectorService: SectorService,
  ) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const baseSlug = dto.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 38);

    let slug = baseSlug;
    let attempt = 0;
    while (
      await this.prisma.client.workspace.findUnique({
        where: { slug },
        select: { id: true },
      })
    ) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const sector = dto.sectorLabel
      ? await this.sectorService.findOrCreate(dto.sectorLabel)
      : null;

    const workspace = await this.prisma.client.workspace.create({
      data: {
        name: dto.name,
        slug,
        ...(sector && { sectorId: sector.id }),
        welcomeMessage: dto.welcomeMessage,
        members: {
          create: { userId, role: MemberRole.ADMIN },
        },
      },
      select: WORKSPACE_SELECT,
    });

    // Credit 10 free verifications (10 000 FCFA) for new workspace
    await this.walletService.creditWelcomeBonus(workspace.id);

    logger.info({ workspaceId: workspace.id, userId }, 'workspace created');
    return workspace;
  }

  async findAllForUser(userId: string) {
    const members = await this.prisma.client.member.findMany({
      where: { userId },
      select: {
        role: true,
        workspace: { select: WORKSPACE_SELECT },
      },
    });
    return members.map((m) => ({ ...m.workspace, memberRole: m.role }));
  }

  async findOne(workspaceId: string) {
    const workspace = await this.prisma.client.workspace.findUnique({
      where: { id: workspaceId },
      select: WORKSPACE_SELECT,
    });

    if (!workspace) throw new NotFoundException('Workspace introuvable');
    return workspace;
  }

  async update(workspaceId: string, dto: UpdateWorkspaceDto) {
    return this.prisma.client.workspace.update({
      where: { id: workspaceId },
      data: dto,
      select: WORKSPACE_SELECT,
    });
  }

  async getMembers(workspaceId: string) {
    return this.prisma.client.member.findMany({
      where: { workspaceId },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async inviteMember(workspaceId: string, dto: InviteMemberDto) {
    const user = await this.prisma.client.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Aucun compte avec cet email');
    }

    const existing = await this.prisma.client.member.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });

    if (existing) {
      throw new ConflictException('Cet utilisateur est déjà membre');
    }

    return this.prisma.client.member.create({
      data: { workspaceId, userId: user.id, role: dto.role },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: { id: true, email: true, fullName: true },
        },
      },
    });
  }

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: MemberRole,
  ) {
    const member = await this.prisma.client.member.findUnique({
      where: { id: memberId },
      select: { workspaceId: true },
    });

    if (!member || member.workspaceId !== workspaceId) {
      throw new NotFoundException('Membre introuvable');
    }

    return this.prisma.client.member.update({
      where: { id: memberId },
      data: { role },
      select: {
        id: true,
        role: true,
        user: { select: { id: true, email: true, fullName: true } },
      },
    });
  }

  async removeMember(workspaceId: string, memberId: string, actorId: string) {
    const member = await this.prisma.client.member.findUnique({
      where: { id: memberId },
      select: { userId: true, workspaceId: true },
    });

    if (!member || member.workspaceId !== workspaceId) {
      throw new NotFoundException('Membre introuvable');
    }

    if (member.userId === actorId) {
      throw new ForbiddenException('Vous ne pouvez pas vous retirer vous-même');
    }

    await this.prisma.client.member.delete({ where: { id: memberId } });
  }
}
