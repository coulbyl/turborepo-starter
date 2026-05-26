import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
