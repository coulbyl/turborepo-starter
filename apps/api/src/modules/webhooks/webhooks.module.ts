import { Module } from '@nestjs/common';
import { SmileIdWebhookController } from './smile-id-webhook.controller';
import { VerificationModule } from '@modules/verification/verification.module';

@Module({
  imports: [VerificationModule],
  controllers: [SmileIdWebhookController],
})
export class WebhooksModule {}
