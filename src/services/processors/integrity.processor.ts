import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from 'src/services/custom-logger.service';
import { Processor } from './processor';

@Injectable()
export class IntegrityProcessor implements Processor {
  constructor(private loggerService: CustomLoggerService) {
    loggerService.setContext(IntegrityProcessor.name);
  }

  async process(
    content: string,
    realUrl: string,
    getProxyUrl: (realUrl: string) => Promise<string>,
  ): Promise<string> {
    const integrityRegexp = /integrity=\"(.*?)\"/g;
    const integrityMatches = content.matchAll(integrityRegexp);

    let result = content;

    for (const match of [...integrityMatches]) {
      this.loggerService.log(match[1]);

      result = result.replace(match[0], '');
    }

    const integrityHashRegexp = /sha384-[\w\/+]{64}/g;
    const integrityHashMatches = content.matchAll(integrityHashRegexp);

    for (const match of [...integrityHashMatches]) {
      const hash = match[0];
      this.loggerService.log(hash);

      result = result.replace(hash, '');
    }

    return result;
  }
}
