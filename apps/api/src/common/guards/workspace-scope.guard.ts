import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import type { AuthenticatedRequest } from '@modules/auth/auth.types';
import type { ApiKeyRequest } from './api-key.guard';

export type WorkspaceScopedRequest = AuthenticatedRequest &
  ApiKeyRequest & {
    resolvedWorkspaceId?: string;
    resolvedMemberRole?: string;
  };

/**
 * Validates that the authenticated identity (session user OR API key) belongs
 * to the workspace identified in the request (param, body, or query).
 *
 * Must be used AFTER AuthSessionGuard or ApiKeyGuard.
 * Attach `resolvedWorkspaceId` and `resolvedMemberRole` to the request.
 */
@Injectable()
export class WorkspaceScopeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<WorkspaceScopedRequest>();

    const workspaceId = this.resolveWorkspaceId(request);
    if (!workspaceId) {
      throw new ForbiddenException('workspaceId manquant');
    }

    // API key path — workspace is already bound to the key
    if (request.apiKeyWorkspaceId) {
      if (request.apiKeyWorkspaceId !== workspaceId) {
        throw new ForbiddenException('Accès refusé à ce workspace');
      }
      request.resolvedWorkspaceId = workspaceId;
      return true;
    }

    // Session path — verify user is a member of this workspace
    const userId = request.authSession?.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Non authentifié');
    }

    // Identis super-admins bypass workspace membership check
    if (request.authSession?.user?.role === 'ADMIN') {
      request.resolvedWorkspaceId = workspaceId;
      return true;
    }

    const member = await this.prisma.client.member.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { role: true },
    });

    if (!member) {
      throw new ForbiddenException('Accès refusé à ce workspace');
    }

    request.resolvedWorkspaceId = workspaceId;
    request.resolvedMemberRole = member.role;
    return true;
  }

  private resolveWorkspaceId(request: WorkspaceScopedRequest): string | null {
    return (
      (request.params?.['workspaceId'] as string) ||
      (request.body?.workspaceId as string) ||
      (request.query?.['workspaceId'] as string) ||
      request.apiKeyWorkspaceId ||
      null
    );
  }
}
