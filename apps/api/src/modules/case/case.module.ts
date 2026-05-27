import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { CaseService } from './case.service';
import { CaseController } from './case.controller';
import { VerificationModule } from '@modules/verification/verification.module';
import { WalletModule } from '@modules/wallet/wallet.module';

@Module({
  imports: [AuthModule, VerificationModule, WalletModule],
  controllers: [CaseController],
  providers: [CaseService],
  exports: [CaseService],
})
export class CaseModule {}
