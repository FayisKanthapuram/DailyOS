import { PartialType } from '@nestjs/swagger';
import { CreateDailyTaskDto } from './create-daily-task.dto.js';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDailyTaskDto extends PartialType(CreateDailyTaskDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
