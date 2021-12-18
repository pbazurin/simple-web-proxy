import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller('p')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get(':id')
  async getProxyContentById(
    @Param('id') proxyId: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const content = await this.proxyService.getContentByProxyId(
        proxyId,
        (id) => `/p/${id}`,
      );

      response.send(content);
    } catch {
      response.redirect('/');
    }
  }

  @Post()
  async createProxy(
    @Body('url') url: string,
    @Res() response: Response,
  ): Promise<void> {
    if (!url) {
      response.redirect('/');
      return;
    }

    const proxyId: string = await this.proxyService.generateProxyIdForUrl(url);

    response.redirect(`/p/${proxyId}`);
  }
}
