import { Body, Controller, Get, Put, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { UpdateHeroDto } from './dto';
import { SiteContentService } from './site-content.service';

@ApiTags('SiteContent')
@Controller('site-content')
@UseInterceptors(CacheInterceptor)
export class SiteContentController {
  constructor(private readonly siteContentService: SiteContentService) {}

  /** Portada del sitio. Público: lo lee cada visitante al entrar. */
  @Get('hero')
  getHero() {
    return this.siteContentService.getHero();
  }

  // PUT y no PATCH: la portada se guarda entera desde el formulario, no por
  // campos sueltos.
  @Put('hero')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  updateHero(@Body() dto: UpdateHeroDto) {
    return this.siteContentService.updateHero(dto);
  }
}
