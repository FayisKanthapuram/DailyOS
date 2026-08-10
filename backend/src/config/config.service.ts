import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT', 3001);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get databaseUrl(): string {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  get jwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  get jwtRefreshSecret(): string {
    return this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'supersecret_jwt_refresh_key_change_in_prod',
    );
  }

  get jwtAccessExpiration(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m');
  }

  get jwtRefreshExpiration(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');
  }

  get frontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  }

  get googleClientId(): string | undefined {
    return this.configService.get<string>('GOOGLE_CLIENT_ID');
  }

  get googleClientSecret(): string | undefined {
    return this.configService.get<string>('GOOGLE_CLIENT_SECRET');
  }

  get googleCallbackUrl(): string {
    return this.configService.get<string>(
      'GOOGLE_CALLBACK_URL',
      'http://localhost:3001/api/auth/google/callback',
    );
  }
}
