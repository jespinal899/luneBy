import { IsString } from 'class-validator';

import { IsStrongPassword } from './is-strong-password.decorator';

export class ResetPasswordDto {
  /** Comprobante de que el código se acertó recién (lo emite el paso 2). */
  @IsString()
  resetToken: string;

  // Mismas reglas que al cambiar la contraseña estando dentro: recuperarla no
  // puede ser la puerta para poner una más débil.
  @IsStrongPassword()
  newPassword: string;
}
