import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from 'src/services/custom-logger.service';
import { Processor } from './processor';

@Injectable()
export class StyleUrlProcessor implements Processor {
  constructor(private loggerService: CustomLoggerService) {
    loggerService.setContext(StyleUrlProcessor.name);
  }

  async process(
    content: string,
    realUrl: string,
    getProxyUrl: (realUrl: string) => Promise<string>,
  ): Promise<string> {
    this.loggerService.log(`Starting for "${realUrl}"...`);

    const urlRegexp = /url\(([\w\/.'"-]+)\)/gm;
    const styleUrlMatches = content.matchAll(urlRegexp);

    let result = content;

    for (const match of [...styleUrlMatches]) {
      let url = match[1];
      this.loggerService.log(`Found match "${url}"`);

      if (url.startsWith('/')) {
        url = realUrl + url;
      }

      const proxyUrl = await getProxyUrl(url);

      result = result.replace(match[0], `url(${proxyUrl})`);
    }

    this.loggerService.log(`Finished for "${realUrl}"`);

    return result;
  }
}
