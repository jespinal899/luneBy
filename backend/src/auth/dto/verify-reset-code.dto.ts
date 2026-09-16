import { Transform } from 'class-transformer';
import { IsEmail, Matches } from 'class-validator';

export class VerifyResetCodeDto {
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  email: string;

  /** Seis dígitos, tal cual viajan en el correo. */
  @Matches(/^\d{6}$/, { message: 'El código son 6 dígitos' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  code: string;
}
