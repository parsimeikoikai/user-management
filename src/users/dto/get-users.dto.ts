import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersDto {
  @IsOptional()
  @IsString()
  cursor?: string; // The last document's ID from the previous page

  @IsOptional()
  @Type(() => Number) // Ensures transformation from string to number
  @IsInt()
  @Min(1)
  limit?: number = 10;
}