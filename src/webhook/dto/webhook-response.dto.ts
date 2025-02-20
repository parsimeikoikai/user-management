import { IsString } from 'class-validator';

export class WebhookResponseDto {
  @IsString()
  reply: string;
}
