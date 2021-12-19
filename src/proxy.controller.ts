import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

const getProxyUrlForId = (id) => `/p/${id}`;

@Controller('p')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get(':id')
  async getProxyContentById(
    @Param('id') proxyId: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const proxyResponse = await this.proxyService.getContentByProxyId(
        proxyId,
        request.headers,
        getProxyUrlForId,
      );

      response.status(proxyResponse.status);
      Object.keys(proxyResponse.headers).forEach((headerName: string) =>
        response.setHeader(headerName, proxyResponse.headers[headerName]),
      );
      response.send(proxyResponse.body);
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

    response.redirect(getProxyUrlForId(proxyId));
  }
}
