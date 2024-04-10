import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlService } from './url/url.service';
import { UrlController } from './url/url.controller';
import { RedisService } from './redis/redis.service';

@Module({
  imports: [],
  controllers: [AppController, UrlController],
  providers: [AppService, UrlService, RedisService],
})
export class AppModule {}
