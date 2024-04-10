import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { HttpException, HttpStatus } from '@nestjs/common';

// Mock UrlService
class MockUrlService {
  shortenUrl(originalUrl: string): Promise<string> {
    return Promise.resolve('shortenedUrl');
  }

  getAllUrls(ids: string[]): Promise<{ [x: string]: string }[]> {
    return Promise.resolve([{ key: 'value' }]);
  }

  getUrl(id: string): Promise<string | null> {
    return Promise.resolve('originalUrl');
  }
}

describe('UrlController', () => {
  let controller: UrlController;
  let urlService: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [{ provide: UrlService, useClass: MockUrlService }],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    urlService = module.get<UrlService>(UrlService);
  });

  describe('shortenUrl', () => {
    it('should return shortened URL', async () => {
      const originalUrl = 'http://example.com';
      const result = await controller.shortenUrl({ originalUrl });
      expect(result).toEqual({ url: 'shortenedUrl' });
    });
  });

  describe('getAll', () => {
    it('should return all URLs for given IDs', async () => {
      const ids = '1,2,3';
      const result = await controller.getAll(ids);
      expect(result).toEqual([{ key: 'value' }]);
    });

    it('should throw HttpException if any URL is not found', async () => {
      jest
        .spyOn(urlService, 'getAllUrls')
        .mockRejectedValue(new Error('Not found'));
      await expect(controller.getAll('1,2,3')).rejects.toThrowError(
        HttpException,
      );
      await expect(controller.getAll('1,2,3')).rejects.toThrowError(
        'One or more url not found',
      );
    });
  });

  describe('getOriginalUrl', () => {
    it('should return original URL for the given ID', async () => {
      const id = '123';
      const result = await controller.getOriginalUrl(id);
      expect(result).toEqual({ url: 'originalUrl' });
    });

    it('should throw HttpException if URL is not found', async () => {
      jest.spyOn(urlService, 'getUrl').mockResolvedValue(null);
      await expect(controller.getOriginalUrl('123')).rejects.toThrowError(
        HttpException,
      );
      await expect(controller.getOriginalUrl('123')).rejects.toThrowError(
        'Url not found',
      );
    });
  });
});
