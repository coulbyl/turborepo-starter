import { Module } from '@nestjs/common';
import { CaseService } from './case.service';
import { CaseController } from './case.controller';
import { VerificationModule } from '@modules/verification/verification.module';
import { WalletModule } from '@modules/wallet/wallet.module';

@Module({
  imports: [VerificationModule, WalletModule],
  controllers: [CaseController],
  providers: [CaseService],
  exports: [CaseService],
})
export class CaseModule {}
