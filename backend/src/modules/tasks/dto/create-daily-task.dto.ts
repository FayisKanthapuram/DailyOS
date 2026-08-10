import { IsString, IsOptional, IsEnum, MaxLength, Matches, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from '@prisma/client';

export class CreateDailyTaskDto {
  @ApiProperty({ example: 'Morning Workout' })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: '30 minutes of cardio' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: Priority, default: Priority.NONE })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ example: 'category-cuid' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: '07:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'time must be in HH:MM format' })
  time?: string;

  @ApiPropertyOptional({ example: ['tag-id-1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  order?: number;
}
