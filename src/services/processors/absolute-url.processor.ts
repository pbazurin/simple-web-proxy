import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../custom-logger.service';
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
    const urlRegexp = /https?:\/\/[^"' \n\r$><)]+/g;
    const absoluteUrlMatches = content.matchAll(urlRegexp);
    const excludedUrls = [
      'http://www.w3.org/2000/svg',
      'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd',
    ];

    let result = content;

    for (const match of [...absoluteUrlMatches]) {
      const absoluteUrlMatch = match[0];

      if (excludedUrls.includes(absoluteUrlMatch)) {
        continue;
      }

      this.loggerService.log(absoluteUrlMatch);
      const proxyUrl = await getProxyUrl(absoluteUrlMatch);

      result = result.replace(absoluteUrlMatch, `${proxyUrl}`);
    }

    return result;
  }
}
