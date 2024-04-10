import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { RedisService } from '../redis/redis.service';

describe('UrlService', () => {
  let service: UrlService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlService, RedisService],
    }).compile();

    service = module.get<UrlService>(UrlService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUrls', () => {
    it('should return an array of key-value pairs for given IDs', async () => {
      const ids = ['key1', 'key2'];
      const values = ['value1', 'value2'];
      const client = redisService.getClient();
      const getSpy = jest
        .spyOn(client, 'get')
        .mockImplementation((key: string) => {
          const index = ids.indexOf(key);
          return Promise.resolve(index !== -1 ? values[index] : null);
        });

      const result = await service.getAllUrls(ids);

      expect(result).toEqual([{ key1: 'value1' }, { key2: 'value2' }]);
      expect(getSpy).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if a value is not found for any ID', async () => {
      const ids = ['key1', 'key2'];
      const client = redisService.getClient();
      jest.spyOn(client, 'get').mockResolvedValue(null);

      await expect(service.getAllUrls(ids)).rejects.toThrowError('Not found');
    });
  });

  describe('shortenUrl', () => {
    it('should generate a unique short ID with length 8 and store the original URL in Redis', async () => {
      const client = redisService.getClient();
      jest.spyOn(client, 'exists').mockResolvedValue(Promise.resolve(0));
      jest.spyOn(client, 'set').mockResolvedValue(Promise.resolve('shortId'));

      const shortId = await service.shortenUrl('originalUrl');

      expect(shortId).toHaveLength(8);
      expect(redisService.getClient().exists).toHaveBeenCalledTimes(1);
      expect(redisService.getClient().set).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUrl', () => {
    it('should return the original URL corresponding to the given short ID', async () => {
      const client = redisService.getClient();
      jest
        .spyOn(client, 'get')
        .mockResolvedValue(Promise.resolve('originalUrl'));

      const originalUrl = await service.getUrl('shortId');

      expect(originalUrl).toBe('originalUrl');
      expect(redisService.getClient().get).toHaveBeenCalledWith('shortId');
    });

    it('should return null if the given short ID is not found in Redis', async () => {
      const client = redisService.getClient();
      jest.spyOn(client, 'get').mockResolvedValue(Promise.resolve(null));

      const originalUrl = await service.getUrl('nonExistingShortId');

      expect(originalUrl).toBeNull();
      expect(redisService.getClient().get).toHaveBeenCalledWith(
        'nonExistingShortId',
      );
    });
  });
});
