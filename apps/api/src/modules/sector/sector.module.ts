import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { PrismaModule } from '@/prisma.module';
import { SectorController } from './sector.controller';
import { SectorService } from './sector.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SectorController],
  providers: [SectorService],
  exports: [SectorService],
})
export class SectorModule {}
