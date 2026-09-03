import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  /** Liveness check para Render: responde sin tocar la base de datos. */
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
