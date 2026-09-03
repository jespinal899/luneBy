import { existsSync, mkdirSync } from 'fs';

import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { FilesController } from './files.controller';
import { FilesService, SERVICES_UPLOAD_DIR } from './files.service';

// Asegura que la carpeta de subidas exista al arrancar.
if (!existsSync(SERVICES_UPLOAD_DIR)) {
  mkdirSync(SERVICES_UPLOAD_DIR, { recursive: true });
}

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [AuthModule],
})
export class FilesModule {}
