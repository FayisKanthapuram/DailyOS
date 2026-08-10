import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppConfigService } from '../../config/config.service.js';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly configService: AppConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!this.configService.googleClientId || !this.configService.googleClientSecret) {
      throw new UnauthorizedException(
        'Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env',
      );
    }
    return super.canActivate(context);
  }
}
