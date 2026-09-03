import { Controller, Get, Param, Query } from '@nestjs/common';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /** Catálogo con paginación y filtros de categoría / precio. */
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.servicesService.findAll(paginationDto);
  }

  /** Detalle de un servicio por id (UUID) o por slug. */
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.servicesService.findOne(term);
  }
}
