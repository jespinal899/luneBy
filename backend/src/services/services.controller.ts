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
} from '@nestjs/common';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';

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

  @Post()
  @Auth(ValidRoles.admin)
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.remove(id);
  }
}
