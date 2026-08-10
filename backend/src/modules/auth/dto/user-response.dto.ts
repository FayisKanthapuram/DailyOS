import { ApiProperty } from '@nestjs/swagger';
import { AuthProvider, User } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 'clx123456789' })
  id!: string;

  @ApiProperty({ example: 'alex@example.com' })
  email!: string;

  @ApiProperty({ example: 'Alex Morgan', nullable: true })
  name!: string | null;

  @ApiProperty({ example: 'https://example.com/avatar.png', nullable: true })
  avatar!: string | null;

  @ApiProperty({ enum: AuthProvider, example: 'LOCAL' })
  provider!: AuthProvider;

  @ApiProperty({ example: '2026-08-06T12:00:00.000Z' })
  createdAt!: Date;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
      createdAt: user.createdAt,
    };
  }
}
