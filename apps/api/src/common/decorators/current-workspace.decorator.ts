import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { WorkspaceScopedRequest } from '@common/guards/workspace-scope.guard';

export const CurrentWorkspaceId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<WorkspaceScopedRequest>();
    return request.resolvedWorkspaceId!;
  },
);

export const CurrentMemberRole = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<WorkspaceScopedRequest>();
    return request.resolvedMemberRole;
  },
);
