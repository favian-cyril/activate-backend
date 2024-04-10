import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { createClient, RedisClientType } from 'redis';

// Mock createClient function
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

describe('RedisService', () => {
  let service: RedisService;
  let redisClient: RedisClientType;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
    redisClient = service.getClient(); // Get the mocked Redis client
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to the Redis server', async () => {
      await service.onModuleInit();
      expect(redisClient.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from the Redis server', async () => {
      await service.onModuleDestroy();
      expect(redisClient.disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
