import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordReset } from './entities/password-reset.entity';
import { User } from './entities/user.entity';
import { PasswordResetService } from './password-reset.service';
import { googleOAuthProvider } from './google-oauth.provider';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordResetService,
    JwtStrategy,
    googleOAuthProvider,
  ],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, PasswordReset]),
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') ?? '2h',
        },
      }),
    }),
  ],
  exports: [
    AuthService,
    PasswordResetService,
    TypeOrmModule,
    JwtStrategy,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
