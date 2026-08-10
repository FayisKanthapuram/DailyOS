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

  /**
   * JWT refresh secret — required in production.
   * Uses getOrThrow so a missing value fails fast at startup.
   */
  get jwtRefreshSecret(): string {
    return this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
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

  /**
   * Returns the list of allowed CORS origins.
   * Parses both CORS_ORIGIN and FRONTEND_URL environment variables.
   * Handles comma-separated lists, trims whitespace, strips trailing slashes, and deduplicates.
   */
  get corsOrigins(): string[] {
    const rawOrigins = [
      this.configService.get<string>('CORS_ORIGIN'),
      this.configService.get<string>('FRONTEND_URL'),
    ];

    const origins: string[] = [];

    for (const raw of rawOrigins) {
      if (!raw) continue;
      const parts = raw
        .split(',')
        .map((o) => o.trim().replace(/\/+$/, ''))
        .filter(Boolean);
      origins.push(...parts);
    }

    if (this.isDevelopment && !origins.includes('http://localhost:5173')) {
      origins.push('http://localhost:5173');
    }

    return Array.from(new Set(origins));
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
