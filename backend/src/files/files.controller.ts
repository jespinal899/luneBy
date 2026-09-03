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
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Response } from 'express';
import { diskStorage } from 'multer';

import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { FilesService, SERVICES_UPLOAD_DIR } from './files.service';
import { fileFilter, fileNamer } from './helpers';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

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
      storage: diskStorage({
        destination: SERVICES_UPLOAD_DIR,
        filename: fileNamer,
      }),
    }),
  )
  uploadServiceImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Sube un archivo de imagen (jpg, png o webp) de hasta 5 MB',
      );
    }

    const host =
      this.configService.get<string>('HOST_API') ?? 'http://localhost:3001/api';
    return { url: `${host}/files/service/${file.filename}` };
  }
}
