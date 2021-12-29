import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { ProxyResponse } from '../models/proxy-response';
import { ProxyRepository } from '../repositories/proxy.repository';
import { CustomLoggerService } from './custom-logger.service';
import { AbsoluteUrlProcessor } from './processors/absolute-url.processor';
import { IntegrityProcessor } from './processors/integrity.processor';
import { Processor } from './processors/processor';
import { RelativeUrlProcessor } from './processors/relative-url.processor';
import { StyleUrlProcessor } from './processors/style-url.processor';
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
    private integrityProcessor: IntegrityProcessor,
    private styleUrlProcessor: StyleUrlProcessor,
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
    const timeoutTimerMs = 5000;
    const response = await firstValueFrom(
      this.httpService
        .get<string>(realUrl, {
          headers: this.processRequestHeaders(requestHeaders) as any,
          responseType: 'arraybuffer',
          timeout: timeoutTimerMs,
          validateStatus: (status: number) => status < 500,
        })
        .pipe(
          catchError((originalError: Error) => {
            let error = new BadRequestException(
              `Failed to request url "${realUrl}"`,
            );
            if (originalError.message.includes('timeout')) {
              error = new RequestTimeoutException(
                `Timeout for url "${realUrl}" with timer ${timeoutTimerMs}ms`,
              );
            }

            return throwError(() => error);
          }),
        ),
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

    result['accept-encoding'] = 'gzip, deflate';

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

    let processors: Processor[] = [];

    switch (true) {
      case contentType.includes('html'):
        processors = [
          this.relativeUrlProcessor,
          this.styleUrlProcessor,
          this.absoluteUrlProcessor,
          this.integrityProcessor,
        ];
        break;
      case contentType.includes('javascript'):
        processors = [this.absoluteUrlProcessor, this.integrityProcessor];
        break;
      case contentType.includes('css'):
        processors = [
          this.styleUrlProcessor,
          this.absoluteUrlProcessor,
          this.integrityProcessor,
        ];
        break;
      default:
        return responseContent;
    }

    let content = responseContent.toString('utf-8');

    const getProxyUrl = async (realUrl: string) => {
      const proxyId = await this.generateProxyIdForUrl(realUrl);
      return getProxyUrlForId(proxyId);
    };

    this.loggerService.log(`Starting processing url "${realUrl}"`);

    for (const processor of processors) {
      content = await processor.process(content, realUrl, getProxyUrl);
    }

    this.loggerService.log(`Finished processing url "${realUrl}"`);

    return content;
  }
}
