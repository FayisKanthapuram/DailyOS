import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AppConfigService } from '../../../config/config.service.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(configService: AppConfigService) {
    const clientID = configService.googleClientId || 'DISABLED_CLIENT_ID';
    const clientSecret = configService.googleClientSecret || 'DISABLED_CLIENT_SECRET';
    const callbackURL = configService.googleCallbackUrl;

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });

    if (configService.googleClientId && configService.googleClientSecret) {
      this.logger.log('Google OAuth Strategy initialized with configured environment credentials');
    } else {
      this.logger.warn('Google OAuth Strategy initialized in disabled mode (missing credentials)');
    }
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      name?: { givenName?: string; familyName?: string };
      emails?: Array<{ value: string }>;
      photos?: Array<{ value: string }>;
    },
    done: VerifyCallback,
  ): void {
    const { name, emails, photos } = profile;
    const givenName = name?.givenName || '';
    const familyName = name?.familyName || '';
    const email = emails?.[0]?.value || '';
    const fullName = `${givenName} ${familyName}`.trim() || email;

    const user = {
      email,
      name: fullName,
      avatar: photos?.[0]?.value || null,
    };

    done(null, user);
  }
}
