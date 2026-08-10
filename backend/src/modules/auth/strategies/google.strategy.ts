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

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const givenName = name?.givenName || '';
    const familyName = name?.familyName || '';
    const fullName = `${givenName} ${familyName}`.trim() || emails[0].value;

    const user = {
      email: emails[0].value,
      name: fullName,
      avatar: photos?.[0]?.value || null,
    };

    done(null, user);
  }
}
