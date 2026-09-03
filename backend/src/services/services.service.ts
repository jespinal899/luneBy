import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { ILike, In, Repository } from 'typeorm';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { CreateServiceDto, UpdateServiceDto } from './dto';
import { Service } from './entities/service.entity';
import { priceFilter } from './helpers/price-band.helper';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger('ServicesService');

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto) {
    try {
      const service = this.serviceRepository.create(createServiceDto);
      await this.serviceRepository.save(service);
      return service;
    } catch (error) {
      this.handleDBExceptions(error);
    }
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

    try {
      await this.serviceRepository.save(service);
      return service;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
  }

  private handleDBExceptions(error: { code?: string; detail?: string }): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Error inesperado, revisa los logs del servidor',
    );
  }
}
