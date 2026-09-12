import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { HealthController } from './health.controller';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CatalogModule } from './catalog/catalog.module';
import { FilesModule } from './files/files.module';
import { MailModule } from './mail/mail.module';

const buildDbOptions = (config: ConfigService): TypeOrmModuleOptions => {
  const common: TypeOrmModuleOptions = {
    type: 'postgres',
    autoLoadEntities: true,
    // El esquema y los datos base los gestionan las migraciones SQL de
    // `supabase/migrations` (Supabase CLI). La app solo se conecta.
    synchronize: false,
  };

  // Con `DATABASE_URL` (connection string del pooler de Supabase) se usa esa;
  // si no, se arma desde las variables `DB_*`.
  const url = config.get<string>('DATABASE_URL');
  if (url) {
    return {
      ...common,
      url,
      ssl: { rejectUnauthorized: false },
      // El pooler de Supabase (free) tiene pocas conexiones: limitamos el pool.
      extra: { max: 5 },
    };
  }

  const isProd = config.get('STAGE') === 'prod';
  return {
    ...common,
    host: config.get<string>('DB_HOST'),
    port: +config.get<string>('DB_PORT'),
    database: config.get<string>('DB_NAME'),
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>('DB_PASSWORD'),
    ssl: isProd,
    extra: isProd ? { max: 5, ssl: { rejectUnauthorized: false } } : undefined,
  };
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Eventos de dominio (ej. "se creó una cita") desacoplados de quien
    // los emite: AppointmentsService no sabe que existe el correo.
    EventEmitterModule.forRoot(),

    // 100 peticiones por minuto y por IP (global).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Caché en memoria del proceso. La usan las lecturas del catálogo
    // (`ServicesController`) vía `CacheInterceptor`. TTL en milisegundos.
    CacheModule.register({ isGlobal: true, ttl: 60_000, max: 200 }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildDbOptions,
    }),

    CommonModule,
    AuthModule,
    ServicesModule,
    AppointmentsModule,
    CatalogModule,
    FilesModule,
    MailModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
