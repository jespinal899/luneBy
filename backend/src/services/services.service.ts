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
      sort = 'name',
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

    // `ORDER BY "name"` de Postgres es sensible a mayúsculas (las minúsculas
    // ordenan después de TODAS las mayúsculas); se ordena en memoria con
    // `localeCompare` en vez de pedirle el orden a la base. El catálogo es
    // chico, así que paginar acá sale más barato que un QueryBuilder.
    //
    // Aun así, alfabético siempre deja afuera de un `limit` chico (la vista
    // previa del home) lo último del abecedario, sin importar qué tan nuevo
    // sea — por eso existe `sort=recent`: created más nueva primero.
    const all = await this.serviceRepository.find({ where });
    if (sort === 'recent') {
      all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      all.sort((a, b) =>
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
      );
    }

    const count = all.length;
    const start = (page - 1) * limit;
    const services = all.slice(start, start + limit);

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
