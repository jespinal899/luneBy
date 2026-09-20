import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

import { IsStrongPassword } from './is-strong-password.decorator';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsString()
  @MinLength(1)
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
