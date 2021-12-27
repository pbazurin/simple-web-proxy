import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AbsoluteUrlProcessor } from 'src/processors/absolute-url.processor';
import { Processor } from 'src/processors/processor';
import { RelativeUrlProcessor } from 'src/processors/relative-url.processor';
import { ProxyResponse } from '../models/proxy-response';
import { ProxyRepository } from '../repositories/proxy.repository';
import { CustomLoggerService } from './custom-logger.service';
import { UtilsService } from './utils.service';

@Injectable()
export class ProxyService {
  constructor(
    private proxyRepository: ProxyRepository,
    private httpService: HttpService,
    private utilsService: UtilsService,
    private loggerService: CustomLoggerService,
    private absoluteUrlProcessor: AbsoluteUrlProcessor,
    private relativeUrlProcessor: RelativeUrlProcessor,
  ) {
    loggerService.setContext(ProxyService.name);
  }

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
    this.loggerService.log(`Requesting url "${realUrl}"...`);
    const response = await firstValueFrom(
      this.httpService.get<string>(realUrl, {
        headers: this.processRequestHeaders(requestHeaders) as any,
        responseType: 'arraybuffer',
        validateStatus: (status: number) => status < 500,
      }),
    );
    this.loggerService.log(`Received response for url "${realUrl}"`);
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

    if (!contentType) {
      this.loggerService.log(`Skipping empty content type`);
      return responseContent;
    }

    this.loggerService.log(`Content type is "${contentType}"`);
    let processors: Processor[] = [];

    switch (true) {
      case contentType.includes('html'):
        processors = [this.relativeUrlProcessor, this.absoluteUrlProcessor];
        break;
      case contentType.includes('javascript'):
      case contentType.includes('css'):
        processors = [this.absoluteUrlProcessor];
        break;
      default:
        this.loggerService.log('No processors for this content type');
        return responseContent;
    }

    let content = responseContent.toString('utf-8');

    const getProxyUrl = async (realUrl: string) => {
      const proxyId = await this.generateProxyIdForUrl(realUrl);
      return getProxyUrlForId(proxyId);
    };

    for (const processor of processors) {
      content = await processor.process(content, realUrl, getProxyUrl);
    }

    return content;
  }
}
