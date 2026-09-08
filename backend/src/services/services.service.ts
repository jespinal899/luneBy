import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { isUUID } from 'class-validator';
import { ILike, In, Repository } from 'typeorm';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { CreateServiceDto, UpdateServiceDto } from './dto';
import { Service } from './entities/service.entity';
import { priceFilter } from './helpers/price-band.helper';

// Los errores de constraint (nombre/slug duplicado) los traduce a 409 el
// `DatabaseExceptionFilter` global.
@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  /** Vacía la caché del catálogo (la llena el `CacheInterceptor` del GET). */
  private invalidate() {
    return this.cache.reset();
  }

  async create(createServiceDto: CreateServiceDto) {
    const service = this.serviceRepository.create(createServiceDto);
    await this.serviceRepository.save(service);
    await this.invalidate();
    return service;
  }

  async findAll(paginationDto: PaginationDto) {
    const {
      page = 1,
      limit = 12,
      q,
      categorias,
      price,
      minPrice,
      maxPrice,
    } = paginationDto;

    const categories = categorias
      ?.split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const where = {
      price: priceFilter({ price, minPrice, maxPrice }),
      category: categories?.length ? In(categories) : undefined,
      name: q ? ILike(`%${q}%`) : undefined,
    };

    const [services, count] = await this.serviceRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { name: 'ASC' },
    });

    return {
      count,
      page,
      pages: Math.ceil(count / limit),
      // El frontend consume la lista bajo la clave `products`.
      products: services,
    };
  }

  async findOne(term: string) {
    const service = isUUID(term)
      ? await this.serviceRepository.findOneBy({ id: term })
      : await this.serviceRepository.findOneBy({ slug: term });

    if (!service)
      throw new NotFoundException(`Servicio "${term}" no encontrado`);

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const service = await this.serviceRepository.preload({
      id,
      ...updateServiceDto,
    });

    if (!service)
      throw new NotFoundException(`Servicio con id ${id} no encontrado`);

    await this.serviceRepository.save(service);
    await this.invalidate();
    return service;
  }

  async remove(id: string) {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
    await this.invalidate();
  }
}
