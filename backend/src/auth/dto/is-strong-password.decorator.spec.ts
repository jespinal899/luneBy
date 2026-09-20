import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ChangePasswordDto } from './change-password.dto';
import { CreateUserDto } from './create-user.dto';
import { PASSWORD_PATTERN } from './is-strong-password.decorator';
import { ResetPasswordDto } from './reset-password.dto';

const falla = async (dto: object, prop: string) =>
  (await validate(dto)).some((e) => e.property === prop);

describe('PASSWORD_PATTERN', () => {
  it.each([
    ['Abc123', true],
    ['aB9xxx', true],
    ['sinmayuscula1', false],
    ['SINMINUSCULA1', false],
    ['SinNumeroAqui', false],
  ])('%s → %s', (password, esperado) => {
    expect(PASSWORD_PATTERN.test(password)).toBe(esperado);
  });

  // La regex anterior aceptaba un símbolo *en lugar de* un número, aunque el
  // mensaje dijera exigir los tres. Ahora el símbolo no reemplaza al número.
  it('un símbolo ya no sustituye al número', () => {
    expect(PASSWORD_PATTERN.test('Abc!def')).toBe(false);
    expect(PASSWORD_PATTERN.test('Abc!de1')).toBe(true);
  });

  /**
   * Cota de ReDoS: la versión anterior tenía `.*\W+` dentro de una
   * alternativa y se disparaba con entradas así. Con lookaheads planos el
   * costo es lineal, de modo que incluso muy por encima del MaxLength(50)
   * resuelve en microsegundos.
   */
  it('resuelve una entrada larga y adversaria sin colgarse', () => {
    const adversaria = '!'.repeat(50_000);

    const inicio = Date.now();
    expect(PASSWORD_PATTERN.test(adversaria)).toBe(false);
    expect(Date.now() - inicio).toBeLessThan(1_000);
  });
});

describe('las tres pantallas exigen la misma contraseña', () => {
  it('el registro rechaza una débil y acepta una válida', async () => {
    const base = { email: 'a@b.com', fullName: 'Clienta' };

    expect(
      await falla(
        plainToInstance(CreateUserDto, { ...base, password: 'abcdef' }),
        'password',
      ),
    ).toBe(true);
    expect(
      await falla(
        plainToInstance(CreateUserDto, { ...base, password: 'Abc123' }),
        'password',
      ),
    ).toBe(false);
  });

  it('el cambio de contraseña aplica la misma regla', async () => {
    expect(
      await falla(
        plainToInstance(ChangePasswordDto, {
          currentPassword: 'loquesea',
          newPassword: 'abcdef',
        }),
        'newPassword',
      ),
    ).toBe(true);
  });

  it('la recuperación no deja poner una más débil', async () => {
    expect(
      await falla(
        plainToInstance(ResetPasswordDto, {
          resetToken: 'tok',
          newPassword: 'abcdef',
        }),
        'newPassword',
      ),
    ).toBe(true);
  });

  it('sigue habiendo largo mínimo aunque tenga los tres tipos', async () => {
    expect(
      await falla(
        plainToInstance(ResetPasswordDto, {
          resetToken: 'tok',
          newPassword: 'Ab1',
        }),
        'newPassword',
      ),
    ).toBe(true);
  });
});
