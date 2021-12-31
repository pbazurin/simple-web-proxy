import { Injectable } from '@nestjs/common';
import { ProxyResponse } from '../models/proxy-response';
import { ProxyRepository } from '../repositories/proxy.repository';
import { ContentProcessingManagerService } from './content-processing-manager.service';
import { CustomLoggerService } from './custom-logger.service';
import { HeadersProcessingManager } from './headers-processing-manager.service';
import { HttpWrapperService } from './http-wrapper.service';
import { UtilsService } from './utils.service';

@Injectable()
export class ProxyService {
  constructor(
    private proxyRepository: ProxyRepository,
    private httpWrapperService: HttpWrapperService,
    private utilsService: UtilsService,
    private loggerService: CustomLoggerService,
    private headersProcessingManager: HeadersProcessingManager,
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
      this.headersProcessingManager.processRequestHeaders(
        requestHeaders,
      ) as any,
    );
    const contentType = response.headers
      ? response.headers['content-type']
      : null;

    const getProxyUrl = async (url: string) => {
      const newProxyId = await this.generateProxyIdForUrl(url);
      return getProxyUrlForId(newProxyId);
    };

    const processedContent: Buffer | string =
      await this.contentProcessingManagerService.processContent(
        response.data as Buffer,
        contentType,
        realUrl,
        getProxyUrl,
      );

    this.loggerService.log(`Finished getting content for proxyId "${proxyId}"`);

    return {
      status: response.status,
      body: processedContent,
      headers: this.headersProcessingManager.processResponseHeaders(
        response.headers,
      ),
    };
  }
}
