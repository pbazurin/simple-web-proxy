import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from 'src/services/custom-logger.service';
import { Processor } from './processor';

@Injectable()
export class RelativeUrlProcessor implements Processor {
  constructor(private loggerService: CustomLoggerService) {
    loggerService.setContext(RelativeUrlProcessor.name);
  }

  async process(
    content: string,
    realUrl: string,
    getProxyUrl: (realUrl: string) => Promise<string>,
  ): Promise<string> {
    this.loggerService.log(`Starting for "${realUrl}"...`);

    const urlRegexp = /\"(\/.*?)\"/g;
    const relativeUrlMatches = content.matchAll(urlRegexp);

    let result = content;

    for (const match of [...relativeUrlMatches]) {
      const relativeUrl: string = match[1];
      this.loggerService.log(`Found match "${relativeUrl}"`);

      const absoluteUrl = realUrl + relativeUrl;
      const proxyUrl = await getProxyUrl(absoluteUrl);

      result = result.replace(match[0], `${proxyUrl}`);
    }

    this.loggerService.log(`Finished for "${realUrl}"`);

    return result;
  }
}
