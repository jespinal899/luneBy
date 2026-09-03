import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  /** Reinicia la base de datos con los datos de ejemplo. STAGE=prod lo bloquea. */
  @Get()
  executeSeed() {
    return this.seedService.runSeed();
  }
}
