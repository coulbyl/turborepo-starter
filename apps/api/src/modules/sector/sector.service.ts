import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class SectorService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.client.sector.findMany({
      select: { id: true, label: true, builtIn: true },
      orderBy: [{ builtIn: 'desc' }, { label: 'asc' }],
    });
  }

  async findOrCreate(rawLabel: string) {
    const label = rawLabel.trim().toUpperCase();
    return this.prisma.client.sector.upsert({
      where: { label },
      update: {},
      create: { label, builtIn: false },
      select: { id: true, label: true, builtIn: true },
    });
  }
}
