import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthSessionGuard } from '@modules/auth/auth-session.guard';
import { WorkspaceScopeGuard } from '@common/guards/workspace-scope.guard';
import { CurrentWorkspaceId } from '@common/decorators/current-workspace.decorator';
import { WalletService } from './wallet.service';

@ApiTags('wallet')
@UseGuards(AuthSessionGuard, WorkspaceScopeGuard)
@Controller('workspaces/:workspaceId/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getBalance(@CurrentWorkspaceId() workspaceId: string) {
    return this.walletService.getBalance(workspaceId);
  }

  @Get('history')
  getHistory(
    @CurrentWorkspaceId() workspaceId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.walletService.getHistory(
      workspaceId,
      page,
      Math.min(limit, 100),
    );
  }
}
