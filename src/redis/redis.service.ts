import { Injectable } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';

@Injectable()
export class RedisService {
  private readonly client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }

  getClient() {
    return this.client;
  }
}
