import { Module } from '@nestjs/common';
import { SmileIdProvider } from './providers/smile-id.provider';
import { VERIFICATION_PROVIDER } from './interfaces/verification-provider.interface';

@Module({
  providers: [
    {
      provide: VERIFICATION_PROVIDER,
      useClass: SmileIdProvider,
    },
  ],
  exports: [VERIFICATION_PROVIDER],
})
export class VerificationModule {}
