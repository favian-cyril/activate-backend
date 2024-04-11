import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UrlService } from './url.service';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  async shortenUrl(
    @Body() body: { originalUrl: string },
  ): Promise<{ url: string }> {
    try {
      const url = await this.urlService.shortenUrl(body.originalUrl);
      return { url };
    } catch (err) {
      if (err.message === 'not a valid url') {
        throw new HttpException('Not a valid url', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          'Error adding new url',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get()
  async getAll(
    @Query('ids') ids: string,
  ): Promise<{ key: string; value: string }[]> {
    const idArray = ids.split(',');
    if (idArray.length === 0) {
      throw new HttpException('ids param required', HttpStatus.BAD_REQUEST);
    }
    try {
      const allUrls = await this.urlService.getAllUrls(idArray);
      return allUrls;
    } catch (err) {
      throw new HttpException(
        'One or more url not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get(':id')
  async getOriginalUrl(@Param('id') id: string): Promise<{ url: string }> {
    const url = await this.urlService.getUrl(id);
    if (url) return { url };
    else throw new HttpException('Url not found', HttpStatus.NOT_FOUND);
  }
}
