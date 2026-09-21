import { createContext } from 'react';

import type { CatalogItem, Service } from '@/api/types';

export interface QuoteItem {
  serviceId: string;
  /**
   * Diseño elegido ("Soft Glam"), si la clienta llegó desde el catálogo.
   * Nulo cuando reservó el servicio a secas desde /shop/agendar.
   */
  catalogItemId?: string;
  name: string;
  slug: string;
  price: number;
  durationMin: number;
}

/** Desde un servicio agendable (lo que se elige en /shop/agendar). */
export const toQuoteItem = (s: Service): QuoteItem => ({
  serviceId: s.id,
  catalogItemId: undefined,
  name: s.name,
  slug: s.slug,
  price: s.price,
  durationMin: s.durationMin,
});

/**
 * Desde un diseño del catálogo. Se reserva el SERVICIO (de ahí sale la
 * duración y el cálculo de horarios) y se recuerda qué diseño eligió.
 *
 * El precio es la suma de los dos: hacer un Soft Glam es hacer el esmaltado
 * y además el diseño, así que lo del diseño se cobra encima del servicio, no
 * en lugar de él. El backend vuelve a sumarlo por su cuenta al agendar — acá
 * es solo lo que se muestra.
 */
export const catalogItemToQuoteItem = (i: CatalogItem): QuoteItem => ({
  serviceId: i.serviceId,
  catalogItemId: i.id,
  name: `${i.serviceName} · ${i.name}`,
  slug: i.slug,
  price: i.servicePrice + i.price,
  durationMin: i.durationMin,
});

export interface QuoteContextValue {
  items: QuoteItem[];
  /** Suma de precios (Lempiras). */
  total: number;
  /** Suma de duraciones (minutos). */
  totalDuration: number;
  count: number;
  isInQuote: (serviceId: string) => boolean;
  add: (item: QuoteItem) => void;
  /**
   * Deja esta línea como la de su servicio: reemplaza la que hubiera y, si
   * no había, la agrega. Sirve para elegir o cambiar el diseño sin tener
   * que consultar antes si el servicio ya estaba.
   */
  choose: (item: QuoteItem) => void;
  remove: (serviceId: string) => void;
  toggle: (item: QuoteItem) => void;
  clear: () => void;
  /** Estado del drawer lateral. */
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const QuoteContext = createContext<QuoteContextValue | null>(null);
