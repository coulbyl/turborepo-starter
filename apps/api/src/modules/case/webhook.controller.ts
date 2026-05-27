import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  VERIFICATION_PROVIDER,
  type IVerificationProvider,
  type SmileWebhookPayload,
} from '@modules/verification/interfaces/verification-provider.interface';
import { CaseService } from './case.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly caseService: CaseService,
    @Inject(VERIFICATION_PROVIDER)
    private readonly verificationProvider: IVerificationProvider,
  ) {}

  @Post('smile')
  @HttpCode(200)
  handleSmileWebhook(@Body() payload: SmileWebhookPayload) {
    if (
      !this.verificationProvider.verifyWebhookSignature(
        payload.timestamp,
        payload.signature,
      )
    ) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return this.caseService.handleWebhook(payload);
  }
}
