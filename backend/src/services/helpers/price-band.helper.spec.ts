import { priceFilter } from './price-band.helper';

describe('priceFilter', () => {
  it('sin filtros devuelve undefined', () => {
    expect(priceFilter({})).toBeUndefined();
    expect(priceFilter({ price: 'any' })).toBeUndefined();
  });

  it('banda "0-50" produce un Between(0, 50)', () => {
    const op = priceFilter({ price: '0-50' });
    expect(op?.type).toBe('between');
    expect(op?.value).toEqual([0, 50]);
  });

  it('banda "200+" produce un MoreThanOrEqual(200)', () => {
    const op = priceFilter({ price: '200+' });
    expect(op?.type).toBe('moreThanOrEqual');
    expect(op?.value).toBe(200);
  });

  it('solo minPrice produce MoreThanOrEqual', () => {
    const op = priceFilter({ minPrice: 30 });
    expect(op?.type).toBe('moreThanOrEqual');
    expect(op?.value).toBe(30);
  });

  it('solo maxPrice produce LessThanOrEqual', () => {
    const op = priceFilter({ maxPrice: 80 });
    expect(op?.type).toBe('lessThanOrEqual');
    expect(op?.value).toBe(80);
  });

  it('minPrice y maxPrice producen Between', () => {
    const op = priceFilter({ minPrice: 20, maxPrice: 60 });
    expect(op?.type).toBe('between');
    expect(op?.value).toEqual([20, 60]);
  });

  it('la banda tiene prioridad sobre minPrice/maxPrice', () => {
    const op = priceFilter({ price: '50-100', minPrice: 0, maxPrice: 500 });
    expect(op?.value).toEqual([50, 100]);
  });
});
