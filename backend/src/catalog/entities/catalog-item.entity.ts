import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Service } from '../../services/entities/service.entity';

/**
 * Un diseño del catálogo: "Soft Glam", "French", "Cat Eye"…
 *
 * Tiene nombre y precio propios y pertenece a un servicio agendable
 * (Servicio 1 → N Diseños). La duración sí se hereda del servicio: es lo que
 * usa el motor de disponibilidad para calcular los horarios libres, así que
 * vive en un solo lugar.
 */
@Entity({ name: 'catalog_items' })
export class CatalogItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Servicio agendable al que corresponde este diseño. */
  @ManyToOne(() => Service, {
    eager: true,
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  /** Nombre del diseño, elegido por la administradora ("Soft Glam"). */
  @Column('text')
  name: string;

  /** Precio propio del diseño. */
  @Column('float', { default: 0 })
  price: number;

  /** Foto del diseño. */
  @Column('text', { nullable: true })
  image: string | null;

  /** Texto propio de esta entrada (el del servicio se usa como respaldo). */
  @Column('text', { nullable: true })
  description: string | null;

  /** Si la entrada se muestra en el catálogo público. */
  @Column('bool', { name: 'isActive', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
