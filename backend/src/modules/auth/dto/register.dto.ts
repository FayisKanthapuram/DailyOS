import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIANATimezone } from '../../../common/validators/is-iana-timezone.validator.js';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({ example: 'Asia/Kolkata' })
  @IsOptional()
  @IsString()
  @IsIANATimezone()
  timezone?: string;
}
