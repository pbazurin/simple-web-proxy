import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { catchError, Observable, of, tap } from 'rxjs';
import { ProxyService } from './proxy.service';

@Controller('p')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get(':id')
  getProxyContentById(
    @Param('id') proxyId: string,
    @Res() response: Response,
  ): Observable<string> {
    try {
      return this.proxyService.getContentByProxyId(proxyId).pipe(
        tap((content) => {
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
  createProxy(@Body('url') url: string, @Res() response: Response): void {
    if (!url) {
      response.redirect('/');
    }

    const proxyId = this.proxyService.generateProxyId(url);

    response.redirect(`/p/${proxyId}`);
  }
}
