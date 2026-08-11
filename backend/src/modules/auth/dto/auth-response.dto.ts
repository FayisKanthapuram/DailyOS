import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto.js';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '15-minute JWT Access Token',
  })
  accessToken!: string;

  @ApiPropertyOptional({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '7-day JWT Refresh Token (returned for native mobile clients)',
  })
  refreshToken?: string;

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}
