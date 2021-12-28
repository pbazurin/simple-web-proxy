import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../custom-logger.service';
import { UtilsService } from '../utils.service';
import { Processor } from './processor';

@Injectable()
export class RelativeUrlProcessor implements Processor {
  constructor(
    private loggerService: CustomLoggerService,
    private utilsService: UtilsService,
  ) {
    loggerService.setContext(RelativeUrlProcessor.name);
  }

  async process(
    content: string,
    realUrl: string,
    getProxyUrl: (realUrl: string) => Promise<string>,
  ): Promise<string> {
    const urlRegexp = /\"(\/[^<> ]*)\"/g;
    const relativeUrlMatches = content.matchAll(urlRegexp);

    let result = content;

    for (const match of [...relativeUrlMatches]) {
      let url: string = match[1];
      this.loggerService.log(url);

      if (url.startsWith('//')) {
        url = this.utilsService.getProtocolFromUrl(realUrl) + url;
      } else {
        url = this.utilsService.getOriginFromUrl(realUrl) + url;
      }

      const proxyUrl = await getProxyUrl(url);

      result = result.replace(match[0], `${proxyUrl}`);
    }

    return result;
  }
}
