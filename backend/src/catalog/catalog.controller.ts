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

import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { CatalogService } from './catalog.service';
import { CreateCatalogItemDto, UpdateCatalogItemDto } from './dto';

@ApiTags('Catalog')
@Controller('catalog')
// `CacheInterceptor` solo cachea GET (60 s, en memoria). El servicio vacía
// la caché al crear/editar/borrar una entrada.
@UseInterceptors(CacheInterceptor)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /** Catálogo público: solo entradas visibles de servicios visibles. */
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.catalogService.findAll(paginationDto);
  }

  /** Mismo listado incluyendo las ocultas (para el panel admin). */
  @Get('admin/all')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  findAllForAdmin(@Query() paginationDto: PaginationDto) {
    return this.catalogService.findAll(paginationDto, { includeHidden: true });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogService.findOne(id);
  }

  @Post()
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  create(@Body() dto: CreateCatalogItemDto) {
    return this.catalogService.create(dto);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCatalogItemDto,
  ) {
    return this.catalogService.update(id, dto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogService.remove(id);
  }
}
