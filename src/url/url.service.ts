import { Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UrlService {
  private readonly client: RedisClientType;

  constructor(private redis: RedisService) {
    this.client = this.redis.getClient();
  }

  async getAllUrls(ids: string[]): Promise<{ key: string; value: string }[]> {
    const queries = ids.map(async (key) => {
      const value = await this.getUrl(key);
      if (value) {
        return { key, value };
      }
      throw Error('Not found');
    });
    return await Promise.all(queries);
  }

  async shortenUrl(originalUrl: string): Promise<string> {
    let shortId: string;
    const urlRegex = /^(http|https):\/\/[^ "]+$/;
    if (!urlRegex.test(originalUrl)) {
      throw Error('not a valid url');
    }
    // Generate a unique hash until it is not already in use
    do {
      shortId = Math.random().toString(36).slice(2, 10);
    } while (await this.client.exists(shortId));

    await this.client.set(shortId, originalUrl);
    return shortId;
  }

  async getUrl(shortId: string): Promise<string | null> {
    const originalUrl = await this.client.get(shortId);
    return originalUrl || null;
  }
}
