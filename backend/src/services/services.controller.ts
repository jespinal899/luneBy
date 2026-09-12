import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';

@ApiTags('Services')
@Controller('services')
// `CacheInterceptor` solo cachea peticiones GET (60 s, en memoria). El servicio
// vacía la caché al crear/editar/borrar un servicio.
@UseInterceptors(CacheInterceptor)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Catálogo con paginación y filtros de categoría / precio.
   *
   * Sin `Cache-Control` propio a propósito: si el navegador cachea la
   * respuesta (además de la caché en memoria del servidor, que sí se
   * invalida al crear/editar/borrar), el panel admin puede seguir viendo
   * un servicio ya eliminado hasta que esa caché del navegador expire.
   */
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.servicesService.findAll(paginationDto);
  }

  /** Detalle de un servicio por id (UUID) o por slug. */
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.servicesService.findOne(term);
  }

  @Post()
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.remove(id);
  }
}
