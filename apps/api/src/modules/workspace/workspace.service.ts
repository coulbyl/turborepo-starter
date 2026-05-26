import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberRole } from '@identis/db';
import { PrismaService } from '@/prisma.service';
import { createLogger } from '@utils/logger';
import type { CreateWorkspaceDto } from './dto/create-workspace.dto';
import type { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import type { InviteMemberDto } from './dto/invite-member.dto';

const logger = createLogger('workspace-service');

const WORKSPACE_SELECT = {
  id: true,
  name: true,
  slug: true,
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
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const existing = await this.prisma.client.workspace.findUnique({
      where: { slug: dto.slug },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Ce slug est déjà utilisé');
    }

    const workspace = await this.prisma.client.workspace.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        welcomeMessage: dto.welcomeMessage,
        members: {
          create: { userId, role: MemberRole.ADMIN },
        },
        walletTxs: {
          create: {
            type: 'INSCRIPTION',
            amount: -15000,
            balanceBefore: 0,
            balanceAfter: 0,
          },
        },
      },
      select: WORKSPACE_SELECT,
    });

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
            username: true,
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
          select: { id: true, email: true, username: true, fullName: true },
        },
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
