import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable, of, switchMap } from 'rxjs';
import { ProxyRepository } from './proxy.repository';

@Injectable()
export class ProxyService {
  constructor(
    private proxyRepository: ProxyRepository,
    private httpService: HttpService,
  ) {}

  generateProxyIdForUrl(url: string): Observable<string> {
    const proxyId = this.proxyRepository.add(url);

    return proxyId;
  }

  getContentByProxyId(
    proxyId: string,
    getProxyUrlForId: (id: string) => string,
  ): Observable<string> {
    return this.proxyRepository.getById(proxyId).pipe(
      switchMap((url) => this.httpService.get<string>(url)),
      switchMap((res) => this.getNormalizedContent(res.data, getProxyUrlForId)),
    );
  }

  private getNormalizedContent(
    initialContent: string,
    getProxyUrlForId: (id: string) => string,
  ): Observable<string> {
    const relativeSrcRegExp = /src=\"(\/.*?)\"/g;
    const relativeSrcMatches = initialContent.matchAll(relativeSrcRegExp);

    [...relativeSrcMatches].forEach((match: RegExpMatchArray) => {
      console.log(match);
    });

    return of(initialContent);
  }
}
