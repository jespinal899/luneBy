import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // 100 peticiones por minuto y por IP (global).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      ssl: process.env.STAGE === 'prod',
      extra:
        process.env.STAGE === 'prod'
          ? { ssl: { rejectUnauthorized: false } }
          : undefined,
      autoLoadEntities: true,
      // En prod se desactiva y se usan migraciones.
      synchronize: process.env.STAGE !== 'prod',
    }),

    CommonModule,
    AuthModule,
    ServicesModule,
    AppointmentsModule,
    SeedModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
