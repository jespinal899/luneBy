import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';

@Module({
  providers: [ServicesService],
  imports: [TypeOrmModule.forFeature([Service])],
  exports: [ServicesService, TypeOrmModule],
})
export class ServicesModule {}
