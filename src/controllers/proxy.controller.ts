import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyResponse } from '../models/proxy-response';
import { CustomLoggerService } from '../services/custom-logger.service';
import { ProxyService } from '../services/proxy.service';

@Controller('p')
export class ProxyController {
  private readonly getProxyUrlForId = (id: string) => `/p/${id}`;

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
      const proxyResponse: ProxyResponse =
        await this.proxyService.getContentByProxyId(
          proxyId,
          request.headers,
          this.getProxyUrlForId,
        );

      response.status(proxyResponse.status);
      Object.keys(proxyResponse.headers).forEach((headerName: string) =>
        response.setHeader(headerName, proxyResponse.headers[headerName]),
      );
      response.send(proxyResponse.body);
    } catch (error) {
      this.loggerService.warn(error);
      response.redirect('/?failed');
    }
  }

  @Post()
  async createProxy(
    @Body('url') url: string,
    @Res() response: Response,
  ): Promise<void> {
    if (!url) {
      this.loggerService.warn(`Url is empty, redirected to home page`);
      response.redirect('/?empty');
      return;
    }

    const proxyId: string = await this.proxyService.generateProxyIdForUrl(url);

    response.redirect(this.getProxyUrlForId(proxyId));
  }
}
