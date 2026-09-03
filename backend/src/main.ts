import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // Detrás del proxy de Render/Supabase: necesario para el rate limiting por IP.
  app.set('trust proxy', 1);

  // Cabeceras de seguridad. CSP desactivada porque la única página HTML que
  // servimos es Swagger UI (usa scripts/estilos inline).
  app.use(helmet({ contentSecurityPolicy: false }));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (process.env.FRONTEND_URL ?? 'http://localhost:5173').split(','),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Luné by Kelin API')
    .setDescription('Catálogo de servicios de manicura y agendado de citas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`App corriendo en el puerto ${port}`);
  logger.log(`Documentación en http://localhost:${port}/api/docs`);
}
bootstrap();
