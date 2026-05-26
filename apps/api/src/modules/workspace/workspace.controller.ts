import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthSessionGuard } from '@modules/auth/auth-session.guard';
import { CurrentSession } from '@modules/auth/current-session.decorator';
import { WorkspaceScopeGuard } from '@common/guards/workspace-scope.guard';
import { CurrentWorkspaceId } from '@common/decorators/current-workspace.decorator';
import type { AuthSession } from '@modules/auth/auth.types';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@ApiTags('workspaces')
@UseGuards(AuthSessionGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  create(
    @CurrentSession() session: AuthSession,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.create(session.user.id, dto);
  }

  @Get()
  findAll(@CurrentSession() session: AuthSession) {
    return this.workspaceService.findAllForUser(session.user.id);
  }

  @Get(':workspaceId')
  @UseGuards(WorkspaceScopeGuard)
  findOne(@CurrentWorkspaceId() workspaceId: string) {
    return this.workspaceService.findOne(workspaceId);
  }

  @Patch(':workspaceId')
  @UseGuards(WorkspaceScopeGuard)
  update(
    @CurrentWorkspaceId() workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(workspaceId, dto);
  }

  @Get(':workspaceId/members')
  @UseGuards(WorkspaceScopeGuard)
  getMembers(@CurrentWorkspaceId() workspaceId: string) {
    return this.workspaceService.getMembers(workspaceId);
  }

  @Post(':workspaceId/members')
  @UseGuards(WorkspaceScopeGuard)
  inviteMember(
    @CurrentWorkspaceId() workspaceId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspaceService.inviteMember(workspaceId, dto);
  }

  @Delete(':workspaceId/members/:memberId')
  @UseGuards(WorkspaceScopeGuard)
  @HttpCode(204)
  removeMember(
    @CurrentWorkspaceId() workspaceId: string,
    @Param('memberId') memberId: string,
    @CurrentSession() session: AuthSession,
  ) {
    return this.workspaceService.removeMember(
      workspaceId,
      memberId,
      session.user.id,
    );
  }
}
