import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { priceBounds } from '../services/helpers/price-band.helper';
import { CreateCatalogItemDto, UpdateCatalogItemDto } from './dto';
import { CatalogItem } from './entities/catalog-item.entity';

/**
 * Forma con la que viaja un diseño al frontend: sus datos propios (nombre,
 * precio, foto, descripción) más los que sigue aportando el servicio al que
 * pertenece (duración, categoría, slug) y el nombre de ese servicio, para
 * poder mostrarlo como "Soft Glam · Esmaltado". Aplanarlo acá evita que cada
 * pantalla tenga que saber de dónde sale cada campo.
 */
export interface CatalogItemView {
  id: string;
  serviceId: string;
  name: string;
  /** Lo que suma el diseño sobre el precio del servicio. */
  price: number;
  /** Nombre del servicio al que pertenece ("Esmaltado"). */
  serviceName: string;
  /** Precio base del servicio, al que se le suma el del diseño. */
  servicePrice: number;
  durationMin: number;
  category: string;
  slug: string;
  image: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(CatalogItem)
    private readonly catalogRepository: Repository<CatalogItem>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  /** Vacía la caché del catálogo (la llena el `CacheInterceptor` del GET). */
  private invalidate() {
    return this.cache.reset();
  }

  private toView(item: CatalogItem): CatalogItemView {
    return {
      id: item.id,
      serviceId: item.service.id,
      name: item.name,
      price: item.price,
      serviceName: item.service.name,
      servicePrice: item.service.price,
      durationMin: item.service.durationMin,
      category: item.service.category,
      slug: item.service.slug,
      image: item.image,
      // Si la entrada no trae texto propio, se usa el del servicio.
      description: item.description ?? item.service.description,
      isActive: item.isActive,
      createdAt: item.createdAt,
    };
  }

  /**
   * Listado del catálogo. Por defecto solo devuelve entradas visibles cuyo
   * servicio también lo esté; el panel admin pide `includeHidden`.
   */
  async findAll(
    paginationDto: PaginationDto,
    { includeHidden = false }: { includeHidden?: boolean } = {},
  ) {
    const {
      page = 1,
      limit = 12,
      q,
      categorias,
      servicios,
      price,
      minPrice,
      maxPrice,
      sort = 'name',
    } = paginationDto;

    const qb = this.catalogRepository
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.service', 'service');

    if (!includeHidden) {
      qb.andWhere('item."isActive" = true').andWhere(
        'service."isActive" = true',
      );
    }

    const categories = categorias
      ?.split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    if (categories?.length) {
      qb.andWhere('service.category IN (:...categories)', { categories });
    }

    const serviceIds = servicios
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (serviceIds?.length) {
      qb.andWhere('service.id IN (:...serviceIds)', { serviceIds });
    }

    // Busca tanto por el diseño como por su servicio: "Soft Glam" encuentra
    // el diseño, y "Esmaltado" trae todos los diseños de ese servicio.
    if (q)
      qb.andWhere('(item.name ILIKE :q OR service.name ILIKE :q)', {
        q: `%${q}%`,
      });

    const { lo, hi } = priceBounds({ price, minPrice, maxPrice });
    // Por el precio del diseño, que es el que se muestra en el catálogo.
    if (lo !== undefined) qb.andWhere('item.price >= :lo', { lo });
    if (hi !== undefined) qb.andWhere('item.price <= :hi', { hi });

    const rows = await qb.getMany();
    const views = rows.map((r) => this.toView(r));

    // Mismo criterio que el catálogo de servicios: alfabético insensible a
    // mayúsculas, o los más nuevos primero para las vistas previas.
    if (sort === 'recent') {
      views.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      views.sort((a, b) =>
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
      );
    }

    const count = views.length;
    const start = (page - 1) * limit;

    return {
      count,
      page,
      pages: Math.ceil(count / limit),
      // El frontend consume la lista bajo la clave `products`.
      products: views.slice(start, start + limit),
    };
  }

  async findOne(id: string): Promise<CatalogItemView> {
    const item = await this.catalogRepository.findOneBy({ id });
    if (!item) throw new NotFoundException('Diseño no encontrado');
    return this.toView(item);
  }

  async create(dto: CreateCatalogItemDto) {
    const { serviceId, ...rest } = dto;
    const item = this.catalogRepository.create({
      ...rest,
      service: { id: serviceId },
    });
    await this.catalogRepository.save(item);
    await this.invalidate();
    return this.findOne(item.id);
  }

  async update(id: string, dto: UpdateCatalogItemDto) {
    const { serviceId, ...rest } = dto;
    const item = await this.catalogRepository.preload({
      id,
      ...rest,
      ...(serviceId ? { service: { id: serviceId } } : {}),
    });
    if (!item) throw new NotFoundException('Diseño no encontrado');

    await this.catalogRepository.save(item);
    await this.invalidate();
    return this.findOne(id);
  }

  async remove(id: string) {
    const item = await this.catalogRepository.findOneBy({ id });
    if (!item) throw new NotFoundException('Diseño no encontrado');

    await this.catalogRepository.remove(item);
    await this.invalidate();
  }
}
