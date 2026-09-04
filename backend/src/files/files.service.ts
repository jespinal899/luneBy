import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SupabaseStorageService } from './storage/supabase-storage.service';

export const SERVICES_UPLOAD_DIR = join(
  __dirname,
  '..',
  '..',
  'static',
  'services',
);

@Injectable()
export class FilesService {
  private readonly logger = new Logger('FilesService');

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseStorageService,
  ) {}

  /**
   * Guarda una imagen de servicio y devuelve su URL.
   * Usa Supabase Storage si está configurado; si no, el disco local.
   */
  async storeServiceImage(file: Express.Multer.File): Promise<string> {
    const ext = file.mimetype.split('/')[1];
    const filename = `${randomUUID()}.${ext}`;

    try {
      if (this.supabase.isEnabled()) {
        return await this.supabase.upload(filename, file.buffer, file.mimetype);
      }

      await mkdir(SERVICES_UPLOAD_DIR, { recursive: true });
      await writeFile(join(SERVICES_UPLOAD_DIR, filename), file.buffer);
      const host =
        this.config.get<string>('HOST_API') ?? 'http://localhost:3001/api';
      return `${host}/files/service/${filename}`;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Fallo al guardar la imagen (${file.mimetype}, ${file.size} bytes): ${detail}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('No se pudo guardar la imagen');
    }
  }

  /** Ruta absoluta a una imagen guardada en disco (fallback local). */
  getServiceImagePath(imageName: string): string {
    const path = join(SERVICES_UPLOAD_DIR, imageName);
    if (!existsSync(path)) {
      throw new BadRequestException(`No hay imagen con nombre ${imageName}`);
    }
    return path;
  }
}
