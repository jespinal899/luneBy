import { existsSync, mkdirSync } from 'fs';

import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { FilesController } from './files.controller';
import { FilesService, SERVICES_UPLOAD_DIR } from './files.service';
import { SupabaseStorageService } from './storage/supabase-storage.service';

// Carpeta para el fallback a disco (dev sin Supabase Storage).
if (!existsSync(SERVICES_UPLOAD_DIR)) {
  mkdirSync(SERVICES_UPLOAD_DIR, { recursive: true });
}

@Module({
  controllers: [FilesController],
  providers: [FilesService, SupabaseStorageService],
  imports: [AuthModule],
})
export class FilesModule {}
