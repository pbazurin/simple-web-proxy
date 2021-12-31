import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from './custom-logger.service';
import { AbsoluteUrlProcessor } from './processors/absolute-url.processor';
import { IntegrityProcessor } from './processors/integrity.processor';
import { Processor } from './processors/processor';
import { RelativeUrlProcessor } from './processors/relative-url.processor';
import { StyleUrlProcessor } from './processors/style-url.processor';

@Injectable()
export class ContentProcessingManagerService {
  constructor(
    private loggerService: CustomLoggerService,
    private absoluteUrlProcessor: AbsoluteUrlProcessor,
    private relativeUrlProcessor: RelativeUrlProcessor,
    private integrityProcessor: IntegrityProcessor,
    private styleUrlProcessor: StyleUrlProcessor,
  ) {
    loggerService.setContext(ContentProcessingManagerService.name);
  }

  async processContent(
    contentBuffer: Buffer,
    contentType: string,
    realUrl: string,
    getProxyUrl: (realUrl: string) => Promise<string>,
  ): Promise<Buffer | string> {
    if (!contentType) {
      this.loggerService.log(`Skipped empty content type`);
      return contentBuffer;
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
        return contentBuffer;
    }

    let content = contentBuffer.toString('utf-8');

    this.loggerService.log(`Started processing url "${realUrl}"`);

    for (const processor of processors) {
      content = await processor.process(content, realUrl, getProxyUrl);
    }

    this.loggerService.log(`Finished processing url "${realUrl}"`);

    return content;
  }
}
