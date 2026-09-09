import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  /** ID token (JWT) que devuelve Google Identity Services en el navegador. */
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
