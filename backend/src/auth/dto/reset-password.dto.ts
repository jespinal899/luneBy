import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  /** Comprobante de que el código se acertó recién (lo emite el paso 2). */
  @IsString()
  resetToken: string;

  // Mismas reglas que al cambiar la contraseña estando dentro: recuperarla no
  // puede ser la puerta para poner una más débil.
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener una mayúscula, una minúscula y un número',
  })
  newPassword: string;
}
