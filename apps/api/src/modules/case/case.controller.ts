import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthSessionGuard } from '@modules/auth/auth-session.guard';
import { WorkspaceScopeGuard } from '@common/guards/workspace-scope.guard';
import { CurrentWorkspaceId } from '@common/decorators/current-workspace.decorator';
import { CurrentSession } from '@modules/auth/current-session.decorator';
import type { AuthSession } from '@modules/auth/auth.types';
import { CaseService } from './case.service';
import { PdfReportService } from './pdf-report.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { ListCasesQueryDto } from './dto/list-cases-query.dto';

@ApiTags('cases')
@UseGuards(AuthSessionGuard, WorkspaceScopeGuard)
@Controller('workspaces/:workspaceId/cases')
export class CaseController {
  constructor(
    private readonly caseService: CaseService,
    private readonly pdfReportService: PdfReportService,
  ) {}

  // eslint-disable-next-line max-params
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'selfie', maxCount: 1 },
        { name: 'idFront', maxCount: 1 },
        { name: 'idBack', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  create(
    @CurrentWorkspaceId() workspaceId: string,
    @CurrentSession() session: AuthSession,
    @Body() dto: CreateCaseDto,
    @UploadedFiles()
    files: {
      selfie?: Express.Multer.File[];
      idFront?: Express.Multer.File[];
      idBack?: Express.Multer.File[];
    },
  ) {
    if (!files.selfie?.[0] || !files.idFront?.[0]) {
      throw new Error('selfie et idFront sont requis');
    }

    return this.caseService.create(workspaceId, {
      initiatorId: session.user.id,
      dto,
      files: {
        selfie: files.selfie[0],
        idFront: files.idFront[0],
        idBack: files.idBack?.[0],
      },
    });
  }

  @Get('stats')
  getStats(@CurrentWorkspaceId() workspaceId: string) {
    return this.caseService.getStats(workspaceId);
  }

  @Get()
  findAll(
    @CurrentWorkspaceId() workspaceId: string,
    @Query() query: ListCasesQueryDto,
  ) {
    return this.caseService.findAll(workspaceId, query);
  }

  @Get(':caseId')
  findOne(
    @CurrentWorkspaceId() workspaceId: string,
    @Param('caseId') caseId: string,
  ) {
    return this.caseService.findOne(workspaceId, caseId);
  }

  @Get(':caseId/report')
  async downloadReport(
    @CurrentWorkspaceId() workspaceId: string,
    @Param('caseId') caseId: string,
    @Res() res: Response,
  ) {
    const c = await this.caseService.findOne(workspaceId, caseId);
    const pdf = this.pdfReportService.generate(c);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="rapport-${c.reference}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }

  @Delete(':caseId')
  @HttpCode(204)
  remove(
    @CurrentWorkspaceId() workspaceId: string,
    @Param('caseId') caseId: string,
  ) {
    return this.caseService.remove(workspaceId, caseId);
  }
}
