import { createContext } from 'react';

import type { Service } from '@/api/types';

export interface QuoteItem {
  serviceId: string;
  name: string;
  slug: string;
  price: number;
  durationMin: number;
}

export const toQuoteItem = (s: Service): QuoteItem => ({
  serviceId: s.id,
  name: s.name,
  slug: s.slug,
  price: s.price,
  durationMin: s.durationMin,
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
  remove: (serviceId: string) => void;
  toggle: (item: QuoteItem) => void;
  clear: () => void;
  /** Estado del drawer lateral. */
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const QuoteContext = createContext<QuoteContextValue | null>(null);
