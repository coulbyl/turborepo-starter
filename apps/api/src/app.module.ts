import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { MailModule } from './modules/mail/mail.module';
import { RedisModule } from './common/redis/redis.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { VerificationModule } from './modules/verification/verification.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { CaseModule } from './modules/case/case.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'long', ttl: 60_000, limit: 100 },
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    RedisModule,
    PrismaModule,
    AuthModule,
    AdminUsersModule,
    NotificationModule,
    AnnouncementsModule,
    MailModule,
    WorkspaceModule,
    VerificationModule,
    WalletModule,
    CaseModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
