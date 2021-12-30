import { Injectable } from '@nestjs/common';
import { ProxyResponse } from '../models/proxy-response';
import { ProxyRepository } from '../repositories/proxy.repository';
import { ContentProcessingManagerService } from './content-processing-manager.service';
import { CustomLoggerService } from './custom-logger.service';
import { HttpWrapperService } from './http-wrapper.service';
import { UtilsService } from './utils.service';

@Injectable()
export class ProxyService {
  constructor(
    private proxyRepository: ProxyRepository,
    private httpWrapperService: HttpWrapperService,
    private utilsService: UtilsService,
    private loggerService: CustomLoggerService,
    private contentProcessingManagerService: ContentProcessingManagerService,
  ) {
    loggerService.setContext(ProxyService.name);
  }

  async generateProxyIdForUrl(url: string): Promise<string> {
    const normalizedUrl = this.utilsService.removeTrailingSlashes(url);
    return this.proxyRepository.add(normalizedUrl);
  }

  async getContentByProxyId(
    proxyId: string,
    requestHeaders: Record<string, string | string[]>,
    getProxyUrlForId: (id: string) => string,
  ): Promise<ProxyResponse> {
    this.loggerService.log(`Starting getting content for proxyId "${proxyId}"`);

    const realUrl: string = await this.proxyRepository.getById(proxyId);
    const response = await this.httpWrapperService.get(
      realUrl,
      this.processRequestHeaders(requestHeaders) as any,
    );
    const contentType = response.headers
      ? response.headers['content-type']
      : null;

    const getProxyUrl = async (url: string) => {
      const newProxyId = await this.generateProxyIdForUrl(url);
      return getProxyUrlForId(newProxyId);
    };

    const processedContent: Buffer | string =
      await this.contentProcessingManagerService.getProcessedContent(
        response.data as Buffer,
        contentType,
        realUrl,
        getProxyUrl,
      );

    this.loggerService.log(`Finished getting content for proxyId "${proxyId}"`);

    return {
      status: response.status,
      body: processedContent,
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

    result['accept-encoding'] = 'gzip, deflate';

    return result;
  }

  private processResponseHeaders(
    responseHeaders: Record<string, string | string[]>,
  ): Record<string, string | string[]> {
    return responseHeaders;
  }
}
