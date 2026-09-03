import { Controller, Get } from '@nestjs/common';

import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  /** Reinicia la base de datos con los datos de ejemplo. STAGE=prod lo bloquea. */
  @Get()
  executeSeed() {
    return this.seedService.runSeed();
  }
}
