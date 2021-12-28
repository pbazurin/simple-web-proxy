import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from 'src/services/custom-logger.service';
import { Processor } from './processor';

@Injectable()
export class AbsoluteUrlProcessor implements Processor {
  constructor(private loggerService: CustomLoggerService) {
    loggerService.setContext(AbsoluteUrlProcessor.name);
  }

  async process(
    content: string,
    realUrl: string,
    getProxyUrl: (realUrl: string) => Promise<string>,
  ): Promise<string> {
    this.loggerService.log(`Starting for "${realUrl}"...`);

    const urlRegexp = /https?:\/\/[^"' \n\r$>)]+/g;
    const absoluteUrlMatches = content.matchAll(urlRegexp);

    let result = content;

    for (const match of [...absoluteUrlMatches]) {
      const absoluteUrlMatch = match[0];

      this.loggerService.log(absoluteUrlMatch);
      const proxyUrl = await getProxyUrl(absoluteUrlMatch);

      result = result.replace(absoluteUrlMatch, `${proxyUrl}`);
    }

    this.loggerService.log(`Finished for "${realUrl}"`);

    return result;
  }
}
