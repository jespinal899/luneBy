import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * Exige una minúscula, una mayúscula y un número.
 *
 * Cada `(?=...)` recorre la entrada una sola vez y ninguno anida
 * cuantificadores, así que el costo es lineal. La versión anterior
 * —`(?:(?=.*\d)|(?=.*\W+))...`— tenía un `.*\W+` dentro de una alternativa:
 * con una contraseña larga y hecha a propósito, el motor podía entrar en
 * retroceso exponencial (ReDoS) en endpoints públicos y sin autenticar.
 *
 * De paso ahora la regla coincide con el mensaje: la anterior aceptaba un
 * símbolo *en lugar de* un número, aunque dijera exigir los tres.
 */
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const PASSWORD_MESSAGE =
  'La contraseña debe tener una mayúscula, una minúscula y un número';

/**
 * Reglas de contraseña en un solo lugar: las tres pantallas que la fijan
 * (registro, cambio y recuperación) deben exigir exactamente lo mismo, o
 * recuperarla se vuelve la puerta para poner una más débil.
 */
export const IsStrongPassword = () =>
  applyDecorators(
    IsString(),
    MinLength(6),
    MaxLength(50),
    Matches(PASSWORD_PATTERN, { message: PASSWORD_MESSAGE }),
  );
