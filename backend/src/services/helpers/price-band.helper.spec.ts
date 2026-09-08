import { priceFilter } from './price-band.helper';

describe('priceFilter', () => {
  it('sin filtros devuelve undefined', () => {
    expect(priceFilter({})).toBeUndefined();
    expect(priceFilter({ price: 'any' })).toBeUndefined();
  });

  it('banda "0-300" produce un Between(0, 300)', () => {
    const op = priceFilter({ price: '0-300' });
    expect(op?.type).toBe('between');
    expect(op?.value).toEqual([0, 300]);
  });

  it('banda "800+" produce un MoreThanOrEqual(800)', () => {
    const op = priceFilter({ price: '800+' });
    expect(op?.type).toBe('moreThanOrEqual');
    expect(op?.value).toBe(800);
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
    const op = priceFilter({ price: '300-500', minPrice: 0, maxPrice: 999 });
    expect(op?.value).toEqual([300, 500]);
  });
});
