import { describe, expect, it } from 'vitest';

import type { CatalogItem, Service } from '@/api/types';
import { catalogItemToQuoteItem, toQuoteItem } from './quote-context';

const esmaltado = {
  id: 'svc-1',
  name: 'Esmaltado',
  slug: 'esmaltado',
  price: 350,
  durationMin: 45,
} as Service;

const softGlam = {
  id: 'dis-1',
  serviceId: 'svc-1',
  name: 'Soft Glam',
  serviceName: 'Esmaltado',
  slug: 'esmaltado',
  // Lo que suma el diseño sobre el servicio, no el precio final.
  price: 450,
  servicePrice: 350,
  durationMin: 45,
} as CatalogItem;

describe('cotización', () => {
  it('desde un diseño suma el servicio y el adicional del diseño', () => {
    const item = catalogItemToQuoteItem(softGlam);

    expect(item.name).toBe('Esmaltado · Soft Glam');
    // 350 del esmaltado + 450 del diseño.
    expect(item.price).toBe(800);
    // Reserva el servicio (de ahí sale la duración y el cálculo de horarios)…
    expect(item.serviceId).toBe('svc-1');
    // …pero recuerda qué diseño fue, para que se cobre lo cotizado.
    expect(item.catalogItemId).toBe('dis-1');
  });

  it('desde un servicio a secas no hay diseño que recordar', () => {
    const item = toQuoteItem(esmaltado);

    expect(item.name).toBe('Esmaltado');
    expect(item.price).toBe(350);
    expect(item.serviceId).toBe('svc-1');
    expect(item.catalogItemId).toBeUndefined();
  });

  it('la duración siempre sale del servicio', () => {
    expect(catalogItemToQuoteItem(softGlam).durationMin).toBe(45);
    expect(toQuoteItem(esmaltado).durationMin).toBe(45);
  });
});
