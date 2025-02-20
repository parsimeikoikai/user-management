import { IsString } from 'class-validator';

export class CreateWebhookDto {
  @IsString()
  message: string;

  @IsString()
  phone: string;
}
