import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { AppConfigService } from '../../config/config.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ tokens: Tokens; user: UserResponseDto }> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
    });

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      tokens,
      user: UserResponseDto.fromEntity(user),
    };
  }

  async login(dto: LoginDto): Promise<{ tokens: Tokens; user: UserResponseDto }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      tokens,
      user: UserResponseDto.fromEntity(user),
    };
  }

  async refresh(
    userId: string,
    refreshToken: string,
  ): Promise<{ tokens: Tokens; user: UserResponseDto }> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied. No active session found.');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isRefreshTokenValid) {
      // Possible token reuse attack! Revoke sessions immediately for safety.
      await this.usersService.updateRefreshTokenHash(user.id, null);
      throw new UnauthorizedException('Access denied. Invalid or reused refresh token.');
    }

    // Refresh Token Rotation: issue brand new pair and update DB hash
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      tokens,
      user: UserResponseDto.fromEntity(user),
    };
  }

  async validateGoogleUser(googleUser: {
    email: string;
    name: string;
    avatar: string | null;
  }): Promise<{ tokens: Tokens; user: UserResponseDto }> {
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      user = await this.usersService.createUser({
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.avatar ?? undefined,
        provider: AuthProvider.GOOGLE,
      });
    } else if (googleUser.avatar && !user.avatar) {
      user = await this.usersService.updateUserAvatar(user.id, googleUser.avatar);
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      tokens,
      user: UserResponseDto.fromEntity(user),
    };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshTokenHash(userId, null);
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return UserResponseDto.fromEntity(user);
  }

  private async generateTokens(userId: string, email: string): Promise<Tokens> {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.jwtSecret,
        expiresIn: this.configService.jwtAccessExpiration as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.jwtRefreshSecret,
        expiresIn: this.configService.jwtRefreshExpiration as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(userId, hash);
  }
}
