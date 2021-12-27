import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ProxyResponse } from '../models/proxy-response';
import { ProxyRepository } from '../repositories/proxy.repository';
import { UtilsService } from './utils.service';

@Injectable()
export class ProxyService {
  constructor(
    private proxyRepository: ProxyRepository,
    private httpService: HttpService,
    private utilsService: UtilsService,
  ) {}

  async generateProxyIdForUrl(url: string): Promise<string> {
    const normalizedUrl = this.utilsService.removeTrailingSlashes(url);
    const proxyId = this.proxyRepository.add(normalizedUrl);

    return proxyId;
  }

  async getContentByProxyId(
    proxyId: string,
    requestHeaders: Record<string, string | string[]>,
    getProxyUrlForId: (id: string) => string,
  ): Promise<ProxyResponse> {
    const realUrl: string = await this.proxyRepository.getById(proxyId);
    const response = await firstValueFrom(
      this.httpService.get<string>(realUrl, {
        headers: this.processRequestHeaders(requestHeaders) as any,
        responseType: 'arraybuffer',
        validateStatus: (status: number) => status < 500,
      }),
    );
    const result = await this.getNormalizedContent(
      response.data as unknown as Buffer,
      response.headers,
      realUrl,
      getProxyUrlForId,
    );

    return {
      status: response.status,
      body: result,
      headers: this.processResponseHeaders(response.headers),
    };
  }

  private processRequestHeaders(
    requestHeaders: Record<string, string | string[]>,
  ): Record<string, string | string[]> {
    const excludedHeaderNames = ['host', 'referer', 'user-agent'];
    const result: Record<string, string | string[]> = {};

    Object.keys(requestHeaders).forEach((headerName: string) => {
      if (!excludedHeaderNames.includes(headerName)) {
        result[headerName] = requestHeaders[headerName];
      }
    });

    return result;
  }

  private processResponseHeaders(
    responseHeaders: Record<string, string | string[]>,
  ): Record<string, string | string[]> {
    return responseHeaders;
  }

  private async getNormalizedContent(
    responseContent: Buffer,
    responseHeaders: Record<string, string | string[]>,
    realUrl: string,
    getProxyUrlForId: (id: string) => string,
  ): Promise<Buffer | string> {
    const contentType = responseHeaders
      ? responseHeaders['content-type']
      : null;

    if (!contentType || !contentType.includes('text')) {
      return responseContent;
    }

    let result = responseContent.toString('utf-8');

    // relative urls
    const relativeUrlMatches = result.matchAll(/\"(\/.*?)\"/g);

    for (const match of [...relativeUrlMatches]) {
      const fullUrl = realUrl + match[1];
      const newId = await this.generateProxyIdForUrl(fullUrl);

      result = result.replace(match[0], `"${getProxyUrlForId(newId)}"`);
    }

    // absolute urls
    const absoluteUrlMatches = result.matchAll(/\"(http.*?)\"/g);

    for (const match of [...absoluteUrlMatches]) {
      const newId = await this.generateProxyIdForUrl(match[1]);

      result = result.replace(match[0], `"${getProxyUrlForId(newId)}"`);
    }

    return result;
  }
}
