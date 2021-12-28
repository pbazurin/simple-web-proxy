import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from 'src/services/custom-logger.service';
import { UtilsService } from '../utils.service';
import { Processor } from './processor';

@Injectable()
export class StyleUrlProcessor implements Processor {
  constructor(
    private loggerService: CustomLoggerService,
    private utilsService: UtilsService,
  ) {
    loggerService.setContext(StyleUrlProcessor.name);
  }

  async process(
    content: string,
    realUrl: string,
    getProxyUrl: (realUrl: string) => Promise<string>,
  ): Promise<string> {
    const urlRegexp = /url\(([^)(]+)\)/g;
    const styleUrlMatches = content.matchAll(urlRegexp);

    let result = content;

    for (const match of [...styleUrlMatches]) {
      let url = match[1];
      url = this.utilsService.removeTrailingQuotes(url);

      if (url.startsWith('data:')) {
        continue;
      }

      this.loggerService.log(url);

      if (url.startsWith('//')) {
        url = this.utilsService.getProtocolFromUrl(realUrl) + url;
      } else if (url.startsWith('/')) {
        url = this.utilsService.getOriginFromUrl(realUrl) + url;
      } else if (!url.startsWith('http')) {
        url = this.utilsService.getOriginFromUrl(realUrl) + '/' + url;
      }

      const proxyUrl = await getProxyUrl(url);

      result = result.replace(match[0], `url(${proxyUrl})`);
    }

    return result;
  }
}
