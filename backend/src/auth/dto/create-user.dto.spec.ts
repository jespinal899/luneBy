import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

const build = (overrides: Partial<Record<keyof CreateUserDto, unknown>> = {}) =>
  plainToInstance(CreateUserDto, {
    email: 'clienta@example.com',
    password: 'Abc123',
    fullName: 'Clienta Ejemplo',
    ...overrides,
  });

const errorProps = async (dto: object) =>
  (await validate(dto)).map((e) => e.property);

describe('CreateUserDto', () => {
  it('acepta un registro válido', async () => {
    expect(await errorProps(build())).toEqual([]);
  });

  it('rechaza un email con formato inválido', async () => {
    expect(await errorProps(build({ email: 'no-es-email' }))).toContain(
      'email',
    );
  });

  it('rechaza una contraseña sin mayúscula, minúscula y número', async () => {
    expect(await errorProps(build({ password: 'todo-minusculas' }))).toContain(
      'password',
    );
  });

  it('rechaza una contraseña demasiado corta', async () => {
    expect(await errorProps(build({ password: 'Ab1' }))).toContain('password');
  });

  it('rechaza un nombre vacío', async () => {
    expect(await errorProps(build({ fullName: '' }))).toContain('fullName');
  });

  it('permite omitir el teléfono', async () => {
    const dto = build();
    delete (dto as { phone?: string }).phone;
    expect(await errorProps(dto)).toEqual([]);
  });
});
