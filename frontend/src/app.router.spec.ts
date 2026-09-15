import { describe, expect, it } from 'vitest';

import { appRouter } from './app.router';

const adminChildren = () => {
  const admin = appRouter.routes.find((r) => r.path === '/admin');
  return (admin?.children ?? []).map((c) => c.path);
};

describe('rutas del panel', () => {
  /**
   * El formulario de alta y el de edición son la misma pantalla, y distingue
   * cuál es por el parámetro: `id === 'new'`.
   *
   * Declarar además una ruta literal `agendar/new` la dejaba sin parámetro,
   * así que al crear un servicio creía estar editando y mandaba un PATCH a
   * /services/ sin id. Lo mismo valdría para el catálogo.
   */
  it('no declara rutas literales "new" que tapen el parámetro', () => {
    const paths = adminChildren();

    expect(paths).toContain('agendar/:id');
    expect(paths).toContain('products/:id');
    expect(paths.filter((p) => p?.endsWith('/new'))).toEqual([]);
  });
});
