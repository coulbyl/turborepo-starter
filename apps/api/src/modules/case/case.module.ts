import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '@modules/auth/auth.module';
import { CaseService } from './case.service';
import { CaseController } from './case.controller';
import { WebhookController } from './webhook.controller';
import { VerificationJobProcessor, VERIFICATION_QUEUE } from './verification-job.processor';
import { PdfReportService } from './pdf-report.service';
import { VerificationModule } from '@modules/verification/verification.module';
import { WalletModule } from '@modules/wallet/wallet.module';

@Module({
  imports: [
    AuthModule,
    VerificationModule,
    WalletModule,
    BullModule.registerQueue({
      name: VERIFICATION_QUEUE,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5 * 60 * 1000 }, // 5min → 10min → 20min → 40min → 80min
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    }),
  ],
  controllers: [CaseController, WebhookController],
  providers: [CaseService, VerificationJobProcessor, PdfReportService],
  exports: [CaseService],
})
export class CaseModule {}
