import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthSessionGuard } from '@modules/auth/auth-session.guard';
import { SectorService } from './sector.service';

@ApiTags('sectors')
@UseGuards(AuthSessionGuard)
@Controller('sectors')
export class SectorController {
  constructor(private readonly sectorService: SectorService) {}

  @Get()
  findAll() {
    return this.sectorService.findAll();
  }
}
