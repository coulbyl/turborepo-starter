import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { SectorModule } from '@modules/sector/sector.module';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { WalletModule } from '@modules/wallet/wallet.module';

@Module({
  imports: [AuthModule, WalletModule, SectorModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
