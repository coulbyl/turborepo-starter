import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { ApiKeyRequest } from '@common/guards/api-key.guard';

export const ApiKeyWorkspaceId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<ApiKeyRequest>();
    return request.apiKeyWorkspaceId!;
  },
);
