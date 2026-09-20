import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  createService,
  deleteService,
  getService,
  getServices,
  getServicesForAdmin,
  toParams,
  updateService,
} from './services.actions';

vi.mock('@/api/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const { http } = await import('@/api/http');
const get = vi.mocked(http.get);
const post = vi.mocked(http.post);
const patch = vi.mocked(http.patch);
const del = vi.mocked(http.delete);

const respuesta = <T>(data: T) => ({ data }) as never;

describe('toParams', () => {
  it('conserva los filtros con valor', () => {
    expect(toParams({ page: 2, q: 'uñas', sort: 'recent' })).toEqual({
      page: 2,
      q: 'uñas',
      sort: 'recent',
    });
  });

  it('descarta vacíos, indefinidos y el "any" del selector de precio', () => {
    expect(toParams({ q: '', price: 'any', categorias: undefined, page: 1 }))
      .toEqual({ page: 1 });
  });

  it('sin filtros devuelve un objeto vacío', () => {
    expect(toParams({})).toEqual({});
  });
});

describe('services.actions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getServices pide el catálogo público con los filtros limpios', async () => {
    get.mockResolvedValue(respuesta({ products: [], total: 0 }));

    const data = await getServices({ page: 1, price: 'any' });

    expect(get).toHaveBeenCalledWith('/services', { params: { page: 1 } });
    expect(data).toEqual({ products: [], total: 0 });
  });

  it('getServices funciona sin argumentos', async () => {
    get.mockResolvedValue(respuesta({ products: [], total: 0 }));

    await getServices();

    expect(get).toHaveBeenCalledWith('/services', { params: {} });
  });

  it('getService busca por id o slug', async () => {
    get.mockResolvedValue(respuesta({ id: 'abc' }));

    const data = await getService('manicura-rusa');

    expect(get).toHaveBeenCalledWith('/services/manicura-rusa');
    expect(data).toEqual({ id: 'abc' });
  });

  it('getServicesForAdmin usa el endpoint que incluye los ocultos', async () => {
    get.mockResolvedValue(respuesta({ products: [], total: 0 }));

    await getServicesForAdmin({ q: 'gel' });

    expect(get).toHaveBeenCalledWith('/services/admin/all', {
      params: { q: 'gel' },
    });
  });

  it('createService manda el cuerpo normalizado', async () => {
    post.mockResolvedValue(respuesta({ id: 'nuevo' }));

    await createService({
      name: 'Manicura',
      price: 350,
      durationMin: 60,
      description: '  pulido y esmalte  ',
    });

    expect(post).toHaveBeenCalledWith('/services', {
      name: 'Manicura',
      price: 350,
      durationMin: 60,
      isActive: true,
      description: 'pulido y esmalte',
    });
  });

  it('una descripción en blanco viaja como null, para que el backend la limpie', async () => {
    post.mockResolvedValue(respuesta({ id: 'nuevo' }));

    await createService({
      name: 'Pedicura',
      price: 400,
      durationMin: 45,
      description: '   ',
      isActive: false,
    });

    expect(post).toHaveBeenCalledWith('/services', {
      name: 'Pedicura',
      price: 400,
      durationMin: 45,
      isActive: false,
      description: null,
    });
  });

  it('updateService aplica el mismo cuerpo sobre el id', async () => {
    patch.mockResolvedValue(respuesta({ id: 'abc' }));

    await updateService('abc', { name: 'Gel', price: 500, durationMin: 90 });

    expect(patch).toHaveBeenCalledWith('/services/abc', {
      name: 'Gel',
      price: 500,
      durationMin: 90,
      isActive: true,
      description: null,
    });
  });

  it('deleteService no devuelve nada', async () => {
    del.mockResolvedValue(respuesta(undefined));

    await expect(deleteService('abc')).resolves.toBeUndefined();
    expect(del).toHaveBeenCalledWith('/services/abc');
  });
});
