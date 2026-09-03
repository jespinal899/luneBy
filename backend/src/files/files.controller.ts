import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Response } from 'express';
import { memoryStorage } from 'multer';

import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { FilesService } from './files.service';
import { fileFilter } from './helpers';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /** Sirve una imagen guardada en disco (solo cuando no se usa Supabase Storage). */
  @Get('service/:imageName')
  findServiceImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    res.sendFile(this.filesService.getServiceImagePath(imageName));
  }

  @Post('service')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter,
      limits: { fileSize: MAX_SIZE },
      storage: memoryStorage(),
    }),
  )
  async uploadServiceImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Sube un archivo de imagen (jpg, png o webp) de hasta 5 MB',
      );
    }
    const url = await this.filesService.storeServiceImage(file);
    return { url };
  }
}
