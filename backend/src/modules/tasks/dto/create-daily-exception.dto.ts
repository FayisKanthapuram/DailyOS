import { IsString, Matches, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ExceptionTypeDto {
  SKIP = 'SKIP',
}

export class CreateDailyExceptionDto {
  @ApiProperty({ example: '2026-08-15', description: 'Target date in YYYY-MM-DD format' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  date!: string;

  @ApiPropertyOptional({ enum: ExceptionTypeDto, default: ExceptionTypeDto.SKIP })
  @IsOptional()
  @IsEnum(ExceptionTypeDto)
  type?: ExceptionTypeDto;
}
