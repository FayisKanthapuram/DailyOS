import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { User, AuthProvider } from '@prisma/client';

export interface CreateUserData {
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  provider?: AuthProvider;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        password: data.password,
        avatar: data.avatar,
        provider: data.provider ?? AuthProvider.LOCAL,
      },
    });
  }

  async updateUserAvatar(userId: string, avatar: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar },
    });
  }

  async updateRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }
}
