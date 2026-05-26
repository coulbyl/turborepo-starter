import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { prisma } from '@identis/db';

@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly client = prisma;

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
