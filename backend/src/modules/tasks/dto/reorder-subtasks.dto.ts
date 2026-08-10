import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class SubtaskOrderItem {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsNumber()
  order!: number;
}

export class ReorderSubtasksDto {
  @ApiProperty({ type: [SubtaskOrderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubtaskOrderItem)
  subtasks!: SubtaskOrderItem[];
}
