import { IsString, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Work' })
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be a valid hex color (e.g. #6366f1)' })
  color?: string;

  @ApiPropertyOptional({ example: 'briefcase' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}
