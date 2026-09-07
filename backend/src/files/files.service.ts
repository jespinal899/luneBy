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
import sharp from 'sharp';

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
    const { body, ext, contentType } = await this.optimize(file);
    const filename = `${randomUUID()}.${ext}`;

    try {
      if (this.supabase.isEnabled()) {
        return await this.supabase.upload(filename, body, contentType);
      }

      await mkdir(SERVICES_UPLOAD_DIR, { recursive: true });
      await writeFile(join(SERVICES_UPLOAD_DIR, filename), body);
      const host =
        this.config.get<string>('HOST_API') ?? 'http://localhost:3001/api';
      return `${host}/files/service/${filename}`;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Fallo al guardar la imagen (${contentType}, ${file.size} bytes): ${detail}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('No se pudo guardar la imagen');
    }
  }

  /**
   * Redimensiona y comprime la imagen a WebP: una foto de móvil de 4 MB acaba
   * pesando ~40 KB. Si la optimización falla (p. ej. `sharp` no disponible en
   * el entorno), guarda el archivo original en vez de reventar la subida.
   */
  private async optimize(
    file: Express.Multer.File,
  ): Promise<{ body: Buffer; ext: string; contentType: string }> {
    try {
      const body = await sharp(file.buffer)
        .rotate() // respeta la orientación EXIF
        .resize({
          width: 1000,
          height: 1000,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 74 })
        .toBuffer();
      return { body, ext: 'webp', contentType: 'image/webp' };
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `No se pudo optimizar la imagen (${file.mimetype}), se guarda el original: ${detail}`,
      );
      const ext = (file.mimetype.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg');
      return { body: file.buffer, ext, contentType: file.mimetype };
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
