import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { catchError, map, Observable, of } from 'rxjs';
import { ProxyService } from './proxy.service';

@Controller('p')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get(':id')
  getProxyContentById(
    @Param('id') proxyId: string,
    @Res() response: Response,
  ): Observable<void> {
    try {
      return this.proxyService
        .getContentByProxyId(proxyId, (id) => `/p/${id}`)
        .pipe(
          map((content) => {
            response.send(content);
          }),
          catchError(() => {
            response.send('Failed to open url');
            return of(null);
          }),
        );
    } catch {
      response.redirect('/');
    }
  }

  @Post()
  createProxy(
    @Body('url') url: string,
    @Res() response: Response,
  ): Observable<void> {
    if (!url) {
      response.redirect('/');
      return of(null);
    }

    return this.proxyService
      .generateProxyIdForUrl(url)
      .pipe(map((proxyId: string) => response.redirect(`/p/${proxyId}`)));
  }
}
