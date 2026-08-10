import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDailyInstanceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ example: 'Felt great today!' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
