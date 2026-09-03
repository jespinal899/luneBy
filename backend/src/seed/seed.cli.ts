import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

/**
 * Poblado de datos desde la terminal: `npm run seed`.
 * Funciona también en producción (no pasa por el endpoint bloqueado).
 */
async function runSeed() {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const result = await app.get(SeedService).execute();
    logger.log(result.message);
  } finally {
    await app.close();
  }
}

runSeed().catch((error) => {
  new Logger('Seed').error(error);
  process.exit(1);
});
