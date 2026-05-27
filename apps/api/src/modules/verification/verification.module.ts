import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SmileIdProvider } from './providers/smile-id.provider';
import { FakeVerificationProvider } from './providers/fake.provider';
import { VERIFICATION_PROVIDER } from './interfaces/verification-provider.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    SmileIdProvider,
    FakeVerificationProvider,
    {
      provide: VERIFICATION_PROVIDER,
      inject: [ConfigService, SmileIdProvider, FakeVerificationProvider],
      useFactory: (
        config: ConfigService,
        smile: SmileIdProvider,
        fake: FakeVerificationProvider,
      ) => {
        const provider = config.get<string>('VERIFICATION_PROVIDER', 'smile');
        return provider === 'fake' ? fake : smile;
      },
    },
  ],
  exports: [VERIFICATION_PROVIDER],
})
export class VerificationModule {}
