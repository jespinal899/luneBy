import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateServiceDto } from './create-service.dto';

const build = (
  overrides: Partial<Record<keyof CreateServiceDto, unknown>> = {},
) =>
  plainToInstance(CreateServiceDto, {
    name: 'Manicura rusa',
    price: 450,
    category: 'Manicura',
    durationMin: 60,
    ...overrides,
  });

const errorProps = async (dto: object) =>
  (await validate(dto)).map((e) => e.property);

describe('CreateServiceDto', () => {
  it('acepta un servicio válido', async () => {
    expect(await errorProps(build())).toEqual([]);
  });

  it('acepta "" en image y lo normaliza a null (quitar la foto)', async () => {
    const dto = build({ image: '' });
    expect(await errorProps(dto)).toEqual([]);
    expect(dto.image).toBeNull();
  });

  it('rechaza una image que no es una URL', async () => {
    expect(await errorProps(build({ image: 'no-es-url' }))).toContain('image');
  });

  it('acepta una image con una URL válida', async () => {
    expect(
      await errorProps(build({ image: 'https://cdn.example.com/foto.webp' })),
    ).toEqual([]);
  });

  it('acepta "" en description (quitar la descripción)', async () => {
    expect(await errorProps(build({ description: '' }))).toEqual([]);
  });
});
