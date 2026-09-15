import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { SiteContent } from './entities/site-content.entity';
import { SiteContentController } from './site-content.controller';
import { SiteContentService } from './site-content.service';

@Module({
  controllers: [SiteContentController],
  providers: [SiteContentService],
  imports: [TypeOrmModule.forFeature([SiteContent]), AuthModule],
  exports: [SiteContentService, TypeOrmModule],
})
export class SiteContentModule {}
