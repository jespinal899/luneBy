import 'reflect-metadata';

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const isProd = process.env.STAGE === 'prod';

/**
 * DataSource para la CLI de TypeORM (generar / correr / revertir migraciones).
 * La aplicación NestJS usa su propia configuración en `app.module.ts`.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: isProd,
  extra: isProd ? { ssl: { rejectUnauthorized: false } } : undefined,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
