import {
  Controller,
  Post,
  Body,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { WebhookResponseDto } from './dto/webhook-response.dto';

@Controller('webhook')
export class WebhookController {
  private readonly SECRET_TOKEN =
    process.env.WEBHOOK_SECRET || 'default_secret';

  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  async handleWebhook(
    @Body() payload: CreateWebhookDto,
    @Headers('authorization') authorization: string,
  ): Promise<WebhookResponseDto> {
    try {
      if (!authorization || authorization !== `Bearer ${this.SECRET_TOKEN}`) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      const response = await this.webhookService.processMessage(payload);
      return response;
    } catch (error: unknown) {
      let message = 'Internal Server Error';
      if (error instanceof Error) {
        message = error.message;
      }
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
