import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '@/prisma.service';
import { verifyApiKey } from '@common/utils/api-key.utils';

export type ApiKeyRequest = Request & {
  apiKeyWorkspaceId?: string;
  apiKeyId?: string;
};

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ApiKeyRequest>();
    const raw = this.extractKey(request);

    if (!raw) {
      throw new UnauthorizedException('Clé API manquante');
    }

    // Prefix (first 12 chars) narrows the DB lookup before doing the slow hash verify
    const prefix = raw.substring(0, 12);

    const key = await this.prisma.client.apiKey.findFirst({
      where: { prefix, revokedAt: null },
      select: { id: true, keyHash: true, workspaceId: true },
    });

    if (!key || !verifyApiKey(raw, key.keyHash)) {
      throw new UnauthorizedException('Clé API invalide');
    }

    this.prisma.client.apiKey
      .update({ where: { id: key.id }, data: { lastUsedAt: new Date() } })
      .catch(() => null);

    request.apiKeyWorkspaceId = key.workspaceId;
    request.apiKeyId = key.id;
    return true;
  }

  private extractKey(request: Request): string | null {
    const auth = request.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.slice(7).trim() || null;
  }
}
