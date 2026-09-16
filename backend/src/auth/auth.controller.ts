import { Body, Controller, Get, Header, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { Auth, GetUser } from './decorators';
import {
  ChangePasswordDto,
  CreateUserDto,
  ForgotPasswordDto,
  GoogleLoginDto,
  LoginUserDto,
  ResetPasswordDto,
  UpdateProfileDto,
  VerifyResetCodeDto,
} from './dto';
import { User } from './entities/user.entity';
import { PasswordResetService } from './password-reset.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  // Nada de auth se cachea: las respuestas llevan el token del usuario.
  // Límites estrictos contra fuerza bruta / creación masiva de cuentas.
  @Post('register')
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  // --- Recuperación de contraseña ---

  /**
   * Paso 1: manda un código al correo.
   *
   * Límite bien bajo: cada llamada manda un correo a una dirección que elige
   * quien llama, así que sin tope el formulario sirve para llenarle el buzón
   * a cualquiera.
   */
  @Post('forgot-password')
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 3, ttl: 15 * 60_000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordResetService.requestCode(dto);
  }

  /** Paso 2: comprueba el código y devuelve el comprobante del paso 3. */
  @Post('verify-reset-code')
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 10, ttl: 15 * 60_000 } })
  verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return this.passwordResetService.verifyCode(dto);
  }

  /** Paso 3: guarda la contraseña nueva. */
  @Post('reset-password')
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(dto);
  }

  /** Inicia sesión o crea la cuenta con el ID token de Google. */
  @Post('google')
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  loginWithGoogle(@Body() dto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(dto.idToken);
  }

  @Get('check-status')
  @Auth()
  @ApiBearerAuth()
  @Header('Cache-Control', 'no-store')
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Patch('profile')
  @Auth()
  @ApiBearerAuth()
  @Header('Cache-Control', 'no-store')
  updateProfile(@GetUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user, dto);
  }

  @Patch('password')
  @Auth()
  @ApiBearerAuth()
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  changePassword(@GetUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user, dto);
  }
}
