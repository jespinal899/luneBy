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
 * Una entrada del catálogo público: la foto de un diseño que apunta a un
 * servicio agendable. El nombre, precio y duración NO se guardan acá — se
 * heredan del servicio, para que haya un solo lugar donde cambiarlos.
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
