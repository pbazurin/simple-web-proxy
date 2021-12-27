import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLoggerService } from 'src/services/custom-logger.service';
import { ProxyService } from '../services/proxy.service';

const getProxyUrlForId = (id) => `/p/${id}`;

@Controller('p')
export class ProxyController {
  constructor(
    private proxyService: ProxyService,
    private loggerService: CustomLoggerService,
  ) {
    this.loggerService.setContext(ProxyController.name);
  }

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
    } catch (error) {
      this.loggerService.warn(error);
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
