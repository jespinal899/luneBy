import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CatalogItem } from './entities/catalog-item.entity';

@Module({
  controllers: [CatalogController],
  providers: [CatalogService],
  imports: [TypeOrmModule.forFeature([CatalogItem]), AuthModule],
  exports: [CatalogService, TypeOrmModule],
})
export class CatalogModule {}
