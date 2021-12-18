import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ProxyRepository } from './proxy.repository';

@Injectable()
export class ProxyService {
  constructor(
    private proxyRepository: ProxyRepository,
    private httpService: HttpService,
  ) {}

  async generateProxyIdForUrl(url: string): Promise<string> {
    const proxyId = this.proxyRepository.add(url);

    return proxyId;
  }

  async getContentByProxyId(
    proxyId: string,
    getProxyUrlForId: (id: string) => string,
  ): Promise<string> {
    const realUrl: string = await this.proxyRepository.getById(proxyId);
    const response = await firstValueFrom(
      this.httpService.get<string>(realUrl),
    );
    const result = this.getNormalizedContent(
      response.data,
      realUrl,
      getProxyUrlForId,
    );

    return result;
  }

  private async getNormalizedContent(
    responseContent: string,
    realUrl: string,
    getProxyUrlForId: (id: string) => string,
  ): Promise<string> {
    const result = responseContent;
    const normalizedRealUrl = realUrl.replace(/\/$/, '');
    const relativeSrcRegExp = /src=\"(\/.*?)\"/g;
    const relativeSrcMatches = result.matchAll(relativeSrcRegExp);

    [...relativeSrcMatches].forEach((match: RegExpMatchArray) => {
      const fullUrl = normalizedRealUrl + match[1];
      console.log(fullUrl);
    });

    return result;
  }
}
