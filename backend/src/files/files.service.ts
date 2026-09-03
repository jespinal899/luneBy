import { existsSync } from 'fs';
import { join } from 'path';

import { BadRequestException, Injectable } from '@nestjs/common';

export const SERVICES_UPLOAD_DIR = join(
  __dirname,
  '..',
  '..',
  'static',
  'services',
);

@Injectable()
export class FilesService {
  /** Ruta absoluta a la imagen de un servicio; 400 si no existe. */
  getServiceImagePath(imageName: string): string {
    const path = join(SERVICES_UPLOAD_DIR, imageName);
    if (!existsSync(path)) {
      throw new BadRequestException(`No hay imagen con nombre ${imageName}`);
    }
    return path;
  }
}
