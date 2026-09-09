import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

/** Token de inyección del cliente de Google (mockeable en tests). */
export const GOOGLE_OAUTH_CLIENT = 'GOOGLE_OAUTH_CLIENT';

export const googleOAuthProvider = {
  provide: GOOGLE_OAUTH_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService) =>
    new OAuth2Client(config.get<string>('GOOGLE_CLIENT_ID')),
};
